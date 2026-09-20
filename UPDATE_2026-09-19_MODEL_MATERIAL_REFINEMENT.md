# Update — 2026-09-19 model detail + material refinement pass

## Focus
This pass pushes the object materials and micro-detail toward a cleaner high-end neumorphic / Fluent-leaning direction while keeping the authored three-object composition intact.

## What changed

### 1) Writing object
- Linen cover refined to read more like fine cloth-bound material.
- Reduced coarse relief; added normal-based textile detail for tighter surface response.
- Increased cover crown / subtle warping for a less blocky silhouette.
- Page leaf variation slightly increased for more natural sheet separation.

### 2) Architecture object
- White mineral blocks retuned to feel cleaner and softer.
- Acrylic materials adjusted for clearer edge definition and more premium translucent response.
- Copper mass refined toward a subtler satin metallic finish.
- Dark mineral material made cleaner and less muddy.

### 3) Research object
- Added paper roughness map and finer surface normal.
- Increased sheet-to-sheet positional variation slightly so the stack feels less cloned.
- Paperclip made a little thinner and cleaner.

### 4) Browser scene / material hookup
- `dist/app.js` now loads additional normal / roughness maps for object materials.
- Light rig slightly tuned again to support cleaner specular response.

## New / updated assets
- `dist/assets/paper-rough.png`
- updated use of:
  - `linen-normal.png`
  - `paper-normal.png`
  - `stone-normal.png`

## Regenerated
- `dist/models/writing.glb`
- `dist/models/architecture.glb`
- `dist/models/research.glb`
- `dist/models/portfolio-scene.glb`

## Notes
This pass refines materials and authored mesh detail. It does not yet fully re-fit object positions against the final static home reference.
