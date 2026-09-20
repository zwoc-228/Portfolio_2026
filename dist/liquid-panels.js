import * as T from './assets/three.module.js';
import { FRAME_ACTIVE, FRAME_RENDER } from './frame-runtime.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

const vertexShader = `
varying vec2 vUv;
void main(){
  vUv=uv;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}`;

const fragmentShader = `
precision highp float;
uniform sampler2D uScene;
uniform vec2 uSize;
uniform float uReveal;
uniform float uTone;
uniform float uVelocity;
uniform float uTime;
varying vec2 vUv;

float sdRoundBox(vec2 p, vec2 b, float r){
  vec2 q=abs(p)-b+r;
  return length(max(q,vec2(0.0)))+min(max(q.x,q.y),0.0)-r;
}
float hmap(vec2 p,vec2 b,float r,float bevel){
  float d=sdRoundBox(p,b,r);
  float inside=clamp(-d/max(bevel,.001),0.0,1.0);
  return smoothstep(0.0,1.0,inside);
}
void main(){
  vec2 p=(vUv-.5)*uSize;
  vec2 halfSize=max(uSize*.5-vec2(1.2),vec2(1.0));
  float radius=min(30.0,min(uSize.x,uSize.y)*.16);
  float d=sdRoundBox(p,halfSize,radius);
  float alpha=(1.0-smoothstep(-1.2,1.2,d))*uReveal;
  if(alpha<.002) discard;

  float bevel=13.0;
  float h=hmap(p,halfSize,radius,bevel);
  float hx=hmap(p+vec2(1.0,0.0),halfSize,radius,bevel)-hmap(p-vec2(1.0,0.0),halfSize,radius,bevel);
  float hy=hmap(p+vec2(0.0,1.0),halfSize,radius,bevel)-hmap(p-vec2(0.0,1.0),halfSize,radius,bevel);
  vec3 normal=normalize(vec3(-hx*4.9,-hy*4.9,1.0));

  float speed=clamp(abs(uVelocity)*2.2,0.0,1.0);
  float wobble=sin((vUv.x*1.8+vUv.y*.65+uTime*.08)*6.2831853)*speed*.0028;
  vec2 offset=normal.xy*(.015+.006*uTone)+vec2(wobble,0.0);
  vec3 refracted;
  refracted.r=texture2D(uScene,vUv+offset*1.14).r;
  refracted.g=texture2D(uScene,vUv+offset).g;
  refracted.b=texture2D(uScene,vUv+offset*.86).b;

  float edge=1.0-h;
  float rim=smoothstep(.60,1.0,edge);
  float fresnel=pow(clamp(1.0-normal.z,0.0,1.0),2.6);
  float top=smoothstep(.18,1.0,1.0-vUv.y)*(.08+.04*uTone);
  vec3 tint=mix(vec3(.965,.985,1.0),vec3(.90,.955,.985),uTone*.32);
  vec3 color=refracted*tint;
  color+=vec3(1.0)*(rim*(.18+.04*uTone)+fresnel*.13+top);
  color+=vec3(.93,.98,1.0)*speed*edge*.05;
  float body=.28+.07*uTone;
  gl_FragColor=vec4(color,alpha*(body+rim*.19+fresnel*.05));
}`;

function visibleElement(el){
  if(!el)return false;
  if(el.matches('dialog'))return !!el.open;
  if(el.hidden||!el.getClientRects().length)return false;
  const style=getComputedStyle(el);
  return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity||1)>.01;
}

function createPanel(renderer,overlayScene,spec){
  const el=document.querySelector(spec.selector);
  const uniforms={
    uScene:{value:null},uSize:{value:new T.Vector2(1,1)},uReveal:{value:0},uTone:{value:spec.tone||0},uVelocity:{value:0},uTime:{value:0}
  };
  let capture=new T.FramebufferTexture(16,16);
  capture.minFilter=T.LinearFilter;capture.magFilter=T.LinearFilter;capture.generateMipmaps=false;capture.flipY=false;
  uniforms.uScene.value=capture;
  const material=new T.ShaderMaterial({uniforms,vertexShader,fragmentShader,transparent:true,depthTest:false,depthWrite:false,toneMapped:false});
  const mesh=new T.Mesh(new T.PlaneGeometry(1,1),material);
  mesh.renderOrder=1100+(spec.order||0);
  mesh.visible=false;
  overlayScene.add(mesh);

  const rect={left:0,top:0,width:1,height:1,bottom:1};
  const drawSize=new T.Vector2();
  let reveal=0,target=0,velocity=0,time=0,dirty=true;
  let captureX=0,captureY=0;

  function ensureCapture(){
    renderer.getDrawingBufferSize(drawSize);
    const dpr=renderer.getPixelRatio();
    const w=Math.max(4,Math.min(Math.round(rect.width*dpr),Math.floor(drawSize.x)));
    const h=Math.max(4,Math.min(Math.round(rect.height*dpr),Math.floor(drawSize.y)));
    if(capture.image.width!==w||capture.image.height!==h){
      const old=capture;
      capture=new T.FramebufferTexture(w,h);
      capture.minFilter=T.LinearFilter;capture.magFilter=T.LinearFilter;capture.generateMipmaps=false;capture.flipY=false;
      uniforms.uScene.value=capture;old.dispose();
    }
    captureX=Math.max(0,Math.min(Math.floor(rect.left*dpr),Math.floor(drawSize.x)-w));
    captureY=Math.max(0,Math.min(Math.floor(drawSize.y-(rect.top+rect.height)*dpr),Math.floor(drawSize.y)-h));
  }

  function syncRect(cssW,cssH){
    const active=visibleElement(el);target=active?1:0;
    if(!active||!el){dirty=false;return;}
    const r=el.getBoundingClientRect();
    if(r.width<2||r.height<2){target=0;dirty=false;return;}
    rect.left=r.left;rect.top=r.top;rect.width=r.width;rect.height=r.height;rect.bottom=r.bottom;
    uniforms.uSize.value.set(r.width,r.height);
    const cx=r.left+r.width*.5-cssW*.5;
    const cy=cssH*.5-(r.top+r.height*.5);
    mesh.position.set(cx,cy,0);
    ensureCapture();dirty=false;
  }

  function update(dt,cssW,cssH){
    if(dirty)syncRect(cssW,cssH);
    time+=dt;
    if(reducedMotion){reveal=target;velocity=0;}else{
      const stiffness=30,damping=10.5;
      velocity+=(target-reveal)*stiffness*dt;
      velocity*=Math.exp(-damping*dt);
      reveal+=velocity*dt;reveal=clamp01(reveal);
      if(Math.abs(target-reveal)<.001&&Math.abs(velocity)<.001){reveal=target;velocity=0;}
    }
    const intro=.92+reveal*.08;
    const drift=(1-reveal)*(spec.slidePx||16)*(spec.direction||1);
    const baseX=rect.left+rect.width*.5-cssW*.5;
    const baseY=cssH*.5-(rect.top+rect.height*.5);
    mesh.position.set(baseX+(spec.axis==='x'?drift:0),baseY+(spec.axis==='y'?drift:0),0);
    mesh.scale.set(Math.max(.001,rect.width*intro),Math.max(.001,rect.height*intro),1);
    uniforms.uReveal.value=reveal;
    uniforms.uVelocity.value=velocity;
    uniforms.uTime.value=time;
    mesh.visible=reveal>.003;
    return Math.abs(reveal-target)>.001||Math.abs(velocity)>.001;
  }

  return {
    markDirty(){dirty=true;},
    syncRect,
    update,
    captureBackground(){if(!mesh.visible)return;ensureCapture();renderer.copyFramebufferToTexture(capture,new T.Vector2(captureX,captureY));},
    dispose(){overlayScene.remove(mesh);mesh.geometry.dispose();material.dispose();capture.dispose();}
  };
}

export function createLiquidPanels({renderer,runtime}){
  const overlayScene=new T.Scene();
  const overlayCamera=new T.OrthographicCamera(-1,1,1,-1,-10,10);overlayCamera.position.z=2;
  const specs=[
    {selector:'.category-panel',tone:1,axis:'x',direction:-1,slidePx:18,order:0},
    {selector:'.index-content',tone:0,axis:'y',direction:-1,slidePx:16,order:1},
    {selector:'#info',tone:2,axis:'y',direction:-1,slidePx:14,order:2},
  ];
  const panels=specs.map(spec=>createPanel(renderer,overlayScene,spec));
  let cssW=innerWidth,cssH=innerHeight,dirty=true;

  function syncCamera(){
    cssW=innerWidth;cssH=innerHeight;
    overlayCamera.left=-cssW/2;overlayCamera.right=cssW/2;overlayCamera.top=cssH/2;overlayCamera.bottom=-cssH/2;overlayCamera.updateProjectionMatrix();
  }
  function sync(){syncCamera();panels.forEach(p=>p.syncRect(cssW,cssH));dirty=false;runtime?.request(FRAME_RENDER);}
  function markDirty(){dirty=true;panels.forEach(p=>p.markDirty());runtime?.request(FRAME_RENDER);}

  function update(dt){
    if(dirty){syncCamera();panels.forEach(p=>p.syncRect(cssW,cssH));dirty=false;}
    const active=panels.some(p=>p.update(dt,cssW,cssH));
    return FRAME_RENDER|(active?FRAME_ACTIVE:0);
  }
  const removeRuntime=runtime?.add(update)||(()=>{});

  const bodyObserver=new MutationObserver(markDirty);
  bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
  const category=document.querySelector('#category');
  const dialog=document.querySelector('#info');
  const categoryObserver=category?new MutationObserver(markDirty):null;
  categoryObserver?.observe(category,{attributes:true,attributeFilter:['hidden']});
  const dialogObserver=dialog?new MutationObserver(markDirty):null;
  dialogObserver?.observe(dialog,{attributes:true,attributeFilter:['open']});
  const ro=new ResizeObserver(markDirty);
  document.querySelectorAll('.category-panel,.index-content,#info').forEach(el=>ro.observe(el));
  sync();

  return {
    syncLayout:sync,
    captureBackground(){panels.forEach(p=>p.captureBackground());},
    renderOverlay(){
      const oldAuto=renderer.autoClear;renderer.autoClear=false;renderer.clearDepth();renderer.render(overlayScene,overlayCamera);renderer.autoClear=oldAuto;
    },
    dispose(){removeRuntime();bodyObserver.disconnect();categoryObserver?.disconnect();dialogObserver?.disconnect();ro.disconnect();panels.forEach(p=>p.dispose());}
  };
}
