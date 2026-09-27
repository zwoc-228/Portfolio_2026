import * as T from './assets/three.module.js';
import {PALETTE} from './palette.js';

// Physical paper sweep: floor tangent -> curved cove -> upright background.
// Analytic normals keep the floor/cove joint smooth without a painted horizon.
export function createStudioBackdrop(){
 const p=[],n=[],idx=[],radius=1.4,segments=48;
 for(let i=0;i<=segments+1;i++){
  const t=Math.min(i,segments)/segments*Math.PI/2;
  const y=i>segments?12:-.016+radius*(1-Math.cos(t));
  const z=-3.8-radius*Math.sin(t);
  for(const x of [-24,24]){p.push(x,y,z);n.push(0,Math.cos(t),Math.sin(t));}
  if(i<=segments){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setIndex(idx);
 const m=new T.MeshStandardMaterial({color:PALETTE.desk,roughness:1,metalness:0,envMapIntensity:.55});
 const sweep=new T.Mesh(g,m);sweep.name='Neutral studio cyclorama';sweep.castShadow=false;sweep.receiveShadow=false;
 return sweep;
}
