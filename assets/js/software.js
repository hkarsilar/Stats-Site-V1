/* ============================================================
   Per-lesson "Run it in SPSS / JASP" walkthroughs and
   "Write it up (APA 7)" examples, keyed by lesson slug.
   Loaded lazily by site.js on lesson pages only; injected below
   the "Try it yourself" R/Python block.

   Format per slug:
     spss: [step, …]   first step is the menu path (may contain <strong>/<em>)
     jasp: [step, …]
     apa:  '<p>…</p>'  a worked example results paragraph (uses <em> for
                       italics exactly as APA 7 requires)
     tips: [note, …]   short "what goes where / what's italicized" reminders
   ============================================================ */
window.SOFTWARE = {

  /* ---------------- Stats 1 ---------------- */
  "one-sample-and-paired-t-tests": {
    spss: [
      '<strong>Analyze → Compare Means → One-Sample T Test…</strong> (or <strong>Paired-Samples T Test…</strong>). In SPSS 29+ the submenu is called <em>Compare Means and Proportions</em> — same procedures inside.',
      'One-sample: move your variable into <em>Test Variable(s)</em> and type the comparison value into <em>Test Value</em>.',
      'Paired: click the two variables (e.g. <em>before</em>, <em>after</em>) so they appear as one pair.',
      'In current SPSS versions, tick <em>Estimate effect sizes</em> to get Cohen’s d in the output.',
      'Read the <em>Sig. (2-tailed)</em> column for p, and the <em>95% Confidence Interval of the Difference</em> for the CI.'
    ],
    jasp: [
      '<strong>T-Tests → One Sample T-Test</strong> (or <strong>Paired Samples T-Test</strong>).',
      'Drag the variable(s) across; for one-sample, set <em>Test value</em>.',
      'Tick <em>Effect size</em> (Cohen’s d), <em>Confidence interval</em>, and <em>Descriptives</em>.',
      'Optional but great for teaching: tick <em>Descriptives plots</em> to get a means-with-CI figure.'
    ],
    apa: '<p>Participants scored higher (<em>M</em> = 105.3, <em>SD</em> = 9.6) than the population norm of 100, <em>t</em>(24) = 2.76, <em>p</em> = .011, <em>d</em> = 0.55, 95% CI of the difference [1.3, 9.3]. In the paired design, reaction times were faster after training (<em>M</em> = 412 ms, <em>SD</em> = 38) than before (<em>M</em> = 435 ms, <em>SD</em> = 41), <em>t</em>(29) = 3.21, <em>p</em> = .003, <em>d</em> = 0.59.</p>',
    tips: [
      'Italicize the Latin statistical symbols: <em>t</em>, <em>p</em>, <em>d</em>, <em>M</em>, <em>SD</em>. Degrees of freedom go in parentheses right after <em>t</em>.',
      'Give means and SDs (or the CI of the difference) so the reader sees the direction and size, not just significance. No leading zero for <em>p</em> (it can’t exceed 1): write <em>p</em> = .011, not 0.011.'
    ]
  },
  "independent-samples-t-test": {
    spss: [
      '<strong>Analyze → Compare Means → Independent-Samples T Test…</strong> (in SPSS 29+ the submenu is named <em>Compare Means and Proportions</em>).',
      'Move the outcome into <em>Test Variable(s)</em> and the group variable into <em>Grouping Variable</em>; click <em>Define Groups…</em> and enter the two codes.',
      'Tick <em>Estimate effect sizes</em> for Cohen’s d. <strong>In SPSS 31+ also tick the homogeneity-of-variance option</strong> in the same dialog: Levene’s test used to print automatically and is now opt-in.',
      'Output shows two rows: check Levene’s test first — if it’s significant (unequal variances), read the <em>Equal variances not assumed</em> (Welch) row. Many statisticians recommend simply always using that row.',
      'Scroll right in that same table for <em>Mean Difference</em> and the <em>95% Confidence Interval of the Difference</em>. That interval is the one APA asks you to report beside the effect size.'
    ],
    jasp: [
      '<strong>T-Tests → Independent Samples T-Test</strong>.',
      'Drag the outcome into <em>Dependent Variables</em> and the group into <em>Grouping Variable</em>.',
      'Under <em>Tests</em>, tick <em>Welch</em> (alongside or instead of Student); tick <em>Effect size</em> and <em>Confidence interval</em>.',
      'Tick <em>Assumption checks</em> to get Levene’s test and normality checks in the same output.'
    ],
    apa: '<p>The treatment group (<em>M</em> = 34.1, <em>SD</em> = 8.2, <em>n</em> = 30) outperformed the control group (<em>M</em> = 29.4, <em>SD</em> = 7.6, <em>n</em> = 30), Welch’s <em>t</em>(57.7) = 2.30, <em>p</em> = .025, <em>d</em> = 0.59, 95% CI of the difference [0.6, 8.8].</p>',
    tips: [
      'Welch’s df is usually fractional (57.7) — report it as the software gives it; that’s the signal you used the robust version.',
      'Report both group <em>M</em>s and <em>SD</em>s, the test, <em>p</em>, and an effect size with its CI — significance alone is never enough.'
    ]
  },
  "effect-size-and-power": {
    spss: [
      '<strong>Analyze → Power Analysis → Means → Independent-Samples T Test</strong> (SPSS 27+).',
      'Choose <em>Estimate sample size</em>, enter the effect size you care about (e.g. d = 0.5), power (0.80), and α (0.05).',
      'The free standalone tool <strong>G*Power</strong> does the same and is the de-facto standard to cite: Test family <em>t tests</em> → <em>A priori</em>.',
      'For Cohen’s d of data you already have: it’s in the t-test output (tick <em>Estimate effect sizes</em>).'
    ],
    jasp: [
      'Click the <strong>+</strong> (modules) button top-right and enable the <strong>Power</strong> module.',
      '<strong>Power → Independent Samples T-Test</strong>: enter effect size, α, and desired power — JASP solves for n and draws the power curves.',
      'Effect sizes for collected data live in the ordinary t-test analyses (tick <em>Effect size</em>).'
    ],
    apa: '<p>An a priori power analysis (G*Power 3.1) indicated that detecting a medium effect (<em>d</em> = 0.50) with 80% power in a two-tailed test at α = .05 required 64 participants per group; we recruited 70 per group to allow for exclusions. In the results, report the observed effect with its CI: <em>d</em> = 0.56, 95% CI [0.21, 0.91].</p>',
    tips: [
      'The power analysis belongs in the Method section (participants), before any results.',
      'α and β are Greek letters, so they are <em>not</em> italicized; <em>d</em>, <em>n</em>, and <em>p</em> are.'
    ]
  },

  /* ---------------- Stats 2 ---------------- */
  "one-way-anova": {
    spss: [
      '<strong>Analyze → Compare Means → One-Way ANOVA…</strong> (in SPSS 29+ the submenu is named <em>Compare Means and Proportions</em>).',
      'Outcome into <em>Dependent List</em>, group into <em>Factor</em>.',
      '<em>Options…</em>: tick <em>Descriptive</em>, <em>Homogeneity of variance test</em> (Levene), and <em>Welch</em> (robust F for unequal variances). Recent SPSS also offers effect-size estimates here.',
      '<em>Post Hoc…</em>: tick <em>Tukey</em> for pairwise follow-ups.',
      'Alternative with η² built in: <strong>Analyze → General Linear Model → Univariate</strong>, then <em>Options → Estimates of effect size</em>.'
    ],
    jasp: [
      '<strong>ANOVA → ANOVA</strong>.',
      'Outcome into <em>Dependent Variable</em>, group into <em>Fixed Factors</em>.',
      'Open <em>Additional Options</em> → tick <em>Estimates of effect size</em> (η², ω²), and tick <em>Confidence intervals</em> beside them: JASP builds the interval on the effect size, which most packages leave you to compute yourself.',
      '<em>Post Hoc Tests</em>: move the factor across and tick <em>Tukey</em>.',
      '<em>Assumption Checks</em>: tick <em>Homogeneity tests</em> and <em>Q-Q plot of residuals</em>.'
    ],
    apa: '<p>Study method affected exam scores, <em>F</em>(2, 87) = 5.42, <em>p</em> = .006, η² = .11. Tukey-corrected comparisons showed that method C outperformed method A, <em>M</em><sub>diff</sub> = 6.8, 95% CI [1.9, 11.7], <em>p</em> = .004; no other pairwise differences were significant.</p>',
    tips: [
      '<em>F</em> takes two dfs: between-groups and within-groups — <em>F</em>(2, 87).',
      'η² is Greek (not italicized) and can’t exceed 1, so no leading zero: η² = .11.'
    ]
  },
  "post-hoc-tests": {
    spss: [
      'In <strong>One-Way ANOVA → Post Hoc…</strong> (or <strong>GLM Univariate → Post Hoc…</strong>).',
      'Tick <em>Tukey</em> for all-pairwise comparisons with honest error rates; <em>Bonferroni</em> if you have only a few planned comparisons.',
      'If variances are unequal, use the <em>Games-Howell</em> option in the "Equal Variances Not Assumed" panel instead.',
      'The output’s <em>Multiple Comparisons</em> table gives each pair’s mean difference, adjusted p, and CI.'
    ],
    jasp: [
      'In <strong>ANOVA → Post Hoc Tests</strong>, move your factor to the right panel.',
      'Tick the correction(s) to display: <em>Tukey</em> (default choice), <em>Bonferroni</em>, or <em>Holm</em> (uniformly more powerful than Bonferroni).',
      'Tick <em>Flag significant comparisons</em> for quick reading, and <em>Confidence intervals</em> for the adjusted CIs.'
    ],
    apa: '<p>The omnibus ANOVA was significant, <em>F</em>(3, 116) = 7.21, <em>p</em> &lt; .001, η² = .16. Tukey’s HSD comparisons showed the drug group improved more than placebo, <em>M</em><sub>diff</sub> = 5.2, 95% CI [1.4, 9.0], <em>p</em> = .003, and than waitlist, <em>M</em><sub>diff</sub> = 6.0, 95% CI [2.1, 9.9], <em>p</em> &lt; .001; the two control groups did not differ, <em>p</em> = .84.</p>',
    tips: [
      'Always name the correction method ("Tukey-corrected", "Bonferroni-adjusted") — a bare p-value from multiple comparisons is meaningless.',
      'Write <em>p</em> &lt; .001 only when p is genuinely below .001; otherwise give the exact value to 2–3 decimals (<em>p</em> = .003).',
      'Both post-hoc dialogs are built around family-wise methods (Tukey, Bonferroni, Holm, Šidák, Games-Howell). For a false-discovery-rate correction across a list of p-values, apply Benjamini–Hochberg yourself — one line in R or Python, in the snippet below.'
    ]
  },
  "factorial-anova-two-way": {
    spss: [
      '<strong>Analyze → General Linear Model → Univariate…</strong>',
      'Outcome into <em>Dependent Variable</em>; both factors into <em>Fixed Factor(s)</em> — the A × B interaction is included automatically.',
      '<em>Options…</em>: tick <em>Estimates of effect size</em> (partial η²) and <em>Descriptive statistics</em>.',
      '<em>Plots…</em>: put one factor on the horizontal axis and the other as separate lines — non-parallel lines are the interaction.',
      'If the interaction is significant, follow up with <em>EM Means → Compare simple main effects</em>.'
    ],
    jasp: [
      '<strong>ANOVA → ANOVA</strong> with both factors in <em>Fixed Factors</em>.',
      'The <em>Model</em> section shows main effects and the interaction (included by default).',
      'Tick <em>Estimates of effect size</em>; use <em>Descriptives plots</em> with one factor on the x-axis and one as separate lines.',
      'Follow a significant interaction with <em>Simple Main Effects</em> in the same analysis.'
    ],
    apa: '<p>There was a significant caffeine × time-of-day interaction, <em>F</em>(1, 76) = 6.87, <em>p</em> = .011, η<sub>p</sub>² = .08: caffeine improved performance in the morning, <em>F</em>(1, 76) = 15.2, <em>p</em> &lt; .001, but not in the evening, <em>F</em>(1, 76) = 0.31, <em>p</em> = .58. There was also a main effect of caffeine, <em>F</em>(1, 76) = 9.31, <em>p</em> = .003, η<sub>p</sub>² = .11, qualified by the interaction above.</p>',
    tips: [
      'Lead with the interaction — a significant interaction changes how the main effects should be read ("qualified by").',
      'GLM output gives <em>partial</em> η² (η<sub>p</sub>²); label it as such, since it isn’t comparable to plain η².'
    ]
  },
  "repeated-measures-anova": {
    spss: [
      '<strong>Analyze → General Linear Model → Repeated Measures…</strong>',
      'Name the within-subject factor (e.g. <em>time</em>), enter its number of levels, click <em>Add</em> then <em>Define</em>, and map each level to its column.',
      'Check <em>Mauchly’s Test of Sphericity</em> in the output; if <em>p</em> &lt; .05, read the <em>Greenhouse-Geisser</em> row of the within-subjects table.',
      '<em>Options…</em>: tick <em>Estimates of effect size</em>; <em>EM Means…</em> with <em>Compare main effects</em> (Bonferroni) for pairwise follow-ups.'
    ],
    jasp: [
      '<strong>ANOVA → Repeated Measures ANOVA</strong>.',
      'Define the factor and its levels in <em>Repeated Measures Factors</em>, then drag each column into its cell.',
      '<em>Assumption Checks</em>: tick <em>Sphericity tests</em> and, under corrections, <em>Greenhouse-Geisser</em> — JASP prints corrected and uncorrected rows side by side.',
      'Tick <em>Estimates of effect size</em>; post-hocs live in <em>Post Hoc Tests</em> with Bonferroni/Holm options.'
    ],
    apa: '<p>Mauchly’s test indicated a sphericity violation, χ²(2) = 9.4, <em>p</em> = .009, so Greenhouse–Geisser-corrected values are reported (ε = .78). Recall differed across the three delays, <em>F</em>(1.56, 45.2) = 8.75, <em>p</em> = .001, η<sub>p</sub>² = .23. Bonferroni-corrected comparisons showed forgetting from immediate to one week, <em>M</em><sub>diff</sub> = 9.1, <em>p</em> = .001.</p>',
    tips: [
      'The corrected (fractional) dfs — <em>F</em>(1.56, 45.2) — tell the reader a sphericity correction was applied; also name it and give ε.',
      'χ² and ε are Greek, so no italics; <em>F</em>, <em>p</em>, and <em>M</em> are Latin, so italics.'
    ]
  },
  "assumptions-and-when-they-break": {
    spss: [
      'For Q-Q plots: <strong>Analyze → Descriptive Statistics → Explore…</strong>, outcome into <em>Dependent List</em> and (for a group comparison) the grouping variable into <em>Factor List</em>.',
      '<em>Plots…</em>: tick <strong>Normality plots with tests</strong> for a Q-Q plot per group plus Shapiro-Wilk, and choose <em>Spread vs Level with Levene Test</em> for the variance check.',
      'For equal variances inside the test itself: <strong>One-Way ANOVA → Options…</strong> → <em>Homogeneity of variance test</em>. In the Independent-Samples T Test the equivalent option is opt-in from SPSS 31 (it used to print automatically).',
      'For a regression, the assumption to check is a residual plot, not the raw outcome: <strong>Regression → Linear → Plots…</strong>, put <em>*ZRESID</em> on Y and <em>*ZPRED</em> on X, and tick <em>Normal probability plot</em>.'
    ],
    jasp: [
      'Inside <strong>T-Tests → Independent Samples T-Test</strong>, open <em>Assumption Checks</em> and tick <em>Normality</em> and <em>Equality of variances</em>.',
      'Inside <strong>ANOVA → ANOVA</strong>, open <em>Assumption Checks</em> and tick <em>Homogeneity tests</em> and <em>Q-Q plot of residuals</em> — one plot of the residuals replaces one plot per group.',
      'For a look before you test anything: <strong>Descriptives → Plots</strong> gives Q-Q plots and distribution plots side by side.',
      'In <strong>Regression → Linear Regression → Plots</strong>, tick <em>Residuals vs. predicted</em> and <em>Q-Q plot standardized residuals</em>.'
    ],
    apa: '<p>Assumptions were checked before analysis. Q-Q plots of the residuals showed no marked departure from normality, and Levene’s test indicated unequal variances, <em>F</em>(1, 58) = 8.42, <em>p</em> = .005, so Welch’s correction was applied throughout.</p>',
    tips: [
      'Report the assumption check only when it changed what you did, or when a reader would otherwise wonder. A paragraph reciting four non-significant tests is noise.',
      'For ANOVA and regression it is the <strong>residuals</strong> that carry the normality assumption, not the raw outcome and never the predictors.',
      'Levene’s and Shapiro-Wilk both scale with <em>n</em>: near-certain to flag a harmless wobble in a large sample, near-powerless in a small one. The plot is the better evidence, and it is what belongs in a supplement.'
    ]
  },
  "non-parametric-alternatives": {
    spss: [
      '<strong>Analyze → Nonparametric Tests → Independent Samples…</strong> (Mann-Whitney, Kruskal-Wallis) or <strong>Related Samples…</strong> (Wilcoxon, Friedman) — SPSS picks the right test from your design.',
      'The classic dialogs live under <strong>Legacy Dialogs</strong> if you prefer them (e.g. <em>2 Independent Samples → Mann-Whitney U</em>).',
      'Double-click the output for the <em>Model Viewer</em>, which includes the standardized test statistic (z).',
      'Report medians: get them from <strong>Analyze → Descriptive Statistics → Explore</strong>.'
    ],
    jasp: [
      'Non-parametric options live inside the matching parametric analysis:',
      '<strong>T-Tests → Independent Samples</strong> → tick <em>Mann-Whitney</em>; <strong>Paired Samples</strong> → tick <em>Wilcoxon signed-rank</em>.',
      '<strong>ANOVA → ANOVA → Nonparametrics</strong> → Kruskal-Wallis; <strong>Repeated Measures ANOVA → Nonparametrics</strong> → Friedman.',
      'Tick <em>Effect size</em> — JASP reports the rank-biserial correlation, a natural effect size for these tests.'
    ],
    apa: '<p>Pain ratings were lower in the treatment group (<em>Mdn</em> = 3) than in the control group (<em>Mdn</em> = 5), Mann–Whitney <em>U</em> = 245.5, <em>z</em> = −2.13, <em>p</em> = .033, <em>r</em> = .27. For three or more groups: <em>H</em>(2) = 7.61, <em>p</em> = .022 (Kruskal–Wallis).</p>',
    tips: [
      'Report medians (<em>Mdn</em>) rather than means — that’s what these tests respect.',
      'An effect size still applies: <em>r</em> = <em>z</em>/√<em>N</em> (or the rank-biserial correlation from JASP).'
    ]
  },
  "chi-square-tests": {
    spss: [
      '<strong>Analyze → Descriptive Statistics → Crosstabs…</strong> (SPSS 31+ also offers a direct <strong>Analyze → Descriptive Statistics → Chi-Square</strong> dialog; Crosstabs is still the route that gives you the table of counts to interpret).',
      'One variable into <em>Row(s)</em>, the other into <em>Column(s)</em>.',
      '<em>Statistics…</em>: tick <em>Chi-square</em> and <em>Phi and Cramér’s V</em>.',
      '<em>Cells…</em>: tick <em>Expected</em> counts (check none are below 5) and <em>Column</em> percentages for interpretation.',
      'Goodness-of-fit against fixed proportions: <strong>Analyze → Nonparametric Tests → Legacy Dialogs → Chi-square…</strong>'
    ],
    jasp: [
      '<strong>Frequencies → Contingency Tables</strong>.',
      'Drag the two variables into <em>Rows</em> and <em>Columns</em>.',
      'Under <em>Statistics</em>, tick <em>χ²</em> and <em>Phi and Cramér’s V</em>.',
      'Under <em>Cells</em>, tick <em>Expected counts</em> and column percentages.',
      'Goodness-of-fit: <strong>Frequencies → Multinomial Test</strong>.'
    ],
    apa: '<p>Recovery was associated with treatment condition, χ²(1, <em>N</em> = 120) = 6.25, <em>p</em> = .012, φ = .23: 68% of treated patients recovered versus 45% of controls.</p>',
    tips: [
      'Chi-square reporting includes the sample size inside the parentheses: χ²(df, <em>N</em> = …) = ….',
      'χ² and φ are Greek — no italics. Follow the statistic with the actual percentages so the reader sees what happened.'
    ]
  },
  "correlation": {
    spss: [
      '<strong>Analyze → Correlate → Bivariate…</strong>',
      'Move both variables across; <em>Pearson</em> is ticked by default, add <em>Spearman</em> if the data are ordinal or outlier-ridden.',
      'Newer SPSS versions offer a <em>Confidence interval</em> option — use it.',
      'Always inspect the scatterplot first: <strong>Graphs → Chart Builder → Scatter/Dot</strong>.'
    ],
    jasp: [
      '<strong>Regression → Correlation</strong>.',
      'Drag in the variables; tick <em>Pearson</em> (and/or <em>Spearman</em>).',
      'Tick <em>Confidence intervals</em> and, under <em>Plots</em>, <em>Scatter plots</em> with densities.',
      'The correlation matrix output scales to any number of variables.'
    ],
    apa: '<p>Study hours were positively correlated with exam scores, <em>r</em>(58) = .42, 95% CI [.19, .61], <em>p</em> &lt; .001. Where assumptions failed we report Spearman’s rank correlation, <em>r</em><sub>s</sub>(58) = .39, <em>p</em> = .002.</p>',
    tips: [
      'The df for a correlation is <em>N</em> − 2.',
      '<em>r</em> can’t exceed 1, so no leading zero: <em>r</em> = .42. Pair it with its CI; a lone <em>r</em> with a p-value hides the uncertainty.',
      'Before calling an <em>r</em> small, check the two things that shrink it for reasons unrelated to the relationship: whether the sample covers only part of the range, and how reliable both measures are. Say so in the write-up when either applies.'
    ]
  },
  "simple-linear-regression": {
    spss: [
      '<strong>Analyze → Regression → Linear…</strong>',
      'Outcome into <em>Dependent</em>, predictor into <em>Independent(s)</em>.',
      '<em>Statistics…</em>: tick <em>Confidence intervals</em> for the coefficients.',
      'Read: <em>Model Summary</em> (R²), <em>ANOVA</em> (overall F), <em>Coefficients</em> (b, SE, β, t, p).',
      '<em>Plots…</em>: ZRESID against ZPRED for a quick assumptions check.'
    ],
    jasp: [
      '<strong>Regression → Linear Regression</strong>.',
      'Outcome into <em>Dependent Variable</em>, predictor into <em>Covariates</em>.',
      'Under <em>Statistics</em>, tick <em>Estimates</em>, <em>Confidence intervals</em>, and <em>R squared change</em>.',
      'Under <em>Plots</em>, tick <em>Residuals vs. predicted</em> and the <em>Q-Q plot</em>.'
    ],
    apa: '<p>Hours of study predicted exam scores, <em>b</em> = 2.31, <em>SE</em> = 0.57, 95% CI [1.16, 3.46], β = .50, <em>t</em>(48) = 4.05, <em>p</em> &lt; .001. The model explained a quarter of the variance, <em>R</em>² = .25, <em>F</em>(1, 48) = 16.40, <em>p</em> &lt; .001.</p>',
    tips: [
      'Give both the unstandardized slope <em>b</em> (real units — "2.31 points per hour") and the standardized β.',
      'β here is Greek (no italics); <em>b</em>, <em>SE</em>, <em>t</em>, <em>R</em>² are Latin (italics).',
      'With a single predictor, β <em>is</em> the correlation and <em>R</em>² is β squared, so the Beta column should match the <em>r</em> you get from Correlate → Bivariate. If those two disagree, one of the analyses is not running on the sample you think it is.'
    ]
  },
  "regression-diagnostics": {
    spss: [
      'In <strong>Analyze → Regression → Linear…</strong>, use the <em>Plots…</em> and <em>Save…</em> buttons.',
      '<em>Plots…</em>: ZRESID (y) against ZPRED (x) — look for fans (heteroscedasticity) and curves (nonlinearity); tick the <em>Normal probability plot</em>.',
      '<em>Save…</em>: tick <em>Cook’s</em> distance and <em>Leverage values</em> to flag influential cases.',
      '<em>Statistics…</em>: tick <em>Casewise diagnostics</em> (outliers beyond ±3 SD) and <em>Durbin-Watson</em> (independence).'
    ],
    jasp: [
      'In <strong>Regression → Linear Regression → Plots</strong>:',
      'Tick <em>Residuals vs. predicted</em>, <em>Residuals vs. covariates</em>, and <em>Q-Q plot of standardized residuals</em>.',
      'Under <em>Statistics</em>, tick <em>Casewise diagnostics</em> to list cases with large standardized residuals or Cook’s distance.'
    ],
    apa: '<p>Inspection of residual plots showed no evidence of nonlinearity or heteroscedasticity; standardized residuals were approximately normal (all |<em>z</em>| &lt; 3), and no case was unduly influential (all Cook’s <em>D</em> &lt; 0.25). Diagnostics are reported narratively like this in the Results, before the model estimates.</p>',
    tips: [
      'One or two sentences confirming the checks (and what you did about violations) is standard — plots themselves usually go to supplementary materials.',
      'SPSS’s Linear Regression dialog has no heteroscedasticity-consistent (robust) standard-error option, which catches out people who read the usual advice and go looking for the checkbox. The practical SPSS routes are the <em>Bootstrap…</em> button in the same dialog or an add-on macro; in R and Python the correction is one argument (<code>sandwich</code>/<code>car</code> in R, <code>cov_type="HC3"</code> in statsmodels).',
      'The Durbin-Watson statistic in the <em>Statistics…</em> box only tests independence against <em>order</em>. It says nothing about clustering (several rows per participant, per class, per clinic), which needs a model that knows about the grouping.'
    ]
  },

  /* ---------------- Stats 3 ---------------- */
  "multiple-regression": {
    spss: [
      '<strong>Analyze → Regression → Linear…</strong> with several predictors in <em>Independent(s)</em>.',
      '<em>Statistics…</em>: tick <em>Confidence intervals</em>, <em>Descriptives</em>, and <em>Collinearity diagnostics</em>.',
      'Categorical predictors must be dummy-coded first (<strong>Transform → Create Dummy Variables</strong>) — or switch to <strong>GLM → Univariate</strong>, which codes factors for you.',
      'Read the <em>Coefficients</em> table: each <em>b</em> is that predictor’s effect holding the others constant.'
    ],
    jasp: [
      '<strong>Regression → Linear Regression</strong>.',
      'Continuous predictors go in <em>Covariates</em>; categorical ones in <em>Factors</em> (JASP dummy-codes them automatically).',
      'Tick <em>Estimates</em>, <em>Confidence intervals</em>, <em>Collinearity diagnostics</em>.',
      'Use <em>Model</em> to organize hierarchical blocks (M₀, M₁) and get R² change.'
    ],
    apa: '<p>The model predicted job satisfaction, <em>R</em>² = .34, adjusted <em>R</em>² = .32, <em>F</em>(3, 116) = 20.10, <em>p</em> &lt; .001. Autonomy, <em>b</em> = 0.42, <em>SE</em> = 0.09, β = .38, <em>p</em> &lt; .001, and pay, <em>b</em> = 0.18, <em>SE</em> = 0.07, β = .21, <em>p</em> = .012, were unique predictors; weekly hours were not, <em>b</em> = −0.05, <em>SE</em> = 0.06, β = −.07, <em>p</em> = .40.</p>',
    tips: [
      'Report the overall model (<em>R</em>², <em>F</em>) first, then the coefficients — a full coefficient table is usually clearer than prose for 3+ predictors.',
      'Say explicitly that coefficients are adjusted effects ("controlling for the other predictors").',
      'SPSS prints the standardized β in the <em>Coefficients</em> table without being asked, under <em>Standardized Coefficients</em>. Anywhere that doesn’t, z-score every variable and refit: the raw slopes come back as the βs.'
    ]
  },
  "multicollinearity-and-variable-selection": {
    spss: [
      'In <strong>Analyze → Regression → Linear… → Statistics…</strong>, tick <em>Collinearity diagnostics</em>.',
      'The <em>Coefficients</em> table gains <em>Tolerance</em> and <em>VIF</em> columns — worry above VIF ≈ 5, alarm above 10.',
      'Inspect the predictor correlation matrix first: <strong>Analyze → Correlate → Bivariate</strong>.',
      'Fixes: drop or combine redundant predictors, or center them (for interaction-induced collinearity).'
    ],
    jasp: [
      'In <strong>Regression → Linear Regression → Statistics</strong>, tick <em>Collinearity diagnostics</em>.',
      'Tolerance and VIF appear per predictor in the coefficients table.',
      'The <em>Correlation</em> analysis (Regression → Correlation) shows which predictors overlap.'
    ],
    apa: '<p>Collinearity was acceptable across predictors (all VIFs ≤ 2.3, all tolerances ≥ .43), so all three predictors were retained in the final model.</p>',
    tips: [
      'A single sentence reporting the largest VIF (or "all VIFs below X") is the convention; VIF is an abbreviation, not a statistic symbol, so it isn’t italicized.',
      'Tolerance and VIF carry the same information (tolerance = 1 / VIF), so report one, not both. VIF is the usual choice in write-ups; tolerance reads more naturally as a share, since .08 says only 8% of that predictor is its own.'
    ]
  },
  "categorical-predictors-and-dummy-coding": {
    spss: [
      '<strong>Transform → Create Dummy Variables</strong> turns a k-category variable into k 0/1 indicators (use k − 1 of them in the model).',
      'Or skip manual coding: <strong>Analyze → General Linear Model → Univariate</strong> treats <em>Fixed Factors</em> categorically for you.',
      'In <strong>Regression → Linear</strong>, enter the k − 1 dummies together; the omitted category is the reference.',
      'To change the reference group, just choose a different dummy to leave out.'
    ],
    jasp: [
      'Nothing to code by hand: drag the categorical variable into <em>Factors</em> in <strong>Regression → Linear Regression</strong>.',
      'JASP dummy-codes automatically; the first level (alphabetically) is the reference.',
      'Change the reference by reordering the factor levels in the data view (click the variable name).'
    ],
    apa: '<p>Teaching format predicted scores. Compared with the reference category (lecture), workshops raised scores by 4.6 points, <em>b</em> = 4.60, <em>SE</em> = 1.70, <em>p</em> = .008, while online delivery did not differ, <em>b</em> = 1.10, <em>SE</em> = 1.80, <em>p</em> = .54.</p>',
    tips: [
      'Always name the reference category — dummy coefficients are meaningless without it.'
    ]
  },
  "ancova": {
    spss: [
      '<strong>Analyze → General Linear Model → Univariate…</strong>',
      'Outcome into <em>Dependent Variable</em>, group into <em>Fixed Factor(s)</em>, and the covariate (e.g. pretest) into <em>Covariate(s)</em>.',
      '<em>Options…</em>: tick <em>Estimates of effect size</em>; <em>EM Means…</em>: move the factor across to get the covariate-<em>adjusted</em> means with <em>Compare main effects</em>.',
      'Check homogeneity of slopes first: <em>Model → Build terms</em>, add the factor × covariate interaction, and confirm it is <em>not</em> significant — then remove it and run the ANCOVA proper.'
    ],
    jasp: [
      '<strong>ANOVA → ANCOVA</strong>.',
      'Outcome into <em>Dependent Variable</em>, group into <em>Fixed Factors</em>, covariate into <em>Covariates</em>.',
      'Tick <em>Estimates of effect size</em>; under <em>Marginal Means</em>, move the factor across for adjusted means.',
      'For the slopes check, add the interaction term under <em>Model</em>, confirm it’s n.s., then drop it.'
    ],
    apa: '<p>After adjusting for pretest scores, the training effect remained significant, <em>F</em>(1, 57) = 6.84, <em>p</em> = .011, η<sub>p</sub>² = .11. Adjusted means were 74.2 (<em>SE</em> = 1.1) for training and 70.3 (<em>SE</em> = 1.1) for control. The homogeneity-of-slopes assumption held, <em>F</em>(1, 56) = 0.42, <em>p</em> = .52.</p>',
    tips: [
      'Report <em>adjusted</em> means (with SEs), not raw means — they’re what ANCOVA compares.',
      'Reporting the slopes-homogeneity check briefly reassures reviewers you tested the key assumption.',
      'The effect size both programs hand you is labeled <em>Partial Eta Squared</em>. Because the covariate’s variance has already left the denominator, it is not the same quantity as an unadjusted η² and the two should never share a column in a table.'
    ]
  },
  "interactions-in-regression": {
    spss: [
      'Center the predictors first: <strong>Transform → Compute Variable</strong> (e.g. <em>anx_c = anxiety − mean</em>).',
      'Compute the product: <em>prep_x_anx = prep_c * anx_c</em>.',
      'Enter both centered predictors and the product in <strong>Regression → Linear</strong>; the product’s coefficient is the interaction.',
      'For simple slopes and plots, Hayes’s free <strong>PROCESS</strong> macro (Model 1) automates the whole thing.'
    ],
    jasp: [
      '<strong>Regression → Linear Regression</strong>, both predictors in <em>Covariates</em>.',
      'Open <em>Model</em>: select both predictors together and add them as an interaction term.',
      'JASP centers on request and reports the product-term coefficient with its test.'
    ],
    apa: '<p>The preparation × anxiety interaction was significant, <em>b</em> = −0.21, <em>SE</em> = 0.08, <em>t</em>(114) = 2.63, <em>p</em> = .010, Δ<em>R</em>² = .04. Simple-slopes analysis showed preparation predicted scores at low anxiety (−1 <em>SD</em>), <em>b</em> = 0.61, <em>p</em> &lt; .001, but not at high anxiety (+1 <em>SD</em>), <em>b</em> = 0.12, <em>p</em> = .31.</p>',
    tips: [
      'Report the interaction term, the R² it adds, and then the simple slopes — the interaction coefficient alone doesn’t tell the story.'
    ]
  },
  "mediation-and-indirect-effects": {
    spss: [
      'Install Hayes’s free <strong>PROCESS</strong> macro (processmacro.org); it appears under <strong>Analyze → Regression → PROCESS</strong>. <strong>SPSS 32+ also ships a native <em>Analyze → Mediation Analysis</em></strong>, so check that menu before installing anything; PROCESS remains the reference implementation most published papers cite.',
      'Choose <em>Model 4</em> (simple mediation); assign X, Y, and M.',
      'Set bootstrap samples to 5,000 (or more) — inference uses the bootstrap CI of the indirect effect.',
      'Read: paths a and b, the indirect effect (ab) with its CI, and the direct effect c′.'
    ],
    jasp: [
      'Enable the <strong>SEM</strong> module (+ button), then <strong>SEM → Mediation Analysis</strong>.',
      'Assign <em>Predictor</em> (X), <em>Mediator</em> (M), and <em>Outcome</em> (Y).',
      'Under <em>Options</em>, choose <em>Bootstrap</em> with 5,000 replications, percentile or bias-corrected CIs.',
      'JASP prints direct, indirect, and total effects in one table.'
    ],
    apa: '<p>Self-efficacy mediated the effect of training on performance: the indirect effect was significant, <em>ab</em> = 0.14, 95% bootstrap CI [0.06, 0.25] (5,000 resamples). The direct effect remained significant but reduced, <em>c′</em> = 0.22, <em>p</em> = .014, consistent with partial mediation.</p>',
    tips: [
      'Inference comes from the bootstrap CI (does it exclude 0?), not a p-value on ab — report the number of resamples.',
    ]
  },
  "logistic-regression": {
    spss: [
      '<strong>Analyze → Regression → Binary Logistic…</strong>',
      'Outcome into <em>Dependent</em>; predictors into <em>Covariates</em>; declare categorical ones via the <em>Categorical…</em> button.',
      '<em>Options…</em>: tick <em>CI for exp(B)</em> — exp(B) is the odds ratio.',
      'Read: <em>Omnibus Tests</em> (model χ²), <em>Model Summary</em> (Nagelkerke R²), <em>Variables in the Equation</em> (B, Wald, Exp(B)).',
      'The <em>Classification Table</em> SPSS prints by default uses a fixed cut value of .500; change it under <em>Options… → Classification cutoff</em> if a different operating point suits your problem.'
    ],
    jasp: [
      '<strong>Regression → Logistic Regression</strong>.',
      'Outcome into <em>Dependent Variable</em>; predictors into <em>Covariates</em>/<em>Factors</em>.',
      'Under <em>Statistics</em>, tick <em>Odds ratios</em> and <em>Confidence intervals</em>.',
      'The <em>Performance Diagnostics</em> section gives classification accuracy and AUC.'
    ],
    apa: '<p>Each additional study hour increased the odds of passing, <em>b</em> = 0.85, <em>SE</em> = 0.21, Wald χ²(1) = 16.40, <em>p</em> &lt; .001, <em>OR</em> = 2.34, 95% CI [1.55, 3.53]. The full model outperformed the null, χ²(2) = 28.7, <em>p</em> &lt; .001, Nagelkerke <em>R</em>² = .29.</p>',
    tips: [
      'Readers think in odds ratios, not logits — always report <em>OR</em> with its CI (an OR is significant when its CI excludes 1, not 0).',
      'An Exp(B) in the thousands with a CI running from near-0 to near-infinity means <strong>separation</strong>, not a spectacular predictor: some variable splits the outcome perfectly and the estimate has run off to infinity. Look for a category with an empty cell, merge sparse levels, or fit a penalized (Firth) model.',
      'The Wald test each row prints is the least trustworthy part of the output when a coefficient is large. For a predictor worth arguing about, refit without it and compare models by likelihood ratio (SPSS: enter it in its own block; JASP: the model-comparison table).',
      'The <em>Overall Percentage</em> in that classification table is plain accuracy at a .500 cutoff, so on a rare outcome it flatters the model badly. Report the four cells and the metrics that match your costs instead; §5.4 works through why.'
    ]
  },
  "model-comparison": {
    spss: [
      'In <strong>Regression → Linear</strong>, enter predictors in blocks: Block 1, then click <em>Next</em> for Block 2, etc.',
      '<em>Statistics…</em>: tick <em>R squared change</em> — the output tests each block’s ΔR² with an F change test.',
      'For non-nested models, compare information criteria from <strong>Analyze → Mixed Models</strong> or <strong>Generalized Linear Models</strong> output (AIC/BIC).'
    ],
    jasp: [
      'In <strong>Regression → Linear Regression → Model</strong>, drag some predictors out of the null model (M₀) — JASP reports M₀ vs M₁ with ΔR² and the F change test.',
      'AIC/BIC per model are available under <em>Statistics</em>.',
      'For a Bayesian take, <strong>Regression → Bayesian Linear Regression</strong> ranks all sub-models by Bayes factor.'
    ],
    apa: '<p>Adding sleep quality improved prediction beyond study hours alone, Δ<em>R</em>² = .06, <em>F</em>(1, 47) = 6.10, <em>p</em> = .017; the fuller model was also favored by AIC (312.4 vs. 318.2). Final-model coefficients are reported in Table 2.</p>',
    tips: [
      'Name the comparison explicitly (which model vs. which) and give ΔR² with its F test — or AIC/BIC when models aren’t nested.'
    ]
  },
  "factor-analysis-pca": {
    spss: [
      '<strong>Analyze → Dimension Reduction → Factor…</strong>',
      '<em>Descriptives…</em>: tick <em>KMO and Bartlett’s test of sphericity</em>.',
      '<em>Extraction…</em>: choose <em>Principal components</em> (or <em>Principal axis factoring</em> for a true EFA); tick the <em>Scree plot</em>.',
      '<em>Rotation…</em>: <em>Varimax</em> if you expect independent factors, <em>Direct Oblimin</em> if they may correlate (usually the safer bet in psychology).',
      'Interpret the <em>Rotated Component/Pattern Matrix</em>; loadings ≥ .40 conventionally define a factor.'
    ],
    jasp: [
      '<strong>Factor → Exploratory Factor Analysis</strong> (or <em>Principal Component Analysis</em>).',
      'Choose the number of factors by <em>Eigenvalues &gt; 1</em>, <em>scree plot</em>, or best: <em>parallel analysis</em>, offered in the same dropdown.',
      'Set <em>Rotation</em> to oblique (<em>oblimin</em>) unless you have reason to force independence.',
      'Tick <em>KMO test</em> and <em>Bartlett’s test</em> under Assumption Checks.'
    ],
    apa: '<p>Sampling adequacy was good, KMO = .84, and Bartlett’s test was significant, χ²(190) = 1438.2, <em>p</em> &lt; .001. Parallel analysis supported two factors, together explaining 58% of the variance. After oblimin rotation, nine items loading ≥ .40 defined a "sociability" factor and seven a "assertiveness" factor (loadings in Table 1).</p>',
    tips: [
      'State the extraction method, the retention rule (parallel analysis / scree / eigenvalues), the rotation, and the variance explained — the four decisions reviewers look for.'
    ]
  },
  "manova": {
    spss: [
      '<strong>Analyze → General Linear Model → Multivariate…</strong>',
      'All outcome variables into <em>Dependent Variables</em>; the group into <em>Fixed Factor(s)</em>.',
      '<em>Options…</em>: tick <em>Estimates of effect size</em> and <em>Homogeneity tests</em> (Box’s M).',
      'The <em>Multivariate Tests</em> table lists Pillai’s trace, Wilks’ Λ, Hotelling’s trace, and Roy’s root — Pillai is the robust default.',
      'Follow up with the univariate <em>Tests of Between-Subjects Effects</em> (apply a Bonferroni-style correction across outcomes).',
      'MANCOVA: same dialog, add baseline variables into <em>Covariate(s)</em>.'
    ],
    jasp: [
      '<strong>ANOVA → MANOVA</strong>.',
      'Drag all outcomes into <em>Dependent Variables</em> and the group into <em>Fixed Factors</em>.',
      'Under <em>Additional Options</em>, choose the test statistic(s) — tick <em>Pillai</em> and <em>Wilks</em> — and tick the univariate <em>ANOVAs</em> box for follow-ups.'
    ],
    apa: '<p>Therapy condition affected the symptom profile, Pillai’s trace = 0.24, <em>F</em>(2, 77) = 12.10, <em>p</em> &lt; .001, η<sub>p</sub>² = .24. Bonferroni-corrected follow-up ANOVAs (α = .025) showed an effect on anxiety, <em>F</em>(1, 78) = 8.91, <em>p</em> = .004, but not depression, <em>F</em>(1, 78) = 3.10, <em>p</em> = .082.</p>',
    tips: [
      'Name the multivariate statistic you used (Pillai’s trace or Wilks’ Λ), give its F conversion with both dfs, and put the multivariate partial η² next to it — a table of multivariate p-values with no effect size is as incomplete here as anywhere else.',
      'Report the follow-up strategy and its correction — a significant MANOVA alone doesn’t say which outcomes moved.'
    ]
  },
  "power-analysis-for-complex-designs": {
    spss: [
      '<strong>Analyze → Power Analysis</strong> (SPSS 27+) covers t-tests, ANOVA, correlations, and regression.',
      'For factorial and interaction effects, the free standard is <strong>G*Power</strong>: <em>F tests → ANOVA: Fixed effects, special, main effects and interactions</em>.',
      'For mixed/multilevel designs no formula applies — simulate: generate data at your expected effect size many times and count how often the effect is detected.'
    ],
    jasp: [
      'Enable the <strong>Power</strong> module (+ button) for t-tests, ANOVA, and correlations.',
      'Enter effect size, α, and target power; JASP plots power curves across n.',
      'For designs the module doesn’t cover (e.g. mixed models), simulation in R (<em>simr</em>) is the honest route.'
    ],
    apa: '<p>An a priori power analysis for the 2 × 3 between-subjects design (G*Power 3.1; <em>f</em> = 0.25, α = .05, power = .80) indicated a required total sample of 158. For the mixed-effects analysis, a Monte Carlo simulation (1,000 datasets at the pilot effect size) confirmed power ≥ .80 with 40 clusters.</p>',
    tips: [
      'Name the software, the effect-size metric (<em>f</em>, <em>d</em>, η²) and its value, α, the target power, and the resulting n — all five belong in the Method section.',
      'G*Power returns the smallest total <em>N</em> that reaches your target and does not check whether it divides evenly into your cells. The 158 above fills six cells of 26.3 people; a balanced 2 × 3 needs 162. Round up to a multiple of your cell count, then report the number you actually recruited.'
    ]
  },

  /* ---------------- Stats 4 ---------------- */
  "bootstrap-and-resampling": {
    spss: [
      'Many dialogs (t-tests, correlations, regression) have a <strong>Bootstrap…</strong> button (requires the Bootstrapping module).',
      'Tick <em>Perform bootstrapping</em>, set 5,000–10,000 samples, and choose <em>Bias corrected accelerated (BCa)</em> intervals.',
      'The output tables gain bootstrap SEs and CIs alongside the classical ones.'
    ],
    jasp: [
      'Several analyses expose bootstrapping directly — e.g. <strong>T-Tests</strong> and <strong>ANOVA</strong> have a <em>bootstrap</em> option for effect sizes, and <strong>Mediation Analysis</strong> uses bootstrap CIs by default.',
      'Set the number of replications to 5,000+.'
    ],
    apa: '<p>Because the outcome was heavily skewed, we report bootstrap inference (10,000 resamples): the median difference was 6.5 points, BCa 95% CI [2.0, 12.3], indicating a reliable advantage for the treatment group.</p>',
    tips: [
      'Say how many resamples and which interval type (percentile vs. BCa) — the CI is the inference, no p-value needed.'
    ]
  },
  "bayesian-estimation": {
    spss: [
      '<strong>Analyze → Bayesian Statistics</strong> (SPSS 25+) covers t-tests, ANOVA, correlation, and regression.',
      'Choose <em>Characterize posterior distribution</em> to get the posterior with a 95% credible interval, or <em>Estimate Bayes factor</em> for evidence.',
      'Defaults use reference priors; the options let you specify informative ones.'
    ],
    jasp: [
      'This is JASP’s home turf: every major analysis has a Bayesian twin (e.g. <strong>T-Tests → Bayesian Independent Samples T-Test</strong>).',
      'Read <em>BF₁₀</em>: evidence for H₁ over H₀ (3–10 moderate, 10–30 strong).',
      'Tick <em>Posterior distribution</em> plots for the estimate with its 95% credible interval, and <em>Sequential analysis</em> to watch evidence accumulate.'
    ],
    apa: '<p>A Bayesian independent-samples t-test yielded strong evidence for a group difference, <em>BF</em>₁₀ = 8.3. The posterior mean difference was 4.2 points, 95% credible interval [1.1, 7.4], with a default Cauchy prior (scale = 0.707).</p>',
    tips: [
      'Say "credible interval," never "confidence interval," for Bayesian intervals — and report the prior you used.'
    ]
  },
  "generalized-linear-models": {
    spss: [
      '<strong>Analyze → Generalized Linear Models → Generalized Linear Models…</strong>',
      'On <em>Type of Model</em>, pick the family — e.g. <em>Poisson loglinear</em> for counts, <em>Binary logistic</em> for yes/no.',
      'Assign the outcome and predictors on their tabs; run.',
      'Exponentiate coefficients for interpretation (rate ratios / odds ratios): tick <em>Include exponential parameter estimates</em>.'
    ],
    jasp: [
      '<strong>Regression → Generalized Linear Model</strong>.',
      'Pick the <em>family</em> (Poisson, binomial, gamma…) and <em>link</em>; assign outcome and predictors.',
      'For overdispersed counts, compare against negative binomial and check the deviance/df ratio.'
    ],
    apa: '<p>A Poisson regression with log link showed that each mentoring session predicted more weekly logins, <em>b</em> = 0.28, <em>SE</em> = 0.06, Wald χ²(1) = 21.80, <em>p</em> &lt; .001, rate ratio = 1.32, 95% CI [1.18, 1.48]. The dispersion statistic (1.08) indicated no meaningful overdispersion.</p>',
    tips: [
      'Name the family and link function, and report exponentiated coefficients (rate/odds ratios) — raw log-scale slopes are unreadable.'
    ]
  },
  "mixed-and-multilevel-models": {
    spss: [
      '<strong>Analyze → Mixed Models → Linear…</strong>',
      'First dialog: put the clustering variable (e.g. classroom) into <em>Subjects</em>.',
      'Assign the outcome and predictors; click <em>Fixed…</em> to build the fixed effects.',
      '<em>Random…</em>: tick <em>Include intercept</em> and select the subject variable — that’s a random-intercepts model; add slopes there too if needed.',
      'Compare models by the information criteria in the output (fit with ML when comparing fixed effects).'
    ],
    jasp: [
      'Enable the <strong>Mixed Models</strong> module, then <strong>Mixed Models → Linear Mixed Models</strong>.',
      'Outcome in, fixed effects in, and the grouping variable into <em>Random effects grouping factors</em>.',
      'JASP builds the maximal random structure by default — prune it under <em>Model</em> if it fails to converge.'
    ],
    apa: '<p>In a linear mixed model with random intercepts for classrooms, teaching method predicted achievement, <em>b</em> = 3.12, <em>SE</em> = 0.94, <em>t</em>(28.4) = 3.32, <em>p</em> = .002. Clustering was substantial, ICC = .18, confirming that a multilevel approach was required.</p>',
    tips: [
      'Describe the random-effects structure in words ("random intercepts for classrooms; random slopes for time within person") — it’s part of the model, not a footnote.'
    ]
  },
  "survival-analysis": {
    spss: [
      '<strong>Analyze → Survival → Kaplan-Meier…</strong>',
      'Time variable into <em>Time</em>; the event indicator into <em>Status</em> (define which value = event).',
      'Group into <em>Factor</em>; under <em>Compare Factor…</em> tick <em>Log rank</em>.',
      '<em>Options…</em>: tick <em>Survival plots</em> and the median survival table.',
      'For adjusted comparisons, use <strong>Analyze → Survival → Cox Regression</strong> and report hazard ratios (Exp(B)).',
      'Check proportional hazards before you trust that ratio: in Cox Regression, <em>Plots…</em> → <em>Log minus log</em> should give roughly parallel curves. <strong>Analyze → Survival → Cox w/ Time-Dependent Covariate…</strong> is the formal version.'
    ],
    jasp: [
      'Enable the <strong>Survival</strong> module (+ button).',
      '<strong>Survival Analysis</strong>: assign time, event status, and the grouping factor.',
      'Tick the Kaplan-Meier plot with confidence bands and risk table; the log-rank test compares the curves.'
    ],
    apa: '<p>Median survival was 14 months, 95% CI [11, 19], in the treatment arm versus 8 months, 95% CI [6, 11], under control; the curves differed by log-rank test, χ²(1) = 8.42, <em>p</em> = .004. In a Cox model, the control arm’s hazard was higher, <em>HR</em> = 1.83, 95% CI [1.21, 2.77].</p>',
    tips: [
      'Report median survival per group with CIs, the log-rank result, and (if you ran Cox) the hazard ratio — and always state the censoring rate.',
      'If a median never arrives because the curve stays above 50%, write "not reached" rather than the largest observed time, and quote a landmark survival rate (12- or 24-month) instead.'
    ]
  },
  "missing-data": {
    spss: [
      '<strong>Analyze → Missing Value Analysis…</strong> shows patterns and runs Little’s MCAR test (tick <em>EM</em>).',
      '<strong>Analyze → Multiple Imputation → Impute Missing Data Values…</strong> creates m imputed datasets (set m ≥ 20 for serious use).',
      'Run your analysis on the imputed dataset — SPSS pools the estimates automatically (rows labeled <em>Pooled</em>).'
    ],
    jasp: [
      'JASP currently has no imputation module — analyses use complete cases by default.',
      'For MAR-plausible data, impute in R with <em>mice</em> (the "Try it yourself" box on this page shows the code), or use FIML in the SEM module, which uses all available data without imputing.'
    ],
    apa: '<p>Missingness was 12% overall and consistent with MCAR, Little’s χ²(48) = 54.10, <em>p</em> = .25. We nonetheless used multiple imputation (<em>m</em> = 20, predictive mean matching, all analysis variables in the imputation model); pooled estimates are reported throughout.</p>',
    tips: [
      'Report the missingness rate, your assumed mechanism, the method (MI/FIML), and m — "we deleted incomplete cases" needs justifying, not hiding.'
    ]
  },
  "meta-analysis": {
    spss: [
      '<strong>Analyze → Meta Analysis</strong> (SPSS 28+): choose effect-size input (e.g. Cohen’s d with SE), random-effects model.',
      'Tick the forest plot and heterogeneity statistics (Q, I², τ²).',
      'Funnel plot and Egger’s test live under <em>Publication bias</em>.'
    ],
    jasp: [
      'Enable the <strong>Meta-Analysis</strong> module from the <strong>+</strong> menu at the top right. Since JASP 0.96 that list is served from an online module library, so modules install and update without waiting for a new JASP release.',
      '<strong>Classical Meta-Analysis</strong>: supply each study’s effect size and SE; choose <em>Random effects (REML)</em>.',
      'Tick the forest plot, funnel plot, and heterogeneity statistics — JASP’s meta module is excellent and free (it wraps R’s <em>metafor</em>).'
    ],
    apa: '<p>Across <em>k</em> = 18 studies (<em>N</em> = 3,842), the random-effects pooled effect was <em>d</em> = 0.42, 95% CI [0.28, 0.56], <em>z</em> = 5.90, <em>p</em> &lt; .001. Heterogeneity was moderate, <em>Q</em>(17) = 38.20, <em>p</em> = .002, <em>I</em>² = 55%, τ = 0.21. The funnel plot and Egger’s test, <em>p</em> = .31, showed no clear small-study asymmetry.</p>',
    tips: [
      'The trio to report: pooled effect with CI, heterogeneity (<em>Q</em>, <em>I</em>², τ), and a publication-bias check.'
    ]
  },
  "psychometric-functions": {
    spss: [
      'Arrange the data trial-by-trial: one row per trial, with <em>duration</em> (the stimulus level) and <em>resp_long</em> (1 = "long", 0 = "short").',
      '<strong>Analyze → Regression → Binary Logistic…</strong>: <em>resp_long</em> as Dependent, <em>duration</em> as Covariate.',
      'From the coefficients table, compute PSE = −Constant / B<sub>duration</sub> and JND = ln(3) / B<sub>duration</sub> (by hand or via <strong>Transform → Compute Variable</strong>).',
      'To compare conditions, add the condition variable and its <em>condition × duration</em> interaction (<em>Categorical…</em> for the dummy): the condition term tests a PSE shift, the interaction a slope change.'
    ],
    jasp: [
      '<strong>Regression → Logistic Regression</strong>: <em>resp_long</em> as Dependent, <em>duration</em> as Covariate.',
      'PSE and JND come from the same two coefficients: PSE = −intercept/slope, JND = ln(3)/slope.',
      'Add the condition factor plus its interaction with duration to test a PSE shift (main effect) versus a slope change (interaction).'
    ],
    apa: '<p>Proportions of &ldquo;long&rdquo; responses were fit with a logistic psychometric function per condition. The bright condition shifted the curve leftward relative to baseline, PSE = 462 ms vs. 508 ms, Δ = −46 ms, 95% CI [−72, −20], <em>z</em> = 3.46, <em>p</em> &lt; .001, with no reliable change in precision (JND = 84 ms vs. 79 ms, <em>p</em> = .62).</p>',
    tips: [
      'Report the fitted family (logistic, cumulative Gaussian, or Weibull), the number of trials per level, the PSE and JND per condition, and how lapses were handled — the PSE is robust to the family choice, the JND less so.'
    ]
  },

  /* ---------------- Methods — Research Design ---------------- */
  "reliability-and-validity": {
    spss: [
      '<strong>Analyze → Scale → Reliability Analysis…</strong>',
      'Move all items of ONE scale into <em>Items</em>. Reverse-code any negatively worded items first (<strong>Transform → Recode into Different Variables</strong>), or α will be badly deflated.',
      'Set <em>Model</em> to <em>Alpha</em>.',
      'Click <em>Statistics…</em> and tick <em>Scale if item deleted</em> and <em>Inter-Item Correlations</em>.',
      'Read <em>Cronbach’s Alpha</em> in the Reliability Statistics table; scan the <em>Cronbach’s Alpha if Item Deleted</em> column for items dragging the scale down.',
      'SPSS 28+ can also compute <em>McDonald’s ω</em> here: set <em>Model</em> to <em>Omega</em> and run the analysis again.',
      'For rater agreement instead of item consistency, use <strong>Analyze → Descriptive Statistics → Crosstabs…</strong> with one rater in Rows and the other in Columns, then <em>Statistics… → Kappa</em>. The two rating variables must use the <em>same</em> category codes, or the square table Kappa needs will not be built.'
    ],
    jasp: [
      '<strong>Reliability → Unidimensional Reliability</strong> (the classical option).',
      'Drag the scale’s items into <em>Variables</em>; under <em>Reverse-Scaled Items</em>, move any negatively worded ones across.',
      'Tick <em>Cronbach’s α</em>, and under <em>Individual Items</em> tick <em>α (if item dropped)</em> and the <em>item-rest correlation</em>.',
      'JASP also reports <em>McDonald’s ω</em> — a modern alternative many methodologists now prefer over α.',
      'Rater agreement lives beside it under <strong>Reliability → Inter-Rater Reliability</strong>: Cohen’s κ for two raters, Fleiss’ κ for more, and the ICC when the ratings are continuous.'
    ],
    apa: '<p>Internal consistency was acceptable: the 10-item Perceived Stress Scale had a Cronbach’s α of .82 in this sample, 95% CI [.78, .86]. One reverse-worded item was recoded before scoring, and all item–rest correlations exceeded .30.</p>',
    tips: [
      'α is a Greek letter, so it is <strong>not</strong> italicized (unlike Latin symbols such as <em>M</em>, <em>SD</em>, <em>r</em>). Report it with no leading zero: α = .82, not 0.82.',
      'Reliability is a property of scores in <em>your</em> sample, not a fixed trait of the questionnaire — report it for your own data rather than citing the manual.',
      'κ is Greek, so it stays upright and takes no leading zero: κ = .80. Report the percentage agreement and how common each category was alongside it, because a rare category inflates chance agreement and drags κ down on its own.'
    ]
  },
  "transformations-and-recoding": {
    spss: [
      '<strong>Transform → Compute Variable…</strong> to build a transformed or composite column.',
      'Log transform: set <em>Target Variable</em> to e.g. <code>income_log</code> and the <em>Numeric Expression</em> to <code>LN(income + 1)</code> (the +1 keeps zeros legal). Square root: <code>SQRT(x)</code>.',
      'z-standardize the easy way: <strong>Analyze → Descriptive Statistics → Descriptives…</strong>, tick <em>Save standardized values as variables</em> — SPSS writes a <code>Zx</code> column.',
      'Reverse-code an item: <strong>Transform → Recode into Different Variables…</strong> (or Compute <code>6 - q3</code> on a 1–5 scale). Recode into a <em>different</em> variable so the original survives.',
      'Composite: <strong>Transform → Compute Variable…</strong> with <code>MEAN(q1, q2, q3, q4, q5)</code> (MEAN skips missing items; a plain sum does not).'
    ],
    jasp: [
      'Click the <strong>+</strong> at the far right of the data view to add a <em>Computed Column</em>.',
      'Choose the R-style entry and type the expression: <code>log(income + 1)</code>, <code>sqrt(x)</code>, or <code>(x - mean(x)) / sd(x)</code> to z-standardize.',
      'Reverse-code with <code>6 - q3</code> (1–5 scale). For the composite, use the row-wise function <code>rowMeanNaRm(q1, q2, q3, q4, q5)</code> once every item points the same way — writing <code>(q1 + q2 + q3 + q4 + q5) / 5</code> returns a blank for anyone who skipped a single item.',
      'The new column is instantly available to any analysis — no need to leave JASP.'
    ],
    apa: '<p>Because household income was strongly positively skewed (skewness = 2.0), it was log-transformed (natural log) before analysis; means are reported on the original scale as geometric means. The five well-being items (one reverse-coded) were averaged into a composite (Cronbach’s α = .84).</p>',
    tips: [
      'Always state the transformation you used and the scale you analyzed on, then back-transform your summaries for the reader (the mean of the logs → the <em>geometric</em> mean).',
      'z-standardizing changes units, never shape — it does <strong>not</strong> fix skew or normality. Use a log or root for that.',
      'If Box–Cox hands you λ̂ = 0.41, report the rung you actually used (√<em>x</em>) rather than the estimate. The interval around λ̂ is usually half a unit wide or more, so a transform quoted to two decimals claims a precision the method does not have.',
      'Reverse-code before computing a composite, or the reversed items cancel the rest and deflate the scale. Recompute reliability afterwards to confirm.'
    ]
  }
};
