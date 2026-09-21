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
