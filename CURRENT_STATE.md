# CURRENT_STATE.md — persistent project memory (repository is source of truth)

- Repository: https://github.com/zwoc-228/Portfolio_2026
- Branch: `main` (deploy on push via `.github/workflows/deploy.yml`)
- Live site: https://zwoc-228.github.io/Portfolio_2026/ (Vite `base: /Portfolio_2026/`)
- Latest commit: `e5c7461` (regen GLBs) — `f5c200e` (overlay rebuild) — `c4de87e` (reset arc + layout)
- Actions: deploy.yml green after each push; assets.yml green (run 35261497666)

## Architecture overview
- React 18 + Vite 5 + Three.js + R3F v8 + Drei v9 + Zustand + React Router
- `src/main.tsx`: `BrowserRouter basename={import.meta.env.BASE_URL}`
- `src/App.tsx`: persistent Canvas + DOM overlay + `/:category/:slug` routes
- `src/scene/HomeScene.tsx`: Canvas, `<Environment files={BASE_URL hdri}>`,
  `FOCUS_WRITING=true` (Phase-1 gate; set false to restore all objects)
- `src/scene/WritingObject.tsx`: `useGLTF(MODEL_URL)` @ scale 5.4
  (meters→scene); hover-lift/fade/click handlers preserved
- `src/scene/CameraRig.tsx`: lerp camera + parallax (100ms setTimeout workaround)
- `src/store.ts`: hoveredObject, selectedCategory, selectedProject, flags

## Current phase
REFERENCE-LOCKED RECONSTRUCTION (2026-09-17). User declared a strict
5-phase plan: (1) home-layout.json ✅, (2) editorial overlay ✅,
(3) 3D objects conform to master ✅, (4) camera/projection match —
NEEDS VERIFICATION, (5) lighting/materials — PENDING.

Phase 1: `reference/home-layout.json` — measured object bboxes, smile
arc cubic, label/number anchors, DOM row positions.

Phase 2: `src/components/ArcOverlay.tsx` — SVG smile arc + DOM labels
(Writing/Architecture/Research) + tick marks + numbers (01/02/03).
Reads from home-layout.json. Mounted in App.tsx DOM overlay (z-index 1).

Phase 3: GLBs regenerated from updated Blender scripts (`e5c7461`):
writing.glb 113KB (27 parts, thick covers 0.004m, ribbon exits -Y),
architecture.glb 136KB (14 meshes, denser cluster), research.glb 205KB
(9 sheets + curled top + paperclip, increased jitter).

Phase 4: SOLVED 2026-09-17 (all 12 screen edges ≤0.6% vs master law).
Root causes found: (1) lookdev master mirrored WRONG transforms/camera
(pos/yaw/lens all drifted — previews validated a different composition);
(2) axis-mapping sign error in master docstring (Blender -Y = R3F +Z near);
(3) paperclip built on near edge, reference has it FAR — flipped to +Y;
(4) ribbon pointed at camera, reference lies screen-left — re-routed -X;
(5) whole trio ~25% too small on screen — per-object k 1.15/1.235/1.30;
(6) plinth 0.17→0.22m, tower 0.100→0.110m, ribbon lengthened to reach x0.
Canonical R3F: writing (-1.593,0,-0.098) yaw+0.18 k1.15 /
arch (0.06,0,0.135) k1.235 / research (2.138,0,-0.237) yaw-0.185 k1.30.
Camera untouched (0,3.2,6.5) fov31. Proof: lookdev/final-sbs.png +
FRAME report in commit. research cx law corrected 0.815→0.806.

Phase5: FIRST PASS pushed (floor+studio+shadows+whites+acrylic-read).
Blender lookdev: 5-area high-key rig (KeyLeft tall softbox, TopFront,
StripRight, KickerBack; world 0.35), floor satin #D6DBE0 r0.32,
raytracing ON (Eevee Next needs it for transmission), whites separated
(cover #DBD5C7+sheen / board #E9E7E2 / paper #F5F1E8). Proof:
lookdev/material-sbs.png + crop-{floor,writing,architecture,research}.png.
Web port: floor y -0.5→0 (objects floated 0.5 above floor — grounding
bug), ContactShadows →0.001, floor rough map →0.38-0.54/metal 0.85/
envInt 1.9, envIntensity 0.75→0.95, matching white values.
KNOWN STILL-FAILING: frosted/smoked acrylic read flat in Eevee;
floor softbox band + grain not yet distinct; needs live verdict.

## What is working
- Headless Blender pipeline (`tools/blender/*.py`, seeded, reproducible)
- writing.glb (27 parts), research.glb, architecture.glb in `public/models/`
- CC0 studio HDRI `public/hdri/studio_small_09_1k.hdr` (local, no CDN)
- GitHub Pages deploy green; base-aware URLs (models, hdri, router)
- Interaction: hover lift, click→category, fade, Escape/Back

## Known problems
1. Browser render flat/white — Blender material quality not surviving to WebGL
   (GLB drops procedural bump; too many light sources; exposure high).
2. CameraRig 100ms setTimeout workaround (pre-existing).
3. Architecture menu offset (pre-existing).
4. `useFrame` traverses whole GLB hierarchy every frame (perf).
5. DPR `[1,2]` too high for target hardware.
6. No browser-verification loop yet (this session adds Playwright).

## Resolved problems
- Y-up/Z-up axis bug (book built standing) — caught via GLB node parse.
- Studio helpers exported into GLB — `remove_studio()` added.
- Paperclip buried / floating — repositioned to straddle edge.
- Absolute `/models` `/hdri` URLs broken under Pages subpath — BASE_URL prefix.
- Cycles CPU previews too slow — moved to Eevee (see below).

## Blender
- Discovery: `scripts/find-blender.sh` (BLENDER_BIN → tools/blender-bin →
  ~/.local/blender → /Applications → ~/Applications → mdfind → PATH).
- This machine: `~/.local/blender` = Blender 4.2.0, Intel x86_64 (i7-9750H),
  Intel UHD 630 + AMD Radeon Pro 5300M 4GB, display 3072×1920.
- No canonical .blend files — assets are procedural (`tools/blender/*.py`).
- Preview engine: **Eevee** (`BL_PREVIEW_ENGINE` unset = Eevee; `=cycles`
  only for one-off bakes). Common settings in `tools/blender/common.py`.

## Asset pipeline
- `tools/blender/run.sh [writing|research|architecture|all] [outdir]`
- Fast previews: `scripts/render-model-previews.sh [asset]`
- R3F scale: `METERS_TO_SCENE = 5.4`; no Draco (default loader lacks decoder).

## Visual values (LOOKDEV pass 2, 2026-09-17 — awaiting visual review)
- Grey-veil fail (user screenshot): dark-room studio base collapsed all IBL
  energy + AgX crushed the backdrop. Fix = bright-room studio (base #c4c7ca,
  left softbox 5.0, overhead 3.0, strip 5.0, kicker 1.5, flag 0.5, frontal
  card 1.0), scene.environmentIntensity 0.75, scene.backgroundIntensity 1.35
  (backdrop lift independent of exposure), bg #e3e6e9, floor envInt 1.6.
  Exposure stays 0.9 (lighting fixed first, exposure last).
- Families: cloth own fine normal amp 0.035 + sheen 0.3, paper NO normal
  r.85, board #E8E6E1 r.76 own normal 0.025, steel r.32 envInt 1.0.
- Acrylic per-name: clear T0.92/r0.07, frosted T0.6/r0.32, blue rebuilt as
  muted physical T0.5, charcoal rebuilt as smoked T0.5, terracotta opaque r0.6.
- ContactShadows 0.16/1.6/scale10/far3/frames=1 kept as supplement only.
- Heavy Assets FAIL 2026-09-17 (run 35260994956): Blender aborted at first
  invocation, exit 134, missing libEGL.so.1. Fix (`8779939`): apt runtime
  (libegl1/libgl1/mesa-dri/X11 set) + LIBGL_ALWAYS_SOFTWARE=1 + ldd
  fail-fast check. Rerun 35261497666: build-assets SUCCESS, screenshot-qa
  SUCCESS, run conclusion success. Artifacts present (names/sizes only —
  downloads need auth): homepage-glb-optimized 65KB, lookdev-previews 945KB
  (inspect reports + Eevee previews), homepage-qa 2.3MB (frames + crops +
  ui-baseline reference).
- NOT claimed: final-reference matching (reference/final-home.png still
  missing — QA bundles ui-baseline.png) and production PBR completion
  (tools/blender/cc0_sources.txt still absent — procedural stand-ins).
- FINAL REFERENCE (declared 2026-09-17): `reference/ui-baseline.png`.
  QA bundles it as `reference.png`. No `final-home.png` needed.
- Direct: key dir 1.5 upper-left (shadows 1024 + normalBias 0.02), fill 0.18.
  RectAreaLight REMOVED (did not show in reflections). No ambient/hemisphere.
  ?tm=aces + ?envrot= hooks kept. `LOOKDEV_AUDIT.md` = per-file record.
- Still true from prior passes: transparent flag ONLY while fading (was
  blackening transmission); Research TopSheet real print (verbatim PDF text,
  V-flip corrected); baked AO 1024 → public/textures/*_ao.png @ ~0.5;
  labels local OFL EB Garamond, ref-driven; perf measured (?debug=materials)
  115 calls / 11.4k tris — trivially smooth on real GPUs.
- Sandbox has NO node runtime, so `tsc`/`build` never run locally.
  Gate = push → Actions (`deploy.yml`: tsc + build + Pages deploy;
  `assets.yml`: Blender builds + inspect + QA bundle). Prior commits
  `a8af4b3` + `b8eaf6b` pushed 2026-09-17 via `portfolio_2026_deploy` key.

## Next task
URGENT: User must check the live site (https://zwoc-228.github.io/Portfolio_2026/)
and compare to reference/ui-baseline.png. Report:
1. Do the3D objects (Writing/Architecture/Research) align with the
   editorial overlay labels? Or are they offset?
2. Is the arc visible and correctly shaped (shallow smile)?
3. Are the tick marks and numbers visible?

Based on feedback, adjust camera position/fov or object x-positions
to match the target bboxes exactly. Then proceed to Phase 5 (lighting).

## Commands
- Build/typecheck: `npx tsc --noEmit && npm run build`
- Local preview: `npm run preview` (or `npm run dev`)
- Validate: `npm run verify` (= tsc + build) and `npm run visual-check`
- Status: `scripts/project-status.sh`
- Deploy: push to `main` (Actions deploys); verify live URL + assets.
