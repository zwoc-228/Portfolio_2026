# Round 24 — Liquid Glass Orb Header

## Goal
Replace the static top bar with a collapsed glass orb that expands on hover into a liquid-glass navigation header, with visible feedback on the desk surface and motion that feels more like a product interaction than a CSS bar.

## References used
1. Codrops — Building an Infinite Liquid Glass Grid with Three.js, WebGPU, and TSL
   - https://tympanus.net/codrops/2026/09/08/building-an-infinite-liquid-glass-grid-with-three-js-webgpu-and-tsl/
   - Used for: liquid-glass logic, emphasis on refraction/reflection/rim-light, and the split between 3D glass surface and HTML text overlay.

## What changed
### 1) Added a real 3D liquid header object in the scene
- New file: `dist/liquid-header.js`
- Uses `RoundedBoxGeometry` + `MeshPhysicalMaterial` to create a glass pill that can collapse toward an orb and expand back into a full navigation bar.
- Added a brighter inner sphere/core and additive shell highlight to make the glass read better.

### 2) Added desk feedback under the UI
- A separate soft caustic/reflection plane is placed over the metal desk.
- It grows from a compact orb-like highlight into a wider band when the header expands.

### 3) Rebuilt the DOM header structure around the new interaction
- `dist/index.html` header markup simplified into left copy block + right nav block + independent orb button.
- Text is now only a crisp overlay; the glass body itself is handled in Three.js.

### 4) Added a dedicated liquid-header stylesheet
- New file: `dist/styles/liquid-header.css`
- The DOM layer now behaves like a lightweight overlay that fades/translates in sync with the 3D object instead of pretending to be the glass itself.

### 5) Wired the new controller into the scene lifecycle
- `dist/app.js`
- Imports the new liquid header module.
- Syncs header position on resize/layout.
- Invalidates the renderer during orb→bar animation.

## Files touched
- `dist/app.js`
- `dist/index.html`
- `dist/style.css`
- `dist/liquid-header.js` (new)
- `dist/styles/liquid-header.css` (new)

## Next recommended pass
1. Make the expanded pill slightly thicker and more asymmetrical.
2. Replace the current additive desk caustic with a more directional refracted streak.
3. Extend the same interaction logic to preview/index side UI surfaces.
4. Optionally move from `MeshPhysicalMaterial` to a custom shader pass if you want closer parity with the Codrops WebGPU demo.
