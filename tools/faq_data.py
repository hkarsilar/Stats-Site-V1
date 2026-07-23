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
  "A <strong>parameter</strong> is a number that describes the whole population (like the true mean μ), and it's usually unknown. A <strong>statistic</strong> is the matching number computed from your sample (like x̄), which you use to estimate the parameter. Memory hook: <em>p</em>arameter–<em>p</em>opulation, <em>s</em>tatistic–<em>s</em>ample."),
 ("What is the difference between descriptive and inferential statistics?",
  "Descriptive statistics summarizes the data you actually collected (means, standard deviations, charts) and claims nothing beyond it. Inferential statistics uses that sample to draw conclusions about the wider population it came from, which is why it always comes with uncertainty attached (confidence intervals, p-values)."),
 ("Do I need to be good at math to do statistics?",
  "Less than most people fear. The arithmetic in an applied course is squaring, adding, dividing and reading a value off a table, and software does all of it for you. What the subject genuinely demands is comfort with an argument: what a number is evidence for, what could have produced it by chance, and where a conclusion starts to outrun the data. People who found algebra a struggle often do well here, and people who found it easy are not automatically safe from the reasoning traps."),
],

"types-of-data": [
 ("Is age nominal, ordinal, interval, or ratio data?",
  "Age in years is <strong>ratio</strong> data: zero means no age at all, so \"twice as old\" is meaningful. But the level of measurement lives in how you <em>record</em> a variable, not in the thing itself: age <em>groups</em> (18–25, 26–40, 41+) are ordinal, and birth <em>year</em> is interval (year 0 is an arbitrary calendar convention, so 1990 isn't \"twice\" 995). Recording age as coarse groups throws information away permanently — collect the exact value and bin later if you must."),
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
 ("Should I report the mean with the SD, or the median with the IQR?",
  "Pair the center with its matching spread. The mean and SD belong together (both use every value's magnitude, so both are outlier-sensitive), and the median pairs with the <strong>interquartile range</strong> — the span of the middle 50% of the data, built from quartiles just like the median. For roughly symmetric data, mean (SD) is the standard report and what t-tests work with; for skewed or outlier-prone data, median and IQR give the honest picture. Our <a href=\"../../descriptives.html\">descriptives calculator</a> computes both pairs so you can compare."),
],

"visualizing-data": [
 ("How many bins should a histogram have?",
  "There's no single right answer — around 10–20 bins works well for a few hundred observations, and rules like Sturges' or Freedman–Diaconis give reasonable starting points. The practical advice: always try several bin widths. Too few bins hides real structure (like two peaks); too many turns the shape into noise."),
 ("Why do people say never to use a pie chart?",
  "Because pie charts make readers judge <em>angles and areas</em>, which humans do poorly — classic perception experiments (Cleveland &amp; McGill, 1984) show we compare aligned bar lengths far more accurately. With more than two or three slices, \"which is bigger?\" becomes guesswork that a sorted bar chart answers instantly. The defensible pie is rare: a single part-of-whole message with two or three very different slices. Our <a href=\"../../which-chart.html\">chart chooser</a> has a whole \"resist the pie\" verdict explaining the alternatives."),
 ("When should I use a boxplot instead of a histogram?",
  "Use a boxplot when comparing several groups side by side (five boxplots fit neatly where five histograms would be a mess), or when you want outliers flagged automatically by the 1.5 × IQR rule. Use a histogram when the <em>shape</em> matters (skew, two peaks), because a boxplot can't show bimodality. Our <a href=\"../../descriptives.html\">descriptives calculator</a> draws both from pasted data."),
],

"z-scores-and-the-normal-distribution": [
 ("What does a z-score of 2 mean?",
  "The value sits exactly 2 standard deviations above the mean. In a normal distribution that's roughly the 97.7th percentile — only about 2.3% of values land higher. The sign gives the direction (negative = below the mean) and the magnitude gives the rarity; beyond ±2 is conventionally \"unusual.\""),
 ("How do I convert a z-score to a percentile?",
  "Take the area under the standard normal curve to the <em>left</em> of your z — that cumulative proportion × 100 is the percentile. z = +1.0 → the 84.1st percentile; z = −1.5 → the 6.7th; and \"% scoring above\" is just 100 minus it. Classically you'd look this up in a printed z-table; our <a href=\"../../tables.html\">statistical tables calculator</a> does the conversion in both directions (z → area, or a target percentile → the z that produces it). Remember it's only trustworthy when the data is roughly normal."),
 ("Can I use z-scores if my data isn't normal?",
  "You can always <em>compute</em> a z-score — subtracting the mean and dividing by the SD works for any data, and it's still a fine way to standardize scales. What you lose is the percentile table: \"z = 2 means top 2.3%\" is only true for normal-shaped data. For skewed data, the same z can correspond to a very different percentile."),
],

"probability-basics": [
 ("What is the difference between independent and mutually exclusive events?",
  "Independent events don't influence each other — knowing one happened tells you nothing about the other (two separate coin flips), and P(A and B) = P(A) × P(B). Mutually exclusive events <em>can't</em> both happen (one die roll can't be both a 1 and a 2), so P(A or B) = P(A) + P(B). They're near-opposites: mutually exclusive events are maximally dependent, since one happening rules the other out."),
 ("What is the gambler's fallacy?",
  "The belief that after a run of heads, tails is \"due.\" It isn't — each flip is independent, and the coin has no memory. The Law of Large Numbers says the long-run <em>proportion</em> converges to the truth; it never promises short-run correction. The lopsided early flips just get diluted by the thousands that follow."),
 ("A test is 99% accurate and I tested positive. Am I 99% likely to have the disease?",
  "No, and the gap is startling. Suppose 1 person in 1,000 has the condition, and the test catches 99% of real cases while wrongly flagging 1% of healthy people. Out of 100,000 people, 100 are ill and about 99 of them test positive; the other 99,900 are healthy and about 999 of them <em>also</em> test positive. So roughly 1,098 positive results contain 99 real cases, and P(ill | positive) is about 9%, not 99%. The test's accuracy answers P(positive | ill), and you wanted P(ill | positive), which is a different conditional probability. Nothing is wrong with the test; the base rate is simply so low that false positives outnumber true ones. This reversal is exactly what <a href=\"../../stats-4/bayesian-thinking/\">Bayes' theorem</a> computes, and it is the reason screening programs report positive predictive value rather than accuracy."),
],

"sampling-distributions": [
 ("What is the difference between standard deviation and standard error?",
  "Standard deviation describes the spread of individual data points around their mean. Standard error describes the spread of a <em>statistic</em> (like a sample mean) across repeated samples — it's the standard deviation of the sampling distribution, and it shrinks as n grows (SE = σ/√n for the mean). SD answers \"how much do people vary?\"; SE answers \"how much would my estimate vary if I redid the study?\""),
 ("What is a sampling distribution in simple terms?",
  "Imagine repeating your study thousands of times, each time computing the same statistic — say, the sample mean. The pile of those thousands of values is the sampling distribution. It's a thought experiment (you only run the study once), but its shape and spread are exactly what let you judge how trustworthy your one estimate is."),
 ("Does every statistic have a sampling distribution?",
  "Anything you compute from a random sample has one: the mean, the median, the SD, a correlation, a regression slope. Each would come out slightly different in another sample, so each has its own distribution across hypothetical repeats. That's what makes inference general: confidence intervals and standard errors exist for medians and correlations, not just means."),
],

"central-limit-theorem": [
 ("What sample size is large enough for the Central Limit Theorem?",
  "The folk rule is n ≥ 30, and for mildly skewed data that's usually plenty — sample means settle into a near-normal shape quickly. But it's a rule of thumb, not a law: heavily skewed or outlier-prone populations can need substantially more, while symmetric populations are fine much earlier. When in doubt, look at your data's shape rather than trusting the magic 30."),
 ("Does the Central Limit Theorem make my data normally distributed?",
  "This is the classic misreading. The CLT says the distribution of <em>sample means</em> approaches normal as n grows. Your raw data keeps whatever shape it has; skewed data stays skewed no matter how much you collect. The bell curve emerges one level up, in the averages across samples, which is what t-tests and confidence intervals actually rely on."),
 ("Why does the standard error shrink with the square root of n?",
  "Averaging cancels luck: within one sample, unusually high values tend to offset unusually low ones, and the bigger the sample, the better the cancellation. The math works out to SE = σ/√n — which has a sobering consequence: to <em>halve</em> your uncertainty you need <em>four times</em> the data. Precision gets expensive fast."),
],

"confidence-intervals": [
 ("Does a 95% confidence interval mean there's a 95% chance the true value is inside?",
  "Not quite — the 95% describes the <em>procedure</em>, not any single interval. If you repeated the study endlessly, 95% of the intervals built this way would capture the truth; the one interval in front of you either contains it or doesn't. If you want a statement like \"95% probability the parameter is in this range,\" that's what Bayesian <a href=\"../../stats-4/bayesian-estimation/\">credible intervals</a> provide."),
 ("Can I tell whether two groups differ by seeing if their confidence intervals overlap?",
  "Half of that inference is safe and the other half is not. If two 95% intervals do <strong>not</strong> overlap, the difference is significant at the .05 level, always. The reverse does not follow: overlapping intervals are perfectly compatible with a significant difference, because the interval around a <em>difference</em> is narrower than the two individual intervals side by side. For two equally precise means, the difference reaches p = .05 while the intervals still overlap by about 29% of their length, so a whole band of genuinely significant results looks non-significant to the eyeball test. Test the difference itself, or plot the interval around the difference rather than two intervals around the means. For paired or repeated measures the eyeball test is worse still, since the two intervals ignore the within-person correlation that the test uses."),
 ("What does it mean if my confidence interval contains zero?",
  "For a difference or an effect, an interval like [−1.2, +3.5] says \"zero effect is among the plausible values\" — so the result is not statistically significant at the matching α. That's a statement of uncertainty, not proof of no effect: the interval also contains plenty of non-zero values. Wide intervals containing zero usually mean the study was underpowered."),
],

"hypothesis-testing-logic": [
 ("What does p < 0.05 actually mean?",
  "It means: <em>if</em> there were truly no effect (H₀ true), data this extreme would occur less than 5% of the time by chance alone. Since that's rare, we treat the result as evidence against H₀. It does <strong>not</strong> mean there's a 95% chance the effect is real, and it says nothing about how large or important the effect is — that's the job of <a href=\"../../stats-1/effect-size-and-power/\">effect sizes</a>."),
 ("Why do we say 'fail to reject' the null instead of 'accept' it?",
  "Because a non-significant result means the evidence wasn't strong enough to rule out chance — not that H₀ is true. Like a courtroom's \"not guilty,\" it reflects insufficient evidence, not established innocence. Small studies fail to reject false nulls all the time simply because they lack power."),
 ("Why is the significance level set at 0.05?",
  "Convention, not law of nature. R. A. Fisher suggested in the 1920s that one-in-twenty was a convenient benchmark for \"surprising\" (roughly the chance of landing beyond ±2 SDs), and it stuck. Nothing magical happens between p = .049 and p = .051, which is why fields with different stakes choose differently: particle physics demands \"5 sigma\" (about 1 in 3.5 million), genome-wide studies use 5 × 10⁻⁸, and some journals now suggest .005 for new discoveries. What matters is fixing α <em>before</em> you look at the data, and remembering that crossing it says nothing about how <a href=\"../../stats-1/effect-size-and-power/\">large or important</a> the effect is."),
],

"one-sample-and-paired-t-tests": [
 ("When should I use a paired t-test instead of an independent t-test?",
  "Use paired when the two sets of scores belong to the same (or matched) units — before/after measurements, twins, left/right comparisons. The pairing lets you analyze within-unit <em>differences</em>, canceling stable individual differences and usually gaining a lot of power. Use the <a href=\"../../stats-1/independent-samples-t-test/\">independent-samples test</a> when the groups contain different, unrelated people."),
 ("What are degrees of freedom in a t-test?",
  "Roughly, the number of values free to vary once you've estimated the necessary quantities — for a one-sample or paired test, df = n − 1 (estimating the mean uses up one). Degrees of freedom set the t-distribution's shape: small df means fatter tails and a stricter critical value, reflecting the extra uncertainty of estimating the SD from little data."),
 ("Is a paired t-test the same as a repeated-measures ANOVA with two conditions?",
  "They give the same verdict. Run both on the same two-condition data and you get F = t² with an identical p-value, because a repeated-measures ANOVA on two levels is doing what the paired test does: analyzing each person's own difference score. The ANOVA earns its keep once there are three or more conditions, which is what <a href=\"../../stats-2/repeated-measures-anova/\">repeated-measures ANOVA</a> covers."),
],

"independent-samples-t-test": [
 ("What is the difference between Student's t-test and Welch's t-test?",
  "Student's version assumes both groups have equal population variances and pools them; Welch's version drops that assumption and adjusts the degrees of freedom instead. Welch's costs almost nothing when variances are equal and protects you when they're not — which is why many statisticians (and R's default <code>t.test</code>) recommend Welch as the routine choice."),
 ("Do my two groups need to be the same size?",
  "The test handles unequal ns fine. Unequal group sizes do make the equal-variance assumption more consequential (the pooled test misbehaves when the smaller group also has the bigger variance), which is another argument for defaulting to Welch. For a fixed total sample, though, power is maximized when groups are equal."),
 ("How many participants do I need for a t-test?",
  "It depends entirely on the effect size you're trying to detect: with α = .05 and 80% power (two-tailed), a large effect (d = 0.8) needs about 26 per group, a medium one (d = 0.5) about 64, and a small one (d = 0.2) nearly 400. Run the numbers in the <a href=\"../../stats-1/effect-size-and-power/\">power playground</a> before collecting data."),
],

"effect-size-and-power": [
 ("What is a good effect size?",
  "Cohen's benchmarks (d ≈ 0.2 small, 0.5 medium, 0.8 large) are rough field-wide defaults, not laws. What counts as meaningful depends on context: d = 0.2 on mortality is enormous; d = 0.5 on a novel lab task may be routine. Compare against typical effects in your literature, and translate d into overlap or percentile terms with the <a href=\"../../effect-sizes.html\">effect-size converter</a> to build intuition."),
 ("What does 80% power mean?",
  "If the true effect is exactly the size you assumed, a study with 80% power has an 80% chance of returning a significant result — and a 20% chance of missing it (β = 0.20). It's a property of the design, chosen before data collection: the conventional compromise between missing real effects and the cost of ever-larger samples."),
 ("Can a result be statistically significant but practically meaningless?",
  "Yes. With a big enough sample, even a trivial difference (d = 0.02) reaches p < .05, because significance mixes effect size with sample size. The reverse also happens: a large effect in a small study can miss significance. That's precisely why journals require effect sizes alongside p-values: one answers \"is it real?\", the other \"does it matter?\""),
],

# ---------------- STATS 2 ----------------

"one-way-anova": [
 ("Why use ANOVA instead of running several t-tests?",
  "With k groups, pairwise t-tests multiply: four groups means six tests, each carrying its own 5% false-positive risk — together far more than 5%. ANOVA asks one omnibus question (\"are all the means equal?\") at a single controlled α. If it's significant, you then localize the differences with <a href=\"../../stats-2/post-hoc-tests/\">corrected post-hoc comparisons</a>."),
 ("What does a significant F-test tell you — and what doesn't it?",
  "It tells you the group means are unlikely to all be equal: at least one differs from at least one other. It does <em>not</em> tell you which groups differ, how many differ, or by how much. For \"which,\" run post-hoc tests; for \"how much,\" report an effect size like η² alongside the F."),
 ("My ANOVA is significant but none of the post-hoc comparisons are. What happened?",
  "Uncomfortable, but not a contradiction. The omnibus F gathers every group difference into one test, while each pairwise comparison examines one pair after paying a penalty for the whole family of comparisons. A pattern spread thinly across several groups can be enough for F and not enough for any single corrected pair. What a significant F does guarantee is that <em>some</em> contrast among the means is significant, and that contrast may combine groups rather than pit one against one. Report it as it is: the means differ overall, and the data are too thin to say which pair carries it. <a href=\"../../stats-2/post-hoc-tests/\">Post-hoc tests</a> covers how the penalty works."),
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
 ("How many participants do I need to detect an interaction?",
  "More than the main effect needed, usually by a lot. An interaction is a difference between differences, so its standard error is larger than that of a plain two-group comparison. Take a study with enough people to detect an effect in one condition: if you now expect that effect to be present at one level of B and absent at the other, detecting the interaction takes roughly <strong>four times the total sample</strong>. A full crossover, where the effect reverses sign, is far cheaper and costs about the same total as the original two-group study. This is the commonest reason a factorial study reports two clean main effects and an underpowered interaction, so settle the number at design time: <a href=\"../../stats-3/power-analysis-for-complex-designs/\">power analysis for complex designs</a> works it through."),
 ("Can I interpret main effects when there's a significant interaction?",
  "With caution. A main effect is an <em>average</em> across the other factor's levels — and when the effect genuinely differs by level (that's what the interaction says), the average can mislead or even hide two opposite effects (a crossover). Standard practice: interpret the interaction first, usually via simple effects (\"A's effect at each level of B\"), and only lean on main effects when the interaction is small."),
 ("What does a 2×3 factorial design mean?",
  "Two factors: the first with 2 levels, the second with 3, fully crossed into 2 × 3 = 6 cells (every combination is tested). One analysis then yields three tests: the main effect of each factor and their interaction. The notation scales: a 2×2×4 design has three factors and 16 cells."),
],

"repeated-measures-anova": [
 ("What is sphericity and why does it matter?",
  "Sphericity is the assumption that the variance of the <em>difference</em> between every pair of conditions is roughly equal. When it fails (typical for time-based measurements, where neighboring timepoints correlate more than distant ones), the F-test's p-values come out too small, inflating false positives. Mauchly's test flags it, and corrections fix it."),
 ("What do I do if sphericity is violated?",
  "Apply the <strong>Greenhouse–Geisser</strong> correction (or <strong>Huynh–Feldt</strong> when the violation is mild) — both shrink the degrees of freedom to restore an honest p-value, and every stats package offers them next to the uncorrected test. The modern alternative is a <a href=\"../../stats-4/mixed-and-multilevel-models/\">mixed model</a>, which sidesteps sphericity entirely."),
 ("What happens if a participant misses one condition?",
  "A classical repeated-measures ANOVA drops that person from the analysis entirely, in every condition, because the computation needs a complete row per participant. Lose a handful of people that way and you can give back most of the power the design was chosen for. Two respectable routes out: a <a href=\"../../stats-4/mixed-and-multilevel-models/\">mixed model</a>, which keeps every observation a person did provide, or a principled treatment of the <a href=\"../../stats-4/missing-data/\">missing values</a> before the ANOVA. Substituting the person's own mean for the gap is not one of them, since it invents data with zero variance and shrinks your error term."),
],

"assumptions-and-when-they-break": [
 ("How do I check if my data is normally distributed?",
  "Look, don't just test: a Q-Q plot (points hugging the diagonal = normal) plus a histogram tells you more than any p-value. Formal tests like Shapiro–Wilk have a trap: in large samples they flag trivial, harmless deviations, and in small samples they miss serious ones — exactly backwards from what you need. Learn the Q-Q signatures in the playground above and trust your eyes."),
 ("What should I do if my data isn't normal?",
  "First ask whether it matters: with decent sample sizes the CLT makes t-tests and ANOVA quite robust to mild non-normality. If it's serious (heavy skew, wild outliers, small n), the standard escalation is: transform (a log often tames right-skew), switch to a robust variant (Welch, trimmed means), or go <a href=\"../../stats-2/non-parametric-alternatives/\">non-parametric</a>."),
 ("Which statistical assumption matters most?",
  "Independence, without question. Mild non-normality is usually forgiven by the CLT, and unequal variances have Welch-style fixes — but treating correlated observations (repeated measures, students in the same classroom) as independent silently shrinks your standard errors and manufactures significance. No correction rescues it afterward; it's fixed by design or by models built for structure, like <a href=\"../../stats-4/mixed-and-multilevel-models/\">multilevel models</a>."),
],

"non-parametric-alternatives": [
 ("Are non-parametric tests less powerful than parametric ones?",
  "Only slightly, and only when the parametric assumptions actually hold: on truly normal data, the Mann–Whitney test has about 95% of the t-test's efficiency. When assumptions fail (heavy tails, skew, outliers), the ranking tests are often <em>more</em> powerful, because a single wild value can't inflate the noise term. It's a small premium for a lot of insurance."),
 ("Should I use a t-test or Mann–Whitney for Likert-scale data?",
  "For a single Likert item — ordinal, few distinct values — Mann–Whitney respects what the data actually is. For a multi-item scale <em>score</em> (summing 8 items into a 8–40 scale), treating it as approximately interval and using a t-test is common and generally defensible. Either way, look at the distributions first; ceiling effects and skew are what really cause trouble."),
 ("Does the Mann–Whitney test compare medians?",
  "Not exactly, despite the common shorthand. It tests whether values from one group tend to be larger than values from the other (stochastic dominance). Only under the extra assumption that both distributions have the same shape does that reduce to \"the medians differ.\" With very different shapes or spreads, the test can be significant even when the medians are equal."),
],

"chi-square-tests": [
 ("My chi-square is significant. Which cell is responsible?",
  "The test itself will not tell you, because it pools every cell into one number. Ask the table for <strong>adjusted standardized residuals</strong>, which SPSS offers under Crosstabs → Cells and R returns as <code>chisq.test(tab)$stdres</code>. Each one is roughly a z-score for its cell under independence, so a value beyond about ±2 marks a cell holding noticeably more or fewer cases than independence predicts, and the sign tells you which direction. Read the pattern before you write the sentence: a significant χ² on a 3 × 4 table usually comes from one or two cells, not from the whole table drifting at once. With many cells, treat the residuals as exploratory rather than as a stack of formal tests."),
 ("What if my expected counts are less than 5?",
  "The χ² p-value is an approximation that degrades with small expected counts. The standard rule: all (or at least 80% of) expected counts should be ≥ 5. Below that, use <strong>Fisher's exact test</strong> for 2×2 tables (exact, no approximation) — or collapse sparse categories together when it makes conceptual sense."),
 ("Can a chi-square test tell me how strong the association is?",
  "χ² itself can't; it grows with sample size, so a huge study can produce an enormous χ² from a trivial association. Pair the test with an effect size: <strong>Cramér's V</strong> (0 = none, 1 = perfect) for general tables, or the <strong>odds ratio</strong> for 2×2 tables, which our <a href=\"../../effect-sizes.html\">effect-size converter</a> can translate into other metrics."),
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
  "Plain R² can only go up when you add a predictor (even a column of random numbers), so it silently rewards complexity. Adjusted R² subtracts a penalty for each predictor, so it rises only when a variable explains more than chance would. When comparing models with different numbers of predictors, adjusted R² is the fairer scoreboard."),
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
 ("What if my categorical variable has 20 or 50 levels?",
  "Dummy coding still works, but it gets expensive: 50 countries means 49 dummies, 49 degrees of freedom spent, and coefficients for the small categories that rest on a handful of cases each. Three ways out, in rough order of preference. Collapse levels into meaningful groups you can defend in advance (region rather than country), which is a coding decision and belongs in your <a href=\"../../data/codebooks-and-documentation/\">codebook</a>. Fit the variable as a random effect in a <a href=\"../../stats-4/mixed-and-multilevel-models/\">multilevel model</a>, which shares information across levels instead of estimating each one alone. Or, if the levels genuinely have an order and roughly even spacing, enter it as a single numeric predictor and spend one degree of freedom rather than 49."),
 ("Is ANOVA just a special case of regression?",
  "Run a regression with one dummy-coded categorical predictor and you get literally the same F, p, and group means as the one-way ANOVA; two groups reduces further to the t-test. ANOVA, t-tests, ANCOVA, and regression are one linear model in different notation, which is why learning regression unlocks all of them at once."),
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
 ("Do I have to keep the main effects if only the interaction is significant?",
  "Yes, keep them. This is the <strong>principle of marginality</strong>: a model containing x·z should also contain x and z. Drop a main effect and you force that variable's line through a constrained origin, so the surviving coefficients no longer mean what their names suggest and the interaction absorbs whatever the dropped term was carrying. The fit also stops being invariant to how you coded the variables, which means rescaling a predictor can change your conclusion. A non-significant main effect alongside a significant interaction is not a problem to tidy away; it is the ordinary result of an effect that is real in one condition and absent in the other, and it is the finding."),
 ("What are simple slopes?",
  "The effect of x computed at chosen values of the moderator — conventionally at its mean and ±1 SD. They turn an abstract product coefficient into direct statements: \"among low-experience users the feature gains 4 points; among high-experience users, 0.5.\" Simple-slope tests then tell you at which moderator values the effect is significantly different from zero."),
],

"mediation-and-indirect-effects": [
 ("What is the difference between a mediator and a moderator?",
  "A mediator is a <em>mechanism</em>: X causes M, which causes Y — stress harms sleep, which harms health (an arrow chain, tested with <em>indirect effects</em>). A moderator changes the <em>strength</em> of an effect: the training works for novices but not experts (an \"it depends,\" tested with <a href=\"../../stats-3/interactions-in-regression/\">interaction terms</a>). Mediation answers \"how does it work?\"; moderation answers \"for whom / when?\""),
 ("Why is bootstrapping used to test mediation?",
  "The indirect effect is a product, a × b, and products of normal-ish estimates are themselves skewed — the old Sobel test pretends otherwise and loses power. <a href=\"../../stats-4/bootstrap-and-resampling/\">Bootstrapping</a> resamples the data thousands of times, computes a×b in each, and reads the confidence interval straight off that skewed distribution. If the interval excludes zero, the indirect effect is supported."),
 ("Can mediation analysis prove causation?",
  "It quantifies a pattern <em>consistent with</em> your proposed causal chain, nothing stronger: the statistics can't verify the arrows' directions, and reversed or confounded models often fit equally well. The causal weight rests on design (temporal ordering, experiments, longitudinal data) and theory. Cross-sectional mediation, where X, M, and Y are measured simultaneously, deserves particular skepticism."),
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
  "This is one of the most persistent regression myths: the normality assumption concerns the <em>residuals</em>, not the predictors or even the raw outcome. Skewed predictors, binary dummies, lumpy x-distributions: all perfectly fine. Fit the model, then check a Q-Q plot of the residuals. That's the only normality that matters, and mostly for small samples at that."),
 ("What is leverage in regression?",
  "A point's potential to move the line, determined purely by how unusual its predictor values are — far from the center of the x's means high leverage, like sitting at the end of a seesaw. Leverage alone isn't a problem: a high-leverage point right on the trend just stabilizes the fit. Danger requires leverage <em>plus</em> a large residual — that combination is influence."),
 ("What is a high Cook's distance, and what do I do about it?",
  "Cook's distance summarizes how much the whole fitted model shifts if a point is deleted; common flags are values above 1, or above 4/n in large samples. For flagged points: check for data errors first, then refit with and without them and report both. A conclusion that survives is solid; one that hinges on a single observation is a finding about fragility, not about x and y."),
],

"model-comparison": [
 ("What is the difference between AIC and BIC?",
  "Both score models as fit-minus-complexity-penalty (lower is better), but BIC's penalty grows with sample size (k·ln n vs AIC's 2k), so it favors leaner models, especially in big data. Philosophically, AIC aims to minimize prediction error; BIC aims to identify the true model among candidates. In practice: report both, and take notice when they disagree."),
 ("Can I compare AIC across models fitted to different data?",
  "Only if the models were fitted to <em>exactly</em> the same rows. AIC is a relative score with no meaning on its own, so the comparison is valid only when the likelihoods being compared refer to the same observations. The usual way people break this without noticing: one model includes a predictor with missing values, the software drops those cases without saying so, and the two models are now fitted to different sample sizes, which makes their AICs incomparable no matter how carefully you computed them. Check that <em>n</em> is identical in every model you rank, and if it is not, refit them all on the complete-case subset or handle the <a href=\"../../stats-4/missing-data/\">missing values</a> first. The same rule governs BIC, and it is also why AIC cannot referee two models with different outcome variables or different transformations of the outcome."),
 ("What is a nested model?",
  "One model is nested in another when it's a special case — obtainable by deleting predictors (setting their coefficients to zero). y ~ x₁ + x₂ is nested in y ~ x₁ + x₂ + x₃. Nesting matters because it licenses an exact significance test (the nested F-test, or likelihood-ratio test) for whether the extra terms earn their keep; non-nested rivals must be compared with AIC/BIC or cross-validation."),
],

"factor-analysis-pca": [
 ("How many factors or components should I keep?",
  "Triangulate: the scree plot's elbow (keep components before the curve flattens), parallel analysis (keep factors whose eigenvalues beat those from random data — the most defensible modern criterion), and interpretability (can you name each factor?). The old Kaiser rule (eigenvalue > 1) is simple but notoriously over-extracts. When criteria disagree, favor the solution that makes theoretical sense."),
 ("What is rotation, and should I choose varimax or oblimin?",
  "Extraction finds a set of factors that fits; rotation spins those factors to a position that a human can name, without changing how well the model fits or how much total variance it explains. The choice is a claim about your constructs. <strong>Varimax</strong> is orthogonal: it forces the factors to be uncorrelated, which gives the cleanest-looking loading table. <strong>Oblimin</strong> and its relatives are oblique: they let the factors correlate, and then report how much. In psychology the honest default is usually oblique, because real traits do correlate, and an oblique rotation will tell you so. A useful habit is to run oblimin first and inspect the factor correlations: if they all come out near zero, varimax was defensible after all and you now have evidence rather than an assumption. Note that oblique solutions print two tables, and it is the <em>pattern</em> matrix you interpret."),
 ("What is a factor loading, and what value is good?",
  "The correlation-like weight tying an observed variable to a factor — how much that item \"belongs.\" Conventional floors: |loading| ≥ .40 for a variable to count toward a factor (≥ .70 is excellent), while items loading ≥ .30–.40 on <em>multiple</em> factors (cross-loadings) make interpretation murky and are often revised or dropped in scale development."),
],

"manova": [
 ("When should I use MANOVA instead of separate ANOVAs?",
  "When your outcomes form a conceptually related set (anxiety + depression + stress) and you want one honest verdict about the <em>profile</em>. MANOVA controls the family-wise error a pile of ANOVAs would inflate, and it can detect coordinated patterns (small opposite shifts in correlated outcomes) that every univariate test misses. Unrelated outcomes, though, just dilute each other; don't stuff the model."),
 ("Should I report Wilks' lambda or Pillai's trace?",
  "Wilks' Λ is the traditional default and what most textbooks tabulate. Pillai's trace is the most robust when assumptions wobble (unequal covariance matrices, unequal group sizes), so many methodologists recommend it outright. With two groups they (and Hotelling's T²) agree exactly; when they disagree materially with 3+ groups, that itself hints at assumption trouble, and Pillai is the safer citation."),
 ("What should I do after a significant MANOVA?",
  "Localize the effect. The standard route: univariate ANOVAs on each outcome with a multiplicity correction, to see which variables carry the difference. The more multivariate route: descriptive discriminant analysis, which reveals <em>what combination</em> of outcomes best separates the groups — often the more faithful summary, since a combination is what MANOVA actually tested."),
],

"power-analysis-for-complex-designs": [
 ("How do I choose the effect size for a power analysis?",
  "Best: the smallest effect that would still matter (the \"smallest effect size of interest\") — powering for it means anything you miss was too small to care about. Also common: effects from prior literature or meta-analyses, discounted for publication bias (published effects run inflated; halving them is not paranoid). Worst: Cohen's \"medium\" chosen because it's the middle button."),
 ("What is post-hoc power analysis, and should I run one?",
  "If it means computing \"observed power\" from your just-obtained effect size and n — don't. Observed power is a deterministic function of your p-value (p just under .05 always gives power just over 50%), so it adds literally no information; journals still occasionally ask, but methodologists have thoroughly debunked it. Meaningful after-the-fact questions sound like: \"what effect size could this design detect with 80% power?\""),
 ("How big should a pilot study be?",
  "Big enough to test whether the study can run, and not one participant more, because that is the only question a pilot can answer. The tempting move is to read an effect size off the pilot and power the real study with it, and that is exactly what a pilot cannot support: an effect estimated from twenty people carries an interval so wide that it is compatible with almost any sample-size answer, and if the pilot looked promising enough to continue then its estimate is selected upward as well. A common rule of thumb is around a dozen participants per group, which is enough to find out whether recruitment works, whether the instructions are understood, how long a session really takes, and whether your measure has any range at all. Get the effect size for the main study from published work, from theory, or from the smallest effect you would care about (see <a href=\"../../stats-1/effect-size-and-power/\">effect size &amp; power</a>) rather than from your own pilot."),
],

# ---------------- STATS 4 ----------------

"bootstrap-and-resampling": [
 ("How many bootstrap resamples do I need?",
  "For standard errors, ~1,000 is plenty; for confidence intervals (which depend on the distribution's tails), 5,000–10,000 is the modern norm, and since computation is cheap there's no reason to skimp. Note what B does and doesn't fix: more resamples reduce simulation noise, but the information ceiling is set by your original n. B = 100,000 can't rescue a sample of 12."),
 ("My bootstrap interval and my t-interval disagree. Which one do I trust?",
  "First check how far apart they are. For a mean from a reasonably symmetric sample the two should land within a whisker of each other, and a real disagreement is a signal rather than a nuisance: it usually means the sampling distribution is skewed, which is the assumption the t-interval makes and the bootstrap does not. In that case prefer the bootstrap, and prefer a BCa interval over a plain percentile one. Two things to rule out before concluding anything: too few resamples (an interval built on 1,000 replicates still jitters in its third digit, so rerun with 10,000 and see whether the disagreement survives) and a sample small enough that neither method is trustworthy. If the two agree, you have learned something too, which is that the parametric assumption was doing no harm here."),
 ("What is the difference between bootstrapping and permutation tests?",
  "Different questions. The bootstrap resamples <em>with replacement</em> to estimate uncertainty: standard errors and confidence intervals for an estimate. A permutation test <em>reshuffles group labels</em> to build the null distribution — \"what differences would chance produce if the labels meant nothing?\" — yielding an exact p-value. Estimation → bootstrap; hypothesis testing → permutation."),
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
 ("How do I test a hypothesis with a credible interval?",
  "You can simply read the probability off the posterior, which is the whole advantage: P(θ &gt; 0 | data) is an ordinary number you can quote, with no null hypothesis anywhere. When you do want a decision rule, the usual one is a <strong>ROPE</strong>, a region of practical equivalence: state in advance the range of values you would count as \"no meaningful effect\", say −0.1 to 0.1 on your outcome's scale, and compare it with the credible interval. If the interval falls entirely inside the ROPE you can accept the null for practical purposes, which no p-value will ever let you do; if it falls entirely outside, you reject it; if it straddles the boundary, the honest answer is that the data have not decided. Choosing the ROPE is a judgment about what matters in your field, so state it before you look, exactly as you would a <a href=\"../../stats-1/effect-size-and-power/\">smallest effect size of interest</a>."),
 ("Do Bayesian and frequentist results ever agree?",
  "Constantly: with flat/weak priors and reasonable sample sizes, credible and confidence intervals often match to two decimals, since the likelihood dominates both. They part ways when priors carry real information, when data is thin, and in interpretation always. The practical upshot: the frameworks usually corroborate each other, and genuine disagreement is itself diagnostic — it means your prior is doing heavy lifting."),
],

"generalized-linear-models": [
 ("What is a link function in simple terms?",
  "The bridge between a straight line and an outcome that can't follow one. The linear predictor b₀ + b₁x ranges over all numbers, but a probability lives in (0, 1) and a count rate must stay positive — so the link transforms the outcome's mean onto the unlimited scale where the line lives (logit for probabilities, log for counts). One linear machine, different adapters."),
 ("What is overdispersion and how do I handle it?",
  "Poisson regression hard-codes variance = mean, and real counts are almost always messier — more zeros, longer tails (event counts cluster within people, days, sites). The symptoms: deviance far exceeding its degrees of freedom, deceptively tiny standard errors. Standard fixes: a quasi-Poisson model (scales the errors) or, more commonly, a <strong>negative binomial</strong> model with its own dispersion parameter."),
 ("Which GLM family should I use for my outcome?",
  "Read it off the outcome type: continuous and roughly symmetric → Gaussian (ordinary regression); yes/no → binomial with logit link (logistic); counts of events → Poisson with log link (negative binomial if overdispersed); strictly positive skewed amounts (costs, durations) → Gamma, usually with a log link. The workflow (predictors, interactions, diagnostics) stays identical across all of them."),
],

"mixed-and-multilevel-models": [
 ("What is the difference between fixed and random effects?",
  "Fixed effects are coefficients estimated for effects you care about specifically and would keep in a replication (treatment, age, condition). Random effects model <em>sampled clusters</em> (these particular schools, participants, litters) as draws from a population, estimating how much clusters vary rather than each one in isolation. Litmus test: would new data bring the <em>same levels</em> (fixed) or new ones (random)?"),
 ("Why doesn't my mixed model print p-values?",
  "Because for a mixed model nobody agrees what the denominator degrees of freedom should be. In a balanced classical ANOVA the error df are countable; once you have unequal group sizes, crossed random effects and partial pooling, the effective df fall between two defensible numbers and the <em>F</em> ratio is only approximately <em>F</em>-distributed. R's lme4 therefore declines to guess, which surprises everyone the first time. The accepted ways forward: report the fixed effects with their confidence intervals and let those carry the inference, use Satterthwaite or Kenward-Roger approximate df (the lmerTest package adds them, and SPSS and JASP apply Satterthwaite by default, which is why they show p-values and lme4 does not), or compare nested models with a likelihood-ratio test. Whichever you choose, say which one in the write-up, because the three do not always agree at the margin."),
 ("How many groups do I need to fit random effects?",
  "Rules of thumb converge on: fewer than ~5 groups, don't — the model can't estimate between-group variance from 3 numbers (use fixed dummy codes instead); 10–20 groups works but estimates variance components roughly; 30+ is comfortable, and 50+ is preferred for random <em>slopes</em> or when the variance components are themselves the research question."),
],

"cross-validation-and-overfitting": [
 ("What value of k should I use for k-fold cross-validation?",
  "k = 5 or k = 10 is the standard, well-studied compromise: each fold's training set is nearly the full data (low bias), without the variance and cost of leave-one-out (k = n). Small datasets lean toward k = 10 or repeated CV (multiple random fold splits, averaged) to stabilize the estimate. There's rarely a reason to deviate."),
 ("What is the difference between a validation set and a test set?",
  "The validation set is used <em>during</em> modeling (comparing candidate models, tuning complexity), so decisions get optimized against it, and its error estimate becomes optimistic. The test set is opened exactly once, after all decisions are final, to report honest performance. Cross-validation typically replaces the validation set; the untouched final test set remains best practice."),
 ("Can I use cross-validation on time-series data?",
  "Not the ordinary kind. Random folds put future observations in the training set and past ones in the test set, so the model gets to see what it is supposed to be predicting and the score comes out far too good. Use a scheme that respects the arrow of time instead: <strong>rolling-origin</strong> (also called forward-chaining) validation trains on everything up to a cut-off, tests on the stretch that follows, then slides the cut-off forward and repeats, so every evaluation only ever looks forward. If neighboring observations are correlated, leave a gap between the training window and the test window as well, since an observation an hour before the test period leaks nearly as much as one inside it. The same care applies to any data with structure that random splitting would break, including repeated measurements on the same person: split by person, not by row."),
],

"causal-dags-and-confounding": [
 ("What is a collider in simple terms?",
  "A variable caused by two others: X → C ← Y. Left alone, it transmits nothing. But select or adjust on it and you <em>create</em> a spurious X–Y association. The classic intuition: among hospitalized patients (being hospitalized = the collider), two diseases look negatively correlated even if independent in the population — because having either one is enough to get you admitted."),
 ("Should I control for every variable I measured?",
  "Emphatically no: \"kitchen-sink regression\" is a recipe for bias, not rigor. Adjusting for confounders (common causes) removes bias; adjusting for colliders (common effects) creates it; adjusting for mediators erases the very effect you're estimating. Since the data alone can't tell these apart, the covariate list must come from a causal diagram of how the data was generated. That's the DAG's whole job."),
 ("What if I can't tell whether a variable is a confounder or a collider?",
  "The data will not tell you, and this is the part people find hardest to accept: adjusting for either one changes your estimate, and the output looks equally respectable both ways. The decision has to come from what you know about how the variables arose. The most useful practical handle is <strong>time</strong>: a variable measured before X was in place cannot be a common <em>effect</em> of X and Y, so it is a confounder candidate rather than a collider. Anything measured after both is the opposite worry. When temporal order genuinely does not settle it, do not split the difference. Draw the two graphs, report the adjustment set implied by the one you think is right, and show the other as a sensitivity analysis, so a reader who disagrees with your arrow can see what their assumption would have produced."),
],

"survival-analysis": [
 ("What is censoring in survival analysis?",
  "A censored observation is an unfinished clock: the event hadn't happened when you stopped observing (study ended, participant moved away), so you know survival exceeded some time, but not by how much. It's information, not garbage: censored subjects rightly count in the at-risk pool while observed. Standard methods assume censoring is uninformative; dropping out mustn't be related to imminent risk."),
 ("What does a hazard ratio mean?",
  "The instantaneous event-rate multiplier between groups: HR = 2 means at any moment, the exposed group's event rate is double the reference group's. It is <em>not</em> \"twice as likely to die overall\" nor \"half the survival time.\" HR < 1 is protective; and a proportional-hazards model assumes this ratio is constant over follow-up — worth checking, not assuming."),
 ("What is the difference between Kaplan–Meier and Cox regression?",
  "Kaplan–Meier <em>describes</em>: a nonparametric survival curve per group, compared with the log-rank test — no covariates allowed. Cox proportional-hazards regression <em>models</em>: hazard ratios as a function of many predictors at once, adjusting for age, severity, and anything else. The pairing is standard: KM curves for the picture, Cox for the adjusted inference."),
],

"missing-data": [
 ("How much missing data is too much?",
  "Wrong first question — the <em>mechanism</em> outranks the amount. 5% missing not-at-random (MNAR) can bias conclusions more than 30% missing at random handled with multiple imputation. That said, practical strain grows past ~10% (report sensitivity analyses) and results lean heavily on the imputation model past ~40%. Always report how much was missing, why you believe it went missing, and how you handled it."),
 ("How do I report missing data in a paper?",
  "Say four things, and say them before the results rather than in a footnote after. How much is missing, per variable and per group, in counts as well as percentages, because \"8% missing\" hides the fact that it was 14 in one arm and 2 in the other. Why you think it went missing, named as a mechanism and defended in a sentence, since that assumption is what licenses everything you do next. What you did about it, including the imputation model and the number of imputations if you imputed. And whether the conclusion survives a different reasonable assumption, which is what a sensitivity analysis is for. Trials additionally report the flow of participants through the study, and <a href=\"../../writing/writing-results/\">the results section</a> is where most of this belongs. Reviewers rarely object to missing data that is described honestly; they object to discovering it in a degrees-of-freedom count that does not match the stated sample size."),
 ("How many imputations should I use in multiple imputation?",
  "The old advice of m = 5 came from an era of expensive computing. The modern heuristic: at least as many imputations as the percentage of incomplete cases (30% incomplete → m ≥ 30); m = 20–50 covers most studies and stabilizes standard errors and p-values across reruns. Computation is cheap now — err high."),
],

"meta-analysis": [
 ("What does I² tell you in a meta-analysis?",
  "The share of visible between-study variation that reflects real differences in effects rather than sampling noise. Rough bands: 25% low, 50% moderate, 75% high heterogeneity. High I² is a finding, not a defect: the effect genuinely varies across populations or protocols, the fixed-effect summary is too confident, and the interesting question becomes <em>what moderates the effect</em>."),
 ("How many studies do I need for a meta-analysis?",
  "Two will produce a number, so the arithmetic is never the constraint. What breaks down with few studies is the part that matters: with fewer than about five, the between-study variance τ² is estimated so poorly that I² and the width of a random-effects interval become close to guesswork, and the pooled result inherits that uncertainty without showing it. Somewhere around ten the estimates start to behave, and moderator analyses need considerably more than that, since each moderator is effectively a regression on a sample of studies. The Hartung-Knapp adjustment is the usual defense for a small set, because it widens the interval to reflect how badly τ² is pinned down. The real constraint, though, is comparability rather than count: five studies asking the same question pool honestly, while twenty measuring subtly different things produce a precise average of nothing in particular."),
 ("What is a funnel plot and what does asymmetry mean?",
  "Each study plotted as effect size vs. precision: big precise studies cluster at the top, small noisy ones fan out below — symmetrically, if all results reached publication. A missing lower corner (typically small null studies) suggests publication bias, testable with Egger's regression and probed with trim-and-fill. Caveat: asymmetry has innocent causes too, like small studies using different populations."),
],

"psychometric-functions": [
 ("What is the difference between the PSE and the JND?",
  "The PSE locates the curve; the JND measures how steeply it rises. A shifted PSE means the observer's subjective midpoint moved (a bias in perception), while a larger JND means discrimination got noisier (a loss of precision). They come from the same fit but answer different questions, and a manipulation can change either one without touching the other — that dissociation is often the headline result of a psychophysics study."),
 ("Which function should I fit: logistic, cumulative Gaussian, or Weibull?",
  "The two symmetric families (logistic and cumulative Gaussian) put the PSE in essentially the same place, and the asymmetric Weibull is usually within a handful of milliseconds; the spread parameter (and with it the JND) varies more, and the tails differ most. The cumulative Gaussian has the cleanest signal-detection interpretation (internal noise is normal), the logistic is computationally convenient and matches <a href=\"../../stats-3/logistic-regression/\">logistic regression</a>, and the Weibull suits detection tasks where performance is anchored at zero stimulus. Convention in your subfield is a fine tie-breaker; just report the family and keep it constant across conditions."),
 ("Do I need a lapse rate in my psychometric model?",
  "For real observers, usually yes. People blink, press the wrong key, and drift off, so a few errors appear even at the easiest stimulus levels. A two-parameter fit has to tilt the whole curve to accommodate those trials, which biases the slope (and so the JND); adding a small lapse parameter, either fixed at something like 0.02 or estimated with an upper bound, absorbs them instead. Tools built for psychophysics (psignifit, quickpsy) include lapse and guess rates by default, which is a good reason to graduate to them once the basic fit makes sense."),
],

"signal-detection-theory": [
 ("What is a good d′ value?",
  "Zero means the observer cannot tell signal from noise at all, and values grow without a fixed ceiling. Useful anchors come from the ROC identity AUC = Φ(d′/√2): d′ = 1 corresponds to getting a two-alternative comparison right about 76% of the time, d′ = 2 about 92%, and beyond 3 performance is so close to perfect that hit and false-alarm rates start saturating at 0 and 1, where the estimate itself turns fragile. What counts as good is task-dependent — a d′ of 1 is respectable for faint stimuli near threshold and alarming for a tumor-versus-clean judgment."),
 ("What is the difference between d′ and the criterion c?",
  "They answer different questions about the same observer. d′ measures how far apart the signal and noise evidence distributions sit — the discriminability the observer actually has, which no amount of strategy can raise. The criterion c measures where they drew their yes/no line: negative is liberal (many hits, many false alarms), positive is conservative (few of both). The two are estimated independently, so an experimental manipulation can move one without touching the other; showing <em>which</em> one moved is often the entire finding, as in <a href=\"../../stats-4/psychometric-functions/\">psychophysics</a> or recognition-memory work."),
 ("What should I do when a hit or false-alarm rate is exactly 0 or 1?",
  "The z-transform sends those proportions to infinity, so d′ cannot be computed from them directly. Two standard corrections exist. The log-linear rule adds 0.5 to every count and 1 to every trial total before converting — applied to all observers, not just the extreme ones. The 1/(2N) rule instead replaces only the offending rates, with 1/(2N) standing in for 0 and 1 − 1/(2N) for 1. Both shrink extreme estimates toward the middle; the log-linear version is less biased in simulations and is what this lesson uses. Whichever you pick, apply it uniformly and name it in your methods section."),
],
}

FAQS_METHODS = {

# ---------------- METHODS — Research Design ----------------

"from-question-to-hypothesis": [
 ("What's the difference between a hypothesis and a prediction?",
  "A <strong>hypothesis</strong> is a general proposed relationship between constructs — \"background music affects learning.\" A <strong>prediction</strong> is the specific, observable consequence you'd expect in a particular study if the hypothesis were true — \"first-year students will recall fewer words with lyrical music than in silence.\" The hypothesis is the idea; the prediction is what you commit to <em>before</em> running the study, pinned to a population, concrete measures, and a direction."),
 ("What makes a hypothesis falsifiable?",
  "There has to be some possible result that would count as evidence <em>against</em> it. \"Music changes recall\" is falsifiable: a clear no-difference result contradicts it. \"Music affects people somehow\" is not, because any outcome at all can be squeezed to fit, so it can never be wrong and therefore never informative. Falsifiability, following Popper, is the line between a scientific claim and an empty one."),
 ("Should I use a one-tailed or a two-tailed hypothesis?",
  "Default to two-tailed (non-directional) unless strong theory or prior evidence really justifies predicting the direction. A one-tailed test is <a href=\"../../stats-1/effect-size-and-power/\">more powerful</a> <em>if</em> you guessed the direction correctly, but it's blind to a real effect in the opposite direction, and switching to one-tailed after peeking at the data is a form of p-hacking. Whichever you choose, choose it before you collect data."),
],

"variables-and-operationalization": [
 ("What is the difference between a conceptual and an operational definition?",
  "A <strong>conceptual definition</strong> says what a construct means in the abstract — \"anxiety is apprehension about a future threat.\" An <strong>operational definition</strong> says exactly how you'll measure it here — \"anxiety = the total score on the 20-item State-Trait Anxiety Inventory.\" Every study needs both: the concept tells readers what you're studying, and the operation tells them precisely what you did, so they could repeat it."),
 ("Is a confounding variable the same as a control variable?",
  "They're nearly opposites. A <strong>confound</strong> is an uncontrolled third variable that rides along with your independent variable and offers a rival explanation for the result. A <strong>control</strong> is a variable you deliberately hold constant, or measure and adjust for, so it <em>can't</em> become a confound. A confound is a threat you failed to close off; a control is one you did. Untangling them is the heart of <a href=\"../../stats-4/causal-dags-and-confounding/\">causal reasoning</a>."),
 ("Can one construct have more than one operationalization?",
  "Usually it should. Stress can be operationalized as salivary cortisol, a self-report scale, or heart-rate variability, and each captures a slightly different facet of the idea. Using several measures and checking that they agree (convergent validity) is far stronger than trusting any single one, because no operationalization ever perfectly equals the construct it stands in for."),
],

"reliability-and-validity": [
 ("What is a good Cronbach's alpha?",
  "The folk rule is α ≥ .70 for research use and ≥ .80 for higher-stakes decisions, but it's a convention, not a law. Counter-intuitively, a very high α (≥ .90) can signal <em>redundant</em>, near-duplicate items rather than a better scale. α also grows with the number of items and depends on your sample, so report it for your own data, and remember it measures internal consistency, not <a href=\"../../methods/variables-and-operationalization/\">whether you measured the right thing</a>."),
 ("Can a measure be reliable but not valid?",
  "Absolutely, and it's the most dangerous case. A bathroom scale that always reads 3 kg heavy is perfectly reliable (it's consistent) yet completely invalid (it's systematically wrong). Reliability is <em>necessary</em> for validity — a measure that can't even agree with itself can't be accurate — but it never <em>guarantees</em> it. A precise, repeatable number can still be measuring the wrong thing."),
 ("What's the difference between reliability and validity?",
  "<strong>Reliability</strong> is consistency: the same answer under the same conditions, whether across time (test–retest), across raters (inter-rater), or across a scale's items (internal consistency). <strong>Validity</strong> is accuracy: whether the measure actually captures the construct you intend. On the dartboard picture, reliability is how tightly the darts cluster together; validity is whether that cluster sits on the bullseye."),
],

"experimental-design-and-randomization": [
 ("Does random assignment guarantee balanced groups?",
  "Not in every single study. Randomization balances groups <em>in expectation</em>: with a small sample you can still draw an unlucky split where one group happens to be older or more motivated. It just makes such imbalances random rather than systematic, and they shrink as the sample grows. That's still a huge win: unlike self-selection, the imbalance isn't tied to who chose the treatment, and any leftover difference is exactly the kind of chance variation your <a href=\"../../stats-1/hypothesis-testing-logic/\">significance test</a> already accounts for."),
 ("How do I actually randomize? Is alternating participants good enough?",
  "Alternating is not randomizing. Any rule a person can predict (every other arrival, odd and even ID numbers, Monday versus Tuesday) can be anticipated by whoever is recruiting, and the moment someone can foresee the next allocation they can consciously or unconsciously steer who turns up for it. Generate the sequence with something genuinely random, in advance, and keep it out of the recruiter's hands until the participant is committed: that second part is <strong>allocation concealment</strong>, and it is the piece most often missing. Sealed opaque envelopes are the low-tech version and a script that assigns on enrollment is the modern one. For small studies use <strong>block randomization</strong>, where the sequence is built from blocks that each contain equal numbers of every condition, so the groups cannot drift far apart if you stop early. Report the method you used, because 'participants were randomly assigned' with no detail is exactly the sentence reviewers have learned to distrust."),
 ("What is a wait-list control group?",
  "A wait-list control is a comparison group that receives the treatment <em>later</em>, after the study's measurements are done. It's common when withholding a promising intervention entirely would be unfair — everyone eventually gets it, but the delay creates an untreated comparison window. It keeps random assignment intact while sidestepping the ethical problem of a pure no-treatment group, though it can't control for the placebo effect the way an active or placebo control does."),
],

"between-vs-within-designs": [
 ("What is a mixed design?",
  "A design with at least one between-subjects factor and at least one within-subjects factor in the same study, and it is extremely common once you look for it. Any experiment with a treatment group and a control group (between) measured before and after (within) is a mixed design, as is a training study where two teaching methods are compared across three timepoints. You get the within factor's efficiency where you can have it and accept the between factor's cost where the manipulation cannot be reversed. The analysis is a <a href=\"../../stats-2/repeated-measures-anova/\">repeated-measures ANOVA</a> with the between factor added, and the effect people usually care about is the <a href=\"../../stats-2/factorial-anova-two-way/\">interaction</a>: whether the two groups changed <em>differently</em> over time, which is a sharper question than whether either changed at all."),
 ("Are within-subjects designs always more powerful?",
  "No. They win only when a person's scores across conditions correlate strongly — roughly above 0.5. That correlation is what lets individual differences cancel out; below it, you'd have been better off with independent groups. And heavy <em>carryover</em> (practice, fatigue, a lingering manipulation) adds noise that only the within design pays, which can erase the advantage entirely. When conditions correlate strongly and carry over little, though, a within design can need less than half the participants for the same <a href=\"../../stats-1/effect-size-and-power/\">power</a>."),
 ("Does counterbalancing remove carryover effects?",
  "Only partly. Counterbalancing (running the conditions in different orders across participants, e.g. via a <em>Latin square</em>) averages out <em>symmetric</em> order effects so they don't bias the mean. But if the transfer is <em>asymmetric</em> (condition A changes B more than B changes A), balancing the orders leaves residual variability in the difference scores rather than removing it. Counterbalancing is a defense, not a cure; when carryover is severe, a between-subjects design is safer."),
],

"quasi-experiments": [
 ("When does regression discontinuity fail?",
  "It fails when the cutoff is not as sharp as it looks. The design leans on one idea, that people just above and just below the threshold are alike apart from the treatment, and anything that lets them choose their side breaks it. The usual tell is <strong>bunching</strong>: plot the distribution of the running variable and look for a pile-up on the favorable side of the line, which means somebody was retaking the test, rounding the score, or granting exceptions. Two more limits worth stating in advance. The estimate is <em>local</em>, valid near the cutoff and not for people far from it, so a scholarship effect measured at a score of 90 says little about students at 60. And the answer can depend on how wide a window you look at, which is why an honest analysis shows the estimate across several bandwidths rather than the one that worked."),
 ("What is the parallel-trends assumption in difference-in-differences?",
  "Difference-in-differences estimates a treatment effect by subtracting the comparison group's before-to-after change from the treated group's change. That subtraction is valid only if, <em>absent the treatment</em>, both groups would have moved by the same amount — the <strong>parallel-trends assumption</strong>. It allows the groups to start at different levels (a baseline gap is fine) but requires their trends to match. If the treated group was already on a steeper trajectory, that differential trend gets counted as 'effect,' biasing the estimate."),
 ("What is a natural experiment?",
  "A natural experiment is a quasi-experiment where some outside force (a lottery, a law change, an arbitrary cutoff or border) assigns the 'treatment' in a way that is as-good-as-random with respect to the outcome. The researcher doesn't manipulate anything; they exploit the accident. When the assigning event really is unrelated to who would have done well anyway, a natural experiment can approach the causal credibility of a randomized trial on questions you could never ethically or practically assign yourself."),
],

"observational-designs": [
 ("What is the difference between a cohort study and a case-control study?",
  "They run in opposite directions. A <strong>cohort</strong> study starts from the <em>exposure</em> — it enrolls exposed and unexposed people who don't yet have the outcome and follows them forward to see who develops it, which measures incidence and yields a risk ratio directly. A <strong>case-control</strong> study starts from the <em>outcome</em> — it rounds up people who already have the disease (cases) plus a comparison group (controls) and looks backward at who was exposed. Cohorts are stronger for establishing time-order but slow and poor for rare outcomes; case-control studies are fast and efficient for rare outcomes but can only estimate an <a href=\"../../stats-3/logistic-regression/\">odds ratio</a>."),
 ("Isn't a huge observational study better than a small randomized trial?",
  "For precision, yes; for causation, no, and the two are easy to confuse. More data shrinks the confidence interval around whatever you are estimating, but it does nothing to the bias, so a large observational study can deliver a very precise answer to a question you did not mean to ask. Confounding does not average out with sample size the way noise does, which is exactly what the <a href=\"../../methods/experimental-design-and-randomization/\">randomization</a> playground shows: the imbalance bars under self-selection stay put as <em>n</em> grows while the randomized ones drift to zero. The honest reading is that the two designs answer different questions. Big observational studies are how we learn what happens in the world as it actually is, including in people a trial would have excluded; trials are how we learn what a change would do. Where they disagree, the trial usually wins on the causal claim and the observational study usually wins on who it applies to."),
 ("Why does a case-control study report odds ratios instead of risk ratios?",
  "Because the researcher <em>chose</em> how many cases and controls to enroll (often 1:1 or 1:4), the fraction of cases among everyone enrolled is an artifact of that choice, not a real risk, so risk ratios can't be computed. The <strong>odds ratio</strong>, however, is unaffected by how you sampled cases versus controls, and it estimates the same odds ratio you'd find in the whole population. The odds ratio only approximates the risk ratio when the outcome is <em>rare</em> (the rare-disease assumption); for common outcomes it overstates it."),
],

"sampling-methods": [
 ("What is a representative sample?",
  "A representative sample mirrors the population on the characteristics that matter for your question, so estimates from it generalize back to that population. You don't get one by hand-picking a 'balanced-looking' group. You get it, in expectation, by using a <strong>probability sampling</strong> method, where everyone has a known, non-zero chance of selection. Representativeness is a property of the <em>method</em>, not of any single sample: any one random sample may be a bit off, but the procedure is unbiased and its error shrinks with size."),
 ("Why are convenience samples a problem?",
  "Because the people who are easy to reach (your own class, passers-by, an online panel) differ systematically from those who aren't, so the sample is <strong>biased</strong>, not merely noisy. The crucial consequence: that bias does <em>not</em> shrink as you collect more data. A bigger convenience sample just gives a more precise wrong answer. Convenience samples are sometimes unavoidable (hard-to-reach groups, exploratory pilots), but you must be honest that your results describe whoever you could reach, not the wider population."),
 ("What is the difference between stratified and cluster sampling?",
  "Both divide the population into groups, but they use those groups oppositely. <strong>Stratified</strong> sampling splits people into strata (age bands, regions) and samples <em>within every one</em>, usually proportionally — guaranteeing coverage and giving a <em>more precise</em> estimate than simple random sampling. <strong>Cluster</strong> sampling splits people into many natural clusters (schools, city blocks), randomly picks a <em>few whole clusters</em>, and measures everyone in them — cheaper to run over a spread-out population, but far <em>noisier</em>, because people in the same cluster resemble one another."),
],

"survey-and-questionnaire-design": [
 ("Should I make every question required?",
  "Forcing an answer does not create information, it relocates the problem. A respondent who cannot answer honestly will either pick something arbitrary, which becomes noise you cannot distinguish from data, or abandon the survey entirely, which turns an item-level gap into a whole missing person and biases the sample toward people who did not mind the question. Both are worse than a blank. Make items required only where an answer is genuinely necessary and the question is genuinely answerable by everyone you are asking, give the others an explicit escape (a 'prefer not to say' or 'not applicable' option rather than a silent skip, so you can tell refusal from oversight), and record which is which in your <a href=\"../../data/codebooks-and-documentation/\">codebook</a>. What you are really deciding here is the <a href=\"../../stats-4/missing-data/\">missingness mechanism</a> you will have to defend later, and a forced-choice survey with heavy dropout has chosen the worst one without meaning to."),
 ("What is a double-barreled question?",
  "A double-barreled question asks about two things in a single item, so one answer can't honestly cover both — for example, 'How satisfied are you with the pay and the working hours?' Someone happy with the hours but not the pay has no valid response, and you can't tell which half their answer refers to. The fix is simple: split it into two separate questions, one per idea. The same rule applies whenever an item smuggles in an 'and' or an 'or' that respondents might answer differently."),
 ("What is social desirability bias, and how do you reduce it?",
  "Social desirability bias is the tendency to answer sensitive questions in a way that makes one look good rather than truthfully — under-reporting cheating or drinking, over-reporting voting or exercise. It contaminates exactly the topics researchers most want honest data on. You reduce it by guaranteeing and clearly <em>stating</em> anonymity, never attaching identifiers to sensitive items, softening the framing so the undesirable answer feels acceptable, and using indirect techniques (like list experiments) for the most delicate questions."),
],

"bias-and-blinding": [
 ("What is the difference between single-blind and double-blind?",
  "In a <strong>single-blind</strong> study the <em>participants</em> don't know which condition they're in, which blocks demand characteristics and the placebo effect. In a <strong>double-blind</strong> study neither the participants <em>nor</em> the researchers who interact with and measure them know the assignment, which additionally blocks experimenter-expectancy (observer) bias. Double-blinding is stronger because a researcher who knows the groups can unconsciously nudge behavior or rate outcomes more favorably — the reason a 'double-blind randomized controlled trial' is treated as the gold standard."),
 ("What are demand characteristics?",
  "Demand characteristics are cues in a study that let participants guess its purpose, so they respond to their <em>guess</em> about what's wanted rather than behaving naturally — trying extra hard in the condition they think should win, or deliberately doing the opposite. They're a threat to validity because they can manufacture (or erase) an effect that has nothing to do with your manipulation. The defenses are keeping participants blind to the condition and the true aim, using a plausible cover story, and unobtrusive or objective measures."),
 ("Does blinding fix every kind of bias?",
  "No. Blinding is specifically a defense against the biases driven by <em>knowing the assignment</em> — the placebo effect, demand characteristics, and experimenter-expectancy. It does nothing about <strong>selection bias</strong> (who got into the sample), <strong>attrition bias</strong> (who dropped out non-randomly), or <strong>response biases</strong> like social desirability. Those are design problems that need better sampling, retention and intention-to-treat analysis, genuine anonymity, and so on. Match each bias to its own safeguard rather than hoping blinding covers them all."),
],

"the-replication-crisis": [
 ("Is p-hacking always intentional fraud?",
  "Usually not. Most p-hacking is <em>motivated flexibility</em> rather than deliberate deceit: an honest researcher who wants a project to work makes a string of individually defensible choices (dropping an 'outlier', adding a covariate, checking a subgroup) that happen to nudge the result across <em>p</em> &lt; .05. This is the 'garden of forking paths': the analysis you'd have run depended on the data, so the true false-positive rate is far above 5%. It's a systemic problem to design against with preregistration, not a character flaw to accuse people of."),
 ("Does a failed replication mean the original finding was wrong?",
  "Not on its own, and treating one failed replication as a verdict repeats the same mistake that produced the problem: reading a single study as definitive. Several things can produce a non-replication. The original may have been a false positive, which is the possibility everyone jumps to. The replication may itself be underpowered, in which case it has simply failed to detect something. The effect may be real but smaller than first reported, so a replication powered for the inflated original estimate misses it. Or the effect may depend on something that differed between the two, a population, a procedure, a moment in time, which is a finding rather than a failure and one worth chasing. What settles it is neither study alone but the accumulation: several well-powered replications, ideally preregistered, and a <a href=\"../../stats-4/meta-analysis/\">meta-analysis</a> that pools them honestly rather than an argument about whose study was better."),
 ("How many psychology studies actually replicate?",
  "In the landmark 2015 Reproducibility Project, the Open Science Collaboration repeated 100 published psychology studies and found that only about 36–39% produced a significant result in the same direction, with replication effect sizes roughly half the originals'. Rates vary by field and by how 'replication' is scored, and later large-scale projects found similar or somewhat better figures. The precise number matters less than the lesson: a sizeable fraction of published findings don't hold up, and better methods, not more accusations, are the fix."),
],

"preregistration-and-open-science": [
 ("What is the difference between preregistration and a registered report?",
  "Both commit you to a plan before the data exist, but they differ in <em>when</em> that plan is reviewed. A <strong>preregistration</strong> is a timestamped analysis plan you deposit yourself (e.g. on the OSF or AsPredicted) before collecting data; you still submit the finished paper for peer review as normal. A <strong>registered report</strong> goes further: a journal peer-reviews your plan <em>first</em> and, if it's sound, grants in-principle acceptance to publish the results whatever they turn out to be. That last step is what directly defuses publication bias, since acceptance no longer hinges on a significant result."),
 ("Are exploratory analyses bad science?",
  "Not at all — exploration is how most discoveries begin. What's harmful is <em>disguising</em> exploration as confirmation: presenting a pattern you found by rummaging through the data as though you'd predicted it (HARKing). The honest solution is simply to label each analysis for what it is. Confirmatory analyses test predictions fixed in advance and carry valid <em>p</em>-values; exploratory analyses generate hypotheses and should be reported as such, to be confirmed in a future study. Preregistration draws that line for you."),
 ("Does preregistration mean I can never change my analysis?",
  "A preregistration is a plan, not a prison. When reality intervenes (a measure fails, an assumption is violated, a lab closes) you're allowed to deviate; you just have to <em>disclose</em> the change, explain why, and flag the affected analysis as no longer strictly confirmatory. What the commitment buys is an honest, checkable record of what you predicted versus what you decided after seeing the data, not blind obedience to a document, so readers can weight each appropriately."),
],

}

FAQS_DATA = {

# ---------------- DATA — From Raw to Ready ----------------

"tidy-data": [
 ("What does tidy data mean?",
  "Tidy data is a simple, standard shape for a table: <strong>each variable is a column, each observation is a row, and each cell holds a single value</strong>. The term comes from Hadley Wickham. A tidy table is usually long and a little dull to read, but that consistency is exactly what lets you filter, group, plot, and model it without reshaping first — messy data is messy in endless ways, whereas tidy data is all tidy in the same way."),
 ("Should data cleaning ever change my raw data file?",
  "Treat the raw file as read-only. Save exactly what you collected, never overwrite it, and do every fix in a <em>script</em> that reads the raw file and writes a separate clean one. That way the messy original stays intact as the ground truth, every change is documented and reversible, and anyone (including future-you) can rerun the whole pipeline from scratch. Hand-editing cells in the raw sheet destroys the record of what actually happened."),
 ("Do I have to reshape everything into long format?",
  "Tidy (long) format is the analysis-ready default, and most modern tools expect it. But some procedures genuinely want a <em>wide</em> layout: repeated-measures ANOVA in SPSS, or a correlation matrix, put each measure in its own column. Long is not a universal rule so much as a reliable reference point, and once your data is tidy you can move between shapes on demand. Reshaping (pivoting) is a one-line operation, not a manual rebuild."),
],

"codebooks-and-documentation": [
 ("How should I code missing values?",
  "Leave the cell genuinely empty, or use a dedicated marker like <code>NA</code> — not a number. Numeric codes such as <code>-99</code>, <code>0</code>, or <code>999</code> are dangerous because the software treats them as real data: forget to declare them and they get averaged straight into your means and SDs. Never use <code>0</code> in particular, since 0 is a legitimate value for many variables. If your software forces a numeric code, record it prominently in the codebook and convert it to missing as the very first cleaning step."),
 ("What should a codebook include?",
  "One entry per variable, listing at minimum: the exact <strong>column name</strong>, a human-readable <strong>label</strong>, the <strong>type</strong> (continuous, ordinal, nominal, date, identifier), the <strong>units or allowed values</strong> (kilograms; 1–5; the category set), and how <strong>missing data</strong> is marked. Add anything a stranger couldn't infer from the numbers — which items are reverse-scored, how a composite was computed, the date format. If you'd have to explain it out loud, write it down."),
 ("What makes a good variable name?",
  "Short, lowercase, no spaces or special characters, and stable over time — <code>age</code>, <code>income_usd</code>, <code>item3_rev</code>. Good names hint at the content and can encode useful flags (a <code>_rev</code> suffix for a reverse-scored item) without trying to <em>be</em> the codebook. Avoid names that are really values (a column called <code>2019</code>), names that collide when truncated, and cryptic abbreviations only today-you understands. The codebook carries the full meaning; the name just has to be unambiguous and machine-friendly."),
],

"data-entry-and-validation": [
 ("What are data validation rules?",
  "They're explicit statements of what a <em>legal</em> value looks like, checked automatically so errors surface without re-reading every cell. Three common kinds: <strong>range checks</strong> (a number must fall inside plausible bounds, e.g. <code>0 ≤ age ≤ 120</code>), <strong>allowed-value sets</strong> (a category must be one of a fixed list, e.g. sex is M, F, or Other), and <strong>cross-field logic</strong> (two columns must agree, e.g. birth year equals the current year minus age). Write them from your <a href=\"../../data/codebooks-and-documentation/\">codebook</a> and rerun them every time the data changes."),
 ("Should I just delete impossible values I find?",
  "A validation flag is the <em>start</em> of an investigation, not a license to delete. First find out what happened: an impossible value is usually a fixable data-entry error, so check the source and correct it (an age of 511 was almost certainly 51). If it truly can't be recovered, mark it as <em>missing</em> and say so — don't silently drop the whole row. Deleting values hides problems and can bias your results; every change should be documented and reversible."),
 ("What is double data entry?",
  "It's entering the same data <em>twice</em> (by two people, or by one person on two separate passes) and then comparing the two versions cell by cell. Wherever they disagree, at least one entry is wrong, so the mismatches point you straight to the typos to check against the source. It sharply cuts the undetected-error rate and is standard in clinical trials and other high-stakes data collection. For smaller projects, validation rules plus a careful proofreading pass are a lighter-weight substitute."),
],

"data-cleaning-workflow": [
 ("Should I clean my data in the spreadsheet or in a script?",
  "In a script, always. Hand-editing cells in the spreadsheet destroys the record of what you changed and can't be repeated if the raw file is ever corrected. Instead, keep the <a href=\"../../data/tidy-data/\">raw file</a> read-only and write every fix as code that reads it and produces a <em>separate</em> clean file. That makes cleaning reproducible (rerun and get the same result), reversible (delete the clean file, the raw survives), and auditable (the script <em>is</em> the log of every decision). Point-and-click is fine for <em>inspecting</em> the data; it's the fixing that must be scripted."),
 ("How do I decide whether two rows are really duplicates?",
  "First define what makes a row unique — usually a participant ID plus, for repeated measures, a timepoint. <strong>Exact duplicates</strong> (every field identical, often a double-clicked submit) are safe to drop. <strong>Fuzzy duplicates</strong> (the same person as \"Ann Lee\" and \"Ann&nbsp;Lee&nbsp;\", or two near-identical rows differing by a whitespace ghost) need investigation, not automatic deletion. And beware the false alarm: in long-format data one person legitimately owns several rows, so identical values in a few columns don't make them duplicates. Check your row count before and after, and log how many you removed."),
 ("In what order should cleaning steps run?",
  "Inspect before you touch anything, then apply fixes in an order where each step sets up the next. A reliable default is: trim whitespace, then standardize categories, then remove duplicates, then range-check numeric fields — re-inspecting after each. Order genuinely matters: you can't merge <code>\"Control&nbsp;\"</code> with <code>\"Control\"</code> until the trailing space is trimmed, and de-duplicating before you've standardized labels can miss copies that only look different because of formatting. Writing the steps as an explicit pipeline makes that order visible and repeatable."),
],

"outliers-in-practice": [
 ("Should I remove outliers before or after checking assumptions?",
  "Neither in isolation — investigate the <em>cause</em> first, because the two questions are entangled. Never delete points simply to make an assumption check pass; that's how honest analysis slides into <a href=\"../../methods/the-replication-crisis/\">p-hacking</a>. Often a single fix resolves both at once: a genuine data-entry error corrected removes an assumption violation too, and a <a href=\"../../data/transformations-and-recoding/\">log transform</a> can tame a skewed distribution without discarding any data. If an extreme point is real and you're unsure, run the analysis with and without it (a sensitivity analysis) and report both."),
 ("Is it ever okay to just delete an outlier?",
  "Only when you can point to a documented reason the observation is invalid (an equipment failure, a participant who didn't follow instructions, an impossible value with no recoverable source) and you <em>report</em> that you removed it and why. What's never acceptable is silently dropping points because they weaken your result. A genuine extreme (a real, rare value from a heavy-tailed distribution) is information, not contamination: keep it and lean on robust methods such as medians, trimmed means, or rank tests so it doesn't dominate."),
 ("Should I flag outliers with z &gt; 3 or the 1.5 × IQR rule?",
  "Both are rules of thumb, not laws, and they answer slightly different questions. The <strong>z-score</strong> rule (|z| &gt; 3) assumes roughly normal data and uses the mean and SD — which the outlier itself inflates, so a lone giant can mask itself. The <strong>1.5 × IQR</strong> rule is built from quartiles, so it's far more robust and better for skewed data. Look at a boxplot or histogram first, decide the rule in advance so the result can't steer it, and remember that either way you've only <em>flagged</em> a point for investigation, not sentenced it."),
],

"transformations-and-recoding": [
 ("When should I log-transform my data?",
  "Reach for a log when a variable is strongly right-skewed and strictly positive (income, reaction times, counts, concentrations), especially when its structure is multiplicative (a 10% change matters more than a fixed amount). A log often restores the normality and constant variance that <a href=\"../../stats-2/assumptions-and-when-they-break/\">tests assume</a>, and pulls in a long tail so a few large values stop dominating. If the variable contains zeros, use <code>log(x + 1)</code>. The trade-off is interpretation: results now live on the log scale, so report that and back-transform your summary to the geometric mean."),
 ("Is it okay to median-split a continuous variable?",
  "Avoid it. Chopping a continuous predictor into \"high\" and \"low\" at the median feels tidy and lets you run a t-test, but it throws away all the variation within each half — everyone above the median is treated as identical. Statistically it shrinks a correlation to about 0.80 of its value, which is roughly the same power loss as discarding a third of your participants, and it can even manufacture spurious effects. Keep the variable continuous and use correlation or regression; if you truly need categories for a <em>plot</em>, make them there, not in the analysis."),
 ("Do I have to reverse-code items before averaging them into a scale?",
  "Reverse-code first, always. If a questionnaire mixes positively and negatively worded items (\"I feel calm\" alongside \"I feel tense\"), the negative ones run in the opposite direction; average them in raw and they partly cancel the others, deflating both the scale's <a href=\"../../methods/reliability-and-validity/\">reliability</a> and its validity. Flip each reverse item with <code>6 − x</code> on a 1–5 scale (or <code>max + min − x</code> in general) so every item points the same way, then compute the composite. Recompute Cronbach's α afterwards to confirm the items now hang together."),
],

"wide-vs-long-data": [
 ("Should repeated-measures data be in long or wide format?",
  "It depends entirely on the tool. Classic point-and-click <a href=\"../../stats-2/repeated-measures-anova/\">repeated-measures ANOVA</a> in SPSS wants <strong>wide</strong> — each timepoint in its own column, which it reads as the levels of your within-subject factor. Almost everything else (the tidyverse, pandas, JASP's mixed-model tools, and every <a href=\"../../stats-4/mixed-and-multilevel-models/\">multilevel model</a>) wants <strong>long</strong>, with one row per measurement and a column naming the occasion. The practical answer: keep your clean data in long (tidy) form as the master copy, and pivot to wide only when a specific procedure demands it."),
 ("What's the difference between pivot_longer and pivot_wider?",
  "They're inverse operations. <code>pivot_longer()</code> (or pandas <code>melt()</code>) takes several columns and stacks them into two: a <em>key</em> column holding the old column names and a <em>value</em> column holding the numbers, so wide becomes long. <code>pivot_wider()</code> (or pandas <code>pivot()</code>) does the reverse, spreading one key column back out into a column per level, so long becomes wide. Run one then the other and you return to where you started, as long as each row is uniquely identified by its keys."),
 ("Is tidy data the same as long data?",
  "Nearly, but not exactly. <a href=\"../../data/tidy-data/\">Tidy data</a> means each variable is a column, each observation a row, and each cell one value — and for repeated measures that usually produces a long layout, because \"time\" is a variable and so belongs in its own column rather than being smeared across headers. So tidy data is typically long, but \"long\" is really a description of shape while \"tidy\" is a description of meaning. A table can be long and still untidy if, say, two different variables are crammed into one value column."),
],

"merging-datasets": [
 ("Why did my merge create duplicate rows?",
  "Because the key isn't unique in one of the tables. A join matches every copy of a key on one side to every copy on the other, so if an ID appears twice in the table you're joining <em>to</em>, each matching row on the other side is duplicated, a <strong>many-to-many</strong> join. It's the classic silent bug: nothing errors, you just end up with more rows (and inflated statistics) than you have participants. Before joining, check each key is unique where you expect it to be (<code>duplicated()</code> in R, <code>.is_unique</code> in pandas), and compare the row count before and after."),
 ("What's the difference between an inner join and a left join?",
  "An <strong>inner join</strong> keeps only rows whose key appears in <em>both</em> tables — anyone missing from either side is dropped, giving you complete cases. A <strong>left join</strong> keeps <em>every</em> row of the left (\"main\") table and attaches matches from the right where they exist, filling <code>NA</code> where they don't. Use a left join as your default when one table is your participant list and you don't want to lose anyone; use an inner join when you deliberately want only the people present in both sources."),
 ("My merge dropped half my rows — what went wrong?",
  "Almost always a key mismatch. The join is comparing keys that <em>look</em> the same to you but not to the computer: a trailing space (<code>\"P01 \"</code> vs <code>\"P01\"</code>), a number stored as text on one side (<code>1</code> vs <code>\"01\"</code>), or different capitalisation. Because those keys never match, an inner join silently discards them. <a href=\"../../data/data-cleaning-workflow/\">Clean and standardize the key column</a> on both sides first (trim whitespace, fix the type, unify the case) then rejoin and confirm the row count is what you expected."),
],

"reproducible-workflows": [
 ("Do I have to use code — can't I just use SPSS menus?",
  "Menus are fine for <em>exploring</em> data, but the analysis itself should be scripted, and SPSS supports this: every dialog can paste its <strong>syntax</strong>, and running that syntax file reproduces the result exactly. The problem with clicking is not SPSS. It's that a click leaves no record, so six months later you can't say what you did or repeat it. A saved syntax (or R/Python) script is a re-runnable, shareable, correctable recipe. You don't have to abandon your software; you have to keep the record of what it did."),
 ("What does setting a seed actually do?",
  "Computers generate \"random\" numbers from a deterministic sequence started by a <em>seed</em>. Set the seed to a fixed value (<code>set.seed(1)</code>, <code>np.random.default_rng(1)</code>) and that sequence (and every bootstrap, simulation, shuffle, or random split that draws from it) comes out identical on every run and every machine. Without a seed, anything random gives different numbers each time, so your results can't be reproduced. Set it once, near the top of the script, before any random step."),
 ("What makes an analysis reproducible?",
  "That someone else — or future-you — can take your files and regenerate every reported number with nothing else. In practice that means: the raw data is included and never edited by hand; all cleaning and analysis live in scripts that read the raw data and write the output; anything random is <a href=\"../../data/reproducible-workflows/\">seeded</a>; and the software and package versions are recorded. The test is concrete: hand your project folder to a stranger and ask whether they could rebuild your results without emailing you. If they'd need a verbal explanation, something isn't documented yet."),
],

"data-privacy-basics": [
 ("Is removing names enough to anonymize data?",
  "No. Stripping names and other direct identifiers gives you <em>de-identified</em> data, not anonymous data, because the ordinary details left behind can still single people out. In a well-known result, Latanya Sweeney showed that about <strong>87% of Americans are uniquely identified by ZIP code, date of birth, and sex alone</strong> — three fields on almost every \"anonymized\" record. Cross-referenced with a public list, those quasi-identifiers put the names back. Real anonymization needs you to generalize or suppress those fields too, not just delete the obvious ones."),
 ("What's the difference between anonymized and pseudonymized data?",
  "<strong>Anonymized</strong> data cannot be traced back to a person by anyone, even in principle — there's no key and the remaining fields don't re-identify. <strong>Pseudonymized</strong> data replaces direct identifiers with a code (participant P037) while a separate, secured <em>key</em> still links codes to people; it's reversible by design, which is handy for follow-ups but means the data are <em>not</em> anonymous as long as that key exists. Keep the key stored apart from the data, with access tightly limited, and treat the dataset as identifiable until the key is destroyed."),
 ("What is k-anonymity?",
  "It's a simple yardstick for how re-identifiable a dataset is: it is <em>k</em>-anonymous if every person shares their combination of quasi-identifiers (age, sex, ZIP, and so on) with at least <em>k − 1</em> others, so no record can be narrowed to a group smaller than <em>k</em>. Bigger <em>k</em> is safer. You raise it by making values coarser (banding exact age into decades, a full ZIP into its region) until the loneliest record has enough company. A record with k = 1 is unique and should be generalized further or suppressed before you share."),
],

}

FAQS_ETHICS = {

# ---------------- ETHICS ----------------

"why-research-ethics": [
 ("Was Milgram's obedience study ethical by today's standards?",
  "By modern standards, no: it would not pass an ethics committee as it was run. It used deception participants could not consent to, exposed them to real and visible distress, and made stopping difficult because an experimenter actively urged them to continue, straining the right to withdraw. Milgram did debrief his participants and later reported that most were not lastingly harmed, and the study's insight into obedience is genuinely important — but the value of the findings does not retroactively justify the methods. Today the same question would have to be pursued with far stronger safeguards, much milder methods, or not at all. It is a useful teaching case precisely because it sits on the line and forces the risk–benefit conversation into the open."),
 ("What are the three principles of the Belmont Report?",
  "Respect for persons, beneficence, and justice. <strong>Respect for persons</strong> means treating people as autonomous decision-makers and giving extra protection to those with limited autonomy, which in practice means <a href=\"../../ethics/informed-consent-and-irb/\">informed consent</a>. <strong>Beneficence</strong> means maximizing the likely benefits and minimizing the possible harms — the risk–benefit assessment. <strong>Justice</strong> means distributing the burdens and benefits of research fairly, so the people who take the risks aren't a different, more vulnerable group than the people who stand to gain. Nearly every requirement an ethics committee imposes can be traced back to one of these three."),
 ("What happened in the Tuskegee study, and why did it change research?",
  "From 1932 to 1972 the U.S. Public Health Service followed about 600 poor Black men in Alabama (roughly 400 of them already infected with syphilis) to observe the untreated course of the disease. The men were told they were being treated for 'bad blood' and were never told their true diagnosis; when penicillin became the standard cure in the 1940s, it was deliberately withheld so the observation could continue. After a whistle-blower brought it to the press, public outrage led to the 1974 National Research Act, which created Institutional Review Boards and the commission that wrote the Belmont Report. In short, today's requirement for informed consent and independent ethics review exists in large part because of Tuskegee."),
],

"informed-consent-and-irb": [
 ("Do online surveys need ethics approval?",
  "Usually yes: being 'online' and 'just a survey' does not exempt a study from review. If you are collecting data from people to answer a research question, most institutions require you to submit it, and only the committee can decide it is exempt. A genuinely anonymous, minimal-risk survey of adults often qualifies for <em>exempt</em> or <em>expedited</em> review, which is lighter and faster — but surveys touching sensitive topics (health, illegal behavior, trauma), involving minors, or collecting identifiable responses can need full review. The safe rule for a student is simple: assume you need approval, apply <em>before</em> collecting anything, and let the committee tell you the level."),
 ("What is the difference between assent and consent?",
  "<strong>Consent</strong> is the binding agreement given by someone with the capacity to make the decision — an adult participant, or the parent or guardian of a child. <strong>Assent</strong> is a child's own age-appropriate agreement to take part, given <em>alongside</em> a guardian's consent. What matters is that a minor cannot give legal consent but still has a say: they must be told what will happen in words they understand and be free to decline, and their refusal stands even if a parent has agreed. The same logic extends to adults with diminished capacity, where a legal representative consents and the person's own assent is still sought."),
 ("What's the difference between exempt, expedited, and full-board review?",
  "They are three intensities of ethics review, scaled to how risky the study is. <strong>Exempt</strong> is for minimal-risk work in specific low-stakes categories (anonymous adult surveys, ordinary classroom activities); you still submit, but it skips full review. <strong>Expedited</strong> is also for no-more-than-minimal-risk studies but is checked by one or two committee members rather than the whole board (non-invasive measurements, voice recordings, moderate surveys). <strong>Full-board</strong> review, at a convened meeting of the whole committee, is required for anything above minimal risk, or involving vulnerable groups, deception, or sensitive identifiable data. Crucially, <em>which</em> category applies is the committee's determination, not yours."),
],

"deception-and-debriefing": [
 ("When is deception allowed in a research study?",
  "Only when three conditions hold at the same time: there is no reasonable non-deceptive way to answer the question, the deception exposes participants to no more than minimal risk and to nothing they would reasonably resent, and everyone is fully debriefed afterwards with the option to withdraw their data. Miss any one (an honest design would have worked, the deception causes real distress, or there is no proper debrief) and it is not justified. Deception is also meant to be a last resort, cleared in advance by an ethics committee, not a default way to dodge <a href=\"../../methods/bias-and-blinding/\">demand characteristics</a>."),
 ("What should a debriefing include?",
  "A genuine debrief does four things: it reveals and explains any deception (what was misrepresented, and why it was scientifically necessary); it corrects any false beliefs the study may have created, so nobody leaves thinking, say, that rigged 'failure' feedback was real; it offers the right to withdraw their data now that they know the truth; and it checks on wellbeing and provides a contact for later concerns. The aim is that participants leave no worse off (and ideally better informed) than when they arrived. 'The study's over, thanks for coming' is not a debrief."),
 ("Can I use deception in my student project?",
  "You can, but you almost certainly shouldn't need to, and you cannot do it on your own say-so. Any deception must be justified in your ethics application and approved before you start — and reviewers will first ask whether an honest design, an indirect measure, or simply not disclosing the specific hypothesis would answer your question just as well. If deception really is necessary, it has to be minimal-risk and paired with a written debriefing plan and a data-withdrawal option. For most student studies the honest route is available, faster to get approved, and avoids the trust cost entirely — so reach for deception last."),
],

"privacy-and-confidentiality": [
 ("Can I share my data publicly if I promised confidentiality?",
  "Only what your consent covers, which is why this has to be decided before you collect rather than when a journal asks. Data-sharing requirements and confidentiality promises are both reasonable and they collide badly if you write the consent form as though sharing will never happen. Three routes out, in order of preference. Ask for it up front: a consent form can say that de-identified data may be shared for future research, and most participants agree. Share a genuinely anonymized subset, remembering that removing names is not anonymization and quasi-identifiers usually need generalizing first. Or use controlled access, where the data sit in a repository and other researchers apply for them under terms, which is standard for sensitive and clinical data. What you cannot do is promise confidentiality without qualification and then decide later that sharing counts as an exception, and \"data available on request\" is not a substitute for having thought about it."),
 ("Is deleting participants' names enough to anonymize a dataset?",
  "No. Removing direct identifiers like names and emails only <em>de-identifies</em> the data; quasi-identifiers such as age, sex, postcode, job, or dates can still pin people down in combination. A well-known result found that ZIP code, birth date and sex uniquely identify roughly 87% of Americans, and small unique subgroups are especially exposing — a single 62-year-old man in a small clinic sample is effectively named. Genuine anonymization means there is no realistic path back to an individual, which usually requires generalizing or suppressing quasi-identifiers (age → age band), not just crossing out the name column. The mechanics of how re-identification works are covered next door in <a href=\"../../data/data-privacy-basics/\">Data Privacy Basics</a>."),
 ("When am I allowed to break confidentiality I promised participants?",
  "Confidentiality is a strong promise but not an absolute one: if a participant discloses a credible, specific risk of serious harm to themselves or an identifiable other, or triggers a mandatory-reporting duty, the obligation to prevent harm can override it. The ethical way to handle this is to plan for it, not be ambushed by it. State the limit in the consent form up front (for example, 'we will keep what you tell us confidential, except if we learn of a serious risk of harm'), so participants agree knowing the boundary. If it ever happens, you disclose only what is necessary, to the appropriate person, and no more. A limit disclosed in advance is honest; a surprise breach of an absolute-sounding promise is not."),
],

"questionable-research-practices": [
 ("Is stopping data collection early always wrong?",
  "No. What matters is <em>when</em> you decided to stop. A <strong>planned interim analysis</strong>, specified in advance with a corrected significance threshold so the repeated looks are accounted for, is a legitimate and sometimes required design, especially in clinical trials. What inflates false positives is <strong>ad-hoc optional stopping</strong>: peeking at the results as data arrive and stopping the moment <em>p</em> dips below .05, or running 'just a few more' participants when it hasn't. That turns a nominal 5% test into something closer to 20% or more, because every extra look is another chance to cross the line. The rule of thumb: fix your stopping rule <em>before</em> you see the data, and if you must monitor, use a pre-planned procedure with adjusted thresholds rather than gut feel."),
 ("What is the difference between p-hacking and outright fraud?",
  "They sit at different points on a continuum. <strong>Fraud</strong> (fabricating or falsifying data) means reporting numbers that never came from the study; it is rare (under about 1% admit it) and unambiguous misconduct. <strong>p-hacking</strong> and other questionable research practices use <em>real</em> data but exploit researcher degrees of freedom (dropping 'outliers', adding covariates, testing subgroups, optional stopping) until something crosses <em>p</em> &lt; .05, then report only that. QRPs usually feel like reasonable judgment calls rather than cheating, which is exactly why they are so common and so damaging: they fill the literature with effects that evaporate on replication. Fraud is the rarer crime; QRPs are the widespread erosion, and they are the main engine of the <a href=\"../../methods/the-replication-crisis/\">replication crisis</a>."),
 ("How do I avoid questionable research practices in my own study?",
  "Because QRPs exploit choices made <em>after</em> seeing the data, the fix is to lock the choices down before. <a href=\"../../methods/preregistration-and-open-science/\">Preregister</a> your hypotheses, sample size, stopping rule, and primary analysis. Then keep a clean line between <strong>confirmatory</strong> tests (planned in advance) and <strong>exploratory</strong> ones (fine to run, but reported honestly as exploration, not dressed up as predictions). Report <em>all</em> the outcomes and conditions you measured, not just the ones that 'worked', and share your data and materials so others can see the forking paths you didn't take. None of this forbids flexibility — it just makes it transparent, so a reader can tell a predicted result from a lucky one."),
],

"plagiarism-authorship-and-citation": [
 ("Can I reuse text from my own earlier assignment?",
  "Not by silently pasting it in; that is self-plagiarism. Reusing your own previously submitted or published work as though it were new misrepresents it, and most institutions treat re-submitting an assessed essay as an academic-integrity issue. If the earlier work was graded or published you should cite it, and you should rework the material for its new context rather than dropping identical paragraphs into a thesis; swapping a few words to disguise the reuse (patchwriting) does not help. Building on your own earlier writing is normal and fine — the honest way to do it is to disclose it, cite it, and rewrite. If you are unsure of your program's specific rules, ask your supervisor before you reuse anything."),
 ("Does my supervisor automatically get authorship?",
  "No. Authorship is earned by contribution, not by job title. Under the widely used ICMJE criteria an author must make a substantial contribution to the work, help draft or critically revise it, approve the final version, <em>and</em> agree to be accountable for it. A supervisor who shaped the design, guided the analysis, and revised the manuscript clearly qualifies, and in practice many do. But merely heading the lab, providing funding, or giving occasional feedback is not enough on its own; listing someone on that basis is <strong>gift (honorary) authorship</strong>. The opposite error (dropping a student who did qualifying work) is <strong>ghost authorship</strong>. The fix for both is to agree authorship and order openly and early, based on who actually does what."),
 ("How much do I have to change a sentence for it to count as a paraphrase?",
  "There is no word count that makes it safe, and looking for one is the mistake. Swapping in synonyms while keeping the source's sentence shape is patchwriting, and it stays patchwriting whether you changed three words or thirty, because the structure that carried the idea is still theirs. The test that actually works is procedural: read the passage, put it out of sight, and write the point from memory in the shape your own paragraph needs. If you cannot do that, you have not finished understanding it yet, which is useful information. Then cite the source anyway, because paraphrasing removes the need for quotation marks and never the need for attribution. When the original wording is genuinely worth keeping, quote it and move on."),
],

"ai-in-research-ethics": [
 ("Is it unfair to use AI to improve my English if I am not a native speaker?",
  "Using a tool to say your own idea more clearly is not the thing academic integrity rules are aimed at, and it is worth saying so plainly, because this question causes a lot of unnecessary anxiety. The line falls in the same place as it does for a proofreader or a writing center: the ideas, the analysis and the responsibility for every claim stay yours, and what the tool touches is the expression. Polishing grammar in a paragraph you wrote is on the safe side of that line; asking for a paragraph about a topic and adapting it is not, however much you edit afterwards. Two practical cautions. Check that the polished version still says what you meant, since these tools smooth meaning as readily as grammar and are confident either way. And follow whatever your institution asks you to declare, which for language editing is often nothing, but is a question to answer from the policy rather than from hope."),
 ("Why does AI invent references that don't exist?",
  "A large language model generates text by predicting plausible next words rather than by consulting a database of real papers. A reference is just a pattern (author, year, journal, title), so the model can produce one that looks completely convincing yet corresponds to no real paper: right-sounding authors, a real journal, a plausible title, all assembled from nothing. This is often called <strong>hallucination</strong>, and it is a structural feature of how the tool works, not an occasional bug. The practical rule is to treat every AI-suggested reference as unverified: find the actual paper, confirm it exists and says what you're citing it for, and cite that — never paste an AI reference list into your work unchecked."),
 ("Do I have to disclose that I used AI in my research?",
  "It depends on your institution's and your target journal's policy, so the honest answer is: find out and follow it. Norms are still settling and they genuinely differ — some ask you to declare any AI assistance including editing, others only substantive use, and many now require a statement describing how AI tools were used. What <em>is</em> universal is that AI cannot be listed as an author (it can't take responsibility for the work) and that you remain fully accountable for everything in the document. When in doubt, disclose: a short, honest note on how you used AI costs nothing and protects you, whereas hiding substantive use you were required to declare is the integrity problem."),
],

"fraud-and-self-correction": [
 ("I think I have found an error in a published paper. What should I do?",
  "Assume a mistake before you assume misconduct, because the overwhelming majority are mistakes, and proceed in a way you would be comfortable defending if you turn out to be the one who is wrong. Write it down precisely first: which number, on which page, why it cannot be right, and what you did to check. Vague suspicion helps nobody and ages badly. Then contact the corresponding author directly and neutrally, asking whether you have misread something, and give them a real chance to answer, since typos and mislabeled tables are the usual explanation and authors generally want them fixed. If there is no response or the answer does not hold up, the journal editor is next, and PubPeer exists for public post-publication comment. Keep it about the arithmetic rather than the person throughout, and if you are a student, talk to a supervisor you trust before you send anything, both for advice and because raising concerns upward is where the personal cost usually lands."),
 ("What happens when a paper is retracted?",
  "A retraction is the formal withdrawal of a published paper from the scientific record because it can no longer be trusted — whether through fraud, a serious honest error, or unreliable data. The article usually stays online so the record is transparent, but it's stamped 'RETRACTED', linked to a notice explaining why, and should no longer be cited as valid evidence. Retraction is <em>not</em> the same as an accusation of fraud: many retractions are for honest mistakes, and the notice ideally says which. Databases like Retraction Watch track them, and the number has grown as detection tools and post-publication review have improved, which reflects a system catching more problems, not necessarily more misconduct happening. If you find a key source has been retracted, don't build on it."),
 ("How common is research fraud?",
  "Outright fabrication or falsification is rare. In anonymous surveys pooled by Fanelli (2009), about <strong>2%</strong> of scientists admitted to having fabricated, falsified, or modified data at least once, and higher fractions said they had seen colleagues do it. The far more common problem is the gray zone of <a href=\"../../ethics/questionable-research-practices/\">questionable research practices</a> (selective reporting, optional stopping, HARKing), which many more researchers admit to and which do more cumulative damage to the literature than the rare fraud case. The reassuring framing is that fraud is uncommon, that most researchers are honest, and that the fixes are structural: better incentives, transparency, open data, and detection tools mean fabricated results are increasingly likely to be caught."),
],

}

FAQS_ML = {

# ---------------- ML & AI ----------------

"prediction-vs-explanation": [
 ("Is machine learning just statistics with a fancier name?",
  "Same mathematics, genuinely different emphasis. Much of ML is built directly on statistical models (<a href=\"../../stats-2/simple-linear-regression/\">regression</a>, logistic regression, and their relatives), but the two fields optimize different things. Classical statistics is usually doing <em>inference</em>: which variables matter, how large the effect is, and how certain we are (coefficients, confidence intervals, p-values). ML is usually doing <em>prediction</em>: how accurately it can guess the outcome for cases it has never seen, measured by held-out error. The cultures overlap and borrow constantly, but 'just rebranded' undersells the shift — ML happily uses uninterpretable models if they predict well and rarely reports p-values, while inferential statistics keeps models interpretable and rarely reports test-set error."),
 ("What is the difference between prediction and explanation?",
  "Explanation (inference) is about the relationship itself: estimating the size, direction, and uncertainty of an effect so you can understand a system: does X influence Y, and by how much? Prediction is about the outcome: given a new case's features, produce the best guess of its Y, judged only by error on unseen data. You can have either without the other. A model can predict superbly while every internal coefficient is meaningless (a black box), or explain a mechanism cleanly while predicting barely better than chance on a genuinely noisy outcome. Decide which one you actually need before you choose a model."),
 ("Can the same model be good for both prediction and explanation?",
  "Sometimes: a simple, well-specified linear model often does a respectable job of both, but don't assume it. The two goals pull in different directions: explanation rewards <em>parsimony</em> (every extra term is another thing to interpret and defend), while prediction rewards whatever lowers <a href=\"../../stats-4/cross-validation-and-overfitting/\">held-out error</a> (often more flexibility). When they conflict, pick the model that matches your real goal and say which goal it is. The classic mistake is to build a black-box predictor and then read its internals as if they were causal effects — a model optimized for prediction owes you no honest explanation."),
],

"train-test-split-and-generalization": [
 ("What is data leakage?",
  "Data leakage is any way that information from your test set (or from the future) sneaks into training, so the model is secretly graded on things it already saw. The symptom is a beautiful reported score and disappointing real-world performance. The three classic culprits are: scaling or selecting 'the most predictive' features using the <em>whole</em> dataset before splitting; the same subject's rows appearing in both the training and test sets; and trying many models or settings and reporting the one that scored best on the test set. The cure is a single rule: every step that learns anything from the data must happen inside the training split, never before it."),
 ("Do I still need a separate test set if I use cross-validation?",
  "Ideally yes, whenever you make choices. Cross-validation on the training data is the right tool for comparing models and tuning settings — but the moment you use a CV score to <em>choose</em> something, that score becomes slightly optimistic, because you have optimized against it. A final test set, opened once after every decision is locked, gives an unbiased estimate of the model you actually settled on. On small datasets people sometimes use nested cross-validation instead of a held-out set, but the principle is unchanged: the number you report should come from data that influenced none of your decisions."),
 ("Why can't I just train and test on all of my data?",
  "Because a flexible model can memorize its training data and post a near-perfect score that says nothing about new cases — that is <a href=\"../../stats-4/cross-validation-and-overfitting/\">overfitting</a>, and grading a model on data it was trained on hides it completely. The training score measures memory; only performance on data the model never touched during fitting measures learning. That is exactly why you hold back a test set (or use cross-validation): to get a number that reflects how the model will do in the wild, not how well it recited its own study notes."),
],

"regularization-ridge-and-lasso": [
 ("Ridge or lasso — which should I use?",
  "It depends on what you want from the model. Use <strong>lasso</strong> when you expect many predictors to be irrelevant and you want a sparse, interpretable model — it drives weak coefficients to exactly zero, doing variable selection for you. Use <strong>ridge</strong> when you think most predictors matter a little, or when predictors are highly <a href=\"../../stats-3/multicollinearity-and-variable-selection/\">correlated</a>: ridge keeps them all and shares the coefficient across a correlated group, whereas lasso tends to keep one of the group somewhat arbitrarily and zero the rest. If you can't decide, <strong>elastic net</strong> blends both penalties and is the common pragmatic default. Whichever you choose, let cross-validation pick the penalty strength."),
 ("What is lambda, and how do I choose it?",
  "Lambda (λ) is the penalty strength, the dial controlling how hard the coefficients are shrunk. At λ = 0 you have ordinary least squares with no shrinkage; as λ grows, coefficients shrink toward zero and the model becomes simpler, more biased, and less variable. You don't set λ by hand: fit the model across a grid of λ values and choose the one with the lowest <a href=\"../../stats-4/cross-validation-and-overfitting/\">cross-validated</a> error (<code>cv.glmnet</code> in R, <code>LassoCV</code>/<code>RidgeCV</code> in Python). A common, slightly conservative choice is the largest λ within one standard error of the minimum ('lambda.1se'), which buys a simpler model for almost the same error."),
 ("Do I need to standardize my predictors before ridge or lasso?",
  "Almost always, yes. The penalty acts on the <em>size</em> of the coefficients, and a coefficient's size depends on its predictor's units — the same variable measured in grams gets a coefficient a thousand times larger than in kilograms, and would then be penalized a thousand times more heavily. Standardizing every predictor to mean 0 and standard deviation 1 first puts them on equal footing so the penalty is fair. Many packages (such as glmnet) standardize internally by default and report the coefficients back on the original scale, but if yours doesn't, do it yourself. The outcome variable usually doesn't need standardizing — only the predictors."),
],

"classification-metrics": [
 ("Why is accuracy misleading for rare outcomes?",
  "Because a lazy model can score high just by ignoring the rare class. If 1 in 100 patients has a disease, a model that labels everyone 'healthy' is 99% accurate while catching zero cases — useless, yet it beats most honest models on accuracy alone. Accuracy weights every case equally, so when 99% of cases are one class, that class dominates the score and the rare class barely registers. For imbalanced problems, report recall (did we catch the positives?) and precision (were our positive calls right?) instead of, or alongside, accuracy."),
 ("What is the difference between precision and recall?",
  "They answer different questions about your positive predictions. <strong>Recall</strong> (also called sensitivity or the true-positive rate) asks: of all the cases that really are positive, what fraction did the model catch? It is TP / (TP + FN). <strong>Precision</strong> asks: of all the cases the model flagged as positive, what fraction really were? It is TP / (TP + FP). A cancer screen wants high recall (missing a case is disastrous), while a spam filter wants high precision (deleting a real email is worse than seeing one spam). You usually trade one for the other by moving the decision threshold."),
 ("When should I use F1 instead of accuracy?",
  "Use F1 when the positive class is rare and both kinds of error matter. F1 is the harmonic mean of precision and recall, so it is high only when <em>both</em> are high — it cannot be rescued by ignoring the rare class the way accuracy can. It also ignores the true negatives entirely, which is exactly what you want when true negatives are abundant and uninformative. If the two error types have clearly different costs, go further and pick the metric that matches the costlier error (recall for screening, precision for spam), or set the threshold to balance them deliberately rather than trusting any single summary number."),
],

"roc-curves-and-auc": [
 ("What is a good AUC value?",
  "As a rough field guide: 0.5 is a coin flip (useless), around 0.7 is modest, 0.8 is good, and 0.9+ is excellent — but 'good' is entirely context-dependent. AUC is the probability that the model ranks a random positive case above a random negative one, so 0.5 means the model can't tell the classes apart at all. For an easy, well-separated problem 0.85 might be disappointing; for predicting something genuinely noisy like human behavior, 0.70 can be a real achievement. And a high AUC on a rare-outcome problem can still hide poor precision, so never read AUC in isolation — pair it with the <a href=\"../../ml/classification-metrics/\">confusion-matrix metrics</a> at the threshold you actually plan to use."),
 ("What is the difference between AUC and accuracy?",
  "Accuracy is measured at one chosen threshold and depends on it; AUC is threshold-free, summarizing performance across every possible threshold at once. Accuracy also depends heavily on the base rate (it can be inflated by a common class), whereas AUC does not, because it only asks whether positives tend to score higher than negatives (their ranking), not how many of each there are. So AUC answers 'how well does this model separate the classes in principle?', while accuracy answers 'how many did I get right at this specific cutoff?'. A model can have a strong AUC yet poor accuracy at your operating threshold, or vice versa."),
 ("When should I use a precision-recall curve instead of ROC?",
  "Use a precision-recall (PR) curve when the positive class is rare and it's the class you care about. ROC's x-axis is the false-positive rate, which stays reassuringly small when negatives are plentiful, so a ROC curve can look excellent even while most of your positive flags are actually false alarms. Precision, by contrast, is computed only from the cases you flagged as positive, so it reacts sharply to false positives and exposes the problem. For fraud, disease screening, or any heavily imbalanced task, report the PR curve (and its area, average precision) alongside or instead of ROC/AUC; for roughly balanced problems, ROC is fine."),
],

"decision-trees": [
 ("Why do decision trees overfit so easily?",
  "Because an unrestricted tree keeps splitting until every training point sits in its own tiny, pure region — at which point it has effectively memorized the data, including the noise. Each extra level of depth lets the tree carve out more, smaller rectangles, so it can always drive training accuracy toward 100%. But those last splits are fitting flukes specific to this sample, not real structure, so performance on new data peaks at a moderate depth and then declines. The cures are to limit growth (maximum depth, a minimum number of samples per leaf) or to grow a large tree and prune it back using <a href=\"../../stats-4/cross-validation-and-overfitting/\">cross-validation</a>."),
 ("How deep should a decision tree be?",
  "Deep enough to capture the real pattern, no deeper — and you find that point with data, not by guessing. Use cross-validation to try a range of depths (or minimum-leaf sizes) and pick the setting where <em>held-out</em> accuracy peaks, not where training accuracy is highest. Training accuracy keeps rising with depth right up to memorization, so it can never tell you when to stop; only performance on data the tree didn't see can. In practice a single tree is often kept deliberately shallow for interpretability, or grown deep and then pruned. If you need both accuracy and stability, an ensemble of trees usually beats tuning one tree's depth."),
 ("Why did my tree change completely when I added a little data?",
  "That instability is inherent to single trees, not a bug. Because the tree is built greedily, the very first split is chosen to look best right now, and everything below it is conditional on that choice. If a small change in the data makes a different feature win that top split by a hair, the entire structure beneath it can be rebuilt into something that looks unrelated — even though its predictions may be similar. This high variance is exactly why ensembles like random forests exist: by averaging many trees grown on resampled data, they cancel out each individual tree's jumpiness and predict far more stably."),
],

"random-forests-and-ensembles": [
 ("Why doesn't a random forest overfit as you add more trees?",
  "Because adding trees reduces variance without adding the kind of flexibility that fits noise. Each tree is a full, high-variance model that overfits its own bootstrap sample in its own way; averaging their votes cancels those individual quirks, so the ensemble's prediction settles down. Crucially, more trees only make that average more stable — they do not let the forest carve ever-finer boundaries around single points, so test accuracy rises and then plateaus rather than peaking and falling. The number of trees is a budget knob (more is steadier but slower), not an overfitting dial. The real overfitting controls are each tree's depth or minimum leaf size."),
 ("What is out-of-bag (OOB) error?",
  "Out-of-bag error is a validation estimate you get for free from the bootstrap. Each tree is trained on a <a href=\"../../stats-4/bootstrap-and-resampling/\">bootstrap sample</a> that, by chance, leaves out about 37% of the rows; those held-out rows are that tree's out-of-bag cases. To score the forest, predict every row using only the trees that did <em>not</em> see it, then compare to the truth. Because each prediction uses trees for which that row was genuinely unseen, OOB error approximates cross-validated test error without a separate holdout set or an explicit split. It is a convenient default, though a proper held-out set (or nested cross-validation when you also tune settings) is still the gold standard for a final, reported number."),
 ("Can I trust a random forest's variable importance?",
  "Treat it as a useful hint, not proof of causation or a clean ranking. Standard impurity-based (Gini) importance is biased toward high-cardinality and continuous predictors, and when two predictors are correlated the forest splits its credit between them, so an important variable can look weak simply because a collaborator absorbed some of its share. Permutation importance — shuffle one column and see how much accuracy drops — is generally more trustworthy, but it too can mislead under strong correlation. Importance tells you what <em>helped the model predict</em>, which is not the same as what <em>causes</em> the outcome; for causal questions you still need design, not a forest."),
],

"knn-and-distance": [
 ("How do I choose k in k-NN?",
  "Tune it with <a href=\"../../stats-4/cross-validation-and-overfitting/\">cross-validation</a> rather than a rule of thumb, because k is the bias–variance dial. A small k (k = 1 at the extreme) follows every point, giving a jagged boundary that memorizes noise — low bias, high variance. A large k averages over many neighbors, giving a smooth, stable boundary that can wash out real structure (high bias, low variance). Try a range of k on held-out data and pick where accuracy peaks; a common practical range is a few up to roughly the square root of the sample size. Use odd k for two-class problems to avoid tied votes, and remember the best k depends on how noisy your data are, not on any fixed formula."),
 ("Does k-NN need normally distributed data?",
  "No. k-NN is nonparametric: it makes no assumption about the shape of the distribution, no normality, no linearity. What it absolutely does need is sensible feature scaling, because it ranks neighbors by distance and distance is scale-sensitive. If one variable is measured in thousands (say annual income) and another from 1 to 5 (a Likert item), the large-scale variable dominates the distance and the small-scale one is effectively ignored, no matter how predictive it is. Standardize or normalize every feature to a comparable range first. Beyond scaling, k-NN also struggles as the number of features grows, because of the curse of dimensionality."),
 ("What is the curse of dimensionality?",
  "It is the collection of ways that intuition built in two or three dimensions fails as the number of features grows. For distance-based methods like k-NN the key problem is that volume explodes with dimension, so data becomes desperately sparse and points drift toward being equally far apart — the nearest neighbor is barely nearer than the farthest, so 'nearest' stops being meaningful. A concrete illustration: the ball that fits inside a unit cube fills about 79% of it in 2-D and 52% in 3-D, but only about 0.25% in 10-D and effectively none in 100-D, because almost all the volume hides in the corners. The practical fixes are dimensionality reduction, feature selection, or distance metrics designed for the specific structure of your data."),
],

"clustering-kmeans": [
 ("How do I choose k in k-means?",
  "There is no single correct k — it is a modeling choice you make with several tools plus judgment. The elbow method plots the within-cluster sum of squares against k and looks for the 'elbow' where adding another cluster stops buying much reduction; the catch is that the bend is often ambiguous. The silhouette score measures how much better each point fits its own cluster than the next-nearest one, and you can pick the k that maximizes the average silhouette. Gap statistics compare your clustering to random noise. But the most important input is domain knowledge: if theory says there should be three customer segments, that is strong evidence for k = 3. Try a range, look at the diagnostics and the actual clusters, and treat the answer as a hypothesis to validate, not a fact to report."),
 ("Why does k-means fail on non-spherical clusters?",
  "Because k-means assigns each point to the nearest centroid by straight-line distance, the boundary between any two clusters is a straight line, and each cluster ends up as a convex, roughly spherical blob of similar size. When the true groups are elongated, curved, or interlocking (like two crescent moons or concentric rings), no set of centroids can carve them out, so k-means confidently returns clusters that cut across the real structure. It is not broken; it is answering the question it was built to answer (minimize within-cluster squared distance), which simply is not the question you meant. For shapes like these, density-based methods such as DBSCAN or spectral clustering are the right tools."),
 ("Are the clusters that k-means finds real?",
  "Not necessarily — k-means will always return exactly the k clusters you ask for, even in data that has no real groups at all, so finding clusters is not evidence that clusters exist. Treat every clustering as a hypothesis and stress-test it. Check stability (do you get similar clusters on resampled data, or with different random initializations and different k?), quantitative quality (silhouette, gap statistic), and above all interpretability (do the clusters correspond to something meaningful in the world, and do they replicate in a fresh sample?). Because the algorithm is also sensitive to its starting centroids, use a smart initializer like k-means++ and several restarts. Real structure survives all of this; artifacts of the algorithm do not."),
],

"dimensionality-reduction": [
 ("Is PCA the same as factor analysis?",
  "They are close cousins and often give similar-looking results, but they answer different questions. <a href=\"../../stats-3/factor-analysis-pca/\">PCA</a> is a purely mathematical rotation: it repackages your variables into uncorrelated components ordered by how much total variance each captures, with no model of <em>why</em> the variables move together — it is best thought of as data compression. Exploratory factor analysis, by contrast, assumes there are unobserved latent factors that <em>cause</em> the observed correlations, and it tries to estimate those factors while setting aside each variable's unique noise. Rule of thumb: reach for PCA when you want to reduce dimensions or de-correlate predictors, and for factor analysis when you are hypothesizing underlying constructs (like 'verbal ability') behind a battery of measures."),
 ("Can I run statistics on t-SNE or UMAP coordinates?",
  "No. A t-SNE or UMAP embedding is built to preserve <em>local</em> neighborhoods for the purpose of visualization, and in doing so it deliberately distorts global geometry: distances between clusters, the sizes of clusters, and even the number of apparent clumps all change with the perplexity or <code>n_neighbors</code> setting and with the random seed. So the axes have no units, the gaps mean nothing, and running a t-test, a correlation, or a clustering on the 2-D coordinates produces numbers that describe the algorithm, not your data. Use the embedding only to spot structure worth investigating, then go back to the original feature space (or a <a href=\"../../stats-3/factor-analysis-pca/\">PCA</a>) to measure anything."),
 ("Do I need to scale my variables before PCA?",
  "Almost always, yes, and forgetting is the commonest way to get a meaningless first component. PCA hunts for directions of maximum <em>variance</em>, and variance carries units: measure income in dollars rather than thousands and its variance grows by a factor of a million, so PC1 becomes essentially the income axis no matter what the other variables are doing. Standardizing every variable first (mean 0, SD 1) puts them on equal footing, which is the same operation as running PCA on the correlation matrix rather than the covariance matrix. The exception is when your variables are already in the same meaningful unit and you <em>want</em> the high-variance ones to dominate: repeated measurements of one quantity, or pixel intensities in an image. If you cannot articulate why the raw units should decide the answer, scale. For how many components to then keep, see <a href=\"../../stats-3/factor-analysis-pca/\">Factor Analysis / PCA</a>."),
],

"neural-networks-intuition": [
 ("Is a neural network really just stacked logistic regressions?",
  "For the basic building block, essentially yes: a single neuron computes a weighted sum of its inputs plus a bias and passes it through an activation function, and with a sigmoid activation that is exactly <a href=\"../../stats-3/logistic-regression/\">logistic regression</a>. What is genuinely new is <em>composition</em>. Stacking neurons into a hidden layer lets the network combine several straight boundaries into curved ones, and adding depth lets later layers reuse the features earlier ones discovered — which is why a network can learn patterns (like XOR, or the shapes in an image) that no single logistic regression can. So the atom is familiar; the power comes from wiring many of them together and fitting them jointly by gradient descent."),
 ("What is a learning rate?",
  "The learning rate is the step size in gradient descent: how far the weights move in the downhill direction on each update. It is the single most important dial in training. Set it too small and learning crawls, taking thousands of tiny steps to reach a good solution; set it too large and each step overshoots the valley floor, so the loss oscillates or even diverges instead of settling (you can watch this happen by pushing the slider high in the widget above). In practice people try a few values on a log scale (say 0.001, 0.01, 0.1) and often decay the rate over time — large steps early to move fast, smaller steps later to fine-tune."),
 ("Do I need to learn deep learning for my thesis?",
  "Usually not. For the tabular data most research produces (rows of participants with a few dozen variables), a neural network rarely beats well-chosen classical methods, and it costs you interpretability, tuning effort, and far more data to train honestly. <a href=\"../../stats-3/multiple-regression/\">Regression</a>, regularized models, and <a href=\"../../ml/random-forests-and-ensembles/\">random forests</a> are typically as accurate and much easier to explain to a committee. Deep learning earns its keep when the inputs are images, audio, or raw text and you have tens of thousands of examples. Learn the intuition (it demystifies a lot of modern AI), but don't reach for a neural network just because it sounds impressive."),
],

"llms-and-ai-in-research": [
 ("Why do LLMs make up references?",
  "Because a large language model generates text by predicting plausible next words, not by looking anything up. It has learned the <em>shape</em> of an academic citation (a list of surnames, a title, a journal, a year, a DOI) from millions of examples, but it does not store the papers themselves, so when you ask for references it fluently assembles ones that <em>look</em> exactly right and frequently do not exist. This is called hallucination, and it is a structural feature of how the model works, not an occasional glitch. Worse, fabricated citations are often the most authoritative-looking, so you cannot spot them by reading. The only safe rule is to click through and confirm every reference at its source; if you can't find it, don't cite it."),
 ("Can I use ChatGPT or Claude to run my statistics?",
  "To help you <em>write code that you then run and verify</em>: yes, that is one of the best uses of an AI assistant. To have it <em>report</em> statistical results directly: no. If a chatbot tells you 'the effect was significant, <em>t</em>(48) = 2.31, <em>p</em> = .025,' those numbers may be invented to look plausible, and you have no reproducible trail behind them. Ask instead for R or Python code, run it yourself on your real data, and check the output. You remain responsible for every number in your write-up, so anything you can't reproduce and defend doesn't belong there. Never paste raw participant data into an external tool either — see <a href=\"../../ethics/ai-in-research-ethics/\">Using AI Tools Ethically</a>."),
 ("Do I have to disclose that I used AI?",
  "Increasingly, yes — but the specifics vary, so check the policy that governs you. Many journals and universities now require you to state where and how you used generative AI (for example, in the methods or an acknowledgements note), and essentially all of them agree that an AI cannot be listed as an author, because authorship requires accountability that a model cannot take. A safe default is honest, specific disclosure: say what you used the tool for (e.g. drafting code, copy-editing prose) and confirm that you verified the output and take responsibility for it. When a policy is unclear, disclose more rather than less."),
],

}

FAQS_WRITING = {

# ---------------- WRITING ----------------

"imrad-structure": [
 ("What does IMRaD stand for?",
  "IMRaD is the standard structure of an empirical paper: <strong>I</strong>ntroduction, <strong>M</strong>ethods, <strong>R</strong>esults, and <strong>D</strong>iscussion. Each has exactly one job: the Introduction says <em>why</em> the study (context → gap → hypothesis), the Methods say <em>what you did</em> (in enough detail to replicate), the Results say <em>what you found</em> (the numbers, with no interpretation), and the Discussion says <em>what it means</em> (interpretation, limitations, and what's next). If a paragraph doesn't do the job of the section it's sitting in, it's in the wrong place. The lowercase 'a' is just 'and'."),
 ("Should I write a paper in the order it's read?",
  "Reading order isn't writing order, and trying to make them match is why blank-page paralysis hits at the Introduction. Draft the <strong>Methods and Results first</strong>, because they're the most factual and concrete: you already know what you did and what you found. Then write the Introduction (now you know precisely what you're setting up) and the Discussion (now you know what you're interpreting). The <a href=\"../../stats-1/hypothesis-testing-logic/\">hypothesis</a> in your Intro should match the analyses in your Results, which is far easier to guarantee if the Results already exist. Write the abstract dead last, once everything it summarizes is finished."),
 ("Where do I put the interpretation of my results?",
  "In the <strong>Discussion</strong>, never in the Results. The Results section reports the finding plainly (\"the nap group recalled more word pairs, <em>t</em>(58) = 3.72, <em>p</em> &lt; .001\") and stops there. Saying what that finding <em>means</em> (\"this supports the idea that sleep aids consolidation\"), how it fits prior work, or why it might have happened is interpretation, and interpretation lives in the Discussion. The mirror-image mistake is just as common: don't introduce a finding for the first time in the Discussion. Everything you interpret there must already have appeared, with its statistics, in the Results."),
],

"reporting-statistics-apa": [
 ("Do I italicize p and t in APA style?",
  "Yes. The rule is simple once you see it: statistical symbols written with <em>Latin</em> letters are italicized, and those written with <em>Greek</em> letters are not. So <em>t</em>, <em>F</em>, <em>r</em>, <em>p</em>, <em>M</em>, <em>SD</em>, <em>d</em>, <em>N</em>, and <em>R</em>² are all italic, while α, β, χ², and η² stay upright, even when they sit right next to an italic Latin symbol (it's <em>R</em>² but η²). The operators and labels around them (the '=' sign, parentheses, 'df', units) are never italicized. Getting this one rule right fixes the most frequently flagged APA error there is."),
 ("Why is there no zero before the decimal in p = .03?",
  "Because APA drops the leading zero for any number that <em>cannot</em> exceed 1 in absolute value, and a probability can't. The same applies to correlations and standardized coefficients: <em>p</em> = .03, <em>r</em> = .34, β = .29. Numbers that <em>can</em> be larger than 1 keep their leading zero: <em>t</em> = 3.72, <em>M</em> = 28.4, and even Cohen's <em>d</em> = 0.96 (because <em>d</em> routinely exceeds 1). So the leading zero has nothing to do with the statistic's name; it depends only on whether the quantity is bounded by 1."),
 ("How do I report a p-value of exactly zero?",
  "You don't: a <em>p</em>-value is never exactly zero, so <em>p</em> = .000 is always wrong even though SPSS and other software print it. That output just means the value is too small to show at three decimals. Report it as <strong><em>p</em> &lt; .001</strong>, which is the smallest precision APA asks you to claim. More generally, give exact <em>p</em>-values when you can (<em>p</em> = .023 is more informative than '<em>p</em> &lt; .05'), round them to two or three decimals, and floor anything below .001 at <em>p</em> &lt; .001."),
],

"tables-and-figures": [
 ("Should error bars show SD, SE, or a confidence interval?",
  "It depends on what you want the reader to see, but whichever you pick, you <strong>must state it in the caption</strong>, because the three look identical and mean very different things. <strong>SD</strong> shows how spread out the individual data points are and doesn't shrink with sample size. <strong>SE</strong> (SD ÷ √<em>n</em>) shows how precisely you've pinned down the <em>mean</em>, and gets smaller with more data. A <strong>95% <a href=\"../../stats-1/confidence-intervals/\">confidence interval</a></strong> (≈ ±1.96 SE) gives a plausible range for the true mean and is usually the most reader-friendly choice. One caution: overlapping error bars do not automatically mean 'no significant difference' — let the actual test decide, not the eye."),
 ("When should I use a table instead of a figure?",
  "Match the tool to the message. Use a <strong>table</strong> when the reader needs the <em>exact</em> values, or many of them at once: several groups crossed with several measures, or a set of model coefficients. Use a <strong>figure</strong> when the <em>shape</em> of the data is the point: a trend over time, a distribution, an interaction. And use plain <strong>text</strong> for just two or three numbers, where a sentence beats a two-row table. Whatever you choose, reference every display in the text ('as Table 1 shows…') and make it stand on its own through a clear title and notes; a table or figure nobody points to is one nobody reads."),
 ("Why shouldn't a bar chart's y-axis start above zero?",
  "Because a bar's entire promise is that its <em>length is proportional to its value</em>, and that only holds when the axis starts at 0. Start it at, say, 45 instead, and a difference of a few points balloons into a cliff — the picture screams 'huge effect' while every plotted number stays technically 'correct'. This truncated-axis trick is the single most common way an honest result gets oversold, and reviewers look for it. (Line charts, which encode value by <em>position</em> rather than length, can sometimes justify a non-zero baseline, but bars almost never can.) If the real effect is small, let the chart show it as small."),
],

"writing-results": [
 ("How do I turn my statistical output into a results sentence?",
  "Follow a fixed four-part formula, and one analysis becomes one sentence. State (1) <strong>what you tested</strong>, in the variables' own words and with the direction (\"the nap group recalled more word pairs\"); (2) the <strong>descriptives</strong> that anchor it, group means with SDs in parentheses, <em>M</em> = 28.4, <em>SD</em> = 5.1; (3) the <strong>test statistic</strong> with its degrees of freedom and exact <em>p</em>, <em>t</em>(58) = 3.17, <em>p</em> = .002; and (4) the <strong>effect size</strong>, <em>d</em> = 0.82. Put together: \"The nap group recalled more word pairs (<em>M</em> = 28.4, <em>SD</em> = 5.1) than the no-nap group (<em>M</em> = 24.1, <em>SD</em> = 5.4), <em>t</em>(58) = 3.17, <em>p</em> = .002, <em>d</em> = 0.82.\" Once the formula is in your fingers, the Results section becomes the easiest one to write. See <a href=\"../reporting-statistics-apa/\">Reporting Statistics in APA Style</a> for the typography."),
 ("Should I report exact p-values or just p &lt; .05?",
  "Report <strong>exact</strong> <em>p</em>-values wherever you can: <em>p</em> = .023 tells the reader far more than '<em>p</em> &lt; .05', and modern APA style asks for it. Round to two or three decimals, and use the &lt; sign only at the floor: anything below .001 is written <em>p</em> &lt; .001, never <em>p</em> = .000 (a <em>p</em>-value is never exactly zero; that output just means 'too small to display'). The one time a threshold form is acceptable is a table footnote convention (e.g. * <em>p</em> &lt; .05), but in the running text, give the number."),
 ("Do I interpret my results in the Results section?",
  "No. Interpreting them here is the single most common Results-section error. The Results section reports <em>what happened</em>, in the past tense, with the numbers; the <a href=\"../discussion-and-limitations/\">Discussion</a> says <em>what it means</em>. \"Recall was higher in the nap group, <em>t</em>(58) = 3.17, <em>p</em> = .002\" is a result; \"…which shows that sleep consolidates memory\" is interpretation and belongs one section later. Keep the two apart. You can briefly note assumption checks (\"Levene's test indicated equal variances, <em>p</em> = .41\"), but save theory, mechanism, and implications for the Discussion."),
],

"nonsignificant-results": [
 ("How do I report a non-significant result in APA style?",
  "Report it exactly like a significant one, and never hide or soften it. Give the test statistic, degrees of freedom, and the <strong>exact <em>p</em>-value</strong>, then the <strong>effect size and its confidence interval</strong>: \"The groups did not differ significantly, <em>t</em>(58) = 1.30, <em>p</em> = .20, <em>d</em> = 0.24, 95% CI [−0.13, 0.61].\" The confidence interval is the important part — it shows the range of effects your data are compatible with. Frame it honestly (\"not significant\") and, if the interval is wide, note that the study was underpowered rather than claiming there is no effect."),
 ("Can I say a result was 'marginally significant' or 'a trend toward significance'?",
  "No. Significance is a yes/no threshold you set in advance, so a <em>p</em> of .06 is on the 'no' side. It is not 'nearly significant', and there is no such thing as 'marginally significant'. Tellingly, the phrase is only ever used to nudge a non-significant result upward; nobody writes that <em>p</em> = .04 'only marginally' made it. Report the exact <em>p</em>-value, the effect size, and the confidence interval, and interpret them honestly. If the point estimate looks promising but the interval includes zero, say the result is inconclusive and needs a larger, ideally <a href=\"../../methods/preregistration-and-open-science/\">preregistered</a>, study."),
 ("Does a non-significant result mean there is no effect?",
  "Not by itself: <strong>absence of evidence is not evidence of absence</strong> (see <a href=\"../../stats-1/hypothesis-testing-logic/\">The Logic of Hypothesis Testing</a>). A high <em>p</em>-value can mean the effect really is near zero, or that your study was too small to detect a real one. The confidence interval settles which: if it is <em>wide</em> and straddles zero, you simply can't tell (underpowered); if it is <em>tight</em> and hugs zero (say <em>d</em> = 0.05, 95% CI [−0.15, 0.25]), you have ruled out anything beyond a small effect and may call the difference negligible. That is the logic of equivalence testing: same <em>p</em> &gt; .05, opposite conclusions, and only the interval reveals which one you have."),
],

"discussion-and-limitations": [
 ("How many limitations should I list?",
  "A few that <em>matter</em> — quality over quantity. A short list of specific, consequential weaknesses beats a long parade of generic caveats. The test for each: does it name a real weakness, its direction, and how it could change a conclusion? \"With 38 participants the study was underpowered to detect small effects, so the non-significant interaction should not be read as evidence of no interaction\" earns its place; \"the sample was small\" on its own does not. Two to four well-argued limitations, each pointing at the specific claim it undercuts, is usually plenty for a thesis or paper."),
 ("Can I use the word 'prove' in my discussion?",
  "Almost never. A single study provides evidence that shifts our confidence; it never <em>proves</em> anything. 'Prove', 'proves', and 'proven' overclaim by design, and reviewers flag them instantly. Reach instead for calibrated verbs: the data 'suggest', 'support', 'are consistent with', or 'provide evidence that'. The same discipline applies to causal language: from correlational data you may write 'was associated with' or 'predicted', but not 'causes' or 'leads to' unless your design supports causal inference (see <a href=\"../../stats-4/causal-dags-and-confounding/\">Causal DAGs &amp; Confounding</a>)."),
 ("How do I write limitations that aren't just 'small sample size'?",
  "Say what the limitation could have <strong>changed</strong>. Every weak limitation names a flaw and stops; every strong one names the flaw, its likely direction, and its consequence for a specific result. Instead of \"the sample was small,\" write what that cost you: \"the study was underpowered, so we can't rule out a real small effect.\" Instead of \"the design was correlational,\" write \"because the design was correlational, an unmeasured factor such as workload could drive both variables, so the association should not be read causally.\" A limitation that tells the reader exactly which sentence in your Discussion to trust less is doing its job."),
],

"abstracts-and-titles": [
 ("How long should a thesis abstract be?",
  "Most abstracts run <strong>150–250 words</strong>; check your program's or journal's limit, which is often a hard 200 or 250. But length is a constraint, not the goal: completeness is. A tight 180-word abstract that lands all five moves (context, aim, method, a result <em>with numbers</em>, and a calibrated conclusion) beats a padded 250-word one that never quite says what was found. If you're over the limit, cut the sentences that carry no move: background throat-clearing and \"further research is needed\" go first, never the numbers."),
 ("Should I write the abstract first or last?",
  "<strong>Last</strong>, always — after the whole paper is finished. The abstract is a distillation of results you already have, not a plan for results you hope to get. Only once the analysis is final do you know your actual numbers, which framing survived, and how far your conclusion honestly reaches; drafting the abstract first tends to bake in claims the data never supported. Write the paper, then compress it, then check every figure in the abstract against your <a href=\"../writing-results/\">Results</a> so the two agree exactly."),
 ("What makes a good research title?",
  "<strong>Findability.</strong> In a database or a search engine your reader meets the title before anything else, so it should contain the words they would actually type — your variables, your population, your design. Two dependable shapes work: state the finding (\"More Sleep Predicts Higher Student Wellbeing\") or state the question (\"Does Napping Improve Memory?\"). Avoid vague, clever-but-empty titles like \"An Investigation into Certain Factors\". They are invisible to search and tell the reader nothing. Put the same keywords in the keyword field, too."),
],

"final-checklist": [
 ("Why do my degrees of freedom matter to the grader?",
  "Because degrees of freedom encode your sample size and design, so a grader can read them straight back to your <em>n</em>. For an independent <em>t</em>-test <em>df</em> = <em>N</em> − 2; for a one-way ANOVA the denominator is <em>N</em> − <em>k</em>; for a correlation <em>df</em> = <em>N</em> − 2. If you report two groups of 60 but write <em>t</em>(116), the arithmetic doesn't close, because 60 + 60 − 2 = 118, not 116, and that mismatch signals either a typo or a misunderstanding of the test. Checking every reported <em>df</em> against your <em>n</em> is one of the fastest ways to catch an error before you submit."),
 ("What do graders check first?",
  "<strong>Internal consistency</strong>, whether your paper agrees with itself, because it is quick and revealing. Nobody re-runs your analysis; instead a grader glances across sections to see whether the numbers match (does the abstract's <em>n</em> equal the method's?), whether the degrees of freedom fit the design, and whether every table, figure, and citation is accounted for. A single contradiction plants doubt about everything else, so it costs marks out of proportion to the effort of fixing it. Do that same adversarial read yourself, last of all."),
 ("How do I make sure the numbers in my abstract match the rest of the paper?",
  "Treat one place as the source of truth (usually your results output) and copy from it, never from memory. Every statistic appears in several places (abstract, results sentence, tables, discussion), and all of them must be <em>identical</em>: an abstract that says <em>r</em> = .28 while the results say <em>r</em> = .31 tells the reader a number was mistyped and casts doubt on the others. On your final pass, list each reported value (sample sizes, means, effect sizes, percentages) and confirm it reads the same everywhere it appears."),
],

}

FAQS = {**FAQS_12, **FAQS_34, **FAQS_METHODS, **FAQS_DATA, **FAQS_ETHICS, **FAQS_ML, **FAQS_WRITING}
