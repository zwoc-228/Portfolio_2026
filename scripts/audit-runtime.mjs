import fs from 'node:fs';
import path from 'node:path';
const root='dist';
const files=fs.readdirSync(root).filter(f=>f.endsWith('.js')).map(f=>path.join(root,f));
const rows=[];
for(const file of files){
  const s=fs.readFileSync(file,'utf8');
  rows.push({file,raf:(s.match(/requestAnimationFrame/g)||[]).length,caf:(s.match(/cancelAnimationFrame/g)||[]).length,listeners:(s.match(/addEventListener/g)||[]).length,renderTargets:(s.match(/WebGLRenderTarget/g)||[]).length,framebufferCopies:(s.match(/copyFramebufferToTexture/g)||[]).length,physicalMaterials:(s.match(/MeshPhysicalMaterial/g)||[]).length});
}
const customRaf=rows.reduce((n,r)=>n+r.raf,0);
const nonRuntimeRaf=rows.filter(r=>!r.file.endsWith('frame-runtime.js')).reduce((n,r)=>n+r.raf,0);
const floor=fs.readFileSync('dist/floor-reflection.js','utf8');
const app=fs.readFileSync('dist/app.js','utf8');
const result={
  customModules:rows,customRaf,nonRuntimeRaf,
  checks:{
    singleFrameDriver:nonRuntimeRaf===0,
    gsapHook:fs.readFileSync('dist/index.html','utf8').includes('assets/gsap.min.js'),
    screenSpaceGlass:fs.readFileSync('dist/liquid-panels.js','utf8').includes('FramebufferTexture'),
    fullEffectFloorRT:/const W=1024,H=576/.test(floor),
    reflectionPreblur:/blurA/.test(floor)&&/blurB/.test(floor)&&!floor.includes('for(int ix=-2;ix<=2;ix++)'),
    eventDrivenGlassCapture:app.includes('FRAME_CAPTURE')&&app.includes('glassCaptureReady'),
    stableBakedArchitecture:app.includes('Cycles baked handmade studio')&&!app.includes('setArchitectureGlassDetail'),
    coarseHitTesting:app.includes('intersectBox')&&!app.includes('intersectObjects(models, true)'),
    synchronousShadowRefresh:app.includes('markStaticShadowsDirty')&&!app.includes('transitionFrame')&&!app.includes('hoverShadowTick')
  }
};
console.log(JSON.stringify(result,null,2));
if(Object.values(result.checks).some(v=>!v))process.exitCode=1;
