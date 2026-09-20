import * as T from './assets/three.module.js';

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
uniform float uProgress;
uniform float uVelocity;
uniform float uTime;
uniform float uSceneVFlip;
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

void main(){
  float progress = smoothstep(0.0,1.0,uProgress);
  vec2 p = (vUv - 0.5) * uSize;
  vec2 halfSize = max(uSize * 0.5 - vec2(1.25), vec2(1.0));
  float radius = mix(min(uSize.x,uSize.y)*0.5, 25.5, progress);
  float d = sdRoundBox(p, halfSize, radius);
  float alpha = 1.0 - smoothstep(-1.2, 1.2, d);
  if(alpha < 0.002) discard;

  float bevel = mix(15.0, 11.0, progress);
  float h = glassHeight(p,halfSize,radius,bevel);
  float hx = glassHeight(p + vec2(1.0,0.0),halfSize,radius,bevel) - glassHeight(p - vec2(1.0,0.0),halfSize,radius,bevel);
  float hy = glassHeight(p + vec2(0.0,1.0),halfSize,radius,bevel) - glassHeight(p - vec2(0.0,1.0),halfSize,radius,bevel);
  vec3 normal = normalize(vec3(-hx*5.3,-hy*5.3,1.0));

  float motion = clamp(abs(uVelocity)*2.6,0.0,1.0);
  float ripple = sin((vUv.x*2.2 + uTime*.10)*6.2831853) * motion * 0.0035;
  vec2 refractOffset = normal.xy * mix(0.030,0.012,progress) + vec2(ripple,0.0);

  vec2 uv = vUv;
  if(uSceneVFlip > 0.5) uv.y = 1.0 - uv.y;
  vec3 refracted;
  refracted.r = texture2D(uScene, uv + refractOffset * 1.12).r;
  refracted.g = texture2D(uScene, uv + refractOffset).g;
  refracted.b = texture2D(uScene, uv + refractOffset * 0.88).b;

  float edge = 1.0 - h;
  float fresnel = pow(clamp(1.0-normal.z,0.0,1.0),2.7);
  float rim = smoothstep(0.62,1.0,edge);
  float topLight = smoothstep(0.25,1.0,1.0-vUv.y) * 0.18;
  float lowerShade = smoothstep(0.55,1.0,vUv.y) * 0.055;

  vec3 tint = mix(vec3(1.0),uTint,0.10);
  vec3 color = refracted * tint;
  color += vec3(1.0) * (rim * 0.22 + fresnel * 0.15 + topLight);
  color -= vec3(0.05,0.06,0.07) * lowerShade;
  color += vec3(0.94,0.98,1.0) * motion * edge * 0.055;

  float bodyAlpha = mix(0.52,0.34,progress);
  float outAlpha = alpha * (bodyAlpha + rim*.20 + fresnel*.06);
  gl_FragColor = vec4(color,outAlpha);
}`;

export function createLiquidHeader({ renderer, camera, floorReflection, invalidate }) {
  const headerEl = document.querySelector('.site-header');
  if (!headerEl || !renderer || !camera) return null;

  const left = headerEl.querySelector('.liquid-header__left');
  const right = headerEl.querySelector('.liquid-header__right');
  const orbButton = headerEl.querySelector('#home-button');
  const contentNodes = [left,right].filter(Boolean);

  const overlayScene = new T.Scene();
  const overlayCamera = new T.OrthographicCamera(-1,1,1,-1,-10,10);
  overlayCamera.position.z = 2;

  const capture = new T.FramebufferTexture(16,16);
  capture.minFilter = T.LinearFilter;
  capture.magFilter = T.LinearFilter;
  capture.generateMipmaps = false;
  capture.flipY = false;

  const uniforms = {
    uScene:{value:capture},
    uSize:{value:new T.Vector2(44,44)},
    uProgress:{value:0},
    uVelocity:{value:0},
    uTime:{value:0},
    uSceneVFlip:{value:0},
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

  let current=0, target=0, velocity=0, wobble=0, raf=0, last=0, time=0;
  let hovering=false, focusWithin=false, collapseTimer=0;
  let cssW=innerWidth, cssH=innerHeight, currentWidth=44, currentHeight=44;
  let captureW=16,captureH=16,captureX=0,captureY=0;
  const drawSize=new T.Vector2();
  const raycaster=new T.Raycaster();
  const floorPlane=new T.Plane(new T.Vector3(0,1,0),.014);
  const hitL=new T.Vector3(), hitR=new T.Vector3(), hitC=new T.Vector3();

  function ensureCapture(){
    renderer.getDrawingBufferSize(drawSize);
    const dpr=renderer.getPixelRatio();
    const wantedW=Math.max(64,Math.min(Math.floor(drawSize.x),2048));
    const wantedH=Math.max(64,Math.min(Math.floor(132*dpr),Math.floor(drawSize.y)));
    if(capture.image.width!==wantedW || capture.image.height!==wantedH){
      capture.dispose();
      capture.image.width=wantedW; capture.image.height=wantedH; capture.needsUpdate=true;
    }
    captureW=wantedW;captureH=wantedH;
    captureX=Math.max(0,Math.floor((drawSize.x-captureW)*0.5));
    captureY=Math.max(0,Math.floor(drawSize.y-captureH-Math.floor(4*dpr)));
  }

  function syncOverlayCamera(){
    cssW=innerWidth;cssH=innerHeight;
    overlayCamera.left=-cssW/2;overlayCamera.right=cssW/2;
    overlayCamera.top=cssH/2;overlayCamera.bottom=-cssH/2;
    overlayCamera.updateProjectionMatrix();
  }

  function screenRayToFloor(x,y,out){
    const ndc=new T.Vector2(x/cssW*2-1,1-y/cssH*2);
    raycaster.setFromCamera(ndc,camera);
    return raycaster.ray.intersectPlane(floorPlane,out);
  }

  function updateDeskFeedback(progress){
    if(!floorReflection?.setUICaustic)return;
    const top=22;
    const y=top+currentHeight+7;
    const half=currentWidth*0.47;
    const cx=cssW*0.5;
    const l=screenRayToFloor(cx-half,y,hitL);
    const r=screenRayToFloor(cx+half,y,hitR);
    const c=screenRayToFloor(cx,y,hitC);
    if(!l||!r||!c){floorReflection.setUICaustic(0,0,1,0,0,1,0);return;}
    const dx=r.x-l.x,dz=r.z-l.z,len=Math.max(.05,Math.hypot(dx,dz));
    const ax=dx/len,az=dz/len;
    floorReflection.setUICaustic(c.x,c.z,ax,az,len*.50,Math.max(.12,.16+.08*progress),.10+.10*progress);
  }

  function apply(progress,motion){
    const p=smooth(progress);
    const expanded=Math.min(cssW-64,1680);
    currentWidth=T.MathUtils.lerp(44,expanded,p);
    currentHeight=T.MathUtils.lerp(44,54,p);
    mesh.scale.set(currentWidth,currentHeight,1);
    mesh.position.set(0,cssH/2-22-currentHeight/2,0);
    uniforms.uSize.value.set(currentWidth,currentHeight);
    uniforms.uProgress.value=p;
    uniforms.uVelocity.value=motion;
    uniforms.uTime.value=time;

    headerEl.style.width=`${currentWidth}px`;
    headerEl.style.height=`${currentHeight}px`;
    headerEl.style.top='22px';
    headerEl.style.setProperty('--reveal',p.toFixed(4));
    headerEl.dataset.mode=p>.52?'expanded':'collapsed';

    const contentReveal=clamp01((p-.42)/.42);
    contentNodes.forEach((node,index)=>{
      node.style.opacity=contentReveal.toFixed(4);
      node.style.transform=`translateY(${((1-contentReveal)*(index?5:7)).toFixed(2)}px)`;
      node.style.pointerEvents=contentReveal>.78?'auto':'none';
    });
    if(orbButton){
      const orbReveal=clamp01((p-.52)/.34);
      orbButton.style.opacity=orbReveal.toFixed(4);
      orbButton.style.pointerEvents=p>.70?'auto':'none';
      orbButton.style.transform=`translateY(-50%) scale(${(0.94+.06*orbReveal).toFixed(4)})`;
    }
    updateDeskFeedback(p);
  }

  function step(now){
    raf=0;
    const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;time+=dt;
    if(reducedMotion){current=target;velocity=0;wobble=0;}else{
      const stiffness=44,damping=12.5;
      velocity+=(target-current)*stiffness*dt;
      velocity*=Math.exp(-damping*dt);
      current+=velocity*dt;
      current=clamp(current,-.015,1.015);
      wobble=T.MathUtils.lerp(wobble,Math.min(1,Math.abs(velocity)*1.8),1-Math.pow(.18,dt*60));
      if(Math.abs(target-current)<.0007&&Math.abs(velocity)<.0007){current=target;velocity=0;wobble*=.65;}
    }
    apply(clamp01(current),wobble);
    invalidate?.(false);
    if(Math.abs(target-current)>.0007||Math.abs(velocity)>.0007||wobble>.002||hovering||focusWithin)raf=requestAnimationFrame(step);
  }
  function wake(){if(!raf)raf=requestAnimationFrame(step);}
  function setTarget(v){target=clamp01(v);wake();}

  const onEnter=()=>{clearTimeout(collapseTimer);hovering=true;setTarget(1);};
  const onLeave=()=>{hovering=false;clearTimeout(collapseTimer);collapseTimer=setTimeout(()=>{if(!focusWithin)setTarget(0);},120);};
  const onFocusIn=()=>{focusWithin=true;clearTimeout(collapseTimer);setTarget(1);};
  const onFocusOut=()=>{focusWithin=headerEl.contains(document.activeElement);if(!focusWithin&&!hovering)collapseTimer=setTimeout(()=>setTarget(0),100);};
  headerEl.addEventListener('pointerenter',onEnter);
  headerEl.addEventListener('pointerleave',onLeave);
  headerEl.addEventListener('focusin',onFocusIn);
  headerEl.addEventListener('focusout',onFocusOut);

  function syncLayout(){syncOverlayCamera();ensureCapture();apply(clamp01(current),wobble);}
  syncLayout();

  return {
    syncLayout,
    renderOverlay(){
      ensureCapture();
      renderer.copyFramebufferToTexture(capture,new T.Vector2(captureX,captureY));
      const oldAuto=renderer.autoClear;renderer.autoClear=false;
      renderer.clearDepth();
      renderer.render(overlayScene,overlayCamera);
      renderer.autoClear=oldAuto;
    },
    expand(){clearTimeout(collapseTimer);setTarget(1);},
    collapse(){if(!hovering&&!focusWithin)setTarget(0);},
    dispose(){
      clearTimeout(collapseTimer);
      headerEl.removeEventListener('pointerenter',onEnter);
      headerEl.removeEventListener('pointerleave',onLeave);
      headerEl.removeEventListener('focusin',onFocusIn);
      headerEl.removeEventListener('focusout',onFocusOut);
      if(raf)cancelAnimationFrame(raf);
      floorReflection?.setUICaustic?.(0,0,1,0,0,1,0);
      mesh.geometry.dispose();material.dispose();capture.dispose();
    }
  };
}
