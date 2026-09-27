import * as T from './assets/three.module.js';
import {PALETTE} from './palette.js';

// One material and one draw call cover the foreground floor, curved cove and rear wall.
// The floor and sweep meet with identical positions and normals, so no horizon seam can appear.
export function createStudioBackdrop({normalMap=null,environment=null}={}){
 const p=[],n=[],uv=[],idx=[];
 const width=100,frontZ=22,floorZ=-3.8,radius=2.7,segments=96,topY=18;
 const row=(y,z,ny,nz,v)=>{
  const base=p.length/3;
  for(const x of [-width,width]){
   p.push(x,y,z);n.push(0,ny,nz);uv.push((x+width)/(width*2),v);
  }
  return base;
 };
 const rows=[];
 for(let i=0;i<=segments;i++){
  const t=i/segments*Math.PI/2;
  rows.push(row(-.016+radius*(1-Math.cos(t)),floorZ-radius*Math.sin(t),Math.cos(t),Math.sin(t),.26+i/segments*.30));
 }
 rows.push(row(topY,floorZ-radius,0,1,1));
 for(let i=0;i<rows.length-1;i++){
  const a=rows[i];idx.push(a,a+1,a+2,a+1,a+3,a+2);
 }
 // Foreground floor belongs to the same mesh/material. Duplicate tangent vertices are
 // intentional: they preserve clean UV scale while retaining an identical tangent normal.
 const tangent=row(-.016,floorZ,1,0,.26);
 const front=row(-.016,frontZ,1,0,0);
 idx.push(tangent,tangent+1,front,tangent+1,front+1,front);

 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(p,3));
 geometry.setAttribute('normal',new T.Float32BufferAttribute(n,3));
 geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 geometry.setIndex(idx);
 const material=new T.MeshPhysicalMaterial({
  color:PALETTE.desk,
  envMap:environment,
  envMapIntensity:.72,
  metalness:.055,
  roughness:.61,
  normalMap,
  normalScale:new T.Vector2(.003,.003),
  clearcoat:.025,
  clearcoatRoughness:.76,
  anisotropy:.045,
  anisotropyRotation:0
 });
 const sweep=new T.Mesh(geometry,material);
 sweep.name='Single seamless studio cyclorama';
 sweep.userData.floorY=-.016;
 sweep.castShadow=false;
 sweep.receiveShadow=true;
 return sweep;
}
