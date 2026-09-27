import * as T from './assets/three.module.js';

// Node-safe fallback texture for tools/check.mjs and non-DOM rendering.
// The live scene now uses the physically lit cyclorama instead of this texture.
export function createStudioGradientTexture(){
 const w=256,h=256,data=new Uint8Array(w*h*4);
 for(let y=0;y<h;y++){
  const v=y/(h-1);
  for(let x=0;x<w;x++){
   const u=x/(w-1);
   const vertical=1.0-.055*Math.pow(Math.abs(v-.48)/.52,1.65);
   const edge=1.0-.022*Math.pow(Math.abs(u-.5)*2,2.2);
   const value=Math.round(218*vertical*edge);
   const i=(y*w+x)*4;
   data[i]=data[i+1]=data[i+2]=value;data[i+3]=255;
  }
 }
 const texture=new T.DataTexture(data,w,h,T.RGBAFormat);
 texture.colorSpace=T.SRGBColorSpace;
 texture.needsUpdate=true;
 return texture;
}
