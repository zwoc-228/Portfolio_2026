# Current revision — user reference ui-baseline(4).png

The latest1672×941 screenshot supersedes earlier HOME visual targets. See dist/references/current-home.png. HOME now uses angled side labels on a shallow arc, blank research sheets, a wider mineral plinth and layered smoked/clear acrylic. Earlier seven-state contact sheet still informs preview/index only. New model transforms live in dist/scene-layout.js. Animation and camera transition work is deferred as requested.

# Asset inventory — v1

Status here describes requirements before implementation, not a claim that assets already exist. All assets must be bundled locally and listed in a final delivery manifest.

| Asset | Required contents | Format / target |
|---|---|---|
| Writing model | covers, spine, hinge, page-edge layers, elastic, ribbon | GLB + editable authoring source |
| Architecture model | plinth, mineral tower, bridge, clear volumes, blue block, copper block, dark stone | GLB + editable authoring source |
| Research model | layered sheets, printed top page, curved wire clip | GLB + editable authoring source |
| Complete scene | three roots, materials, camera seed, lights | GLB + scene source |
| Floor material | brushed metal roughness, micro-normal, restrained base modulation | tileable 2K maps; linear data maps |
| Linen | fine weave base/bump/roughness | 1K–2K |
| Paper | off-white fiber, roughness; page edge bands | 1K |
| Stone | fine porous base/bump/roughness | 1K |
| Acrylic | physical material, real thickness | glTF transmission/IOR, no fake gradient |
| Copper and clip | physical metallic response | material definitions |
| Research print | heading, muted map, rules, four labels, graph and folio | 2K image, original reference-based layout |
| Environment | neutral studio reflection source | generated light-room environment or licensed HDRI |
| Roman serif | locally hosted licensed font, identity unconfirmed | WOFF2/TTF + license |
| Italic serif | Writing title | same family italic + license |
| Index thumbnails | four writing, four architecture, two research | reference crops for visual study; replace with supplied authentic work before public portfolio claim |
| UI symbols | rules, arrow, outline circle, solid circle | CSS/text for functional symbols |
| Reference images | original A and B, seven crops | original JPEG + lossless derived PNG |

No asset-store model may substitute without silhouette comparison. No generic gradient stand-ins. Do not generate unrelated imagery. Reference thumbnail crops are allowable for this private reconstruction study; they are not new authored projects. Original project files, exact font identity, exact research-page map and full-resolution index screenshots remain unavailable. Missing originals constrain final fidelity. Record them as unresolved rather than manufacture provenance.
