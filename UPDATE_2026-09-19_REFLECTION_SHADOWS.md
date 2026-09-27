# Update — 2026-09-19 reflection / shadow cleanup pass

## Targeted fixes
1. Increased desktop metal reflectivity without turning it mirror-like.
2. Improved planar floor reflection quality.
3. Reduced jagged / blocky appearance in model edges and shadows.

## What changed
- `dist/floor-reflection.js`
  - reflection render target raised from `1024x576` to `2048x1152`
  - enabled mipmaps and linear filtering on the reflection texture
  - enabled multisampling (`samples=4` when supported)
  - switched to a denser 7x7 weighted blur kernel with tighter sampling radius
  - increased reflection contribution from `0.34` to `0.46`

- `dist/app.js`
  - renderer pixel ratio cap increased from `2.0` to `2.5`
  - shadow map type changed from `PCFSoftShadowMap` to `VSMShadowMap`
  - desk metal texture repeat reduced from `30` to `18`
  - desk metal material adjusted:
    - stronger environment response
    - lower roughness
    - stronger normal contribution
    - slightly stronger anisotropy / clearcoat
  - key light shadow map increased from `2048` to `4096`
  - companion light shadow map increased from `1024` to `2048`
  - tightened shadow camera bounds and softened blur samples for cleaner edges
  - slightly reduced fill washout so reflections read more clearly

## Scope
This pass focuses on the homepage browser render only: tabletop reflectivity, reflection quality, and shadow cleanliness. Model geometry was not redesigned in this pass.
