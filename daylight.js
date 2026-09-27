// Lightweight local solar approximation. It uses the visitor's local clock by
// default and improves the sun angle when geolocation permission is already granted;
// it never opens an unsolicited location prompt.
function dayOfYear(date){
 const start=new Date(date.getFullYear(),0,0);
 return Math.floor((date-start)/86400000);
}
function solarAltitude(date,coords){
 if(!coords){
  const h=date.getHours()+date.getMinutes()/60;
  return Math.sin(Math.PI*(h-6)/12);
 }
 const n=dayOfYear(date);
 const decl=-23.44*Math.cos(2*Math.PI*(n+10)/365)*Math.PI/180;
 const lat=coords.latitude*Math.PI/180;
 const solarHour=(date.getUTCHours()+date.getUTCMinutes()/60+coords.longitude/15+24)%24;
 const hourAngle=(solarHour-12)*15*Math.PI/180;
 return Math.sin(lat)*Math.sin(decl)+Math.cos(lat)*Math.cos(decl)*Math.cos(hourAngle);
}
export function localLightProfile(date=new Date(),coords=null){
 const altitude=solarAltitude(date,coords);
 const day=altitude>-.04;
 const localHour=date.getHours()+date.getMinutes()/60;
 const edge=Math.max(0,1-Math.min(1,Math.abs(localHour-12)/6));
 const warm=Math.max(0,1-Math.max(0,altitude)*2.2);
 return {
  day,
  keyColor:day?(warm>.55?0xffe5bd:0xfff8e9):0x9bbcff,
  fillColor:day?0xeaf2ff:0x748fc8,
  windowColor:day?0xffefd1:0x9fc2ff,
  keyIntensity:day?.88:.48,
  windowIntensity:day?.34:.20,
  angle:(localHour-12)*.035,
  keyX:TClamp((localHour-12)*1.05,-7,7),
  keyZ:day?5.8:3.2,
  ambient:day?.30:.20,
  edge
 };
}
function TClamp(v,a,b){return Math.max(a,Math.min(b,v));}

export async function resolveLocalLightProfile(){
 let coords=null;
 try{
  if(typeof navigator!=='undefined'&&navigator.permissions&&navigator.geolocation){
   const permission=await navigator.permissions.query({name:'geolocation'});
   if(permission.state==='granted'){
    coords=await new Promise(resolve=>navigator.geolocation.getCurrentPosition(
     p=>resolve({latitude:p.coords.latitude,longitude:p.coords.longitude}),
     ()=>resolve(null),{maximumAge:3600000,timeout:900}
    ));
   }
  }
 }catch{}
 return localLightProfile(new Date(),coords);
}
