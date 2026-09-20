# Current HOME revision — QA status

Latest visual target: ui-baseline(4).png,1672×941. Static HOME and materials only; animation/camera choreography deferred per user.

Implemented: four-corner notebook/paper fitting; curved individual sheets; open double-loop wire clip; refined linen/mineral roughness and normal maps; transmission/attenuation changes; blank research sheets; new font; curved label arrangement; soft planar scene reflection; four-sample key-light shadow rig.

Geometric fit in1536×864 equivalent pixels: notebook target corners(281,318),(501,351),(396,505),(123,462); fitted(274,317),(507,350),(390,506),(129,463). Research target(1022,352),(1280,314),(1420,476),(1121,528); fitted(1017,350),(1279,320),(1422,481),(1124,520). These are manually estimated source landmarks. Residual errors remain; fitting is not full silhouette acceptance. Architecture projected bounds577,261–952,529 match its target box.

Validation: source syntax, mesh finite positions/indices/normals, glTF containers, local resource references. Current cloud Chrome reports WebGL disabled; actual material rendering, custom reflection shader execution and complete HOME screenshot comparison are UNVERIFIED. Do not call this visually accepted, production-quality, or pixel-matched. Offline raster previews cannot validate the real shader.

Models are authored in runtime dimensions, export uses same shared transforms. Standalone GLBs carry source PBR parameters and texture data; browser reflection/light rig is separate. Native Blender files are unavailable. Original project content remains missing for the reference-derived indexes.
