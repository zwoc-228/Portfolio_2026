# Update — 2026-09-19 Writing texture scale / placement fix

## Issue addressed
The Writing cover material reveal looked usable, but the actual cloth texture was visibly tiled and scaled incorrectly on the notebook cover.

## Fix
- Reduced Writing texture repeat from `2.7` / `1.8` down to `1.0`.
- Applied explicit UV transform defaults for the Writing cover and paper textures:
  - repeat `(1,1)`
  - offset `(0,0)`
  - center `(0.5,0.5)`
  - rotation `0`
- This removes the obvious repeated patch pattern on the cover and makes the notebook read as one coherent material surface.

## Files changed
- `dist/app.js`
