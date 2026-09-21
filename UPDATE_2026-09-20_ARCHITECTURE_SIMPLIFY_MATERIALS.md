# Update — 2026-09-20 architecture simplification + material recovery

## Main fixes in this pass

### 1) Architecture is no longer so fragmented
- Rebuilt the Architecture object with a **simpler and larger block composition**.
- Reduced the previous "too many small pieces" feeling.
- The new hierarchy is clearer:
  - mineral plinth
  - main rear tower
  - cantilever slab
  - left frosted volume
  - front mineral podium
  - left clear acrylic block
  - center clear fin
  - copper anchor
  - graphite base + smoked cap
  - one low shelf for layering

### 2) Mineral material is stronger and clearer
- Reduced texture tiling on the architecture stone maps so the grain reads larger and more legibly.
- Increased stone bump / normal contribution so the **mineral feel** comes through more clearly.
- Kept it within the clean white-model language rather than turning it into a noisy concrete object.

### 3) Material language is still controlled
- Preserved the same family:
  - white mineral
  - clear acrylic
  - frosted acrylic
  - graphite mineral/acrylic
  - copper accent
- But the material contrast now relies on **fewer, larger, clearer pieces**.

## Files changed
- `dist/models.js`
