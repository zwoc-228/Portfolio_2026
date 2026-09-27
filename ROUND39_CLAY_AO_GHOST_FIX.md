# Round 39 — clay maquette, studio AO, transition ghost fix

Starting point: `Portfolio_2026_round38_ceramic_studio_light.zip` / GitHub commit family labelled `38`.

## What this round fixes

### 1. Architecture HOME → preview afterimage
The visible residual was not one single opacity bug. Two state changes could lag behind the moving model:

- the planar reflection was refreshed at roughly 20 fps while the geometry moved every frame;
- shadow maps were staggered across several frames;
- Architecture transmission materials were swapped in before the model finished leaving HOME.

Round 39 now clears the stale planar target when a spatial transition starts, keeps the lightweight HOME acrylic proxy during the move, refreshes the key shadow every moved frame, refreshes the softer companion/reflection on a stable 30 fps cadence after the first two frames, and swaps the detailed transmission material only at the settled Architecture preview.

### 2. Architecture material / handcrafted model direction
The architecture now reads as a physical fired-clay / model-shop maquette rather than polished porcelain or marble:

- marble normal source removed from the active Architecture path; `arch-mineral-normal.png` is used instead;
- roughness raised substantially;
- clearcoat and specular intensity reduced;
- large mineral pieces receive slightly broader bevels;
- clear/frosted acrylic, graphite and copper are retained as separate physical materials but are less wet/glossy;
- five clay/mineral meshes receive stable vertex-color shading;
- inter-volume cavity/contact occlusion is precomputed once into those vertex colors with `bakeAssemblyAO()`.

This follows the same broad production logic visible in the Plateforme10 open-source process: model first, precompute stable shading information, then keep the real-time renderer simple. The Plateforme10 README explicitly shows a **Texture Baking** stage and its source references baked building textures.

### 3. Studio / AO-style grounding
Every main object now has a low-cost soft contact-shadow footprint in addition to the existing VSM shadows. It is deliberately broad and low-opacity, tracks the object in X/Z, and softens/weakens when hover lifts the object. These contact shadows are hidden from the planar-reflection capture so the desk does not reflect a fake shadow layer.

The two directional shadows were also softened and made less contrasty, closer to a large-source studio setup.

### 4. HOME ceramic sphere → matte clay/plastic sphere
The navigation sphere is less reflective:

- captured-scene contribution reduced from the previous ceramic/glass mix;
- specular lobes and Fresnel/rim energy reduced;
- body tint shifted slightly warmer and less metallic/cool.

On first HOME load the sphere now performs a restrained ~1 s desk bounce with three diminishing contacts. The geometry squashes subtly on impact. The floor response follows the bounce: contact shadow is strongest near impact, weaker/softer while lifted, and the existing floor reflection cue remains restrained.

### 5. Metal desk
The metal surface keeps the silver studio character, but the texture is less dominant:

- normal scale reduced from `.18` to `.075`;
- roughness raised from `.47` to `.52`;
- environment contribution and clearcoat reduced.

This leaves the object shadows and model materials as the main visual information instead of the tabletop grain.

## Reference evidence checked

- Plateforme10 / Kirilbt interactive-map: README shows Blender + Three.js and a dedicated **Texture Baking** step; repository source references `buildings-baked.jpg` and `mdba-baked.jpg`.
- User reference strip: clean low-saturation architectural maquettes, quiet bevels, broad studio shadows, restrained transparent/accent blocks.
- Setu / Work Update direction carried through as a matte, milky clay/plastic UI material rather than a reflective glass orb.

## Verification

- `node --check` passes for the modified active modules.
- `scripts/audit-runtime.mjs` passes all nine runtime checks and retains one frame driver.
- `scripts/validate-assets.mjs` reports 31 meshes, 19,912 triangles, finite geometry and valid GLTF containers.
- Architecture model audit: 12 Architecture meshes, 5 clay/mineral meshes with baked-style vertex colors, 5 transmission meshes retained for the detailed preview.

## Important limitation of this environment

The container cannot initialize a working headless WebGL/EGL context, so a trustworthy live Chromium screenshot could not be produced here. Do not substitute a generated image for a real site screenshot. Visual acceptance still needs to be done in a normal WebGL browser after deployment/opening locally.
