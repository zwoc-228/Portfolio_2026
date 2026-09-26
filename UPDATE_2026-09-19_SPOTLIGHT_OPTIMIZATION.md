# Update — 2026-09-19 spotlight cleanup + interaction optimization

## Fixes
- Removed the second nested volumetric cone that was producing the visible two-layer spotlight.
- Kept a single soft volumetric beam plus airborne particles.
- Softened model-hover illumination to avoid blown-out whites and excessive contrast.
- Reduced hover lift slightly while preserving the same interaction concept.

## Performance work
- Pointer raycasting is now throttled to at most once per animation frame instead of running for every raw pointer event.
- Model hover bounds/centers/spot angles are cached once after scene creation instead of allocating Box3/Vector3 objects on every mouse move.
- The moving spotlight no longer renders its own expensive 2048px shadow map every frame; the existing studio/key shadows remain.
- Static 4096px/2048px key-light shadow maps update on scene transitions, not continuously during pointer movement.
- Particle count reduced from 150 to 96 while retaining the visible dust-beam effect.
- Animation timing is delta-time based and pauses when the browser tab is hidden.

## Visual intent preserved
- Overhead 3D spotlight remains.
- Beam particles remain.
- Small focused beam on the metal plane remains.
- Hover expands the beam to cover Writing / Architecture / Research and gently lifts the model.
