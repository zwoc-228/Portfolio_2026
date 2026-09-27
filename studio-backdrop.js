import * as T from './assets/three.module.js';
import {PALETTE} from './palette.js';

// One physical infinity-cove mesh: foreground floor, curved sweep and rear wall.
// Using one geometry/material removes the former plane-to-backdrop horizon line.
export function createStudioBackdrop({environment=null}={}){
 const halfWidth=24,radius=1.65,coveZ=-3.65,segments=64;
 const rows=[
  {y:-.016,z:22,ny:1,nz:0,v:0},
  {y:-.016,z:coveZ,ny:1,nz:0,v:.56}
 ];
 for(let i=1;i<=segments;i++){
  const t=i/segments*Math.PI/2;
  rows.push({
   y:-.016+radius*(1-Math.cos(t)),
   z:coveZ-radius*Math.sin(t),
   ny:Math.cos(t),nz:Math.sin(t),v:.56+i/segments*.16
  });
 }
 rows.push({y:18,z:coveZ-radius,ny:0,nz:1,v:1});

 const positions=[],normals=[],uv=[],indices=[];
 for(const row of rows){
  for(const x of [-halfWidth,halfWidth]){
   positions.push(x,row.y,row.z);normals.push(0,row.ny,row.nz);uv.push(x<0?0:1,row.v);
  }
 }
 for(let i=0;i<rows.length-1;i++){
  const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);
 }
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));
 geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 geometry.setIndex(indices);

 const material=new T.MeshPhysicalMaterial({
  color:PALETTE.desk,roughness:.43,metalness:.16,
  clearcoat:.08,clearcoatRoughness:.48,
  envMap:environment,envMapIntensity:.72,dithering:true
 });
 const sweep=new T.Mesh(geometry,material);
 sweep.name='Seamless studio cyclorama';
 sweep.userData.reflectionY=-.016;
 sweep.castShadow=false;sweep.receiveShadow=true;
 return sweep;
}
