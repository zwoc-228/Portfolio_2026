import * as T from './assets/three.module.js';
import {createSurfaceContact} from './surface-contact.js';

import {PALETTE} from './palette.js';
import {FRAME_ACTIVE,FRAME_RENDER,FRAME_REFLECTION} from './frame-runtime.js';

export function createGlassGeometry(w,h,depth){
 const r=Math.min(h*.23,w*.23),shape=new T.Shape();
 shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
 const bevel=Math.min(depth*.28,h*.055),g=new T.ExtrudeGeometry(shape,{depth:depth-bevel*2,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:5,curveSegments:10,steps:1});g.translate(0,0,-(depth-bevel*2)/2);g.computeVertexNormals();return g;
}
export function headerMetrics(width,progress){
 const gutter=Math.max(16,Math.min(32,width*.025));
 return {width:T.MathUtils.lerp(88,Math.min(960,width-gutter*2),progress),height:T.MathUtils.lerp(64,width<=760?104:64,progress),top:gutter,center:width/2};
}
export function createLiquidHeader({scene,camera,floorReflection,runtime}){
 const el=document.querySelector('.site-header'),trigger=el.querySelector('.header-trigger'),links=el.querySelector('.header-links');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const material=new T.MeshPhysicalMaterial({color:0xffffff,roughness:.13,metalness:0,transmission:1,thickness:.12,ior:1.46,attenuationColor:0xffffff,attenuationDistance:4,envMapIntensity:1.4,clearcoat:.25,clearcoatRoughness:.08,opacity:1});
 const proxy=new T.Mesh(createGlassGeometry(1,.5,.10),material);proxy.name='Solid refractive navigation glass';proxy.visible=true;proxy.frustumCulled=false;scene.add(proxy);
 
 const contact=createSurfaceContact(scene);
 const reflectedGlass=new T.MeshPhysicalMaterial({color:0xe8e8e8,roughness:.17,metalness:.12,transparent:true,opacity:.32,envMapIntensity:1.3});proxy.userData.reflectionMaterial=reflectedGlass;
 const ray=new T.Raycaster(),point=new T.Vector3(),view=new T.Vector3(),up=new T.Vector3();
 let current=0,target=0,hovered=false,focusWithin=false,pinned=false,timer=0,dirty=true;
 function place(m){
  if(camera.position.y<.1)return;
  camera.updateMatrixWorld(true);ray.setFromCamera(new T.Vector2(0,1-(m.top+m.height)/innerHeight*2),camera);
  const t=(.12-ray.ray.origin.y)/ray.ray.direction.y;if(!Number.isFinite(t)||t<=0)return;
  point.copy(ray.ray.origin).addScaledVector(ray.ray.direction,t);view.copy(point).applyMatrix4(camera.matrixWorldInverse);
  const perPixel=-view.z*2*Math.tan(T.MathUtils.degToRad(camera.fov/2))/innerHeight;
  contact.place(point,m.width*perPixel,Math.max(.20,m.height*perPixel*.65),.055);
  up.set(0,1,0).applyQuaternion(camera.quaternion);
  proxy.position.copy(point).addScaledVector(up,m.height*perPixel/2);proxy.quaternion.copy(camera.quaternion);const w=m.width*perPixel,h=m.height*perPixel,depth=Math.min(.16,h*.18);
  proxy.geometry.dispose();proxy.geometry=createGlassGeometry(w,h,depth);proxy.scale.set(1,1,1);material.thickness=depth;proxy.updateMatrixWorld(true);
  floorReflection.setObjectFootprint(3,proxy.position.x,proxy.position.z,m.width*perPixel*.55,m.height*perPixel*.8,.78);
 }
 function apply(){
  const p=current*current*(3-2*current),m=headerMetrics(innerWidth,p);
  el.style.width=m.width+'px';el.style.height=m.height+'px';el.style.top=m.top+'px';
  el.style.setProperty('--reveal',Math.max(0,(p-.50)/.50).toFixed(4));el.dataset.mode=p>.5?'expanded':'collapsed';
  links.inert=target===0||p<.85;trigger.setAttribute('aria-expanded',String(target===1));place(m);
 }
 function setTarget(value){target=value;dirty=true;runtime.request(FRAME_RENDER|FRAME_REFLECTION|FRAME_ACTIVE);}
 function maybeClose(){clearTimeout(timer);timer=setTimeout(()=>{if(!hovered&&!focusWithin&&!pinned)setTarget(0);},180);}
 const enter=e=>{if(e.pointerType==='touch')return;hovered=true;clearTimeout(timer);setTarget(1);};
 const leave=()=>{hovered=false;maybeClose();};
 const focus=()=>{focusWithin=true;clearTimeout(timer);setTarget(1);};
 const blur=e=>{focusWithin=el.contains(e.relatedTarget);maybeClose();};
 const click=()=>{pinned=!pinned;setTarget(pinned?1:0);};
 const outside=e=>{if(!el.contains(e.target)){pinned=false;hovered=false;focusWithin=false;setTarget(0);}};
 const key=e=>{if(e.key==='Escape'&&target){e.preventDefault();e.stopPropagation();pinned=false;hovered=false;focusWithin=false;trigger.focus();setTarget(0);}};
 el.addEventListener('pointerenter',enter);el.addEventListener('pointerleave',leave);el.addEventListener('focusin',focus);el.addEventListener('focusout',blur);trigger.addEventListener('click',click);el.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);
 const remove=runtime.add(dt=>{
  const before=current;current=reduced?target:T.MathUtils.lerp(current,target,1-Math.exp(-13*dt));
  if(Math.abs(current-target)<.0004)current=target;
  if(current===before&&!dirty)return 0;dirty=false;apply();
  return FRAME_RENDER|FRAME_REFLECTION|(current!==target?FRAME_ACTIVE:0);
 });
 function syncLayout(){dirty=true;apply();runtime.request(FRAME_RENDER|FRAME_REFLECTION);}
 syncLayout();
 return {mesh:proxy,transientObjects:[contact.mesh],syncLayout,dispose(){contact.dispose();clearTimeout(timer);remove();el.removeEventListener('pointerenter',enter);el.removeEventListener('pointerleave',leave);el.removeEventListener('focusin',focus);el.removeEventListener('focusout',blur);el.removeEventListener('keydown',key);trigger.removeEventListener('click',click);document.removeEventListener('pointerdown',outside);floorReflection.setPersistentReflectionOnlyObjects([]);proxy.removeFromParent();proxy.geometry.dispose();material.dispose();reflectedGlass.dispose();}};
}
