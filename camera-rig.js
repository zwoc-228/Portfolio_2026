import * as T from './assets/three.module.js';

export function fitStudioCamera(camera,width,height,homeBoxes=[]){
 const aspect=width/Math.max(1,height),mobile=width<=760;
 const referenceAspect=1672/941,referenceFov=T.MathUtils.degToRad(27);
 camera.aspect=aspect;
 camera.fov=mobile?38:T.MathUtils.clamp(T.MathUtils.radToDeg(2*Math.atan(Math.tan(referenceFov/2)*referenceAspect/aspect)),22.6,27);
 const target=new T.Vector3(0,mobile?0:.45,mobile?7.2:0);
 camera.position.set(0,mobile?14:6.6,mobile?17:14.2);
 camera.lookAt(target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 const direction=camera.position.clone().sub(target).normalize();
 const v=new T.Vector3();
 // Fit both axes. Reserve the top for navigation and bottom for object labels.
 for(let step=0;step<300;step++){
  let fits=true;
  for(const b of homeBoxes)for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){
   v.set(x,y,z).project(camera);
   if(Math.abs(v.x)>.86||v.y>(mobile?.70:.79)||v.y<(mobile?-.60:-.77))fits=false;
  }
  if(fits)break;
  camera.position.addScaledVector(direction,.2);camera.updateMatrixWorld(true);
 }
}
