import * as T from './assets/three.module.js';
import {PALETTE} from './palette.js';
import {createStudioGradientTexture} from './studio-gradient.js';

// Physical paper sweep: floor tangent -> curved cove -> upright background.
// Analytic normals keep the floor/cove joint smooth without a painted horizon.
// The surface carries a baked studio-gradient map so it always reads as one
// continuous soft photographic sweep, independent of how the light rig falls
// on it (which previously produced visible hard-edged card seams / banding).
export function createStudioBackdrop(){
 const p=[],n=[],uv=[],idx=[],radius=1.4,segments=48;
 for(let i=0;i<=segments+1;i++){
  const t=Math.min(i,segments)/segments*Math.PI/2;
  const y=i>segments?12:-.016+radius*(1-Math.cos(t));
  const z=-3.8-radius*Math.sin(t);
  const v=i>segments?1.28:i/segments*.85;
  for(const x of [-24,24]){p.push(x,y,z);n.push(0,Math.cos(t),Math.sin(t));uv.push(x<0?0:1,v);}
  if(i<=segments){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
 }
 const g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute(p,3));
 g.setAttribute('normal',new T.Float32BufferAttribute(n,3));
 g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 g.setIndex(idx);
 const gradientMap=createStudioGradientTexture();
 gradientMap.wrapS=gradientMap.wrapT=T.ClampToEdgeWrapping;
 const m=new T.MeshStandardMaterial({color:PALETTE.desk,map:gradientMap,roughness:1,metalness:0,envMapIntensity:.28});
 const sweep=new T.Mesh(g,m);sweep.name='Neutral studio cyclorama';sweep.castShadow=false;sweep.receiveShadow=false;
 return sweep;
}
