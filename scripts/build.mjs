import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {DYNAMIC_ASSETS} from '../runtime-assets.js';
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'dist'),files=new Set();
function include(relative){
 const clean=path.normalize(relative),p=path.resolve(root,clean);
 if(!p.startsWith(root)||clean.startsWith('dist/'))throw Error('Invalid dependency: '+clean);
 if(files.has(clean))return;
 if(!fs.statSync(p).isFile())throw Error('Missing file: '+clean);
 files.add(clean);
 if(!/\.(js|css|html)$/.test(clean))return;
 const text=fs.readFileSync(p,'utf8');
 const refs=[...text.matchAll(/(?:from\s*|import\s*|@import\s*)['"](\.?\.?\/[^'"]+|[^'"\n]+\.css)['"]/g)];
 if(clean.endsWith('.html'))refs.push(...text.matchAll(/(?:src|href)=["']([^"']+)["']/g));
 if(clean.endsWith('.css'))refs.push(...text.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g));
 for(const m of refs){if(/^(data:|https?:|#)/.test(m[1]))continue;include(path.join(path.dirname(clean),m[1]));}
}
include('index.html');DYNAMIC_ASSETS.forEach(include);
fs.readdirSync(path.join(root,'assets')).filter(n=>n.includes('LICENSE')).forEach(n=>include('assets/'+n));
// dist is generated exclusively from the canonical root. Never package its old contents.
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const hashes={};for(const f of [...files].sort()){
 const bytes=fs.readFileSync(path.join(root,f)),target=path.join(out,f);
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);
 hashes[f]=crypto.createHash('sha256').update(bytes).digest('hex');
}
fs.writeFileSync(path.join(out,'build-manifest.json'),JSON.stringify({build:'round55',files:hashes},null,2));
for(const [f,hash] of Object.entries(hashes)){
 if(crypto.createHash('sha256').update(fs.readFileSync(path.join(out,f))).digest('hex')!==hash)throw Error('Copy mismatch: '+f);
}
console.log(`Built and verified ${files.size} runtime files from canonical source.`);
