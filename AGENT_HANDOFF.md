# Round 39 override — read first

- Fix Architecture transition ghosts by keeping shadows/reflection spatially synchronized. Do not restore the old 6-frame shadow / 3-frame reflection stagger.
- Keep Architecture glass/acrylic HOME proxies during motion; switch detailed transmission only after the Architecture preview settles.
- Preserve `bakeAssemblyAO()` vertex-color cavity shading and the soft contact-shadow footprints.
- Preserve the matte clay/plastic HOME sphere and its one-time restrained desk bounce.
- Keep desk texture subtle; do not reintroduce marble veining or high clearcoat on the maquette.

# Agent handoff — Round 29

## Current architectural rule
One frame owner only.

- GSAP 3.15 ticker is used when available.
- `dist/frame-runtime.js` is the single scheduling authority and has a native RAF fallback.
- No other custom module should create its own RAF loop.

## Glass
- Header: `dist/liquid-header.js`
- Preview / Index / Dialog: `dist/liquid-panels.js`
- These are screen-space shader overlays using framebuffer capture.
- Do not replace them with `MeshPhysicalMaterial.transmission` panels unless profiling proves it is cheaper.

## Full visual-effect budget that must be preserved
- full volumetric spotlight and particles
- planar floor reflection 1024×576 / HalfFloat / 25-tap blur / samples=2
- both shadow casting key lights
- full environment/exposure values documented in Round 29 audit
- liquid-glass refraction/dispersion/rim
- desk caustics
- model hover lift
- Writing reveal
- all scene transitions and UI entrance motion

## Validation
Run:
```bash
node scripts/validate-assets.mjs
node scripts/audit-runtime.mjs
```
`audit-runtime.mjs` must report `singleFrameDriver: true`.
