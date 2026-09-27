import * as T from './assets/three.module.js';

// Node-safe studio gradient. A small DataTexture avoids browser-only canvas APIs
// and is bilinearly enlarged by the GPU, producing a continuous backdrop without bands.
export function createStudioGradientTexture({top=0xc9cccf,middle=0xe5e5e3,bottom=0xd1d2d2}={}){
  const width=128,height=256,data=new Uint8Array(width*height*4);
  const a=new T.Color(top),b=new T.Color(middle),c=new T.Color(bottom),color=new T.Color();
  for(let y=0;y<height;y++){
    const v=y/(height-1);
    const t=v<.58?v/.58:(v-.58)/.42;
    color.copy(v<.58?a:b).lerp(v<.58?b:c,t*t*(3-2*t));
    for(let x=0;x<width;x++){
      const nx=(x/(width-1)-.5)*2;
      const vignette=.035*nx*nx;
      const i=(y*width+x)*4;
      data[i]=Math.round(255*Math.max(0,color.r-vignette));
      data[i+1]=Math.round(255*Math.max(0,color.g-vignette));
      data[i+2]=Math.round(255*Math.max(0,color.b-vignette));
      data[i+3]=255;
    }
  }
  const texture=new T.DataTexture(data,width,height,T.RGBAFormat,T.UnsignedByteType);
  texture.colorSpace=T.SRGBColorSpace;
  texture.minFilter=T.LinearFilter;
  texture.magFilter=T.LinearFilter;
  texture.generateMipmaps=false;
  texture.needsUpdate=true;
  return texture;
}
