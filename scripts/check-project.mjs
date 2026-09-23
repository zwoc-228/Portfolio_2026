import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {titles} from '../dist/content-data.js';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const sources=walk('dist').filter(f=>/\.(js|css|html)$/.test(f));
let syntax=0,references=0;
for(const file of sources){
 const s=fs.readFileSync(file,'utf8');if(file.endsWith('.js')){execFileSync(process.execPath,['--check',file],{stdio:'pipe'});syntax++;}
 const refs=[...s.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g),...s.matchAll(/(?:src|href)=["']([^"']+)["']/g),...(file.endsWith('.css')?s.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g):[])];
 for(const m of refs){if(m[1].startsWith('data:')||m[1].startsWith('#')||/^https?:/.test(m[1])||m[1].includes('${'))continue;const target=path.resolve(path.dirname(file),m[1]);if(!fs.existsSync(target))throw Error(file+' missing '+m[1]);references++;}
}
const app=fs.readFileSync('dist/app.js','utf8');
for(const m of app.matchAll(/loadTexture\(loader, '([^']+)'/g)){if(!fs.existsSync('dist/assets/'+m[1]))throw Error('Missing texture '+m[1]);references++;}
for(const name of ['architecture-studio-baked.jpg','architecture-bake-uv.json','contact-ao-layout.json','writing-contact-ao.png','architecture-contact-ao.png','research-contact-ao.png']){if(!fs.existsSync('dist/assets/'+name))throw Error('Missing studio asset '+name);references++;}
titles.forEach((items,c)=>items.forEach((_,i)=>{if(!fs.existsSync(`dist/assets/index-${[0,4,8][c]+i}.png`))throw Error('Missing project card');references++;}));
fs.mkdirSync('verification',{recursive:true});
for(const [script,report] of [['audit-runtime.mjs','runtime-audit.json'],['verify-interactions.mjs','interaction-checks.json'],['verify-state.mjs','state-checks.json'],['validate-assets.mjs','asset-checks.txt']]){
 const output=execFileSync(process.execPath,['scripts/'+script],{encoding:'utf8'});fs.writeFileSync('verification/'+report,output);
}
const result={syntaxModules:syntax,localReferences:references,regressionSuites:4,status:'passed',liveWebGLScreenshot:false};
fs.writeFileSync('verification/project-checks.json',JSON.stringify(result,null,2));console.log(result);
