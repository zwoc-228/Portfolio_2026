import * as T from './assets/three.module.js';

// Node-safe, subtly dithered neutral background. The visible studio surface is the
// continuous cyclorama; this texture only fills pixels outside that geometry.
export function createStudioGradientTexture(){
 const w=8,h=256,data=new Uint8Array(w*h*4);
 for(let y=0;y<h;y++){
  const v=y/(h-1);
  const base=194+Math.round(24*Math.exp(-Math.pow((v-.58)/.32,2))-7*v);
  for(let x=0;x<w;x++){
   const d=((x*17+y*13)%5)-2;
   const i=(y*w+x)*4,c=Math.max(0,Math.min(255,base+d));
   data[i]=data[i+1]=data[i+2]=c;data[i+3]=255;
  }
 }
 const tex=new T.DataTexture(data,w,h,T.RGBAFormat,T.UnsignedByteType);
 tex.colorSpace=T.SRGBColorSpace;
 tex.wrapS=tex.wrapT=T.ClampToEdgeWrapping;
 tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearFilter;
 tex.needsUpdate=true;
 return tex;
}
