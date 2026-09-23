# Update — 2026-09-19 volumetric spotlight + hover lift

## Interaction pass
- Reworked the pointer light into an overhead 3D spotlight rather than a camera-mounted flashlight.
- The light source now sits high above the scene and follows the pointer with a slight front/top offset, so the beam has visible perspective.
- Added a visible volumetric beam using two translucent additive cone layers (soft halo + brighter core).
- Added a restrained airborne particle field inside the beam so the light path is visible in space.
- Enabled a soft dynamic spotlight shadow for stronger contact with the notebook, architecture model and research stack.

## Hover behavior
- On the bare metal plane:
  - beam stays narrow and concentrated
  - floor response remains small and local
- On Writing / Architecture / Research:
  - spotlight target shifts to the object's 3D center
  - cone angle eases wider to wrap the object
  - spotlight intensity increases
  - volumetric cone and particles expand with the beam
  - hovered model eases upward by ~0.13 world units, then settles back down after hover

## Quality / restraint
- The floor glow radius was reduced so the base state reads as a focused spotlight, not a broad wash.
- Volumetric particles remain sparse and softly additive.
- All transitions use interpolation; no hard snapping is used for angle, beam position, intensity or object lift.
