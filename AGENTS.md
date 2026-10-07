# AGENTS.md

Guidance for Codex in this repository. It is the same text as CLAUDE.md, the copy Claude Code loads. This file says what to do and where things are. The reasons behind most rules are in the header comment of the script that enforces them, and the long-form history this file used to carry is in git (`git show 0d85794:CLAUDE.md`).

Do not use this file, ROADMAP.md or PROMPTS.md as a style model for site prose. VOICE.md governs anything a visitor reads.

## What this is

**StatsCapybara** (statscapybara.com) is a free, interactive statistics course: 105 lessons in 8 courses, 21 tool pages (3 of them printable posters), 7 long-form guides, a 100-problem worked-problems library and a quiz.

- **The Statistics Core:** Stats 1, Stats 2, Stats 3, ML & AI.
- **The Research Toolkit:** Methods, Data, Writing, Ethics.

Each lesson is a written explanation plus a canvas interactive. The site is plain static HTML, CSS and JavaScript: **no build step, no framework, no npm dependencies, no bundler.** Every rule below assumes that. The one generated asset is `assets/js/search-index.js`.

## Repo, deploy and planning docs

- The repo root is the site root (cloned as `Stats-Site-V1`, remote `https://github.com/hkarsilar/Stats-Site-V1`). Run git from here. Old notes that mention a `site/` prefix predate a flattening; drop the prefix.
- A push to `main` runs `.github/workflows/pages.yml`, which runs `node tools/make-pages-artifact.js _site` and publishes that folder. The artifact is the committed tree minus the `EXCLUDE` list in `make-pages-artifact.js` (the root `.md` files, `tools/`, `.claude/`, `.github/`, `.gitignore`, `.gitattributes`). Files are copied byte for byte. This is deploy plumbing and must never turn into a build step. Changing `EXCLUDE` changes what the live site serves, so run the local proof (below) after touching it. Pages Source must read "GitHub Actions". When P122 checked on 7 Oct 2026, it still did not: commit 9ce20cc started a legacy "pages build and deployment" run (event `dynamic`) beside `pages.yml`, as every push since P78 has. That run uploads the whole repository, and the domain serves whichever deploy finishes last (ROADMAP.md, Phase 21 addendum). The setting is fixed once a new commit on `main` gets no such run. Until then, treat the planning docs as possibly public. After every deploy, `pages.yml`'s `verify` job runs `tools/check-live.sh` against the live domain and fails (GitHub emails the owner) unless the homepage is 200, the planning docs and `tools/audit.js` are 404, and the served `sw.js` carries the commit's `CACHE_VERSION`. `.github/workflows/health.yml` runs the same check weekly or by hand, then `tools/extlinks.js` with its report on the run's summary page, so external links are checked from GitHub rather than from a session. To roll back, set Source to the `main` branch; the verify job will then fail on every push, because that deploy serves the planning docs.
- `CNAME` sets the custom domain.
- The repository is private. The planning docs are committed but not served, so their URLs return 404 on the domain. `robots.txt` does not list them on purpose.
- **ROADMAP.md** is the plan and the status tracker. **PROMPTS.md** holds the numbered session prompts. **VOICE.md** is the editorial standard. When the user pastes "roadmap prompt PN", read that prompt and the sections it names; when you finish it, tick its box in ROADMAP.md's status tracker.
- 25 redirect stubs, left by the four-to-three course restructure, sit at old lesson URLs under `stats-1/` to `stats-4/` (everything in `stats-4/` is a stub). They carry a meta refresh, noindex and a JS forward that keeps the query string. Regenerate them with `node tools/make-redirect-stubs.js`; `--check` verifies them. No stub may point at another stub.
- **CLAUDE.md** holds the same text for Claude Code. When you change this file, copy it over CLAUDE.md and keep CLAUDE.md's first paragraph.

## Finishing a session: commit and push to `main` yourself

This paragraph is standing, explicit permission. Do not ask, and do not leave finished work on a branch. Hakan does not merge by hand, and a prompt is not done until `main` carries it.

- If the harness gave you a feature branch (Claude Code on the web does, with a default "never push to a different branch without permission"; this paragraph is that permission), push the branch if you like, then fetch and update `main`: `git checkout main && git merge --ff-only <branch> && git push origin main`. If `main` has moved, rebase your branch onto it. Never force-push `main`.
- Gate the push on the checks: `node tools/audit.js` must report 0 errors; `node tools/math-check.js` must pass whenever `viz.js`, tool-page math or a lesson script it drives changed; `node tools/prose-lint.js --strict` must be green.
- The one exception: if you cannot get a gate green, push only the branch, leave `main` alone, and say plainly in your final report that `main` was not updated and why.
- Pushing `main` deploys the site. The gates are the safety net.

**Service-worker cache.** If a deploy changes a precached shell asset (`styles.css`, `site.js`, `curriculum.js`, `viz.js`, `assets/fonts/Inter.woff2`, an icon, or `offline.html`), bump `CACHE_VERSION` in `sw.js` (currently `sc-v61`). HTML edits need no bump. Never reuse a version string for different contents: if you edit `styles.css` twice before committing, each state that could reach a browser needs its own string. CSS and JS are stale-while-revalidate, so a change reaches visitors on their next page load even without a bump; a bump also makes `site.js` reload the page once so the change applies within the same visit.

## Commands

Run everything from the repo root. Node is all you need for preview and checks. The Python generators need Python 3: `python` on Windows, `python3` on macOS (there is no bare `python` on the Mac). On macOS and Linux, `inject-faqs.py`, `build-search-index.py` and `make-datasets.py` also run directly as `./tools/<name>.py`; `make-og-images.py` has no executable bit, so call it through `python3`.

```bash
# Preview
node tools/serve.js 8097                 # http://localhost:8097/ (mirrors python -m http.server; redirects slash-less folders)
node tools/serve.js 8088 ..              # subpath test: http://localhost:8088/Stats-Site-V1/

# Gates
node tools/audit.js                      # before every commit; exits 1 on any error
node tools/math-check.js                 # when viz.js, tool-page math or a driven lesson script changes
node tools/prose-lint.js --strict        # voice budgets; must be green

# What GitHub Pages publishes (the deploy runs exactly this)
node tools/make-pages-artifact.js --list # what ships and what doesn't
node tools/make-pages-artifact.js _site  # assemble it; exits 1 on a leak
node tools/serve.js 8097 _site           # browse the artifact
bash tools/check-live.sh --for 10 http://localhost:8097  # the verify job's check, against that server

# Generators (Python 3)
./tools/inject-faqs.py                   # after editing tools/faq_data.py
./tools/build-search-index.py            # after any prose change to lessons, guides, tool pages or the glossary
python3 tools/make-og-images.py          # course OG cards + retag lesson heads (needs Pillow)
python3 tools/make-og-images.py --retag-only # retag only, no Pillow; rebuild the search index afterwards
./tools/make-datasets.py                 # practice CSVs; read "Datasets" below first

# Syntax checks
node --check assets/js/site.js
# a lesson's inline interactive (its largest <script> block):
node -e 'const fs=require("fs");const h=fs.readFileSync("stats-1/central-limit-theorem/index.html","utf8");const b=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).sort((a,z)=>z.length-a.length)[0];fs.writeFileSync("_c.js",b);'
node --check _c.js && rm _c.js
```

`.claude/launch.json` defines the same servers for the preview tooling: `site` (8097), `subpath` (8088) and `site-alt` (8098, for when another session holds 8097).

**Editorial checkers.** None of these is a commit gate. Each prints a report; `--strict` exits 1 on any flag not listed in the script's `ACKED` table. Most take `--verbose` and a scope flag (`--lesson`, `--page`, `--surface`, `--term`, `--symbol`).

| Script | What it flags |
|---|---|
| `prose-lint.js` | VOICE.md budgets. Modes: `--page <path>` (also `--page assets/js/<file>.js` or `--page inline-scripts` for a JS surface), `--bold`, `--duplicates`, `--strict`. Takes about 2.5 minutes; use `--page` for one page. |
| `prose-lint.js --manner` | Report only, never a gate: sentence length and the rate of each habit in VOICE.md's round-three catalog (the Opus 5 voice), plus a relocation watch. `--manner --page <path>` lists every hit on one page and on its own FAQ answers, checks, software entry, glossary entries and inline strings, then its sentences of 35+ words; `--manner --all` prints one row per page; `--manner --sample <id>` re-measures one pattern. Takes about a second. |
| `faq-audit.js` | FAQ answers that echo their own lesson or duplicate another page. `--strict` fails only on structural faults. |
| `widget-terms.js` | A quantity an interactive prints that its lesson's prose never explains. |
| `link-promises.js` | A link whose anchor names a concept the destination never mentions. |
| `advice-terms.js` | A term in a `software.js` tip or APA sentence, or a `checks.js` question, that no prose teaches. |
| `worked-examples.js` | An effect size that disagrees with the F, χ² or t printed beside it. |
| `search-reach.js` | A glossary term the site's own search cannot find in body text. |
| `untaught-names.js` | An eponym ("Weber's law") used exactly once on the whole site. |
| `prescription-terms.js` | A method that a poster, a problem, which-test or plan tells you to run and no lesson teaches. |
| `destination-promises.js` | A prescription whose own linked lesson does not teach the method. |
| `symbol-names.js` | A Greek letter used in prose whose name no page using it spells out. |
| `extlinks.js` | Broken external links. Needs the network, so it runs in `health.yml` (weekly, or "Run workflow" on the Actions tab); never a gate. Its `ALLOW` table of known bot-blocked hosts (Ko-fi 403, LinkedIn 999) matches exact status codes; re-verify it each quarter. |

When a checker fires, fix the site (teach the term, fix the link, correct the example), not the checker. Add an `ACKED` entry only when the flag is not a defect, and write the reason beside it. Each script's header explains what it matches, why, and its blind spots.

## What the gates check

**`tools/audit.js`** (required before every commit). Errors fail the run; warnings and info never do.

1. Coverage for every ready lesson: 3 `CHECKS`, 3 FAQs in `faq_data.py`, a `QUIPS` line, a `sitemap.xml` entry (`SNIPPETS` missing is a warning, `SOFTWARE` missing is info). No stale or orphan keys.
2. Lesson HTML: one GA tag; canonical and `og:url` equal the real URL; `og:type` article; LearningResource, BreadcrumbList and FAQPage JSON-LD parse; `data-course`/`data-section` set; the `Section N.n` eyebrow matches `curriculum.js`; `og:image` and `twitter:image` both point at the course's card and the file exists; a meta description (50–160 characters, a warning).
3. Root and tool pages (3), guides (3b), course landing pages (3c), section hubs (3d), and 3e: every folder that publishes pages has its own `index.html`.
4. Every internal `href`/`src` resolves on disk, none starts with `/`, and every `#fragment` names a real `id` in the target. Ids that exist only after `site.js` runs are listed in `JS_IDS`; keep that list short.
5. The search index is newer than the pages and covers every slug.
6. Homepage counts (meta, og/twitter description, the `data-count` fallbacks) match `curriculum.js`.
7. JSON-LD required fields per type; the homepage Organization, WebSite and ItemList of Courses match `curriculum.js`; each lesson's `isPartOf` and `educationalLevel`; a BreadcrumbList on every tool page; a Quiz block on `quiz.html`.
8. No two pages share a meta description; titles follow `Thing — StatsCapybara` (the homepage puts the brand first).
9. APA consistency: recomputes p from every t, F, χ², z and r in `software.js` `apa` strings and `.apa-quote` blocks. It only pairs a statistic with a p that follows it in the same clause, within 80 characters. If it fires, fix the sentence.
10. The GA Consent Mode block is byte-identical on every page that carries a GA tag.
11. `problems.html`: badges run 1..n in page order, and every "Problem N" reference (in any page or in `faq_data.py`) matches the badge its link points to.
12. Glossary: no two terms in `glossary-data.js` share a slug (the anchor id; identical terms would also share an `sc-cards` card), and every back-link `s` names a ready lesson in `curriculum.js`. Back-links are written by script, so check 4 never sees them.

**`tools/math-check.js`** (required whenever math changes). About 2,800 assertions, each against a published value, with a tolerance set to that source's rounding. It runs in about six seconds and is kept out of `audit.js` on purpose.

- Sections 1–7 test `viz.js` itself: the normal family; quantiles against printed tables; upper tails and quantile↔CDF round trips; the far tail (relative tolerance); special-function identities; densities integrating to 1; noncentral power against G*Power (d = 0.5 → 64 per group, r = .3 → 84, f = .25 with k = 3 → N = 159, w = .3 with df = 1 → 88); effect-size confidence intervals (cross-checked in R); and tool-page constants (d = 0.5 → r = .2425, OVL 80.26%, U₃ 69.15%; Fisher-z r = .5, n = 30 → [.17, .73]; the statcheck case t = 2.05, df = 28 → p = .0498).
- Sections 8–20 load shipped page scripts under a DOM shim and drive them through their own controls and URL appliers: 8 the dice lab (`distributions.html`); 9 the printed tables (`tables.html`, marker `"tb-a-body"`); 10 the quartile conventions (`descriptives.html`); 11 Build a Table (`stats-1/chi-square-tests`); 12 Build the ANOVA Table (`stats-2/one-way-anova`); 13 the Contrast Builder (`stats-2/post-hoc-tests`); 14 the rank-test tables (`tables.html`, `"ntb-u5-body"`); 15 the factorial 2 × 2; 16 the repeated-measures partition (`"rm-t2"`); 17 omitted-variable bias plus §2.10 recomputed from `study-methods.csv` (`"mr-canvas"`); 18 the measurement model refitted from `wellbeing-survey.csv` (`"lc-obs"`); 19 rotation (`"rot-canvas"`); 20 the Bayes grid and the table printed in its prose (`"bh-canvas"`).
- When you edit those pages: keep the marker strings; do not rename `numeric`, `dataParam`, `groupParam`, `pairParam`, `applyControl` or `applySeg` in `site.js` (the check lifts them out by brace-matching); slider and seg defaults are read from the markup, so changing one is a visible, deliberate change.
- Sections 6–7 copy formulas from `power.html`, `effect-sizes.html` and `correlation.html`, which compute against the DOM. If a page's formula changes, update the copy by hand.
- Use `rel()` (relative tolerance) for anything that can fall below about 1e-15; `eq()` cannot tell a tiny value from 0.
- If math-check catches a discrepancy, fix the site, not the test.

## Architecture

### `assets/js/curriculum.js`: the single source of truth

`window.CURRICULUM` lists the courses (`{ slug, title, subtitle, accent, track, sections: [{ n, slug, title, ready }] }`); `CURRICULUM_FLAT` is derived from it. `window.TRACKS` lists the tracks in order (`core`, then `toolkit`), each with a one-line `desc`. The homepage grid, the nav dropdowns, the sidebar, prev/next, the course landing pages and the quiz scope picker all read it. A section without `ready: true` shows as "coming soon".

- Stats 3 was renumbered once, in P100. Do not renumber it again.
- Prev/next skips to the nearest ready section in each direction. If you reserve a section before its page exists, request every rendered prev/next in a browser: audit's link check cannot see generated links.
- The homepage's visible counts are filled in at runtime from `data-count` spans. The baked fallbacks, the og/twitter description ("105 hands-on lessons") and each course's count in the homepage ItemList are static; audit checks 6 and 7 compare them with the number of **ready** lessons.

### `assets/js/site.js`: shared chrome on every page

**BASE.** `"../../"` on lessons (`body[data-section]`) and guides (`body[data-guide]`); `"../"` on course landing pages (`body[data-course-home]`) and section hubs (`body[data-hub]`); `""` at the root. Every generated link is prefixed with it, which keeps all links relative.

**Nav.** The brand links home. "Statistics Core ▾" and "Research Toolkit ▾" are one dropdown per track, built from `TRACKS` and `CURRICULUM` (never hardcode a course list); a course row links to `<course>/`; the tabs themselves go to `#track-core` / `#track-toolkit` on the homepage. "Statistics Toolbox ▾" is a tinted pill whose panel shows `TOOLBOX` grouped by `TOOLBOX_GROUPS` in two height-balanced columns of whole groups (group headers use `--group-head`). Hover or focus opens a panel, clicking a tab navigates, Escape closes the panel and returns focus. Below 860px all three become plain links. A lesson lights its own track's tab; tool and guide pages light the Toolbox; the homepage lights nothing. There is no Ko-fi link in the nav, on purpose.

**Footer.** The tagline, then About (`#about` on the homepage), "Spotted a mistake? Tell me" (a `mailto:` whose subject carries the page's canonical path), Privacy, and the Ko-fi image button.

**Registries in `site.js`.**
- `TOOLBOX` (also `window.TOOLBOX`): every tool page and guide, each with a `group` of `guide`, `calc`, `practice` or `read`. It builds the nav dropdown, the homepage toolbox grid and `toolbox.html`. `TOOLBOX_GROUPS` holds the four group titles and blurbs.
- `SEARCH_PAGES`: non-lesson pages for search.
- `QUIPS`: one capybara one-liner per lesson slug or root page key, shown in the sidebar under the current lesson. Every lesson and tool page needs one (audit checks). Quips are brand voice and exempt from VOICE.md.

**Other things `site.js` injects or exposes.** Favicon, manifest and two media-scoped `theme-color` metas; the skip link; accessibility attributes (`injectA11y`); service-worker registration; a "PNG ↓" export button on every `.viz` that holds a canvas (skip with `data-no-export`); print setup; the lesson table of contents and `ensureH2Ids()`; a copy-link button on every lesson and guide `h2` (no layout shift, no hover-only reveal, no button without a clipboard); `.hscroll` wrappers; the homepage resume banner (returning visitors only); progress recording and "Mark as complete"; the checks, software and snippet blocks; `protectSymbols()`. `window.SC` exposes `ring`, `capy`, `copied`, `preset`, `dataParam`, `pairParam`, `groupParam`, `track` and `scoreBucket`.

**Browser storage** (all `localStorage`, nothing leaves the browser):
- `sc-progress` `{ slug: { v, d } }` and `sc-last` (the resume point)
- `sc-checks` `{ slug: { c, t } }` (best check score)
- `sc-cards` `{ term: { box, due } }` (flashcards: three Leitner boxes, `due` is a day number)
- `sc-exam` `{ scopeSig: { pct, correct, total, at } }` (best mock exam; `scopeSig` is `"all"` or the course scopes sorted and joined with `+`, a narrowed course written `slug:from-to`; retry runs are not stored)
- `sc-name` (the name typed on a certificate)

`progress.html` reads these and writes only `sc-name`.

**Search.**
- Opening the overlay loads `search-index.js` (about 1.7 MB) and `glossary-data.js`. Never load either eagerly. It opens from the magnifier, `/`, ⌘K, or a `?q=` URL (the homepage SearchAction target).
- Matching uses `norm()`, `squash()` and `flexRe()`: at most one separator inside a typed word, up to three between typed words, where a separator is any non-alphanumeric character. `ACCENT_FOLD` lets a plain letter match its accented forms. `within1()` (Damerau-Levenshtein ≤ 1) applies to title and glossary-term tokens only, and only when both sides have 4+ characters. Keyword hits are scaled by `aside()` (×0.55). No debounce is needed (1–7 ms per keystroke). `tools/search-reach.js` lifts `norm`, `squash`, `flexChar` and `flexRe` by brace-matching, so don't rename them.
- A glossary definition card renders above the results (`#search-def`). `glossSlug()` must stay byte-identical to `glossary.html`'s `slugify`.
- With no results the overlay offers "Did you mean" suggestions, a glossary-only note or a plain "no results", then links to the glossary and toolbox.
- Index caps in `build-search-index.py`: `LESSON_MAX_CHARS` 45,000, `GUIDE_MAX_CHARS` 45,000, `PAGE_MAX_CHARS` 500,000 for `problems.html`, 120,000 for `glossary.html`, 60,000 for `teachers.html`, 20,000 by default. When a page nears its cap, raise the cap; never trim the page to fit. If search can't find a term you just wrote, check the caps first.
- `glossary_text()` must never pass its strings through `textify()`: definitions contain `p < .05`, and the tag-strip treats everything from `<` to the next `>` as a tag. Give any new non-HTML source its own normalizer.

**URL parameters on lessons.**
- `?embed=1` renders the bare interactive for an iframe (`body.embed-mode`): no chrome, a back-link to the canonical URL, no progress recorded. It fires `lesson_embed_view`.
- `?present=1` is embed mode at projector size (`body.present-mode`, applied only at 900px and wider), with no PNG buttons. It fires no event.
- `SC.preset(map)` lets a URL set a lesson's controls. A lesson opts in by calling it at the end of its boot. A map value is a selector for a form control (sets the value, fires `input` and `change`), a selector for a `.seg` (clicks the button whose `data-*` value matches; numbers compare numerically), `{ el, scale }` for a slider that stores hundredths (snaps to its `step`, clamps to its `min`/`max` from the markup), or a function that gets the raw string. Missing, unknown or malformed params are ignored silently. Presets run after the lesson's init and never reseed data. Map order matters: list a param that rebuilds another control's bounds first. Reserved keys: `embed`, `present`, `q`.
- `SC.dataParam(raw, max)` returns at least two numbers or `null`, and rejects the whole parameter on one bad token or too many values. `SC.pairParam(raw, max)` parses `?data=x:y,…` (at least three pairs, both columns must vary). `SC.groupParam(raw, maxGroups, maxPer)` parses `?g=a,b;c,d` (at least two groups of at least two values); `?g=` is the site's one convention for group data.
- Each lesson that calls `SC.preset` lists its params in an HTML comment at the top of its inline script, and `teachers.html` carries the instructor table. Adding a preset means updating both.

**Symbols in capitalized labels.** CSS uppercases `.stat .k`, `.ref-table th`, `problems.html`'s `.pb-lbl` and `.pb-given .lbl`, and the posters' `.ptable th`, which would turn α into Α and n into N. `protectSymbols()` wraps symbols in `span.sym` (`text-transform: none`), including labels written after load. Write labels plainly, never hand-add `.sym`, and add any new capitalized context to `SYM_SEL`.

**Analytics events.** `SC.track(name, params)` is the only code that calls `gtag`. It is fire-and-forget and swallows every error; no feature may depend on it. There are ten events, and ten is the ceiling:

| Event | Fired from | Params |
|---|---|---|
| `search_used` | `openSearch()` | `page_type` (never the query) |
| `viz_png_export` | the PNG button | `page_type` |
| `print_used` | `trackPrint()` on `beforeprint` | `page_type` |
| `feedback_click` | the footer feedback link | `page_type` |
| `lesson_embed_view` | `?embed=1` loads | `with_preset` |
| `pwa_installed` | `appinstalled` | none |
| `quiz_practice_finished` | `quiz.html` `finish()` | `scope`, `length`, `score_bucket` |
| `exam_finished` | `quiz.html` `finishExam()` | `scope`, `length`, `score_bucket` |
| `problem_solution_opened` | `problems.html` toggle | `course` |
| `cert_downloaded` | `progress.html` download | `course` |

No personal data, no free text, no exact scores (`SC.scoreBucket()` gives 0-49, 50-79 or 80-100). Tool pages call `SC.track` behind a `window.SC && SC.track` guard, never `gtag`. Keep `trackPrint()`'s count-once flag and `problems.html`'s guard that stops "Print with solutions" from firing an event per problem. Most new features should not get an event; one that does needs a line in `privacy.html`'s "What is collected".

### `assets/js/viz.js`: math and canvas helpers (`window.VIZ`)

`fit` (hi-DPI canvas, device pixel ratio capped at 2), `css`, `onTheme`, `rafThrottle`, `reducedMotion`, `coarsePointer`, `grabRadius`, `randn`/`gauss`, `mean`/`sd` (**`sd` divides by n**; use the n − 1 form wherever a lesson means the sample SD), `erf`/`normCdf`/`normInv`/`normPdf`/`normQ`, `gammaln`/`gammp`/`gammq`/`betai`/`betaiUpper`, `tUpper`/`chiSqUpper`/`fUpper`, `tPdf`/`chiSqPdf`/`fPdf`, `tInv`/`chiSqInv`/`fInv` (bisection), the noncentral CDFs `nctCdf`/`ncx2Cdf`/`ncfCdf`, effect-size intervals `nctCI`/`varExpCI`/`vCI`/`rCI`, and the exact rank-test null distributions (`mwu*`, `wsr*`, `spear*`, `spearAS89`).

- **Far tails.** Never compute a small probability as 1 minus a CDF. `1 - normCdf(z)` is wrong in the third significant figure from z ≈ 6 and returns 0 from z ≈ 9. Use `normQ`, `gammq` and `betaiUpper`, which compute the small side directly. Test such values with `rel()`.
- The noncentrality δ of a t is signed, so `deltaSolve` brackets both sides. The λ of a χ² or F cannot be negative, so `ncpSolve` truncates at 0. Keep them separate.
- Rank-test critical values follow the printed-table convention: the most generous value whose exact tail is at or under α, among values the statistic can actually take (Spearman's S is always even). Spearman is exact up to `SPEAR_EXACT` = 13 and uses the Edgeworth series (AS 89) beyond that.
- Use VIZ functions, not rough approximations, and check new math against a published value with `node -e`.

### Page types

**Lessons** live at `<course>/<slug>/index.html`, with `<body data-course="…" data-section="…">`, an `.lesson` article holding prose and a `.viz` block, then `curriculum.js`, `site.js`, `viz.js` and the lesson's own inline script. Copy an existing lesson from the same course.

**Tool pages** are root-level `.html` files:
- `tables.html`: a z/t/χ²/F calculator, plus printed Tables A, D and F and the rank-test tables (Mann–Whitney U, Wilcoxon W, Spearman ρs), all generated at runtime from `viz.js`. Table cells are `<td>`, never `<button>` (print hides buttons). Builds are lazy and chunked over `requestAnimationFrame`. Clicking a cell drives the calculator through its own controls. Includes a "Look it up" drill.
- `which-test.html` and `plan.html`: decision trees (`NODES`/`LEAVES`). `plan.html` ends in a printable plan with a live sample size using `power.html`'s math, and takes `?test=` prefill params.
- `formulas.html`: the formula sheet in plain Unicode math (no KaTeX or MathJax). Each table's caption states its notation. It prints at five pages on A4 and US Letter (Letter is the tighter one); re-measure after adding rows.
- `distributions.html`: nine distributions and the dice lab (exact counts by convolution, never simulation).
- `descriptives.html`: paste-your-data descriptives with a quartile switch (Textbook, SPSS, R/Python). The default is R/Python and must stay so. Takes `?quart=` and `?data=`.
- `apa.html`: APA results sentences with confidence intervals (95% for t-based statistics, 90% for those built on a one-tailed F or χ²) and a statcheck-style p check. Takes `?a=` and `?v=`.
- `power.html` (verified against G*Power; takes `?sc=` and `?es=`), `effect-sizes.html`, `correlation.html`, `which-chart.html`, `datasets.html`, `flashcards.html`, `glossary.html`, `quiz.html`, `problems.html`, `toolbox.html`, `teachers.html`, `progress.html` (noindex and not in the sitemap), `privacy.html`, `license.html`, and the three posters.
- `teachers.html`'s block maps print one at a time: a print button adds `.bm-printing` to its own section and sets `body.tm-print-map`. A new map needs only a button and a section id.

Registering a new tool page takes six places: `TOOLBOX` (with a group) and `SEARCH_PAGES` in `site.js`; the page list in `build-search-index.py` (then rerun it); `sitemap.xml` (skip for noindex pages); `ROOT_PAGES` in `tools/audit.js`; and `ROOT_PAGES` in `tools/prose-lint.js` (a page missing there is never linted). It also needs a `QUIPS` line and a BreadcrumbList JSON-LD block (Home → Statistics Toolbox → Tool; copy `tables.html`'s). A root page that is not a tool, like `privacy.html`, goes in `NON_TOOL_ROOT` in `audit.js` and stays out of `TOOLBOX`. Canvas tool pages redraw on window `resize` and on a `ResizeObserver`, both through `VIZ.rafThrottle`.

**Guides** live at `guides/<slug>/index.html` with `body[data-guide="<slug>"]`: an `article.lesson` in `.container.narrow`, a "Guide" eyebrow, a hand-written `nav.lesson-toc`, Article + BreadcrumbList JSON-LD (Home → Guides at `/guides/` → guide), `og:type` article and `assets/og.png`. Mock software-output tables use a page-local style, and every number in them must be true (computed from the shipped CSV, or checked with `node -e` and VIZ). Headings are written to match search queries; keep them. Registering a guide takes seven places: `TOOLBOX` (group `read`), `SEARCH_PAGES` (tag "Guide"), `QUIPS`, `build-search-index.py`, `sitemap.xml`, `GUIDES` in `audit.js`, and `GUIDES` in `prose-lint.js`.
- `reading-a-causal-paper`'s worked study is invented and tells the reader so. Keep it that way. Its `#checklist` section prints on its own page.
- `anova-and-regression-project` prints `t(147) = −0.275` to three decimals on purpose; rounded to two, audit check 9 fails it.

**Course landing pages** live at `<course>/index.html` with `body[data-course-home]` and `data-course`: an `article.lesson` with a few hand-written paragraphs, then `renderCourseHome()` fills `#course-home` with the progress ring, a Start/Continue button and the lesson list from `curriculum.js`. Course + BreadcrumbList JSON-LD, `og:type` website, `og:image` the course card. Printing gives a one-page syllabus. Register in `SEARCH_PAGES` (tag "Course"), the course loop in `build-search-index.py`, and `sitemap.xml`; audit derives `COURSE_PAGES` from the curriculum. No `QUIPS` line.

**Section hubs** are `<folder>/index.html` for a folder of pages that is not a course. Today there is one, `guides/index.html`. `body[data-hub]`, CollectionPage + BreadcrumbList JSON-LD, a static list of the folder's pages. Register in `SEARCH_PAGES`, `build-search-index.py`, `sitemap.xml`, and `HUB_FOLDERS` in both `audit.js` and `prose-lint.js`. Not in `TOOLBOX`; no `QUIPS`. Every folder that publishes pages needs its own `index.html` (audit 3e), because crawlers request parent paths that nothing links to.

**Posters** are `cheat-<slug>.html`: self-contained inline poster CSS, an accent set by `--pa`, and a print block that fits one page on A4 and on US Letter. To check fit, add `screen` to every `@media print` rule's `mediaText` in the CSSOM, set `document.body.style.width` to the printable width (A4 192 mm, Letter 198 mm), and measure `#poster` against 279 mm / 261 mm. They are `group: "guide"` tool pages, so register them like any tool page.

### Per-lesson data

- **`checks.js`** (`window.CHECKS`): three multiple-choice questions per slug, `{ q, o: [4], a, why }`. Rendered as a closed `<details>`. `site.js` shuffles the options on every render, so never write an option that depends on its position ("both of the above", "none of the above"). Best scores go to `sc-checks`; a perfect run offers to mark the lesson complete.
- **`software.js`** (`window.SOFTWARE`): `{ spss: [], jasp: [], apa, tips: [] }` for the 48 lessons that cover a runnable analysis. It renders "🖱️ Run it in SPSS / JASP" (`id="run-it"`, SPSS tab first) and "📝 Write it up (APA 7)". Tips render inside the APA block, so an entry with no `apa` shows no tips. In APA sentences, Latin statistics are italic via `<em>` and Greek letters are upright.
- **`snippets.js`**: an R/Python snippet per slug ("Try it yourself").
- Injection order on a lesson is fixed: checks, SPSS/JASP, APA, R/Python, then the progress row.
- **FAQs.** `tools/faq_data.py` holds three `(question, answer-HTML)` pairs per slug (links written for lesson depth, `../../`). `./tools/inject-faqs.py` bakes them into each lesson as a "Common questions" block plus FAQPage JSON-LD, so search engines index them. Never hand-edit the FAQ block in the HTML. Answers complement the lesson and should not repeat it. **Any sitewide find-and-replace over lesson HTML must also run over `faq_data.py`**, or the next inject reverts it.
- **`glossary-data.js`** (`window.GLOSSARY`), one entry per term with an optional back-link `{ s: "<course>/<slug>", l: "<label>" }`, feeds `glossary.html`, `flashcards.html` and the search index. A term string is a key (the glossary anchor, `glossSlug`, `sc-cards`), so changing one drops any saved flashcard progress for it, and two entries may not share one (audit check 12). `glossary.html` shows each term as a collapsed `<details>`, with a sticky A–Z bar, a filter that opens its matches, and a print path that opens everything and restores the reader's state afterwards.
- **`quiz.html`'s `BANK`**: 280 questions, `{ c, q, o: [4], a, why, s }`. `c` is the course slug; `s` is the section for Stats 1–3 (a question spanning two lessons takes the later one). Practice mode gives 10 questions with instant feedback. Exam mode takes a scope (courses, plus a section range for tagged courses), a length of 10, 20 or 40, and an optional count-up timer. A course with no `s` tags has no range control and is examined whole. Both modes shuffle options. A shareable exam link looks like `quiz.html?exam=stats-1&from=1.1&to=1.12&n=20` (`from`/`to` only with a single course; ranges compare positions in the section list, not numbers). The exam still starts on the button.
- **`problems.html`**: 100 worked problems in 8 sets, all static HTML so they are crawlable. Each problem's verification one-liners sit in an HTML comment, and every number was checked with `node -e` and VIZ (plus exhaustive enumeration for the rank tests and numerical integration for Tukey's q). Keep that standard. Each card has a permanent id `pS-N` (set S, problem N) that links use; the badge (`.pb-num`) is the displayed number. Badges are a continuous page-wide count: when you add a problem, put the card inside its `<section class="pb-set">`, renumber every later badge, rewrite each "Problem N" reference from the fragment it links to (audit 11 checks), update the set's row in the index, and update the spelled-out count in the page's three descriptions (nothing checks that). "Print problems" hides solutions; "Print with solutions" opens them all.

### Datasets

`tools/make-datasets.py` writes `assets/data/*.csv` from `BASE_SEED = 20260709` plus a per-dataset offset, so a rerun is byte-identical. `search_seed()` scans offsets until the realized sample hits the story's target. There are ten CSVs; the hot-dog contest file is real published data. **Never regenerate a CSV that a page publishes numbers from**: `study-methods.csv` (math-check 17) and `wellbeing-survey.csv` (math-check 18) are frozen. Adding a dataset means a builder in `BUILDERS`, a `.ds-card` and `.ds-index` row in `datasets.html` with verification one-liners, then the count sentences in `datasets.html` and `license.html` (nothing checks them; grep).

### Styling, offline, SEO and analytics

- **`styles.css`** is a CSS-variable design system. Dark mode is `html[data-theme="dark"]`, set before paint by an inline head script. Inter is self-hosted, with a metric-matched "Inter Fallback" first in the font stack. No external CSS, JS or fonts apart from the lazy Ko-fi image.
- **Offline.** `site.webmanifest` uses only relative paths and has three shortcuts. `sw.js` precaches the shell; serves CSS/JS stale-while-revalidate, fonts and images cache-first, and HTML network-first; falls back to `offline.html` for uncached pages; and passes cross-origin requests straight through. `sw.js` and `offline.html` are self-contained and stay out of `ROOT_PAGES` and the sitemap.
- **GA4** (`G-80HCM6EZVN`): exactly one tag per page, right after `<head>`, byte-identical everywhere (audit 10). The Consent Mode defaults deny the three advertising keys, grant `analytics_storage`, and `gtag('config', …)` passes `client_storage: 'none'`, so no `_ga` cookie is set. **Never set `analytics_storage` to denied**: that stopped all reporting from 21 July to 24 August 2026 while the tag looked healthy, because GA treats those hits as cookieless pings it never reports. Seeing a hit leave the browser proves nothing; check the GA property. `privacy.html` describes this setup and changes with it. Redirect stubs and `offline.html` carry no tag.
- **Per-page SEO** is written into each `<head>` by hand: canonical, Open Graph and Twitter tags from the page's own title and description. `og:type` is article for lessons and guides and website elsewhere. Lessons use `assets/og-<course>.png`; other pages use `assets/og.png`.
- **JSON-LD.** The homepage has Organization, WebSite (with the `?q=` SearchAction) and an ItemList of one Course per course (name `Title: Subtitle`, description `N interactive lessons — part of <track> track.`, url the landing page, an `educationalLevel`). Lessons have LearningResource + BreadcrumbList (+ the FAQPage block), tool pages a BreadcrumbList, `quiz.html` a Quiz. Levels: stats-1 Beginner, stats-2 Intermediate, stats-3 and ml Advanced, toolkit courses Intermediate. Core-course levels live in `CORE_LEVELS` in `audit.js`; a core course missing there silently disables the level check.
- **`sitemap.xml`** lists the homepage, every ready lesson and every indexable page as absolute `statscapybara.com` URLs. Update it whenever a page is added, renamed or moved. Absolute URLs also appear in canonicals, OG tags, JSON-LD and `robots.txt`, so a domain change is a sitewide replace.

## Conventions

- **Paths are relative**, never starting with `/`. Lessons use `../../assets/…` and link to `../../<course>/<slug>/`; root pages use `assets/…`. Test with the subpath server.
- **`404.html` is self-contained** (inline CSS, a home link computed in JS), because GitHub serves it at any depth.
- **Statistics must be correct.** Check interactives against published values (critical-value tables, G*Power, Beta quantiles).
- **APA typography** everywhere: Latin statistics italic (`<em>`), Greek letters upright, no leading zero on p, r, β, η² or V, `p < .001` as the floor, and never `p = .000`.
- **References.** A reference the site presents as real is checked at its DOI before it ships. An invented example says it is invented.
- **Frozen noise.** Sliders transform the same data points; they never draw a new sample. A `seed()` fills fixed pools, a deterministic `gen()` maps pools and slider values to data, and only an explicit "New sample" button calls `seed()`. Test: move a slider away and back, and every readout must return to the same value. (The IV, RD and DiD widgets draw a fresh sample on each page load, so any prose quoting their readouts gives a range.)
- **Canvas text** never overlaps a line, a curve or another label. Size gaps and wrap points with `measureText`; give legends and captions their own band; wrap or stagger on a narrow canvas and let its height follow; move labels to one side of a line the reader drags. Where a crossing can't be avoided, draw the text on a `--bg-soft` patch with `fillRect`, after the line and before the points (not a `strokeText` halo: math-check's shims have no `strokeText`). Check every new chart at 390px wide.
- **Cursors.** Draggable canvas: `grab`, then `grabbing` while dragging. Click to select or add: `pointer`, only while there is something to click. Axis-constrained drag: `ew-resize`. Display-only: the default.
- **Touch.** A canvas that captures drags declares `touch-action` in its markup (`none`, or `pan-y` for a one-axis drag); a display-only canvas must not. Pair `pointerdown` with both `pointerup` and `pointercancel`. Hit radii come from `VIZ.grabRadius(base)` read at `pointerdown`. Nothing may be hover-only.
- **Narrow screens.** No page may scroll sideways at 360px. A `.seg` scrolls inside itself. Write `min-width: min(300px, 100%)` and `minmax(min(330px, 100%), 1fr)`, never a fixed floor above about 280px.
- **Interaction feel.** Every `[id]` has `scroll-margin-top`. Clickables share one `:active` press rule; add new classes to it. Copy buttons call `SC.copied(btn)`. Keep any `::details-content` selector in a rule of its own. Wide content goes in `.hscroll` (`setupHScroll()` wraps every `.ref-table` and `.lesson pre`). Range inputs are styled through `--range-accent` and `--range-thumb`; don't write new per-page slider CSS.
- **Links in prose** are colored, not bold and not underlined until hover. `--link` is tuned per theme to clear 4.5:1 against the surface and 3:1 against body text; don't substitute `--primary`. A chrome link list inside an article goes in a classed container.
- **Branding.** The capybara is hand-drawn SVG and canvas (`capy()` in `site.js`). Never use 🦫 or 🐹.
- **Course accents** are chrome only (title, eyebrow, sidebar, homepage card): Stats 1 `var(--primary)`, Stats 2 `var(--secondary)`, Stats 3 `var(--success)`, ML `#a855f7`, Methods `#f59e0b`, Data `#06b6d4`, Ethics `#64748b`, Writing `#84cc16`. Violet `#8b5cf6` is reserved for the checks block and orange `#f97316` for highlights. Canvas colors are semantic and the same in every course: indigo for the primary series or fitted line, orange for a second series or residuals, teal for data points, green and red for good and bad. Completed lessons render fainter.
- **OG images** come from `tools/make-og-images.py`, which reads titles and accents from `curriculum.js` and shrinks each text block to fit. `--retag-only` points lesson heads at their course card. Look at `og.png` after any wording change.
- **Accessibility (WCAG 2.1 AA).** `injectA11y()` names each canvas from its `.viz-title` and `.viz-sub` (so write descriptive ones), makes `.stat-row` a polite live region, and labels each control from its visible `<label>`. An interaction that only works by dragging a canvas needs a keyboard path: `tabindex="0"`, an `aria-label` naming the keys, and an arrow-key handler that calls `preventDefault()`. On lessons, ← and → move between lessons except while a canvas or form field has focus. The search overlay is a focus-trapped dialog; Escape closes it and the mobile menu and returns focus. Animation loops check `VIZ.reducedMotion()`. `--text-faint` clears 4.5:1 in both themes; check any new color pair. The accessibility statement is in the homepage's About section.
- **Performance.** `.viz canvas` reserves space with `aspect-ratio: var(--viz-ar, 3 / 1)`; override `--viz-ar` on a canvas that still shifts. On mobile the sidebar renders after the article. Device pixel ratio is capped at 2. Resize handlers go through `VIZ.rafThrottle`. `search-index.js` stays lazy and GA stays async.
- **Print.** One `@media print` block in `styles.css` plus `setupPrint()`. A lesson prints its prose, the frozen interactive (canvases are snapshotted to images on `beforeprint`), readouts and the APA and R/Python blocks. It hides chrome, controls, the quip, the checks and the SPSS/JASP tabs, switches the color variables to a light palette, and adds a footer with the canonical URL. To check print, flip the block's media to `screen` in the CSSOM and dispatch `beforeprint`.
- **Browser checks.** The preview screenshot tool can hang on external images. Prefer `node --check` and driving the page with `eval`.

## Adding a lesson

1. Copy a lesson from the same course to `<course>/<slug>/index.html`. Set `data-course`, `data-section` and the `Section N.n` eyebrow. The eyebrow is hardcoded, so inserting a lesson (rather than appending one) means renumbering the later eyebrows and any § references elsewhere; audit check 2 finds the misses.
2. Retarget the title, meta description, canonical, og/twitter tags and the LearningResource and BreadcrumbList JSON-LD. Leave the GA block alone. If you copied from another course, run `python3 tools/make-og-images.py --retag-only`.
3. Write the inline interactive with VIZ helpers and frozen noise.
4. Set `ready: true` in `curriculum.js`.
5. Add three questions to `checks.js`, three FAQs to `faq_data.py` (then `./tools/inject-faqs.py`), a `QUIPS` line, glossary terms, quiz questions (with `c` and `s`), an R/Python snippet, a `software.js` entry if it covers a runnable analysis, and the URL in `sitemap.xml`.
6. Update the lesson count in `index.html`'s og/twitter descriptions and `data-count` fallbacks, and the course's count in the homepage ItemList (audit 6 and 7).
7. Consider `SC.preset`, and `?data=` or `?g=` if the interactive runs on a batch of numbers. Either one needs a params comment atop the script and a row in `teachers.html`.
8. Consider a leaf in `which-test.html`.
9. Run `./tools/build-search-index.py`, then `node tools/audit.js`.

## Adding a course

Append a course to `CURRICULUM` with `slug`, `title`, `subtitle`, `accent` and `track`. Pick an accent distinct from every existing one in light and dark mode (never violet or orange) and add it to the accent list above. Then add each lesson as above; create `<course>/index.html` by copying a landing page; add the course's Course entry to the homepage ItemList and to `quiz.html`'s Quiz `about` list; run `python3 tools/make-og-images.py`, `./tools/inject-faqs.py` and `./tools/build-search-index.py`; and update the counts in `index.html`.

## Voice

**VOICE.md** is the standard for every sentence a visitor reads: lessons, FAQ answers, guides, posters, tool pages, meta descriptions, and the strings in `checks.js`, `software.js`, `snippets.js` comments, `glossary-data.js` and inline scripts. Read it before you write or edit prose.

`tools/prose-lint.js` measures it. Its `PATTERNS` table mirrors VOICE.md's hard rules, so change both in the same commit. `--strict` has been green since August 2026, so a red result is a regression. In short: at most 4 em-dashes per page and 8 per 1,000 words; at most 1 across a lesson's three FAQ answers; fixed budgets for each JS surface; American spelling throughout (rule 12, matched by word shape); and readout placeholders (an element whose whole content is `—`) don't count as prose. Quips are exempt. Since P106, `--manner` measures the habits of the model that wrote most of the site, listed in VOICE.md's round-three catalog.

Round three (Phase 20, P106–P121) cut those catalog hits from 1,794 to under 50 and the lesson median sentence from 18.0 words to 15.9. P121 made three of the shapes hard budgets under rule 14: no "load-bearing", no "earns its place/keep/space" on any surface, and at most one "X is what makes Y" per page. The rest of `--manner` gates nothing, so run `--manner --page` on any page you write, and watch for the habits that replaced the old ones: sentences that open with "So", "the most common mistake" superlatives, and "can be trusted".
