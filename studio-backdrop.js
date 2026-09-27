import * as T from './assets/three.module.js';
import {PALETTE} from './palette.js';
import {createStudioGradientTexture} from './studio-gradient.js';

// Deep, broad cyclorama: the floor remains tangent through the product area and
// only begins curving well behind it, so the camera never reads a horizon seam.
export function createStudioBackdrop(){
 const p=[],n=[],uv=[],idx=[];
 const radius=4.8,segments=72,startZ=-7.4;
 for(let i=0;i<=segments+1;i++){
  const t=Math.min(i,segments)/segments*Math.PI/2;
  const y=i>segments?18:-.018+radius*(1-Math.cos(t));
  const z=startZ-radius*Math.sin(t);
  const v=i>segments?1.22:i/segments*.86;
  for(const x of [-30,30]){
   p.push(x,y,z);
   n.push(0,Math.cos(t),Math.sin(t));
   uv.push(x<0?0:1,v);
  }
  if(i<=segments){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
 }
 const g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute(p,3));
 g.setAttribute('normal',new T.Float32BufferAttribute(n,3));
 g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 g.setIndex(idx);
 const map=createStudioGradientTexture();
 map.wrapS=map.wrapT=T.ClampToEdgeWrapping;
 const m=new T.MeshStandardMaterial({
  color:PALETTE.desk,map,roughness:.96,metalness:0,envMapIntensity:.16
 });
 const sweep=new T.Mesh(g,m);
 sweep.name='Seamless studio cyclorama';
 sweep.castShadow=false;sweep.receiveShadow=false;
 return sweep;
}
