# Locked Rules — Do Not Redesign

## Homepage structure is locked
Keep the existing three-object structure exactly:

1. Writing — blank off-white notebook
2. Architecture — compact miniature architectural collection
3. Research — clipped research paper stack

Do not replace the three objects, add new hero objects, or convert the homepage into cards, a gallery, a city, a dashboard, or a large project grid.

## Overall art direction
Keywords: restrained, quiet, tactile, architectural model, matte aluminum, acrylic, paper, editorial, soft overcast studio light, precision.

Avoid:
- game UI
- sci-fi HUD
- excessive glassmorphism
- strong bloom or glow
- large pill buttons
- dashboard styling
- strong lens flare
- chrome/mirror metal
- overdone depth of field
- high-contrast theatrical lighting
- decorative arcs or lines with no function
- unnecessary floating particles
- large hover movement
- bounce / elastic / overshoot animation

## 16:9 baseline
Desktop visual baseline: 1920×1080 or equivalent 16:9.

## Lighting
Keep lighting soft and low-contrast. Shadows should exist but remain secondary.

## Writing object
Blank cover. No logo, no title, no decorative text on the notebook itself.

## Architecture object
Must read as a miniature architecture collection, not random cubes.
Use roughly 8–12 primary components. Keep it simple.
Approximate material split:
- 70–75% off-white / gray solids
- 15–20% clear or frosted acrylic
- 5–8% muted blue/cyan
- 3–5% muted terracotta/red
- 3–5% charcoal

Transparent pieces must not intersect solid geometry.

## Research object
Use real content extracted from the portfolio PDFs. No fake AI text.

## Perspective labels
Only `Writing 01`, `Architecture 02`, `Research 03` are world-space labels.
They should lie on the ground plane and visually form a shallow inward-facing U through position + yaw only.
Do not draw a visible guide arc.
Suggested yaw:
- Writing +5° to +7° toward center
- Architecture 0°
- Research -5° to -7° toward center
Architecture label baseline may sit 16–24 px lower than side labels in a 1920×1080 reference view.

## Screen-space UI
Header, About / Archive / Contact, tagline, copyright, location, etc. remain horizontal DOM UI.

## Scope discipline
A requested change must not trigger unrelated redesign.
Examples:
- “Lower the light” → only adjust lighting/exposure/environment.
- “Change typography” → only typography and text layout.
- “Fix model intersection” → only geometry/material/rendering fixes.

## QA gate after each iteration
Capture 1920×1080 and verify:
- composition unchanged
- object scale unchanged unless explicitly requested
- light not brighter than baseline
- metal remains matte
- paper does not look plastic
- acrylic has correct refraction/transmission and no intersections
- architecture object has not become more complex
- three labels still form shallow inward perspective
- no decorative arc has appeared
- UI has not drifted into dashboard styling
- motion remains subtle and functional
