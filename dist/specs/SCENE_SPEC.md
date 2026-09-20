# Current revision — user reference ui-baseline(4).png

The latest1672×941 screenshot supersedes earlier HOME visual targets. See dist/references/current-home.png. HOME now uses angled side labels on a shallow arc, blank research sheets, a wider mineral plinth and layered smoked/clear acrylic. Earlier seven-state contact sheet still informs preview/index only. New model transforms live in dist/scene-layout.js. Animation and camera transition work is deferred as requested.

# Scene specification — v1

## Coordinate system and camera (I)
Runtime meters, Y-up; ground XZ, camera toward -Z. Blender source uses Z-up and exports glTF axis conversion. HOME camera initial (0,8.8,12.8), target(0,0,0), vertical FOV32°, near0.1/far100. Camera fit must be tuned against VISUAL_SPEC screen-space corners. A long lens/weak perspective is plausible; these numbers are a starting hypothesis. Do not claim physical reconstruction from a single view.
Ground at y=-.015, 200×200m so no edge/horizon enters frame. Render correct linear lighting with sRGB output and fixed tone mapping/exposure. No bloom, fog, chromatic aberration, animated noise, lens distortion or depth-of-field added.

## Asset dimensions and transforms (I)
All dimensions are width×height×depth in runtime coordinates. Origin bottom-center.

| Root | Dimensions m | Home translation | Y rotation |
|---|---|---|---|
| writing | 2.55×.25×3.20 | (-4.05,0,0) | -.13rad |
| architecture | 2.90×2.20×2.50 | (0,0,0) | 0 |
| research | 2.75×.13×3.35 | (4.05,0,0) | .16rad |

Preview: selected root projected at x.65/y.55; others move laterally out of view; target scale initially1.18. Keep same elevation/lens while translating roots, avoiding unexplained orbit. Tune projected width to~.43 viewport at reference panel aspect. Screenshot endpoint alignment overrides seed transforms.

## Modeling deliverables
writing.glb: separate rounded hard covers, curved spine, recessed page block with individual visible edge layers, hinge grooves, elastic following cover and edge, curved ribbon with thickness. No single box proxy. architecture.glb: beveled stone plinth, tower/bridging slab, clear volumes, translucent blue block, copper block and dark stone block; separate material slots and plausible contacts. Rectangular architectural solids are intentional final geometry only with designed proportions, bevels, surface variation and layered composition. research.glb: 12–20 thin offset sheets with gently curved edges, printed top surface, metal wire paperclip modeled as swept curve. No flat screenshot billboards replacing objects.
Source requirement: editable named mesh hierarchy and reusable procedural authoring source; glTF exports downloadable separately. Blender .blend is a later import/authoring target if Blender unavailable; never label another format .blend.

## Lighting rig (I)
Large rectangular key upper camera-left at(-6,9,5), neutral warm daylight; broad size~7m. Fill upper-right at(6,5,0), 20–35% key. Neutral studio environment, weak floor-level bounce. Soft shadow map with contact detail, no excessive black AO. Bright upper-left reflection must come from lighting/environment response. Light ratios tuned in rendered comparison, not asserted as recovered values.

## Materials (I seeds)
Metal floor metalness1 roughness.40–.55, fine horizontal directional roughness/normal, low-amplitude scratch modulation. Linen metalness0 roughness.85 with weave normal. Paper roughness.8–.95, off-white diffuse. Stone roughness.7–.85 fine aggregate. Clear acrylic transmission1, IOR1.49, roughness.05–.15 with thickness; blue acrylic tinted gray-blue and roughness.2. Copper metalness1 roughness.45. Paperclip metalness1 roughness.25. Preserve energy conservation and avoid baking scene shadows into albedo. Test transmission overlaps and GLB material extension support.

## Runtime constraints
Static geometry; render on interaction/transition, allow idle suspension. Cap DPR at2, lower only after device testing. Keep detailed edges, reduce hidden faces first. Aim total scene <150k triangles and shipped assets<12MB; budgets inferred, never trade silhouette for an arbitrary budget. Keyboard-equivalent category buttons accompany raycast targets. Device-loss fallback must state that interactive 3D is unavailable, not silently fake it with a screenshot.
