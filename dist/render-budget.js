// Measure sustained active-frame cadence, not gaps while the app is idle.
export function createRenderBudget(renderer,initialRatio){
 let previous=0,slow=0,frames=0,total=0,ratio=initialRatio;
 const diagnostics={activeFrames:0,meanActiveFrameMs:0,pixelRatio:ratio,resolutionDrops:0};
 return {diagnostics,frame(now){
  const ms=now-previous;previous=now;
  if(ms<5||ms>100)return false;
  frames++;total+=ms;diagnostics.activeFrames=frames;diagnostics.meanActiveFrameMs=total/frames;
  slow=ms>27?slow+1:Math.max(0,slow-2);
  if(slow<24||ratio<=.85)return false;
  ratio=Math.max(.85,ratio-.15);slow=0;renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight,false);
  diagnostics.pixelRatio=ratio;diagnostics.resolutionDrops++;return true;
 }};
}
