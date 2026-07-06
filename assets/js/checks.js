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
  "ancova": [
    { q: "ANCOVA compares group means…", o: ["on the covariate itself", "after statistically holding a covariate constant", "only in randomized experiments", "without any assumptions"], a: 1, why: "It fits the covariate–outcome slope within groups and compares the groups at the same covariate value — the adjusted means." },
    { q: "The treatment group started 10 points higher on the pretest (which strongly predicts the outcome). A raw t-test on outcomes will…", o: ["be unaffected", "mix the head start into the 'treatment effect'", "always be non-significant", "have the wrong degrees of freedom"], a: 1, why: "Raw means carry the baseline advantage along; ANCOVA subtracts slope × (covariate gap) to remove it." },
    { q: "ANCOVA's extra assumption beyond ANOVA's is…", o: ["equal sample sizes", "homogeneity of regression slopes (parallel lines across groups)", "a binary covariate", "at least three groups"], a: 1, why: "One 'adjusted difference' only exists if the covariate's slope is the same in every group; if not, model the interaction instead." }
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
  "manova": [
    { q: "The main reasons to use MANOVA instead of separate ANOVAs on each outcome are…", o: ["it's easier to run", "it controls alpha inflation AND uses the correlation between outcomes", "it needs fewer participants", "it requires no assumptions"], a: 1, why: "One multivariate test avoids stacking Type I error across outcomes, and the covariance structure lets it detect patterns no single outcome shows." },
    { q: "Two correlated outcomes each shift by a small, non-significant amount — but in OPPOSITE directions. MANOVA is likely to be…", o: ["also non-significant", "significant, because that pattern defies the correlation structure", "invalid", "identical to the larger univariate test"], a: 1, why: "Correlated outcomes normally move together; a treatment pushing them apart is very surprising in Mahalanobis distance terms — the multivariate test sees that." },
    { q: "Wilks' Λ = .40 for the group effect means roughly…", o: ["40% of outcome variance is unexplained by groups", "the effect is non-significant", "40% of cases were misclassified", "groups explain 40% of the variance"], a: 0, why: "Λ is the unexplained share — smaller Λ = stronger group effect (1 − Λ is a rough multivariate effect size)." }
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
  ],

  /* ---------------- Methods — Research Design ---------------- */
  "from-question-to-hypothesis": [
    { q: "A hypothesis is scientific only if…", o: ["it is proven true before you test it", "there is some possible result that would show it false", "it is about human behaviour", "it uses technical language"], a: 1, why: "Falsifiability is the test: a hypothesis must make a risky prediction that some outcome could refute. A claim nothing could disprove isn't scientific." },
    { q: "\"Music changes recall\" versus \"music lowers recall\" — the second one is…", o: ["non-directional", "directional (one-tailed)", "the null hypothesis", "not falsifiable"], a: 1, why: "Predicting which way the effect goes makes it a directional (one-tailed) alternative hypothesis." },
    { q: "The null hypothesis (H₀) typically states that…", o: ["exactly what you hope to find is true", "there is no effect or no difference", "the sample is biased", "the effect is large"], a: 1, why: "H₀ is the boring 'nothing is going on' claim you assume in order to test your prediction against it." }
  ],
  "variables-and-operationalization": [
    { q: "Defining stress as \"salivary cortisol in µg/dL\" is a…", o: ["conceptual definition", "operational definition", "confound", "hypothesis"], a: 1, why: "An operational definition states exactly how a construct will be measured — the concrete, number-producing recipe." },
    { q: "In \"coffee vs. decaf → reaction time,\" reaction time is the…", o: ["independent variable", "dependent variable", "confound", "control"], a: 1, why: "The dependent variable is the measured outcome you check to see whether the IV mattered." },
    { q: "The coffee group also happened to be tested earlier in the day. Time of day is a…", o: ["dependent variable", "confound", "control variable", "operational definition"], a: 1, why: "It differs along with the groups and also affects the outcome — a rival explanation, i.e. a confound." }
  ],
  "reliability-and-validity": [
    { q: "A bathroom scale that always reads 3 kg too heavy is…", o: ["reliable but not valid", "valid but not reliable", "both reliable and valid", "neither"], a: 0, why: "It's perfectly consistent (reliable) yet systematically off the true value (invalid) — the dangerous combination." },
    { q: "Cronbach's α measures which kind of reliability?", o: ["test–retest", "inter-rater", "internal consistency", "predictive"], a: 2, why: "α quantifies how well the items within a single scale hang together — internal consistency." },
    { q: "Two raters independently code the same videos and agree strongly. That is good…", o: ["internal consistency", "inter-rater reliability", "external validity", "face validity"], a: 1, why: "Agreement between independent observers of the same thing is inter-rater reliability." }
  ],
  "experimental-design-and-randomization": [
    { q: "The single feature that separates a true experiment from other designs is…", o: ["a large sample", "random assignment of participants to conditions", "using a questionnaire", "measuring people twice"], a: 1, why: "Random assignment is what balances confounds in expectation and licenses the word 'caused'." },
    { q: "Random assignment protects a study's ___, while random sampling protects its ___.", o: ["external validity; internal validity", "internal validity; external validity", "reliability; validity", "power; effect size"], a: 1, why: "Assignment guards internal validity (the causal claim); sampling guards external validity (generalization)." },
    { q: "Why does randomization balance confounds you never even measured?", o: ["it increases the sample size", "chance balances every trait in expectation — measured or not", "it removes outliers", "it makes the two groups identical every time"], a: 1, why: "Chance can't know which trait is which, so it balances all of them on average; not identical every time, but balanced in expectation." }
  ],
  "between-vs-within-designs": [
    { q: "The main statistical advantage of a within-subjects design is that it…", o: ["needs no control condition", "removes individual differences by using each person as their own control", "eliminates all order effects", "guarantees a bigger effect"], a: 1, why: "Each person is their own baseline, so stable individual differences subtract out, shrinking the error term." },
    { q: "A within-subjects design tends to beat a between-subjects one only when the two conditions correlate…", o: ["negatively", "above about 0.5", "exactly zero", "it never matters"], a: 1, why: "Below ~.5 the extra pairing costs more than it saves; above it, removing individual differences wins." },
    { q: "Counterbalancing (e.g. a Latin square) is used mainly to control…", o: ["individual differences", "order and carryover effects", "measurement error", "sampling bias"], a: 1, why: "Counterbalancing spreads order and carryover effects evenly across conditions so they can't masquerade as the treatment effect." }
  ],
  "quasi-experiments": [
    { q: "What makes a design 'quasi-experimental' rather than a true experiment?", o: ["it has no comparison group", "participants are not randomly assigned to conditions", "it uses no statistics", "it measures only one group"], a: 1, why: "A quasi-experiment keeps a treatment and a comparison but drops random assignment." },
    { q: "Comparing only the treated group's before-vs-after change can mislead because…", o: ["the sample is too small", "anything else changing over time is confounded with the treatment", "it uses the wrong test", "it needs a placebo"], a: 1, why: "A shared/secular trend (maturation, season, the economy) moves the outcome regardless of treatment — which is why difference-in-differences adds a comparison group." },
    { q: "Difference-in-differences recovers the true effect only if…", o: ["the groups are the same size", "the two groups would have followed parallel trends without the treatment", "the outcome is normally distributed", "there is no baseline gap"], a: 1, why: "Parallel trends is the key assumption; a differential trend leaks straight into the estimate. A baseline gap is fine — DiD cancels it." }
  ],
  "observational-designs": [
    { q: "Which observational design starts from people who already have the outcome and looks backward at exposure?", o: ["cohort", "cross-sectional", "case-control", "randomized trial"], a: 2, why: "Case-control begins with cases (and controls) and looks back at exposure — efficient for rare outcomes." },
    { q: "A case-control study can report an odds ratio but not a risk ratio because…", o: ["odds ratios are always larger", "the researcher fixed how many cases and controls to enrol, so real risks aren't recoverable", "it has no comparison group", "the outcome is continuous"], a: 1, why: "You chose the case:control ratio, so 'cases ÷ everyone' isn't a genuine risk — only the odds ratio survives that choice." },
    { q: "The odds ratio closely approximates the risk ratio only when…", o: ["the sample is large", "the outcome is rare", "the exposure is rare", "the study is cross-sectional"], a: 1, why: "Under the rare-disease assumption OR ≈ RR; as the outcome becomes common, the odds ratio increasingly overstates the risk ratio." }
  ],
  "sampling-methods": [
    { q: "Splitting the population into groups and sampling within each — usually giving a more precise estimate than simple random sampling — is…", o: ["cluster sampling", "stratified sampling", "convenience sampling", "snowball sampling"], a: 1, why: "Stratified sampling removes between-stratum variation, so its estimates are tighter than SRS for the same n." },
    { q: "The core problem with a convenience sample is that…", o: ["it is too small", "its bias does not shrink as the sample grows", "it needs a random number generator", "it cannot be analysed"], a: 1, why: "Convenience samples are biased, not just noisy — more data gives a more precise wrong answer rather than the truth." },
    { q: "The 1936 Literary Digest poll mailed 10 million ballots yet called the election wrong, mainly because…", o: ["the sample was too small", "the sampling frame (car and phone owners) was unrepresentative", "people lied", "it used stratified sampling"], a: 1, why: "A huge but biased frame beats no bias — sample size can't rescue a biased sampling method." }
  ],
  "survey-and-questionnaire-design": [
    { q: "\"How satisfied are you with the food and the prices?\" is a classic example of a…", o: ["leading question", "double-barreled question", "double negative", "loaded question"], a: 1, why: "It asks two things at once, so anyone who feels differently about the two halves can't answer honestly." },
    { q: "Best-practice advice for the number of points on a Likert rating scale is roughly…", o: ["2–3 points", "5–7 points", "10–12 points", "as many as possible"], a: 1, why: "5–7 points capture real distinctions without offering precision respondents can't actually use." },
    { q: "Including a few reverse-coded items on a scale mainly helps to…", o: ["make the survey longer", "detect acquiescence (straight-line 'agree') responding", "improve social desirability", "avoid double negatives"], a: 1, why: "Reverse-worded items make agree-with-everything responding contradict itself, so it can be caught (then flip them back before scoring)." }
  ],
  "bias-and-blinding": [
    { q: "In a double-blind trial, who is kept unaware of the group assignments?", o: ["only the participants", "only the researchers who assess outcomes", "both the participants and the researchers who interact with them", "only the statistician"], a: 2, why: "Double-blind means neither participants nor the researchers assessing them know the assignment — that's what stops both demand characteristics and experimenter-expectancy bias." },
    { q: "Which bias does blinding do essentially NOTHING to fix?", o: ["placebo effect", "demand characteristics", "selection bias", "experimenter-expectancy bias"], a: 2, why: "Selection bias is baked in at recruitment — who got into the sample. Blinding hides the condition, but it can't change who was enrolled; you need better sampling or randomisation." },
    { q: "A therapist who knows which patients got the new treatment rates them as improving more. This is…", o: ["a placebo effect", "experimenter-expectancy (observer) bias", "attrition bias", "social desirability bias"], a: 1, why: "The assessor's expectation leaks into a subjective rating — the Clever Hans mechanism. Blinding the assessor removes it." }
  ],
  "the-replication-crisis": [
    { q: "The 'garden of forking paths' inflates false positives because…", o: ["samples are always too small", "the analysis chosen depends on the data, so many defensible paths were implicitly available", "researchers fabricate data", "p-values are computed incorrectly"], a: 1, why: "Even without conscious fishing, letting the data steer which of many reasonable analyses you run means the effective false-positive rate is far above 5%." },
    { q: "HARKing refers to…", o: ["running a study with high power", "presenting a hypothesis found after seeing the results as if it were predicted in advance", "sharing data openly", "using a one-tailed test"], a: 1, why: "HARKing — Hypothesising After the Results are Known — dresses a chance pattern up as a confirmed prediction, which is exactly what a p-value can't validate." },
    { q: "Why does publication bias distort the research literature?", o: ["it makes studies too large", "significant, novel results get published while null results sit in the file drawer", "it forces preregistration", "it lowers statistical power"], a: 1, why: "If journals favour positive findings, the published record over-represents flukes and overstates effects — the asymmetry a funnel plot is built to reveal." }
  ],
  "preregistration-and-open-science": [
    { q: "What is the key difference between confirmatory and exploratory analysis?", o: ["confirmatory uses bigger samples", "confirmatory tests a prediction fixed in advance; exploratory searches the data for patterns", "exploratory is always dishonest", "there is no real difference"], a: 1, why: "A p-value means what the textbook says only for a confirmatory test decided before seeing the data; exploratory results are hypotheses for a future study, not decisive tests." },
    { q: "How does a registered report most directly combat publication bias?", o: ["it requires a huge sample", "the journal accepts the study based on its design, before the results exist", "it bans all exploratory analysis", "it guarantees a significant result"], a: 1, why: "In-principle acceptance is granted on the plan, so publication no longer depends on getting p < .05 — null results get published too." },
    { q: "Does a preregistration forbid you from ever changing your analysis?", o: ["yes — the plan is binding no matter what", "no — you may deviate, but you must disclose the change and flag the analysis as no longer strictly confirmatory", "yes, unless the results are significant", "no, and you never need to mention deviations"], a: 1, why: "Preregistration is a plan, not a prison: reality can force changes, but honesty requires you to report what changed and why." }
  ],

  /* ---------------- Data — From Raw to Ready ---------------- */
  "tidy-data": [
    { q: "In a tidy dataset, each column holds…", o: ["one observation", "one variable", "one participant", "one value only if it's numeric"], a: 1, why: "The core rule: each column is one variable, each row one observation, each cell one value." },
    { q: "A grade sheet has columns Quiz 1, Quiz 2, and Final. In tidy terms this is…", o: ["already tidy", "one variable (score) spread across several columns — it should be reshaped long", "too many rows", "missing an ID column"], a: 1, why: "Those three columns are values of one variable, an assessment. Tidy data stacks them into an assessment column and a score column." },
    { q: "Shading a cell red to mean 'resit' breaks tidiness because…", o: ["red is hard to read", "colour is data that no analysis can compute on — it should be an explicit column", "the cell has two values", "it adds a row"], a: 1, why: "Colour-as-data hides a variable in formatting; make it an explicit column (e.g. resit = Yes/No) so it's usable." }
  ],
  "codebooks-and-documentation": [
    { q: "The main audience a codebook is written for is…", o: ["the journal editor", "future-you (and anyone) reopening the file later with no memory of it", "the statistics software", "the ethics committee"], a: 1, why: "A codebook keeps the data legible to whoever opens it later — most often your future self, who has forgotten the details." },
    { q: "Why is storing missing data as the number -99 a landmine?", o: ["it takes up space", "if you forget to declare it as missing, it gets averaged in as a real value", "spreadsheets can't display it", "it is never allowed"], a: 1, why: "A numeric missing code is a real number to the software; undeclared, −99 poisons means and SDs. A blank/NA is safer." },
    { q: "A column grp holds the values 1, 2, 3. The codebook should record it as…", o: ["a continuous measure", "a nominal category (group labels that happen to be numbers)", "an identifier to average", "a date"], a: 1, why: "The numbers are labels for groups, not quantities — nominal. Taking a mean of a group code is meaningless." }
  ],
  "data-entry-and-validation": [
    { q: "A rule that a categorical field must be one of {M, F, Other} is a…", o: ["range check", "allowed-value (set) check", "cross-field check", "double entry"], a: 1, why: "Restricting a field to a fixed list of legal categories is an allowed-value set check; anything outside it is a typo." },
    { q: "Checking that birth_year equals current_year − age is an example of…", o: ["a range check", "an allowed-value check", "cross-field logic (two columns must agree)", "an outlier test"], a: 2, why: "Cross-field validation compares columns that must be consistent with each other, catching errors a single-field range check would miss." },
    { q: "The best time to catch an impossible value like age = 511 is…", o: ["during final analysis", "at data entry, when you can still check the source", "after publication", "never — just delete outliers"], a: 1, why: "Errors are cheapest to fix at the door, when the source is still checkable; found months later, the true value is often unrecoverable." }
  ],
  "data-cleaning-workflow": [
    { q: "The cardinal rule of a data-cleaning workflow is…", o: ["always delete rows with any missing value", "never overwrite the raw file — fix via a script that writes a separate clean file", "clean the data by hand so you can see every change", "round every number to two decimals first"], a: 1, why: "Keeping the raw file read-only and doing every fix in a script is what makes cleaning reproducible, reversible, and auditable." },
    { q: "Why must whitespace be trimmed before standardising category labels?", o: ["trimming makes the file smaller", "\"Control \" and \"Control\" are different strings, so a value-mapping step won't merge them until the space is gone", "standardising deletes spaces automatically", "it isn't necessary — order never matters"], a: 1, why: "A trailing space makes the label a distinct string, so the mapping misses it. The pipeline order (trim, then standardise) is what fixes it." },
    { q: "The biggest advantage of cleaning with a script rather than by hand is that the script…", o: ["runs faster on the computer", "is reproducible and auditable — rerun it on corrected raw data and a co-author can check every step", "never makes mistakes", "removes the need for a codebook"], a: 1, why: "A script re-runs identically, flows corrections through in seconds, and is itself the log of every decision — none of which a hand-edited sheet gives you." }
  ],
  "outliers-in-practice": [
    { q: "The 1.5 × IQR rule resists the very outliers it hunts because it is built from…", o: ["the mean and standard deviation", "quartiles, which a lone extreme barely moves", "the single largest value", "the sample size"], a: 1, why: "Quartiles are robust: one giant value hardly shifts them, so the fence stays put — unlike the mean and SD, which the outlier inflates." },
    { q: "A lab flags an assay batch as faulty; a reading from it is 5 SD above the mean. You should…", o: ["keep it — never remove data", "exclude it and report why (a documented invalid measurement)", "silently delete the whole participant", "replace it with the mean without comment"], a: 1, why: "A documented invalid measurement is excluded and reported — not silently dropped, and not kept as if it were valid data." },
    { q: "Reporting your result both with and without a suspicious extreme value is called…", o: ["a power analysis", "a sensitivity analysis", "winsorising", "double entry"], a: 1, why: "A sensitivity analysis shows the reader how much the conclusion depends on that one point — the honest alternative to a silent deletion." }
  ],
  "transformations-and-recoding": [
    { q: "Which of these does NOT change a variable's skewness?", o: ["a log transform", "a square-root transform", "z-standardising (subtract the mean, divide by SD)", "all of them remove skew"], a: 2, why: "z-scoring is a linear shift-and-stretch: it changes the units to SDs but leaves the shape — and the skew — exactly as it was." },
    { q: "The mean of log-transformed values back-transforms to…", o: ["the arithmetic mean", "the geometric mean, which sits below the arithmetic mean", "the median", "zero"], a: 1, why: "exp(mean of logs) is the geometric mean; for right-skewed data it is smaller than the arithmetic mean, so report which one you used." },
    { q: "Chopping a continuous predictor at its median before correlating it with an outcome…", o: ["strengthens the correlation", "leaves it unchanged", "shrinks the correlation to about 0.8× and loses power", "is required before any t-test"], a: 2, why: "Dichotomising discards the variation within each half; theory shows the correlation drops to roughly 0.80 of its value — about a third of the effect thrown away." }
  ],
  "wide-vs-long-data": [
    { q: "In LONG format, a repeated measurement is stored as…", o: ["one column per timepoint, one row per person", "one row per measurement, with a time column naming the occasion", "a single averaged value per person", "colour-coded cells"], a: 1, why: "Long format has one row per observation; the timepoint that was a column header in wide format becomes a value in a time column." },
    { q: "When you pivot a wide table to long, the column headers T1, T2, T3…", o: ["are deleted", "become values in a new key column (e.g. time)", "stay as column headers", "turn into row IDs"], a: 1, why: "Pivoting longer moves the headers into a key column as data — that's the whole reshape; the numbers move into a matching value column." },
    { q: "Which tool most typically wants data in WIDE format?", o: ["a mixed / multilevel model", "the tidyverse or pandas", "point-and-click repeated-measures ANOVA in SPSS", "JASP's long-format tools"], a: 2, why: "Classic repeated-measures ANOVA in SPSS reads each timepoint as its own column; tidyverse, pandas, JASP mixed models, and multilevel models want long (tidy) data." }
  ],
  "merging-datasets": [
    { q: "A join matches rows across two tables using…", o: ["their row order", "a shared key column, most often an ID", "the number of columns", "alphabetical name order"], a: 1, why: "Joins line rows up by a shared key (usually a participant ID) — never by position, which silently mismatches whenever the tables differ." },
    { q: "You want to attach lab results to your participant list without losing participants who never came in. You need a…", o: ["inner join", "left join (keep every left row, NA where no match)", "right join", "full join that drops non-matches"], a: 1, why: "A left join keeps every row of the left (participant) table and fills NA where the right table has no match — nobody is dropped." },
    { q: "After a join your row count jumped from 200 to 380. The most likely cause is…", o: ["an inner join dropped rows", "the key repeats in one table, so it's a many-to-many join that multiplied rows", "the tables had different columns", "you used a left join"], a: 1, why: "A duplicated (non-unique) key makes every copy match every copy — a many-to-many join that inflates the row count. Check key uniqueness and the before/after count." }
  ],
  "reproducible-workflows": [
    { q: "The core principle of a reproducible analysis is that…", o: ["you should work faster", "the analysis IS a script — a re-runnable recipe from raw data to every reported number", "you must use R, not SPSS", "you delete the raw data once it's clean"], a: 1, why: "A scripted pipeline is reproducible, correctable, and auditable; point-and-click leaves no record of what you did." },
    { q: "Why set a seed (e.g. set.seed(1)) before anything random?", o: ["it makes the code run faster", "it makes the 'random' results identical on every run, so they can be reproduced", "it improves statistical power", "it is required for a t-test"], a: 1, why: "Unseeded randomness (bootstraps, splits, simulations) gives different numbers each run; a fixed seed makes them reproducible." },
    { q: "Imputing missing values and filtering to one group give different answers depending on order because…", o: ["filtering is always done first by the software", "the value you impute depends on which rows are present when you impute", "imputation deletes rows", "the two steps never interact"], a: 1, why: "Imputation fills blanks with a summary (e.g. the mean) of whatever data is present at that moment — so filtering before vs after changes the fill value. Filters, by contrast, commute." }
  ],
  "data-privacy-basics": [
    { q: "Removing names from a dataset makes it…", o: ["fully anonymous", "de-identified — direct identifiers are gone, but quasi-identifiers may still re-identify people", "pseudonymized", "legally unshareable"], a: 1, why: "De-identification removes obvious identifiers, but age + sex + ZIP and other quasi-identifiers can still single people out; that isn't true anonymity." },
    { q: "A quasi-identifier is a field that…", o: ["identifies a person on its own, like a name", "reveals nothing about anyone", "doesn't identify alone but pins people down in combination (age, sex, ZIP)", "is always deleted before analysis"], a: 2, why: "Quasi-identifiers are harmless singly but powerful together — Sweeney showed ZIP + birth date + sex uniquely identify ~87% of Americans." },
    { q: "A dataset is k-anonymous with k = 5 when…", o: ["it has 5 columns", "every person shares their quasi-identifier combination with at least 4 others", "5 people were removed", "5% of rows are unique"], a: 1, why: "k-anonymity means each quasi-identifier combination is shared by at least k people, so no one can be narrowed to a group smaller than k; higher k is safer." }
  ],
  /* Ethics */
  "why-research-ethics": [
    { q: "The three principles of the Belmont Report are…", o: ["reliability, validity, and generalizability", "respect for persons, beneficence, and justice", "consent, funding, and publication", "randomization, blinding, and replication"], a: 1, why: "Belmont names respect for persons (autonomy/consent), beneficence (weighing risk against benefit), and justice (fair distribution of research burdens)." },
    { q: "The Tuskegee study became a landmark case mainly because…", o: ["it used the wrong statistical test", "researchers deceived participants and withheld effective treatment (penicillin) for decades", "its sample was too small", "participants were paid too much"], a: 1, why: "Untreated syphilis, withheld penicillin, and deception about the diagnosis — its 1972 exposure directly produced the modern U.S. ethics-review system." },
    { q: "A modern criticism of the Stanford Prison Experiment is that…", o: ["it was double-blind", "the guards were coached toward cruelty and the sample was tiny and self-selected, so its conclusions are shaky", "it relied too heavily on random assignment", "it had far too large a sample"], a: 1, why: "Recordings and interviews show guards were encouraged to be tough; with a small self-selected sample and the researcher acting as 'superintendent', it is now cited as much for its methodological flaws as its findings." }
  ],
  "informed-consent-and-irb": [
    { q: "Valid informed consent requires all three of…", o: ["information, comprehension, and voluntariness", "a signature, a witness, and a date", "payment, a form, and a deadline", "anonymity, funding, and approval"], a: 0, why: "The participant must be adequately informed, actually understand, and choose freely. A signature missing any of these documents a failure rather than valid consent." },
    { q: "For a research study with a 10-year-old child, the correct standard is…", o: ["the child's signature alone", "parental consent only", "parental consent plus the child's age-appropriate assent", "no permission is needed under 18"], a: 2, why: "A guardian gives consent and the child gives assent; a parent's yes does not override the child's refusal." },
    { q: "Whether a study qualifies as 'exempt' from full ethics review is decided by…", o: ["the researcher, before submitting", "the ethics committee / IRB", "the journal at publication", "the funding agency"], a: 1, why: "'Exempt' is a determination the committee makes — you still submit, and you don't get to self-exempt." }
  ],
  "deception-and-debriefing": [
    { q: "Deception in a study can be justified only when…", o: ["the researcher is short on time", "there is no reasonable alternative, harm is minimal, AND participants are fully debriefed", "the sample is large enough", "participants are paid extra"], a: 1, why: "All three conditions must hold together; miss any one — an available honest design, real distress, or no debrief — and the deception is not defensible." },
    { q: "A key part of a proper debriefing is…", o: ["asking participants to keep the study secret", "revealing the deception and offering the right to withdraw their data", "paying a completion bonus", "collecting a second signature to lock in the data"], a: 1, why: "Because up-front consent couldn't be fully informed, participants get a second decision point after learning the truth: they may have their data deleted." },
    { q: "Overusing deception across a field is self-defeating because…", o: ["it makes studies cheaper to run", "participants grow suspicious and second-guess cover stories, reintroducing the demand characteristics deception was meant to prevent", "it increases statistical power", "it removes the need for consent"], a: 1, why: "Suspicion breeds strategic behaviour, so the very demand characteristics deception avoids creep back in — and public trust erodes for everyone." }
  ]
};
