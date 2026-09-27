# Round 43 — boot stability + material/header coherence

## Fixed

1. **First-load visual glitch**
   - Added an inline critical boot curtain before the external stylesheet loads.
   - The renderer is now sized and the camera aimed before any runtime client can draw.
   - Initial hash routing is applied without an unnecessary HOME→HOME transition.
   - Fonts, model assets, baked architecture, contact AO and the first floor-reflection pass are prepared before the boot curtain fades.

2. **Writing / Architecture / Research material mismatch**
   - Removed beige albedo maps from the HOME-facing Writing and Research materials while retaining their normal/roughness microstructure.
   - Rebalanced the notebook cloth, paper faces and page edges to the Architecture model's warm neutral maquette range.
   - Raised restrained environment/specular response so Writing and Research no longer read as darker paper props next to the brighter architectural model.

3. **Ball → header alignment/material continuity**
   - Ball and header now share one 42 px vertical screen anchor during morphing.
   - Removed the duplicate CSS pseudo-element card that had been drawn on top of the WebGL porcelain header.
   - Exported a single shared glazed-porcelain PBR material for the sphere and the header's physical reflection proxy.
   - Re-tuned the WebGL header shader to the same warm ivory / clear-coat response.

4. **Ball/header interaction with the desk**
   - Removed the analytical screen-space header glare from the desk.
   - Added a reflection-only 3D ceramic header proxy rendered by the same mirror camera and blur pass as the sphere and 3D objects.
   - Extended floor reflection handling so persistent header reflection geometry and dynamic UI-card reflection geometry can coexist.

## Verification

`npm run check` passes (19 JS modules, 71 local references, 4 regression suites).
