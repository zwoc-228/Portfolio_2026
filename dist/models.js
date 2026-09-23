import * as T from './assets/three.module.js';
import {RoundedBoxGeometry} from './assets/RoundedBoxGeometry.js';
export function createModels(textures={}){
const mat=(name,color,roughness=0.7,metalness=0,extra={})=>{let m=new T.MeshPhysicalMaterial({color,roughness,metalness,...Object.fromEntries(Object.entries(extra).filter(([k,v])=>v!==undefined))});m.name=name;return m;};
const linen=mat('Linen',0xeeeae2,.78,0,{map:textures.linenColor,roughnessMap:textures.linenRough,normalMap:textures.linenNormal,bumpMap:textures.linen,bumpScale:.0010,normalScale:new T.Vector2(.16,.16),sheen:.12,sheenColor:new T.Color(0xf0ece4),sheenRoughness:.86,clearcoat:.010,clearcoatRoughness:.92,specularIntensity:.26});
const paper=mat('Paper',0xf0ede5,.82,0,{map:textures.paperColor,roughnessMap:textures.paperRough,normalMap:textures.paperNormal,bumpMap:textures.paper,bumpScale:.00024,normalScale:new T.Vector2(.10,.10),ior:1.38,specularIntensity:.25,sheen:.025,sheenColor:new T.Color(0xf7f4ed),sheenRoughness:.92});
const edge=mat('Page edges',0xe0dbd1,.86,0,{map:textures.paperColor,roughnessMap:textures.paperRough,normalMap:textures.paperNormal,bumpMap:textures.paper,bumpScale:.00013,normalScale:new T.Vector2(.065,.065),ior:1.37,specularIntensity:.22});
// Opaque cast resin retains volume on both views without a transmission material swap.
const glass=mat('Pale cast resin',0xcbd9d7,.40,0,{ior:1.42,specularIntensity:.32,clearcoat:.01});
const frosted=mat('Chalk resin',0xe0e4df,.70,0,{specularIntensity:.25});
const copper=mat('Satin copper',0xb5957e,.46,.72,{clearcoat:.012});
const steel=mat('Paperclip stainless steel',0xd8dbdd,.18,1,{roughnessMap:textures.steelRough,clearcoat:.14,clearcoatRoughness:.18});
const ink=mat('Printed paper',0xffffff,.95,0,{map:textures.print,roughnessMap:textures.paperRough,normalMap:textures.paperNormal,normalScale:new T.Vector2(.08,.08)});
function texClone(t,repeat=1){if(!t)return t;const c=t.clone();c.wrapS=c.wrapT=T.RepeatWrapping;c.repeat.copy(new T.Vector2(repeat,repeat));c.offset.set(0,0);c.center.set(.5,.5);c.rotation=0;c.needsUpdate=true;return c;}
const writingClothColor=texClone(textures.linenColor,1.45);
const writingClothRough=texClone(textures.linenRough,1.45);
const writingClothNormal=texClone(textures.linenNormal,1.45);
const architectureStone=mat('Warm handmade plaster',0xeeeae2,.78,0,{ior:1.38,specularIntensity:.28,clearcoat:.012});
const architectureInset=mat('Unglazed clay inset',0xd9d6ce,.86,0,{specularIntensity:.23});
const architectureMetal=mat('Satin graphite',0x6c7474,.50,.55,{specularIntensity:.35});
function box(g,name,w,h,d,x,y,z,m,r=.014){const mesh=new T.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)),m);mesh.name=name;mesh.position.set(x,y,z);// Give each transparent solid its own optical path length.
if(m.transmission>0){mesh.material=m.clone();mesh.material.thickness=Math.min(w,h,d);}

mesh.castShadow=!(m.transmission>.5);mesh.receiveShadow=true;g.add(mesh);return mesh;}
function tube(g,name,points,r,m){let c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));let mesh=new T.Mesh(new T.TubeGeometry(c,name.startsWith('Binding')?12:128,r,name.startsWith('Binding')?6:12,false),m);mesh.name=name;mesh.castShadow=true;g.add(mesh);return mesh;}
const writing=new T.Group();writing.name='Writing';
function revealableMaterial(name,opts,closed,opened){
 const m=new T.MeshPhysicalMaterial(Object.fromEntries(Object.entries(opts).filter(([,v])=>v!==undefined)));m.name=name;
 m.userData.revealClosed=closed;m.userData.revealOpen=opened;m.userData.revealValue=0;
 m.onBeforeCompile=shader=>{
  shader.uniforms.uReveal={value:0};m.userData.revealUniform=shader.uniforms.uReveal;
  shader.fragmentShader='uniform float uReveal;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb=mix(diffuseColor.rgb*vec3(0.985,0.980,0.970),diffuseColor.rgb,uReveal);');
 };
 m.customProgramCacheKey=()=>name+'-reveal-v2';
 return m;
}
const writingCover=revealableMaterial('Writing cover cloth',{
 color:0xf2efe8,map:writingClothColor,roughness:.78,roughnessMap:writingClothRough,metalness:0,normalMap:writingClothNormal,normalScale:new T.Vector2(.042,.042),sheen:.11,sheenColor:new T.Color(0xf2eee7),sheenRoughness:.78,clearcoat:.012,clearcoatRoughness:.90,specularIntensity:.25
 },{color:0xf0ede6,roughness:.82,normalScale:[.034,.034],sheen:.075,clearcoat:.01},{color:0xe9e5dd,roughness:.77,normalScale:[.12,.12],sheen:.14,clearcoat:.014});
const writingPaper=revealableMaterial('Writing paper',{
 color:0xf4f1ea,map:textures.writingPaperColor,roughness:.86,roughnessMap:textures.writingPaperRough,metalness:0,normalMap:textures.writingPaperNormal,normalScale:new T.Vector2(.035,.035),ior:1.38,specularIntensity:.23
 },{color:0xf2efe8,roughness:.89,normalScale:[.026,.026]},{color:0xeee9df,roughness:.86,normalScale:[.13,.13]});
const writingPageEdge=revealableMaterial('Writing page edge',{
 color:0xe9e4da,map:textures.writingPaperColor,roughness:.90,roughnessMap:textures.writingPaperRough,metalness:0,normalMap:textures.writingPaperNormal,normalScale:new T.Vector2(.026,.026),ior:1.37,specularIntensity:.20
 },{color:0xe9e4da,roughness:.92,normalScale:[.020,.020]},{color:0xe5dfd4,roughness:.89,normalScale:[.095,.095]});
const writingElastic=mat('Writing elastic',0xd9d6cf,.77,0,{normalMap:textures.writingPaperNormal,normalScale:new T.Vector2(.018,.018),specularIntensity:.22});

const lowerCover=box(writing,'Lower linen cover',2.55,.048,3.20,0,.035,0,writingCover,.024);
const pageBlock=box(writing,'Page block',2.39,.154,3.02,.025,.137,0,writingPageEdge,.018);
// Only two broad sheets remain as real geometry. This avoids sub-pixel parallel edges and moire at HOME scale.
box(writing,'Lower visible sheet',2.405,.010,3.035,.025,.073,0,writingPaper,.004);
box(writing,'Upper visible sheet',2.405,.010,3.035,.025,.202,0,writingPaper,.004);
const upperCover=box(writing,'Upper linen cover',2.55,.050,3.20,0,.239,0,writingCover,.023);
const cv=upperCover.geometry.attributes.position;for(let i=0;i<cv.count;i++){let x=cv.getX(i),z=cv.getZ(i);cv.setY(i,cv.getY(i)+.0052*Math.cos(z*1.33)*(1-(x/1.275)**2)+.0007*Math.sin(x*4.1));}upperCover.geometry.computeVertexNormals();
const spine=box(writing,'Rounded cloth spine',.112,.229,3.19,-1.25,.137,0,writingCover,.050);
const sp=spine.geometry.attributes.position;for(let i=0;i<sp.count;i++){const y=sp.getY(i),z=sp.getZ(i);sp.setX(i,sp.getX(i)-.009*Math.cos(y/.229*Math.PI)*Math.cos(z*.6));}spine.geometry.computeVertexNormals();
box(writing,'Spine end inset',.054,.133,.009,-1.241,.135,1.598,writingPageEdge,.009);
box(writing,'Spine hinge',.017,.003,3.14,-1.16,.263,0,writingPageEdge,.001);
const elasticUpper=box(writing,'Elastic upper band',.035,.013,3.19,1.04,.269,0,writingElastic,.006);
const elasticFore=box(writing,'Elastic fore edge',.035,.238,.022,1.04,.148,1.598,writingElastic,.008);
let verts=[],uv=[],idx=[];for(let i=0;i<=20;i++){let t=i/20;let z=1.40+t*.70;let yy=.11*(1-t)+.015+Math.sin(t*Math.PI)*.012;for(let side of [-1,1]){verts.push(-.93+side*.075+Math.sin(t*2)*.018,yy,z);uv.push(side===-1?0:1,t);}if(i<20){let q=i*2;idx.push(q,q+1,q+2,q+1,q+3,q+2);}}
let rg=new T.BufferGeometry();rg.setAttribute('position',new T.Float32BufferAttribute(verts,3));rg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));rg.setIndex(idx);rg.computeVertexNormals();let ribbon=new T.Mesh(rg,writingCover);ribbon.material=writingCover;ribbon.material.side=T.DoubleSide;ribbon.name='Woven bookmark ribbon';ribbon.castShadow=true;writing.add(ribbon);
writing.userData.writingController={revealCurrent:0,materials:[writingCover,writingPaper,writingPageEdge]};
const architecture=new T.Group();architecture.name='Architecture';
box(architecture,'Mineral plinth',3.24,.22,2.84,0,.11,0,architectureStone,.024);
box(architecture,'Rear mineral tower',.76,1.34,.76,.08,.89,-.36,architectureStone,.030);
box(architecture,'Main cantilever slab',1.12,.08,.56,.78,1.02,-.02,architectureStone,.016);
box(architecture,'Front mineral podium',1.02,.40,.84,-.10,.42,.76,architectureInset,.024);
box(architecture,'Low mineral shelf',.88,.075,.60,-.80,.58,.16,architectureStone,.014);
box(architecture,'Left frosted tower',.64,.98,.68,-.90,.72,-.04,frosted,.016);
box(architecture,'Left clear volume',.40,.40,.44,-.96,.25,.82,glass,.012);
box(architecture,'Center clear fin',.16,.48,.18,.12,.35,.26,glass,.008);
box(architecture,'Clear bridge',.42,.06,.20,.06,.58,.26,glass,.006);
box(architecture,'Copper anchor',.60,.46,.46,.88,.45,.02,copper,.010);
box(architecture,'Graphite base',.74,.46,.74,.92,.46,.82,architectureMetal,.014);
box(architecture,'Smoked glass cap',.70,.22,.70,.92,.80,.82,mat('Smoky cast resin',0xa9b9bb,.38,0,{ior:1.42,specularIntensity:.32}),.014);
// Studio lighting and cavity shading are baked from this exact geometry in Blender Cycles.

const research=new T.Group();research.name='Research';
// Anti-moire paper construction: one continuous page block carries the edge mass,
// while only a handful of broad leaves create visible layering. This avoids the dozens
// of sub-pixel parallel edge bands that produced the previous "mosaic" shimmer.
const researchPageBlock=box(research,'Research page block',2.76,.116,3.36,0,.070,0,edge,.015);
researchPageBlock.castShadow=true;researchPageBlock.receiveShadow=true;
for(let i=0;i<5;i++){
 const sheet=box(research,'Research visible leaf '+i,2.765,.0072,3.365,
  (i-2)*.013,.130+i*.009,(2-i)*.012,paper,.0065);
 sheet.rotation.y=(i-2)*.0025;sheet.rotation.z=(2-i)*.0015;sheet.castShadow=true;sheet.receiveShadow=true;
}
// Top leaf gets one subtle, low-frequency bow; there are no tessellated side walls to alias.
const pg=new T.PlaneGeometry(2.765,3.365,12,14);pg.rotateX(-Math.PI/2);const pa=pg.attributes.position;
for(let i=0;i<pa.count;i++){
 const x=pa.getX(i),z=pa.getZ(i),edgeX=Math.pow(Math.abs(x)/1.3825,4),edgeZ=Math.pow(Math.abs(z)/1.6825,5);
 pa.setY(i,.177+.0062*edgeX+.0038*edgeZ+.0010*Math.sin(z*1.65)*(x/1.3825));
}
pg.computeVertexNormals();const top=new T.Mesh(pg,paper);top.name='Top research leaf';top.receiveShadow=true;top.castShadow=true;research.add(top);
// A smooth double-loop wire clip: open tips, straight legs, round bends.
const curl=(x,z)=>.0050*Math.pow(Math.abs(x)/1.3825,4)+.0030*Math.pow(Math.abs(z)/1.6825,5)+.0012*Math.sin(z*1.8)*(x/1.3825);
const cp=[];const cy=.202;for(let i=0;i<=12;i++){let a=Math.PI+i/12*Math.PI;cp.push([1.065+Math.cos(a)*.094,cy,-1.545+Math.sin(a)*.094]);}cp.push([1.159,cy,-1.07]);for(let i=0;i<=12;i++){let a=i/12*Math.PI;cp.push([1.081+Math.cos(a)*.078,cy,-1.07+Math.sin(a)*.078]);}cp.push([1.003,cy,-1.49]);for(let i=0;i<=12;i++){let a=Math.PI+i/12*Math.PI;cp.push([1.063+Math.cos(a)*.060,cy+.004,-1.49+Math.sin(a)*.060]);}cp.push([1.123,cy+.004,-1.16]);
for(const [i,p] of cp.entries()){
 // Round 36: move the clip to the actual upper-right paper edge instead of the page interior.
 // Keep the whole wire just inside the leaf boundary so it still reads as physically clipped-on.
 p[0]=1.185+(p[0]-1.065)*.72;
 p[2]=-1.430+(p[2]+1.30)*.72;
 p[1]=.177+curl(p[0],p[2])+.0075+.0014*Math.sin(i/(cp.length-1)*Math.PI);
}
tube(research,'Bent steel paperclip',cp,.0050,steel);
return [writing,architecture,research];}
