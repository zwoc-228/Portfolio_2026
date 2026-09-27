# Round 22 — Uploaded architecture material swap, render budget neutral/lower

## User request
Replace the architecture materials with the newly uploaded `Marble021`, `Metal044A`, and `Plastic013A` material packs without increasing render cost.

## Source packs used
- `Marble021_1K-JPG.zip`
- `Metal044A_1K-JPG.zip`
- `Plastic013A_1K-JPG.zip`

The three uploaded Plastic013A zip files are byte-identical (same SHA-256), so only one source set is needed.

## Material mapping

### Marble021
Applied to the main light architectural volumes:
- plinth
- rear tower
- cantilever slab
- front podium
- low shelf

Runtime maps:
- `dist/assets/arch-marble-color.jpg`
- `dist/assets/arch-marble-rough.jpg`
- `dist/assets/arch-marble-normal.jpg`

The source displacement is baked into the optimized normal map offline. There is no displacement/bump lookup at runtime.

### Metal044A
Applied to the dark graphite base as a tinted silver/graphite metal.

Runtime maps:
- `dist/assets/arch-metal-color.jpg`
- `dist/assets/arch-metal-rough.jpg`
- `dist/assets/arch-metal-normal.jpg`

The source metalness map is effectively 1.0 everywhere, so `metalness=1` is a scalar rather than a texture. Source displacement is baked into the normal map offline.

The copper accent keeps its warm color, but its scalar roughness/anisotropy was retuned to the Metal044A response instead of adding new maps.

### Plastic013A
Applied to the frosted acrylic volume.

Runtime map:
- `dist/assets/arch-plastic-rough.jpg`

The uploaded color average and surface character are folded into material scalar values. Only the roughness map is sampled by the frosted material. Clear acrylic remains texture-free. The smoked acrylic cap uses scalar values derived from Plastic013A and does not gain another texture lookup.

## Render-cost guardrails

No geometry, lights, reflections, postprocessing, or draw calls were added.

Runtime texture loads changed from **26 to 24**.

Architecture-related runtime texture payload changed from approximately **5.64 MiB to 1.57 MiB** on disk. Total runtime texture payload changed from approximately **12.83 MiB to 8.76 MiB**.

Most importantly, the large marble volumes now use 3 texture samples instead of the former 4-sample color + roughness + normal + bump stack. The graphite metal also uses 3 samples instead of 4. The frosted plastic gains one roughness sample, while the copper loses its roughness-map sample. Overall architecture fragment texture work is lower than Round 21.

All maps remain 1K; no higher-resolution texture was introduced.

## Offline optimization

`/scripts/build-arch-materials.py` documents the conversion:
- source displacement baked into normals
- roughness remapped to the portfolio lighting range
- 1K JPEG output for lower transfer size
- no runtime procedural noise or extra shader pass

## Validation
- `node --check dist/app.js`: passed
- `node --check dist/models.js`: passed
- `node scripts/validate-assets.mjs`: passed
- geometry: finite
- GLTF containers: valid
- runtime texture references: 24 / 24 present

The validator still prints its pre-existing undefined-map warnings when it instantiates `createModels()` without runtime texture arguments; these are not missing deployed assets.
