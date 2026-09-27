import * as T from './assets/three.module.js';

// Browser- and Node-safe, subtly dithered neutral backdrop texture.
// The gradient is intentionally broad: it supports the lighting without painting
// a visible horizon or horizontal band into the cyclorama.
export function createStudioGradientTexture(){
 const w=256,h=256,data=new Uint8Array(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const u=x/(w-1),v=y/(h-1);
  const dx=(u-.5)/.78,dy=(v-.47)/.92;
  const radial=Math.exp(-(dx*dx+dy*dy)*1.15);
  const vertical=.5-.5*Math.cos(Math.PI*v);
  const edge=Math.max(0,Math.hypot((u-.5)*1.28,(v-.5)*.72)-.42);
  const dither=(((x*13+y*17)&7)-3.5)*.18;
  const value=Math.max(0,Math.min(255,221+10*radial-7*vertical-8*edge+dither));
  const i=(y*w+x)*4;
  data[i]=data[i+1]=data[i+2]=value;data[i+3]=255;
 }
 const tex=new T.DataTexture(data,w,h,T.RGBAFormat,T.UnsignedByteType);
 tex.colorSpace=T.SRGBColorSpace;
 tex.minFilter=T.LinearFilter;tex.magFilter=T.LinearFilter;
 tex.generateMipmaps=false;tex.needsUpdate=true;
 return tex;
}
