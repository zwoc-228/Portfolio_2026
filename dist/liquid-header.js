import * as T from './assets/three.module.js';
import { createClayOrb, createPorcelainMaterial } from './clay-orb.js';
import { RoundedBoxGeometry } from './assets/RoundedBoxGeometry.js';
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
  vec3 lightA = normalize(vec3(-0.48,0.73,0.49));
  vec3 lightB = normalize(vec3(0.58,-0.12,0.60));
  vec3 viewDir = vec3(0.0,0.0,1.0);
  // Two-lobe glaze approximation: a tight clear-coat highlight over a broad ceramic body.
  float coatA = pow(max(dot(reflect(-lightA,normal),viewDir),0.0),58.0);
  float coatB = pow(max(dot(reflect(-lightB,normal),viewDir),0.0),34.0);
  float bodyA = pow(max(dot(reflect(-lightA,normal),viewDir),0.0),12.0);
  float topLight = smoothstep(.04,.94,normal.y);
  float bottomShade = smoothstep(.02,.96,-normal.y);
  float lens = mix(sphereThickness,h,progress);

  // Match createPorcelainMaterial(): warm ivory, moderate roughness, restrained clear-coat.
  vec3 ceramic = vec3(.944,.938,.910);
  ceramic *= mix(.925,1.055,clamp(topLight*.58 + lens*.20,0.0,1.0));
  ceramic -= vec3(.036,.034,.030) * bottomShade;
  ceramic += vec3(1.0) * (coatA*.105 + coatB*.040 + bodyA*.030);
  ceramic += vec3(.965,.972,.970) * (fresnel*.028 + rim*.020);
  ceramic += vec3(1.0) * motion * rim * .004;

  // Only a trace of the captured scene remains; this is glazed porcelain, not glass.
  float sceneMix = .010;
  vec3 color = mix(ceramic,softScene,sceneMix);
  color *= mix(vec3(1.0),uTint,.006);

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

  // The visible header is a screen-space morph, but its desk interaction is generated
  // by a real reflection-only ceramic slab.  It shares the exact porcelain PBR material
  // with the orb and is only enabled inside the mirror-camera pass.
  const headerReflectionMaterial=createPorcelainMaterial({
    transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide
  });
  headerReflectionMaterial.name='Header porcelain reflection material';
  const headerReflection=new T.Mesh(new RoundedBoxGeometry(1,1,.055,4,.10),headerReflectionMaterial);
  headerReflection.name='Header porcelain reflection proxy';
  headerReflection.visible=false;
  headerReflection.frustumCulled=false;
  scene.add(headerReflection);
  floorReflection?.setPersistentReflectionOnlyObjects?.([headerReflection]);
  const proxyBottom=new T.Vector3(),proxyView=new T.Vector3(),proxyUp=new T.Vector3(),proxyForward=new T.Vector3();
  const proxyQuaternion=new T.Quaternion();

  function syncHeaderReflectionProxy(progress){
    const fade=T.MathUtils.smoothstep(progress,.035,.18);
    headerReflectionMaterial.opacity=fade*.94;
    if(fade<=.001){
      floorReflection?.setObjectFootprint?.(3,orb.sphere.position.x,orb.sphere.position.z,Math.max(.05,orb.sphere.scale.x*2),Math.max(.05,orb.sphere.scale.z*2),orb.sphere.material.opacity);
      return;
    }
    camera.updateMatrixWorld(true);
    const x=currentCenterX;
    const y=Math.min(cssH-2,headerTop+currentHeight);
    pointerNDC.set(x/cssW*2-1,1-y/cssH*2);
    raycaster.setFromCamera(pointerNDC,camera);
    const bottomHeight=.19;
    if(Math.abs(raycaster.ray.direction.y)<1e-5)return;
    const t=(bottomHeight-raycaster.ray.origin.y)/raycaster.ray.direction.y;
    if(!Number.isFinite(t)||t<=.01)return;
    proxyBottom.copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction,t);
    proxyView.copy(proxyBottom).applyMatrix4(camera.matrixWorldInverse);
    const depth=-proxyView.z;
    if(!Number.isFinite(depth)||depth<=.1)return;
    const worldPerPx=2*depth*Math.tan(T.MathUtils.degToRad(camera.fov*.5))/cssH;
    const worldW=currentWidth*worldPerPx;
    const worldH=currentHeight*worldPerPx;
    proxyQuaternion.copy(camera.quaternion);
    proxyUp.set(0,1,0).applyQuaternion(proxyQuaternion).normalize();
    proxyForward.set(0,0,-1).applyQuaternion(proxyQuaternion).normalize();
    headerReflection.position.copy(proxyBottom).addScaledVector(proxyUp,worldH*.5).addScaledVector(proxyForward,.014);
    headerReflection.quaternion.copy(proxyQuaternion);
    headerReflection.scale.set(worldW,worldH,1);
    headerReflection.updateMatrixWorld(true);
    floorReflection?.setObjectFootprint?.(3,headerReflection.position.x,headerReflection.position.z,Math.max(.08,worldW*.52),Math.max(.11,worldH*.62),fade);
  }

  function resolveExpandedBounds(){
    const b=getBounds?.();
    const viewportMax=Math.max(520,cssW-64);
    // The old bar simply stretched from the left object to the right object, which made
    // the navigation read like a browser toolbar.  Keep the object-derived center, but
    // cap the width to the same calm, card-like proportion used by levels 2–4.
    const designMax=Math.min(viewportMax,1220,cssW*.78);
    if(b && Number.isFinite(b.left) && Number.isFinite(b.right) && b.right-b.left>240){
      const rawCenter=(b.left+b.right)*.5;
      const width=clamp(b.right-b.left,Math.min(760,viewportMax),designMax);
      const center=clamp(rawCenter,width*.5+24,cssW-width*.5-24);
      return {left:center-width*.5,right:center+width*.5,width,center};
    }
    const width=designMax;
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
    // Do not paint a screen-space glare onto the desk.  The header's floor response
    // comes from headerReflection through the same mirror camera + blur used by objects.
    floorReflection?.setUICaustic?.(0,0,1,0,0,.18,0,progress,0);
    syncHeaderReflectionProxy(progress);
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
    currentHeight=T.MathUtils.lerp(44,52,p);
    currentCenterX=T.MathUtils.lerp(cssW*.5,bounds.center,p);
    currentLeft=currentCenterX-currentWidth*.5;

    const anchorY=42;
    orbState=orb.update({dt,width:cssW,height:cssH,x:currentCenterX,y:anchorY,progress:p,ready:document.documentElement.dataset.sceneReady==='true'});
    // Grow from the sphere's actual projected center.  Do not drift the bar downward
    // during expansion: the ball and the header now share one screen-space anchor.
    const orbCenterY=orbState.top+22;
    const centerY=T.MathUtils.lerp(orbCenterY,anchorY,T.MathUtils.smoothstep(p,.02,.18));
    headerTop=centerY-currentHeight*.5;
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
      floorReflection?.setPersistentReflectionOnlyObjects?.([]);
      headerReflection.removeFromParent();headerReflection.geometry.dispose();headerReflectionMaterial.dispose();
      mesh.geometry.dispose();material.dispose();capture.dispose();
    }
  };
}
