import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../assets/three.module.js';
import {createModels} from '../models.js';
import {createStudioBackdrop} from '../studio-backdrop.js';
import {HOME_TRANSFORMS} from '../scene-layout.js';
import {fitStudioCamera} from '../camera-rig.js';
import {headerMetrics} from '../liquid-header.js';
const models=createModels();
for(const [i,name] of ['writing','architecture','research'].entries()){
 const uv=JSON.parse(fs.readFileSync(new URL(`../assets/${name}-bake-uv.json`,import.meta.url)));
 models[i].traverse(o=>{if(!o.isMesh)return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry;assert.equal(uv[o.name]?.length,g.attributes.position.count*2,o.name);});
}
assert.equal(models[0].getObjectByName('Inset hinge on cover'),undefined);
const sweep=createStudioBackdrop(),p=sweep.geometry.attributes.position,n=sweep.geometry.attributes.normal;
assert(Math.abs(p.getY(0)+.018)<1e-6);assert(Math.abs(p.getZ(0)+7.4)<1e-6);
assert.equal(n.getY(0),1);assert.equal(n.getZ(n.count-1),1);
for(const width of [360,390,768,1024,1440,1920,2560]){
 const gutter=Math.max(16,Math.min(32,width*.025));const side=Math.max(gutter,(width-1280)/2);
 for(const phase of [0,.25,.5,.75,1]){const m=headerMetrics(width,phase);assert(Math.abs(m.center-width/2)<1e-6);assert(m.center-m.width/2>=side-.001);assert(m.center+m.width/2<=width-side+.001);}
}
for(const [w,h] of [[390,844],[768,1024],[1024,768],[1440,900],[1920,1080]]){
 const a=w/h;const fov=a<1?55:T.MathUtils.clamp(T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(27)/2)*(1672/941/a))),22.6,27);
 const boxes=models.map((m,i)=>{const f=HOME_TRANSFORMS[i],root=new T.Group();m.scale.set(f[2],f[3],f[5]);root.add(m);root.position.set(f[0],0,f[1]);root.rotation.y=f[4];return new T.Box3().setFromObject(root);});
 const c=new T.PerspectiveCamera(fov,a,.1,200);fitStudioCamera(c,w,h,boxes);
 const bounds=models.map((m,i)=>{const f=HOME_TRANSFORMS[i],root=new T.Group();m.scale.set(f[2],f[3],f[5]);root.add(m);root.position.set(f[0],0,f[1]);root.rotation.y=f[4];const box=new T.Box3().setFromObject(root);const projected=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])projected.push(new T.Vector3(x,y,z).project(c));return [Math.min(...projected.map(v=>v.x)),Math.max(...projected.map(v=>v.x)),Math.min(...projected.map(v=>v.y)),Math.max(...projected.map(v=>v.y))].map(v=>+v.toFixed(3));});
 for(const b of bounds){assert(b[0]>=-.901&&b[1]<=.901,'Home object clipped');assert(b[2]>-.8&&b[3]<.8);}
 const transition=new T.Vector3(0,-.018,-7.4).project(c);
 console.log(`${w}x${h}: objects fit; cove starts at ${Math.round((1-transition.y)*h/2)}px`);
}
console.log('PASS: UV compatibility, hinge removal, sweep continuity, centered header alignment.');
