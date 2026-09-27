import * as T from './assets/three.module.js';
import {PALETTE} from './palette.js';

// A wide, continuous infinity cove. The surface itself has no painted rectangle,
// horizon stripe, or texture seam: its tonal falloff comes from a very soft,
// shader-based support wash plus the real scene lights.
export function createStudioBackdrop(){
 const p=[],n=[],uv=[],idx=[];
 const radius=2.7,segments=96,width=100,floorZ=-3.8,topY=18;
 for(let i=0;i<=segments+1;i++){
  const t=Math.min(i,segments)/segments*Math.PI/2;
  const y=i>segments?topY:-.016+radius*(1-Math.cos(t));
  const z=floorZ-radius*Math.sin(t);
  const v=i>segments?1.35:i/segments*.86;
  for(const x of [-width,width]){
   p.push(x,y,z);n.push(0,Math.cos(t),Math.sin(t));uv.push(x<0?0:1,v);
  }
  if(i<=segments){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
 }
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(p,3));
 geometry.setAttribute('normal',new T.Float32BufferAttribute(n,3));
 geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 geometry.setIndex(idx);

 const material=new T.MeshPhysicalMaterial({
  color:PALETTE.desk,roughness:.58,metalness:.08,
  envMapIntensity:.78,clearcoat:.035,clearcoatRoughness:.70
 });
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 vBackdropWorld;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace(
   '#include <worldpos_vertex>',
   '#include <worldpos_vertex>\nvBackdropWorld=(modelMatrix*vec4(transformed,1.0)).xyz;'
  );
  shader.fragmentShader='varying vec3 vBackdropWorld;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
   // Broad angled support light: no hard card edge and no visible horizon.
   vec2 q=vec2((vBackdropWorld.x+2.8)*.105,(vBackdropWorld.y-3.5)*.22);
   q=mat2(.927,-.375,.375,.927)*q;
   float support=exp(-dot(q,q))*0.105*smoothstep(.18,1.35,vBackdropWorld.y);
   outgoingLight+=vec3(1.0,.985,.94)*support;
   #include <opaque_fragment>`);
 };
 material.customProgramCacheKey=()=> 'seamless-studio-cove-v2';
 const sweep=new T.Mesh(geometry,material);
 sweep.name='Seamless neutral studio cyclorama';
 sweep.castShadow=false;sweep.receiveShadow=true;
 return sweep;
}
