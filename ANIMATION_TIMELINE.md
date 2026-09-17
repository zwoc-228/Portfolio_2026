# Animation Timeline

The motion language must be precise, subtle, and reversible.
No bounce, elastic, overshoot, or showy orbiting.

## Global timing standards
- Hover: 180–220 ms
- Home → category: 750–900 ms
- Category → project: 900–1100 ms
- Project → category: 750–900 ms
- Category → home: 700–850 ms

Suggested easing:
- `power2.inOut`
- `power3.inOut`
- or `cubic-bezier(.22,.61,.36,1)`

## Homepage hover
On object hover:
- object lifts only enough to read as active: visually ~5–8 px max
- label opacity ~0.68 → 1
- contact shadow becomes slightly clearer
- pointer cursor
- non-hovered objects reduce brightness by only ~3%

No rotation, bounce, glow, or large scale change.

## Click object → category open
Example: Architecture.

### 0–150 ms
- lock hover state
- temporarily lock conflicting interactions

### 150–700 ms
- camera and target move together toward the Architecture object
- real camera translation, not CSS zoom
- distance reduction roughly 12–18%
- horizontal yaw <= 4°
- pitch change <= 2°
- no cinematic orbit

### 250–600 ms
- Writing and Research fade to opacity ~0.30–0.45
- move outward by only ~3–5vw

### 500–850 ms
- category acrylic menu fades/slides in while camera motion is still completing
- animation overlaps; do not wait for the camera to fully stop

Menu reveal:
- opacity 0 → 1
- translateY 12 px → 0
- optional blur 6 px → 0
- duration 280–360 ms

## Category menu placement
Never cover the selected object.
- Writing selected → panel on its right
- Architecture selected → panel on its right
- Research selected → panel on its left

Panel target size:
- width 360–430 px
- max height about 520 px
- radius 10–14 px

Suggested acrylic DOM styling:
```css
background: rgba(238, 240, 240, .62);
backdrop-filter: blur(18px) saturate(105%);
border: 1px solid rgba(255,255,255,.38);
box-shadow: 0 18px 50px rgba(30,40,50,.07);
```

## Category menu content
Architecture example:
```text
02
Architecture

Built Ideas
Academic Projects
Experimental Works
────────────

Project
Project
Project
Project
```

Writing: vertical list, title + date + arrow.
Architecture: compact 2-column thumbnail grid or restrained list.
Research: title + short descriptor + year + very small diagram/map thumbnail.

## Category → project
1. Focus selected project card (0–300 ms): tiny 1.04-scale or equivalent emphasis; fade other cards.
2. Camera moves ~10–14% closer (200–850 ms), still restrained.
3. Category panel morphs/expands from ~400 px to about 55–62vw (450–1000 ms).
4. Hero media appears during the expansion.
5. Push SPA route such as `/architecture/static-travel` without page reload.

## Project page
Keep the WebGL canvas alive in the background. Do not destroy/recreate it between routes.
The DOM content layer becomes primary.

Project content reveal:
- opacity 0 → 1
- translateY 12 px → 0
- duration 320–420 ms

Do not use scroll-jacking, constant parallax, or per-image zoom animation.

## Reverse navigation
Back must reverse the existing transition rather than hard-cut.

Project → Category:
project content fades → panel shrinks → camera pulls back → category list returns.

Category → Home:
panel disappears → camera restores → other two objects return → labels restore.

Browser Back must trigger the same transition logic.

## Mouse parallax
Allowed only as a barely perceptible desktop enhancement.
Camera target offset max: ±0.025–0.04 scene units (roughly 1–4 px perceptually).
Disable parallax during camera/menu/project transitions.

## Reduced motion
Respect `prefers-reduced-motion`:
- remove parallax
- remove decorative camera flourishes
- use simple crossfades and immediate but legible state changes
