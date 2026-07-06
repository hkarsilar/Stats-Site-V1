# StatsCapybara — Powerhouse Roadmap

**Vision:** the site every statistics student gets sent to — and actually enjoys. Not just "learn a t-test," but the *entire journey of a research student*: design the study → collect and clean the data → run the right analysis → report it properly → do it all ethically. Every step interactive, correct, free, and calm.

This file is the master plan. The copy-paste prompts that execute it live in **[PROMPTS.md](PROMPTS.md)** — run them one per Claude Code session, roughly in the recommended order below. Both files live at the repo root, committed alongside CLAUDE.md, so they sync to every machine via GitHub Desktop.

---

## End state

| | Today | Powerhouse |
|---|---|---|
| Courses | 4 (Stats 1–4) | **9** in two tracks |
| Lessons | 45 | **~95** |
| Tool pages | 8 | **~14** |
| Long-form guides | 0 | 4 cornerstone guides |
| Personas served | "stats course student" | + thesis writer, data cleaner, ML-curious, first-time researcher |

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

- [x] P1 · audit.js
- [x] P2 · multi-track platform
- [x] P3 · power calculator
- [x] P4 · Methods 1–3 (+ scaffold)
- [x] P5 · Methods 4–6
- [x] P6 · Methods 7–9
- [x] P7 · Methods 10–12
- [x] P8 · Data 1–3 (+ scaffold)
- [x] P9 · Data 4–6
- [ ] P10 · Data 7–10
- [ ] P11 · Ethics 1–3 (+ scaffold)
- [ ] P12 · Ethics 4–6
- [ ] P13 · Ethics 7–8
- [ ] P14 · ML 1–3 (+ scaffold)
- [ ] P15 · ML 4–6
- [ ] P16 · ML 7–9
- [ ] P17 · ML 10–12
- [ ] P18 · Writing 1–3 (+ scaffold)
- [ ] P19 · Writing 4–6
- [ ] P20 · Writing 7–8
- [ ] P21 · APA formatter tool
- [ ] P22 · practice datasets library
- [ ] P23 · glossary flashcards
- [ ] P24 · which-chart tool
- [ ] P25 · analysis planner wizard
- [ ] P26 · correlation explorer
- [ ] P27 · progress dashboard + certificates
- [ ] P28 · accessibility pass
- [ ] P29 · performance pass
- [ ] P30 · print handouts
- [ ] P31 · per-course OG images
- [ ] P32 · homepage v2
- [ ] P33 · offline PWA
- [ ] P34 · cornerstone guides
- [ ] P35 · cheat-sheet posters
- [ ] P36 · structured-data upgrade
- [ ] P37 · GSC feedback loop (recurring)
- [ ] P38 · quarterly health audit (recurring)
- [ ] P39 · content refresh loop (recurring)
