// Matte surfaces need a hover state, not per-pointer texture coordinates.
export function initSurfaceLightInteraction(){
 const header=document.querySelector('.site-header');
 header?.addEventListener('pointermove',e=>{const r=header.getBoundingClientRect();header.style.setProperty('--surface-x',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');},{passive:true});
 const gallery=document.querySelector('#index-content');
 gallery?.addEventListener('pointermove',e=>{const card=e.target.closest('.project-card');if(!card)return;const r=card.getBoundingClientRect();card.style.setProperty('--surface-x',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');card.style.setProperty('--surface-y',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');},{passive:true});
 const panel=document.querySelector('.category-panel');if(!panel)return;
 let active=false;
 const set=next=>{if(active===next)return;active=next;panel.classList.toggle('is-lit',next);window.dispatchEvent(new CustomEvent('ui-panel-light',{detail:{active:next}}));};
 panel.addEventListener('pointerenter',()=>set(true),{passive:true});
 panel.addEventListener('pointerleave',()=>set(false),{passive:true});
}
