import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PROJECT_RECORDS,PORTFOLIO_ASSETS,IMAGE_SIZES} from '../content-data.js';
assert.equal(PROJECT_RECORDS[1].length,3);
assert.deepEqual(PROJECT_RECORDS[1].map(r=>r.title),['Information Relays','Breaking the Resource Paradox','Reimagine Everydayness']);
for(const file of PORTFOLIO_ASSETS){assert(fs.existsSync(file),file);assert(fs.statSync(file).size>1000,'Truncated image: '+file);assert(IMAGE_SIZES[file]?.[0]>=1200,'Image must be portfolio-resolution: '+file);}
for(const group of PROJECT_RECORDS)for(const r of group){assert(r.source.startsWith('Portfolio,'));assert(r.gallery.length>0);assert(r.summary.length>50);}
const view=fs.readFileSync('ui-view.js','utf8');assert(!view.includes('A focused study of material'));assert(!view.includes('i % 3'));assert(!view.includes('reference image'));
console.log('PASS: real project titles, source page references, high-resolution assets, complete galleries.');
