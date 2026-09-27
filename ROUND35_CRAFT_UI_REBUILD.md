# Round 35 — Craft-inspired UI rebuild

Base: Round 34.

## Why Round 34 felt crowded
The active stylesheet chain had accumulated several generations of overrides (`views.css`, `professional-ui.css`, Round 33 overrides inside `professional-ui.css`, and `round34-calm-ceramic.css`). Many of the same selectors (`.category-panel`, `#category-title`, `#filters`, header typography) were defined multiple times. In addition, `.category-actions` was absolutely positioned at the bottom of the card while the statement and filters flowed normally, which made crowding possible as soon as copy or viewport size changed.

## Craft references
- Craft current UI / documentation: calm light surfaces, full/flush sidebars, content-first layout, generous spacing, subtle selected rows.
- Craft 3.6.5 describes sidebars being placed directly on the window surface, made more spacious/refined, and Liquid Glass being used in polished UI details rather than making every content surface heavy glass.
- Primary Studio's Craft identity case study describes the refreshed identity as tactile, airy, and clear.
- Craft founder Balint Orosz has described Craft as design-first software with custom layout/animation systems and a strong focus on fluency.

## Architectural cleanup
- `dist/style.css` now imports only:
  - tokens
  - base
  - views
  - responsive
  - liquid-header
  - new `craft-inspired-ui.css`
- `professional-ui.css` and `round34-calm-ceramic.css` remain in the repository for history but are no longer active.
- `liquid-header.css` was rewritten cleanly instead of stacking Round 32/33 overrides.

## Typography
- Product UI is now sans-first.
- Serif is reserved for the brand and section/project titles.
- Architecture / Writing / Research panel title reduced to 29–34 px.
- Body copy is 12.5 px / 1.48 line height.
- Filter labels are 13 px with 36 px rows.
- Header brand is 22 px; main navigation is 12–12.5 px.

## Layout / anti-crowding fix
- Secondary panel is a flex column.
- Actions are no longer absolutely positioned.
- Actions use `margin-top:auto`, so they stay at the bottom without overlapping statements or filters.
- Sidebar and project grid share one top datum and one gutter system.

## Material
- Secondary panel is a pale satin PVC / ceramic-coated surface rather than heavy frosted glass.
- Backdrop blur is only 4 px.
- Cursor-driven highlight remains, but is restrained.
- Project cards use the same pale tactile card family.
- Glass remains where it matters: the interactive top header/orb.

## Content copy
Statements were shortened so the panel reads more like Craft: concise, useful hierarchy rather than text filling every gap.
