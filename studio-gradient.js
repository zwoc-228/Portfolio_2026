import * as T from './assets/three.module.js';

const clamp01=value=>Math.max(0,Math.min(1,value));
const mix=(a,b,t)=>a+(b-a)*t;
let cachedPixels;

function sampleStops(stops,t){
 t=clamp01(t);
 for(let i=1;i<stops.length;i++){
  const [position,value]=stops[i];
  if(t<=position){
   const [previousPosition,previousValue]=stops[i-1];
   return mix(previousValue,value,(t-previousPosition)/(position-previousPosition));
  }
 }
 return stops.at(-1)[1];
}

// Generate the studio sweep as raw texture data rather than through a DOM canvas.
// This keeps the backdrop usable by Node-based validation, SSR, and the browser.
export function createStudioGradientTexture(){
 const width=1024,height=1024,data=cachedPixels??new Uint8Array(width*height*4);
 if(!cachedPixels){
 const redStops=[[0,217],[.42,238],[.58,241],[1,201]];
 const greenStops=redStops;
 const blueStops=redStops;

 for(let y=0;y<height;y++){
  const v=y/(height-1);
  for(let x=0;x<width;x++){
   const u=x/(width-1);
   let red=sampleStops(redStops,v);
   let green=sampleStops(greenStops,v);
   let blue=sampleStops(blueStops,v);

   const glowDistance=Math.hypot(u-.5,v-.46);
   const glowT=clamp01((glowDistance-.02)/(.75-.02));
   const glowAlpha=glowT<=.5
    ?mix(.55,.16,glowT/.5)
    :mix(.16,0,(glowT-.5)/.5);
   red=mix(red,255,glowAlpha);
   green=mix(green,255,glowAlpha);
   blue=mix(blue,255,glowAlpha);

   const vignetteDistance=Math.hypot(u-.5,v-.5);
   const vignetteAlpha=.1*clamp01((vignetteDistance-.55)/(.78-.55));
   red*=1-vignetteAlpha;
   green*=1-vignetteAlpha;
   blue*=1-vignetteAlpha;

   const offset=(y*width+x)*4;
   data[offset]=Math.round(red);
   data[offset+1]=Math.round(green);
   data[offset+2]=Math.round(blue);
   data[offset+3]=255;
  }
 }
 cachedPixels=data;
 }

 const texture=new T.DataTexture(data,width,height,T.RGBAFormat,T.UnsignedByteType);
 texture.colorSpace=T.SRGBColorSpace;
 texture.flipY=true;
 texture.needsUpdate=true;
 return texture;
}
