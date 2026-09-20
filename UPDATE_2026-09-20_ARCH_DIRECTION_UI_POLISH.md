# Update — 2026-09-20 architecture direction fix + UI glass panel polish

## Main fixes in this pass

### 1) Architecture direction / alignment
- Straightened the Architecture composition so the object reads more frontally and less crossed.
- Removed the visually confusing cross-over feeling from several elements.
- Kept roughly the current object count, but made the arrangement cleaner and more deliberate.

Updated massing:
- mineral plinth
- rear mineral tower
- main cantilever slab
- front mineral podium
- low mineral shelf
- left frosted tower
- left clear volume
- center clear fin
- clear bridge
- copper anchor
- graphite base
- smoked glass cap

Goal:
- clearer hierarchy
- cleaner layering
- more obvious block reading
- better material separation

### 2) Writing / Research material polish
- Writing cover cloth slightly refined with a more premium cloth sheen / normal balance.
- Writing paper slightly refined for a cleaner paper surface.
- Research paper slightly polished.
- Research paperclip steel also polished slightly.

### 3) Secondary UI redesign
For the preview / second-level state, the UI now uses a much more readable treatment:
- brighter white typography
- a translucent glass panel behind the top header / navigation
- a translucent glass panel behind the left preview menu
- improved contrast for labels, buttons and small text

This addresses the low-contrast issue seen in preview mode.

## Files changed
- `dist/models.js`
- `dist/style.css`
