# Round 32 — Luminous Cards + Restrained Frosted Header

Base: `Portfolio_2026_round31_glass-ui-targeted.zip`

This pass implements only the approved UI direction from the latest design review. The Three.js portfolio objects, scene composition, spotlight/beam system, material maps, planar reflection resolution, and model transforms are unchanged.

## Design reference carried into code
The secondary-page card language follows the user's own portfolio presentation boards, especially the Venezuela project pages with small physical cards placed on a metallic board: thin rounded edges, restrained surface depth, crisp outlines, and modest reflected light. The goal is a model-like object, not a thick liquid-glass slab.

## Changes

### 1. Keep the collapsed glass orb
- The 44px collapsed orb remains the trigger state.
- The analytical spherical normal / thickness / Fresnel implementation from Round 31 is preserved.

### 2. Hover expansion is now a restrained frosted rounded-rectangle card
- Expanded height: 60px.
- Corner radius reduced from pill-like/full capsule to a 14px rounded-card profile.
- Added local five-sample frost to the captured scene behind the header.
- Refraction amplitude is reduced in the expanded state.
- Edge/specular strength tapers down as the orb becomes the bar, preventing a wet/chunky look.
- Desk caustic/reflection remains real-time but is slightly restrained.
- Expanded length remains linked to the projected bounds of the Writing and Research objects.

### 3. Navigation typography rebuilt
- `Yuanlong Zhu`: 28px display serif.
- `Architect / Researcher / Writer`: 14px interface sans with wider spacing.
- `About / Archive / Contact`: 13.5px interface sans.
- The active portfolio role receives a restrained 2px underline and brighter text.
- Role state is synchronized in `ui-view.js` when entering Writing / Architecture / Research.

### 4. Secondary navigation is now light and high-contrast
- The category sidebar no longer uses the dark framebuffer-glass panel.
- It is now a luminous cool-gray physical panel with a thin white edge, subtle inner top light, and shallow physical shadow.
- Navigation text is pale/off-white; the active row uses a light strip and left edge marker.

### 5. Project cards now use the approved luminous-panel material
- Architecture / Research gallery items are individual rounded luminous cards.
- Thin edge, subtle top highlight, restrained shadow, no thick glass bevel.
- Images sit in a precise inset frame.
- Project title / metadata / year / launch arrow are aligned consistently.
- Writing rows use the same material family without changing their information structure.

### 6. Sidebar and cards aligned
- Added shared layout tokens for page gutter, sidebar width, top line, bottom line, and panel gap.
- Sidebar and gallery now start on the exact same horizontal datum.
- The old large index-content glass container is removed visually; individual cards carry the material instead.
- Index background remains a luminous metallic workspace instead of the older charcoal treatment.

## Runtime / architecture notes
- `liquid-panels.js` now keeps framebuffer glass only for the modal dialog.
- Category and index panels no longer require framebuffer copying or the glass overlay shader.
- The single frame driver, full floor reflection pipeline, spotlight, volumetric beam, and existing model LOD behavior remain intact.

## Files changed
- `dist/index.html`
- `dist/liquid-header.js`
- `dist/liquid-panels.js`
- `dist/ui-view.js`
- `dist/styles/liquid-header.css`
- `dist/styles/professional-ui.css`

## Validation
- JS syntax checks pass.
- `scripts/validate-assets.mjs`: 31 meshes / 11,848 triangles / finite geometry / valid glTF.
- `scripts/audit-runtime.mjs`: single frame driver and existing performance checks still pass.
