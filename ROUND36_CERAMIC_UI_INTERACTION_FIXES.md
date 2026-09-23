# Round 36 — Ceramic UI / Interaction / Detail-Card Fixes

This pass is based directly on Round 35 and changes only the issues called out in the latest review.

## 1. Main ceramic orb + expanded ceramic header
- `dist/liquid-header.js`
- Replaced the crystal/glass-heavy look with a much more opaque satin ceramic / milky PVC response.
- The collapsed state keeps a real spherical normal profile.
- The expanded state stays a long rounded rectangle, but now reads as ceramic/satin rather than wet glass.
- Existing desk caustic/reflection mapping is retained and neutralized so it no longer reads blue/glassy.

## 2. Header typography alignment
- `dist/styles/craft-inspired-ui.css`
- Rebuilt header baseline alignment around a fixed vertical center.
- Brand, coordinates, discipline nav and right nav now share a single optical center.
- Removed transform-based micro offsets that made type appear crooked.

## 3. Secondary-card / desk interaction
- `dist/floor-reflection.js`
- Added a dedicated ceramic-panel footprint to the floor shader.
- `dist/app.js` projects the secondary panel's screen-space bottom edge onto the actual desk plane and feeds that position/orientation into the floor shader.
- Hover increases the floor response subtly.
- This is a real scene-floor material interaction, not a CSS drop shadow.

## 4. Card flash fix
- `dist/ui-motion.js`
- Removed per-card GSAP blur/stagger entrance from secondary/tertiary UI.
- `dist/ui-view.js` now mounts panels/cards in a hidden `enter` phase and reveals them on the next task.
- No filter blur is used for category/index card mounting.

## 5. Fourth-level project UI no longer uses a blurred modal
- Added `#detail-card` to `dist/index.html`.
- Project clicks now open a large ceramic detail card on the right side of the third-level grid.
- The first two cards remain to its left in a 2-column layout.
- No page-wide background blur.
- ESC closes the detail card first.

## 6. Tertiary cards unified
- `dist/ui-view.js`
- Writing / Architecture / Research now all use the same project-card component and the same visual/material system.
- Removed the separate writing-row treatment and the oversized research-card treatment from active rendering.

## 7. Research paperclip position
- `dist/models.js`
- Moved the paperclip to the upper-right edge of the top research sheet.
- It now sits close to the paper edge instead of visually floating toward the page interior.

## 8. Hover lift now updates shadow/reflection
- `dist/app.js`
- Model lift motion now marks the directional-light shadow maps dirty while the object is moving.
- Shadow refreshes are staggered between the two shadow lights to avoid a single-frame double VSM spike.
- Planar floor reflection is refreshed while the object is lifting/falling.

## 9. Beam particles restored / strengthened
- Dust count increased from 22 to 36.
- Point-size range increased slightly.
- Beam-particle opacity raised while preserving a restrained look.

## 10. Runtime / performance changes
- Tertiary and fourth-level UI no longer use blur-based mount animation.
- Fourth-level project detail no longer invokes modal backdrop blur.
- Category-panel floor interaction only notifies WebGL on pointer enter/leave; pointer-position sheen stays CSS-only.
- All continuous rendering remains under the single shared frame runtime.

## Validation
- All `dist/*.js` and `scripts/*.mjs` pass `node --check`.
- Runtime audit: `singleFrameDriver: true`, `nonRuntimeRaf: 0`.
- Asset validation: 31 meshes / 11,848 triangles / finite geometry / valid glTF containers.
