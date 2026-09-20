import * as T from './assets/three.module.js';
import {RoundedBoxGeometry} from './assets/RoundedBoxGeometry.js';
export function createModels(textures={}){
const mat=(name,color,roughness=0.7,metalness=0,extra={})=>{let m=new T.MeshPhysicalMaterial({color,roughness,metalness,...Object.fromEntries(Object.entries(extra).filter(([k,v])=>v!==undefined))});m.name=name;return m;};
const linen=mat('Linen',0xf1ede6,.72,0,{map:textures.linenColor,roughnessMap:textures.linenRough,normalMap:textures.linenNormal,bumpMap:textures.linen,bumpScale:.0016,normalScale:new T.Vector2(.32,.32),sheen:.34,sheenColor:new T.Color(0xf2eee6),sheenRoughness:.68,clearcoat:.02,clearcoatRoughness:.78});
const paper=mat('Paper',0xf6f3ec,.88,0,{map:textures.paperColor,roughnessMap:textures.paperRough,normalMap:textures.paperNormal,bumpMap:textures.paper,bumpScale:.00045,normalScale:new T.Vector2(.20,.20)});
const edge=mat('Page edges',0xe9e3d9,.86,0,{map:textures.paperColor,roughnessMap:textures.paperRough,normalMap:textures.paperNormal,bumpMap:textures.paper,bumpScale:.0002,normalScale:new T.Vector2(.10,.10)});const stone=mat('White mineral',0xefeae1,.58,0,{map:textures.stoneColor,roughnessMap:textures.stoneRough,normalMap:textures.stoneNormal,bumpMap:textures.stone,bumpScale:.0012,normalScale:new T.Vector2(.30,.30),clearcoat:.02,clearcoatRoughness:.84});
const glass=mat('Clear acrylic',0xf8fbfc,.055,0,{transmission:1,ior:1.49,thickness:.82,attenuationColor:new T.Color(0xf2f7f8),attenuationDistance:7.5,clearcoat:.12,clearcoatRoughness:.08});const blue=mat('Blue acrylic',0x8ca7b2,.13,0,{transmission:.84,ior:1.49,thickness:.82,attenuationColor:new T.Color(0x9bb6c1),attenuationDistance:2.4,clearcoat:.10,clearcoatRoughness:.10});
const copper=mat('Copper',0xb97d69,.38,1,{roughnessMap:textures.copperRough,anisotropy:.28,clearcoat:.04,clearcoatRoughness:.42});const dark=mat('Dark mineral',0x667075,.52,0,{map:textures.stoneColor,roughnessMap:textures.stoneRough,normalMap:textures.stoneNormal,bumpMap:textures.stone,bumpScale:.0013,normalScale:new T.Vector2(.26,.26)});
const steel=mat('Paperclip stainless steel',0xd0d3d4,.16,1,{roughnessMap:textures.steelRough,clearcoat:.18,clearcoatRoughness:.16});const ink=mat('Printed paper',0xffffff,.94,0,{map:textures.print,roughnessMap:textures.paperRough,normalMap:textures.paperNormal,normalScale:new T.Vector2(.10,.10)});
function box(g,name,w,h,d,x,y,z,m,r=.014){const mesh=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),m);mesh.name=name;mesh.position.set(x,y,z);// Give each transparent solid its own optical path length.
if(m.transmission>0){mesh.material=m.clone();mesh.material.thickness=Math.min(w,h,d);}
mesh.castShadow=!(m.transmission>.5);mesh.receiveShadow=true;g.add(mesh);return mesh;}
function tube(g,name,points,r,m){let c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));let mesh=new T.Mesh(new T.TubeGeometry(c,name.startsWith('Binding')?12:128,r,name.startsWith('Binding')?6:12,false),m);mesh.name=name;mesh.castShadow=true;g.add(mesh);return mesh;}
const writing=new T.Group();writing.name='Writing';
box(writing,'Lower linen cover',2.55,.047,3.2,0,.035,0,linen,.023);
box(writing,'Page block',2.39,.15,3.02,.025,.135,0,paper,.018);
for(let i=0;i<32;i++){
 const leaf=box(writing,'Page edge '+i,2.418+.008*Math.sin(i*2.7),.00235,3.048+.010*Math.cos(i*1.13),.025+.002*Math.sin(i),.072+i*.00438,.004*Math.sin(i*1.73),i%5===0?edge:paper,.0008);
 const a=leaf.geometry.attributes.position;
 for(let j=0;j<a.count;j++){const x=a.getX(j),z=a.getZ(j);a.setY(j,a.getY(j)+.0018*Math.sin(z*3.3+i*.16)*(x+1.21)/2.42+.0005*Math.sin(x*5.0+i));}
 leaf.geometry.computeVertexNormals();
}
const cover=box(writing,'Upper linen cover',2.55,.049,3.2,0,.239,0,linen,.022);
const cv=cover.geometry.attributes.position;for(let i=0;i<cv.count;i++){let x=cv.getX(i),z=cv.getZ(i);cv.setY(i,cv.getY(i)+.0060*Math.cos(z*1.35)*(1-(x/1.275)**2)+.0011*Math.sin(x*4.2));}cover.geometry.computeVertexNormals();
// Curved closed spine with a recessed page-side opening.
const spine=box(writing,'Rounded cloth spine',.11,.229,3.19,-1.25,.137,0,linen,.048);
box(writing,'Spine end inset',.054,.133,.009,-1.241,.135,1.598,edge,.009);
// Cloth is compressed along the hinge and swells slightly over the spine.
const sp=spine.geometry.attributes.position;
for(let i=0;i<sp.count;i++){const y=sp.getY(i),z=sp.getZ(i);sp.setX(i,sp.getX(i)-.009*Math.cos(y/.229*Math.PI)*Math.cos(z*.6));}
spine.geometry.computeVertexNormals();
const hinge=box(writing,'Spine hinge',.017,.003,3.14,-1.16,.263,0,edge,.001);
// Small wrapped endband threads are visible only at the head and tail.
for(const end of [-1,1])for(let i=0;i<11;i++){
 const x=-1.19+i*.009;
 tube(writing,'Binding endband '+end+' '+i,[[x,.082,end*1.511],[x-.003,.092,end*1.523],[x,.109,end*1.516]],.0026,i%2?linen:edge);
}
box(writing,'Elastic upper band',.035,.013,3.19,1.04,.269,0,edge,.006);
box(writing,'Elastic fore edge',.035,.238,.022,1.04,.148,1.598,edge,.008);
// Ribbon is a swept variable-height strip, not a cuboid.
let verts=[],uv=[],idx=[];for(let i=0;i<=24;i++){let t=i/24;let z=1.40+t*.70;let yy=.11*(1-t)+.015+Math.sin(t*Math.PI)*.015;for(let side of [-1,1]){verts.push(-.93+side*.08+Math.sin(t*2)*.02,yy,z);uv.push(side===-1?0:1,t);}if(i<24){let q=i*2;idx.push(q,q+1,q+2,q+1,q+3,q+2);}}
let rg=new T.BufferGeometry();rg.setAttribute('position',new T.Float32BufferAttribute(verts,3));rg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));rg.setIndex(idx);rg.computeVertexNormals();let ribbon=new T.Mesh(rg,linen.clone());ribbon.material.side=T.DoubleSide;ribbon.name='Woven bookmark ribbon';ribbon.castShadow=true;writing.add(ribbon);
const architecture=new T.Group();architecture.name='Architecture';
box(architecture,'Mineral plinth',2.96,.22,2.56,0,.11,0,stone,.013);
box(architecture,'Tower lower',.70,.82,.68,.07,.63,-.31,stone);
box(architecture,'Tower upper',.67,.77,.67,.10,1.56,-.38,stone);
box(architecture,'Cantilever slab',1.48,.095,.60,.13,1.19,-.33,stone,.008);
box(architecture,'Clear left tall',.60,1.11,.61,-.74,.80,-.28,glass,.008);
box(architecture,'Clear front left',.44,.58,.49,-.97,.46,.41,glass,.009);
box(architecture,'Clear bridge',.77,.095,.50,-.53,.84,.12,glass,.006);
box(architecture,'Blue front mass',.84,.50,.69,-.32,.47,.76,blue,.01);
box(architecture,'Clear front column',.34,.83,.40,.26,.63,.52,glass,.008);
box(architecture,'Copper rear mass',.62,.50,.57,.83,.47,-.30,copper,.008);
box(architecture,'Dark front base',.68,.35,.66,.91,.39,.57,dark,.012);
box(architecture,'Smoked upper glass',.68,.42,.66,.91,.74,.57,mat('Smoked acrylic',0xa2acb0,.09,0,{transmission:.92,ior:1.49,thickness:.5,attenuationColor:new T.Color(0x96a0a5),attenuationDistance:1.45}),.009);
box(architecture,'Left middle shelf',.80,.08,.73,-.64,.56,.19,stone,.006);
box(architecture,'Narrow mineral column',.14,.77,.28,-.23,.61,.10,stone,.008);
box(architecture,'Clear inner support',.19,.42,.24,-.18,.29,.47,glass,.006);
box(architecture,'Mineral rear support',.21,.50,.22,.38,.36,.20,stone,.006);
const research=new T.Group();research.name='Research';
// Closed, individually bowed sheets with continuous top/edge geometry.
const curl=(x,z,phase)=>.006*Math.pow(Math.abs(x)/1.375,5)*(1+.4*Math.sin(z*2+phase))+.005*Math.pow(Math.abs(z)/1.675,8)+.0015*Math.sin(z*3+phase)*(x/1.375);
function sheetGeometry(w,d,h,phase){
 const nx=14,nz=18,v=[],uv=[],ix=[];const stride=(nx+1)*(nz+1);
 for(let side=0;side<2;side++)for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){let x=(i/nx-.5)*w,z=(j/nz-.5)*d;v.push(x,curl(x,z,phase)+(side===0?h/2:-h/2),z);uv.push(i/nx,1-j/nz);}
 for(let side=0;side<2;side++)for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){let a=side*stride+j*(nx+1)+i,b=a+1,c=a+nx+1,e=c+1;if(side===0)ix.push(a,c,b,b,c,e);else ix.push(a,b,c,b,e,c);}
 let boundary=[];for(let i=0;i<=nx;i++)boundary.push(i);for(let j=1;j<=nz;j++)boundary.push(j*(nx+1)+nx);for(let i=nx-1;i>=0;i--)boundary.push(nz*(nx+1)+i);for(let j=nz-1;j>0;j--)boundary.push(j*(nx+1));
 for(let i=0;i<boundary.length;i++){let a=boundary[i],b=boundary[(i+1)%boundary.length];ix.push(a,b,a+stride,b,b+stride,a+stride);}
 let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
}
for(let i=0;i<23;i++){let sheet=new T.Mesh(sheetGeometry(2.75,3.35,.0036,i*.7),paper);sheet.name='Paper sheet '+i;sheet.position.set(Math.sin(i*1.7)*.024,.008+i*.00555+Math.sin(i*.53)*.0009,Math.cos(i*2.1)*.022);sheet.rotation.y=Math.sin(i*.8)*.0068;sheet.rotation.x=Math.sin(i*.41)*.0024;sheet.rotation.z=Math.cos(i*.58)*.0021;sheet.castShadow=true;sheet.receiveShadow=true;research.add(sheet);}
const pg=new T.PlaneGeometry(2.75,3.35,28,36);pg.rotateX(-Math.PI/2);const pa=pg.attributes.position;for(let i=0;i<pa.count;i++){let x=pa.getX(i),z=pa.getZ(i);pa.setY(i,.147+curl(x,z,16.1));}pg.computeVertexNormals();const top=new T.Mesh(pg,paper);top.name='Unprinted top research sheet';top.receiveShadow=true;top.castShadow=true;research.add(top);
// A smooth double-loop wire clip: open tips, straight legs, round bends.
const cp=[];const cy=.171;for(let i=0;i<=12;i++){let a=Math.PI+i/12*Math.PI;cp.push([1.065+Math.cos(a)*.094,cy,-1.545+Math.sin(a)*.094]);}cp.push([1.159,cy,-1.07]);for(let i=0;i<=12;i++){let a=i/12*Math.PI;cp.push([1.081+Math.cos(a)*.078,cy,-1.07+Math.sin(a)*.078]);}cp.push([1.003,cy,-1.49]);for(let i=0;i<=12;i++){let a=Math.PI+i/12*Math.PI;cp.push([1.063+Math.cos(a)*.060,cy+.004,-1.49+Math.sin(a)*.060]);}cp.push([1.123,cy+.004,-1.16]);
// Scale the loop around its contact centre; preserve contact height.
for(const [i,p] of cp.entries()){
 p[0]=1.065+(p[0]-1.065)*.67;p[2]=-1.30+(p[2]+1.30)*.67;
 // Wire sits on the curled top leaf; residual bow models spring tension.
 p[1]=.147+curl(p[0],p[2],16.1)+.0065+.0018*Math.sin(i/(cp.length-1)*Math.PI);
}
tube(research,'Bent steel paperclip',cp,.0059,steel);
return [writing,architecture,research];}
