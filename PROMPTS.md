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

```
StatsCapybara roadmap prompt P39 (see ROADMAP.md) — RECURRING; run me a few times a year.

Keep the content alive without bloating it:
1. Pick the 5 least-recently-touched lessons (git log per file). For each: re-read critically — is anything dated, unclear, or missing a cross-link to a course/tool added since it was written? Make surgical improvements only.
2. FAQ freshness: for those lessons, consider one BETTER question that real students ask (swap, don't stack — keep exactly 3; edit tools/faq_data.py, rerun inject + search index).
3. software.js drift: verify 3–4 SPSS/JASP walkthroughs against current menu reality (JASP moves fast); update steps/version notes.
4. Snippets drift: spot-check R/Python snippets still run clean on current package APIs (tidyverse/pingouin churn); fix deprecations.
5. Cross-pollination: newest course/tool gets inbound links — find the 5 most natural older-lesson spots that should reference it and add one-line links (resist over-linking).
6. Quips: refresh any that have worn thin. Keep the bar high — one good line beats three mediocre ones.
7. If ROADMAP.md has a Backlog section (from P37), pick ONE small item and clear it.

Standard verification. Add a dated note under P39 in ROADMAP.md's tracker.
```

---

## Phase 10 — The human-voice edit (P40–P46)

The site's prose was written by one AI in one style in two weeks, and it shows — see ROADMAP.md's Phases 10–11 addendum for the measured baseline (median 24 em-dashes per lesson, ~80 "No —/Yes —" verdict openers, one meta-description formula on a third of all pages, templated lesson openers). P40 builds the standard and the measuring stick; P41–P46 do the editing in six bounded batches. **The iron rule for every batch: prose only — no verified number, statistical claim, formula, code block, element id/class/anchor, link target, or interactive may change.** Quips, the capybara, and the emoji block headers are brand chrome, not slop — they stay.

### P40 — Voice charter + prose linter

```
StatsCapybara roadmap prompt P40 (see ROADMAP.md — read the Phases 10–11 addendum first; it has the measured baseline). Run node tools/audit.js first.

The site's writing is accurate and warm but machine-regular: the same constructions repeat across all 95 lessons, and readers who notice will file the whole site under "AI slop". This prompt creates the standard and the measuring stick; P41–P46 do the rewriting.

1. Write VOICE.md at the repo root (committed). It is the editorial law for all future prose. Contents:
   - The goal in one line: pages that read like one good lecturer wrote them over months — same person, different days — not one process in one pass.
   - HARD RULES (lintable budgets): em-dashes ≤ 10 per lesson/guide/tool page of prose and ≤ 1 per FAQ answer on average; ZERO instances of the banned constructions: the "isn't/wasn't just X — it's Y" contrast punch (and its "it's not about X — it's Y" cousins), "Here's the thing/why/how", "The point is", "That's the whole point/lesson/job", FAQ answers opening with "No — "/"Yes — " (state the actual fact first instead; a bare "No." as a full first sentence is fine occasionally), "Think of it as" (allow ≤ 3 sitewide), "quietly" as an intensifier, "Notice how/that" (≤ 1 per page); meta descriptions built on "…and watch…" capped at 15% of pages.
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

*End of prompt library. When every box in ROADMAP.md is ticked: the site has 9 courses, ~95 interactive lessons, 20 tools, 4 guides, print/offline/a11y polish, prose that reads like a person, instructor-ready embeds, and a live SEO feedback loop. At that point the loops (P37–P39) plus the human checklist ARE the roadmap. Phase 12 (P49–P57) is a live-review punch-list layered on top — cherry-pick as time allows.*

