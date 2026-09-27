# Update — 2026-09-19 typography + pointer glow

## Changes
- Lightened HOME typography over the dark metal plane while preserving hierarchy.
- Added a pointer-following glow to the infinite metal plane.
- The glow is driven by a world-space raycast onto the floor, so it tracks the actual 3D plane rather than the screen.
- The glow subtly lowers local roughness and adds a restrained cool-white lift, making the metal feel responsive instead of adding a flat 2D overlay.
- Pointer movement is smoothed with easing.
- Pointer glow rerenders only the main scene while moving; the expensive 2K planar reflection capture is not recalculated on every mouse event.
- Glow fades out when the pointer leaves the canvas or when the user leaves HOME.

## Files changed
- `dist/style.css`
- `dist/app.js`
- `dist/floor-reflection.js`
