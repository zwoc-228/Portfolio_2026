# CURRENT_STATE.md — persistent project memory (repository is source of truth)

- Repository: https://github.com/zwoc-228/Portfolio_2026
- Branch: `main` (deploy on push via `.github/workflows/deploy.yml`)
- Live site: https://zwoc-228.github.io/Portfolio_2026/ (Vite `base: /Portfolio_2026/`)
- Latest tested commit: `e7315ab` (docs; code identical to `801e12f` —
  Actions green; live HTTP 200; live screenshot inspected 2026-09-17)

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
PHASE HOMEPAGE-LOOKDEV (still-frame quality gate). Interaction frozen.
Geometry accepted (GLB JSON audit 2026-09-17: writing 27 nodes/4 mats,
architecture 13 nodes/6 mats + transmission extensions, research 13
nodes/2 mats — bevels authored, no studio helpers shipped).
Problem = shared generic material strategy + no reflection studio.

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

## Visual values (LOOKDEV pass, 2026-09-17 — NOT yet browser-verified)
- ToneMapping AgX (A/B winner), exposure 0.9 (was 1.0; MASTER_SPEC 0.85–0.95),
  sRGB, background #dfe2e5. ?tm=aces + ?envrot= hooks kept.
- Direct: key dir 1.5 upper-left (shadows 1024 + normalBias 0.02), fill 0.18.
  RectAreaLight REMOVED (did not show in reflections). No ambient/hemisphere.
- Studio: declarative Lightformer env (frames=1, res 256, static ~free):
  A large left softbox 3.2, B overhead 2.0, C narrow strip 4.0 (acrylic
  edges), D rear kicker 1.2, E dark flag 0.35, base #3a3d40. scene.envInt 0.55.
- Floor: MeshPhysicalMaterial #d3d6d8 metal 0.8 + DIRECTIONAL brushed
  normal/roughness maps (own generator, repeat 18) + anisotropy 0.5,
  envInt 1.2. No longer shares any texture with cloth/board.
- Families: cloth own fine normal amp 0.035 + sheen 0.3, paper NO normal
  r.85, board #E8E6E1 r.76 own normal 0.025, steel r.32 envInt 1.0.
- Acrylic per-name: clear T0.92/r0.07, frosted T0.6/r0.32, blue rebuilt as
  muted physical T0.5, charcoal rebuilt as smoked T0.5, terracotta opaque r0.6.
- ContactShadows 0.16/1.6/scale10/far3/frames=1 kept as supplement only.
- Heavy work offloaded: `.github/workflows/assets.yml` (Blender headless →
  GLB → gltf-transform meshopt → artifacts + Eevee previews in CI).
  `LOOKDEV_AUDIT.md` is the per-file KEEP/REPLACE record.
- NOTE: reference/final-home.png NOT in repo (only reference/ui-baseline.png);
  composition locked to ui-baseline + MASTER_SPEC §2 until it lands.
- Still true from prior pass: transparent flag ONLY while fading (was
  blackening transmission); Research TopSheet real print (verbatim PDF text,
  V-flip corrected); baked AO 1024 → public/textures/*_ao.png @ ~0.5;
  labels local OFL EB Garamond, ref-driven; perf measured (?debug=materials)
  115 calls / 11.4k tris — trivially smooth on real GPUs.
- Sandbox had NO node runtime, so `tsc`/`build` did NOT run locally.
  Verification gate = push → Actions (`deploy.yml` runs tsc + build) and
  the lookdev screenshot comparison in `assets.yml` artifacts.
  Local commit `a8af4b3` (lookdev pass) created + pushed 2026-09-17 via
  the `portfolio_2026_deploy` SSH key (`d904048..a8af4b3 main->main`).
  CI (`deploy.yml`: tsc + build + Pages deploy) runs on push — check the
  Actions tab; if tsc flags anything, fix before visual review.

## Next task
Lookdev screenshot review (CI `assets.yml` lookdev-previews vs
reference/ui-baseline.png at 1920×1080 + 6 crops; judge rendered pixels
per LOOKDEV_AUDIT.md fail conditions). Then: PDF content extraction per
PROJECT_CONTENT_MAP.md (project pages still placeholder).

## Commands
- Build/typecheck: `npx tsc --noEmit && npm run build`
- Local preview: `npm run preview` (or `npm run dev`)
- Validate: `npm run verify` (= tsc + build) and `npm run visual-check`
- Status: `scripts/project-status.sh`
- Deploy: push to `main` (Actions deploys); verify live URL + assets.
