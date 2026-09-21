# Update — 2026-09-20 architecture layering fix

## What was fixed
This pass specifically addresses the user's latest feedback:
- no interpenetrating blocks
- less fragmented composition
- clearer layering
- more obvious massing
- better material separation

## Architecture composition changes
- Rebuilt the Architecture object as a cleaner stack of distinct volumes.
- Removed the previous overlapping / intersecting arrangement.
- Simplified the composition so the masses read clearly:
  - mineral plinth
  - rear mineral tower
  - main cantilever slab
  - front mineral podium
  - low mineral shelf
  - left frosted tower
  - left clear acrylic volume
  - center clear acrylic fin
  - clear bridge
  - copper anchor block
  - graphite base
  - smoked cap

## Material distinction improvements
- Clear acrylic made more transparent / polished.
- Frosted acrylic made cleaner and more obviously different from clear acrylic.
- White mineral kept textured and legible but slightly cleaner.
- Graphite mineral made darker so it reads as a distinct object family.
- Copper accent kept compact and more separated from the other masses.

## Goal of this pass
Not "more complete," but more legible:
- stronger hierarchy
- clearer massing
- clearer material families
- better separation between objects

## Files changed
- `dist/models.js`
