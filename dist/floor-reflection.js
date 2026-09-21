import * as T from './assets/three.module.js';

// High-quality planar reflection with separable blur.
// Round 31 keeps the Round 30 visual budget, but excludes transient beam meshes/lights
// from the planar reflection capture to prevent first-load/stale beam ghosts.
export function createFloorReflection(renderer,scene,ground){
 const W=1024,H=576;
 const raw=new T.WebGLRenderTarget(W,H,{type:T.HalfFloatType,depthBuffer:true});
 raw.texture.generateMipmaps=false;raw.texture.minFilter=T.LinearFilter;raw.texture.magFilter=T.LinearFilter;
 if('samples' in raw)raw.samples=2;
 const blurA=new T.WebGLRenderTarget(W,H,{type:T.HalfFloatType,depthBuffer:false});
 const blurB=new T.WebGLRenderTarget(W,H,{type:T.HalfFloatType,depthBuffer:false});
 for(const rt of [blurA,blurB]){rt.texture.generateMipmaps=false;rt.texture.minFilter=T.LinearFilter;rt.texture.magFilter=T.LinearFilter;}

 const mirror=new T.PerspectiveCamera();const matrix=new T.Matrix4();
 const bias=new T.Matrix4().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);
 const uniforms={
  floorReflection:{value:blurB.texture},floorProjection:{value:matrix},
  glowWorldXZ:{value:new T.Vector2(0,0)},glowStrength:{value:0},glowRadius:{value:.36},
  uiCenter:{value:new T.Vector2(0,0)},uiAxis:{value:new T.Vector2(1,0)},uiHalfLength:{value:0},
  uiWidth:{value:.18},uiStrength:{value:0},uiProgress:{value:0}
 };
 let transientObjects=[];

 const blurScene=new T.Scene();const blurCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
 const blurMat=new T.ShaderMaterial({toneMapped:false,depthTest:false,depthWrite:false,uniforms:{uMap:{value:raw.texture},uTexel:{value:new T.Vector2(1/W,1/H)},uDirection:{value:new T.Vector2(1,0)}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`precision highp float;uniform sampler2D uMap;uniform vec2 uTexel;uniform vec2 uDirection;varying vec2 vUv;void main(){vec2 d=uTexel*uDirection*3.15;vec4 c=texture2D(uMap,vUv)*.2270270270;c+=texture2D(uMap,vUv+d*1.3846153846)*.3162162162;c+=texture2D(uMap,vUv-d*1.3846153846)*.3162162162;c+=texture2D(uMap,vUv+d*3.2307692308)*.0702702703;c+=texture2D(uMap,vUv-d*3.2307692308)*.0702702703;gl_FragColor=c;}`});
 const blurQuad=new T.Mesh(new T.PlaneGeometry(2,2),blurMat);blurScene.add(blurQuad);

 ground.material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader='varying vec4 vFloorProjection; varying vec3 vFloorWorldPosition; uniform mat4 floorProjection;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvec4 floorWorld = modelMatrix * vec4(transformed,1.0);\nvFloorWorldPosition = floorWorld.xyz;\nvFloorProjection = floorProjection * floorWorld;');
  shader.fragmentShader=`uniform sampler2D floorReflection;
uniform vec2 glowWorldXZ; uniform float glowStrength; uniform float glowRadius;
uniform vec2 uiCenter; uniform vec2 uiAxis; uniform float uiHalfLength; uniform float uiWidth; uniform float uiStrength; uniform float uiProgress;
varying vec4 vFloorProjection; varying vec3 vFloorWorldPosition;
float floorGlowMask(){vec2 gd=vFloorWorldPosition.xz-glowWorldXZ; return exp(-dot(gd,gd)/(2.0*glowRadius*glowRadius))*glowStrength;}
vec3 uiGlassReflection(){
 vec2 d=vFloorWorldPosition.xz-uiCenter; vec2 a=normalize(uiAxis+vec2(1e-5)); vec2 n=vec2(-a.y,a.x);
 float along=dot(d,a); float across=dot(d,n); float l=max(uiHalfLength,.03); float w=max(uiWidth,.03);
 float sphere=exp(-.5*dot(d,d)/(w*w*.70));
 float capAlong=max(abs(along)-l,0.0);
 float capsule=exp(-.5*(capAlong*capAlong/(w*w*.58)+across*across/(w*w*.46)));
 float ridge=exp(-.5*(capAlong*capAlong/(w*w*1.15)+(across-w*.24)*(across-w*.24)/(w*w*.045)));
 float core=exp(-.5*(capAlong*capAlong/(w*w*.80)+across*across/(w*w*.18)));
 float shape=mix(sphere,capsule,uiProgress); float edge=mix(sphere*.65,ridge,uiProgress); float center=mix(sphere*.24,core,uiProgress);
 return vec3(shape,edge,center)*uiStrength;
}
float uiGlassMask(){return clamp(uiGlassReflection().x,0.0,1.0);}
`+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor *= mix(1.0,0.82,clamp(floorGlowMask(),0.0,1.0)); roughnessFactor *= mix(1.0,.84,uiGlassMask());');
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
  vec2 reflectionUV=vFloorProjection.xy/vFloorProjection.w;
  vec4 reflected=texture2D(floorReflection,reflectionUV);
  float inside=step(0.0,reflectionUV.x)*step(reflectionUV.x,1.0)*step(0.0,reflectionUV.y)*step(reflectionUV.y,1.0)*step(0.0,vFloorProjection.w);
  float reflectedAlpha=clamp(reflected.a,0.0,1.0)*inside;
  vec3 reflectedColor=reflected.rgb/max(reflected.a,.001);
  outgoingLight=mix(outgoingLight,reflectedColor,.44*reflectedAlpha);
  float pointerGlow=clamp(floorGlowMask(),0.0,1.0);
  outgoingLight += vec3(.024,.028,.034)*pointerGlow;
  vec3 uiRef=uiGlassReflection(); float uiGlow=clamp(uiRef.x,0.0,1.0);
  outgoingLight=mix(outgoingLight,outgoingLight*vec3(.92,.95,.97),clamp(uiRef.z*.22,0.0,.18));
  outgoingLight += vec3(.050,.067,.080)*uiGlow + vec3(.115,.145,.165)*uiRef.y;
  #include <opaque_fragment>`);
 };
 ground.material.customProgramCacheKey=()=> 'reference-floor-v10-ui-reflection';
 const color=new T.Color(),look=new T.Vector3();
 function blur(){
  blurMat.uniforms.uMap.value=raw.texture;blurMat.uniforms.uDirection.value.set(1,0);renderer.setRenderTarget(blurA);renderer.clear();renderer.render(blurScene,blurCamera);
  blurMat.uniforms.uMap.value=blurA.texture;blurMat.uniforms.uDirection.value.set(0,1);renderer.setRenderTarget(blurB);renderer.clear();renderer.render(blurScene,blurCamera);
 }
 function clear(){
  const old=renderer.getRenderTarget(),cc=new T.Color();renderer.getClearColor(cc);const ca=renderer.getClearAlpha();
  renderer.setClearColor(0x000000,0);
  for(const rt of [raw,blurA,blurB]){renderer.setRenderTarget(rt);renderer.clear(true,true,true);}
  renderer.setRenderTarget(old);renderer.setClearColor(cc,ca);
 }
 return {
  setGlow(x,z,strength=1){uniforms.glowWorldXZ.value.set(x,z);uniforms.glowStrength.value=strength;},
  setUICaustic(x,z,ax,az,halfLength,width,strength,progress=1){uniforms.uiCenter.value.set(x,z);uniforms.uiAxis.value.set(ax,az);uniforms.uiHalfLength.value=halfLength;uniforms.uiWidth.value=width;uniforms.uiStrength.value=strength;uniforms.uiProgress.value=progress;},
  setTransientObjects(objects=[]){transientObjects=objects.filter(Boolean);},
  clear,
  update(camera){
   mirror.copy(camera);mirror.position.y=2*ground.position.y-camera.position.y;
   camera.getWorldDirection(look);look.add(camera.position);look.y=2*ground.position.y-look.y;
   mirror.up.set(0,-1,0);mirror.lookAt(look);mirror.updateMatrixWorld();
   matrix.copy(bias).multiply(mirror.projectionMatrix).multiply(mirror.matrixWorldInverse);
   const old=renderer.getRenderTarget(),background=scene.background;renderer.getClearColor(color);const alpha=renderer.getClearAlpha();
   const transientState=transientObjects.map(obj=>({obj,visible:obj.visible,intensity:typeof obj.intensity==='number'?obj.intensity:null}));
   for(const item of transientState){item.obj.visible=false;if(item.intensity!==null)item.obj.intensity=0;}
   ground.visible=false;scene.background=null;renderer.setClearColor(0x000000,0);renderer.setRenderTarget(raw);renderer.clear(true,true,true);renderer.render(scene,mirror);
   blur();
   renderer.setRenderTarget(old);renderer.setClearColor(color,alpha);scene.background=background;ground.visible=true;
   for(const item of transientState){item.obj.visible=item.visible;if(item.intensity!==null)item.obj.intensity=item.intensity;}
  },
  dispose(){raw.dispose();blurA.dispose();blurB.dispose();blurQuad.geometry.dispose();blurMat.dispose();}
 };
}
