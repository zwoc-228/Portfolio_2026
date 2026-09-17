# Yuanlong Zhu Portfolio — AI Website Handoff Package

This package is the implementation handoff for the 3D portfolio website.

## Goal
Build a restrained, high-fidelity 3D portfolio website with a locked three-object homepage:

- Writing
- Architecture
- Research

The homepage composition must remain structurally unchanged. The work is to improve material fidelity, camera, lighting, interaction, category menus, project transitions, and content extraction — not to redesign the homepage.

## Files
- `MASTER_SPEC.md` — complete design + interaction + implementation specification.
- `AI_HANDOFF_PROMPT.md` — copy-paste prompt for a coding/web agent.
- `PROJECT_CONTENT_MAP.md` — source PDFs and project/page mapping.
- `ANIMATION_TIMELINE.md` — exact motion sequencing and timing.
- `ASSET_PIPELINE.md` — model/material/PDF asset workflow.
- `LOCKED_RULES.md` — non-negotiable constraints and QA checklist.
- `reference/ui-baseline.png` — current visual baseline reference.
- `sources/` — original portfolio PDFs in the full package.

## Recommended workflow
Read `LOCKED_RULES.md` first, then `MASTER_SPEC.md`, then `ASSET_PIPELINE.md` and `ANIMATION_TIMELINE.md`. Use `PROJECT_CONTENT_MAP.md` when ingesting portfolio content.

Do not expand the scope of a requested change. If the request is “only change typography”, change only typography.
