# Round 31 — targeted glass UI fixes only

Base: `Portfolio_2026_round30_unseen-performance-pass.zip`

This pass intentionally changes only the six requested items. Architecture/Writing/Research geometry, materials, camera, scene composition, spotlight behavior, volumetric beam strength, dust count, planar reflection resolution, transition behavior, index layout, and project content were not otherwise redesigned.

## 1. First-load beam reflection ghost

### Cause addressed
The transient spotlight / volumetric beam / dust could exist in the scene when the planar desk reflection buffer was captured. Because that reflection is not rebuilt on every pointer frame, a transient beam state could become a stale reflection artifact after first load or page restoration.

### Fix
- `floor-reflection.js` now accepts transient objects and temporarily excludes the pointer spotlight, beam cone, and dust particles from planar reflection capture.
- All reflection render targets are explicitly cleared before the first settled capture.
- The spotlight, beam mesh and particles initialize hidden with zero intensity/opacity.
- `pageshow` clears transient lighting state and reflection history before requesting the settled frame.

The visible spotlight/beam effect in the main scene is retained.

## 2. Collapsed glass control now reads as a real sphere

`liquid-header.js` now uses an analytical sphere normal in the collapsed state instead of treating the orb as a rounded flat SDF disc.

Added/reworked optical cues:
- analytical spherical normal and thickness
- stronger Fresnel response
- two directional specular lobes
- inner lens shading
- RGB-separated refraction retained
- sphere-to-capsule normal blending during expansion

No extra render pass was added for this.

## 3. Expanded header now reads as a thick glass bar + desk reflection

The expanded state remains screen-space glass, but now has:
- stronger curved capsule edge normal
- thicker bevel profile
- dual specular response
- corrected background sampling based on the actual captured framebuffer rectangle
- live desk reflection/caustic uniforms that morph from a compact spherical reflection into a capsule reflection

The desk response updates continuously with the header animation without adding another FBO.

## 4. Header length now matches Writing → Research extents

The header width is no longer a fixed `min(viewport - 64, 1680)` target.

At runtime, `app.js` stores the HOME-state world bounds of Writing and Research. Those bounds are projected through the active camera, and `liquid-header.js` expands from the centered sphere to the resulting left/right screen limits, with a small optical margin.

This means the bar follows the actual portfolio composition at different viewport sizes.

## 5. Right-side home orb removed

- Removed `#home-button` from `index.html`.
- Removed its click handler.
- Removed dead `.home-orb` / `.liquid-orb` CSS.
- `Yuanlong Zhu` remains the home control.

## 6. Typography system rebuilt to match the glass interface

Existing local font assets are reused; no extra network font dependency was added.

New type roles:
- `Instrument Serif`: brand, object titles, category titles, index titles, dialog titles
- system UI sans (`SF Pro Text` / Helvetica Neue fallback): navigation, coordinates, profession, numbers, filters, actions, metadata, footer, body UI text

The pairing is intentionally closer to the quiet editorial / architectural hierarchy seen in high-end portfolio work: expressive serif for identity/content, restrained sans for interface mechanics.

## Reference direction
- Unseen Studio / Superlist: detailed WebGL/UI craft and disciplined interaction integration
  https://unseen.co/projects/superlist/
- MERSI Architecture: quiet-luxury architectural editorial hierarchy
  https://www.mersi-architecture.com/
- Oliver Gareis: restrained premium typography alongside motion/3D interaction
  https://www.olivergareis.com/

## Validation
- All `dist/*.js`: `node --check` passed
- Asset validator: 31 meshes / 11,848 triangles / finite geometry / valid glTF
- Runtime audit: single frame driver, event-driven glass capture, reflection preblur, coarse hit testing, staggered shadow refresh all remain enabled

## Environment limitation
A real browser screenshot was attempted, but this container's Chromium cannot initialize EGL/ANGLE WebGL, so no generated/rendered substitute screenshot is included.
