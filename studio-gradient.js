import * as T from './assets/three.module.js';

// A single, reliable smooth studio-sweep gradient (bright cove where the floor
// curves into the backdrop, softly darker toward the corners and top) used both
// as the scene background and baked into the backdrop surface. This replaces
// relying purely on the physical light rig for a smooth look: the rig still
// lights the objects, but the backdrop itself always reads as one continuous
// photographic gradient instead of showing the rig's hard-edged card seams.
export function createStudioGradientTexture(){
 const w=1024,h=1024,c=document.createElement('canvas');c.width=w;c.height=h;
 const ctx=c.getContext('2d');

 // Base vertical sweep: paper white near the cove/horizon, gently deepening
 // toward the top of the frame (a classic infinity-cove falloff).
 const vertical=ctx.createLinearGradient(0,0,0,h);
 vertical.addColorStop(0,'#d9d9d9');
 vertical.addColorStop(.42,'#eeeeee');
 vertical.addColorStop(.58,'#f1f1f1');
 vertical.addColorStop(1,'#c9c9c9');
 ctx.fillStyle=vertical;ctx.fillRect(0,0,w,h);

 // Soft radial glow centered on the cove line to mimic large diffused softboxes,
 // with no hard edges anywhere in the falloff.
 const radial=ctx.createRadialGradient(w*.5,h*.46,h*.02,w*.5,h*.46,h*.75);
 radial.addColorStop(0,'rgba(255,255,255,.55)');
 radial.addColorStop(.5,'rgba(255,255,255,.16)');
 radial.addColorStop(1,'rgba(255,255,255,0)');
 ctx.fillStyle=radial;ctx.fillRect(0,0,w,h);

 // Gentle vignette so the extreme corners recede, again fully smooth (no bands).
 const vignette=ctx.createRadialGradient(w*.5,h*.5,h*.55,w*.5,h*.5,h*.78);
 vignette.addColorStop(0,'rgba(0,0,0,0)');
 vignette.addColorStop(1,'rgba(0,0,0,.10)');
 ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);

 const tex=new T.CanvasTexture(c);
 tex.colorSpace=T.SRGBColorSpace;
 tex.needsUpdate=true;
 return tex;
}
