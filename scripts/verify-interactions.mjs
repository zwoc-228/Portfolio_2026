import assert from 'node:assert/strict';
import * as T from '../dist/assets/three.module.js';
import {createContactShadows} from '../dist/contact-shadows.js';
import {createModels,paperHeight} from '../dist/models.js';
import {HOME_TRANSFORMS} from '../dist/scene-layout.js';
import {createLiquidHeader,headerMetrics} from '../dist/liquid-header.js';
import {createUIReflectionProxies} from '../dist/ui-reflection-proxies.js';
const results=[];
const scene=new T.Scene();const roots=createModels().map((m,i)=>{let r=new T.Group();let f=HOME_TRANSFORMS[i];m.scale.set(f[2],f[3],f[5]);r.add(m);scene.add(r);return r;});
const layouts=roots.map((r,i)=>({name:String(i),width:3,depth:3,x:.1,z:.2}));
const contacts=createContactShadows(scene,roots,layouts,roots.map(()=>new T.Texture()));
for(const scale of [1,1.2,1.65])for(const lift of [0,.04,.085]){roots.forEach(r=>{r.scale.setScalar(scale);r.position.set(2.3,lift,1);r.rotation.y=.24;});contacts.update();contacts.meshes.forEach(m=>assert(Math.abs(m.getWorldPosition(new T.Vector3()).y+.013)<1e-8));}
contacts.dispose();results.push('AO stays on desk during scaling/lift');
const models=createModels(),sheets=models[2].children.filter(o=>o.userData.sheet);assert.equal(sheets.length,9);
assert(!models[2].children.some(o=>/block/i.test(o.name)));assert.equal(models[0].children.filter(o=>o.name.startsWith('Bound paper')).length,13);
for(const [i,o] of sheets.entries()){
 const a=o.geometry.attributes.position;const layer=o.userData.sheet;
 for(let n=0;n<a.count;n++){const localY=a.getY(n)-paperHeight(a.getX(n),a.getZ(n));assert(localY>=layer.base-1e-6&&localY<=layer.base+layer.thickness+1e-6);}
 if(i)assert(layer.base>sheets[i-1].userData.sheet.base+sheets[i-1].userData.sheet.thickness);
}
results.push('Nine curved sheets have separate surfaces and nonintersecting height bands');
for(const w of [320,390,768,1024,1440,1920])for(const p of [0,.3,.7,1]){const m=headerMetrics(w,p);assert(m.width<=w-32);assert(m.top>=16);assert(Number.isFinite(m.height));}
// Real proxy placement: catch the former spec/rect argument mix-up.
globalThis.innerWidth=1440;globalThis.innerHeight=900;
const camera=new T.PerspectiveCamera(27,1.6,.1,200);camera.position.set(0,9,13);camera.lookAt(0,.35,0);camera.updateMatrixWorld(true);
let active=[];const reflections={setReflectionOnlyObjects:x=>active=x,clearPanelReflections(){},setObjectFootprint(){},setPersistentReflectionOnlyObjects(){}};
const ui=createUIReflectionProxies({scene,camera,floorReflection:reflections});
assert.equal(ui.sync({category:{left:32,top:112,width:240,height:400,bottom:512},cards:[{left:296,top:112,width:280,height:380,bottom:492}]}),2);
active.forEach(o=>{assert(o.position.toArray().every(Number.isFinite));assert(o.scale.x>0&&o.scale.y>0);});ui.dispose();results.push('UI reflection geometry has valid positions for actual card rectangles');
// Exercise actual header events and frame update with a minimal DOM contract.
const events=new Map();function el(){return {style:{setProperty(){}},dataset:{},inert:true,setAttribute(k,v){this[k]=v;},addEventListener(k,f){events.set(this.name+':'+k,f);},removeEventListener(){},focus(){},contains(o){return o===this;}};}
const header=el(),trigger=el(),links=el();header.name='header';trigger.name='trigger';header.querySelector=s=>s==='.header-trigger'?trigger:links;header.contains=o=>[header,trigger,links].includes(o);
globalThis.document={querySelector:()=>header,addEventListener(){},removeEventListener(){}};globalThis.matchMedia=()=>({matches:false});let tick;
const runtime={add:f=>(tick=f,()=>{}),request(){}};const h=createLiquidHeader({scene,camera,floorReflection:reflections,runtime});
events.get('header:pointerenter')({pointerType:'mouse'});for(let i=0;i<100;i++)tick(1/60);assert.equal(trigger['aria-expanded'],'true');assert(!links.inert);assert.equal(parseFloat(header.style.width),960);
events.get('header:keydown')({key:'Escape',preventDefault(){},stopPropagation(){}});for(let i=0;i<100;i++)tick(1/60);assert.equal(trigger['aria-expanded'],'false');assert(links.inert);assert.equal(parseFloat(header.style.width),144);assert.equal(tick(1/60),0);h.dispose();results.push('Card hover opens, Escape closes, hidden links inert, idle frame loop stops');
console.log(JSON.stringify(results,null,2));
