#!/usr/bin/env node
/* ============================================================================
   search-relevance.js — does the site's search put the right page FIRST?
   P124. Zero dependencies (Node built-ins only). Run from the repo root:

     node tools/search-relevance.js                  # hit rates and every miss
     node tools/search-relevance.js --verbose        # every query with its top 3
     node tools/search-relevance.js --query "p value"   # top 10 for one query, with scores
     node tools/search-relevance.js --time           # ms per query and per keystroke
     node tools/search-relevance.js --against <rev>  # the table scored on a commit (P124 or later)
     node tools/search-relevance.js --strict         # exit 1 below THRESHOLDS or on a bad alias

   EDITORIAL HEALTH, NOT BUILD HEALTH. Like search-reach.js it is not wired
   into audit.js and is not a commit gate.

   WHY IT EXISTS. search-reach.js asks whether search can FIND a term at all,
   and on 7 Oct 2026 it could find every one. The ranking was the problem:
   "p value" listed tables.html, cheat-apa.html, apa.html, What Is Statistics?
   and z-scores before the lesson that teaches p-values; "regression" put
   Regression Discontinuity above Simple Linear Regression; "type 1 error"
   returned nothing but the glossary card. Reach cannot see any of that. This
   asks a narrower question about a fixed set of queries a student types:
   which page comes first, and are the first three ones a student would want?
   On the code before P124 the table scored 48.5% top-1 and 11.1% top-3.

   THE TABLE. Each row is { q, first, top3 }. Ids are "course/slug" for
   lessons and the page URL for everything else. The rows draw on the 7 Oct
   failures, lesson titles as students shorten them, glossary headwords, the
   quiz bank's wording and a few typos.

   `first` is the page that should rank first, chosen from what the pages
   teach and never from what search returned, by one rule applied in order:
   the lesson or tool whose title names the query (the first in course order
   when several do); otherwise the lesson the glossary's back-link for the
   term points at, if that lesson's text uses the term; otherwise the lesson
   with a section on it. Writing the rows that way found two back-links that
   sent readers to a lesson that never names the term ("Type II error" to
   §3.1, "Moderation" to Interactions in Regression); P124 moved both.

   `top3` lists every page that may hold one of the first three places, by
   one test: does the page teach, compute or summarize the query? That means
   a lesson or tool whose title or alias names it, a page with a heading (h2
   to h4, or a FAQ question) on it, a tool or guide whose keyword list names
   it, a printable reference (formula sheet or cheat sheet) that covers it,
   or the problems page when one of its worked problems is on it. Course
   front doors, the guides hub, the toolbox and the glossary page never
   qualify: they point at the answer rather than give it, and the glossary's
   definition is already on screen as a card.

   A query scores
     top-1  when the first result is `first`;
     top-3  when `first` is among the first three, and those three hold as
            many `top3` pages as the whole result list does, up to three.
   So an unlisted page may take a top-3 place only when search found fewer
   than three listed ones: only two pages on the site name a Type II error,
   and whatever comes third for it cannot be a ranking fault.

   THE MATCHER IS LIFTED, NOT COPIED. searchRank() and everything it calls are
   read out of assets/js/site.js by brace-matching and run in a vm sandbox
   against the generated search-index.js, glossary-data.js and curriculum.js,
   the same way search-reach.js lifts norm/squash/flexRe. A copy would drift,
   and the question is what the shipped search does. A helper missing from
   LIFT throws a ReferenceError on the first query, so a rename fails loudly.

   ALIASES. A lesson's `aka` list in curriculum.js must name things the lesson
   teaches. The check runs each alias through the shipped body matcher
   (equivalent spellings included) against that lesson's own indexed text and
   reports any alias the lesson never mentions. An alias may also never be one
   of the GUARDS below, the ordinary English words that must keep their
   meaning ("did" is a verb, not difference-in-differences).

   KNOWN BLIND SPOTS. The table is a sample, so a high rate says the common
   queries rank well, not that every query does. The rule settles `first`
   where a person might hesitate (the glossary sends p-hacking to the
   replication-crisis lesson, though the QRP lesson defines it too); those
   rows put the other page in `top3`. The ten top-3 misses left after P124
   are all the same shape: second or third place goes to a page with no
   title, alias, heading or keyword for the query, on density alone, often a
   short tool page whose few mentions read as dense ("one tailed" → power.html,
   "jasp" → plan.html). Fixing them would mean tuning weights to the table.
   The rows test ranking, not snippets or the glossary card, and timings are
   Node's, which run close to Chromium's but are not the browser.

   If a row misses: fix the ranking, an alias or the page, not the row. Change
   a row only when the row was wrong about what the lessons teach, and say so
   in the commit.
   ========================================================================== */

"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

/* Set in P124 once the new ranking landed at 100% top-1 and 89.9% top-3,
   a little below both so that a new row the ranking cannot yet meet does
   not fail the run before anyone has looked at it. Raise, never lower. */
const THRESHOLDS = { top1: 0.97, top3: 0.85 };

/* English words a query may contain that no equivalence or alias may turn
   into something else. */
const GUARDS = ["did", "type", "one", "two", "i", "ii", "is", "it", "a", "an", "the", "test", "late"];

const S1 = "stats-1/", S2 = "stats-2/", S3 = "stats-3/";
const QUERIES = [
  /* --- the 7 Oct failures and their spellings --- */
  { q: "p value",            first: S1 + "hypothesis-testing-logic", top3: [S1 + "hypothesis-testing-logic", "tables.html", "apa.html", "cheat-apa.html", "writing/reporting-statistics-apa", S1 + "one-sample-and-paired-t-tests"] },
  { q: "p-value",            first: S1 + "hypothesis-testing-logic", top3: [S1 + "hypothesis-testing-logic", "tables.html", "apa.html", "cheat-apa.html", "writing/reporting-statistics-apa", S1 + "one-sample-and-paired-t-tests"] },
  { q: "anova",              first: S2 + "one-way-anova", top3: [S2 + "one-way-anova", S2 + "factorial-anova-two-way", S2 + "repeated-measures-anova", S2 + "assumptions-and-when-they-break", S2 + "post-hoc-tests", S2, "which-test.html", "guides/anova-and-regression-project/"] },
  { q: "regression",         first: S1 + "simple-linear-regression", top3: [S1 + "simple-linear-regression", S2 + "multiple-regression", S2 + "inference-for-regression", "correlation.html", S2, "guides/anova-and-regression-project/", S2 + "regression-diagnostics", S3 + "regression-discontinuity", S2 + "assumptions-of-regression", S2 + "interactions-in-regression", S2 + "logistic-regression"] },
  { q: "p hacking",          first: "methods/the-replication-crisis", top3: ["methods/the-replication-crisis", "ethics/questionable-research-practices", "methods/preregistration-and-open-science"] },
  { q: "standard deviation", first: S1 + "describing-data", top3: [S1 + "describing-data", "descriptives.html", S1 + "z-scores-and-the-normal-distribution", S1 + "sampling-distributions", "formulas.html"] },
  { q: "pearson",            first: S1 + "correlation", top3: [S1 + "correlation", "correlation.html", S2 + "non-parametric-alternatives", "formulas.html", "guides/spss-output-to-apa/"] },
  { q: "mann whitney",       first: S2 + "non-parametric-alternatives", top3: [S2 + "non-parametric-alternatives", "tables.html", "problems.html", "cheat-test-chooser.html"] },
  { q: "type 1 error",       first: S1 + "hypothesis-testing-logic", top3: [S1 + "hypothesis-testing-logic", S3 + "effect-size-and-power", S2 + "post-hoc-tests", "ml/classification-metrics", "methods/the-replication-crisis"] },
  { q: "type I error",       first: S1 + "hypothesis-testing-logic", top3: [S1 + "hypothesis-testing-logic", S3 + "effect-size-and-power", S2 + "post-hoc-tests", "ml/classification-metrics", "methods/the-replication-crisis"] },
  { q: "type 2 error",       first: S1 + "hypothesis-testing-logic", top3: [S1 + "hypothesis-testing-logic", S3 + "effect-size-and-power", "power.html", "writing/nonsignificant-results", "ml/classification-metrics"] },
  { q: "type ii error",      first: S1 + "hypothesis-testing-logic", top3: [S1 + "hypothesis-testing-logic", S3 + "effect-size-and-power", "power.html", "writing/nonsignificant-results", "ml/classification-metrics"] },
  { q: "r2",                 first: S1 + "simple-linear-regression", top3: [S1 + "simple-linear-regression", S2 + "multiple-regression", S2 + "model-comparison", "correlation.html", "effect-sizes.html"] },
  { q: "r squared",          first: S1 + "simple-linear-regression", top3: [S1 + "simple-linear-regression", S2 + "multiple-regression", S2 + "model-comparison", "correlation.html", "effect-sizes.html"] },
  { q: "R²",                 first: S1 + "simple-linear-regression", top3: [S1 + "simple-linear-regression", S2 + "multiple-regression", S2 + "model-comparison", "correlation.html", "effect-sizes.html"] },
  { q: "sd",                 first: S1 + "describing-data", top3: [S1 + "describing-data", "descriptives.html", S1 + "z-scores-and-the-normal-distribution", S1 + "sampling-distributions"] },

  /* --- Stats 1, as students shorten the titles --- */
  { q: "mean median mode",   first: S1 + "describing-data", top3: [S1 + "describing-data", "descriptives.html", S1 + "visualizing-data"] },
  { q: "histogram",          first: S1 + "visualizing-data", top3: [S1 + "visualizing-data", "which-chart.html", "descriptives.html", S1 + "describing-data"] },
  { q: "z score",            first: S1 + "z-scores-and-the-normal-distribution", top3: [S1 + "z-scores-and-the-normal-distribution", "tables.html", "distributions.html", "problems.html", "data/outliers-in-practice"] },
  { q: "normal distribution", first: S1 + "z-scores-and-the-normal-distribution", top3: [S1 + "z-scores-and-the-normal-distribution", "distributions.html", S1 + "central-limit-theorem", "tables.html"] },
  { q: "bayes theorem",      first: S1 + "probability-basics", top3: [S1 + "probability-basics", S3 + "bayesian-thinking", S3 + "bayesian-estimation", "problems.html"] },
  { q: "sampling distribution", first: S1 + "sampling-distributions", top3: [S1 + "sampling-distributions", S1 + "central-limit-theorem", S1 + "confidence-intervals", S1 + "inference-for-proportions"] },
  { q: "standard error",     first: S1 + "sampling-distributions", top3: [S1 + "sampling-distributions", S1 + "one-sample-and-paired-t-tests", S1 + "confidence-intervals", S2 + "inference-for-regression", S1 + "independent-samples-t-test", S1 + "central-limit-theorem"] },
  { q: "clt",                first: S1 + "central-limit-theorem", top3: [S1 + "central-limit-theorem", S1 + "sampling-distributions", "cheat-assumptions.html"] },
  { q: "confidence interval", first: S1 + "confidence-intervals", top3: [S1 + "confidence-intervals", S3 + "bayesian-estimation", S1 + "inference-for-proportions", "apa.html", "correlation.html"] },
  { q: "margin of error",    first: S1 + "confidence-intervals", top3: [S1 + "confidence-intervals", S1 + "inference-for-proportions", "methods/sampling-methods"] },
  { q: "null hypothesis",    first: S1 + "hypothesis-testing-logic", top3: [S1 + "hypothesis-testing-logic", "methods/from-question-to-hypothesis", S1 + "one-sample-and-paired-t-tests"] },
  { q: "one tailed",         first: S1 + "hypothesis-testing-logic", top3: [S1 + "hypothesis-testing-logic", "tables.html", S1 + "one-sample-and-paired-t-tests", "methods/from-question-to-hypothesis"] },
  { q: "t test",             first: S1 + "one-sample-and-paired-t-tests", top3: [S1 + "one-sample-and-paired-t-tests", S1 + "independent-samples-t-test", S2 + "assumptions-and-when-they-break", "which-test.html", "tables.html"] },
  { q: "paired t test",      first: S1 + "one-sample-and-paired-t-tests", top3: [S1 + "one-sample-and-paired-t-tests", S1 + "independent-samples-t-test", S2 + "non-parametric-alternatives", "methods/between-vs-within-designs", "guides/choose-statistics-dissertation/", "cheat-test-chooser.html"] },
  { q: "independent t test", first: S1 + "independent-samples-t-test", top3: [S1 + "independent-samples-t-test", S1 + "one-sample-and-paired-t-tests", S2 + "assumptions-and-when-they-break", "cheat-test-chooser.html"] },
  { q: "welch",              first: S1 + "independent-samples-t-test", top3: [S1 + "independent-samples-t-test", S2 + "assumptions-and-when-they-break", "cheat-assumptions.html", "guides/spss-output-to-apa/", "guides/analyze-thesis-data-jasp/"] },
  { q: "degrees of freedom", first: S1 + "one-sample-and-paired-t-tests", top3: [S1 + "one-sample-and-paired-t-tests", S1 + "independent-samples-t-test", S2 + "one-way-anova", S1 + "chi-square-tests", "writing/final-checklist", "tables.html"] },
  { q: "chi square",         first: S1 + "chi-square-tests", top3: [S1 + "chi-square-tests", "tables.html", "distributions.html", "which-test.html", "power.html", "guides/spss-output-to-apa/"] },
  { q: "correlation",        first: S1 + "correlation", top3: [S1 + "correlation", "correlation.html", S1 + "simple-linear-regression", "guides/spss-output-to-apa/"] },
  { q: "linear regression",  first: S1 + "simple-linear-regression", top3: [S1 + "simple-linear-regression", S2 + "multiple-regression", S2 + "inference-for-regression", "correlation.html", "guides/spss-output-to-apa/", "cheat-test-chooser.html"] },
  { q: "least squares",      first: S1 + "simple-linear-regression", top3: [S1 + "simple-linear-regression", "correlation.html", S2 + "inference-for-regression", S3 + "instrumental-variables"] },

  /* --- Stats 2 --- */
  { q: "spearman",           first: S2 + "non-parametric-alternatives", top3: [S2 + "non-parametric-alternatives", S1 + "correlation", "correlation.html", "tables.html"] },
  { q: "kruskal wallis",     first: S2 + "non-parametric-alternatives", top3: [S2 + "non-parametric-alternatives", "tables.html", "problems.html", "cheat-test-chooser.html", "cheat-assumptions.html"] },
  { q: "wilcoxon",           first: S2 + "non-parametric-alternatives", top3: [S2 + "non-parametric-alternatives", "tables.html", "problems.html", "cheat-test-chooser.html"] },
  { q: "f test",             first: S2 + "one-way-anova", top3: [S2 + "one-way-anova", "tables.html", S2 + "inference-for-regression", S2 + "model-comparison", "problems.html"] },
  { q: "post hoc",           first: S2 + "post-hoc-tests", top3: [S2 + "post-hoc-tests", S2 + "one-way-anova", "problems.html", S3 + "power-analysis-for-complex-designs"] },
  { q: "tukey",              first: S2 + "post-hoc-tests", top3: [S2 + "post-hoc-tests", S2 + "one-way-anova", "problems.html", "tables.html"] },
  { q: "bonferroni",         first: S2 + "post-hoc-tests", top3: [S2 + "post-hoc-tests", "guides/anova-and-regression-project/", "ethics/questionable-research-practices", "methods/the-replication-crisis"] },
  { q: "two way anova",      first: S2 + "factorial-anova-two-way", top3: [S2 + "factorial-anova-two-way", "guides/complete-worked-project/", S2 + "one-way-anova"] },
  { q: "repeated measures",  first: S2 + "repeated-measures-anova", top3: [S2 + "repeated-measures-anova", "methods/between-vs-within-designs", S3 + "mixed-and-multilevel-models", S3 + "power-analysis-for-complex-designs", S1 + "one-sample-and-paired-t-tests", "cheat-test-chooser.html"] },
  { q: "sphericity",         first: S2 + "repeated-measures-anova", top3: [S2 + "repeated-measures-anova", "cheat-assumptions.html", S3 + "power-analysis-for-complex-designs"] },
  { q: "normality",          first: S2 + "assumptions-and-when-they-break", top3: [S2 + "assumptions-and-when-they-break", S2 + "assumptions-of-regression", "cheat-assumptions.html", "problems.html"] },
  { q: "residuals",          first: S2 + "regression-diagnostics", top3: [S2 + "regression-diagnostics", S2 + "assumptions-of-regression", S1 + "simple-linear-regression", "cheat-assumptions.html"] },
  { q: "heteroscedasticity", first: S2 + "regression-diagnostics", top3: [S2 + "regression-diagnostics", S2 + "assumptions-of-regression", "cheat-assumptions.html"] },
  { q: "dummy coding",       first: S2 + "categorical-predictors-and-dummy-coding", top3: [S2 + "categorical-predictors-and-dummy-coding", S2 + "multiple-regression", "guides/anova-and-regression-project/"] },
  { q: "interaction",        first: S2 + "interactions-in-regression", top3: [S2 + "interactions-in-regression", S2 + "factorial-anova-two-way", "guides/complete-worked-project/"] },
  { q: "moderation",         first: S2 + "factorial-anova-two-way", top3: [S2 + "factorial-anova-two-way", S2 + "interactions-in-regression", S3 + "mediation-and-indirect-effects"] },
  { q: "vif",                first: S2 + "multicollinearity-and-variable-selection", top3: [S2 + "multicollinearity-and-variable-selection", "cheat-assumptions.html", S2 + "assumptions-of-regression", "guides/anova-and-regression-project/"] },
  { q: "cooks distance",     first: S2 + "assumptions-of-regression", top3: [S2 + "assumptions-of-regression", S2 + "regression-diagnostics", "correlation.html", "cheat-assumptions.html"] },
  { q: "odds ratio",         first: S2 + "logistic-regression", top3: [S2 + "logistic-regression", "effect-sizes.html", S1 + "chi-square-tests", S3 + "generalized-linear-models", "methods/observational-designs"] },
  { q: "log transformation", first: "data/transformations-and-recoding", top3: ["data/transformations-and-recoding", S2 + "nonlinear-relationships-and-transformations", "guides/clean-survey-data/"] },

  /* --- Stats 3 --- */
  { q: "effect size",        first: S3 + "effect-size-and-power", top3: [S3 + "effect-size-and-power", "effect-sizes.html", S3 + "power-analysis-for-complex-designs"] },
  { q: "cohen's d",          first: S3 + "effect-size-and-power", top3: [S3 + "effect-size-and-power", "effect-sizes.html", S1 + "independent-samples-t-test"] },
  { q: "power analysis",     first: S3 + "power-analysis-for-complex-designs", top3: [S3 + "power-analysis-for-complex-designs", S3 + "effect-size-and-power", "power.html", "guides/complete-worked-project/", "problems.html"] },
  { q: "sample size calculator", first: "power.html", top3: ["power.html", S3 + "effect-size-and-power", S3 + "power-analysis-for-complex-designs", "plan.html"] },
  { q: "what is power",      first: S3 + "effect-size-and-power", top3: [S3 + "effect-size-and-power", "power.html", S3 + "power-analysis-for-complex-designs"] },
  { q: "mediation",          first: S3 + "mediation-and-indirect-effects", top3: [S3 + "mediation-and-indirect-effects", S2 + "interactions-in-regression"] },
  { q: "pca",                first: S3 + "factor-analysis-pca", top3: [S3 + "factor-analysis-pca", "ml/dimensionality-reduction"] },
  { q: "bayesian",           first: S3 + "bayesian-thinking", top3: [S3 + "bayesian-thinking", S3 + "bayesian-estimation", S1 + "probability-basics"] },
  { q: "bootstrap",          first: S3 + "bootstrap-and-resampling", top3: [S3 + "bootstrap-and-resampling", S3 + "mediation-and-indirect-effects", "ml/random-forests-and-ensembles"] },
  { q: "poisson regression", first: S3 + "generalized-linear-models", top3: [S3 + "generalized-linear-models", "distributions.html", S3 + "mixed-and-multilevel-models", "problems.html"] },
  { q: "multilevel model",   first: S3 + "mixed-and-multilevel-models", top3: [S3 + "mixed-and-multilevel-models", S3 + "power-analysis-for-complex-designs", S3 + "generalized-linear-models", "cheat-test-chooser.html"] },
  { q: "overfitting",        first: S3 + "cross-validation-and-overfitting", top3: [S3 + "cross-validation-and-overfitting", "ml/train-test-split-and-generalization", "ml/regularization-ridge-and-lasso", "ml/decision-trees", "ml/random-forests-and-ensembles"] },
  { q: "confounding",        first: S3 + "causal-dags-and-confounding", top3: [S3 + "causal-dags-and-confounding", "methods/experimental-design-and-randomization", "methods/observational-designs", S2 + "multiple-regression", "methods/variables-and-operationalization"] },
  { q: "2sls",               first: S3 + "instrumental-variables", top3: [S3 + "instrumental-variables", "guides/reading-a-causal-paper/"] },
  { q: "diff in diff",       first: S3 + "difference-in-differences", top3: [S3 + "difference-in-differences", "guides/reading-a-causal-paper/", "methods/quasi-experiments"] },
  { q: "missing data",       first: S3 + "missing-data", top3: [S3 + "missing-data", "data/data-cleaning-workflow", "guides/clean-survey-data/", "data/codebooks-and-documentation", "problems.html"] },
  { q: "d prime",            first: S3 + "signal-detection-theory", top3: [S3 + "signal-detection-theory", S3 + "psychometric-functions", "problems.html"] },

  /* --- ML & AI --- */
  { q: "lasso",              first: "ml/regularization-ridge-and-lasso", top3: ["ml/regularization-ridge-and-lasso", S2 + "multicollinearity-and-variable-selection", "cheat-assumptions.html"] },
  { q: "roc curve",          first: "ml/roc-curves-and-auc", top3: ["ml/roc-curves-and-auc", "ml/classification-metrics", S3 + "signal-detection-theory"] },
  { q: "precision recall",   first: "ml/classification-metrics", top3: ["ml/classification-metrics", "ml/roc-curves-and-auc"] },
  { q: "knn",                first: "ml/knn-and-distance", top3: ["ml/knn-and-distance", "ml/clustering-kmeans"] },
  { q: "k means",            first: "ml/clustering-kmeans", top3: ["ml/clustering-kmeans", "ml/knn-and-distance", "ml/dimensionality-reduction"] },
  { q: "chatgpt",            first: "ml/llms-and-ai-in-research", top3: ["ml/llms-and-ai-in-research", "ethics/ai-in-research-ethics"] },

  /* --- the Research Toolkit --- */
  { q: "reliability",        first: "methods/reliability-and-validity", top3: ["methods/reliability-and-validity", "guides/clean-survey-data/", "methods/survey-and-questionnaire-design", "datasets.html"] },
  { q: "cronbach alpha",     first: "methods/reliability-and-validity", top3: ["methods/reliability-and-validity", "guides/clean-survey-data/", "datasets.html"] },
  { q: "likert",             first: "methods/survey-and-questionnaire-design", top3: ["methods/survey-and-questionnaire-design", S1 + "types-of-data", "guides/clean-survey-data/", S2 + "non-parametric-alternatives"] },
  { q: "random assignment",  first: "methods/experimental-design-and-randomization", top3: ["methods/experimental-design-and-randomization", S1 + "producing-data-and-sampling-design", "methods/quasi-experiments"] },
  { q: "within subjects",    first: "methods/between-vs-within-designs", top3: ["methods/between-vs-within-designs", S2 + "repeated-measures-anova"] },
  { q: "stratified sampling", first: "methods/sampling-methods", top3: ["methods/sampling-methods", S1 + "producing-data-and-sampling-design"] },
  { q: "outliers",           first: "data/outliers-in-practice", top3: ["data/outliers-in-practice", S1 + "describing-data", S2 + "regression-diagnostics", "descriptives.html", "correlation.html"] },
  { q: "wide to long",       first: "data/wide-vs-long-data", top3: ["data/wide-vs-long-data", "data/tidy-data"] },
  { q: "reverse coding",     first: "data/transformations-and-recoding", top3: ["data/transformations-and-recoding", "guides/clean-survey-data/", "methods/survey-and-questionnaire-design"] },
  { q: "apa style",          first: "writing/reporting-statistics-apa", top3: ["writing/reporting-statistics-apa", "apa.html", "cheat-apa.html", "writing/nonsignificant-results"] },
  { q: "results section",    first: "writing/writing-results", top3: ["writing/writing-results", "writing/reporting-statistics-apa", "guides/spss-output-to-apa/", "writing/imrad-structure"] },
  { q: "non significant",    first: "writing/nonsignificant-results", top3: ["writing/nonsignificant-results", S1 + "hypothesis-testing-logic", "writing/discussion-and-limitations", S2 + "factorial-anova-two-way", S2 + "repeated-measures-anova"] },

  /* --- tools by what they do --- */
  { q: "z table",            first: "tables.html", top3: ["tables.html", S1 + "z-scores-and-the-normal-distribution", "distributions.html"] },
  { q: "which test",         first: "which-test.html", top3: ["which-test.html", "cheat-test-chooser.html", "guides/choose-statistics-dissertation/", "plan.html"] },
  { q: "formula sheet",      first: "formulas.html", top3: ["formulas.html", "cheat-test-chooser.html", "cheat-apa.html", "cheat-assumptions.html"] },
  { q: "jasp",               first: "guides/analyze-thesis-data-jasp/", top3: ["guides/analyze-thesis-data-jasp/", "guides/spss-output-to-apa/", "datasets.html"] },

  /* --- typos (P71's typo tolerance must still carry these) --- */
  { q: "hetroscedasticity",  first: S2 + "regression-diagnostics", top3: [S2 + "regression-diagnostics", S2 + "assumptions-of-regression", "cheat-assumptions.html"] },
  { q: "corelation",         first: S1 + "correlation", top3: [S1 + "correlation", "correlation.html", S1 + "simple-linear-regression"] },
  { q: "regresion",          first: S1 + "simple-linear-regression", top3: [S1 + "simple-linear-regression", S2 + "multiple-regression", S2 + "inference-for-regression", "correlation.html", "guides/anova-and-regression-project/"] }
];

/* Everything searchRank() needs, in declaration order. Vars first. A name
   site.js does not declare is skipped, so the table can also be scored on
   an older commit (--against); anything actually called and missing throws. */
const LIFT_VARS = ["RE_DIA", "ACCENT_FOLD", "UNFOLD", "HAY", "AKA", "NAV", "SYN", "IDX", "RE_ASK", "SEARCH_PAGES"];
const LIFT_FNS = ["escHtml", "norm", "squash", "toks", "tailEq", "within1", "foldText", "flexChar", "flexRe", "hayFor",
  "isSep", "scoreOne", "everyWord", "aside", "scoreAny", "akaOf", "scoreLesson", "scoreAka", "everyName", "scorePage", "mkQ", "variants", "synForm", "bodyRe",
  "idxFor", "bodyScore", "namePass", "askTerm", "snippetFor", "searchRank"];
const REQUIRED = ["norm", "squash", "flexChar", "flexRe", "searchRank"];

/* ---------- reading files, from the tree or from a commit ---------- */
function reader(rev) {
  if (!rev) return f => fs.readFileSync(path.join(ROOT, f), "utf8");
  return f => execFileSync("git", ["show", rev + ":" + f], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 << 20 });
}

/* ---------- lifting ---------- */
/* Brace and bracket matching that skips comments and string literals, so a
   "[" in a SEARCH_PAGES keyword or a "don't" in a comment can never end the
   match early. Regex literals are not parsed; every one in the search code
   has balanced brackets and no quote marks. */
function matchFrom(src, open) {
  const pair = { "{": "}", "[": "]" }, stack = [];
  for (let k = open; k < src.length; k++) {
    const ch = src[k];
    if (ch === "/" && src[k + 1] === "*") { k = src.indexOf("*/", k + 2) + 1; continue; }
    if (ch === "/" && src[k + 1] === "/") { k = src.indexOf("\n", k); continue; }
    if (ch === '"' || ch === "'") {
      for (k++; k < src.length && src[k] !== ch; k++) if (src[k] === "\\") k++;
      continue;
    }
    if (ch === "{" || ch === "[") stack.push(pair[ch]);
    else if (ch === "}" || ch === "]") {
      if (stack.pop() !== ch) throw new Error("unbalanced brackets at index " + k);
      if (!stack.length) return k;
    }
  }
  throw new Error("unbalanced brackets from index " + open);
}
function liftVar(src, name) {
  const m = new RegExp("\\bvar " + name + " = ").exec(src);
  if (!m) return null;
  const at = m.index + m[0].length;
  if (src[at] === "[" || src[at] === "{") return src.slice(m.index, matchFrom(src, at) + 1) + ";";
  const end = src.indexOf(";\n", at);
  return src.slice(m.index, end + 1);
}
function liftFn(src, name) {
  const i = src.indexOf("function " + name + "(");
  if (i < 0) return null;
  return src.slice(i, matchFrom(src, src.indexOf("{", i)) + 1);
}
function load(rev) {
  const read = reader(rev);
  const src = read("assets/js/site.js");
  const parts = [];
  for (const v of LIFT_VARS) { const s = liftVar(src, v); if (s) parts.push(s); }
  for (const f of LIFT_FNS) {
    const s = liftFn(src, f);
    if (!s && REQUIRED.includes(f)) throw new Error("site.js no longer defines " + f + "() — update this script");
    if (s) parts.push(s);
  }
  const sb = { window: {} };
  vm.createContext(sb);
  for (const f of ["assets/js/curriculum.js", "assets/js/glossary-data.js", "assets/js/search-index.js"]) {
    vm.runInContext(read(f), sb, { filename: f });
  }
  vm.runInContext(parts.join("\n"), sb, { filename: "site.js (lifted)" });
  sb.flat = sb.window.CURRICULUM_FLAT.filter(s => s.ready);
  return sb;
}

function idOf(it) { return it.page ? it.url : it.course + "/" + it.slug; }
function rank(sb, q) { return sb.searchRank(q, sb.flat); }

function score(sb) {
  const rows = QUERIES.map(row => {
    const all = rank(sb, row.q).list.map(idOf), ids = all.slice(0, 3);
    const top1 = ids[0] === row.first;
    const found = Math.min(3, all.filter(id => row.top3.includes(id)).length);
    const top3 = ids.includes(row.first) && ids.filter(id => row.top3.includes(id)).length === found;
    return { row, ids, top1, top3 };
  });
  const n = rows.length;
  return {
    rows,
    top1: rows.filter(r => r.top1).length / n,
    top3: rows.filter(r => r.top3).length / n
  };
}

/* ---------- table sanity: every id must be a real, ready page ---------- */
function tableFaults(sb) {
  const ids = new Set(sb.flat.map(s => s.course + "/" + s.slug));
  for (const p of sb.SEARCH_PAGES) ids.add(p.url);
  const out = [], seen = new Set();
  for (const r of QUERIES) {
    if (seen.has(r.q)) out.push("duplicate query " + JSON.stringify(r.q));
    seen.add(r.q);
    if (!r.top3.includes(r.first)) out.push(JSON.stringify(r.q) + ": first is not in top3");
    for (const id of r.top3) if (!ids.has(id)) out.push(JSON.stringify(r.q) + ": unknown page " + id);
  }
  return out;
}

/* ---------- aliases: each must be something its lesson teaches ---------- */
function aliasFaults(sb) {
  const out = [], idx = sb.window.SEARCH_INDEX;
  if (typeof sb.akaOf !== "function") return out;
  for (const s of sb.flat) {
    for (const a of sb.akaOf(s)) {
      const n = sb.norm(a);
      if (GUARDS.includes(n)) { out.push(s.course + "/" + s.slug + ': alias "' + a + '" is an English word search must leave alone'); continue; }
      const re = sb.bodyRe(sb.variants(n));
      if (!re) { out.push(s.course + "/" + s.slug + ': alias "' + a + '" is too short to search for (under three characters)'); continue; }
      re.lastIndex = 0;
      if (!re.test(sb.foldText(idx.lessons[s.slug] || ""))) out.push(s.course + "/" + s.slug + ': alias "' + a + '" never appears in the lesson\'s text');
    }
  }
  return out;
}
function guardFaults(sb) {
  if (typeof sb.variants !== "function") return [];
  return GUARDS.filter(w => sb.variants(w).length > 1).map(w => '"' + w + '" expands to ' + JSON.stringify(sb.variants(w)));
}

/* ---------- timing ---------- */
function timing(sb) {
  const qs = QUERIES.map(r => r.q);
  const strokes = [];
  for (const q of qs) for (let i = 1; i <= q.length; i++) strokes.push(q.slice(0, i));
  for (let i = 0; i < 3; i++) qs.forEach(q => rank(sb, q));     // warm the memo tables and the JIT
  function run(list, reps) {
    const per = [];
    for (const q of list) {
      const t0 = process.hrtime.bigint();
      for (let r = 0; r < reps; r++) rank(sb, q);
      per.push(Number(process.hrtime.bigint() - t0) / 1e6 / reps);
    }
    per.sort((a, b) => a - b);
    const mean = per.reduce((a, b) => a + b, 0) / per.length;
    return { mean, p95: per[Math.floor(per.length * 0.95)], max: per[per.length - 1], worst: list[per.indexOf(per[per.length - 1])] };
  }
  return { queries: run(qs, 20), strokes: run(strokes, 5), n: strokes.length };
}

function pct(x) { return (100 * x).toFixed(1) + "%"; }

function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes("--strict");
  const verbose = argv.includes("--verbose");
  const qi = argv.indexOf("--query"), only = qi >= 0 ? argv[qi + 1] : null;
  const ai = argv.indexOf("--against"), rev = ai >= 0 ? argv[ai + 1] : null;

  const sb = load(rev);
  const idx = sb.window.SEARCH_INDEX;
  if (!idx || !idx.lessons) { console.error("search-index.js did not load — run tools/build-search-index.py"); process.exit(2); }

  if (only) {
    const r = rank(sb, only);
    console.log("\n" + JSON.stringify(only) + (r.Q && r.Q.n !== sb.norm(only) ? "   (searched as " + JSON.stringify(r.Q.n) + ")" : ""));
    if (typeof sb.variants === "function") console.log("  variants: " + JSON.stringify(sb.variants(sb.norm(only))));
    r.list.slice(0, 10).forEach((it, i) => {
      const w = r.why && r.why[i];
      console.log("  " + String(i + 1).padStart(2) + ". " + idOf(it).padEnd(48) + (w ? (w.band ? "A" : "B") +
        "  name " + String(w.own).padStart(3) + "  kw " + String(w.kw).padStart(2) +
        "  heading " + String(w.head).padStart(2) + "  density " + w.dens.toFixed(1).padStart(4) : ""));
    });
    console.log("  (" + r.list.length + " results)\n");
    process.exit(0);
  }

  const faults = tableFaults(sb);
  if (faults.length) { console.error("the query table itself is wrong:\n  " + faults.join("\n  ")); process.exit(2); }

  const res = score(sb);
  console.log("");
  console.log("search relevance — " + QUERIES.length + " queries" + (rev ? " scored on " + rev : ""));
  console.log("");
  console.log("  top-1  " + pct(res.top1).padStart(6) + "   (" + res.rows.filter(r => r.top1).length + "/" + QUERIES.length + ")" + "   threshold " + pct(THRESHOLDS.top1));
  console.log("  top-3  " + pct(res.top3).padStart(6) + "   (" + res.rows.filter(r => r.top3).length + "/" + QUERIES.length + ")" + "   threshold " + pct(THRESHOLDS.top3));
  console.log("");

  const misses = res.rows.filter(r => !r.top1 || !r.top3);
  if (verbose) {
    res.rows.forEach(r => console.log("  " + (r.top1 ? "1" : "·") + (r.top3 ? "3" : "·") + "  " + r.row.q.padEnd(24) + r.ids.join(", ")));
    console.log("");
  } else if (misses.length) {
    console.log("  MISSES (" + misses.length + "):");
    misses.forEach(r => {
      console.log("   • " + JSON.stringify(r.row.q) + (r.top1 ? "  (first is right; the top 3 is not)" : r.top3 ? "  (the top 3 is fine; the first is not)" : ""));
      console.log("       want " + r.row.first + "   got " + (r.ids.join(", ") || "(nothing)"));
    });
    console.log("");
  } else {
    console.log("  every query puts the expected page first and an acceptable page in each of the first three.\n");
  }

  const af = rev ? [] : aliasFaults(sb), gf = rev ? [] : guardFaults(sb);
  if (af.length || gf.length) {
    console.log("  ALIAS / EQUIVALENCE FAULTS (" + (af.length + gf.length) + "):");
    af.concat(gf).forEach(f => console.log("   • " + f));
    console.log("");
  } else if (!rev && typeof sb.akaOf === "function") {
    const n = sb.flat.reduce((a, s) => a + sb.akaOf(s).length, 0);
    console.log("  " + n + " lesson aliases, each found in its own lesson's text; no guard word expands.\n");
  }

  if (argv.includes("--time")) {
    const t = timing(sb);
    console.log("  timing on the full index (" + (fs.statSync(path.join(ROOT, "assets/js/search-index.js")).size / 1024).toFixed(0) + " KB):");
    console.log("    whole queries   mean " + t.queries.mean.toFixed(2) + " ms   p95 " + t.queries.p95.toFixed(2) + " ms   max " + t.queries.max.toFixed(2) + " ms (" + JSON.stringify(t.queries.worst) + ")");
    console.log("    " + t.n + " keystrokes  mean " + t.strokes.mean.toFixed(2) + " ms   p95 " + t.strokes.p95.toFixed(2) + " ms   max " + t.strokes.max.toFixed(2) + " ms (" + JSON.stringify(t.strokes.worst) + ")");
    console.log("");
  }

  if (strict) {
    const low = res.top1 < THRESHOLDS.top1 || res.top3 < THRESHOLDS.top3;
    if (low) console.log("  --strict: below threshold.");
    if (af.length || gf.length) console.log("  --strict: alias or equivalence faults.");
    process.exit(low || af.length || gf.length ? 1 : 0);
  }
}

main();
