/* ============================================================
   Shared chrome for every page: theme toggle, homepage curriculum
   index, lesson sidebar, prev/next, search, and progress tracking —
   all generated from curriculum.js so there's one source of truth.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- base path ----------
     Lesson pages live two folders deep (/<course>/<slug>/), the homepage
     at the root. Long-form guides (guides/<slug>/) are also two deep and
     mark themselves with body[data-guide] instead of data-section, so they
     get lesson-depth links without being treated as curriculum lessons
     (no sidebar, no progress tracking). Using relative links keeps the
     whole site working no matter how deep it's hosted. */
  var GUIDE = document.body ? document.body.getAttribute("data-guide") : null;
  var BASE = (document.body && (document.body.getAttribute("data-section") || GUIDE)) ? "../../" : "";
  var HERE = document.body ? document.body.getAttribute("data-section") : null;

  /* ---------- embed mode (?embed=1 on a lesson page) ----------
     Renders a lesson as a bare interactive widget for an <iframe> in slides
     or an LMS: nav, sidebar, prose, FAQ, prev/next and all progress chrome
     drop away (styles.css body.embed-mode), leaving the eyebrow, title, and
     the .viz block(s) with their controls, plus a one-line "open the full
     lesson" footer. Only lessons embed; the canonical still points at the
     clean URL, so there's no SEO wrinkle. GA already fired in the head. */
  function qparam(n) {
    var m = new RegExp("[?&]" + n + "=([^&]*)").exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
  }
  var EMBED = !!HERE && qparam("embed") === "1";

  /* respect the OS "reduce motion" setting for JS-driven scrolls/animations
     (CSS transitions are already handled in styles.css) */
  function prefersReducedMotion() {
    try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
    catch (e) { return false; }
  }
  function scrollBehavior() { return prefersReducedMotion() ? "auto" : "smooth"; }

  /* ---------- mascot ---------- */
  function capy(size) {
    var s = size || 26;
    return '<svg viewBox="0 0 64 60" width="' + s + '" height="' + s + '" aria-hidden="true" style="vertical-align:-6px;flex-shrink:0">' +
      '<ellipse cx="19" cy="15" rx="7" ry="6" fill="#9a6f43"/><ellipse cx="45" cy="15" rx="7" ry="6" fill="#9a6f43"/>' +
      '<rect x="9" y="14" width="46" height="40" rx="17" fill="#b3824f"/>' +
      '<ellipse cx="32" cy="44" rx="16" ry="12" fill="#9a6f43"/>' +
      '<circle cx="23" cy="31" r="2.7" fill="#3a2a1b"/><circle cx="41" cy="31" r="2.7" fill="#3a2a1b"/>' +
      '<ellipse cx="26.5" cy="45" rx="2.3" ry="1.6" fill="#3a2a1b"/><ellipse cx="37.5" cy="45" rx="2.3" ry="1.6" fill="#3a2a1b"/>' +
      '</svg>';
  }

  /* ---------- theme ---------- */
  var root = document.documentElement;
  function setTheme(t) {
    if (t === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    try { localStorage.setItem("theme", t); } catch (e) {}
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.innerHTML = t === "dark" ? sun() : moon();
  }
  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }
  function moon() { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'; }
  function sun() { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>'; }
  function iconSearch() { return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'; }
  function iconMenu() { return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'; }

  /* ---------- page identity (for quips + nav highlighting) ----------
     Lesson pages are keyed by their slug; guide pages by their data-guide
     slug; root pages by their file name ("which-test", "quiz", …); the
     homepage is "home". */
  function pageKey() {
    if (HERE) return HERE;
    if (GUIDE) return GUIDE;
    var m = /([^\/]+)\.html$/.exec(window.location.pathname);
    return m ? m[1] : "home";
  }

  /* ---------- capybara quips ----------
     One per page — quirky on purpose. Lesson slugs and tool pages get a
     topical quip; anything else falls back to the pool (picked by a
     stable hash, so a given page always tells the same joke). */
  var QUIPS = {
    /* Stats 1 */
    "what-is-statistics": "Capybaras don't fear data. They simply vibe with uncertainty. Be like capybara.",
    "types-of-data": "The capybara is nominal, its chill level is ordinal, its bath temperature is interval. Data types, sorted.",
    "describing-data": "The average capybara is unbothered. The median capybara? Also unbothered. Skew who?",
    "visualizing-data": "A capybara never lies with charts. It barely even moves with charts.",
    "z-scores-and-the-normal-distribution": "A capybara 3 SDs above the mean chill is basically a warm rock with a heartbeat.",
    "probability-basics": "50% of capybaras are napping. The other 50% are also napping. Probability!",
    "sampling-distributions": "You can't meet every capybara. You sample a few and trust the vibes. That's inference.",
    "central-limit-theorem": "Stack enough random capybara moods and you get a bell curve. Nature loves a bell.",
    "confidence-intervals": "We're 95% confident the capybara is in the hot spring. The other 5%? Snack run.",
    "hypothesis-testing-logic": "Null hypothesis: the capybara is unbothered. Honestly? Hard to reject.",
    "one-sample-and-paired-t-tests": "Same capybara, before and after the spa. Measure the difference — that's a paired design.",
    "independent-samples-t-test": "Two unrelated capybara squads, one pool, no shared history. That's independent samples.",
    "effect-size-and-power": "The capybara's chill isn't just significant. The effect size is massive.",
    /* Stats 2 */
    "one-way-anova": "Three capybara herds walk into a pool. ANOVA asks: same vibe, or nah?",
    "post-hoc-tests": "Run 20 comparisons and something turns 'significant'. Even the capybara is suspicious.",
    "factorial-anova-two-way": "Warm water × good snacks — capybaras discovered interaction effects first.",
    "repeated-measures-anova": "Measure the same capybara three times. It won't mind. It literally cannot mind.",
    "assumptions-and-when-they-break": "Assumptions are pool floaties: nobody checks them until someone sinks.",
    "non-parametric-alternatives": "Weird data? Rank it. Capybaras don't judge distributions either.",
    "chi-square-tests": "Counting capybaras by category since 1900. Pearson would have loved a hot spring.",
    "correlation": "Snacks up, chill up. Correlated? Sure. Causal? The capybara declines to comment.",
    "simple-linear-regression": "Drawing one straight line through a cloud of chaos and calling it a model — and being right.",
    "regression-diagnostics": "Even capybaras check the mirror. Residual plots are your model's mirror.",
    /* Stats 3 */
    "multiple-regression": "One predictor is a snack. Five predictors is a buffet. Pace yourself.",
    "multicollinearity-and-variable-selection": "Two predictors sharing one trench coat and pretending to be different variables. That's multicollinearity.",
    "categorical-predictors-and-dummy-coding": "Dummy coding is not an insult. It's just capybara = 1, not-capybara = 0.",
    "ancova": "ANCOVA is just ANOVA that remembered to control for the vibes.",
    "interactions-in-regression": "Sometimes the effect of snacks depends on the pool. That's an interaction. Keep up.",
    "mediation-and-indirect-effects": "Snacks → serenity → chill. The capybara understood mediation all along.",
    "logistic-regression": "Will the capybara enter the pool? Yes / no. Logistic regression was born for this.",
    "assumptions-of-regression": "Linear, independent, equal-variance, roughly normal. The capybara checks all four before it relaxes.",
    "model-comparison": "Two models enter, one AIC leaves. The capybara bets on the simpler one.",
    "factor-analysis-pca": "43 personality questions, one latent trait: chill. PCA knew it all along.",
    "manova": "Why test one outcome when you can test four at once and still control your error rate? That's MANOVA.",
    "power-analysis-for-complex-designs": "The capybara saw the effect clearly. Your n = 12 did not.",
    /* Stats 4 */
    "bootstrap-and-resampling": "Resample your own data 10,000 times. Capybaras call this self-care.",
    "bayesian-thinking": "The capybara had priors about you. It updated them. That's growth.",
    "bayesian-estimation": "The 95% credible interval: where the capybara actually believes the truth naps.",
    "generalized-linear-models": "One straight line, three disguises — the link function just changes its outfit. Underneath, same capybara.",
    "mixed-and-multilevel-models": "Capybaras nested in herds nested in hot springs. Multilevel living.",
    "cross-validation-and-overfitting": "Memorizing the training data is not learning. Even capybaras generalize.",
    "causal-dags-and-confounding": "The pool didn't cause the chill. The capybara confounds us all.",
    "survival-analysis": "How long until the capybara leaves the spa? Right-censored. It never left.",
    "missing-data": "The missing capybaras were not missing at random. They found a better pond.",
    "meta-analysis": "One study is an anecdote. Twenty studies is a forest plot full of capybaras.",
    "psychometric-functions": "Between a short dip and a long soak lies a duration no capybara can call. That's the PSE.",
    "signal-detection-theory": "A rustle in the reeds: jaguar, or wind? A capybara's whole day is one long yes/no detection task.",
    /* Methods */
    "from-question-to-hypothesis": "The capybara's hypothesis: warm water is nice. Falsifiable only if it ever climbs out — it won't.",
    "variables-and-operationalization": "You can't measure 'chill.' You can measure naps per hour. That's operationalization.",
    "reliability-and-validity": "A capybara is reliably calm and validly a capybara. Nailing both at once is the rare part.",
    "experimental-design-and-randomization": "The capybara assigns hot-spring seats by coin flip. Even the grumpy ones end up evenly spread.",
    "between-vs-within-designs": "One capybara soaking twice, or two capybaras once each? Fewer capybaras the first way — unless the first bath lingers.",
    "quasi-experiments": "Couldn't randomize the weather, so the capybara compared its pond to the one next door — and hoped they'd have drifted alike.",
    "observational-designs": "The capybara didn't assign anyone to the warm spring. It just watched who wandered in — and noted who was never seen leaving.",
    "sampling-methods": "Poll only the capybaras already in the spa and 100% love warm water. Shocking. Also: sample the whole pond next time.",
    "survey-and-questionnaire-design": "\"Don't you agree this lovely water is wonderful?\" The capybara agrees. The capybara would agree with anything phrased like that.",
    "bias-and-blinding": "The capybara double-blinds its taste tests — even it doesn't know which pond the water came from. No expectations, no bias, just vibes.",
    "the-replication-crisis": "The capybara found a 'significant' result on its fourth analysis. Then remembered the first three. Next time: preregister, then snack.",
    "preregistration-and-open-science": "The capybara wrote its whole plan down before the snack arrived — so it couldn't pretend afterwards that it always wanted the small one.",
    /* Data */
    "tidy-data": "One capybara per row, one trait per column, one nap per cell. The capybara keeps a very tidy pond.",
    "codebooks-and-documentation": "Six months later the capybara found a column named 'grp'. No codebook. It is still guessing.",
    "data-entry-and-validation": "A capybara weighing 512 kg? The validation rule says no. The capybara says please.",
    "data-cleaning-workflow": "The capybara never edits the raw pond. It writes a script, keeps the mud, and hands you a spotless lake.",
    "outliers-in-practice": "One capybara is four times the size of the rest. Before evicting it, the capybara asks: typo, different pond, or just a very large capybara?",
    "transformations-and-recoding": "The capybara took the log of its income and finally slept soundly. A median split it refused — why throw away half the pond?",
    "wide-vs-long-data": "The capybara stacked its naps into one long column. Now every tool in the pond knows exactly what to do with them.",
    "merging-datasets": "Two ponds, one shared ID. The capybara joined them — then counted the rows twice, because one clone is one too many.",
    "reproducible-workflows": "The capybara's whole study fits in a script. Hand it to a stranger and the same lake pours out, every single time.",
    "data-privacy-basics": "The capybara crossed out its name. Then a snoop matched its age, pond, and stripe count. Anonymity is harder than it looks.",
    /* Ethics — gentle by design; these lessons cover real harm */
    "why-research-ethics": "Every rule in this course was written after someone was harmed. The capybara reads this one slowly, and remembers why consent comes first.",
    "informed-consent-and-irb": "Before anything begins, the capybara makes sure everyone knows what they're agreeing to — in plain words, and free to say no.",
    "deception-and-debriefing": "If a study must keep a secret, the capybara tells the whole truth the moment it ends — and lets anyone take their data back.",
    "privacy-and-confidentiality": "The capybara keeps every secret it's trusted with — off email, under lock, and named with the true word: confidential, not “anonymous.”",
    "questionable-research-practices": "Nobody meant to cheat. The capybara just kept peeking until the noise looked like a finding — so now it fixes the rules before the data arrive.",
    "plagiarism-authorship-and-citation": "The capybara credits every paw that did the work, quotes what isn't its own, and only cites the ponds it actually swam in.",
    "ai-in-research-ethics": "The capybara lets the clever tool help — then reads every word and reruns every number itself, because its name is the one on the work.",
    "fraud-and-self-correction": "Real ponds are murky; the capybara distrusts water that's suspiciously clear. It reports the numbers it truly measured, and lets others check them.",
    /* ML & AI — for the stats student who knows regression */
    "prediction-vs-explanation": "The capybara can explain *why* it's chill, or *predict* how chill it'll be tomorrow — but it fits a different model for each. Two questions, two answers.",
    "train-test-split-and-generalization": "The capybara never grades itself on ponds it already memorized. Fresh water, honest score — peeking at the test set just fools the capybara.",
    "regularization-ridge-and-lasso": "Too many predictors, too little data? The capybara shrinks the loud coefficients and quietly evicts the freeloaders. Lasso sets them to exactly zero.",
    "classification-metrics": "\"99% accurate at spotting rare capybaras!\" — says the model that labels everything 'not a capybara'. Ask it about recall and watch it squirm.",
    "roc-curves-and-auc": "The capybara doesn't pick one threshold — it tries them all and plots the whole curve. Top-left corner good, diagonal is a coin flip.",
    "decision-trees": "Split, split, split until every leaf is one happy capybara. Grow too deep and the tree just memorizes the pond — test day is a rude surprise.",
    "random-forests-and-ensembles": "One capybara's opinion is jumpy; a whole raft of them, each shown slightly different reeds, votes remarkably wisely. Bag, randomize, average — the noise cancels out.",
    "knn-and-distance": "The capybara asks its nearest neighbours and copies them. Scale your axes first — and in 100 dimensions everyone is equally far away and equally unhelpful.",
    "clustering-kmeans": "No labels? The capybara sorts the pond into k piles by proximity. Lovely on round blobs, hilariously confident on two moons. Clusters are hypotheses, not facts.",
    "dimensionality-reduction": "Two hundred variables won't fit on a lily pad. PCA squashes them flat and honestly; t-SNE untangles them beautifully but fibs about distances. Squash to measure, unfold to look.",
    "neural-networks-intuition": "A neuron is just the logistic regression the capybara already knows, wearing a lab coat. Stack a few, roll downhill, and straight lines learn to bend around XOR.",
    "llms-and-ai-in-research": "The capybara's chatbot writes with total confidence and occasional total fiction. Fluent isn't true — verify every fact, number, and citation, because your name is on it.",
    /* Writing */
    "imrad-structure": "Why it looked, how it looked, what it saw, what it means — the capybara tells every study the same four-part way. Put each sentence in its room and the paper reads itself.",
    "reporting-statistics-apa": "Italic t, upright η², and no little zero before the dot. The capybara reports its p-value cleanly — and would never, ever write p = .000.",
    "tables-and-figures": "Chop the axis at 45 and the capybara's three-point lead looks like a landslide. Start the bar at zero and let a small effect look small — that's information too.",
    "writing-results": "What it tested, how big, how sure — the capybara says each result in one tidy past-tense sentence, then bites its tongue. 'What it means' waits its turn in the Discussion.",
    "nonsignificant-results": "p = .08 is not 'a trend toward a nap.' The capybara reads the interval instead — wide means 'who knows yet,' tight-and-near-zero means 'genuinely nothing here.'",
    "discussion-and-limitations": "The capybara found a correlation, so it writes 'was associated with,' never 'causes.' Match the verb to the design and your claims outlive the ones that oversold.",
    "abstracts-and-titles": "The capybara writes the abstract last, in five tidy moves, and puts the actual number in the result. Its titles say what it found — searchable beats clever when a reader is looking for exactly you.",
    "final-checklist": "The capybara rereads its own paper as a grumpy grader: does every number match, does each df fit the n, is every figure and citation accounted for? Cheap mistakes, caught before they cost marks.",
    /* Guides */
    "analyze-thesis-data-jasp": "The capybara's first thesis analysis felt enormous too. Then it clicked Descriptives, breathed, and did the next step. There is always just a next step.",
    "spss-output-to-apa": "SPSS prints eleven numbers; your sentence needs five. The capybara knows which five — and it has never once copied 'Sig. = .000'.",
    "choose-statistics-dissertation": "One outcome, two groups, nobody measured twice — the capybara names the test before its tea cools. Not memory; just asking three questions in order.",
    "clean-survey-data": "The capybara cleans data the way it grooms: gently, in a fixed order, and never losing the raw coat underneath.",
    /* Root pages */
    "home": "No rush — capybaras never cram.",
    "toolbox": "A capybara's toolbox: warm water, good snacks, zero deadlines. Yours has calculators too.",
    "which-test": "Lost? The capybara also can't pick a pool. That's literally why this page exists.",
    "which-chart": "A pie chart of the capybara's day would be one giant slice labelled 'napping.' Even then, it says, use a bar.",
    "plan": "The capybara writes the whole plan before the data arrive — test, sample size, and how it'll report it. Then, and only then, it naps.",
    "tables": "Capybaras have memorized exactly zero critical values. That's what this page is for.",
    "formulas": "Print it, laminate it, take it into the bath. The capybara approves.",
    "cheat-test-chooser": "The whole test-picking map on one page. The capybara pinned it above the hot spring, naturally.",
    "cheat-apa": "Italic t, upright η², and never a little zero before the dot — the capybara laminated this one first.",
    "cheat-assumptions": "The capybara checks its assumptions the way it checks the water: before getting in, never after.",
    "distributions": "Distributions are just personality types for data. Come meet the whole squad.",
    "effect-sizes": "Statistically significant ≠ big. The capybara is significant AND big.",
    "power": "How many capybaras do you need to prove capybaras are chill? Fewer than you'd think, if the effect is big.",
    "descriptives": "Paste your data. The capybara will not judge it. The capybara judges nothing.",
    "apa": "Italic t, upright η², and never a little zero before the dot. The capybara writes its p-values just so.",
    "datasets": "Reading about a t-test isn't running one. Grab a CSV, wrangle real numbers, and the capybara will happily wait — it has nowhere to be.",
    "quiz": "Test anxiety? Unknown to capybaras. Breathe in, breathe out, click an answer.",
    "glossary": "Big words, small stress. The capybara defines, you vibe.",
    "flashcards": "Flip, rate, repeat. The capybara only revises the words it forgot — and it forgets nothing on purpose, only for spacing.",
    "progress": "No streaks, no nagging — just your rings filling up at capybara pace. Finish a whole course and there's a certificate soaking in it for you.",
    "teachers": "One syllabus link, a whole class taught. The capybara would put that on its CV, if capybaras had jobs."
  };
  var QUIP_POOL = [
    "Be the least stressed mammal in the room.",
    "A capybara's p-value for panicking is always > .05.",
    "Study tip from the capybara: hydrate, then estimate.",
    "The capybara read the assumptions. The capybara is unbothered anyway.",
    "Normality is a spectrum. Chill is a lifestyle.",
    "Error bars? The capybara embraces uncertainty daily."
  ];
  function quipFor() {
    var key = pageKey();
    if (QUIPS[key]) return QUIPS[key];
    var h = 0;
    for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return QUIP_POOL[h % QUIP_POOL.length];
  }

  /* ============================================================
     PROGRESS (localStorage)  —  { slug: { v: visitedTs, d: doneBool } }
     ============================================================ */
  var PKEY = "sc-progress", LKEY = "sc-last";
  function loadProgress() { try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch (e) { return {}; } }
  function saveProgress(p) { try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch (e) {} }
  function markVisited(slug) {
    if (!slug) return;
    var p = loadProgress();
    if (!p[slug]) { p[slug] = { v: Date.now(), d: false }; saveProgress(p); }
  }
  function isDone(slug) { var p = loadProgress(); return !!(p[slug] && p[slug].d); }
  function isVisited(slug) { var p = loadProgress(); return !!p[slug]; }
  function setDone(slug, val) {
    var p = loadProgress();
    p[slug] = p[slug] || { v: Date.now() };
    p[slug].d = val; saveProgress(p);
  }
  function setLast(rec) { try { localStorage.setItem(LKEY, JSON.stringify(rec)); } catch (e) {} }
  function getLast() { try { return JSON.parse(localStorage.getItem(LKEY)); } catch (e) { return null; } }

  /* best "check your understanding" score per lesson — { slug: { c, t } } */
  var CKEY = "sc-checks";
  function loadCheckScores() { try { return JSON.parse(localStorage.getItem(CKEY)) || {}; } catch (e) { return {}; } }
  function saveCheckScore(slug, correct, total) {
    try {
      var all = loadCheckScores();
      if (!all[slug] || correct > all[slug].c) { all[slug] = { c: correct, t: total }; localStorage.setItem(CKEY, JSON.stringify(all)); }
    } catch (e) {}
  }

  /* ---------- top nav ----------
     P60: the nav mirrors the site's real shape — one dropdown per
     curriculum track ("Statistics Core", "Research Toolkit", both built
     from window.TRACKS + CURRICULUM) plus the "Statistics Toolbox" pill.
     Hovering or keyboard-focusing an item drops its menu; clicking a track
     tab goes to the homepage scrolled to that track (#track-<id>), clicking
     the Toolbox pill opens toolbox.html. TOOLBOX is the single source of
     truth — the dropdown, the homepage grid, and the toolbox page all
     read it. */
  var TOOLBOX = [
    { url: "which-test.html",    key: "which-test",    group: "guide",    emoji: "🧭", title: "Which test should I use?", desc: "Answer a few questions, get the right test" },
    { url: "which-chart.html",   key: "which-chart",   group: "guide",    emoji: "📊", title: "Which chart should I use?", desc: "Pick the right chart for your data, mistakes and all" },
    { url: "plan.html",          key: "plan",          group: "guide",    emoji: "🗺️", title: "Plan my analysis",         desc: "Question → test, sample size & APA — a printable plan" },
    { url: "tables.html",        key: "tables",        group: "calc",     emoji: "🎛️", title: "Tables & calculators",     desc: "Exact z, t, χ² and F — no appendix flipping" },
    { url: "distributions.html", key: "distributions", group: "practice", emoji: "🎢", title: "Distribution playground",  desc: "Poke 9 distributions and watch them wiggle" },
    { url: "effect-sizes.html",  key: "effect-sizes",  group: "calc",     emoji: "📏", title: "Effect-size converter",    desc: "d ↔ r ↔ η² — plus what they actually mean" },
    { url: "power.html",         key: "power",         group: "calc",     emoji: "⚡", title: "Power & sample size",       desc: "How many participants? Solve n, power, or effect" },
    { url: "descriptives.html",  key: "descriptives",  group: "calc",     emoji: "🧮", title: "Descriptives calculator",  desc: "Paste data, get stats, a histogram & APA text" },
    { url: "correlation.html",   key: "correlation",   group: "calc",     emoji: "📈", title: "Correlation & regression",  desc: "Paste X and Y: scatter, r, ρ, the best-fit line & APA" },
    { url: "apa.html",           key: "apa",           group: "calc",     emoji: "📝", title: "APA results formatter",    desc: "Type your numbers, copy a correct APA 7 sentence" },
    { url: "datasets.html",      key: "datasets",      group: "practice", emoji: "🗂️", title: "Practice datasets",        desc: "Download real CSVs with stories, exercises & solutions" },
    { url: "formulas.html",      key: "formulas",      group: "guide",    emoji: "🖨️", title: "Formula sheet",            desc: "Every formula from the course, printable" },
    { url: "cheat-test-chooser.html", key: "cheat-test-chooser", group: "guide", emoji: "🧾", title: "Cheat sheet: which test",  desc: "Printable poster — outcome × design → the test" },
    { url: "cheat-apa.html",     key: "cheat-apa",     group: "guide",    emoji: "🖋️", title: "Cheat sheet: APA reporting", desc: "Printable poster — report t, F, χ², r & regression" },
    { url: "cheat-assumptions.html", key: "cheat-assumptions", group: "guide", emoji: "🔎", title: "Cheat sheet: assumptions",  desc: "Printable poster — what to check & the fix when it breaks" },
    { url: "glossary.html",      key: "glossary",      group: "guide",    emoji: "📖", title: "Glossary",                 desc: "Every stats term, defined without the jargon" },
    { url: "flashcards.html",    key: "flashcards",    group: "practice", emoji: "🃏", title: "Glossary flashcards",      desc: "Spaced-repetition drilling of every glossary term" },
    { url: "quiz.html",          key: "quiz",          group: "practice", emoji: "✅", title: "Quiz",                     desc: "Test yourself across every course" },
    { url: "progress.html",      key: "progress",      group: "practice", emoji: "🌱", title: "My progress",              desc: "Your rings, what's left, and course certificates" },
    /* long-form guides — guides/<slug>/index.html, group "read" (P34) */
    { url: "guides/analyze-thesis-data-jasp/",       key: "analyze-thesis-data-jasp",       group: "read", emoji: "🧪", title: "Analyze your thesis data in JASP", desc: "Import → check → test → APA, the whole path in free software" },
    { url: "guides/spss-output-to-apa/",             key: "spss-output-to-apa",             group: "read", emoji: "📄", title: "From SPSS output to APA results",  desc: "Annotated output for the five classic tests — and the exact sentence" },
    { url: "guides/choose-statistics-dissertation/", key: "choose-statistics-dissertation", group: "read", emoji: "🎓", title: "Choosing statistics for your dissertation", desc: "Three questions that pick your test — plus honest words on messy designs" },
    { url: "guides/clean-survey-data/",              key: "clean-survey-data",              group: "read", emoji: "🧹", title: "Clean your survey data, step by step", desc: "From raw export to analysis-ready, with a real dataset to follow along" },
    { url: "teachers.html",                          key: "teachers",                       group: "read", emoji: "🧑‍🏫", title: "For instructors",                     desc: "Use the site in your course: link, embed, print & assign — free" }
  ];
  /* the four toolbox groups — the homepage grid and toolbox.html render the
     same grouped layout, so the titles/blurbs live here beside TOOLBOX */
  var TOOLBOX_GROUPS = [
    { id: "guide",    title: "🧭 Decide & look up",   sub: "For when you know what you need but not what it's called — or the other way round." },
    { id: "calc",     title: "🎛️ Calculate",          sub: "Exact numbers for your homework and write-ups — no appendix tables, no approximations." },
    { id: "practice", title: "🎮 Explore & practice", sub: "Build intuition by playing, then prove to yourself it stuck." },
    { id: "read",     title: "📚 Read the guides",    sub: "Long-form walkthroughs for the big moments — a whole thesis analysis, cryptic SPSS output, a messy survey export." }
  ];
  window.TOOLBOX = TOOLBOX;                 // toolbox.html renders its grouped grid
  window.TOOLBOX_GROUPS = TOOLBOX_GROUPS;   // from these two
  function renderNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    var page = pageKey();
    var act = function (k) { return k === page ? " active" : ""; };
    var chev = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';

    // a lesson page lights the tab of ITS track (course → track via curriculum)
    var hereCourse = HERE ? window.CURRICULUM.find(function (c) {
      return c.sections.some(function (s) { return s.slug === HERE; });
    }) : null;
    var hereTrack = hereCourse ? (hereCourse.track || "core") : null;

    /* one dropdown per populated track, listing its courses; each course row
       links to the course's first ready lesson (the same entry URL as the
       homepage ItemList JSON-LD), the tab itself to the homepage scrolled to
       that track's heading (#track-<id>, rendered by renderCurriculum) */
    var trackDrops = (window.TRACKS || []).map(function (t) {
      var courses = window.CURRICULUM.filter(function (c) { return (c.track || "core") === t.id; });
      if (!courses.length) return "";
      var items = courses.map(function (c) {
        var first = null;
        for (var i = 0; i < c.sections.length && !first; i++) if (c.sections[i].ready) first = c.sections[i];
        if (!first) return "";
        var on = hereCourse && hereCourse.slug === c.slug ? " active" : "";
        return '<a class="nav-drop-item' + on + '" href="' + BASE + c.slug + '/' + first.slug + '/">' +
          '<span class="nd-dot" style="--accent:' + c.accent + '"></span>' +
          '<span class="nd-text"><span class="nd-title">' + c.title + '</span><span class="nd-desc">' + c.subtitle + '</span></span></a>';
      }).join("");
      return '<div class="nav-drop">' +
        '<a class="nav-link nav-drop-tab' + (hereTrack === t.id ? " active" : "") + '" href="' + (BASE || "./") + '#track-' + t.id +
          '" aria-haspopup="true" aria-expanded="false">' + t.title.replace(/^The\s+/, "") + chev + '</a>' +
        '<div class="nav-drop-panel">' + items + '</div>' +
      '</div>';
    }).join("");

    var toolboxActive = page === "toolbox" || TOOLBOX.some(function (t) { return t.key === page; });
    /* the Toolbox panel groups its tools exactly like toolbox.html
       (TOOLBOX_GROUPS order and titles), as compact one-line rows split
       across two columns — whole groups only, order preserved — so all
       tools stay visible on a 768px-tall viewport without scrolling */
    var tGroups = TOOLBOX_GROUPS.map(function (g) {
      var items = TOOLBOX.filter(function (t) { return t.group === g.id; });
      if (!items.length) return null;
      return { n: items.length, html:
        '<div class="ndp-group"><div class="ndp-ghead">' + g.title + '</div>' +
        items.map(function (t) {
          return '<a class="nav-drop-item ndi-compact' + act(t.key) + '" href="' + BASE + t.url + '">' +
            '<span class="nd-emoji">' + t.emoji + '</span><span class="nd-title">' + t.title + '</span></a>';
        }).join("") + '</div>' };
    }).filter(function (g) { return g; });
    var totalW = 0, accW = 0, col1 = [], col2 = [];
    tGroups.forEach(function (g) { totalW += g.n + 0.8; });
    tGroups.forEach(function (g) {
      if (accW < totalW / 2) { col1.push(g.html); accW += g.n + 0.8; }
      else col2.push(g.html);
    });
    var toolboxPanel = '<div class="nav-drop-panel ndp-toolbox">' +
      '<div class="ndp-col">' + col1.join("") + '</div>' +
      (col2.length ? '<div class="ndp-col">' + col2.join("") + '</div>' : '') +
    '</div>';

    nav.innerHTML =
      '<div class="nav-inner">' +
        '<a class="brand" href="' + (BASE || "./") + '" style="display:inline-flex;align-items:center;gap:.5rem">' + capy(36) + 'Stats<span class="dot">Capybara</span></a>' +
        '<nav class="nav-links" id="nav-links" aria-label="Primary">' +
          trackDrops +
          '<div class="nav-drop">' +
            '<a class="nav-link nav-drop-btn' + (toolboxActive ? " active" : "") + '" href="' + BASE + 'toolbox.html" aria-haspopup="true" aria-expanded="false"><span class="ndb-label"><span class="ndb-emoji" aria-hidden="true">🧰</span>Statistics Toolbox</span>' + chev + '</a>' +
            toolboxPanel +
          '</div>' +
        '</nav>' +
        '<div class="nav-actions">' +
          '<button id="nav-search" class="nav-search-btn" aria-label="Search lessons (press /)">' + iconSearch() + '<span class="ns-label">Search</span><kbd class="ns-kbd">/</kbd></button>' +
          '<button id="theme-toggle" class="icon-btn" aria-label="Toggle theme"></button>' +
          '<button id="nav-toggle" class="icon-btn nav-toggle" aria-label="Menu" aria-controls="nav-links" aria-expanded="false">' + iconMenu() + '</button>' +
        '</div>' +
      '</div>';

    var btn = document.getElementById("theme-toggle");
    btn.innerHTML = currentTheme() === "dark" ? sun() : moon();
    btn.addEventListener("click", function () { setTheme(currentTheme() === "dark" ? "light" : "dark"); });

    document.getElementById("nav-search").addEventListener("click", openSearch);

    var tog = document.getElementById("nav-toggle");
    tog.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      tog.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // close the mobile menu after tapping a link
    document.getElementById("nav-links").addEventListener("click", function (e) {
      if (e.target.closest("a")) { document.body.classList.remove("nav-open"); tog.setAttribute("aria-expanded", "false"); }
    });
    // Escape closes the open mobile menu and returns focus to the hamburger
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        document.body.classList.remove("nav-open");
        tog.setAttribute("aria-expanded", "false");
        tog.focus();
      }
    });

    /* Dropdown state: opening/closing is CSS-driven (:hover / :focus-within,
       shared by all three menus); JS mirrors that state onto aria-expanded
       and adds the Escape hatch — Escape force-closes the open panel (the
       .closed class wins over :hover/:focus-within in the CSS) and returns
       focus to its tab. .closed clears as soon as the pointer or focus
       leaves, so the menu opens normally next time. On mobile the panels
       are suppressed entirely (plain links), so aria-expanded stays false. */
    var mobileNav = window.matchMedia ? window.matchMedia("(max-width: 860px)") : null;
    Array.prototype.forEach.call(nav.querySelectorAll(".nav-drop"), function (drop) {
      var btn = drop.querySelector("[aria-haspopup]");
      if (!btn) return;
      function set(open) {
        var flat = mobileNav && mobileNav.matches;   // no panel on mobile
        btn.setAttribute("aria-expanded", open && !flat ? "true" : "false");
      }
      drop.addEventListener("mouseenter", function () { drop.classList.remove("closed"); set(true); });
      drop.addEventListener("mouseleave", function () { drop.classList.remove("closed"); set(false); });
      drop.addEventListener("focusin", function () { if (!drop.classList.contains("closed")) set(true); });
      drop.addEventListener("focusout", function (e) {
        if (!drop.contains(e.relatedTarget)) { drop.classList.remove("closed"); set(false); }
      });
      drop.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") return;
        drop.classList.add("closed"); set(false); btn.focus();
      });
      // Escape also dismisses a hover-opened panel while focus sits elsewhere
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !drop.contains(document.activeElement) && drop.matches(":hover")) {
          drop.classList.add("closed"); set(false);
        }
      });
    });
  }

  /* ---------- progress ring (SVG) for homepage cards ---------- */
  function ring(frac, accent) {
    var r = 20, c = 2 * Math.PI * r, off = c * (1 - frac), pct = Math.round(frac * 100);
    return '<span class="ring" title="' + pct + '% explored" style="--accent:' + accent + '">' +
      '<svg width="48" height="48" viewBox="0 0 48 48">' +
        '<circle class="ring-track" cx="24" cy="24" r="' + r + '" fill="none" stroke-width="4.5"/>' +
        '<circle class="ring-fill" cx="24" cy="24" r="' + r + '" fill="none" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
      '</svg><span class="ring-label">' + pct + '%</span></span>';
  }
  /* ---------- shared "Copied!" feedback ----------
     One pattern for every copy button on the site (the R/Python snippet
     block here, plus the APA / descriptives / correlation tools): same
     wording, same 1.4s revert, green .copied tint, and aria-live polite
     so screen readers hear the confirmation. Call AFTER the clipboard
     write resolves. */
  function flashCopied(btn) {
    if (!btn) return;
    if (!btn.getAttribute("aria-live")) btn.setAttribute("aria-live", "polite");
    if (!btn.__copyLabel) btn.__copyLabel = btn.textContent;
    btn.classList.add("copied");
    btn.textContent = "Copied!";
    clearTimeout(btn.__copyT);
    btn.__copyT = setTimeout(function () {
      btn.classList.remove("copied");
      btn.textContent = btn.__copyLabel;
    }, 1400);
  }

  /* expose the ring + mascot so a standalone page (progress.html) can reuse the
     exact same drawing instead of duplicating it — and the copy feedback so
     tool pages share one "Copied!" pattern */
  window.SC = { ring: ring, capy: capy, copied: flashCopied };

  /* ---------- homepage curriculum grid ---------- */
  function courseCard(c) {
    var ready = c.sections.filter(function (s) { return s.ready; });
    var visited = ready.filter(function (s) { return isVisited(s.slug); }).length;
    var frac = ready.length ? visited / ready.length : 0;
    var items = c.sections.map(function (s) {
      var state = isDone(s.slug) ? " done" : (isVisited(s.slug) ? " visited" : "");
      var inner =
        '<span class="sec-dot"></span>' +
        '<span><span class="sec-num">' + s.n + '</span>' + s.title + '</span>' +
        '<span class="sec-check" aria-hidden="true">✓</span>';
      return s.ready
        ? '<li><a class="' + state.trim() + '" href="' + BASE + c.slug + '/' + s.slug + '/">' + inner + '</a></li>'
        : '<li><a style="cursor:default;opacity:.65" title="Coming soon">' +
            '<span class="sec-dot"></span><span><span class="sec-num">' + s.n + '</span>' + s.title + '</span>' +
            '<span style="margin-left:auto;font-size:.68rem;color:var(--text-faint)">soon</span></a></li>';
    }).join("");
    return (
      '<div class="course-card" style="--accent:' + c.accent + '">' +
        '<div class="ch">' + ring(frac, c.accent) +
          '<span class="ch-text"><h3>' + c.title + '</h3><span>' + c.subtitle +
            ' · ' + ready.length + ' lesson' + (ready.length === 1 ? '' : 's') + '</span></span>' +
        '</div>' +
        '<ul>' + items + '</ul>' +
      '</div>'
    );
  }
  function renderCurriculum() {
    var host = document.getElementById("curriculum-grid");
    if (!host) return;
    /* Group the course cards by track, in TRACKS order, keeping only the
       tracks that actually have courses. A heading is drawn above each
       group ONLY when more than one track is populated — so today's
       single ("core") track renders as one flat grid, byte-for-byte as
       before. Track headings span the whole grid row (.track-head CSS). */
    var tracks = (window.TRACKS && window.TRACKS.length) ? window.TRACKS : [{ id: "core", title: "" }];
    var known = {};
    tracks.forEach(function (t) { known[t.id] = 1; });
    var groups = tracks.map(function (t) {
      return { id: t.id, title: t.title, desc: t.desc, courses: window.CURRICULUM.filter(function (c) { return (c.track || "core") === t.id; }) };
    }).filter(function (g) { return g.courses.length; });
    // any course on an unlisted track still shows, in a trailing untitled group
    var orphans = window.CURRICULUM.filter(function (c) { return !known[c.track || "core"]; });
    if (orphans.length) groups.push({ title: "", courses: orphans });

    if (groups.length > 1) {
      /* h2 (the homepage's h1 is the hero title, and P60 removed the old
         section h2 above the grid) with a stable id per track — the nav's
         track tabs deep-link here as #track-<id> */
      host.innerHTML = groups.map(function (g) {
        return (g.title ? '<h2 class="track-head"' + (g.id ? ' id="track-' + g.id + '"' : '') + '>' + g.title + '</h2>' : '') +
          (g.title && g.desc ? '<p class="track-desc">' + g.desc + '</p>' : '') +
          g.courses.map(courseCard).join("");
      }).join("");
    } else {
      host.innerHTML = window.CURRICULUM.map(courseCard).join("");
    }
  }

  /* ---------- live lesson / course counts ----------
     Any element with data-count="courses" | "lessons" | "courses-word"
     is filled from the curriculum at runtime, so the homepage's visible
     totals can never fall out of step with curriculum.js. (The static
     numbers baked into <meta>/OG/JSON-LD stay put and are guarded by
     audit.js instead.) */
  var NUM_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
    "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen", "twenty"];
  function numWord(n) {
    var w = NUM_WORDS[n] || String(n);
    return w.charAt(0).toUpperCase() + w.slice(1);
  }
  function renderCounts() {
    var courses = window.CURRICULUM.length;
    var lessons = window.CURRICULUM_FLAT.filter(function (s) { return s.ready; }).length;
    var vals = { courses: String(courses), lessons: String(lessons), "courses-word": numWord(courses) };
    Array.prototype.forEach.call(document.querySelectorAll("[data-count]"), function (el) {
      var v = vals[el.getAttribute("data-count")];
      if (v != null) el.textContent = v;
    });
  }

  /* ---------- homepage toolbox grid (reads TOOLBOX, same as the nav) ----------
     P55: the homepage shows the FULL toolbox as a grouped grid — the same
     groups as toolbox.html, with heading rows spanning the grid the way the
     curriculum's track heads do. Nothing hides behind a "see all" card, so
     a new TOOLBOX entry appears here automatically. */
  function renderToolbox() {
    var host = document.getElementById("toolbox-grid");
    if (!host) return;
    host.innerHTML = TOOLBOX_GROUPS.map(function (g) {
      var cards = TOOLBOX.filter(function (t) { return t.group === g.id; });
      if (!cards.length) return "";
      return '<h3 class="tbx-head">' + g.title + '</h3>' +
        '<p class="tbx-desc">' + g.sub + '</p>' +
        cards.map(function (t) {
          return '<a class="tool-card" href="' + BASE + t.url + '">' +
            '<span class="tool-emoji" aria-hidden="true">' + t.emoji + '</span>' +
            '<span class="tool-title">' + t.title + '</span>' +
            '<span class="tool-desc">' + t.desc + '</span></a>';
        }).join("");
    }).join("");
  }

  /* ---------- resume banner (homepage hero) ----------
     Returning visitors only (sc-last must exist): the banner renders in the
     hero, between the eyebrow and the h1, as a proper welcome-back. site.js
     runs synchronously at the end of <body>, so the injection lands before
     first paint and the hero never jolts. If the last-visited lesson was
     finished, it points at the next unexplored one instead. */
  function renderResume() {
    var slot = document.getElementById("hero-resume");
    var grid = document.getElementById("curriculum-grid");
    if (!slot && !grid) return;
    var last = getLast();
    if (!last) return;                                        // first visit — no banner
    if (isDone(last.slug)) last = firstUnexplored() || last;
    var bar = document.createElement("div");
    bar.className = "resume-bar" + (slot ? " resume-hero" : "");
    bar.innerHTML =
      capy(34) +
      '<span class="rb-text">Pick up where you left off — <strong>' + last.n + ' ' + last.title + '</strong></span>' +
      '<a class="btn btn-primary btn-sm" href="' + BASE + last.course + '/' + last.slug + '/">Resume →</a>' +
      '<a class="rb-progress" href="' + BASE + 'progress.html" style="font-size:.85rem;font-weight:650;color:var(--primary);text-decoration:none;white-space:nowrap">My progress →</a>';
    if (slot) slot.appendChild(bar);
    else grid.parentNode.insertBefore(bar, grid);
  }
  function firstUnexplored() {
    var flat = window.CURRICULUM_FLAT;
    for (var i = 0; i < flat.length; i++) { if (flat[i].ready && !isVisited(flat[i].slug)) return flat[i]; }
    return null;
  }

  /* ---------- lesson sidebar ----------
     Each course is a collapsible <details> group; only the course
     containing the current lesson starts open, so the list never
     feels like a wall (especially on mobile). */
  function renderSidebar() {
    var host = document.getElementById("sidebar");
    if (!host) return;
    var chev = '<svg class="chev" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>';
    function courseGroup(c) {
      var isCurrent = c.sections.some(function (s) { return s.slug === HERE; });
      var doneN = c.sections.filter(function (s) { return isDone(s.slug); }).length;
      var links = c.sections.map(function (s) {
        var cls = (s.slug === HERE ? "active" : "") + (isDone(s.slug) ? " done" : "");
        var tick = isDone(s.slug) ? '<span class="tick" aria-hidden="true">✓</span>' : "";
        var label = '<span class="n">' + s.n + '</span>' + s.title + tick;
        // the resident capybara sits right under the lesson you're on,
        // so its per-page quip is always in view
        var quip = s.slug === HERE
          ? '<div class="sb-capy">' + capy(30) + '<span>' + quipFor() + '</span></div>'
          : "";
        if (s.ready || s.slug === HERE) {
          return '<a class="' + cls.trim() + '" href="' + BASE + c.slug + '/' + s.slug + '/">' + label + '</a>' + quip;
        }
        return '<a style="cursor:default;opacity:.55" title="Coming soon">' + label + '</a>';
      }).join("");
      return '<details class="sb-group"' + (isCurrent ? " open" : "") + ' style="--sb-accent:' + c.accent + '">' +
        '<summary>' + c.title +
          '<span class="sb-count">' + (doneN ? doneN + "/" + c.sections.length : c.sections.length) + '</span>' + chev +
        '</summary>' +
        '<div class="sb-links">' + links + '</div>' +
      '</details>';
    }
    /* group the courses by track, with a heading above each group (like the
       homepage) — only when more than one track is populated, so a single-
       track site stays a flat list. This is what separates Stats 4 from
       Methods in the sidebar instead of one undivided run of courses. */
    var tracks = (window.TRACKS && window.TRACKS.length) ? window.TRACKS : [{ id: "core", title: "" }];
    var known = {};
    tracks.forEach(function (t) { known[t.id] = 1; });
    var groups = tracks.map(function (t) {
      return { title: t.title, courses: window.CURRICULUM.filter(function (c) { return (c.track || "core") === t.id; }) };
    }).filter(function (g) { return g.courses.length; });
    var orphans = window.CURRICULUM.filter(function (c) { return !known[c.track || "core"]; });
    if (orphans.length) groups.push({ title: "", courses: orphans });
    var html = groups.length > 1
      ? groups.map(function (g) {
          return (g.title ? '<div class="sb-track-head">' + g.title + '</div>' : '') +
            g.courses.map(courseGroup).join("");
        }).join("")
      : window.CURRICULUM.map(courseGroup).join("");
    host.innerHTML = '<div class="sidebar-sticky">' + html + '</div>';
  }

  /* ---------- prev / next ---------- */
  function renderLessonNav() {
    var host = document.getElementById("lesson-nav");
    if (!host) return;
    var flat = window.CURRICULUM_FLAT;
    var i = flat.findIndex(function (s) { return s.slug === HERE; });
    if (i < 0) return;
    var prev = flat[i - 1], next = flat[i + 1];
    var html = "";
    var arrowL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
    var arrowR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
    if (prev) {
      html += '<a class="prev" href="' + BASE + prev.course + '/' + prev.slug + '/">' + arrowL +
        '<span><span class="lbl">Previous</span>' + prev.n + ' ' + prev.title + '</span></a>';
    }
    if (next) {
      html += '<a class="next" href="' + BASE + next.course + '/' + next.slug + '/">' +
        '<span><span class="lbl">Next</span>' + next.n + ' ' + next.title + '</span>' + arrowR + '</a>';
    }
    host.innerHTML = html;
  }

  /* ---------- "mark complete" toggle (lesson pages) ---------- */
  function renderLessonDone() {
    if (!HERE) return;
    var lessonNav = document.getElementById("lesson-nav");
    var article = lessonNav ? lessonNav.parentNode : document.querySelector(".lesson");
    if (!article) return;
    var wrap = document.createElement("div");
    wrap.className = "lesson-progress-head";
    var flat = window.CURRICULUM_FLAT, cur = flat.find(function (s) { return s.slug === HERE; });
    wrap.innerHTML = '<span style="color:var(--text-faint);font-size:.85rem">' + (cur ? cur.n : "") + '</span>';
    var btn = document.createElement("button");
    btn.className = "lesson-done" + (isDone(HERE) ? " done" : "");
    btn.type = "button";
    function paint() {
      var done = isDone(HERE);
      btn.className = "lesson-done" + (done ? " done" : "");
      btn.innerHTML = '<span class="box">' + (done ? "✓" : "") + '</span>' + (done ? "Completed" : "Mark as complete");
    }
    btn.addEventListener("click", function () { setDone(HERE, !isDone(HERE)); paint(); });
    paint();
    var actions = document.createElement("div");
    actions.className = "lph-actions";
    actions.appendChild(btn);
    // "Print this lesson" — the print stylesheet (styles.css) turns the page into a
    // clean handout; setupPrint() forces the FAQ open + snapshots canvases first.
    var pbtn = document.createElement("button");
    pbtn.type = "button";
    pbtn.className = "print-btn";
    pbtn.innerHTML = '<span aria-hidden="true">🖨️</span> Print';
    pbtn.setAttribute("aria-label", "Print this lesson");
    pbtn.addEventListener("click", function () { window.print(); });
    actions.appendChild(pbtn);
    wrap.appendChild(actions);
    // place just above the prev/next nav
    if (lessonNav) article.insertBefore(wrap, lessonNav);
    else article.appendChild(wrap);
  }

  /* ---------- print handout support (lesson pages) ----------
     Before printing: force every closed <details> (the FAQ) open so
     answers print, and snapshot each frozen viz canvas to an <img>
     (some browsers rasterise <canvas> as blank on the print sheet).
     Everything is reverted on afterprint. Also injects a discreet
     per-page footer carrying the lesson's clean URL. */
  function setupPrint() {
    if (!HERE) return;
    // discreet printed footer with the lesson's clean canonical URL
    var canon = document.querySelector('link[rel="canonical"]');
    var url = ((canon && canon.href) || window.location.href)
      .replace(/^https?:\/\//, "").replace(/index\.html$/, "").replace(/\/+$/, "");
    var foot = document.createElement("div");
    foot.className = "print-footer";
    foot.textContent = url;
    document.body.appendChild(foot);

    var opened = [], shots = [], active = false;
    function before() {
      if (active) return; active = true;
      var scope = document.querySelector(".lesson") || document.body;
      // open any closed <details> so answers/steps print (the checks block stays hidden)
      var dets = scope.querySelectorAll("details:not([open])");
      for (var i = 0; i < dets.length; i++) {
        if (dets[i].classList.contains("checks")) continue;
        dets[i].setAttribute("open", ""); opened.push(dets[i]);
      }
      // snapshot canvases → <img> so a frozen viz never prints blank
      var cvs = scope.querySelectorAll(".viz canvas");
      for (var j = 0; j < cvs.length; j++) {
        var c = cvs[j];
        if (!c.width || !c.height || c.offsetParent === null) continue;   // skip hidden canvases
        try {
          var img = document.createElement("img");
          img.src = c.toDataURL("image/png");
          img.className = "print-canvas-shot";
          img.style.cssText = "width:100%;height:auto;display:block;border-radius:10px";
          c.style.display = "none";
          c.parentNode.insertBefore(img, c.nextSibling);
          shots.push({ img: img, canvas: c });
        } catch (e) { /* tainted/unsupported — leave the live canvas in place */ }
      }
    }
    function after() {
      if (!active) return; active = false;
      for (var i = 0; i < opened.length; i++) opened[i].removeAttribute("open");
      opened = [];
      for (var j = 0; j < shots.length; j++) {
        shots[j].canvas.style.display = "";
        if (shots[j].img.parentNode) shots[j].img.parentNode.removeChild(shots[j].img);
      }
      shots = [];
    }
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    // Safari fires no before/afterprint — drive off the print media query instead
    if (window.matchMedia) {
      try {
        window.matchMedia("print").addEventListener("change", function (e) { e.matches ? before() : after(); });
      } catch (_) { /* older Safari lacks MQL.addEventListener — before/afterprint covers others */ }
    }
  }

  /* ---------- embed footer (embed mode only) ----------
     A single discreet line under the widget linking back to the full lesson.
     target="_top" so it escapes the iframe; the href is the lesson's clean
     canonical URL (absolute), which works from any host embedding us. */
  function renderEmbedFooter() {
    var canon = document.querySelector('link[rel="canonical"]');
    var url = (canon && canon.href) || window.location.href.replace(/\?.*$/, "");
    var foot = document.createElement("div");
    foot.className = "embed-foot";
    foot.innerHTML = 'From <strong>StatsCapybara</strong> — ' +
      '<a href="' + url + '" target="_top" rel="noopener">open the full lesson &rarr;</a>';
    var main = document.querySelector("main") || document.body;
    main.appendChild(foot);
  }

  /* ---------- viz PNG export (lessons + canvas tool pages) ----------
     A small "PNG ↓" button next to each .viz-title (or, on a titleless
     calculator viz, a right-aligned bar at the top of the block) that
     downloads that block's primary canvas at 2× via toDataURL. The current
     theme is captured as-is (the canvas background is painted underneath so
     dark-mode exports aren't transparent). Decorative canvases outside a
     .viz (the homepage hero) are never touched; the button is hidden in
     print. Keyboard-operable and aria-labelled (it's a real <button>). */
  function biggestCanvas(viz) {
    var cs = viz.querySelectorAll("canvas"), best = null, bestArea = -1;
    for (var i = 0; i < cs.length; i++) {
      var c = cs[i];
      if (c.hasAttribute("data-no-export")) continue;
      var r = c.getBoundingClientRect();
      var area = r.width * r.height;
      if (area > bestArea) { bestArea = area; best = c; }
    }
    return best;
  }
  function exportCanvasPng(canvas, name) {
    try {
      var r = canvas.getBoundingClientRect();
      var scale = 2;
      var w = Math.max(1, Math.round((r.width || canvas.width) * scale));
      var h = Math.max(1, Math.round((r.height || canvas.height) * scale));
      var off = document.createElement("canvas");
      off.width = w; off.height = h;
      var ctx = off.getContext("2d");
      var bg = getComputedStyle(canvas).backgroundColor;
      if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") { ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); }
      ctx.drawImage(canvas, 0, 0, w, h);
      var a = document.createElement("a");
      a.href = off.toDataURL("image/png");
      a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (e) { /* tainted canvas / unsupported — silently no-op */ }
  }
  function injectVizExport() {
    var slug = pageKey();
    var vizzes = document.querySelectorAll(".viz");
    var n = 0;
    Array.prototype.forEach.call(vizzes, function (viz) {
      if (viz.hasAttribute("data-no-export")) return;
      if (!viz.querySelector("canvas")) return;   // e.g. apa.html's live-sentence "viz" has none
      n++;
      var idx = n;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "viz-png-btn";
      btn.innerHTML = 'PNG <span aria-hidden="true">&darr;</span>';
      btn.setAttribute("aria-label", "Download this visualization as a PNG image");
      btn.addEventListener("click", function () {
        var canvas = biggestCanvas(viz);
        if (canvas) exportCanvasPng(canvas, "statscapybara-" + slug + "-" + idx + ".png");
      });
      var title = viz.querySelector(".viz-title");
      if (title) {
        // wrap the title + button in a flex row so the button sits at the far right
        var head = document.createElement("div");
        head.className = "viz-head";
        title.parentNode.insertBefore(head, title);
        head.appendChild(title);
        head.appendChild(btn);
      } else {
        // titleless calculator viz: a right-aligned bar at the top of the block
        var bar = document.createElement("div");
        bar.className = "viz-exportbar";
        bar.appendChild(btn);
        viz.insertBefore(bar, viz.firstChild);
      }
    });
  }

  /* ---------- "On this page" mini-TOC (longer lessons only) ---------- */
  function renderTOC() {
    if (!HERE) return;
    var art = document.querySelector(".lesson");
    if (!art) return;
    var hs = art.querySelectorAll("h2");
    if (hs.length < 4) return;
    var used = {};
    var items = Array.prototype.map.call(hs, function (h) {
      var id = h.id || h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      while (used[id]) id += "-x";
      used[id] = 1; h.id = id;
      return '<a href="#' + id + '">' + h.textContent + '</a>';
    }).join("");
    var box = document.createElement("nav");
    box.className = "lesson-toc";
    box.setAttribute("aria-label", "On this page");
    box.innerHTML = '<span class="toc-label">On this page</span>' + items;
    var lede = art.querySelector(".lede");
    if (lede) lede.parentNode.insertBefore(box, lede.nextSibling);
  }

  /* ---------- "Try it yourself" R / Python snippets ----------
     Snippet data lives in assets/js/snippets.js, loaded lazily so
     non-lesson pages never pay for it. */
  function renderTryCode() {
    if (!HERE) return;
    var s = document.createElement("script");
    s.src = BASE + "assets/js/snippets.js";
    s.async = true;
    s.onload = function () {
      var sn = window.SNIPPETS && window.SNIPPETS[HERE];
      if (!sn) return;
      var nav = document.getElementById("lesson-nav");
      var host = nav ? nav.parentNode : document.querySelector(".lesson");
      if (!host) return;
      var box = document.createElement("div");
      box.className = "try-code";
      box.innerHTML =
        '<div class="tc-head"><span class="tc-title">💻 Try it yourself</span>' +
          '<span class="seg" role="group" aria-label="Choose language"><button type="button" class="active" data-lang="r" aria-pressed="true">R</button><button type="button" data-lang="py" aria-pressed="false">Python</button></span>' +
          '<button class="tc-copy" type="button">Copy</button></div>' +
        '<pre><code></code></pre>';
      var code = box.querySelector("code"), lang = "r";
      function show() { code.textContent = sn[lang]; }
      Array.prototype.forEach.call(box.querySelectorAll("[data-lang]"), function (b) {
        b.addEventListener("click", function () {
          lang = b.getAttribute("data-lang");
          Array.prototype.forEach.call(box.querySelectorAll("[data-lang]"), function (b2) {
            var on = b2 === b; b2.className = on ? "active" : ""; b2.setAttribute("aria-pressed", on ? "true" : "false");
          });
          show();
        });
      });
      var copyBtn = box.querySelector(".tc-copy");
      copyBtn.addEventListener("click", function () {
        try {
          navigator.clipboard.writeText(sn[lang]).then(function () { flashCopied(copyBtn); });
        } catch (e) {}
      });
      show();
      var anchor = document.querySelector(".lesson-progress-head") || nav;
      host.insertBefore(box, anchor);
      scanHScroll();   // the injected <pre> can overflow sideways on phones
    };
    document.body.appendChild(s);
  }

  /* ---------- "Run it in SPSS / JASP" + "Write it up (APA 7)" ----------
     Data lives in assets/js/software.js, loaded lazily like the snippets.
     Final on-page order (whichever async script lands first):
     checks → SPSS/JASP → APA → R/Python → progress head. */
  function renderSoftware() {
    if (!HERE) return;
    var s = document.createElement("script");
    s.src = BASE + "assets/js/software.js";
    s.async = true;
    s.onload = function () {
      var sw = window.SOFTWARE && window.SOFTWARE[HERE];
      if (!sw) return;
      var nav = document.getElementById("lesson-nav");
      var host = nav ? nav.parentNode : document.querySelector(".lesson");
      if (!host) return;

      if (sw.spss || sw.jasp) {
        var box = document.createElement("section");
        box.className = "software";
        box.id = "run-it";   // deep-link target for plan.html's "walkthrough" link
        box.setAttribute("aria-label", "Run this analysis in SPSS or JASP");
        box.innerHTML =
          '<div class="sw-head"><span class="sw-title">🖱️ Run it in SPSS / JASP</span>' +
            '<span class="seg" role="group" aria-label="Choose software"><button type="button" class="active" data-app="spss" aria-pressed="true">SPSS</button><button type="button" data-app="jasp" aria-pressed="false">JASP</button></span></div>' +
          '<ol class="sw-steps"></ol>';
        var list = box.querySelector(".sw-steps"), app = "spss";
        var showSteps = function () {
          list.innerHTML = (sw[app] || []).map(function (step) { return "<li>" + step + "</li>"; }).join("");
        };
        Array.prototype.forEach.call(box.querySelectorAll("[data-app]"), function (b) {
          b.addEventListener("click", function () {
            app = b.getAttribute("data-app");
            Array.prototype.forEach.call(box.querySelectorAll("[data-app]"), function (b2) {
              var on = b2 === b; b2.className = on ? "active" : ""; b2.setAttribute("aria-pressed", on ? "true" : "false");
            });
            showSteps();
          });
        });
        showSteps();
        var anchor1 = document.querySelector(".apa-report") || host.querySelector(".try-code") || document.querySelector(".lesson-progress-head") || nav;
        host.insertBefore(box, anchor1);
        /* the block is injected async, so a #run-it deep link can't scroll on
           its own — nudge it into view once it exists (e.g. arriving from plan.html) */
        if (location.hash === "#run-it") setTimeout(function () { box.scrollIntoView({ behavior: scrollBehavior(), block: "start" }); }, 60);
      }

      if (sw.apa) {
        var apa = document.createElement("section");
        apa.className = "apa-report";
        apa.setAttribute("aria-label", "How to report this analysis in APA style");
        apa.innerHTML =
          '<div class="sw-head"><span class="sw-title">📝 Write it up (APA 7)</span></div>' +
          '<p class="apa-label">Example results paragraph:</p>' +
          '<blockquote class="apa-quote">' + sw.apa + '</blockquote>' +
          (sw.tips && sw.tips.length ? '<ul class="apa-tips">' + sw.tips.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul>" : "") +
          '<p class="apa-formatter-link"><a href="' + BASE + 'apa.html">Format your own numbers &rarr;</a></p>';
        var anchor2 = host.querySelector(".try-code") || document.querySelector(".lesson-progress-head") || nav;
        host.insertBefore(apa, anchor2);
      }
    };
    document.body.appendChild(s);
  }

  /* ---------- "Check your understanding" (lesson pages) ----------
     Question data lives in assets/js/checks.js, loaded lazily like
     the code snippets. Injected above the "Try it yourself" block
     (or the progress head if snippets haven't landed yet). */
  function renderChecks() {
    if (!HERE) return;
    var s = document.createElement("script");
    s.src = BASE + "assets/js/checks.js";
    s.async = true;
    s.onload = function () {
      var qs = window.CHECKS && window.CHECKS[HERE];
      if (!qs || !qs.length) return;
      var nav = document.getElementById("lesson-nav");
      var host = nav ? nav.parentNode : document.querySelector(".lesson");
      if (!host) return;
      /* a <details> so starting the questions is the student's choice,
         not something the page imposes */
      var box = document.createElement("details");
      box.className = "checks";
      box.setAttribute("aria-label", "Check your understanding");
      var answered = 0, correct = 0;
      var head = document.createElement("summary");
      head.className = "ck-head";
      head.innerHTML = '<span class="ck-title">🧠 Do you want to check your understanding?</span>' +
        '<span class="ck-score" aria-live="polite"></span>' +
        '<span class="ck-cta" aria-hidden="true"><span class="ck-open-label">' + qs.length + ' quick questions</span>' +
        '<svg class="chev" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>';
      box.appendChild(head);
      var scoreEl = head.querySelector(".ck-score");
      var prev = loadCheckScores()[HERE];
      if (prev) scoreEl.textContent = "best so far: " + prev.c + " / " + prev.t;
      qs.forEach(function (item, qi) {
        var card = document.createElement("div");
        card.className = "ck-q";
        var p = document.createElement("p");
        p.className = "ck-text";
        p.textContent = (qi + 1) + ". " + item.q;
        card.appendChild(p);
        var opts = document.createElement("div");
        opts.className = "ck-opts";
        var fb = document.createElement("p");
        fb.className = "ck-fb";
        var done = false;
        item.o.forEach(function (text, i) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "ck-opt";
          b.textContent = text;
          b.addEventListener("click", function () {
            if (done) return;
            done = true; answered++;
            var btns = opts.querySelectorAll("button");
            Array.prototype.forEach.call(btns, function (b2, j) {
              b2.disabled = true;
              if (j === item.a) b2.classList.add("right");
            });
            if (i === item.a) { correct++; fb.innerHTML = '<strong class="ok">Correct.</strong> ' + item.why; }
            else { b.classList.add("wrong"); fb.innerHTML = '<strong class="no">Not quite.</strong> ' + item.why; }
            scoreEl.textContent = correct + " / " + qs.length;
            if (answered === qs.length) {
              scoreEl.textContent = correct + " / " + qs.length + (correct === qs.length ? " — nailed it!" : "");
              saveCheckScore(HERE, correct, qs.length);
              if (correct === qs.length && !isDone(HERE)) {
                var doneBtn = document.createElement("button");
                doneBtn.type = "button";
                doneBtn.className = "btn btn-primary btn-sm";
                doneBtn.style.margin = ".35rem 1.1rem  1rem";
                doneBtn.textContent = "✓ Mark this lesson complete";
                doneBtn.addEventListener("click", function () {
                  var toggle = document.querySelector(".lesson-done");
                  if (toggle && !isDone(HERE)) toggle.click();
                  doneBtn.remove();
                });
                box.appendChild(doneBtn);
              }
            }
          });
          opts.appendChild(b);
        });
        card.appendChild(opts);
        card.appendChild(fb);
        box.appendChild(card);
      });
      // keep the order: prose → checks → SPSS/JASP → APA → try-code → progress head
      var anchor = document.querySelector(".software") || document.querySelector(".apa-report") ||
                   host.querySelector(".try-code") || document.querySelector(".lesson-progress-head") || nav;
      host.insertBefore(box, anchor);
    };
    document.body.appendChild(s);
  }

  /* ---------- ← / → jump to the previous / next lesson ---------- */
  function wireLessonKeys() {
    if (!HERE) return;
    var flat = window.CURRICULUM_FLAT;
    var i = flat.findIndex(function (s) { return s.slug === HERE; });
    if (i < 0) return;
    document.addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      var el = document.activeElement;
      // don't hijack ←/→ while a form field OR a keyboard-operable canvas has
      // focus — those vizzes use the arrow keys themselves (e.g. nudge a point)
      if (el && (/^(INPUT|TEXTAREA|SELECT|CANVAS)$/.test(el.tagName) || el.isContentEditable)) return;
      if (searchEl && searchEl.classList.contains("open")) return;
      var to = null;
      if (e.key === "ArrowLeft" && flat[i - 1]) to = flat[i - 1];
      else if (e.key === "ArrowRight" && flat[i + 1] && flat[i + 1].ready) to = flat[i + 1];
      if (to) window.location.href = BASE + to.course + "/" + to.slug + "/";
    });
  }

  /* ============================================================
     SEARCH OVERLAY
     ============================================================ */
  var searchEl = null, searchInput = null, searchResults = null, searchIdx = 0, searchMatches = [], searchOpener = null;
  function buildSearch() {
    if (searchEl) return;
    searchEl = document.createElement("div");
    searchEl.className = "search-overlay";
    /* aria-modal so screen readers treat the page behind as inert while it's open */
    searchEl.innerHTML =
      '<div class="search-panel" role="dialog" aria-modal="true" aria-label="Search lessons">' +
        '<input type="text" id="search-input" placeholder="Search lessons…" autocomplete="off" aria-label="Search lessons" />' +
        '<ul class="search-results" id="search-results"></ul>' +
        '<div class="search-hint"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>' +
      '</div>';
    document.body.appendChild(searchEl);
    searchInput = searchEl.querySelector("#search-input");
    searchResults = searchEl.querySelector("#search-results");
    searchEl.addEventListener("click", function (e) { if (e.target === searchEl) closeSearch(); });
    searchInput.addEventListener("input", runSearch);
    // list-navigation keys only make sense while typing in the input
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") { e.preventDefault(); go(); }
    });
    /* Escape closes and Tab is trapped inside the dialog no matter which
       element (input or a result link) currently holds focus (WCAG 2.1.2) */
    searchEl.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); closeSearch(); return; }
      if (e.key !== "Tab") return;
      var focusable = [searchInput].concat(Array.prototype.slice.call(searchResults.querySelectorAll("a")));
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  /* full-text index (assets/js/search-index.js) — fetched once, the first
     time the overlay opens, so normal page loads never pay for it */
  var indexRequested = false;
  function loadSearchIndex() {
    if (indexRequested || window.SEARCH_INDEX) return;
    indexRequested = true;
    var s = document.createElement("script");
    s.src = BASE + "assets/js/search-index.js";
    s.async = true;
    s.onload = function () { if (searchEl && searchEl.classList.contains("open")) runSearch(); };
    document.body.appendChild(s);
  }
  function openSearch() {
    buildSearch(); loadSearchIndex();
    searchOpener = (document.activeElement && document.activeElement !== document.body) ? document.activeElement : null;
    searchEl.classList.add("open"); searchInput.value = ""; runSearch(); searchInput.focus();
  }
  function closeSearch() {
    if (!searchEl) return;
    searchEl.classList.remove("open");
    // return focus to whatever opened the overlay (the search pill, usually)
    if (searchOpener && searchOpener.focus) { searchOpener.focus(); }
    searchOpener = null;
  }
  // site pages surfaced alongside lessons in the search overlay
  var SEARCH_PAGES = [
    { title: "Statistics Toolbox", url: "toolbox.html", tag: "Tool", kw: "tools toolbox calculators references practice hub all" },
    { title: "Which Test Should I Use?", url: "which-test.html", tag: "Tool", kw: "chooser decision anova t-test regression choose" },
    { title: "Which Chart Should I Use?", url: "which-chart.html", tag: "Tool", kw: "chart graph plot chooser decision visualization histogram bar boxplot scatter line heatmap pie table which chart" },
    { title: "Plan My Analysis", url: "plan.html", tag: "Tool", kw: "plan analysis planner wizard thesis dissertation study design sample size power apa assumptions which test recommendation printable supervisor proposal preregistration" },
    { title: "Statistical Tables & Calculators", url: "tables.html", tag: "Tool", kw: "z t chi-square f critical value p-value calculator table" },
    { title: "Statistics Formula Sheet", url: "formulas.html", tag: "Reference", kw: "formula cheat sheet equations print reference" },
    { title: "Which Test? One-Page Cheat Sheet", url: "cheat-test-chooser.html", tag: "Reference", kw: "which test cheat sheet printable poster one page decision grid outcome design t-test anova correlation regression chi-square nonparametric print pin classroom teacher" },
    { title: "APA Statistics Reporting Cheat Sheet", url: "cheat-apa.html", tag: "Reference", kw: "apa cheat sheet printable poster reporting statistics 7 italics leading zero p value decimals p = .000 ban report t f chi-square r regression how to write results one page" },
    { title: "Assumption Checks Cheat Sheet", url: "cheat-assumptions.html", tag: "Reference", kw: "assumptions cheat sheet printable poster check normality homogeneity variance levene q-q plot sphericity mauchly greenhouse geisser welch homoscedasticity vif multicollinearity residual plot violated fix transform nonparametric one page" },
    { title: "Distribution Playground", url: "distributions.html", tag: "Tool", kw: "normal binomial poisson beta exponential uniform pdf explore distribution" },
    { title: "Effect-Size Converter", url: "effect-sizes.html", tag: "Tool", kw: "cohen d r eta squared odds ratio convert effect size overlap benchmark" },
    { title: "Power & Sample-Size Calculator", url: "power.html", tag: "Tool", kw: "power sample size calculator n gpower a priori effect noncentral t anova correlation chi-square proportions minimum detectable how many participants" },
    { title: "Descriptives Calculator", url: "descriptives.html", tag: "Tool", kw: "mean sd median iqr descriptive statistics calculator paste data histogram boxplot outliers apa" },
    { title: "Correlation & Regression Calculator", url: "correlation.html", tag: "Tool", kw: "correlation regression pearson r spearman rho scatterplot scatter plot least squares line best fit slope intercept r squared residuals fisher z confidence interval anscombe quartet outlier leverage influence apa paste two columns x y" },
    { title: "APA Results Formatter", url: "apa.html", tag: "Tool", kw: "apa 7 format results sentence write up report t f chi-square correlation regression italics leading zero p value statcheck consistency copy" },
    { title: "Practice Datasets", url: "datasets.html", tag: "Practice", kw: "practice datasets csv download data sample example real t-test anova regression factorial likert reliability cronbach cleaning messy logistic exercises worked solutions" },
    { title: "Course Quiz", url: "quiz.html", tag: "Practice", kw: "test yourself questions practice" },
    { title: "Statistics Glossary", url: "glossary.html", tag: "Reference", kw: "terms definitions dictionary" },
    { title: "Glossary Flashcards", url: "flashcards.html", tag: "Practice", kw: "flashcards spaced repetition leitner revise revision memorize memorise drill study cards terms definitions glossary due box" },
    { title: "My Progress", url: "progress.html", tag: "Practice", kw: "progress dashboard my progress rings completed lessons done remaining continue resume certificate certificates course completion percent tracking enrolled" },
    { title: "Analyze Your Thesis Data in JASP", url: "guides/analyze-thesis-data-jasp/", tag: "Guide", kw: "jasp guide tutorial thesis dissertation analyze data start to finish walkthrough import csv descriptives assumptions levene welch t-test run read output write up apa how to" },
    { title: "From SPSS Output to APA Results", url: "guides/spss-output-to-apa/", tag: "Guide", kw: "spss guide output apa results report write up sig 2-tailed .000 levene two rows t-test anova correlation chi-square regression tables how to read coefficients" },
    { title: "Choosing Statistics for Your Dissertation", url: "guides/choose-statistics-dissertation/", tag: "Guide", kw: "choose choosing statistics dissertation thesis which test analysis pick guide outcome predictor groups paired design likert messy real data decision" },
    { title: "Clean Your Survey Data, Step by Step", url: "guides/clean-survey-data/", tag: "Guide", kw: "clean cleaning survey data guide questionnaire likert reverse code coding missing values composite score reliability cronbach alpha screening exclusions step by step raw export" },
    { title: "For Instructors", url: "teachers.html", tag: "Guide", kw: "instructors teachers professors teaching course syllabus lms canvas moodle blackboard embed iframe classroom handouts posters assignments datasets reproducible semester week by week map free license link to us lecturer educator" }
  ];
  function escHtml(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  /* a short excerpt around the first occurrence of q, with the match <mark>ed */
  function snippetFor(txt, q) {
    var at = txt.toLowerCase().indexOf(q);
    if (at < 0) return null;
    var from = Math.max(0, at - 36), to = Math.min(txt.length, at + q.length + 72);
    return (from > 0 ? "…" : "") +
      escHtml(txt.slice(from, at)) + "<mark>" + escHtml(txt.slice(at, at + q.length)) + "</mark>" +
      escHtml(txt.slice(at + q.length, to)) + (to < txt.length ? "…" : "");
  }
  function runSearch() {
    var q = searchInput.value.trim().toLowerCase();
    var flat = window.CURRICULUM_FLAT.filter(function (s) { return s.ready; });
    var lessons = flat.filter(function (s) {
      return !q || (s.title.toLowerCase().indexOf(q) >= 0 || s.n.indexOf(q) >= 0 || s.courseTitle.toLowerCase().indexOf(q) >= 0);
    });
    var pages = SEARCH_PAGES.filter(function (p) {
      return !q || p.title.toLowerCase().indexOf(q) >= 0 || p.kw.indexOf(q) >= 0;
    }).map(function (p) { return { page: true, title: p.title, url: p.url, tag: p.tag }; });

    /* full-text pass: lessons/pages whose BODY mentions the query but whose
       title didn't already match — shown below title matches, with a snippet */
    var deep = [];
    if (q.length >= 3 && window.SEARCH_INDEX) {
      var seen = {};
      lessons.forEach(function (s) { seen[s.slug] = 1; });
      pages.forEach(function (p) { seen[p.url] = 1; });
      flat.forEach(function (s) {
        if (seen[s.slug]) return;
        var txt = window.SEARCH_INDEX.lessons[s.slug];
        if (!txt) return;
        var sn = snippetFor(txt, q);
        if (sn) deep.push({ course: s.course, slug: s.slug, n: s.n, title: s.title, courseTitle: s.courseTitle, snip: sn });
      });
      (window.SEARCH_INDEX.pages || []).forEach(function (p) {
        if (seen[p.u]) return;
        var meta = null;
        for (var i = 0; i < SEARCH_PAGES.length; i++) if (SEARCH_PAGES[i].url === p.u) meta = SEARCH_PAGES[i];
        var sn = snippetFor(p.txt, q);
        if (meta && sn) deep.push({ page: true, title: meta.title, url: meta.url, tag: meta.tag, snip: sn });
      });
    }

    searchMatches = pages.concat(lessons).concat(deep).slice(0, 40);
    searchIdx = 0;
    if (!searchMatches.length) {
      searchResults.innerHTML = '<li class="search-empty">' + capy(30) +
        '<span>No matches for “' + escHtml(q) + '” — the capybara looked everywhere. Try a shorter word?</span></li>';
      return;
    }
    searchResults.innerHTML = searchMatches.map(function (s, i) {
      var href = s.page ? BASE + s.url : BASE + s.course + "/" + s.slug + "/";
      return '<li><a class="' + (i === 0 ? "active" : "") + '" href="' + href + '">' +
        '<span class="n">' + (s.page ? "→" : s.n) + '</span><span>' + s.title +
        (s.snip ? '<small class="snip">' + s.snip + '</small>' : '') + '</span>' +
        '<span class="course-tag">' + (s.page ? s.tag : s.courseTitle) + '</span></a></li>';
    }).join("");
    Array.prototype.forEach.call(searchResults.querySelectorAll("a"), function (a, i) {
      a.addEventListener("mousemove", function () { setActive(i); });
    });
  }
  function setActive(i) {
    searchIdx = i;
    var as = searchResults.querySelectorAll("a");
    Array.prototype.forEach.call(as, function (a, j) { a.classList.toggle("active", j === i); });
  }
  function move(d) {
    if (!searchMatches.length) return;
    var i = (searchIdx + d + searchMatches.length) % searchMatches.length;
    setActive(i);
    var a = searchResults.querySelectorAll("a")[i];
    if (a) a.scrollIntoView({ block: "nearest" });
  }
  function go() {
    var a = searchResults.querySelectorAll("a")[searchIdx];
    if (a) window.location.href = a.getAttribute("href");
  }
  function wireSearchShortcuts() {
    document.addEventListener("keydown", function (e) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName) || (document.activeElement && document.activeElement.isContentEditable);
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); openSearch(); }
      else if (e.key === "/" && !typing) { e.preventDefault(); openSearch(); }
    });
  }

  /* ---------- "Buy me a coffee" (every page) ---------- */
  function renderKofi() {
    var c = document.querySelector(".footer .container");
    if (!c || c.querySelector(".kofi")) return;
    var a = document.createElement("a");
    a.className = "kofi"; a.href = "https://ko-fi.com/M3E322A3ML"; a.target = "_blank"; a.rel = "noopener";
    a.style.cssText = "display:inline-flex;align-items:center;order:2";
    a.innerHTML = '<img height="34" loading="lazy" style="border:0;height:34px" src="https://storage.ko-fi.com/cdn/kofi2.png?v=6" alt="Buy Me a Coffee at ko-fi.com" />';
    c.insertBefore(a, c.lastElementChild);
  }

  /* a quiet About link in every footer — the About tab left the nav in P60;
     the section itself still lives on the homepage (#about) */
  function renderFooterAbout() {
    var c = document.querySelector(".footer .container");
    if (!c || c.querySelector(".footer-about")) return;
    var a = document.createElement("a");
    a.className = "footer-about";
    a.href = (BASE || "./") + "#about";
    a.textContent = "About";
    c.appendChild(a);
  }

  /* a small capybara next to the copyright line, on every page */
  function renderFooterCapy() {
    var c = document.querySelector(".footer .container");
    if (!c || c.querySelector(".footer-capy")) return;
    var first = c.firstElementChild;
    if (first) first.innerHTML = '<span class="footer-capy" aria-hidden="true">' + capy(22) + '</span>' + first.innerHTML;
  }

  /* ---------- horizontal-scroll edge fades ----------
     Wide content scrolls inside its own container; a soft mask fade on
     the left/right edge (styles.css .hscroll rules) cues "there's more"
     only where content actually overflows. Known scrollable containers
     get tagged here; .ref-table additionally gets WRAPPED in a scroll
     div, so a wide table scrolls in place instead of the whole page. */
  var HS_SELECTOR = ".hscroll, .try-code pre, .mock, #ana-seg, .tbl-demo, .cb-book-wrap, .td-grid-wrap, .apa-ref, .rb-output";
  function hsUpdate(el) {
    var can = el.scrollWidth > el.clientWidth + 1;
    el.classList.toggle("hs-l", can && el.scrollLeft > 2);
    el.classList.toggle("hs-r", can && el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }
  function scanHScroll() {
    Array.prototype.forEach.call(document.querySelectorAll(HS_SELECTOR), function (el) {
      el.classList.add("hscroll");
      if (!el.__hs) {
        el.__hs = 1;
        el.addEventListener("scroll", function () { hsUpdate(el); }, { passive: true });
      }
      hsUpdate(el);
    });
  }
  function setupHScroll() {
    Array.prototype.forEach.call(document.querySelectorAll("table.ref-table"), function (t) {
      if (t.parentNode.classList && t.parentNode.classList.contains("hscroll")) return;
      var w = document.createElement("div");
      w.className = "hscroll";
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
    scanHScroll();
    window.addEventListener("load", scanHScroll);   // fonts/layout settle late
    var hsT;
    window.addEventListener("resize", function () { clearTimeout(hsT); hsT = setTimeout(scanHScroll, 150); });
  }

  /* ============================================================
     ACCESSIBILITY + HEAD extras (injected once, so all 40 pages
     get them without editing every file)
     ============================================================ */
  function injectA11y() {
    // skip link
    if (!document.querySelector(".skip-link")) {
      var main = document.querySelector("main");
      if (main) {
        if (!main.id) main.id = "main-content";
        var sk = document.createElement("a");
        sk.className = "skip-link"; sk.href = "#" + main.id; sk.textContent = "Skip to content";
        document.body.insertBefore(sk, document.body.firstChild);
      }
    }
    // describe every interactive canvas for screen readers — the title says
    // WHAT the chart is, the sub-caption HOW it responds, so the label is a
    // real description ("Leverage playground — drag the ringed point…") not "canvas"
    Array.prototype.forEach.call(document.querySelectorAll(".viz canvas"), function (cv) {
      if (cv.getAttribute("aria-label") || cv.getAttribute("role")) return;
      var viz = cv.closest(".viz");
      var title = viz && viz.querySelector(".viz-title");
      var sub = viz && viz.querySelector(".viz-sub");
      var name = title ? title.textContent.replace(/^[^\w]+/, "").trim() : "Interactive statistics visualization";
      var extra = sub ? " — " + sub.textContent.trim().replace(/\s+/g, " ").slice(0, 150) : " — interactive chart";
      cv.setAttribute("role", "img");
      cv.setAttribute("aria-label", name + extra);
    });
    // announce live readouts: when a slider changes a stat, screen readers hear
    // the new value. The whole .stat-row is a polite live region so any of its
    // values updating is spoken, without flooding (polite = queued, not urgent).
    Array.prototype.forEach.call(document.querySelectorAll(".stat-row"), function (row) {
      if (!row.getAttribute("aria-live")) row.setAttribute("aria-live", "polite");
    });
    // give every slider / number / select an accessible NAME from its visible
    // label. The lesson/tool markup writes `<label>Foo <span class="val">…</span></label>`
    // next to a sibling `<input>` with no `for`, so the name was invisible to
    // screen readers — here we wire it up site-wide instead of editing 90 pages.
    Array.prototype.forEach.call(document.querySelectorAll(".control"), function (ctrl) {
      var field = ctrl.querySelector("input, select, textarea");
      if (!field) return;
      if (field.getAttribute("aria-label") || field.closest("label")) return;
      if (field.id && ctrl.querySelector('label[for="' + field.id + '"]')) return;
      var label = ctrl.querySelector("label");
      if (!label) return;
      var clone = label.cloneNode(true);
      Array.prototype.forEach.call(clone.querySelectorAll(".val"), function (v) { v.remove(); });
      var name = clone.textContent.replace(/\s+/g, " ").trim();
      if (name) field.setAttribute("aria-label", name);
    });
  }
  function injectHead() {
    var head = document.head;
    function link(attrs) {
      var l = document.createElement("link");
      Object.keys(attrs).forEach(function (k) { l.setAttribute(k, attrs[k]); });
      head.appendChild(l);
    }
    if (!head.querySelector('link[rel="icon"][type="image/svg+xml"]'))
      link({ rel: "icon", type: "image/svg+xml", href: BASE + "assets/favicon.svg" });
    if (!head.querySelector('link[rel="apple-touch-icon"]'))
      link({ rel: "apple-touch-icon", href: BASE + "assets/icon-180.png" });
    if (!head.querySelector('link[rel="manifest"]'))
      link({ rel: "manifest", href: BASE + "site.webmanifest" });
    if (!head.querySelector('meta[name="theme-color"]')) {
      // theme-color for BOTH schemes: brand indigo in light, the dark page
      // background in dark, so the browser chrome blends either way.
      var mcLight = document.createElement("meta");
      mcLight.name = "theme-color"; mcLight.setAttribute("media", "(prefers-color-scheme: light)"); mcLight.content = "#6366f1";
      head.appendChild(mcLight);
      var mcDark = document.createElement("meta");
      mcDark.name = "theme-color"; mcDark.setAttribute("media", "(prefers-color-scheme: dark)"); mcDark.content = "#0b1120";
      head.appendChild(mcDark);
    }
  }

  /* ---------- offline support (service worker) ----------
     Registers sw.js (at the site root) so the site is installable and works
     offline once visited. BASE-aware so it resolves from lesson pages two
     folders deep; its scope defaults to the root, controlling the whole site.
     Feature-detected and fully swallowed — offline is a bonus, never a page
     breaker. Deferred to window "load" so it never competes with first paint. */
  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    var go = function () {
      try { navigator.serviceWorker.register(BASE + "sw.js").catch(function () {}); }
      catch (e) {}
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
  }

  /* ---------- go ---------- */
  function init() {
    injectHead();
    injectA11y();
    // embed mode: skip all the chrome, keep the widget, add one footer line.
    // The viz still runs (its inline script is independent of site.js).
    if (EMBED) {
      document.body.classList.add("embed-mode");
      injectVizExport();
      renderEmbedFooter();
      registerSW();
      return;
    }
    renderNav();
    renderCurriculum();
    renderCounts();
    renderToolbox();
    renderResume();
    renderSidebar();
    renderLessonNav();
    renderLessonDone();
    setupPrint();
    renderTOC();
    renderTryCode();
    renderChecks();
    renderSoftware();
    renderKofi();
    renderFooterAbout();
    renderFooterCapy();
    setupHScroll();
    injectVizExport();
    wireSearchShortcuts();
    wireLessonKeys();
    registerSW();
    // ?q=… deep link (also the target of the sitewide SearchAction schema);
    // a bare "?q=" (no term — the 404 page's search link) just opens the box
    var qm = /[?&]q=([^&]*)/.exec(window.location.search);
    if (qm) {
      openSearch();
      searchInput.value = decodeURIComponent(qm[1].replace(/\+/g, " "));
      runSearch();
    }
    // record this lesson as visited + the resume anchor
    if (HERE) {
      markVisited(HERE);
      var cur = window.CURRICULUM_FLAT.find(function (s) { return s.slug === HERE; });
      if (cur) setLast({ course: cur.course, slug: cur.slug, n: cur.n, title: cur.title });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
