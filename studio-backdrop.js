import * as T from './assets/three.module.js';
import {PALETTE} from './palette.js';

// A single physical surface runs from the foreground through a long cyclorama sweep.
// The large radius prevents the floor-to-wall normal change from reading as a horizon.
export function createStudioBackdrop({
 normalMap=null,
 environment=null,
 hour=new Date().getHours()
}={}){
 const positions=[],normals=[],uvs=[],indices=[];
 const width=48,frontZ=26.2,tangentZ=-3.8,radius=7.5,topY=28,segments=160;
 const rows=[];

 rows.push({y:0,z:frontZ,ny:1,nz:0,d:0});
 rows.push({y:0,z:tangentZ,ny:1,nz:0,d:frontZ-tangentZ});
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
  envMapIntensity:.72,
  metalness:.035,
  roughness:.62,
  normalMap,
  normalScale:new T.Vector2(.0022,.0022),
  clearcoat:.025,
  clearcoatRoughness:.76
 });

 const lightState={
  color:new T.Color(),
  strength:0,
  center:new T.Vector2(),
  floorCenter:new T.Vector2(),
  angle:0,
  daylight:1,
  hour:12,
  shader:null
 };

 function setTime(nextHour){
  const h=((Number(nextHour)||0)%24+24)%24;
  const daylight=h>=6&&h<19;
  const sunPhase=T.MathUtils.clamp((h-6)/13,0,1);
  const nightPhase=h<6?(h+5)/11:(h-19)/11;
  const horizon=Math.min(Math.abs(h-6),Math.abs(h-19));
  const edgeWarm=daylight?1-T.MathUtils.smoothstep(horizon,0,3):0;

  lightState.hour=h;
  lightState.daylight=daylight?1:0;
  lightState.color.set(daylight?0xfff3d9:0xb9d0ff);
  if(daylight) lightState.color.lerp(new T.Color(0xffcf98),edgeWarm*.58);
  lightState.strength=daylight
   ? .58+.32*Math.sin(Math.PI*sunPhase)
   : .30+.10*Math.sin(Math.PI*T.MathUtils.clamp(nightPhase,0,1));
  lightState.center.set(
   daylight?T.MathUtils.lerp(-5.6,5.6,sunPhase):T.MathUtils.lerp(4.4,-4.4,T.MathUtils.clamp(nightPhase,0,1)),
   daylight?4.5+1.25*Math.sin(Math.PI*sunPhase):5.5
  );
  lightState.floorCenter.set(
   daylight?T.MathUtils.lerp(-4.2,4.2,sunPhase):T.MathUtils.lerp(3.3,-3.3,T.MathUtils.clamp(nightPhase,0,1)),
   daylight?T.MathUtils.lerp(-2.8,.8,sunPhase):-1.5
  );
  lightState.angle=daylight?T.MathUtils.lerp(-.24,.24,sunPhase):-.12;

  const u=lightState.shader?.uniforms;
  if(u){
   u.uWindowColor.value.copy(lightState.color);
   u.uWindowStrength.value=lightState.strength;
   u.uWindowCenter.value.copy(lightState.center);
   u.uFloorLightCenter.value.copy(lightState.floorCenter);
   u.uWindowAngle.value=lightState.angle;
   u.uDaylight.value=lightState.daylight;
  }
 }
 setTime(hour);

 material.onBeforeCompile=shader=>{
  lightState.shader=shader;
  shader.uniforms.uWindowColor={value:lightState.color.clone()};
  shader.uniforms.uWindowStrength={value:lightState.strength};
  shader.uniforms.uWindowCenter={value:lightState.center.clone()};
  shader.uniforms.uFloorLightCenter={value:lightState.floorCenter.clone()};
  shader.uniforms.uWindowAngle={value:lightState.angle};
  shader.uniforms.uDaylight={value:lightState.daylight};
  shader.vertexShader='varying vec3 vStudioWorld;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace(
   '#include <worldpos_vertex>',
   '#include <worldpos_vertex>\nvStudioWorld=(modelMatrix*vec4(transformed,1.0)).xyz;'
  );
  shader.fragmentShader='uniform vec3 uWindowColor; uniform float uWindowStrength; uniform vec2 uWindowCenter; uniform vec2 uFloorLightCenter; uniform float uWindowAngle; uniform float uDaylight; varying vec3 vStudioWorld;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
   float ca=cos(uWindowAngle),sa=sin(uWindowAngle);
   mat2 windowRotation=mat2(ca,-sa,sa,ca);

   // One large, feathered window projection. There is no frame or decorative grid:
   // only a smooth photographic pool whose angle and position follow studio time.
   vec2 wallP=windowRotation*(vec2(vStudioWorld.x,vStudioWorld.y)-uWindowCenter);
   vec2 wallN=wallP/vec2(5.8,3.75);
   float wallCore=exp(-(pow(abs(wallN.x),4.0)+pow(abs(wallN.y),4.0))*1.42);
   float wallBloom=exp(-dot(wallN,wallN)*1.12);
   float wallSurface=smoothstep(.12,1.35,vStudioWorld.y);
   float wallLight=(wallCore*.68+wallBloom*.32)*wallSurface;

   // A weaker continuation across the floor makes the source feel like a real window,
   // while remaining broad enough that no new hard line is introduced.
   vec2 floorP=windowRotation*(vec2(vStudioWorld.x,vStudioWorld.z)-uFloorLightCenter);
   vec2 floorN=floorP/vec2(5.4,3.1);
   float floorCore=exp(-(pow(abs(floorN.x),4.0)+pow(abs(floorN.y),4.0))*1.7);
   float floorSurface=1.0-smoothstep(.05,.82,vStudioWorld.y);
   float floorLight=floorCore*floorSurface*.20;

   // A very broad veil removes the remaining tonal hinge at the start of the sweep.
   float coveVeil=exp(-pow((vStudioWorld.z+4.2)/4.8,2.0))*.055;
   float support=(wallLight+floorLight)*uWindowStrength;
   outgoingLight+=uWindowColor*(support+coveVeil);
   #include <opaque_fragment>`);
 };
 material.customProgramCacheKey=()=> 'single-surface-cyclorama-window-v3';

 const sweep=new T.Mesh(geometry,material);
 sweep.name='Single-surface studio cyclorama';
 sweep.position.y=-.016;
 sweep.castShadow=false;
 sweep.receiveShadow=true;
 sweep.userData.setStudioTime=setTime;
 sweep.userData.studioLightState=lightState;
 return sweep;
}
