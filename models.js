import * as T from './assets/three.module.js';
import {RoundedBoxGeometry} from './assets/RoundedBoxGeometry.js';
import {PALETTE} from './palette.js';

// Closed, genuinely thin paper surfaces, with shared continuous curvature.
// All layers use the same world-space bend so offset sheets cannot cross each other.
export function paperHeight(x,z){return .003+.018*Math.pow(Math.abs(x)/1.65,4)+.028*Math.pow(Math.max(0,z)/1.9,5)+.010*Math.pow(Math.max(0,-z)/1.9,4);}
export function sheetGeometry(w,d,thickness,base,{angle=0,dx=0,dz=0,bend=paperHeight,segments=18}={}){
 const positions=[],uv=[],nx=segments,nz=Math.round(segments*d/w),c=Math.cos(angle),s=Math.sin(angle);
 const point=(i,j,side)=>{const a=(i/nx-.5)*w,b=(j/nz-.5)*d,x=a*c-b*s+dx,z=a*s+b*c+dz;return [x,base+bend(x,z)+side*thickness,z];};
 const tri=(a,b,c,ua,ub,uc)=>{positions.push(...a,...b,...c);uv.push(...ua,...ub,...uc);};
 const quad=(a,b,c,d,flip=false)=>{if(flip){tri(a,c,b,[0,0],[1,1],[1,0]);tri(a,d,c,[0,0],[0,1],[1,1]);}else{tri(a,b,c,[0,0],[1,0],[1,1]);tri(a,c,d,[0,0],[1,1],[0,1]);}};
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
  quad(point(i,j,1),point(i+1,j,1),point(i+1,j+1,1),point(i,j+1,1),true);
  quad(point(i,j,0),point(i+1,j,0),point(i+1,j+1,0),point(i,j+1,0));
 }
 for(let i=0;i<nx;i++){
  quad(point(i,0,0),point(i+1,0,0),point(i+1,0,1),point(i,0,1),true);
  quad(point(i,nz,0),point(i+1,nz,0),point(i+1,nz,1),point(i,nz,1));
 }
 for(let j=0;j<nz;j++){
  quad(point(0,j,0),point(0,j+1,0),point(0,j+1,1),point(0,j,1));
  quad(point(nx,j,0),point(nx,j+1,0),point(nx,j+1,1),point(nx,j,1),true);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
function coverGeometry(w,d,h,r){
 const shape=new T.Shape(),x=-w/2,y=-d/2;
 shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);shape.lineTo(x+w,y+d-r);shape.quadraticCurveTo(x+w,y+d,x+w-r,y+d);shape.lineTo(x+r,y+d);shape.quadraticCurveTo(x,y+d,x,y+d-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
 const g=new T.ExtrudeGeometry(shape,{depth:h-.012,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.006,bevelThickness:.006,curveSegments:8});g.rotateX(-Math.PI/2);g.translate(0,-(h-.012)/2,0);return g;
}
export function createModels(){
 const mat=(name,color,roughness=.78,metalness=0)=>{const m=new T.MeshPhysicalMaterial({color,roughness,metalness,ior:1.42,specularIntensity:.28,clearcoat:.008});m.name=name;return m;};
 const paper=mat('Warm cotton paper',PALETTE.paper,.84),cover=mat('Fine ivory book cloth',PALETTE.linen,.82),edge=mat('Cream cut paper edges',PALETTE.paperEdge,.88);
 const architectureStone=mat('Portfolio warm plaster',PALETTE.plaster,.78),architectureInset=mat('Portfolio pale stone',PALETTE.stone,.83);
 const glass=mat('Portfolio pale cyan resin',PALETTE.cyan,.57),frosted=mat('Portfolio mint plaster',PALETTE.mint,.72);
 const copper=mat('Portfolio ochre satin accent',PALETTE.ochre,.56,.35),architectureMetal=mat('Portfolio blue grey metal',PALETTE.slate,.60,.35);
 const steel=mat('Satin steel clip',0x9ba5a4,.36,.72),ribbonMaterial=mat('Slate woven bookmark',PALETTE.slate,.86);
 function add(g,name,geometry,m){const o=new T.Mesh(geometry,m);o.name=name;o.castShadow=o.receiveShadow=true;g.add(o);return o;}
 function box(g,name,w,h,d,x,y,z,m,r=.014){const o=add(g,name,new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)),m);o.position.set(x,y,z);return o;}
 function tube(g,name,points,r,m){return add(g,name,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),96,r,8,false),m);}
 const writing=new T.Group();writing.name='Writing';
 const lower=add(writing,'Rounded lower cloth cover',coverGeometry(2.62,3.24,.042,.095),cover);lower.position.y=.028;
 // Thirteen separate gatherings replace the old single page-block solid.
 for(let i=0;i<13;i++){
  const w=2.43+.006*Math.sin(i*1.7),d=3.06+.004*Math.cos(i*1.3);
  add(writing,'Bound paper gathering '+i,sheetGeometry(w,d,.010,.052+i*.012,{dx:.026+.002*Math.sin(i),dz:.002*Math.cos(i),bend:()=>0,segments:3}),i===12?paper:edge);
 }
 const upper=add(writing,'Rounded upper cloth cover',coverGeometry(2.62,3.24,.044,.095),cover);upper.position.y=.232;
 box(writing,'Rounded binding spine',.112,.224,3.10,-1.25,.132,0,cover,.035);
 // The separate hinge strip was coplanar with the cover and produced a dark seam.
 // Bookmark exits between pages and falls to the desk, not a floating rectangular flap.
 const rp=[],ru=[],ri=[];
 for(let i=0;i<=30;i++){
  const t=i/30,z=1.48+t*.47,y=.092*Math.pow(1-t,2)+.004;
  for(const side of [-1,1]){rp.push(-.82+side*.036+.015*Math.sin(t*2),y,z);ru.push(side===-1?0:1,t);}
  if(i<30){const a=i*2;ri.push(a,a+2,a+1,a+1,a+2,a+3);}
 }
 const rg=new T.BufferGeometry();rg.setAttribute('position',new T.Float32BufferAttribute(rp,3));rg.setAttribute('uv',new T.Float32BufferAttribute(ru,2));rg.setIndex(ri);rg.computeVertexNormals();ribbonMaterial.side=T.DoubleSide;add(writing,'Woven bookmark ribbon',rg,ribbonMaterial);
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
box(architecture,'Smoked glass cap',.70,.22,.70,.92,.80,.82,mat('Smoky cast resin',PALETTE.blue,.38,0,{ior:1.42,specularIntensity:.32}),.014);
// Studio lighting and cavity shading are baked from this exact geometry in Blender Cycles.


 const research=new T.Group();research.name='Research';
 const offsets=[[-.12,.07,-.072],[.07,-.04,.045],[-.055,.04,-.034],[.105,.005,.061],[-.09,-.045,-.054],[.035,.04,.026],[-.015,-.04,-.018],[.03,.025,.012],[0,0,0]];
 offsets.forEach(([dx,dz,angle],i)=>{
  const o=add(research,'Loose research sheet '+i,sheetGeometry(2.73,3.34,.0045,.004+i*.0105,{dx,dz,angle}),paper);
  o.userData.sheet={base:.004+i*.0105,thickness:.0045,dx,dz,angle};
 });
 // Upper wire sits on the curved top sheet; the return leg hooks around its rear edge.
 const base=.004+8*.0105+.0045,cp=[];
 const pts=[[1.02,-1.39],[1.02,-1.67],[1.04,-1.72],[1.10,-1.74],[1.16,-1.71],[1.18,-1.66],[1.18,-1.33],[1.16,-1.28],[1.10,-1.27],[1.07,-1.31],[1.07,-1.63],[1.09,-1.67],[1.12,-1.67],[1.14,-1.64],[1.14,-1.38]];
 pts.forEach(([x,z],i)=>cp.push([x,base+paperHeight(x,z)+.008-(i>9?.013:0),z]));
 tube(research,'Bent satin steel paperclip',cp,.005,steel);
 return [writing,architecture,research];
}
