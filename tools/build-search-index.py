#!/usr/bin/env python3
"""Regenerate assets/js/search-index.js — the full-text search index.

Run from the repo root after adding or editing lessons:
    python tools/build-search-index.py

The index holds the visible prose of every lesson (keyed by slug) plus the
visible text of the root tool pages and the glossary terms. site.js loads it
lazily the first time the search overlay opens, so normal page loads never
pay for it.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MAX_CHARS = 4500


def textify(fragment: str) -> str:
    """Strip tags/scripts and collapse whitespace to plain searchable text."""
    fragment = re.sub(r"<script\b.*?</script>", " ", fragment, flags=re.S | re.I)
    fragment = re.sub(r"<style\b.*?</style>", " ", fragment, flags=re.S | re.I)
    fragment = re.sub(r"<[^>]+>", " ", fragment)
    fragment = html.unescape(fragment)
    return re.sub(r"\s+", " ", fragment).strip()


def lesson_text(path: Path) -> str:
    src = path.read_text(encoding="utf-8")
    m = re.search(r"<article class=\"lesson\">(.*?)</article>", src, re.S)
    return textify(m.group(1))[:MAX_CHARS] if m else ""


def page_text(path: Path) -> str:
    src = path.read_text(encoding="utf-8")
    m = re.search(r"<main\b.*?>(.*?)</main>", src, re.S)
    return textify(m.group(1))[:MAX_CHARS] if m else ""


def glossary_text(path: Path) -> str:
    """Glossary terms live in a JS array — pull the term + definition strings."""
    src = path.read_text(encoding="utf-8")
    terms = re.findall(r'\{ t: "((?:[^"\\]|\\.)*)", d: "((?:[^"\\]|\\.)*)"', src)
    joined = " ".join(f"{t}: {d}" for t, d in terms)
    return textify(joined)[:MAX_CHARS * 2]


def course_slugs() -> list:
    """Every course slug from curriculum.js, in curriculum order. A course's
    own slug is the one followed by `title:` on the next line; section slugs
    sit inline with n:/title:, so they don't match."""
    cur = (ROOT / "assets/js/curriculum.js").read_text(encoding="utf-8")
    return re.findall(r'slug: "([\w-]+)",\s*\n\s*title:', cur)


lessons = {}
for slug in course_slugs():
    for f in sorted(ROOT.glob(f"{slug}/*/index.html")):
        lessons[f.parent.name] = lesson_text(f)

pages = []
for fname, title in [
    ("formulas.html", "Statistics Formula Sheet"),
    ("tables.html", "Statistical Tables & Calculators"),
    ("distributions.html", "Distribution Playground"),
    ("which-test.html", "Which Test Should I Use?"),
    ("effect-sizes.html", "Effect-Size Converter"),
    ("power.html", "Power & Sample-Size Calculator"),
    ("descriptives.html", "Descriptives Calculator"),
    ("apa.html", "APA Results Formatter"),
    ("toolbox.html", "Statistics Toolbox"),
]:
    p = ROOT / fname
    if p.exists():
        pages.append({"u": fname, "txt": page_text(p)})
gl = ROOT / "glossary.html"
if gl.exists():
    pages.append({"u": "glossary.html", "txt": glossary_text(gl)})

out = (
    "/* ============================================================\n"
    "   Full-text search index — GENERATED, do not edit by hand.\n"
    "   Rebuild with:  python tools/build-search-index.py\n"
    "   Loaded lazily by site.js when the search overlay first opens.\n"
    "   ============================================================ */\n"
    "window.SEARCH_INDEX = "
    + json.dumps({"lessons": lessons, "pages": pages}, ensure_ascii=False)
    + ";\n"
)
dest = ROOT / "assets" / "js" / "search-index.js"
dest.write_bytes(out.encode("utf-8"))   # write_bytes keeps LF exactly on every platform/Python
print(f"wrote {dest} ({dest.stat().st_size / 1024:.0f} KB, {len(lessons)} lessons, {len(pages)} pages)")
