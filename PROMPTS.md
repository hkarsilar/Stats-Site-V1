# StatsCapybara — Prompt Library

Copy one prompt per Claude Code session (started in the repo root, in the `Stats-Site-V1` folder), paste it verbatim, review the diff, push via GitHub Desktop. The plan behind these prompts is in [ROADMAP.md](ROADMAP.md). CLAUDE.md is loaded automatically in every session — prompts lean on its checklists instead of repeating them.

**Conventions baked into every prompt below:**

- *"Standard lesson integration"* = CLAUDE.md's "Adding a lesson" checklist, in full: `curriculum.js` entry (`ready: true`) · page copied from an existing lesson with **all per-page SEO retargeted** (title, description, canonical, og/twitter, JSON-LD) · correct `data-course`/`data-section` + hardcoded `Section N.n` eyebrow · inline viz using `VIZ` helpers with the **frozen-noise pattern** · 3 questions in `checks.js` · 3 FAQs in `tools/faq_data.py` + run `python tools/inject-faqs.py` · a `QUIPS` entry · glossary term(s) · course-tagged quiz question(s) · R/Python snippet if analysis-relevant · SPSS/JASP + APA entry in `software.js` if a runnable analysis · `sitemap.xml` · rerun `python tools/build-search-index.py` · update homepage/meta lesson counts if not yet automated.
- *"Standard verification"* = `node tools/audit.js` passes clean · `node --check` on new/changed scripts · every numeric claim cross-checked against a published value (`node -e` with `VIZ`, G*Power tables, textbook values) · slider round-trip test on every interactive · browser-verify via the preview tooling in light + dark + mobile with zero console errors · leave the working tree **uncommitted** for review.
- Every prompt ends with ticking its checkbox in `ROADMAP.md`'s status tracker.

---

## Phase 0 — Platform enablers

### P1 — Site health audit script

```
StatsCapybara roadmap prompt P1 (see ROADMAP.md).

Create tools/audit.js — a zero-dependency Node script that is the site's permanent health check, and wire it into the workflow docs.

It must verify, across every page:
1. Coverage: every CURRICULUM_FLAT slug has entries in CHECKS (exactly 3 well-formed questions × 4 options), tools/faq_data.py (exactly 3 Q&As), QUIPS, SNIPPETS (warn-only), SOFTWARE (info-only), and appears in sitemap.xml; no stale/orphan keys anywhere.
2. Per-lesson HTML: exactly one GA tag (two G-80HCM6EZVN refs), canonical + og:url matching the lesson's true URL, og:type article, LearningResource + BreadcrumbList + FAQPage JSON-LD all present and JSON-parseable, data-course/data-section correct, "Section N.n" eyebrow matching curriculum.js, meta description present and 50–160 chars.
3. Root/tool pages: GA tag, canonical, meta description, OG tags present; 404.html has GA only.
4. All internal href/src links resolve on disk (including FAQ links and ../../ paths); no leading-slash absolute paths.
5. Search index freshness: assets/js/search-index.js mtime newer than every lesson HTML; every slug present in it.
6. Homepage counts: the course/lesson totals stated in index.html (hero, og/twitter descriptions, JSON-LD) match curriculum.js reality.
7. Exit code 0 only when no errors (warnings allowed).

Then: document "node tools/audit.js" in CLAUDE.md's Commands section as a required pre-commit step, and run it — fix anything it finds. Standard verification applies. Tick P1 in ROADMAP.md.
```

### P2 — Multi-track curriculum platform

```
StatsCapybara roadmap prompt P2 (see ROADMAP.md). Run node tools/audit.js first; fix any failures before starting.

Prepare the platform for 5 upcoming non-"stats-N" courses (methods, data, ethics, ml, writing) organized in two tracks, WITHOUT changing any visible content yet:

1. curriculum.js: add an optional track field per course ("core" | "toolkit"); Stats 1–4 = "core". Keep CURRICULUM_FLAT's shape backward-compatible.
2. Homepage curriculum grid: when more than one track exists, render a track heading above each group ("The Statistics Core", "The Research Toolkit") — with a single track, render exactly as today (zero visual diff; verify by screenshot before/after).
3. Grep the whole site for hardcoded stats-\d assumptions (site.js sidebar/prev-next/progress, quiz.html course picker + BANK "s1".."s4" tags, glossary link builder, which-test.html, tools/inject-faqs.py, tools/build-search-index.py, audit.js) and generalize them to arbitrary course slugs. Quiz BANK: migrate tags to course slugs with back-compat mapping so existing questions keep working.
4. Automate visible lesson/course counts: homepage hero (and any other visible-text counts) computed from CURRICULUM at runtime; hardcoded meta/OG/JSON-LD counts stay static but are enforced by audit.js check #6 so they can't silently drift.
5. Progress rings/localStorage: confirm sc-progress keys are slug-based and course-agnostic; fix anything that assumes 4 courses (e.g. homepage ring layout with 9 courses — make the grid wrap gracefully; mock a temporary 5th course locally to test, then remove it).
6. Update CLAUDE.md: document tracks, the generalized quiz tags, and the "adding a COURSE" procedure (accent choice rules — violet #8b5cf6 reserved for checks, orange #f97316 for highlights; update sitemap, counts, quiz picker, CLAUDE.md accent list).

Standard verification; also test on the subpath server (localhost:8088/Stats-Site-V1/). Tick P2 in ROADMAP.md.
```

### P3 — Power & sample-size calculator

```
StatsCapybara roadmap prompt P3 (see ROADMAP.md). Run node tools/audit.js first.

Build power.html — "Power & Sample Size Calculator", the most-searched tool a stats student needs. Follow the existing tool-page pattern (tables.html / effect-sizes.html are good models: root-level page, VIZ math, canvas, ResizeObserver + window resize, no dependencies).

Scope — solve any one of {power, n, effect size} given the others, for:
1. One-sample / paired t (Cohen's d / dz), two-tailed and one-tailed
2. Independent two-sample t (equal n per group)
3. Pearson correlation (r)
4. One-way ANOVA, k groups (Cohen's f)
5. Chi-square goodness-of-fit / independence (Cohen's w, df)
6. Two independent proportions (p1 vs p2, normal approximation — label it as approximate)

Math requirements: exact noncentral distributions, not normal shortcuts (except #6). Implement noncentral t CDF (Lenth/AS 243 approach), noncentral chi-square CDF (series of central chi-square terms), noncentral F via the chi-square series. Add them to viz.js as VIZ.nctCdf, VIZ.ncx2Cdf, VIZ.ncfCdf with comments, so lessons can reuse them.

Verify (hard gate — put these as assertions in a comment block and check with node -e): two-tailed α=.05, power=.80 → d=0.5 two-sample: n=64/group; d=0.2: n=394/group; d=0.8: n=26/group; one-sample/paired d=0.5: n=34; r=.3: n=84; ANOVA f=0.25, k=4: N=180 total; chi-square w=0.3, df=1: N=88. Match G*Power within ±1.

UI: scenario picker → sliders/inputs → big readout (n or power) + a canvas power curve (power vs n, marker at target) + a plain-English sentence ("To detect d = 0.5 with 80% power at α = .05, you need 64 people per group"). Link the two power lessons; cross-link FROM stats-1/effect-size-and-power and stats-3/power-analysis-for-complex-designs prose to this tool.

Integrate as a tool page per CLAUDE.md: TOOLBOX (group "calc"), SEARCH_PAGES, tools/build-search-index.py page list + rerun, sitemap.xml, QUIPS, full per-page SEO. Standard verification. Tick P3 in ROADMAP.md.
```

---

## Phase 1 — Methods course (*Research Design*, slug `methods`, 12 lessons, track "toolkit", accent amber #f59e0b)

### P4 — Course scaffold + Methods lessons 1–3

```
StatsCapybara roadmap prompt P4 (see ROADMAP.md). Requires P2. Run node tools/audit.js first.

Create the Methods course ("Methods — Research Design", track "toolkit", accent amber #f59e0b — verify it's distinct from every existing accent in light AND dark mode) following CLAUDE.md's adding-a-COURSE procedure, then build lessons 1–3 with standard lesson integration each:

1.1 from-question-to-hypothesis — "From Question to Hypothesis". Research question → conceptual hypothesis → testable prediction; falsifiability; directional vs non-directional; where H0/H1 come from (link stats-1/hypothesis-testing-logic). Viz: a "hypothesis machine" — pick a vague claim ("music helps studying"), walk it through interactive refinement steps (population? IV? DV? direction?) until it's a testable prediction; a falsifiability meter scores each refinement.

1.2 variables-and-operationalization — "Variables & Operationalization". IV/DV/confounds/controls; conceptual vs operational definitions; one construct, many operationalizations (stress = cortisol / self-report / HRV) and why it matters for validity. Viz: matching game — drag operational definitions onto constructs, with instant feedback on which are measurable/specific enough; a scenario labeler for IV/DV/confound.

1.3 reliability-and-validity — "Reliability & Validity". Reliability types (test-retest, internal consistency incl. Cronbach's α, inter-rater); validity types (construct, internal, external, face); reliable-but-invalid vs both. Viz: the classic dartboard (reliability = grouping, validity = on-target) with sliders for each, PLUS a mini Cronbach's α simulator: k items with adjustable inter-item correlation, α computed live from the Spearman-Brown/standardized-alpha formula (verify: k=10, r̄=.3 → α≈.81).

FAQ ideas (adapt freely): "What's the difference between a hypothesis and a prediction?", "Is a confounding variable the same as a control variable?", "What is a good Cronbach's alpha?" (.70 folk threshold + its criticisms).

Software entries: only 1.3 (Cronbach's α in SPSS Analyze > Scale > Reliability Analysis; JASP Reliability module) + R/Python snippet (psych::alpha / pingouin.cronbach_alpha). 1.1/1.2 are conceptual — no software entry.

Standard verification. Tick P4 in ROADMAP.md.
```

### P5 — Methods lessons 4–6

```
StatsCapybara roadmap prompt P5 (see ROADMAP.md). Requires P4. Run node tools/audit.js first.

Add Methods lessons 4–6 with standard lesson integration each:

1.4 experimental-design-and-randomization — "Experiments & Random Assignment". Why randomization is THE causal tool: it balances known AND unknown confounds in expectation; random assignment ≠ random sampling (internal vs external validity); control groups and placebo. Viz: a population of dots with 3 visible traits (age color, motivation size, etc.); one button self-selects groups (biased — show covariate imbalance bars), the other randomly assigns — run repeatedly to watch imbalance shrink with n. Frozen-noise: same population, assignment methods re-applied to it.

1.5 between-vs-within-designs — "Between vs Within Designs". Trade-offs: power (link stats-2/repeated-measures-anova) vs carryover/order/practice effects; counterbalancing (incl. Latin squares at intuition level); when within is impossible. Viz: the SAME simulated study run both ways — sliders for individual differences and carryover strength; readouts show n needed for 80% power in each design; crank carryover to watch the within-design advantage invert.

1.6 quasi-experiments — "Quasi-Experiments & Natural Experiments". No random assignment: nonequivalent groups, pre/post, interrupted time series; matching and its limits; difference-in-differences intuition; regression discontinuity in one picture. Viz: DiD explorer — two groups' trend lines, sliders for baseline gap / shared trend / true effect; show why "compare after only" and "compare change only when trends differ" both mislead, and what the parallel-trends assumption buys.

FAQ ideas: "Does random assignment guarantee balanced groups?" (no — in expectation; small n imbalance), "What's the difference between random sampling and random assignment?", "What is a wait-list control?"

Software: none of these are runnable analyses — skip software.js; R/Python snippets only where genuinely useful (1.6: a 5-line DiD lm() example).

Standard verification. Tick P5 in ROADMAP.md.
```

### P6 — Methods lessons 7–9

```
StatsCapybara roadmap prompt P6 (see ROADMAP.md). Requires P4. Run node tools/audit.js first.

Add Methods lessons 7–9 with standard lesson integration each:

1.7 observational-designs — "Observational Designs". Cross-sectional vs cohort (prospective) vs case-control; what each can and can't claim; odds ratios as the case-control currency (link stats-3/logistic-regression); survivorship bias. Viz: a timeline simulator — a population develops an outcome over 20 simulated years; choose a design and watch WHICH slice of the data you actually get to see, plus the estimate each design yields vs the truth.

1.8 sampling-methods — "Sampling Methods". Simple random, stratified, cluster, systematic; convenience/snowball and why they bite; sampling frame vs population; WEIRD samples; nonresponse bias. Viz: a stylized city map of dots with a hidden opinion split that varies by neighborhood; sample it each way and compare estimate vs truth over repeated draws — convenience sampling (dots near the "university") is visibly, persistently off while stratified nails it with smaller n.

1.9 survey-and-questionnaire-design — "Designing Surveys & Questionnaires". Question wording (leading, double-barreled, loaded), response options (Likert best practices, odd/even midpoint, labeling), order effects, acquiescence and reverse-coding, social desirability. Viz: "fix this survey" — a terrible 6-item questionnaire; students identify each flaw (click the problem, pick the fix) with a running score; ends with the repaired version side by side.

FAQ ideas: "How many points should a Likert scale have?" (5–7; labeling matters more), "What is a representative sample?", "Case-control vs cohort — which is better?"

Software: none runnable — snippets only if genuinely useful (1.8: R sample()/dplyr stratified sampling demo).

Standard verification. Tick P6 in ROADMAP.md.
```

### P7 — Methods lessons 10–12 (course complete)

```
StatsCapybara roadmap prompt P7 (see ROADMAP.md). Requires P4. Run node tools/audit.js first.

Add the final Methods lessons 10–12 with standard lesson integration each:

1.10 bias-and-blinding — "Bias, Blinding & Demand Characteristics". The bias catalogue: selection, attrition, response, experimenter-expectancy (Clever Hans), demand characteristics, placebo/nocebo; single/double blinding; why "double-blind RCT" is the gold standard phrase. Viz: scenario triage — short study vignettes; diagnose the bias from the catalogue, see the fix; a running "which biases does blinding kill?" scoreboard.

1.11 the-replication-crisis — "The Replication Crisis". What happened (psychology's 36%-replication moment), why: p-hacking, garden of forking paths, publication bias (link stats-4/meta-analysis funnel plots), low power, HARKing. Honest but constructive tone — science self-correcting, not science broken. Viz: forking-paths simulator — a dataset with NO true effect plus 4 analytic choices (outlier rule, covariate, subgroup, DV variant = 16+ paths); explore paths hunting for p<.05, with a live counter of paths tried and the actual false-positive rate across all paths; then a "preregistered" mode locks one path and the rate drops to 5%. This is the course's flagship interactive — make it excellent.

1.12 preregistration-and-open-science — "Preregistration & Open Science". Prereg vs registered reports; exploratory vs confirmatory analysis (both legitimate, label them!); open data/materials; the modern workflow (OSF, badges). Viz: build-a-prereg — assemble the 8 key preregistration decisions for a sample study from options, get graded on specificity, export nothing (client-side only).

FAQ ideas: "Is p-hacking always intentional fraud?" (mostly no — motivated flexibility), "What's the difference between preregistration and a registered report?", "Are exploratory analyses bad science?"

After the lessons: consider a which-test.html cheat-table footnote linking 1.11 where multiple-comparisons dangers are mentioned, and add "replication crisis", "preregistration", "demand characteristics", "p-hacking" glossary terms if not already added per-lesson. Standard verification. Tick P7 in ROADMAP.md.
```

---

## Phase 2 — Data course (*From Raw to Ready*, slug `data`, 10 lessons, track "toolkit", accent cyan #06b6d4)

### P8 — Course scaffold + Data lessons 1–3

```
StatsCapybara roadmap prompt P8 (see ROADMAP.md). Requires P2. Run node tools/audit.js first.

Create the Data course ("Data — From Raw to Ready", track "toolkit", accent cyan #06b6d4, distinctness check in both themes) per CLAUDE.md's adding-a-COURSE procedure, then build lessons 1–3 with standard lesson integration:

2.1 tidy-data — "Tidy Data". The one rule: rows = observations, columns = variables, one value per cell; the classic spreadsheet sins (merged cells, color-as-data, two variables in one column, wide-by-year layouts); why tidy unlocks every tool downstream. Viz: "fix this spreadsheet" — a gloriously messy grade sheet rendered as an interactive grid; click a sin, name it, watch the sheet morph one repair at a time into tidy form.

2.2 codebooks-and-documentation — "Codebooks & Documentation". What a codebook records (name, label, type, units, allowed values, missing codes); variable naming conventions; why -99/999 missing codes are landmines; future-you as the audience. Viz: codebook builder — 6 cryptic columns (q3_rev, grp, dtcol...); fill in the codebook fields for each; the panel flags ambiguities you'd regret in 6 months.

2.3 data-entry-and-validation — "Data Entry & Validation". Where errors come from (typos, unit mix-ups, copy-paste drift); validation rules (ranges, allowed categories, cross-field logic like age vs birth year); double entry; the GRIM-style plausibility mindset. Viz: spot-the-error speed round — a 40-row dataset with 8 planted impossible values (age 511, height in inches among cm, RT of 3ms...); find them against the clock; ends by showing the validation RULES that would have caught each automatically.

FAQ ideas: "What does tidy data mean?", "How should I code missing values?" (blank/NA over numeric codes; never 0), "Should data cleaning change my raw data file?" (never — raw stays immutable, clean via script).

Software: 2.3 gets an R/Python snippet (range checks with dplyr/pandas assertions). No SPSS/JASP entries in this course unless a lesson genuinely maps to menus (2.3: SPSS Data > Validation is fine to include).

Standard verification. Tick P8 in ROADMAP.md.
```

### P9 — Data lessons 4–6

```
StatsCapybara roadmap prompt P9 (see ROADMAP.md). Requires P8. Run node tools/audit.js first.

Add Data lessons 4–6 with standard lesson integration:

2.4 data-cleaning-workflow — "The Cleaning Workflow". A principled pipeline: inspect → document issues → fix via script → re-inspect → log decisions; duplicates (exact and fuzzy), inconsistent categories ("male/M/Male "), whitespace ghosts, date formats; the cardinal rule: every cleaning step reproducible and reversible. Viz: pipeline simulator — a messy 100-row survey; toggle cleaning steps on/off in sequence and watch n, means, and a category bar chart update; a "cleaning log" writes itself as you toggle.

2.5 outliers-in-practice — "Outliers: Detect, Investigate, Decide". Detection (z, 1.5×IQR — link stats tools; visual first); the three explanations (error / different population / genuine extreme) and matching actions (fix / exclude+report / keep+robust); sensitivity analysis habit; NEVER delete silently (link stats-2/regression-diagnostics). Viz: outlier triage clinic — 6 cases with context ("RT = 24,000 ms and the log says participant sneezed"); choose an action, get the methodologist's verdict; readout shows how the mean/SD/t-test shift under each choice.

2.6 transformations-and-recoding — "Transformations & Recoding". Log/sqrt for skew (when it helps, what it does to interpretation — link stats-2/assumptions), z-standardizing (link stats-1), reverse-coding scale items, computing composite scores, binning (and why median splits waste information). Viz: transformation gallery — one skewed dataset, buttons for raw/log/sqrt/z; histogram + Q-Q + the back-transformed mean annotation update live; a median-split demo shows the correlation with an outcome dropping when you bin.

FAQ ideas: "Should I remove outliers before or after checking assumptions?", "When should I log-transform data?", "Is it okay to median-split a continuous variable?" (avoid; power loss ≈ discarding a third of data).

Snippets: all three (dplyr/pandas cleaning chains, scale() / zscore, log1p). SPSS/JASP for 2.6 (Compute/Recode menus).

Standard verification. Tick P9 in ROADMAP.md.
```

### P10 — Data lessons 7–10 (course complete)

```
StatsCapybara roadmap prompt P10 (see ROADMAP.md). Requires P8. Run node tools/audit.js first.

Add the final Data lessons 7–10 with standard lesson integration (four lessons — the vizzes here are lighter):

2.7 wide-vs-long-data — "Wide vs Long Data". The two shapes; why repeated-measures software wants one or the other (SPSS wide, R/JASP long-ish); pivot operations conceptually. Viz: animated pivot — a 4-person × 3-timepoint dataset; press pivot-longer/pivot-wider and watch each cell fly to its new home with id/name/value roles color-coded.

2.8 merging-datasets — "Merging Datasets". Keys and uniqueness; join types (inner/left/full) in plain language; what happens to non-matches; many-to-many accidents; checking row counts before/after as a habit. Viz: visual join explorer — two small tables side by side, pick a join type, watch matched rows link up and orphans fall away, with a row-count audit readout.

2.9 reproducible-workflows — "Reproducible Workflows". Scripts over clicks (the analysis IS the script); seeds for anything random; project folder structure (raw/ clean/ scripts/ output/); versioning-lite (dated files vs git awareness); the "could a stranger rerun this?" test. Viz: reproduce-this-result puzzle — given a claimed mean and a pipeline of 5 steps in scrambled order with one wrong parameter, reorder/fix until your output matches; demonstrates why order and logging matter.

2.10 data-privacy-basics — "Data Privacy Basics". Anonymous vs de-identified vs pseudonymized; quasi-identifiers and re-identification (the ZIP+birthdate+sex result); k-anonymity intuition; consent-scope and data minimization (bridges to the Ethics course); safe sharing (aggregate, synthetic). Viz: re-identification demo — a "de-identified" table of 30 people; pick quasi-identifier columns to reveal how many people become unique; watch k-anonymity change as you generalize (age → age band).

FAQ ideas: "Long or wide format for repeated measures?", "Why did my merge create duplicate rows?", "Is removing names enough to anonymize data?" (no — 87% of Americans unique on ZIP+DOB+sex).

Snippets: 2.7/2.8 (pivot_longer/merge, pandas melt/merge). Standard verification. Tick P10 in ROADMAP.md.
```

---

## Phase 3 — Ethics course (*Responsible Research*, slug `ethics`, 8 lessons, track "toolkit", accent slate #64748b)

**Tone note for this course:** serious topics handled with respect — no jokey framing around Tuskegee/Milgram/fraud; quips for these lessons should be gentle and thoughtful, never flippant.

### P11 — Course scaffold + Ethics lessons 1–3

```
StatsCapybara roadmap prompt P11 (see ROADMAP.md). Requires P2. Run node tools/audit.js first.

Create the Ethics course ("Ethics — Responsible Research", track "toolkit", accent slate #64748b, distinctness check in both themes) per CLAUDE.md's adding-a-COURSE procedure, then build lessons 1–3 with standard lesson integration. Tone: sober and respectful — these lessons cover real harm; keep the capybara quips gentle here, and no gamified scoring on the history lesson.

3.1 why-research-ethics — "Why Research Ethics Exists". The history that made rules necessary: Tuskegee, Milgram, the Stanford Prison Experiment (include modern criticisms of SPE's own methodology); Nuremberg Code → Declaration of Helsinki → Belmont Report; the three Belmont principles (respect for persons, beneficence, justice) as the lens for everything that follows. Viz: an interactive timeline — select a case/milestone to read what happened and which safeguard it produced; connect-the-line from case to principle.

3.2 informed-consent-and-irb — "Informed Consent & Ethics Committees". The elements of valid consent (information, comprehension, voluntariness); capacity and vulnerable populations; assent vs consent for minors; what IRBs/ethics committees actually review; exempt/expedited/full review intuition. Viz: consent-form auditor — a realistic consent form with 5 missing/defective elements; find each, see why it matters and the compliant rewrite.

3.3 deception-and-debriefing — "Deception & Debriefing". When deception can be justified (no reasonable alternative, minimal harm, prompt debriefing); the cost — eroded trust and demand characteristics (link methods/bias-and-blinding); what a proper debriefing contains; the right to withdraw data after learning the truth. Viz: a decision-path walkthrough — 5 study scenarios; walk each through the "is deception defensible?" flowchart and compare against the standard verdicts.

FAQ ideas: "Do online surveys need ethics approval?", "What is the difference between anonymity and confidentiality?" (preview of 3.4), "Was Milgram's study ethical by today's standards?"

No software.js entries in this course; R/Python snippets only if genuinely apt (likely none).

Standard verification. Tick P11 in ROADMAP.md.
```

### P12 — Ethics lessons 4–6

```
StatsCapybara roadmap prompt P12 (see ROADMAP.md). Requires P11. Run node tools/audit.js first.

Add Ethics lessons 4–6 with standard lesson integration:

3.4 privacy-and-confidentiality — "Privacy & Confidentiality". Anonymous vs confidential vs pseudonymized (precise definitions); data-protection duties (GDPR-flavored basics: minimization, purpose limitation, retention, the "special category" status of health data); secure storage habits for students (no participant data in email/cloud-dumps); when confidentiality may be broken (harm disclosures) and saying so in the consent form. Viz: scenario sorter — 8 short data-handling scenarios to classify as fine / risky / breach, with the rule each one turns on. Cross-link data/data-privacy-basics for the re-identification mechanics.

3.5 questionable-research-practices — "Questionable Research Practices". The QRP continuum from honest flexibility to fraud: optional stopping, selective outcome reporting, HARKing, p-hacking (link methods/the-replication-crisis for forking paths); why QRPs feel innocent in the moment; prevalence survey findings. Viz: THE flagship here — an optional-stopping simulator: a study with NO true effect, "test after every 10 participants and stop when p < .05" vs "fixed n" run 1,000 times; watch the false-positive rate climb from 5% toward ~20%+ with peeking. Verify the simulated rates against published values (Simmons et al. 2011 ballpark).

3.6 plagiarism-authorship-and-citation — "Plagiarism, Authorship & Citation". Plagiarism types (verbatim, mosaic, self-plagiarism, idea theft); paraphrase-plus-cite done right; authorship criteria (substantial contribution + drafting + approval + accountability — ICMJE style); gift/ghost authorship; citation ethics (cite what you read, don't launder secondary sources). Viz: authorship & citation dilemma cases — 6 vignettes ("my supervisor's colleague wants to be listed..."), choose a response, compare against the guideline-based answer with the reasoning.

FAQ ideas: "Can I reuse text from my own earlier assignment?" (self-plagiarism rules), "Does my supervisor automatically get authorship?", "Is stopping data collection early always wrong?" (planned interim analyses vs ad-hoc peeking).

Standard verification. Tick P12 in ROADMAP.md.
```

### P13 — Ethics lessons 7–8 (course complete)

```
StatsCapybara roadmap prompt P13 (see ROADMAP.md). Requires P11. Run node tools/audit.js first.

Add the final Ethics lessons 7–8 with standard lesson integration:

3.7 ai-in-research-ethics — "Using AI Tools Ethically". Where AI helps legitimately (code help, critique, editing, literature triage) vs where it fails or deceives (fabricated citations, unverified statistics, "hallucinated" facts); the researcher owns every word and number — verification is non-delegable; disclosure norms (journal and university policies vary — check yours, disclose honestly); data-protection trap: never paste participant data into external AI tools (links 3.4); AI cannot be an author (accountability criterion). Viz: "Can I use AI for this?" decision walkthrough — 8 realistic student tasks ("write my discussion", "fix my R error", "summarize these interviews", "generate references") routed through disclose/verify/don't gates with reasoning.

3.8 fraud-and-self-correction — "Fraud & How Science Self-Corrects". Fabrication and falsification; the Stapel case as anatomy of fraud (and what finally caught it); retractions and Retraction Watch; whistleblowing and its costs; the detection toolkit as hope — GRIM, statcheck-style consistency checks, data forensics; framing: fraud is rare, incentives matter, transparency is the fix. Viz: a GRIM-test interactive — enter a reported mean and n for integer-scale data; it shows whether that mean is arithmetically POSSIBLE, with a visual of reachable means; preload 3 real-feel examples (one impossible). Verify the GRIM logic carefully (mean × n must round to an integer within tolerance).

FAQ ideas: "What is the GRIM test?", "What happens when a paper is retracted?", "How common is research fraud?" (~2% admit fabrication in surveys; QRPs far more common).

After the lessons: add glossary terms (QRP, HARKing, retraction, GRIM) if not added per-lesson, and cross-link 3.5 ↔ methods/the-replication-crisis both ways. Standard verification. Tick P13 in ROADMAP.md.
```

---

## Phase 4 — ML & AI course (*Machine Learning for Researchers*, slug `ml`, 12 lessons, track "toolkit", accent purple #a855f7 — shift to fuchsia #d946ef if too close to Stats-1 indigo in situ)

### P14 — Course scaffold + ML lessons 1–3

```
StatsCapybara roadmap prompt P14 (see ROADMAP.md). Requires P2. Run node tools/audit.js first.

Create the ML course ("ML & AI — Machine Learning for Researchers", track "toolkit", accent purple #a855f7 — verify against Stats-1 indigo #6366f1 in both themes; use fuchsia #d946ef if they blur) per CLAUDE.md's adding-a-COURSE procedure, then build lessons 1–3 with standard lesson integration. Audience framing throughout the course: a stats student who knows regression (link back to Stats 2–4 constantly) — not a CS student.

4.1 prediction-vs-explanation — "Prediction vs Explanation". Breiman's two cultures made friendly: inference (which variables matter, how much, with uncertainty) vs prediction (minimize error on new cases, whatever works); same linear model can serve both; when each mindset wins; why ML rarely reports p-values and stats rarely reports test error. Viz: one dataset, two dials — optimize a model for "cleanest interpretation" vs "lowest held-out error" and watch the chosen model change (fewer terms vs more flexible), with both scorecards shown.

4.2 train-test-split-and-generalization — "Train/Test Splits & Generalization". The golden rule: never evaluate on data the model saw; splits and stratification; DATA LEAKAGE as the #1 silent killer (scaling/feature selection before splitting, duplicate subjects across splits — link stats-4/cross-validation-and-overfitting). Viz: leakage laboratory — toggle three pipeline mistakes on/off (preprocess-before-split, subject overlap, tune-on-test) and watch reported vs TRUE performance diverge; the honest pipeline matches, the leaky ones flatter.

4.3 regularization-ridge-and-lasso — "Regularization: Ridge & Lasso". Why shrinking coefficients helps (bias–variance, link stats-3/multicollinearity); ridge shrinks, lasso selects (zeros); λ as the flexibility dial chosen by cross-validation; standardize first. Viz: coefficient-path explorer — 8 predictors (3 real, 5 noise), drag λ and watch coefficient paths shrink (ridge) or hit exactly zero one by one (lasso), with training vs CV error curves underneath; verify the noise coefficients die before the real ones.

FAQ ideas: "Is machine learning just statistics rebranded?", "What is data leakage?", "Ridge or lasso — which should I use?" (lasso for selection, ridge for correlated predictors, elastic net hedge).

Snippets: all three (tidymodels/scikit-learn splits, glmnet/sklearn Lasso). No SPSS/JASP entries in this course (JASP ML module optional mention in tips where apt).

Standard verification. Tick P14 in ROADMAP.md.
```

### P15 — ML lessons 4–6

```
StatsCapybara roadmap prompt P15 (see ROADMAP.md). Requires P14. Run node tools/audit.js first.

Add ML lessons 4–6 with standard lesson integration:

4.4 classification-metrics — "Classification Metrics & the Accuracy Trap". Confusion matrix (TP/FP/FN/TN); why 95% accuracy is garbage when 95% are negative (base rates — link stats-1/probability-basics); precision, recall/sensitivity, specificity, F1; choosing the metric by which error hurts more (screening vs spam). Viz: two overlapping score distributions (diseased/healthy) with a draggable decision threshold; confusion matrix + all metrics update live; a class-imbalance slider makes accuracy stay high while recall collapses — the trap made visible.

4.5 roc-curves-and-auc — "ROC Curves & AUC". Sweep every threshold and plot TPR vs FPR; reading the curve (top-left = good, diagonal = coin flip); AUC = probability a random positive outranks a random negative; when precision-recall curves beat ROC (heavy imbalance). Viz: continue from 4.4's threshold explorer — press "sweep" and watch the ROC curve draw itself point by point as the threshold slides, current threshold highlighted on both plots; AUC computed exactly (verify against the closed-form for two normals: AUC = Φ(d/√2), e.g. d=1 → AUC≈.760).

4.6 decision-trees — "Decision Trees". Recursive splitting; impurity (Gini) in plain language; interpretability as the superpower; depth as the overfitting dial; instability (small data change → different tree). Viz: grow-a-tree — 2D scattered classes; each click adds the best split, drawing the boundary rectangle live; depth counter with training vs test accuracy — watch test accuracy peak then fall as you keep clicking (frozen data, deterministic splits).

FAQ ideas: "What is a good AUC value?", "Why is accuracy misleading for rare outcomes?", "Should I balance my classes before training?"

Snippets for all three (sklearn metrics/roc_curve, rpart/sklearn tree). Standard verification. Tick P15 in ROADMAP.md.
```

### P16 — ML lessons 7–9

```
StatsCapybara roadmap prompt P16 (see ROADMAP.md). Requires P14. Run node tools/audit.js first.

Add ML lessons 7–9 with standard lesson integration:

4.7 random-forests-and-ensembles — "Random Forests & Ensembles". Wisdom of crowds for models: bagging (bootstrap samples — link stats-4/bootstrap-and-resampling), feature randomness decorrelates trees; averaging cancels individual trees' noise (variance reduction); out-of-bag evaluation for free; variable importance (with its caveats); the interpretability price. Viz: forest builder — add trees one at a time to a 2D problem; each tree's jagged boundary drawn faintly, the ensemble's smooth boundary darkening as votes accumulate; test-accuracy curve rises then plateaus (not overfits) with more trees.

4.8 knn-and-distance — "k-NN & Why Distance Gets Weird". Predict by neighbors; k as the smoothness dial (k=1 memorizes, k=n predicts the majority); feature scaling is mandatory (distance is scale-sensitive); the curse of dimensionality — in high-D everything is far and equally far. Viz: 2D k-NN boundary explorer with a k slider and a "unscale one feature ×100" toggle that visibly wrecks the boundary; plus a curse-of-dimensionality readout: fraction of a unit hypercube within distance 0.5 of the center as dims go 1→2→10→100 (computed exactly, watch it vanish).

4.9 clustering-kmeans — "Clustering & k-Means". Unsupervised framing (no labels — finding structure); the k-means loop (assign → update, repeat); choosing k (elbow, silhouette intuition); failure modes (non-spherical clusters, bad initialization → k-means++ mention); clusters are hypotheses, not facts. Viz: step-through k-means — draggable data points, chosen k; press "step" to alternate assignment/update with centroid trails; an elbow plot builds as you try k = 1…8; include one dataset where k-means confidently finds the WRONG clusters (two moons) as the honesty demo.

FAQ ideas: "How do I choose k in k-means?", "Does k-NN need normally distributed data?" (no assumptions, but needs scaling), "Are my clusters real?" (validate: stability, silhouette, and theory).

Snippets for all three. Standard verification. Tick P16 in ROADMAP.md.
```

### P17 — ML lessons 10–12 (course complete)

```
StatsCapybara roadmap prompt P17 (see ROADMAP.md). Requires P14. Run node tools/audit.js first.

Add the final ML lessons 10–12 with standard lesson integration:

4.10 dimensionality-reduction — "Dimensionality Reduction". PCA as the linear workhorse (reprise + link stats-3/factor-analysis-pca); nonlinear maps (t-SNE/UMAP) at intuition level: great for SEEING structure, dangerous for MEASURING it (cluster sizes and between-cluster distances in the embedding are not meaningful; perplexity changes the picture). Viz: a 3D point cloud (two interlocked rings + a blob) shown as a rotatable projection; buttons: PCA projection (rings overlap — linear can't help) vs a precomputed nonlinear embedding (rings separate); a "same data, different perplexity" trio to teach embedding skepticism.

4.11 neural-networks-intuition — "Neural Networks: The Intuition". A neuron = weighted sum + squash (literally logistic regression — link stats-3/logistic-regression); layers compose simple boundaries into complex ones; training = nudging weights downhill on error (gradient descent, learning-rate intuition); deep = many layers of reusable features; what this course does NOT cover (backprop math) and where to go next. Viz: a tiny live 2-3-1 network on the XOR problem — weights drawn as colored/thickness-coded edges, decision boundary rendered live; "train step ×100" button animates the boundary bending from a useless line into the XOR pockets; a learning-rate slider that can visibly overshoot. Train with plain JS gradient descent on the 4 XOR points + jitter cloud; frozen seed.

4.12 llms-and-ai-in-research — "LLMs & AI in Your Research Workflow". What an LLM is (next-token prediction at scale); why fluency ≠ truth: hallucination as a structural feature, fabricated citations; strong uses (code help, critique, rubber-ducking, drafts you verify) vs forbidden uses (uncheckable facts, statistics you can't reproduce, participant data — link ethics/ai-in-research-ethics); a verification workflow that treats AI output as an eager intern's draft. Viz: a toy next-word predictor trained on a tiny visible corpus (n-gram) — type a prompt, watch it produce fluent-but-wrong continuations, THE point about plausibility vs truth made mechanically; plus a "verify the citation" mini-game (3 plausible references, one fabricated — can you tell without checking? No. That's the lesson).

FAQ ideas: "Do I need to learn neural networks for my thesis?", "Why do LLMs make up references?", "Can I use ChatGPT/Claude to run my statistics?" (to help write verifiable code yes; as an oracle no).

After the lessons: add a which-test.html note or leaf pointing to ML for "I want to PREDICT, not test" queries, and cross-link stats-4/cross-validation-and-overfitting ↔ 4.2. Standard verification. Tick P17 in ROADMAP.md.
```

---

## Phase 5 — Writing course (*Reporting Your Research*, slug `writing`, 8 lessons, track "toolkit", accent lime #84cc16)

### P18 — Course scaffold + Writing lessons 1–3

```
StatsCapybara roadmap prompt P18 (see ROADMAP.md). Requires P2 (P21's APA formatter pairs well but isn't required). Run node tools/audit.js first.

Create the Writing course ("Writing — Reporting Your Research", track "toolkit", accent lime #84cc16, distinctness check vs Stats-3 green #22c55e in both themes) per CLAUDE.md's adding-a-COURSE procedure, then build lessons 1–3 with standard lesson integration:

5.1 imrad-structure — "The IMRaD Structure". What goes where and WHY (the hourglass: broad → narrow → broad); the job of each section in one sentence; the classic misplacements (results in the discussion, new literature in the conclusion, methods details in results); reading order ≠ writing order (write methods/results first). Viz: sort-the-sentences — 12 sentences from a finished study; drag each into Intro/Methods/Results/Discussion; instant feedback explains the section's job when you miss.

5.2 reporting-statistics-apa — "Reporting Statistics in APA Style". The master patterns for t, F, χ², r, regression (mirror the injected APA blocks across the site); italics rules (Latin symbols italic: t, F, p, d, r, N — Greek not: α, β, χ², η²); decimals and leading zeros (p and r get none); exact p to 2–3 decimals, p < .001 floor, NEVER p = .000; df conventions; means with SDs in parentheses. Viz: APA error hunt — a realistic results paragraph with 10 planted violations; click each error, name it, watch the corrected paragraph assemble. Cross-link the APA formatter tool (../../apa.html) if it exists.

5.3 tables-and-figures — "Tables & Figures That Don't Lie". Text vs table vs figure decision; APA table anatomy (no vertical lines!); figure honesty: truncated axes, dual axes, 3D junk, rainbow abuse; error bars and saying WHAT they show (SD vs SE vs CI — link stats-1/confidence-intervals); every display referenced in text. Viz: fix-this-chart — one deceptive bar chart with 5 toggleable sins (truncated axis, 3D, chartjunk, no error bars, unsorted categories); toggle each fix and watch the visual story change from "huge effect!" to the honest picture, with the before/after effect impression rated.

FAQ ideas: "Do I italicize p and t in APA style?", "Should error bars show SD, SE, or CI?", "When should I use a table instead of a figure?"

Software: 5.2 links existing software.js APA blocks rather than duplicating. Snippets: 5.3 gets a ggplot/matplotlib honest-bar-chart snippet.

Standard verification. Tick P18 in ROADMAP.md.
```

### P19 — Writing lessons 4–6

```
StatsCapybara roadmap prompt P19 (see ROADMAP.md). Requires P18. Run node tools/audit.js first.

Add Writing lessons 4–6 with standard lesson integration:

5.4 writing-results — "From Output to Results Section". The sentence formula: what was tested → the statistic → effect size + direction → what it means in variables' terms; report the analysis you planned (link methods/preregistration-and-open-science); no interpretation in Results (that's Discussion); past tense; assumptions checks reported briefly. Viz: sentence builder — an annotated mock JASP/SPSS output panel (drawn in HTML, no screenshots); assemble the correct results sentence from fragments (some fragments are traps: interpretive claims, wrong df, p = .000); three rounds: t-test, ANOVA, regression.

5.5 nonsignificant-results — "Writing About Non-Significant Results". p = .08 is not "a trend toward significance"; absence of evidence ≠ evidence of absence (link stats-1/hypothesis-testing-logic); what TO write: effect size + CI, power context, honest framing; equivalence-testing intuition (can we rule out effects that matter?); non-significant ≠ unpublishable ≠ failure. Viz: interpretation chooser — 5 result scenarios (each: p, d, CI, n); pick the honest sentence among four tempting options (overclaim, underclaim, trend-speak, honest); a calibration score with explanations tied to the CI shown.

5.6 discussion-and-limitations — "Discussion & Limitations". The discussion recipe: restate finding plainly → relate to literature → interpret (now you may!) → limitations that MATTER (not "small sample" boilerplate — say what the limitation could have changed) → future directions that follow from THIS study; claims calibrated to evidence (correlational data → no causal verbs — link stats-4/causal-dags-and-confounding). Viz: overclaim detector — given the actual result card, rate 8 discussion sentences as calibrated / overclaimed / underclaimed; the game highlights the exact verb or quantifier that breaks calibration ("proves", "demonstrates", "may suggest").

FAQ ideas: "How do I report a non-significant result in APA style?", "Can I say 'marginally significant'?" (no — report exact p and CI, interpret honestly), "How many limitations should I list?"

Standard verification. Tick P19 in ROADMAP.md.
```

### P20 — Writing lessons 7–8 (course complete)

```
StatsCapybara roadmap prompt P20 (see ROADMAP.md). Requires P18. Run node tools/audit.js first.

Add the final Writing lessons 7–8 with standard lesson integration:

5.7 abstracts-and-titles — "Abstracts & Titles". The abstract's 5 moves (context, aim, method, result WITH numbers, conclusion) in ~150–250 words; write it LAST; titles that state the finding or the question (searchable > clever — findable by the keywords your reader would type; connect to how they found THIS site); keywords selection. Viz: abstract grader — a draft abstract scored live against the 5-move checklist as you toggle its sentences in/out; then a before/after pair showing a vague abstract rewritten into a findable, informative one.

5.8 final-checklist — "The Final Checklist". The grader's-eye pass: do the numbers MATCH everywhere (abstract vs results vs tables); df consistency with your reported n; every table/figure referenced; every citation in the reference list and vice versa; statistics complete (test, df, statistic, p, effect size); formatting hygiene. Viz: consistency checker game — a one-page mock paper where 6 internal inconsistencies hide (abstract says n=120, methods says 118; df don't match n; a figure never referenced...); find them all; ends with a printable final-submission checklist (print CSS).

FAQ ideas: "How long should a thesis abstract be?", "Why do my degrees of freedom matter to the grader?" (df reveal n and design — mismatches signal errors), "What do graders check first?"

After the lessons: build the "thesis pathway" — a short ordered link-list block (methods → data → stats → power tool → writing → ethics) added to the Writing course description on the homepage/toolbox where it naturally fits, cross-linking the whole toolkit track. Standard verification. Tick P20 in ROADMAP.md.
```

---

## Phase 6 — Tools expansion

### P21 — APA formatter tool

```
StatsCapybara roadmap prompt P21 (see ROADMAP.md). Run node tools/audit.js first.

Build apa.html — "APA Results Formatter": enter your numbers, get a correctly formatted APA 7 results sentence. Follow the tool-page pattern (tables.html / effect-sizes.html as models; no dependencies; VIZ math).

Supported analyses (tab/segmented picker): independent & paired & one-sample t (t, df, p, d + optional M/SD per group); one-way & factorial ANOVA effects (F, df1, df2, p, η²/partial η²); chi-square (χ², df, N, p, Cramér's V); correlation (r, df/n, p); regression coefficient (b, SE, β, t, p) + model (R², F, dfs, p).

Behavior: live-rendered sentence with CORRECT typography (Latin stats italic via <em>, Greek upright; no leading zeros on p/r; p < .001 floor — auto-fix "p = 0.000" inputs with a gentle note); copy button (rich HTML + plain-text fallback); a consistency check using VIZ (recompute p from the statistic+df — if entered p mismatches by more than rounding, show a kind warning, exactly the statcheck idea; verify: t=2.05, df=28 → two-tailed p=.0499). Each analysis links its lesson and the relevant software.js APA example.

Integration per CLAUDE.md tool-page checklist: TOOLBOX (group "calc"), SEARCH_PAGES, tools/build-search-index.py list + rerun, sitemap.xml, QUIPS, full per-page SEO. Also add a small "Format your own numbers →" link at the bottom of the injected APA block in site.js (BASE-aware) pointing to apa.html. Standard verification. Tick P21 in ROADMAP.md.
```

### P22 — Practice datasets library

```
StatsCapybara roadmap prompt P22 (see ROADMAP.md). Run node tools/audit.js first.

Build datasets.html — "Practice Datasets": downloadable CSVs with stories, so students can practice every analysis on realistic data, plus a committed generator script tools/make-datasets.py (seeded, reproducible — document the seed; rerunning must reproduce byte-identical CSVs).

Create 8 datasets in assets/data/ (each ~50–200 rows, small files): (1) sleep-experiment.csv — two-group t-test story, planted d≈0.5; (2) study-methods.csv — 3-group ANOVA with mildly unequal variances (assumption practice); (3) screen-time.csv — correlation/regression with one influential outlier; (4) memory-2x2.csv — factorial design with a real interaction; (5) wellbeing-survey.csv — 8 Likert items (two reverse-coded), some missing values, composite-score practice; (6) messy-clinic.csv — deliberately dirty (duplicates, impossible values, inconsistent categories, a unit mix-up) for the Data course; (7) training-longitudinal.csv — 3 timepoints WIDE format (pivot + RM-ANOVA practice); (8) admissions.csv — binary outcome for logistic regression.

Page: one card per dataset — the story, variable table (name/type/units), download button (<a download>), 3 suggested exercises linking the relevant lessons, and a collapsible worked solution (<details>) with the key numbers (compute these from the actual generated data via the generator script and paste — they must be TRUE for the shipped CSVs; verify at least one per dataset with node/python by hand).

Integration: TOOLBOX (group "practice"), SEARCH_PAGES + index rebuild, sitemap, QUIPS, full SEO. Cross-link from descriptives.html ("need data? grab a practice dataset"). Standard verification. Tick P22 in ROADMAP.md.
```

### P23 — Glossary flashcards

```
StatsCapybara roadmap prompt P23 (see ROADMAP.md). Run node tools/audit.js first.

Build flashcards.html — spaced-repetition flashcards over the glossary.

1. Refactor: extract glossary.html's inline term array into assets/js/glossary-data.js (window.GLOSSARY); glossary.html loads it with IDENTICAL rendered output (verify before/after DOM equality on the term list); update tools/build-search-index.py's glossary extraction to read the new file; document in CLAUDE.md.
2. Flashcards: Leitner system with 3 boxes (new/learning/known), persisted to localStorage as sc-cards {term: {box, due}} with day-granularity scheduling (box 1 daily, box 2 every 3 days, box 3 weekly); card flip (click/Space), self-rating buttons (Again/Good/Easy → box moves) + 1/2/3 keys; filter by course (terms carry their lesson's course via the existing {s: "course/slug"} links; terms without links group as "General"); a session summary ("12 reviewed · 3 promoted") and a due-today count on load; a reset-progress button with confirm.
3. Follow the tool-page pattern; keyboard accessible; respects dark mode.

Integration: TOOLBOX (group "practice"), SEARCH_PAGES + index rebuild, sitemap, QUIPS, full SEO; document the sc-cards localStorage key in CLAUDE.md next to sc-progress/sc-checks. Standard verification (include a localStorage round-trip test via preview eval: rate cards, reload, confirm state). Tick P23 in ROADMAP.md.
```

### P24 — Which-chart tool

```
StatsCapybara roadmap prompt P24 (see ROADMAP.md). Run node tools/audit.js first.

Build which-chart.html — "Which Chart Should I Use?", the visualization sibling of which-test.html (reuse its NODES/LEAVES decision-tree pattern, step counter, Back, start-over).

Decision dimensions: what are you showing (distribution / comparison / relationship / composition / change over time) × variable types (one quantitative, quantitative+categorical, two quantitative, two categorical, time series) × audience needs (exact values → table). Leaves (~12): histogram, boxplot(s), bar chart, grouped/stacked bar, scatterplot, scatter+trend, line chart, heatmap/mosaic for two categoricals, table, and "resist the pie chart" guidance where relevant.

Each leaf: a small canvas thumbnail of the chart drawn live from tiny built-in example data (VIZ helpers, theme-aware via VIZ.onTheme), when to use it, the classic mistake with it, and links to stats-1/visualizing-data plus writing/tables-and-figures (if the Writing course exists — otherwise skip that link gracefully).

Below the tree: a cheat-sheet table (goal × data type → chart) mirroring which-test's cheat table style.

Integration: TOOLBOX (group "guide"), SEARCH_PAGES + index rebuild, sitemap, QUIPS, full SEO. Standard verification. Tick P24 in ROADMAP.md.
```

### P25 — Analysis planner wizard

```
StatsCapybara roadmap prompt P25 (see ROADMAP.md). Best after P3 (power calculator) and P21 (APA formatter). Run node tools/audit.js first.

Build plan.html — "Plan My Analysis": which-test.html's grown-up sibling that outputs a complete, printable analysis plan for a student's thesis study.

Wizard questions (reuse/extend the which-test decision logic rather than duplicating — factor shared logic if clean, else keep them independent but consistent): outcome type → predictor/groups structure → paired/independent → covariates? → expected effect size (with honest defaults and a "no idea" path suggesting pilot literature).

Output: a plan card with (1) the recommended test + why in one sentence, (2) assumptions to check with links to the relevant lessons/tools, (3) a sample-size suggestion computed via the SAME noncentral math as power.html (VIZ.nct/ncx2/ncf — recompute live, verify one case against P3's gates: d=0.5 two-sample → 64/group), (4) links: the test's lesson, its software.js walkthrough anchor, the APA formatter preset, and power.html, (5) a "report it like this" APA skeleton sentence.

Make the plan printable (print CSS: plan card only, capybara header, URL footer) — students hand this to supervisors. Add query-param prefill support (?test=ttest-ind&d=0.5) so lessons can deep-link scenarios; document params in a comment.

Integration: TOOLBOX (group "guide"), SEARCH_PAGES + index rebuild, sitemap, QUIPS, full SEO; add "plan your analysis →" cross-links from which-test.html and power.html. Standard verification. Tick P25 in ROADMAP.md.
```

### P26 — Correlation & regression explorer

```
StatsCapybara roadmap prompt P26 (see ROADMAP.md). Run node tools/audit.js first.

Build correlation.html — "Correlation & Regression Calculator": paste-two-columns companion to descriptives.html (reuse its paste-parsing approach and page pattern).

Features: paste X and Y (two columns or two boxes; handle commas/tabs/newlines, decimal commas, header rows) → live scatterplot (canvas, hi-DPI, theme-aware) with least-squares line and its equation; Pearson r with t-test p-value and Fisher-z 95% CI (verify: r=.5, n=30 → CI ≈ [.17, .73]); Spearman ρ with tie-corrected ranks; R²; residual mini-plot; robustness readout — leave-one-out r range ("removing point 17 alone would move r from .62 to .38 — investigate it") with the culprit highlighted on click; copyable APA sentence for both r and the regression slope.

Include an Anscombe's quartet demo button (all four datasets: identical r/means/line, wildly different scatter — verify the classic values: r≈.816, ŷ≈3.00+0.50x) as the built-in "always look at your data" lesson.

Integration: TOOLBOX (group "calc"), SEARCH_PAGES + index rebuild, sitemap, QUIPS, full SEO; cross-link stats-2/correlation and stats-2/simple-linear-regression prose to it, and link it from descriptives.html. Standard verification. Tick P26 in ROADMAP.md.
```

---

## Phase 7 — UX & platform polish

### P27 — Progress dashboard + certificates

```
StatsCapybara roadmap prompt P27 (see ROADMAP.md). Run node tools/audit.js first.

Build progress.html — "My Progress": one calm page that makes the site feel like a course you're enrolled in. All client-side from existing localStorage (sc-progress, sc-checks, sc-last; and sc-cards if P23 done).

Content: per-course progress rings (reuse the homepage ring drawing — factor into a shared helper if duplicated) for ALL courses/tracks; total lessons done / remaining; "continue where you left off" (sc-last) hero button; per-course best-check-scores summary; an honest empty state for new visitors ("nothing tracked yet — progress lives only in this browser").

Certificates: when a course hits 100%, unlock "Get your certificate" — a canvas-drawn A4-landscape certificate (course accent border, hand-drawn capybara from the capy() geometry, typed-name input, course title, date, "statscapybara.com") downloadable as PNG (toDataURL) and printable. Charming but tasteful — it's a fun reward, not a fake credential; small print says so. Test the canvas at 2x scale for crisp download.

Integration: TOOLBOX (group "practice") + a small progress link near the homepage resume banner; SEARCH_PAGES + index rebuild, sitemap, QUIPS, full SEO (noindex is fine to consider — decide and document; it's personal-state content). Document any new localStorage keys in CLAUDE.md. Standard verification incl. a localStorage round-trip (mark lessons done via eval, reload, verify rings). Tick P27 in ROADMAP.md.
```

### P28 — Accessibility pass

```
StatsCapybara roadmap prompt P28 (see ROADMAP.md). Run node tools/audit.js first.

A full accessibility pass targeting WCAG 2.1 AA across the site. Audit first, then fix, then document.

1. Keyboard: every interactive reachable and operable — nav dropdown, search overlay (focus trap + Esc + focus restore), mobile menu, theme toggle, all lesson controls (range inputs and buttons are native — verify no click-only canvas interactions lack a keyboard path; where a viz is drag-only, add keyboard nudge support or an equivalent control), FAQ/checks details, quiz.
2. Screen readers: aria-live="polite" on key viz readouts (stat-row values) so slider changes announce; verify every canvas has the role="img" aria-label site.js injects and that the labels actually DESCRIBE the viz ("Histogram of sample means updating as you draw samples" beats "canvas"); label all form controls; heading hierarchy sane on every page type.
3. Visual: contrast-check text/accent combinations in BOTH themes (esp. text-faint on bg-soft, accent-colored text on surface — compute ratios, fix any below 4.5:1 body / 3:1 large); visible focus indicators everywhere (:focus-visible ring using the accent); hit areas ≥ 44px on mobile controls.
4. Motion: honor prefers-reduced-motion — skip/instant the draw-many animations, spinner-y transitions, and smooth scrolling.
5. Add an accessibility statement section to the About area (honest scope note).

Document the a11y conventions (aria-live pattern, reduced-motion pattern, focus ring) in CLAUDE.md so future lessons follow them. Verify with keyboard-only walkthroughs of: homepage → lesson → run viz → search → toolbox tool, in light+dark. Standard verification. Tick P28 in ROADMAP.md.
```

### P29 — Performance pass

```
StatsCapybara roadmap prompt P29 (see ROADMAP.md). Run node tools/audit.js first.

A measured performance pass. Record before/after numbers in your final report; don't optimize blind.

1. Measure: Lighthouse (or equivalent lab metrics via the preview tooling) on homepage, one lesson, one tool page — performance, a11y, best-practices, SEO scores + LCP/CLS/TBT.
2. Fonts: check Inter.woff2 size; if it's the full family (>100KB), subset to latin + used weights (document the subsetting command in CLAUDE.md); add <link rel="preload" as="font"> on the stylesheet's font if LCP benefits.
3. CLS: measure layout shift from injected blocks (checks/software/FAQ interplay) and the nav/sidebar build; reserve space or inject before-paint where it matters; target CLS < 0.1 on lessons.
4. JS hygiene: confirm search-index.js stays lazy; GA is async (leave it — don't get clever with GA); check canvas code paths for devicePixelRatio over-allocation on 4k screens (cap the backing store sensibly in VIZ.fit if needed); ensure resize handlers are debounced/rAF-batched.
5. Caching: GitHub Pages headers are fixed — instead ensure asset URLs are stable and small; no other action.
6. Do NOT add a build step, bundler, or minification pipeline — optimizations must keep the no-build philosophy.

Target: ≥95 on all four Lighthouse categories for the three page types, honestly measured. Standard verification. Tick P29 in ROADMAP.md.
```

### P30 — Print handouts

```
StatsCapybara roadmap prompt P30 (see ROADMAP.md). Run node tools/audit.js first.

Make every lesson print beautifully — students print handouts before exams; professors print them for class.

1. A lesson print stylesheet (@media print in styles.css): hide nav/sidebar/footer chrome, viz CONTROLS, injected interactive blocks (checks/software tabs — keep the APA example block, it's reference material), Ko-fi; keep prose, callouts, formulas, and the FAQ with all details forced open (CSS or a beforeprint handler that sets [open], afterprint restores); page margins, print-friendly font sizes, avoid page-break inside callouts/faq items; a discreet printed footer with the lesson URL ("statscapybara.com/stats-1/central-limit-theorem").
2. Canvases: at print time, freeze the CURRENT canvas state (canvases print as-is — verify they actually render in print preview; if blank, snapshot to <img> on beforeprint and swap back on afterprint).
3. A "Print this lesson" button injected by site.js near the mark-complete toggle (BASE-aware, window.print()), hidden in print itself.
4. Verify via the preview tooling's print emulation (or media:print CSS check) on 3 lessons of different structure + one Ethics lesson (serious tone must survive printing — quips hide in print if they'd read oddly; decide and be consistent).

Also give formulas.html and the glossary a quick print-polish pass while in here (they're natural print targets). Document print conventions in CLAUDE.md. Standard verification. Tick P30 in ROADMAP.md.
```

### P31 — Per-course OG images

```
StatsCapybara roadmap prompt P31 (see ROADMAP.md). Run node tools/audit.js first.

Give each course its own Open Graph image so shared links look distinct and professional.

1. Write tools/make-og-images.py (Pillow, committed, reproducible) generating assets/og-<course-slug>.png for every course in curriculum.js: same capybara geometry as the favicon/OG (keep brand consistency — reuse the drawing code from the existing og.png generation approach described in CLAUDE.md), course accent as the dominant color, course title + subtitle, "statscapybara.com". 1200×630. Also regenerate the main og.png from the same script (single source of truth going forward) with the evergreen subtitle.
2. Update every lesson page's og:image/twitter:image to its course image; homepage/tools keep og.png. This touches all lesson heads — do it with a small committed script or careful find-replace, and extend tools/audit.js to verify: every og:image URL resolves to a file on disk, lessons point at their own course's image.
3. Update CLAUDE.md's OG-image section: the script replaces the ad-hoc inline-Pillow approach; document how to regenerate.

Verify: images render correctly (open them), a lesson's head points at the right accent image per course, audit passes. Standard verification. Tick P31 in ROADMAP.md.
```

### P32 — Homepage v2

```
StatsCapybara roadmap prompt P32 (see ROADMAP.md). Requires at least two Research Toolkit courses live (ideally after P7+P20). Run node tools/audit.js first.

Redesign the homepage for the two-track, 9-course reality — keeping the calm, capybara-tasteful character (no marketing hype, no fake urgency).

1. Hero: keep the capybara + one-line promise; counts stay computed from CURRICULUM (audit-enforced meta counts updated to match); one primary CTA ("Start with Stats 1") + one secondary ("Plan my analysis" → plan.html if it exists, else toolbox).
2. "Start here" pathways — three persona cards ABOVE the curriculum grid: "Taking my first stats course" → Stats 1.1; "Writing my thesis right now" → the thesis pathway (methods → power → data → writing → ethics with 5 mini-links); "Curious about ML & AI" → ML 4.1. Small, quiet cards — guidance, not billboards.
3. Curriculum grid: track headings (from P2) with a one-line description each; course cards show accent, lesson count, progress ring; completed-lesson fading conventions unchanged.
4. Toolbox strip: the grouped highlights with 4–5 star tools (power, planner, tables, APA formatter, datasets).
5. Keep/verify: resume banner, search, quips, JSON-LD Course block (update its description counts), GA, all SEO tags; og description counts refreshed; section anchors (#about etc.) still work from tool pages (BASE-aware links).
6. Screenshot before/after in light+dark+mobile; the page must feel CALMER, not busier — if a section fights for attention, cut it.

Standard verification incl. subpath server. Tick P32 in ROADMAP.md.
```

### P33 — Offline PWA

```
StatsCapybara roadmap prompt P33 (see ROADMAP.md). Optional/advanced — do late. Run node tools/audit.js first.

Make the site installable and offline-capable (students on trains love this), WITHOUT risking stale-content bugs.

1. site.webmanifest: verify/complete (name, icons incl. maskable, theme colors for both schemes, start_url "./" so subpath hosting survives).
2. sw.js at site root: versioned cache name (const CACHE_VERSION — bump policy documented in CLAUDE.md next to the deploy step: "bump on every deploy that changes assets"); precache the shell (styles.css, site.js, curriculum.js, viz.js, fonts, favicon); runtime caching: cache-first for /assets/, NETWORK-FIRST for all HTML (never serve stale lessons when online) with cache fallback offline; an offline.html fallback page (self-contained like 404.html, friendly capybara, lists any cached lessons via the Cache API) for uncached navigations; skipWaiting + clients.claim on activate so updates apply on next load.
3. Registration in site.js: feature-detected, BASE-aware (compute scope correctly for subpath hosting), wrapped so any SW error is silently non-fatal.
4. TEST THE UPDATE PATH — this is where PWAs rot: deploy-simulate by bumping CACHE_VERSION, verify old caches are deleted on activate and changed HTML shows on next load; test offline mode in the preview (load a lesson, go offline via eval/devtools protocol if available, reload — lesson still works, uncached page shows offline.html).
5. Add "works offline once visited" honestly to the About/footer copy only after verifying.

If any part can't be verified end-to-end in this environment, say so explicitly in the report rather than shipping unverified caching logic. Standard verification. Tick P33 in ROADMAP.md.
```

---

## Phase 8 — Growth & SEO

### P34 — Cornerstone guides

```
StatsCapybara roadmap prompt P34 (see ROADMAP.md). Best after the Writing course + APA formatter exist. Run node tools/audit.js first.

Create guides/ — four long-form, search-magnet guides (~1,500–2,500 words each, folder+index.html clean URLs like lessons). These target the highest-intent queries a thesis student types. Written in the site's voice: warm, precise, zero fluff.

1. guides/analyze-thesis-data-jasp/ — "Analyze Your Thesis Data in JASP: Start to Finish". Import → descriptives → assumption checks → choosing the test (link which-test/plan) → running it → reading output → APA write-up (link formatter). Use HTML-mock output panels, not screenshots.
2. guides/spss-output-to-apa/ — "From SPSS Output to APA Results". The five most common analyses; annotated mock output → the exact APA sentence, with the classic misreadings flagged (Levene's row confusion, sig. = .000).
3. guides/choose-statistics-dissertation/ — "Choosing Statistics for Your Dissertation". The narrative version of the decision tree: outcome type → design → the test, with honest words about messy real designs; heavy links into lessons/tools.
4. guides/clean-survey-data/ — "Clean Your Survey Data, Step by Step". From raw export to analysis-ready: the Data-course workflow condensed with a worked example (use a P22 practice dataset if it exists).

Each guide: full per-page SEO + Article JSON-LD + BreadcrumbList; a linked table of contents; "part of StatsCapybara" cross-links throughout; a related-lessons footer. Integration: add a "Guides" group to the TOOLBOX (or extend group "guide"), SEARCH_PAGES + build-search-index.py page list + rerun, sitemap, QUIPS. Update CLAUDE.md (guides pattern). Standard verification. Tick P34 in ROADMAP.md.
```

### P35 — Cheat-sheet posters

```
StatsCapybara roadmap prompt P35 (see ROADMAP.md). Run node tools/audit.js first.

Create three printable one-page cheat sheets — the shareable/linkable assets teachers pin up and students keep. Standalone pages, print-first design (like formulas.html but poster-flavored), plain text/Unicode math, no dependencies.

1. cheat-test-chooser.html — "Which Test? One-Page Chooser": the which-test cheat table distilled into a poster-format decision grid (outcome type × design → test), with assumption footnotes.
2. cheat-apa.html — "APA Statistics Cheat Sheet": the report-this-way patterns for t/F/χ²/r/regression, italics rules, p-value rules, decimals table, the p = .000 ban.
3. cheat-assumptions.html — "Assumption Checks Cheat Sheet": per test family — what to check, how (Q-Q, Levene, residual plots), what to do when violated (Welch/GG/non-parametric/transform), each with its lesson link.

Each: screen view (nice card layout + big Print button) and an obsessive @media print layout that genuinely fits ONE page (verify in print preview at A4 AND US Letter); footer URL + tiny capybara; full per-page SEO targeting "statistics cheat sheet printable", "APA statistics reporting cheat sheet", etc.

Integration: TOOLBOX (group "guide"), SEARCH_PAGES + index rebuild, sitemap, QUIPS. Cross-link from formulas.html and the relevant lessons. Standard verification. Tick P35 in ROADMAP.md.
```

### P36 — Structured-data & metadata upgrade

```
StatsCapybara roadmap prompt P36 (see ROADMAP.md). Best after most courses exist. Run node tools/audit.js first.

Upgrade the site's structured data and metadata to match its grown scope. No content changes — this is machine-readability.

1. Homepage: upgrade the Course JSON-LD to an Organization + WebSite (keep the SearchAction) + an ItemList of Course objects (one per course, each with hasPart count, its track, and URL of its first lesson); counts must match curriculum.js (audit-enforced).
2. Lessons: verify LearningResource blocks state their course correctly post-P2 (isPartOf naming per course, not hardcoded "Stats 1"); educationalLevel sensible per track (e.g. toolkit courses "Intermediate").
3. quiz.html: add Quiz schema (about: the courses; keep it honest and minimal). Tool pages: add BreadcrumbList (Home → Toolbox → Tool). Guides (if P34 done): verify Article blocks.
4. Extend tools/audit.js: JSON-LD on every page parses AND passes a minimal required-fields check per type (name, url; mainEntity for FAQPage; itemListElement for BreadcrumbList).
5. Meta title/description review: dedupe check in audit (no two pages share a description); rewrite any description under 50 or over 160 chars; titles follow "Thing — StatsCapybara" consistently.
6. If I paste Google Search Console data below this prompt, use it: pages with impressions but CTR < 2% get title/description rewrites targeting the actual query phrasing. [PASTE GSC EXPORT HERE IF AVAILABLE]

Standard verification. Tick P36 in ROADMAP.md.
```

### P37 — Search-Console feedback loop (recurring — run monthly)

```
StatsCapybara roadmap prompt P37 (see ROADMAP.md) — RECURRING; run me monthly with fresh data. Run node tools/audit.js first.

Below this prompt I'm pasting exports from Google Search Console (top queries with clicks/impressions/CTR/position, and top pages) and anything notable from GA4. Turn them into concrete improvements:

1. Queries ranking 8–25 with real impressions = almost-there content: strengthen the matching page (expand its FAQ with the query's exact phrasing, enrich the section, add internal links from related lessons).
2. Queries with impressions but CTR < 2% at position ≤ 10 = title/description mismatch: rewrite that page's title/meta to speak the query's language (keep the "— StatsCapybara" pattern).
3. Queries we have NO page for = gap list: add FAQ entries where a lesson nearly covers it; propose (don't build) new lessons/guides for true gaps, appended to a "Backlog" section at the bottom of ROADMAP.md.
4. Top GA4 pages with high bounce/short engagement = check those pages' first screen: is the promise of the title delivered immediately? Fix the lede if not.
5. Anything in GSC's coverage/indexing report that flags errors → fix (and verify sitemap freshness).

Deliver: the diff + a short report table (query → action taken). Keep total scope to one session; queue the rest in ROADMAP.md's Backlog. Standard verification. Add a dated note under P37 in ROADMAP.md's tracker.

[PASTE GSC QUERIES EXPORT HERE]
[PASTE GSC PAGES EXPORT HERE]
[PASTE GA4 NOTES HERE]
```

---

## Phase 9 — Maintenance loops

### P38 — Quarterly health audit (recurring)

```
StatsCapybara roadmap prompt P38 (see ROADMAP.md) — RECURRING; run me quarterly.

Full site health pass:
1. node tools/audit.js — fix everything it raises.
2. Syntax-check all inline scripts across all pages (the CLAUDE.md extraction pattern) and node --check all shared JS.
3. External-link rot: collect all external hrefs sitewide, check reachability (HEAD/GET), replace or remove dead ones (Wayback link as last resort).
4. Dependency purity check: grep all pages for external URLs — the allowlist is googletagmanager.com/gtag and ko-fi assets only; anything else is a regression to remove.
5. localStorage schema sanity: sc-progress/sc-checks/sc-last (+ sc-cards) read/write paths still consistent; no key drift.
6. Statistical spot-audit: pick 5 lessons at random (different courses), re-verify every numeric claim in prose/FAQ/checks against authoritative values; pick 2 tools and re-run their verification gates (e.g. power.html's G*Power table, tables.html critical values).
7. CLAUDE.md accuracy review: does it still match reality (counts, file list, procedures)? Update where stale.
8. Lighthouse spot check on 3 page types; investigate regressions.
9. Browser pass: homepage/lesson/tool in light+dark+mobile, zero console errors.

Deliver a short health report (what was checked, what was fixed, what's deferred). Add a dated note under P38 in ROADMAP.md's tracker.
```

### P39 — Content refresh loop (recurring)

**Rewritten 27 Jul 2026, after 13 runs.** The original seven items were written before the loop had ever run; thirteen runs showed which of them earn their place and which had gone stale. Four changes, each from evidence in the tracker notes. **(a) Selection.** "5 least-recently-touched (git log per file)" is now self-polluting — thirteen P39 commits dominate the dates, and run 13 spent real effort reconstructing which lessons had ever been subjects. That census now lives in **ROADMAP.md's subject ledger**; the prompt reads it instead of re-deriving it. **(b) The absence grep is promoted to step 1.** Invented in run 8 and used in every run since, it has produced the best content on the site (restriction of range, regression to the mean, Cohen's κ, tolerance, Bartlett/KMO, listwise/pairwise, Schoenfeld residuals, information gain, cost-complexity pruning, a confidence interval on a test score) — and it was never in the prompt at all. **(c) Cross-pollination is obsolete as written**: there is no "newest course/tool" after P72, and runs 11–13 quietly reinterpreted it as orphan-clearing. After run 13 exactly one page is left at zero inbound links, so the item now names a measured question with a stated fallback. **(d) The backlog item was dead** (no Backlog section exists, P37 is still unrun) and became the most valuable item by accident: three consecutive runs turned it into a permanent checker (`audit.js` CHECK 9, the eponym scan, the JS-prose lint). That is now the instruction, not the improvisation. Two verification steps that caught real defects are promoted out of the notes and into the numbered list — searching the rebuilt index for the terms the run just added (which found, in run 13, that 27% of the site's lesson prose was unsearchable), and reading the diff back against VOICE.md (seven consecutive runs wrote a banned construction and caught it only this way). Model **Extra Powerful**, effort **Max**: the loop is judgment-heavy, touches shared registries, and its whole value is in what a careful reader notices.

```
StatsCapybara roadmap prompt P39 (see ROADMAP.md) — RECURRING; run me a few times a year.

Keep the content alive without bloating it. Read ROADMAP.md's P39 SUBJECT LEDGER and the last two run notes first, then VOICE.md.

1. Pick 5 subjects from the ledger's "never yet a subject" list — prefer a coherent thread (one course's spine, or one concept running across courses) over a scattered five; break ties toward the least-recently-touched. Re-read each critically: dated, unclear, over-promising, or missing a cross-link to something built since it was written? Surgical improvements only.

2. Hunt absences BEFORE writing anything. The richest defect on this site is a term it USES and never TEACHES: grep each candidate term across tool pages, guides, problems.html, quiz.html, the injected blocks (checks/software/snippets) and all 97 lessons. Zero teaching hits on a term the site reports, tests or tells readers to tick is a gap worth a section. Confirm every absence with the grep — never assume one.

3. Verify every number you publish before you publish it. node -e with VIZ for anything distributional; R is installed (4.5.2, with car/survival/rpart/tidyr/dplyr — no scientific Python) so run the R lines you add. Simulate claims that sound like folklore rather than repeating them. Record the verification in the run note.

4. FAQ freshness: swap on merit, not on quota. Read a lesson's three against all 291 (tools/faq_data.py) — replace any that restates its own lesson's h2 or duplicates another page's answer, and leave three strong ones alone (run 12 correctly swapped none on one lesson and two on another). Keep exactly 3 per lesson; rerun inject-faqs.py + build-search-index.py.

5. software.js drift: verify 3–4 walkthroughs you haven't checked in the last three runs (rotate — most subjects have no entry). Check the CURRENT SPSS/JASP release notes for renames rather than trusting memory, and record the versions checked in the note.

6. Snippets drift: spot-check R/Python snippets against current package APIs; fix deprecations; run every R line you touch.

7. Link health, measured: count inbound lesson links to every tool, guide and poster, and outbound prose links per lesson. Clear the worst orphan with ~5 natural placements (resist over-linking). When nothing sits at 0 inbound, switch to the next question: lessons with 0–1 outbound links, and dead-end lessons that never point forward.

8. Quips: refresh any that have worn thin. The recurring defect is a second clause that only restates the first. One good line beats three mediocre ones.

9. Backlog: if ROADMAP.md has a Backlog section (from P37), clear ONE small item. If it does not, BUILD A CHECKER instead — turn the class of defect this run found by hand into something a future run cannot miss, and prove it by reintroducing the defect and watching it fire. Keep it out of audit.js unless it is genuinely build health.

Verification (all of it, in this order):
  node tools/audit.js · node tools/math-check.js · node tools/prose-lint.js --strict
  syntax-check every changed page's inline scripts + JSON-LD, all shared JS, and faq_data.py
  rebuild the search index, THEN search it for every term this run added — a MISS means either the word or the indexing is wrong, and run 13 found a 27%-of-prose truncation bug this way
  browser pass over every changed page at 1200px and 375px: expected strings present, 0 console errors, 0 leading-slash links, 0 horizontal scroll, new link targets 200, dark mode
  read the whole diff back against VOICE.md before committing — the linter cannot see prose you are about to write
  bump CACHE_VERSION in sw.js if any precached shell asset changed
Add a dated note under P39 in ROADMAP.md's tracker, and UPDATE THE SUBJECT LEDGER LINE.
```

**Where the loop ends, and what lap 2 is.** Lap 1 finishes when the ledger empties (≈7 runs after run 13). It is not the end of the loop, but it is the end of *this* loop's job: after every lesson has had one critical re-read, the absence-grep well is largely dry and re-reading in staleness order stops paying. Lap 2 should be a different pass over the same pages, driven by whatever P37 finally supplies (real Search-Console queries: which lessons people reach and bounce from) and by the two standing observations no run has cleared — **24 of 291 FAQ questions open with "What is the difference between X and Y?" and 59 with "What is", a template no linter measures**, and `apa.html` emits no confidence interval while the lessons now teach that APA 7 asks for one. Until then, keep running lap 1: run 13 was the thirteenth pass and still found a defect affecting a quarter of the site's prose, so the yield has not fallen off.

---

## Phase 10 — The human-voice edit (P40–P46)

The site's prose was written by one AI in one style in two weeks, and it shows — see ROADMAP.md's Phases 10–11 addendum for the measured baseline (median 24 em-dashes per lesson, ~80 "No —/Yes —" verdict openers, one meta-description formula on a third of all pages, templated lesson openers). P40 builds the standard and the measuring stick; P41–P46 do the editing in six bounded batches. **The iron rule for every batch: prose only — no verified number, statistical claim, formula, code block, element id/class/anchor, link target, or interactive may change.** Quips, the capybara, and the emoji block headers are brand chrome, not slop — they stay.

### P40 — Voice charter + prose linter

```
StatsCapybara roadmap prompt P40 (see ROADMAP.md — read the Phases 10–11 addendum first; it has the measured baseline). Run node tools/audit.js first.

The site's writing is accurate and warm but machine-regular: the same constructions repeat across all 95 lessons, and readers who notice will file the whole site under "AI slop". This prompt creates the standard and the measuring stick; P41–P46 do the rewriting.

1. Write VOICE.md at the repo root (committed). It is the editorial law for all future prose. Contents:
   - The goal in one line: pages that read like one good lecturer wrote them over months — same person, different days — not one process in one pass.
   - HARD RULES (lintable budgets): em-dashes ≤ 10 per lesson/guide/tool page of prose and ≤ 1 per FAQ answer on average **[SUPERSEDED by P73, 15 Aug 2026 — the dash budgets are now ≤ 4 per page AND ≤ 8 per 1,000 words, ≤ 1 across a lesson's whole FAQ trio, plus per-surface budgets for the injected JS strings. The line below is what P40 was asked to write; VOICE.md is the live law.]**; ZERO instances of the banned constructions: the "isn't/wasn't just X — it's Y" contrast punch (and its "it's not about X — it's Y" cousins), "Here's the thing/why/how", "The point is", "That's the whole point/lesson/job", FAQ answers opening with "No — "/"Yes — " (state the actual fact first instead; a bare "No." as a full first sentence is fine occasionally), "Think of it as" (allow ≤ 3 sitewide), "quietly" as an intensifier, "Notice how/that" (≤ 1 per page); meta descriptions built on "…and watch…" capped at 15% of pages.
   - SOFT RULES (judgment): vary sentence length within a paragraph — let a plain declarative sentence exist without a twist; not every list needs exactly three items; not every contrast needs a dash; openers within a course must not share a template (open some lessons with a definition, some with a concrete scenario, some with a number, some with a student's actual question); the three FAQ answers on one page should not all open the same way; prefer deleting a flourish to replacing it — word count should go DOWN.
   - ANTI-RULES (overcorrection is also a tell): don't swap every em-dash for a semicolon (a semicolon plague is worse); don't strip the warmth or the capybara personality; quips are exempt brand voice; the injected emoji block headers ("🧠 …", "🖱️ …") are site chrome — leave them.
   - The read-aloud test: before shipping a page, read one paragraph aloud; if it sounds like a keynote, flatten it.
2. Build tools/prose-lint.js — zero-dependency Node, run from the repo root, documented in CLAUDE.md's Commands section. It extracts rendered prose (strip <script>/<style>/tags, decode entities) from every lesson, guide, and audited root page, plus every answer string in tools/faq_data.py and every meta description. Per page it reports: word count, em-dash count and rate per 1,000 words, and per-pattern hit counts from a PATTERNS table at the top of the script that mirrors VOICE.md's hard rules (keep the two in sync — say so in comments in both). Sitewide it reports: the "…and watch…" description share, total hits per pattern, and the 10 worst pages. Modes: default = full report sorted worst-first; --page <path> = one page; --strict = exit 1 if any hard budget is exceeded. Deliberately NOT wired into audit.js (voice is editorial judgment, not build health) — but document it in CLAUDE.md next to audit.js, plus a short "Voice" note pointing prose-writing sessions at VOICE.md.
3. Run the baseline: paste the sitewide summary and the worst-10 table into your final report, and note the baseline numbers under P40's tick in ROADMAP.md so P41–P46 can show measured progress.

Standard verification (audit stays clean; node --check the new script; no content changes in this prompt). Tick P40 in ROADMAP.md.
```

### P41 — Voice pass: Stats 1 + Stats 2

```
StatsCapybara roadmap prompt P41 (see ROADMAP.md). Requires P40 (VOICE.md + tools/prose-lint.js). Run node tools/audit.js AND node tools/prose-lint.js first; save the lint baseline for the report.

De-AI editing pass over Stats 1 (13 lessons) and Stats 2 (10 lessons): each lesson's prose, its 3 FAQ answers in tools/faq_data.py, and its meta description (keeping the og:/twitter:/JSON-LD description copies in sync — audit checks enforce length and sitewide dedupe).

Rules of engagement (VOICE.md is the law):
1. Surgical prose edits only. Never touch: numbers, statistical claims, formulas, code, element ids/classes/anchors, link targets, the viz, or the JSON-LD beyond its description string. If a factual sentence gets rewritten, the fact survives with identical meaning. Restructure HTML only where a sentence is cut or two are merged.
2. Kill every hard-banned construction in scope and get every page under the em-dash budget by VARYING the fixes — commas, periods, parentheses, actual restructuring — not a blanket swap to semicolons.
3. De-template the batch as a SET: the 23 opening paragraphs must not share one rhythm; read them consecutively as your own check. FAQ answers stop opening with verdict words. Prefer deletion; batch word count must not grow.
4. FAQ edits go through faq_data.py + ./tools/inject-faqs.py (never hand-edit lesson FAQ HTML), then rerun ./tools/build-search-index.py.

Verification: node tools/prose-lint.js --strict passes for every page in the batch; before/after table (em-dash count + banned hits per page) in the report; node tools/audit.js clean; browser-check 3 rewritten lessons in light+dark (prose renders, TOC anchors, FAQ details and FAQPage JSON-LD intact); then read ONE rewritten lesson start to finish as the final smell test and say honestly in the report whether it passed. Tick P41 in ROADMAP.md.
```

### P42 — Voice pass: Stats 3 + Stats 4

```
StatsCapybara roadmap prompt P42 (see ROADMAP.md). Requires P40. Run node tools/audit.js AND node tools/prose-lint.js first.

Same de-AI editing pass as P41 (same four rules of engagement — VOICE.md is the law, prose only, de-template the batch as a set, FAQs via faq_data.py + inject + search-index rebuild), applied to Stats 3 (12 lessons) and Stats 4 (10 lessons).

One extra care point: these are the advanced courses — the prose leans hardest on precise technical claims (assumption conditions, model-comparison logic, Bayesian statements). When a sentence carries a technical qualifier ("under equal variances", "given the null"), the qualifier survives every rewrite verbatim in meaning.

Verification: as P41 (prose-lint --strict on the batch, before/after table, audit clean, 3-lesson browser check, one full read-aloud-style pass). Tick P42 in ROADMAP.md.
```

### P43 — Voice pass: Methods + Data

```
StatsCapybara roadmap prompt P43 (see ROADMAP.md). Requires P40. Run node tools/audit.js AND node tools/prose-lint.js first.

Same de-AI editing pass as P41 (same four rules of engagement), applied to Methods (12 lessons) and Data (10 lessons).

Extra care points: these courses tell stories (Clever Hans, WEIRD samples, the 87% re-identification result, replication-crisis history) — keep every historical fact and cited figure byte-identical in meaning; the forking-paths and optional-stopping framing must stay honest and non-alarmist. The scenario/vignette text inside interactives (triage cases, fix-this-survey items) counts as prose and is IN scope, but its correct/incorrect logic and scoring are NOT — verify any touched interactive still behaves identically (round-trip its controls).

Verification: as P41. Tick P43 in ROADMAP.md.
```

### P44 — Voice pass: Ethics + ML

```
StatsCapybara roadmap prompt P44 (see ROADMAP.md). Requires P40. Run node tools/audit.js AND node tools/prose-lint.js first.

Same de-AI editing pass as P41 (same four rules of engagement), applied to Ethics (8 lessons) and ML (12 lessons).

Extra care points: Ethics keeps its sober register — de-telling here means removing the machine rhythm, not adding levity; Tuskegee/Milgram/Stapel content changes only where a banned construction demands it, and gently. The ML course's ai-in-research-ethics sibling and llms-and-ai-in-research are the highest-irony pages on the site (AI-sounding prose about AI) — give them the deepest pass; ethics/ai-in-research-ethics is currently the single worst page at 49 em-dashes.

Verification: as P41. Tick P44 in ROADMAP.md.
```

### P45 — Voice pass: Writing course + guides + posters

```
StatsCapybara roadmap prompt P45 (see ROADMAP.md). Requires P40. Run node tools/audit.js AND node tools/prose-lint.js first.

Same de-AI editing pass as P41 (same four rules of engagement), applied to the Writing course (8 lessons), the four guides/<slug>/ pages, and the three cheat-<slug>.html posters.

Extra care points: (1) The Writing course TEACHES prose style — after de-telling it, its own advice and its own writing must agree; treat that as an explicit check. (2) The guides are the SEO magnets: keep the searchable phrasing in headings and the query-shaped H2/H3s intact (a de-AI pass that deletes "How do I report a t-test in APA?" phrasing costs rankings); edit the body voice, not the search surface; every worked number stays byte-identical. (3) Posters are terse reference text — light touch, mostly banned-construction and dash-budget cleanup; afterwards REVERIFY one-page print fit at A4 and Letter the P30/P35 CSSOM way, since text length changed. Guides/posters edits → rerun ./tools/build-search-index.py.

Verification: as P41, plus the poster fit re-measurement. Tick P45 in ROADMAP.md.
```

### P46 — Voice pass: tools, homepage & sitewide finish

```
StatsCapybara roadmap prompt P46 (see ROADMAP.md). Requires P40; run me LAST of the Phase-10 batches. Run node tools/audit.js AND node tools/prose-lint.js first.

The closing sweep, in three layers:

1. Remaining pages: all tool pages' prose (intros, help text, empty states, pro tips — including toolbox.html, datasets.html's stories and worked-solution text [every number untouchable], quiz.html copy, 404.html, offline.html) and the homepage + About section (hero sub-line, persona cards, "Why it's different", accessibility statement, instructor bio). The H1 brand line "Statistics You Can See, Touch, and Understand" and the matching <title>/og tags STAY — if a genuinely stronger line occurs to you, propose it in the report; don't change it. glossary-data.js definitions get a skim for banned constructions (they're mostly terse and fine); glossary edits → search-index rebuild.
2. The injected-string layer (outside prose-lint's scope — apply VOICE.md by hand): checks.js "why" strings, software.js "tips" arrays (the APA example sentences' statistical content is untouchable), snippets.js comment lines. These are lazy-loaded (no SW bump needed) — but if site.js changes at all, bump CACHE_VERSION in sw.js.
3. The sitewide finisher: run node tools/prose-lint.js --strict across EVERYTHING and fix stragglers from any earlier batch; meta-description variety pass — bring the "…and watch…" formula share under VOICE.md's 15% cap sitewide while keeping every description 50–160 chars and sitewide-unique (audit-enforced); rerun ./tools/build-search-index.py once at the end.

Verification: prose-lint --strict passes SITEWIDE (paste the final sitewide summary vs the P40 baseline — this is Phase 10's exit number); audit clean; browser pass on homepage + one tool + 404 in light+dark, zero console errors. Tick P46 in ROADMAP.md.
```

---

## Phase 11 — Feel & instructors (P47–P48)

### P47 — Interaction-feel polish

```
StatsCapybara roadmap prompt P47 (see ROADMAP.md). Run node tools/audit.js first.

A sitewide "feel" pass — the small tactile details that separate hand-made from generated. Constraints: keep it CALM (no bounce, no parallax), respect prefers-reduced-motion everywhere (VIZ.reducedMotion / the CSS block), zero new dependencies, no build step.

1. Anchor comfort: nothing on the site sets scroll-margin — TOC-chip clicks and deep links (#run-it, #about, guide TOCs) land headings underneath the sticky nav. Add scroll-margin-top (nav height + breathing room) to anchor targets globally in styles.css; verify a lesson TOC click and a plan.html → #run-it deep link both land fully visible.
2. Canvas cursor affordances as a CONVENTION: today only the hero slider and stats-3/assumptions-of-regression set grab/grabbing. Sweep every interactive canvas (lessons + tools): draggable → grab/grabbing, click-to-add/select → pointer or crosshair, display-only → default. Wire it consistently (a small helper if it stays clean) and document the convention in CLAUDE.md's viz notes.
3. Copy feedback: apa.html, descriptives.html, and correlation.html each hand-rolled their own "Copied" state. Standardize one pattern (same wording, same transient timing, aria-live polite) and apply it to EVERY copy button sitewide.
4. Hover/press consistency audit: course cards, toolbox tiles, persona cards, buttons, prev/next links — consistent hover elevation and a subtle :active press state from shared rules, not per-page one-offs; :focus-visible (P28) untouched.
5. <details> smoothness: FAQ and checks blocks currently snap open. Animate the reveal (the CSS grid-template-rows 0fr→1fr technique or equivalent — still works when JS force-opens them for print); instant under reduced motion.
6. Range inputs: lesson/tool sliders use default thumbs while the hero has a custom one — restyle range inputs sitewide (WebKit + Firefox pseudo-elements) into one family, keeping ≥44px touch targets.
7. Mobile scroll affordance: horizontally scrolling containers (cheat tables, apa.html's 5-way seg, ref-tables) get an edge-fade cue where content actually overflows (scroll-driven or a small scroll-listener toggle).
8. 404.html: one pass to make it charming AND useful (capybara, a link to search, 3–4 popular destinations) — it must stay fully self-contained (inline CSS, JS-computed home link).

styles.css and site.js are precached shell assets — bump CACHE_VERSION in sw.js. Verify in the preview: light+dark+mobile, reduced-motion (emulate via CSSOM/eval), zero console errors; screenshot 2–3 before/afters; print still correct on one lesson (details animation must not break the beforeprint force-open). Standard verification. Tick P47 in ROADMAP.md.
```

### P48 — For Instructors page + embed mode + viz PNG export

```
StatsCapybara roadmap prompt P48 (see ROADMAP.md). Best after Phase 10 (VOICE.md applies to all new prose). Run node tools/audit.js first.

Professors are the multiplier audience — one syllabus link is a semester of students. Three deliverables:

1. teachers.html — "For Instructors" (a group "read" tool page). Calm, honest, VOICE.md-compliant. Content: how to use the site in a course — deep-linking lessons from a syllabus/LMS and what students see (no accounts, no tracking, progress stays in the student's browser — say this plainly, it's a selling point); print handouts (P30) and the three posters as classroom materials; the practice datasets for assignments (seeded and reproducible — same numbers for every student); quiz/flashcards for revision; how to embed a viz (below); a suggested week-by-week mapping of Stats 1–2 onto a typical one-semester intro course (table, lesson links); and a short "link to us / it's free forever" note replacing any license ambiguity. Integrate per the six-place tool-page checklist (TOOLBOX, SEARCH_PAGES, QUIPS, build-search-index.py + rerun, sitemap.xml, audit ROOT_PAGES) + BreadcrumbList JSON-LD.
2. Lesson embed mode: site.js handles ?embed=1 on lesson pages — hide nav, sidebar, footer, checks, software, FAQ, prev/next, resume/progress chrome; keep eyebrow + title + the .viz block(s) with controls; add a one-line footer "From StatsCapybara — open the full lesson →" (BASE-aware absolute link, target="_top"). Test inside an actual <iframe> on a scratch page AND on the subpath server; canonical already points at the clean URL, so no SEO wrinkle — but confirm GA still fires once. Document the mode in CLAUDE.md and on teachers.html with a copy-ready iframe snippet.
3. Viz PNG export: a small unobtrusive "PNG ↓" button injected next to each .viz-title (lessons + canvas tool pages) that downloads that canvas at 2× via toDataURL, filename statscapybara-<slug>-<n>.png, current theme as-is; hidden in print; skip decorative canvases (the hero demo). Keyboard-accessible, aria-labelled.

site.js is a precached shell asset — bump CACHE_VERSION in sw.js. Standard verification incl. the subpath server and the iframe test; browser-verify a downloaded PNG is crisp at 2×. Tick P48 in ROADMAP.md.
```

---

## Phase 12 — Requests & polish (P49–P57)

Hand-picked fixes and upgrades from Hakan's 16 Jul 2026 review of the live site. Independent and cherry-pickable; the two front-of-house items (P54, P55) are the highest impact-per-effort.

**Each prompt names a recommended model + effort** (pick them when you start the session):

- **Model — Powerful** = Claude Sonnet (well-scoped, single-area, or mechanical work). **Extra Powerful** = Claude Opus (site-wide, new-lesson, or judgment-heavy work).
- **Effort — High** = one focused pass, standard verification. **Extra** = elevated reasoning (several related changes or a bug to diagnose). **Max** = maximum single-agent reasoning + verification (high blast radius: site-wide / homepage / new lesson). **Ultra** = multi-agent deployment (parallel build + independent verification/review, e.g. `/code-review ultra` on the branch).

Course-number key (toolkit courses restart at 1): Stats 1–4 = `stats-1…4`; Methods = `methods/*` (1.x), Data = `data/*` (2.x), Ethics = `ethics/*` (3.x), ML = `ml/*` (4.x), Writing = `writing/*` (5.x). Section numbers below are the on-page eyebrows.

### P49 — Stats 1 interactive upgrades

**→ Powerful · Extra effort**

```
StatsCapybara roadmap prompt P49 (see ROADMAP.md). Run node tools/audit.js first.

Three upgrades to Stats 1 lesson interactives. Preserve the frozen-noise pattern (seeded pools, deterministic gen/rebuild, "New sample" reseeds) and don't touch prose beyond captions the change makes stale.

1. stats-1/sampling-distributions — "🎮 Build a Sampling Distribution" only ever samples from one fixed skewed population. Add a population-shape selector (Skewed / Uniform / Bimodal — reuse the exact shapes + pattern from stats-1/central-limit-theorem so the two lessons agree) so students watch the sampling distribution form from different parents. Update the "(fixed, and deliberately skewed)" caption and any prose that assumes a single shape.
2. stats-1/sampling-distributions AND stats-1/central-limit-theorem — change the "Draw 50" / "Draw 50 (animated)" button to Draw 100 (button label + the drawMany(50) → 100 call). Honour VIZ.reducedMotion() (jump to the final frame). Leave the n-range slider max unless 100 reads better.
3. stats-1/hypothesis-testing-logic — in "🎮 P-Value Explorer" the orange shaded tail doesn't meet the bell curve; there's a visible gap between the fill's top edge and the stroked outline. Diagnose (shadeRegion samples the pdf at a different step/scale/baseline than the curve) and make the fill reuse the SAME sampled points + baseline as the curve so they coincide exactly.

SWEEP (the issue may recur — Hakan flagged one example, judge the rest): the same tail-shading pattern is in stats-1/z-scores-and-the-normal-distribution, tables.html, and distributions.html — check each and fix any identical fill-vs-curve gap.

No precached shell asset changes → no CACHE_VERSION bump. Standard verification (slider round-trip on each; screenshot the P-Value fill meeting the curve in light + dark). Tick P49 in ROADMAP.md.
```

### P50 — Stats 2 interactive fixes

**→ Powerful · High effort**

```
StatsCapybara roadmap prompt P50 (see ROADMAP.md). Run node tools/audit.js first.

Two layout fixes in Stats 2 interactives.

1. stats-2/post-hoc-tests — in the "fooled experiments" readout the two paired stats "Experiments fooled · no correction" (#stat-unc) and "Experiments fooled · Bonferroni" (#stat-bonfr) don't sit together. Put "· no correction" on the SAME row, to the LEFT of "· Bonferroni" (they're the direct comparison, so they belong side by side); the "Bonferroni per-test α" stat can sit on its own row above. It's a .stat-row / .stat grid/flex tweak — verify at desktop AND mobile widths that the two never re-order or wrap apart.
2. stats-2/simple-linear-regression — the "🎮 Least-Squares Playground" canvas is cramped and claustrophobic (H = 360). Enlarge the plotting area (raise the canvas height and/or set a taller --viz-ar, add plot padding) without breaking the drag-a-point interaction, the frozen data, or CLS.

SWEEP: if other draggable-scatter lessons feel equally cramped, note them in your summary (don't necessarily resize).

No precached shell asset changes → no CACHE_VERSION bump. Standard verification. Tick P50 in ROADMAP.md.
```

### P51 — Stats 3 interactive fixes

**→ Powerful · High effort**

```
StatsCapybara roadmap prompt P51 (see ROADMAP.md). Run node tools/audit.js first.

Four small fixes in Stats 3 interactives. No prose/stat changes beyond the control ranges.

1. stats-3/multicollinearity-and-variable-selection — in "🎮 Watch the Coefficients Go Haywire" the Severity readout (#stat-sev) shifts horizontally as its label length changes ("Low" ↔ "Catastrophic"). Pin it: give the value a fixed min-width (or a tabular/grid cell) so nothing to its right reflows as severity updates.
2. stats-3/ancova — raise "True treatment effect" max from 15 to 20 (#eff-range max="15" → "20"). Confirm the canvas y-scale still frames the largest effect without clipping.
3. stats-3/mediation-and-indirect-effects — the path-diagram arrowheads disappear when the path lines are thick. Enlarge the arrowheads and scale them with lineWidth so they stay visible at maximum thickness. SWEEP: stats-4/causal-dags-and-confounding draws similar arrows — check it for the same weakness.
4. stats-3/logistic-regression — raise "Steepness (b₁)" so the displayed value reaches 0.5 (the slider is scaled ×100: #b1-range max="40" → "50").

No precached shell asset changes → no CACHE_VERSION bump. Standard verification (round-trip each slider to identical readouts). Tick P51 in ROADMAP.md.
```

### P52 — Stats 4 interactive fixes

**→ Powerful · High effort**

```
StatsCapybara roadmap prompt P52 (see ROADMAP.md). Run node tools/audit.js first.

Two fixes in Stats 4 interactives.

1. stats-4/bayesian-thinking — in "🎮 Prior → Data → Posterior" the x-axis label ("possible value of p →") overlaps the tick numbers along the baseline. Separate them: add bottom padding / raise the canvas height and draw the axis label clearly below the ticks so they never collide.
2. stats-4/generalized-linear-models — widen the Intercept b₀ and Slope b₁ slider ranges (they're set in the inline JS, not the HTML min/max) so the fitted mean curve can move more. Keep the fixed data cloud + frozen-noise behaviour, and confirm the curve stays on-canvas at the new extremes.

No precached shell asset changes → no CACHE_VERSION bump. Standard verification. Tick P52 in ROADMAP.md.
```

### P53 — Repair two dead toolkit interactives

**→ Powerful · Extra effort**

```
StatsCapybara roadmap prompt P53 (see ROADMAP.md). Run node tools/audit.js first.

Two interactives that don't work. Read each inline script, reproduce the failure in the preview, fix, and confirm the readouts populate.

1. data/data-cleaning-workflow — in "Cleaning Pipeline Simulator" the Control and Treatment bars always render empty (no fill). Diagnose (likely a data-binding / scale / zero-height fillRect bug) and make the bars draw their real values through the cleaning steps.
2. writing/abstracts-and-titles — the "🎯 Abstract grader" vague → findable title rewrite doesn't work (the rewrite/scoring path is broken). Diagnose and fix so the before/after demo produces its intended output.

SWEEP: while here, click through the other toolkit-lesson interactives; flag (don't necessarily fix) anything else visibly dead in your summary.

No precached shell asset changes → no CACHE_VERSION bump. Standard verification (drive each interactive in-browser; screenshot the fixed output). Tick P53 in ROADMAP.md.
```

### P54 — Site-wide: make in-prose links look clickable

**→ Extra Powerful · Max effort**

```
StatsCapybara roadmap prompt P54 (see ROADMAP.md). Run node tools/audit.js first.

The base rule `a { color: inherit; text-decoration: none }` in styles.css leaves body-prose links indistinguishable from ordinary text — readers can't tell they're clickable. Example (one of many): the "Descriptives calculator / Power calculator / APA formatter" links in the paragraph at datasets.html#admissions render as plain text. This is site-wide: lesson prose, callouts, FAQ answers, guides, and tool-page copy all inherit it.

Add a CONTENT-SCOPED link treatment: in prose contexts (lesson/guide article body, .callout, .faq-a, tool-page .lesson copy, datasets/toolbox body text, the About bio already does this well — reuse its look: brand colour + underline with text-underline-offset, thickening/darkening on hover) links become clearly clickable. Do NOT underline or recolour chrome that is intentionally styled as UI: the nav, tool/course/persona cards, the toolbox grid, sidebar, prev/next, the "On this page" TOC, buttons, segmented controls, search results, breadcrumb-style chips. This is a scoping problem — target prose containers, exclude UI. Prefer a small number of well-scoped selectors over a blanket `a{}` change plus a long exclusion list.

Verify in light AND dark across ≥6 page types (a lesson, a guide, datasets.html, toolbox.html, a cheat poster, the homepage About) that prose links are obviously clickable and NO card / nav / button / TOC gained an unwanted underline or colour. Confirm the @media print link rule (underline, black) still wins.

styles.css is a precached shell asset → BUMP CACHE_VERSION in sw.js. Standard verification. Tick P54 in ROADMAP.md.
```

### P55 — Front door: Toolbox prominence + homepage declutter

**→ Extra Powerful · Max effort**

```
StatsCapybara roadmap prompt P55 (see ROADMAP.md). Run node tools/audit.js first.

Four "first impression" changes. The Statistics Toolbox has quietly become the site's most useful hub (it grew into a catch-all for every tool) but it reads as a faint dropdown, and the homepage hides most of it.

1. Nav prominence — make the "Statistics Toolbox" nav item stand out from Curriculum / About (an icon or emoji before the label, heavier weight, and/or a subtle pill). Keep the hover/focus dropdown + click-to-toolbox.html behaviour, keep mobile (single link, no dropdown), keep the :focus-visible ring and the active state.
2. Homepage: don't collapse the toolbox. renderToolbox() in site.js currently shows only star:true tools plus an "All N tools →" card, so most tools hide behind that card. Show the FULL box on the homepage instead (the grouped grid like toolbox.html, or all tools) — tidy but complete, nothing collapsed.
3. Remove "Why it's different" — delete the .features "Why it's different" section from index.html (leave the shared .feature CSS in place).
4. Repoint the hero CTA — "Start with Stats 1" currently lands on the flat stats-1/what-is-statistics/. Point it at a striking first impression — stats-1/central-limit-theorem/ (or another cool lesson) — and reconcile the button label (e.g. "See statistics in motion →"). Use judgment on the "Begin with 1.1" persona card (it's the logical first step; leave it or adjust).

Guard the homepage's OG/JSON-LD counts and the data-count spans (don't break audit checks 6/7). If site.js changes, BUMP CACHE_VERSION in sw.js. Standard verification (homepage light + dark + mobile; nav on a lesson AND a tool page). Tick P55 in ROADMAP.md.
```

### P56 — "Capybara says" replaces "Why it matters" (site-wide)

> **DROPPED — 17 Jul 2026.** Hakan reconsidered: the "Why it matters" callouts stay as they are. Kept for the record only; **do not run this prompt.**

**→ Extra Powerful · Max effort** *(Ultra if you want bespoke per-lesson capybara lines — see note)*

```
StatsCapybara roadmap prompt P56 (see ROADMAP.md). Run node tools/audit.js first.

Every lesson ends its core with a flat `<strong>Why it matters:</strong>` callout (95 lessons). Turn that into a branded "Capybara says" moment that actually uses the mascot: a distinct callout style carrying the hand-drawn capy() SVG (NEVER a beaver 🦫 / hamster 🐹 emoji — there is no capybara emoji), a warm label, and the same substance.

Pick the cleanest mechanism and say why: (a) a shared-layer restyle — one CSS + site.js change keyed off a class, plus a mechanical per-lesson label swap — or (b) a scripted transform of the 95 blocks. Keep VOICE.md: quirky but not flippant, and Ethics lessons stay sober (no levity on Tuskegee/Milgram/etc.). Keep it print-friendly (it currently prints) and accessible (SVG aria-hidden; the text carries the meaning). Do NOT touch the substance, numbers, or links inside the callout. If you reword any blurb to be more voiced, every factual claim survives intact — run tools/prose-lint.js.

Shared asset change (site.js and/or styles.css) → BUMP CACHE_VERSION in sw.js. If any prose text changes, rerun python tools/build-search-index.py. Standard verification on ≥3 lessons across different courses (include an Ethics lesson) in light + dark + print. Tick P56 in ROADMAP.md.

NOTE — Ultra option: for genuinely bespoke, quirky capybara one-liners on all 95 lessons (rather than a restyle of the existing copy), run this as a multi-agent Ultra job: one agent drafts per course, one checks voice + that no factual claim moved, one runs audit + prose-lint + a11y/print.
```

### P57 — New lesson: Psychometric Functions & the PSE

**→ Extra Powerful · Ultra (multi-agent)**

```
StatsCapybara roadmap prompt P57 (see ROADMAP.md). Run node tools/audit.js first.

Add a new lesson on FITTING PSYCHOMETRIC FUNCTIONS — the page a psychophysics supervisor points students to. Frame it generally (proportion of "long"/"yes" responses vs a stimulus level in a 2AFC or bisection task) with the TEMPORAL BISECTION PROCEDURE as the worked example: fit a curve (offer logistic / cumulative-Gaussian / Weibull), read off the PSE (point of subjective equality — the 50% point) and the slope / JND (just-noticeable difference), and show how an experimental manipulation (e.g. a brighter stimulus perceived as longer) either SHIFTS the PSE or CHANGES the slope.

Interactive (frozen-noise pattern, VIZ helpers, statistics must be correct and verified — this is for real students):
- proportion-response points across stimulus levels, with a live fit of the chosen function (MLE or least-squares) drawn through them;
- PSE and slope/JND readouts that update with the fit;
- a "manipulation" control that shifts the curve so students see a PSE shift vs a slope change side by side (a two-curve compare is ideal);
- a function selector (logistic / Gaussian / Weibull) so they see the choice barely moves the PSE but changes the tails.
Verify the math: recover a known PSE/JND from simulated data, and check each curve's equation against a textbook form.

Placement: recommend APPENDING as a new Stats 4 section (Modern & Advanced — it's applied MLE curve-fitting, next of kin to stats-3/logistic-regression and stats-4/generalized-linear-models), so no eyebrow renumbering. Alternatively frame it as a Methods procedure lesson. CONFIRM the course + slug before building; APPEND, never insert.

Do the full "Standard lesson integration" (CLAUDE.md): curriculum.js (ready:true, appended), page copied from an existing Stats 4 lesson with ALL per-page SEO retargeted, correct data-course/data-section + Section N.n eyebrow, 3 checks, 3 FAQs (+ inject-faqs), a QUIPS line, glossary terms for PSE + JND, a course-tagged quiz question, R/Python snippet (psignifit / a logistic GLM fit) and SPSS/JASP+APA if applicable, then rerun make-og-images.py --retag-only (existing course) + build-search-index.py + add to sitemap.xml. Cross-link logistic regression and GLM.

Run as ULTRA (multi-agent): one agent builds the lesson + interactive, one independently verifies the psychometric-fit math (PSE/JND recovery, curve equations), one runs audit + prose-lint + a11y. Standard verification + full slider/drag round-trip. Tick P57 in ROADMAP.md.
```

---

## Phase 13 — Requests round 2 (P58–P60)

Hakan's 17 Jul 2026 review: two teaching-content upgrades and the front-door follow-through. Model/effort legend as in Phase 12. **P58 and P59 share registries (`curriculum.js`, `faq_data.py`, the search index) — run them one at a time.** P60 is independent.

### P58 — New lesson: Signal Detection Theory

**→ Extra Powerful · Ultra (multi-agent)**

```
StatsCapybara roadmap prompt P58 (see ROADMAP.md). Run node tools/audit.js first.

Add a new Stats 4 lesson on SIGNAL DETECTION THEORY — append as section 4.12, slug signal-detection-theory, right after 4.11 psychometric-functions (its natural sibling: 4.11 fits the response curve, SDT explains the decision behind it). Make it one of the most interactive lessons on the site — SDT is pure see-it-touch-it material.

Core interactive (frozen-noise pattern, VIZ helpers):
- Two overlapping distributions (noise vs signal+noise) with a DRAGGABLE criterion line (ew-resize cursor per the P47 convention + arrow-key nudge per the a11y convention) and a d′ separation slider.
- The four outcomes as live-shaded regions + a 2×2 quadrant (Hit / Miss / False Alarm / Correct Rejection) whose rates update as you drag.
- Readouts: hit rate, FA rate, d′, criterion c, β — with the liberal ↔ conservative direction labelled.
- An ROC panel: the current (FA, H) point, plus a "sweep the criterion" animation tracing the whole curve (VIZ.reducedMotion() → jump to the final frame). Optional bonus: a short trial-by-trial "be the detector" run that estimates the student's own d′ from their responses.

The math must be exact and independently verified: d′ = z(H) − z(FA), c = −(z(H) + z(FA))/2, and AUC = Φ(d′/√2). That last identity already appears in ml/roc-curves-and-auc (Φ(d/√2) → .76/.92/.50) — the two lessons MUST agree. Acceptance test via node -e: recover a known d′ from simulated counts. Handle the 0/1 proportion edge (log-linear or 1/(2N) correction — name the choice in a callout).

Prose: the yes/no detection story (radiologist, smoke detector, airport screening); sensitivity vs response bias as THE conceptual payoff (two ways to get more hits — better separation or a laxer criterion — and only one of them is skill); where SDT shows up in research (perception, recognition memory ROCs, diagnostics). VOICE.md applies; prose-lint --strict stays clean.

Cross-links both ways: stats-4/psychometric-functions (sibling procedure), ml/roc-curves-and-auc (same curve in an ML hat), ml/classification-metrics (the confusion matrix IS SDT's 2×2), stats-1/z-scores-and-the-normal-distribution (z does the work).

Standard lesson integration (CLAUDE.md "Adding a lesson" — APPENDING, so no eyebrow renumbering): copy FROM another stats-4 lesson so og:image stays assets/og-stats-4.png; educationalLevel Advanced; 3 checks, 3 FAQs (+ inject-faqs), a QUIPS line, glossary terms (d′, criterion, hit/false alarm — check GLOSSARY first, the ML lessons may already own ROC/sensitivity), a c:"stats-4" quiz question, R/Python snippet (d′ from counts via qnorm / scipy.stats.norm.ppf). software.js only if you can give an honest SPSS/JASP path (neither has a native SDT module — skipping is legitimate, say so). Bump the homepage ItemList (Stats 4 → "12 interactive lessons") and the static og:/twitter: site-wide lesson count (96 → 97) — audit checks 6/7 enforce both. sitemap.xml + rerun build-search-index.py.

curriculum.js is a precached shell asset → BUMP CACHE_VERSION in sw.js.

Run as ULTRA (multi-agent): one agent builds the lesson + interactive; one independently re-derives every formula and readout against standard SDT conventions (Macmillan & Creelman) and the cross-lesson AUC identity; one runs audit + prose-lint + a11y/print/embed checks. Standard verification incl. drag + keyboard round-trips. Tick P58 in ROADMAP.md.
```

### P59 — Stats 2.6 rebuild: the logic behind each non-parametric test

**→ Extra Powerful · Ultra (multi-agent)**

```
StatsCapybara roadmap prompt P59 (see ROADMAP.md). Run node tools/audit.js first.

Rebuild stats-2/non-parametric-alternatives (2.6) so each test is EXPLAINED, not name-dropped. Today the lesson has one strong interactive (the Outlier Stress Test — KEEP it as is) followed by a bare "which test replaces which" list. Give each test its logic, intuitively, plus a hands-on playground per test.

1. Prose — a short section per test with the actual mechanism:
   - Mann–Whitney U: count pairwise wins (U = how often a group-1 value beats a group-2 value); tie to the probability-of-superiority reading and why an extreme value can't change any ranks.
   - Wilcoxon signed-rank: rank the |differences|, sum the signed ranks — more information than a sign test, still calm about outliers.
   - Kruskal–Wallis: ANOVA on ranks (H) — pool, rank, ask whether the rank sums split evenly across groups.
   - Friedman: ranks WITHIN each person/block — the repeated-measures counterpart.
   Spearman's ρ already lives in stats-2/correlation — cross-link it, don't duplicate. Keep the replaces-which list as the summary table it wants to be.
2. Tabbed playground — one .seg-tabbed viz (Mann–Whitney / Wilcoxon / Kruskal–Wallis / Friedman) where every tab shows the SAME core move on a small frozen dataset: raw values → their ranks (highlighted/animated), the statistic assembling from the ranks, and the p-value; plus a shared "nudge an outlier" control per tab so the ranks-don't-care point lands for every test, not just Mann–Whitney. Frozen-noise pattern throughout. Give each tab section an id so which-test.html / plan.html can deep-link; wire those links if quick.
3. The statistics must be exact: implement each with the standard normal/χ² approximations WITH tie corrections, state the approximation honestly in the UI, and verify every displayed p against R (wilcox.test / kruskal.test / friedman.test) or scipy reference values via node -e re-derivation — record the reference cases in a code comment.

Consistency sweep after the rebuild: the 3 FAQs (faq_data.py → inject) and 3 checks still fit the richer content (upgrade any that now undersell it); software.js/snippets.js entries still accurate; meta description still true (respect the audit's dedupe + 50–160 rules); VOICE.md + prose-lint --strict stay clean; rerun build-search-index.py. Lesson HTML only → no CACHE_VERSION bump.

Run as ULTRA (multi-agent): one agent builds prose + tabs; one independently re-derives every statistic/p-value shown (tie cases included); one runs audit + prose-lint + browser round-trips (each tab's controls return identical readouts after a there-and-back). Tick P59 in ROADMAP.md.
```

### P60 — Front door v2: track-based nav + homepage order

**→ Extra Powerful · Max effort** *(then run `/code-review ultra` on the diff — the nav renders on every page)*

```
StatsCapybara roadmap prompt P60 (see ROADMAP.md). Run node tools/audit.js first.

Front door v2. The homepage and nav accreted feature by feature; restructure both around the site's real shape (two curriculum tracks + the toolbox). One coherent redesign — keep it CALM, and keep P54's prose-link rules, P55's Toolbox pill, and every a11y guarantee (focus-visible, Escape, 44px targets, reduced motion).

NAV (site.js renderNav + styles.css):
1. Retire the "Curriculum" and "About" tabs. The brand mark stays the home link. Keep the #about SECTION on the homepage (many pages link to ./#about — those keep working) and add a quiet "About" link to the footer so it stays discoverable.
2. New structure mirroring the homepage: "Statistics Core ▾" and "Research Toolkit ▾" (built from window.TRACKS + CURRICULUM — never hardcode course lists) alongside the existing "Statistics Toolbox ▾" pill. The Core/Toolkit dropdowns list ONLY the courses (title + subtitle line), each clickable — recommended target: the course's first ready lesson (matches the homepage ItemList JSON-LD; if you choose the homepage course-card anchor instead, say so in CLAUDE.md). Clicking the tab itself goes to the homepage scrolled to that track: give the rendered .track-head elements stable ids (#track-core / #track-toolkit) and BASE-aware hrefs so it works from lesson depth.
3. Toolbox dropdown: stop rendering the flat TOOLBOX list — group it by TOOLBOX_GROUPS in the exact order and titles of toolbox.html (Decide & look up / Calculate / Explore & practice / Read the guides), small group headers inside the panel. 20 tools + 4 headers is tall: cap the panel height or go two-column; it must not overflow a 768px-tall viewport.
4. Interaction parity for all three dropdowns: reuse the existing CSS hover/focus-within machinery + invisible hover bridge; correct aria-haspopup/aria-expanded; Escape closes and restores focus; on mobile all three flatten to plain links (Core/Toolkit → the homepage track anchors, Toolbox → toolbox.html, pill styling kept) — no hover panels on touch.
5. Active states: a lesson page lights the tab of ITS track (course → track via curriculum.js); tool/guide pages keep lighting Statistics Toolbox; the homepage lights nothing.

HOMEPAGE (index.html + site.js):
6. Promote the resume banner into the hero: renderResume() currently injects above the curriculum grid — move its slot to sit between the .hero-eyebrow ("Meet StatsCapybara…") and the h1 ("Statistics You Can See…"), and scale the type up so "Pick up where you left off — …" reads as a real welcome-back, not a footnote. Keep the Resume → and My progress → links. It renders only for returning visitors (sc-last): keep the injection CLS-conscious so the hero doesn't jolt when it appears.
7. Remove the "Jump in wherever you are" section (the h2 + .personas block) from index.html. Delete persona-only CSS if nothing else uses it.

Bookkeeping: site.js + styles.css are precached → BUMP CACHE_VERSION in sw.js. index.html text changed → rerun build-search-index.py. Update CLAUDE.md's nav/homepage paragraphs (they still describe the Curriculum/About tabs, the persona cards, and the resume bar's old position). Audit stays 0 errors (homepage counts + ItemList untouched).

Verify across page types (homepage, a core lesson, a toolkit lesson, a tool page, a guide) in light + dark + mobile + keyboard-only: every dropdown opens on hover AND focus, closes on Escape, every course/tool link resolves (subpath server too), active states correct, zero console errors. Then run /code-review ultra on the diff before pushing. Tick P60 in ROADMAP.md.
```

---

## Phase 14 — Depth & reach (P61–P68)

Added 18 Jul 2026 after a full-site review (see ROADMAP's Phase 14 addendum). P1–P60 built the site out and rebuilt the front door; the growth surface has moved to three quieter axes: **reach** (`statscapybara.com/stats-1/` is currently a 404 — there is no course-level URL to put on a syllabus), **depth** (checks, quiz and flashcards all test *recognition*; nothing on the site makes a student produce a number by hand and shows the worked path), and **hardening** (audit.js verifies the site's wiring exhaustively but not one line of its math; external links are only hand-checked quarterly; one drag interactive still scrolls the page on touch). Model/effort legend as in Phase 12. **P61, P67 and P68 all edit `site.js` — run them one at a time. P64 needs P63.** Everything else is independent and cherry-pickable.

### P61 — Course landing pages

**→ Extra Powerful · Max effort**

```
StatsCapybara roadmap prompt P61 (see ROADMAP.md). Run node tools/audit.js first.

Give every course a real landing page at <course>/index.html — nine new pages. Today statscapybara.com/stats-1/ is a 404 (people trim URLs to the course level, and there is no per-course URL for a syllabus or a share), and the nav's course rows drop visitors into lesson 1.1 with zero orientation.

PLATFORM (small, do it first): site.js's BASE is binary ("" at root, "../../" via body[data-section]/[data-guide]). Course pages sit at depth 1 — add a third marker, body[data-course-home="<slug>"], giving BASE "../". These pages get the shared chrome (nav, footer, theme, search, skip-link, SW) but NO sidebar / prev-next / progress-recording / quip. Nav active state: light the tab of the course's track.

EACH PAGE: track-title eyebrow, h1 = course title + subtitle, then 2–3 short hand-written paragraphs — what you'll learn, who it's for, where it leads next (VOICE.md applies; prose-lint --strict stays clean; write each course's intro differently, not nine fills of one template). The lesson list renders at runtime from curriculum.js (never bake it): § numbers, titles, ✓ ticks from sc-progress, coming-soon dimmed, plus the per-course ring (window.SC.ring). A Start/Resume CTA (first lesson, or first unvisited if progress exists). A short curated "tools you'll use in this course" row (2–4 TOOLBOX/guide links chosen per course). An @media print treatment so the page prints as a clean one-page course syllabus (title, blurb, lesson list, URL) — an instructor handout for free.

SEO per page: canonical + og:url = https://statscapybara.com/<course>/, og:type website, og:image = assets/og-<course>.png (the course cards finally get a page of their own to live on), unique 50–160-char description (audit dedupe applies), JSON-LD = Course (mirror that course's homepage ItemList entry — name "Title: Subtitle", description, educationalLevel, provider, free offer — keep the two consistent) + BreadcrumbList (Home → Course). Leave lesson BreadcrumbLists two-level (Home → Lesson) — retrofitting a course crumb across 97 heads is a separate decision, not this session.

RETARGET the course entry points to the landing pages: the nav track-dropdown course rows (renderNav), the homepage course-card title, and the homepage ItemList JSON-LD course urls — then update audit check 7, which currently expects the ItemList url to be the course's first ready lesson. The track-tab links themselves (#track-core/#track-toolkit) stay as they are.

INTEGRATION: sitemap.xml += 9; add the pages to tools/build-search-index.py (+ rerun) and SEARCH_PAGES (tag "Course") so search finds "Stats 2"; a new COURSE_PAGES check in audit.js modeled on the GUIDES check 3b (GA tag, canonical/og:url = true URL, og:image = that course's card and exists on disk, Course + BreadcrumbList JSON-LD parse with required fields, the data-course-home marker, links resolve, sitemap + search-index presence). No QUIPS entries (no sidebar surfaces them) — wire the audit so it doesn't demand one. Document the new page type + the three-state BASE in CLAUDE.md and grow the adding-a-COURSE checklist by one step.

site.js is precached → BUMP CACHE_VERSION in sw.js. Verify all nine pages in light + dark + mobile AND on the subpath server (a new BASE depth is exactly what subpath hosting catches), the nav from a lesson AND from a course page, ring/ticks against real sc-progress, the print syllabus fits one page, audit 0 errors. Tick P61 in ROADMAP.md.
```

### P62 — Quiz v2: exam mode + a deeper bank

**→ Extra Powerful · Ultra (multi-agent)**

```
StatsCapybara roadmap prompt P62 (see ROADMAP.md). Run node tools/audit.js first.

Quiz v2 — turn quiz.html from a quick self-check into real exam rehearsal. Two halves, one session.

1. DEEPEN THE BANK. Today: ~128 course-tagged questions (roughly one per lesson). Write ~70 more so every course reaches ~2 per lesson, weighted toward Stats 1–2 (aim for 3/lesson there — that's where exam pressure lives). Same shape { c, q, o[4], a, why }; each new question must test its topic at a DIFFERENT angle than the lesson's three checks.js questions (compare before writing — no near-duplicates); numeric answers verified via node -e + VIZ; the why strings follow VOICE.md. Mix formats: recall, interpretation, "a student concludes X — what went wrong?", read-the-output.

2. EXAM MODE. An opt-in second mode on the start screen beside classic practice: choose scope (one course, several, or a whole track — picker generated from the curriculum as today), choose length (10/20/40), then a no-instant-feedback run (progress "7 of 20", answers locked in silently; an OPTIONAL count-up timer, off by default — this site does not do countdown panic). End screen: score, per-course breakdown, every missed question with its why and a link to the relevant lesson, and "retry just the ones I missed". Draw without replacement; shuffle options per draw (remap the answer index correctly). Print CSS so the results screen prints as a clean mock-exam report. Best exam scores → a new localStorage key sc-exam (document its schema in CLAUDE.md's localStorage inventory; if you surface it on progress.html, that page stays read-only).

Classic mode stays exactly as it is. Calm throughout: no red-alert UI, no shame copy, capybara-kind finish states. Update the quiz TOOLBOX blurb and teachers.html's revision paragraph to mention exam mode; quiz.html's Quiz JSON-LD stays valid.

Run as ULTRA (multi-agent): one agent writes the new questions; one independently fact-checks EVERY new answer (the correct option really correct, all three distractors really wrong, the why accurate); one builds exam mode and browser-verifies both modes end-to-end (classic regression-check included). Standard verification (audit, prose-lint on touched copy, search index rebuilt — quiz.html body text changed — light + dark + mobile, zero console errors). Tick P62 in ROADMAP.md.
```

### P63 — Worked problems library: problems.html + Stats 1–2 sets

**→ Extra Powerful · Ultra (multi-agent)**

```
StatsCapybara roadmap prompt P63 (see ROADMAP.md). Run node tools/audit.js first.

Build problems.html — "Practice Problems", the site's worked-examples library — and fill it for Stats 1 + Stats 2. The gap it closes: checks/quiz/flashcards all test recognition; nothing on the site makes a student PRODUCE a number with pencil and calculator and then shows the full worked path — the thing stats exams actually demand.

FORMAT. A problem = a realistic mini-scenario with given values (n, means, SDs, counts — small enough to work by hand; vary the cover stories, not "a researcher collects data" twenty times), 1–3 sub-questions (compute, decide, interpret), a difficulty tag (warm-up / exam-level / stretch), then the worked solution in a closed <details>: every step on its own line — formula → plug-in → arithmetic → decision/interpretation sentence — with a link to the lesson § it comes from and, where natural, the tool that checks it (tables.html for criticals, descriptives/power/apa). EVERY number in every step verified via node -e + VIZ before it ships; record the verification one-liners in an HTML comment per problem. State rounding rules explicitly wherever rounding at a different step would change the reported answer.

CONTENT: ~12 Stats 1 problems (level-of-measurement calls, mean/SD/z by hand, percentile from z, SE and the CLT, a confidence interval, a full one-sample t from summary numbers, effect size + a power lookup) and ~10 Stats 2 (independent + paired t, one-way ANOVA with a post-hoc decision, correlation incl. an r-vs-causation trap, regression prediction + a residual, chi-square, a which-nonparametric swap, an assumptions call). Grouped by course with a jump index; VOICE.md throughout.

THE INSTRUCTOR FEATURE: two print buttons — "Print problems" (solutions suppressed regardless of open <details>) and "Print with solutions" (all solutions forced open) — via a body class + the existing print machinery; both versions print as clean handouts with the standard capybara/URL print footer. Cross-link from teachers.html (assignments section) and from lesson prose where a matching problem exists.

INTEGRATION: full tool-page registration per CLAUDE.md (TOOLBOX group "practice", SEARCH_PAGES, QUIPS, build-search-index.py + rerun, sitemap.xml, ROOT_PAGES in audit.js, BreadcrumbList JSON-LD, full per-page SEO). Structure the page so P64 can append Stats 3–4 + toolkit sets without rework.

Run as ULTRA (multi-agent): one agent writes problems + page; one independently re-derives every worked solution start to finish; one verifies audit / prose-lint / both print modes / browser in light + dark + mobile. Tick P63 in ROADMAP.md.
```

### P64 — Worked problems: Stats 3–4 + toolkit sets

**→ Extra Powerful · Ultra (multi-agent)**

```
StatsCapybara roadmap prompt P64 (see ROADMAP.md; requires P63's problems.html). Run node tools/audit.js first.

Extend problems.html with the advanced and toolkit sets — same format, verification bar, and print behaviour as the Stats 1–2 sets.

1. Stats 3 (~8): multiple-regression coefficient interpretation (+ a standardized-vs-raw call), an ANCOVA adjusted-means read, logistic regression (log-odds → OR → predicted probability), a factorial interaction read from cell means, a mixed/RM design choice, a power-analysis setup (get the inputs right, power.html finishes it), a multicollinearity/VIF call, a missing-data strategy call.
2. Stats 4 (~7): Bayes' rule by hand (the classic base-rate medical-test numbers), a Beta-posterior update, d′ + criterion from hit/false-alarm counts (agreeing with the SDT lesson's conventions), a PSE/JND read from a fitted logistic (agreeing with 4.11), a GLM family choice, a survival-curve read, a model-comparison (AIC) call.
3. Research Toolkit "spot the problem" (~6, no arithmetic): a flawed design (find the confound), a sampling-bias scenario, a QRP to name, a data-cleaning error to catch, a misleading figure to critique, and an APA results sentence with three planted reporting errors to find (cross-check the planted errors against apa.html's rules so the corrected version really is correct).

Where a solution leans on another lesson's convention (SDT, PSE, AIC), re-verify against THAT lesson's displayed values — the site must never disagree with itself. Update the jump index and any blurb that names the set count; rerun build-search-index.py.

Run as ULTRA (multi-agent): builder / independent re-derivation of every number and every "spot the problem" answer key / audit + prose-lint + print + browser verification. Tick P64 in ROADMAP.md.
```

### P65 — Touch & small-screen ergonomics for the interactives

**→ Powerful · Extra**

```
StatsCapybara roadmap prompt P65 (see ROADMAP.md). Run node tools/audit.js first.

Touch-first ergonomics pass over the interactives. P47 fixed the mouse affordances (cursors, press states, range-input touch height); this is the finger counterpart — phone students are a big slice of the audience.

1. touch-action sweep: inventory every canvas with a pointerdown/mousedown drag handler (lessons AND tool pages). A draggable canvas without touch-action: none (or pan-y where the drag is axis-locked) scrolls the page mid-drag on touch — known offender: ml/classification-metrics' threshold drag (its six sibling drag lessons already carry the guard). Fix every hit, then state the convention in CLAUDE.md next to the P47 cursor convention: a canvas that captures pointer drags declares touch-action.
2. Finger-sized grab targets: drag hit-tests are tuned for a mouse. On coarse pointers (matchMedia pointer: coarse) widen the grab radius to roughly a finger pad (~24 CSS px) for the point-drag lessons (stats-1/describing-data, stats-2/correlation, stats-3/assumptions-of-regression), the k-means canvas, and the two criterion/threshold drags (stats-4/signal-detection-theory, ml/classification-metrics) — nearest-candidate-within-radius so crowded points still pick the closest. Mouse behaviour stays byte-identical.
3. 360 px sweep: load the interactives and tool pages at worst-case narrow width; fix any .controls row, .seg, or .stat-row that overflows or wraps unusably — using the EXISTING patterns (flex-wrap, .hscroll, the P50 nowrap-pair trick), no bespoke per-page CSS beyond that.
4. Hover-only affordances: anything revealed only on :hover needs a touch path (tap, or always-visible on coarse pointers). Inventory, fix what you find; note "none found" if clean.

Verification: synthetic touch-type PointerEvents in the preview — validate the probe on an unfixed case FIRST so you know it detects the failure — plus computed touch-action checks, drag round-trips (mouse AND touch) returning identical readouts, and screenshots at 360 px for the layout fixes. styles.css is precached → BUMP CACHE_VERSION if it changes. Document the coarse-pointer conventions in CLAUDE.md. Tick P65 in ROADMAP.md.
```

### P66 — Guard scripts: math regression gate + external-link checker

**→ Powerful · Extra**

```
StatsCapybara roadmap prompt P66 (see ROADMAP.md). Run node tools/audit.js first.

Two zero-dependency guard scripts. audit.js checks the site's WIRING exhaustively but not one line of its MATH — the promise the whole brand rests on ("statistics must be exact") has no regression test — and external links are only hand-checked in quarterly P38 runs.

1. tools/math-check.js — load viz.js under a minimal window/document shim and assert every statistical function against published values, exiting 1 on any miss beyond a stated tolerance:
   - normCdf/normInv/erf: Φ(1) = .84134, Φ⁻¹(.975) = 1.959964, symmetry Φ(−z) = 1 − Φ(z);
   - tInv/chiSqInv/fInv against table criticals (e.g. t.975,10 = 2.2281, χ².95,3 = 7.8147, F.95,3,20 = 3.0984 — cite each source value in a comment);
   - tUpper/fUpper/chiSqUpper: the documented statcheck case t = 2.05, df = 28 → two-tailed .0498, plus quantile(cdf) round-trips across a grid;
   - gammaln/gammp/betai identities (Γ(6) = 120; betai against a known incomplete-beta value);
   - the noncentral trio via the G*Power anchors already in CLAUDE.md: d = 0.5 two-sample → 64/group, r = .3 → 84, f = .25 k = 3 → N = 159, w = .3 df = 1 → N = 88;
   - pdf sanity: numeric integrals of tPdf/chiSqPdf/fPdf ≈ 1;
   - the documented tool-page constants (effect-sizes d = 0.5 → r = .2425, OVL 80.26%, U₃ 69.15%; correlation Fisher-z r = .5, n = 30 → [.17, .73]).
   Fast (<1 s), runs anywhere Node runs. Document in CLAUDE.md's Commands as REQUIRED whenever viz.js or any tool-page math changes (audit.js stays the universal gate; math-check is the math gate — don't fold one into the other).
2. tools/extlinks.js — collect every external http(s) href across the site's HTML, de-dupe, fetch each with a browser User-Agent and a timeout, and report grouped: ok / bot-blocked-but-known-fine (ko-fi 403, LinkedIn 999 — carry the P38 allow-list) / genuinely broken. Network-dependent, so NEVER a commit gate — it's the quarterly P38 helper. Add a line to ROADMAP's P38 entry so future runs use it; document in CLAUDE.md's Commands.

Then run both: math-check must pass clean on the current tree (if it catches a real discrepancy, fix the SITE, not the test — that's the point of building it); the extlinks report goes in the session summary. Negative-test both (perturb a constant / plant a dead link, confirm each screams, revert). Tick P66 in ROADMAP.md.
```

### P67 — Lesson state presets (instructor embeds that carry their configuration)

**→ Extra Powerful · Extra**

```
StatsCapybara roadmap prompt P67 (see ROADMAP.md). Run node tools/audit.js first.

Lesson state presets — let a URL preconfigure a lesson's interactive. The tool pages already do this (power.html ?sc=&es=, apa.html ?a=&v=, plan.html ?test=…); lessons don't, so an instructor can embed a lesson (?embed=1) but not the SPECIFIC configuration their slide is about ("CLT with n = 50", "SDT at d′ = 2 with a conservative criterion").

1. Shared helper in site.js: window.SC.preset(map) — a lesson opts in by calling it at the END of its boot with a map of short query keys → appliers ({ n: "#n-range", shape: v => setShape(v) }): a selector value sets that input and dispatches "input"; a function gets the raw string. Rules the helper enforces: silently ignore absent/unknown/garbage params (never throw — a mangled URL must still load the default lesson); apply AFTER the lesson's own init so the frozen-noise law holds (a preset moves the same controls a hand would, it never reseeds); compose cleanly with ?embed=1.
2. Wire ~10 flagship lessons, choosing controls that are stable and pedagogically worth presetting: central-limit-theorem (n), sampling-distributions (shape, n), hypothesis-testing-logic, simple-linear-regression, logistic-regression, bayesian-thinking (prior), psychometric-functions (family, shift), signal-detection-theory (d′, criterion), non-parametric-alternatives (tab), plus one of your choice. Document each lesson's accepted params in an HTML comment atop its inline script (the plan.html convention).
3. Instructor surface: extend teachers.html's embed section with a preset example (an iframe snippet using ?embed=1&n=50, wired to SC.copied) and a short table of preset-enabled lessons + their params. Document the convention in CLAUDE.md so future lessons consider it.

Verify per wired lesson: the preset lands (readouts match setting the control by hand), the round-trip law is intact, garbage params are harmless, embed + preset works in a REAL injected iframe, and the subpath server behaves. site.js is precached → BUMP CACHE_VERSION. Standard verification. Tick P67 in ROADMAP.md.
```

### P68 — Trust & polish touches

**→ Powerful · Extra**

```
StatsCapybara roadmap prompt P68 (see ROADMAP.md). Run node tools/audit.js first.

Four small independent trust/polish items, P47-style.

1. Feedback path: a quiet "Spotted a mistake? Tell me" link in every footer (beside the P60 About link, rendered by site.js's footer machinery), a mailto: with the subject prefilled with the current page path so reports arrive locatable. VOICE.md wording, no exclamation mark. (mailto over a GitHub-issues link: the audience is students without GitHub accounts.) A site that invites corrections reads as one that expects to be held to its own standard.
2. site.webmanifest shortcuts: 2–3 app shortcuts for installed-PWA users — Continue learning → progress.html, Statistics Toolbox → toolbox.html, Quiz → quiz.html. RELATIVE urls (the manifest's subpath-survival rule); icons optional.
3. Section share-links: on lesson/guide h2[id] headings, a small copy-link button (SC.copied feedback, aria-label "Copy link to this section", hidden in @media print) — revealed on hover/focus with a fine pointer, always faintly visible on coarse pointers (hover-only affordances fail touch). Injected by site.js so every page gets it; zero layout shift when it appears (absolutely positioned gutter, not reflow).
4. Cross-page transition (progressive enhancement, take-it-or-leave-it): CSS @view-transition { navigation: auto } for a calm same-origin cross-fade in supporting browsers, guarded by prefers-reduced-motion. Test it against the SW's controllerchange auto-reload and dark mode for flashes; if ANYTHING artifacts, drop this item and say so — it's optional, the other three aren't.

site.js / styles.css / site.webmanifest are all precached → one CACHE_VERSION bump. Standard verification (audit, light + dark + mobile, keyboard focus on the new buttons, zero console errors); update CLAUDE.md's footer/manifest passages. Tick P68 in ROADMAP.md.
```

---

## Phase 15 — Footing (P69–P72)

Added 21 Jul 2026 after the post-P68 review. The feature surface is complete — audit, math-check and prose-lint all pass clean, and no course/tool/guide gap worth building remains. What the review DID find: the site runs analytics it never discloses (and `teachers.html`'s twitter description still promises "no tracking"), the maintenance loops are blind beyond page views, search is exact-substring-only in a field full of hard-to-spell words, the public README still says "51 lessons across 5 courses" (reality: 97 across 9), and the vision statement — *the entire journey of a research student* — has every stop built but no page that walks it once. Four prompts, then the roadmap IS the loops (P37–P39) plus the human checklist. Model/effort legend as in Phase 12. **Run P69 before P70 (P70 updates P69's page); P69/P70/P71 all edit `site.js` — one at a time. P72 is independent.**

### P69 — Privacy page, honest claims, README

**→ Extra Powerful · Extra**

```
StatsCapybara roadmap prompt P69 (see ROADMAP.md). Run node tools/audit.js first.

Trust footing. The site runs GA4 on every page yet discloses it nowhere — and teachers.html's twitter:description promises "no tracking", which analytics makes untrue. Fix the claims AND earn them.

1. privacy.html — a calm, honest, plain-language page (VOICE.md; no legalese template): what IS collected (GA4 page views today; write the section so P70 can add its events in one sentence), what NEVER leaves the browser (the full localStorage inventory — sc-progress / sc-checks / sc-last / sc-cards / sc-exam / sc-name + the theme — say plainly that progress is device-local and how to wipe it), the two external services a page may contact (Google Analytics, the Ko-fi button image) and what they can see, no accounts, no ads ever, and the footer feedback mailto as the contact route. Short enough to actually read.
2. Make GA quieter where it costs nothing: evaluate a Consent-Mode-style config (e.g. denying analytics_storage so no cookie is set while anonymous page counts still arrive) against the single-GA-tag-per-page rule. If it works, ship it and say so on privacy.html; if it degrades the data the loops need, keep the default and DISCLOSE it plainly. Decide, do one, document which and why in the session summary.
3. Claims sweep: grep the whole site for "no tracking" / "no accounts" / similar promises (known offender: teachers.html's twitter:description) and reword every claim to what is true — no accounts, progress stays in the browser, anonymous page-view counting only. The sweep must come back clean at the end.
4. Footer: a quiet Privacy link joining the About + feedback links (site.js footer machinery — third quiet link, same styling family, same order logic).
5. README.md rewrite — it still says "51 lessons across 5 courses"; the repo is public and instructors DO look. Match reality (9 courses, 97 lessons, the tools/guides/posters, the no-build architecture in two sentences, statscapybara.com + the feedback path). Keep it short; it will go stale again, so prefer wording that ages well over exact counts where possible.

Integration: privacy.html registered like a root page — audit ROOT_PAGES (adapt the BreadcrumbList expectation to Home → Privacy rather than pretending it's a toolbox tool; a QUIPS key since ROOT_PAGES demands one), sitemap.xml, build-search-index.py list + rerun, SEARCH_PAGES so searching "privacy" finds it — but NOT in TOOLBOX (it is not a tool). site.js is precached → BUMP CACHE_VERSION. Standard verification. Tick P69 in ROADMAP.md.
```

### P70 — Interaction events for the maintenance loops

**→ Powerful · Extra**

```
StatsCapybara roadmap prompt P70 (see ROADMAP.md; run AFTER P69 so the privacy page exists to update). Run node tools/audit.js first.

Give the maintenance loops real signal. GA today records page views only, so P37/P39 decisions about what to refresh or build next are guesses about which features are even used. Add a SMALL set of anonymous interaction events through the existing gtag — site.js is the only place that fires them; lessons and tools never call gtag directly.

The set (~10, taste-checked — fewer is fine, more is not): search_used (overlay opened; NEVER the query text), exam_finished (scope signature + length + a pct bucket like 0–49/50–79/80–100 — not exact scores), quiz_practice_finished, problem_solution_opened (course only), viz_png_export, lesson_embed_view (an embed=1 pageload, with a with_preset flag), print_used (page type), feedback_click, pwa_installed (the appinstalled event), cert_downloaded (course).

Rules: no PII, no free text, no identifiers beyond what GA already has; fire-and-forget wrapped so a blocked GA can never break a feature (the registerSW() error-swallowing pattern); events fire from the shared layer only. Update privacy.html's "what is collected" section with one honest sentence naming the events (P69 wrote it to be extended). Document the event list in CLAUDE.md so future features add events consistently — or deliberately don't.

Verify every event in the preview via the network log (collect requests carrying the right event name + params), then verify the adblock case: stub gtag out and click through every instrumented surface — zero console errors, zero broken features. site.js is precached → BUMP CACHE_VERSION. Standard verification. Tick P70 in ROADMAP.md.
```

### P71 — Search v2: typo tolerance, glossary answers, kind dead ends

**→ Powerful · Extra**

```
StatsCapybara roadmap prompt P71 (see ROADMAP.md). Run node tools/audit.js first.

Search v2. The overlay does exact substring matching over titles + full text — but statistics students type "hetroscedasticity", "p val", "anova post hoc". Three upgrades, all inside the existing overlay (keep: the lazy index load, the focus-trapped aria-modal dialog, the ?q= deep link, the homepage SearchAction schema):

1. Forgiving matching: normalize case/diacritics/hyphens/spaces on both sides ("post hoc" ↔ "post-hoc", "chisquare" ↔ "chi-square"), plus edit-distance-1 typo tolerance on title/term TOKENS — typo-tolerant title matching is the payoff; full-text can stay exact. The index is ~450 KB and every keystroke re-queries: measure that responsiveness doesn't degrade (keep per-keystroke work bounded; debounce if needed).
2. Glossary instant answers: on overlay open, lazy-load glossary-data.js alongside the search index; when the query matches a glossary term (exact or distance-1), render a definition card ABOVE the results — the term, its definition, a link to its lesson and to the glossary — so "what is power" gets answered in place, not just linked.
3. Zero-result honesty: instead of an empty list, offer the nearest 3 title matches as "did you mean…" plus quiet links to the glossary and toolbox; if nothing is even near, say so kindly (VOICE.md — warm, not cutesy).

Verify against a written case list: 5 real typos, 3 spacing/hyphen variants, 3 glossary questions, 2 nonsense strings — each behaving as designed, in light + dark + mobile + keyboard-only (the focus trap and Escape still hold; the definition card is reachable by keyboard). site.js is precached → BUMP CACHE_VERSION. Standard verification. Tick P71 in ROADMAP.md.
```

### P72 — The capstone guide: one study, the whole journey

**→ Extra Powerful · Ultra (multi-agent)**

```
StatsCapybara roadmap prompt P72 (see ROADMAP.md). Run node tools/audit.js first.

The keystone guide. ROADMAP's vision line is "the entire journey of a research student: design the study → collect and clean the data → run the right analysis → report it properly → do it all ethically." Every stop exists; no page walks the whole journey once. Write guides/complete-worked-project/ (~2,500 words, the fifth and flagship guide): one study carried end-to-end on a shipped practice dataset.

The arc, each stage linking its lesson §s and tools at the moment you'd actually reach for them: a real research question → operationalization (Methods) → design choice + a power analysis (power.html — state the planned n honestly against the dataset's actual n) → data checks and cleaning on the CSV (descriptives.html) → assumptions (the cheat-assumptions poster) → the analysis (tables.html / the relevant lesson) → effect size + CI (effect-sizes.html) → the APA results paragraph (apa.html-verified, correct typography) → limitations and what an ethics reviewer would ask (Ethics/Writing). Work on ONE dataset from assets/data/ — sleep-experiment.csv is the strongest but already stars in the JASP guide, so prefer a different CSV (the 2×2 factorial, correlation, or logistic file) so the two guides don't retell one story; pick whichever supports the richest honest arc, including at least one imperfect moment (a borderline assumption, an underpowered wish, an outlier decision) handled the way a good supervisor would.

EVERY number recomputed from the shipped file (node -e + VIZ; record the verification one-liners in an HTML comment — the problems.html convention). Where the guide's numbers touch other pages using the same CSV (datasets.html worked solutions, any problems.html problem), re-verify agreement — the site never disagrees with itself.

Standard guide integration (CLAUDE.md "Adding a guide", all 6 registrations) + cross-links where they're natural: plan.html's plan card ("see a full worked project"), teachers.html (it IS the semester-project template), the four existing guides' keep-going footers, and 2–3 course landing pages' "where it leads" prose. VOICE.md; prose-lint --strict stays clean. Guide HTML is network-first → no CACHE_VERSION bump unless site.js changed for cross-links (then bump).

Run as ULTRA (multi-agent): one agent writes the guide; one independently recomputes every number from the CSV and checks every cross-page agreement; one runs audit + prose-lint + link/browser verification. Tick P72 in ROADMAP.md.
```

---

## Phase 16 — De-AI round two (P73–P78)

Phase 10 killed the banned constructions and got every page under its budgets — and the 15 Aug 2026 re-measurement (ROADMAP.md's Phase 16 addendum has the numbers) shows exactly what a budget-met site can still look like: pages parked *at* the em-dash cap (lesson median 6, six pages sitting at exactly 10), short tool pages running 18–34 em-dashes per 1,000 words, and ~1,070 more em-dashes on the surfaces that never had a budget at all (FAQ answers 126, `checks.js` 203, `glossary-data.js` 127, `software.js` 66, the inline-script strings 521). A reader who skims one page meets a capped 10; a student who works through a course meets ~1,800. Round two is a paydown, not a hunt — every Phase-10 pattern reads 0 today, so what remains is frequency and shape, plus the one tell that is not prose at all: the planning docs that narrate the AI process are publicly served at `statscapybara.com/CLAUDE.md`, `/PROMPTS.md`, `/ROADMAP.md`, `/VOICE.md`.

Two rules govern the whole phase. **The iron rule carries over unchanged:** prose only — no verified number, statistical claim, formula, code block, element id/class/anchor, link target, or interactive may change. **And the guardrail:** de-AI means style and surface, never a claim — nothing anywhere may assert or imply the prose was hand-written; the About section and `privacy.html` stay exactly as honest as they are.

**Order:** P73 first (it resets the budgets and the measuring stick; `prose-lint --strict` is *expected red* from P73 until P77 closes it — the same interregnum Phase 10 ran, with `audit.js` staying the commit gate throughout). P74–P76 in any order. P77 last of the editing passes (it is the sitewide finisher). P78 is independent and can run any time, including first.

### P73 — The second baseline: budgets that bite + prose-lint v2

**→ Powerful · Extra**

```
StatsCapybara roadmap prompt P73 (see ROADMAP.md — read the Phase 16 addendum first; it has the 15 Aug 2026 numbers). Run node tools/audit.js AND node tools/prose-lint.js first; keep the full lint output as the "before".

Phase 10's budgets are all met and the site still reads AI-made, because the budgets were set where the 2026 corpus could reach, not where a human editor lands: pages migrate to the ≤10 em-dash cap and sit there, and five prose surfaces never got a dash budget at all. This prompt tightens the law and the measuring stick; P74–P77 do the editing. No content changes in this prompt — VOICE.md, tools/prose-lint.js, and stale doc numbers only.

1. VOICE.md hard-rule updates, with prose-lint.js's PATTERNS/budget table updated in the SAME commit (both files carry that warning):
   - Rule 1: em-dashes ≤ 4 per page (was 10), AND ≤ 8 per 1,000 words of that page's prose (floor, minimum allowance 1). The rate clause exists because descriptives.html holds 10 dashes in 291 words (34/1k) — the flat cap alone would bless 4 there, still triple a human technical editor's rate. Both clauses gate in --strict.
   - Rule 2: ≤ 1 em-dash across a lesson's three FAQ answers combined (was ≤ 3).
   - NEW dash budgets for the surfaces that had none, gated in --strict from now on: checks.js ≤ 50 total (today 203), software.js ≤ 15 (today 66), glossary-data.js ≤ 30 (today 127), inline-script string literals ≤ 130 (today 521), snippets.js comments ≤ 5 (today 5, already there). QUIPS stay exempt (anti-rule: brand voice) — keep reporting their count, never gate it.
   - Budgets are ceilings, not targets — Phase 10's lesson is that pages migrate to the cap. The sitewide summary must now print the lesson MEDIAN and an "at the cap" count beside each budget, and P74–P76 aim at median ≤ 2, not all-pages-at-4.
   - Overcorrection watch: report per-page semicolon and ellipsis ("…") counts, no budget. The anti-rule stands — a semicolon plague is worse than the dashes — and the report line exists so P74–P77 can prove they didn't trade one tell for another.
2. Two new REPORT-ONLY metrics — measure first, a rule only if the corpus earns it (faq-audit's precedent: gating a judgment metric teaches future runs to write around it):
   - Bold-lead bullets: <li><strong>…</strong> items in lesson/guide prose (403 today across lessons+guides). Report per page, worst pages first — that list is P74/P75's reshaping worklist. No hard budget.
   - Duplicate sentences: 8-word shingles shared by 2+ DIFFERENT pages' rendered prose. Strip each lesson's FAQPage JSON-LD head copy first or every lesson self-collides with its own baked FAQ block, and exclude the injected/chrome strings, which repeat by design. Measured only as a candidate on 15 Aug (the one suspect turned out to be a single page's FAQ + JSON-LD copy, not a cross-page repeat) — if the corpus comes back clean, say so in the report and add no rule.
3. What NOT to build, stated in VOICE.md so it survives future sessions: no generic "AI word" inventory. This corpus was measured on 15 Aug 2026: delve 0, "worth noting" 0, "keep in mind" 0, "at its core" 0, crucial 7, journey 4 — and the two words a stock list flags hardest, leverage (54×) and robust (42×), are statistics vocabulary here (high-leverage points, robust standard errors). Rule 12's polarity lesson applies: measure a candidate in context before listing it, and prefer shape rules to word lists.
4. Stale-number sweep: CLAUDE.md and PROMPTS.md reference the old ≤10/≤3-per-trio budgets in a few places (the problems.html em-dash note among them) — update them to the new numbers. Note under P73's tick in ROADMAP.md that prose-lint --strict is EXPECTED red from now until P77 lands; audit.js stays the commit gate.
5. Paste the new sitewide summary (the new budgets failing against today's numbers is the point) plus the worst-20 pages under the new rules into your report AND under P73's tick — that table is P74–P77's worklist.

Standard verification (audit clean; node --check tools/prose-lint.js; prose-lint runs clean as a PROGRAM on every mode — exit 1 under --strict is the expected budget verdict, not a crash; --page and the JS-surface modes still work). Tick P73 in ROADMAP.md.
```

### P74 — Dash paydown + reshaping: the Statistics Core

**→ Extra Powerful · Max effort**

```
StatsCapybara roadmap prompt P74 (see ROADMAP.md). Requires P73 (the tightened VOICE.md + prose-lint v2). Run node tools/audit.js AND node tools/prose-lint.js first; save this batch's before numbers.

Round-two editing pass over the Statistics Core — Stats 1, Stats 2, Stats 3, Stats 4, ML (59 lessons today; read curriculum.js, don't trust this count): each lesson's prose, its three FAQ answers in tools/faq_data.py, nothing else. P41/P42/P44 already killed the constructions here; this pass is frequency and shape.

Rules of engagement (VOICE.md as amended by P73):
1. The iron rule, verbatim from Phase 10: surgical prose edits only — never numbers, statistical claims, formulas, code, ids/classes/anchors, link targets, the viz, or JSON-LD beyond description strings. A technical qualifier ("under equal variances", "given the null") survives every rewrite with identical meaning.
2. Every lesson to ≤ 4 page em-dashes and ≤ 1 across its FAQ trio — and each COURSE's median to ≤ 2, so most lessons land at 0–2 rather than all at 4. Vary the fixes: most cut dashes become commas, periods, parentheses, or a restructured sentence; a genuinely load-bearing em-dash may stay (a page at 3 well-earned dashes is the goal state, not an unfinished job). The semicolon and ellipsis report lines must not balloon — paste before/after.
3. Reshaping, from P73's bold-lead worklist: where a lesson's every list is "<strong>Term:</strong> explanation", recast some items as plain sentences, fold some into prose, and keep the list where a list is honestly the right shape. Same for rule-of-three cadence: two items, four items, or a sentence. Batch word count must not grow.
4. Read each course's opening paragraphs consecutively (the P41 check) — round-one rewrites have had a year of drift-free rest, so verify they still don't share a rhythm before touching anything else.
5. FAQ edits via faq_data.py → ./tools/inject-faqs.py, never hand-edited lesson HTML; rerun ./tools/build-search-index.py once at the end.

Verification: prose-lint --strict passes for every page in this batch (sitewide strict stays red until P77 — expected); before/after per-course table (total dashes, median, at-the-cap count, bold-lead items, semicolons/ellipses); audit clean; browser-check 3 rewritten lessons in light+dark (prose renders, TOC anchors, FAQ details + FAQPage JSON-LD intact); read ONE rewritten lesson start to finish and give the honest verdict in the report. Tick P74 in ROADMAP.md.
```

### P75 — Dash paydown + reshaping: the Toolkit + guides + posters

**→ Extra Powerful · Max effort**

```
StatsCapybara roadmap prompt P75 (see ROADMAP.md). Requires P73. Run node tools/audit.js AND node tools/prose-lint.js first; save this batch's before numbers.

Same round-two pass as P74 (same five rules of engagement), applied to the Research Toolkit — Methods, Data, Ethics, Writing (38 lessons; read curriculum.js) — plus the five guides/<slug>/ pages and the three cheat-<slug>.html posters.

Extra care points, all inherited from round one and still true: Ethics keeps its sober register (fewer dashes ≠ added levity; Tuskegee/Milgram/Stapel facts byte-identical in meaning). The Writing course TEACHES prose style — after editing, its advice and its own writing must agree; check that explicitly. Guides keep their query-shaped H2/H3s (the SEO surface) — edit body voice, not headings; every worked number stays byte-identical. Posters are terse reference text where an em-dash is often doing separator work — a colon or a table column usually reads better; afterwards REVERIFY one-page print fit at A4 and Letter the P30/P35 CSSOM way, since text length changed. Scenario/vignette text inside interactives is prose and IN scope; its correct/incorrect logic and scoring are NOT — round-trip any touched interactive.

FAQ edits via faq_data.py + inject; guides/posters/lesson edits → rerun ./tools/build-search-index.py once at the end.

Verification: as P74 (batch --strict green, before/after table, audit clean, 3-page browser check, one honest full read), plus the poster fit re-measurement. Tick P75 in ROADMAP.md.
```

### P76 — Dash paydown: tool pages, homepage & root prose

**→ Extra Powerful · Max effort**

```
StatsCapybara roadmap prompt P76 (see ROADMAP.md). Requires P73. Run node tools/audit.js AND node tools/prose-lint.js first; save the before numbers.

The per-word worst offenders live here: descriptives.html (34 dashes/1k words), effect-sizes.html (33/1k), power.html (18/1k), formulas.html (10/1k) — reference-and-calculator pages where the em-dash became the default separator ("d — the standardized difference"). Scope: every tool page's prose (intros, help text, empty states, pro tips, datasets.html's stories — every number untouchable), toolbox.html, teachers.html, quiz.html copy, problems.html (already at 2 dashes; check it against P73's bold-lead and duplicate reports instead), the homepage + About section, privacy.html, 404.html, offline.html, and the course landing pages' hand-written paragraphs.

Rules of engagement: as P74, plus two page-type-specific ones. (1) In reference tables and control help text, a separator em-dash usually wants to be a colon or its own table column, not a comma — pick what a careful technical writer would print, and keep any table's print layout intact (mind the posters' cousin rule: these pages print). (2) UI microcopy — button labels, control labels, table headers, seg options — is chrome, not prose: leave wording alone unless it carries a dash doing prose work. The H1 brand line and its <title>/og copies STAY (P46 precedent). Meta descriptions: only touch a page's description if it still fails a budget; keep 50–160 chars and sitewide-unique (audit-enforced).

Root-page edits → rerun ./tools/build-search-index.py once at the end. These pages' HTML is network-first (no CACHE_VERSION bump for prose), but bump if site.js changes for any reason.

Verification: prose-lint --strict green for every page in scope (sitewide red allowed only from surfaces P77 owns); before/after table; audit clean; browser-check descriptives.html, power.html and the homepage in light+dark with zero console errors — including one real calculation on each tool to prove no number or control changed. Tick P76 in ROADMAP.md.
```

### P77 — The injected layer + sitewide finisher

**→ Extra Powerful · Max effort**

```
StatsCapybara roadmap prompt P77 (see ROADMAP.md). Requires P73–P76 (run me LAST of the editing passes). Run node tools/audit.js AND node tools/prose-lint.js first.

The five JS prose surfaces get their paydown to P73's budgets, then the phase closes sitewide.

1. checks.js "why" strings (203 dashes → ≤ 50) and software.js tips (66 → ≤ 15; the APA example sentences' statistical content is untouchable — edit only the surrounding wording). glossary-data.js definitions (127 → ≤ 30). snippets.js comments are at budget already — verify, don't churn.
2. Inline-script string literals (521 → ≤ 130): lesson verdict/interpretation sentences and quiz.html's BANK "why" strings are prose — fair game. Chart/axis labels where the dash separates ("Group A — treatment") can become a middle dot or colon. HARD limits: wording-only edits to display-only literals; NEVER touch a string that code compares, parses, or keys on; node --check every touched page's largest <script> block (the CLAUDE.md one-liner); round-trip the controls of every touched lesson's interactive.
3. Duplicate-sentence fixes from P73's report, if it found any.
4. The finisher: sitewide node tools/prose-lint.js --strict must exit 0 — the first green since P73. Rerun ./tools/build-search-index.py (glossary text is indexed). Paste the phase's one-number exit into the report and under P77's tick: reader-visible em-dashes sitewide, 1,801 on 15 Aug 2026 → final (target: under ~500, lesson median ≤ 2).

CACHE_VERSION: bump ONLY if site.js changed — checks.js/software.js/glossary-data.js/snippets.js are lazy-loaded (not precached) and lesson HTML is network-first.

Verification: audit clean; math-check.js still passes untouched (run it as the no-change proof); browser-check one lesson end to end (checks flow scores, software tabs render, FAQ opens), one classic quiz run + one exam run, glossary.html + flashcards.html render their reworded definitions, and the search overlay finds a reworded glossary term. Tick P77 in ROADMAP.md.
```

### P78 — Provenance: take the planning docs off the public domain

**→ Powerful · Extra**

```
StatsCapybara roadmap prompt P78 (see ROADMAP.md). Independent of P73–P77. Run node tools/audit.js first.

The loudest tell on the site is not prose: statscapybara.com/CLAUDE.md opens with "guidance to Claude Code", and /PROMPTS.md, /ROADMAP.md, /VOICE.md, /AGENTS.md and /README.md narrate the entire AI process — served verbatim because GitHub Pages publishes the branch as-is and .nojekyll makes that literal. "Unlinked and un-indexed" was a fine SEO judgment; it is no defense against a student who truncates a URL or anyone who tries /README.md. tools/ ships the checkers' full narration the same way.

1. Move Pages from branch-deploy to the Actions deploy path: a workflow on push to main that checks out, assembles the artifact as "the repo minus an exclude list", and publishes via upload-pages-artifact + deploy-pages (permissions: pages: write, id-token: write). Exclude: the six root .md files (CLAUDE, AGENTS, PROMPTS, ROADMAP, VOICE, README), tools/, .claude/, .github/, .gitignore. Keep EVERYTHING else byte-identical — CNAME, robots.txt, sitemap.xml, sw.js/offline.html, all of assets/ including the practice CSVs. Nothing is processed, minified, or rewritten: this is deploy plumbing, not a build step, and CLAUDE.md's no-build law still holds for the site itself. (Jekyll's _config.yml exclude: was considered and rejected — removing .nojekyll puts a build layer with murky .md/theme behavior under a 136-page verified site; the artifact route is exactly "repo minus a list".)
2. Local proof before anything ships: assemble the artifact directory with the same exclude logic; diff -r against the repo must show ONLY the exclusions; serve the artifact with node tools/serve.js and confirm each excluded URL 404s while the homepage, one lesson, one tool, sw.js and a CSV return byte-identical content. Confirm no served page links into the excluded set (audit's link check + a grep for href="tools/ etc.).
3. Sweep what will actually be served for process references: grep the artifact for Claude/ChatGPT/GPT (expect exactly the legitimate teaching mentions in ml/llms-and-ai-in-research and quiz.html's LLM question — verified 15 Aug 2026), and for prompt/roadmap/P-number strings in HTML comments (expected clean — also verified 15 Aug). List anything new for a judgment call; the datasets' verification comments are a craftsman's audit trail and STAY.
4. robots.txt stays unchanged — a Disallow line would advertise exactly the paths it hides, and after the filter they 404 anyway. Update CLAUDE.md's deploy note and README's "deployed as-is from main" sentence to describe the filtered deploy honestly.
5. The report states the honest limits, with no action taken: the GitHub repo stays public (free-plan Pages requires it), so the docs and the commit history remain reachable by anyone who finds the repo — the options are a paid plan + private repo, or accepting that the site itself no longer points there; Hakan decides. And the guardrail in writing: this prompt adds no claim of human authorship anywhere — it removes signposts, it does not plant flags.
6. Cutover, for Hakan (the one step a session cannot do): after merging, flip Settings → Pages → Source to "GitHub Actions"; confirm the custom domain + HTTPS survive the flip. Roll back by flipping Source back to the branch. First-deploy checklist in the report: curl the six doc URLs (404), the homepage/a lesson/sw.js/a CSV (200), and one full lesson in a browser.

Verification: the local artifact diff plus the 404/200 matrix pasted in the report; node tools/audit.js clean on the repo (it audits the tree, not the artifact — unchanged); no content edits in this prompt. Tick P78 in ROADMAP.md.
```

---

*End of prompt library. After P72 the site is built: 9 courses with landing pages, 97 interactive lessons, an exam mode, a 43-problem worked-problems library, 20+ tools, 5 guides, 3 posters, print/offline/a11y polish, instructor embeds that carry their configuration, math under regression test, honest analytics honestly disclosed, and forgiving search. From there the roadmap IS the loops — P37 (waiting on a Search Console export), P38 quarterly (its next run should sweep the P61–P68 surfaces), P39 refresh — plus the human-only checklist, which is now the growth engine: distribution, not construction. Phases 12–15 (P49–P72) were review-driven punch-lists; anything proposed beyond them should have to argue its way past "the site doesn't need it". Phase 16 (P73–P78) argued its way past it with a measurement: the de-AI job was budget-met, not finished — a paydown and a provenance fix, not a feature.*

