# Round 21 — Glass UI / Research anti-alias / Transition performance / Brighter silver desk

## User-directed changes implemented

1. **Architecture scale**
   - HOME architecture transform reduced from `1.165 / .715 / 1.165` to `1.025 / .675 / 1.025`.
   - This is ~12% smaller in plan and slightly lower in height, matching the annotated boundary more closely without changing the composition of the maquette itself.

2. **Research paper edge artifact repair**
   - Removed the former 18 individually tessellated thin sheets that created dense sub-pixel parallel edges / moire.
   - Rebuilt as one continuous page block + five broad visible leaves + one lightly bowed top leaf.
   - Kept the paperclip and adjusted its contact height to the new top leaf.
   - No external model dependency was added; the existing procedural model is now lower-risk and cleaner.

3. **HOME UI cleanup**
   - Removed the lower-left intro and lower-right interaction hint from display.
   - Removed the lower-right city/location footer line while retaining copyright.
   - Converted the top-right circle into a real HOME button (`#home-button`).

4. **Unified glass UI**
   - HOME header, preview header, category panel, index panel, and modal now share one optical-glass language.
   - CSS uses real backdrop blur + saturation, layered translucent fills, bright grazing-edge highlights, and inset specular lines instead of a flat dark translucent rectangle.
   - Visual approach is based on the optical cues in the referenced Codrops glass articles: softened transmitted background, edge definition, and controlled sheen.

5. **Transition / rendering performance**
   - Kept the current persistent Three.js scene; no scene reload was introduced.
   - Changed motion easing to a shorter exponential in/out transition.
   - Throttled expensive planar-reflection refreshes during transition to every third frame and shadow-map refreshes to every fifth frame, with a full-quality final frame.
   - Reduced desktop DPR cap from `1.45` to `1.28` (`1.0` on low-power devices).
   - Reduced shadow maps from 3072/1536 to 2048/1024.
   - Reduced planar reflection target from 1536×864 to 1024×576.
   - Debounced resize-driven motion.

6. **Architecture material polish + lit windows**
   - Increased mineral normal/bump readability and copper separation.
   - Dark mineral now has deeper contrast.
   - Added four small warm emissive openings; intentionally restrained and bloom-free so the object still reads as a physical maquette.

7. **Brighter metal desk**
   - Raised scene/background/environment energy and changed the reflection studio shell from near-black to medium silver-gray.
   - Raised the desk base color and environment intensity while slightly reducing roughness/normal amplitude.
   - Reduced reflected-scene mix slightly so the desk reads as brighter silver rather than a dark mirror.

## Main files changed

- `dist/index.html`
- `dist/style.css`
- `dist/app.js`
- `dist/models.js`
- `dist/scene-layout.js`
- `dist/studio-environment.js`
- `dist/floor-reflection.js`

## Reference techniques consulted

- https://tympanus.net/codrops/2026/08/04/building-an-endless-interactive-glass-xylophone-with-three-js/
- https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/
- https://tympanus.net/codrops/2026/03/18/building-seamless-3d-transitions-with-webflow-gsap-and-three-js/
- https://plateforme10-interactive-map.vercel.app/

## Validation

- `node --check dist/*.js`: passed.
- `node scripts/validate-assets.mjs`: passed (`geometry: finite`, GLTF containers valid).
- The validator emits pre-existing warnings when it instantiates materials without runtime texture arguments; these are not missing build assets.

## Visual QA note

The sandbox Chromium installation is policy-blocked from opening both localhost and local `file://` pages, so this round was not represented with a fake/generated screenshot. Validate the actual build in a normal browser after unzip/deploy; do not substitute an AI-rendered image for the real Three.js output.
