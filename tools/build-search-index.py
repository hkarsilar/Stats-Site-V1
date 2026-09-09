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
# RAISED 4,500 -> 20,000 (Aug 2026), because this is the same defect a third
# time. Run 13 found it on lessons and run 24 on guides; the root and tool
# pages were the class nobody re-measured, and four of them were being cut:
# teachers.html indexed 36% of itself (the fourteen-week semester map, the
# embed + preset section and "free forever" all fell past the cut, so an
# instructor searching "fourteen-week" or "embed" reached nothing),
# datasets.html 40%, privacy.html 68% (losing the Ko-fi paragraph, one of the
# two external services the page exists to disclose) and formulas.html 94%.
# Found the way runs 13 and 24 were found: by searching the rebuilt index for
# text the page plainly contains. 20,000 matches LESSON_MAX_CHARS, indexes
# every root page whole (longest is teachers.html at 12.2k) and costs ~16.5 KB,
# about 1.6%, on an index that is lazy-loaded only when the overlay opens.
# The two PAGE_MAX_CHARS overrides below stay: those pages are far larger
# still. Per run 20's lesson, this is a runaway guard, not a budget.
MAX_CHARS = 20_000

# Per-page overrides of MAX_CHARS, for the pages whose entire body IS the
# payload rather than prose you skim. problems.html (P63): someone searching
# "Mann-Whitney worked example" needs to reach problem 18, and the default cap
# indexes only the first ~10% of it. glossary.html: same reasoning — reaching
# one specific term is the whole point of a glossary, and the old MAX_CHARS * 2
# cap stopped at term 69 of 252 (source order), so most of the deck was
# silently unsearchable. Both are cheap on an index that is lazy-loaded only
# when the search overlay opens.
#
# problems.html went from 120,000 to 300,000 in P86, because the 120,000 was
# no longer headroom: the page had reached 133,255 characters and was ALREADY
# losing 10% of itself before P86 touched it (P79 and P82 added six problems),
# and P86's eight more took it to 157,018 and a 24% loss. Everything past the
# middle of the Advanced set, the whole Research Toolkit set included, was
# unfindable by the site's own search. Found the way runs 13, 20 and 24 were
# found: by searching the rebuilt index for text the page plainly contains.
# 300,000 indexes it whole with room for roughly another page's worth, and
# costs ~37 KB, about 3%, on a 1,120 KB index. Per run 20's lesson this is a
# runaway guard, not a budget, and a guard that a growing page keeps catching
# up with was set too tight. glossary.html was re-measured in the same pass
# and sits at 66,910, comfortably inside its own cap, so it is left alone.
#
# teachers.html joined them in P87, the same defect on a much smaller page and
# found the same way. The block map and the ?present=1 section took it from
# 18,255 characters to 23,035, so it crossed the 20,000 default and lost 13%
# of itself: everything from the block map's own table onward, including the
# week rows a lecturer would search for. A page that is one section away from
# its guard has the wrong guard, so this is 60,000 rather than 25,000 — real
# slack, on the P86 reading that a runaway guard is not a budget. It costs
# about 3 KB on a lazily loaded index.
PAGE_MAX_CHARS = {"problems.html": 300_000, "glossary.html": 120_000, "teachers.html": 60_000}

# Lessons get their own, much larger cap (P39 run 13). The 4,500-char default
# was truncating 87 of the 97 lessons, dropping 27% of the site's lesson prose
# — and because a lesson's "Common questions" block sits at the END of the
# article, the cut fell almost exactly on the FAQ answers, which are baked into
# the HTML precisely so they can be found. The site's own search could not find
# a single one of them. Same reasoning as the two overrides above, same cost
# shape: the index is lazy-loaded only when the search overlay opens, and the
# per-keystroke scan is a single regex pass whose cost is linear and measured
# in low milliseconds.
#
# RAISED 12,000 -> 20,000 in P39 run 20, because the same defect came back.
# Run 13 set 12,000 to clear the longest lesson of the day (10.4k) "with
# headroom", but every refresh run since has added 300-600 words to five
# lessons, and run 20's two subjects went past it: psychometric-functions
# reached 16.3k and signal-detection-theory 14.5k, so both were cut and both
# lost exactly the block the cap exists to protect. A cap that is a moving
# target needs real slack, not a little. 20,000 indexes every lesson whole
# (longest 16.3k) and costs 6,819 characters, 0.8%, over the 12,000 total.
# The cap stays as a runaway guard, not as a budget. If a future run adds a
# term and the index cannot find it, CHECK THIS FIRST.
#
# Raised 20,000 -> 30,000 in P90, before anything was cut rather than after.
# P90 took stats-2/post-hoc-tests to 18,804 characters, which made it the
# longest lesson on the site and left 6% of headroom, and Phase 18 has five
# more prompts still to add sections to Stats 2 lessons. That is exactly the
# shape runs 13, 20 and 24 each caught only once the cut had already landed on
# the FAQ block at the end of the article. Nothing is over 20,000 today, so
# the raise costs zero bytes now and simply stops the guard from becoming a
# budget. Matches GUIDE_MAX_CHARS.
LESSON_MAX_CHARS = 30_000

# Guides get the same treatment, and for the same reason (P39 run 24). The
# five long-form guides run 9.8k-17.5k characters and were being indexed with
# the 4,500 default, so between 54% and 74% of each one was unsearchable:
# complete-worked-project lost 74% of itself, and clean-survey-data's whole
# reliability section (found in run 24 by searching the rebuilt index for the
# terms that run had just written) fell past the cut. This is the same defect
# run 13 fixed for lessons, left standing on the pages built to answer
# high-intent thesis queries. 30,000 clears the longest guide with real slack,
# per run 20's lesson that a cap chasing a growing corpus needs it.
GUIDE_MAX_CHARS = 30_000


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


def ready_sections() -> dict:
    """{course slug -> [ready section slugs]}, straight from curriculum.js.

    This MUST drive the walk rather than a glob over each course folder.
    A course directory also holds redirect stubs left behind by the
    four-courses-to-three restructure, and since lessons are keyed by slug
    alone, a stub read after the real page silently overwrote its text with
    nothing: 11 lessons indexed to zero characters and were unfindable by
    the site's own search. Enumerating from the source of truth makes a
    stub structurally invisible here."""
    cur = (ROOT / "assets/js/curriculum.js").read_text(encoding="utf-8")
    out = {}
    for block in re.finditer(
            r'slug: "([\w-]+)",\s*\n\s*title:.*?sections: \[(.*?)\]\s*\}', cur, re.S):
        course, body = block.group(1), block.group(2)
        secs = []
        for m in re.finditer(r'\{[^{}]*?slug: "([\w-]+)"[^{}]*?\}', body):
            if re.search(r'ready:\s*true', m.group(0)):
                secs.append(m.group(1))
        out[course] = secs
    return out


lessons = {}
READY = ready_sections()
for slug in course_slugs():
    for sec in READY.get(slug, []):
        f = ROOT / slug / sec / "index.html"
        if f.exists():
            lessons[sec] = lesson_text(f)

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
    ("license.html", "License & Reuse"),
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
# the guides hub (guides/index.html) — the front door of the guides folder.
# A publishing folder with no index.html is a 404 every crawler finds by
# walking the path up, which is how /guides/ landed in Search Console.
hub = ROOT / "guides" / "index.html"
if hub.exists():
    pages.append({"u": "guides/", "txt": page_text(hub)})
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
        pages.append({"u": f"guides/{slug}/", "txt": page_text(p, GUIDE_MAX_CHARS)})
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
