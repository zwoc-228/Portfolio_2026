// Dynamic dependencies shared by the renderer and build: no separate stale list.
export const MODEL_ASSETS=['writing','architecture','research'].map(name=>({
 name,atlas:`assets/${name}${name==='architecture'?'-studio-baked.jpg':name==='writing'?'-studio-round53.png':'-studio-clean.png'}`,
 uv:`assets/${name}-bake-uv.json`,contact:`assets/${name}-contact-ao.png`
}));
export const CONTACT_LAYOUT='assets/contact-ao-layout.json';
export const DESK_NORMAL='assets/desk-metal-normal.png';
export const PROJECT_IMAGES=Array.from({length:10},(_,i)=>`assets/index-${i}.png`);
export const DYNAMIC_ASSETS=[...MODEL_ASSETS.flatMap(x=>[x.atlas,x.uv,x.contact]),CONTACT_LAYOUT,DESK_NORMAL,...PROJECT_IMAGES];
