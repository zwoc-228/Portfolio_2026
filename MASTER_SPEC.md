# Yuanlong Zhu Portfolio — Master Build Specification

## 1. Product definition
Create a high-fidelity 3D portfolio website based on the locked three-object homepage. The experience should feel like a quiet digital worktable: architectural model photography, product photography, editorial design, and restrained Fluent-style acrylic overlays.

The site should look simple from a distance, tactile at close range, layered when interacted with, and content-first once a project opens.

## 2. Homepage composition
Keep three objects only:
- Writing — blank notebook
- Architecture — compact architectural miniature collection
- Research — real research paper stack

Maintain wide negative space above the objects. Do not make the objects fill the screen.
No visible desk edge; the floor should read as an infinite matte metallic plane.

Reference centers for a 1920×1080 baseline:
- Writing x ≈ 25%
- Architecture x ≈ 50%
- Research x ≈ 76%
- object visual center y ≈ 55–59%

## 3. Camera
Use architectural still-life photography, not game-camera language.
Suggested starting point:
- PerspectiveCamera
- FOV 28–34°, start around 31°
- pitch roughly -18° to -24°
- roll 0
- yaw near 0

Avoid ultrawide distortion and dramatic perspective.

## 4. Lighting
Target overcast studio light.
Use:
- one large soft key from upper-left/front
- one weak fill from the right/front
- one low-intensity HDRI/environment

Avoid obvious light shafts, hard hotspots, bloom, deep black shadows, and mirror reflections.
Start exposure near 0.85–0.95 and tune visually.
Use a filmic/ACES-style tone mapping pipeline.

## 5. World-space labels
`Writing 01`, `Architecture 02`, and `Research 03` should be 3D/world-space labels lying on the ground plane.
Use a high-quality SDF text system such as Drei/Troika text.
Do not fake the perspective using arbitrary CSS rotation.

The three labels visually form a shallow inward-facing curve by their positions and yaw, not by bending text and not by drawing a guide line.

## 6. Screen-space UI
Keep these as normal horizontal DOM elements:
- Yuanlong Zhu
- coordinates
- role line if retained
- About / Archive / Contact
- tagline
- copyright
- location
- interaction hint

Keep them understated and stable during 3D movement.

## 7. Category interaction model
Home object click should not hard-navigate immediately.
Instead:
1. focus selected object
2. make the two unselected objects recede
3. move camera slightly closer
4. reveal a restrained acrylic category menu beside the selected object

The menu must not cover the 3D object.

## 8. Category menus
Writing:
- Essays / Notes / Observations (or future verified categories)
- list real writing only

Architecture:
- Built Ideas / Academic Projects / Experimental Works
- show project thumbnails + titles

Research:
- Urban Studies / Environmental Systems / Speculative Futures, or categories derived from final content decisions
- show project title, descriptor, year, small real diagram/map thumbnail

These category labels are UI organization and may be edited later; project facts themselves must come from the source PDFs.

## 9. Project opening behavior
Selecting a project should morph the category panel into a wider project presentation rather than hard-switching.
Keep WebGL mounted.
Push an SPA route.
Bring in project hero, metadata, and then long-form DOM content.

## 10. Project-page content hierarchy
Recommended structure:
- top navigation
- project title + number
- subtitle / short original description
- metadata block (year, location, type, instructors, collaborators where applicable)
- hero media
- original narrative sequence from the portfolio
- diagrams / drawings / renderings
- next project

Do not convert all content into generic cards or masonry.
Preserve the editorial pacing of the portfolio PDFs.

Image layout options:
- hero ~70–82vw
- major diagram ~65–75vw
- paired images in 2 columns
- white-background drawings should usually keep their white field rather than being forced into gray cards

## 11. Source handling
Use the supplied portfolio PDFs as the source of truth.
Prefer the more complete project version when a project appears in both PDFs.
Do not fabricate missing metadata or rewrite project facts.
Build structured JSON from extracted text and rendered/extracted images.

## 12. Technology
Recommended stack:
- React
- Vite or Next.js
- Three.js
- React Three Fiber
- Drei
- GSAP
- React Router or Next Router

Keep one persistent Canvas across route/state transitions where practical.
Use `useGLTF`, environment helpers, contact shadows sparingly, preloading, and compressed assets.

## 13. Suggested project structure
```text
src/
  components/
    Navigation.tsx
    AcrylicPanel.tsx
    ProjectCard.tsx
    ProjectPage.tsx
  scene/
    HomeScene.tsx
    WritingObject.tsx
    ArchitectureObject.tsx
    ResearchObject.tsx
    WorldLabels.tsx
    CameraRig.tsx
    Lighting.tsx
  data/
    writing.json
    architecture.json
    research.json
    projects.json
  pages/
    Home.tsx
    Category.tsx
    Project.tsx

public/
  models/
    writing.glb
    architecture.glb
    research.glb
  textures/
  hdr/
  portfolio/
    static-travel/
    reproduce-tradition/
    the-fusion/
    famous-for-15-minutes/
    information-relays/
    resource-paradox/
    reimagine-everydayness/
```

## 14. Performance targets
Desktop target: 60 fps where hardware allows; older/integrated GPU should remain comfortably usable (~45 fps+ target).
Keep homepage geometry under ~150k triangles, ideally 60–100k.
Minimize transparent layers and overdraw.
Preload the initial scene to reduce first-interaction shader compilation hitching.

## 15. Mobile
Desktop is the primary designed experience.
Below ~768 px:
- simplify camera
- reduce or disable parallax
- consider shallow vertical staggering of the three objects
- optionally use a pre-rendered/static fallback on weak devices
- keep project pages fully responsive

Do not force the full desktop 3D workload onto mobile.

## 16. Accessibility
3D objects must map to real accessible links/buttons.
Support:
- Tab
- Enter
- Escape
- reduced motion

3D visuals must not be the only way to access category/project navigation.

## 17. Loading
Avoid a branded spinner.
Preferred stagger:
- 0–300 ms floor/background
- 200–650 ms objects
- 400–750 ms labels
- 500–900 ms navigation

If models are late, show a lightweight placeholder rather than a blank page.

## 18. Development sequence
1. Inspect the current website and capture a baseline screenshot.
2. Record camera, object transforms, lighting, typography, and routes.
3. Parse both portfolio PDFs into project data.
4. Finish the three homepage models in Blender.
5. Implement only the homepage materials/camera/light/labels first.
6. Add hover.
7. Add home→category camera motion.
8. Add acrylic category menu.
9. Connect project data.
10. Build one complete project detail page (Static Travel recommended) as the template.
11. Apply the template to remaining projects.
12. Add mobile behavior.
13. Run performance, accessibility, and visual-regression QA.

Do not build all project pages before the homepage and one project template have been approved.

## 19. Final quality test
The site passes if:
- a paused screenshot still works as a composition
- models look physically credible
- acrylic behaves like material, not CSS opacity
- lighting is quiet and controlled
- interaction reveals hierarchy rather than showing off effects
- once a project opens, 3D recedes and the work becomes the focus

The target experiential sequence is:
`simple at first glance → tactile on inspection → layered on interaction → content-first in depth`.
