# StatsCapybara — Powerhouse Roadmap

**Vision:** the site every statistics student gets sent to — and actually enjoys. Not just "learn a t-test," but the *entire journey of a research student*: design the study → collect and clean the data → run the right analysis → report it properly → do it all ethically. Every step interactive, correct, free, and calm.

This file is the master plan. The copy-paste prompts that execute it live in **[PROMPTS.md](PROMPTS.md)** — run them one per Claude Code session, roughly in the recommended order below. Both files live at the repo root, committed alongside CLAUDE.md, so they sync to every machine via GitHub Desktop.

---

## End state

| | At kickoff | Now (Jul 2026, post-P27) | Powerhouse |
|---|---|---|---|
| Courses | 4 (Stats 1–4) | 9 (Methods, Data, Ethics, ML, Writing all complete) | **9** in two tracks |
| Lessons | 45 | 95 | **~95** |
| Tool pages | 8 | 16 (+ power calc, APA formatter, datasets, flashcards, which-chart, planner, correlation, progress dashboard) | **~16** |
| Long-form guides | 0 | 0 | 4 cornerstone guides |
| Personas served | "stats course student" | + first-time researcher, data cleaner, ML-curious | + thesis writer |

**Two tracks on the homepage:**

- **The Statistics Core** — Stats 1–4 (exists, complete).
- **The Research Toolkit** (new) — everything around the statistics:
  - **Methods** · *Research Design* — 12 lessons (questions → designs → sampling → replication crisis)
  - **Data** · *From Raw to Ready* — 10 lessons (tidy data → cleaning → reshaping → privacy)
  - **Ethics** · *Responsible Research* — 8 lessons (consent → QRPs → AI ethics → fraud & self-correction)
  - **ML & AI** · *Machine Learning for Researchers* — 12 lessons (train/test → trees → clustering → LLMs)
  - **Writing** · *Reporting Your Research* — 8 lessons (IMRaD → APA numbers → figures → discussion)

**Suggested course accents** (verify visually in both themes before committing; violet `#8b5cf6` stays reserved for the checks block, orange `#f97316` for highlights): Methods amber `#f59e0b` · Data cyan `#06b6d4` · Ethics slate `#64748b` · ML purple `#a855f7` (shift toward fuchsia `#d946ef` if it reads too close to Stats-1 indigo) · Writing lime `#84cc16`.

---

## Guiding principles (non-negotiable)

1. **No build step, no frameworks, no external dependencies.** Plain HTML/CSS/JS + the two generated/injected assets (`search-index.js`, FAQ blocks). Everything in CLAUDE.md stays true.
2. **Statistics must be exact.** Every quantitative claim in prose, FAQ, or interactive is verified against published values (G*Power, tables, `node -e` cross-checks) before it ships.
3. **Frozen-noise interactives.** Sliders transform the *same* data; only explicit "New sample" buttons reseed. Round-trip test every slider.
4. **Calm, kind, capybara-tasteful.** No ads, ever — Ko-fi in the footer only. No dark patterns, no imposed quizzes, no red-alert UI. Serious topics (ethics history) get a serious tone.
5. **Each lesson stands alone** and is fully integrated: curriculum entry, checks, FAQs, quip, glossary, quiz question, snippet/software where applicable, sitemap, search index, per-page SEO.
6. **One prompt = one session = one reviewable diff.** Leave the working tree uncommitted; Hakan reviews and pushes via GitHub Desktop.

---

## Phases & prompts

| Phase | Prompts | What it delivers |
|---|---|---|
| **0 — Platform enablers** | P1–P3 | `tools/audit.js` health check · multi-track curriculum support · power & sample-size calculator |
| **1 — Methods course** | P4–P7 | 12 lessons, Research Design |
| **2 — Data course** | P8–P10 | 10 lessons, From Raw to Ready |
| **3 — Ethics course** | P11–P13 | 8 lessons, Responsible Research |
| **4 — ML & AI course** | P14–P17 | 12 lessons, ML for Researchers |
| **5 — Writing course** | P18–P20 | 8 lessons, Reporting Your Research |
| **6 — Tools expansion** | P21–P26 | APA formatter · practice datasets · flashcards · chart chooser · analysis planner · correlation explorer |
| **7 — UX & platform** | P27–P33 | progress dashboard + certificates · accessibility · performance · print handouts · per-course OG images · homepage v2 · offline PWA |
| **8 — Growth & SEO** | P34–P37 | cornerstone guides · printable cheat sheets · schema upgrade · Search-Console feedback loop |
| **9 — Maintenance loops** | P38–P39 | quarterly health audit · content refresh (recurring) |

**Recommended order** (content and tools interleaved so the site visibly improves every week):

> P1 → P2 → P3 → **Methods** P4–P7 → P21 (APA formatter) → **Writing** P18–P20 → P22 (datasets) → P25 (analysis planner) → **Data** P8–P10 → **Ethics** P11–P13 → **ML** P14–P17 → P23, P24, P26 → P27–P31 → P32 (homepage v2 — after several new courses exist) → P33 → P34–P36 → P37–P39 as recurring loops.

Hard dependencies: **P2 before any new course** (P4+). **P32 after at least two new courses.** Everything else can be cherry-picked.

---

## The human-only checklist (no AI can do these)

- [ ] **Google Search Console** — verify statscapybara.com, submit `sitemap.xml`, check weekly. Do this first; it feeds P36/P37.
- [ ] **Bing Webmaster Tools** — same, 10 minutes.
- [ ] **Backlinks** — ask colleagues to link it from course pages/syllabi (.edu links are gold); submit to **MERLOT** and **OER Commons**; answer real questions on r/AskStatistics, r/statistics, Cross Validated with links to the *specific* interactive lesson.
- [ ] **One big launch post** when the Research Toolkit track is live — r/InternetIsBeautiful, Hacker News (Show HN), relevant teaching newsletters.
- [ ] **Tell your students** — real usage + feedback beats everything above.
- [ ] Skim GA4/GSC monthly; paste interesting query data into prompt P37.

---

## Status tracker

Tick these as sessions complete them (each prompt ends by updating this list).

> **Where things stand (10 Jul 2026):** 30 of 36 one-shot prompts done. Phase 0 complete; **all five toolkit courses (Methods, Data, Ethics, ML & AI, Writing) are complete** — the Writing course finished with 5.7 abstracts & titles and 5.8 the final checklist (accent lime `#84cc16`). Phase 6 tools underway: **P21 shipped `apa.html`, the APA Results Formatter** (t / ANOVA / χ² / correlation / regression → correct APA 7 sentence with a statcheck-style consistency check; also adds a BASE-aware "Format your own numbers →" link at the foot of every injected APA block), and **P22 shipped `datasets.html`, the Practice Datasets library** — 8 seeded, reproducible CSVs in `assets/data/` (t-test, one-way ANOVA, correlation+outlier, 2×2 factorial, Likert/reliability, messy-cleaning, wide/RM, logistic) generated by the committed `tools/make-datasets.py` (master seed `20260709`, byte-identical on rerun), each with a story, variable table, 3 lesson-linked exercises and a worked solution whose numbers are computed from the shipped file; cross-linked from `descriptives.html`. **P23 shipped `flashcards.html`, Glossary Flashcards** — a 3-box Leitner spaced-repetition tool (`sc-cards` localStorage) over the glossary, with a flip card, Again/Good/Easy rating (1/2/3 keys), a course filter, box tallies + due count, and a reset; the same session also **refactored the glossary term array out of `glossary.html` into `assets/js/glossary-data.js` (`window.GLOSSARY`)** as the single source of truth both the glossary and flashcards read (identical glossary output; `build-search-index.py` updated to read the new file). **P24 shipped `which-chart.html`, the "Which Chart Should I Use?" chooser** — the visualization sibling of `which-test.html` reusing its `wt-*` decision-tree pattern (breadcrumbs, step counter, Back, start-over): a distribution/comparison/relationship/composition/change-over-time × data-type tree with 11 leaves (histogram, box plot(s), bar, horizontal bar, grouped/stacked bar, scatter, scatter+trend, line, heatmap/mosaic, resist-the-pie, table), each with a live theme-aware canvas thumbnail (`VIZ.fit`/`VIZ.onTheme` + `ResizeObserver`), when-to-use text, the classic mistake, a "consider instead" nudge, and Learn-more links to `stats-1/visualizing-data` + `writing/tables-and-figures`, plus a goal × data-type cheat-sheet table. **P25 shipped `plan.html`, the "Plan My Analysis" wizard** — which-test's grown-up sibling (same `wt-*` decision tree) that ends in a **printable analysis plan**: recommended test + why, assumptions-to-check with links, a **live sample-size** at 80% power / α = .05 from the *exact noncentral math copied from `power.html`* (verified d=0.5 two-sample → 64/group, r=.3 → 84, f=.25/k=3 → 159, χ² w=.3/df=1 → 88), an effect-size control (Cohen presets + a "no idea?" note), an APA write-up skeleton, and four deep links (lesson · its `#run-it` SPSS/JASP anchor · an `apa.html?a=&v=` preset · a prefilled `power.html?sc=&es=`); print CSS renders just the plan card with a capybara header + URL footer, and `?test=<slug>&d=/r=/f=/w=/es=&k=&df=` query-params let lessons deep-link a scenario. Enabling edits: `site.js` gives the injected SPSS/JASP box `id="run-it"` (+ async hash-scroll); `apa.html` accepts `?a=`/`?v=`, `power.html` accepts `?sc=`/`?es=`; "plan your analysis →" cross-links added to `which-test.html` and `power.html`. P20 added the **"thesis pathway"** cross-link block to `toolbox.html` (Methods → Data → Stats → Power → Writing → Ethics). **P26 shipped `correlation.html`, the "Correlation & Regression Calculator"** — a paste-two-columns companion to `descriptives.html` (same decimal-comma/header-tolerant parsing, also accepts a two-column block pasted into the X box): a hi-DPI, theme-aware scatterplot with the least-squares line + equation, Pearson *r* with its two-tailed *t*-test *p* and **Fisher-z 95% CI** (verified r=.5, n=30 → [.17, .73]), tie-corrected **Spearman ρ**, R², the slope with SE/*t*/95% CI, a residual mini-plot, and a **leave-one-out robustness readout** (r range across all single deletions + the most-influential point named, click any scatter point to see *r* without it — the culprit auto-highlights in orange). Two copy-ready APA sentences (correlation + regression slope) and a built-in **Anscombe's quartet** panel (four mini-canvases, identical r≈.82 / ŷ = 3.00 + 0.50x, click to load — verified) drive home "always look at your data." Cross-linked both ways with `stats-2/correlation` and `stats-2/simple-linear-regression`, and from `descriptives.html`. **P27 shipped `progress.html`, the "My Progress" dashboard** — a `noindex` personal-state page that reads the existing `sc-progress`/`sc-checks`/`sc-last` (+ `sc-cards`) localStorage to draw per-course completion rings (reusing a new `window.SC = { ring, capy }` export from `site.js`, so the ring/mascot drawing isn't duplicated), overall done/remaining totals, a Continue-where-you-left-off button, per-course best-check scores, a flashcards summary, and an honest empty state for new visitors — plus a per-course **certificate** unlocked at 100% completion (canvas, parchment A4-landscape, course-accent double border, the `capy()` mascot ported to canvas, typed name persisted in a new **`sc-name`** key, date + `statscapybara.com`; drawn at 2× for a crisp PNG download and a print path that shows only the certificate). A "My progress →" link sits beside the homepage resume banner; the page is registered in `TOOLBOX` (group `practice`), `SEARCH_PAGES`, the `build-search-index.py` page list, and `audit.js`'s `ROOT_PAGES` — but deliberately kept **out of `sitemap.xml`** (a noindexed URL doesn't belong in a sitemap). The site now has **9 courses / 95 lessons / 16 tools**, audit passing clean. (5.4–5.8 are conceptual writing lessons — no software.js/snippets entries, warn-only in the audit; the static homepage lesson count is 95.) **All course content (Phases 1–5) and all of Phase 6 — Tools expansion (P21–P26) are done; Phase 7 — UX & platform polish is now underway.** **P28 delivered the accessibility pass (WCAG 2.1 AA), almost entirely in the shared layer:** `site.js`'s `injectA11y()` now also makes every `.stat-row` an `aria-live="polite"` region (slider readouts announce), derives an `aria-label` for every `.control` slider/select from its visible `<label>` (the markup never wired `for`/`aria-label`), and builds richer canvas `aria-label`s from `.viz-title` + `.viz-sub`; the **search overlay became a focus-trapped `aria-modal` dialog** that restores focus to its opener and closes on Escape (Escape now also closes the mobile menu, returning focus to the hamburger); toggle `.seg`s got `aria-pressed`. **Contrast:** `--text-faint` was retuned per-theme to clear 4.5:1 on every surface (light `#5f6e86`, dark `#94a3b8` — the old values were ~2.5–3.9:1); mobile nav tap targets are now ≥44×44px. **Motion:** added `VIZ.reducedMotion()` + `site.js` `scrollBehavior()` so JS scrolls/animations can honour `prefers-reduced-motion` (CSS already neutralises transitions). **Keyboard:** the one genuinely drag-only viz (`stats-3/assumptions-of-regression`) and the 3-D rotate in `ml/dimensionality-reduction` are now focusable with **arrow-key control**, and `wireLessonKeys` no longer hijacks `←/→` while a canvas/field is focused; `quiz.html`'s answer feedback is a live region. An **honest accessibility statement** was added to the About section, and the a11y conventions are documented in CLAUDE.md. Audit passing clean. **P29 was a measured performance pass (before → after, worst-case mobile 721 px width):** the big find was **lesson CLS ≈ 1.03 → ≤ 0.08** (homepage & tool pages were already 0). Root causes fixed in the shared layer: (1) the JS-injected mobile sidebar rendered *above* the article and shoved all content down ~800 px — fixed with `order` so the article comes first and the sidebar fills in below (CSS-only, also better mobile UX); (2) canvases (fixed-height/fluid-width, sized late by `VIZ.fit`) painted at the 2:1 intrinsic default then shrank — fixed with `.viz canvas { aspect-ratio: var(--viz-ar, 3/1) }` reserving a near-final box (per-instance `--viz-ar` override available; the two 330–340 px canvases needed none); (3) the Inter font-swap reflow — fixed with a metric-matched `@font-face "Inter Fallback"` (local Arial + ascent/descent/size-adjust overrides) first in the `--font` stack, so the swap causes no reflow. Also: **`VIZ.fit` (and the 6 pre-VIZ local `fit()` copies) now cap `devicePixelRatio` at 2** (quadratic backing-store savings on 3× screens, no visible loss); a new **`VIZ.rafThrottle`** coalesces the `resize` + `ResizeObserver` double-redraw, wired into the canvas tool pages (`tables`/`power`/`distributions`/`effect-sizes`/`descriptives`/`correlation`); confirmed `search-index.js` stays lazy and GA stays async; **no build step added.** Conventions documented in CLAUDE.md; audit passing clean; `search-index.js` rebuilt byte-identical. **P30 shipped print handouts — every lesson now prints as a clean, professor-ready sheet, entirely from the shared layer:** one comprehensive `@media print` block in `styles.css` + `site.js`'s new `setupPrint()`. **Kept in print:** prose, callouts, formulas, the frozen `.viz` canvas + readouts, and the reference blocks (APA write-up, R/Python snippet). **Hidden:** all chrome (nav/sidebar/footer/Ko-fi/search/resume), the sidebar capybara **quip** (so Ethics lessons print with their serious tone intact — the consistent decision), the viz **controls** (sliders/buttons/`.seg` + the R/Python language toggle), and the two interactive injected blocks (`.checks` + the SPSS/JASP `.software` tabs). The print block also **redefines the surface/text/border/shadow CSS vars to a light palette for both `:root` and `html[data-theme="dark"]`**, fixing a latent bug where a dark-mode reader printed dark cards. `setupPrint()` (lesson pages) injects a **"Print this lesson"** button beside mark-complete (`.print-btn`, hidden in print) + a discreet fixed **`.print-footer`** with the page's clean canonical URL per sheet, and on **`beforeprint`** force-opens the FAQ `<details>` (skipping the hidden `.checks`) and **snapshots each `.viz canvas` → `<img>`** (some browsers print `<canvas>` blank), reverting both on `afterprint` (double-fire-guarded, with a `matchMedia('print')` fallback for Safari). `formulas.html` inherits the block (kept its own print button); `glossary.html` got a matching print button. Verified via CSSOM `media.mediaText` flip + `beforeprint` dispatch + screenshot (preview has no native print emulation) on a rich lesson, an APA/software lesson, and dark mode; audit passing clean. Next up: P31 — per-course OG images.

- [x] P1 · audit.js
- [x] P2 · multi-track platform
- [x] P3 · power calculator
- [x] P4 · Methods 1–3 (+ scaffold)
- [x] P5 · Methods 4–6
- [x] P6 · Methods 7–9
- [x] P7 · Methods 10–12
- [x] P8 · Data 1–3 (+ scaffold)
- [x] P9 · Data 4–6
- [x] P10 · Data 7–10
- [x] P11 · Ethics 1–3 (+ scaffold)
- [x] P12 · Ethics 4–6
- [x] P13 · Ethics 7–8
- [x] P14 · ML 1–3 (+ scaffold)
- [x] P15 · ML 4–6
- [x] P16 · ML 7–9
- [x] P17 · ML 10–12
- [x] P18 · Writing 1–3 (+ scaffold)
- [x] P19 · Writing 4–6
- [x] P20 · Writing 7–8
- [x] P21 · APA formatter tool
- [x] P22 · practice datasets library
- [x] P23 · glossary flashcards
- [x] P24 · which-chart tool
- [x] P25 · analysis planner wizard
- [x] P26 · correlation explorer
- [x] P27 · progress dashboard + certificates
- [x] P28 · accessibility pass
- [x] P29 · performance pass
- [x] P30 · print handouts
- [ ] P31 · per-course OG images
- [ ] P32 · homepage v2
- [ ] P33 · offline PWA
- [ ] P34 · cornerstone guides
- [ ] P35 · cheat-sheet posters
- [ ] P36 · structured-data upgrade
- [ ] P37 · GSC feedback loop (recurring)
- [ ] P38 · quarterly health audit (recurring)
- [ ] P39 · content refresh loop (recurring)
