# Round46 — round44 geometry, neutral desk and empty glass entry

Base: user-uploaded Portfolio_2026_round44_CODE(2).zip. No round45 model changes were imported.

## Changes
- All 40 model meshes and the paperclip curve remain byte-identical in models.js.
- Writing/Research: correct excessively dark side and underside paper facets; pad atlas gutters from nearby valid UV texels. Runtime uses lossless cleaned PNGs; original bake PNGs remain available for reproducibility. Architecture atlas is unchanged.
- Paperclip: retain round44 curve; use live neutral steel, metalness 1, roughness .24, environment response 1.25. Portable baked GLBs include the cleaned maps and steel clip material.
- Entry: remove Explore and the colored mark. Accessible empty button remains. CSS glass uses translucent fill, edge highlights and backdrop blur; hover/touch/keyboard navigation remains available after expansion. Reflection geometry approximates the glass silhouette; it does not reproduce text or physical refraction.
- Desk: neutral RGB base, environment panels, fill lights, shadow colors and reflection balance. Roughness .34; much weaker grain; full mirror silhouettes remain visible beyond contact footprints. Model color can naturally appear in reflections.
- UI cards/header/dialog: add neutral desk contact patches, and retain planar reflected geometry that follows layout. Shadows fade/hide with their corresponding card. These UI shadows are analytic soft approximations, not path-traced occlusion.
- Gallery: maximum card width 320 px, image height 230 px; a single filtered card no longer expands to fill the entire gallery. Existing project content is retained.
- Hover beam, particles, model lift and scene transitions are retained.

## Verify and run
```
npm run check
npm run dev
```
Open http://localhost:4173. Deploy the separate DEPLOY ZIP with index.html at its root.

Five regression suites cover geometry/UV validity, contact-plane position, header hover/Escape/inert behavior, reflection proxy positions, transition interruption and frame scheduling. round46-baseline-check.json records unchanged geometry. paper-edge-cleanup.json records corrected facets. HTTP checks cover the packaged asset set.

No live browser/WebGL visual acceptance was completed in this environment. Old Blender images under verification/round44-reference are historical round44 images, not round46 screenshots. scripts/studio-source.blend is the original editable round44 scene; the round46 atlas correction is applied by scripts/clean-paper-atlases.py. Running the older bake pipeline alone will not recreate the cleaned maps.
