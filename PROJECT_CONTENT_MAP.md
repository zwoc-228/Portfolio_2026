# Project Content Map

## Source A — `2024_4(2).pdf`
Use for:
- Static Travel — pp. 3–8
- Reproduce Tradition — pp. 9–15
- The Fusion — pp. 16–22
- Famous for 15 minutes — pp. 23–27
- Information Relays — pp. 28–30
- Breaking the Resource Paradox — pp. 31–33
- Professional / Academic works — p. 34

## Source B — `Final_Portfolio-2(4).pdf`
Prefer this source for the more complete versions of:
- Information Relays — pp. 2–10
- Breaking the Resource Paradox — pp. 11–20
- Reimagine Everydayness — pp. 21–29
- Other works — p. 30

## Suggested website grouping
This grouping is an information-architecture proposal, not an original PDF classification.

### Architecture
- Static Travel
- Reproduce Tradition
- The Fusion
- Reimagine Everydayness

### Research
- Information Relays
- Breaking the Resource Paradox
- Famous for 15 minutes

### Writing
Do not invent articles. Build the UI/data structure and populate only with real writing supplied later.

## Required data schema per project
```json
{
  "slug": "",
  "title": "",
  "subtitle": "",
  "year": "",
  "location": "",
  "type": "",
  "instructors": [],
  "collaborators": [],
  "summary": "",
  "pages": [],
  "hero": "",
  "gallery": [],
  "category": ""
}
```

## Ingestion rules
- Read the PDF text layer first; do not OCR unless the text layer is unavailable.
- Preserve original titles, dates, locations, instructors, collaborators, and project order.
- Do not fabricate missing data.
- Extract embedded images where possible; otherwise render the relevant PDF pages at high resolution.
- Reuse the original project narrative sequence instead of flattening everything into a generic gallery.
