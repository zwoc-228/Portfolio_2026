# Round 23 — full UI audit, reference-led rebuild, and code refactor

Base: `Portfolio_2026_round22_material-swap.zip`, with the Architecture emissive windows removed as requested.

This pass treats the UI as one system rather than stacking another round of CSS overrides on top of the previous stylesheet.

## 1. Global audit: remove accumulated CSS override debt

### Problem found
The previous `dist/style.css` contained many chronological blocks (`Round 14`, `Round 18`, `Round 19`, `Round 20`, `Round 21`, etc.) redefining the same selectors. The final appearance depended on source order and repeated specificity rather than a coherent component system.

### Change
The stylesheet was rebuilt into five layers:

- `dist/styles/tokens.css` — typography, color, spacing, material tokens
- `dist/styles/base.css` — reset, canvas, shared primitives
- `dist/styles/glass.css` — one reusable glass-material system
- `dist/styles/views.css` — HOME / preview / index / dialog layout
- `dist/styles/responsive.css` — aspect ratio and mobile rules
- `dist/style.css` now only imports these modules

### References / tools
- MDN `backdrop-filter`: https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter
- Codrops backdrop-filter reference: https://tympanus.net/codrops/css_reference/backdrop-filter/
- Dine: https://dinehq.com/

## 2. HOME header: rebuild as a material object

### Problem found
The former header was essentially a blurred translucent bar with multiple gradient patches. It read as a flat overlay and did not have a consistent sense of thickness.

### Change
The header now uses the shared `.glass-surface` material with:

- frosted background transmission via `backdrop-filter`
- a separate top-edge sheen layer
- inner upper and lower rim highlights
- low-contrast depth shadow
- pointer-relative specular response via CSS custom properties (`--glass-x`, `--glass-y`)
- a separately modeled glass home orb with a bright upper-left reflection and interior core

No additional WebGL render pass is used for the UI.

### References / tools
- Codrops, Endless Interactive Glass Xylophone: https://tympanus.net/codrops/2026/08/04/building-an-endless-interactive-glass-xylophone-with-three-js/
- Codrops, Infinite Liquid Glass Grid: https://tympanus.net/codrops/2026/09/08/building-an-infinite-liquid-glass-grid-with-three-js-webgpu-and-tsl/
- Dine: https://dinehq.com/
- MDN `backdrop-filter`: https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter

### Technique adopted / not adopted
The Codrops examples use shader/refraction techniques for actual 3D glass. For this DOM navigation, a new WebGL refraction buffer would be excessive. The rebuild therefore borrows the optical cues — transmitted background, edge definition, grazing highlights, local specular response — using CSS and one RAF-batched pointer update.

## 3. HOME labels and chrome cleanup

### Problem found
The old DOM still contained hidden legacy blocks for the lower-left introduction and lower-right instruction/city information, even though CSS later suppressed them.

### Change
Removed those obsolete DOM nodes completely. HOME now contains only:

- top navigation
- three object labels
- copyright
- the 3D scene

The three labels retain their perspective/rotation relationships but use one consistent typography system.

### Reference
- Dine, restrained interface density and project-first hierarchy: https://dinehq.com/

## 4. Preview side panel: same glass material, different geometry

### Problem found
The preview panel and header had separately authored glass recipes, so they did not look like the same material.

### Change
The preview side panel now uses the exact same `glass-surface` material tokens as the header. Only radius, size, and layout differ. Filter states are simplified and active items shift by only 3 px rather than introducing a new visual effect.

### References
- Codrops glass xylophone: https://tympanus.net/codrops/2026/08/04/building-an-endless-interactive-glass-xylophone-with-three-js/
- Dine: https://dinehq.com/

## 5. Archive / index: convert the whole content area into the same material family

### Problem found
The index view previously switched to a different visual language and had a flat page-like background.

### Change
The archive now keeps the persistent 3D scene faintly visible behind a large glass content surface. Image cards remain opaque content but the surrounding UI reads as the same glass material as the navigation and side panel.

### References
- Codrops seamless 3D transitions: https://tympanus.net/codrops/2026/03/18/building-seamless-3d-transitions-with-webflow-gsap-and-three-js/
- Dine: https://dinehq.com/

## 6. Dialog / About / Contact: unify with the site material

### Problem found
The dialog had yet another separate glass recipe.

### Change
`dialog` now uses `.glass-surface--dialog`; the modal backdrop is a restrained blur and dim layer. The close control, typography, and spacing match the same interface system.

### References
- MDN / browser-native backdrop filtering: https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter
- Codrops overlay/dialog background technique: https://tympanus.net/codrops/2013/11/07/css-overlay-techniques/

## 7. UI interaction code: split DOM work away from the Three.js scene

### Problem found
Content data, DOM generation, modal generation, and Three.js scene logic all lived in `dist/app.js`.

### Change
Created:

- `dist/content-data.js` — navigation categories and placeholder project metadata
- `dist/ui-view.js` — render filters, archive rows/cards, dialog content, and view-state DOM changes
- `dist/glass-ui.js` — pointer-reactive material highlight, RAF-batched

`app.js` remains the scene/orchestration module and calls these UI modules.

### References / tools
- ES modules / vanilla JS; no framework added
- GSAP `quickTo` was reviewed as a pattern for high-frequency pointer updates, but GSAP was not added because this UI needs only one CSS-variable update per animation frame: https://gsap.com/docs/v3/GSAP/gsap.quickTo%28%29/

## 8. 3D transition audit: keep one persistent scene

### Problem found
No reload/reconstruction bug was found in the current transition architecture. The scene already persists across HOME / preview / index, and the expensive planar reflection and shadow updates are throttled while moving.

### Change
The persistent scene behavior is retained. DOM UI restructuring does not recreate the Three.js renderer or models.

### References
- Codrops, persistent Three.js scene + seamless transitions: https://tympanus.net/codrops/2026/03/18/building-seamless-3d-transitions-with-webflow-gsap-and-three-js/
- Three.js `WebGLRenderer`: https://threejs.org/docs/#api/en/renderers/WebGLRenderer

## 9. Render-cost audit

### Preserved performance choices
- no new post-processing pass for UI glass
- no new FBO for DOM glass
- renderer DPR cap remains 1.28 on normal hardware and 1.0 on low-power hardware
- planar reflection is still throttled during object transitions
- shadow-map refresh remains throttled during object transitions
- glass pointer response changes CSS custom properties only
- mobile glass blur is reduced

### References
- Three.js responsive rendering / pixel ratio guidance: https://threejs.org/manual/#en/responsive
- Three.js WebGLRenderer docs: https://threejs.org/docs/#api/en/renderers/WebGLRenderer

## 10. Architecture model

### Change
The four warm emissive window meshes requested in the previous round are removed. The Marble021, Metal044A, Plastic013A, copper, clear acrylic, geometry, scale, lighting, pointer spotlight, volumetric beam and scene reflections remain.

### Material reference
- Three.js `MeshPhysicalMaterial`: https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial

## 11. Responsive / accessibility audit

### Change
- consolidated desktop, wide-screen, tablet and mobile breakpoints
- added semantic primary navigation label
- added `type="button"` to generated archive/filter buttons
- kept keyboard focus visibility
- retained reduced-motion path
- lazy-decodes index images
- removed duplicate and obsolete DOM nodes
- verified no duplicate IDs

## Files materially changed

- `dist/index.html`
- `dist/style.css`
- `dist/styles/tokens.css`
- `dist/styles/base.css`
- `dist/styles/glass.css`
- `dist/styles/views.css`
- `dist/styles/responsive.css`
- `dist/glass-ui.js`
- `dist/ui-view.js`
- `dist/content-data.js`
- `dist/app.js`
- `dist/models.js`
- `dist/models/architecture.glb`
- `dist/models/portfolio-scene.glb`

## Validation performed

- `node --check` on app/UI/model JavaScript modules
- `node scripts/export-models.mjs`
- `node scripts/validate-assets.mjs`
- HTML duplicate-ID check
- stale Architecture emissive-window string search

Current model validation:

- 31 meshes
- 11,848 triangles
- geometry finite
- glTF containers valid

## Important visual-QA note

The managed container cannot reliably complete a live Chromium WebGL screenshot for this project, so no generated image is being presented as a browser screenshot. Code/asset validation is real; final browser visual QA should be done after deploying this package or running `npm run dev` locally.
