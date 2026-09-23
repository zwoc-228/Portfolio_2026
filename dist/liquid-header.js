import * as T from './assets/three.module.js';
import { createClayOrb } from './clay-orb.js';
import { FRAME_ACTIVE, FRAME_RENDER, FRAME_REFLECTION, FRAME_CAPTURE } from './frame-runtime.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const clamp01 = (v) => clamp(v, 0, 1);
const smooth = (t) => t * t * (3 - 2 * t);

const vertexShader = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`;

const fragmentShader = `
precision highp float;
uniform sampler2D uScene;
uniform vec2 uSize;
uniform vec2 uCaptureScale;
uniform vec2 uCaptureOffset;
uniform float uProgress;
uniform float uVelocity;
uniform float uTime;
uniform vec3 uTint;
varying vec2 vUv;

float sdRoundBox(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return length(max(q, vec2(0.0))) + min(max(q.x,q.y),0.0) - r;
}

float glassHeight(vec2 p, vec2 halfSize, float radius, float bevel){
  float d = sdRoundBox(p, halfSize, radius);
  float inside = clamp(-d / max(bevel,0.001), 0.0, 1.0);
  return smoothstep(0.0,1.0,inside);
}

vec2 sceneUv(vec2 localUv){
  return uCaptureOffset + localUv * uCaptureScale;
}

void main(){
  float progress = smoothstep(0.0,1.0,uProgress);
  vec2 p = (vUv - 0.5) * uSize;
  float shortSide = max(2.0,min(uSize.x,uSize.y));
  float sphereRadius = shortSide * 0.5 - 1.1;
  vec2 halfSize = max(uSize * 0.5 - vec2(1.15), vec2(1.0));
  float capsuleRadius = min(14.0, uSize.y * 0.5 - 1.1);
  float radius = mix(sphereRadius, capsuleRadius, progress);
  float d = sdRoundBox(p, halfSize, radius);
  float alpha = 1.0 - smoothstep(-1.15, 1.25, d);
  if(alpha < 0.002) discard;

  // Collapsed state: true analytical sphere normal, not a flat SDF disc.
  vec2 sphereP = p / max(sphereRadius,1.0);
  float sphereR2 = dot(sphereP,sphereP);
  float sphereZ = sqrt(max(0.0,1.0-sphereR2));
  vec3 sphereNormal = normalize(vec3(sphereP.x,-sphereP.y,sphereZ));
  float sphereThickness = sphereZ;

  // Expanded state: rounded capsule with a curved optical edge profile.
  float bevel = mix(13.5,5.5,progress);
  float h = glassHeight(p,halfSize,radius,bevel);
  float hx = glassHeight(p + vec2(1.0,0.0),halfSize,radius,bevel) - glassHeight(p - vec2(1.0,0.0),halfSize,radius,bevel);
  float hy = glassHeight(p + vec2(0.0,1.0),halfSize,radius,bevel) - glassHeight(p - vec2(0.0,1.0),halfSize,radius,bevel);
  vec3 capsuleNormal = normalize(vec3(-hx*5.8,-hy*5.8,1.0));
  vec3 normal = normalize(mix(sphereNormal,capsuleNormal,progress));
  float opticalThickness = mix(sphereThickness, h, progress);

  float motion = clamp(abs(uVelocity)*2.2,0.0,1.0);
  vec2 refractOffset = normal.xy * mix(0.006,0.0028,progress) * (0.30 + opticalThickness*.70);

  vec2 uv = sceneUv(vUv);
  vec2 refractPx = refractOffset * uCaptureScale;
  vec3 refracted;
  refracted.r = texture2D(uScene, uv + refractPx * 1.16).r;
  refracted.g = texture2D(uScene, uv + refractPx).g;
  refracted.b = texture2D(uScene, uv + refractPx * 0.84).b;

  // Round 36: ceramic / satin surface. The captured scene only contributes a
  // faint subsurface/reflection cue; the body remains materially solid and quiet.
  vec2 blurStep = uCaptureScale / max(uSize, vec2(1.0));
  vec3 softScene = refracted * .45;
  softScene += texture2D(uScene, uv + refractPx + vec2( blurStep.x*1.6, 0.0)).rgb * .1375;
  softScene += texture2D(uScene, uv + refractPx + vec2(-blurStep.x*1.6, 0.0)).rgb * .1375;
  softScene += texture2D(uScene, uv + refractPx + vec2(0.0, blurStep.y*1.6)).rgb * .1375;
  softScene += texture2D(uScene, uv + refractPx + vec2(0.0,-blurStep.y*1.6)).rgb * .1375;

  float edge = 1.0 - h;
  float fresnel = pow(clamp(1.0-normal.z,0.0,1.0),3.0);
  float rim = smoothstep(0.62,1.0,edge);
  vec3 lightA = normalize(vec3(-0.46,0.72,0.52));
  vec3 lightB = normalize(vec3(0.62,-0.16,0.52));
  vec3 viewDir = vec3(0.0,0.0,1.0);
  float specA = pow(max(dot(reflect(-lightA,normal),viewDir),0.0),22.0);
  float specB = pow(max(dot(reflect(-lightB,normal),viewDir),0.0),14.0);
  float topLight = smoothstep(.08,.92,normal.y);
  float bottomShade = smoothstep(.02,.95,-normal.y);
  float lens = mix(sphereThickness,h,progress);

  // The same warm ivory and broad glints used by the navigation cards.
  vec3 ceramic = mix(vec3(.865,.883,.889),vec3(.976,.980,.977),clamp(topLight*.56 + lens*.22,0.0,1.0));
  ceramic -= vec3(.043,.046,.044) * bottomShade;
  ceramic += vec3(1.0) * (specA*.025 + specB*.010);
  ceramic += vec3(.91,.94,.94) * (fresnel*.015 + rim*.018);
  ceramic += vec3(1.0) * motion * rim * .006;

  float sceneMix = mix(.012,.012,progress);
  vec3 color = mix(ceramic,softScene,sceneMix);
  color *= mix(vec3(1.0),uTint,.013);

  float bodyAlpha = 1.0;
  float outAlpha = alpha * (bodyAlpha + rim*.025 + fresnel*.018) * smoothstep(.015,.14,uProgress);
  gl_FragColor = vec4(color,outAlpha);
}`;

export function createLiquidHeader({ renderer, scene, camera, floorReflection, runtime, getBounds, onMotion }) {
  const headerEl = document.querySelector('.site-header');
  if (!headerEl || !renderer || !camera) return null;

  const orb=createClayOrb(scene,camera,{reducedMotion});
  const left = headerEl.querySelector('.liquid-header__left');
  const right = headerEl.querySelector('.liquid-header__right');
  const contentNodes = [left,right].filter(Boolean);

  const overlayScene = new T.Scene();
  const overlayCamera = new T.OrthographicCamera(-1,1,1,-1,-10,10);
  overlayCamera.position.z = 2;

  let capture = new T.FramebufferTexture(16,16);
  capture.minFilter = T.LinearFilter;
  capture.magFilter = T.LinearFilter;
  capture.generateMipmaps = false;
  capture.flipY = false;

  const uniforms = {
    uScene:{value:capture},
    uSize:{value:new T.Vector2(44,44)},
    uCaptureScale:{value:new T.Vector2(1,1)},
    uCaptureOffset:{value:new T.Vector2(0,0)},
    uProgress:{value:0},
    uVelocity:{value:0},
    uTime:{value:0},
    uTint:{value:new T.Color(0xeaf5fb)}
  };
  const material = new T.ShaderMaterial({
    uniforms, vertexShader, fragmentShader,
    transparent:true, depthTest:false, depthWrite:false,
    blending:T.NormalBlending,
    toneMapped:false
  });
  const mesh = new T.Mesh(new T.PlaneGeometry(1,1),material);
  mesh.renderOrder = 1000;
  overlayScene.add(mesh);

  let current=0, target=0, velocity=0, wobble=0, time=0;
  let hovering=false, focusWithin=false, collapseTimer=0;
  let cssW=innerWidth, cssH=innerHeight, currentWidth=44, currentHeight=44;
  let currentCenterX=cssW*.5, currentLeft=currentCenterX-22;
  let headerTop=20, orbState={active:false,moved:false};
  let captureW=16,captureH=16,captureX=0,captureY=0;
  const drawSize=new T.Vector2();
  const raycaster=new T.Raycaster();
  const pointerNDC=new T.Vector2();
  const floorPlane=new T.Plane(new T.Vector3(0,1,0),.014);
  const hitL=new T.Vector3(), hitR=new T.Vector3(), hitC=new T.Vector3();

  function resolveExpandedBounds(){
    const b=getBounds?.();
    if(b && Number.isFinite(b.left) && Number.isFinite(b.right) && b.right-b.left>240){
      const left=clamp(b.left,18,cssW-260);
      const right=clamp(b.right,260,cssW-18);
      return {left,right,width:right-left,center:(left+right)*.5};
    }
    const width=Math.min(cssW-64,1680);
    return {left:(cssW-width)*.5,right:(cssW+width)*.5,width,center:cssW*.5};
  }

  function configureCaptureTexture(tex){
    tex.minFilter=T.LinearFilter;tex.magFilter=T.LinearFilter;tex.generateMipmaps=false;tex.flipY=false;
    return tex;
  }

  function ensureCapture(){
    renderer.getDrawingBufferSize(drawSize);
    const dpr=renderer.getPixelRatio();
    const bounds=resolveExpandedBounds();
    const wantedCssW=Math.max(96,bounds.width+56);
    const wantedW=Math.max(64,Math.min(Math.ceil(wantedCssW*dpr),Math.floor(drawSize.x),2304));
    const wantedH=Math.max(64,Math.min(Math.floor(148*dpr),Math.floor(drawSize.y)));
    if(capture.image.width!==wantedW || capture.image.height!==wantedH){
      const old=capture;
      capture=configureCaptureTexture(new T.FramebufferTexture(wantedW,wantedH));
      uniforms.uScene.value=capture;
      old.dispose();
    }
    captureW=wantedW;captureH=wantedH;
    captureX=clamp(Math.floor(bounds.center*dpr-captureW*.5),0,Math.max(0,Math.floor(drawSize.x-captureW)));
    captureY=Math.max(0,Math.floor(drawSize.y-captureH-Math.floor(4*dpr)));
  }

  function syncOverlayCamera(){
    cssW=innerWidth;cssH=innerHeight;
    overlayCamera.left=-cssW/2;overlayCamera.right=cssW/2;
    overlayCamera.top=cssH/2;overlayCamera.bottom=-cssH/2;
    overlayCamera.updateProjectionMatrix();
  }

  function screenRayToFloor(x,y,out){
    pointerNDC.set(x/cssW*2-1,1-y/cssH*2);
    raycaster.setFromCamera(pointerNDC,camera);
    return raycaster.ray.intersectPlane(floorPlane,out);
  }

  function updateDeskFeedback(progress){
    if(!floorReflection?.setUICaustic)return;
    const top=headerTop;
    const y=top+currentHeight+7;
    const half=currentWidth*.49;
    const cx=currentCenterX;
    const l=screenRayToFloor(cx-half,y,hitL);
    const r=screenRayToFloor(cx+half,y,hitR);
    const c=screenRayToFloor(cx,y,hitC);
    if(!l||!r||!c){floorReflection.setUICaustic(0,0,1,0,0,1,0,progress);return;}
    const dx=r.x-l.x,dz=r.z-l.z,len=Math.max(.05,Math.hypot(dx,dz));
    const ax=dx/len,az=dz/len;
    const width=Math.max(.11,.135+.050*progress);
    const strength=.08*progress;
    const shadowContact=0;
    floorReflection.setUICaustic(c.x,c.z,ax,az,len*.50,width,strength,progress,shadowContact);
  }

  function updateCaptureMapping(){
    const dpr=renderer.getPixelRatio();
    const top=headerTop;
    const barBottomPx=drawSize.y-(top+currentHeight)*dpr;
    uniforms.uCaptureOffset.value.set(
      (currentLeft*dpr-captureX)/captureW,
      (barBottomPx-captureY)/captureH
    );
    uniforms.uCaptureScale.value.set(
      currentWidth*dpr/captureW,
      currentHeight*dpr/captureH
    );
  }

  function apply(progress,motion,dt=0){
    const p=smooth(progress);
    const bounds=resolveExpandedBounds();
    currentWidth=T.MathUtils.lerp(44,bounds.width,p);
    currentHeight=T.MathUtils.lerp(44,60,p);
    currentCenterX=T.MathUtils.lerp(cssW*.5,bounds.center,p);
    currentLeft=currentCenterX-currentWidth*.5;

    orbState=orb.update({dt,width:cssW,height:cssH,x:currentCenterX,y:42,progress:p,ready:document.documentElement.dataset.sceneReady==='true'});
    floorReflection?.setObjectFootprint(3,orb.sphere.position.x,orb.sphere.position.z,orb.sphere.scale.x*2,orb.sphere.scale.z*2,orb.sphere.material.opacity);
    headerTop=T.MathUtils.lerp(orbState.top,20,p);
    mesh.visible=p>.001;
    mesh.scale.set(currentWidth,currentHeight,1);
    mesh.position.set(currentCenterX-cssW*.5,cssH/2-headerTop-currentHeight/2,0);
    uniforms.uSize.value.set(currentWidth,currentHeight);
    uniforms.uProgress.value=p;
    uniforms.uVelocity.value=motion;
    uniforms.uTime.value=time;
    updateCaptureMapping();

    headerEl.style.width=`${currentWidth}px`;
    headerEl.style.height=`${currentHeight}px`;
    headerEl.style.left=`${currentCenterX}px`;
    headerEl.style.top=`${headerTop}px`;
    headerEl.style.setProperty('--reveal',p.toFixed(4));
    headerEl.dataset.mode=p>.52?'expanded':'collapsed';

    const contentReveal=clamp01((p-.38)/.42);
    contentNodes.forEach((node,index)=>{
      node.style.opacity=contentReveal.toFixed(4);
      node.style.transform=`translateY(${((1-contentReveal)*(index?4:6)).toFixed(2)}px)`;
      node.style.pointerEvents=contentReveal>.78?'auto':'none';
    });
    updateDeskFeedback(p);
  }

  function update(dt){
    time+=dt;
    if(reducedMotion){current=target;velocity=0;wobble=0;}else{
      const stiffness=44,damping=12.5;
      velocity+=(target-current)*stiffness*dt;
      velocity*=Math.exp(-damping*dt);
      current+=velocity*dt;
      current=clamp(current,-.015,1.015);
      wobble=T.MathUtils.lerp(wobble,Math.min(1,Math.abs(velocity)*1.8),1-Math.pow(.18,dt*60));
      if(Math.abs(target-current)<.0007&&Math.abs(velocity)<.0007){current=target;velocity=0;wobble*=.65;}
    }
    apply(clamp01(current),wobble,dt);
    const active=orbState.active||Math.abs(target-current)>.0007||Math.abs(velocity)>.0007||wobble>.002;
    if(orbState.moved)onMotion?.();
    return FRAME_RENDER | ((active||orbState.moved)?(FRAME_REFLECTION|FRAME_CAPTURE):0) | (active?FRAME_ACTIVE:0);
  }

  const removeRuntime=runtime?.add(update) || (()=>{});
  const wake=()=>runtime?.request(FRAME_RENDER);
  function setTarget(v){target=clamp01(v);wake();}

  const onEnter=()=>{clearTimeout(collapseTimer);hovering=true;setTarget(1);};
  const onLeave=()=>{hovering=false;clearTimeout(collapseTimer);collapseTimer=setTimeout(()=>{if(!focusWithin)setTarget(0);},120);};
  const onFocusIn=()=>{focusWithin=true;clearTimeout(collapseTimer);setTarget(1);};
  const onFocusOut=(event)=>{focusWithin=headerEl.contains(event.relatedTarget);if(!focusWithin&&!hovering)collapseTimer=setTimeout(()=>setTarget(0),100);};
  headerEl.addEventListener('pointerenter',onEnter);
  headerEl.addEventListener('pointerleave',onLeave);
  headerEl.addEventListener('focusin',onFocusIn);
  headerEl.addEventListener('focusout',onFocusOut);

  function syncLayout(){syncOverlayCamera();ensureCapture();apply(clamp01(current),wobble);runtime?.request(FRAME_RENDER);}
  syncLayout();

  return {
    transientObjects:[orb.shadow],
    syncLayout,
    captureBackground(){
      ensureCapture();
      updateCaptureMapping();
      renderer.copyFramebufferToTexture(capture,new T.Vector2(captureX,captureY));
    },
    renderOverlay(){
      const oldAuto=renderer.autoClear;renderer.autoClear=false;
      renderer.clearDepth();
      renderer.render(overlayScene,overlayCamera);
      renderer.autoClear=oldAuto;
    },
    dispose(){
      orb.dispose();removeRuntime();clearTimeout(collapseTimer);
      headerEl.removeEventListener('pointerenter',onEnter);headerEl.removeEventListener('pointerleave',onLeave);
      headerEl.removeEventListener('focusin',onFocusIn);headerEl.removeEventListener('focusout',onFocusOut);
      mesh.geometry.dispose();material.dispose();capture.dispose();
    }
  };
}
