# Update — 2026-09-19 metal + lighting pass

## Changed
- Replaced the tabletop metal material with a new derived PBR set based on `Metal055A_2K-JPG`.
- Added new assets:
  - `dist/assets/desk-metal-color.png`
  - `dist/assets/desk-metal-roughness.png`
  - `dist/assets/desk-metal-normal.png`
  - `dist/assets/desk-metal-metalness.png`
- Tuned homepage lighting in `dist/app.js` and `dist/studio-environment.js`:
  - brighter exposure
  - stronger left key / overhead fill
  - slightly brighter environment
  - more metallic, brighter silver table response
- Updated `scripts/serve.mjs` to recognize `.jpg` content type.

## Notes
This pass only changes the browser scene / homepage render rig and tabletop material. Existing object geometry and GLB exports are unchanged.
