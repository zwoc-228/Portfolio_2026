import assert from 'node:assert/strict';
import * as T from '../dist/assets/three.module.js';
import {createBounce,createClayOrb} from '../dist/clay-orb.js';
import {createContactShadows} from '../dist/contact-shadows.js';
import {createModels} from '../dist/models.js';
import {HOME_TRANSFORMS} from '../dist/scene-layout.js';
const results=[];
for(const fps of [30,60,120]){
 const b=createBounce();let last=Infinity;let contacts=0;let previous=0;let s;
 for(let i=0;i<fps*3;i++){s=b.step(1/fps);assert(s.height>=0);if(s.height===0&&previous>0)contacts++;previous=s.height;}
 assert(s.settled&&!s.active);assert.equal(s.height,0);assert(contacts>=2&&contacts<=3);
 results.push({test:'bounce',fps,contacts,settled:s.settled});
}
assert.deepEqual(createBounce(true).step(1/60),{height:0,impact:0,settled:true,active:false});
assert.equal(createBounce().step(1/60,false).height,.82);
for(const [w,h] of [[1672,941],[1440,900],[390,844]]){
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(w/h<1?55:27,w/h,.1,200);
 camera.position.set(0,9,13);camera.lookAt(0,.35,0);if(w/h<1){camera.position.multiplyScalar(1.55);camera.lookAt(0,.2,0);}camera.updateMatrixWorld();
 const orb=createClayOrb(scene,camera,{reducedMotion:true});
 const state=orb.update({dt:1/60,width:w,height:h,ready:true});
 const p=orb.sphere.position.clone().project(camera);assert(Math.abs((1-p.y)*h/2-42)<.02);
 assert(Math.abs(orb.sphere.position.y-orb.sphere.scale.y)<1e-8);
 assert.equal(orb.sphere.material.metalness,0);assert(orb.sphere.material.roughness>.2&&orb.sphere.material.roughness<.5);assert(orb.sphere.material.clearcoat>.5);assert(orb.sphere.material.specularIntensity>.5);
 orb.update({dt:1/60,width:w,height:h,progress:1,ready:true});assert(!orb.sphere.visible&&!orb.shadow.visible);
 orb.dispose();assert.equal(scene.children.length,0);
 results.push({test:'orb screen position, contact and opening',width:w,height:h,passed:true});
}
const scene=new T.Scene();const roots=createModels().map((m,i)=>{let r=new T.Group();let f=HOME_TRANSFORMS[i];m.scale.set(f[2],f[3],f[5]);r.add(m);scene.add(r);return r;});
const layouts=roots.map((r,i)=>({name:String(i),width:3,depth:3,x:.1,z:.2}));
const contacts=createContactShadows(scene,roots,layouts,roots.map(()=>new T.Texture()));
for(const scale of [1,1.2,1.65])for(const lift of [0,.04,.085]){
 roots.forEach(r=>{r.scale.setScalar(scale);r.position.set(2.3,lift,1);r.rotation.y=.24;});contacts.update();
 contacts.meshes.forEach(m=>{assert(Math.abs(m.getWorldPosition(new T.Vector3()).y+.013)<1e-8);});
}
contacts.dispose();results.push({test:'AO footprint stays on desk across lift and scale',passed:true});
console.log(JSON.stringify(results,null,2));
