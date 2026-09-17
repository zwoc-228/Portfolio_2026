# CURRENT_STATE.md — persistent project memory (repository is source of truth)

- Repository: https://github.com/zwoc-228/Portfolio_2026
- Branch: `main` (deploy on push via `.github/workflows/deploy.yml`)
- Live site: https://zwoc-228.github.io/Portfolio_2026/ (Vite `base: /Portfolio_2026/`)
- Latest tested commit: `90e2980` "Blender GLB pipeline + GitHub Pages deploy"
  (Actions: build success, deploy success, site HTTP 200, writing.glb 112900 B served)

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

## Visual values (FINAL, browser-verified 2026-09-17)
- ToneMapping: THREE.ACESFilmicToneMapping explicit, exposure 1.0, sRGB out
- Key directional 0.9 (upper-left, shadows 1024 + normalBias 0.02),
  fill 0.2 right; ambient/hemisphere REMOVED; HDRI env-only @ 0.8
- Floor: #d5d6d4, metal 0.72, rough 0.8, envMapIntensity 2.4
- Sky/background: #dde1e5 (frame is ~100% floor; horizon above frame)
- Cover #e3ded4 r.8 / paper #f2eee5 r.9 / spine #d9d3c6 r.72 /
  ribbon #b3aa9c r.55; deterministic 256px linen DataTexture normal
  (cover 0.12, paper 0.05, spine 0.1)
- World labels: local OFL EB Garamond TTF (public/fonts), serif, subtle
- DPR [1, 1.5]; GLB meshes cast+receive; fade mats collected once
  (no per-frame traversal); ?debug=materials overlay (dev only)
- writing.glb 112900 B / research.glb 205796 B / architecture.glb 103072 B

## Next task
Establish Playwright visual loop; fix web materials/lighting per gate;
only then set FOCUS_WRITING=false.

## Commands
- Build/typecheck: `npx tsc --noEmit && npm run build`
- Local preview: `npm run preview` (or `npm run dev`)
- Validate: `npm run verify` (= tsc + build) and `npm run visual-check`
- Status: `scripts/project-status.sh`
- Deploy: push to `main` (Actions deploys); verify live URL + assets.
