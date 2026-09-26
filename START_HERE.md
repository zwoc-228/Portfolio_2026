# Round 44

Read `ROUND44_PORTFOLIO_MATERIALS_AND_MODELS.md` first. Prior round notes are historical.

- Run locally: `npm run dev`, then open http://localhost:4173
- Check: `npm run check`
- Deploy: contents of `dist/`, or the separate DEPLOY ZIP (root `index.html`).
- Palette: `dist/palette.js`
- UI material / layout: `dist/styles/ui-system.css`
- Model geometry: `dist/models.js`
- Editable studio: `scripts/studio-source.blend`
- Actual model/texture renders: `verification/`

The architecture geometry is unchanged. The book and loose paper have new geometry and all three models use a shared baked studio pipeline. The entry control is a hover-expandable rounded card; the sphere, name and coordinates are removed from the header.
