## Round62 — quieter interface

One Arial font family, upright text. Index: cover, title, year only. No decorative rules, sequence numbers, category statements, footer slogans, or repeated plate captions. Project credits remain in an expandable details element. Original artwork typography, complete galleries, model geometry and mobile vertical arrangement are preserved.

# Portfolio 2026 · Round61 / Information, objects, narratives

A full visual and content rebuild from the supplied 30-page Final_Portfolio.pdf. Both supplied PDFs have the same SHA-256; one was used as the source.

## Run
Node 18+, no npm install required. npm run dev rebuilds and serves dist. npm run check runs geometry/UV, frame scheduling, mobile projection and portfolio content checks, then builds and audits dist. npm run build creates static dist.
CODE is editable canonical source; DEPLOY extracts directly to index.html. Do not edit generated dist.

## Visual source
Pages 2, 7, 11, 21, 28: cyan resin plinths, neutral white models, blue/ochre relay wires, numbered drawings, Georgia italic captions and image/text spreads.
The CSS system and content templates were rebuilt, not appended to old card styles. Index, project opening spread, original-image plates, navigation and fallback share the same typographic/material system.
The homepage keeps three live 3D objects. Mobile widths up to 760px keep Writing / Architecture / Research vertically arranged. Relay wires physically connect the model field, borrowing the motif from p.7. Original portfolio maps are printed on the upper research sheet; book cover is cyan linen; architecture uses distinct native PBR materials rather than a single old baked color atlas.

## Real content
Three projects: Information Relays; Breaking the Resource Paradox; Reimagine Everydayness. Dates, locations, instructors and collaboration credits are grounded in the PDF.
Writing contains explicitly labeled portfolio text excerpts, not invented standalone publications. Research links the research aspects of the same documented projects. Project summaries are concise adaptations of the supplied text.
27 high-resolution source crops/pages were exported; the build includes only referenced assets. WebP files replace all former 65–97px placeholder thumbnails. Captions retain original PDF page numbers. No generated replacement artwork was used.

## Validation and limits
npm run check passed, including mobile projected bounds, ordering and label gaps across 7 viewport sizes, original mesh UV compatibility, source content and nonempty image checks, canonical source-to-dist hashes and one animation driver.
Desktop browser inspected actual portfolio index, full detail and original-image plate sequence. This cloud browser disables WebGL. The live 3D material changes, connecting wires, physical lighting and real-device FPS are not visually accepted. Fallback explicitly displays original portfolio images and is not a WebGL screenshot.
No unsupported current contact details or additional personal publications were invented.
