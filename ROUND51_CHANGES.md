# Round51 — kill the header glow and make it read as matte plaster

Base: Round50.

## Changes
- Removed the bright / glowing read from the entry header.
- Rebuilt the header surface to be more matte and chalky: darker plaster base, much weaker top sheen, softer bevel contrast, and a tighter underside shadow.
- Removed the dedicated header reflection contribution from the desk reflection pass, so the blurred bright blob under the header is gone.
- Kept the header interaction behavior and the rest of the scene unchanged.

## Files touched
- `dist/styles/ui-system.css`
- `dist/liquid-header.js`

## Verify
```bash
npm run check
npm run dev
```
