# StatsCapybara

A free, interactive statistics course for people with no stats background —
built for visual learners. 43 lessons across 4 courses, each pairing a written
explanation with a hands-on canvas visualization. Plain static HTML/CSS/JS,
no build step, hosted on GitHub Pages at **[statscapybara.com](https://statscapybara.com/)**.

## How it's structured

```
index.html                  Homepage (hero demo + curriculum grid)
quiz.html                   Per-course quizzes with instant feedback
which-test.html             "Which test should I use?" interactive decision tree
tables.html                 Exact z/t/χ²/F p-value & critical-value calculators
formulas.html               Printable formula sheet for all four courses
distributions.html          Interactive distribution playground (9 distributions)
glossary.html               Searchable glossary, terms linked to lessons
404.html                    Shown for any unknown URL (self-contained)
assets/css/styles.css       The whole design system (light + dark)
assets/js/curriculum.js     Single source of truth — every course & section
assets/js/site.js           Shared chrome: nav, sidebar, search, progress, prev/next
assets/js/viz.js            Shared math/canvas helpers (exact special functions)
assets/js/snippets.js       "Try it in R / Python" snippets, keyed by lesson slug
assets/js/checks.js         "Check your understanding" questions, keyed by lesson slug
stats-1/<topic>/index.html  One folder per lesson → clean URL + refresh-proof
```

To **add or rename a lesson**, edit `assets/js/curriculum.js` (set `ready: true`
once the page exists). The homepage grid, every sidebar, the search overlay,
and the prev/next links all read from that one file. Then update the per-page
SEO tags (including the JSON-LD block), `sitemap.xml`, the glossary, the quiz
bank, `snippets.js`, and `checks.js`.

## Preview locally

All paths are **relative**, so the site works from any base — but lessons live
in subfolders, so use a tiny local server rather than double-clicking files:

```
python -m http.server 8099
```

Then visit http://localhost:8099/ (run it from inside this folder).

## Publish / update (GitHub Desktop)

Make changes → **Commit** → **Push**. GitHub Pages serves the `main` branch
from the repo root and the live site updates in under a minute. The custom
domain is set by the `CNAME` file (statscapybara.com) plus DNS `A`/`CNAME`
records pointing at GitHub Pages, with **Enforce HTTPS** on.
