# Update — 2026-09-20 architecture spacing + UI cleanup + performance pass

## What changed

### 1) Architecture material and composition
- Restored a clearer **mineral / stone** read in Architecture rather than flattening it too much.
- Added architecture-specific stone texture scaling so the mineral grain is more legible.
- Increased mineral normal / bump presence for the white blocks while keeping the palette clean.
- Re-spaced several Architecture masses so the cluster breathes more and reads less crowded.
- Kept the composition within the existing white-model language:
  - white mineral blocks
  - clear acrylic
  - frosted acrylic
  - graphite mineral/acrylic
  - copper accent

### 2) UI cleanup
- Removed the HOME **arc line** entirely.
- Increased typography contrast on the dark metallic plane:
  - brighter home text
  - brighter navigation / labels
  - clearer dividers and footer / hint

### 3) Brighter metal desk
- Pushed the desk slightly brighter and more reflective:
  - higher environment contribution
  - lower roughness
  - slightly stronger clearcoat
- Also slightly brightened the global environment and key/fill balance.

### 4) Performance optimization / redundancy pass
- Reduced renderer pixel ratio cap from 2.5 to 1.75.
- Reduced planar reflection render target from 2048×1152 to 1536×864.
- Reduced reflection MSAA samples from 4 to 2.
- Reduced reflection blur taps from 7×7 to 5×5.
- Reduced spotlight dust particles from 56 to 36.
- Reduced shadow map sizes:
  - key light: 4096 → 3072
  - companion light: 2048 → 1536
- Throttled reflection refresh during transition animation to every other frame.
- Removed now-unnecessary HOME arc markup/styles.

### 5) Interaction tuning
- Slightly reduced hover lift.
- Slightly reduced spotlight intensity / beam size so it feels less heavy.
- Tightened hover spotlight sizing around the objects.

## Files changed
- `dist/index.html`
- `dist/style.css`
- `dist/models.js`
- `dist/app.js`
- `dist/floor-reflection.js`
