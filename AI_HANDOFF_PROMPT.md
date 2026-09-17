# Copy-Paste Prompt for the Web/Coding AI

You are rebuilding and extending an existing 3D portfolio website for Yuanlong Zhu.

Read every file in this handoff package before changing code. Treat `LOCKED_RULES.md` as non-negotiable. Treat `MASTER_SPEC.md`, `ANIMATION_TIMELINE.md`, `ASSET_PIPELINE.md`, and `PROJECT_CONTENT_MAP.md` as the implementation brief.

## Core constraint
Do NOT redesign the homepage. Preserve the current three-object structure and overall composition:
- Writing: blank notebook
- Architecture: compact miniature architectural collection
- Research: paper stack

The work is to improve realism, material behavior, camera, labels, transitions, menus, source-content ingestion, and project presentation while preserving the established visual structure.

## Required implementation behavior
- 16:9 desktop baseline.
- Matte brushed-aluminum infinite plane.
- Low-contrast overcast studio lighting.
- Architecture model uses off-white solids + a limited amount of physically correct clear/frosted acrylic + restrained muted color accents.
- No mesh intersections or z-fighting.
- `Writing / Architecture / Research` labels are world-space text lying on the floor and angled gently toward the center. Do not draw a decorative arc.
- Header/navigation/tagline/copyright remain horizontal DOM UI.
- Hover movement is subtle.
- Clicking a category performs a small real camera move and reveals an acrylic menu beside, not over, the object.
- Category → project morphs the panel into a wider presentation with a persistent WebGL canvas and SPA routing.
- Project-page content comes from the supplied portfolio PDFs and preserves each project’s original narrative order.
- Never invent project metadata or fake writing content.
- Browser Back reverses the same transition logic.
- Respect reduced motion.

## Working discipline
Before editing anything:
1. run the current site
2. capture a 1920×1080 screenshot
3. inspect the current camera, model transforms, lighting, fonts, and routes
4. document what you will keep unchanged

Then work in small audited stages. After every stage, output a new 1920×1080 screenshot and a concise changelog.

If a request says “only change X”, only change X. Do not take creative liberties outside the requested scope.

Start by implementing/validating the homepage visual baseline only. Do not build the entire site in one pass.
