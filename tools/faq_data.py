# -*- coding: utf-8 -*-
"""Per-lesson FAQ content — the single source of truth for the 'Common questions'
sections. Three Q&As per lesson slug; answers are HTML (links relative to a
lesson page at depth 2, i.e. ../../ reaches the site root).

After editing, re-inject into the lesson pages (idempotent) and refresh search:
    python tools/inject-faqs.py     # run from the repo root
    python tools/build-search-index.py
"""

FAQS_12 = {

# ---------------- STATS 1 ----------------

"what-is-statistics": [
 ("What is the difference between a parameter and a statistic?",
  "A <strong>parameter</strong> is a number that describes the whole population (like the true mean μ) — it's usually unknown. A <strong>statistic</strong> is the matching number computed from your sample (like x̄), which you use to estimate the parameter. Memory hook: <em>p</em>arameter–<em>p</em>opulation, <em>s</em>tatistic–<em>s</em>ample."),
 ("What is the difference between descriptive and inferential statistics?",
  "Descriptive statistics summarizes the data you actually collected — means, standard deviations, charts — and claims nothing beyond it. Inferential statistics uses that sample to draw conclusions about the wider population it came from, which is why it always comes with uncertainty attached (confidence intervals, p-values)."),
 ("Why use a sample instead of measuring the whole population?",
  "Usually you can't measure everyone — the population is too large, too expensive to reach, or partly hypothetical (every <em>possible</em> patient, every future customer). The surprising good news is that a few hundred well-chosen, random observations can estimate a population value remarkably precisely — quantifying exactly <em>how</em> precisely is what <a href=\"../../stats-1/sampling-distributions/\">sampling distributions</a> are for."),
],

"types-of-data": [
 ("What are the four levels of measurement?",
  "Nominal (unordered categories like blood type), ordinal (ordered categories with unequal gaps like survey ratings), interval (equal gaps but no true zero, like °C), and ratio (equal gaps plus a true zero, like height or reaction time). Each level up supports more math — only interval and ratio data have meaningful means and standard deviations."),
 ("Is a Likert scale ordinal or interval data?",
  "Strictly, a single Likert item (\"strongly disagree … strongly agree\") is <strong>ordinal</strong> — the gaps between labels aren't guaranteed equal. In practice, researchers often <em>treat</em> the sum or average of several items as approximately interval, which is usually defensible. For a single item, ordinal-friendly methods (medians, <a href=\"../../stats-2/non-parametric-alternatives/\">rank-based tests</a>) are the safer choice."),
 ("Why can't you calculate a mean for nominal data?",
  "Because nominal categories are labels, not amounts — there is no quantity to average. If you code eye colors as 1, 2, 3 and compute a \"mean of 2.1,\" the number depends entirely on your arbitrary coding and describes nothing real. For nominal data, report counts, percentages, and the mode."),
],

"describing-data": [
 ("When should I use the median instead of the mean?",
  "Use the median when the data is skewed or contains outliers — incomes, house prices, reaction times. The mean gets dragged toward extreme values because it uses every value's actual magnitude; the median only cares about what's in the middle, so it stays a more honest \"typical value.\" For roughly symmetric data the two agree, and the mean is standard."),
 ("Why does the sample standard deviation divide by n − 1 instead of n?",
  "A sample's values are, on average, slightly closer to their own sample mean than to the true population mean — so dividing by n would systematically underestimate the population's spread. Dividing by n − 1 (Bessel's correction) inflates the result just enough to fix that bias. With large samples the difference becomes negligible."),
 ("What does standard deviation actually tell you?",
  "Roughly, the average distance between a data point and the mean — a ruler for \"typical deviation.\" A small SD means values huddle near the mean; a large one means they're spread wide. It's also the unit that <a href=\"../../stats-1/z-scores-and-the-normal-distribution/\">z-scores</a> and effect sizes are measured in, which is why it appears everywhere in statistics."),
],

"visualizing-data": [
 ("How many bins should a histogram have?",
  "There's no single right answer — around 10–20 bins works well for a few hundred observations, and rules like Sturges' or Freedman–Diaconis give reasonable starting points. The practical advice: always try several bin widths. Too few bins hides real structure (like two peaks); too many turns the shape into noise."),
 ("What is the difference between a histogram and a bar chart?",
  "A histogram displays one <em>quantitative</em> variable chopped into equal-width intervals — its bars touch because they cover a continuous range. A bar chart compares separate <em>categories</em>, so its bars are drawn with gaps. Confusing them matters: bar-chart tools happily reorder categories, which would be meaningless for a histogram's number line."),
 ("When should I use a boxplot instead of a histogram?",
  "Use a boxplot when comparing several groups side by side — five boxplots fit neatly where five histograms would be a mess — or when you want outliers flagged automatically by the 1.5 × IQR rule. Use a histogram when the <em>shape</em> matters (skew, two peaks), because a boxplot can't show bimodality. Our <a href=\"../../descriptives.html\">descriptives calculator</a> draws both from pasted data."),
],

"z-scores-and-the-normal-distribution": [
 ("What does a z-score of 2 mean?",
  "The value sits exactly 2 standard deviations above the mean. In a normal distribution that's roughly the 97.7th percentile — only about 2.3% of values land higher. The sign gives the direction (negative = below the mean) and the magnitude gives the rarity; beyond ±2 is conventionally \"unusual.\""),
 ("What is the 68–95–99.7 rule?",
  "In any normal distribution, about 68% of values fall within 1 standard deviation of the mean, about 95% within 2, and about 99.7% within 3. It's a fast mental map from \"how many SDs out\" to \"how rare\" — and the origin of the familiar ±1.96 cutoff used for 95% confidence intervals."),
 ("Can I use z-scores if my data isn't normal?",
  "You can always <em>compute</em> a z-score — subtracting the mean and dividing by the SD works for any data, and it's still a fine way to standardize scales. What you lose is the percentile table: \"z = 2 means top 2.3%\" is only true for normal-shaped data. For skewed data, the same z can correspond to a very different percentile."),
],

"probability-basics": [
 ("What is the difference between independent and mutually exclusive events?",
  "Independent events don't influence each other — knowing one happened tells you nothing about the other (two separate coin flips), and P(A and B) = P(A) × P(B). Mutually exclusive events <em>can't</em> both happen (one die roll can't be both a 1 and a 2), so P(A or B) = P(A) + P(B). They're near-opposites: mutually exclusive events are maximally dependent, since one happening rules the other out."),
 ("What is the gambler's fallacy?",
  "The belief that after a run of heads, tails is \"due.\" It isn't — each flip is independent, and the coin has no memory. The Law of Large Numbers says the long-run <em>proportion</em> converges to the truth; it never promises short-run correction. The lopsided early flips just get diluted by the thousands that follow."),
 ("Why do all probabilities have to add up to 1?",
  "Because <em>something</em> from the full set of possible outcomes must happen — the total covers every possibility exactly once. That bookkeeping rule is what makes the complement shortcut work: P(not A) = 1 − P(A), often the fastest route to an answer (\"probability of at least one six\" = 1 − probability of none)."),
],

"sampling-distributions": [
 ("What is the difference between standard deviation and standard error?",
  "Standard deviation describes the spread of individual data points around their mean. Standard error describes the spread of a <em>statistic</em> (like a sample mean) across repeated samples — it's the standard deviation of the sampling distribution, and it shrinks as n grows (SE = σ/√n for the mean). SD answers \"how much do people vary?\"; SE answers \"how much would my estimate vary if I redid the study?\""),
 ("What is a sampling distribution in simple terms?",
  "Imagine repeating your study thousands of times, each time computing the same statistic — say, the sample mean. The pile of those thousands of values is the sampling distribution. It's a thought experiment (you only run the study once), but its shape and spread are exactly what let you judge how trustworthy your one estimate is."),
 ("Does every statistic have a sampling distribution?",
  "Yes — the mean, the median, the SD, a correlation, a regression slope: anything you compute from a random sample would come out slightly different in another sample, so each has its own distribution across hypothetical repeats. That's what makes inference general: confidence intervals and standard errors exist for medians and correlations, not just means."),
],

"central-limit-theorem": [
 ("What sample size is large enough for the Central Limit Theorem?",
  "The folk rule is n ≥ 30, and for mildly skewed data that's usually plenty — sample means settle into a near-normal shape quickly. But it's a rule of thumb, not a law: heavily skewed or outlier-prone populations can need substantially more, while symmetric populations are fine much earlier. When in doubt, look at your data's shape rather than trusting the magic 30."),
 ("Does the Central Limit Theorem make my data normally distributed?",
  "No — this is the classic misreading. The CLT says the distribution of <em>sample means</em> approaches normal as n grows. Your raw data keeps whatever shape it has; skewed data stays skewed no matter how much you collect. The bell curve emerges one level up, in the averages across samples — which is what t-tests and confidence intervals actually rely on."),
 ("Why does the standard error shrink with the square root of n?",
  "Averaging cancels luck: within one sample, unusually high values tend to offset unusually low ones, and the bigger the sample, the better the cancellation. The math works out to SE = σ/√n — which has a sobering consequence: to <em>halve</em> your uncertainty you need <em>four times</em> the data. Precision gets expensive fast."),
],

"confidence-intervals": [
 ("Does a 95% confidence interval mean there's a 95% chance the true value is inside?",
  "Not quite — the 95% describes the <em>procedure</em>, not any single interval. If you repeated the study endlessly, 95% of the intervals built this way would capture the truth; the one interval in front of you either contains it or doesn't. If you want a statement like \"95% probability the parameter is in this range,\" that's what Bayesian <a href=\"../../stats-4/bayesian-estimation/\">credible intervals</a> provide."),
 ("How can I make a confidence interval narrower?",
  "Three levers: collect more data (the standard error shrinks with √n), accept a lower confidence level (a 90% interval is tighter than a 99% one — you're admitting more risk of missing), or reduce measurement noise so the SD itself is smaller. Only the first and third narrow the interval without weakening the guarantee."),
 ("What does it mean if my confidence interval contains zero?",
  "For a difference or an effect, an interval like [−1.2, +3.5] says \"zero effect is among the plausible values\" — so the result is not statistically significant at the matching α. That's a statement of uncertainty, not proof of no effect: the interval also contains plenty of non-zero values. Wide intervals containing zero usually mean the study was underpowered."),
],

"hypothesis-testing-logic": [
 ("What does p < 0.05 actually mean?",
  "It means: <em>if</em> there were truly no effect (H₀ true), data this extreme would occur less than 5% of the time by chance alone. Since that's rare, we treat the result as evidence against H₀. It does <strong>not</strong> mean there's a 95% chance the effect is real, and it says nothing about how large or important the effect is — that's the job of <a href=\"../../stats-1/effect-size-and-power/\">effect sizes</a>."),
 ("Why do we say 'fail to reject' the null instead of 'accept' it?",
  "Because a non-significant result means the evidence wasn't strong enough to rule out chance — not that H₀ is true. Like a courtroom's \"not guilty,\" it reflects insufficient evidence, not established innocence. Small studies fail to reject false nulls all the time simply because they lack power."),
 ("What is the difference between Type I and Type II errors?",
  "A Type I error is a false alarm: rejecting H₀ when it's actually true — its rate is your α (5% by convention). A Type II error is a miss: failing to detect an effect that's really there — its rate is β, and 1 − β is the test's power. They trade off: demanding stronger evidence (lower α) makes misses more likely, which is why sample-size planning matters."),
],

"one-sample-and-paired-t-tests": [
 ("When should I use a paired t-test instead of an independent t-test?",
  "Use paired when the two sets of scores belong to the same (or matched) units — before/after measurements, twins, left/right comparisons. The pairing lets you analyze within-unit <em>differences</em>, cancelling stable individual differences and usually gaining a lot of power. Use the <a href=\"../../stats-1/independent-samples-t-test/\">independent-samples test</a> when the groups contain different, unrelated people."),
 ("What are degrees of freedom in a t-test?",
  "Roughly, the number of values free to vary once you've estimated the necessary quantities — for a one-sample or paired test, df = n − 1 (estimating the mean uses up one). Degrees of freedom set the t-distribution's shape: small df means fatter tails and a stricter critical value, reflecting the extra uncertainty of estimating the SD from little data."),
 ("Can I run a t-test on a small sample?",
  "Yes — small samples are exactly why the t-test exists; the t-distribution's heavy tails already price in the shakiness of estimating s from few observations. The caveat: with small n the data (or the paired differences) should be roughly normal, since the CLT can't rescue you yet. With visible skew or outliers in a small sample, a <a href=\"../../stats-2/non-parametric-alternatives/\">rank-based alternative</a> is safer."),
],

"independent-samples-t-test": [
 ("What is the difference between Student's t-test and Welch's t-test?",
  "Student's version assumes both groups have equal population variances and pools them; Welch's version drops that assumption and adjusts the degrees of freedom instead. Welch's costs almost nothing when variances are equal and protects you when they're not — which is why many statisticians (and R's default <code>t.test</code>) recommend Welch as the routine choice."),
 ("Do my two groups need to be the same size?",
  "No — the test handles unequal ns fine. Unequal group sizes do make the equal-variance assumption more consequential (the pooled test misbehaves when the smaller group also has the bigger variance), which is another argument for defaulting to Welch. For a fixed total sample, though, power is maximized when groups are equal."),
 ("How many participants do I need for a t-test?",
  "It depends entirely on the effect size you're trying to detect: with α = .05 and 80% power (two-tailed), a large effect (d = 0.8) needs about 26 per group, a medium one (d = 0.5) about 64, and a small one (d = 0.2) nearly 400. Run the numbers in the <a href=\"../../stats-1/effect-size-and-power/\">power playground</a> before collecting data."),
],

"effect-size-and-power": [
 ("What is a good effect size?",
  "Cohen's benchmarks — d ≈ 0.2 small, 0.5 medium, 0.8 large — are rough field-wide defaults, not laws. What counts as meaningful depends on context: d = 0.2 on mortality is enormous; d = 0.5 on a novel lab task may be routine. Compare against typical effects in your literature, and translate d into overlap or percentile terms with the <a href=\"../../effect-sizes.html\">effect-size converter</a> to build intuition."),
 ("What does 80% power mean?",
  "If the true effect is exactly the size you assumed, a study with 80% power has an 80% chance of returning a significant result — and a 20% chance of missing it (β = 0.20). It's a property of the design, chosen before data collection: the conventional compromise between missing real effects and the cost of ever-larger samples."),
 ("Can a result be statistically significant but practically meaningless?",
  "Absolutely — with a big enough sample, even a trivial difference (d = 0.02) reaches p < .05, because significance mixes effect size with sample size. The reverse also happens: a large effect in a small study can miss significance. That's precisely why journals require effect sizes alongside p-values: one answers \"is it real?\", the other \"does it matter?\""),
],

# ---------------- STATS 2 ----------------

"one-way-anova": [
 ("Why use ANOVA instead of running several t-tests?",
  "With k groups, pairwise t-tests multiply: four groups means six tests, each carrying its own 5% false-positive risk — together far more than 5%. ANOVA asks one omnibus question (\"are all the means equal?\") at a single controlled α. If it's significant, you then localize the differences with <a href=\"../../stats-2/post-hoc-tests/\">corrected post-hoc comparisons</a>."),
 ("What does a significant F-test tell you — and what doesn't it?",
  "It tells you the group means are unlikely to all be equal: at least one differs from at least one other. It does <em>not</em> tell you which groups differ, how many differ, or by how much. For \"which,\" run post-hoc tests; for \"how much,\" report an effect size like η² alongside the F."),
 ("What is the difference between between-group and within-group variance?",
  "Between-group variance measures how far the group means spread around the grand mean — the potential signal. Within-group variance measures how much individuals scatter inside their own group — the noise baseline. Their ratio is the F-statistic: when nothing is going on, both estimate the same underlying variance and F hovers near 1; real group differences push F above it."),
],

"post-hoc-tests": [
 ("Which post-hoc test should I use?",
  "For all pairwise comparisons after a standard ANOVA, <strong>Tukey's HSD</strong> is the purpose-built choice. If you're only making a few pre-planned comparisons, <strong>Bonferroni</strong> (or better, <strong>Holm</strong>) is simple and valid. When group variances are clearly unequal, use <strong>Games–Howell</strong>, which doesn't assume homogeneity. The common thread: every option pays for extra comparisons with a stricter per-test bar."),
 ("What is the family-wise error rate?",
  "The probability of making <em>at least one</em> false-positive across a whole family of tests. One test at α = .05 keeps it at 5%, but ten independent tests push it toward 1 − 0.95¹⁰ ≈ 40%. Corrections like Bonferroni, Holm, and Tukey shrink each test's α so the family as a whole stays at 5%."),
 ("Do I need a significant ANOVA before running post-hoc tests?",
  "Tradition says yes, and it's a sensible discipline against fishing. Strictly, though, tests like Tukey's HSD control the family-wise error on their own — they don't need the omnibus F as a gatekeeper, and the two can occasionally disagree (a significant Tukey pair under a non-significant F, or vice versa). Follow your field's convention, but know the protection comes from the correction, not the F."),
],

"factorial-anova-two-way": [
 ("What is an interaction effect in simple terms?",
  "An interaction means the effect of one factor <em>depends on</em> the level of another — \"the drug helps young patients but not older ones.\" On an interaction plot it shows up as non-parallel lines. It's the finding you could never get by studying each factor in its own separate experiment."),
 ("Can I interpret main effects when there's a significant interaction?",
  "With caution. A main effect is an <em>average</em> across the other factor's levels — and when the effect genuinely differs by level (that's what the interaction says), the average can mislead or even hide two opposite effects (a crossover). Standard practice: interpret the interaction first, usually via simple effects (\"A's effect at each level of B\"), and only lean on main effects when the interaction is small."),
 ("What does a 2×3 factorial design mean?",
  "Two factors: the first with 2 levels, the second with 3, fully crossed into 2 × 3 = 6 cells (every combination is tested). One analysis then yields three tests: the main effect of each factor and their interaction. The notation scales: a 2×2×4 design has three factors and 16 cells."),
],

"repeated-measures-anova": [
 ("What is sphericity and why does it matter?",
  "Sphericity is the assumption that the variance of the <em>difference</em> between every pair of conditions is roughly equal. When it fails — typical for time-based measurements, where neighboring timepoints correlate more than distant ones — the F-test's p-values come out too small, inflating false positives. Mauchly's test flags it, and corrections fix it."),
 ("What do I do if sphericity is violated?",
  "Apply the <strong>Greenhouse–Geisser</strong> correction (or <strong>Huynh–Feldt</strong> when the violation is mild) — both shrink the degrees of freedom to restore an honest p-value, and every stats package offers them next to the uncorrected test. The modern alternative is a <a href=\"../../stats-4/mixed-and-multilevel-models/\">mixed model</a>, which sidesteps sphericity entirely."),
 ("Why are repeated-measures designs more powerful?",
  "Because each participant serves as their own control. Stable individual differences — some people just score high — are removed from the error term instead of drowning the condition effect. The same effect that a between-subjects study needs dozens of participants to detect can emerge clearly from a handful measured repeatedly."),
],

"assumptions-and-when-they-break": [
 ("How do I check if my data is normally distributed?",
  "Look, don't just test: a Q-Q plot (points hugging the diagonal = normal) plus a histogram tells you more than any p-value. Formal tests like Shapiro–Wilk have a trap: in large samples they flag trivial, harmless deviations, and in small samples they miss serious ones — exactly backwards from what you need. Learn the Q-Q signatures in the playground above and trust your eyes."),
 ("What should I do if my data isn't normal?",
  "First ask whether it matters: with decent sample sizes the CLT makes t-tests and ANOVA quite robust to mild non-normality. If it's serious — heavy skew, wild outliers, small n — the standard escalation is: transform (a log often tames right-skew), switch to a robust variant (Welch, trimmed means), or go <a href=\"../../stats-2/non-parametric-alternatives/\">non-parametric</a>."),
 ("Which statistical assumption matters most?",
  "Independence, without question. Mild non-normality is usually forgiven by the CLT, and unequal variances have Welch-style fixes — but treating correlated observations (repeated measures, students in the same classroom) as independent silently shrinks your standard errors and manufactures significance. No correction rescues it afterward; it's fixed by design or by models built for structure, like <a href=\"../../stats-4/mixed-and-multilevel-models/\">multilevel models</a>."),
],

"non-parametric-alternatives": [
 ("Are non-parametric tests less powerful than parametric ones?",
  "Only slightly, and only when the parametric assumptions actually hold: on truly normal data, the Mann–Whitney test has about 95% of the t-test's efficiency. When assumptions fail — heavy tails, skew, outliers — the ranking tests are often <em>more</em> powerful, because a single wild value can't inflate the noise term. It's a small premium for a lot of insurance."),
 ("Should I use a t-test or Mann–Whitney for Likert-scale data?",
  "For a single Likert item — ordinal, few distinct values — Mann–Whitney respects what the data actually is. For a multi-item scale <em>score</em> (summing 8 items into a 8–40 scale), treating it as approximately interval and using a t-test is common and generally defensible. Either way, look at the distributions first; ceiling effects and skew are what really cause trouble."),
 ("Does the Mann–Whitney test compare medians?",
  "Not exactly, despite the common shorthand. It tests whether values from one group tend to be larger than values from the other (stochastic dominance). Only under the extra assumption that both distributions have the same shape does that reduce to \"the medians differ.\" With very different shapes or spreads, the test can be significant even when the medians are equal."),
],

"chi-square-tests": [
 ("How do I calculate expected counts in a chi-square test?",
  "For each cell: (row total × column total) ÷ grand total. That's the count you'd expect if the two variables were perfectly independent — each row splitting across the columns in identical proportions. The χ² statistic then measures how far the observed counts stray from these expectations, relative to their size."),
 ("What if my expected counts are less than 5?",
  "The χ² p-value is an approximation that degrades with small expected counts. The standard rule: all (or at least 80% of) expected counts should be ≥ 5. Below that, use <strong>Fisher's exact test</strong> for 2×2 tables (exact, no approximation) — or collapse sparse categories together when it makes conceptual sense."),
 ("Can a chi-square test tell me how strong the association is?",
  "No — χ² grows with sample size, so a huge study can produce an enormous χ² from a trivial association. Pair the test with an effect size: <strong>Cramér's V</strong> (0 = none, 1 = perfect) for general tables, or the <strong>odds ratio</strong> for 2×2 tables, which our <a href=\"../../effect-sizes.html\">effect-size converter</a> can translate into other metrics."),
],

"correlation": [
 ("What counts as a strong correlation?",
  "Common benchmarks: |r| ≈ .10 small, .30 medium, .50+ large — psychology rarely sees field correlations above .5, while physics laughs at anything below .95. Context is everything: r = .3 between a cheap screening question and job performance is valuable; r = .8 between two versions of the same questionnaire is unremarkable. Always interpret r against what's typical for your domain."),
 ("What is the difference between Pearson and Spearman correlation?",
  "Pearson's r measures <em>linear</em> association using the actual values; Spearman's ρ replaces values with ranks first, so it measures <em>monotonic</em> association (\"consistently increasing, straight or not\"). Spearman is robust to outliers and fine for ordinal data — if the two disagree sharply, that's a clue your relationship is curved or an outlier is steering Pearson."),
 ("What sample size do I need for a reliable correlation?",
  "Correlations are noisy in small samples — with n = 25, a true r of .3 easily shows up anywhere between .0 and .6. Detecting r = .3 with 80% power needs about n = 84; and estimates only start stabilizing to a tight interval around n ≈ 150–250. Be suspicious of dramatic correlations from tiny samples."),
],

"simple-linear-regression": [
 ("What does R² mean in plain English?",
  "The share of the outcome's variation the line accounts for. R² = 0.70 means 70% of the ups and downs in y are tracked by x through the fitted line; the remaining 30% is scatter the model can't explain. In simple regression it's literally the correlation squared — r = .5 gives R² = .25."),
 ("What is the difference between correlation and regression?",
  "Correlation gives one symmetric number describing how tightly two variables co-move — no direction, no units. Regression fits an equation (ŷ = b₀ + b₁x) for <em>predicting</em> y from x, with a slope in real units (\"each extra study hour buys 2.3 exam points\"). Correlation describes; regression predicts."),
 ("Can I use my regression line to predict beyond my data's range?",
  "That's extrapolation, and it's where regression goes to die. The line is only supported within the x-values you observed — beyond them, the relationship may bend, flatten, or reverse, and the model gives no warning (a child's growth line predicts 3-meter adults). Predict within the observed range; extrapolate only with strong theoretical justification and loud caveats."),
],

"regression-diagnostics": [
 ("What should a good residual plot look like?",
  "Nothing — a structureless, horizontal band of points scattered evenly around zero, like static. Any visible pattern is the model confessing: a curve means the relationship isn't linear, a funnel means non-constant variance, a lone distant point means an observation with outsized pull. \"Boring\" is the goal."),
 ("What is heteroscedasticity in simple terms?",
  "Residual spread that changes across the range of predictions — typically a funnel: tight errors for small fitted values, wide ones for large (income data does this constantly). The slope estimate stays unbiased, but its standard errors and p-values become unreliable. Fixes: transform y (log is the usual medicine), or use robust (heteroscedasticity-consistent) standard errors."),
 ("Should I delete outliers from my regression?",
  "Not as a reflex. First investigate: a data-entry error (age = 250) gets fixed or removed; a genuine-but-extreme case is information about the world. For real outliers, check influence (Cook's distance), then report the model with and without the point — if conclusions flip on one observation, that fragility <em>is</em> the finding."),
],
}

FAQS_34 = {

# ---------------- STATS 3 ----------------

"multiple-regression": [
 ("What does 'controlling for' a variable actually mean?",
  "It means comparing like with like, statistically: the coefficient for x₁ describes how y differs between cases that differ in x₁ but are <em>identical on every other predictor in the model</em>. It's an adjustment computed from the data, not a real experiment — and it only works for confounders you actually measured and included."),
 ("How many predictors can I put in a regression?",
  "A classic rule of thumb: at least 10–15 observations per predictor, or the model starts fitting noise — with n = 50, stay around 3–5 predictors. It's a guideline rather than a law (what really matters is effect sizes and collinearity), but models that flout it produce coefficients and R² values that collapse on new data. Honest checks: adjusted R² and <a href=\"../../stats-4/cross-validation-and-overfitting/\">cross-validation</a>."),
 ("What is the difference between R² and adjusted R²?",
  "Plain R² can only go up when you add a predictor — even a column of random numbers — so it silently rewards complexity. Adjusted R² subtracts a penalty for each predictor, so it rises only when a variable explains more than chance would. When comparing models with different numbers of predictors, adjusted R² is the fairer scoreboard."),
],

"multicollinearity-and-variable-selection": [
 ("What VIF value indicates a problem?",
  "Common alarm thresholds are VIF > 5 (cautious) or VIF > 10 (lenient) — VIF = 5 means that predictor's coefficient variance is inflated 5-fold because other predictors largely explain it. Treat these as smoke detectors, not verdicts: a high VIF between a predictor and its own squared term is normal, while VIF 4 between two conceptually distinct predictors might still deserve thought."),
 ("Does multicollinearity affect my model's predictions?",
  "Barely — that's the key reassurance. Correlated predictors destabilize the <em>individual coefficients</em> (who gets credit), not the joint prediction (how much credit there is in total). If your goal is forecasting y, you can often live with it; if your goal is interpreting \"the effect of x₁ holding x₂ fixed,\" that's exactly what multicollinearity poisons."),
 ("Why is stepwise regression frowned upon?",
  "Because it runs many hidden tests and keeps whatever chanced below .05: the surviving p-values are biased low, R² is inflated, and small data perturbations produce entirely different \"final\" models. It also can't use what it doesn't know — theory. Choose predictors from domain knowledge, and if you need automatic selection for prediction, use penalized methods like the lasso with cross-validation."),
],

"categorical-predictors-and-dummy-coding": [
 ("Why do I create k − 1 dummy variables instead of k?",
  "Because the k-th dummy is perfectly redundant — if a case is 0 on all others, it must be the reference group, so a full set would be perfectly collinear with the intercept (the \"dummy variable trap\"; software would drop one anyway). The reference group's mean lives in the intercept, and each dummy coefficient measures a difference from it."),
 ("How do I choose the reference category?",
  "Statistically it doesn't matter — predictions and the overall fit are identical either way; only the comparisons the coefficients report change. Practically, pick the level that makes those comparisons meaningful: the control condition, the placebo, the standard treatment, or the largest group. Avoid tiny reference groups, whose noisy mean muddies every contrast against it."),
 ("Is ANOVA just a special case of regression?",
  "Yes — run a regression with one dummy-coded categorical predictor and you get literally the same F, p, and group means as the one-way ANOVA; two groups reduces further to the t-test. ANOVA, t-tests, ANCOVA, and regression are one linear model in different notation, which is why learning regression unlocks all of them at once."),
],

"ancova": [
 ("What is the difference between ANOVA and ANCOVA?",
  "ANOVA compares raw group means. ANCOVA first removes the part of the outcome explained by a continuous covariate (pretest score, age, baseline severity), then compares the <em>adjusted</em> means. Two payoffs: it corrects for baseline imbalance between groups, and it soaks up noise — often shrinking p-values even in perfectly randomized experiments."),
 ("Can ANCOVA fix pre-existing group differences in observational studies?",
  "Only partially, and this deserves respect: adjustment removes confounding carried by the covariates you measured — never the ones you didn't. Worse, when groups differ substantially on the covariate, adjusted comparisons extrapolate into covariate territory where one group has no data (this is the heart of Lord's paradox). ANCOVA sharpens randomized experiments; in observational data it's an assumption-laden estimate, not a magic equalizer."),
 ("What is homogeneity of regression slopes?",
  "The assumption that the covariate–outcome relationship is the same in every group — parallel lines in the scatterplot. If the slopes genuinely differ, a single \"adjusted difference\" doesn't exist: the group effect depends on the covariate value. The fix is to model the <a href=\"../../stats-3/interactions-in-regression/\">group × covariate interaction</a> and report how the effect varies."),
],

"interactions-in-regression": [
 ("Why should I center variables before creating an interaction term?",
  "Two reasons. Interpretability: with a product term in the model, b₁ is the effect of x₁ <em>when the other variable equals zero</em> — often a meaningless value (age 0, income 0); centering moves \"zero\" to the mean, so b₁ reads as the effect at a typical value. Stability: centering also reduces the artificial correlation between x and x×z, taming multicollinearity in the estimates."),
 ("How do I interpret coefficients when there's an interaction term?",
  "Carefully — the rules change. In ŷ = b₀ + b₁x + b₂z + b₃xz, the coefficient b₁ is the slope of x <em>specifically when z = 0</em>, not an overall effect; b₃ says how much that slope changes per unit of z. Nobody reads these raw numbers fluently: plot predicted lines at low/medium/high values of the moderator and interpret the picture."),
 ("What are simple slopes?",
  "The effect of x computed at chosen values of the moderator — conventionally at its mean and ±1 SD. They turn an abstract product coefficient into direct statements: \"among low-experience users the feature gains 4 points; among high-experience users, 0.5.\" Simple-slope tests then tell you at which moderator values the effect is significantly different from zero."),
],

"mediation-and-indirect-effects": [
 ("What is the difference between a mediator and a moderator?",
  "A mediator is a <em>mechanism</em>: X causes M, which causes Y — stress harms sleep, which harms health (an arrow chain, tested with <em>indirect effects</em>). A moderator changes the <em>strength</em> of an effect: the training works for novices but not experts (an \"it depends,\" tested with <a href=\"../../stats-3/interactions-in-regression/\">interaction terms</a>). Mediation answers \"how does it work?\"; moderation answers \"for whom / when?\""),
 ("Why is bootstrapping used to test mediation?",
  "The indirect effect is a product, a × b, and products of normal-ish estimates are themselves skewed — the old Sobel test pretends otherwise and loses power. <a href=\"../../stats-4/bootstrap-and-resampling/\">Bootstrapping</a> resamples the data thousands of times, computes a×b in each, and reads the confidence interval straight off that skewed distribution. If the interval excludes zero, the indirect effect is supported."),
 ("Can mediation analysis prove causation?",
  "No — it quantifies a pattern <em>consistent with</em> your proposed causal chain, but the statistics can't verify the arrows' directions; reversed or confounded models often fit equally well. The causal weight rests on design (temporal ordering, experiments, longitudinal data) and theory. Cross-sectional mediation, where X, M, and Y are measured simultaneously, deserves particular skepticism."),
],

"logistic-regression": [
 ("How do I interpret an odds ratio?",
  "It's the multiplier on the odds for each one-unit increase in the predictor. OR = 1.5 means each extra unit multiplies the odds of the outcome by 1.5 (+50%); OR = 0.8 shrinks them by 20%; OR = 1 means no effect. Two cautions: \"odds\" are p/(1−p), not probability — and an impressive-sounding OR can mean a tiny absolute change when the baseline risk is low."),
 ("Why can't I just use linear regression for a yes/no outcome?",
  "A straight line happily predicts \"probabilities\" of −0.3 or 1.4, which are nonsense; and a binary outcome violates the constant-variance and normal-error assumptions that make linear regression's inference valid. The logistic curve fixes all of it at once: predictions squeezed into (0, 1), with a model fit by maximum likelihood on the scale where the relationship really is linear — log-odds."),
 ("What is the difference between odds and probability?",
  "Probability is successes ÷ all attempts; odds are successes ÷ failures. A 75% probability is odds of 3 (three successes per failure). They diverge most in the middle of the range (p = .5 is odds = 1) and converge for rare events — p = .01 is odds ≈ .0101, which is why odds ratios approximate risk ratios only when the outcome is uncommon."),
],

"assumptions-of-regression": [
 ("Do my predictors need to be normally distributed?",
  "No — this is one of the most persistent regression myths. The normality assumption concerns the <em>residuals</em>, not the predictors or even the raw outcome. Skewed predictors, binary dummies, lumpy x-distributions: all perfectly fine. Fit the model, then check a Q-Q plot of the residuals — that's the only normality that matters, and mostly for small samples at that."),
 ("What is leverage in regression?",
  "A point's potential to move the line, determined purely by how unusual its predictor values are — far from the center of the x's means high leverage, like sitting at the end of a seesaw. Leverage alone isn't a problem: a high-leverage point right on the trend just stabilizes the fit. Danger requires leverage <em>plus</em> a large residual — that combination is influence."),
 ("What is a high Cook's distance, and what do I do about it?",
  "Cook's distance summarizes how much the whole fitted model shifts if a point is deleted; common flags are values above 1, or above 4/n in large samples. For flagged points: check for data errors first, then refit with and without them and report both. A conclusion that survives is solid; one that hinges on a single observation is a finding about fragility, not about x and y."),
],

"model-comparison": [
 ("What is the difference between AIC and BIC?",
  "Both score models as fit-minus-complexity-penalty (lower is better), but BIC's penalty grows with sample size (k·ln n vs AIC's 2k), so it favors leaner models, especially in big data. Philosophically, AIC aims to minimize prediction error; BIC aims to identify the true model among candidates. In practice: report both, and take notice when they disagree."),
 ("Why does R² always increase when I add predictors?",
  "Least squares finds the coefficients that minimize the squared error — and the option \"set the new coefficient to exactly zero\" is always available, so the fit can never get worse in-sample; even a random-noise predictor absorbs a little variance by luck. That's why in-sample R² can't referee model complexity: use adjusted R², AIC/BIC, or held-out prediction error instead."),
 ("What is a nested model?",
  "One model is nested in another when it's a special case — obtainable by deleting predictors (setting their coefficients to zero). y ~ x₁ + x₂ is nested in y ~ x₁ + x₂ + x₃. Nesting matters because it licenses an exact significance test (the nested F-test, or likelihood-ratio test) for whether the extra terms earn their keep; non-nested rivals must be compared with AIC/BIC or cross-validation."),
],

"factor-analysis-pca": [
 ("How many factors or components should I keep?",
  "Triangulate: the scree plot's elbow (keep components before the curve flattens), parallel analysis (keep factors whose eigenvalues beat those from random data — the most defensible modern criterion), and interpretability (can you name each factor?). The old Kaiser rule (eigenvalue > 1) is simple but notoriously over-extracts. When criteria disagree, favor the solution that makes theoretical sense."),
 ("Should I use PCA or factor analysis?",
  "Ask what you're claiming. PCA is compression: repackage correlated variables into fewer composite scores, no theory attached — right for reducing dimensions before another analysis. Factor analysis is a measurement model: it says latent traits (extraversion, anxiety) <em>cause</em> the observed responses, and separates shared from unique variance — right for scale development and psychometrics. Similar arithmetic, different stories."),
 ("What is a factor loading, and what value is good?",
  "The correlation-like weight tying an observed variable to a factor — how much that item \"belongs.\" Conventional floors: |loading| ≥ .40 for a variable to count toward a factor (≥ .70 is excellent), while items loading ≥ .30–.40 on <em>multiple</em> factors (cross-loadings) make interpretation murky and are often revised or dropped in scale development."),
],

"manova": [
 ("When should I use MANOVA instead of separate ANOVAs?",
  "When your outcomes form a conceptually related set (anxiety + depression + stress) and you want one honest verdict about the <em>profile</em>. MANOVA controls the family-wise error a pile of ANOVAs would inflate, and — its underrated superpower — it can detect coordinated patterns (small opposite shifts in correlated outcomes) that every univariate test misses. Unrelated outcomes, though, just dilute each other; don't stuff the model."),
 ("Should I report Wilks' lambda or Pillai's trace?",
  "Wilks' Λ is the traditional default and what most textbooks tabulate. Pillai's trace is the most robust when assumptions wobble — unequal covariance matrices, unequal group sizes — so many methodologists recommend it outright. With two groups they (and Hotelling's T²) agree exactly; when they disagree materially with 3+ groups, that itself hints at assumption trouble, and Pillai is the safer citation."),
 ("What should I do after a significant MANOVA?",
  "Localize the effect. The standard route: univariate ANOVAs on each outcome with a multiplicity correction, to see which variables carry the difference. The more multivariate route: descriptive discriminant analysis, which reveals <em>what combination</em> of outcomes best separates the groups — often the more faithful summary, since a combination is what MANOVA actually tested."),
],

"power-analysis-for-complex-designs": [
 ("How do I choose the effect size for a power analysis?",
  "Best: the smallest effect that would still matter (the \"smallest effect size of interest\") — powering for it means anything you miss was too small to care about. Also common: effects from prior literature or meta-analyses, discounted for publication bias (published effects run inflated; halving them is not paranoid). Worst: Cohen's \"medium\" chosen because it's the middle button."),
 ("What is post-hoc power analysis, and should I run one?",
  "If it means computing \"observed power\" from your just-obtained effect size and n — don't. Observed power is a deterministic function of your p-value (p just under .05 always gives power just over 50%), so it adds literally no information; journals still occasionally ask, but methodologists have thoroughly debunked it. Meaningful after-the-fact questions sound like: \"what effect size could this design detect with 80% power?\""),
 ("Why do interaction effects need bigger samples?",
  "An interaction is a difference between differences — a second-order signal estimated with roughly twice the noise. A useful shock: detecting an interaction that's half the size of a main effect can take up to <em>16×</em> the sample, and even a same-sized crossover interaction needs about 4× under common designs. When a formula doesn't exist for your design, simulate: generate fake data with your assumed effects, analyze it thousands of times, count the significant runs."),
],

# ---------------- STATS 4 ----------------

"bootstrap-and-resampling": [
 ("How many bootstrap resamples do I need?",
  "For standard errors, ~1,000 is plenty; for confidence intervals — which depend on the distribution's tails — 5,000–10,000 is the modern norm, and since computation is cheap there's no reason to skimp. Note what B does and doesn't fix: more resamples reduce simulation noise, but the information ceiling is set by your original n. B = 100,000 can't rescue a sample of 12."),
 ("When does the bootstrap fail?",
  "Its known weak spots: very small samples (resampling 8 values just reshuffles 8 values), statistics driven by extremes (the maximum, extreme quantiles — the resamples can never exceed your observed max), and dependent data (time series, clustered observations) unless you use block or cluster variants. And no amount of resampling fixes a biased sample — the bootstrap replicates your data's flaws faithfully."),
 ("What is the difference between bootstrapping and permutation tests?",
  "Different questions. The bootstrap resamples <em>with replacement</em> to estimate uncertainty — standard errors and confidence intervals for an estimate. A permutation test <em>reshuffles group labels</em> to build the null distribution — \"what differences would chance produce if the labels meant nothing?\" — yielding an exact p-value. Estimation → bootstrap; hypothesis testing → permutation."),
],

"bayesian-thinking": [
 ("What is the main difference between Bayesian and frequentist statistics?",
  "What \"probability\" means. Frequentists treat parameters as fixed unknowns and put probability on <em>data procedures</em> (\"5% of such intervals miss\"); Bayesians put probability on <em>parameter values themselves</em>, as degrees of belief updated by evidence (\"the rate is 95% likely between .55 and .72\"). The Bayesian version answers the question people naturally ask — at the price of specifying a prior."),
 ("How do I choose a prior?",
  "Match it to your honest knowledge. Know little? A flat or weakly-informative prior lets the data dominate (and typically lands near the frequentist answer). Know a lot — previous studies, physical limits? Encoding it is the whole point, especially when data is scarce. Two guardrails: be transparent about the choice, and run a sensitivity check — if reasonable priors give conflicting conclusions, your data is speaking too softly."),
 ("What is a Bayes factor?",
  "The evidence ratio between two hypotheses: how much more probable the observed data is under H₁ than under H₀. BF = 10 means the data favors H₁ ten-to-one; BF = 1 means the data can't tell them apart. It's the Bayesian counterpart to significance testing, with two perks p-values lack: it can quantify evidence <em>for</em> a null, and it doesn't inflate with optional stopping."),
],

"bayesian-estimation": [
 ("What is the difference between a credible interval and a confidence interval?",
  "A 95% credible interval means what everyone wants: \"given the data (and prior), the parameter is 95% likely to be in here.\" A 95% <a href=\"../../stats-1/confidence-intervals/\">confidence interval</a> promises only that the <em>procedure</em> captures the truth 95% of the time across repeated studies. With flat priors and decent data they're often numerically similar — but only the credible interval licenses the direct probability sentence."),
 ("What is a MAP estimate?",
  "The <em>maximum a posteriori</em> estimate — the single parameter value at the posterior's peak, its most probable point. It's one of three standard point summaries: mean (the balance point, most common), median (robust for skewed posteriors), and mode/MAP. With a flat prior, the MAP coincides exactly with the frequentist maximum-likelihood estimate — a tidy bridge between the two worlds."),
 ("Do Bayesian and frequentist results ever agree?",
  "Constantly — with flat/weak priors and reasonable sample sizes, credible and confidence intervals often match to two decimals, since the likelihood dominates both. They part ways when priors carry real information, when data is thin, and in interpretation always. The practical upshot: the frameworks usually corroborate each other, and genuine disagreement is itself diagnostic — it means your prior is doing heavy lifting."),
],

"generalized-linear-models": [
 ("What is a link function in simple terms?",
  "The bridge between a straight line and an outcome that can't follow one. The linear predictor b₀ + b₁x ranges over all numbers, but a probability lives in (0, 1) and a count rate must stay positive — so the link transforms the outcome's mean onto the unlimited scale where the line lives (logit for probabilities, log for counts). One linear machine, different adapters."),
 ("What is overdispersion and how do I handle it?",
  "Poisson regression hard-codes variance = mean, and real counts are almost always messier — more zeros, longer tails (event counts cluster within people, days, sites). The symptoms: deviance far exceeding its degrees of freedom, deceptively tiny standard errors. Standard fixes: a quasi-Poisson model (scales the errors) or, more commonly, a <strong>negative binomial</strong> model with its own dispersion parameter."),
 ("Which GLM family should I use for my outcome?",
  "Read it off the outcome type: continuous and roughly symmetric → Gaussian (ordinary regression); yes/no → binomial with logit link (logistic); counts of events → Poisson with log link (negative binomial if overdispersed); strictly positive skewed amounts (costs, durations) → Gamma, usually with a log link. The workflow — predictors, interactions, diagnostics — stays identical across all of them."),
],

"mixed-and-multilevel-models": [
 ("What is the difference between fixed and random effects?",
  "Fixed effects are coefficients estimated for effects you care about specifically and would keep in a replication (treatment, age, condition). Random effects model <em>sampled clusters</em> — these particular schools, participants, litters — as draws from a population, estimating how much clusters vary rather than each one in isolation. Litmus test: would new data bring the <em>same levels</em> (fixed) or new ones (random)?"),
 ("When do I need a multilevel model instead of ordinary regression?",
  "Whenever observations come in clusters that share something — students within classrooms, repeated measures within people, patients within clinics. Ordinary regression assumes independence; clustered data violates it, shrinking standard errors and manufacturing false positives. Check the intraclass correlation (ICC): even a modest ICC of .10 badly distorts naive p-values once clusters are large."),
 ("How many groups do I need to fit random effects?",
  "Rules of thumb converge on: fewer than ~5 groups, don't — the model can't estimate between-group variance from 3 numbers (use fixed dummy codes instead); 10–20 groups works but estimates variance components roughly; 30+ is comfortable, and 50+ is preferred for random <em>slopes</em> or when the variance components are themselves the research question."),
],

"cross-validation-and-overfitting": [
 ("What value of k should I use for k-fold cross-validation?",
  "k = 5 or k = 10 is the standard, well-studied compromise: each fold's training set is nearly the full data (low bias), without the variance and cost of leave-one-out (k = n). Small datasets lean toward k = 10 or repeated CV (multiple random fold splits, averaged) to stabilize the estimate. There's rarely a reason to deviate."),
 ("What is the difference between a validation set and a test set?",
  "The validation set is used <em>during</em> modeling — comparing candidate models, tuning complexity — so decisions get optimized against it, and its error estimate becomes optimistic. The test set is opened exactly once, after all decisions are final, to report honest performance. Cross-validation typically replaces the validation set; the untouched final test set remains best practice."),
 ("Does cross-validation prevent overfitting?",
  "It <em>detects</em> overfitting — it can't stop you from responding badly to what it shows. Two classic ways to overfit anyway: hammering CV repeatedly while hand-tweaking until the score looks good (you've now overfit to the folds), and data leakage — preprocessing (scaling, feature selection) computed on all data before splitting. Leakage-proof rule: every step that learns from data must live inside the CV loop."),
],

"causal-dags-and-confounding": [
 ("What is a collider in simple terms?",
  "A variable caused by two others: X → C ← Y. Left alone, it transmits nothing. But select or adjust on it and you <em>create</em> a spurious X–Y association. The classic intuition: among hospitalized patients (being hospitalized = the collider), two diseases look negatively correlated even if independent in the population — because having either one is enough to get you admitted."),
 ("Should I control for every variable I measured?",
  "Emphatically no — \"kitchen-sink regression\" is a recipe for bias, not rigor. Adjusting for confounders (common causes) removes bias; adjusting for colliders (common effects) creates it; adjusting for mediators erases the very effect you're estimating. Since the data alone can't tell these apart, the covariate list must come from a causal diagram of how the data was generated — that's the DAG's whole job."),
 ("What is a backdoor path?",
  "Any route from X to Y that starts with an arrow <em>into</em> X — like X ← Z → Y through a confounder Z. Backdoor paths leak non-causal association into the X–Y relationship. Pearl's backdoor criterion is the recipe: find an adjustment set that blocks every backdoor path while leaving directed (causal) paths alone — then, if your DAG is right, the adjusted estimate is the causal effect."),
],

"survival-analysis": [
 ("What is censoring in survival analysis?",
  "A censored observation is an unfinished clock: the event hadn't happened when you stopped observing (study ended, participant moved away) — so you know survival exceeded some time, but not by how much. It's information, not garbage: censored subjects rightly count in the at-risk pool while observed. Standard methods assume censoring is uninformative — dropping out mustn't be related to imminent risk."),
 ("What does a hazard ratio mean?",
  "The instantaneous event-rate multiplier between groups: HR = 2 means at any moment, the exposed group's event rate is double the reference group's. It is <em>not</em> \"twice as likely to die overall\" nor \"half the survival time.\" HR < 1 is protective; and a proportional-hazards model assumes this ratio is constant over follow-up — worth checking, not assuming."),
 ("What is the difference between Kaplan–Meier and Cox regression?",
  "Kaplan–Meier <em>describes</em>: a nonparametric survival curve per group, compared with the log-rank test — no covariates allowed. Cox proportional-hazards regression <em>models</em>: hazard ratios as a function of many predictors at once, adjusting for age, severity, and anything else. The pairing is standard: KM curves for the picture, Cox for the adjusted inference."),
],

"missing-data": [
 ("How much missing data is too much?",
  "Wrong first question — the <em>mechanism</em> outranks the amount. 5% missing not-at-random (MNAR) can bias conclusions more than 30% missing at random handled with multiple imputation. That said, practical strain grows past ~10% (report sensitivity analyses) and results lean heavily on the imputation model past ~40%. Always report how much was missing, why you believe it went missing, and how you handled it."),
 ("Is it ever okay to just delete incomplete cases?",
  "Listwise deletion is defensible when data is plausibly MCAR <em>and</em> the loss is small (a few percent, ample n remaining) — you sacrifice a little precision, no bias. It quietly betrays you when missingness relates to other variables (MAR): the surviving cases are no longer representative. With MAR data, multiple imputation or maximum likelihood recovers both the bias and the lost power."),
 ("How many imputations should I use in multiple imputation?",
  "The old advice of m = 5 came from an era of expensive computing. The modern heuristic: at least as many imputations as the percentage of incomplete cases (30% incomplete → m ≥ 30); m = 20–50 covers most studies and stabilizes standard errors and p-values across reruns. Computation is cheap now — err high."),
],

"meta-analysis": [
 ("What does I² tell you in a meta-analysis?",
  "The share of visible between-study variation that reflects real differences in effects rather than sampling noise. Rough bands: 25% low, 50% moderate, 75% high heterogeneity. High I² isn't a defect — it's a finding: the effect genuinely varies across populations or protocols, the fixed-effect summary is too confident, and the interesting question becomes <em>what moderates the effect</em>."),
 ("Should I use a fixed-effect or random-effects model?",
  "Fixed-effect assumes every study estimates one identical true effect — defensible only for near-exact replications. Random-effects allows true effects to vary across studies and widens the pooled interval honestly; with real-world literatures (different populations, doses, designs), it's the sensible default. When heterogeneity is genuinely zero the two coincide anyway — you lose nothing."),
 ("What is a funnel plot and what does asymmetry mean?",
  "Each study plotted as effect size vs. precision: big precise studies cluster at the top, small noisy ones fan out below — symmetrically, if all results reached publication. A missing lower corner (typically small null studies) suggests publication bias, testable with Egger's regression and probed with trim-and-fill. Caveat: asymmetry has innocent causes too, like small studies using different populations."),
],
}

FAQS_METHODS = {

# ---------------- METHODS — Research Design ----------------

"from-question-to-hypothesis": [
 ("What's the difference between a hypothesis and a prediction?",
  "A <strong>hypothesis</strong> is a general proposed relationship between constructs — \"background music affects learning.\" A <strong>prediction</strong> is the specific, observable consequence you'd expect in a particular study if the hypothesis were true — \"first-year students will recall fewer words with lyrical music than in silence.\" The hypothesis is the idea; the prediction is what you commit to <em>before</em> running the study, pinned to a population, concrete measures, and a direction."),
 ("What makes a hypothesis falsifiable?",
  "There has to be some possible result that would count as evidence <em>against</em> it. \"Music changes recall\" is falsifiable — a clear no-difference result contradicts it. \"Music affects people somehow\" is not, because any outcome at all can be squeezed to fit, so it can never be wrong and therefore never informative. Falsifiability, following Popper, is the line between a scientific claim and an empty one."),
 ("Should I use a one-tailed or a two-tailed hypothesis?",
  "Default to two-tailed (non-directional) unless strong theory or prior evidence really justifies predicting the direction. A one-tailed test is <a href=\"../../stats-1/effect-size-and-power/\">more powerful</a> <em>if</em> you guessed the direction correctly, but it's blind to a real effect in the opposite direction — and switching to one-tailed after peeking at the data is a form of p-hacking. Whichever you choose, choose it before you collect data."),
],

"variables-and-operationalization": [
 ("What is the difference between a conceptual and an operational definition?",
  "A <strong>conceptual definition</strong> says what a construct means in the abstract — \"anxiety is apprehension about a future threat.\" An <strong>operational definition</strong> says exactly how you'll measure it here — \"anxiety = the total score on the 20-item State-Trait Anxiety Inventory.\" Every study needs both: the concept tells readers what you're studying, and the operation tells them precisely what you did, so they could repeat it."),
 ("Is a confounding variable the same as a control variable?",
  "No — they're nearly opposites. A <strong>confound</strong> is an uncontrolled third variable that rides along with your independent variable and offers a rival explanation for the result. A <strong>control</strong> is a variable you deliberately hold constant, or measure and adjust for, so it <em>can't</em> become a confound. A confound is a threat you failed to close off; a control is one you did. Untangling them is the heart of <a href=\"../../stats-4/causal-dags-and-confounding/\">causal reasoning</a>."),
 ("Can one construct have more than one operationalization?",
  "Yes — and usually it should. Stress can be operationalized as salivary cortisol, a self-report scale, or heart-rate variability, and each captures a slightly different facet of the idea. Using several measures and checking that they agree (convergent validity) is far stronger than trusting any single one, because no operationalization ever perfectly equals the construct it stands in for."),
],

"reliability-and-validity": [
 ("What is a good Cronbach's alpha?",
  "The folk rule is α ≥ .70 for research use and ≥ .80 for higher-stakes decisions — but it's a convention, not a law. Counter-intuitively, a very high α (≥ .90) can signal <em>redundant</em>, near-duplicate items rather than a better scale. α also grows with the number of items and depends on your sample, so report it for your own data, and remember it measures internal consistency, not <a href=\"../../methods/variables-and-operationalization/\">whether you measured the right thing</a>."),
 ("Can a measure be reliable but not valid?",
  "Absolutely — and it's the most dangerous case. A bathroom scale that always reads 3 kg heavy is perfectly reliable (it's consistent) yet completely invalid (it's systematically wrong). Reliability is <em>necessary</em> for validity — a measure that can't even agree with itself can't be accurate — but it never <em>guarantees</em> it. A precise, repeatable number can still be measuring the wrong thing."),
 ("What's the difference between reliability and validity?",
  "<strong>Reliability</strong> is consistency: the same answer under the same conditions, whether across time (test–retest), across raters (inter-rater), or across a scale's items (internal consistency). <strong>Validity</strong> is accuracy: whether the measure actually captures the construct you intend. On the dartboard picture, reliability is how tightly the darts cluster together; validity is whether that cluster sits on the bullseye."),
],

"experimental-design-and-randomization": [
 ("Does random assignment guarantee balanced groups?",
  "No — it balances groups <em>in expectation</em>, not in every single study. With a small sample you can still draw an unlucky split where one group happens to be older or more motivated; randomization just makes such imbalances random rather than systematic, and they shrink as the sample grows. That's still a huge win: unlike self-selection, the imbalance isn't tied to who chose the treatment, and any leftover difference is exactly the kind of chance variation your <a href=\"../../stats-1/hypothesis-testing-logic/\">significance test</a> already accounts for."),
 ("What's the difference between random sampling and random assignment?",
  "They solve different problems. <strong>Random sampling</strong> is how participants are drawn from the population — it protects <em>external</em> validity (how far your results generalize). <strong>Random assignment</strong> is how those participants are split into conditions — it protects <em>internal</em> validity (whether the treatment, not a <a href=\"../../stats-4/causal-dags-and-confounding/\">confound</a>, caused the difference). You can have one without the other: a lab study on 40 randomly-assigned volunteers has strong internal but weak external validity."),
 ("What is a wait-list control group?",
  "A wait-list control is a comparison group that receives the treatment <em>later</em>, after the study's measurements are done. It's common when withholding a promising intervention entirely would be unfair — everyone eventually gets it, but the delay creates an untreated comparison window. It keeps random assignment intact while sidestepping the ethical problem of a pure no-treatment group, though it can't control for the placebo effect the way an active or placebo control does."),
],

"between-vs-within-designs": [
 ("What is the difference between within-subjects and between-subjects designs?",
  "In a <strong>between-subjects</strong> design each participant experiences only one condition, so you compare different groups of people. In a <strong>within-subjects</strong> (repeated-measures) design each participant experiences <em>every</em> condition, so you compare each person to themselves. Within-subjects removes stable individual differences from the comparison, which usually makes it far more efficient — but it introduces order and carryover effects that a between-subjects design never faces."),
 ("Are within-subjects designs always more powerful?",
  "No. They win only when a person's scores across conditions correlate strongly — roughly above 0.5. That correlation is what lets individual differences cancel out; below it, you'd have been better off with independent groups. And heavy <em>carryover</em> (practice, fatigue, a lingering manipulation) adds noise that only the within design pays, which can erase the advantage entirely. When conditions correlate strongly and carry over little, though, a within design can need less than half the participants for the same <a href=\"../../stats-1/effect-size-and-power/\">power</a>."),
 ("Does counterbalancing remove carryover effects?",
  "Only partly. Counterbalancing — running the conditions in different orders across participants, e.g. via a <em>Latin square</em> — averages out <em>symmetric</em> order effects so they don't bias the mean. But if the transfer is <em>asymmetric</em> (condition A changes B more than B changes A), balancing the orders leaves residual variability in the difference scores rather than removing it. Counterbalancing is a defence, not a cure; when carryover is severe, a between-subjects design is safer."),
],

"quasi-experiments": [
 ("What is the difference between a quasi-experiment and a true experiment?",
  "The dividing line is <strong>random assignment</strong>. A true experiment randomly assigns participants to conditions, so the groups are equivalent in expectation and differences can be pinned on the treatment. A quasi-experiment keeps a treatment, a comparison, and an outcome but the groups formed by choice or circumstance — a policy that hit one region, students who chose a program — so hidden differences between them remain a rival explanation you must argue away rather than having <a href=\"../../methods/experimental-design-and-randomization/\">randomized</a> it away."),
 ("What is the parallel-trends assumption in difference-in-differences?",
  "Difference-in-differences estimates a treatment effect by subtracting the comparison group's before-to-after change from the treated group's change. That subtraction is valid only if, <em>absent the treatment</em>, both groups would have moved by the same amount — the <strong>parallel-trends assumption</strong>. It allows the groups to start at different levels (a baseline gap is fine) but requires their trends to match. If the treated group was already on a steeper trajectory, that differential trend gets counted as 'effect,' biasing the estimate."),
 ("What is a natural experiment?",
  "A natural experiment is a quasi-experiment where some outside force — a lottery, a law change, an arbitrary cutoff or border — assigns the 'treatment' in a way that is as-good-as-random with respect to the outcome. The researcher doesn't manipulate anything; they exploit the accident. When the assigning event really is unrelated to who would have done well anyway, a natural experiment can approach the causal credibility of a randomized trial on questions you could never ethically or practically assign yourself."),
],

"observational-designs": [
 ("What is the difference between a cohort study and a case-control study?",
  "They run in opposite directions. A <strong>cohort</strong> study starts from the <em>exposure</em> — it enrols exposed and unexposed people who don't yet have the outcome and follows them forward to see who develops it, which measures incidence and yields a risk ratio directly. A <strong>case-control</strong> study starts from the <em>outcome</em> — it rounds up people who already have the disease (cases) plus a comparison group (controls) and looks backward at who was exposed. Cohorts are stronger for establishing time-order but slow and poor for rare outcomes; case-control studies are fast and efficient for rare outcomes but can only estimate an <a href=\"../../stats-3/logistic-regression/\">odds ratio</a>."),
 ("Can a cross-sectional study show cause and effect?",
  "No. A cross-sectional study measures exposure and outcome at the <em>same</em> moment, so it can't establish which came first — the temporal order that causation requires. It's excellent for estimating <strong>prevalence</strong> (how common something is right now) and for generating hypotheses, but a correlation in a snapshot could run either way, or be driven by a confound. Claims of cause need a design that pins down time-order (a cohort) or, better, random assignment."),
 ("Why does a case-control study report odds ratios instead of risk ratios?",
  "Because the researcher <em>chose</em> how many cases and controls to enrol (often 1:1 or 1:4), the fraction of cases among everyone enrolled is an artefact of that choice, not a real risk — so risk ratios can't be computed. The <strong>odds ratio</strong>, however, is unaffected by how you sampled cases versus controls, and it estimates the same odds ratio you'd find in the whole population. The odds ratio only approximates the risk ratio when the outcome is <em>rare</em> (the rare-disease assumption); for common outcomes it overstates it."),
],

"sampling-methods": [
 ("What is a representative sample?",
  "A representative sample mirrors the population on the characteristics that matter for your question, so estimates from it generalise back to that population. You don't get one by hand-picking a 'balanced-looking' group — you get it (in expectation) by using a <strong>probability sampling</strong> method, where everyone has a known, non-zero chance of selection. Representativeness is a property of the <em>method</em>, not of any single sample: any one random sample may be a bit off, but the procedure is unbiased and its error shrinks with size."),
 ("Why are convenience samples a problem?",
  "Because the people who are easy to reach — your own class, passers-by, an online panel — differ systematically from those who aren't, so the sample is <strong>biased</strong>, not merely noisy. The crucial consequence: that bias does <em>not</em> shrink as you collect more data. A bigger convenience sample just gives a more precise wrong answer. Convenience samples are sometimes unavoidable (hard-to-reach groups, exploratory pilots), but you must be honest that your results describe whoever you could reach, not the wider population."),
 ("What is the difference between stratified and cluster sampling?",
  "Both divide the population into groups, but they use those groups oppositely. <strong>Stratified</strong> sampling splits people into strata (age bands, regions) and samples <em>within every one</em>, usually proportionally — guaranteeing coverage and giving a <em>more precise</em> estimate than simple random sampling. <strong>Cluster</strong> sampling splits people into many natural clusters (schools, city blocks), randomly picks a <em>few whole clusters</em>, and measures everyone in them — cheaper to run over a spread-out population, but far <em>noisier</em>, because people in the same cluster resemble one another."),
],

"survey-and-questionnaire-design": [
 ("How many points should a Likert scale have?",
  "The evidence points to <strong>5 to 7 points</strong>. Fewer than five throws away real distinctions between respondents; more than seven offers a precision people can't reliably use, so the extra points just add noise. More important than the exact number is that the scale is <strong>balanced</strong> (as many positive as negative options) and that the points are <strong>labelled with words</strong>, not just numbers — everyone reads 'Agree' the same way, but interprets a bare '4' differently. Whether to include a neutral midpoint (an odd number of points) is a real design choice, not an error either way."),
 ("What is a double-barreled question?",
  "A double-barreled question asks about two things in a single item, so one answer can't honestly cover both — for example, 'How satisfied are you with the pay and the working hours?' Someone happy with the hours but not the pay has no valid response, and you can't tell which half their answer refers to. The fix is simple: split it into two separate questions, one per idea. The same rule applies whenever an item smuggles in an 'and' or an 'or' that respondents might answer differently."),
 ("What is social desirability bias, and how do you reduce it?",
  "Social desirability bias is the tendency to answer sensitive questions in a way that makes one look good rather than truthfully — under-reporting cheating or drinking, over-reporting voting or exercise. It contaminates exactly the topics researchers most want honest data on. You reduce it by guaranteeing and clearly <em>stating</em> anonymity, never attaching identifiers to sensitive items, softening the framing so the undesirable answer feels acceptable, and using indirect techniques (like list experiments) for the most delicate questions."),
],

}

FAQS = {**FAQS_12, **FAQS_34, **FAQS_METHODS}
