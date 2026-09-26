# Current delivery: Round 41

Read [START_HERE.md](START_HERE.md) and [ROUND41_STUDIO_FINISH.md](ROUND41_STUDIO_FINISH.md) first. Earlier notes below are historical.

# Yuanlong Zhu — 3D Portfolio / Round 29

Round 29 is the full-effect architecture rebuild.

## Key rule
Performance work in this round does **not** delete or weaken visual effects. The full spotlight, volumetric beam, particles, planar reflection, liquid glass UI, caustics, transitions, shadows and material system remain enabled.

## Runtime architecture
- Three.js r170 (bundled locally)
- GSAP 3.15 loaded from jsDelivr when available
- one shared frame runtime (`dist/frame-runtime.js`)
- native requestAnimationFrame fallback if GSAP is unavailable
- main 3D scene rendered once per requested frame
- liquid header + Preview / Index / Dialog use screen-space framebuffer glass shaders
- planar desk reflection remains 1024×576 HalfFloat with full blur kernel

## Local preview

```bash
npm run dev
```

Open the local URL printed by the server.

## GitHub Pages
The repository includes `.github/workflows/pages.yml`.

## Start here
1. `ROUND29_FULL_EFFECT_ARCHITECTURE_AUDIT.md`
2. `ROUND29_REFERENCE_LINKS.md`
3. `dist/app.js`
4. `dist/frame-runtime.js`
5. `dist/liquid-header.js`
6. `dist/liquid-panels.js`

## Validation

```bash
node scripts/validate-assets.mjs
node scripts/audit-runtime.mjs
```

Current model validation:
- 31 meshes
- 11,848 triangles
- finite geometry
- valid glTF containers
