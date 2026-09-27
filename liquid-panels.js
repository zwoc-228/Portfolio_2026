import {FRAME_ACTIVE,FRAME_RENDER,FRAME_REFLECTION} from './frame-runtime.js';

// DOM transitions run independently. The expensive planar reflection is rebuilt once
// after layout settles instead of on every hover/mutation frame.
export function createLiquidPanels({runtime,onLayout}){
  let remaining=0,dirty=false;
  const wake=()=>{
    remaining=.12;dirty=true;
    runtime.request(FRAME_RENDER|FRAME_ACTIVE);
  };
  const root=document.querySelector('#category');
  const observer=new MutationObserver(wake);
  observer.observe(root,{subtree:true,attributes:true,childList:true,attributeFilter:['class','hidden','data-phase']});
  observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  const info=document.querySelector('#info');
  if(info)observer.observe(info,{attributes:true,childList:true,subtree:true,attributeFilter:['open']});
  const resize=new ResizeObserver(wake);
  resize.observe(root);
  root.addEventListener('scroll',wake,{passive:true,capture:true});
  const remove=runtime.add(dt=>{
    if(!dirty)return 0;
    remaining-=dt;
    if(remaining>0)return FRAME_ACTIVE;
    dirty=false;onLayout?.();
    return FRAME_RENDER|FRAME_REFLECTION;
  });
  return {
    syncLayout:wake,
    dispose(){
      observer.disconnect();resize.disconnect();
      root.removeEventListener('scroll',wake,true);
      remove();
    }
  };
}
