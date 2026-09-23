import * as T from './assets/three.module.js';

// Deterministic, substepped bounce shared by the scene and regression tests.
export function createBounce(reduced=false) {
 let height=reduced?0:.82, velocity=0, impact=0, contacts=0, settled=reduced;
 return {step(dt,ready=true,open=false){
  if(open){height=velocity=impact=0;settled=true;}
  if(ready&&!settled){
   const steps=Math.max(1,Math.ceil(dt/(1/240))),h=Math.min(.05,dt)/steps;
   for(let i=0;i<steps;i++){
    impact*=Math.exp(-20*h);velocity-=9.8*h;height+=velocity*h;
    if(height<=0){height=0;impact=Math.min(.13,Math.abs(velocity)*.034);velocity=-velocity*.36;contacts++;
     if(contacts>=3||velocity<.12){velocity=0;settled=true;break;}
    }
   }
  }else if(ready)impact*=Math.exp(-20*dt);
  return {height,impact,settled,active:!settled||impact>.0002};
 }};
}

export function createClayOrb(scene,camera,{reducedMotion=false}={}) {
 const sphereMaterial=new T.MeshPhysicalMaterial({
  // Glazed porcelain: a warm ceramic body with a tight clear-coat lobe.
  // Keep this materially distinct from glass: no transmission, only surface glaze.
  color:0xf0efe8,
  roughness:.32,
  metalness:0,
  clearcoat:.78,
  clearcoatRoughness:.16,
  ior:1.51,
  specularIntensity:.72,
  specularColor:new T.Color(0xffffff),
  envMapIntensity:1.16,
  transparent:true,
  opacity:1
 });
 const sphere=new T.Mesh(new T.SphereGeometry(1,64,48),sphereMaterial);
 sphere.name='Glazed porcelain navigation sphere';sphere.castShadow=true;sphere.receiveShadow=true;scene.add(sphere);
 const shadow=new T.Mesh(new T.PlaneGeometry(1,1),new T.ShaderMaterial({
  transparent:true,depthWrite:false,toneMapped:false,
  uniforms:{opacity:{value:.4}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform float opacity;varying vec2 vUv;void main(){vec2 p=(vUv-.5)*2.;float a=exp(-dot(p,p)*4.8)*(1.-smoothstep(.75,1.,length(p)));gl_FragColor=vec4(.10,.12,.13,a*opacity);}`
 }));
 shadow.name='Orb contact';shadow.rotation.x=-Math.PI/2;shadow.position.y=-.012;shadow.renderOrder=2;scene.add(shadow);
 const bounce=createBounce(reducedMotion),ray=new T.Raycaster(),ndc=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0)),point=new T.Vector3(),projected=new T.Vector3(),view=new T.Vector3();
 const previous=new T.Vector3(Infinity,Infinity,Infinity);let lastOpacity=-1;
 return {sphere,shadow,update({dt=0,width,height,x=width/2,y=42,progress=0,ready=false}){
  if(camera.position.y<.1){sphere.visible=shadow.visible=false;return {active:false,moved:false,top:20};}
  camera.updateMatrixWorld(true);ndc.set(x/width*2-1,1-y/height*2);ray.setFromCamera(ndc,camera);
  let radius=.22;
  for(let i=0;i<6;i++){
   plane.constant=-radius;if(!ray.ray.intersectPlane(plane,point))return {active:false,moved:false,top:20};
   view.copy(point).applyMatrix4(camera.matrixWorldInverse);
   radius=22*2*Math.max(.01,-view.z)*Math.tan(T.MathUtils.degToRad(camera.fov/2))/height;
  }
  const b=bounce.step(dt,ready,progress>.10);
  const opacity=1-T.MathUtils.smoothstep(progress,.015,.14);
  sphere.visible=shadow.visible=opacity>.001;sphere.material.opacity=opacity;
  sphere.scale.set(radius*(1+b.impact*.55),radius*(1-b.impact),radius*(1+b.impact*.55));
  sphere.position.set(point.x,radius*(1-b.impact)+b.height*radius,point.z);
  shadow.position.x=point.x;shadow.position.z=point.z;
  shadow.scale.setScalar(radius*(2.7+b.height*1.9));shadow.material.uniforms.opacity.value=opacity*.48/(1+b.height*2.3);
  projected.copy(sphere.position).project(camera);
  const moved=previous.distanceToSquared(sphere.position)>1e-12||Math.abs(lastOpacity-opacity)>1e-6||b.active;
  previous.copy(sphere.position);lastOpacity=opacity;
  return {active:ready&&b.active,moved,top:(1-projected.y)*height*.5-22};
 },dispose(){sphere.removeFromParent();shadow.removeFromParent();for(const o of [sphere,shadow]){o.geometry.dispose();o.material.dispose();}}};
}
