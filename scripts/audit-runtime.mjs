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
const result={customModules:rows,customRaf,nonRuntimeRaf,checks:{singleFrameDriver:nonRuntimeRaf===0,gsapHook:fs.readFileSync('dist/index.html','utf8').includes('gsap@3.15.0'),screenSpaceGlass:fs.readFileSync('dist/liquid-panels.js','utf8').includes('FramebufferTexture'),fullEffectFloorRT:fs.readFileSync('dist/floor-reflection.js','utf8').includes('1024,576')}};
console.log(JSON.stringify(result,null,2));
if(!result.checks.singleFrameDriver)process.exitCode=1;
