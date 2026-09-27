# Round47 — real-time studio rendering

## What changed

The black line highlighted in the user's notebook screenshot was the separate `Inset hinge on cover` mesh. Round46's texture cleanup did not remove that object. Round47 deletes that seam object; the other 39 meshes retain their round44 geometry, including all 12 architecture components and the paperclip curve.

The prior runtime replaced model materials with MeshBasicMaterial + baked-color atlases. It therefore could not respond naturally to moving lights. Round47 removes that replacement entirely. All three models now use MeshPhysicalMaterial and real-time environment/direct illumination. The revised neutral studio uses a large rectangular softbox, a shadow-casting key, restrained fill and an environment with more controlled bright/dark regions. AgX handles highlight compression.

The key shadow uses an 8-sample blocker search followed by a 16-sample PCSS disk filter. Penumbra grows with receiver/blocker separation; there is one 2048 shadow map, refreshed on moving geometry. Thin paper layers cast shadows but do not receive their own sub-pixel shadow-map detail, to avoid acne. Low-strength baked contact AO is retained as a supplement; this is a hybrid real-time renderer, not a path tracer or fully dynamic global illumination system.

The header is now a visible bevelled 3D solid in the scene, with transmission=1, opacity=1, IOR=1.46, finite thickness, roughness=.13 and an environment map. The DOM header has no glass background, blur, border or drawn highlight; it is only the accessible interaction/text layer. Its empty collapsed form is 88×64 pixels. The floor mirror uses a simplified glass reflection material to avoid a second nested transmission scene pass. UI contact shadows remain soft approximations; refractive caustics are not simulated.

Full-model planar reflections, hover spotlight/beam, particles, model lift and navigation transitions remain. Reflection silhouettes are not screen-space copies.

## Performance scope

One shadow map; one planar reflection target plus separable blur; one main-view transmission scene pass. The existing single frame scheduler stops when settled. Sustained active frame intervals above 27 ms trigger resolution steps from at most 1.28 toward .85 device pixel ratio; idle gaps do not count. No model/effect is removed by this adaptation.

`window.__portfolioDiagnostics` records active-frame cadence and resolution changes on the user's device. These are end-to-end frame intervals, not GPU timer measurements. No hardware FPS result or 60 FPS guarantee is claimed.

## Checks and limits

- `npm run check`: six suites, including PBR model use, removed groove, finite glass volume, r170 shader patch integration, bounded idle-safe resolution adaptation, header interactions, transitions and architecture geometry.
- `node scripts/package.mjs`: deploy only active runtime assets.
- `npm run dev`: open http://localhost:4173.
- `node scripts/export-models.mjs`: export current PBR GLBs.

The local browser/WebGL preview route was blocked in this session. No live GPU shader compilation, website screenshot, or visual acceptance on the user's MacBook was performed. Do not represent the old Blender renders in verification/round44-reference as this version's appearance. The older bake scripts and .blend scene are historical authoring resources and do not define current runtime lighting.

## References and licenses

- Three.js physical transmission example: https://threejs.org/examples/webgl_materials_physical_transmission.html
- Three.js physical material docs: https://threejs.org/docs/pages/MeshPhysicalMaterial.html
- Three.js PCSS example: https://threejs.org/examples/webgl_shadowmap_pcss.html
- Drei mirror implementation reviewed: https://github.com/pmndrs/drei/blob/master/src/core/MeshReflectorMaterial.tsx
- Drei progressive-shadow implementation reviewed (not imported): https://github.com/pmndrs/drei/blob/master/src/core/AccumulativeShadows.tsx
- User's Plateforme10 reference: https://github.com/Kirilbt/interactive-map

The rectangular-light uniforms and LTC data are vendored from three@0.170.0, matching this project's Three.js r170. Only import paths were changed; MIT license is included at dist/assets/THREE-AREA-LIGHTS-LICENSE.txt. The PCSS integration is project code implementing the documented technique, not a copy of the Drei component.
