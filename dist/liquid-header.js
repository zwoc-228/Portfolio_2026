import * as T from './assets/three.module.js';
import {createSurfaceContact} from './surface-contact.js';
import {RoundedBoxGeometry} from './assets/RoundedBoxGeometry.js';
import {PALETTE} from './palette.js';
import {FRAME_ACTIVE,FRAME_RENDER,FRAME_REFLECTION} from './frame-runtime.js';

export function headerMetrics(width,progress){
 const gutter=Math.max(16,Math.min(32,width*.025));
 return {width:T.MathUtils.lerp(144,Math.min(960,width-gutter*2),progress),height:T.MathUtils.lerp(48,width<=760?104:56,progress),top:gutter,center:width/2};
}
export function createLiquidHeader({scene,camera,floorReflection,runtime}){
 const el=document.querySelector('.site-header'),trigger=el.querySelector('.header-trigger'),links=el.querySelector('.header-links');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

 // The visible header is now real scene glass, not a frosted DOM fill.  A closed
 // rounded volume lets MeshPhysicalMaterial use Three's transmission pass, so the
 // studio behind the control is actually refracted through the material.
 const glassMaterial=new T.MeshPhysicalMaterial({
  color:0xf8fcff,metalness:0,roughness:.035,transmission:.985,thickness:.34,ior:1.49,
  attenuationColor:new T.Color(0xcfe8f2),attenuationDistance:2.4,
  specularIntensity:1.18,specularColor:new T.Color(0xeaf8ff),
  clearcoat:1,clearcoatRoughness:.025,envMapIntensity:1.42
 });
 const glass=new T.Mesh(new RoundedBoxGeometry(3,1,.46,5,.22),glassMaterial);
 glass.name='Physical navigation glass';glass.frustumCulled=false;glass.castShadow=false;glass.receiveShadow=false;scene.add(glass);

 // Preserve round46's desk-reflection behavior exactly: the visible transmission
 // mesh is hidden from the mirror pass and this lightweight proxy remains the only
 // reflection source.  That keeps the rest of the scene/reflection tuning untouched.
 const reflectionMaterial=new T.MeshPhysicalMaterial({color:0xffffff,roughness:.17,metalness:0,clearcoat:1,specularIntensity:1,transparent:true,opacity:.34});
 const proxy=new T.Mesh(new RoundedBoxGeometry(1,1,.035,3,.10),reflectionMaterial);proxy.name='Navigation card reflection';proxy.visible=false;proxy.frustumCulled=false;scene.add(proxy);
 floorReflection.setPersistentReflectionOnlyObjects([proxy]);
 const contact=createSurfaceContact(scene);
 const glassGeometries=new Map();
 let glassViewport='';
 function disposeGlassGeometries(){for(const g of glassGeometries.values())if(g!==glass.geometry)g.dispose();glassGeometries.clear();}
 function fitGlassGeometry(m){
  const viewport=innerWidth+'x'+innerHeight;if(viewport!==glassViewport){disposeGlassGeometries();glassViewport=viewport;}
  // Quantise only the cached base dimensions; the mesh receives a tiny exact X
  // correction below.  This keeps a nearly constant 11-13 px corner radius during
  // the 144 px -> full navigation expansion without rebuilding geometry every frame.
  const baseW=Math.max(120,Math.round(m.width/24)*24),baseH=Math.max(44,Math.round(m.height/4)*4);
  const key=baseW+'x'+baseH;let g=glassGeometries.get(key);
  if(!g){
   const aspect=baseW/baseH;
   const radius=Math.min(.235,12/baseH);
   const depth=Math.max(radius*2+.018,Math.min(.48,22/baseH));
   g=new RoundedBoxGeometry(aspect,1,depth,5,radius);glassGeometries.set(key,g);
  }
  if(glass.geometry!==g){
   const old=glass.geometry;glass.geometry=g;
   if(![...glassGeometries.values()].includes(old))old.dispose();
  }
  return (m.width/m.height)/(baseW/baseH);
 }
 const ray=new T.Raycaster(),point=new T.Vector3(),view=new T.Vector3(),up=new T.Vector3();
 let current=0,target=0,hovered=false,focusWithin=false,pinned=false,timer=0,dirty=true;
 function place(m){
  if(camera.position.y<.1)return;
  camera.updateMatrixWorld(true);ray.setFromCamera(new T.Vector2(0,1-(m.top+m.height)/innerHeight*2),camera);
  const t=(.12-ray.ray.origin.y)/ray.ray.direction.y;if(!Number.isFinite(t)||t<=0)return;
  point.copy(ray.ray.origin).addScaledVector(ray.ray.direction,t);view.copy(point).applyMatrix4(camera.matrixWorldInverse);
  const perPixel=-view.z*2*Math.tan(T.MathUtils.degToRad(camera.fov/2))/innerHeight;
  contact.place(point,m.width*perPixel,Math.max(.20,m.height*perPixel*.85),.10);
  up.set(0,1,0).applyQuaternion(camera.quaternion);
  const center=point.clone().addScaledVector(up,m.height*perPixel/2);
  proxy.position.copy(center);proxy.quaternion.copy(camera.quaternion);proxy.scale.set(m.width*perPixel,m.height*perPixel,1);proxy.updateMatrixWorld(true);
  const glassXCorrection=fitGlassGeometry(m),glassWorldHeight=m.height*perPixel;
  glass.position.copy(center);glass.quaternion.copy(camera.quaternion);glass.scale.set(glassWorldHeight*glassXCorrection,glassWorldHeight,glassWorldHeight);glass.updateMatrixWorld(true);
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
 return {transientObjects:[contact.mesh,glass],syncLayout,dispose(){contact.dispose();clearTimeout(timer);remove();el.removeEventListener('pointerenter',enter);el.removeEventListener('pointerleave',leave);el.removeEventListener('focusin',focus);el.removeEventListener('focusout',blur);el.removeEventListener('keydown',key);trigger.removeEventListener('click',click);document.removeEventListener('pointerdown',outside);floorReflection.setPersistentReflectionOnlyObjects([]);proxy.removeFromParent();proxy.geometry.dispose();reflectionMaterial.dispose();glass.removeFromParent();glass.geometry.dispose();disposeGlassGeometries();glassMaterial.dispose();}};
}
