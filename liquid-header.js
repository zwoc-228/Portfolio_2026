import * as T from './assets/three.module.js';
import {createSurfaceContact} from './surface-contact.js';
import {FRAME_ACTIVE,FRAME_RENDER,FRAME_REFLECTION} from './frame-runtime.js';

export function headerMetrics(width,progress){
 const gutter=Math.max(16,Math.min(32,width*.025));
 const frame=Math.min(1280,width-gutter*2),w=T.MathUtils.lerp(144,frame,progress);
 return {width:w,height:T.MathUtils.lerp(48,width<=760?104:56,progress),top:gutter,center:width/2};
}
export function createLiquidHeader({scene,camera,floorReflection,runtime}){
 const el=document.querySelector('.site-header'),trigger=el.querySelector('.header-trigger'),links=el.querySelector('.header-links');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 floorReflection.setPersistentReflectionOnlyObjects([]);
 floorReflection.setObjectFootprint(3,0,0,.55,.38,0);
 const contact=createSurfaceContact(scene);
 const ray=new T.Raycaster(),point=new T.Vector3(),view=new T.Vector3();
 let current=0,target=0,hovered=false,focusWithin=false,pinned=false,timer=0,dirty=true;
 function place(m){
  if(camera.position.y<.1)return;
  camera.updateMatrixWorld(true);ray.setFromCamera(new T.Vector2(m.center/innerWidth*2-1,1-(m.top+m.height)/innerHeight*2),camera);
  const t=(.12-ray.ray.origin.y)/ray.ray.direction.y;if(!Number.isFinite(t)||t<=0)return;
  point.copy(ray.ray.origin).addScaledVector(ray.ray.direction,t);view.copy(point).applyMatrix4(camera.matrixWorldInverse);
  const perPixel=-view.z*2*Math.tan(T.MathUtils.degToRad(camera.fov/2))/innerHeight;
  contact.place(point,m.width*perPixel,Math.max(.20,m.height*perPixel*.85),.10);

 }
 function apply(){
  const p=current*current*(3-2*current),m=headerMetrics(innerWidth,p);
  el.style.width=m.width+'px';el.style.height=m.height+'px';el.style.top=m.top+'px';el.style.left=m.center+'px';
  el.style.setProperty('--reveal',Math.max(0,(p-.50)/.50).toFixed(4));el.dataset.mode=p>.5?'expanded':'collapsed';
  links.inert=target===0||p<.85;trigger.setAttribute('aria-expanded',String(target===1));place(m);
 }
 function setTarget(value){target=value;dirty=true;runtime.request(FRAME_RENDER|FRAME_ACTIVE);}
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
  if(current===target)runtime.request(FRAME_REFLECTION);
  return FRAME_RENDER|(current!==target?FRAME_ACTIVE:0);
 });
 function syncLayout(){dirty=true;apply();runtime.request(FRAME_RENDER);}
 syncLayout();
 return {transientObjects:[contact.mesh],syncLayout,dispose(){contact.dispose();clearTimeout(timer);remove();el.removeEventListener('pointerenter',enter);el.removeEventListener('pointerleave',leave);el.removeEventListener('focusin',focus);el.removeEventListener('focusout',blur);el.removeEventListener('keydown',key);trigger.removeEventListener('click',click);document.removeEventListener('pointerdown',outside);floorReflection.setPersistentReflectionOnlyObjects([]);floorReflection.setObjectFootprint(3,0,0,.55,.38,0);}};
}
