import * as T from './assets/three.module.js';
import {PALETTE} from './palette.js';

// One continuous paper cyclorama. Its transition is created by geometry,
// surface normals and large area lights—not by painted horizontal gradients.
export function createStudioBackdrop(){
 const p=[],n=[],idx=[],radius=2.35,segments=96;
 for(let i=0;i<=segments+1;i++){
  const t=Math.min(i,segments)/segments*Math.PI/2;
  const y=i>segments?14:-.016+radius*(1-Math.cos(t));
  const z=-3.8-radius*Math.sin(t);
  for(const x of [-28,28]){
   p.push(x,y,z);
   n.push(0,Math.cos(t),Math.sin(t));
  }
  if(i<=segments){
   const a=i*2;
   idx.push(a,a+1,a+2,a+1,a+3,a+2);
  }
 }
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(p,3));
 geometry.setAttribute('normal',new T.Float32BufferAttribute(n,3));
 geometry.setIndex(idx);
 const material=new T.MeshStandardMaterial({
  color:PALETTE.desk,
  roughness:.96,
  metalness:0,
  envMapIntensity:.12
 });
 const sweep=new T.Mesh(geometry,material);
 sweep.name='Neutral studio cyclorama';
 sweep.castShadow=false;
 sweep.receiveShadow=false;
 return sweep;
}
