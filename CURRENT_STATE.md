# CURRENT_STATE.md — persistent project memory (repository is source of truth)

- Repository: https://github.com/zwoc-228/Portfolio_2026
- Branch: `main` (deploy on push via `.github/workflows/deploy.yml`)
- Live site: https://zwoc-228.github.io/Portfolio_2026/ (Vite `base: /Portfolio_2026/`)
- Latest tested commit: `801e12f` (Actions green; live HTTP 200; live
  screenshot inspected 2026-09-17 — AgX high-key, real shadows, AO depth,
  printed research dossier, serif labels, zero console errors)

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
PHASE WEB-RENDERING-FIX (browser parity for Writing materials).
Geometry accepted. Problem = flat/washed-out shading in browser.

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

## Visual values (REFINEMENT pass, browser-verified 2026-09-17)
- ToneMapping AgX (A/B winner), exposure 1.0, sRGB. ?tm=aces regression kept.
- Key 1.6 upper-left (shadows 1024 + normalBias 0.02), fill 0.2,
  RectAreaLight softbox 7x5 @ 2.5 upper-right (sheen/edge/acrylic shaping).
  No ambient/hemisphere. HDRI env-only @ 0.8. ?envrot=<rad> test hook.
- Floor #cfd2d4 metal 0.84 rough 0.48 envInt 2.6 + cm-scale micro-normal.
  ContactShadows 0.16/1.6/scale10/far3/frames=1 + REAL dir shadows
  (<Canvas shadows> was missing — the actual blob/shadow fix).
- Cover physical #e0dcd3 r.68 sheen 0.28 + stochastic micro 0.06;
  paper #f0ebe2 r.78 NO normal; spine #d9d3c6; ribbon #b3aa9c.
- Arch solids → board #E7E5DE r.58 + micro 0.04; bevels baked 0.4–1.2mm.
  Clear T0.92/r0.08/ior1.49/t0.015/atten; frosted T0.65/r0.28.
  transparent flag ONLY while fading (was blackening transmission).
- Research: warm paper + AO; TopSheet real print (verbatim PDF text,
  canvas texture, V-flip corrected); steel clip metal 1.0 r 0.3.
- Baked AO 1024 (Blender Cycles one-off): writing/research/architecture
  atlas via lightmap_pack → public/textures/*_ao.png, aoMapIntensity ~0.5.
- Labels: local OFL EB Garamond TTF; ref-driven (no useFrame setState);
  camera parallax absolute (no +=) + epsilon snap; mobile check on mount.
- Perf measured (?debug=materials): 115 calls, 11.4k tris, 72 geo,
  16 tex, 26 prog — trivially smooth on real GPUs (SwiftShader fps ~1
  is a software-renderer artifact, not a scene problem).

## Next task
PDF content extraction per PROJECT_CONTENT_MAP.md (project pages still
placeholder). Optional follow-ups: ribbon close-up check, frosted-acrylic
read on real GPU, code-split the 1.1 MB bundle.

## Commands
- Build/typecheck: `npx tsc --noEmit && npm run build`
- Local preview: `npm run preview` (or `npm run dev`)
- Validate: `npm run verify` (= tsc + build) and `npm run visual-check`
- Status: `scripts/project-status.sh`
- Deploy: push to `main` (Actions deploys); verify live URL + assets.
