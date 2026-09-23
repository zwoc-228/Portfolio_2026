# Round 37 — UI Scale, Desk Reflection, Lighting Quality

## Scope
This pass addresses only the four issues identified after Round 36:
1. enforce a small → medium → large information hierarchy,
2. repair expanded header typography containment/alignment,
3. replace short/symmetric UI shadows with elongated desk reflections,
4. improve the brushed-metal tabletop lighting and material response.

## 1. Small → medium → large UI hierarchy
The previous index/detail layout allowed cards to stretch with the available grid column, which made level 3 and level 4 read at nearly the same scale.

The new desktop hierarchy is explicit:
- Level 2 category panel: `252–278px`
- Level 3 project cards: `278–324px`
- Level 4 reading/detail card: `580–720px`

Project cards use fixed medium-width tracks instead of stretching to fill the grid. When a project is open, the first two medium-card columns remain on the left and the large reading card begins immediately after those two columns. At narrower desktop widths the layout automatically drops to one medium card before the detail card.

The detail copy was also enlarged to a readable editorial scale (`14.25px / 1.58`), with a larger title and more breathing room.

## 2. Expanded ceramic header alignment
The header groups previously used `top:50% + translateY(-50%)`, while the animation controller also wrote an inline `transform`. That meant the animation could overwrite the centering transform and push the typography outside the ceramic bar.

Round 37 changes the header groups to a full-height `top:0; bottom:0` flex alignment. Animation translation can now move the content a few pixels without destroying vertical centering. The header also clips overflow so no label can escape the ceramic surface.

## 3. UI reflection rewritten as a desk-plane effect
The Round 36 sidebar reflection was a symmetric capsule-shaped glow. That is why it looked like a short shadow rather than a board reflected on a metal table.

Round 37 maps the bottom edge of each visible UI surface into the actual Three.js floor plane:
- slot 0: category/sidebar panel
- slot 1: visible project-card field
- slot 2: project detail card

For each surface the code calculates:
- real floor-space edge direction,
- real floor-space outward direction,
- real projected width,
- projected pull/depth away from the panel.

The floor shader then creates an asymmetric, elongated reflection extending away from the UI footprint, with a narrow contact band plus a longer low-energy reflected body. Hover increases the response only slightly.

## 4. Brushed-metal studio lighting pass
The previous environment was dominated by broad white reflection cards and therefore flattened the tabletop.

The new reflection studio uses:
- one broad key gradient,
- a long overhead specular strip,
- a second narrow rear strip,
- a restrained front fill,
- a thin right kicker,
- several dark flags to create dark intervals between highlights.

The desk itself is now slightly darker and more metallic, with higher anisotropy, stronger normal response, lower roughness, and less clearcoat wash. Ambient/direct fill was reduced while keeping the main key and planar reflection quality intact.

This follows the same general production principle seen in Unseen Studio's WebGL work: use a controlled 3D lighting/material system and make each visible calculation contribute to the final image rather than stacking generic effects.

## Files changed
- `dist/styles/craft-inspired-ui.css`
- `dist/app.js`
- `dist/floor-reflection.js`
- `dist/studio-environment.js`
- `dist/ui-view.js`

## Validation
- all `dist/*.js`: syntax checked
- all `scripts/*.mjs`: syntax checked
- runtime audit: single frame driver still passes
- glTF validation: 31 meshes / 11,848 triangles / finite geometry / valid containers
