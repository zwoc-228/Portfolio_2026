# Yuanlong Portfolio — LATEST REVIEW CHECKPOINT

**Date:** 2026-09-16 (Blender Pipeline Pass)
**Status:** Procedural GLB assets generated headless; Writing passes quality gate in preview renders. Browser verification still requires Node.js on the user's machine.

---

## What Changed in This Pass

No more `boxGeometry` approximations. All three homepage objects are now
procedurally modeled in Blender (Python, headless, reproducible) and loaded
in R3F via `useGLTF`.

### Blender automation (no manual modeling)
- Blender 4.2.0 macOS x64 installed to `~/.local/blender` (outside the
  OneDrive-synced repo) from dotsrc mirror; `tools/blender/run.sh`
  resolves `$BLENDER_BIN` → `tools/blender-bin` → `~/.local/blender` →
  `/Applications` → `PATH`.
- `tools/blender/common.py` — scene clear, box/torus builders with tiny
  manufactured-edge bevels, GLB export (no Draco: R3F default loader has
  no DRACO decoder), HDRI studio + preview renderer, studio-object strip.
- `tools/blender/materials.py` — paper, book cover/spine, ribbon,
  model board, clear/frosted acrylic, brushed aluminum, steel, accents,
  plus a documented preview-only floor.
- `tools/blender/generate_writing.py` / `generate_research.py` /
  `generate_architecture.py` — one script per asset; re-running
  regenerates the GLB + preview PNGs deterministically (seeded).
- Regenerate all: `tools/blender/run.sh all public/models`

### Assets (`public/models/`, real-world meters, R3F `METERS_TO_SCENE=5.4`)
- `writing.glb` (~113 KB, 27 parts) — back/front covers with overhang,
  22-slab jittered page block, spine strip, ribbon with drooping tail.
- `research.glb` (~206 KB) — 9 offset sheets, curled top sheet,
  steel paperclip straddling the top edge.
- `architecture.glb` (~103 KB, 13 parts) — plinth, tower, spanning slab
  on tower cantilevering over block, courtyard block, thin wall,
  clear + frosted acrylic (real transmission), pilotis + cantilever
  plate, blue/terracotta/charcoal accents. No intersections with acrylic.
- `writing_preview.png`, `writing_preview_spine.png`,
  `research_preview.png`, `architecture_preview.png` — Cycles validation
  renders used for the quality gate.

### Environment
- `public/hdri/studio_small_09_1k.hdr` — Poly Haven, CC0, SHA1-verified,
  stored locally (see `public/hdri/README.md`). Used by Blender previews
  AND the R3F scene (`<Environment files=...>`). No runtime CDN.

### R3F scene changes (interaction behavior unchanged)
- `WritingObject.tsx` — loads `/models/writing.glb` via `useGLTF`
  (+ preload); same position/rotation/hover-lift/fade/click handlers.
- `HomeScene.tsx` — `<Suspense>`, `<Environment files="/hdri/...">`,
  exposure 1.35→1.15, `FOCUS_WRITING=true` temporarily hides
  Architecture/Research/WorldLabels for the Phase-1 gate
  (set `false` to restore).
- `Lighting.tsx` — key 2.2→1.6, ambient 0.45→0.3, hemisphere 0.4→0.3
  (env now carries reflections; directional shading preserved).

### Validation loop performed
Five preview iterations: fixed overexposure (light powers → key 145,
fill 70, sheen 15, HDRI 0.55), framing, ribbon placement, and a
**Y-up/Z-up axis bug** (book built standing — caught by parsing GLB
node transforms, full geometry rewrite verified clean).
Final previews show product-photography quality: modeled cover,
layered page edges, spine, ribbon, soft localized shadows, light
aluminum floor with sheen variation.

---

## Visual Target

Reference image: `reference/ui-baseline.png` — three objects on matte
metallic infinite plane; world-space labels in shallow inward U;
DOM header/footer; soft overcast studio light.

---

## Locked Visual Rules (from LOCKED_RULES.md)

1. Three-object homepage structure is LOCKED — Writing / Architecture / Research only
2. No game UI, sci-fi HUD, excessive glassmorphism, bloom, large pill buttons, dashboard styling
3. 16:9 desktop baseline (1920×1080)
4. Soft low-contrast lighting
5. Writing: blank off-white notebook, no logo/text on cover
6. Architecture: 8–12 primary components, specific material split
7. No decorative arcs, bounce/elastic animation, large hover movement
8. Scope discipline: a change must not trigger unrelated redesign

---

## What Currently Works

| Feature | Status |
|---|---|
| Blender 4.2.0 headless pipeline (reproducible, seeded) | ✅ |
| writing.glb / research.glb / architecture.glb generated | ✅ |
| GLB node transforms verified (flat, correct axes, no floor) | ✅ |
| Preview renders match reference quality bar (Writing) | ✅ |
| Writing loaded in R3F via useGLTF (handlers preserved) | ✅ (code; browser TBD) |
| Local CC0 HDRI in Blender + R3F (no CDN) | ✅ |
| Hover lift / click→category / fade / Escape / Back | ✅ (unchanged code paths) |
| TypeScript / Vite build | ⏳ needs Node.js on user machine |

---

## Current Known Problems

1. **CameraRig workaround** — 100ms `setTimeout` before camera takeover (pre-existing).
2. **Menu position** — Architecture menu offset needs adjustment (pre-existing).
3. **Writing category empty** — per spec, no articles supplied (pre-existing).
4. **No PDF content extraction** — project pages still placeholders (out of scope this pass).
5. **No GSAP** — R3F lerp transitions (pre-existing).
6. **Browser verification pending** — Node.js not available in this environment.
   Run on your machine: `npm install && npm run dev` → screenshot 1920×1080
   → compare to `reference/ui-baseline.png`; `npm run build` for the gate.
7. **Micro-bump** procedural detail does not export to glTF (Blender
   limitation) — paper/cover separate via color + roughness instead.

---

## Files Most Relevant to Homepage

| File | Why |
|---|---|
| `tools/blender/*.py` | Asset generation pipeline (NEW) |
| `public/models/*.glb` | Shipped 3D assets (NEW) |
| `public/hdri/*` | CC0 studio HDRI + license note (NEW) |
| `src/scene/WritingObject.tsx` | GLB loader (rebuilt) |
| `src/scene/HomeScene.tsx` | Suspense + Environment + FOCUS_WRITING |
| `src/scene/Lighting.tsx` | Rebalanced for env (key 1.6, ambient 0.3) |
| `src/scene/CameraRig.tsx` | Unchanged (HAS WORKAROUND) |
| `src/scene/WorldLabels.tsx` | Unchanged (hidden while FOCUS_WRITING) |
| `src/scene/InfinitePlane.tsx` | Unchanged R3F floor |
| `src/components/CategoryMenu.tsx` | Unchanged |
| `src/components/Navigation.tsx` | Unchanged |
| `src/components/Footer.tsx` | Unchanged |

---

## Exact Next Recommended Task

1. `npm run dev` → verify Writing GLB renders at [-1.6,0,0.5] scale 5.4
   with HDRI reflections; capture 1920×1080; compare to reference.
2. Set `FOCUS_WRITING=false`; wire `research.glb` + `architecture.glb`
   loader components (same pattern as WritingObject).
3. `npm run build` → update this checkpoint with build output.
4. Then: PDF content extraction per `PROJECT_CONTENT_MAP.md`.

---

## Commands to Run/Build

```bash
npm install
npm run dev        # → http://localhost:5173
npx tsc --noEmit
npm run build      # → dist/
tools/blender/run.sh all public/models   # needs Blender: see run.sh
```
