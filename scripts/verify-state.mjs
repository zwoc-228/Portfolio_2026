import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as T from '../dist/assets/three.module.js';
import {FRAME_RENDER,FRAME_CAPTURE,FRAME_REFLECTION,FRAME_ACTIVE,createFrameRuntime} from '../dist/frame-runtime.js';
// Exercise actual transition functions with scene objects; no browser rendering is simulated.
const app=fs.readFileSync('dist/app.js','utf8');
const code=app.slice(app.indexOf('function getTargets()'),app.indexOf('function updateScene('));
let dirty=0,clears=0;
const ctx={T,models:[new T.Group(),new T.Group(),new T.Group()],home:[{x:-4,z:0,r:0},{x:0,z:0,r:0},{x:4,z:0,r:0}],
 state:'home',selected:1,innerWidth:1672,innerHeight:941,transition:null,reduced:false,writingController:null,
 easeInOutExpo:t=>t<=0?0:t>=1?1:t<.5?2**(20*t-10)/2:(2-2**(-20*t+10))/2,
 floorReflection:{clear(){clears++;}},document:{documentElement:{dataset:{}},body:{classList:{add(){},remove(){}}}},
 runtime:{request(){}},syncContactShadows(){},markStaticShadowsDirty(){dirty++;},glassCaptureReady:true,
 FRAME_RENDER,FRAME_CAPTURE,FRAME_REFLECTION,FRAME_ACTIVE};
vm.createContext(ctx);vm.runInContext(code,ctx);
ctx.state='preview';ctx.startTransition();
for(let i=0;i<15;i++)assert(ctx.updateTransition(1/60)&FRAME_REFLECTION);
const before=ctx.models[1].position.clone();ctx.state='home';ctx.startTransition();
assert.deepEqual(ctx.models[1].position,before);assert.equal(ctx.transition.from[1].x,before.x);
let steps=0;while(ctx.transition){assert(ctx.updateTransition(1/60)&FRAME_REFLECTION);steps++;assert(steps<50);}
assert.equal(ctx.models[1].position.x,0);assert.equal(ctx.models[1].scale.x,1);assert.equal(dirty,15+steps);assert.equal(clears,2);
// Actual UI module, deterministic timers and only the DOM properties it uses.
let timers=new Map(),next=0;globalThis.setTimeout=f=>{timers.set(++next,f);return next;};globalThis.clearTimeout=id=>timers.delete(id);
const nodes=new Map();const classes=new Set();
function node(){return {hidden:true,inert:false,dataset:{},style:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),toggle(){}},replaceChildren(){},append(){}};}
for(const id of ['#detail-card','#detail-image','#detail-title','#detail-text','#detail-kicker','#detail-category','#detail-year','#category'])nodes.set(id,node());
globalThis.document={hidden:false,body:{className:'index',classList:node().classList},querySelector:s=>nodes.get(s)||null,querySelectorAll:()=>[]};
const ui=await import('../dist/ui-view.js');const item={title:'A',image:'a.png',category:'study',year:'2024'};
const flush=()=>{const all=[...timers.values()];timers.clear();all.forEach(f=>f());};
ui.showProjectDetail(item);flush();ui.hideProjectDetail();ui.showProjectDetail({...item,title:'B'});flush();
assert(!nodes.get('#detail-card').hidden);assert.equal(nodes.get('#detail-title').textContent,'B');assert.equal(nodes.get('#detail-card').dataset.phase,'ready');
ui.hideProjectDetail();ui.applyViewState({state:'index',selected:1,names:['A','B'],cats:[[],[]],filter:'All'});flush();assert(nodes.get('#detail-card').hidden&&nodes.get('#detail-card').inert);
// One driver, idle stop and visibility wake with the real frame runtime.
let tickerCallback=null,adds=0,removes=0,draws=0;
globalThis.gsap={ticker:{add(fn){tickerCallback=fn;adds++;},remove(){removes++;}}};
const rt=createFrameRuntime(()=>draws++);let ticks=0;rt.add(()=>++ticks<3?FRAME_RENDER|FRAME_ACTIVE:FRAME_RENDER);
rt.request();rt.request();assert.equal(adds,1);tickerCallback(1);tickerCallback(1.016);tickerCallback(1.032);assert.equal(draws,3);assert(!rt.running);assert.equal(removes,1);
rt.setPaused(true);rt.request();assert(!rt.running);rt.setPaused(false);assert(rt.running);rt.dispose();
console.log(JSON.stringify({transitionInterrupt:'continuous',spatialPasses:'synchronous',detailCloseReopen:'passed',categoryChange:'detail reset',frameDriver:'idle and pause passed'},null,2));
