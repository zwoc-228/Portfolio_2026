# LOOKDEV_AUDIT.md — Homepage still-frame quality gate (2026-09-17)

> Constraint: 2019 Intel MacBook Pro must stay responsive. No Blender GUI,
> no sustained local renders/bakes, no parallel Chromium, no background
> daemons. Heavy work → `.github/workflows/assets.yml` (CI-first).
> Local = edit + `tsc` + `vite build` only.
>
> ReferenceNote: brief asks for `reference/final-home.png`. Repo contains
> `reference/ui-baseline.png` only. Audit locks composition to
> `ui-baseline.png` + `MASTER_SPEC.md §2–4` + `LOCKED_RULES.md` until
> `final-home.png` lands. Do NOT redesign layout/taste.

## Geometry audit (lightweight GLB JSON parse, no Blender launch)

| asset | size | meshes | mats | verdict |
|---|---|---|---|---|
| writing.glb | 110 KB | 27 nodes (BackCover, Page00–21, FrontCover, Spine, RibbonInner/Tip) | 4 (BookCover/Paper/BookSpine/Ribbon) | PASS structure. Real covers/spine/22-slab page block/ribbon. Bevels authored 0.25–0.8 mm in `tools/blender/generate_writing.py`. Node names match `WritingObject.tsx` prefixes. No embedded textures (expected — procedural bump does not survive glTF). |
| architecture.glb | 100 KB | 13 nodes (Base/Tower/SpanSlab/CourtBlock/ThinWall/AcrylicClear/Frosted/PilotisA-B/Cantilever/Blue/Terracotta/Charcoal) | 6 (Board/Clear/Frosted/Blue/Terracotta/Charcoal) | PASS structure. 13 parts ≈ 8–12 primary components. Transmission + IOR extensions present. Bevels 0.4–1.2 mm. Acrylic volumes clear of solids per generator. |
| research.glb | 200 KB | 13 nodes (Sheet00–08, TopSheet subdivided+curled, ClipOuter/Inner/Bridge) | 2 (Paper/Steel) | PASS structure. 9 jittered sheets + curled TopSheet + real torus paperclip. Code routes metalness>0.5 → steel, TopSheet → print. |

No invisible studio helpers in GLBs (`remove_studio()` verified by node list).
Scale: meters in file, `METERS_TO_SCENE=5.4` in R3F. No Draco (correct — default loader).
Topology/normals/UVs: `POSITION+NORMAL+TEXCOORD_0` on every primitive. Bevels applied via `export_apply=True`.

**Geometry decision: KEEP. Do not regenerate locally. Any re-authoring (tighter bevels, sheet irregularity) goes through CI `assets.yml`.**

---

## Per-file verdicts

### `src/scene/WritingObject.tsx` — MODIFY (minor)
- KEEP: GLB loading, `BackCover/FrontCover→cover, Spine→spine, Ribbon→ribbon` routing, shadow flags, `ensureUV1`, fade-collect-once (no per-frame traverse), hover-lift 0.06, scale/pos/rot composition.
- MODIFY: nothing structural this pass. Material instances come from `webMaterials.ts` rebuild.
- DELETE: nothing.
- REPLACE: nothing.

### `src/scene/ArchitectureObject.tsx` — MODIFY
- KEEP: board-override heuristic for near-white solids, `tuneAcrylic` concept, transmission preserved (transparent flag only while fading — fixes black acrylic), shadow flags, fade-collect.
- MODIFY: extend tuning so families stay distinct through response, not base color: clear / frosted / smoked / blue / terracotta / charcoal need separate roughness/transmission/attenuation/envIntensity. Current code treats all rough≥0.15 as one frosted bucket and leaves accents as-authored (toy risk).
- DELETE: nothing.
- REPLACE: nothing structural.

### `src/scene/ResearchObject.tsx` — KEEP
- KEEP: warm-paper family + steel routing, TopSheet own print instance (correct — print UVs must not share AO atlas), shadow flags.
- MODIFY: none this pass (paper identity comes from rebuilt paper family + geometry layering).
- REPLACE/DELETE: nothing.

### `src/scene/webMaterials.ts` — REPLACE (core fail)
- FAIL: one shared stochastic `getMicroNormal()` across book cloth, model board, AND floor. Brief Phase 2 explicitly forbids this. Isotropic noise on floor contradicts brushed-metal directionality.
- REPLACE with distinct families, each own normal/roughness/specular/scale:
  - A book cloth (physical, sheen, very fine own normal, amp ~0.03–0.06)
  - B paper (no normal, high roughness, warm)
  - C model board (matte chalky, roughness 0.72–0.82, bevel highlights > texture)
  - D/E/F/G acrylics handled in ArchitectureObject tuning (real transmission)
  - H steel (metal 1.0, restrained roughness ~0.32)
  - Floor directional brushed normal + roughness variation (own generator, anisotropic streaks — NOT shared micro noise)
- KEEP: `applyAOMap`, `ensureUV1`, `publicUrl` helpers, AO intensities ~0.5.
- CC0 note: Poly Haven / ambientCG 1–2K maps wired via CI (`assets.yml` downloads + KTX2), NOT fetched locally. Procedural directional maps are the local stand-in.

### `src/scene/Lighting.tsx` — REPLACE
- FAIL: 1 dir key + weak fill + single RectArea upper-right is not a reflection-controlled studio. Acrylic/metal beauty comes from light-source shapes, not exposure bumps.
- REPLACE with: minimal direct rig (key with shadows + weak fill) PLUS declarative studio cards via `<Environment resolution frames=1>` + `Lightformer`s (no extra CDN, uses local HDRI as base):
  - A. very large vertical softbox camera-left (floor left reflection)
  - B. large overhead/front softbox (book/paper/board)
  - C. long narrow strip (acrylic edges)
  - D. small rear/right kicker (transparent separation)
  - E. dark flag card (readable dark edges in clear acrylic)
  - F. low base intensity so shadows never crush
- DELETE: assumption that RectArea alone shapes highlights. Keep RectArea init if still used, else Lightformers only.

### `src/scene/InfinitePlane.tsx` — REPLACE
- FAIL: `MeshStandardMaterial #cfd2d4 metal 0.84 rough 0.48 envInt 2.6` + isotropic shared micro-normal repeated 60×. Reads as grey paint / near-mirror, no directionality, violates `ASSET_PIPELINE.md` roughness 0.72–0.82 and Phase 3 satin/brushed target.
- REPLACE with `MeshPhysicalMaterial`: warm-neutral aluminium, metalness ~0.75–0.85, roughness ~0.55–0.68 with directional roughness variation, dedicated streak normal, `anisotropy` where supported, restrained envIntensity (~1.0–1.4). Must produce broad soft highlight + subtle gradient, never chrome/sparkle.
- KEEP: 60×60 plane at y=-0.5, receiveShadow.

### `src/scene/HomeScene.tsx` — MODIFY
- KEEP: AgX (A/B winner), `?tm=aces` regression, `?envrot` hook, DPR [1,1.5], `<Canvas shadows>`, HDRI reflections-only, ContactShadows supplement (0.16 — correctly NOT the whole grounding).
- MODIFY: exposure 1.0 → ~0.9 (MASTER_SPEC start 0.85–0.95; paper currently blows out before acrylic reads), background `#dde1e5` → reference-locked light aluminium tone, `environmentIntensity` 0.8 → ~0.55–0.7 (tame HDRI so paper never blows), shadow map 1024 KEEP (perf), consider `PCFSoft` default only.
- DELETE: nothing. Do NOT add bloom/DOF/grain/vignette. Do NOT touch CameraRig/interaction.

## STOP-rule triggers (method questions, not number tweaks)
- Acrylic still fake after 2 passes → rebuild env/reflection setup, not transmission numbers.
- Paper still plastic → geometry/AO layering, not roughness sliders.
- Arch still toy-like → bevels/segmentation in CI Blender, not colors.
- Floor still flat → replace texture/light design, not envIntensity.

## Composition lock (measure, don't guess)
- 1920×1080: Writing x≈25%, Architecture x≈50%, Research x≈76%, visual center y≈55–59% (MASTER_SPEC §2). FOV 31, cam [0,3.2,6.5] KEEP. Labels: shallow U via yaw only (±0.06 rad) KEEP. No interaction/camera/label changes this pass.

## Fail-condition checklist (current → target)
- [ ] arch reads as fabricated maquette, not white blocks (needs board roughness fix + studio)
- [ ] book reads as cloth+pages+spine+ribbon (needs cloth family split)
- [ ] dossier reads as layered sheets+clip (KEEP geometry, fix paper family)
- [ ] acrylic transmissive, edged, not dark (needs Lightformers + per-family tune)
- [ ] floor satin/brushed directional, not grey paint (needs full replace)
- [ ] whites separable by response, not color (needs families + studio)
- [ ] no visible noise tiling, no blob shadows, no grey veil (needs exposure/env + soft dir shadows)
