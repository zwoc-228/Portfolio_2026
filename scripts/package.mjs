import fs from 'node:fs';
import path from 'node:path';
import {titles} from '../dist/content-data.js';
// Stage only runtime dependencies, keeping editable source and history out of deployment.
const root=path.resolve('dist'),out=path.resolve('../../release/DEPLOY');fs.mkdirSync(out,{recursive:true});
const files=new Set();
function include(relative){
 const clean=path.normalize(relative);if(files.has(clean))return;
 const file=path.join(root,clean);if(!fs.existsSync(file))throw Error('Missing '+clean);files.add(clean);
 if(!/\.(js|html|css)$/.test(clean))return;
 const text=fs.readFileSync(file,'utf8');
 const refs=[...text.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)];
 if(clean.endsWith('.html'))refs.push(...text.matchAll(/(?:src|href)=["']([^"']+)["']/g));
 if(clean.endsWith('.css'))refs.push(...text.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g));
 for(const m of refs){if(/^(data:|https?:|#)/.test(m[1]))continue;include(path.join(path.dirname(clean),m[1]));}
}
include('index.html');
const app=fs.readFileSync('dist/app.js','utf8');for(const m of app.matchAll(/loadTexture\(loader, '([^']+)'/g))include('assets/'+m[1]);
for(const name of ['architecture-studio-baked.jpg','architecture-bake-uv.json','contact-ao-layout.json','writing-contact-ao.png','architecture-contact-ao.png','research-contact-ao.png'])include('assets/'+name);
titles.forEach((items,c)=>items.forEach((_,i)=>include(`assets/index-${[0,4,8][c]+i}.png`)));
for(const name of fs.readdirSync('dist/assets').filter(n=>/LICENSE/.test(n)))include('assets/'+name);
for(const f of files){fs.mkdirSync(path.dirname(path.join(out,f)),{recursive:true});fs.copyFileSync(path.join(root,f),path.join(out,f));}
const report={files:[...files].sort(),count:files.size,bytes:[...files].reduce((n,f)=>n+fs.statSync(path.join(out,f)).size,0)};
fs.writeFileSync('verification/deploy-manifest.json',JSON.stringify(report,null,2));console.log({count:report.count,bytes:report.bytes,output:out});
