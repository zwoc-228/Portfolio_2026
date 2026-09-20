# Yuanlong Zhu — reference-led 3D portfolio

Private reconstruction study from the two supplied images. Read specs/VISUAL_SPEC.md, SCENE_SPEC.md, INTERACTION_SPEC.md, ASSET_LIST.md, QA_SPEC.md before changing implementation. qa/QA_REPORT.md records actual validation and outstanding fidelity issues.

## Deliverables
- dist/models/writing.glb, architecture.glb, research.glb: independently editable named meshes with embedded PBR textures.
- dist/models/portfolio-scene.glb: arranged three-object assembly with fitted root transforms.
- dist/models.js: reusable editable procedural geometry source. No screenshot billboards replace geometry.
- scripts/export-models.mjs: deterministic GLB exporter. Run from project root with Node.
- scripts/textures.py: deterministic material maps and reference-image crops; requires Pillow and NumPy.
- dist/: self-contained hosted HTML/JS/WebGL experience with local fonts and dependencies.

Import any GLB into Blender using File → Import → glTF 2.0; inspect and edit named meshes/materials, then save .blend. No .blend file is claimed in this delivery. The standalone GLB assembly does not include the browser floor and lighting rig.

Seven state URLs use #home, #writing/preview, #architecture/preview, #research/preview, and matching /index endings. The HOME object or category label opens preview; Enter opens index; Back/Escape reverses.

Reference imagery and titles are supplied design evidence. Original project content, contact address and exact font have not been supplied. Do not publish this study as a completed authored portfolio without replacing study content and completing visual QA.

Local development: npm run dev. No package installation is needed; dependencies are bundled. The managed environment uses sites-preview.


## Latest material pass
See `UPDATE_2026-09-20_ROUND22_MATERIAL_SWAP.md` for the uploaded Marble021 / Metal044A / Plastic013A architecture material replacement and render-budget notes.

## Round 23 full UI refactor
The current working version is the reference-led Round 23 UI refactor. Read `ROUND23_UI_REFACTOR_AUDIT.md` for the component-by-component audit and `UI_REFERENCE_LINKS.md` for every external reference/tool link used in this pass.

UI code is now split into `dist/styles/*`, `dist/glass-ui.js`, `dist/ui-view.js`, and `dist/content-data.js`; `dist/app.js` remains the Three.js scene/orchestration layer. Architecture emissive windows are removed, while the existing scene spotlight / volumetric interaction remains.
