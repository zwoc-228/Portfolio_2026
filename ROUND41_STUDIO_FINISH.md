# Round 41 — studio maquette and interaction completion

Base: uploaded `Portfolio_2026_round40_reflection_shadow_fix.zip` (its internal folder was named round39). No repository push or deployment was performed.

## Delivered changes

- Architecture: exact procedural website geometry exported into Blender 4.5.3 / Cycles. Large area sources and ambient bounce baked to a shared 2048 px atlas. Runtime uses an sRGB baked JPEG and a second UV channel. This is actual geometry/light baking, not an AI image or a flat illustration.
- Pale opaque cast resin, unglazed clay, satin graphite and copper replace the switching transparent proxy/detail materials. Broad beveled edges are preserved. Lighting stays stable through HOME / preview transitions.
- All three models receive individual 512 px contact AO baked from their geometry. Contact planes follow model position, rotation and scale while staying at the desk height during hover. They are excluded from planar capture.
- Sphere: real scene geometry with roughness .86, no metalness or clearcoat. Substepped damped bounce, impact squash, height-dependent contact shadow, real planar reflection. Stops after landing; respects reduced motion. Opening blends into the header surface.
- Desk: retain round40 footprint-controlled reflection, replace sparse blur with contiguous nine-tap Gaussian passes. Reduce texture, remove unnecessary color/roughness/metalness maps. A single shadow caster avoids conflicting double silhouettes; broad environment cards provide fill.
- Every moved frame updates reflection and shadow from the same transforms. Removed stagger counters, transmission warm-up and proxy switching.
- Interrupted transitions continue from the current transform. Category changes immediately clear old detail state; close/reopen timers cannot hide the new card. Header focus-out uses the actual focus destination. WebGL restore invalidates cached scene captures.

## Reproduce

```sh
npm run dev
npm run check
# Optional: rebuild authoring assets with Blender 4.5.3 available on PATH
node scripts/export-bake-input.mjs
blender -b -t 8 --python scripts/bake-studio.py
python3 scripts/finish-textures.py
blender -b -t 8 --python scripts/verify-baked-material.py
```

`dist/` is the deployable site. `scripts/architecture-studio-source.blend` is the editable lighting scene. `dist/models/architecture-baked.glb` is the baked model export. The deploy-only ZIP contains runtime resources, without historical documents, source Blender files or unused GLBs.

## Verification and scope

`verification/` holds the actual model render, baked web-texture render and machine-readable reports. The renders are Blender images of the real geometry and runtime texture, **not screenshots of the live website**.

Checks cover all JS syntax, finite geometry, atlas UV correspondence, referenced assets, one frame driver, same-frame transition flags, interrupted transitions, rapid detail close/reopen, reduced motion, 30/60/120 fps bounce convergence, desktop/mobile screen anchoring and contact-plane height during scale/lift.

A live WebGL browser capture is unavailable in this environment. These checks establish the model/texture and state behavior, but do not claim browser visual acceptance or a measured GPU frame rate. Baked building lighting is intentionally fixed to this scene's orientation; changing the geometry or lighting direction requires rebaking.

## References used

- https://github.com/Kirilbt/interactive-map — Blender → baked building textures → Three.js workflow.
- https://plateforme10-interactive-map.vercel.app/ — clean architectural maquette and stable occlusion.
- https://lusion.co/ and https://lusion.co/projects/choo_choo_world/ — smooth physical scene transitions.
- https://www.weareanimal.co/setu — tactile matte forms and broad soft lighting.
- https://www.behance.net/gallery/188718159/Work-Update-24 — softly lit sculptural material studies.
