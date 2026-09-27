import * as T from './assets/three.module.js';

// Browser- and Node-safe studio background texture. The very low-contrast,
// continuous falloff avoids visible bands while preserving a photographic
// softbox glow behind the physical cyclorama.
export function createStudioGradientTexture(){
 const w=512,h=512,data=new Uint8Array(w*h*4);
 const smooth=t=>t*t*(3-2*t);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const u=x/(w-1),v=y/(h-1);
  const dx=(u-.5)/.72,dy=(v-.43)/.88;
  const radial=smooth(Math.min(1,Math.sqrt(dx*dx+dy*dy)));
  const cove=Math.exp(-Math.pow((v-.24)/.24,2));
  const top=smooth(Math.max(0,(v-.68)/.32));
  const side=smooth(Math.min(1,Math.abs(u-.5)*2));
  const value=Math.round(205+18*cove-8*top-5*radial-3*side);
  const i=(y*w+x)*4;
  data[i]=data[i+1]=data[i+2]=Math.max(0,Math.min(255,value));data[i+3]=255;
 }
 const texture=new T.DataTexture(data,w,h,T.RGBAFormat,T.UnsignedByteType);
 texture.colorSpace=T.SRGBColorSpace;
 texture.minFilter=T.LinearFilter;texture.magFilter=T.LinearFilter;
 texture.generateMipmaps=false;texture.needsUpdate=true;
 return texture;
}
