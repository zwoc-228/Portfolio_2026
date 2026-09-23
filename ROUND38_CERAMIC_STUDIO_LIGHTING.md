# Round 38 — ceramic maquette and soft studio lighting

Starting point: `Portfolio_2026_round37_ui-scale-reflection-lighting(3).zip`.

## Changes

- Architecture: replaced visible marble albedo with a warm porcelain maquette. The existing fine normal map now contributes only low-amplitude micro-relief. A matte inset distinguishes the front podium; copper, graphite and acrylic remain separate materials and volumes.
- Lighting: lowered both shadow-casting directionals and the tabletop environment contribution. Large, lower-intensity studio panels now distribute reflections across the silver desk. Preserved soft contact shadows and the live planar reflection.
- UI: unified the navigation sphere, expanded bar, overlay panels, project cards and detail surface around ivory ceramic color, broad soft highlights, subtle scene response and restrained edge reflections.
- Interaction: cancelled stale detail-card close timers before opening another card, and ignored stale gallery transition callbacks after content replacement.
- Packaging: omitted backup files, inactive styles and two unused marble texture files from the deployable archive.

## References

- Unseen Studio: https://unseen.co/projects/ — reference for a restrained 3D art direction, not a claim that this site uses the same assets or renderer.
- Three.js MeshPhysicalMaterial: https://threejs.org/docs/pages/MeshPhysicalMaterial.html — physical material and clearcoat behavior.
- Three.js RoomEnvironment / PMREM: https://threejs.org/docs/pages/RoomEnvironment.html and https://threejs.org/docs/pages/PMREMGenerator.html — image-based lighting for broad environment reflections.
- Three.js RectAreaLight: https://threejs.org/docs/pages/RectAreaLight.html — explains the area-light look; its lack of shadow support is why the scene retains restrained shadow-casting directionals.

## Verification

- `node --check` passed on all active JavaScript modules.
- `scripts/audit-runtime.mjs` passed all nine runtime checks.
- `scripts/validate-assets.mjs` reported 31 meshes, finite geometry and valid GLTF containers. Its optional no-texture material construction still emits existing undefined-map warnings.
- A focused rapid close/reopen check confirmed that the second detail card remains visible after the old close timer would have fired.
- A live browser screenshot could not be captured in this environment; the material and lighting changes therefore need visual approval after opening the package in a WebGL browser.

Deploy the contents of `dist/` at the repository root for GitHub Pages.
