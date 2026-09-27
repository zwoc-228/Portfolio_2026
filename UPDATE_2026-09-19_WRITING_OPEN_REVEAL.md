# Update — 2026-09-19 Writing material / opening pass

## Scope
This round only focuses on **Writing** as requested:
1. fix the far-view page-edge aliasing / mosaic issue
2. rebuild Writing materials to feel more refined without hurting performance
3. make Writing **open** in preview instead of only moving the camera
4. add a **white → real material reveal** transition

## What changed

### 1) Page-edge aliasing fix
- Removed the previous stack of **32 individual page-edge meshes** that caused moiré / shimmering at distance.
- Replaced it with:
  - one clean lower page block
  - five broader page bands for readable layered edges
  - one upper page block for the opening state
- Result: fewer tiny parallel lines, cleaner silhouette, lower draw-call pressure.

### 2) Writing material upgrade
- Added dedicated Writing materials with reveal states:
  - `Writing linen`
  - `Writing paper`
  - `Writing page edges`
  - `Writing ribbon`
  - `Writing elastic`
- Each of these now stores a **closed/minimal** state and a **revealed/material** state.
- In the closed state the book stays close to an abstract white object.
- In hover / preview the cloth, paper fiber, roughness variation and sheen are gradually revealed.

### 3) Click / preview opening behavior
- Writing now has dedicated articulated parts:
  - `Top cover pivot`
  - `Top pages pivot`
  - `Upper page block`
  - `Preview leaf pivot 0..3`
- In `#writing/preview`, the book opens automatically:
  - upper cover swings open
  - top page block opens partially
  - a few visible pages fan out
  - elastic band relaxes slightly
  - ribbon shifts subtly

### 4) Performance-conscious implementation
- The opening effect uses a small number of articulated parts rather than a heavy page-by-page simulation.
- Material reveal is implemented by animating existing material properties (color / roughness / bump / normal / sheen / clearcoat), not by loading extra heavy assets.
- This should improve far-view stability while keeping interaction smooth.

## Files changed
- `dist/models.js`
- `dist/app.js`

## Notes
- Architecture and Research were intentionally left unchanged in this round.
- This pass is designed as the foundation for the later higher-end material pass across all three models.
