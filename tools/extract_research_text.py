"""Extract verbatim research text for the printed top-sheet texture.

Source: sources/Final_Portfolio-2(4).pdf (preferred per PROJECT_CONTENT_MAP).
Output: src/data/researchPrint.json — real strings only, hyphenated line
breaks rejoined, nothing invented.

Usage: python3 tools/extract_research_text.py
"""
import json
import os
import re

from pypdf import PdfReader

SRC = "sources/Final_Portfolio-2(4).pdf"
OUT = "src/data/researchPrint.json"


def clean(t):
    t = t.replace(" -\n", "").replace("-\n", "")
    t = re.sub(r"[ \t]*\n[ \t]*", " ", t)
    return re.sub(r" {2,}", " ", t).strip()


def main():
    pages = PdfReader(SRC).pages
    p1 = clean(pages[1].extract_text() or "")
    body = " ".join(clean((pages[i].extract_text() or "")) for i in (2, 3, 4))

    # Verbatim title block (truncate, never rewrite).
    title = "Information Relays"
    subtitle = "Telling stories about water"
    meta_bits = []
    for token in ("Summer 2023", "Individual Academic work"):
        if token in p1:
            meta_bits.append(token)
    meta = "  ·  ".join(meta_bits)

    # First sentences of the body, verbatim, capped for the sheet.
    sentences = re.split(r"(?<=[.]) ", body)
    lines = [s for s in sentences if len(s) > 40][:5]

    # Real map names from the maps page (p5-ish), verbatim fragments.
    p5 = clean((pages[5].extract_text() or ""))
    figs = [m for m in (
        "California Atmosphere Map",
        "California Water-Related Map",
        "California Dam Location Map",
    ) if m.replace("-", "") in p5.replace("-", "")]
    data = {
        "source": "Final_Portfolio-2(4).pdf pp.2-6, Information Relays",
        "title": title,
        "subtitle": subtitle,
        "meta": meta,
        "lines": lines,
        "figure": ("Fig. 01 — " + "  ·  ".join(figs)) if figs else "",
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"WROTE {OUT}: title={title!r} meta={meta!r} lines={len(lines)} figs={len(figs)}")
    for s in lines:
        print("  -", s[:100])


if __name__ == "__main__":
    main()
