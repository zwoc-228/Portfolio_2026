# Round 34 — Calm ceramic/PVC secondary UI

Base: Round 33.

This pass follows the approved normal-angle rounded-rectangle card direction. No scene-model, lighting, material-texture, spotlight, floor-reflection, or transition system changes were made.

## Changes
- Added a short category statement between category title and project/category choices.
- Reduced secondary-title typography to a calmer 31–38 px range.
- Reduced top-header typography from the oversized Round 33 values.
- Replaced the secondary panel's stronger frosted-glass look with a mostly opaque satin PVC / ceramic-coated surface.
- Removed the perspective tilt. The card now sits at a normal, calm angle.
- Added subtle pointer-position light response using CSS variables, without adding another render loop.
- Added a soft contact/reflection footprint beneath the card.
- Darkened text on the light card for stronger legibility and cleaner hierarchy.
- Kept active project/category rows as thin luminous inserts rather than glass blocks.
- Enlarged the secondary card moderately to fill the previous dead space without making typography oversized.
- Kept the existing 3D scene, orb/header shader, desktop metal, model materials, spotlight/beam, and runtime performance architecture unchanged.

## New files
- `dist/styles/round34-calm-ceramic.css`
- `dist/ui-surface.js`

## Edited files
- `dist/index.html`
- `dist/content-data.js`
- `dist/ui-view.js`
- `dist/app.js`
- `dist/style.css`

## Validation
- JS syntax: passed
- Model validator: 31 meshes / 11,848 triangles / finite geometry / valid glTF
- Runtime audit: single frame driver and existing performance checks passed

## Preview limitation
The local Chromium build in this container cannot initialize its EGL/ANGLE WebGL backend, so a trustworthy live WebGL screenshot cannot be captured here. The code package itself is complete and validated statically.
