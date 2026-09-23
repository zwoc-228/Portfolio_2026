# Round 41

Start with `ROUND41_STUDIO_FINISH.md`. The current version uses real Cycles baked architectural lighting, individual geometry-derived AO, a scene-space clay sphere, and same-frame motion/reflection/shadows.

- Run: `npm run dev` (Node.js 18+), then open http://localhost:4173
- Verify: `npm run check`
- Deploy: contents of `dist/`, or use the separate DEPLOY ZIP whose root contains `index.html`.
- Model evidence: `verification/architecture-web-material.png` (actual baked model, not a website screenshot).
- Edit lights / rebuild: `scripts/architecture-studio-source.blend` and the bake scripts.

Earlier round documents are retained as history and do not override round41. Do not restore transmission proxy switching or staggered shadow/reflection updates.
