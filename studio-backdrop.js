import * as T from './assets/three.module.js';
import {PALETTE} from './palette.js';

// One physical mesh runs from the foreground floor through the curved cove and up
// the rear wall. Sharing geometry, normals, material and UVs removes the horizon
// that appeared where the old plane and backdrop overlapped.
export function createStudioBackdrop({
 normalMap=null,
 environment=null,
 hour=new Date().getHours()
}={}){
 const positions=[],normals=[],uvs=[],indices=[];
 const width=48,frontZ=26.2,tangentZ=-3.8,radius=3.15,topY=24,segments=112;
 const rows=[];

 // Long foreground floor and an explicit tangent row.
 rows.push({y:0,z:frontZ,ny:1,nz:0,d:0});
 rows.push({y:0,z:tangentZ,ny:1,nz:0,d:frontZ-tangentZ});

 // Quarter-circle cove. The first generated row starts after zero so the tangent
 // vertex exists only once and cannot z-fight with another surface.
 for(let i=1;i<=segments;i++){
  const t=i/segments*Math.PI/2;
  rows.push({
   y:radius*(1-Math.cos(t)),
   z:tangentZ-radius*Math.sin(t),
   ny:Math.cos(t),
   nz:Math.sin(t),
   d:frontZ-tangentZ+radius*t
  });
 }
 const curveDistance=frontZ-tangentZ+radius*Math.PI/2;
 rows.push({y:topY,z:tangentZ-radius,ny:0,nz:1,d:curveDistance+topY-radius});
 const total=rows.at(-1).d;

 for(const row of rows){
  for(const x of [-width,width]){
   positions.push(x,row.y,row.z);
   normals.push(0,row.ny,row.nz);
   uvs.push(x<0?0:1,row.d/total);
  }
 }
 for(let i=0;i<rows.length-1;i++){
  const a=i*2;
  indices.push(a,a+1,a+2,a+1,a+3,a+2);
 }

 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));
 geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
 geometry.setIndex(indices);
 geometry.computeBoundingSphere();

 const material=new T.MeshPhysicalMaterial({
  color:PALETTE.desk,
  envMap:environment,
  envMapIntensity:.82,
  metalness:.065,
  roughness:.56,
  normalMap,
  normalScale:new T.Vector2(.0032,.0032),
  clearcoat:.045,
  clearcoatRoughness:.68,
  anisotropy:.055,
  anisotropyRotation:0
 });

 const lightState={
  color:new T.Color(),
  strength:0,
  hour:12,
  shader:null
 };
 function setTime(nextHour){
  const h=((Number(nextHour)||0)%24+24)%24;
  const night=h<6||h>=19;
  const dawn=h>=6&&h<9;
  const dusk=h>=16&&h<19;
  lightState.hour=h;
  lightState.color.set(night?0xb9ccff:(dawn||dusk?0xffdfb1:0xfff1d4));
  lightState.strength=night?.16:(dawn||dusk?.22:.19);
  if(lightState.shader){
   lightState.shader.uniforms.uWindowColor.value.copy(lightState.color);
   lightState.shader.uniforms.uWindowStrength.value=lightState.strength;
  }
 }
 setTime(hour);

 material.onBeforeCompile=shader=>{
  lightState.shader=shader;
  shader.uniforms.uWindowColor={value:lightState.color.clone()};
  shader.uniforms.uWindowStrength={value:lightState.strength};
  shader.vertexShader='varying vec3 vStudioWorld;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace(
   '#include <worldpos_vertex>',
   '#include <worldpos_vertex>\nvStudioWorld=(modelMatrix*vec4(transformed,1.0)).xyz;'
  );
  shader.fragmentShader='uniform vec3 uWindowColor; uniform float uWindowStrength; varying vec3 vStudioWorld;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
   // Soft, angled window illumination painted as emitted light, not geometry.
   // A superellipse gives a photographic window wash while broad Gaussian spill
   // keeps every boundary invisible. It is restricted to the rising cove/wall.
   vec2 q=vec2((vStudioWorld.x+3.9)/5.7,(vStudioWorld.y-5.0)/4.4);
   q=mat2(.978,-.208,.208,.978)*q;
   float rectX=1.0-smoothstep(.62,1.08,abs(q.x));
   float rectY=1.0-smoothstep(.66,1.12,abs(q.y));
   float softWindow=rectX*rectY;
   float spill=exp(-dot(q,q)*.72);
   float wallMask=smoothstep(.10,1.05,vStudioWorld.y);
   float support=(softWindow*.72+spill*.28)*wallMask*uWindowStrength;
   outgoingLight+=uWindowColor*support;
   #include <opaque_fragment>`);
 };
 material.customProgramCacheKey=()=> 'single-surface-cyclorama-window-v1';

 const sweep=new T.Mesh(geometry,material);
 sweep.name='Single-surface studio cyclorama';
 sweep.position.y=-.016;
 sweep.castShadow=false;
 sweep.receiveShadow=true;
 sweep.userData.setStudioTime=setTime;
 return sweep;
}
