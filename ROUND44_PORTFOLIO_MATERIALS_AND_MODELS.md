# Round 44 — portfolio palette, paper models, navigation card

Base: user-uploaded `Portfolio_2026_round43_CODE.zip`.

## 1. Palette grounded in the supplied portfolios

Visual review covered all 34 pages of `2024_4.pdf` and all 30 pages of `Final_Portfolio-2(1).pdf`, plus the eleven attached references/screenshots.

The palette is an adaptation of recurring material colors, not a claim that every hex is a calibrated pixel measurement:

| Source | Observed material language | Use |
| --- | --- | --- |
| Final_Portfolio pp. 2–8, especially p. 7 | Pale cyan and mint physical models; cream paper | Cyan/mint architectural pieces and quiet UI accents |
| Final_Portfolio pp. 25–29 | Blue model massing, blue-grey structural surfaces | Slate-blue base and pale blue cap |
| 2024_4 pp. 5–8 and p. 18 | Warm timber/board, pale physical-model surfaces | Ochre accent, warm stone and plaster |
| Both portfolios | White paper, lightly warm grey field, fine edges | Notebook, research sheets and shared UI surface |

Authoritative model colors: `dist/palette.js`. UI surface colors and spacing: `dist/styles/ui-system.css`.

All twelve architectural meshes retain their original vertex positions and transforms. `check-architecture.mjs` compares geometry hashes against the supplied round43 baseline. Only material values and the baked lighting texture change.

## 2. Models

- Research: delete the old solid base block. Nine closed thin sheets, each with its own edges, offset and rotation. A common curved height field plus separate layer heights prevents sheets crossing. The paperclip follows the top surface and has a return leg around the edge.
- Notebook: rounded planar covers with real edge bevels, thirteen separate bound paper gatherings, an inset binding groove, a rounded spine, and a narrow slate bookmark that falls toward the desk. No generic replacement model or uncertain third-party license was needed.
- All three use the same Blender Cycles area-light setup and sRGB bake pipeline. Architecture and Research use 2048 px atlases; Writing uses a 4096 px diffuse atlas with wider UV spacing to resolve its very thin paper edges without colored specular noise. Runtime geometry remains live 3D; these are not pictures standing in for models.
- Contact AO is regenerated from the new shapes for all three objects.

## 3. Desk

Lighten the environment's dark room/flags as well as the desk base color. Widen the overhead diffusion panel, lower its peak intensity, raise desk roughness to .60, reduce clearcoat and grain, and keep the real planar reflection and moving spotlight/beam effects. Global exposure is not increased to force brightness.

## 4. Navigation and UI

- Remove the sphere and its bounce/morph code. Initial control is a 144 × 48 rounded rectangular card.
- Hover/focus opens navigation; clicking pins/toggles it for touch. Escape closes it. Hidden links are inert. The card stops requesting frames when settled.
- Remove the person's name and coordinates from the header. Keep explicit Home, Archive, About, Contact and category controls.
- All visible UI surfaces use the same DOM material. Remove duplicate framebuffer-based card skins. Keep reflection-only 3D geometry for the desk response.
- Replace accumulated layout overrides with one grid: desktop 24 px gaps/padding, mobile 16 px gaps / 20 px content padding, shared 16 px corner radius and common outer gutter. Category, gallery and detail align to one top edge. Detail uses the available grid width rather than overflowing fixed-width arithmetic.
- Correct the round43 reflection proxy argument error (`spec` was passed where a rectangle was expected). Clip gallery reflection bounds to the visible scroll area and exclude hidden cards. Entry, exit, hover and scroll update their reflection poses during the animation.
- Startup keeps the frame runtime paused until geometry, atlases, fonts and the first scene render are ready. The boot surface matches the brighter palette.

## Verification

`npm run check` covers syntax/local dependencies plus five regression suites: frame ownership, transition interruption, rapid detail changes, nine nonintersecting paper layers, thirteen book gatherings, valid reflection poses, header hover/Escape/idle behavior, model geometry/UVs and unchanged architecture.

`verification/*-web-material.png` and `three-models-material-check.png` are Blender renders after re-importing the actual runtime JPEGs and UV arrays. They are model/material verification images, **not live website screenshots**. No live WebGL screenshot or measured GPU frame-rate claim is made. The site should still receive a real browser visual check on the target device.

## Run and rebuild

```sh
npm run dev
npm run check
node scripts/export-bake-input.mjs
blender -b -t 8 --python scripts/bake-studio.py
python3 scripts/finish-textures.py
blender -b -t 8 --python scripts/verify-baked-material.py
node scripts/package.mjs
```

Editable source scene: `scripts/studio-source.blend`.
Runtime: `dist/`.
Portable baked models: `dist/models/{writing,architecture,research}-baked.glb`.
Deployment package excludes authoring scenes, historical notes and unused assets.
