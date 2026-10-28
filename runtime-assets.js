import {PORTFOLIO_ASSETS} from './content-data.js';
// Dynamic dependencies shared by the renderer and build: no separate stale list.
export const MODEL_ASSETS=['writing','architecture','research'].map(name=>({
 name,
 uv:`assets/${name}-bake-uv.json`,contact:`assets/${name}-contact-ao.png`
}));
export const CONTACT_LAYOUT='assets/contact-ao-layout.json';
export const DESK_NORMAL='assets/desk-metal-normal.png';
export const PROJECT_IMAGES=PORTFOLIO_ASSETS;
export const DYNAMIC_ASSETS=[...MODEL_ASSETS.flatMap(x=>[x.uv,x.contact]),CONTACT_LAYOUT,DESK_NORMAL,...PROJECT_IMAGES];
