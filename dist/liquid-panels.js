import {FRAME_ACTIVE,FRAME_RENDER,FRAME_REFLECTION} from './frame-runtime.js';
// UI surfaces are one shared DOM material. Keep their physical reflection poses in sync
// throughout CSS entry/exit and scrolling; no duplicate WebGL card skins or captures.
export function createLiquidPanels({runtime,onLayout}){
 let remaining=0;
 const wake=()=>{remaining=.32;runtime.request(FRAME_RENDER|FRAME_REFLECTION|FRAME_ACTIVE);};
 const root=document.querySelector('#category');
 const observer=new MutationObserver(wake);observer.observe(root,{subtree:true,attributes:true,childList:true,attributeFilter:['class','hidden','data-phase']});observer.observe(document.body,{attributes:true,attributeFilter:['class']});
 const resize=new ResizeObserver(wake);resize.observe(root);
 root.addEventListener('scroll',wake,true);root.addEventListener('pointerover',wake);root.addEventListener('pointerout',wake);
 const remove=runtime.add(dt=>{if(remaining<=0)return 0;remaining-=dt;onLayout?.();return FRAME_RENDER|FRAME_REFLECTION|(remaining>0?FRAME_ACTIVE:0);});
 return {syncLayout:wake,dispose(){observer.disconnect();resize.disconnect();root.removeEventListener('scroll',wake,true);root.removeEventListener('pointerover',wake);root.removeEventListener('pointerout',wake);remove();}};
}
