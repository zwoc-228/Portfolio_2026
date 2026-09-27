# Round 27 — Reject Round 26 header and rebuild it properly

## Why Round 26 is rejected
The screenshot exposed several structural problems:

1. **The collapsed state is not an orb.**
   The previous implementation took a 13.45-world-unit rounded bar and only compressed its X scale. At the current camera depth, that still projects to roughly a 160 × 125 px rectangular glass slab. That is the large box visible behind the sphere.
2. **Two visual orbs were stacked.**
   The WebGL glass core and the HTML home button were both visually styled as spheres, producing a small orb on top of a larger blue orb.
3. **The material is over-tinted blue.**
   Environment intensity + attenuation color + high opacity made the core read as blue plastic, not clear/frosted liquid glass.
4. **The glass was placed inside the main perspective scene.**
   UI dimensions were therefore controlled by world-space perspective rather than precise screen-space pixels. This is why the header feels like a floating prop instead of interface material.
5. **Desk feedback was fixed in world space.**
   It was not derived from the actual UI position, so reflection/caustic feedback could drift away from the visible UI.
6. **The old UI and the 3D UI competed.**
   HTML chrome still contributed a visual orb while WebGL tried to provide another one.
7. **Scene exposure and pointer beam were too strong.**
   The overall scene became washed out and the volumetric beam competed with the portfolio objects.

## Round 27 architecture
### Header glass
- The header no longer lives as a physical rounded box in the main perspective scene.
- It is now rendered in a dedicated **screen-space WebGL overlay scene** with an orthographic camera.
- The material is a custom shader using a rounded-box SDF, pseudo-bevel height, derived normals, RGB-separated refraction taps, Fresnel/rim cues, and a tiny motion ripple.
- The background behind the header is captured from the already-rendered main framebuffer using `FramebufferTexture` and `copyFramebufferToTexture`.
- Default state is a real 44 × 44 px glass orb. No rectangular backing remains.
- Hover morphs the orb into a ~54 px high navigation capsule.

### DOM/UI relationship
- HTML now supplies only typography, navigation targets, and accessibility.
- The collapsed orb has **no duplicated HTML sphere styling**.
- Navigation copy begins revealing only after the glass body is ~42% expanded.
- A small home control appears only after the expanded state is established.

### Motion
- Spring constants were retuned for a restrained interaction.
- Added a 120 ms collapse hysteresis so users can move from the glass body into links without accidental closure.
- Wobble is driven by velocity and remains subtle.

### Desk feedback
- Removed fixed-position header caustic logic.
- Added a new anisotropic UI-caustic uniform to the existing metal-floor shader.
- Each frame, the current screen-space header bounds are ray-projected onto the actual desk plane.
- The floor response is generated from those intersections, so the highlight stays optically tied to the UI position.

### Scene balance
- Tone mapping exposure: 1.20 → 1.12
- Environment intensity: 1.42 → 1.30
- Desk environment intensity: 3.10 → 2.62
- Desk roughness: 0.43 → 0.47
- Pointer volumetric beam opacity reduced substantially, not removed.

## Reference
Codrops — Building an Infinite Liquid Glass Grid with Three.js, WebGPU, and TSL
https://tympanus.net/codrops/2026/09/08/building-an-infinite-liquid-glass-grid-with-three-js-webgpu-and-tsl/

The relevant ideas carried over are screen-space glass, SDF-based rounded geometry, refraction, reflection/Fresnel cues, rim light, and keeping HTML text independent from the GPU glass layer.

## Validation
- JS syntax checks passed for the updated UI and app modules.
- Asset validation remains: 31 meshes / 11,848 triangles / finite geometry / valid glTF containers.
