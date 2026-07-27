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

# Per-page overrides of MAX_CHARS, for the pages whose entire body IS the
# payload rather than prose you skim. problems.html (P63): someone searching
# "Mann-Whitney worked example" needs to reach problem 18, and the default cap
# indexes only the first ~10% of it. glossary.html: same reasoning — reaching
# one specific term is the whole point of a glossary, and the old MAX_CHARS * 2
# cap stopped at term 69 of 252 (source order), so most of the deck was
# silently unsearchable. Both are cheap: full indexing costs ~40 KB and ~7 KB
# on an index that is lazy-loaded only when the search overlay opens. The
# headroom also covers P64's Stats 3-4 problem sets and future glossary growth.
PAGE_MAX_CHARS = {"problems.html": 120_000, "glossary.html": 120_000}

# Lessons get their own, much larger cap (P39 run 13). The 4,500-char default
# was truncating 87 of the 97 lessons, dropping 27% of the site's lesson prose
# — and because a lesson's "Common questions" block sits at the END of the
# article, the cut fell almost exactly on the FAQ answers, which are baked into
# the HTML precisely so they can be found. The site's own search could not find
# a single one of them. Same reasoning as the two overrides above, same cost
# shape: the index is lazy-loaded only when the search overlay opens, and the
# per-keystroke scan is a single regex pass whose cost is linear and measured
# in low milliseconds. 12,000 clears the longest lesson (10.4k) with headroom.
LESSON_MAX_CHARS = 12_000


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
    return textify(m.group(1))[:LESSON_MAX_CHARS] if m else ""


def page_text(path: Path, limit: int = MAX_CHARS) -> str:
    src = path.read_text(encoding="utf-8")
    m = re.search(r"<main\b.*?>(.*?)</main>", src, re.S)
    return textify(m.group(1))[:limit] if m else ""


def glossary_text(path: Path, limit: int = MAX_CHARS) -> str:
    """Glossary terms live in a JS array (assets/js/glossary-data.js,
    window.GLOSSARY) — pull the term + definition strings.

    These are plain-text JS strings, NOT HTML, so they deliberately do NOT go
    through textify(): definitions legitimately contain "p < .05" and "p > .05",
    and textify's <[^>]+> tag-strip treats everything from a "<" to the next ">"
    as one tag. On a deck holding 5 "<", 1 ">" and zero real tags that was a
    single 36 k-char match that silently ate 69% of the glossary. Collapsing
    whitespace is all the normalising plain text needs; html.unescape is a
    no-op on today's data and a safety net if a definition ever uses an
    entity."""
    src = path.read_text(encoding="utf-8")
    terms = re.findall(r'\{ t: "((?:[^"\\]|\\.)*)", d: "((?:[^"\\]|\\.)*)"', src)
    joined = " ".join(f"{t}: {d}" for t, d in terms)
    return re.sub(r"\s+", " ", html.unescape(joined)).strip()[:limit]


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
    ("cheat-test-chooser.html", "Which Test? One-Page Cheat Sheet"),
    ("cheat-apa.html", "APA Statistics Reporting Cheat Sheet"),
    ("cheat-assumptions.html", "Assumption Checks Cheat Sheet"),
    ("tables.html", "Statistical Tables & Calculators"),
    ("distributions.html", "Distribution Playground"),
    ("which-test.html", "Which Test Should I Use?"),
    ("which-chart.html", "Which Chart Should I Use?"),
    ("plan.html", "Plan My Analysis"),
    ("effect-sizes.html", "Effect-Size Converter"),
    ("power.html", "Power & Sample-Size Calculator"),
    ("descriptives.html", "Descriptives Calculator"),
    ("correlation.html", "Correlation & Regression Calculator"),
    ("apa.html", "APA Results Formatter"),
    ("problems.html", "Practice Problems"),
    ("datasets.html", "Practice Datasets"),
    ("flashcards.html", "Glossary Flashcards"),
    ("quiz.html", "Course Quiz"),
    ("progress.html", "My Progress"),
    ("toolbox.html", "Statistics Toolbox"),
    ("teachers.html", "For Instructors"),
    ("privacy.html", "Privacy"),
]:
    p = ROOT / fname
    if p.exists():
        pages.append({"u": fname, "txt": page_text(p, PAGE_MAX_CHARS.get(fname, MAX_CHARS))})
# course landing pages (<course>/index.html, P61) — indexed under their clean URL
# so a search for "Stats 2" or "Writing course" finds the front door
for slug in course_slugs():
    p = ROOT / slug / "index.html"
    if p.exists():
        pages.append({"u": f"{slug}/", "txt": page_text(p)})
# long-form guides (guides/<slug>/index.html) — indexed under their clean URL
for slug in [
    "analyze-thesis-data-jasp",
    "spss-output-to-apa",
    "choose-statistics-dissertation",
    "clean-survey-data",
    "complete-worked-project",
]:
    p = ROOT / "guides" / slug / "index.html"
    if p.exists():
        pages.append({"u": f"guides/{slug}/", "txt": page_text(p)})
# glossary terms now live in assets/js/glossary-data.js; index them under glossary.html
gl = ROOT / "assets/js/glossary-data.js"
if gl.exists():
    pages.append({"u": "glossary.html", "txt": glossary_text(gl, PAGE_MAX_CHARS.get("glossary.html", MAX_CHARS))})

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
