import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {createModels} from '../dist/models.js';
function signature(root){const a=[];root.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position.array;const hash=createHash('sha256').update(Buffer.from(p.buffer,p.byteOffset,p.byteLength)).digest('hex');a.push({name:o.name,position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray(),vertices:p.length/3,hash});});return a;}
const baselinePath='verification/round43-architecture-geometry.json';

assert.deepEqual(signature(createModels()[1]),JSON.parse(fs.readFileSync(baselinePath)));
console.log(JSON.stringify({architectureGeometry:'unchanged from supplied round43',meshes:12}));
