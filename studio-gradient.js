import * as T from './assets/three.module.js';

// Browser- and Node-safe neutral studio background. Kept deliberately subtle:
// the physical cyclorama and lights create the photographic falloff.
export function createStudioGradientTexture(){
 const w=128,h=128,data=new Uint8Array(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const u=x/(w-1),v=y/(h-1);
  const vertical=0.78+0.10*Math.exp(-Math.pow((v-.58)/.34,2));
  const vignette=1-.045*Math.pow(Math.abs(u-.5)*2,1.7);
  const value=Math.max(0,Math.min(255,Math.round(255*vertical*vignette)));
  const i=(y*w+x)*4;data[i]=value;data[i+1]=value;data[i+2]=value;data[i+3]=255;
 }
 const texture=new T.DataTexture(data,w,h,T.RGBAFormat,T.UnsignedByteType);
 texture.colorSpace=T.SRGBColorSpace;
 texture.minFilter=T.LinearFilter;texture.magFilter=T.LinearFilter;
 texture.generateMipmaps=false;texture.needsUpdate=true;
 return texture;
}
