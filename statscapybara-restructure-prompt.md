# Task: restructure the statscapybara.com statistics courses from four to three

You are working on the codebase for **statscapybara.com**. This is a large
information-architecture change: roughly 24 lesson pages change course, one course is
eliminated, and 5 new lessons are written. Read this whole brief before touching anything —
and read **`CLAUDE.md`** and **`VOICE.md`** at the repo root first, in full. They are the
law of this repo. Where this brief and CLAUDE.md disagree about *mechanics* (how the site is
wired, what the gates are), CLAUDE.md wins; where they disagree about *intent* (what goes
where), this brief wins — but flag the disagreement in your report either way.

**Vocabulary note, to prevent a whole class of confusion:** in this codebase the word
**"track"** means the two curriculum tracks in `window.TRACKS` — `core` ("The Statistics
Core") and `toolkit` ("The Research Toolkit"). What this brief restructures are **courses**
(`stats-1` … `stats-4`, entries in `window.CURRICULUM`). Both tracks survive this change
untouched; one *course* is eliminated. Use "course" throughout your work and your report.

---

## 1. Why this change

The four statistics courses (`stats-1` … `stats-4`) were organized by difficulty. They now
need to mirror the two real courses the author teaches at University College Groningen, so
that a student on either course finds their entire syllabus inside one course page:

- **Stats 1** must contain exactly the syllabus of *Statistics 1 (UCG1RM11)*.
- **Stats 2** must contain exactly the syllabus of *Statistics 2 (UCG2RM03)*.
- **Stats 3** becomes the advanced/elective course: everything statistical that is in
  neither syllabus, merged with the whole of the current `stats-4`.
- **Stats 4 ceases to exist.** The site goes from 9 courses to 8.

The two course syllabi are reproduced in §7 so you can verify placement yourself.

**Out of scope, do not touch:** the four Research Toolkit courses (`methods`, `data`,
`writing`, `ethics`) and the `ml` course (**note: `ml` is in the *core* track, not the
toolkit** — it still does not change). Do not move, rename, or renumber anything in them.
The tool pages, guides, posters, and hubs change only where §6 says so.

---

## 2. Rules of engagement

1. **Do a discovery pass first and report back before changing a single file.** See §3.
   Do not begin edits until you have confirmed your inventory matches §4 and presented a
   plan. If anything in §4 does not match what you find, **stop and report** rather than
   guessing.

2. **Never break a URL — but know what a "redirect" means on this host.** The site is plain
   static HTML deployed byte-for-byte to **GitHub Pages** by
   `.github/workflows/pages.yml` → `tools/make-pages-artifact.js`. **GitHub Pages cannot
   serve real HTTP 301s, and there is no `_redirects`/`vercel.json`/`.htaccess` equivalent —
   do not invent one and do not add a build step to fake one.** A "redirect" here is a
   **stub `index.html` left at the old path**, using the exact template in §6-D: canonical
   pointing at the new URL, `noindex`, an instant meta refresh, and a JS `location.replace`
   that **forwards `location.search` and `location.hash`** (this is what keeps old
   `?embed=1` iframes and `SC.preset` deep links working — meta refresh alone drops the
   query string). Search engines treat an instant meta refresh on a noindexed, canonicalized
   page as a permanent move; a student's bookmark lands on the new page either way.

3. **Preserve every slug exactly.** Only the course segment of the path changes:
   `/stats-3/logistic-regression/` → `/stats-2/logistic-regression/`. Do not "improve"
   slugs while you are in there. This matters beyond URLs: `sc-progress`, `sc-checks`, and
   every shared-JS surface (`checks.js`, `software.js`, `snippets.js`, `faq_data.py`,
   `QUIPS`) are **keyed by slug alone**, so preserving slugs is what makes readers'
   localStorage progress and all five keyed surfaces survive the move with zero edits.

4. **Write explicit per-URL redirect stubs, not anything wildcard-shaped.** One stub per
   moved URL, each pointing at its **final** destination. Verify no stub's target is itself
   a stub: the `stats-4 → stats-3` arrivals all stay in Stats 3, and the `stats-3 → stats-2`
   departures were never in Stats 4, so with explicit per-URL stubs no chain is possible —
   confirm that from your own §4 diff before writing them.

5. **Preserve page content.** This is a re-filing job, not a rewrite. Lesson prose,
   examples, interactive widgets, and images move unchanged. The only in-page edits on a
   moved lesson are the ones listed in §6-B.

6. **Know where each count actually lives — and never add a build step to "compute" one.**
   There is no build. The homepage's *visible* course/lesson counts are already computed at
   runtime from `curriculum.js` (the `data-count` spans — they self-update and need no
   edit). The *hardcoded* counts are: the `97 hands-on lessons` string in `index.html`'s
   `og:description`/`twitter:description`, the per-course `N interactive lessons` strings
   in the homepage ItemList JSON-LD, and the course list in `quiz.html`'s Quiz `about`
   block. Update those by hand; `node tools/audit.js` (checks 6–7) fails until they match
   `curriculum.js`, which is the enforcement. That is the designed mechanism — work with
   it, don't replace it.

7. **`curriculum.js` does the heavy lifting — never hand-edit generated chrome.** The nav
   dropdowns, sidebar, homepage grid, course rings, prev/next links, and course landing
   page lesson lists are all rendered at runtime from `window.CURRICULUM`. Editing the
   curriculum *is* the nav/sidebar/prev-next change. The hand-work in this migration is
   everything that is baked per page (eyebrows, head SEO, JSON-LD, sitemap, hardcoded
   cross-references) — §6 enumerates it.

8. **Work in phases and commit after each — and every single commit must pass
   `node tools/audit.js` with 0 errors.** `node tools/prose-lint.js --strict` must stay
   green too (it has been green since P77; red now means a regression you introduced).
   `node tools/math-check.js` is required only if you touch `assets/js/viz.js` or tool-page
   math — this migration shouldn't, but the new lessons' inline math must still be verified
   with `node -e` against `VIZ` (see §5). A redirect stub must land **in the same commit**
   as the move it covers, so no commit in history has a dead URL.

9. **Do not push to `main` until the full §8 checklist passes.** CLAUDE.md's standing rule
   is that finished work goes to `main` (which deploys immediately) — that rule stands, but
   for this multi-phase job "finished" means §8, not each phase. If a session must end
   early, push the working branch, leave `main` alone, and say so in your report.

10. **The find-replace corollary (this repo has been bitten before):** any sitewide
    find-replace over lesson HTML must **also** run over `tools/faq_data.py`, then re-run
    `python3 tools/inject-faqs.py` — the FAQ blocks in lesson HTML are generated from that
    file and will silently revert your edits on the next injection otherwise. The same
    logic applies to every shared-JS surface: links and "§N.n" references live in
    `checks.js`, `software.js`, `snippets.js`, `glossary-data.js`, and `site.js` too.

11. **Bump `CACHE_VERSION` in `sw.js`** in the final pre-push commit: `curriculum.js` and
    `site.js` are precached shell assets. Never reuse one version string across two
    different byte-states of a shell asset — if you bump mid-migration and then edit
    `curriculum.js` again, bump again.

---

## 3. Phase 0 — discovery (no edits)

CLAUDE.md already answers the "what stack is this" questions — don't re-derive them, verify
them. Report the following before making changes:

- The current per-course lesson list from `assets/js/curriculum.js` (slug, `n`, title,
  order), diffed against §4. **The mapping in §4 was verified against `curriculum.js` on
  22 Aug 2026 and matched exactly (13 + 10 + 12 + 12 = 47, every slug accounted for) — but
  re-verify on the tree you actually have**, and stop if it has drifted.
- Confirmation that each lesson folder on disk matches its curriculum entry, and that all
  47 slugs are unique sitewide (the shared-JS surfaces assume it).
- A baseline run of the gates on the untouched tree: `node tools/audit.js`,
  `node tools/prose-lint.js --strict`, `node tools/math-check.js` — all must be green
  *before* you start, so any later red is unambiguously yours.
- The integration surfaces you will have to touch, confirmed to exist as CLAUDE.md
  describes them (measured 22 Aug 2026 — re-measure): **80 files** contain the string
  `stats-4` (excluding `.git` and the generated `assets/js/search-index.js`); **82**
  occurrences of `§N.n` section references sit in HTML/JS/py prose and most stats-course
  section numbers change in this migration; `sitemap.xml` holds **135 URLs**, 13 of them
  under `stats-4/`; `quiz.html`'s `BANK` tags questions by course slug with a legacy map
  `{ s1..s4 }`; `assets/js/glossary-data.js` back-links terms via `{ s: "<course>/<slug>" }`;
  `teachers.html` carries a preset-lessons table and a fourteen-week Stats 1–2 map;
  `datasets.html`, `which-test.html`, `which-chart.html`, `plan.html`, the three
  `cheat-*.html` posters, `problems.html`, and everything under `guides/` cross-link
  lessons by path and by section number.
- Whether `stats-1/probability-basics/` covers the binomial distribution (see §5 item 2 —
  as of 22 Aug 2026 it contains **zero** occurrences of "binomial", so expect to create
  the new page).
- Your proposed phase/commit plan (§6-J has a suggested one).

Then present your migration plan and wait for approval.

---

## 4. The authoritative mapping

47 existing lessons, every one accounted for. `KEEP` = stays in its course (its section
number may still change — see the renumbering warning below). `MOVE` = path changes,
content unchanged. `NEW` = page does not exist yet, see §5.

### → Stats 1 (Statistics 1, UCG1RM11) — 18 lessons

Order them to follow the teaching weeks, as listed:

| # | Target URL | Action | From |
|---|---|---|---|
| 1 | `/stats-1/what-is-statistics/` | KEEP | — |
| 2 | `/stats-1/types-of-data/` | KEEP | — |
| 3 | `/stats-1/describing-data/` | KEEP | — |
| 4 | `/stats-1/visualizing-data/` | KEEP | — |
| 5 | `/stats-1/z-scores-and-the-normal-distribution/` | KEEP | — |
| 6 | `/stats-1/producing-data-and-sampling-design/` | NEW | — |
| 7 | `/stats-1/probability-basics/` | KEEP | — |
| 8 | `/stats-1/binomial-distribution/` | NEW (conditional) | — |
| 9 | `/stats-1/sampling-distributions/` | KEEP | — |
| 10 | `/stats-1/central-limit-theorem/` | KEEP | — |
| 11 | `/stats-1/confidence-intervals/` | KEEP | — |
| 12 | `/stats-1/hypothesis-testing-logic/` | KEEP | — |
| 13 | `/stats-1/one-sample-and-paired-t-tests/` | KEEP | — |
| 14 | `/stats-1/independent-samples-t-test/` | KEEP | — |
| 15 | `/stats-1/inference-for-proportions/` | NEW | — |
| 16 | `/stats-1/chi-square-tests/` | MOVE | `/stats-2/chi-square-tests/` |
| 17 | `/stats-1/correlation/` | MOVE | `/stats-2/correlation/` |
| 18 | `/stats-1/simple-linear-regression/` | MOVE | `/stats-2/simple-linear-regression/` |

**Leaving Stats 1:** `/stats-1/effect-size-and-power/` → `/stats-3/effect-size-and-power/`.
Effect size and power are not on the Statistics 1 syllabus.

### → Stats 2 (Statistics 2, UCG2RM03) — 17 lessons

| # | Target URL | Action | From |
|---|---|---|---|
| 1 | `/stats-2/non-parametric-alternatives/` | KEEP | — |
| 2 | `/stats-2/one-way-anova/` | KEEP | — |
| 3 | `/stats-2/post-hoc-tests/` | KEEP | — |
| 4 | `/stats-2/factorial-anova-two-way/` | KEEP | — |
| 5 | `/stats-2/repeated-measures-anova/` | KEEP | — |
| 6 | `/stats-2/assumptions-and-when-they-break/` | KEEP | — |
| 7 | `/stats-2/inference-for-regression/` | NEW | — |
| 8 | `/stats-2/regression-diagnostics/` | KEEP | — |
| 9 | `/stats-2/multiple-regression/` | MOVE | `/stats-3/multiple-regression/` |
| 10 | `/stats-2/categorical-predictors-and-dummy-coding/` | MOVE | `/stats-3/categorical-predictors-and-dummy-coding/` |
| 11 | `/stats-2/interactions-in-regression/` | MOVE | `/stats-3/interactions-in-regression/` |
| 12 | `/stats-2/multicollinearity-and-variable-selection/` | MOVE | `/stats-3/multicollinearity-and-variable-selection/` |
| 13 | `/stats-2/assumptions-of-regression/` | MOVE | `/stats-3/assumptions-of-regression/` |
| 14 | `/stats-2/model-comparison/` | MOVE | `/stats-3/model-comparison/` |
| 15 | `/stats-2/ancova/` | MOVE | `/stats-3/ancova/` |
| 16 | `/stats-2/logistic-regression/` | MOVE | `/stats-3/logistic-regression/` |
| 17 | `/stats-2/nonlinear-relationships-and-transformations/` | NEW | — |

**Leaving Stats 2:** `chi-square-tests`, `correlation`, `simple-linear-regression` — all
three to Stats 1 (they are Moore chapters 9 and 2, taught in Statistics 1 weeks 6 and 7).

> **Flag for the site owner, do not resolve on your own:** Stats 2 will now hold both
> `assumptions-and-when-they-break` (ANOVA-oriented) and `assumptions-of-regression`. These
> are legitimately different pages but the titles will read as duplicates in the course
> index. Report this and propose clearer titles; do not merge or rename without approval.

### → Stats 3 (advanced / elective) — 17 lessons

| # | Target URL | Action | From |
|---|---|---|---|
| 1 | `/stats-3/effect-size-and-power/` | MOVE | `/stats-1/effect-size-and-power/` |
| 2 | `/stats-3/power-analysis-for-complex-designs/` | KEEP | — |
| 3 | `/stats-3/mediation-and-indirect-effects/` | KEEP | — |
| 4 | `/stats-3/manova/` | KEEP | — |
| 5 | `/stats-3/factor-analysis-pca/` | KEEP | — |
| 6 | `/stats-3/bootstrap-and-resampling/` | MOVE | `/stats-4/bootstrap-and-resampling/` |
| 7 | `/stats-3/bayesian-thinking/` | MOVE | `/stats-4/bayesian-thinking/` |
| 8 | `/stats-3/bayesian-estimation/` | MOVE | `/stats-4/bayesian-estimation/` |
| 9 | `/stats-3/generalized-linear-models/` | MOVE | `/stats-4/generalized-linear-models/` |
| 10 | `/stats-3/mixed-and-multilevel-models/` | MOVE | `/stats-4/mixed-and-multilevel-models/` |
| 11 | `/stats-3/cross-validation-and-overfitting/` | MOVE | `/stats-4/cross-validation-and-overfitting/` |
| 12 | `/stats-3/causal-dags-and-confounding/` | MOVE | `/stats-4/causal-dags-and-confounding/` |
| 13 | `/stats-3/survival-analysis/` | MOVE | `/stats-4/survival-analysis/` |
| 14 | `/stats-3/missing-data/` | MOVE | `/stats-4/missing-data/` |
| 15 | `/stats-3/meta-analysis/` | MOVE | `/stats-4/meta-analysis/` |
| 16 | `/stats-3/psychometric-functions/` | MOVE | `/stats-4/psychometric-functions/` |
| 17 | `/stats-3/signal-detection-theory/` | MOVE | `/stats-4/signal-detection-theory/` |

**Leaving Stats 3:** the eight regression/ANCOVA lessons listed in the Stats 2 table above.

### Stats 4

Delete the course as a concept: remove its object from `window.CURRICULUM`. Every page
under `/stats-4/` becomes a redirect stub to its Stats 3 equivalent, and `/stats-4/`
itself (today a course landing page) becomes a stub to `/stats-3/`. Remove `stats-4` from
every surface §6 lists.

Arithmetic check: 13 + 10 + 12 + 12 = 47 before; 18 + 17 + 17 = 52 after, of which 5 are
new. Redirect stubs: 24 lesson-level (3 into Stats 1, 1 out of Stats 1, 8 from Stats 3 to
Stats 2, 12 from Stats 4 to Stats 3) plus 1 for `/stats-4/` itself = **25 stubs**. Recount
from the tables yourself and stop if your numbers differ.

> **The renumbering warning — read this twice.** Every lesson's `Section N.n` eyebrow is
> hardcoded in its own HTML, and `audit.js` errors when an eyebrow disagrees with
> `curriculum.js` — so re-ordering a course means renumbering the eyebrows of every lesson
> whose position shifted, in **all three** surviving stats courses, not just the moved
> pages. Beyond the eyebrows, the site's prose, posters, `problems.html` references,
> `which-test.html`'s cheat table, and the shared-JS answer strings cite lessons as
> "§2.7", "§1.12" etc. — **82 such references existed on 22 Aug 2026, and no automated
> check fully validates them** (`destination-promises.js` and `link-promises.js` catch the
> linked ones; a bare prose "§2.6" is caught by nothing). Grep for `§` and for
> `Section [0-9]` and reconcile every hit against the new numbering by hand. This is the
> single most error-prone part of the whole migration.

---

## 5. New pages (5)

Each fills a real syllabus topic with no current home. There is no "front matter" and no
template engine: **copy an existing lesson in the same course and follow CLAUDE.md's
"Adding a lesson" checklist to the letter.** That means, per new lesson: retarget the
copied head SEO (canonical, `og:url`, `og:title`/`og:description`, `twitter:*`, the
`[LearningResource, BreadcrumbList]` JSON-LD — and leave exactly one GA snippet); set
`data-course`/`data-section` and the correct `Section N.n` eyebrow; write the inline
interactive following the **frozen-noise** convention and the canvas cursor/touch/a11y
conventions; add **3 check questions** (`checks.js`), **3 FAQ entries** (`faq_data.py`,
then `python3 tools/inject-faqs.py`), a **QUIPS** entry (`site.js`), **glossary terms**
(`glossary-data.js`, with `s:` back-links), **2–3 quiz questions** (`quiz.html` `BANK`,
tagged `c:`), an **R/Python snippet** (`snippets.js`), and — where the lesson covers a
runnable analysis — a **SPSS/JASP + APA entry** (`software.js`); add the URL to
`sitemap.xml`; flip `ready: true` in `curriculum.js`; rerun
`python3 tools/build-search-index.py`; and run `./tools/make-og-images.py --retag-only` so
the copied page's `og:image` points at its own course card. All prose obeys **VOICE.md**
(em-dash budgets included — ≤ 4 per page and ≤ 1 across the three FAQ answers) and must
leave `prose-lint --strict` green. Every statistic in prose or widget must be verified with
`node -e` against `VIZ` before shipping — "statistics must be correct" is the brand
promise, and for `problems.html`-grade worked numbers the repo's bar is a verification
one-liner in an HTML comment.

Match the tone, length, and section structure of neighbouring lessons in the course. Do not
invent a new page format.

1. **`/stats-1/producing-data-and-sampling-design/`** — Moore ch. 3, taught in Statistics 1
   week 1 and examinable on the midterm. Covers: population vs. sample; observational vs.
   experimental studies; simple random sampling; stratified and multistage designs;
   randomized comparative experiments; cautions about sample surveys (undercoverage,
   non-response, response bias, question wording).
   *Do not duplicate the Research Toolkit.* `/methods/sampling-methods/`,
   `/methods/observational-designs/`, `/methods/experimental-design-and-randomization/` and
   `/methods/reliability-and-validity/` already cover this ground in depth. Write the
   Stats 1 lesson as the course-level treatment and link out to those four as "go deeper".
   Add reciprocal links from those four back to this lesson. (Mind `link-promises.js`: make
   each anchor's promise word actually present at its destination.)

2. **`/stats-1/binomial-distribution/`** — Moore ch. 5.1. **Conditional:** first read
   `/stats-1/probability-basics/`. If it already covers the binomial setting, the binomial
   coefficient and B(n, p) at lesson depth, do not create a separate page — report that and
   skip it. (Pre-checked 22 Aug 2026: it does not — zero occurrences of "binomial" — so
   expect to create it, but verify on your tree.) Cover: the four binomial conditions,
   n-choose-k, binomial probabilities, mean and variance of a binomial count. Note
   `distributions.html` already renders a binomial pmf via `VIZ.gammaln` — reuse that math,
   and cross-link the tool.

3. **`/stats-1/inference-for-proportions/`** — Moore ch. 8, Statistics 1 week 6. Currently
   the site has no page for this at all. Covers: the sampling distribution of a sample
   proportion; conditions for inference on p; confidence interval for one proportion;
   significance test for one proportion; comparing two proportions (CI and pooled z test);
   the relationship χ² = z² for a 2×2 table (which `math-check.js` already asserts as a
   cross-distribution identity — the lesson can lean on exact `VIZ` math).

4. **`/stats-2/inference-for-regression/`** — Statistics 2 weeks 4–5. Covers: the
   population regression model; standard error of the slope; t test and confidence interval
   for the slope; ANOVA table for regression; confidence vs. prediction intervals. This is
   the inferential companion to `/stats-1/simple-linear-regression/`, which after this
   change holds only the descriptive least-squares material — cross-link the two explicitly
   in both directions, since the split between them is now a course boundary and students
   will otherwise think one of them is missing content.

5. **`/stats-2/nonlinear-relationships-and-transformations/`** — Statistics 2 week 8,
   taught alongside logistic regression. Covers: recognizing non-linearity in residual
   plots; log and polynomial transformations; interpreting coefficients on a transformed
   scale; when a transformation is preferable to a more complex model. Note
   `/data/transformations-and-recoding/` exists in the toolkit — same "course-level
   treatment plus go-deeper link" rule as item 1.

---

## 6. Everything else that must change

Most of the risk in this migration is here, not in moving the folders. Work through this
list explicitly.

### A. `curriculum.js` — the one edit that drives the chrome

Reorder/move the section entries to match §4 exactly, renumber every `n`, and delete the
`stats-4` course object. The nav dropdowns, sidebar, homepage grid and counts, prev/next,
course rings, and landing-page lesson lists all follow automatically — do not hand-edit
any of them. Update the Stats 1–3 `subtitle` strings to reflect the new identities (§6-F
has the wording brief). Decide nothing else here; accents stay as they are (Stats 4's
steel blue `#3b82f6` simply retires — note that in CLAUDE.md's accent list, §6-I).

### B. Per moved lesson (24 of them)

`git mv` the folder, then edit in place:

- The `Section N.n` eyebrow (audit-enforced against the new curriculum).
- `data-course` on `<body>` (`data-section` stays — it's the slug).
- `<link rel="canonical">` and `og:url` → the new true URL (audit-enforced equal).
- The `[LearningResource, BreadcrumbList]` JSON-LD: the `url`, the breadcrumb trail, and
  `isPartOf`, which **must name the lesson's own course** (audit-enforced).
- `educationalLevel` — see §6-C.
- `og:image`/`twitter:image` — don't edit by hand; run `./tools/make-og-images.py` once the
  curriculum is final (it reads `curriculum.js`, regenerates the per-course cards, and
  retags every lesson's head; audit fails until each lesson points at its own course card).
  Delete the orphaned `assets/og-stats-4.png` afterwards. Retagging touches every lesson's
  mtime, so rerun `python3 tools/build-search-index.py` after it.
- Relative links *inside* the lesson that point at coursemates by `../../<course>/<slug>/`
  — the course half of those paths may now be wrong. Caught by the grep in §6-H.

The lesson's FAQ block is regenerated from `faq_data.py` — fix any moved paths **there**,
not in the baked HTML (rule 10).

### C. `educationalLevel` and `CORE_LEVELS` — decided, just execute it

`tools/audit.js` line ~213 hardcodes
`CORE_LEVELS = { 'stats-1': 'Beginner', 'stats-2': 'Intermediate', 'stats-3': 'Advanced', 'stats-4': 'Advanced', ml: 'Advanced' }`
and errors when a lesson's JSON-LD `educationalLevel` disagrees with its course. **The
decision is made: the mapping stays course-level** — stats-1 `Beginner`, stats-2
`Intermediate`, stats-3 `Advanced`; delete the `stats-4` key. Consequences to apply in the
lessons' JSON-LD: the eight ex-Stats-3 lessons arriving in Stats 2 change from `Advanced`
to `Intermediate`, the twelve ex-Stats-4 arrivals in Stats 3 stay `Advanced`, and
`effect-size-and-power` changes from `Beginner` to `Advanced`. Do not reopen this decision.
Also note `expectedLevel()` returns `null` for a core course missing from the map, which
silently *disables* the check — so a wrong edit here fails open. Verify your edit by
temporarily mis-setting one lesson's level and watching the audit catch it.

### D. Redirect stubs (25)

One per moved lesson at the old `<course>/<slug>/index.html`, plus one at
`stats-4/index.html`. Use exactly this shape (self-contained like `404.html`; **relative**
refresh/JS URLs so subpath hosting keeps working, absolute canonical; **no GA tag** — the
destination page fires the page view, a stub firing too would double-count; `noindex` keeps
it out of search):

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved — StatsCapybara</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="https://statscapybara.com/stats-3/bootstrap-and-resampling/">
<script>location.replace("../../stats-3/bootstrap-and-resampling/" + location.search + location.hash);</script>
<meta http-equiv="refresh" content="0; url=../../stats-3/bootstrap-and-resampling/">
</head>
<body>
<p>This lesson has moved to
<a href="../../stats-3/bootstrap-and-resampling/">statscapybara.com/stats-3/bootstrap-and-resampling/</a>.</p>
</body>
</html>
```

(The `stats-4/index.html` stub is one folder deep: `../stats-3/`.) Stubs go in **no**
registry: not `curriculum.js`, not `sitemap.xml`, not the search index, not `TOOLBOX` or
`SEARCH_PAGES`. They satisfy audit CHECK 3e (every publishing folder has an `index.html`)
and are otherwise unaudited — if any audit check unexpectedly complains about them, stop
and report rather than working around it. Test each stub locally with
`node tools/serve.js 8097` *and* under the subpath server.

### E. Shared-JS and data surfaces

- **`assets/js/glossary-data.js`** — every `{ s: "<course>/<slug>" }` back-link on a moved
  lesson's terms gets its course half updated.
- **`quiz.html`** — retag `BANK` entries: `c: "stats-4"` → `"stats-3"`, and the questions
  belonging to the eight stats-3→stats-2 and three stats-2→stats-1 movers likewise (match
  questions to lessons by content, not by guesswork). Update the `LEGACY` map
  (`s4: "stats-4"` must now resolve to `"stats-3"` — or eliminate remaining legacy tags and
  delete the map entry). Update the Quiz JSON-LD `about` list (9 courses → 8). **A question
  left tagged `stats-4` silently disappears from the course picker — that is the failure
  mode this bullet exists to prevent.** After the retag, count questions per course and
  confirm none vanished.
- **`site.js`** — remove the `stats-4/` entry from `SEARCH_PAGES` and update the Stats 1–3
  entries' titles/`kw` strings to the new course identities. Grep `site.js` for any other
  `stats-4` (QUIPS keys are slugs, so they survive; but check).
- **`checks.js` / `software.js` / `snippets.js` / `faq_data.py` / `QUIPS`** — keyed by slug,
  so the moves cost nothing *structurally*; but their answer/tip/comment **content** cites
  lessons by path and by "§N.n" — the greps in §6-H must cover these files too (rule 10).
- **Homepage `index.html`** — ItemList JSON-LD: delete the Stats 4 `Course`, update the
  three stats courses' names/descriptions/`N interactive lessons` counts (audit check 7
  enforces exact agreement with `curriculum.js`); update the hardcoded
  `97 hands-on lessons` in `og:description`/`twitter:description` when the totals change
  (audit check 6). The visible counts self-update.

### F. Course landing pages

- Rewrite the hand-written blurbs of `stats-1/index.html`, `stats-2/index.html`,
  `stats-3/index.html`: Stats 1 and Stats 2 now say plainly that they follow the UCG
  Statistics 1 (UCG1RM11) and Statistics 2 (UCG2RM03) syllabi; Stats 3 says it is the
  advanced/elective course. VOICE.md applies; `prose-lint --strict` covers these pages via
  its curriculum-derived `COURSE_PAGES` list (self-updating — nothing to register).
  Refresh each course's "Tools you'll use in this course" row to fit its new contents. The
  lesson list itself is rendered from `curriculum.js` — no edit.
- Retarget each page's `Course` JSON-LD (name, description, `educationalLevel`) to match
  the homepage ItemList entry — audit CHECK 3c and check 7 both bite here.
- `stats-4/index.html` becomes the stub from §6-D. `COURSE_PAGES` in both `audit.js` and
  `prose-lint.js` is derived from `CURRICULUM`, so deleting the course object deregisters
  the page automatically.

### G. `sitemap.xml`

Hand-maintained. Remove the 13 `stats-4/` URLs, rewrite the 24 moved lesson URLs to their
new paths, add the 5 new lessons when they land (135 → 139 by the end — recount yourself).
No stub URLs. Audit cross-checks sitemap coverage per ready lesson.

### H. Site-wide greps — the link rewrite

Grep the **entire repo** (HTML, `assets/js/*.js`, `tools/*.py`, `tools/*.js` — everything
except `.git` and the generated `search-index.js`, which gets rebuilt) for:

1. each of the 24 old lesson paths,
2. the string `stats-4` (80 files on 22 Aug 2026),
3. `§` and `Section [0-9]` references touching stats-course numbers (82 occurrences).

Rewrite every internal link to the new canonical path. **Never leave an internal link
pointing at a stub: `audit.js` cannot catch those** — its link check only proves the href
resolves on disk, and a stub resolves. The grep is the only net. Known surfaces from the
22 Aug scan: seven `stats-1` lessons, several `methods`/`data`/`writing`/`ethics` lessons
and guides, `datasets.html`, `teachers.html` (preset table + fourteen-week map),
`which-test.html`, `which-chart.html`, `plan.html`, `cheat-test-chooser.html`,
`cheat-assumptions.html`, `glossary-data.js`, `site.js`, `sitemap.xml`, plus the shared-JS
surfaces per §6-E.

**Watch for false positives:** `/correlation.html` at the root is a *tool page* and is not
the lesson `/stats-2/correlation/` → `/stats-1/correlation/`. Leave every root `*.html`
alone unless it genuinely links a lesson path. Same caution for any other tool whose name
collides with a lesson slug.

After the rewrite, run the editorial checkers as a second net — they exist for exactly
this: `node tools/link-promises.js`, `node tools/destination-promises.js`,
`node tools/prescription-terms.js`, `node tools/advice-terms.js`, plus
`node tools/search-reach.js` after the index rebuild. Each ships with a small `ACKED`
table that may itself reference moved paths — reconcile, and treat any *new* flag as a
real defect, not noise to acknowledge away.

### I. Development docs

Update `CLAUDE.md` where it states the old structure (course list and accents, "97
interactive lessons across 9 courses", the `CORE_LEVELS` description, the "Stats 4 steel
blue" accent note) and add a ROADMAP.md note recording this restructure. `AGENTS.md`
mirrors CLAUDE.md — keep them in step. These docs never ship (the Pages artifact excludes
them), but the next session reads them, and a stale CLAUDE.md is how the next session
breaks the site.

### J. Suggested phasing (each commit audit-green, stubs ride with their moves)

1. **P0** — discovery report, plan, approval. No edits.
2. **P1** — Stats 4 → Stats 3 merge: curriculum edit, 12 `git mv`s + in-page edits, 13
   stubs, `CORE_LEVELS`, quiz/glossary retags, sitemap, homepage JSON-LD, landing pages.
3. **P2** — Stats 3 → Stats 2 (8 moves), same treatment.
4. **P3** — Stats 2 → Stats 1 (3 moves) + `effect-size-and-power` → Stats 3, same
   treatment; final within-course ordering + eyebrow renumbering for all three courses.
5. **P4** — the §6-H grep sweep: link rewrites and §-reference reconciliation, then
   regenerations in order (`inject-faqs.py` → `make-og-images.py` → `build-search-index.py`)
   and the editorial-checker pass.
6. **P5+** — one commit per new lesson (§5), updating counts/sitemap/index each time.
7. **P-final** — `CACHE_VERSION` bump, dev docs, full §8 verification, then (and only
   then) `main`.

If P1–P3 prove impossible to keep individually audit-green (e.g. a cross-course § reference
momentarily wrong), collapsing them into one commit is acceptable; a red commit in history
is not.

---

## 7. The two syllabi, for verification

Use these to check your own placement decisions. Both courses use Moore, McCabe & Craig,
*Introduction to the Practice of Statistics*, 10th ed., and SPSS 29.

### Statistics 1 — UCG1RM11, 5 ECTS, block 1. Moore chapters 1–9.

| Week | Topic | Chapters |
|---|---|---|
| 1 | Introduction and looking at data; producing data | 1, 3 |
| 2 | Probability: the study of randomness | 4, 5.3 (pp. 312–315) |
| 3 | Sampling distributions; introduction to inference I | 5.1, 5.2, 5.3; 6.1, 6.2 |
| 4 | Introduction to inference II | 6.3, 6.4 |
| 5 | Inference for means | 7 |
| 6 | Inference for proportions; inference for categorical data | 8, 5.3; 9 |
| 7 | Relationships: correlation and regression | 2 |

Also covered: SPSS across five seminars; descriptive statistics; density curves and the
normal distribution; the 68-95-99.7 rule and z-scores; type I and II errors and power as
*concepts* within ch. 6.4 — but **not** effect size, which is why `effect-size-and-power`
moves to Stats 3.

### Statistics 2 — UCG2RM03, 5 ECTS, block 2. Moore chapters 10–14 plus two open chapters.

Scope, from the course description: relationships between variables — a continuous
dependent variable against one or more categorical variables (analysis of variance), then
regression against continuous and/or categorical predictors, plus non-parametric methods
and logistic regression. Estimation and inference for each method.

| Week | Topic | Reading |
|---|---|---|
| 1 | Non-parametric statistics; one-way ANOVA | open chapter; ch. 12 |
| 2 | One-way ANOVA; factorial ANOVA | ch. 13 |
| 3 | Factorial ANOVA; repeated measures ANOVA | open chapter |
| 4 | Repeated measures ANOVA; inference for regression | — |
| 5 | Inference for regression; multivariate regression | ch. 10 |
| 6–7 | Multivariate regression | ch. 11 |
| 8 | Logistic regression and non-linearities | ch. 14 |

The group research project additionally requires: checking normality and outliers,
descriptive analysis, an ANOVA with at least three conditions, a multivariate regression
with control variables, model interpretation, and reporting.

---

## 8. Verification before you call this done

The repo's own gates, all green:

- [ ] `node tools/audit.js` — 0 errors (this alone proves: eyebrows vs curriculum,
      canonical = og:url = true URL, JSON-LD `isPartOf`/`educationalLevel`, og:image per
      course, internal links + `#fragment`s resolve, sitemap and search-index coverage,
      homepage counts and ItemList, CHECK 3c/3d/3e, every publishing folder has an index).
- [ ] `node tools/prose-lint.js --strict` — green (red = a regression you wrote).
- [ ] `node tools/math-check.js` — green (mandatory if `viz.js` or tool math was touched;
      cheap enough to run regardless).
- [ ] The editorial checkers show no new flags: `link-promises`, `destination-promises`,
      `prescription-terms`, `advice-terms`, `widget-terms`, `search-reach`,
      `untaught-names`, `worked-examples`, `faq-audit --strict`.
- [ ] `node tools/make-pages-artifact.js _site` assembles clean; browse `_site` via
      `node tools/serve.js 8097 _site` and click through a moved lesson, a stub, and a new
      lesson. Repeat under the subpath server (`node tools/serve.js 8088 ..`) to prove the
      stubs' relative redirects survive subpath hosting.

And the migration-specific checks:

- [ ] All 25 old URLs land on their stub and arrive at the correct new page in **one** hop
      — no chains, no loops, no 404s. A stubbed old URL with `?embed=1&<preset>` still
      reaches the new page with its query intact.
- [ ] `grep -r stats-4` (excluding `.git`, `search-index.js`, the stubs themselves, and
      the dev docs' history notes) returns nothing. `sitemap.xml` contains no `stats-4/`
      path and no stub.
- [ ] Each of `/stats-1/`, `/stats-2/`, `/stats-3/` lists exactly the §4 lessons in §4
      order (rendered from `curriculum.js`), and spot-checked eyebrows/prev-next agree.
- [ ] Zero internal links to any old path anywhere in the repo — grep, don't assume; the
      audit cannot see a link that resolves to a stub.
- [ ] Every "§N.n" reference in prose, posters, problems, and shared-JS strings names the
      *new* number of the lesson it means.
- [ ] Homepage: visible counts read 8 courses / 52 lessons (self-computed); the hardcoded
      og/twitter description count and the ItemList agree (audit checks 6–7).
- [ ] `/correlation.html` and every other root tool page still exists, untouched.
- [ ] The 5 new pages pass every per-lesson audit check and are fully integrated (checks,
      FAQs, quip, glossary, quiz, snippet, software where applicable, sitemap, search
      index, og:image).
- [ ] Quiz: per-course question counts before vs after — nothing silently vanished;
      exam-mode scope picker shows 8 courses. Flashcards and glossary spot-checked.
- [ ] `sc-progress` sanity: visit a moved lesson locally, confirm the tick appears in its
      new course (slug-keyed, so it should require nothing — verify anyway).
- [ ] `CACHE_VERSION` bumped once, in the final state.

Report at the end: files changed, stubs added, links rewritten, §-references reconciled,
confirmation that the §6-C `educationalLevel` policy was applied as written, anything in
§4 that didn't match reality, and the `assumptions-*` naming question from §4.

---

## 9. Optional, only if the above is complete and verified

Two week-map pages, one per UCG course, mapping each teaching week to the relevant lessons
using the tables in §7 — one link a student on the course can keep open all block. **The
page class is decided: build them as guides**, because a page under a course folder would
have no page class and would ship unaudited. That means the URLs are
`guides/ucg-statistics-1/` and `guides/ucg-statistics-2/` (not `/stats-1/ucg/`), following
the guide pattern to the letter: `data-guide` marker, `article.lesson` with a `Guide`
eyebrow and a hand-written static `nav.lesson-toc`, `[Article, BreadcrumbList]` JSON-LD
with the breadcrumb's "Guides" level pointing at `guides/`, and **all 7 registrations**
(`TOOLBOX` group `"read"`, `SEARCH_PAGES` tag "Guide", a `QUIPS` key, the guides list in
`tools/build-search-index.py` + rerun, `sitemap.xml`, `GUIDES` in `tools/audit.js`, and
`GUIDES` in `tools/prose-lint.js` — the last one nothing enforces, so do it in the same
commit). Add them to the static card list on the `guides/` hub page, and link each one
prominently from its course's landing page ("Taking UCG1RM11? Here's your week-by-week
map"), so students reach it from the course front door. VOICE.md applies; the week tables
render as `.ref-table`s inside `.hscroll` so they print and scroll cleanly. Content still
gets a quick proposal before building (which lessons land in which week — some weeks span
several); the structure does not.
