import * as T from './assets/three.module.js';
import {createSurfaceContact} from './surface-contact.js';

// Screen UI is DOM, so it has no geometry for the desk's planar mirror pass.
// These reflection-only billboards give each visible card a real 3D pose. The floor
// then reflects that geometry through the same mirror camera/blur path as the models,
// instead of painting an analytical glow on the desk.
export function createUIReflectionProxies({ scene, camera, floorReflection }) {
  const group = new T.Group();
  group.name = 'UI reflection-only geometry';
  scene.add(group);

  const vertexShader = `
    varying vec2 vUv;
    void main(){
      vUv=uv;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
    }
  `;
  const fragmentShader = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2 uSizePx;
    uniform vec3 uBase;
    uniform float uOpacity;
    float sdRoundBox(vec2 p, vec2 b, float r){
      vec2 q=abs(p)-b+r;
      return length(max(q,vec2(0.0)))+min(max(q.x,q.y),0.0)-r;
    }
    void main(){
      vec2 p=(vUv-.5)*uSizePx;
      vec2 halfSize=max(uSizePx*.5-vec2(1.0),vec2(1.0));
      float radius=min(16.0,min(uSizePx.x,uSizePx.y)*.12);
      float d=sdRoundBox(p,halfSize,radius);
      float alpha=(1.0-smoothstep(-1.25,1.25,d))*uOpacity;
      if(alpha<.002) discard;
      float top=1.0-vUv.y;
      float left=1.0-vUv.x;
      float edge=1.0-smoothstep(-9.0,-1.0,d);
      vec3 c=uBase;
      c+=vec3(1.0)*(.032*top+.018*left+.028*edge);
      c*=mix(.965,1.015,smoothstep(.05,.95,top));
      gl_FragColor=vec4(c,alpha);
    }
  `;

  const makeProxy = (name) => {
    const uniforms = {
      uSizePx:{value:new T.Vector2(280,400)},
      uBase:{value:new T.Color(0xf1f1f1)},
      uOpacity:{value:.34}
    };
    const material = new T.ShaderMaterial({
      uniforms,vertexShader,fragmentShader,
      transparent:true,depthTest:true,depthWrite:true,
      side:T.DoubleSide,toneMapped:false
    });
    const mesh = new T.Mesh(new T.PlaneGeometry(1,1),material);
    mesh.name=name;
    mesh.visible=false;
    mesh.frustumCulled=false;
    group.add(mesh);
    return {mesh,uniforms,contact:createSurfaceContact(scene)};
  };

  const proxies = [
    makeProxy('Category UI reflection'),
    makeProxy('Project UI reflection 1'),
    makeProxy('Project UI reflection 2'),
    makeProxy('Project UI reflection 3'),
    makeProxy('Project UI reflection 4'),
    makeProxy('Detail UI reflection'),
    makeProxy('Dialog UI reflection')
  ];

  const ray = new T.Raycaster();
  const ndc = new T.Vector2();
  const bottom = new T.Vector3();
  const view = new T.Vector3();
  const cameraUp = new T.Vector3();
  const q = new T.Quaternion();
  const forward = new T.Vector3();

  function place(proxy, rect, { bottomHeight=.12, opacity=.34, tint=0xf1f1f1 } = {}) {
    if (!rect || rect.width < 4 || rect.height < 4 || rect.bottom < 0 || rect.top > innerHeight) return false;
    camera.updateMatrixWorld(true);
    const x = rect.left + rect.width * .5;
    const y = Math.min(innerHeight - 2, rect.bottom);
    ndc.set(x / innerWidth * 2 - 1, 1 - y / innerHeight * 2);
    ray.setFromCamera(ndc,camera);
    if (Math.abs(ray.ray.direction.y) < 1e-4) return false;
    const t = (bottomHeight - ray.ray.origin.y) / ray.ray.direction.y;
    if (!Number.isFinite(t) || t <= .01) return false;
    bottom.copy(ray.ray.origin).addScaledVector(ray.ray.direction,t);
    view.copy(bottom).applyMatrix4(camera.matrixWorldInverse);
    const depth = -view.z;
    if (!Number.isFinite(depth) || depth <= .1 || depth > 80) return false;

    const worldPerPx = 2 * depth * Math.tan(T.MathUtils.degToRad(camera.fov * .5)) / innerHeight;
    const w = rect.width * worldPerPx;
    const h = rect.height * worldPerPx;
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= .01 || h <= .01) return false;

    q.copy(camera.quaternion);
    cameraUp.set(0,1,0).applyQuaternion(q).normalize();
    forward.set(0,0,-1).applyQuaternion(q).normalize();
    proxy.mesh.position.copy(bottom).addScaledVector(cameraUp,h*.5).addScaledVector(forward,.012);
    proxy.mesh.quaternion.copy(q);
    proxy.mesh.scale.set(w,h,1);
    proxy.uniforms.uSizePx.value.set(rect.width,rect.height);
    proxy.uniforms.uBase.value.setHex(tint);
    proxy.uniforms.uOpacity.value=opacity*(rect.opacity??1);
    proxy.mesh.updateMatrixWorld(true);
    proxy.contact.place(bottom,w,Math.min(1.2,h*.18+.18),.12*(rect.opacity??1));
    return true;
  }

  function sync({ category=null, cards=[], detail=null, info=null, hover=0 } = {}) {
    const active=[];
    proxies.forEach(p=>p.contact.hide());
    const specs=[];
    if(category) specs.push({rect:category,bottomHeight:.13,opacity:.34+hover*.025,tint:0xf1f1f1});
    cards.slice(0,4).forEach((rect)=>specs.push({rect,bottomHeight:.11,opacity:.25,tint:0xf1f1f1}));
    if(detail) specs.push({rect:detail,bottomHeight:.11,opacity:.28,tint:0xf1f1f1});

    if(info) specs.push({rect:info,bottomHeight:.11,opacity:.28,tint:0xf1f1f1});
    let cursor=0;
    for(const spec of specs){
      if(cursor>=proxies.length)break;
      const proxy=proxies[cursor++];
      if(place(proxy,spec.rect,spec)){active.push(proxy.mesh);}
    }
    for(let i=cursor;i<proxies.length;i++)proxies[i].mesh.visible=false;
    // Main camera never sees these; floor-reflection temporarily toggles only this active list.
    floorReflection?.setReflectionOnlyObjects?.(active);
    floorReflection?.clearPanelReflections?.();
    return active.length;
  }

  function dispose(){
    floorReflection?.setReflectionOnlyObjects?.([]);
    group.removeFromParent();
    for(const {mesh,contact} of proxies){contact.dispose();mesh.geometry.dispose();mesh.material.dispose();}
  }

  return { sync, dispose, contacts:proxies.map(p=>p.contact.mesh), meshes:proxies.map(p=>p.mesh) };
}
