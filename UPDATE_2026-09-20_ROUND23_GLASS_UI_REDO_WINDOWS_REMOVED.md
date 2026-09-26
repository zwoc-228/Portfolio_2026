# Round 23 — glass UI rebuilt, architecture emissive windows removed

Base: `Portfolio_2026_round22_material-swap.zip`

## Scope actually changed in this round
1. **Removed the small warm emissive windows from the Architecture model** while preserving the existing Marble021 / Metal044A / Plastic013A material pass and overall massing.
2. **Kept the existing scene lighting / pointer-light interaction system** from Round 22. This round does **not** remove the spotlight, volumetric cone, particles, or hover-light behavior.
3. **Rebuilt the glass UI styling** for HOME and inner pages with stronger material cues:
   - thicker optical-glass body
   - layered highlight gradients
   - brighter top sheen
   - more convincing inner edge / rim light
   - stronger but still restrained backdrop blur
   - consistent material language across header, side panel, index container, and dialog

## Files changed
- `dist/models.js`
  - removed `architectureGlow` usage and all `Warm tower window` / `Warm podium window` geometry creation
- `dist/models/architecture.glb`
  - re-exported without emissive window meshes
- `dist/models/portfolio-scene.glb`
  - re-exported full assembly
- `dist/style.css`
  - appended Round 23 overrides for glass UI restyling

## Validation
- `node scripts/export-models.mjs`
- `node scripts/validate-assets.mjs`

Validation result:
- meshes: `31`
- triangles: `11848`
- geometry: `finite`
- glTF containers: `valid`

## Notes
- This round intentionally builds on Round 22 directly, not on the mistaken `round23_material-glass-no-light` branch.
- No claim is made here about screenshot fidelity because the managed environment still cannot provide reliable live WebGL screenshot capture.
