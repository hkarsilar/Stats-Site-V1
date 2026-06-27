/* ============================================================
   Single source of truth for the whole course.
   Add/rename sections here — the homepage index, every lesson
   sidebar, and the prev/next links all read from this file.
   `ready: true` means the lesson has real content (gets a link);
   anything else shows as "coming soon" and is non-clickable.
   ============================================================ */
window.CURRICULUM = [
  {
    slug: "stats-1",
    title: "Stats 1",
    subtitle: "Foundations",
    accent: "var(--primary)",
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
    sections: [
      { n: "3.1",  slug: "multiple-regression",                     title: "Multiple Regression" },
      { n: "3.2",  slug: "multicollinearity-and-variable-selection",title: "Multicollinearity & Variable Selection" },
      { n: "3.3",  slug: "categorical-predictors-and-dummy-coding", title: "Categorical Predictors & Dummy Coding" },
      { n: "3.4",  slug: "interactions-in-regression",              title: "Interactions in Regression" },
      { n: "3.5",  slug: "mediation-and-indirect-effects",          title: "Mediation & Indirect Effects" },
      { n: "3.6",  slug: "logistic-regression",                     title: "Logistic Regression" },
      { n: "3.7",  slug: "assumptions-of-regression",               title: "Assumptions of Regression" },
      { n: "3.8",  slug: "model-comparison",                        title: "Model Comparison" },
      { n: "3.9",  slug: "factor-analysis-pca",                     title: "Factor Analysis / PCA" },
      { n: "3.10", slug: "power-analysis-for-complex-designs",      title: "Power Analysis for Complex Designs" }
    ]
  }
];

/* Flat ordered list — used for prev/next across course boundaries. */
window.CURRICULUM_FLAT = window.CURRICULUM.flatMap(function (c) {
  return c.sections.map(function (s) {
    return { course: c.slug, courseTitle: c.title, n: s.n, slug: s.slug, title: s.title, ready: !!s.ready };
  });
});
