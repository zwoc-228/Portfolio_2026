import * as T from './assets/three.module.js';

// High-quality planar reflection with separable blur plus screen-UI contact reflections.
// Round 37 keeps the 1024x576 HalfFloat reflection budget, but makes UI reflections
// directional and elongated across the metal desk instead of symmetric glow blobs.
export function createFloorReflection(renderer,scene,ground){
 const W=1024,H=576;
 const raw=new T.WebGLRenderTarget(W,H,{type:T.HalfFloatType,depthBuffer:true});
 raw.texture.generateMipmaps=false;raw.texture.minFilter=T.LinearFilter;raw.texture.magFilter=T.LinearFilter;
 if('samples' in raw)raw.samples=0;
 const blurA=new T.WebGLRenderTarget(W,H,{type:T.HalfFloatType,depthBuffer:false});
 const blurB=new T.WebGLRenderTarget(W,H,{type:T.HalfFloatType,depthBuffer:false});
 for(const rt of [blurA,blurB]){rt.texture.generateMipmaps=false;rt.texture.minFilter=T.LinearFilter;rt.texture.magFilter=T.LinearFilter;}

 const mirror=new T.PerspectiveCamera();const matrix=new T.Matrix4();
 const bias=new T.Matrix4().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);
 const uniforms={
  floorReflection:{value:blurB.texture},floorProjection:{value:matrix},
  glowWorldXZ:{value:new T.Vector2(0,0)},glowStrength:{value:0},glowRadius:{value:.48},
  glowColor:{value:new T.Color(0xfff4df)},
  daylightColor:{value:new T.Color(0xfff1d8)},daylightStrength:{value:.8},daylightIsDay:{value:1},
  uiCenter:{value:new T.Vector2(0,0)},uiAxis:{value:new T.Vector2(1,0)},uiHalfLength:{value:0},
  uiWidth:{value:.18},uiStrength:{value:0},uiProgress:{value:0},uiContact:{value:1},
 };
 // Three UI reflection slots: sidebar, project-card field, project-detail card.
 for(let i=0;i<3;i++){
  uniforms[`panel${i}Center`]={value:new T.Vector2(0,0)};
  uniforms[`panel${i}Axis`]={value:new T.Vector2(1,0)};
  uniforms[`panel${i}Normal`]={value:new T.Vector2(0,1)};
  uniforms[`panel${i}HalfLength`]={value:0};
  uniforms[`panel${i}Depth`]={value:.5};
  uniforms[`panel${i}Strength`]={value:0};
  uniforms[`panel${i}Hover`]={value:0};
 }
 // Footprints modulate contact strength only. The complete mirrored silhouette remains visible
 // beyond each footprint, preserving the natural length of model and UI reflections.
 for(let i=0;i<4;i++){
  uniforms[`object${i}Center`]={value:new T.Vector2(0,0)};
  uniforms[`object${i}Radius`]={value:new T.Vector2(.55,.38)};
  uniforms[`object${i}Strength`]={value:0};
 }
 let transientObjects=[];
 let reflectionOnlyObjects=[];
 let persistentReflectionOnlyObjects=[];

 const blurScene=new T.Scene();const blurCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
 const blurMat=new T.ShaderMaterial({toneMapped:false,depthTest:false,depthWrite:false,uniforms:{uMap:{value:raw.texture},uTexel:{value:new T.Vector2(1/W,1/H)},uDirection:{value:new T.Vector2(1,0)}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`precision highp float;uniform sampler2D uMap;uniform vec2 uTexel;uniform vec2 uDirection;varying vec2 vUv;void main(){vec2 d=uTexel*uDirection*.78;vec4 c=texture2D(uMap,vUv)*.227027; c+=(texture2D(uMap,vUv+d)+texture2D(uMap,vUv-d))*.194595; c+=(texture2D(uMap,vUv+d*2.)+texture2D(uMap,vUv-d*2.))*.121622; c+=(texture2D(uMap,vUv+d*3.)+texture2D(uMap,vUv-d*3.))*.054054; c+=(texture2D(uMap,vUv+d*4.)+texture2D(uMap,vUv-d*4.))*.016216;gl_FragColor=c;}`});
 const blurQuad=new T.Mesh(new T.PlaneGeometry(2,2),blurMat);blurScene.add(blurQuad);

 ground.material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader='varying vec4 vFloorProjection; varying vec3 vFloorWorldPosition; uniform mat4 floorProjection;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvec4 floorWorld = modelMatrix * vec4(transformed,1.0);\nvFloorWorldPosition = floorWorld.xyz;\nvFloorProjection = floorProjection * floorWorld;');
  shader.fragmentShader=`uniform sampler2D floorReflection;
uniform vec2 glowWorldXZ; uniform float glowStrength; uniform float glowRadius; uniform vec3 glowColor;
uniform vec3 daylightColor; uniform float daylightStrength; uniform float daylightIsDay;
uniform vec2 uiCenter; uniform vec2 uiAxis; uniform float uiHalfLength; uniform float uiWidth; uniform float uiStrength; uniform float uiProgress; uniform float uiContact;
uniform vec2 panel0Center; uniform vec2 panel0Axis; uniform vec2 panel0Normal; uniform float panel0HalfLength; uniform float panel0Depth; uniform float panel0Strength; uniform float panel0Hover;
uniform vec2 panel1Center; uniform vec2 panel1Axis; uniform vec2 panel1Normal; uniform float panel1HalfLength; uniform float panel1Depth; uniform float panel1Strength; uniform float panel1Hover;
uniform vec2 panel2Center; uniform vec2 panel2Axis; uniform vec2 panel2Normal; uniform float panel2HalfLength; uniform float panel2Depth; uniform float panel2Strength; uniform float panel2Hover;
uniform vec2 object0Center; uniform vec2 object0Radius; uniform float object0Strength;
uniform vec2 object1Center; uniform vec2 object1Radius; uniform float object1Strength;
uniform vec2 object2Center; uniform vec2 object2Radius; uniform float object2Strength;
uniform vec2 object3Center; uniform vec2 object3Radius; uniform float object3Strength;
varying vec4 vFloorProjection; varying vec3 vFloorWorldPosition;
float floorGlowMask(){
 vec2 gd=vFloorWorldPosition.xz-glowWorldXZ;
 float d=dot(gd,gd)/(2.0*glowRadius*glowRadius);
 return exp(-d*d*.62-d*.58)*glowStrength;
}
float windowSupportMask(){
 // A single broad, softly projected window patch. Rotation gives the diagonal
 // sunlight direction without visible cards, geometry edges or a horizon stripe.
 vec2 p=vec2((vFloorWorldPosition.x+2.15)*.205,(vFloorWorldPosition.y-4.0)*.34);
 p=mat2(.978,-.208,.208,.978)*p;
 vec2 d=abs(p)-vec2(.92,.78);
 float outside=length(max(d,0.0))+min(max(d.x,d.y),0.0);
 float softBox=1.0-smoothstep(-.12,.22,outside);
 float wall=smoothstep(.22,1.55,vFloorWorldPosition.y);
 float cove=1.0-smoothstep(-5.85,-4.15,vFloorWorldPosition.z);
 float pool=exp(-dot(vec2(p.x*.70,p.y*.84),vec2(p.x*.70,p.y*.84))*.72);
 return wall*cove*max(softBox*.72,pool*.32)*mix(.72,1.0,daylightIsDay);
}
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
float uiContactShadow(){vec2 d=vFloorWorldPosition.xz-uiCenter;float w=max(uiWidth,.035);float q=dot(d,d)/(w*w);return exp(-q*2.35)*(1.0-uiProgress)*uiContact;}

vec3 boardReflection(vec2 center, vec2 axis, vec2 normalDir, float halfLength, float depth, float strength, float hover){
 vec2 d=vFloorWorldPosition.xz-center;
 vec2 a=normalize(axis+vec2(1e-5));
 vec2 n=normalize(normalDir+vec2(1e-5));
 float along=dot(d,a);
 float outward=dot(d,n);
 float l=max(halfLength,.04); float dep=max(depth,.05);
 float cap=max(abs(along)-l,0.0);
 float lateral=exp(-.5*cap*cap/max(.018,l*l*.055));
 float front=max(outward,0.0); float back=max(-outward,0.0);
 // Long low-energy reflection pulled away from the panel into the desk.
 float longBody=exp(-pow(front/max(dep*.78,.02),1.34))*exp(-back*back/max(.018,dep*dep*.025));
 float contact=exp(-front*front/max(.010,dep*dep*.020))*exp(-back*back/max(.008,dep*dep*.012));
 float edgeRidge=exp(-pow(front/max(dep*.34,.02),1.55))*exp(-back*back/max(.008,dep*dep*.012));
 float pulse=1.0+hover*.14;
 return vec3(lateral*longBody,lateral*contact,lateral*edgeRidge)*strength*pulse;
}
vec3 panelBoardReflection(){
 return boardReflection(panel0Center,panel0Axis,panel0Normal,panel0HalfLength,panel0Depth,panel0Strength,panel0Hover)
      + boardReflection(panel1Center,panel1Axis,panel1Normal,panel1HalfLength,panel1Depth,panel1Strength,panel1Hover)
      + boardReflection(panel2Center,panel2Axis,panel2Normal,panel2HalfLength,panel2Depth,panel2Strength,panel2Hover);
}
float panelBoardMask(){return clamp(panelBoardReflection().x,0.0,1.0);}
float objectFootprint(vec2 center, vec2 radius, float strength){
 vec2 d=(vFloorWorldPosition.xz-center)/max(radius,vec2(.02));
 float ellipse=exp(-dot(d,d)*1.35);
 float core=exp(-dot(d,d)*4.8);
 return clamp((ellipse*.72+core*.28)*strength,0.0,1.0);
}
float reflectionFootprintMask(){
 return max(
  max(objectFootprint(object0Center,object0Radius,object0Strength), objectFootprint(object1Center,object1Radius,object1Strength)),
  max(objectFootprint(object2Center,object2Radius,object2Strength),objectFootprint(object3Center,object3Radius,object3Strength))
 );
}
`+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor *= mix(1.0,0.82,clamp(floorGlowMask(),0.0,1.0)); roughnessFactor *= mix(1.0,.86,uiGlassMask()); roughnessFactor *= mix(1.0,.90,panelBoardMask());');
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
  vec2 reflectionUV=vFloorProjection.xy/vFloorProjection.w;
  vec4 reflected=texture2D(floorReflection,reflectionUV);
  float inside=step(0.0,reflectionUV.x)*step(reflectionUV.x,1.0)*step(0.0,reflectionUV.y)*step(reflectionUV.y,1.0)*step(0.0,vFloorProjection.w);
  float footprint=clamp(reflectionFootprintMask(),0.0,1.0);
  // Reflection-only UI proxy meshes are real scene geometry during the mirror pass.
  // Keep a visible low-energy base response everywhere instead of suppressing them
  // through the object-footprint mask; model footprints still receive extra energy.
  // Fade the planar mirror before the floor reaches the cove. Without this,
  // the mirror pass ends abruptly at the tangent and reads as a horizontal line.
  float coveFade=smoothstep(-3.52,-2.30,vFloorWorldPosition.z);
  float reflectedAlpha=clamp(reflected.a,0.0,1.0)*inside*coveFade;
  vec3 reflectedColor=reflected.rgb/max(reflected.a,.001);
  float reflectedLuma=dot(reflectedColor,vec3(.2126,.7152,.0722));
  reflectedColor=mix(vec3(reflectedLuma),reflectedColor,.72);
  reflectedColor*=.98;
  outgoingLight=mix(outgoingLight,reflectedColor,(.16+.17*footprint)*reflectedAlpha);
  float pointerGlow=clamp(floorGlowMask(),0.0,1.0);
  // Soft circular hand light on the floor; no cone is visible unless a model is hit.
  outgoingLight += glowColor*(.075*pointerGlow);
  float support=windowSupportMask()*daylightStrength;
  outgoingLight += daylightColor*(.19*support);
  vec3 uiRef=uiGlassReflection(); float uiGlow=clamp(uiRef.x,0.0,1.0);
  float uiShadow=clamp(uiContactShadow(),0.0,1.0);
  outgoingLight*=1.0-uiShadow*.115;
  outgoingLight=mix(outgoingLight,outgoingLight*vec3(.95),clamp(uiRef.z*.16,0.0,.13));
  outgoingLight += vec3(.048)*uiGlow + vec3(.094)*uiRef.y;
  vec3 panelRef=panelBoardReflection();
  outgoingLight=mix(outgoingLight,outgoingLight*vec3(.94),clamp(panelRef.x*.18,0.0,.16));
  outgoingLight += vec3(.058)*panelRef.x + vec3(.138)*panelRef.y + vec3(.080)*panelRef.z;
  #include <opaque_fragment>`);
 };
 ground.material.customProgramCacheKey=()=> 'seamless-daylight-floor-v17';
 const color=new T.Color(),look=new T.Vector3();
 const floorY=ground.userData?.floorY??ground.position.y;
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
 function setPanel(slot,x,z,ax,az,nx,nz,halfLength,depth,strength,hover=0){
  const i=Math.max(0,Math.min(2,slot|0));
  uniforms[`panel${i}Center`].value.set(x,z);
  uniforms[`panel${i}Axis`].value.set(ax,az);
  uniforms[`panel${i}Normal`].value.set(nx,nz);
  uniforms[`panel${i}HalfLength`].value=halfLength;
  uniforms[`panel${i}Depth`].value=depth;
  uniforms[`panel${i}Strength`].value=strength;
  uniforms[`panel${i}Hover`].value=hover;
 }
 function setObject(slot,x,z,rx,rz,strength=1){
  const i=Math.max(0,Math.min(3,slot|0));
  uniforms[`object${i}Center`].value.set(x,z);
  uniforms[`object${i}Radius`].value.set(Math.max(.05,rx),Math.max(.05,rz));
  uniforms[`object${i}Strength`].value=Math.max(0,strength);
 }
 return {
  setGlow(x,z,strength=1){uniforms.glowWorldXZ.value.set(x,z);uniforms.glowStrength.value=strength;},
  setDaylight(color,strength=.8,isDay=true){
   uniforms.daylightColor.value.copy(color);
   uniforms.glowColor.value.copy(color).lerp(new T.Color(0xffffff),.38);
   uniforms.daylightStrength.value=Math.max(0,strength);
   uniforms.daylightIsDay.value=isDay?1:0;
  },
  setUICaustic(x,z,ax,az,halfLength,width,strength,progress=1,contact=1){uniforms.uiCenter.value.set(x,z);uniforms.uiAxis.value.set(ax,az);uniforms.uiHalfLength.value=halfLength;uniforms.uiWidth.value=width;uniforms.uiStrength.value=strength;uniforms.uiProgress.value=progress;uniforms.uiContact.value=contact;},
  setPanelReflection:setPanel,
  clearPanelReflections(){for(let i=0;i<3;i++)setPanel(i,0,0,1,0,0,1,0,.5,0,0);},
  setObjectFootprint:setObject,
  clearObjectFootprints(){for(let i=0;i<4;i++)setObject(i,0,0,.55,.38,0);},
  setTransientObjects(objects=[]){transientObjects=objects.filter(Boolean);},
  setReflectionOnlyObjects(objects=[]){reflectionOnlyObjects=objects.filter(Boolean);},
  setPersistentReflectionOnlyObjects(objects=[]){persistentReflectionOnlyObjects=objects.filter(Boolean);},
  clear,
  update(camera){
   mirror.copy(camera);mirror.position.y=2*floorY-camera.position.y;
   camera.getWorldDirection(look);look.add(camera.position);look.y=2*floorY-look.y;
   mirror.up.set(0,-1,0);mirror.lookAt(look);mirror.updateMatrixWorld();
   matrix.copy(bias).multiply(mirror.projectionMatrix).multiply(mirror.matrixWorldInverse);
   const old=renderer.getRenderTarget(),background=scene.background;renderer.getClearColor(color);const alpha=renderer.getClearAlpha();
   const transientState=transientObjects.map(obj=>({obj,visible:obj.visible,intensity:typeof obj.intensity==='number'?obj.intensity:null}));
   const allReflectionOnly=[...new Set([...persistentReflectionOnlyObjects,...reflectionOnlyObjects])];
   const reflectionOnlyState=allReflectionOnly.map(obj=>({obj,visible:obj.visible}));
   const groundVisible=ground.visible;
   try {
    for(const item of transientState){item.obj.visible=false;if(item.intensity!==null)item.obj.intensity=0;}
    for(const item of reflectionOnlyState)item.obj.visible=true;
    ground.visible=false;scene.background=null;renderer.setClearColor(0x000000,0);renderer.setRenderTarget(raw);renderer.clear(true,true,true);renderer.render(scene,mirror);
    blur();
   } finally {
    renderer.setRenderTarget(old);renderer.setClearColor(color,alpha);scene.background=background;ground.visible=groundVisible;
    for(const item of transientState){item.obj.visible=item.visible;if(item.intensity!==null)item.obj.intensity=item.intensity;}
    for(const item of reflectionOnlyState)item.obj.visible=item.visible;
   }
  },
  dispose(){raw.dispose();blurA.dispose();blurB.dispose();blurQuad.geometry.dispose();blurMat.dispose();}
 };
}
