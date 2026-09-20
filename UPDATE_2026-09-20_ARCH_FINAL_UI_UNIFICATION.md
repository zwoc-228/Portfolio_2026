# Update — 2026-09-20 architecture final polish + UI unification + overflow fix

## This round focused on three things
1. final architecture polish without changing the overall object count logic
2. unifying the whole secondary UI system
3. fixing text / panel overflow issues and doing another cleanup-oriented pass

## 1) Architecture final polish
### Material refinement
- reduced the architecture mineral texture scale so it reads finer and cleaner
- lowered overly coarse normal / bump response
- separated material character more clearly:
  - white mineral = finer matte stone
  - dark block = clearer graphite/mineral identity
  - clear / frosted acrylic = cleaner optical separation
  - copper = more polished, more intentional accent

### Massing / layering cleanup
- re-aligned the architecture composition so the blocks read straighter
- removed the more awkward crossing / interpenetration feeling
- kept the simplified object count from the previous round
- improved spacing between the key elements so each volume reads more distinctly

## 2) Secondary UI unification
Previously preview / index states were visually close but not fully unified.
This pass turns them into one coherent UI architecture:

- one shared glass-header logic for non-home states
- one shared glass-side-panel logic for non-home states
- brighter white type across preview / index
- consistent spacing, shadows, borders, blur, and hierarchy

So now preview / second-level states should feel like one system, instead of a partially mixed set of styles.

## 3) Overflow / typography fixes
- moved the non-home header to a grid-based layout
- reduced the chance of long text pushing out of the top UI
- made the profession line static in non-home states instead of absolute-positioned
- constrained side-panel text / filters better
- improved non-home responsive behavior at medium widths
- adjusted index layout widths so panels and content stop colliding

## Files changed
- `dist/models.js`
- `dist/style.css`

## Packaging
This build is intended as the new working base for the next refinement pass.
