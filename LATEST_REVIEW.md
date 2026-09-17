# Yuanlong Portfolio — LATEST REVIEW CHECKPOINT

**Date:** 2026-09-16
**Status:** Known-good build — TypeScript clean, Vite build passes, zero runtime errors

---

## Current Project Architecture

```
Yuanlong_Portfolio_AI_Handoff/
├── package.json              # React 18 + Vite 5 + Three.js + R3F + Drei + Zustand + React Router
├── tsconfig.json
├── vite.config.ts
├── index.html                # Entry with Google Fonts (EB Garamond + Inter)
├── src/
│   ├── main.tsx              # Entry: BrowserRouter → App
│   ├── App.tsx               # Layout: Canvas + DOM overlay layers + routing
│   ├── store.ts              # Zustand: hoveredObject, selectedCategory, selectedProject, isTransitioning, reducedMotion, isMobile
│   ├── vite-env.d.ts
│   ├── styles/global.css     # Reset, CSS variables, font stacks
│   ├── scene/
│   │   ├── HomeScene.tsx     # R3F Canvas wrapper with all 3D content
│   │   ├── CameraRig.tsx     # PerspectiveCamera lerp transitions + mouse parallax
│   │   ├── Lighting.tsx      # Overcast studio: key + fill + ambient + hemisphere
│   │   ├── InfinitePlane.tsx # Matte aluminum floor (metalness 0.82, roughness 0.75)
│   │   ├── WritingObject.tsx # Blank notebook: cover + page block + spine + ribbon
│   │   ├── ArchitectureObject.tsx # 10-piece miniature: off-white + acrylic + color accents
│   │   ├── ResearchObject.tsx     # Stacked papers + metal paper clip
│   │   └── WorldLabels.tsx        # Troika SDF text: Writing 01 / Architecture 02 / Research 03
│   ├── components/
│   │   ├── Navigation.tsx    # Header: name, coordinates, role, About/Archive/Contact, Back button
│   │   ├── Footer.tsx        # Tagline, copyright, scroll hint, location
│   │   └── CategoryMenu.tsx  # Frosted acrylic panel with category sub-sections + project list
│   ├── pages/
│   │   └── ProjectPage.tsx   # Project detail: title, metadata, summary, hero placeholder
│   └── data/
│       ├── architecture.json # 4 projects (Static Travel, Reproduce Tradition, The Fusion, Reimagine Everydayness)
│       ├── research.json     # 3 projects (Information Relays, Resource Paradox, Famous for 15 Minutes)
│       ├── writing.json      # Empty (spec: no invented content)
│       └── projects.json     # Category grouping structure
├── public/
│   ├── vite.svg
│   └── portfolio/            # Empty placeholder folders for PDF-extracted content
│       ├── static-travel/
│       ├── reproduce-tradition/
│       ├── the-fusion/
│       ├── famous-for-15-minutes/
│       ├── information-relays/
│       ├── resource-paradox/
│       └── reimagine-everydayness/
├── dist/                     # Production build output
├── LOCKED_RULES.md           # Non-negotiable visual constraints
├── MASTER_SPEC.md            # Full design + interaction spec
├── AI_HANDOFF_PROMPT.md      # Copy-paste prompt for coding AI
├── ANIMATION_TIMELINE.md     # Motion sequencing and timing
├── ASSET_PIPELINE.md         # Model/material/PDF asset workflow
├── PROJECT_CONTENT_MAP.md    # Source PDFs and project/page mapping
├── AGENTS.md                 # Agent instructions
└── README.md                 # Package overview
```

---

## Visual Target

Reference image: `reference/ui-baseline.png` — shows:
- Three objects on matte metallic infinite plane
- Writing (notebook, left ~25%), Architecture (miniature collection, center ~50%), Research (paper stack, right ~76%)
- World-space labels on ground forming shallow inward U
- DOM header: name, coordinates, role, nav links
- DOM footer: tagline, copyright, scroll hint, location
- Soft overcast studio lighting, no harsh shadows

---

## Locked Visual Rules (from LOCKED_RULES.md)

1. Three-object homepage structure is LOCKED — Writing / Architecture / Research only
2. No game UI, sci-fi HUD, excessive glassmorphism, bloom, large pill buttons, dashboard styling
3. 16:9 desktop baseline (1920×1080)
4. Soft low-contrast lighting
5. Writing: blank off-white notebook, no logo/text on cover
6. Architecture: 8–12 primary components, specific material split (70-75% off-white, 15-20% acrylic, 5-8% blue, 3-5% terracotta, 3-5% charcoal)
7. No decorative arcs, bounce/elastic animation, large hover movement
8. Scope discipline: a change must not trigger unrelated redesign

---

## What Currently Works

| Feature | Status |
|---|---|
| Canvas renders with WebGL | ✅ |
| Three 3D objects visible at correct positions | ✅ |
| Infinite matte metallic floor | ✅ |
| Overcast studio lighting (key + fill + ambient + hemisphere) | ✅ |
| World-space labels (Troika Text) on ground plane | ✅ |
| Mouse parallax (subtle camera offset) | ✅ |
| Hover: subtle 5-8px lift + cursor change | ✅ |
| Click object → camera transition + other objects fade | ✅ |
| Acrylic category menu appears beside selected object | ✅ |
| Category menu shows sub-sections + project list | ✅ |
| Click project → project detail page with metadata | ✅ |
| Escape key → back to home | ✅ |
| Back button in nav → back to home | ✅ |
| DOM UI: header, footer, navigation | ✅ |
| Reduced motion support | ✅ |
| Mobile detection | ✅ |
| Contact shadows | ✅ |
| TypeScript clean compile | ✅ |
| Vite production build passes | ✅ |
| Zero runtime console errors | ✅ |

---

## Current Known Problems

1. **CameraRig workaround** — Uses a 100ms `setTimeout` delay before taking over camera. This is fragile; should be replaced with R3F's `useEffect` + `useFrame` idle detection pattern.
2. **Menu position** — Category menu appears to the left of center for Architecture (at left: 520px). Per spec, it should appear to the RIGHT of the selected object. The `panelSide` logic uses CSS `right` property but the positioning math needs adjustment.
3. **Writing category empty** — Writing projects list is empty per spec. No articles have been supplied.
4. **No PDF content extraction** — Project hero images and narrative content are placeholders. The two source PDFs need to be parsed per `PROJECT_CONTENT_MAP.md`.
5. **No GSAP** — Camera transitions use R3F `lerp` instead of GSAP `power2.inOut` easing per `ANIMATION_TIMELINE.md`.
6. **Font loading** — Google Fonts loaded via CSS `@import`. Troika Three Text tries to load woff2 fonts which fail in headless Chrome (works in real browser).
7. **Bundle size** — 1,124 KB JS bundle (323 KB gzipped). Should be code-split for Three.js.
8. **Objects slightly small** — Writing and Research objects could be scaled up ~10-15% to better fill the viewport per reference.
9. **Acrylic material** — `meshPhysicalMaterial` transmission may not render correctly on all GPUs. Needs testing on integrated graphics.

---

## Files Most Relevant to Homepage

| File | Why |
|---|---|
| `src/scene/HomeScene.tsx` | Canvas setup, scene composition |
| `src/scene/CameraRig.tsx` | Camera transitions, parallax (HAS WORKAROUND) |
| `src/scene/WritingObject.tsx` | Notebook geometry + materials |
| `src/scene/ArchitectureObject.tsx` | Miniature collection geometry + materials |
| `src/scene/ResearchObject.tsx` | Paper stack geometry + materials |
| `src/scene/WorldLabels.tsx` | 3D text labels |
| `src/scene/Lighting.tsx` | Studio lighting setup |
| `src/scene/InfinitePlane.tsx` | Metallic floor |
| `src/components/CategoryMenu.tsx` | Acrylic menu panel |
| `src/components/Navigation.tsx` | Header DOM UI |
| `src/components/Footer.tsx` | Footer DOM UI |
| `src/store.ts` | Application state |
| `src/App.tsx` | Layout + routing |

---

## Exact Next Recommended Task

**Extract PDF content from the two source PDFs into structured JSON and hero images.**

Per `PROJECT_CONTENT_MAP.md`:
- `sources/2024_4(2).pdf` → Static Travel (pp. 3-8), Reproduce Tradition (pp. 9-15), The Fusion (pp. 16-22), Famous for 15 Minutes (pp. 23-27), Information Relays (pp. 28-30), Resource Paradox (pp. 31-33)
- `sources/Final_Portfolio-2(4).pdf` → Information Relays (pp. 2-10), Resource Paradox (pp. 11-20), Reimagine Everydayness (pp. 21-29)

This is the critical content pipeline block — project pages currently show placeholder text.

---

## Temporary/Workaround Implementations

### CameraRig (CRITICAL WORKAROUND)

```tsx
// src/scene/CameraRig.tsx
// Uses a 100ms setTimeout before taking over camera control.
// This prevents fighting with R3F's internal camera initialization.
// The 'ready' state gates all useFrame camera updates.
const [ready, setReady] = useState(false)
useEffect(() => {
  const timer = setTimeout(() => {
    camera.position.copy(defaultPos)
    camera.lookAt(defaultTarget)
    setReady(true)
  }, 100)
  return () => clearTimeout(timer)
}, [camera])

// In useFrame:
if (!ready) return
```

**Why:** R3F initializes the camera internally. If `useFrame` modifies position/rotation before R3F completes setup, objects render off-screen. The 100ms delay is arbitrary and may fail on slow machines.

**Proper fix:** Use R3F's `useThree` to detect when the camera is ready, or set camera via Canvas props and only apply parallax in useFrame.

---

## Commands to Run/Build

```bash
# Install Node.js (if not present)
# Node v20+ required

# Install dependencies
npm install

# Development server
npm run dev
# → http://localhost:5173

# TypeScript check
npx tsc --noEmit

# Production build
npm run build
# → dist/

# Preview production build
npm run preview
```

---

## Build Verification (This Checkpoint)

- **TypeScript:** Clean (zero errors)
- **Vite build:** Passes (1,124 KB JS, 0.79 KB CSS)
- **Console errors:** 0
- **Console warnings:** 6 (all expected: GL Driver performance, font loading)
- **Screenshots verified:** Home page, Architecture category, Research category, Project detail
