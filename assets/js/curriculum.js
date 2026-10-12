/* ============================================================
   Single source of truth for the whole course.
   Add/rename sections here — the homepage index, every lesson
   sidebar, and the prev/next links all read from this file.
   `ready: true` means the lesson has real content (gets a link);
   anything else shows as "coming soon" and is non-clickable.

   Each course carries a `track` (see TRACKS below). With a single
   populated track the homepage renders one flat grid exactly as
   before; add courses in a second track and the grid grows track
   headings automatically. Default track is the first one ("core").
   ============================================================ */

/* Ordered list of curriculum tracks. The homepage groups the course
   cards by track (in this order) and shows a heading above each group
   only when more than one track actually has courses; `desc` renders
   as a one-liner under the heading. */
window.TRACKS = [
  { id: "core",    title: "The Statistics Core",
    desc: "The analysis itself, from describing your first dataset to Bayesian and multilevel models and on to machine learning." },
  { id: "toolkit", title: "The Research Toolkit",
    desc: "Everything around the analysis: designing studies, preparing data, writing it up, and doing it all ethically." }
];

window.CURRICULUM = [
  {
    slug: "stats-1",
    title: "Stats 1",
    subtitle: "Introduction to Statistics",
    accent: "var(--primary)",
    track: "core",
    sections: [
      { n: "1.1",  slug: "what-is-statistics",                  title: "What Is Statistics?", ready: true,
        aka: "descriptive statistics, inferential statistics, parameter, population" },
      { n: "1.2",  slug: "types-of-data",                       title: "Types of Data", ready: true,
        aka: "nominal, ordinal, categorical, quantitative" },
      { n: "1.3",  slug: "describing-data",                     title: "Describing Data", ready: true,
        aka: "mean, median, mode, standard deviation, variance, IQR, five-number summary" },
      { n: "1.4",  slug: "visualizing-data",                    title: "Visualizing Data", ready: true,
        aka: "histogram, boxplot, bar chart, pie chart" },
      { n: "1.5",  slug: "z-scores-and-the-normal-distribution", title: "Z-Scores & The Normal Distribution", ready: true,
        aka: "normal curve, percentile" },
      { n: "1.6",  slug: "producing-data-and-sampling-design",  title: "Producing Data & Sampling Design", ready: true,
        aka: "observational study, simple random sample, response bias, undercoverage" },
      { n: "1.7",  slug: "probability-basics",                  title: "Probability Basics", ready: true,
        aka: "Bayes' rule, conditional probability, addition rule, multiplication rule" },
      { n: "1.8",  slug: "binomial-distribution",               title: "The Binomial Distribution", ready: true,
        aka: "binomial coefficient, n choose k" },
      { n: "1.9",  slug: "sampling-distributions",              title: "Sampling Distributions", ready: true,
        aka: "standard error, unbiased estimator" },
      { n: "1.10", slug: "central-limit-theorem",               title: "Central Limit Theorem", ready: true,
        aka: "CLT" },
      { n: "1.11", slug: "confidence-intervals",                title: "Confidence Intervals", ready: true,
        aka: "margin of error, confidence level, z-interval" },
      { n: "1.12", slug: "hypothesis-testing-logic",            title: "Hypothesis Testing Logic", ready: true,
        aka: "p-value, null hypothesis, significance level, statistical significance, type I error, type II error, one-tailed" },
      { n: "1.13", slug: "one-sample-and-paired-t-tests",       title: "One-Sample & Paired t-Tests", ready: true,
        aka: "t-test, one-sample t-test, paired t-test, t distribution, degrees of freedom" },
      { n: "1.14", slug: "independent-samples-t-test",          title: "Independent Samples t-Test", ready: true,
        aka: "Welch's t-test, Student's t-test" },
      { n: "1.15", slug: "inference-for-proportions",           title: "Inference for Proportions", ready: true,
        aka: "one-proportion, two-proportion z test, sample proportion" },
      { n: "1.16", slug: "chi-square-tests",                    title: "Chi-Square Tests", ready: true,
        aka: "goodness of fit, test of independence, contingency table, Cramér's V, McNemar's test" },
      { n: "1.17", slug: "correlation",                         title: "Correlation", ready: true,
        aka: "Pearson's r, correlation coefficient" },
      { n: "1.18", slug: "simple-linear-regression",            title: "Simple Linear Regression", ready: true,
        aka: "regression, linear regression, least squares, regression line, residual plot, R²" }
    ]
  },
  {
    slug: "stats-2",
    title: "Stats 2",
    subtitle: "ANOVA & Regression",
    accent: "var(--secondary)",
    track: "core",
    sections: [
      { n: "2.1",  slug: "non-parametric-alternatives",              title: "Non-Parametric Alternatives", ready: true,
        aka: "Mann-Whitney U, Wilcoxon signed-rank, Kruskal-Wallis, Friedman, Spearman, rank-biserial" },
      { n: "2.2",  slug: "one-way-anova",                            title: "One-Way ANOVA", ready: true,
        aka: "ANOVA, F test, F-ratio, analysis of variance" },
      { n: "2.3",  slug: "post-hoc-tests",                           title: "Post-Hoc Tests", ready: true,
        aka: "Tukey's HSD, Bonferroni, multiple comparisons, planned contrast" },
      { n: "2.4",  slug: "factorial-anova-two-way",                  title: "Factorial ANOVA (Two-Way)", ready: true,
        aka: "two-way ANOVA, factorial design, main effect, simple main effect, moderation" },
      { n: "2.5",  slug: "repeated-measures-anova",                  title: "Repeated Measures ANOVA", ready: true,
        aka: "sphericity, Greenhouse-Geisser, mixed design" },
      { n: "2.6",  slug: "assumptions-and-when-they-break",          title: "ANOVA & t-Test Assumptions", ready: true,
        aka: "normality, homogeneity of variance, Q-Q plot" },
      { n: "2.7",  slug: "inference-for-regression",                 title: "Inference for Regression", ready: true,
        aka: "prediction interval, confidence band" },
      { n: "2.8",  slug: "regression-diagnostics",                   title: "Regression Diagnostics", ready: true,
        aka: "residuals, heteroscedasticity" },
      { n: "2.9",  slug: "multiple-regression",                      title: "Multiple Regression", ready: true,
        aka: "omitted-variable bias, controlling for, Simpson's paradox" },
      { n: "2.10", slug: "categorical-predictors-and-dummy-coding",  title: "Categorical Predictors & Dummy Coding", ready: true,
        aka: "dummy variable, reference group, effect coding" },
      { n: "2.11", slug: "interactions-in-regression",               title: "Interactions in Regression", ready: true,
        aka: "interaction term, simple slopes" },
      { n: "2.12", slug: "multicollinearity-and-variable-selection", title: "Multicollinearity & Variable Selection", ready: true,
        aka: "VIF, variance inflation factor, collinearity, stepwise" },
      { n: "2.13", slug: "assumptions-of-regression",                title: "Assumptions of Regression", ready: true,
        aka: "Cook's distance, leverage, influential, LINE assumptions" },
      { n: "2.14", slug: "model-comparison",                         title: "Model Comparison", ready: true,
        aka: "AIC, BIC, nested model, adjusted R²" },
      { n: "2.15", slug: "ancova",                                   title: "ANCOVA: Controlling for Covariates", ready: true,
        aka: "covariate, adjusted means, analysis of covariance" },
      { n: "2.16", slug: "logistic-regression",                      title: "Logistic Regression", ready: true,
        aka: "odds ratio, log-odds, binary outcome" },
      { n: "2.17", slug: "nonlinear-relationships-and-transformations", title: "Non-Linear Relationships & Transformations", ready: true,
        aka: "curvature, polynomial" }
    ]
  },
  {
    slug: "stats-3",
    title: "Stats 3",
    subtitle: "Advanced & Elective Topics",
    accent: "var(--success)",
    track: "core",
    sections: [
      { n: "3.1",  slug: "effect-size-and-power",              title: "Effect Size & Power", ready: true,
        aka: "power, Cohen's d" },
      { n: "3.2",  slug: "power-analysis-for-complex-designs", title: "Power Analysis for Complex Designs", ready: true,
        aka: "pilot study" },
      { n: "3.3",  slug: "mediation-and-indirect-effects",     title: "Mediation & Indirect Effects", ready: true,
        aka: "indirect effect, mediator, Sobel test, Baron and Kenny" },
      { n: "3.4",  slug: "manova",                             title: "MANOVA & Multivariate Tests", ready: true,
        aka: "Wilks' lambda, Pillai's trace, MANCOVA" },
      { n: "3.5",  slug: "factor-analysis-pca",                title: "Factor Analysis / PCA", ready: true,
        aka: "principal component analysis, factor loading, eigenvalue, scree plot, varimax" },
      { n: "3.6",  slug: "bootstrap-and-resampling",           title: "Bootstrap & Resampling", ready: true,
        aka: "permutation test" },
      { n: "3.7",  slug: "bayesian-thinking",                  title: "Bayesian Thinking", ready: true,
        aka: "Bayesian, prior, likelihood, conjugate prior" },
      { n: "3.8",  slug: "bayesian-estimation",                title: "Bayesian Estimation & Credible Intervals", ready: true,
        aka: "credible interval, posterior distribution, highest density interval" },
      { n: "3.9",  slug: "generalized-linear-models",          title: "Generalized Linear Models", ready: true,
        aka: "GLM, Poisson regression, link function, overdispersion, negative binomial" },
      { n: "3.10", slug: "mixed-and-multilevel-models",        title: "Mixed & Multilevel Models (GLMMs)", ready: true,
        aka: "random effects, intraclass correlation, ICC" },
      { n: "3.11", slug: "cross-validation-and-overfitting",   title: "Cross-Validation & Overfitting", ready: true,
        aka: "k-fold, validation set, bias-variance" },
      { n: "3.12", slug: "causal-dags-and-confounding",        title: "Causal DAGs & Confounding", ready: true,
        aka: "DAG, directed acyclic graph, confounder, collider, backdoor" },
      { n: "3.13", slug: "instrumental-variables",             title: "Instrumental Variables & 2SLS", ready: true,
        aka: "instrument, exclusion restriction, weak instrument" },
      { n: "3.14", slug: "regression-discontinuity",           title: "Regression Discontinuity Design", ready: true,
        aka: "running variable, bandwidth" },
      { n: "3.15", slug: "difference-in-differences",          title: "Difference-in-Differences", ready: true,
        aka: "parallel trends, event study, two-way fixed effects" },
      { n: "3.16", slug: "survival-analysis",                  title: "Survival Analysis & Kaplan–Meier", ready: true,
        aka: "Kaplan-Meier, hazard ratio, Cox, log-rank test, censoring" },
      { n: "3.17", slug: "missing-data",                       title: "Missing Data & Imputation", ready: true,
        aka: "multiple imputation, MCAR, MAR, MNAR, listwise deletion" },
      { n: "3.18", slug: "meta-analysis",                      title: "Meta-Analysis & Forest Plots", ready: true,
        aka: "forest plot, funnel plot, heterogeneity" },
      { n: "3.19", slug: "psychometric-functions",             title: "Psychometric Functions & the PSE", ready: true,
        aka: "PSE, JND, point of subjective equality, just-noticeable difference, psychophysics" },
      { n: "3.20", slug: "signal-detection-theory",            title: "Signal Detection Theory", ready: true,
        aka: "d-prime, hit rate, false alarm" }
    ]
  },
  {
    slug: "ml",
    title: "ML & AI",
    subtitle: "Machine Learning for Researchers",
    accent: "#a855f7",
    track: "core",
    sections: [
      { n: "5.1", slug: "prediction-vs-explanation",           title: "Prediction vs Explanation", ready: true,
        aka: "two cultures" },
      { n: "5.2", slug: "train-test-split-and-generalization", title: "Train/Test Splits & Generalization", ready: true,
        aka: "data leakage, test set" },
      { n: "5.3", slug: "regularization-ridge-and-lasso",       title: "Regularization: Ridge & Lasso", ready: true,
        aka: "elastic net, shrinkage" },
      { n: "5.4", slug: "classification-metrics",              title: "Classification Metrics & the Accuracy Trap", ready: true,
        aka: "confusion matrix, precision, recall, sensitivity, specificity" },
      { n: "5.5", slug: "roc-curves-and-auc",                  title: "ROC Curves & AUC", ready: true,
        aka: "area under the curve" },
      { n: "5.6", slug: "decision-trees",                      title: "Decision Trees", ready: true,
        aka: "Gini, pruning, regression tree" },
      { n: "5.7", slug: "random-forests-and-ensembles",       title: "Random Forests & Ensembles", ready: true,
        aka: "bagging, boosting, XGBoost, variable importance" },
      { n: "5.8", slug: "knn-and-distance",                   title: "k-NN & Why Distance Gets Weird", ready: true,
        aka: "k-nearest neighbors, curse of dimensionality" },
      { n: "5.9", slug: "clustering-kmeans",                  title: "Clustering & k-Means", ready: true,
        aka: "elbow method, hierarchical clustering" },
      { n: "5.10",slug: "dimensionality-reduction",           title: "Dimensionality Reduction", ready: true,
        aka: "t-SNE, UMAP" },
      { n: "5.11",slug: "neural-networks-intuition",          title: "Neural Networks: The Intuition", ready: true,
        aka: "deep learning, gradient descent, backpropagation, learning rate" },
      { n: "5.12",slug: "llms-and-ai-in-research",            title: "LLMs & AI in Your Research Workflow", ready: true,
        aka: "ChatGPT, large language model, LLM" }
    ]
  },
  {
    slug: "methods",
    title: "Methods",
    subtitle: "Research Design",
    accent: "#f59e0b",
    track: "toolkit",
    sections: [
      { n: "1.1",  slug: "from-question-to-hypothesis",      title: "From Question to Hypothesis", ready: true,
        aka: "research question, falsifiability" },
      { n: "1.2",  slug: "variables-and-operationalization", title: "Variables & Operationalization", ready: true,
        aka: "independent variable, dependent variable, operational definition, construct" },
      { n: "1.3",  slug: "reliability-and-validity",         title: "Reliability & Validity", ready: true,
        aka: "Cronbach's alpha, test-retest, inter-rater, Cohen's kappa" },
      { n: "1.4",  slug: "experimental-design-and-randomization", title: "Experiments & Random Assignment", ready: true,
        aka: "control group, placebo, randomized controlled trial" },
      { n: "1.5",  slug: "between-vs-within-designs",        title: "Between vs Within Designs", ready: true,
        aka: "within-subjects, between-subjects, counterbalancing, carryover" },
      { n: "1.6",  slug: "quasi-experiments",               title: "Quasi-Experiments & Natural Experiments", ready: true,
        aka: "natural experiment, interrupted time series" },
      { n: "1.7",  slug: "observational-designs",           title: "Observational Designs", ready: true,
        aka: "cohort study, case-control, cross-sectional, ecological fallacy, survivorship bias" },
      { n: "1.8",  slug: "sampling-methods",                title: "Sampling Methods", ready: true,
        aka: "stratified sampling, cluster sampling, convenience sampling, snowball, sampling frame" },
      { n: "1.9",  slug: "survey-and-questionnaire-design", title: "Designing Surveys & Questionnaires", ready: true,
        aka: "questionnaire, Likert, double-barreled, leading question" },
      { n: "1.10", slug: "bias-and-blinding",                title: "Bias, Blinding & Demand Characteristics", ready: true,
        aka: "double-blind, placebo effect, demand characteristics, selection bias" },
      { n: "1.11", slug: "the-replication-crisis",           title: "The Replication Crisis", ready: true,
        aka: "p-hacking, HARKing, publication bias, garden of forking paths" },
      { n: "1.12", slug: "preregistration-and-open-science", title: "Preregistration & Open Science", ready: true,
        aka: "registered report, OSF" }
    ]
  },
  {
    slug: "data",
    title: "Data",
    subtitle: "From Raw to Ready",
    accent: "#06b6d4",
    track: "toolkit",
    sections: [
      { n: "2.1",  slug: "tidy-data",                    title: "Tidy Data", ready: true },
      { n: "2.2",  slug: "codebooks-and-documentation",  title: "Codebooks & Documentation", ready: true,
        aka: "variable name" },
      { n: "2.3",  slug: "data-entry-and-validation",    title: "Data Entry & Validation", ready: true,
        aka: "range check, double data entry" },
      { n: "2.4",  slug: "data-cleaning-workflow",       title: "The Cleaning Workflow", ready: true,
        aka: "duplicates, cleaning log" },
      { n: "2.5",  slug: "outliers-in-practice",         title: "Outliers: Detect, Investigate, Decide", ready: true,
        aka: "sensitivity analysis" },
      { n: "2.6",  slug: "transformations-and-recoding", title: "Transformations & Recoding", ready: true,
        aka: "log-transform, reverse coding, median split, composite score" },
      { n: "2.7",  slug: "wide-vs-long-data",            title: "Wide vs Long Data", ready: true,
        aka: "pivot, reshape, long format, wide format, wide to long" },
      { n: "2.8",  slug: "merging-datasets",             title: "Merging Datasets", ready: true,
        aka: "merge, join, left join, inner join" },
      { n: "2.9",  slug: "reproducible-workflows",       title: "Reproducible Workflows", ready: true,
        aka: "reproducibility, version control" },
      { n: "2.10", slug: "data-privacy-basics",          title: "Data Privacy Basics", ready: true,
        aka: "anonymized, k-anonymity" }
    ]
  },
  {
    slug: "writing",
    title: "Writing",
    subtitle: "Reporting Your Research",
    accent: "#84cc16",
    track: "toolkit",
    sections: [
      { n: "3.1", slug: "imrad-structure",           title: "The IMRaD Structure", ready: true },
      { n: "3.2", slug: "reporting-statistics-apa",   title: "Reporting Statistics in APA Style", ready: true,
        aka: "APA format, APA 7" },
      { n: "3.3", slug: "tables-and-figures",         title: "Tables & Figures That Don't Lie", ready: true,
        aka: "error bars, truncated axis, chartjunk, APA table" },
      { n: "3.4", slug: "writing-results",            title: "From Output to Results Section", ready: true,
        aka: "results section, results sentence" },
      { n: "3.5", slug: "nonsignificant-results",     title: "Writing About Non-Significant Results", ready: true,
        aka: "null result, equivalence test, TOST, marginally significant" },
      { n: "3.6", slug: "discussion-and-limitations", title: "Discussion & Limitations", ready: true,
        aka: "limitations" },
      { n: "3.7", slug: "abstracts-and-titles",       title: "Abstracts & Titles", ready: true },
      { n: "3.8", slug: "final-checklist",            title: "The Final Checklist", ready: true,
        aka: "statcheck" }
    ]
  },
  {
    slug: "ethics",
    title: "Ethics",
    subtitle: "Responsible Research",
    accent: "#64748b",
    track: "toolkit",
    sections: [
      { n: "4.1", slug: "why-research-ethics",          title: "Why Research Ethics Exists", ready: true,
        aka: "Belmont Report, Tuskegee, Milgram, Nuremberg Code, Declaration of Helsinki" },
      { n: "4.2", slug: "informed-consent-and-irb",     title: "Informed Consent & Ethics Committees", ready: true,
        aka: "IRB, ethics committee, ethics approval, assent" },
      { n: "4.3", slug: "deception-and-debriefing",     title: "Deception & Debriefing", ready: true,
        aka: "debriefing, cover story" },
      { n: "4.4", slug: "privacy-and-confidentiality",  title: "Privacy & Confidentiality", ready: true,
        aka: "GDPR, data protection" },
      { n: "4.5", slug: "questionable-research-practices", title: "Questionable Research Practices", ready: true,
        aka: "QRP, optional stopping, peeking" },
      { n: "4.6", slug: "plagiarism-authorship-and-citation", title: "Plagiarism, Authorship & Citation", ready: true,
        aka: "authorship, self-plagiarism, citation, paraphrasing" },
      { n: "4.7", slug: "ai-in-research-ethics",           title: "Using AI Tools Ethically", ready: true,
        aka: "hallucination" },
      { n: "4.8", slug: "fraud-and-self-correction",       title: "Fraud & How Science Self-Corrects", ready: true,
        aka: "fabrication, falsification, retraction, GRIM test, Stapel" }
    ]
  }
];

/* Flat ordered list — used for prev/next across course boundaries.
   `track` is appended (additive — existing consumers ignore it). */
window.CURRICULUM_FLAT = window.CURRICULUM.flatMap(function (c) {
  return c.sections.map(function (s) {
    return { course: c.slug, courseTitle: c.title, track: c.track || "core", n: s.n, slug: s.slug, title: s.title, ready: !!s.ready, aka: s.aka || "" };
  });
});
