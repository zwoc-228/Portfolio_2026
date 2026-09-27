import * as T from './assets/three.module.js';

export function fitStudioCamera(camera,width,height,homeBoxes=[]){
 const aspect=width/Math.max(1,height),portrait=aspect<1;
 const referenceAspect=1672/941,referenceFov=T.MathUtils.degToRad(27);
 camera.aspect=aspect;
 camera.fov=portrait?55:T.MathUtils.clamp(T.MathUtils.radToDeg(2*Math.atan(Math.tan(referenceFov/2)*referenceAspect/aspect)),22.6,27);
 const target=new T.Vector3(0,portrait?.2:.45,0);
 camera.position.set(0,6.6,14.2);if(portrait)camera.position.multiplyScalar(1.55);
 camera.lookAt(target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 // Fit the existing three objects, including their rotated extents, on narrow screens.
 // Dolly along the viewing axis; preserve the lower studio angle and model geometry.
 const tangent=Math.tan(T.MathUtils.degToRad(camera.fov/2)),margin=.90;
 let extra=0;const v=new T.Vector3();
 for(const b of homeBoxes)for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){
  v.set(x,y,z).applyMatrix4(camera.matrixWorldInverse);
  extra=Math.max(extra,Math.abs(v.x)/(tangent*aspect*margin)+v.z);
 }
 if(extra>0){camera.position.addScaledVector(camera.position.clone().sub(target).normalize(),extra);camera.updateMatrixWorld(true);}
}
