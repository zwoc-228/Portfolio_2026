# Fonts — source & license

## eb-garamond-400-latin.ttf
- Source: Google Fonts (https://fonts.google.com/specimen/EB+Garamond),
  TTF fetched from fonts.gstatic.com (390 KB).
- License: SIL Open Font License 1.1 (OFL) — free to use, bundle, and
  redistribute with the software. Designer: Georg Duffner.
- TTF (not woff2): Troika SDF text parses TTF natively; woff2 needs a
  runtime wasm decoder that fails in headless Chromium.
- Stored locally: no runtime font CDN for 3D labels. Used by Troika SDF
  text in `src/scene/WorldLabels.tsx` (matches the DOM serif + reference).
