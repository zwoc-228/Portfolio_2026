import * as T from './assets/three.module.js';
import {RoundedBoxGeometry} from './assets/RoundedBoxGeometry.js';
export function createModels(textures={}){
const mat=(name,color,roughness=0.7,metalness=0,extra={})=>{let m=new T.MeshPhysicalMaterial({color,roughness,metalness,...Object.fromEntries(Object.entries(extra).filter(([k,v])=>v!==undefined))});m.name=name;return m;};
const linen=mat('Linen',0xf1eee7,.76,0,{map:textures.linenColor,roughnessMap:textures.linenRough,normalMap:textures.linenNormal,bumpMap:textures.linen,bumpScale:.0012,normalScale:new T.Vector2(.22,.22),sheen:.22,sheenColor:new T.Color(0xf1ede6),sheenRoughness:.82,clearcoat:.012,clearcoatRoughness:.88});
const paper=mat('Paper',0xf5f2eb,.90,0,{map:textures.paperColor,roughnessMap:textures.paperRough,normalMap:textures.paperNormal,bumpMap:textures.paper,bumpScale:.00030,normalScale:new T.Vector2(.12,.12)});
const edge=mat('Page edges',0xe8e2d7,.88,0,{map:textures.paperColor,roughnessMap:textures.paperRough,normalMap:textures.paperNormal,bumpMap:textures.paper,bumpScale:.00014,normalScale:new T.Vector2(.07,.07)});
const glass=mat('Clear acrylic',0xfcfdfc,.05,0,{transmission:.99,ior:1.49,thickness:.92,attenuationColor:new T.Color(0xf7fbfb),attenuationDistance:8.2,clearcoat:.16,clearcoatRoughness:.06});
// Plastic013A is used without adding a new transparent-shader texture budget: only the existing
// single roughness slot is retained; its color/normal character is folded into scalar parameters.
const frosted=mat('Plastic013A frosted acrylic',0xeeeae8,.72,0,{roughnessMap:textures.archPlasticRough,transmission:.76,ior:1.47,thickness:.78,attenuationColor:new T.Color(0xf0ebe9),attenuationDistance:2.35,clearcoat:.08,clearcoatRoughness:.18});
// Metal044A informs the scalar metal response here; the textured Metal044A surface is reserved
// for the graphite block below so this accent does not gain extra texture lookups.
const copper=mat('Copper accent',0xc28f6f,.31,1,{anisotropy:.28,clearcoat:.06,clearcoatRoughness:.24});
const steel=mat('Paperclip stainless steel',0xd8dbdd,.18,1,{roughnessMap:textures.steelRough,clearcoat:.14,clearcoatRoughness:.18});
const ink=mat('Printed paper',0xffffff,.95,0,{map:textures.print,roughnessMap:textures.paperRough,normalMap:textures.paperNormal,normalScale:new T.Vector2(.08,.08)});
function texClone(t,repeat=1){if(!t)return t;const c=t.clone();c.wrapS=c.wrapT=T.RepeatWrapping;c.repeat.copy(new T.Vector2(repeat,repeat));c.offset.set(0,0);c.center.set(.5,.5);c.rotation=0;c.needsUpdate=true;return c;}
const writingClothColor=texClone(textures.linenColor,1.45);
const writingClothRough=texClone(textures.linenRough,1.45);
const writingClothNormal=texClone(textures.linenNormal,1.45);
const architectureStoneNormal=texClone(textures.archMarbleNormal,1.08);
// A quiet fired-clay maquette: texture affects micro-relief, never the silhouette or color.
// The former marble albedo made the architectural mass read as veined stone.
const architectureStone=mat('Warm porcelain architectural maquette',0xf0ede7,.54,0,{normalMap:architectureStoneNormal,normalScale:new T.Vector2(.085,.085),clearcoat:.23,clearcoatRoughness:.32,envMapIntensity:.92});
const architectureInset=mat('Unglazed mineral inset',0xdcd9d2,.83,0,{normalMap:architectureStoneNormal,normalScale:new T.Vector2(.13,.13),clearcoat:.035,clearcoatRoughness:.76});
const architectureMetalColor=texClone(textures.archMetalColor,1.24);
const architectureMetalRough=texClone(textures.archMetalRough,1.24);
const architectureMetalNormal=texClone(textures.archMetalNormal,1.24);
// Metal044A metalness is virtually solid white, so metalness stays scalar=1 and no metalness map
// is sampled. Displacement is baked into the normal map for the same reason.
const architectureMetal=mat('Metal044A graphite metal',0x737b7c,.78,1,{map:architectureMetalColor,roughnessMap:architectureMetalRough,normalMap:architectureMetalNormal,normalScale:new T.Vector2(.58,.58),clearcoat:.045,clearcoatRoughness:.30,anisotropy:.16});
function box(g,name,w,h,d,x,y,z,m,r=.014){const mesh=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),m);mesh.name=name;mesh.position.set(x,y,z);// Give each transparent solid its own optical path length.
if(m.transmission>0){mesh.material=m.clone();mesh.material.thickness=Math.min(w,h,d);}
mesh.castShadow=!(m.transmission>.5);mesh.receiveShadow=true;g.add(mesh);return mesh;}
function tube(g,name,points,r,m){let c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));let mesh=new T.Mesh(new T.TubeGeometry(c,name.startsWith('Binding')?12:128,r,name.startsWith('Binding')?6:12,false),m);mesh.name=name;mesh.castShadow=true;g.add(mesh);return mesh;}
const writing=new T.Group();writing.name='Writing';
function revealableMaterial(name,opts,closed,opened){
 const m=new T.MeshPhysicalMaterial(opts);m.name=name;
 m.userData.revealClosed=closed;m.userData.revealOpen=opened;m.userData.revealValue=0;
 m.onBeforeCompile=shader=>{
  shader.uniforms.uReveal={value:0};m.userData.revealUniform=shader.uniforms.uReveal;
  shader.fragmentShader='uniform float uReveal;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb=mix(vec3(0.975,0.975,0.968),diffuseColor.rgb,uReveal);');
 };
 m.customProgramCacheKey=()=>name+'-reveal-v2';
 return m;
}
const writingCover=revealableMaterial('Writing cover cloth',{
 color:0xffffff,map:writingClothColor,roughness:.79,roughnessMap:writingClothRough,metalness:0,normalMap:writingClothNormal,normalScale:new T.Vector2(.010,.010),sheen:.07,sheenColor:new T.Color(0xe4e8ea),sheenRoughness:.70,clearcoat:.014,clearcoatRoughness:.88
 },{color:0xf9f7f1,roughness:.86,normalScale:[.008,.008],sheen:.03,clearcoat:.01},{color:0xebe7df,roughness:.77,normalScale:[.14,.14],sheen:.16,clearcoat:.014});
const writingPaper=revealableMaterial('Writing paper',{
 color:0xffffff,map:textures.writingPaperColor,roughness:.91,roughnessMap:textures.writingPaperRough,metalness:0,normalMap:textures.writingPaperNormal,normalScale:new T.Vector2(.012,.012)
 },{color:0xfbfbf8,roughness:.94,normalScale:[.005,.005]},{color:0xf2eee5,roughness:.88,normalScale:[.16,.16]});
const writingPageEdge=revealableMaterial('Writing page edge',{
 color:0xffffff,map:textures.writingPaperColor,roughness:.93,roughnessMap:textures.writingPaperRough,metalness:0,normalMap:textures.writingPaperNormal,normalScale:new T.Vector2(.008,.008)
 },{color:0xfbfbf8,roughness:.95,normalScale:[.004,.004]},{color:0xebe5da,roughness:.90,normalScale:[.11,.11]});
const writingElastic=mat('Writing elastic',0xe6e2da,.80,0,{normalMap:textures.writingPaperNormal,normalScale:new T.Vector2(.02,.02)});

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
box(architecture,'Mineral plinth',3.24,.22,2.84,0,.11,0,architectureStone,.014);
box(architecture,'Rear mineral tower',.76,1.34,.76,.08,.89,-.36,architectureStone,.022);
box(architecture,'Main cantilever slab',1.12,.08,.56,.78,1.02,-.02,architectureStone,.009);
box(architecture,'Front mineral podium',1.02,.40,.84,-.10,.42,.76,architectureInset,.016);
box(architecture,'Low mineral shelf',.88,.075,.60,-.80,.58,.16,architectureStone,.010);
box(architecture,'Left frosted tower',.64,.98,.68,-.90,.72,-.04,frosted,.016);
box(architecture,'Left clear volume',.40,.40,.44,-.96,.25,.82,glass,.012);
box(architecture,'Center clear fin',.16,.48,.18,.12,.35,.26,glass,.008);
box(architecture,'Clear bridge',.42,.06,.20,.06,.58,.26,glass,.006);
box(architecture,'Copper anchor',.60,.46,.46,.88,.45,.02,copper,.010);
box(architecture,'Graphite base',.74,.46,.74,.92,.46,.82,architectureMetal,.014);
box(architecture,'Smoked glass cap',.70,.22,.70,.92,.80,.82,mat('Plastic013A smoked acrylic',0xa6aaab,.18,0,{transmission:.88,ior:1.48,thickness:.52,attenuationColor:new T.Color(0xa6a09d),attenuationDistance:2.0,clearcoat:.10,clearcoatRoughness:.13}),.010);

const research=new T.Group();research.name='Research';
// Anti-moire paper construction: one continuous page block carries the edge mass,
// while only a handful of broad leaves create visible layering. This avoids the dozens
// of sub-pixel parallel edge bands that produced the previous "mosaic" shimmer.
const researchPageBlock=box(research,'Research page block',2.76,.112,3.36,0,.068,0,edge,.010);
researchPageBlock.castShadow=true;researchPageBlock.receiveShadow=true;
for(let i=0;i<5;i++){
 const sheet=box(research,'Research visible leaf '+i,2.765,.0065,3.365,
  (i-2)*.006,.128+i*.008,(2-i)*.006,paper,.0045);
 sheet.rotation.y=(i-2)*.0016;sheet.rotation.z=(2-i)*.0010;sheet.castShadow=true;sheet.receiveShadow=true;
}
// Top leaf gets one subtle, low-frequency bow; there are no tessellated side walls to alias.
const pg=new T.PlaneGeometry(2.765,3.365,12,14);pg.rotateX(-Math.PI/2);const pa=pg.attributes.position;
for(let i=0;i<pa.count;i++){
 const x=pa.getX(i),z=pa.getZ(i),edgeX=Math.pow(Math.abs(x)/1.3825,4),edgeZ=Math.pow(Math.abs(z)/1.6825,5);
 pa.setY(i,.170+.0050*edgeX+.0030*edgeZ+.0012*Math.sin(z*1.8)*(x/1.3825));
}
pg.computeVertexNormals();const top=new T.Mesh(pg,paper);top.name='Top research leaf';top.receiveShadow=true;top.castShadow=true;research.add(top);
// A smooth double-loop wire clip: open tips, straight legs, round bends.
const curl=(x,z)=>.0050*Math.pow(Math.abs(x)/1.3825,4)+.0030*Math.pow(Math.abs(z)/1.6825,5)+.0012*Math.sin(z*1.8)*(x/1.3825);
const cp=[];const cy=.194;for(let i=0;i<=12;i++){let a=Math.PI+i/12*Math.PI;cp.push([1.065+Math.cos(a)*.094,cy,-1.545+Math.sin(a)*.094]);}cp.push([1.159,cy,-1.07]);for(let i=0;i<=12;i++){let a=i/12*Math.PI;cp.push([1.081+Math.cos(a)*.078,cy,-1.07+Math.sin(a)*.078]);}cp.push([1.003,cy,-1.49]);for(let i=0;i<=12;i++){let a=Math.PI+i/12*Math.PI;cp.push([1.063+Math.cos(a)*.060,cy+.004,-1.49+Math.sin(a)*.060]);}cp.push([1.123,cy+.004,-1.16]);
for(const [i,p] of cp.entries()){
 // Round 36: move the clip to the actual upper-right paper edge instead of the page interior.
 // Keep the whole wire just inside the leaf boundary so it still reads as physically clipped-on.
 p[0]=1.185+(p[0]-1.065)*.72;
 p[2]=-1.430+(p[2]+1.30)*.72;
 p[1]=.170+curl(p[0],p[2])+.0065+.0016*Math.sin(i/(cp.length-1)*Math.PI);
}
tube(research,'Bent steel paperclip',cp,.0050,steel);
return [writing,architecture,research];}
