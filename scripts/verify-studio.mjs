import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/assets/three.module.js';
import {createModels} from '../dist/models.js';
import {createGlassGeometry} from '../dist/liquid-header.js';
import {installStudioShadows} from '../dist/studio-shadows.js';
import {createRenderBudget} from '../dist/render-budget.js';
const models=createModels();let meshes=0;
models.forEach(r=>r.traverse(o=>{if(!o.isMesh)return;meshes++;assert(o.material.isMeshPhysicalMaterial);assert(!o.material.map);}));
assert(!models[0].children.some(o=>/hinge|groove/i.test(o.name)));
for(const [w,h,d] of [[.9,.64,.1],[9.6,.64,.12],[3.2,1.04,.16]]){
 const g=createGlassGeometry(w,h,d);g.computeBoundingBox();assert(g.boundingBox.max.z-g.boundingBox.min.z>=d-.00001);for(const a of Object.values(g.attributes))assert([...a.array].every(Number.isFinite));g.dispose();
}
installStudioShadows();const shader=T.ShaderChunk.shadowmap_pars_fragment;assert(shader.includes('shadow=studioSoftShadow'));assert.equal(shader.split('float studioSoftShadow(').length,2);installStudioShadows();assert.equal(T.ShaderChunk.shadowmap_pars_fragment,shader);
globalThis.innerWidth=1440;globalThis.innerHeight=900;let ratio=1.28;
const budget=createRenderBudget({setPixelRatio:v=>ratio=v,setSize(){}},ratio);
for(let i=1;i<30;i++)budget.frame(i*1000);assert.equal(ratio,1.28,'idle gaps do not reduce resolution');
for(let i=1;i<200;i++)budget.frame(30000+i*34);assert(ratio>=.85&&ratio<1.28);assert(budget.diagnostics.resolutionDrops>0);
const app=fs.readFileSync('dist/app.js','utf8');assert(!app.includes('-studio-clean.png'));assert(app.includes('RectAreaLight'));assert(app.includes('AgXToneMapping'));
console.log(JSON.stringify({livePBRMeshes:meshes,coverGroove:'removed',glassVolume:'finite with real thickness',shadowKernel:'idempotent r170 integration',adaptiveResolution:'idle-safe and bounded',browserVisualCheck:false},null,2));
