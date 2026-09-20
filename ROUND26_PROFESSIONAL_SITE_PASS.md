# Round 26 — Full Professional UI / Interaction Pass

Base: Round 25 liquid-orb header.

This pass continues without reverting the existing Three.js scene, architecture materials, pointer spotlight, volumetric beam, or object transitions. The focus is the whole UI system, not another CSS glass patch.

## Primary references

### 1. Codrops — Infinite Liquid Glass Grid
https://tympanus.net/codrops/2026/09/08/building-an-infinite-liquid-glass-grid-with-three-js-webgpu-and-tsl/

Used for:
- separating crisp HTML text from the glass body,
- treating glass as a material problem (transmission / refraction / reflection / rim) rather than a backdrop-filter problem,
- subtle dispersion at the glass edge,
- motion that preserves material continuity.

### 2. Codrops Webzibition, page 2
https://tympanus.net/codrops/webzibition/page/2/

Used as the current curation pool rather than a single visual clone.

### 3. MERSI Architecture
https://www.mersi-architecture.com/

Used for:
- quiet-luxury restraint,
- avoiding excessive UI chrome around architectural work,
- making the project/object remain the visual center.

### 4. Oliver Gareis
https://www.olivergareis.com/

Used for:
- interaction-first portfolio pacing,
- motion-led information hierarchy,
- transitions that feel like one continuous experience instead of separate pages.

### 5. Antinomy Studio
https://www.antinomy.studio/

Used for:
- disciplined case-study hierarchy,
- strong separation of work / about / contact without adding decorative clutter,
- keeping typography and interface secondary to visual work.

### 6. Kononenko Architectural Bureau
https://kononenkogroup.com/

Used for:
- architectural index clarity,
- minimal navigation language,
- systematic information hierarchy.

### 7. Haoqi Wen
https://haoqi.design/

Used for:
- compact portfolio labeling,
- reduction of unnecessary interface components,
- treating interface and engineering as one system.

## Code architecture changes

### Removed the old CSS-glass implementation
Deleted:
- `dist/glass-ui.js`
- `dist/styles/glass.css`

The old `.glass-surface` system is no longer the source of glass material.

### Header — real Three.js liquid glass
Files:
- `dist/liquid-header.js`
- `dist/styles/liquid-header.css`

Features:
- collapsed central orb state,
- spring / damped expansion to full navigation,
- velocity-driven squash / stretch / wobble,
- MeshPhysicalMaterial transmission,
- dispersion,
- IOR / thickness / attenuation,
- additive rim shell,
- internal glass core,
- dedicated desktop caustic,
- secondary directional refracted streak,
- soft grounding shadow,
- HTML text retained as a crisp accessible overlay.

### Preview / Index / Dialog — 3D-backed glass panels
New file:
- `dist/liquid-panels.js`

The category panel, index panel and dialog no longer use fake CSS glass backgrounds. Their DOM rectangles are projected into camera space and matched by actual Three.js rounded glass objects.

Features:
- MeshPhysicalMaterial transmission,
- subtle dispersion,
- environment reflection,
- real depth / thickness,
- spring entrance and exit,
- camera-space projection that follows responsive DOM dimensions,
- no extra WebGL renderer,
- no post-processing stack.

### DOM motion layer
New file:
- `dist/ui-motion.js`

Used only for crisp text / image content:
- staggered preview information reveal,
- staggered index card reveal,
- dialog typography reveal,
- home-label entrance.

Uses the Web Animations API and transform/opacity/filter only; the 3D material motion remains in Three.js.

### Editorial / portfolio polish
New / revised:
- `dist/styles/professional-ui.css`

Changes:
- stronger hierarchy in preview navigation,
- cleaner filter interactions,
- quieter project index,
- more deliberate card/image hover movement,
- improved dialog typography,
- reduced decorative chrome,
- no new CSS glass simulation.

## Performance decisions

- One existing Three.js renderer remains the only renderer.
- 3D UI adds only a handful of rounded glass meshes.
- No bloom, SSAO, extra post-processing pipeline or second scene renderer was introduced.
- UI spring loops sleep when motion settles.
- DOM animations use composited transform / opacity.
- Existing transition-time reflection/shadow throttling remains in place.
- Existing capped DPR remains in place.

## Validation

Run after the full pass:
- syntax check on every `dist/*.js`
- syntax check on every `scripts/*.mjs`
- `node scripts/validate-assets.mjs`

Result:
- 31 meshes
- 11,848 triangles
- finite geometry
- valid glTF containers

## Environment limitation
Headless Chromium in the managed container still cannot initialize EGL/ANGLE, so a live WebGL screenshot cannot be produced reliably in this environment. This is an environment limitation; it is not substituted with a generated mockup.
