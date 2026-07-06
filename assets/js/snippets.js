/* ============================================================
   "Try it yourself" code snippets, keyed by lesson slug.
   Loaded lazily by site.js on lesson pages only; injected as a
   tabbed R / Python block above the mark-complete row.
   Keep snippets short, standard, and runnable as-is.
   ============================================================ */
window.SNIPPETS = {
  /* ---------------- Stats 1 ---------------- */
  "what-is-statistics": {
    r: 'pop  <- rnorm(2000, mean = 68, sd = 11)  # the whole population (unknowable IRL)\nsamp <- sample(pop, 25)                   # the part you actually measure\nmean(samp)   # statistic: estimates...\nmean(pop)    # ...the parameter',
    py: 'import numpy as np\nrng = np.random.default_rng()\npop = rng.normal(68, 11, 2000)      # the whole population\nsamp = rng.choice(pop, 25)          # the part you actually measure\nprint(samp.mean(), pop.mean())      # statistic vs parameter'
  },
  "types-of-data": {
    r: 'df <- data.frame(\n  group = factor(c("ctrl", "drug", "drug")),          # nominal\n  pain  = ordered(c("low", "mid", "high"),\n                  levels = c("low", "mid", "high")),  # ordinal\n  rt_ms = c(512, 430, 388)                             # continuous (ratio)\n)\nstr(df)   # check how R sees each variable',
    py: 'import pandas as pd\ndf = pd.DataFrame({\n    "group": pd.Categorical(["ctrl", "drug", "drug"]),\n    "pain": pd.Categorical(["low", "mid", "high"],\n                           categories=["low", "mid", "high"], ordered=True),\n    "rt_ms": [512, 430, 388],\n})\nprint(df.dtypes)'
  },
  "describing-data": {
    r: 'x <- c(4, 5, 5, 6, 7, 8, 9, 42)   # note the outlier\nmean(x); median(x)                # mean gets dragged, median holds\nsd(x); IQR(x)\nsummary(x)',
    py: 'import numpy as np\nx = np.array([4, 5, 5, 6, 7, 8, 9, 42])   # note the outlier\nprint(x.mean(), np.median(x))             # mean gets dragged\nprint(x.std(ddof=1), np.percentile(x, 75) - np.percentile(x, 25))'
  },
  "visualizing-data": {
    r: 'x <- rgamma(300, shape = 2, rate = 0.1)   # skewed data\nhist(x, breaks = 30)\nboxplot(x, horizontal = TRUE)\nplot(density(x))',
    py: 'import numpy as np, matplotlib.pyplot as plt\nx = np.random.default_rng().gamma(2, 10, 300)   # skewed data\nfig, ax = plt.subplots(1, 2, figsize=(9, 3))\nax[0].hist(x, bins=30); ax[1].boxplot(x, vert=False)\nplt.show()'
  },
  "z-scores-and-the-normal-distribution": {
    r: 'x <- 130; mu <- 100; sigma <- 15\nz <- (x - mu) / sigma        # z = 2\npnorm(z)                     # P(value below x): 0.977\npnorm(130, 100, 15)          # same thing, no manual z\nqnorm(0.975)                 # the famous 1.96',
    py: 'from scipy import stats\nz = (130 - 100) / 15                 # z = 2\nprint(stats.norm.cdf(z))             # P(below): 0.977\nprint(stats.norm.cdf(130, 100, 15))  # same, no manual z\nprint(stats.norm.ppf(0.975))         # the famous 1.96'
  },
  "probability-basics": {
    r: '# P(exactly 7 heads in 10 fair flips)\ndbinom(7, size = 10, prob = 0.5)\n# simulate it\nmean(replicate(100000, sum(rbinom(10, 1, 0.5)) == 7))',
    py: 'import numpy as np\nfrom scipy import stats\nprint(stats.binom.pmf(7, 10, 0.5))   # exact\nflips = np.random.default_rng().binomial(10, 0.5, 100_000)\nprint((flips == 7).mean())           # simulated'
  },
  "sampling-distributions": {
    r: 'pop <- rexp(100000, rate = 1/50)          # skewed population\nmeans <- replicate(10000, mean(sample(pop, 40)))\nsd(means)                                  # standard error, empirically\nsd(pop) / sqrt(40)                         # standard error, by formula',
    py: 'import numpy as np\nrng = np.random.default_rng()\npop = rng.exponential(50, 100_000)         # skewed population\nmeans = [rng.choice(pop, 40).mean() for _ in range(10_000)]\nprint(np.std(means), pop.std() / np.sqrt(40))  # empirical vs formula SE'
  },
  "central-limit-theorem": {
    r: 'pop <- rexp(100000, rate = 1/50)   # very skewed\nmeans <- replicate(10000, mean(sample(pop, 40)))\nhist(means, breaks = 40)           # ...and yet: a bell curve\nqqnorm(means); qqline(means)',
    py: 'import numpy as np, matplotlib.pyplot as plt\nrng = np.random.default_rng()\npop = rng.exponential(50, 100_000)          # very skewed\nmeans = [rng.choice(pop, 40).mean() for _ in range(10_000)]\nplt.hist(means, bins=40); plt.show()        # ...and yet: a bell curve'
  },
  "confidence-intervals": {
    r: 'x <- rnorm(30, mean = 72, sd = 10)\nt.test(x)$conf.int          # 95% CI for the mean\nt.test(x, conf.level = 0.99)$conf.int',
    py: 'import numpy as np\nfrom scipy import stats\nx = np.random.default_rng().normal(72, 10, 30)\nci = stats.t.interval(0.95, len(x)-1, loc=x.mean(),\n                      scale=stats.sem(x))\nprint(ci)'
  },
  "hypothesis-testing-logic": {
    r: 'x <- rnorm(25, mean = 103, sd = 15)   # true mean is 103\nt.test(x, mu = 100)                    # H0: mu = 100\n# the p-value answers: how surprising is this IF H0 were true?',
    py: 'import numpy as np\nfrom scipy import stats\nx = np.random.default_rng().normal(103, 15, 25)\nt, p = stats.ttest_1samp(x, 100)      # H0: mu = 100\nprint(t, p)'
  },
  "one-sample-and-paired-t-tests": {
    r: 'before <- c(140, 152, 148, 133, 160, 145, 155, 138)\nafter  <- before - rnorm(8, mean = 5, sd = 4)\nt.test(before, after, paired = TRUE)   # same people, two moments\nt.test(after - before, mu = 0)         # identical: one-sample on differences',
    py: 'import numpy as np\nfrom scipy import stats\nrng = np.random.default_rng()\nbefore = np.array([140, 152, 148, 133, 160, 145, 155, 138.])\nafter = before - rng.normal(5, 4, 8)\nprint(stats.ttest_rel(before, after))   # paired t-test'
  },
  "independent-samples-t-test": {
    r: 'ctrl <- rnorm(40, 100, 15)\ndrug <- rnorm(40, 108, 15)\nt.test(drug, ctrl)          # Welch by default in R (good!)\nt.test(drug, ctrl, var.equal = TRUE)   # classic Student version',
    py: 'import numpy as np\nfrom scipy import stats\nrng = np.random.default_rng()\nctrl = rng.normal(100, 15, 40); drug = rng.normal(108, 15, 40)\nprint(stats.ttest_ind(drug, ctrl, equal_var=False))  # Welch'
  },
  "effect-size-and-power": {
    r: '# Cohen\'s d, then the n needed to detect it with 80% power\nlibrary(pwr)    # install.packages("pwr")\nd <- (108 - 100) / 15                 # ~0.53, a medium effect\npwr.t.test(d = d, power = 0.80, sig.level = 0.05)',
    py: 'from statsmodels.stats.power import TTestIndPower\nd = (108 - 100) / 15                  # Cohen\'s d ~ 0.53\nn = TTestIndPower().solve_power(effect_size=d, power=0.80,\n                                alpha=0.05)\nprint(n)   # per group'
  },
  /* ---------------- Stats 2 ---------------- */
  "one-way-anova": {
    r: 'df <- data.frame(\n  score = c(rnorm(20, 70, 8), rnorm(20, 75, 8), rnorm(20, 80, 8)),\n  group = rep(c("A", "B", "C"), each = 20)\n)\nfit <- aov(score ~ group, data = df)\nsummary(fit)    # the F-ratio: between-group / within-group variance',
    py: 'import numpy as np\nfrom scipy import stats\nrng = np.random.default_rng()\na, b, c = (rng.normal(m, 8, 20) for m in (70, 75, 80))\nF, p = stats.f_oneway(a, b, c)\nprint(F, p)'
  },
  "post-hoc-tests": {
    r: 'fit <- aov(score ~ group, data = df)   # df from the ANOVA lesson\nTukeyHSD(fit)                          # all pairs, error rate controlled\npairwise.t.test(df$score, df$group, p.adjust.method = "bonferroni")',
    py: 'from statsmodels.stats.multicomp import pairwise_tukeyhsd\nimport numpy as np\nscores = np.concatenate([a, b, c])       # from the ANOVA lesson\ngroups = ["A"]*20 + ["B"]*20 + ["C"]*20\nprint(pairwise_tukeyhsd(scores, groups))'
  },
  "factorial-anova-two-way": {
    r: 'fit <- aov(score ~ drug * therapy, data = df)\nsummary(fit)          # two main effects + the interaction\ninteraction.plot(df$drug, df$therapy, df$score)',
    py: 'import statsmodels.api as sm\nimport statsmodels.formula.api as smf\nfit = smf.ols("score ~ C(drug) * C(therapy)", data=df).fit()\nprint(sm.stats.anova_lm(fit, typ=2))'
  },
  "repeated-measures-anova": {
    r: 'library(afex)   # install.packages("afex")\n# long format: one row per subject x condition\naov_ez(id = "subj", dv = "rt", within = "condition", data = df)\n# afex applies the Greenhouse-Geisser correction for you',
    py: 'from statsmodels.stats.anova import AnovaRM\nres = AnovaRM(df, depvar="rt", subject="subj",\n              within=["condition"]).fit()\nprint(res)'
  },
  "assumptions-and-when-they-break": {
    r: 'shapiro.test(residuals(fit))       # normality of residuals\ncar::leveneTest(score ~ group, df)  # equal variances\n# robust fallback if variances differ:\noneway.test(score ~ group, data = df)   # Welch ANOVA',
    py: 'from scipy import stats\nprint(stats.shapiro(resid))          # normality\nprint(stats.levene(a, b, c))         # equal variances\n# Welch fallback for unequal variances:\nprint(stats.f_oneway(a, b, c))       # + pingouin.welch_anova for Welch'
  },
  "non-parametric-alternatives": {
    r: 'wilcox.test(drug, ctrl)             # Mann-Whitney U (2 groups)\nkruskal.test(score ~ group, df)     # Kruskal-Wallis (3+ groups)\nwilcox.test(before, after, paired = TRUE)   # signed-rank',
    py: 'from scipy import stats\nprint(stats.mannwhitneyu(drug, ctrl))     # 2 independent groups\nprint(stats.kruskal(a, b, c))             # 3+ groups\nprint(stats.wilcoxon(before, after))      # paired'
  },
  "chi-square-tests": {
    r: 'tab <- matrix(c(30, 10,\n                20, 40), nrow = 2, byrow = TRUE)\nchisq.test(tab)            # association between two categoricals\nchisq.test(tab)$expected   # the counts H0 predicted',
    py: 'import numpy as np\nfrom scipy import stats\ntab = np.array([[30, 10], [20, 40]])\nchi2, p, dof, expected = stats.chi2_contingency(tab)\nprint(chi2, p)\nprint(expected)   # the counts H0 predicted'
  },
  "correlation": {
    r: 'cor(x, y)                  # Pearson r\ncor.test(x, y)             # r with CI and p-value\ncor.test(x, y, method = "spearman")   # rank-based, robust to curves',
    py: 'from scipy import stats\nr, p = stats.pearsonr(x, y)\nprint(r, p)\nprint(stats.spearmanr(x, y))   # rank-based alternative'
  },
  "simple-linear-regression": {
    r: 'fit <- lm(score ~ hours, data = df)\nsummary(fit)         # slope, intercept, R-squared\nplot(df$hours, df$score); abline(fit, col = "red")',
    py: 'import statsmodels.formula.api as smf\nfit = smf.ols("score ~ hours", data=df).fit()\nprint(fit.summary())    # slope, intercept, R-squared'
  },
  "regression-diagnostics": {
    r: 'fit <- lm(score ~ hours, data = df)\npar(mfrow = c(2, 2)); plot(fit)   # residuals, Q-Q, leverage in one go\ncar::ncvTest(fit)                 # formal heteroscedasticity test',
    py: 'import matplotlib.pyplot as plt\nimport statsmodels.api as sm\nfig = plt.figure(figsize=(8, 5))\nplt.scatter(fit.fittedvalues, fit.resid); plt.axhline(0)\nplt.show()\nprint(sm.stats.diagnostic.het_breuschpagan(fit.resid,\n      fit.model.exog))   # heteroscedasticity test'
  },
  /* ---------------- Stats 3 ---------------- */
  "multiple-regression": {
    r: 'fit <- lm(score ~ hours + sleep + anxiety, data = df)\nsummary(fit)   # each slope = effect holding the others constant\nconfint(fit)',
    py: 'import statsmodels.formula.api as smf\nfit = smf.ols("score ~ hours + sleep + anxiety", data=df).fit()\nprint(fit.summary())   # each slope: all else equal'
  },
  "multicollinearity-and-variable-selection": {
    r: 'car::vif(fit)          # VIF > 5-10 = trouble\nstep(fit)              # stepwise by AIC (use with care!)',
    py: 'from statsmodels.stats.outliers_influence import variance_inflation_factor\nX = fit.model.exog\nfor i, name in enumerate(fit.model.exog_names):\n    print(name, variance_inflation_factor(X, i))'
  },
  "categorical-predictors-and-dummy-coding": {
    r: 'df$group <- factor(df$group)              # R dummy-codes for you\nfit <- lm(score ~ group, data = df)\nsummary(fit)   # each coefficient vs the reference level\ndf$group <- relevel(df$group, ref = "B")  # change the baseline',
    py: 'import statsmodels.formula.api as smf\nfit = smf.ols("score ~ C(group)", data=df).fit()\nprint(fit.params)   # each coefficient vs the reference level\nfit2 = smf.ols(\'score ~ C(group, Treatment(reference="B"))\',\n               data=df).fit()'
  },
  "ancova": {
    r: 'fit <- lm(post ~ group + pretest, data = df)   # ANCOVA = ANOVA + covariate\nsummary(fit)          # the group coefficient IS the adjusted difference\ncar::Anova(fit, type = 3)                      # classic ANCOVA table\n# check homogeneity of slopes first:\nanova(lm(post ~ group * pretest, data = df))   # interaction should be n.s.',
    py: 'import statsmodels.formula.api as smf\nimport statsmodels.api as sm\nfit = smf.ols("post ~ C(group) + pretest", data=df).fit()\nprint(sm.stats.anova_lm(fit, typ=3))\n# homogeneity of slopes: the interaction should be n.s.\nslopes = smf.ols("post ~ C(group) * pretest", data=df).fit()\nprint(sm.stats.anova_lm(slopes, typ=3))'
  },
  "interactions-in-regression": {
    r: 'fit <- lm(score ~ hours * anxiety, data = df)  # main effects + product\nsummary(fit)\n# center predictors first to make main effects interpretable:\ndf$hours_c <- scale(df$hours, scale = FALSE)',
    py: 'import statsmodels.formula.api as smf\nfit = smf.ols("score ~ hours * anxiety", data=df).fit()\nprint(fit.summary())   # hours:anxiety row is the interaction'
  },
  "mediation-and-indirect-effects": {
    r: 'library(mediation)   # install.packages("mediation")\nmed <- lm(m ~ x, df); out <- lm(y ~ x + m, df)\nfit <- mediate(med, out, treat = "x", mediator = "m",\n               boot = TRUE, sims = 5000)\nsummary(fit)   # ACME = the indirect effect',
    py: 'import pingouin as pg   # pip install pingouin\nres = pg.mediation_analysis(data=df, x="x", m="m", y="y",\n                            n_boot=5000)\nprint(res)   # "Indirect" row = the X -> M -> Y path'
  },
  "logistic-regression": {
    r: 'fit <- glm(passed ~ hours, data = df, family = binomial)\nsummary(fit)\nexp(coef(fit))   # odds ratios: multiplicative change in odds',
    py: 'import statsmodels.formula.api as smf\nimport numpy as np\nfit = smf.logit("passed ~ hours", data=df).fit()\nprint(fit.summary())\nprint(np.exp(fit.params))   # odds ratios'
  },
  "assumptions-of-regression": {
    r: 'par(mfrow = c(2, 2)); plot(fit)     # the four diagnostic plots\ncar::durbinWatsonTest(fit)          # independence of residuals\ncar::crPlots(fit)                   # linearity, per predictor',
    py: 'import statsmodels.api as sm\nsm.qqplot(fit.resid, line="45")        # normality of residuals\nprint(sm.stats.durbin_watson(fit.resid))\n# partial-regression (linearity) plots:\nsm.graphics.plot_partregress_grid(fit)'
  },
  "model-comparison": {
    r: 'm1 <- lm(score ~ hours, df)\nm2 <- lm(score ~ hours + sleep, df)\nanova(m1, m2)       # F-test for nested models\nAIC(m1, m2); BIC(m1, m2)   # penalized fit, lower = better',
    py: 'import statsmodels.formula.api as smf\nm1 = smf.ols("score ~ hours", data=df).fit()\nm2 = smf.ols("score ~ hours + sleep", data=df).fit()\nprint(m1.compare_f_test(m2))     # wait: call on the LARGER model\nprint(m1.aic, m2.aic)            # lower = better'
  },
  "factor-analysis-pca": {
    r: 'pc <- prcomp(df_items, scale. = TRUE)\nsummary(pc); plot(pc, type = "l")     # scree plot\nlibrary(psych)\nfa(df_items, nfactors = 2, rotate = "oblimin")   # proper EFA',
    py: 'from sklearn.decomposition import PCA\nfrom sklearn.preprocessing import StandardScaler\nZ = StandardScaler().fit_transform(df_items)\npc = PCA().fit(Z)\nprint(pc.explained_variance_ratio_)   # scree by numbers\n# proper EFA: pip install factor_analyzer'
  },
  "manova": {
    r: 'fit <- manova(cbind(anxiety, depression) ~ group, data = df)\nsummary(fit, test = "Pillai")   # robust default (also "Wilks")\nsummary.aov(fit)                # univariate follow-ups per outcome\n# MANCOVA: just add the covariate\nfit2 <- manova(cbind(anxiety, depression) ~ group + pretest, data = df)',
    py: 'from statsmodels.multivariate.manova import MANOVA\nm = MANOVA.from_formula("anxiety + depression ~ group", data=df)\nprint(m.mv_test())   # Wilks, Pillai, Hotelling-Lawley, Roy\n# MANCOVA: "anxiety + depression ~ group + pretest"',
  },
  "power-analysis-for-complex-designs": {
    r: 'library(pwr)\npwr.anova.test(k = 3, f = 0.25, power = 0.80)   # one-way ANOVA\n# for mixed/complex designs, simulate instead:\nlibrary(simr)   # power by simulation for lmer models',
    py: 'from statsmodels.stats.power import FTestAnovaPower\nn = FTestAnovaPower().solve_power(effect_size=0.25,\n                                  k_groups=3, power=0.80,\n                                  alpha=0.05)\nprint(n)   # total N; complex designs -> simulate'
  },
  /* ---------------- Stats 4 ---------------- */
  "bootstrap-and-resampling": {
    r: 'x <- rgamma(50, 2, 0.1)\nboots <- replicate(10000, median(sample(x, replace = TRUE)))\nquantile(boots, c(0.025, 0.975))   # 95% bootstrap CI for the median',
    py: 'import numpy as np\nrng = np.random.default_rng()\nx = rng.gamma(2, 10, 50)\nboots = [np.median(rng.choice(x, len(x))) for _ in range(10_000)]\nprint(np.percentile(boots, [2.5, 97.5]))   # bootstrap CI'
  },
  "bayesian-thinking": {
    r: '# coin with unknown p: prior Beta(2,2), then observe 7 heads / 10\ncurve(dbeta(x, 2, 2), ylim = c(0, 3))          # prior\ncurve(dbeta(x, 2 + 7, 2 + 3), add = TRUE, col = "red")  # posterior',
    py: 'import numpy as np\nfrom scipy import stats\nimport matplotlib.pyplot as plt\np = np.linspace(0, 1, 200)\nplt.plot(p, stats.beta.pdf(p, 2, 2), label="prior")\nplt.plot(p, stats.beta.pdf(p, 9, 5), label="posterior (7/10 heads)")\nplt.legend(); plt.show()'
  },
  "bayesian-estimation": {
    r: 'library(rstanarm)   # install.packages("rstanarm")\nfit <- stan_glm(score ~ hours, data = df, refresh = 0)\nposterior_interval(fit, prob = 0.95)   # credible intervals\nplot(fit, "areas")',
    py: 'import pymc as pm   # pip install pymc\nwith pm.Model():\n    a = pm.Normal("a", 0, 10); b = pm.Normal("b", 0, 10)\n    s = pm.HalfNormal("s", 10)\n    pm.Normal("y", a + b * df.hours, s, observed=df.score)\n    idata = pm.sample()\nprint(pm.summary(idata))   # posterior + credible intervals'
  },
  "generalized-linear-models": {
    r: '# count outcome -> Poisson GLM with a log link\nfit <- glm(citations ~ years + field, data = df,\n           family = poisson)\nsummary(fit)\nexp(coef(fit))   # multiplicative effects on the expected count',
    py: 'import statsmodels.formula.api as smf\nimport statsmodels.api as sm\nfit = smf.glm("citations ~ years + field", data=df,\n              family=sm.families.Poisson()).fit()\nprint(fit.summary())'
  },
  "mixed-and-multilevel-models": {
    r: 'library(lme4)\n# random intercept per school: pupils are nested, not independent\nfit <- lmer(score ~ hours + (1 | school), data = df)\nsummary(fit)\nperformance::icc(fit)   # how much variance lives between schools',
    py: 'import statsmodels.formula.api as smf\nfit = smf.mixedlm("score ~ hours", data=df,\n                  groups=df["school"]).fit()\nprint(fit.summary())'
  },
  "cross-validation-and-overfitting": {
    r: 'library(boot)\nfor (d in 1:6) {\n  fit <- glm(y ~ poly(x, d), data = df)\n  cv  <- cv.glm(df, fit, K = 5)$delta[1]   # 5-fold CV error\n  cat("degree", d, "CV MSE:", round(cv, 3), "\\n")\n}',
    py: 'from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import PolynomialFeatures\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.model_selection import cross_val_score\nfor d in range(1, 7):\n    model = make_pipeline(PolynomialFeatures(d), LinearRegression())\n    mse = -cross_val_score(model, X, y, cv=5,\n            scoring="neg_mean_squared_error").mean()\n    print(d, round(mse, 3))'
  },
  "causal-dags-and-confounding": {
    r: 'library(dagitty)\ng <- dagitty("dag { Z -> X; Z -> Y; X -> Y }")\nadjustmentSets(g, exposure = "X", outcome = "Y")  # says: adjust Z\nlm(y ~ x, df)        # naive: biased by the backdoor\nlm(y ~ x + z, df)    # adjusted: recovers the causal effect',
    py: 'import statsmodels.formula.api as smf\nnaive = smf.ols("y ~ x", data=df).fit()\nadjusted = smf.ols("y ~ x + z", data=df).fit()\nprint(naive.params["x"], adjusted.params["x"])\n# DAG tooling: pip install dowhy (or draw it at dagitty.net)'
  },
  "survival-analysis": {
    r: 'library(survival)\nfit <- survfit(Surv(time, event) ~ group, data = df)\nplot(fit, col = 1:2)                 # Kaplan-Meier curves\nsurvdiff(Surv(time, event) ~ group, data = df)   # log-rank test\ncoxph(Surv(time, event) ~ group + age, data = df)  # adjusted HRs',
    py: 'from lifelines import KaplanMeierFitter\nfrom lifelines.statistics import logrank_test\nkm = KaplanMeierFitter()\nfor g, sub in df.groupby("group"):\n    km.fit(sub.time, sub.event, label=g).plot_survival_function()\na, b = [s for _, s in df.groupby("group")]\nprint(logrank_test(a.time, b.time, a.event, b.event).p_value)'
  },
  "missing-data": {
    r: 'library(mice)   # multiple imputation, the modern default\nimp  <- mice(df, m = 20, printFlag = FALSE)\nfits <- with(imp, lm(score ~ hours + sleep))\npool(fits)      # estimates + SEs that honestly include the holes\nmd.pattern(df)  # visualize where the holes are',
    py: 'from sklearn.experimental import enable_iterative_imputer\nfrom sklearn.impute import IterativeImputer\nimport pandas as pd\nimp = IterativeImputer(sample_posterior=True, random_state=0)\ndf_imp = pd.DataFrame(imp.fit_transform(df), columns=df.columns)\n# proper pooled inference: run several imputations and combine'
  },
  "meta-analysis": {
    r: 'library(metafor)\nres <- rma(yi = d, sei = se, data = studies)  # DerSimonian-Laird family\nsummary(res)      # pooled effect, tau^2, I^2, Q\nforest(res)       # the forest plot\nfunnel(res)       # eyeball publication bias',
    py: 'from statsmodels.stats.meta_analysis import combine_effects\nres = combine_effects(studies["d"], studies["se"]**2)\nprint(res.summary_frame())   # fixed + random effects, I^2'
  },

  /* ---------------- Methods — Research Design ---------------- */
  "from-question-to-hypothesis": {
    r: '# directional vs non-directional is ONE argument apart\nt.test(recall_music, recall_silence, alternative = "less")       # H1: music LOWERS recall\nt.test(recall_music, recall_silence, alternative = "two.sided")  # H1: music CHANGES recall',
    py: 'from scipy import stats\nstats.ttest_ind(recall_music, recall_silence, alternative="less")       # directional H1\nstats.ttest_ind(recall_music, recall_silence, alternative="two-sided")  # non-directional H1'
  },
  "variables-and-operationalization": {
    r: '# one construct, several operationalizations -> a composite index\nstress <- data.frame(cortisol, hrv, self_report)\nstress$index <- rowMeans(scale(stress))   # standardize each item, then average\ndf$group <- factor(df$group, levels = c("decaf", "coffee"))  # IV as a factor',
    py: 'import pandas as pd\nfrom scipy.stats import zscore\nstress = df[["cortisol", "hrv", "self_report"]].apply(zscore)  # standardize each\ndf["stress_index"] = stress.mean(axis=1)                      # composite measure'
  },
  "reliability-and-validity": {
    r: 'library(psych)\n# items: rows = people, cols = the scale items\nalpha(items)$total$std.alpha   # standardized Cronbach alpha\ncor(time1_total, time2_total)  # test-retest reliability',
    py: 'import pingouin as pg\n# items: one column per scale item\npg.cronbach_alpha(data=items)   # -> (alpha, 95% CI)'
  },
  "experimental-design-and-randomization": {
    r: 'set.seed(1)\nn <- nrow(df)\ndf$group <- sample(rep(c("control", "treat"), length.out = n))  # randomize -> ~balanced\naggregate(cbind(age, motivation) ~ group, df, mean)              # check covariate balance',
    py: 'import numpy as np\nrng = np.random.default_rng(1)\ng = np.array(["control", "treat"] * ((len(df) + 1) // 2))[:len(df)]\ndf["group"] = rng.permutation(g)                    # randomize -> ~balanced\ndf.groupby("group")[["age", "motivation"]].mean()   # check covariate balance'
  },
  "between-vs-within-designs": {
    r: '# same effect, two designs\nt.test(score ~ condition, data = long)         # between-subjects: independent groups\nt.test(df$cond_a, df$cond_b, paired = TRUE)    # within-subjects: each person is their own control',
    py: 'from scipy import stats\nstats.ttest_ind(a_group, b_group)              # between-subjects (independent)\nstats.ttest_rel(df["cond_a"], df["cond_b"])    # within-subjects (paired)'
  },
  "quasi-experiments": {
    r: '# difference-in-differences: the treated:post interaction IS the DiD estimate\nm <- lm(y ~ treated * post, data = panel)   # treated (0/1), post (0/1)\nsummary(m)$coef["treated:post", ]           # estimate, SE, t, p',
    py: 'import statsmodels.formula.api as smf\nm = smf.ols("y ~ treated * post", data=panel).fit()   # treated, post are 0/1\nm.params["treated:post"]      # the difference-in-differences estimate'
  },
  "sampling-methods": {
    r: 'set.seed(1)\n# simple random sample of 80 rows\nsrs <- df[sample(nrow(df), 80), ]\n\n# stratified: ~20 per stratum, sampled within each group\nlibrary(dplyr)\nstrat <- df %>% group_by(stratum) %>% slice_sample(n = 20) %>% ungroup()',
    py: 'import pandas as pd\n# simple random sample of 80 rows\nsrs = df.sample(n=80, random_state=1)\n\n# stratified: ~20 per stratum, sampled within each group\nstrat = df.groupby("stratum", group_keys=False).apply(\n    lambda g: g.sample(n=20, random_state=1))'
  },
  "observational-designs": {
    r: '# 2x2 counts: rows = exposed/unexposed, cols = case/control\na <- 30; b <- 78; c <- 20; d <- 112\nOR <- (a * d) / (b * c)              # odds ratio (any design)\nRR <- (a / (a + b)) / (c / (c + d))  # risk ratio (cohort data only)\nc(OR = OR, RR = RR)',
    py: '# 2x2 counts: exposed-case, exposed-control, unexposed-case, unexposed-control\na, b, c, d = 30, 78, 20, 112\nodds_ratio = (a * d) / (b * c)              # odds ratio (any design)\nrisk_ratio = (a / (a + b)) / (c / (c + d))  # risk ratio (cohort data only)\nprint(odds_ratio, risk_ratio)'
  },
  "survey-and-questionnaire-design": {
    r: '# reverse-code items q3 & q5 on a 1-5 scale, then average into a composite\nlibrary(dplyr)\nrev5 <- function(x) 6 - x            # 1<->5, 2<->4, 3 unchanged\ndf <- df %>% mutate(q3 = rev5(q3), q5 = rev5(q5),\n                    composite = rowMeans(across(q1:q6)))',
    py: 'items = ["q1", "q2", "q3", "q4", "q5", "q6"]\nfor r in ["q3", "q5"]:\n    df[r] = 6 - df[r]                # reverse-code on a 1-5 scale\ndf["composite"] = df[items].mean(axis=1)'
  },
  "the-replication-crisis": {
    r: '# how forking paths inflate the false-positive rate on data with NO real effect\nset.seed(1)\nany_sig <- function() {\n  x <- rnorm(50); g <- rep(0:1, 25)                 # two groups, same population\n  keep <- abs(scale(x)) < 2                          # a defensible "outlier" rule\n  p1 <- t.test(x ~ g)$p.value                        # path 1: analyse everyone\n  p2 <- t.test(x[keep] ~ g[keep])$p.value            # path 2: drop outliers\n  min(p1, p2) < .05                                   # "significant" if EITHER works\n}\nmean(replicate(4000, any_sig()))   # ~.07 already -- above .05, and that is just two forks',
    py: 'import numpy as np\nfrom scipy import stats\nrng = np.random.default_rng(1)\ndef any_sig():\n    x = rng.normal(size=50); g = np.arange(50) % 2         # two groups, same population\n    keep = np.abs((x - x.mean()) / x.std()) < 2            # a defensible "outlier" rule\n    p1 = stats.ttest_ind(x[g == 0], x[g == 1]).pvalue      # path 1: everyone\n    p2 = stats.ttest_ind(x[(g == 0) & keep], x[(g == 1) & keep]).pvalue  # path 2: trimmed\n    return min(p1, p2) < .05                               # "significant" if EITHER works\nprint(np.mean([any_sig() for _ in range(4000)]))   # already above .05 with two forks'
  },
  "data-entry-and-validation": {
    r: 'library(dplyr)\n# declare the validation rules once, then flag every row that breaks one\nflags <- df %>% mutate(\n  bad_age = !between(age, 0, 120),                 # range check\n  bad_sex = !sex %in% c("M", "F", "Other"),        # allowed-value set\n  bad_rt  = !between(reaction_ms, 150, 3000),       # range check\n  bad_year = birth_year != (2024 - age)             # cross-field logic\n)\nfilter(flags, bad_age | bad_sex | bad_rt | bad_year)   # every offending row',
    py: 'import pandas as pd\n# declare the validation rules once, then flag every row that breaks one\nbad_age  = ~df["age"].between(0, 120)                    # range check\nbad_sex  = ~df["sex"].isin(["M", "F", "Other"])          # allowed-value set\nbad_rt   = ~df["reaction_ms"].between(150, 3000)         # range check\nbad_year = df["birth_year"] != (2024 - df["age"])        # cross-field logic\ndf[bad_age | bad_sex | bad_rt | bad_year]                # every offending row\n\n# for a hard stop in a pipeline, assert instead:\nassert df["age"].between(0, 120).all(), "impossible age found"'
  }
};
