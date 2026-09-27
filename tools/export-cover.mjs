import {createModels} from '../models.js';
import fs from 'node:fs';
const m=createModels()[0].getObjectByName('Rounded upper cloth cover');
const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry;
const uv=JSON.parse(fs.readFileSync(new URL('../assets/writing-bake-uv.json',import.meta.url)))[m.name];
fs.writeFileSync(new URL('./cover.json',import.meta.url),JSON.stringify({positions:[...g.attributes.position.array],normals:[...g.attributes.normal.array],uv}));
