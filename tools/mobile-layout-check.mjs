import assert from 'node:assert/strict';
import * as T from '../assets/three.module.js';
import {createModels} from '../models.js';
import {HOME_TRANSFORMS,homePose} from '../scene-layout.js';
import {fitStudioCamera} from '../camera-rig.js';
for(const [w,h] of [[320,568],[375,667],[390,844],[430,932],[760,1024],[844,390],[1440,900]]){
 const boxes=createModels().map((m,i)=>{const f=HOME_TRANSFORMS[i],pose=homePose(i,w),root=new T.Group();m.scale.set(f[2],f[3],f[5]);root.add(m);root.position.set(pose.x,0,pose.z);root.rotation.y=pose.r;root.scale.setScalar(pose.s);return new T.Box3().setFromObject(root);});
 if(w<=760)for(const b of boxes)assert(b.min.z>-3.8,'Model intersects cyclorama bend');
 const c=new T.PerspectiveCamera();fitStudioCamera(c,w,h,boxes);
 const screen=boxes.map(b=>{const points=[];for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const v=new T.Vector3(x,y,z).project(c);points.push({x:(v.x+1)*w/2,y:(1-v.y)*h/2});}return {left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))};});
 for(const b of screen){assert(b.left>0&&b.right<w);assert(b.top>h*.1&&b.bottom<h*.9);}
 if(w<=760){for(let i=0;i<2;i++){const gap=screen[i+1].top-screen[i].bottom;assert(gap>=58,`Labels overlap at ${w}x${h}: ${gap}`);}for(const b of screen)assert(Math.abs((b.left+b.right)/2-w/2)<3);}
 console.log(w,h,JSON.stringify(screen.map(b=>({top:Math.round(b.top),bottom:Math.round(b.bottom)}))));
}
console.log('PASS: mobile models vertically ordered and separated for labels.');
