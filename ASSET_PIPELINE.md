# Asset Pipeline (CI-first — the local Mac is never the workstation)

Canonical builders (run headless in `.github/workflows/assets.yml`):
- `tools/blender/build_writing.py` / `build_research.py` — procedural
  (controlled, simple geometry), deterministic seeds
- `tools/blender/build_architecture.py` — IMPORTS the checked-in
  `public/models/architecture.glb` and fixes (normals / micro-bevel /
  UV validate / production material slots). Never a generative rebuild.
- `tools/blender/materials.py` — independent material families
  (book cloth, paper, model board, clear/frosted/smoked acrylic,
  muted color accents, steel, brushed aluminium)
- `tools/blender/bake.py` — crevice AO atlases (worker: `bake_ao.py`)
- `tools/blender/export_gltf.py` — single shared GLB export settings
- `tools/blender/generate_*.py` + `run.sh` — local/manual fallback only

Optimize only after raw production assets visually pass
(lookdev = dedup/prune; ship = +meshopt/webp). No Draco (no decoder
in the default R3F loader). Screenshot QA bundles frames + crops +
active reference (`reference/final-home.png`, fallback `ui-baseline.png`)
as CI artifacts — judged on the user's real GPU, never SwiftShader.

## 1. Priority order for assets
1. Existing user portfolio files
2. Existing Rhino / SketchUp / Blender / Photoshop source assets
3. CC0 material/HDRI libraries such as Poly Haven / ambientCG
4. Licensed small props only when necessary
5. AI-generated assets only for reference, texture ideation, or temporary placeholders

Do not use AI mesh generation for the main homepage architecture object unless there is no controllable alternative.

## 2. Homepage model production

### Writing
Create a simple hard-cover notebook in Blender or equivalent:
- blank warm off-white linen cover
- realistic page block
- very small physical bevels only
- visible bookmark ribbon
- no cover text

### Architecture
Build manually from clean primitives. Target 8–12 primary pieces.
Use formal memories from the portfolio rather than literal miniatures of every project:
- Static Travel: long/carriage-like horizontal element
- Reproduce Tradition: modular assembly + restrained red/blue blocks
- The Fusion: hovering/suspended slab or truss logic
- Famous for 15 minutes: one restrained vertical/glass element if needed
- Information Relays: pale cyan/acrylic language

Do not turn the object into a dense city or detailed masterplan.

### Research
Build a paper stack with real extracted diagrams/maps/text from the portfolio.
Add one ordinary metal paper clip.

## 3. Geometry cleanup
In Blender:
- remove hidden/internal geometry
- apply transforms
- recalculate normals
- eliminate coplanar faces
- eliminate z-fighting
- remove non-manifold geometry where possible
- add subtle real-world bevels
- check bounding boxes for intersections

Transparent objects must have 2–4 mm or other scale-appropriate physical separation from neighboring solids.
Do not solve geometry problems with depth-write hacks.

## 4. Materials

### Matte aluminum floor
Suggested start values:
- base color: #C9CDD0 to #D5D6D4
- metalness: 0.72–0.85
- roughness: 0.72–0.82
- anisotropy: very subtle if supported
- directional micro scratches only; no large scratches or visible tiling

### Off-white architectural solids
- base color around #E7E7E3
- metalness 0
- roughness 0.72–0.82
- very subtle plaster / model-board / cast-stone micro normal

### Clear acrylic
- transmission 0.85–0.95
- roughness 0.08–0.15
- IOR ~1.49
- actual thickness 0.01–0.03 scene units at meter scale

### Frosted acrylic
- transmission 0.55–0.75
- roughness 0.24–0.32
- IOR ~1.47

Avoid fake transparency using only `opacity` when real transmission can be used.

## 5. Export
Preferred output:
- `home-writing.glb`
- `home-architecture.glb`
- `home-research.glb`

or one organized `home-scene.glb` if it improves loading and management.

Use:
- glTF / GLB
- Meshopt where practical
- KTX2/Basis for textures

Target homepage geometry under 150k triangles, preferably 60–100k total.
Most homepage textures can be 1K; reserve 2K for assets where it is visually justified.

## 6. PDF asset extraction
Workflow:
PDF → text extraction → page-range detection → embedded image extraction → fallback page rendering → responsive image derivatives.

For rendered images, export 640 / 1280 / 1920 widths in WebP or AVIF where appropriate.
Avoid shipping multi-megabyte raw page screenshots directly to the website.
