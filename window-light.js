import * as T from './assets/three.module.js';

// A single restrained window-shaped wash for the rear sweep. It is emissive-only:
// no extra shadow pass, texture upload or per-frame render target is required.
export function createWindowLight(){
 const uniforms={
  uColor:{value:new T.Color(0xffefd1)},
  uStrength:{value:.3},
  uAngle:{value:-.12}
 };
 const material=new T.ShaderMaterial({
  uniforms,transparent:true,depthWrite:false,depthTest:true,
  blending:T.AdditiveBlending,toneMapped:true,
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`precision mediump float;
uniform vec3 uColor;uniform float uStrength;uniform float uAngle;varying vec2 vUv;
float softBox(vec2 p,vec2 halfSize,float softness){
 vec2 q=abs(p)-halfSize;
 float outside=length(max(q,0.));
 return 1.-smoothstep(0.,softness,outside);
}
void main(){
 vec2 p=vUv-.5;
 float c=cos(uAngle),s=sin(uAngle);
 p=mat2(c,-s,s,c)*p;
 // Two simple panes, no frame decoration; the narrow gap only suggests a window source.
 float left=softBox(p-vec2(-.135,.015),vec2(.115,.31),.045);
 float right=softBox(p-vec2(.135,.015),vec2(.115,.31),.045);
 float shape=max(left,right);
 float vertical=mix(.78,1.0,smoothstep(-.5,.45,p.y));
 float alpha=shape*vertical*uStrength;
 gl_FragColor=vec4(uColor,alpha);
}`,
  side:T.DoubleSide
 });
 const mesh=new T.Mesh(new T.PlaneGeometry(11.5,7.2),material);
 mesh.name='Simple local-time window light';
 mesh.position.set(-1.4,5.15,-5.265);
 mesh.renderOrder=0;
 return {
  mesh,
  setProfile(profile){
   uniforms.uColor.value.setHex(profile.windowColor);
   uniforms.uStrength.value=profile.windowIntensity;
   uniforms.uAngle.value=profile.angle;
  }
 };
}
