# Round 25 — Liquid Header Refinement

## Focus of this pass
Further refine the new orb-to-header interaction introduced in Round 24, specifically:
1. smoother orb → expanded glass-bar motion,
2. stronger desk feedback under the UI,
3. less CSS-fake and more Three.js-driven material response.

## Reference carried forward
- Codrops — Building an Infinite Liquid Glass Grid with Three.js, WebGPU, and TSL
  https://tympanus.net/codrops/2026/09/08/building-an-infinite-liquid-glass-grid-with-three-js-webgpu-and-tsl/

## What changed
### 1) Reworked the animation model from simple lerp to spring-like motion
- `dist/liquid-header.js`
- Replaced the previous one-step lerp feel with a spring/damped velocity update.
- Added a small wobble value driven by animation velocity so the orb and glass bar feel softer and less mechanical.

### 2) Improved the 3D glass object itself
- The main pill geometry is slightly thicker and more readable.
- Added a dedicated top rim glow plane to better read as glossy glass.
- The orb core now stretches/squashes subtly during motion.

### 3) Improved desk feedback
- Kept the main broad caustic plane.
- Added a second directional streak plane to make the refraction on the desk feel more deliberate.
- Added a soft shadow plane beneath the orb/bar so the UI feels more grounded on the metal surface.

### 4) Synced DOM and 3D motion more carefully
- DOM text still serves as crisp overlay content.
- Orb button now receives motion scaling via CSS vars instead of brute-force transform replacement.
- The header continues to expand/collapse from the orb state, but now with more physical continuity.

## Files touched
- `dist/liquid-header.js`
- `dist/styles/liquid-header.css`

## Notes
This is still inside the current Three.js architecture rather than a full WebGPU/TSL rewrite. The goal of this pass was to push the interaction quality forward immediately without destabilizing the rest of the site.
