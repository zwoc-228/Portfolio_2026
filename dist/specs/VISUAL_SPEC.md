# Current revision — user reference ui-baseline(4).png

The latest1672×941 screenshot supersedes earlier HOME visual targets. See dist/references/current-home.png. HOME now uses angled side labels on a shallow arc, blank research sheets, a wider mineral plinth and layered smoked/clear acrylic. Earlier seven-state contact sheet still informs preview/index only. New model transforms live in dist/scene-layout.js. Animation and camera transition work is deferred as requested.

# Visual specification — reference reconstruction v1

## Evidence and precedence
Reference A: 733B4843-FDFE-4226-B71E-1A773AAB24A8.jpeg, 1536×864, primary HOME composition. Reference B: 86288B39-20A1-4CA8-9067-9D192B8D5678.jpeg, 1536×864, seven-state contact sheet. A controls HOME; B controls preview/index. B's wide home crop is an alternate aspect ratio, not a second desktop target. All coordinates below are approximate manual image measurements, not source-design metadata. O = observed; I = inferred production parameter. No exact camera, font identity, shader values or animation can be recovered from a still.

## HOME geometry (O)
Origin top-left; normalized coordinates = px / (1536,864). Bounds include geometry, excluding cast shadows.

| Element | x,y,w,h px | Normalized center | Notes |
|---|---|---|---|
| Writing notebook + ribbon | 158,306,355,253 | .218,.501 | cover corners approximately (280,307),(508,324),(428,520),(160,495) |
| Architecture assembly | 600,230,335,288 | .500,.433 | square plinth; tower above center |
| Research stack | 1008,302,409,264 | .789,.502 | top corners (1020,326),(1294,304),(1415,518),(1096,548) |
| Writing label | 260,580,97,29 | .201,.688 | italic |
| Architecture label | 696,580,144,29 | .500,.688 | roman |
| Research label | 1189,580,110,29 | .810,.688 | roman |

Object projected width ratio 1.06:1:1.22. Architecture tallest; paper widest. Objects sit in middle band, with generous empty upper field. Header left 38px/top40px; right edge 38px. Name ~24px; coordinates ~10px on two lines at x176. Nav About/Archive/Contact ~13px; centers x1264/1338/1416; dark circular control at (1486,49), diameter24. Do not assign unsupported audio behavior to this symbol.
Labels ~27px serif, weight400, charcoal. Short rule ~20px at y619; section numbers 01/02/03 ~14px at y640. Baseline horizontal in A; B shows perspective inclination. Preserve A for HOME. Bottom statement at (38,738), two lines, ~18px/20px: “Thinking through / Architecture and the World.” Footer (38,827), ~12px: “© 2024 Y. Zhu   All rights reserved.” Location right: “New York, NY  |  Seattle, WA”. Instruction at (1371,758), 12px, outlined circle centered(1349,756).

## Surface and light (O → I)
Cool neutral silver, horizontally brushed, softly reflective; broad pale highlight along left edge. No horizon, no CSS gradient substitute. Objects have soft shadows towards lower-right; tight dark contact occlusion under book spine, stack and plinth. Broad reflections are blurred, never mirror-sharp. Pale linen book with visible weave, layered warm-white pages, rounded spine, off-white ribbon and narrow elastic near right edge. Plinth/tower: porous white mineral. Blue-gray translucent front block, clear acrylic volumes, warm copper rear-right block, dark mineral front-right block. Research: separate slightly offset sheets, readable top-page heading “Research notes”, subdued map/diagram and lower text, bent metallic paperclip. Edge thickness and bevel highlights must survive at final size.

## Preview panels from B (O)
Crop rectangles in source pixels: Writing(18,410,502,212); Architecture(530,410,481,212); Research(1021,410,498,212). Local normalized sidebar x.057, number y.27, title y.36, rule y.49, categories y.57–.71, Enter y.89. Selected object centered approximately (.65,.55), occupies ~.43 width and .67 height. Header remains. No other large objects. Writing: Essays / Notes / Observations. Architecture: Built Ideas / Academic Projects / Experiential Works. Research: Urban Studies / Environmental Systems / Speculative Futures.

## Index panels from B (O)
Writing crop(18,633,555,196), Architecture(582,633,566,196), Research(1158,633,361,196). Pale neutral background; compact top navigation. Left sidebar width~22%; content starts at~23%. Writing: four horizontal rows, thumbnail, title, description, date, right arrow, fine separators. Architecture: four image-led columns. Research: two image-led columns. Titles visible: On the Edge of the City; Material and Memory; Cities in Fragments; A Quieter View. Architecture: Light Between Walls; Floating Ground; Threshold; Common Terrain. Research: Rivers and Cities; More Than Human. These are reference demonstration titles, not verified authored projects. Do not claim authorship or invent full articles.

## Typography and responsive contract (I)
Use a locally hosted high-contrast serif with roman and italic; initial candidate Instrument Serif, explicitly an approximation. Compare lowercase a/g, capital W, numerals and name width before final acceptance. Do not stretch glyphs. Exact font unresolved. Desktop layout canonical1536×864. Scale geometry with aspect-aware camera framing, not separate arbitrary CSS object sizes. Narrow screens retain three objects with compact labels and readable navigation; previews stack sidebar/object only where necessary. Mobile is an inferred adaptation, not screenshot-verified.
