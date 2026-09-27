# Current revision — user reference ui-baseline(4).png

The latest1672×941 screenshot supersedes earlier HOME visual targets. See dist/references/current-home.png. HOME now uses angled side labels on a shallow arc, blank research sheets, a wider mineral plinth and layered smoked/clear acrylic. Earlier seven-state contact sheet still informs preview/index only. New model transforms live in dist/scene-layout.js. Animation and camera transition work is deferred as requested.

# QA specification — v1

## Seven reference states
| ID | State | Source / crop x,y,w,h |
|---|---|---|
| 01-home | HOME | A full1536×864 |
| 02-writing-preview | PREVIEW_WRITING | B18,410,502,212 |
| 03-architecture-preview | PREVIEW_ARCHITECTURE | B530,410,481,212 |
| 04-research-preview | PREVIEW_RESEARCH | B1021,410,498,212 |
| 05-writing-index | INDEX_WRITING | B18,633,555,196 |
| 06-architecture-index | INDEX_ARCHITECTURE | B582,633,566,196 |
| 07-research-index | INDEX_RESEARCH | B1158,633,361,196 |

Preserve original JPEG hashes. Crop without sharpening/upscaling; contact-sheet states contain very little detail. Their native aspect ratios differ. Render each comparison at matching ratio, then downsample implementation to native crop size; never stretch the reference to16:9. Also capture1536×864 endpoints for full-size review, clearly labeled extrapolation.

## Playwright comparison workflow (future executable gate)
1. Pin browser version, OS fonts, viewport, DPR1, locale and GPU backend. Serve all assets locally; wait for fonts, GLBs, textures and a scene-ready signal.
2. Expose deterministic state selection and transition clock in QA mode only. Freeze all random seeds and environment exposure. Direct endpoint loading must use the same transforms as real navigation.
3. Capture all seven named states, then reach each through real clicks to confirm agreement. HOME at1536×864; others at exact crop aspect (e.g.1506×636 for writing preview, downsample3×).
4. Use Playwright screenshot assertions against approved browser baselines for regressions. Supplied-reference comparison is a separate art-direction test: save reference/current/absolute-difference and50% overlay images, plus silhouette masks and landmark tables. Never bless the first generated output as reference equivalence.
5. Reference acceptance targets (provisional): HOME object bounding edges ±8px, anchors ±5px, header/footer ±3px, silhouette intersection-over-union≥.94; preview normalized anchor deviation≤.015; label width±5%. These require manual masks/landmarks, not a global screenshot percentage alone.
6. Use luminance and edge comparison on object/background regions separately. JPEG artifacts, different fonts and rasterized tiny contact-sheet labels prevent meaningful zero-pixel equality. Initial pixelmatch threshold.15 and diff≤2% only for same-browser regression baselines, not proof of art-direction fidelity.
7. Inspect materials at100%/200%: linen not plastic; clear acrylic not opaque white; floor not a gradient; ribbon/clip/page edges present; contact shadows grounded. Verify no model clipping during all transitions at25/50/75% duration.
8. Functional: three objects and labels, Enter, Back, Escape, browser history, filters, focus return, rapid reversal, reduced motion and touch. Capture390×844/768×1024/1920×1080 adaptations; they have no supplied visual baseline.
9. Record missing assets, font mismatch, material limitations, exact browser/GPU and screenshots in QA_REPORT.md. A successful deployment is not visual acceptance. Do not claim Playwright ran unless results exist.

## Release gate
Specifications complete before source implementation. All three final geometry assets downloadable; seven endpoints implemented; no false authored content; no broken local dependencies. Browser validation required for a production-quality claim. If preview infrastructure is unavailable, publish only with an explicit unverified visual status. Additional polish remains open until reference overlays pass.
