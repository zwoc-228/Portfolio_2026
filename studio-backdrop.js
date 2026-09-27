import * as T from './assets/three.module.js';
import {PALETTE} from './palette.js';

// Physical seamless-paper sweep: the first row is exactly tangent to the desk,
// then the surface curves upward into the background. Passing the desk material
// makes both sides of the join use the same BRDF, removing the visible horizon.
export function createStudioBackdrop(sharedMaterial=null){
 const p=[],n=[],uv=[],idx=[],radius=1.8,segments=72;
 for(let i=0;i<=segments+1;i++){
  const t=Math.min(i,segments)/segments*Math.PI/2;
  const y=i>segments?14:-.016+radius*(1-Math.cos(t));
  const z=-3.8-radius*Math.sin(t);
  // Match the ground plane's world-space UVs at the tangent point so even the
  // extremely subtle desk normal map cannot reveal the material boundary.
  const v=(26-z)/30;
  for(const x of [-24,24]){
   p.push(x,y,z);n.push(0,Math.cos(t),Math.sin(t));uv.push((x+24)/48,v);
  }
  if(i<=segments){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
 }
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(p,3));
 geometry.setAttribute('normal',new T.Float32BufferAttribute(n,3));
 geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 geometry.setIndex(idx);
 const material=sharedMaterial||new T.MeshPhysicalMaterial({
  color:PALETTE.desk,metalness:.48,roughness:.34,envMapIntensity:1.16,
  clearcoat:.008,clearcoatRoughness:.64
 });
 const sweep=new T.Mesh(geometry,material);
 sweep.name='Seamless studio cyclorama';
 sweep.castShadow=false;sweep.receiveShadow=true;
 return sweep;
}
