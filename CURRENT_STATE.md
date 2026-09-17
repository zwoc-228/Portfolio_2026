# CURRENT_STATE.md — persistent project memory (repository is source of truth)

- Repository: https://github.com/zwoc-228/Portfolio_2026
- Branch: `main` (deploy on push via `.github/workflows/deploy.yml`)
- Live site: https://zwoc-228.github.io/Portfolio_2026/ (Vite `base: /Portfolio_2026/`)
- Latest tested commit: `5ca78b0` "Visual material refinement: AgX, stochastic
  micro-normal, physical cover/acrylic/paper" (Actions green; live HTTP 200;
  live screenshot inspected 2026-09-17 — AgX high-key, no banding, page
  edges, serif labels, model-board edge highlights, translucent acrylic,
  tight local shadows, zero console errors)

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

## Visual values (FINAL refinement pass, browser-verified 2026-09-17)
- ToneMapping: AgX wins A/B (cleaner rolloff, less haze); exposure 1.0,
  sRGB out. ?tm=aces kept for regression.
- Key directional 0.9 (upper-left, shadows 1024 + normalBias 0.02),
  fill 0.2 right; NO ambient/hemisphere; HDRI env-only @ 0.8.
  ?envrot=<rad> rotates studio for tests (default 0; ±1.5 tested,
  default kept).
- Floor: #cfd2d4, metal 0.82, rough 0.62, envMapIntensity 2.0.
  ContactShadows: opacity 0.16, blur 1.6, scale 10, far 3 (blob gone).
- Cover MeshPhysical #e0dcd3 r.8 + sheen 0.2/0.8/warm + stochastic
  micro-normal 0.06 (sine linen REMOVED — it banded).
- Paper #f0ebe2 r.92, NO normal map (geometry + micro-shadow carry it).
- Spine #d9d3c6 r.72 + sheen 0.15; ribbon #b3aa9c r.55.
- Arch solids → model-board #E7E5DE r.7 + micro 0.04 (near-white heuristic,
  accents untouched); micro-bevels baked in Blender (0.4–1.2mm).
- Clear acrylic: T 0.92, r 0.08, ior 1.49, thickness 0.015,
  atten #f2f6f6/1.5m, envInt 1.6 — true transmission, transparent flag
  ONLY while fading (transparent+transmission rendered near-black).
- Frosted: T 0.65, r 0.28, ior 1.47, thickness 0.02.
- Research paper = writing paper family; steel clip metal 1.0 r 0.3 env 1.2.
- Labels: local OFL EB Garamond TTF (woff2 needs wasm decoder that fails
  headless); serif, subtle.
- DPR [1, 1.5]; fade mats collected once; ?debug=materials overlay.
- Screenshots render under SwiftShader: real-GPU highlights will read
  richer (esp. transmission). Local builds go to outside-OneDrive temp dir
  (OneDrive renames dist/assets on rewrite); CI unaffected.

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
