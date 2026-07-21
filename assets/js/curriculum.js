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
    desc: "The analysis itself — from describing your first dataset to Bayesian and multilevel models, and on into machine learning." },
  { id: "toolkit", title: "The Research Toolkit",
    desc: "Everything around the analysis — designing studies, wrangling data, writing it all up, and doing it ethically." }
];

window.CURRICULUM = [
  {
    slug: "stats-1",
    title: "Stats 1",
    subtitle: "Foundations",
    accent: "var(--primary)",
    track: "core",
    sections: [
      { n: "1.1",  slug: "what-is-statistics",                 title: "What Is Statistics?", ready: true },
      { n: "1.2",  slug: "types-of-data",                       title: "Types of Data", ready: true },
      { n: "1.3",  slug: "describing-data",                     title: "Describing Data", ready: true },
      { n: "1.4",  slug: "visualizing-data",                    title: "Visualizing Data", ready: true },
      { n: "1.5",  slug: "z-scores-and-the-normal-distribution",title: "Z-Scores & The Normal Distribution", ready: true },
      { n: "1.6",  slug: "probability-basics",                  title: "Probability Basics", ready: true },
      { n: "1.7",  slug: "sampling-distributions",              title: "Sampling Distributions", ready: true },
      { n: "1.8",  slug: "central-limit-theorem",               title: "Central Limit Theorem", ready: true },
      { n: "1.9",  slug: "confidence-intervals",                title: "Confidence Intervals", ready: true },
      { n: "1.10", slug: "hypothesis-testing-logic",            title: "Hypothesis Testing Logic", ready: true },
      { n: "1.11", slug: "one-sample-and-paired-t-tests",       title: "One-Sample & Paired t-Tests", ready: true },
      { n: "1.12", slug: "independent-samples-t-test",          title: "Independent Samples t-Test", ready: true },
      { n: "1.13", slug: "effect-size-and-power",               title: "Effect Size & Power", ready: true }
    ]
  },
  {
    slug: "stats-2",
    title: "Stats 2",
    subtitle: "Comparing Groups & Relationships",
    accent: "var(--secondary)",
    track: "core",
    sections: [
      { n: "2.1",  slug: "one-way-anova",                  title: "One-Way ANOVA", ready: true },
      { n: "2.2",  slug: "post-hoc-tests",                 title: "Post-Hoc Tests", ready: true },
      { n: "2.3",  slug: "factorial-anova-two-way",        title: "Factorial ANOVA (Two-Way)", ready: true },
      { n: "2.4",  slug: "repeated-measures-anova",        title: "Repeated Measures ANOVA", ready: true },
      { n: "2.5",  slug: "assumptions-and-when-they-break",title: "Assumptions & When They Break", ready: true },
      { n: "2.6",  slug: "non-parametric-alternatives",    title: "Non-Parametric Alternatives", ready: true },
      { n: "2.7",  slug: "chi-square-tests",               title: "Chi-Square Tests", ready: true },
      { n: "2.8",  slug: "correlation",                    title: "Correlation", ready: true },
      { n: "2.9",  slug: "simple-linear-regression",       title: "Simple Linear Regression", ready: true },
      { n: "2.10", slug: "regression-diagnostics",         title: "Regression Diagnostics", ready: true }
    ]
  },
  {
    slug: "stats-3",
    title: "Stats 3",
    subtitle: "Advanced Modeling",
    accent: "var(--success)",
    track: "core",
    sections: [
      { n: "3.1",  slug: "multiple-regression",                     title: "Multiple Regression", ready: true },
      { n: "3.2",  slug: "multicollinearity-and-variable-selection",title: "Multicollinearity & Variable Selection", ready: true },
      { n: "3.3",  slug: "categorical-predictors-and-dummy-coding", title: "Categorical Predictors & Dummy Coding", ready: true },
      { n: "3.4",  slug: "ancova",                                  title: "ANCOVA: Controlling for Covariates", ready: true },
      { n: "3.5",  slug: "interactions-in-regression",              title: "Interactions in Regression", ready: true },
      { n: "3.6",  slug: "mediation-and-indirect-effects",          title: "Mediation & Indirect Effects", ready: true },
      { n: "3.7",  slug: "logistic-regression",                     title: "Logistic Regression", ready: true },
      { n: "3.8",  slug: "assumptions-of-regression",               title: "Assumptions of Regression", ready: true },
      { n: "3.9",  slug: "model-comparison",                        title: "Model Comparison", ready: true },
      { n: "3.10", slug: "factor-analysis-pca",                     title: "Factor Analysis / PCA", ready: true },
      { n: "3.11", slug: "manova",                                  title: "MANOVA & Multivariate Tests", ready: true },
      { n: "3.12", slug: "power-analysis-for-complex-designs",      title: "Power Analysis for Complex Designs", ready: true }
    ]
  },
  {
    slug: "stats-4",
    title: "Stats 4",
    subtitle: "Modern & Advanced",
    accent: "#3b82f6",
    track: "core",
    sections: [
      { n: "4.1", slug: "bootstrap-and-resampling",        title: "Bootstrap & Resampling", ready: true },
      { n: "4.2", slug: "bayesian-thinking",               title: "Bayesian Thinking", ready: true },
      { n: "4.3", slug: "bayesian-estimation",             title: "Bayesian Estimation & Credible Intervals", ready: true },
      { n: "4.4", slug: "generalized-linear-models",       title: "Generalized Linear Models", ready: true },
      { n: "4.5", slug: "mixed-and-multilevel-models",     title: "Mixed & Multilevel Models (GLMMs)", ready: true },
      { n: "4.6", slug: "cross-validation-and-overfitting",title: "Cross-Validation & Overfitting", ready: true },
      { n: "4.7", slug: "causal-dags-and-confounding",     title: "Causal DAGs & Confounding", ready: true },
      { n: "4.8", slug: "survival-analysis",               title: "Survival Analysis & Kaplan–Meier", ready: true },
      { n: "4.9", slug: "missing-data",                    title: "Missing Data & Imputation", ready: true },
      { n: "4.10",slug: "meta-analysis",                   title: "Meta-Analysis & Forest Plots", ready: true },
      { n: "4.11",slug: "psychometric-functions",          title: "Psychometric Functions & the PSE", ready: true },
      { n: "4.12",slug: "signal-detection-theory",         title: "Signal Detection Theory", ready: true }
    ]
  },
  {
    slug: "ml",
    title: "ML & AI",
    subtitle: "Machine Learning for Researchers",
    accent: "#a855f7",
    track: "core",
    sections: [
      { n: "5.1", slug: "prediction-vs-explanation",           title: "Prediction vs Explanation", ready: true },
      { n: "5.2", slug: "train-test-split-and-generalization", title: "Train/Test Splits & Generalization", ready: true },
      { n: "5.3", slug: "regularization-ridge-and-lasso",       title: "Regularization: Ridge & Lasso", ready: true },
      { n: "5.4", slug: "classification-metrics",              title: "Classification Metrics & the Accuracy Trap", ready: true },
      { n: "5.5", slug: "roc-curves-and-auc",                  title: "ROC Curves & AUC", ready: true },
      { n: "5.6", slug: "decision-trees",                      title: "Decision Trees", ready: true },
      { n: "5.7", slug: "random-forests-and-ensembles",       title: "Random Forests & Ensembles", ready: true },
      { n: "5.8", slug: "knn-and-distance",                   title: "k-NN & Why Distance Gets Weird", ready: true },
      { n: "5.9", slug: "clustering-kmeans",                  title: "Clustering & k-Means", ready: true },
      { n: "5.10",slug: "dimensionality-reduction",           title: "Dimensionality Reduction", ready: true },
      { n: "5.11",slug: "neural-networks-intuition",          title: "Neural Networks: The Intuition", ready: true },
      { n: "5.12",slug: "llms-and-ai-in-research",            title: "LLMs & AI in Your Research Workflow", ready: true }
    ]
  },
  {
    slug: "methods",
    title: "Methods",
    subtitle: "Research Design",
    accent: "#f59e0b",
    track: "toolkit",
    sections: [
      { n: "1.1",  slug: "from-question-to-hypothesis",      title: "From Question to Hypothesis", ready: true },
      { n: "1.2",  slug: "variables-and-operationalization", title: "Variables & Operationalization", ready: true },
      { n: "1.3",  slug: "reliability-and-validity",         title: "Reliability & Validity", ready: true },
      { n: "1.4",  slug: "experimental-design-and-randomization", title: "Experiments & Random Assignment", ready: true },
      { n: "1.5",  slug: "between-vs-within-designs",        title: "Between vs Within Designs", ready: true },
      { n: "1.6",  slug: "quasi-experiments",               title: "Quasi-Experiments & Natural Experiments", ready: true },
      { n: "1.7",  slug: "observational-designs",           title: "Observational Designs", ready: true },
      { n: "1.8",  slug: "sampling-methods",                title: "Sampling Methods", ready: true },
      { n: "1.9",  slug: "survey-and-questionnaire-design", title: "Designing Surveys & Questionnaires", ready: true },
      { n: "1.10", slug: "bias-and-blinding",                title: "Bias, Blinding & Demand Characteristics", ready: true },
      { n: "1.11", slug: "the-replication-crisis",           title: "The Replication Crisis", ready: true },
      { n: "1.12", slug: "preregistration-and-open-science", title: "Preregistration & Open Science", ready: true }
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
      { n: "2.2",  slug: "codebooks-and-documentation",  title: "Codebooks & Documentation", ready: true },
      { n: "2.3",  slug: "data-entry-and-validation",    title: "Data Entry & Validation", ready: true },
      { n: "2.4",  slug: "data-cleaning-workflow",       title: "The Cleaning Workflow", ready: true },
      { n: "2.5",  slug: "outliers-in-practice",         title: "Outliers: Detect, Investigate, Decide", ready: true },
      { n: "2.6",  slug: "transformations-and-recoding", title: "Transformations & Recoding", ready: true },
      { n: "2.7",  slug: "wide-vs-long-data",            title: "Wide vs Long Data", ready: true },
      { n: "2.8",  slug: "merging-datasets",             title: "Merging Datasets", ready: true },
      { n: "2.9",  slug: "reproducible-workflows",       title: "Reproducible Workflows", ready: true },
      { n: "2.10", slug: "data-privacy-basics",          title: "Data Privacy Basics", ready: true }
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
      { n: "3.2", slug: "reporting-statistics-apa",   title: "Reporting Statistics in APA Style", ready: true },
      { n: "3.3", slug: "tables-and-figures",         title: "Tables & Figures That Don't Lie", ready: true },
      { n: "3.4", slug: "writing-results",            title: "From Output to Results Section", ready: true },
      { n: "3.5", slug: "nonsignificant-results",     title: "Writing About Non-Significant Results", ready: true },
      { n: "3.6", slug: "discussion-and-limitations", title: "Discussion & Limitations", ready: true },
      { n: "3.7", slug: "abstracts-and-titles",       title: "Abstracts & Titles", ready: true },
      { n: "3.8", slug: "final-checklist",            title: "The Final Checklist", ready: true }
    ]
  },
  {
    slug: "ethics",
    title: "Ethics",
    subtitle: "Responsible Research",
    accent: "#64748b",
    track: "toolkit",
    sections: [
      { n: "4.1", slug: "why-research-ethics",          title: "Why Research Ethics Exists", ready: true },
      { n: "4.2", slug: "informed-consent-and-irb",     title: "Informed Consent & Ethics Committees", ready: true },
      { n: "4.3", slug: "deception-and-debriefing",     title: "Deception & Debriefing", ready: true },
      { n: "4.4", slug: "privacy-and-confidentiality",  title: "Privacy & Confidentiality", ready: true },
      { n: "4.5", slug: "questionable-research-practices", title: "Questionable Research Practices", ready: true },
      { n: "4.6", slug: "plagiarism-authorship-and-citation", title: "Plagiarism, Authorship & Citation", ready: true },
      { n: "4.7", slug: "ai-in-research-ethics",           title: "Using AI Tools Ethically", ready: true },
      { n: "4.8", slug: "fraud-and-self-correction",       title: "Fraud & How Science Self-Corrects", ready: true }
    ]
  }
];

/* Flat ordered list — used for prev/next across course boundaries.
   `track` is appended (additive — existing consumers ignore it). */
window.CURRICULUM_FLAT = window.CURRICULUM.flatMap(function (c) {
  return c.sections.map(function (s) {
    return { course: c.slug, courseTitle: c.title, track: c.track || "core", n: s.n, slug: s.slug, title: s.title, ready: !!s.ready };
  });
});
