import * as T from './assets/three.module.js';

// A single soft window-shaped wash: no frame, bars or decorative geometry.
export function createStudioDaylight(){
  const uniforms={
    uColor:{value:new T.Color(0xffead0)},
    uStrength:{value:.20},
    uShift:{value:-.12}
  };
  const material=new T.ShaderMaterial({
    uniforms,transparent:true,depthWrite:false,depthTest:true,toneMapped:false,
    blending:T.AdditiveBlending,
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform vec3 uColor;uniform float uStrength;uniform float uShift;varying vec2 vUv;
      void main(){
        vec2 p=vUv-.5;
        p.x+=p.y*.24+uShift;
        float x=1.-smoothstep(.31,.50,abs(p.x));
        float y=smoothstep(.02,.24,vUv.y)*(1.-smoothstep(.72,.99,vUv.y));
        float bloom=exp(-dot(vec2(p.x*.72,p.y*.56),vec2(p.x*.72,p.y*.56))*5.5);
        float a=(x*y*.48+bloom*.52)*uStrength;
        gl_FragColor=vec4(uColor,a);
      }`
  });
  const mesh=new T.Mesh(new T.PlaneGeometry(18,10),material);
  mesh.name='Soft window light on backdrop';
  mesh.position.set(0,4.25,-5.16);
  mesh.renderOrder=0;
  return {
    mesh,
    set({color,strength,shift=0}){uniforms.uColor.value.set(color);uniforms.uStrength.value=strength;uniforms.uShift.value=shift;}
  };
}
