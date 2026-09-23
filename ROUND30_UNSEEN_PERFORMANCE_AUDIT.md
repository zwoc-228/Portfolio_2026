# Round 30 — Full performance audit against Unseen Studio patterns

## Why Round 29 was still laggy
The main issue was not the number of meshes (31 meshes / 11,848 triangles is modest). The expensive work was concentrated in the render pipeline:

1. **Floor reflection blur was paid on every fullscreen floor pixel, every rendered frame.**
   - Round 29 sampled the planar reflection 25 times inside the floor fragment shader.
   - At a 1792×850 viewport with DPR 1.28, that is roughly 2.5M shaded pixels. The floor reflection alone could therefore exceed ~62M reflection texture reads per main frame before the normal PBR work.
   - Round 30 moves the blur into a 1024×576 separable pre-blur pass that only runs when the planar reflection itself updates. The floor now performs one reflection lookup per pixel.

2. **Glass UI background capture was coupled to every scene render.**
   - Round 29 copied framebuffer regions for the liquid header/panels even when only the dust particle clock was changing.
   - Round 30 introduces `FRAME_CAPTURE`, so glass background copies happen only when the background behind the glass actually changes: pointer/spotlight settling, model transitions, resize, view changes, or material reveal.

3. **HOME Architecture acrylic triggered Three.js transmission rendering during the most interactive state.**
   - Three.js physical transmission requires an additional scene buffer/render path.
   - Round 30 uses a perceptual HOME optical proxy for the small acrylic volumes, then restores the original true-transmission materials in Architecture preview. The visible glass effect remains; the expensive physical refraction is reserved for the view where it is actually legible.
   - Both material variants are warmed so swapping does not introduce a first-use shader hitch.

4. **Two VSM shadow maps refreshed in the same frame during transitions.**
   - Round 30 keeps both 2048² and 1024² shadow maps but staggers their refreshes across different frames.
   - The planar reflection refresh is offset from shadow-refresh frames, so the three expensive operations no longer spike together.

5. **Pointer hit testing raycast every visible triangle.**
   - Round 30 replaces full mesh raycasts with three precomputed AABB interaction volumes.
   - The 3D models, hover response and hit areas remain; only the interaction test is cheaper.

## What was NOT reduced
- main render DPR cap remains 1.28 on normal devices
- primary VSM shadow stays 2048²
- secondary VSM shadow stays 1024²
- pointer spotlight remains
- volumetric beam remains
- dust particles remain at 22
- HOME model hover/lift remains
- 1024×576 HalfFloat planar reflection remains
- 2× MSAA on the raw planar reflection remains
- liquid-glass SDF/refraction/rim shaders remain
- Architecture true physical transmission remains in Architecture preview
- existing Marble021 / Metal044A / Plastic013A appearance remains

## Unseen Studio comparison
### Unseen Superlist
https://unseen.co/projects/superlist/
Unseen explicitly describes removing invisible model faces with a Houdini tool, baking animation, and using lightweight matcap textures. The key principle is not “remove the visual idea,” but move expensive work offline and make the runtime pay only for visible results.

### Unseen Crosswire case study
https://tympanus.net/codrops/2023/04/04/case-study-crosswire/
Relevant patterns:
- instancing repeated geometry
- baked/matcap lighting instead of expensive real-time reflection when possible
- custom frustum visibility logic
- shader effects integrated into existing materials rather than extra geometry/passes

### Unseen Cellular experiment
https://tympanus.net/codrops/2025/09/11/when-cells-collide-the-making-of-an-organic-particle-experiment-with-rapier-three-js/
Unseen states that each calculation should be justified by something visible on screen and bounds computation to only the visible area. Round 30 applies the same rule to glass captures, raycasting, and transmission.

### Unseen FEB / internal boilerplate
https://feb.unseen.co/
Their public front-end boilerplate separates WebGL, global events, smooth scrolling, GSAP, Taxi and reusable components. The project already moved toward the same ownership model in Round 29; Round 30 fixes the remaining GPU-cost issues rather than adding more animation drivers.

### Unseen Taxi / event architecture
https://github.com/craftedbygc/taxi
https://github.com/craftedbygc/e
Taxi preloads/caches navigation and blocks overlapping active transitions; E uses delegated events and a central event bus. This portfolio is currently a single-document state machine, so adding PJAX would not improve the current bottleneck. The useful principle here is lifecycle ownership and avoiding repeated event/rebind work, which the current runtime already follows.

## Static validation
Run:
- `node scripts/validate-assets.mjs`
- `node scripts/audit-runtime.mjs`
- `node --check dist/*.js` (looped by shell)

Expected audit checks:
- one frame driver
- screen-space liquid glass retained
- 1024×576 reflection retained
- reflection preblur enabled
- event-driven glass capture enabled
- HOME transmission LOD enabled
- AABB hit testing enabled
- staggered shadow refresh enabled

## Remaining limitation of this environment
The managed Chromium/SwiftShader environment does not provide a reliable hardware-WebGL performance profile for the user's Radeon Pro 5300M. The code path has therefore been audited structurally rather than claiming a fabricated FPS number.
