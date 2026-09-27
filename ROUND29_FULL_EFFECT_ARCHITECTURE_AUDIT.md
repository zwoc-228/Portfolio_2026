# Round 29 — Full-effect architecture rebuild

## Non-negotiable constraint
This pass keeps the complete visual-effect set. It does **not** solve performance by deleting or weakening effects.

Preserved/restored at full strength:
- pointer spotlight
- volumetric cone
- airborne dust particles (22 particles on all devices)
- object hover lift
- desk pointer glow
- liquid orb → expanded header
- RGB glass refraction / dispersion approximation
- liquid preview/index/dialog panels
- desk UI caustic
- planar desk reflection at 1024×576, HalfFloat, MSAA samples=2, mipmaps
- 5×5 = 25-tap floor-reflection blur
- both shadow-casting directional lights (2048² + 1024²)
- Writing material reveal
- Architecture / Writing / Research material system
- HOME → preview → index transitions
- staggered UI text/card reveals

Round 27 had already reduced lighting values; those reductions are explicitly reverted here:
- renderer exposure: restored to 1.20
- scene environment intensity: restored to 1.42
- desk environment intensity: restored to 3.10
- desk roughness: restored to .43
- volumetric beam opacity: restored to hover .050 / floor .046
- dust opacity: restored to hover .13 / floor .10

## External benchmark sites / technical references

### 1. MERSI Architecture — Codrops case study
https://tympanus.net/codrops/2026/07/27/between-print-and-digital-the-making-of-mersis-website/

Relevant production patterns:
- Vite + custom vanilla JS is sufficient for an award-level architecture site.
- GSAP is the animation center; Webflow is only the publishing/CMS layer.
- transitions are deliberately orchestrated rather than split across ad-hoc loops.
- dimensions are calculated after `document.fonts.ready` to avoid layout jumps.
- interaction is treated as part of the architectural/editorial language.

Why it matters here:
- moving to React purely for fashion would not solve the current problem.
- the failure was orchestration, not the JavaScript language.

### 2. Trionn — Codrops technical case study
https://tympanus.net/codrops/2026/07/15/the-architecture-behind-trionn-coordinating-gsap-three-js-lenis-and-web-audio/

Relevant production patterns:
- GSAP is the center of the motion system.
- direct Three.js was deliberately chosen instead of React Three Fiber for shared render-loop/resource control.
- rendering only runs while interaction / transitions are active.
- shader and texture warm-up happens before the first visible interaction.
- expensive systems are coordinated by shared state rather than maintaining independent RAF loops.
- non-critical work is deferred with `requestIdleCallback`.
- their closing lesson explicitly recommends a shared canvas manager.

Why it matters here:
Round 27 had several independent animation loops. That is the main architecture defect corrected in Round 29.

### 3. HAOQI.DESIGN — DOM and WebGL on one frame
https://tympanus.net/codrops/2026/08/15/inside-haoqi-design-letting-dom-and-webgl-share-a-retro-futurist-stage/

Relevant production patterns:
- DOM and WebGL need one timing source.
- multiple RAF owners create one-frame lag and inconsistent interaction.
- global input is normalized once and consumed by all effects.
- glass refraction is handled by explicit background capture + shader sampling.
- expensive visual systems stop when they cannot affect the visible result.
- DOM owns readable text/accessibility; WebGL owns refraction and spatial effects.

Why it matters here:
Round 29 keeps text as DOM and moves all glass rendering into explicit screen-space shader overlays.

### 4. Infinite Liquid Glass Grid — Codrops
https://tympanus.net/codrops/2026/09/08/building-an-infinite-liquid-glass-grid-with-three-js-webgpu-and-tsl/

Relevant production patterns:
- fake glass is often cheaper and more controllable than physical transmission geometry.
- signed-distance rounded shapes, normal-from-height, RGB refraction offsets, Fresnel and rim lighting form the glass language.
- real HTML can remain crisp on top of GPU glass.
- one-pass custom shader logic is preferable when the desired visual is art-directed rather than a full optical simulation.

Why it matters here:
Preview / Index / Dialog no longer use `MeshPhysicalMaterial.transmission`, which caused Three.js to create its own transmission buffer. They now use the same explicit screen-space glass language as the header.

## Code audit: Round 27 failure points

### A. Too many independent frame owners
Round 27 custom modules contained 12 `requestAnimationFrame` calls across:
- app interaction loop
- page transition loop
- liquid header loop
- liquid panel loop
- UI motion callbacks

Each subsystem decided independently when to render.

Round 29:
- **0 RAF calls outside `frame-runtime.js`**.
- `frame-runtime.js` is the single fallback driver.
- when GSAP 3.15 is available, it uses `gsap.ticker` instead.

### B. Main scene was rendered multiple times by unrelated UI systems
Round 27 liquid panels used `MeshPhysicalMaterial.transmission`, adding internal transmission rendering on top of:
- main scene render
- planar desk reflection render
- header framebuffer capture / overlay

Round 29:
- panel physical-transmission materials are removed.
- header / preview / index / dialog use explicit framebuffer capture + screen-space glass shaders.
- all captures happen after the main scene render and before overlays, so the compositor owns the order.

### C. Broad MutationObserver
Round 27 observed `document.body` with `subtree:true` for multiple attributes and could retrigger geometry/layout sync from unrelated UI mutations.

Round 29:
- body observer watches only body `class`.
- category observer watches only `hidden`.
- dialog observer watches only `open`.
- ResizeObserver handles actual surface-size changes.

### D. Shader/texture initialization hitch
Round 27 left first-time shader compilation and GPU upload on the interaction path.

Round 29:
- calls `renderer.compile(scene,camera)` after construction.
- warms the planar reflection before settled interaction.
- schedules a second compile in `requestIdleCallback` / timeout fallback.

### E. Animation system
Round 27 mixed homegrown springs, Web Animations API, multiple RAF loops and DOM mutation callbacks.

Round 29 upgrades the motion toolchain to **GSAP 3.15**:
https://www.npmjs.com/package/gsap

- GSAP ticker is the preferred frame driver.
- DOM entrance animations use GSAP when available.
- there is a complete native fallback if the CDN is unavailable.

## Why the language/framework was not changed
React/R3F was evaluated, but this pass deliberately stays with direct Three.js.

Reasons:
1. Trionn explicitly chose direct Three.js for shared render-loop and resource control in a similarly effect-heavy award-winning site.
2. React Three Fiber v10's WebGPU track is still alpha in September 2026.
3. The current site is small (31 meshes / 11,848 triangles). Its bottleneck is orchestration and redundant rendering, not declarative scene construction.
4. Rewriting the same effects into React would add migration risk without removing the core GPU work.

The toolchain upgrade is therefore **GSAP 3.15 + a shared render runtime + screen-space shader compositor**, rather than a language migration for its own sake.

## Three.js version decision
The bundled renderer is Three.js r170. Current Three.js is newer, but the official migration guide recommends updating older projects in increments of 10 releases because deprecations are removed after that window. Preserving every visual effect while simultaneously jumping renderer generations would combine two unrelated risk surfaces.

Therefore Round 29 separates concerns:
- first: fix architecture, synchronization and rendering ownership with the current renderer;
- later: migrate Three.js in controlled steps with visual regression tests.

Reference:
https://github.com/mrdoob/three.js/wiki/Migration-Guide

## Measured static architecture delta

Round 27 custom JS:
- 12 `requestAnimationFrame` references
- 4 `cancelAnimationFrame` references
- 4 `MeshPhysicalMaterial` construction sites
- liquid panels used physical transmission

Round 29 custom JS:
- 3 RAF references, **all inside the single fallback runtime**
- 0 RAF references outside the runtime
- liquid header and all liquid panels use screen-space framebuffer glass
- one main render decision per frame

`scripts/audit-runtime.mjs` enforces the single-driver condition.

## Validation performed
- `node --check` on every `dist/*.js` file
- `node scripts/validate-assets.mjs`
- `node scripts/audit-runtime.mjs`

Asset validation remains:
- 31 meshes
- 11,848 triangles
- finite geometry
- valid glTF containers

## Important environment limitation
The managed Chromium in this workspace cannot initialize its EGL/ANGLE WebGL backend, so a trustworthy live WebGL screenshot cannot be generated here. No generated image is being passed off as a browser screenshot.
