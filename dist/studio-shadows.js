import * as T from './assets/three.module.js';
// Contact-hardening shadow map: blocker search + bounded disk filtering.
// Technique reference: Three.js webgl_shadowmap_pcss; implementation scoped to r170.
export function installStudioShadows(){
 const source=T.ShaderChunk.shadowmap_pars_fragment;
 if(source.includes('studioSoftShadow'))return;
 const helper=`
 vec2 studioDisk(int i, float count){
  float a=float(i)*2.39996323;
  return vec2(cos(a),sin(a))*sqrt((float(i)+.5)/count);
 }
 float studioSoftShadow(sampler2D map,vec3 coord,vec2 size){
  float sumDepth=0.;float blockers=0.;
  for(int i=0;i<8;i++){
   float d=unpackRGBAToDepth(texture2D(map,coord.xy+studioDisk(i,8.)*.018));
   if(d<coord.z-.00004){sumDepth+=d;blockers+=1.;}
  }
  if(blockers<.5)return texture2DCompare(map,coord.xy,coord.z);
  float separation=max(0.,coord.z-sumDepth/blockers);
  float radius=clamp(separation*.56,1.0/size.x,.022);
  float visibility=0.;
  for(int i=0;i<16;i++)visibility+=texture2DCompare(map,coord.xy+studioDisk(i,16.)*radius,coord.z);
  return visibility/16.;
 }
 `;
 const marker='#if defined( SHADOWMAP_TYPE_PCF )';
 const begin=source.indexOf(marker),end=source.indexOf('#elif defined( SHADOWMAP_TYPE_PCF_SOFT )',begin);
 if(begin<0||end<0)throw Error('Unexpected Three.js shadow shader revision');
 T.ShaderChunk.shadowmap_pars_fragment=(source.slice(0,begin)+marker+'\n shadow=studioSoftShadow(shadowMap,shadowCoord.xyz,shadowMapSize);\n'+source.slice(end)).replace('float getShadow(',helper+'\nfloat getShadow(');
}
