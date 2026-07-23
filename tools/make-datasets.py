#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate the 8 practice CSVs served by datasets.html.

Run from the repo root (macOS/Linux: ./tools/make-datasets.py, Windows: python tools/make-datasets.py):
    python tools/make-datasets.py

Every dataset is built from its OWN seeded random stream (BASE_SEED + an
offset), so the output is fully reproducible and BYTE-IDENTICAL on every
rerun and every machine: CPython's Mersenne Twister (random.Random) is stable
across versions/platforms, all floats are rounded to a fixed number of
decimals before writing, and files are written with LF line endings only.
Change BASE_SEED and rerun to mint a fresh-but-still-reproducible set.

After writing the CSVs the script prints a SOLUTIONS report — the true
key numbers computed from the data it just generated. Those numbers are what
datasets.html's collapsible worked-solutions quote, so they always match the
shipped files. All statistics here are pure-stdlib (no numpy/scipy) so the
script runs on a bare Python.
"""
import csv
import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "data"
BASE_SEED = 20260709   # the documented master seed — rerun reproduces byte-for-byte


# ------------------------------------------------------------------ helpers
def write_csv(name, header, rows):
    """Write rows to assets/data/<name> with LF endings; return the path."""
    OUT.mkdir(parents=True, exist_ok=True)
    p = OUT / name
    with p.open("w", encoding="utf-8", newline="") as fh:
        w = csv.writer(fh, lineterminator="\n")
        w.writerow(header)
        w.writerows(rows)
    return p


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


def mean(xs):
    return sum(xs) / len(xs)


def var(xs, ddof=1):
    m = mean(xs)
    return sum((x - m) ** 2 for x in xs) / (len(xs) - ddof)


def sd(xs, ddof=1):
    return math.sqrt(var(xs, ddof))


def pearson(xs, ys):
    n = len(xs)
    mx, my = mean(xs), mean(ys)
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    sxx = sum((x - mx) ** 2 for x in xs)
    syy = sum((y - my) ** 2 for y in ys)
    return sxy / math.sqrt(sxx * syy)


def ols(xs, ys):
    """Simple linear regression -> (slope, intercept, r)."""
    n = len(xs)
    mx, my = mean(xs), mean(ys)
    sxx = sum((x - mx) ** 2 for x in xs)
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    b = sxy / sxx
    a = my - b * mx
    return b, a, pearson(xs, ys)


def two_sample_t(a, b):
    """Independent-samples t (pooled), Cohen's d -> (t, df, d)."""
    na, nb = len(a), len(b)
    va, vb = var(a), var(b)
    sp2 = ((na - 1) * va + (nb - 1) * vb) / (na + nb - 2)
    sp = math.sqrt(sp2)
    t = (mean(a) - mean(b)) / (sp * math.sqrt(1 / na + 1 / nb))
    d = (mean(a) - mean(b)) / sp
    return t, na + nb - 2, d


def one_way_anova(groups):
    """k-group one-way ANOVA -> (F, df_between, df_within, eta_sq)."""
    allv = [v for g in groups for v in g]
    grand = mean(allv)
    N, k = len(allv), len(groups)
    ss_between = sum(len(g) * (mean(g) - grand) ** 2 for g in groups)
    ss_within = sum(sum((v - mean(g)) ** 2 for v in g) for g in groups)
    df_b, df_w = k - 1, N - k
    F = (ss_between / df_b) / (ss_within / df_w)
    eta = ss_between / (ss_between + ss_within)
    return F, df_b, df_w, eta


def cronbach_alpha(rows):
    """rows = list of item-vectors (complete cases). Standardized-item alpha
    is NOT used; this is raw-score alpha = k/(k-1) (1 - Σ var_i / var_total)."""
    k = len(rows[0])
    item_cols = list(zip(*rows))
    sum_item_var = sum(var(list(col)) for col in item_cols)
    totals = [sum(r) for r in rows]
    return (k / (k - 1)) * (1 - sum_item_var / var(totals))


def logistic_fit(X, y, iters=6000, lr=0.3):
    """Tiny dependency-free logistic regression via gradient ascent on the
    log-likelihood, with predictors standardized for stability then the
    coefficients mapped back to the original scale. Returns b0 + list of bk."""
    p = len(X[0])
    mu = [mean([row[j] for row in X]) for j in range(p)]
    sg = [sd([row[j] for row in X]) or 1.0 for j in range(p)]
    Z = [[(row[j] - mu[j]) / sg[j] for j in range(p)] for row in X]
    b0 = 0.0
    b = [0.0] * p
    n = len(y)
    for _ in range(iters):
        g0 = 0.0
        g = [0.0] * p
        for i in range(n):
            z = b0 + sum(b[j] * Z[i][j] for j in range(p))
            pr = 1 / (1 + math.exp(-z))
            err = y[i] - pr
            g0 += err
            for j in range(p):
                g[j] += err * Z[i][j]
        b0 += lr * g0 / n
        for j in range(p):
            b[j] += lr * g[j] / n
    # map standardized coefficients back to the raw predictor scale
    raw = [b[j] / sg[j] for j in range(p)]
    raw0 = b0 - sum(b[j] * mu[j] / sg[j] for j in range(p))
    return raw0, raw


def rnd(v, dp):
    return round(v, dp)


def search_seed(gen, ok, base, limit=4000):
    """Deterministically scan seed offsets base, base+1, … and return the
    first (seed, payload) whose realised statistics satisfy ok(payload). The
    scan is fixed, so the winning seed — and therefore the CSV — is identical
    on every rerun; it just lets us plant a *realised* effect (not merely a
    population one) near the target the story promises."""
    for off in range(limit):
        s = base + off
        payload = gen(s)
        if ok(payload):
            return s, payload
    raise RuntimeError("no seed in range satisfied the target")


# ------------------------------------------------------------------ datasets
def make_sleep():
    """(1) Two-group t-test, planted d ~ 0.5. Sleep restriction -> attention
    errors on a 30-min vigilance task."""
    def gen(seed):
        r = random.Random(seed)
        rows, ctrl, rest = [], [], []
        pid = 1
        for cond, mu in (("normal_sleep", 20.0), ("restricted_sleep", 23.0)):
            for _ in range(40):
                e = round(clamp(r.gauss(mu, 6.0), 0, 60))
                rows.append([pid, cond, e])
                (ctrl if cond == "normal_sleep" else rest).append(e)
                pid += 1
        return rows, ctrl, rest
    # keep the population gap at d = 0.5 but pick the deterministic offset whose
    # *sample* d lands in [0.45, 0.55], so the worked solution reads ~0.5
    _, (rows, ctrl, rest) = search_seed(
        gen, lambda p: 0.45 <= two_sample_t(p[2], p[1])[2] <= 0.55, BASE_SEED + 1)
    write_csv("sleep-experiment.csv", ["participant_id", "condition", "errors"], rows)
    t, df, d = two_sample_t(rest, ctrl)
    return ("sleep-experiment.csv",
            [f"normal_sleep: M = {rnd(mean(ctrl),2)}, SD = {rnd(sd(ctrl),2)}, n = {len(ctrl)}",
             f"restricted_sleep: M = {rnd(mean(rest),2)}, SD = {rnd(sd(rest),2)}, n = {len(rest)}",
             f"independent t (pooled): t({df}) = {rnd(t,2)}",
             f"Cohen's d = {rnd(d,2)} (planted ~0.5)"])


def make_study_methods():
    """(2) 3-group ANOVA with mildly unequal variances (Levene practice)."""
    specs = [("rereading", 66.0, 8.0), ("flashcards", 73.0, 9.5), ("practice_testing", 80.0, 11.5)]
    def gen(seed):
        r = random.Random(seed)
        rows, groups = [], []
        sid = 1
        for name, mu, s in specs:
            g = []
            for _ in range(35):
                v = round(clamp(r.gauss(mu, s), 0, 100))
                rows.append([sid, name, v])
                g.append(v)
                sid += 1
            groups.append(g)
        return rows, groups
    # want the story visible in the sample: means monotonic (rereading <
    # flashcards < practice_testing) with the SDs still noticeably unequal
    def ok(p):
        gs = p[1]
        ms = [mean(g) for g in gs]
        sds = [sd(g) for g in gs]
        return ms[0] < ms[1] < ms[2] and max(sds) / min(sds) >= 1.3
    _, (rows, groups) = search_seed(gen, ok, BASE_SEED + 2)
    write_csv("study-methods.csv", ["student_id", "method", "exam_score"], rows)
    F, dfb, dfw, eta = one_way_anova(groups)
    lines = [f"{specs[i][0]}: M = {rnd(mean(groups[i]),2)}, SD = {rnd(sd(groups[i]),2)}, n = {len(groups[i])}"
             for i in range(3)]
    lines.append(f"one-way ANOVA: F({dfb}, {dfw}) = {rnd(F,2)}, eta^2 = {rnd(eta,3)}")
    lines.append(f"SD ratio largest/smallest = {rnd(max(sd(g) for g in groups)/min(sd(g) for g in groups),2)} (heterogeneity)")
    return ("study-methods.csv", lines)


def make_screen_time():
    """(3) Correlation/regression with ONE influential high-leverage outlier."""
    r = random.Random(BASE_SEED + 3)
    xs, ys, rows = [], [], []
    pid = 1
    for _ in range(59):
        x = clamp(r.gauss(4.0, 1.4), 0.5, 8.0)                 # daily screen hours
        y = clamp(8.0 - 0.7 * x + r.gauss(0, 1.8), 0, 10)      # sleep-quality 0-10
        rows.append([pid, round(x, 1), round(y, 1)])
        xs.append(round(x, 1)); ys.append(round(y, 1)); pid += 1
    # the planted influential point: very high screen time AND high sleep quality
    rows.append([pid, 11.5, 8.6])
    write_csv("screen-time.csv", ["person_id", "screen_hours", "sleep_quality"], rows)
    xs_all = xs + [11.5]; ys_all = ys + [8.6]
    b_all, a_all, r_all = ols(xs_all, ys_all)
    b_wo, a_wo, r_wo = ols(xs, ys)
    return ("screen-time.csv",
            [f"with all n = {len(xs_all)}: r = {rnd(r_all,2)}, slope = {rnd(b_all,2)}",
             f"drop person {pid} (screen 11.5 h, sleep 8.6): r = {rnd(r_wo,2)}, slope = {rnd(b_wo,2)}",
             f"one point moves r by {rnd(abs(r_wo - r_all),2)} — that's leverage",
             f"line without it: sleep = {rnd(a_wo,2)} - {rnd(abs(b_wo),2)} x screen_hours"])


def make_memory_2x2():
    """(4) 2x2 factorial with a genuine interaction (context matters only when
    encoding is deep)."""
    r = random.Random(BASE_SEED + 4)
    cells = {("shallow", "same"): 10.0, ("shallow", "different"): 9.0,
             ("deep", "same"): 18.0, ("deep", "different"): 13.0}
    rows, by = [], {k: [] for k in cells}
    pid = 1
    for (enc, ctx), mu in cells.items():
        for _ in range(25):
            v = round(clamp(r.gauss(mu, 3.2), 0, 30))
            rows.append([pid, enc, ctx, v])
            by[(enc, ctx)].append(v)
            pid += 1
    write_csv("memory-2x2.csv", ["id", "encoding", "context", "recall"], rows)
    ss = {k: rnd(mean(v), 2) for k, v in by.items()}
    simple_shallow = ss[("shallow", "same")] - ss[("shallow", "different")]
    simple_deep = ss[("deep", "same")] - ss[("deep", "different")]
    return ("memory-2x2.csv",
            [f"shallow/same M = {ss[('shallow','same')]}, shallow/different M = {ss[('shallow','different')]}",
             f"deep/same M = {ss[('deep','same')]}, deep/different M = {ss[('deep','different')]}",
             f"context effect | shallow = {rnd(simple_shallow,2)}, | deep = {rnd(simple_deep,2)}",
             f"interaction (difference of differences) = {rnd(simple_deep - simple_shallow,2)} points"])


def make_wellbeing():
    """(5) 8 Likert items (q3 & q6 reverse-coded), ~5% missing, composite +
    Cronbach's alpha practice."""
    r = random.Random(BASE_SEED + 5)
    REV = {3, 6}
    rows = []
    complete = []                                   # complete, reverse-scored cases for alpha
    for rid in range(1, 121):
        trait = r.gauss(0, 1)
        raw = []
        for item in range(1, 9):
            base = 3 - 0.95 * trait if item in REV else 3 + 0.95 * trait
            raw.append(round(clamp(base + r.gauss(0, 0.85), 1, 5)))
        # inject ~5% missing completely at random
        cells = ["" if r.random() < 0.05 else raw[i] for i in range(8)]
        rows.append([rid] + cells)
        if all(c != "" for c in cells):
            scored = [(6 - cells[i]) if (i + 1) in REV else cells[i] for i in range(8)]
            complete.append(scored)
    header = ["respondent_id"] + [f"q{i}" for i in range(1, 9)]
    write_csv("wellbeing-survey.csv", header, rows)
    alpha = cronbach_alpha(complete)
    comp_means = [mean(c) for c in complete]
    n_missing_cells = sum(1 for row in rows for c in row[1:] if c == "")
    return ("wellbeing-survey.csv",
            [f"reverse-code q3 and q6 as 6 - x BEFORE scoring",
             f"complete cases (listwise): {len(complete)} of 120",
             f"missing cells: {n_missing_cells}",
             f"Cronbach's alpha (raw, complete cases) = {rnd(alpha,2)}",
             f"composite (mean of 8 scored items): M = {rnd(mean(comp_means),2)}, SD = {rnd(sd(comp_means),2)}"])


def make_messy_clinic():
    """(6) Deliberately dirty clinic intake — duplicates, impossible values,
    inconsistent categories, a unit mix-up, mixed date formats."""
    r = random.Random(BASE_SEED + 6)
    sexes = ["Male", "Female", "M", "F", "male", "female", " Male ", "f"]
    rows = []
    for i in range(1, 51):
        age = round(clamp(r.gauss(44, 15), 18, 88))
        sex = r.choice(sexes)
        height = round(clamp(r.gauss(170, 9), 150, 195))       # cm
        weight = round(clamp(r.gauss(78, 14), 45, 130), 1)     # kg
        sbp = round(clamp(r.gauss(126, 14), 90, 180))          # systolic mmHg
        y, mo, d = 2025, r.randint(1, 12), r.randint(1, 28)
        date = f"{y}-{mo:02d}-{d:02d}"
        rows.append([f"P{i:03d}", age, sex, height, weight, sbp, date])
    # --- plant the dirt (deterministic edits on the seeded rows) ---
    rows[6][1] = 511                     # impossible age (typo for 51)
    rows[12][3] = 1.72                   # height in METRES not cm (unit mix-up)
    rows[19][5] = 0                      # impossible systolic BP
    rows[24][2] = "  female"             # stray whitespace + case
    rows[30][4] = -78.0                  # negative weight (sign typo)
    rows[33][6] = "07/04/2025"           # DD/MM vs ISO date format
    rows[38][6] = "April 12 2025"        # third date format
    rows[41][3] = 400                    # impossible height in cm
    dup1 = list(rows[3])                 # exact duplicate row (same P004)
    dup2 = list(rows[15]); dup2[4] = round(dup2[4] + 0.3, 1)   # near-dup (same id, tiny diff)
    rows.append(dup1)
    rows.append(dup2)
    write_csv("messy-clinic.csv",
              ["patient_id", "age", "sex", "height_cm", "weight_kg", "systolic_bp", "visit_date"], rows)
    return ("messy-clinic.csv",
            ["duplicate patient_id: P004 (exact) and P016 (near-dup, weight differs)",
             "impossible values: age 511 (P007), systolic_bp 0 (P020), weight -78 (P031), height 400 cm (P042)",
             "unit mix-up: P013 height 1.72 is METRES, not cm",
             "sex has 8 spellings incl. whitespace/case: Male/M/male/ Male / vs Female/F/female/f/  female",
             "three date formats: ISO, 07/04/2025 (P034), 'April 12 2025' (P039)",
             "after cleaning: 50 unique valid patients"])


def make_training():
    """(7) 3 timepoints in WIDE format, two groups — pivot + RM/mixed ANOVA."""
    r = random.Random(BASE_SEED + 7)
    rows = []
    means = {"program": [], "control": []}
    tp = {"program": [[], [], []], "control": [[], [], []]}
    aid = 1
    for grp, gain in (("program", 9.0), ("control", 2.0)):
        for _ in range(30):
            base = clamp(r.gauss(100, 12), 60, 140)            # baseline 1RM (kg)
            w0 = base
            w6 = base + gain * 0.6 + r.gauss(0, 3)
            w12 = base + gain + r.gauss(0, 3)
            vals = [round(w0, 1), round(w6, 1), round(w12, 1)]
            rows.append([aid, grp, vals[0], vals[1], vals[2]])
            for j in range(3):
                tp[grp][j].append(vals[j])
            aid += 1
    write_csv("training-longitudinal.csv",
              ["athlete_id", "group", "strength_wk0", "strength_wk6", "strength_wk12"], rows)
    def m3(g):
        return [rnd(mean(tp[g][j]), 1) for j in range(3)]
    prog, ctrl = m3("program"), m3("control")
    return ("training-longitudinal.csv",
            ["wide -> long: pivot the three strength_wk* columns into time + value",
             f"program means wk0/wk6/wk12: {prog[0]} / {prog[1]} / {prog[2]} (+{rnd(prog[2]-prog[0],1)} kg)",
             f"control means wk0/wk6/wk12: {ctrl[0]} / {ctrl[1]} / {ctrl[2]} (+{rnd(ctrl[2]-ctrl[0],1)} kg)",
             "look for a group x time interaction (program gains more)"])


def make_admissions():
    """(8) Binary outcome for logistic regression."""
    def gen(seed):
        r = random.Random(seed)
        rows, X, y = [], [], []
        for i in range(1, 161):
            gpa = round(clamp(r.gauss(3.3, 0.3), 2.0, 4.0), 2)
            gre = round(clamp(r.gauss(310, 15), 260, 340))
            research = 1 if r.random() < 0.4 else 0
            logit = -11.9 + 2.0 * gpa + 0.015 * gre + 1.2 * research
            pr = 1 / (1 + math.exp(-logit))
            adm = 1 if r.random() < pr else 0
            rows.append([f"A{i:03d}", gpa, gre, research, adm])
            X.append([gpa, gre, research]); y.append(adm)
        return rows, X, y
    # a clean teaching signal: ~40-55% admitted overall AND research visibly
    # helps in the raw marginal (so the fitted OR for research comes out > 1)
    def ok(p):
        _, Xp, yp = p
        rate = mean(yp)
        res = [yp[i] for i in range(len(yp)) if Xp[i][2] == 1]
        nores = [yp[i] for i in range(len(yp)) if Xp[i][2] == 0]
        return 0.40 <= rate <= 0.55 and mean(res) - mean(nores) >= 0.08
    _, (rows, X, y) = search_seed(gen, ok, BASE_SEED + 8)
    write_csv("admissions.csv",
              ["applicant_id", "gpa", "gre_score", "research", "admitted"], rows)
    rate = mean(y)
    adm_res = mean([y[i] for i in range(len(y)) if X[i][2] == 1])
    adm_nores = mean([y[i] for i in range(len(y)) if X[i][2] == 0])
    gpa_adm = mean([X[i][0] for i in range(len(y)) if y[i] == 1])
    gpa_rej = mean([X[i][0] for i in range(len(y)) if y[i] == 0])
    b0, b = logistic_fit(X, y)
    return ("admissions.csv",
            [f"overall admit rate = {rnd(100*rate,1)}% ({sum(y)} of {len(y)})",
             f"admit rate: research = {rnd(100*adm_res,1)}% vs no research = {rnd(100*adm_nores,1)}%",
             f"mean GPA: admitted = {rnd(gpa_adm,2)} vs rejected = {rnd(gpa_rej,2)}",
             f"logistic fit: GPA b = {rnd(b[0],2)} (OR = {rnd(math.exp(b[0]),1)} per GPA point)",
             f"logistic fit: GRE b = {rnd(b[1],3)}, research b = {rnd(b[2],2)} (OR = {rnd(math.exp(b[2]),1)})"])


BUILDERS = [make_sleep, make_study_methods, make_screen_time, make_memory_2x2,
            make_wellbeing, make_messy_clinic, make_training, make_admissions]


def main():
    print(f"Generating practice datasets (BASE_SEED = {BASE_SEED}) into {OUT}\n")
    for build in BUILDERS:
        name, solutions = build()
        size = (OUT / name).stat().st_size
        print(f"── {name}  ({size} bytes)")
        for line in solutions:
            print(f"     • {line}")
        print()


if __name__ == "__main__":
    main()
