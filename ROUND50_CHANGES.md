# Round50 — plaster header, round46 runtime restored

Base: user-uploaded `Portfolio_2026_round46_CODE(2).zip` (hash-identical to the previous round46 baseline).

## Changes
- Reverted to the round46 interaction/runtime baseline.
- Removed the header glass treatment entirely: no `backdrop-filter`, no transparency/refraction effect, no blur kernel.
- Rebuilt the collapsed/expanded header as a matte plaster/gypsum plaque using only lightweight CSS gradients, bevel highlights and soft elevation shadows.
- Replaced the header floor-reflection proxy material with a rough opaque `MeshStandardMaterial` so its reflected silhouette also reads as plaster rather than glass.
- No changes to Writing / Architecture / Research geometry, desk material, lighting, camera, spotlight, hover/lift logic, card navigation, or content.

## Files changed from round46
- `dist/styles/ui-system.css`
- `dist/liquid-header.js`

## Verification
- `npm run check` passed all 5 regression suites.
