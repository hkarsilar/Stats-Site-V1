/* ============================================================
   "Check your understanding" — three quick questions per lesson,
   keyed by the lesson slug. Loaded lazily by site.js on lesson
   pages only; the block is injected above "Try it yourself".
   Format mirrors the quiz bank: q, options, index of the answer,
   and a one-line "why" shown as instant feedback.
   ============================================================ */
window.CHECKS = {
  /* ---------------- Stats 1 — Foundations ---------------- */
  "what-is-statistics": [
    { q: "You survey 200 students to estimate the average sleep of ALL students at your university. The 200 students are the…", o: ["population", "sample", "parameter", "statistic"], a: 1, why: "The population is everyone you want to conclude about; the subset you actually measured is the sample." },
    { q: "Computing the mean and drawing a histogram of the data you collected is…", o: ["inferential statistics", "descriptive statistics", "probability theory", "hypothesis testing"], a: 1, why: "Descriptive statistics summarize the data in hand; inference goes beyond it to the population." },
    { q: "The true average sleep of ALL students (which you'll never measure directly) is a…", o: ["statistic", "sample", "parameter", "residual"], a: 2, why: "Parameters describe populations (μ, σ); statistics (x̄, s) are computed from samples to estimate them." }
  ],
  "types-of-data": [
    { q: "Pain rated on a scale of mild / moderate / severe is…", o: ["nominal", "ordinal", "interval", "ratio"], a: 1, why: "The categories have a meaningful order but the gaps between them aren't equal or defined — ordinal." },
    { q: "Temperature in °C is interval rather than ratio because…", o: ["it can be negative", "0 °C doesn't mean 'no temperature'", "it's continuous", "it's measured with error"], a: 1, why: "Ratio scales need a true zero. 0 °C is an arbitrary point, so '20° is twice 10°' is meaningless." },
    { q: "Number of siblings is best described as…", o: ["continuous", "discrete", "ordinal", "nominal"], a: 1, why: "It's a count — numeric, but only whole values are possible, so it's discrete." }
  ],
  "describing-data": [
    { q: "Household income is strongly right-skewed. Compared to the median, the mean will typically be…", o: ["lower", "about the same", "higher", "impossible to say"], a: 2, why: "The long right tail (a few huge incomes) drags the mean upward; the median stays at the middle person." },
    { q: "Which pair of summaries is most robust to outliers?", o: ["mean and SD", "mean and range", "median and IQR", "mode and range"], a: 2, why: "Median and IQR depend on positions, not values, so extreme points barely move them." },
    { q: "Two classes both average 70 on an exam, but class A has SD = 2 and class B has SD = 15. That means…", o: ["class B did better", "scores in class B are much more spread out", "class A has more students", "the means must be wrong"], a: 1, why: "Same center, different spread — B has scores scattered far from 70, A's are packed tightly around it." }
  ],
  "visualizing-data": [
    { q: "To show the distribution of one continuous variable, the natural first plot is a…", o: ["pie chart", "histogram", "scatterplot", "line chart"], a: 1, why: "Histograms bin a continuous variable and show its shape — center, spread, skew, outliers." },
    { q: "In a boxplot, the box itself spans…", o: ["the full range", "±1 SD around the mean", "the middle 50% of the data (IQR)", "the 95% confidence interval"], a: 2, why: "The box runs from Q1 to Q3 — the interquartile range — with the median line inside." },
    { q: "A bar chart's y-axis starts at 50 instead of 0, making a small difference look huge. The data are…", o: ["wrong", "unchanged — but the picture is misleading", "skewed", "non-significant"], a: 1, why: "Truncated axes exaggerate differences visually without changing a single number — a classic misleading-graph trick." }
  ],
  "z-scores-and-the-normal-distribution": [
    { q: "A test has mean 100 and SD 15. A score of 130 has a z-score of…", o: ["+1", "+2", "+3", "+30"], a: 1, why: "z = (130 − 100) / 15 = 2 — the score sits two standard deviations above the mean." },
    { q: "In a normal distribution, roughly what share of values lies within ±2 SD of the mean?", o: ["50%", "68%", "95%", "99.7%"], a: 2, why: "The 68–95–99.7 rule: ±1 SD ≈ 68%, ±2 SD ≈ 95%, ±3 SD ≈ 99.7%." },
    { q: "Z-scores let you compare a math score to a reading score because they…", o: ["remove measurement error", "put both on a common 'SDs from the mean' scale", "make the data normal", "increase the sample size"], a: 1, why: "Standardizing strips away the original units, so any two measurements can be compared on the same scale." }
  ],
  "probability-basics": [
    { q: "A fair coin lands heads 5 times in a row. The probability the next flip is heads is…", o: ["less than 1/2 — tails is 'due'", "exactly 1/2", "more than 1/2 — heads is 'hot'", "1/32"], a: 1, why: "Independent events have no memory. Believing otherwise is the gambler's fallacy." },
    { q: "P(disease) = 0.01 and a test is 90% accurate. P(disease | positive test) is…", o: ["90%", "certainly above 50%", "much lower than 90% — the base rate matters", "1%"], a: 2, why: "With a rare condition, most positives come from the many healthy people — conditional probability must respect the base rate (this is Bayes' idea)." },
    { q: "Two events are independent when…", o: ["they can't happen together", "knowing one happened doesn't change the probability of the other", "they have equal probability", "their probabilities sum to 1"], a: 1, why: "Independence means P(A | B) = P(A). 'Can't happen together' is mutual exclusivity — nearly the opposite." }
  ],
  "sampling-distributions": [
    { q: "The sampling distribution of the mean is the distribution of…", o: ["the raw scores in one sample", "sample means across many repeated samples", "the population", "the residuals"], a: 1, why: "Imagine re-running the study endlessly and collecting each sample's mean — that pile of means is the sampling distribution." },
    { q: "The standard error of the mean equals…", o: ["σ / √n", "σ × √n", "σ / n", "the sample SD"], a: 0, why: "SE = σ/√n: the mean's sample-to-sample wobble shrinks as n grows — but only with the square root of n." },
    { q: "To cut the standard error in half, you need to multiply your sample size by…", o: ["2", "4", "8", "√2"], a: 1, why: "Because of the √n, halving the SE takes four times the data — precision is expensive." }
  ],
  "central-limit-theorem": [
    { q: "The population of individual incomes is heavily skewed. For large n, the distribution of sample MEANS will be…", o: ["equally skewed", "approximately normal", "uniform", "bimodal"], a: 1, why: "That's the CLT: whatever the population's shape, the sampling distribution of the mean approaches normal as n grows." },
    { q: "The Central Limit Theorem is about the shape of…", o: ["the raw data", "the population", "the sampling distribution of the mean", "the residuals"], a: 2, why: "The CLT never claims your data become normal — only that averages of samples do." },
    { q: "As the sample size increases, the sampling distribution of the mean becomes…", o: ["wider and more skewed", "narrower and more normal", "wider and more normal", "unchanged"], a: 1, why: "Two effects at once: SE = σ/√n shrinks the spread, and the CLT pulls the shape toward normal." }
  ],
  "confidence-intervals": [
    { q: "A 95% CI for a mean is [4.2, 6.8]. The '95%' describes…", o: ["the probability the true mean is between 4.2 and 6.8", "the long-run success rate of the interval-building procedure", "the share of data inside the interval", "the power of the study"], a: 1, why: "Any single interval either contains μ or not. 95% of intervals built this way, across repeated studies, would capture it." },
    { q: "Holding everything else fixed, a 99% confidence interval compared to a 95% one is…", o: ["narrower", "wider", "the same width", "shifted to the right"], a: 1, why: "More confidence requires casting a wider net — you trade precision for coverage." },
    { q: "Which change makes a confidence interval narrower?", o: ["a smaller sample", "more variable data", "a larger sample", "a higher confidence level"], a: 2, why: "Larger n shrinks the standard error, and the interval's width is a multiple of the SE." }
  ],
  "hypothesis-testing-logic": [
    { q: "The null hypothesis typically states that…", o: ["your theory is correct", "there is no effect or difference", "the sample is biased", "the data are normal"], a: 1, why: "H₀ is the skeptical default — 'nothing is going on' — that the test tries to discredit with evidence." },
    { q: "You get p = 0.03. This means…", o: ["there's a 3% chance the null is true", "the effect is large", "data this extreme would occur 3% of the time if the null were true", "you've proven the alternative"], a: 2, why: "The p-value conditions on H₀ being true — it is not the probability that H₀ is true." },
    { q: "A study fails to find a real effect that actually exists. That's a…", o: ["Type I error", "Type II error", "sampling error", "Type III error"], a: 1, why: "Missing a real effect is the false negative — Type II. Its probability is β, and power = 1 − β." }
  ],
  "one-sample-and-paired-t-tests": [
    { q: "We use t instead of z mainly because…", o: ["samples are never random", "we estimate the population SD from the sample, adding uncertainty", "the population isn't normal", "t is more powerful"], a: 1, why: "Replacing σ with the sample estimate s makes the statistic noisier; the t-distribution's fat tails account for that." },
    { q: "Each participant's anxiety is measured before and after therapy. The right test is…", o: ["independent-samples t-test", "paired t-test", "one-way ANOVA", "chi-square test"], a: 1, why: "Same people, two moments — analyze the within-person difference scores with a paired t-test." },
    { q: "As degrees of freedom increase, the t-distribution…", o: ["gets flatter and wider", "approaches the normal distribution", "becomes skewed", "stays exactly the same"], a: 1, why: "With more data the SD estimate stabilizes, the extra uncertainty fades, and t converges to z." }
  ],
  "independent-samples-t-test": [
    { q: "An independent-samples t-test is appropriate when comparing…", o: ["one group at two times", "two separate, unrelated groups", "three or more groups", "two categorical variables"], a: 1, why: "Independent = different people in each group, e.g. treatment vs. control." },
    { q: "The denominator of the independent t statistic measures…", o: ["the difference between the means", "the pooled effect size", "how much a mean difference this size would vary by chance", "the sample size"], a: 2, why: "t = (difference between means) / (standard error of that difference) — signal over noise." },
    { q: "When the two groups have clearly unequal variances, a safer choice is…", o: ["a paired t-test", "Welch's t-test", "a chi-square test", "a larger alpha"], a: 1, why: "Welch's version doesn't pool the variances and adjusts the df — it's robust to unequal spread (and many stats programs default to it)." }
  ],
  "effect-size-and-power": [
    { q: "Cohen's d = 0.5 means the two group means differ by…", o: ["0.5 points", "half a standard deviation", "50%", "0.5 standard errors"], a: 1, why: "d expresses the gap in SD units, so it's comparable across studies and measures." },
    { q: "With a huge sample, p < .001 but d = 0.02. The honest conclusion is…", o: ["a very important effect", "a real but trivially small effect", "a Type I error", "the test was invalid"], a: 1, why: "Big n can make tiny effects 'significant.' The p-value speaks to existence; the effect size speaks to importance." },
    { q: "Statistical power is the probability of…", o: ["rejecting a true null", "detecting an effect that truly exists", "replicating a study", "getting p = 0.05"], a: 1, why: "Power = P(reject H₀ | effect is real) = 1 − β. It grows with n, effect size, and alpha." }
  ],

  /* ---------- Stats 2 — Comparing Groups & Relationships ---------- */
  "one-way-anova": [
    { q: "With 4 groups, why not just run six t-tests between every pair?", o: ["t-tests can't handle 4 groups", "each extra test inflates the overall Type I error rate", "ANOVA is easier to compute", "t-tests need bigger samples"], a: 1, why: "Six tests at α = .05 give ≈ 26% chance of at least one false positive. ANOVA asks one omnibus question at one α." },
    { q: "The F-ratio compares…", o: ["the largest mean to the smallest", "between-group variance to within-group variance", "the sample sizes", "the medians"], a: 1, why: "F = signal/noise: how much means differ from each other vs. how much people differ within groups." },
    { q: "A significant one-way ANOVA tells you…", o: ["which groups differ", "at least one group mean differs from the others", "all groups differ from each other", "the effect is large"], a: 1, why: "It's an omnibus test — 'a difference exists somewhere.' Post-hoc tests find where." }
  ],
  "post-hoc-tests": [
    { q: "Post-hoc tests exist to solve the problem of…", o: ["small samples", "multiple comparisons inflating false positives", "non-normal data", "unequal group sizes"], a: 1, why: "Following up an ANOVA means many pairwise looks; post-hoc procedures control the familywise error rate." },
    { q: "The Bonferroni correction with 5 tests at overall α = .05 requires each test to reach…", o: ["p < .05", "p < .01", "p < .025", "p < .001"], a: 1, why: "Divide α by the number of tests: .05 / 5 = .01 per test. Simple, but conservative as tests multiply." },
    { q: "Compared to Bonferroni, Tukey's HSD is…", o: ["more conservative", "designed for all pairwise comparisons and usually less conservative there", "only valid for two groups", "a non-parametric test"], a: 1, why: "Tukey's HSD is built exactly for the all-pairs situation, so it protects the familywise rate with less lost power." }
  ],
  "factorial-anova-two-way": [
    { q: "A 2×3 factorial design has…", o: ["five conditions", "six conditions", "two outcomes", "three factors"], a: 1, why: "Two levels of one factor crossed with three of the other = 6 cells — and every combination is tested." },
    { q: "An interaction in a two-way ANOVA means…", o: ["both main effects are significant", "the effect of one factor depends on the level of the other", "the factors are correlated", "the design is unbalanced"], a: 1, why: "Interaction = the lines in the cell-means plot aren't parallel; one factor's story changes across the other's levels." },
    { q: "Drug improves symptoms for young patients but worsens them for old patients. Reporting only the drug's main effect would…", o: ["be fine — main effects come first", "mislead, because the interaction reverses the effect across ages", "double-count the data", "inflate the F statistic"], a: 1, why: "With a strong (here, crossover) interaction, the 'average' effect can describe nobody — interpret the interaction first." }
  ],
  "repeated-measures-anova": [
    { q: "The big statistical advantage of a repeated-measures design is…", o: ["it needs no assumptions", "consistent individual differences are removed from the error term", "it eliminates order effects", "it always has more groups"], a: 1, why: "Each person serves as their own control, so stable between-person variability stops counting as noise — more power from fewer people." },
    { q: "Sphericity is the assumption that…", o: ["the data are normal", "variances of all pairwise condition differences are equal", "groups are independent", "the design is balanced"], a: 1, why: "RM-ANOVA assumes difference scores are equally variable across condition pairs; violations are corrected with e.g. Greenhouse–Geisser." },
    { q: "A worry unique to repeated-measures designs (vs. between-subjects) is…", o: ["outliers", "practice and carryover effects across conditions", "unequal variances", "measurement error"], a: 1, why: "Doing all conditions means earlier ones can contaminate later ones — hence counterbalancing the order." }
  ],
  "assumptions-and-when-they-break": [
    { q: "The assumption whose violation is usually MOST serious for t-tests and ANOVA is…", o: ["normality", "equal variances", "independence of observations", "balanced group sizes"], a: 2, why: "Normality and variance issues are often survivable; dependent observations (e.g. classmates chatting) quietly wreck the error calculations." },
    { q: "Thanks to the CLT, moderate non-normality with large samples typically…", o: ["invalidates the test", "barely matters for tests about means", "flips the direction of effects", "requires a chi-square test instead"], a: 1, why: "Tests about means ride on the sampling distribution of the mean, which normalizes as n grows." },
    { q: "Unequal variances are most dangerous when…", o: ["group sizes are also unequal", "samples are large", "data are normal", "there are only two groups"], a: 0, why: "With unequal n, the pooled error is dominated by the wrong group and the test's true error rate drifts — Welch's test fixes this." }
  ],
  "non-parametric-alternatives": [
    { q: "The non-parametric counterpart of the independent-samples t-test is…", o: ["Friedman's test", "the Mann-Whitney U test", "Levene's test", "the sign test"], a: 1, why: "Mann-Whitney U compares two independent groups using ranks. (Wilcoxon signed-rank handles the paired case; Kruskal-Wallis handles 3+ groups.)" },
    { q: "Rank-based tests achieve robustness by…", o: ["deleting outliers", "replacing values with their positions in the sorted data", "assuming normality of ranks", "using larger samples"], a: 1, why: "The biggest outlier becomes just 'rank n' — extreme values lose their leverage." },
    { q: "When the data actually ARE normal, using a rank test instead of a t-test costs you…", o: ["nothing", "a little power", "the ability to compute p-values", "independence"], a: 1, why: "Rank tests are slightly less efficient when parametric assumptions hold — the price of their robustness is small but real." }
  ],
  "chi-square-tests": [
    { q: "Chi-square tests are designed for…", o: ["means of numeric data", "counts in categories", "correlations", "medians"], a: 1, why: "χ² compares observed category counts with the counts expected under the null — no means involved." },
    { q: "In a test of independence, expected cell counts come from…", o: ["a pilot study", "row total × column total ÷ grand total", "the smallest cell", "the observed counts"], a: 1, why: "That formula gives the counts you'd see if the two variables were perfectly unrelated." },
    { q: "A significant χ² on a huge sample means the association is…", o: ["strong", "real, but possibly tiny — check an effect size like Cramér's V", "causal", "linear"], a: 1, why: "χ² grows with n, so significance ≠ strength. Report Cramér's V or an odds ratio for magnitude." }
  ],
  "correlation": [
    { q: "Which r describes the STRONGEST linear relationship?", o: ["r = +0.55", "r = −0.80", "r = +0.10", "r = 0"], a: 1, why: "Strength is the absolute value: |−0.80| > |+0.55|. The sign only gives the direction." },
    { q: "Study time and exam score correlate at r = .60. This shows that…", o: ["studying causes higher scores", "the two variables tend to rise together", "60% of scores are explained", "everyone who studies scores high"], a: 1, why: "Correlation is association, not causation — and r² (= .36), not r, gives shared variance." },
    { q: "One wild outlier in a small dataset can…", o: ["not affect r", "drastically inflate or deflate r", "only change r's sign", "make r exceed 1"], a: 1, why: "Pearson's r is built from means and SDs, all outlier-sensitive — always scatterplot before you trust r." }
  ],
  "simple-linear-regression": [
    { q: "In ŷ = 12 + 0.8x (hours studied → exam score), the 0.8 means…", o: ["the score for zero hours", "each extra hour predicts 0.8 more points", "80% of variance explained", "the correlation is 0.8"], a: 1, why: "The slope is the predicted change in y per one-unit change in x; 12 is the intercept (predicted score at x = 0)." },
    { q: "Least squares picks the line that minimizes…", o: ["the sum of residuals", "the sum of squared residuals", "the number of outliers", "the slope"], a: 1, why: "Squaring keeps misses from canceling and penalizes big misses heavily — that criterion defines THE regression line." },
    { q: "A residual is…", o: ["observed y minus predicted y", "predicted y minus the mean", "the slope error", "an outlier"], a: 0, why: "Residual = what the model missed for that point. Positive = the point sits above the line." }
  ],
  "regression-diagnostics": [
    { q: "A healthy residuals-vs-fitted plot looks like…", o: ["a clear curve", "a funnel that widens", "a shapeless, even band around zero", "a straight diagonal line"], a: 2, why: "Structure in the residuals means structure the model missed. Boring residuals = good model." },
    { q: "Residuals that fan out (wider at larger fitted values) indicate…", o: ["non-linearity", "heteroscedasticity", "multicollinearity", "autocorrelation"], a: 1, why: "That funnel is non-constant error variance — SEs and p-values are computed as if spread were constant." },
    { q: "A point with extreme x that also pulls the fitted line toward itself is called…", o: ["a residual", "an influential point (high leverage)", "a confounder", "a collider"], a: 1, why: "Leverage (unusual x) plus discrepancy = influence — Cook's distance flags such points; try the fit with and without it." }
  ],

  /* ---------- Stats 3 — Advanced Modeling ---------- */
  "multiple-regression": [
    { q: "In a multiple regression, each coefficient represents the predictor's effect…", o: ["ignoring the other predictors", "holding the other predictors constant", "only when others are zero", "on the other predictors"], a: 1, why: "That 'all else equal' reading is the whole point — it's how regression statistically controls for other variables." },
    { q: "Exercise predicts health with r = .4, but the regression coefficient for exercise (controlling for age) is near 0. A likely reason is…", o: ["the data are wrong", "age drives both exercise and health", "the model has too few predictors", "r was computed incorrectly"], a: 1, why: "Controlling for a confounder can absorb a simple association — the raw correlation was partly age in disguise." },
    { q: "R² = .35 in a multiple regression means…", o: ["each predictor explains 35%", "the model explains 35% of outcome variance", "35% of predictions are correct", "the correlation between predictors is .35"], a: 1, why: "R² pools the model's total explanatory share of the outcome's variance." }
  ],
  "multicollinearity-and-variable-selection": [
    { q: "A VIF of 10 for a predictor means…", o: ["it explains 10% of the outcome", "its coefficient's variance is 10× larger than if predictors were uncorrelated", "it should always be deleted", "the model fails"], a: 1, why: "VIF measures how much overlap with other predictors inflates that coefficient's uncertainty; 10 is a common alarm level." },
    { q: "A telltale sign of multicollinearity is…", o: ["a low R²", "a high R² while individual predictors all look non-significant", "residuals that fan out", "a significant intercept"], a: 1, why: "The predictors jointly explain a lot, but their overlap makes it impossible to credit any one of them — big SEs, unstable signs." },
    { q: "Multicollinearity mainly damages…", o: ["the model's overall predictions", "the interpretation and stability of individual coefficients", "the residual plot", "the outcome variable"], a: 1, why: "Prediction can stay excellent; it's the 'which variable matters' question that becomes unanswerable." }
  ],
  "categorical-predictors-and-dummy-coding": [
    { q: "A 4-category predictor (e.g. four majors) enters a regression as…", o: ["one variable coded 1–4", "three 0/1 dummy variables", "four dummy variables", "it can't be used"], a: 1, why: "k categories need k − 1 dummies; the left-out category becomes the reference the others are compared to. Coding 1–4 would fake an ordered, evenly-spaced scale." },
    { q: "The coefficient on one dummy variable is…", o: ["that group's mean", "the difference between that group's mean and the reference group's (adjusted for other predictors)", "the group's sample size", "the grand mean"], a: 1, why: "Dummies measure distance from the reference category — which is what the intercept represents." },
    { q: "Changing which category is the reference changes…", o: ["the model's R² and fit", "the individual dummy coefficients and their p-values, but not the fit", "the outcome variable", "nothing at all"], a: 1, why: "It's the same model in different clothes — comparisons are re-expressed against a new baseline, but predictions and R² are identical." }
  ],
  "interactions-in-regression": [
    { q: "Including x₁ × x₂ in a regression lets you test whether…", o: ["x₁ and x₂ are correlated", "the effect of x₁ on y changes with the level of x₂", "both predictors are needed", "the model is linear"], a: 1, why: "The product term's coefficient is the change in x₁'s slope per unit of x₂ — moderation, in one number." },
    { q: "With a significant interaction in the model, the coefficient on x₁ alone represents…", o: ["the average effect of x₁", "x₁'s effect specifically when x₂ = 0", "a meaningless number", "the main effect at all levels"], a: 1, why: "In an interaction model, lower-order terms are conditional effects at the other variable's zero — which is why centering predictors helps interpretation." },
    { q: "The standard way to understand a significant interaction is to…", o: ["drop the main effects", "plot and test simple slopes at chosen levels of the moderator", "square the predictors", "report R² only"], a: 1, why: "Simple-slopes analysis shows x₁'s effect at, say, low/mean/high x₂ — turning an abstract product term into a story." }
  ],
  "mediation-and-indirect-effects": [
    { q: "In X → M → Y mediation, the indirect effect equals…", o: ["a + b", "a × b (the product of the two paths)", "c − c' only", "the correlation of X and Y"], a: 1, why: "The effect transmitted through the mediator is path a (X→M) times path b (M→Y controlling X)." },
    { q: "The modern way to test an indirect effect's significance is…", o: ["the Sobel z-test", "a bootstrap confidence interval for a×b", "two separate t-tests", "checking that c' = 0"], a: 1, why: "The product a×b has a skewed sampling distribution; bootstrapping respects that where Sobel's normal approximation doesn't." },
    { q: "A mediator differs from a moderator because a mediator…", o: ["changes the strength of an effect", "lies on the causal path and transmits the effect", "is always categorical", "reduces power"], a: 1, why: "Mediation is 'how/why' (a mechanism in the chain); moderation is 'when/for whom' (an interaction)." }
  ],
  "logistic-regression": [
    { q: "Logistic regression is the right tool when the outcome is…", o: ["a count", "binary (yes/no)", "continuous and skewed", "a rank"], a: 1, why: "It models the probability of a two-category outcome; linear regression would happily predict probabilities below 0 or above 1." },
    { q: "An odds ratio of 1.0 for a predictor means…", o: ["a perfect effect", "no association with the outcome", "the odds double", "the model failed"], a: 1, why: "OR = 1 leaves the odds unchanged; above 1 raises them, below 1 lowers them. (Check whether the CI excludes 1.)" },
    { q: "In logistic regression, a one-unit increase in a predictor changes the outcome's…", o: ["probability by a fixed amount", "log-odds by a fixed amount", "mean by the coefficient", "variance"], a: 1, why: "The model is linear in log-odds. The same log-odds step changes probability a lot near p = .5 and barely at the extremes — that's the S-curve." }
  ],
  "assumptions-of-regression": [
    { q: "The normality assumption in linear regression is about…", o: ["the predictors", "the outcome's raw distribution", "the residuals", "the sample size"], a: 2, why: "Only the errors around the line need be normal — skewed predictors and outcomes are fine if the residuals behave." },
    { q: "Fitting a straight line to a clearly U-shaped relationship violates…", o: ["independence", "linearity", "homoscedasticity", "normality"], a: 1, why: "Linearity is assumption #1: the model's very form must match the relationship, or every coefficient is a distortion." },
    { q: "Violated homoscedasticity mainly biases…", o: ["the slope estimates", "the standard errors, hence CIs and p-values", "R²", "the residual means"], a: 1, why: "The line itself stays unbiased; it's the uncertainty math that assumed constant spread. Robust (sandwich) SEs are a common fix." }
  ],
  "model-comparison": [
    { q: "Adding any predictor — even random noise — will never decrease…", o: ["adjusted R²", "plain R²", "AIC", "the F statistic"], a: 1, why: "R² can only rise as terms are added, which is why it can't judge whether a bigger model is genuinely better." },
    { q: "AIC and BIC balance…", o: ["power and alpha", "model fit against model complexity", "sample size and effect size", "bias and variance of residuals"], a: 1, why: "Both reward likelihood and charge a penalty per parameter (BIC charges more with large n). Lower = better." },
    { q: "A nested-model F test (or likelihood-ratio test) asks whether…", o: ["two unrelated models differ", "the added predictors improve fit more than chance would", "residuals are normal", "the intercepts are equal"], a: 1, why: "It compares a model with and without a block of terms — significant means the extra terms earn their keep." }
  ],
  "factor-analysis-pca": [
    { q: "Factor analysis and PCA are used to…", o: ["compare group means", "reduce many correlated variables to a few underlying dimensions", "test causal claims", "handle missing data"], a: 1, why: "Twenty questionnaire items might really measure two or three latent constructs — these methods find that structure." },
    { q: "A scree plot helps you decide…", o: ["which rotation to use", "how many factors/components to retain", "whether data are normal", "the sample size"], a: 1, why: "You look for the 'elbow' where additional components stop explaining meaningful variance (eigenvalues flatten out)." },
    { q: "An item's loading on a factor represents…", o: ["its mean", "how strongly it correlates with that latent factor", "its measurement error", "its sample size"], a: 1, why: "Loadings map items to factors — items loading ≥ ~.4 on a factor usually define its meaning." }
  ],
  "power-analysis-for-complex-designs": [
    { q: "An a priori power analysis answers the question…", o: ["was my result significant?", "how many participants do I need to reliably detect the effect I expect?", "what was my observed power?", "which test should I use?"], a: 1, why: "You fix the expected effect size, α, and desired power (often .80), and solve for n — before collecting data." },
    { q: "Which combination demands the LARGEST sample?", o: ["big effect, α = .05, power = .80", "small effect, α = .01, power = .95", "big effect, α = .01, power = .80", "small effect, α = .05, power = .80"], a: 1, why: "Small effects, stricter alpha, and higher desired power each push n up — together they push it up dramatically." },
    { q: "Running a study with 20% power and finding nothing tells you…", o: ["the effect doesn't exist", "almost nothing — the study rarely could have found it anyway", "the effect is small", "alpha was too low"], a: 1, why: "An underpowered null is uninformative: even a real, decent-sized effect would usually be missed at 20% power." }
  ],

  /* ---------- Stats 4 — Modern & Advanced ---------- */
  "bootstrap-and-resampling": [
    { q: "One bootstrap resample is created by drawing n observations from your sample…", o: ["without replacement", "with replacement", "from the population", "from a normal curve"], a: 1, why: "Sampling WITH replacement is the trick — each resample is the same size but a different mix, mimicking sampling variability." },
    { q: "A 95% percentile bootstrap CI runs from…", o: ["mean ± 2 SD of the data", "the 2.5th to the 97.5th percentile of the bootstrap statistics", "the min to the max resample", "0 to the observed statistic"], a: 1, why: "Compute the statistic in thousands of resamples and chop 2.5% off each tail of that distribution." },
    { q: "The bootstrap is especially valuable for statistics like the median or a ratio because…", o: ["they have no sampling error", "no simple standard-error formula exists for them", "they're always normal", "they need smaller samples"], a: 1, why: "The mean has σ/√n; most other statistics don't have tidy formulas — resampling replaces the missing math." }
  ],
  "bayesian-thinking": [
    { q: "Bayes' theorem combines the prior with the ___ to produce the posterior.", o: ["p-value", "likelihood", "confidence level", "standard error"], a: 1, why: "Posterior ∝ prior × likelihood — belief before, evidence from data, belief after." },
    { q: "The key philosophical difference: Bayesians treat a parameter as…", o: ["a fixed known number", "a quantity with a probability distribution describing our uncertainty", "always zero under H₀", "an observed statistic"], a: 1, why: "Frequentists see θ as fixed and let data vary; Bayesians put the probability directly on θ." },
    { q: "As data accumulate, two analysts with different (reasonable) priors will typically…", o: ["diverge further", "converge to similar posteriors", "both keep their priors", "reach opposite conclusions"], a: 1, why: "The likelihood eventually dominates: with enough evidence, the data outvote the prior." }
  ],
  "bayesian-estimation": [
    { q: "A 95% credible interval of [0.2, 0.8] means…", o: ["95% of samples land there", "given the model and data, the parameter has a 95% probability of lying in [0.2, 0.8]", "the same as a confidence interval", "p = 0.95"], a: 1, why: "That direct probability statement about the parameter is exactly what confidence intervals can't offer." },
    { q: "With only a handful of observations, the posterior is pulled strongly toward…", o: ["zero", "the prior", "the sample mean", "the maximum likelihood estimate"], a: 1, why: "Little data = weak likelihood, so the prior carries more weight; the influence fades as n grows." },
    { q: "The posterior distribution's spread represents…", o: ["measurement error", "our remaining uncertainty about the parameter", "the data's variance", "the prior's error"], a: 1, why: "A wide posterior = still unsure; a narrow one = the data pinned the parameter down." }
  ],
  "generalized-linear-models": [
    { q: "The 'link function' in a GLM…", o: ["links predictors to each other", "connects the linear predictor to the outcome's mean on a suitable scale", "removes outliers", "tests significance"], a: 1, why: "Logit for binary, log for counts — the link puts the straight-line machinery on a scale where it makes sense." },
    { q: "For count outcomes (0, 1, 2, …) the classic GLM choice is…", o: ["linear regression", "Poisson regression with a log link", "logistic regression", "ANOVA"], a: 1, why: "Poisson regression keeps predictions positive and models counts natively; coefficients exponentiate into rate ratios." },
    { q: "When count data show variance much larger than the mean (overdispersion), a better model is…", o: ["plain Poisson", "negative binomial (or quasi-Poisson)", "OLS on log(y)", "chi-square"], a: 1, why: "Poisson assumes variance = mean; real counts usually overdisperse, making Poisson SEs too small and p-values too confident." }
  ],
  "mixed-and-multilevel-models": [
    { q: "You have 30 test scores from each of 20 schools. Treating all 600 as independent would…", o: ["be fine — n is large", "understate uncertainty, because students within a school resemble each other", "reduce power", "violate normality"], a: 1, why: "Clustering means fewer effective observations than 600; ignoring it gives falsely small SEs and false positives." },
    { q: "A random intercept for schools lets each school have…", o: ["its own slope for every predictor", "its own baseline level, drawn from a distribution", "a different outcome variable", "a separate model"], a: 1, why: "Random intercepts capture stable school-to-school level differences with just one variance parameter." },
    { q: "An ICC of 0.30 means…", o: ["30% of students improved", "30% of the outcome variance lies between clusters", "the model explains 30%", "correlation between predictors is .30"], a: 1, why: "The intraclass correlation is the share of variance at the group level — even ICCs of .05–.10 make clustering worth modeling." }
  ],
  "cross-validation-and-overfitting": [
    { q: "Overfitting means a model has learned…", o: ["too little from the data", "the noise in its training data, not just the signal", "only linear patterns", "the wrong outcome"], a: 1, why: "It memorized quirks that won't reappear — training accuracy climbs while new-data accuracy falls." },
    { q: "In 10-fold cross-validation, the model is trained…", o: ["once on all data", "10 times, each time leaving out a different tenth for testing", "on 10% of the data", "until it fits perfectly"], a: 1, why: "Every observation gets to be test data exactly once, giving an honest estimate of out-of-sample performance." },
    { q: "As you make a model ever more flexible, test-set error typically…", o: ["falls forever", "falls, then rises again as overfitting kicks in", "stays constant", "equals training error"], a: 1, why: "That U-shape is the bias-variance tradeoff: too simple misses signal, too flexible absorbs noise." }
  ],
  "causal-dags-and-confounding": [
    { q: "In the DAG X ← Z → Y, the variable Z is…", o: ["a mediator", "a confounder — adjust for it", "a collider — leave it alone", "an outcome"], a: 1, why: "Z causes both X and Y, opening a backdoor path that fakes an X–Y association unless you adjust for Z." },
    { q: "In X → C ← Y, adjusting for C…", o: ["removes bias", "creates a spurious X–Y association out of nothing", "is required", "has no effect"], a: 1, why: "C is a collider: the path through it is already blocked. Conditioning on it opens the path — adjustment can CAUSE bias." },
    { q: "To estimate the total causal effect of X on Y, a mediator M on the X → M → Y path should be…", o: ["always adjusted for", "left unadjusted — adjusting blocks part of the very effect you want", "treated as a confounder", "deleted from the data"], a: 1, why: "Controlling the mediator removes the transmitted effect; you'd estimate only the direct remainder. Which variables to adjust depends on the DAG, not on 'more controls = better.'" }
  ],
  "survival-analysis": [
    { q: "A participant leaves your 12-month study, event-free, at month 7. In survival analysis their data are…", o: ["discarded", "kept as censored — informative for the 7 months observed", "counted as an event at month 7", "extended to month 12"], a: 1, why: "Censoring keeps them in the risk set exactly as long as observed; throwing them out (or calling it an event) would bias the curve." },
    { q: "The Kaplan–Meier curve steps down…", o: ["at every censoring time", "each time an event occurs", "at regular monthly intervals", "only at the study's end"], a: 1, why: "Events multiply the survival estimate by (1 − events/at-risk) at that moment; censorings shrink only the at-risk count." },
    { q: "A hazard ratio of 0.5 for treatment vs. control means the treated group's instantaneous event rate is…", o: ["half the control group's", "twice the control group's", "0.5% overall", "unrelated to control"], a: 0, why: "HR compares momentary risks: 0.5 = half the hazard at any given time (under proportional hazards)." }
  ],
  "missing-data": [
    { q: "A depression questionnaire is skipped more often by the MOST depressed respondents. That missingness is…", o: ["MCAR", "MAR", "MNAR — driven by the missing value itself", "harmless"], a: 2, why: "When the probability of being missing depends on the unobserved value, it's Missing Not At Random — the hardest case." },
    { q: "Replacing every missing value with the variable's mean…", o: ["is the recommended modern fix", "shrinks variance and weakens correlations artificially", "only affects the mean", "makes data MCAR"], a: 1, why: "A spike of identical values fakes certainty: spread collapses, relationships flatten, SEs shrink dishonestly." },
    { q: "Multiple imputation beats single imputation because it…", o: ["fills in more accurate values", "propagates the uncertainty of not knowing, via several plausible completed datasets", "needs no assumptions", "runs faster"], a: 1, why: "Filling the holes several different ways and pooling results keeps honest standard errors — the point isn't the values, it's the uncertainty." }
  ],
  "meta-analysis": [
    { q: "In a meta-analysis, each study's weight mainly reflects…", o: ["its publication year", "its precision (larger, less variable studies count more)", "its authors' reputation", "its p-value"], a: 1, why: "Pooling weights by inverse variance: precise studies pull the summary estimate hardest." },
    { q: "In a forest plot, the diamond at the bottom shows…", o: ["the largest study", "the pooled effect and its confidence interval", "the range of all studies", "publication bias"], a: 1, why: "The diamond's center is the combined estimate; its width is the CI. If it doesn't cross the no-effect line, the pooled effect is significant." },
    { q: "A funnel plot with a missing bottom-left corner (small studies with small effects absent) suggests…", o: ["high heterogeneity", "publication bias", "a calculation error", "low power in the meta-analysis"], a: 1, why: "Small null studies are the ones that tend to go unpublished — their absence makes the funnel asymmetric and the pooled effect optimistic." }
  ]
};
