# START HERE — Round 39

Current handoff target: the clean studio / physical-maquette direction.

Read in this order:
1. `ROUND39_CLAY_AO_GHOST_FIX.md`
2. `ROUND38_CERAMIC_STUDIO_LIGHTING.md`
3. `ROUND30_UNSEEN_PERFORMANCE_AUDIT.md`
4. `README.md`
5. `dist/app.js`
6. `dist/models.js`
7. `dist/floor-reflection.js`
8. `dist/liquid-header.js`
9. `dist/frame-runtime.js`

Do not solve performance by removing the core visual system. The main Round 39 rules are:

- no stale shadow/reflection state during spatial transitions;
- Architecture uses matte fired-clay/mineral shading plus stable precomputed cavity AO;
- detailed Architecture transmission is enabled only after the preview settles;
- HOME sphere stays matte and physically grounded with a restrained intro bounce;
- desk texture stays secondary to studio light, contact shadows and model material separation;
- `dist/frame-runtime.js` remains the single frame owner.
