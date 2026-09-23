import fs from 'node:fs';
import {createModels} from '../dist/models.js';
import {HOME_TRANSFORMS} from '../dist/scene-layout.js';
const groups=createModels().map((root,i)=>{
 const f=HOME_TRANSFORMS[i];root.scale.set(f[2],f[3],f[5]);root.updateMatrixWorld(true);
 const meshes=[];
 root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry;
 meshes.push({name:o.name,positions:[...g.attributes.position.array],normals:[...g.attributes.normal.array],matrix:o.matrixWorld.toArray(),color:o.material.color.toArray(),roughness:o.material.roughness,metalness:o.material.metalness});});
 return {name:root.name,meshes};
});
fs.writeFileSync('scripts/bake-input.json',JSON.stringify(groups));
console.log(groups.map(g=>[g.name,g.meshes.length]));
