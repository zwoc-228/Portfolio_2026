# Round 33 — UI Alignment / Milky Frost / Desk-Inserted Secondary Menu

Base: Round 32 luminous-card UI.

## Scope
Only UI alignment, typography placement, frosted-card tone, and secondary-menu grounding were changed. The three portfolio models, camera composition, material maps, spotlight/volumetric system, planar reflection quality, and scene interaction logic were not intentionally reduced or redesigned.

## Changes

### 1. Home labels now follow the actual 3D objects
- `dist/app.js`
- Added projected screen-bound calculations for each HOME object.
- Writing / Architecture / Research labels are positioned from the projected model bounds rather than hard-coded viewport percentages.
- The labels keep a clean horizontal editorial orientation instead of the previous rotated placement.

### 2. Header typography was re-aligned
- `dist/styles/liquid-header.css`
- Larger display name, clearer navigation sizing, tighter vertical baselines.
- Added restrained dividers between identity / profession / utility navigation groups.
- Header text remains DOM text for crisp rendering.

### 3. Expanded header glass made more restrained
- `dist/liquid-header.js`
- Collapsed glass sphere is unchanged in concept.
- Expanded card uses a shallower bevel profile, softer edge normal, stronger milky frost, more neutral white body tone, and lower Fresnel/specular/rim contribution.
- Result is closer to matte frosted acrylic than thick wet glass.

### 4. Secondary navigation becomes a milky frosted standing card
- `dist/styles/professional-ui.css`
- Background shifted lighter and more neutral.
- Reduced layered/glossy gradients.
- Added subtle backdrop blur and a restrained contact/reflection footprint below the panel so it reads as inserted/standing on the metal desk.
- Added an extremely small perspective tilt anchored at the bottom edge to support the standing-card reading without distorting typography.

### 5. Card system simplified and aligned
- Sidebar and index cards share the same top datum, gutter and gap tokens.
- Project cards are whiter, flatter, and more model-like, with thinner borders and smaller contact shadows.
- Added `.item-copy` wrapper to stabilize title / metadata baselines across all cards.

## External references used
- Codrops — Building an Endless Interactive Glass Xylophone with Three.js
  https://tympanus.net/codrops/2026/08/04/building-an-endless-interactive-glass-xylophone-with-three-js/
  - Applied the principle of a wide milky frost with restrained Fresnel/edge definition rather than thick physical glass.

- Codrops — Building an Infinite Liquid Glass Grid with Three.js, WebGPU, and TSL
  https://tympanus.net/codrops/2026/09/08/building-an-infinite-liquid-glass-grid-with-three-js-webgpu-and-tsl/
  - Kept the separation between crisp HTML typography and shader-based glass body.

- User portfolio — Breaking the Resource Paradox pages 11–16
  - Used as the internal visual reference for thin physical cards sitting on a metal board: light faces, precise outlines, restrained depth, and visible contact with the surface.

## Validation
- JS syntax checks passed.
- Asset validator: 31 meshes / 11,848 triangles / finite geometry / valid glTF.
- Runtime audit still reports one frame driver, event-driven glass capture, reflection preblur, home transmission LOD, coarse hit testing, and staggered shadow refresh.
