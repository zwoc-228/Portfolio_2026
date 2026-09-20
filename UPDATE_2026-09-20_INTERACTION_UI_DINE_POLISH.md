# Update — 2026-09-20 interaction optimization + Dine-inspired UI polish

## Main goals
This pass focuses on two things:
1. compress interaction cost another round
2. push the preview UI toward a cleaner, more premium, Dine-like visual tone

## Interaction / performance changes
- Reduced renderer pixel ratio cap:
  - lower GPU cost on retina displays
  - uses an even lower cap on lower-power machines
- Reduced volumetric spotlight cone complexity:
  - cone segment count lowered
  - lower fill / geometry cost
- Reduced airborne particle count for the spotlight:
  - keeps the effect but makes it cheaper
- Reduced beam / particle opacity slightly:
  - calmer and more controlled visual effect
  - lighter rendering load during hover

## UI polish changes
### Dine-inspired preview styling
Preview / second-level UI was refined to feel more like a premium digital-product site:
- darker translucent glass panels
- brighter white typography
- softer borders and deeper layered shadows
- cleaner spacing and calmer emphasis

Affected areas:
- top header / navigation pill
- left preview / category panel
- preview text contrast / legibility

## Material polish
Small extra polish pass on Writing / Research:
- Writing cloth reveal slightly upgraded
- Research paper slightly cleaner
- Research paperclip steel slightly more premium

## Files changed
- `dist/app.js`
- `dist/style.css`
- `dist/models.js`
