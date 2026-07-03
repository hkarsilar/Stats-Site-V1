#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Inject the static 'Common questions' section + FAQPage JSON-LD into every
lesson page, from the content in tools/faq_data.py.

Run from the site/ root (idempotent — re-running replaces the injected blocks):
    python tools/inject-faqs.py
Then rebuild the search index so the new text is searchable:
    python tools/build-search-index.py

Every lesson slug in curriculum.js must have exactly 3 (question, answer)
pairs in faq_data.py; the script fails loudly on any mismatch.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from faq_data import FAQS

ROOT = Path(__file__).resolve().parent.parent

# curriculum: slug -> course
cur = (ROOT / "assets/js/curriculum.js").read_text(encoding="utf-8")
courses = {}
for block in re.finditer(r'slug: "(stats-\d)".*?sections: \[(.*?)\]\s*\}', cur, re.S):
    for m in re.finditer(r'slug: "([\w-]+)"', block.group(2)):
        courses[m.group(1)] = block.group(1)

missing = [s for s in courses if s not in FAQS]
extra = [s for s in FAQS if s not in courses]
if missing or extra:
    sys.exit(f"FAQ coverage mismatch — missing: {missing} extra: {extra}")
bad = [s for s, qas in FAQS.items() if len(qas) != 3]
if bad:
    sys.exit(f"lessons without exactly 3 Q&As: {bad}")


def strip_tags(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", html)).strip()


changed = 0
for slug, qas in FAQS.items():
    p = ROOT / courses[slug] / slug / "index.html"
    src = p.read_text(encoding="utf-8")

    items = []
    for q, a in qas:
        items.append(
            "          <details class=\"faq-item\">\n"
            f"            <summary>{q}</summary>\n"
            f"            <div class=\"faq-a\"><p>{a}</p></div>\n"
            "          </details>"
        )
    section = (
        "        <!-- faq:start — static Common Questions (mirrored as FAQPage JSON-LD in <head>) -->\n"
        "        <section class=\"faq\">\n"
        "          <h2>Common questions</h2>\n"
        + "\n".join(items) + "\n"
        "        </section>\n"
        "        <!-- faq:end -->\n"
    )

    ld = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": strip_tags(q),
             "acceptedAnswer": {"@type": "Answer", "text": strip_tags(a)}}
            for q, a in qas
        ],
    }
    ld_tag = ("  <script type=\"application/ld+json\" data-faq>\n  "
              + json.dumps(ld, ensure_ascii=False) + "\n  </script>\n")

    # remove any previous injection, then re-insert
    src = re.sub(r"[ \t]*<!-- faq:start.*?<!-- faq:end -->\n(?:[ \t]*\n)*", "", src, flags=re.S)
    src = re.sub(r"[ \t]*<script type=\"application/ld\+json\" data-faq>.*?</script>\n?", "", src, flags=re.S)

    nav_pat = re.compile(r"([ \t]*<nav class=\"lesson-nav\" id=\"lesson-nav\"></nav>)")
    if not nav_pat.search(src):
        print(f"{slug}: NO lesson-nav anchor found, skipped")
        continue
    src = nav_pat.sub(lambda m: section + "\n" + m.group(1), src, count=1)
    src = src.replace("</head>", ld_tag + "</head>", 1)
    # normalize whitespace runs before the injected section to one blank line
    src = re.sub(r"\n{3,}(?=[ \t]*<!-- faq:start)", "\n\n", src)

    p.write_text(src, encoding="utf-8", newline="")
    changed += 1

print(f"injected FAQ into {changed}/{len(FAQS)} lessons")
