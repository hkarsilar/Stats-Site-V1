# StatsCapybara

A free, interactive statistics course for people with no stats background,
built for visual learners. Every lesson pairs a written explanation with a
hands-on canvas visualization you can actually move. Live at
**[statscapybara.com](https://statscapybara.com/)**.

Nine courses across two tracks — **The Statistics Core** (Stats 1–4 plus
Machine Learning & AI) and **The Research Toolkit** (Methods, Data, Writing,
Ethics) — alongside a shelf of tools: calculators for power, effect sizes,
descriptives and correlation; exact z/t/χ²/F tables; "which test?" and "which
chart?" choosers; an APA results formatter; practice problems, datasets,
flashcards and a quiet quiz; printable one-page posters; and long-form guides
for thesis students. The current counts live in
[`assets/js/curriculum.js`](assets/js/curriculum.js) and on the homepage.

Free, no sign-up, no ads. Progress is stored in your own browser and nothing
is uploaded; see [privacy.html](privacy.html) for the full account.

## Architecture in two sentences

It is a plain static multi-page site: vanilla HTML, CSS and JS with **no build
step, no framework, no bundler, and no npm dependencies**, deployed as-is by
GitHub Pages from `main`. `assets/js/curriculum.js` is the single source of
truth for courses and lessons, and the homepage grid, every sidebar, the
search overlay, and the prev/next links are all generated from it.

```
index.html                  Homepage (hero demo + curriculum grid)
<course>/index.html         Course landing page (nine of them)
<course>/<topic>/index.html One folder per lesson → clean URL + refresh-proof
guides/<slug>/index.html    Long-form walkthroughs for thesis students
*.html                      Tool pages (calculators, choosers, posters, quiz…)
privacy.html                What is and isn't collected
assets/css/styles.css       The whole design system (light + dark)
assets/js/curriculum.js     Single source of truth — every course & section
assets/js/site.js           Shared chrome: nav, sidebar, search, progress, print
assets/js/viz.js            Shared math/canvas helpers (exact special functions)
assets/js/{checks,software,snippets,glossary-data}.js   Per-lesson content, keyed by slug
sw.js offline.html          Service worker — the site works offline once visited
tools/                      Build/QA scripts (see below)
CLAUDE.md VOICE.md ROADMAP.md PROMPTS.md    Dev guide, editorial rules, roadmap, session prompts
```

Dev docs and `.claude/` live in the repo so they sync across machines. Because
`.nojekyll` is set they are served verbatim by GitHub Pages, but they are
unlinked and excluded from `sitemap.xml`.

## Working on it

Only **Node** is needed to preview and check the site; the two content
generators are Python 3.

```bash
node tools/serve.js 8097     # local preview at http://localhost:8097/
node tools/audit.js          # site health check — required before every commit
node tools/math-check.js     # statistical regression gate — required if viz.js changes
node tools/prose-lint.js     # voice/prose budgets (editorial, not a build gate)
```

`tools/audit.js` cross-checks the whole site against `curriculum.js`: per-lesson
coverage, SEO tags, JSON-LD, internal links, search-index freshness, and more.
It exits non-zero on any error.

To **add or rename a lesson**, edit `assets/js/curriculum.js` (set
`ready: true` once the page exists), then follow the integration checklist in
[`CLAUDE.md`](CLAUDE.md) — per-page SEO, `sitemap.xml`, glossary, quiz bank,
checks, snippets, FAQs, and a rebuild of the search index.

## Deploying

Commit and push to `main`; GitHub Pages serves the repo root and the live site
updates in under a minute. `CNAME` sets the custom domain. If a deploy changes
a precached shell asset (`styles.css`, `site.js`, `curriculum.js`, `viz.js`,
the font, an icon, or `offline.html`), bump `CACHE_VERSION` in `sw.js`.

## Found a mistake?

Corrections are genuinely welcome, especially statistical ones. Open an issue,
or use the **Spotted a mistake? Tell me** link at the foot of any page on the
site, which fills in the page address for you.
