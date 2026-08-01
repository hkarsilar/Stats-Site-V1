/* ============================================================
   Shared chrome for every page: theme toggle, homepage curriculum
   index, lesson sidebar, prev/next, search, and progress tracking —
   all generated from curriculum.js so there's one source of truth.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- base path (three states) ----------
     Lesson pages live two folders deep (/<course>/<slug>/), the homepage
     at the root. Long-form guides (guides/<slug>/) are also two deep and
     mark themselves with body[data-guide] instead of data-section, so they
     get lesson-depth links without being treated as curriculum lessons
     (no sidebar, no progress tracking). Course landing pages (/<course>/,
     P61) sit ONE folder deep and mark themselves with
     body[data-course-home="<slug>"] — they get the shared chrome (nav,
     footer, theme, search, skip link, SW) but no sidebar, prev/next,
     progress recording, or quip. Using relative links keeps the whole
     site working no matter how deep it's hosted. */
  var GUIDE = document.body ? document.body.getAttribute("data-guide") : null;
  var CHOME = document.body ? document.body.getAttribute("data-course-home") : null;
  var BASE = (document.body && (document.body.getAttribute("data-section") || GUIDE)) ? "../../" : (CHOME ? "../" : "");
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
  /* Did this URL carry lesson preset params (P67)? Everything that is not
     one of the two reserved keys counts. Answered from the URL alone, so it
     is knowable before the lesson's own boot calls SC.preset(). */
  function hasPresetParams() {
    var s = window.location.search.replace(/^\?/, "");
    if (!s) return false;
    return s.split("&").some(function (pair) {
      var k = pair.split("=")[0];
      return k && k !== "embed" && k !== "q";
    });
  }

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
    if (CHOME) return CHOME;
    var m = /([^\/]+)\.html$/.exec(window.location.pathname);
    return m ? m[1] : "home";
  }
  /* what KIND of page this is — the one param most events carry, so the
     maintenance loops can ask "is PNG export a lesson thing or a tool
     thing?" without a per-page allow-list */
  function pageType() {
    if (HERE) return "lesson";
    if (GUIDE) return "guide";
    if (CHOME) return "course";
    return pageKey() === "home" ? "home" : "tool";
  }

  /* ---------- anonymous interaction events (P70) ----------
     GA recorded page views and nothing else, so the recurring maintenance
     loops (P37/P39) had no way to tell a feature nobody uses from one
     everybody does. This adds a SMALL set of anonymous events through the
     gtag already in every page's head.

     Four rules, and they are the whole design:
       1. The shared layer is the ONLY caller. Lessons and tool pages never
          touch gtag; they call window.SC.track, which is this function.
       2. No PII, no free text, no new identifiers. Never a search query,
          never a typed name, never an exact score — buckets instead.
       3. Fire and forget. Everything is wrapped the way registerSW() is,
          so a blocked or missing gtag can never break a feature. An
          adblocked visitor gets the whole site, minus the counting.
       4. Params stay few and shared (page_type above all), because a GA4
          custom parameter is only useful once it is registered as a
          custom dimension, and that is a per-param cost.

     The event list lives in CLAUDE.md; adding a feature means deciding,
     deliberately, whether it earns an event. Most do not. */
  function track(name, params) {
    try {
      if (typeof window.gtag !== "function") return;
      window.gtag("event", name, params || {});
    } catch (e) { /* analytics must never be load-bearing */ }
  }
  /* coarse score buckets — an exact score is a fingerprint, a bucket is a
     signal. Same three bands everywhere they appear. */
  function scoreBucket(correct, total) {
    if (!total) return "0-49";
    var p = (correct / total) * 100;
    return p >= 80 ? "80-100" : p >= 50 ? "50-79" : "0-49";
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
    "central-limit-theorem": "Stack enough random capybara moods and you get a bell curve. Nobody asked the moods to cooperate.",
    "confidence-intervals": "We're 95% confident the capybara is in the hot spring. The other 5%? Snack run.",
    "hypothesis-testing-logic": "Null hypothesis: the capybara is unbothered. Honestly? Hard to reject.",
    "one-sample-and-paired-t-tests": "Same capybara, before and after the spa. Measure the difference — that's a paired design.",
    "independent-samples-t-test": "Two unrelated capybara squads, one pool, no shared history. That's independent samples.",
    "effect-size-and-power": "Power is how many capybaras you must count before anyone believes they're calm.",
    /* Stats 2 */
    "one-way-anova": "Three capybara herds walk into a pool. ANOVA asks: same vibe, or nah?",
    "post-hoc-tests": "Run 20 comparisons and something turns 'significant'. Even the capybara is suspicious.",
    "factorial-anova-two-way": "Warm water × good snacks — capybaras discovered interaction effects first.",
    "repeated-measures-anova": "Measure the same capybara three times. It won't mind. It literally cannot mind.",
    "assumptions-and-when-they-break": "Assumptions are pool floaties: nobody checks them until someone sinks.",
    "non-parametric-alternatives": "Weird data? Rank it. Capybaras don't judge distributions either.",
    "chi-square-tests": "Counting capybaras by category since 1900. Pearson would have loved a hot spring.",
    "correlation": "Snacks up, chill up. Correlated? Sure. Causal? The capybara declines to comment.",
    "simple-linear-regression": "A capybara's approach to a messy scatterplot: pick the line that regrets the least.",
    "regression-diagnostics": "The line always looks confident. The capybara reads what it left behind.",
    /* Stats 3 */
    "multiple-regression": "One predictor is a snack. Five predictors is a buffet. Pace yourself.",
    "multicollinearity-and-variable-selection": "Two predictors sharing one trench coat and pretending to be different variables.",
    "categorical-predictors-and-dummy-coding": "Dummy coding is not an insult. It's just capybara = 1, not-capybara = 0.",
    "ancova": "ANCOVA is just ANOVA that remembered to control for the vibes.",
    "interactions-in-regression": "Sometimes the effect of snacks depends on the pool. That's an interaction.",
    "mediation-and-indirect-effects": "Snacks → serenity → chill. The capybara understood mediation all along.",
    "logistic-regression": "Will the capybara enter the pool? Yes / no. Logistic regression was born for this.",
    "assumptions-of-regression": "Linear, independent, equal-variance, roughly normal. The capybara checks all four before it relaxes.",
    "model-comparison": "Two models enter, one AIC leaves. The capybara bets on the simpler one.",
    "factor-analysis-pca": "43 personality questions, one latent trait: chill. PCA knew it all along.",
    "manova": "Four outcomes, one verdict. The capybara declines to be interviewed one question at a time.",
    "power-analysis-for-complex-designs": "The capybara saw the effect clearly. Your n = 12 did not.",
    /* Stats 4 */
    "bootstrap-and-resampling": "Resample your own data 10,000 times. Capybaras call this self-care.",
    "bayesian-thinking": "The capybara had priors about you. It updated them. That's growth.",
    "bayesian-estimation": "The 95% credible interval: where the capybara actually believes the truth naps.",
    "generalized-linear-models": "One straight line, three disguises. The link function just changes its outfit.",
    "mixed-and-multilevel-models": "Capybaras nested in herds nested in hot springs. Multilevel living.",
    "cross-validation-and-overfitting": "Memorizing the training data is not learning. Even capybaras generalize.",
    "causal-dags-and-confounding": "The pool didn't cause the chill. The capybara confounds us all.",
    "survival-analysis": "How long until the capybara leaves the spa? Right-censored. It never left.",
    "missing-data": "The missing capybaras were not missing at random. They found a better pond.",
    "meta-analysis": "One study is an anecdote. Twenty studies is a forest plot full of capybaras.",
    "psychometric-functions": "Between a short dip and a long soak lies a duration no capybara can call.",
    "signal-detection-theory": "A rustle in the reeds: jaguar, or wind? A capybara's whole day is one long yes/no detection task.",
    /* Methods */
    "from-question-to-hypothesis": "The capybara's hypothesis: warm water is nice. Falsifiable only if it ever climbs out — it won't.",
    "variables-and-operationalization": "You can't measure 'chill.' You can measure naps per hour.",
    "reliability-and-validity": "A capybara is reliably calm and validly a capybara. Nailing both at once is the rare part.",
    "experimental-design-and-randomization": "The capybara assigns hot-spring seats by coin flip. Even the grumpy ones end up evenly spread.",
    "between-vs-within-designs": "One capybara soaking twice, or two capybaras once each? Fewer capybaras the first way — unless the first bath lingers.",
    "quasi-experiments": "Couldn't randomize the weather, so the capybara compared its pond to the one next door — and hoped they'd have drifted alike.",
    "observational-designs": "The capybara didn't assign anyone to the warm spring. It just watched who wandered in — and noted who was never seen leaving.",
    "sampling-methods": "Poll only the capybaras already in the spa and 100% love warm water. Shocking. Ask a thousand more of them and it is still 100%.",
    "survey-and-questionnaire-design": "\"Don't you agree this lovely water is wonderful?\" The capybara would agree with anything phrased like that.",
    "bias-and-blinding": "The capybara double-blinds its taste tests — even it doesn't know which pond the water came from.",
    "the-replication-crisis": "The capybara found a 'significant' result on its fourth analysis. Then remembered the first three. Next time: preregister, then snack.",
    "preregistration-and-open-science": "The capybara wrote its whole plan down before the snack arrived — so it couldn't pretend afterwards that it always wanted the small one.",
    /* Data */
    "tidy-data": "One capybara per row, one trait per column, one nap per cell. The capybara keeps a very tidy pond.",
    "codebooks-and-documentation": "Six months later the capybara found a column named 'grp'. No codebook. It is still guessing.",
    "data-entry-and-validation": "A capybara weighing 512 kg? The validation rule says no. The capybara says please.",
    "data-cleaning-workflow": "The capybara never edits the raw pond. It writes a script, keeps the mud, and hands you a spotless lake.",
    "outliers-in-practice": "One capybara is four times the size of the rest. Before evicting it, the capybara asks: typo, different pond, or just a very large capybara?",
    "transformations-and-recoding": "The capybara took the log of its income and finally slept soundly. Everything looked normal, including the capybara.",
    "wide-vs-long-data": "Wide capybara, long capybara. Same capybara, different table.",
    "merging-datasets": "Two ponds, one shared ID. The capybara counted the rows before and after, which is how it found the third Gerald.",
    "reproducible-workflows": "The capybara's whole study fits in a script. Hand it to a stranger and the same lake pours out, every single time.",
    "data-privacy-basics": "The capybara crossed out its name. Then a snoop matched its age, its pond and its stripe count, and greeted it by name.",
    /* Ethics — gentle by design; these lessons cover real harm */
    "why-research-ethics": "Every rule in this course was written after someone was harmed. The capybara reads this one slowly, and remembers why consent comes first.",
    "informed-consent-and-irb": "Before anything begins, the capybara makes sure everyone knows what they're agreeing to — in plain words, and free to say no.",
    "deception-and-debriefing": "If a study must keep a secret, the capybara tells the whole truth the moment it ends — and lets anyone take their data back.",
    "privacy-and-confidentiality": "The capybara keeps every secret it's trusted with — off email, under lock, and named with the true word: confidential, not “anonymous.”",
    "questionable-research-practices": "Nobody meant to cheat. The capybara just kept peeking until the noise looked like a finding — so now it fixes the rules before the data arrive.",
    "plagiarism-authorship-and-citation": "The capybara cites only the ponds it actually swam in. All of them.",
    "ai-in-research-ethics": "The capybara lets the clever tool draft, then checks every number itself. Its name is the one on the work.",
    "fraud-and-self-correction": "Real ponds are murky; the capybara distrusts water that's suspiciously clear. It reports the numbers it truly measured, and lets others check them.",
    /* ML & AI — for the stats student who knows regression */
    "prediction-vs-explanation": "Ask the capybara *why* it's chill and it hands you a coefficient. Ask *how chill it'll be on Thursday* and it hands you a number, no explanation included.",
    "train-test-split-and-generalization": "The capybara never grades itself on a pond it has already memorized. Fresh water, honest score.",
    "regularization-ridge-and-lasso": "Eight predictors, thirty capybaras. Ridge asks every coefficient to speak more softly; lasso just asks five of them to leave.",
    "classification-metrics": "\"99% accurate at spotting rare capybaras!\" — says the model that labels everything 'not a capybara'. Ask it about recall and watch it squirm.",
    "roc-curves-and-auc": "The capybara doesn't pick one threshold — it tries them all and plots the whole curve. Top-left corner good, diagonal is a coin flip.",
    "decision-trees": "Split, split, split until every leaf is one happy capybara. Grow too deep and the tree just memorizes the pond — test day is a rude surprise.",
    "random-forests-and-ensembles": "One capybara's opinion is jumpy. Three hundred capybaras, each shown a slightly different patch of reeds, are eerily hard to argue with.",
    "knn-and-distance": "The capybara asks its nearest neighbors and copies them. Scale your axes first — and in 100 dimensions everyone is equally far away and equally unhelpful.",
    "clustering-kmeans": "No labels? The capybara sorts the pond into k piles by proximity. Lovely on round blobs, hilariously confident on two moons, and it made you name k before it had even looked.",
    "dimensionality-reduction": "Two hundred variables won't fit on a lily pad. PCA squashes them flat and honestly; t-SNE untangles them beautifully but fibs about distances. Squash to measure, unfold to look.",
    "neural-networks-intuition": "A neuron is just the logistic regression the capybara already knows, wearing a lab coat. Stack a few, roll downhill, and straight lines learn to bend around XOR.",
    "llms-and-ai-in-research": "The capybara's chatbot writes with total confidence and occasional total fiction. Your name goes on both.",
    /* Writing */
    "imrad-structure": "Why it looked, how it looked, what it saw, what it means. Put each sentence in its own room and the paper reads itself.",
    "reporting-statistics-apa": "Italic t, upright η², no little zero before the dot. The capybara has never once written p = .000.",
    "tables-and-figures": "Chop the axis at 45 and the capybara's three-point lead looks like a landslide.",
    "writing-results": "The capybara reports the number and stops. Opinions wait for the Discussion.",
    "nonsignificant-results": "p = .08 is not 'a trend toward a nap.' The capybara reads the interval instead — wide means 'who knows yet,' tight-and-near-zero means 'genuinely nothing here.'",
    "discussion-and-limitations": "The capybara found a correlation, so it writes 'was associated with,' never 'causes.' Match the verb to the design and your claims outlive the ones that oversold.",
    "abstracts-and-titles": "The capybara writes the abstract last, in five tidy moves, and puts the actual number in the result. Its titles say what it found — searchable beats clever when a reader is looking for exactly you.",
    "final-checklist": "The capybara rereads its own paper pretending to hate it. Finds four numbers that disagree.",
    /* Guides */
    "analyze-thesis-data-jasp": "The capybara's first thesis analysis felt enormous too. Then it clicked Descriptives, breathed, and did the next step. There is always just a next step.",
    "spss-output-to-apa": "SPSS prints eleven numbers; your sentence needs five. The capybara knows which five — and it has never once copied 'Sig. = .000'.",
    "choose-statistics-dissertation": "One outcome, two groups, nobody measured twice — the capybara names the test before its tea cools. Not memory; just asking three questions in order.",
    "clean-survey-data": "The capybara cleans data the way it grooms: gently, in a fixed order, and never losing the raw coat underneath.",
    "complete-worked-project": "One question, one dataset, no skipping ahead to the p-value. The capybara has tried skipping ahead. It does not work.",
    /* Root pages */
    "home": "No rush — capybaras never cram.",
    "toolbox": "A capybara's toolbox: warm water, good snacks, zero deadlines. Yours has calculators too.",
    "privacy": "The capybara keeps no file on you. It counts how many visitors came to the water, never which one you were.",
    "which-test": "Lost? The capybara also stands at the edge for a while before picking a pool.",
    "which-chart": "A pie chart of the capybara's day would be one giant slice labeled 'napping.' Even then, it says, use a bar.",
    "plan": "The capybara writes the whole plan before the data arrive — test, sample size, and how it'll report it. Then, and only then, it naps.",
    "tables": "Capybaras have memorized exactly zero critical values. That's what this page is for.",
    "formulas": "Print it, laminate it, take it into the bath. The capybara approves.",
    "cheat-test-chooser": "The whole test-picking map on one page. The capybara pinned it above the hot spring, naturally.",
    "cheat-apa": "The whole grammar of a results sentence, on one page. The capybara laminated this one first.",
    "cheat-assumptions": "The capybara checks its assumptions the way it checks the water: before getting in.",
    "distributions": "Distributions are just personality types for data. Come meet the whole squad.",
    "effect-sizes": "Statistically significant ≠ big. The capybara is significant AND big.",
    "power": "How many capybaras do you need to prove capybaras are chill? Fewer than you'd think, if the effect is big.",
    "descriptives": "Paste your data. The capybara judges nothing.",
    "apa": "Type the numbers, take the sentence. The capybara handles the brackets and the italics; you do the thinking.",
    "problems": "The capybara does not rush the arithmetic. It writes each line down, checks it once, and then has a snack.",
    "datasets": "Reading about a t-test isn't running one. Grab a CSV, wrangle real numbers, and the capybara will happily wait.",
    "quiz": "Test anxiety? Unknown to capybaras. Breathe in, breathe out, click an answer.",
    "glossary": "Big words, small stress. The capybara defines, you vibe.",
    "flashcards": "Flip, rate, repeat. The capybara only revises the words it forgot.",
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
    { url: "problems.html",      key: "problems",      group: "practice", emoji: "✏️", title: "Practice problems",        desc: "Work an answer out by hand, then check every step" },
    { url: "datasets.html",      key: "datasets",      group: "practice", emoji: "🗂️", title: "Practice datasets",        desc: "Download real CSVs with stories, exercises & solutions" },
    { url: "formulas.html",      key: "formulas",      group: "guide",    emoji: "🖨️", title: "Formula sheet",            desc: "Every formula from the course, printable" },
    { url: "cheat-test-chooser.html", key: "cheat-test-chooser", group: "guide", emoji: "🧾", title: "Cheat sheet: which test",  desc: "Printable poster — outcome × design → the test" },
    { url: "cheat-apa.html",     key: "cheat-apa",     group: "guide",    emoji: "🖋️", title: "Cheat sheet: APA reporting", desc: "Printable poster — report t, F, χ², r & regression" },
    { url: "cheat-assumptions.html", key: "cheat-assumptions", group: "guide", emoji: "🔎", title: "Cheat sheet: assumptions",  desc: "Printable poster — what to check & the fix when it breaks" },
    { url: "glossary.html",      key: "glossary",      group: "guide",    emoji: "📖", title: "Glossary",                 desc: "Every stats term, defined without the jargon" },
    { url: "flashcards.html",    key: "flashcards",    group: "practice", emoji: "🃏", title: "Glossary flashcards",      desc: "Spaced-repetition drilling of every glossary term" },
    { url: "quiz.html",          key: "quiz",          group: "practice", emoji: "✅", title: "Quiz",                     desc: "Instant-feedback practice, or a marked mock exam" },
    { url: "progress.html",      key: "progress",      group: "practice", emoji: "🌱", title: "My progress",              desc: "Your rings, what's left, and course certificates" },
    /* long-form guides — guides/<slug>/index.html, group "read" (P34) */
    { url: "guides/analyze-thesis-data-jasp/",       key: "analyze-thesis-data-jasp",       group: "read", emoji: "🧪", title: "Analyze your thesis data in JASP", desc: "Import → check → test → APA, the whole path in free software" },
    { url: "guides/spss-output-to-apa/",             key: "spss-output-to-apa",             group: "read", emoji: "📄", title: "From SPSS output to APA results",  desc: "Annotated output for the five classic tests — and the exact sentence" },
    { url: "guides/choose-statistics-dissertation/", key: "choose-statistics-dissertation", group: "read", emoji: "🎓", title: "Choosing statistics for your dissertation", desc: "Three questions that pick your test — plus honest words on messy designs" },
    { url: "guides/clean-survey-data/",              key: "clean-survey-data",              group: "read", emoji: "🧹", title: "Clean your survey data, step by step", desc: "From raw export to analysis-ready, with a real dataset to follow along" },
    { url: "guides/complete-worked-project/",        key: "complete-worked-project",        group: "read", emoji: "🧭", title: "One study, start to finish",           desc: "A whole project on one file: question, power, analysis, APA, limitations" },
    { url: "teachers.html",                        key: "teachers",                       group: "read", emoji: "🧑‍🏫", title: "For instructors",                     desc: "Use the site in your course: link, embed, print & assign — free" }
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

    // a lesson OR course-landing page lights the tab of ITS track
    // (course → track via curriculum)
    var hereCourse = HERE ? window.CURRICULUM.find(function (c) {
      return c.sections.some(function (s) { return s.slug === HERE; });
    }) : (CHOME ? window.CURRICULUM.find(function (c) { return c.slug === CHOME; }) : null);
    var hereTrack = hereCourse ? (hereCourse.track || "core") : null;

    /* one dropdown per populated track, listing its courses; each course row
       links to the course's landing page (<course>/ — the same entry URL as
       the homepage ItemList JSON-LD), the tab itself to the homepage scrolled
       to that track's heading (#track-<id>, rendered by renderCurriculum) */
    var trackDrops = (window.TRACKS || []).map(function (t) {
      var courses = window.CURRICULUM.filter(function (c) { return (c.track || "core") === t.id; });
      if (!courses.length) return "";
      var items = courses.map(function (c) {
        var first = null;
        for (var i = 0; i < c.sections.length && !first; i++) if (c.sections[i].ready) first = c.sections[i];
        if (!first) return "";
        var on = hereCourse && hereCourse.slug === c.slug ? " active" : "";
        return '<a class="nav-drop-item' + on + '" href="' + BASE + c.slug + '/">' +
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
        /* strip the leading emoji — the dropdown headers are text-only
           (the homepage grid + toolbox.html keep the emoji versions) */
        '<div class="ndp-group"><div class="ndp-ghead">' + g.title.replace(/^[^\w]+/, "") + '</div>' +
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
     write resolves.

     Icon-only buttons (the P68 section share-links) can't have their label
     swapped for the word — the swap would eat the icon and change the
     button's width. Those carry a `data-copy-flash` slot instead: a
     visually-hidden live region that takes the wording, while the .copied
     class does the visible work (green check). Text buttons are unchanged. */
  function flashCopied(btn) {
    if (!btn) return;
    var host = btn.querySelector("[data-copy-flash]") || btn;
    if (!host.getAttribute("aria-live")) host.setAttribute("aria-live", "polite");
    if (host.__copyLabel === undefined) host.__copyLabel = host.textContent;
    btn.classList.add("copied");
    host.textContent = "Copied!";
    clearTimeout(btn.__copyT);
    btn.__copyT = setTimeout(function () {
      btn.classList.remove("copied");
      host.textContent = host.__copyLabel;
    }, 1400);
  }

  /* ---------- lesson state presets (P67) ----------
     Lets a URL preconfigure a lesson's interactive, so an instructor can
     embed not just a lesson but the SPECIFIC configuration their slide is
     about ("CLT with n = 50", "SDT at d′ = 2 with a conservative criterion").
     The tool pages have done this for a while (power.html ?sc=&es=,
     apa.html ?a=&v=, plan.html ?test=…); this is the lesson equivalent.

     A lesson opts in by calling SC.preset(map) at the END of its boot, with
     a map of short query keys to appliers:

       SC.preset({ n: "#n-range", pop: "#pop-seg", r: { el: "#rho-range", scale: 100 } });

     Four applier forms:
       • a selector for a form control  — sets its value and dispatches
         "input" + "change", i.e. exactly what moving the slider by hand does;
       • a selector for a .seg strip    — clicks the button whose data-*
         value matches (numeric values compare numerically, so ?alpha=.05
         finds data-a="0.05"); clicking runs the lesson's own handler, so
         there is no second code path to keep in step;
       • { el: selector, scale: n }     — the same, for the common case of a
         slider that carries hundredths of the value the lesson PRINTS (a
         criterion slider in units of 100, a percentage slider behind a
         proportion readout). The URL speaks the printed units — ?r=0.3,
         ?z=1.96 — and the helper scales, clamps and snaps to the input's own
         min/max/step, so a lesson never restates those bounds in JS;
       • a function                     — gets the raw string, for anything
         that isn't a control.

     Three rules the helper enforces:
       1. Absent, unknown or garbage params are silently ignored — a mangled
          URL must still load the plain default lesson, so every applier runs
          inside its own try/catch and nothing here ever throws.
       2. It is called after the lesson's own init, so the frozen-noise law
          holds: a preset moves the controls a hand would move, it never
          reseeds the data.
       3. It composes with ?embed=1 (which site.js handles separately) — the
          two are independent query params.

     Reserved keys a lesson must NOT use: "embed" and "q" (search deep link). */
  function numeric(s) {
    var v = parseFloat(s);
    return (isFinite(v) && /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(String(s).trim())) ? v : null;
  }
  function applyControl(el, raw, scale) {
    var t = (el.type || "").toLowerCase();
    if (t === "checkbox" || t === "radio") {
      var on = /^(1|true|on|yes)$/i.test(raw);
      if (t === "radio" && !on) return;      // "turn a radio off" is meaningless
      el.checked = t === "radio" ? true : on;
    } else if (t === "range" || t === "number") {
      var v = numeric(raw);
      if (v === null) return;                // garbage number: leave the default
      v *= (scale || 1);
      var lo = numeric(el.min), hi = numeric(el.max), st = numeric(el.step);
      // snap to the control's own grid, then clamp — the same states a hand
      // can reach, and identical in every browser (value sanitisation isn't)
      if (st !== null && st > 0) {
        var base = (lo !== null) ? lo : 0;
        v = base + Math.round((v - base) / st) * st;
      }
      if (lo !== null) v = Math.max(lo, v);
      if (hi !== null) v = Math.min(hi, v);
      el.value = String(parseFloat(v.toFixed(10)));   // shed float dust (1.96*100)
    } else if (el.tagName === "SELECT") {
      var ok = Array.prototype.some.call(el.options, function (o) { return o.value === raw; });
      if (!ok) return;                       // unknown option: leave the default
      el.value = raw;
    } else {
      el.value = raw;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function applySeg(box, raw) {
    var want = numeric(raw), btns = box.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var d = btns[i].dataset;
      for (var k in d) {
        if (!Object.prototype.hasOwnProperty.call(d, k)) continue;
        var got = numeric(d[k]);
        var hit = (want !== null && got !== null) ? want === got
                : String(d[k]).toLowerCase() === String(raw).trim().toLowerCase();
        if (hit) { btns[i].click(); return; }   // the lesson's own handler runs
      }
    }
  }
  function preset(map) {
    if (!map || typeof map !== "object") return;
    if (!window.location.search) return;
    Object.keys(map).forEach(function (key) {
      try {
        var raw = qparam(key);
        if (raw === null || raw === "") return;
        var applier = map[key], sel = applier, scale = 1;
        if (typeof applier === "function") { applier(raw); return; }
        if (applier && typeof applier === "object") { sel = applier.el; scale = applier.scale || 1; }
        if (typeof sel !== "string") return;
        var el = document.querySelector(sel);
        if (!el) return;
        if (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA") applyControl(el, raw, scale);
        else applySeg(el, raw);
      } catch (e) { /* one bad param never breaks the lesson */ }
    });
  }

  /* expose the ring + mascot so a standalone page (progress.html) can reuse the
     exact same drawing instead of duplicating it — the copy feedback so
     tool pages share one "Copied!" pattern, preset() for lesson URLs, and
     track()/scoreBucket() so the three tool pages that own an event fire it
     through the shared layer instead of reaching for gtag themselves */
  window.SC = { ring: ring, capy: capy, copied: flashCopied, preset: preset, track: track, scoreBucket: scoreBucket };

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
          // the card title links to the course's landing page (P61)
          '<span class="ch-text"><h3><a href="' + BASE + c.slug + '/">' + c.title + '</a></h3><span>' + c.subtitle +
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

  /* ---------- course landing page (<course>/index.html, P61) ----------
     The page's prose is hand-written HTML; everything stateful renders
     here at runtime from curriculum.js + sc-progress, so the lesson list
     can never drift: the per-course ring, a Start/Continue CTA (first
     lesson, or the first unvisited one once there's progress), and the
     full lesson list with § numbers, ✓ ticks, and dimmed coming-soons. */
  function renderCourseHome() {
    if (!CHOME) return;
    var host = document.getElementById("course-home");
    var c = window.CURRICULUM.find(function (x) { return x.slug === CHOME; });
    if (!host || !c) return;
    var ready = c.sections.filter(function (s) { return s.ready; });
    if (!ready.length) return;
    var visited = ready.filter(function (s) { return isVisited(s.slug); });
    var doneN = ready.filter(function (s) { return isDone(s.slug); }).length;
    var frac = visited.length / ready.length;

    var next = null;
    for (var i = 0; i < ready.length && !next; i++) if (!isVisited(ready[i].slug)) next = ready[i];
    var started = visited.length > 0;
    var target = started && next ? next : ready[0];
    var label = !started ? "Start with " + target.n
      : next ? "Continue with " + next.n
      : "Revisit " + target.n;
    var meta = started
      ? visited.length + " of " + ready.length + " lessons explored" + (doneN ? " · " + doneN + " completed" : "")
      : ready.length + " lessons · every one interactive";

    var items = c.sections.map(function (s) {
      if (!s.ready) {
        return '<li class="chome-soon"><span class="sec-num">' + s.n + '</span>' +
          '<span class="chome-t">' + s.title + '</span><span class="chome-soon-tag">soon</span></li>';
      }
      var state = isDone(s.slug) ? "done" : (isVisited(s.slug) ? "visited" : "");
      return '<li><a class="' + state + '" href="' + BASE + c.slug + '/' + s.slug + '/">' +
        '<span class="sec-num">' + s.n + '</span><span class="chome-t">' + s.title + '</span>' +
        '<span class="sec-check" aria-hidden="true">✓</span></a></li>';
    }).join("");

    host.innerHTML =
      '<div class="chome-status">' + ring(frac, c.accent) +
        '<span class="chome-meta">' + meta + '</span>' +
        '<a class="btn btn-primary btn-sm" href="' + BASE + c.slug + '/' + target.slug + '/">' + label + ' &rarr;</a>' +
      '</div>' +
      '<ol class="chome-list" aria-label="Lessons in this course">' + items + '</ol>';
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
    if (!HERE && !CHOME) return;   // course landing pages print as a syllabus (P61)
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
     print. Keyboard-operable and aria-labeled (it's a real <button>). */
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
        // GA already knows WHICH page this is; page_type says whether the
        // export button earns its keep on lessons, tools, or both
        track("viz_png_export", { page_type: pageType() });
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

  /* ---------- section ids ----------
     Give every h2 in an article a stable slug id, so both the mini-TOC and
     the P68 share-links have something to point at. Hand-written ids (the
     guides write their own) win; the rest are slugified from the heading
     text. Dedupe checks EVERY id already on the page, not just the other
     headings, so a heading can never silently steal an existing anchor. */
  function ensureH2Ids(art) {
    var hs = art.querySelectorAll("h2"), taken = {};
    Array.prototype.forEach.call(document.querySelectorAll("[id]"), function (el) {
      if (el.tagName !== "H2") taken[el.id] = 1;
    });
    Array.prototype.forEach.call(hs, function (h) {
      if (h.id) { taken[h.id] = 1; return; }
      var id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
      while (taken[id]) id += "-x";
      taken[id] = 1; h.id = id;
    });
    return hs;
  }

  /* ---------- "On this page" mini-TOC (longer lessons only) ---------- */
  function renderTOC() {
    if (!HERE) return;
    var art = document.querySelector(".lesson");
    if (!art) return;
    var hs = art.querySelectorAll("h2");
    if (hs.length < 4) return;
    var items = Array.prototype.map.call(ensureH2Ids(art), function (h) {
      return '<a href="#' + h.id + '">' + h.textContent + '</a>';
    }).join("");
    var box = document.createElement("nav");
    box.className = "lesson-toc";
    box.setAttribute("aria-label", "On this page");
    box.innerHTML = '<span class="toc-label">On this page</span>' + items;
    var lede = art.querySelector(".lede");
    if (lede) lede.parentNode.insertBefore(box, lede.nextSibling);
  }

  /* ---------- section share-links (P68) ----------
     A small copy-link button on every h2 of a lesson or guide, so a lecturer
     can hand out "the bit about pooled variance" rather than the whole page.
     Injected here, so all 100-odd pages get it without editing one of them.

     Three constraints shape it:
       • Zero layout shift. The button is in flow from the start and only its
         OPACITY changes, so nothing moves when it appears. The "Copied!"
         wording goes to a visually-hidden slot (see flashCopied) and the
         visible confirmation is an icon swap inside the same box — a widening
         text label would shove the heading around.
       • No hover-only affordance (the P65 touch rule): invisible until hover
         or focus on a fine pointer, permanently half-lit on a coarse one.
         Both cases live in styles.css.
       • No clipboard, no button — there's nothing for it to do. */
  var LINK_ICON =
    '<svg class="h2link-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
      '<path d="M9.7 13.6a4.4 4.4 0 0 0 6.7.5l2.6-2.6a4.4 4.4 0 0 0-6.2-6.2l-1.5 1.5"/>' +
      '<path d="M14.3 10.4a4.4 4.4 0 0 0-6.7-.5L5 12.5a4.4 4.4 0 0 0 6.2 6.2l1.5-1.5"/>' +
    '</svg>' +
    '<svg class="h2link-ok" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M4.5 12.5 9.5 17.5 19.5 6.5"/>' +
    '</svg>' +
    '<span class="h2link-flash" data-copy-flash></span>';

  function renderSectionLinks() {
    if (!HERE && !document.body.getAttribute("data-guide")) return;
    var art = document.querySelector(".lesson");
    if (!art || !navigator.clipboard) return;
    Array.prototype.forEach.call(ensureH2Ids(art), function (h) {
      if (h.querySelector(".h2link")) return;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "h2link";
      b.setAttribute("aria-label", "Copy link to this section");
      b.innerHTML = LINK_ICON;
      b.addEventListener("click", function () {
        var url = window.location.origin + window.location.pathname + "#" + h.id;
        try {
          navigator.clipboard.writeText(url).then(function () { flashCopied(b); }, function () {});
        } catch (e) {}
      });
      h.appendChild(b);
    });
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
  var searchEl = null, searchInput = null, searchResults = null, searchDef = null, searchIdx = 0, searchMatches = [], searchOpener = null;
  function buildSearch() {
    if (searchEl) return;
    searchEl = document.createElement("div");
    searchEl.className = "search-overlay";
    /* aria-modal so screen readers treat the page behind as inert while it's open */
    searchEl.innerHTML =
      '<div class="search-panel" role="dialog" aria-modal="true" aria-label="Search lessons">' +
        '<input type="text" id="search-input" placeholder="Search lessons…" autocomplete="off" aria-label="Search lessons" />' +
        '<div class="search-def" id="search-def" hidden></div>' +
        '<ul class="search-results" id="search-results"></ul>' +
        '<div class="search-hint"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>' +
      '</div>';
    document.body.appendChild(searchEl);
    searchInput = searchEl.querySelector("#search-input");
    searchResults = searchEl.querySelector("#search-results");
    searchDef = searchEl.querySelector("#search-def");
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
      /* DOM order, so the trap runs input → definition-card links → results;
         querying the whole panel (not just the list) is what keeps the P71
         glossary card reachable by keyboard */
      var focusable = Array.prototype.slice.call(searchEl.querySelectorAll("input, a[href]"));
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
  /* glossary terms (assets/js/glossary-data.js) — same lazy deal as the
     index, so "what is power" can be answered in the overlay (P71). It's
     ~60 KB and glossary.html/flashcards.html already load it, hence the
     window.GLOSSARY guard. */
  var glossRequested = false;
  function loadGlossary() {
    if (glossRequested || window.GLOSSARY) return;
    glossRequested = true;
    var s = document.createElement("script");
    s.src = BASE + "assets/js/glossary-data.js";
    s.async = true;
    s.onload = function () { if (searchEl && searchEl.classList.contains("open")) runSearch(); };
    document.body.appendChild(s);
  }
  function openSearch() {
    buildSearch(); loadSearchIndex(); loadGlossary();
    searchOpener = (document.activeElement && document.activeElement !== document.body) ? document.activeElement : null;
    searchEl.classList.add("open"); searchInput.value = ""; runSearch(); searchInput.focus();
    // that the overlay was opened, and from what kind of page. Never the
    // query — what a student types while stuck is theirs, not analytics.
    track("search_used", { page_type: pageType() });
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
    { title: "Practice Problems", url: "problems.html", tag: "Practice", kw: "practice problems worked examples exam questions solutions by hand pencil paper calculation z-score standard deviation confidence interval t-test anova post-hoc chi-square correlation regression mann-whitney handout multiple regression ancova logistic odds ratio interaction vif power analysis missing data bayes rule base rate beta posterior d-prime signal detection pse jnd glm poisson kaplan-meier survival aic model comparison spot the problem confound sampling bias qrp data cleaning misleading figure apa errors" },
    { title: "Practice Datasets", url: "datasets.html", tag: "Practice", kw: "practice datasets csv download data sample example real t-test anova regression factorial likert reliability cronbach cleaning messy logistic exercises worked solutions" },
    { title: "Course Quiz", url: "quiz.html", tag: "Practice", kw: "test yourself questions practice mock exam revision" },
    { title: "Statistics Glossary", url: "glossary.html", tag: "Reference", kw: "terms definitions dictionary" },
    { title: "Glossary Flashcards", url: "flashcards.html", tag: "Practice", kw: "flashcards spaced repetition leitner revise revision memorize memorize drill study cards terms definitions glossary due box" },
    { title: "My Progress", url: "progress.html", tag: "Practice", kw: "progress dashboard my progress rings completed lessons done remaining continue resume certificate certificates course completion percent tracking enrolled" },
    /* course landing pages (<course>/index.html, P61) */
    { title: "Stats 1: Foundations", url: "stats-1/", tag: "Course", kw: "stats 1 course foundations beginner start here overview syllabus descriptive statistics normal distribution z-scores probability sampling confidence intervals t-tests first course intro introduction" },
    { title: "Stats 2: Comparing Groups & Relationships", url: "stats-2/", tag: "Course", kw: "stats 2 course overview syllabus anova post-hoc factorial repeated measures assumptions nonparametric chi-square correlation regression second course" },
    { title: "Stats 3: Advanced Modeling", url: "stats-3/", tag: "Course", kw: "stats 3 course overview syllabus multiple regression ancova interactions mediation logistic factor analysis manova power advanced modeling third course" },
    { title: "Stats 4: Modern & Advanced", url: "stats-4/", tag: "Course", kw: "stats 4 course overview syllabus bootstrap bayesian glm multilevel mixed models cross-validation causal dags survival missing data meta-analysis signal detection fourth course" },
    { title: "Methods: Research Design", url: "methods/", tag: "Course", kw: "methods course overview syllabus research design hypotheses operationalization reliability validity experiments sampling surveys bias replication preregistration open science" },
    { title: "Data: From Raw to Ready", url: "data/", tag: "Course", kw: "data course overview syllabus tidy data codebooks validation cleaning outliers transformations wide long merging reproducible workflows privacy wrangling" },
    { title: "Ethics: Responsible Research", url: "ethics/", tag: "Course", kw: "ethics course overview syllabus research ethics consent irb deception debriefing privacy confidentiality questionable research practices plagiarism authorship ai fraud" },
    { title: "ML & AI: Machine Learning for Researchers", url: "ml/", tag: "Course", kw: "machine learning course overview syllabus ml ai prediction train test regularization classification roc auc trees forests knn clustering pca neural networks llms" },
    { title: "Writing: Reporting Your Research", url: "writing/", tag: "Course", kw: "writing course overview syllabus imrad apa reporting tables figures results discussion limitations abstracts titles checklist scientific writing paper thesis" },
    { title: "Analyze Your Thesis Data in JASP", url: "guides/analyze-thesis-data-jasp/", tag: "Guide", kw: "jasp guide tutorial thesis dissertation analyze data start to finish walkthrough import csv descriptives assumptions levene welch t-test run read output write up apa how to" },
    { title: "From SPSS Output to APA Results", url: "guides/spss-output-to-apa/", tag: "Guide", kw: "spss guide output apa results report write up sig 2-tailed .000 levene two rows t-test anova correlation chi-square regression tables how to read coefficients" },
    { title: "Choosing Statistics for Your Dissertation", url: "guides/choose-statistics-dissertation/", tag: "Guide", kw: "choose choosing statistics dissertation thesis which test analysis pick guide outcome predictor groups paired design likert messy real data decision" },
    { title: "Clean Your Survey Data, Step by Step", url: "guides/clean-survey-data/", tag: "Guide", kw: "clean cleaning survey data guide questionnaire likert reverse code coding missing values composite score reliability cronbach alpha screening exclusions step by step raw export" },
    { title: "One Study, Start to Finish: A Complete Worked Project", url: "guides/complete-worked-project/", tag: "Guide", kw: "complete worked project example whole study start to finish end to end research journey capstone guide research question operationalization design power analysis sample size cleaning assumptions two-way factorial anova interaction simple effects effect size confidence interval apa results paragraph limitations ethics reproducible memory 2x2 dissertation thesis" },
    /* not a tool, so deliberately absent from TOOLBOX — but searchable (P69) */
    { title: "Privacy", url: "privacy.html", tag: "Reference", kw: "privacy policy data collection analytics google cookie cookies tracking localstorage local storage progress stored device gdpr ads advertising accounts anonymous page views ko-fi what is collected delete reset children classroom" },
    { title: "For Instructors", url: "teachers.html", tag: "Guide", kw: "instructors teachers professors teaching course syllabus lms canvas moodle blackboard embed iframe classroom handouts posters assignments datasets reproducible semester week by week map free license link to us lecturer educator" }
  ];
  function escHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* ---------- forgiving matching (P71) ----------
     Statistics students type "hetroscedasticity", "post hoc", "chisquare".
     Three cheap normalizations carry most of it, and one bounded
     edit-distance check carries the rest:
       norm()    lowercase, strip diacritics, hyphens/underscores → spaces
       squash()  norm minus every separator, so "chi-square" === "chisquare"
       flexRe()  a regex allowing at most one separator between characters
                 INSIDE a typed word and up to three BETWEEN typed words,
                 which is what lets a single pass over the index match every
                 spacing variant at once. Measured FASTER than the old
                 toLowerCase().indexOf()
                 it replaces (~1–2 ms vs ~2–3 ms for the whole corpus),
                 because that one re-allocated every lesson's text on every
                 keystroke; no debounce is needed.
     Typo tolerance is deliberately TITLE/TERM-only. Fuzzing the full text
     would cost more and return worse results, and a title match is the
     payoff a misspelling actually needs. */
  var RE_DIA = /[\u0300-\u036f]/g, RE_SEP = /[-\u2010-\u2015_\/]+/g;
  function norm(s) {
    s = String(s == null ? "" : s).toLowerCase();
    if (s.normalize) s = s.normalize("NFD").replace(RE_DIA, "");
    return s.replace(RE_SEP, " ").replace(/\s+/g, " ").trim();
  }
  function squash(s) { return norm(s).replace(/[^a-z0-9]+/g, ""); }
  function toks(s) {
    var t = norm(s).split(" "), o = [];
    for (var i = 0; i < t.length; i++) if (t[i]) o.push(t[i]);
    return o;
  }
  function tailEq(a, i, b, j) {
    while (i < a.length && j < b.length) { if (a.charCodeAt(i) !== b.charCodeAt(j)) return false; i++; j++; }
    return i === a.length && j === b.length;
  }
  /* Damerau-Levenshtein distance ≤ 1 — one insert, delete, substitution or
     adjacent transposition. Walk the common prefix, then compare tails; no
     matrix, no allocation. Transpositions are in because "teh"/"hte" is the
     typo students actually make. */
  function within1(a, b) {
    if (a === b) return true;
    var la = a.length, lb = b.length, d = la - lb;
    if (d > 1 || d < -1) return false;
    var i = 0;
    while (i < la && i < lb && a.charCodeAt(i) === b.charCodeAt(i)) i++;
    if (la === lb) {
      if (tailEq(a, i + 1, b, i + 1)) return true;
      return a.charCodeAt(i) === b.charCodeAt(i + 1) && a.charCodeAt(i + 1) === b.charCodeAt(i) &&
             tailEq(a, i + 2, b, i + 2);
    }
    return la > lb ? tailEq(a, i + 1, b, i) : tailEq(a, i, b, i + 1);
  }
  /* bounded Levenshtein — only ever run over the ~140 titles, and only when
     nothing matched at all, so a plain two-row matrix is cheap enough */
  function editDist(a, b, max) {
    var la = a.length, lb = b.length, i, j;
    if (la - lb > max || lb - la > max) return max + 1;
    var prev = [], cur = [];
    for (j = 0; j <= lb; j++) prev[j] = j;
    for (i = 1; i <= la; i++) {
      cur[0] = i;
      var best = i;
      for (j = 1; j <= lb; j++) {
        var c = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c);
        if (cur[j] < best) best = cur[j];
      }
      if (best > max) return max + 1;
      for (j = 0; j <= lb; j++) prev[j] = cur[j];
    }
    return prev[lb];
  }
  /* The optional separator must be ANY single non-alphanumeric, because that
     is exactly what squash() strips out of the query: a class narrower than
     squash's own is an asymmetry, and it was a costly one. Until P39 run 21
     this allowed only spaces and hyphens, so every APOSTROPHE in the corpus
     blocked a match and "Cohen's d" — about as ordinary a query as this site
     can receive — returned nothing at all. Measured over the whole index:
     9 of 15 natural possessive queries went from 0 hits to hits (Cohen's d
     0 → 15, Levene's test 0 → 7, Cook's distance 0 → 5), while ab / xy / zz /
     qq / test / data / mean / sd returned identical counts, so the widening
     buys back real queries without loosening ordinary ones.
     INSIDE a typed word it is still bounded at ONE separator. BETWEEN two
     typed words it allows up to three, added in P39 run 22 after
     tools/search-reach.js found that "Wilks lambda" returned nothing: the
     site writes "Wilks' Λ (lambda)" and "Wilks' lambda", and a flat
     one-separator budget over the squashed query cannot cross either gap.
     Run 21 measured the obvious fix (allow two separators everywhere) and
     rejected it as drift-prone; the safe version keys off the reader's OWN
     word boundaries, since a space they typed is where a gap is expected.
     The bound is what makes it safe: [^a-zA-Z0-9]{0,3} cannot swallow a
     letter, so a match still never crosses a whole word. Measured over 31
     queries, only "Wilks lambda" 0 → 2, "90% CI" 0 → 3 (the case run 21
     flagged and left), "p value" 46 → 58 and "test data" 2 → 4 moved by
     more than one, while ab / xy / zz / qq / test / data / mean / sd /
     Cohen's d / chi-square / effect size / of the / in a were identical and
     20 full-corpus passes stayed at 11 ms. Still no newlines: the index has
     none today, and allowing them would let a match straddle two sentences.
     "Tukey HSD" stays a miss on purpose — the corpus writes "Tukey's HSD",
     and reaching it means skipping the letter "s", which is the one thing
     this rule refuses to do.

     ACCENT_FOLD closes the mirror image of that asymmetry, found by
     tools/search-reach.js in P39 run 22. norm() strips diacritics from the
     QUERY (NFD + combining-mark removal) but the corpus is matched raw, so an
     accented letter in the source text blocked the match: "Cramér's V" — a
     term five lessons and apa.html teach — returned ZERO hits whether or not
     the reader typed the accent. Every squashed query character is [a-z0-9],
     so each base letter simply also accepts its own accented forms; measured
     over the whole index this took Cramér's V from 0 to 7 hits and left all
     24 control queries (ab / xy / zz / qq / test / data / mean / sd / Cohen's
     d / regression / …) at identical counts, with 20 full-corpus passes still
     at 11 ms. */
  var ACCENT_FOLD = {
    a: "àáâãäåā", c: "çćč",
    e: "èéêëē", i: "ìíîïī",
    n: "ñń", o: "òóôõöøō",
    s: "śš", u: "ùúûüū", y: "ýÿ",
    z: "źž"
  };
  function flexChar(ch) {
    var acc = ACCENT_FOLD[ch];
    return acc ? "[" + ch + acc + "]" : ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  /* takes a NORMALIZED query (norm(), so word boundaries survive) */
  function flexRe(qn) {
    var clean = String(qn == null ? "" : qn).replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
    if (!clean) return null;
    var words = clean.split(" "), parts = [];
    for (var i = 0; i < words.length; i++) {
      var w = words[i], inner = [];
      for (var j = 0; j < w.length; j++) inner.push(flexChar(w.charAt(j)));
      parts.push(inner.join("[^a-zA-Z0-9]?"));
    }
    return new RegExp(parts.join("[^a-zA-Z0-9]{0,3}"), "i");
  }
  /* normalized haystacks, memoised — every title/keyword string on the site
     is normalized once per session, not once per keystroke */
  var HAY = Object.create(null);
  function hayFor(str) {
    var h = HAY[str];
    if (!h) h = HAY[str] = { n: norm(str), s: squash(str), t: toks(str) };
    return h;
  }
  /* 0 = no match; higher = better. Typo tolerance needs 4+ characters on BOTH
     sides, so short tokens like "z", "sd" or "f" can't fuzzily match half the
     site (without that guard "t" matches every one-letter token there is). */
  function scoreOne(Q, str) {
    if (!Q.n) return 1;
    var h = hayFor(str);
    if (h.n.indexOf(Q.n) === 0) return 100;
    if (h.n.indexOf(Q.n) >= 0) return 80;
    if (Q.s && h.s.indexOf(Q.s) >= 0) return 60;
    if (!Q.t.length) return 0;
    var fuzzy = false;
    for (var i = 0; i < Q.t.length; i++) {
      var qt = Q.t[i], hit = false;
      for (var j = 0; j < h.t.length; j++) {
        var ht = h.t[j];
        if (ht.indexOf(qt) === 0) { hit = true; break; }
        if (qt.length >= 4 && ht.length >= 4 && within1(qt, ht)) { hit = true; fuzzy = true; break; }
      }
      if (!hit) return 0;
    }
    return fuzzy ? 40 : 55;
  }
  /* A course-title or keyword hit is weaker evidence than the page's own
     title, so it is SCALED rather than hard-capped. Scaling is what keeps
     the ordering sane at both ends: an exact keyword (80 → 44) still beats a
     guessed spelling in a title (40), but a fuzzy keyword (40 → 22) no
     longer outranks the lesson actually named after the word — which is why
     "corelation" put three cheat sheets above the Correlation lesson. */
  function aside(sc) { return sc ? Math.round(sc * 0.55) : 0; }
  function scoreLesson(Q, s) {
    var best = scoreOne(Q, s.title);
    if (Q.n && s.n.indexOf(Q.n) >= 0) best = Math.max(best, 90);
    return Math.max(best, aside(scoreOne(Q, s.courseTitle)));
  }
  function scorePage(Q, p) {
    return Math.max(scoreOne(Q, p.title), aside(scoreOne(Q, p.kw)));
  }

  /* ---------- glossary instant answers (P71) ---------- */
  /* must stay byte-identical to glossary.html's own slugify, or the deep link
     lands on nothing */
  function glossSlug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  /* "what is power" and "define power" are both asking for one term — strip
     the asking, keep the term */
  var RE_ASK = /^(?:what(?:'|’)?s|what is|what are|whats|define|definition of|meaning of|explain|the)\s+/;
  function askTerm(n) {
    var t = n.replace(/\?+\s*$/, "").trim();
    for (var i = 0; i < 3 && RE_ASK.test(t); i++) t = t.replace(RE_ASK, "");
    return t.trim();
  }
  function glossFind(Q) {
    var G = window.GLOSSARY;
    if (!G || !Q.n) return null;
    var q = askTerm(Q.n), qs = q.replace(/[^a-z0-9]+/g, "");
    if (qs.length < 3) return null;
    var one = q.indexOf(" ") < 0, best = null, bestSc = 0;
    for (var i = 0; i < G.length; i++) {
      var g = G[i], full = hayFor(g.t), sc = 0;
      /* the glossary writes "Power (statistical)" and "Alpha (significance
         level)" — the headword before the parenthesis is what a student types */
      var head = hayFor(String(g.t).replace(/\s*\(.*$/, ""));
      if (head.n === q || head.s === qs) sc = 100;
      else if (full.n === q || full.s === qs) sc = 95;
      else if (qs.length >= 4 && (within1(qs, head.s) || within1(qs, full.s))) sc = 70;
      /* a one-word query naming a multi-word term: nobody types "bonferroni
         correction", they type "bonferoni" and expect the term back */
      else if (one && qs.length >= 4 && head.t.length > 1 && within1(qs, head.t[0])) sc = 65;
      if (sc > bestSc) { bestSc = sc; best = g; }
    }
    return bestSc ? best : null;
  }
  function showDef(g) {
    if (!searchDef) return;
    if (!g) { searchDef.hidden = true; searchDef.innerHTML = ""; return; }
    var links = "";
    if (g.s) links += '<a href="' + BASE + g.s + '/">Read it in ' + escHtml(g.l || "the lesson") + ' →</a>';
    links += '<a href="' + BASE + 'glossary.html#' + glossSlug(g.t) + '">See it in the glossary →</a>';
    searchDef.innerHTML =
      '<div class="sd-head"><span class="sd-term">' + escHtml(g.t) + '</span><span class="sd-tag">Definition</span></div>' +
      '<p class="sd-def">' + escHtml(g.d) + '</p>' +
      '<div class="sd-links">' + links + '</div>';
    searchDef.hidden = false;
  }

  /* a short excerpt around the first match, with the matched run <mark>ed —
     the regex (not the raw query) decides the range, so a "chisquare" query
     highlights the "chi-square" it actually found */
  function snippetFor(txt, re) {
    var m = re.exec(txt);
    if (!m) return null;
    var at = m.index, len = m[0].length;
    var from = Math.max(0, at - 36), to = Math.min(txt.length, at + len + 72);
    return (from > 0 ? "…" : "") +
      escHtml(txt.slice(from, at)) + "<mark>" + escHtml(txt.slice(at, at + len)) + "</mark>" +
      escHtml(txt.slice(at + len, to)) + (to < txt.length ? "…" : "");
  }
  /* the nearest few titles by edit distance — the "did you mean…" rescue when
     nothing matched at all */
  function nearest(Q, flat, limit) {
    if (!Q.s || Q.s.length < 4) return [];
    var max = Q.s.length <= 6 ? 2 : 3, out = [];
    function consider(it, str) {
      var h = hayFor(str), d = editDist(Q.s, h.s, max);
      for (var i = 0; i < h.t.length; i++) {
        if (h.t[i].length < 3) continue;
        var t = editDist(Q.s, h.t[i], max);
        if (t < d) d = t;
      }
      if (d <= max) out.push({ d: d, it: it });
    }
    SEARCH_PAGES.forEach(function (p) { consider({ page: true, title: p.title, url: p.url, tag: p.tag }, p.title); });
    flat.forEach(function (s) { consider(s, s.title); });
    out.sort(function (a, b) { return a.d - b.d; });
    return out.slice(0, limit).map(function (r) { return r.it; });
  }
  function rowHtml(s, i) {
    var href = s.page ? BASE + s.url : BASE + s.course + "/" + s.slug + "/";
    return '<li><a class="' + (i === 0 ? "active" : "") + '" href="' + href + '">' +
      '<span class="n">' + (s.page ? "→" : s.n) + '</span><span>' + s.title +
      (s.snip ? '<small class="snip">' + s.snip + '</small>' : '') + '</span>' +
      '<span class="course-tag">' + (s.page ? s.tag : s.courseTitle) + '</span></a></li>';
  }
  function titlePass(Q, flat) {
    if (!Q.n) {
      return SEARCH_PAGES.map(function (p) { return { page: true, title: p.title, url: p.url, tag: p.tag }; })
        .concat(flat);
    }
    var scored = [];
    SEARCH_PAGES.forEach(function (p, i) {
      var sc = scorePage(Q, p);
      if (sc) scored.push({ sc: sc, ord: i, it: { page: true, title: p.title, url: p.url, tag: p.tag } });
    });
    flat.forEach(function (s, i) {
      var sc = scoreLesson(Q, s);
      if (sc) scored.push({ sc: sc, ord: 1000 + i, it: s });
    });
    scored.sort(function (a, b) { return b.sc - a.sc || a.ord - b.ord; });
    return scored.map(function (r) { return r.it; });
  }
  function runSearch() {
    var raw = searchInput.value.trim();
    var Q = { n: norm(raw), s: squash(raw), t: toks(raw) };
    var flat = window.CURRICULUM_FLAT.filter(function (s) { return s.ready; });

    showDef(glossFind(Q));

    /* title pass, ranked: an exact prefix beats a substring beats a spacing
       variant beats a typo. Ties keep the old order (pages, then lessons). */
    var top = titlePass(Q, flat);
    /* "what is power" asks about one word, but the asking words match no
       title, so the literal query returns nothing. When a question form came
       back empty, run it again on the term alone. */
    var stripped = askTerm(Q.n);
    if (!top.length && stripped && stripped !== Q.n) {
      Q = { n: stripped, s: squash(stripped), t: toks(stripped) };
      top = titlePass(Q, flat);
    }

    /* full-text pass: lessons/pages whose BODY mentions the query but whose
       title didn't already match — shown below title matches, with a snippet */
    var deep = [], re = Q.s.length >= 3 ? flexRe(Q.n) : null;
    if (re && window.SEARCH_INDEX) {
      var seen = Object.create(null);
      top.forEach(function (s) { seen[s.page ? s.url : s.slug] = 1; });
      flat.forEach(function (s) {
        if (seen[s.slug]) return;
        var txt = window.SEARCH_INDEX.lessons[s.slug];
        if (!txt) return;
        var sn = snippetFor(txt, re);
        if (sn) deep.push({ course: s.course, slug: s.slug, n: s.n, title: s.title, courseTitle: s.courseTitle, snip: sn });
      });
      (window.SEARCH_INDEX.pages || []).forEach(function (p) {
        if (seen[p.u]) return;
        var meta = null;
        for (var i = 0; i < SEARCH_PAGES.length; i++) if (SEARCH_PAGES[i].url === p.u) meta = SEARCH_PAGES[i];
        var sn = meta ? snippetFor(p.txt, re) : null;
        if (sn) deep.push({ page: true, title: meta.title, url: meta.url, tag: meta.tag, snip: sn });
      });
    }

    searchMatches = top.concat(deep).slice(0, 40);
    searchIdx = 0;

    if (!searchMatches.length) {
      /* a dead end should still hand the reader somewhere to go */
      var sugg = nearest(Q, flat, 3), html = "";
      if (sugg.length) {
        html = '<li class="search-note">Nothing matched “' + escHtml(raw) + '”. Did you mean:</li>' +
               sugg.map(rowHtml).join("");
        searchMatches = sugg;
      } else {
        html = '<li class="search-empty">' + capy(30) + '<span>' +
          (searchDef && !searchDef.hidden
            ? 'That term is defined above, but no page title or lesson mentions “' + escHtml(raw) + '”.'
            : 'Nothing on the site mentions “' + escHtml(raw) + '”. The capybara checked twice.') +
          ' Try fewer words, or start from one of these.</span></li>';
      }
      searchResults.innerHTML = html +
        '<li class="search-elsewhere"><a href="' + BASE + 'glossary.html">Browse the glossary</a>' +
        '<a href="' + BASE + 'toolbox.html">Browse the toolbox</a></li>';
      wireRows();
      return;
    }

    searchResults.innerHTML = searchMatches.map(rowHtml).join("");
    wireRows();
  }
  /* only the anchors that ARE searchMatches get hover-select; the trailing
     "browse instead" links sit past the end of the array on purpose */
  function wireRows() {
    Array.prototype.forEach.call(searchResults.querySelectorAll("a"), function (a, i) {
      if (i < searchMatches.length) a.addEventListener("mousemove", function () { setActive(i); });
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

  /* ---------- "Spotted a mistake?" (every page, P68) ----------
     A site that invites corrections reads as one that expects to be held to
     its own standard. mailto: rather than a GitHub issues link on purpose —
     the audience is students, most of whom have no GitHub account. The
     subject carries the page's own path so a report arrives locatable
     ("which page?" is otherwise the first reply every time). The path comes
     from the canonical link when there is one, so it's the clean public URL
     regardless of where the page is being served from. */
  var FEEDBACK_TO = "hkarsilar@gmail.com";
  function pagePath() {
    var can = document.querySelector('link[rel="canonical"]');
    var href = (can && can.getAttribute("href")) || window.location.href;
    try { return new URL(href, window.location.href).pathname || "/"; }
    catch (e) { return window.location.pathname || "/"; }
  }
  function renderFooterFeedback() {
    var c = document.querySelector(".footer .container");
    if (!c || c.querySelector(".footer-feedback")) return;
    var a = document.createElement("a");
    a.className = "footer-feedback";
    a.href = "mailto:" + FEEDBACK_TO +
      "?subject=" + encodeURIComponent("StatsCapybara correction: " + pagePath());
    a.textContent = "Spotted a mistake? Tell me";
    // the click, not the mail — whether anyone reaches for the correction
    // route at all is the thing worth knowing
    a.addEventListener("click", function () { track("feedback_click", { page_type: pageType() }); });
    c.appendChild(a);
  }

  /* a quiet Privacy link in every footer (P69) — the site runs analytics, so
     the page saying so has to be reachable from anywhere, not buried. Same
     quiet family as the feedback link; it is a reference, not a destination. */
  function renderFooterPrivacy() {
    var c = document.querySelector(".footer .container");
    if (!c || c.querySelector(".footer-privacy")) return;
    var a = document.createElement("a");
    a.className = "footer-privacy";
    a.href = BASE + "privacy.html";
    a.textContent = "Privacy";
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
  var HS_SELECTOR = ".hscroll, .try-code pre, .lesson pre, .mock, #ana-seg, .tbl-demo, .cb-book-wrap, .td-grid-wrap, .apa-ref, .rb-output";
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
    // Auto-apply updates: if a worker is ALREADY controlling this page, a later
    // takeover means a new version activated (sw.js does skipWaiting + claim on
    // a CACHE_VERSION bump). Reload once so the fresh CSS/JS apply on THIS visit
    // instead of the next — no cache-clearing, no 2-load lag. Guards: only when
    // a controller existed at load (a first-ever install must NOT reload), and a
    // one-shot flag so it can never loop. Fully swallowed — never breaks a page.
    try {
      var hadController = !!navigator.serviceWorker.controller;
      var reloading = false;
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (!hadController || reloading) return;
        reloading = true;
        window.location.reload();
      });
    } catch (e) {}
    var go = function () {
      try { navigator.serviceWorker.register(BASE + "sw.js").catch(function () {}); }
      catch (e) {}
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
  }

  /* ---------- print + install events (P70) ----------
     Print is instrumented at the window, not on the buttons: a reader who
     hits Ctrl-P counts exactly as much as one who clicks "Print this
     lesson", and this way every page type is covered without touching the
     four pages that own a print button. The `active` guard is the same one
     setupPrint() uses — Safari drives off the media query rather than
     before/afterprint, and a browser doing both must still count once. */
  function trackPrint() {
    var active = false;
    function before() {
      if (active) return; active = true;
      track("print_used", { page_type: pageType() });
    }
    function after() { active = false; }
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    if (window.matchMedia) {
      try {
        window.matchMedia("print").addEventListener("change", function (e) { e.matches ? before() : after(); });
      } catch (_) { /* older Safari — before/afterprint covers the rest */ }
    }
  }
  /* the PWA actually being installed, which nothing else can tell us:
     a standalone launch looks like an ordinary page view */
  function trackInstall() {
    try { window.addEventListener("appinstalled", function () { track("pwa_installed", {}); }); }
    catch (e) {}
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
      trackPrint();
      // an embedded pageload, and whether the URL also carried a preset —
      // i.e. whether instructors configure the widget or just drop it in.
      // Read from the URL rather than from preset(), which runs later (at
      // the end of the lesson's own boot) and only on lessons that opt in.
      track("lesson_embed_view", { with_preset: hasPresetParams() });
      return;
    }
    renderNav();
    renderCurriculum();
    renderCounts();
    renderToolbox();
    renderResume();
    renderCourseHome();
    renderSidebar();
    renderLessonNav();
    renderLessonDone();
    setupPrint();
    renderTOC();
    renderSectionLinks();   // after renderTOC: the TOC reads heading text
    renderTryCode();
    renderChecks();
    renderSoftware();
    renderKofi();
    renderFooterAbout();
    renderFooterFeedback();
    renderFooterPrivacy();
    renderFooterCapy();
    setupHScroll();
    injectVizExport();
    wireSearchShortcuts();
    wireLessonKeys();
    registerSW();
    trackPrint();
    trackInstall();
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
