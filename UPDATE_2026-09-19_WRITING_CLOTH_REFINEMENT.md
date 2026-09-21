# Update — 2026-09-19 Writing cover cloth refinement

## Goal
Refine the Writing notebook cover so the revealed material feels more premium:
- finer, more even cloth / bookbinding texture
- better cover color during reveal
- keep the same lightweight closed-book behavior and performance

## What changed
- Replaced the Writing cover's previous dedicated reveal texture maps with cloned **linen / book-cloth** maps already used in the project.
- Created Writing-specific texture clones so the cover can use its own UV scale without affecting other linen materials.
- Cover texture repeat is now set to **1.45**, giving a finer woven read without obvious tiling or oversized patches.
- Added color interpolation during material reveal:
  - closed state stays near soft off-white
  - open / preview reveal shifts to a muted **slate blue / gray-blue** cloth tone
- Softened the reveal normal intensity so the texture reads as refined book cloth rather than heavy canvas.
- Warmed the paper and page-edge reveal colors slightly so the notebook interior feels more natural next to the cooler cover.

## Files changed
- `dist/models.js`
- `dist/app.js`
