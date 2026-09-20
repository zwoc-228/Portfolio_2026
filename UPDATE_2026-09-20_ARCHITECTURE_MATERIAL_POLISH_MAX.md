# Update — 2026-09-20 architecture material polish (max-effort pass)

## Focus
This pass pushes the Architecture object much harder toward a premium reference-driven material finish:
- clearer mineral texture read
- fewer, larger, more sculptural masses
- better acrylic / smoked acrylic / copper relationships
- more deliberate composition with small rotations to avoid a blocky placeholder feel

## Material work

### New architecture-specific derived textures
Created architecture-only processed texture maps from the existing stone / copper source assets:
- `dist/assets/arch-mineral-color.png`
- `dist/assets/arch-mineral-normal.png`
- `dist/assets/arch-mineral-rough.png`
- `dist/assets/arch-copper-rough.png`

Purpose:
- give the white mineral blocks a clearer, larger, more legible grain
- keep the white-model language clean instead of muddy
- smooth the copper roughness for a more premium metallic read

### Mineral material
- Architecture stone now uses the architecture-specific processed maps instead of the generic scene stone maps.
- Reduced tiling so the grain reads larger.
- Increased bump / normal presence.
- Slightly warmed the mineral base color.

### Copper
- Lowered roughness and improved anisotropy / clearcoat balance.
- Copper now reads more like a premium accent than a dull brown block.

### Acrylic
- Clear acrylic blocks and smoked cap were rebalanced for a more deliberate object hierarchy.
- Added light rotations to some acrylic masses to make them feel more designed and less placeholder-like.

## Composition work
Rebuilt the Architecture object as a clearer composition:
- mineral plinth
- rear mineral tower
- main cantilever slab
- front mineral podium
- low mineral shelf
- left frosted tower
- left clear volume
- center clear fin
- copper anchor
- graphite base
- smoked glass cap
- clear bridge

This is intentionally less fragmented than before.

## Files changed
- `dist/models.js`
- `dist/app.js`
- `dist/assets/arch-mineral-color.png`
- `dist/assets/arch-mineral-normal.png`
- `dist/assets/arch-mineral-rough.png`
- `dist/assets/arch-copper-rough.png`
