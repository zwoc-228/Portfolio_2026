# Update — 2026-09-19 unified material language + performance cleanup

## Direction
This pass shifts the whole homepage toward a more unified, premium **white-model / exhibition-model** look while preserving the metallic desk, spatial spotlight, and overall mood.

## Round A — unified material language

### Writing
- Pulled Writing back from the blue-notebook direction into a more refined **off-white notebook**.
- Cover reveal now stays within a premium closed-book palette:
  - closed state: soft warm off-white
  - revealed / close-up state: warm stone-cloth off-white
- Cover texture is still present, but it reads as **subtle book cloth**, not a colored object.
- Elastic band softened to a warmer neutral tone.

### Architecture
- Simplified the material family to read more like one coherent white architectural model:
  - white mineral / plaster masses
  - clear acrylic
  - frosted acrylic
  - smoked graphite acrylic
  - restrained copper accent
- Replaced the more colorful “blue front mass” with a **frosted acrylic** treatment.
- Softened the smoked and copper materials so they act as controlled accents rather than separate visual worlds.

### Research
- Reduced the visible sheet count from 23 to 18 for a cleaner stack and slightly lower rendering cost.
- Tightened the stack jitter so the paper pile reads more controlled.
- Refined paperclip thickness and steel finish for a cleaner white-model feel.

## Round B — interaction / performance cleanup
- Removed unnecessary Writing cover texture asset loads that were no longer used.
- Softened and narrowed the spotlight / hover beam:
  - smaller default cone angle
  - lower beam opacity
  - gentler particle opacity
- Reduced volumetric cone segment count from 64 to 36.
- Reduced dust particle count from 96 to 56.
- Slightly tightened hover spotlight sizing on the objects so the interaction feels more controlled and less theatrical.

## Goal achieved
The scene should now feel:
- more unified
- less color-fragmented
- closer to a premium white model
- still layered and non-monotone through roughness, translucency, cloth, paper, and mineral differences
- lighter and steadier in interaction

## Files changed
- `dist/models.js`
- `dist/app.js`
