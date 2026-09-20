import * as T from './assets/three.module.js';
// Planar capture of the actual scene. Broad, premultiplied filtering approximates a rough silver surface.
export function createFloorReflection(renderer,scene,ground){
 const rt=new T.WebGLRenderTarget(1536,864,{type:T.HalfFloatType,depthBuffer:true});
 rt.texture.generateMipmaps=true;rt.texture.minFilter=T.LinearMipmapLinearFilter;rt.texture.magFilter=T.LinearFilter;
 if('samples' in rt)rt.samples=2;
 const mirror=new T.PerspectiveCamera();const matrix=new T.Matrix4();
 const bias=new T.Matrix4().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);
 const uniforms={floorReflection:{value:rt.texture},floorProjection:{value:matrix},reflectionTexel:{value:new T.Vector2(1/1536,1/864)},glowWorldXZ:{value:new T.Vector2(0,0)},glowStrength:{value:0},glowRadius:{value:.36}};
 ground.material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader='varying vec4 vFloorProjection; varying vec3 vFloorWorldPosition; uniform mat4 floorProjection;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvec4 floorWorld = modelMatrix * vec4(transformed,1.0);\nvFloorWorldPosition = floorWorld.xyz;\nvFloorProjection = floorProjection * floorWorld;');
  shader.fragmentShader='uniform sampler2D floorReflection; uniform vec2 reflectionTexel; uniform vec2 glowWorldXZ; uniform float glowStrength; uniform float glowRadius; varying vec4 vFloorProjection; varying vec3 vFloorWorldPosition; float floorGlowMask(){vec2 gd=vFloorWorldPosition.xz-glowWorldXZ; return exp(-dot(gd,gd)/(2.0*glowRadius*glowRadius))*glowStrength;}\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor *= mix(1.0,0.82,clamp(floorGlowMask(),0.0,1.0));');
 shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
  vec2 reflectionUV=vFloorProjection.xy/vFloorProjection.w;
  vec4 reflected=vec4(0.0);
  float totalWeight=0.0;
  for(int ix=-2;ix<=2;ix++)for(int iy=-2;iy<=2;iy++){
    vec2 tap=vec2(float(ix),float(iy));float weight=exp(-dot(tap,tap)*.34);
    reflected+=texture2D(floorReflection,reflectionUV+tap*reflectionTexel*3.8)*weight;totalWeight+=weight;
  }
  reflected/=totalWeight;
  float inside=step(0.0,reflectionUV.x)*step(reflectionUV.x,1.0)*step(0.0,reflectionUV.y)*step(reflectionUV.y,1.0)*step(0.0,vFloorProjection.w);
  float reflectedAlpha=clamp(reflected.a,0.0,1.0)*inside;
  vec3 reflectedColor=reflected.rgb/max(reflected.a,.001);
  outgoingLight=mix(outgoingLight,reflectedColor,.50*reflectedAlpha);
  float pointerGlow=clamp(floorGlowMask(),0.0,1.0);
  outgoingLight += vec3(.024,.028,.034)*pointerGlow;
  #include <opaque_fragment>`);
 };
 ground.material.customProgramCacheKey=()=> 'reference-floor-v7-brighter';
 const color=new T.Color(),look=new T.Vector3();
 return {setGlow(x,z,strength=1){uniforms.glowWorldXZ.value.set(x,z);uniforms.glowStrength.value=strength;},update(camera){
  mirror.copy(camera);mirror.position.y=2*ground.position.y-camera.position.y;
  camera.getWorldDirection(look);look.add(camera.position);look.y=2*ground.position.y-look.y;
  mirror.up.set(0,-1,0);mirror.lookAt(look);mirror.updateMatrixWorld();
  matrix.copy(bias).multiply(mirror.projectionMatrix).multiply(mirror.matrixWorldInverse);
  const old=renderer.getRenderTarget(),background=scene.background;renderer.getClearColor(color);const alpha=renderer.getClearAlpha();
  ground.visible=false;scene.background=null;renderer.setClearColor(0x000000,0);renderer.setRenderTarget(rt);renderer.clear();renderer.render(scene,mirror);
  renderer.setRenderTarget(old);renderer.setClearColor(color,alpha);scene.background=background;ground.visible=true;
 },dispose(){rt.dispose();}};
}
