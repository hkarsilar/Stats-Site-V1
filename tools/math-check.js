#!/usr/bin/env node
/* ============================================================
   math-check.js — StatsCapybara's statistical regression gate.

   Zero-dependency Node script (Node ≥ 14, built-ins only: fs, path, vm).
   Run from the repo root whenever viz.js or any tool-page math changes:

       node tools/math-check.js

   audit.js checks the site's WIRING. This checks its MATH. The brand
   promise is "the statistics are exact, not approximate", and until this
   script existed not one line of assets/js/viz.js had a regression test.
   The two gates stay separate on purpose: audit.js is the universal
   pre-commit gate (fast, offline, always run); math-check is the math gate
   (run it when the numbers can move). Don't fold one into the other.

   How it works: viz.js is loaded into a vm context under a minimal
   window/document shim (it only touches document.documentElement for CSS
   vars and MutationObserver for theme flips, neither of which the pure
   math functions call), then every statistical function is asserted
   against a PUBLISHED value with a stated tolerance. Each assertion cites
   its source in the `src` field, and the tolerance is normally the
   rounding precision of that source (a value quoted to 4 dp gets 5e-5).

   Coverage:
     1. normal family — erf / normCdf / normInv, incl. symmetry
     2. quantiles — tInv / chiSqInv / fInv against printed table criticals
     3. upper tails — the statcheck case, plus quantile↔CDF round-trips
     4. special functions — gammaln / gammp / betai identities
     5. densities — numeric integrals of tPdf / chiSqPdf / fPdf ≈ 1
     6. noncentral trio — the four G*Power sample-size anchors
     7. tool-page constants — the effect-size conversions and the
        Fisher-z correlation CI documented in CLAUDE.md
     8. the dice lab — exact outcome counts behind distributions.html's
        triangular-distribution demonstration
     9. the printed tables — every cell of tables.html's Tables A, D and F,
        read back off the shipped page and recomputed from viz.js
    10. the quartile conventions — textbook vs SPSS vs R/Python on
        descriptives.html, derived here and read back off the shipped page
    11. Build a Table — the r × c contingency builder in stats-1/chi-square-tests
    12. Build the ANOVA Table — the one-way table in stats-2/one-way-anova,
        derived here and read back off the shipped page, including the
        sample-SD divisor the exam dialect needs

   Note on section 7: the tool pages compute these inline against the DOM,
   so they can't be imported. What is asserted here is that viz.js still
   feeds those pages the right numbers — the formulas are transcribed from
   effect-sizes.html and correlation.html and kept in step by hand.

   Exit code 0 only when every assertion passes.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

/* ---- load viz.js under a minimal browser shim ---- */
const ctx = { console };
ctx.window = ctx;
ctx.document = { documentElement: {} };
ctx.getComputedStyle = () => ({ getPropertyValue: () => '' });
ctx.MutationObserver = function () { this.observe = () => {}; };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/viz.js'), 'utf8'), ctx, { filename: 'viz.js' });

const V = ctx.window.VIZ;
if (!V) { console.error('math-check: viz.js did not export window.VIZ'); process.exit(1); }

/* ---- tiny assertion harness ---- */
const failures = [];
let passed = 0;
let section = '';

const head = (s) => { section = s; };

/* got ≈ want, within tol. `src` names the published source of `want`. */
function eq(label, got, want, tol, src) {
  const err = Math.abs(got - want);
  if (Number.isFinite(got) && err <= tol) { passed++; return; }
  failures.push({ section, label, got, want, tol, err, src });
}

/* got ≈ want to within a RELATIVE tolerance.
   Use this — never eq() — for any quantity whose true value can be far below
   eq()'s absolute tolerance, i.e. every far-tail p-value. An absolute tolerance
   cannot tell 1.1e-19 from a collapse to exactly 0: both are "within 5e-5 of
   the truth". That blind spot is precisely how a tail returning 0 survived
   218 assertions. */
function rel(label, got, want, tol, src) {
  const err = want === 0 ? Math.abs(got) : Math.abs(got - want) / Math.abs(want);
  if (Number.isFinite(got) && err <= tol) { passed++; return; }
  failures.push({ section, label, got, want, tol, err, src, relative: true });
}

/* exact integer/boolean expectations (sample sizes, identities) */
function is(label, got, want, src) {
  if (got === want) { passed++; return; }
  failures.push({ section, label, got, want, tol: 0, err: NaN, src });
}

/* Composite Simpson — used only to integrate the densities. */
function simpson(f, a, b, m) {
  m = m % 2 ? m + 1 : m;
  const h = (b - a) / m;
  let s = f(a) + f(b);
  for (let i = 1; i < m; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return s * h / 3;
}

/* ============================================================
   1 — normal family
   ============================================================ */
head('normal family');

// Φ(1) = .8413447461 (standard normal table, 10 dp).
// viz.js's erf is Abramowitz & Stegun 7.1.26, |ε| ≤ 1.5e-7 by construction —
// so this asserts the published value to the accuracy A&S guarantees, not more.
eq('normCdf(1)', V.normCdf(1), 0.8413447461, 1.5e-7, 'A&S 26.2 normal table');
eq('normCdf(0)', V.normCdf(0), 0.5, 1.5e-7, 'exact');
eq('normCdf(1.959964)', V.normCdf(1.959964), 0.975, 1.5e-7, 'exact by definition of z.975');
eq('normCdf(-2.5)', V.normCdf(-2.5), 0.0062096653, 1.5e-7, 'A&S 26.2 normal table');

// Symmetry Φ(−z) = 1 − Φ(z) must hold to machine precision: erf is an odd
// function in viz.js's implementation, so any asymmetry means a broken branch.
for (const z of [0.25, 0.5, 1, 1.6449, 2, 3, 4]) {
  eq(`symmetry Φ(−${z}) = 1 − Φ(${z})`, V.normCdf(-z), 1 - V.normCdf(z), 1e-12, 'identity');
}

// erf(1) = .8427007929 (A&S 7.1); erf is odd.
eq('erf(1)', V.erf(1), 0.8427007929, 1.5e-7, 'A&S 7.1 error-function table');
// A&S 7.1.26 is a rational approximation, so erf(0) lands ~1e-9 off zero
// rather than exactly on it — within the |ε| ≤ 1.5e-7 the formula guarantees.
eq('erf(0)', V.erf(0), 0, 1.5e-7, 'A&S 7.1.26 error bound');
eq('erf(−0.7) = −erf(0.7)', V.erf(-0.7), -V.erf(0.7), 1e-15, 'identity');

// Acklam's inverse normal, |ε| ≈ 1.15e-9 relative.
eq('normInv(.975)', V.normInv(0.975), 1.959963985, 5e-9, 'z.975, 9 dp');
eq('normInv(.95)', V.normInv(0.95), 1.644853627, 5e-9, 'z.95, 9 dp');
eq('normInv(.995)', V.normInv(0.995), 2.575829304, 5e-9, 'z.995, 9 dp');
eq('normInv(.5)', V.normInv(0.5), 0, 1e-12, 'exact');
eq('normInv(.025) = −normInv(.975)', V.normInv(0.025), -V.normInv(0.975), 1e-12, 'identity');

// normPdf against φ(0) = 1/√(2π) and a scaled case.
eq('normPdf(0,0,1)', V.normPdf(0, 0, 1), 0.3989422804, 1e-9, '1/√(2π)');
eq('normPdf(1,0,1)', V.normPdf(1, 0, 1), 0.2419707245, 1e-9, 'φ(1)');
eq('normPdf(110,100,15)', V.normPdf(110, 100, 15), 0.3989422804 / 15 * Math.exp(-0.5 * (2 / 3) ** 2), 1e-12, 'scaling identity');

/* ============================================================
   2 — quantiles against printed table criticals
   ============================================================ */
head('quantiles vs table criticals');

// Student t, two-tailed .05 row → upper-tail .025 critical (4 dp tables).
eq('tInv(.025, 10) = t.975,10', V.tInv(0.025, 10), 2.2281, 5e-5, 't-table, df 10');
eq('tInv(.025, 1)', V.tInv(0.025, 1), 12.7062, 5e-5, 't-table, df 1');
eq('tInv(.025, 30)', V.tInv(0.025, 30), 2.0423, 5e-5, 't-table, df 30');
eq('tInv(.05, 20)', V.tInv(0.05, 20), 1.7247, 5e-5, 't-table, df 20');
eq('tInv(.005, 15)', V.tInv(0.005, 15), 2.9467, 5e-5, 't-table, df 15');
eq('tInv(.5, 8)', V.tInv(0.5, 8), 0, 1e-12, 'median of a symmetric distribution');
// Lower-tail branch: tInv(.975, v) must mirror tInv(.025, v).
eq('tInv(.975, 10) = −tInv(.025, 10)', V.tInv(0.975, 10), -V.tInv(0.025, 10), 1e-9, 'symmetry');

// Chi-square upper-tail criticals (4 dp tables).
eq('chiSqInv(.05, 3) = χ².95,3', V.chiSqInv(0.05, 3), 7.8147, 5e-5, 'χ²-table, df 3');
eq('chiSqInv(.05, 1)', V.chiSqInv(0.05, 1), 3.8415, 5e-5, 'χ²-table, df 1');
eq('chiSqInv(.05, 10)', V.chiSqInv(0.05, 10), 18.3070, 5e-5, 'χ²-table, df 10');
eq('chiSqInv(.01, 5)', V.chiSqInv(0.01, 5), 15.0863, 5e-5, 'χ²-table, df 5');
eq('chiSqInv(.95, 4)', V.chiSqInv(0.95, 4), 0.7107, 5e-5, 'χ²-table lower tail, df 4');
// χ²(1) is the square of a standard normal: χ²α,1 = (z_{1−α/2})².
eq('χ².95,1 = z.975²', V.chiSqInv(0.05, 1), V.normInv(0.975) ** 2, 1e-6, 'identity');

// F upper-tail criticals (4 dp tables).
eq('fInv(.05, 3, 20) = F.95,3,20', V.fInv(0.05, 3, 20), 3.0984, 5e-5, 'F-table');
eq('fInv(.05, 1, 10)', V.fInv(0.05, 1, 10), 4.9646, 5e-5, 'F-table');
eq('fInv(.05, 2, 30)', V.fInv(0.05, 2, 30), 3.3158, 5e-5, 'F-table');
eq('fInv(.01, 4, 12)', V.fInv(0.01, 4, 12), 5.4120, 5e-5, 'F-table');
// F(1, v) is t(v) squared: F.95,1,v = (t.975,v)².
eq('F.95,1,20 = t.975,20²', V.fInv(0.05, 1, 20), V.tInv(0.025, 20) ** 2, 1e-6, 'identity');
// Reciprocal identity: F_{1−α}(d1,d2) = 1 / F_α(d2,d1).
eq('F.05,3,20 = 1/F.95,20,3', V.fInv(0.95, 3, 20), 1 / V.fInv(0.05, 20, 3), 1e-6, 'identity');

/* ============================================================
   3 — upper tails and quantile↔CDF round-trips
   ============================================================ */
head('upper tails');

// The statcheck case documented in CLAUDE.md (apa.html's consistency checker).
eq('two-tailed p for t = 2.05, df = 28', 2 * V.tUpper(2.05, 28), 0.0498, 5e-5, 'apa.html documented case');
eq('tUpper(0, 12) = .5', V.tUpper(0, 12), 0.5, 1e-12, 'symmetry');
eq('tUpper(−1.8, 9) = 1 − tUpper(1.8, 9)', V.tUpper(-1.8, 9), 1 - V.tUpper(1.8, 9), 1e-12, 'symmetry');

eq('chiSqUpper(3.8415, 1)', V.chiSqUpper(3.8415, 1), 0.05, 5e-5, 'inverse of the table critical');
eq('chiSqUpper(0, 4) = 1', V.chiSqUpper(0, 4), 1, 1e-15, 'exact');
eq('fUpper(3.0984, 3, 20)', V.fUpper(3.0984, 3, 20), 0.05, 5e-5, 'inverse of the table critical');
eq('fUpper(0, 3, 20) = 1', V.fUpper(0, 3, 20), 1, 1e-15, 'exact');

// Round-trips across a grid: the bisection quantiles must invert their own CDFs.
// This is what catches a broken branch that a handful of table values would miss.
for (const alpha of [0.001, 0.01, 0.025, 0.05, 0.1, 0.25, 0.4]) {
  for (const df of [1, 2, 5, 12, 30, 120]) {
    eq(`t round-trip α=${alpha} df=${df}`, V.tUpper(V.tInv(alpha, df), df), alpha, 1e-9, 'round-trip');
    eq(`χ² round-trip α=${alpha} df=${df}`, V.chiSqUpper(V.chiSqInv(alpha, df), df), alpha, 1e-9, 'round-trip');
    eq(`F round-trip α=${alpha} d1=${df} d2=20`, V.fUpper(V.fInv(alpha, df, 20), df, 20), alpha, 1e-9, 'round-trip');
  }
}

/* ============================================================
   3b — the FAR tail: relative accuracy, not absolute
   ============================================================
   Every assertion here uses rel(), not eq(). eq()'s absolute tolerance is
   structurally blind to this whole class of bug: a tail whose true value is
   1.13e-19 passes `eq(…, 5e-5)` when the code returns exactly 0.

   Reference: the Mills-ratio continued fraction
     Q(z) = φ(z) / (z + 1/(z + 2/(z + 3/(z + …))))
   which converges fast for large z and is fully independent of viz.js's
   incomplete-gamma route, so agreement between the two is real evidence. */
head('far tail (relative accuracy)');

function normQcf(z) {           // independent reference for Q(z), large z
  let cf = 0;
  for (let k = 400; k >= 1; k--) cf = k / (z + cf);
  return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI) / (z + cf);
}

// Published values (Abramowitz & Stegun 26.1, 7 sf).
rel('normQ(5)', V.normQ(5), 2.866516e-7, 1e-6, 'A&S 26.1 normal tail');
rel('normQ(6)', V.normQ(6), 9.865876e-10, 1e-6, 'A&S 26.1 normal tail');

// Against the independent continued fraction, out to where the double
// underflows (~z = 38). z ≥ 9 is where the old `1 - normCdf(z)` returned 0.
for (const z of [3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 30, 37]) {
  rel(`normQ(${z}) vs Mills CF`, V.normQ(z), normQcf(z), 1e-11, 'Mills-ratio continued fraction');
}

// The far tail must be strictly positive — the actual regression being guarded.
for (const z of [9, 10, 15, 20, 30, 37]) {
  is(`normQ(${z}) > 0 (not collapsed to zero)`, V.normQ(z) > 0, true, 'must not underflow to 0');
}

// Center and symmetry must survive the tail routing.
rel('normQ(0) = .5', V.normQ(0), 0.5, 1e-15, 'exact');
rel('normQ(1.959964) = .025', V.normQ(1.959964), 0.025, 1e-6, 'definition of z.975');
for (const z of [0.5, 1, 2, 3, 5, 8]) {
  rel(`normQ(−${z}) = 1 − normQ(${z})`, V.normQ(-z), 1 - V.normQ(z), 1e-14, 'symmetry');
}

// χ²(1) and F(1,v) reduce to the normal / t tails — cross-family checks that
// pin chiSqUpper and fUpper in the range where `1 - lowerTail` used to cancel
// to exactly 0. These are the assertions the old code could not have passed.
for (const x of [10, 50, 100, 200, 400]) {
  rel(`chiSqUpper(${x}, 1) = 2·Q(√${x})`, V.chiSqUpper(x, 1), 2 * normQcf(Math.sqrt(x)), 1e-11, 'χ²(1) = Z² identity');
}
for (const [f, v] of [[100, 10], [400, 20], [1000, 50], [5000, 100]]) {
  rel(`fUpper(${f}, 1, ${v}) = 2·tUpper(√${f}, ${v})`, V.fUpper(f, 1, v), 2 * V.tUpper(Math.sqrt(f), v), 1e-10, 'F(1,v) = t² identity');
}
for (const [x, k] of [[100, 1], [200, 1], [300, 4], [400, 10]]) {
  is(`chiSqUpper(${x}, ${k}) > 0 (not collapsed to zero)`, V.chiSqUpper(x, k) > 0, true, 'must not underflow to 0');
}
for (const [f, d1, d2] of [[1000, 1, 50], [5000, 1, 100], [500, 3, 40]]) {
  is(`fUpper(${f}, ${d1}, ${d2}) > 0 (not collapsed to zero)`, V.fUpper(f, d1, d2) > 0, true, 'must not underflow to 0');
}

// gammq / betaiUpper are exact complements wherever the complement is
// representable — this is what lets them be used interchangeably mid-range.
for (const [a, x] of [[0.5, 1], [2, 3], [5, 4], [10, 12]]) {
  rel(`gammq(${a},${x}) = 1 − gammp(${a},${x})`, V.gammq(a, x), 1 - V.gammp(a, x), 1e-12, 'complement identity');
}
for (const [a, b, x] of [[2, 3, 0.4], [0.5, 0.5, 0.3], [5, 2, 0.7]]) {
  rel(`betaiUpper(${a},${b},${x}) = 1 − betai(…)`, V.betaiUpper(a, b, x), 1 - V.betai(a, b, x), 1e-12, 'complement identity');
}

/* ============================================================
   4 — special-function identities
   ============================================================ */
head('special functions');

// Γ(n) = (n−1)! for integer n.
eq('exp(gammaln(6)) = 120', Math.exp(V.gammaln(6)), 120, 1e-9, 'Γ(6) = 5!');
eq('exp(gammaln(11)) = 3628800', Math.exp(V.gammaln(11)), 3628800, 1e-3, 'Γ(11) = 10!');
// Γ(1/2) = √π.
eq('exp(gammaln(.5)) = √π', Math.exp(V.gammaln(0.5)), Math.sqrt(Math.PI), 1e-12, 'Γ(½) = √π');
// Duplication-free recurrence Γ(x+1) = x·Γ(x).
eq('gammaln recurrence at 3.7', Math.exp(V.gammaln(4.7)), 3.7 * Math.exp(V.gammaln(3.7)), 1e-9, 'Γ(x+1) = xΓ(x)');

// P(a, x) for a = 1 is the exponential CDF: 1 − e^(−x).
eq('gammp(1, 1)', V.gammp(1, 1), 1 - Math.exp(-1), 1e-12, 'exponential CDF');
eq('gammp(1, 3)', V.gammp(1, 3), 1 - Math.exp(-3), 1e-12, 'exponential CDF');
// Both branches of gammp (series for x < a+1, continued fraction otherwise)
// must agree with the χ² CDF they underpin.
eq('gammp(2, 1) series branch', V.gammp(2, 1), 1 - 2 * Math.exp(-1), 1e-12, 'P(2,x) = 1 − (1+x)e^(−x)');
eq('gammp(2, 8) CF branch', V.gammp(2, 8), 1 - 9 * Math.exp(-8), 1e-12, 'P(2,x) = 1 − (1+x)e^(−x)');

// I_x(a,b) for integer a,b is a polynomial: I_.5(2,3) = 11/16 = .6875.
eq('betai(2, 3, .5)', V.betai(2, 3, 0.5), 0.6875, 1e-12, 'I_.5(2,3) = 11/16');
// I_x(1,1) = x.
eq('betai(1, 1, .3)', V.betai(1, 1, 0.3), 0.3, 1e-12, 'I_x(1,1) = x');
// Symmetry I_x(a,b) = 1 − I_{1−x}(b,a) — exercises both betacf branches.
eq('betai symmetry (3, 7, .4)', V.betai(3, 7, 0.4), 1 - V.betai(7, 3, 0.6), 1e-12, 'identity');
eq('betai(.5, .5, .5)', V.betai(0.5, 0.5, 0.5), 0.5, 1e-12, 'arcsine distribution median');
eq('betai(a,b,0) = 0', V.betai(4, 2, 0), 0, 1e-15, 'exact');
eq('betai(a,b,1) = 1', V.betai(4, 2, 1), 1, 1e-15, 'exact');

/* ============================================================
   5 — densities integrate to 1
   ============================================================ */
head('density integrals');

/* χ²(1) and F(1, ·) are unbounded at x → 0 (both go as x^−½), which plain
   Simpson cannot integrate. The substitution x = u² absorbs that singularity
   exactly: ∫f(x)dx = ∫2u·f(u²)du, and 2u·f(u²) is smooth at the origin. The
   lower limit is a hair above 0 because viz.js's pdfs return 0 for x ≤ 0,
   which would otherwise put one wrong value at the endpoint node. */
const integ0 = (pdf, hiX, m) => simpson((u) => 2 * u * pdf(u * u), 1e-9, Math.sqrt(hiX), m);

// The t density is symmetric and smooth, so it integrates directly — but df 3
// has a fat enough tail to need a wide range before the omitted mass is small.
for (const df of [3, 7, 30]) {
  eq(`∫ tPdf(·, ${df}) dx`, simpson((x) => V.tPdf(x, df), -300, 300, 4000), 1, 1e-6, 'a density integrates to 1');
}
for (const k of [1, 4, 12]) {
  eq(`∫ chiSqPdf(·, ${k}) dx`, integ0((x) => V.chiSqPdf(x, k), 400, 4000), 1, 1e-6, 'a density integrates to 1');
}
for (const [d1, d2] of [[3, 20], [1, 10], [5, 40]]) {
  eq(`∫ fPdf(·, ${d1}, ${d2}) dx`, integ0((x) => V.fPdf(x, d1, d2), 4000, 4000), 1, 1e-6, 'a density integrates to 1');
}

// The densities must also be the derivatives of their own CDFs: a central
// difference of the upper tail recovers the pdf (up to sign).
eq('d/dt tUpper(2, 9) = −tPdf(2, 9)', (V.tUpper(2.001, 9) - V.tUpper(1.999, 9)) / 0.002, -V.tPdf(2, 9), 1e-6, 'derivative identity');
eq('d/dx chiSqUpper(5, 4) = −chiSqPdf(5, 4)', (V.chiSqUpper(5.001, 4) - V.chiSqUpper(4.999, 4)) / 0.002, -V.chiSqPdf(5, 4), 1e-6, 'derivative identity');
eq('d/dx fUpper(2, 3, 20) = −fPdf(2, 3, 20)', (V.fUpper(2.001, 3, 20) - V.fUpper(1.999, 3, 20)) / 0.002, -V.fPdf(2, 3, 20), 1e-6, 'derivative identity');

/* ============================================================
   6 — the noncentral trio, via power.html's G*Power anchors
   ============================================================ */
head('noncentral trio (G*Power anchors)');

const clamp01 = (p) => (p < 0 ? 0 : p > 1 ? 1 : p);

/* The power formulas below are transcribed from power.html's inline script
   (which computes them against the DOM and so can't be imported). They are
   thin wrappers over VIZ's noncentral CDFs — the point of the assertions is
   that those CDFs still reproduce G*Power's published sample sizes. */

function tPow(df, ncp, alpha) {                      // two-tailed t
  const tc = V.tInv(alpha / 2, df);
  return clamp01(1 - V.nctCdf(tc, df, ncp) + V.nctCdf(-tc, df, ncp));
}
function hyp2f1(c, y) {                              // 2F1(½, ½; c; y)
  let t = 1, s = 1;
  for (let k = 0; k < 4000; k++) {
    t *= ((0.5 + k) * (0.5 + k)) / ((c + k) * (k + 1)) * y;
    s += t;
    if (Math.abs(t) < 1e-14 * Math.abs(s)) break;
  }
  return s;
}
function corrPdf(r, rho, n) {                        // exact density of sample r
  if (r <= -1 || r >= 1) return 0;
  const lc = Math.log(n - 2) + V.gammaln(n - 1) + ((n - 1) / 2) * Math.log(1 - rho * rho)
    - 0.5 * Math.log(2 * Math.PI) - V.gammaln(n - 0.5);
  const lk = ((n - 4) / 2) * Math.log(1 - r * r) - (n - 1.5) * Math.log(1 - rho * r);
  return Math.exp(lc + lk) * hyp2f1(n - 0.5, (1 + rho * r) / 2);
}
function corrPower(n, rho, alpha) {
  if (n < 4) return alpha;
  rho = Math.abs(rho);
  const df = n - 2, tc = V.tInv(alpha / 2, df), rc = tc / Math.sqrt(tc * tc + df);
  const p = simpson((r) => corrPdf(r, rho, n), rc, 1 - 1e-6, 300)
    + simpson((r) => corrPdf(r, rho, n), -(1 - 1e-6), -rc, 300);
  return clamp01(p);
}
/* Smallest n whose power reaches `target` — power.html's solveUnit, bisected. */
function smallestN(power, min, target) {
  let hi = min, guard = 0;
  while (power(hi) < target && hi < 2e6 && guard++ < 40) hi *= 2;
  if (power(hi) < target) return Infinity;
  let lo = min;
  while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (power(mid) >= target) hi = mid; else lo = mid + 1; }
  return lo;
}

const A = 0.05, TARGET = 0.80;

// nctCdf — two-sample t, d = 0.5, α = .05, power = .80 → 64 per group.
is('two-sample t, d = .5 → n per group',
  smallestN((n) => (n < 2 ? A : tPow(2 * n - 2, 0.5 * Math.sqrt(n / 2), A)), 2, TARGET),
  64, 'G*Power');

// nctCdf again, one-sample: d = 0.5 → n = 34.
is('one-sample t, d = .5 → n',
  smallestN((n) => (n < 2 ? A : tPow(n - 1, 0.5 * Math.sqrt(n), A)), 2, TARGET),
  34, 'G*Power');

// correlation, r = .3 → n = 84 (exact sample-r density, leans on gammaln/tInv).
is('correlation, r = .3 → n', smallestN((n) => corrPower(n, 0.3, A), 5, TARGET), 84, 'G*Power');

// ncfCdf — one-way ANOVA, f = .25, k = 3 → N = 159 (53 per group).
const K = 3;
is('one-way ANOVA, f = .25, k = 3 → N',
  K * smallestN((u) => {
    const N = K * u, d1 = K - 1, d2 = N - K;
    if (N <= K) return A;
    return clamp01(1 - V.ncfCdf(V.fInv(A, d1, d2), d1, d2, 0.25 * 0.25 * N));
  }, 2, TARGET),
  159, 'G*Power');

// ncx2Cdf — χ² goodness of fit, w = .3, df = 1 → N = 88.
is('χ², w = .3, df = 1 → N',
  smallestN((N) => (N < 1 ? A : clamp01(1 - V.ncx2Cdf(V.chiSqInv(A, 1), 1, 0.09 * N))), 1, TARGET),
  88, 'G*Power');

// A noncentral CDF with ncp = 0 must collapse to its central counterpart.
eq('nctCdf(t, df, 0) = central t', V.nctCdf(1.8, 14, 0), 1 - V.tUpper(1.8, 14), 1e-8, 'ncp = 0 identity');
eq('ncx2Cdf(x, k, 0) = central χ²', V.ncx2Cdf(7.5, 4, 0), 1 - V.chiSqUpper(7.5, 4), 1e-8, 'ncp = 0 identity');
eq('ncfCdf(f, d1, d2, 0) = central F', V.ncfCdf(2.4, 3, 20, 0), 1 - V.fUpper(2.4, 3, 20), 1e-8, 'ncp = 0 identity');
// The noncentral t is symmetric under simultaneous sign flip.
eq('nctCdf(−t, df, −δ) = 1 − nctCdf(t, df, δ)', V.nctCdf(-1.2, 11, -2), 1 - V.nctCdf(1.2, 11, 2), 1e-8, 'identity');

/* ============================================================
   6b — confidence intervals on effect sizes (apa.html)
   ============================================================
   The d / partial-η² / R² / V intervals are built by inverting the test, so
   the assertions come in three kinds. ROUND-TRIPS put each returned limit
   back through its own CDF and demand the tail area it was solved for — a
   broken bracket or a sign slip fails here first. IDENTITIES tie the interval
   to the test it inverts, which is the reason d gets 95% and the three
   variance-explained measures get 90%. ANCHORS are the published defaults on
   apa.html, each reproduced independently in R 4.5.2 by inverting
   pt / pf / pchisq(ncp=) with uniroot; all agreed to 4 dp, and coverage
   simulations at 5,000 reps returned .949 / .900 / .902 against nominal
   .95 / .90 / .90 (P39 run 21). */
head('effect-size confidence intervals');

// ROUND-TRIP: each limit, fed back through its own CDF, hits its tail area.
{
  const dci = V.nctCI(2.35, 58);
  eq('nctCI lower limit → P(T ≤ t) = .975', V.nctCdf(2.35, 58, dci[0]), 0.975, 1e-7, 'round-trip');
  eq('nctCI upper limit → P(T ≤ t) = .025', V.nctCdf(2.35, 58, dci[1]), 0.025, 1e-7, 'round-trip');

  const lam = V.ncpCI((l) => V.ncfCdf(5.40, 2, 87, l), 0.90);
  eq('ncpCI(F) lower limit → P(F ≤ f) = .95', V.ncfCdf(5.40, 2, 87, lam[0]), 0.95, 1e-7, 'round-trip');
  eq('ncpCI(F) upper limit → P(F ≤ f) = .05', V.ncfCdf(5.40, 2, 87, lam[1]), 0.05, 1e-7, 'round-trip');

  const lx = V.ncpCI((l) => V.ncx2Cdf(8.14, 2, l), 0.90);
  eq('ncpCI(χ²) lower limit → P(X ≤ x) = .95', V.ncx2Cdf(8.14, 2, lx[0]), 0.95, 1e-7, 'round-trip');
  eq('ncpCI(χ²) upper limit → P(X ≤ x) = .05', V.ncx2Cdf(8.14, 2, lx[1]), 0.05, 1e-7, 'round-trip');
}

// IDENTITY: δ is SIGNED, so a t that fails its own test must return a NEGATIVE
// lower limit, not one clamped at zero. (The first draft of nctCI clamped it,
// which an R cross-check caught: p = .058 was reporting d ≥ 0.00 when the honest
// answer is d ≥ −0.02.) The limit passes through exactly 0 at the critical t.
is('nctCI lower limit < 0 when p > .05 (t = 1.20, df = 40)', V.nctCI(1.20, 40)[0] < 0, true, 'signed δ');
eq('nctCI lower limit (t = 1.20, df = 40)', V.nctCI(1.20, 40)[0], -0.7848, 5e-5, 'R 4.5.2 pt(ncp=) inversion');
is('nctCI lower limit > 0 when p < .05 (t = 2.35, df = 58)', V.nctCI(2.35, 58)[0] > 0, true, 'signed δ');
eq('nctCI lower limit = 0 at exactly the critical t', V.nctCI(V.tInv(0.025, 58), 58)[0], 0, 1e-6, 'test-inversion identity');
// and it must flip cleanly with the sign of t
eq('nctCI(−t) = −nctCI(t) reversed, lower', V.nctCI(-2.35, 58)[0], -V.nctCI(2.35, 58)[1], 1e-9, 'symmetry');
eq('nctCI(−t) = −nctCI(t) reversed, upper', V.nctCI(-2.35, 58)[1], -V.nctCI(2.35, 58)[0], 1e-9, 'symmetry');
// This is the whole reason η²/R²/V take a 90% interval: at 90% the lower limit
// leaves 0 exactly when the (one-tailed) F or χ² test reaches p = .05.
{
  const fCrit = V.fInv(0.05, 2, 87);
  eq('F at exactly p = .05 → 90% η² lower limit = 0', V.varExpCI(fCrit * 0.9999, 2, 87, 0.90)[0], 0, 0, 'one-tailed identity');
  is('F just above the .05 critical → 90% η² lower limit > 0', V.varExpCI(fCrit * 1.0001, 2, 87, 0.90)[0] > 0, true, 'one-tailed identity');
  // A 95% interval on the same F would still include 0 — the mismatch APA readers trip on.
  eq('same F → 95% η² lower limit still 0', V.varExpCI(fCrit * 1.0001, 2, 87, 0.95)[0], 0, 0, 'one-tailed identity');
}
// rCI is the closed-form Fisher interval and must reproduce it exactly.
{
  const z = Math.atanh(0.42), s = 1 / Math.sqrt(60 - 3), zc = V.normInv(0.975);
  eq('rCI = tanh(atanh r ± z*·SE), lower', V.rCI(0.42, 60)[0], Math.tanh(z - zc * s), 1e-12, 'Fisher r-to-z');
  eq('rCI = tanh(atanh r ± z*·SE), upper', V.rCI(0.42, 60)[1], Math.tanh(z + zc * s), 1e-12, 'Fisher r-to-z');
}
eq('rCI(.5, 30) lower = correlation.html anchor', V.rCI(0.5, 30)[0], 0.1704, 5e-5, 'R 4.5.2 tanh/atanh');
eq('rCI(.5, 30) upper = correlation.html anchor', V.rCI(0.5, 30)[1], 0.7290, 5e-5, 'R 4.5.2 tanh/atanh');

// ANCHORS: apa.html's four defaults, reproduced in R 4.5.2 (see the note above).
{
  const dci = V.nctCI(2.35, 58).map((x) => x * 0.62 / 2.35);
  eq('apa.html independent t → d CI lower', dci[0], 0.0882, 5e-5, 'R 4.5.2 pt(ncp=) inversion');
  eq('apa.html independent t → d CI upper', dci[1], 1.1467, 5e-5, 'R 4.5.2 pt(ncp=) inversion');

  const e1 = V.varExpCI(5.40, 2, 87, 0.90);
  eq('apa.html one-way ANOVA → 90% η² CI lower', e1[0], 0.0195, 5e-5, 'R 4.5.2 pf(ncp=) inversion');
  eq('apa.html one-way ANOVA → 90% η² CI upper', e1[1], 0.2071, 5e-5, 'R 4.5.2 pf(ncp=) inversion');

  const e2 = V.varExpCI(14.20, 3, 96, 0.90);
  eq('apa.html regression model → 90% R² CI lower', e2[0], 0.1686, 5e-5, 'R 4.5.2 pf(ncp=) inversion');
  eq('apa.html regression model → 90% R² CI upper', e2[1], 0.4018, 5e-5, 'R 4.5.2 pf(ncp=) inversion');

  const vv = V.vCI(8.14, 2, 120, 1, 0.90);
  eq('apa.html χ² → 90% Cramér’s V CI lower', vv[0], 0.0812, 5e-5, 'R 4.5.2 pchisq(ncp=) inversion');
  eq('apa.html χ² → 90% Cramér’s V CI upper', vv[1], 0.3976, 5e-5, 'R 4.5.2 pchisq(ncp=) inversion');
}

/* ============================================================
   7 — documented tool-page constants
   ============================================================ */
head('tool-page constants');

// effect-sizes.html, d = 0.5 (formulas transcribed from its update()).
const d = 0.5;
eq('d = .5 → r', d / Math.sqrt(d * d + 4), 0.2425, 5e-5, 'effect-sizes.html, CLAUDE.md');
eq('d = .5 → overlap (OVL)', 2 * V.normCdf(-Math.abs(d) / 2), 0.8026, 5e-5, 'effect-sizes.html, CLAUDE.md');
eq('d = .5 → U₃', V.normCdf(d), 0.6915, 5e-5, 'effect-sizes.html, CLAUDE.md');
eq('d = .5 → CLES', V.normCdf(d / Math.SQRT2), 0.6382, 5e-5, 'effect-sizes.html');
eq('d = .5 → η²', (d / Math.sqrt(d * d + 4)) ** 2, 0.0588, 5e-5, 'effect-sizes.html');

// correlation.html's Fisher-z CI: r = .5, n = 30 → [.17, .73].
const zr = Math.atanh(0.5), se = 1 / Math.sqrt(30 - 3), zc = V.normInv(0.975);
eq('Fisher-z CI lower (r = .5, n = 30)', Math.tanh(zr - zc * se), 0.17, 5e-3, 'correlation.html, CLAUDE.md');
eq('Fisher-z CI upper (r = .5, n = 30)', Math.tanh(zr + zc * se), 0.73, 5e-3, 'correlation.html, CLAUDE.md');

// tables.html's headline criticals, as a student reading the page would see them.
eq('z critical, two-tailed α = .05', V.normInv(0.975), 1.96, 5e-3, 'tables.html');
eq('t critical, two-tailed α = .05, df = 20', V.tInv(0.025, 20), 2.086, 5e-4, 'tables.html');

/* ============================================================
   8 — the dice lab (distributions.html)

   The dice lab computes EXACT outcome counts rather than simulating,
   so every bar it draws is checkable against a published number. Like
   section 7 these formulas are transcribed from the page (it computes
   against the DOM and cannot be imported) and must be kept in step by
   hand if the page's math changes. Counts are integers throughout: the
   largest total the page can reach is 20^6 = 64,000,000, far inside the
   2^53 range where doubles are exact, so these assertions are equalities
   with a tolerance only for the derived means.
   ============================================================ */
head('dice lab (exact counts)');

function diceCounts(mode, n, s) {                 // transcribed from distributions.html
  let counts = [], k, j, f, i;
  if (mode === 'sich') {
    const bag = {}, A = [1, 2, 2, 3, 3, 4], B = [1, 3, 4, 5, 6, 8];
    for (i = 0; i < 6; i++) for (j = 0; j < 6; j++) bag[A[i] + B[j]] = (bag[A[i] + B[j]] || 0) + 1;
    for (k = 2; k <= 12; k++) counts.push(bag[k] || 0);
    return { lo: 2, counts, total: 36 };
  }
  if (mode === 'diff') {
    for (k = -(s - 1); k <= s - 1; k++) counts.push(s - Math.abs(k));
    return { lo: -(s - 1), counts, total: s * s };
  }
  const total = Math.pow(s, n);
  if (mode === 'sum') {
    counts = [1];
    for (i = 0; i < n; i++) {
      const next = new Array(counts.length + s - 1).fill(0);
      for (j = 0; j < counts.length; j++) for (f = 0; f < s; f++) next[j + f] += counts[j];
      counts = next;
    }
    return { lo: n, counts, total };
  }
  for (k = 1; k <= s; k++) {
    counts.push(mode === 'max' ? Math.pow(k, n) - Math.pow(k - 1, n)
                               : Math.pow(s - k + 1, n) - Math.pow(s - k, n));
  }
  return { lo: 1, counts, total };
}
function diceMoments(d) {
  let m = 0, v = 0;
  for (let i = 0; i < d.counts.length; i++) m += (d.lo + i) * d.counts[i] / d.total;
  for (let i = 0; i < d.counts.length; i++) { const x = d.lo + i - m; v += x * x * d.counts[i] / d.total; }
  return { mean: m, sd: Math.sqrt(v) };
}

// Two dice: the triangular distribution, 1..6..1 out of 36.
const two = diceCounts('sum', 2, 6);
eq('2d6 outcome range starts at 2', two.lo, 2, 0, 'elementary');
[1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1].forEach((want, i) => {
  eq(`2d6 ways to roll ${i + 2}`, two.counts[i], want, 0, 'the 6×6 sample space');
});
eq('2d6 P(7)', two.counts[5] / two.total, 1 / 6, 1e-12, "quiz.html's own dice question");

// Three dice: the site prints 27/216 for both modes.
const three = diceCounts('sum', 3, 6);
eq('3d6 ways to roll 10', three.counts[10 - 3], 27, 0, 'standard 3d6 table');
eq('3d6 ways to roll 11', three.counts[11 - 3], 27, 0, 'standard 3d6 table');
eq('3d6 ways to roll 3', three.counts[0], 1, 0, 'standard 3d6 table');
eq('3d6 P(10)', three.counts[10 - 3] / three.total, 0.125, 1e-12, 'standard 3d6 table');

// Closed forms for a sum of n independent uniform dice, over the page's whole grid.
for (const s of [4, 6, 8, 10, 12, 20]) {
  for (let n = 1; n <= 6; n++) {
    const d8 = diceCounts('sum', n, s), mo = diceMoments(d8);
    const tot = d8.counts.reduce((a, b) => a + b, 0);
    eq(`sum ${n}d${s}: counts add to s^n`, tot, Math.pow(s, n), 0, 'probabilities must sum to 1');
    eq(`sum ${n}d${s}: mean = n(s+1)/2`, mo.mean, n * (s + 1) / 2, 1e-9, 'closed form for a sum of uniforms');
    eq(`sum ${n}d${s}: SD = √(n(s²−1)/12)`, mo.sd, Math.sqrt(n * (s * s - 1) / 12), 1e-9, 'closed form for a sum of uniforms');
  }
}

// The difference of two dice: triangular again, centered on zero.
const dif = diceCounts('diff', 2, 6), dm = diceMoments(dif);
eq('difference of 2d6: P(0)', dif.counts[5] / dif.total, 6 / 36, 1e-12, 'the 6×6 sample space');
eq('difference of 2d6: P(−5)', dif.counts[0] / dif.total, 1 / 36, 1e-12, 'the 6×6 sample space');
eq('difference of 2d6: mean 0', dm.mean, 0, 1e-12, 'symmetry');
eq('difference of 2d6: SD = √(35/6)', dm.sd, Math.sqrt(35 / 6), 1e-9, 'Var(X−Y) = 2 × 35/12');

// Order statistics: highest and lowest of n dice.
const mx = diceCounts('max', 2, 6);
[1, 3, 5, 7, 9, 11].forEach((want, i) => {
  eq(`highest of 2d6, ways to get ${i + 1}`, mx.counts[i], want, 0, 'k² − (k−1)² over 36');
});
eq('highest of 2d6: mean = 161/36', diceMoments(mx).mean, 161 / 36, 1e-12, 'order statistic of two uniforms');
eq('highest of 2d20: mean 13.825', diceMoments(diceCounts('max', 2, 20)).mean, 13.825, 5e-4, 'the published advantage average');
eq('lowest of 2d20: mean 7.175', diceMoments(diceCounts('min', 2, 20)).mean, 7.175, 5e-4, 'the published disadvantage average');
for (const s of [4, 6, 8, 10, 12, 20]) {
  for (let n = 1; n <= 6; n++) {
    const hi = diceMoments(diceCounts('max', n, s)).mean, lo = diceMoments(diceCounts('min', n, s)).mean;
    eq(`highest/lowest ${n}d${s} mirror: E[max] + E[min] = s + 1`, hi + lo, s + 1, 1e-9, 'reflection k → s+1−k');
    eq(`highest ${n}d${s}: counts add to s^n`, diceCounts('max', n, s).counts.reduce((a, b) => a + b, 0), Math.pow(s, n), 0, 'probabilities must sum to 1');
  }
}

// Sicherman dice: different faces, identical sum distribution.
const sich = diceCounts('sich', 2, 6);
for (let i = 0; i < 11; i++) {
  eq(`Sicherman dice match 2d6 at total ${i + 2}`, sich.counts[i], two.counts[i], 0, 'Gardner, Scientific American (1978)');
}
eq('Sicherman dice: 36 equally likely rolls', sich.total, 36, 0, 'six faces each');

/* ------------------------------------------------------------
   The block above proves the MATHEMATICS. This proves the PAGE still
   computes it. distributions.html's dice script is loaded into its own vm
   context under a DOM shim, its controls are driven the way a reader drives
   them, and the readouts it prints are compared against the counts above.
   Without this, section 8 would only be checking a copy: an edit to the
   page's math could ship while the transcription stayed green.
   ------------------------------------------------------------ */
head('dice lab (the shipped page)');

function driveDiceLab() {
  const html = fs.readFileSync(path.join(ROOT, 'distributions.html'), 'utf8');
  const src = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map(m => m[1]).filter(s => /dice-canvas/.test(s))[0];
  if (!src) throw new Error('no inline script mentioning #dice-canvas');

  const els = {};
  const ctx2d = {};
  ['clearRect', 'fillRect', 'beginPath', 'moveTo', 'lineTo', 'arcTo', 'arc', 'closePath',
   'fill', 'stroke', 'setLineDash', 'fillText', 'setTransform'].forEach(n => { ctx2d[n] = () => {}; });
  ctx2d.measureText = t => ({ width: t.length * 6 });
  const mk = () => {
    const on = {};
    return { innerHTML: '', textContent: '', value: '2', checked: false, style: {},
      clientWidth: 720, parentElement: { clientWidth: 720 }, getContext: () => ctx2d,
      addEventListener: (t, f) => { (on[t] = on[t] || []).push(f); },
      fire: (t, e) => (on[t] || []).forEach(f => f(e)) };
  };
  const c2 = { console };
  c2.window = c2;
  c2.document = { documentElement: {}, getElementById: id => els[id] || (els[id] = mk()) };
  c2.getComputedStyle = () => ({ getPropertyValue: () => '#000000' });
  c2.MutationObserver = function () { this.observe = () => {}; };
  c2.requestAnimationFrame = cb => cb();
  c2.addEventListener = () => {};
  vm.createContext(c2);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/viz.js'), 'utf8'), c2, { filename: 'viz.js' });
  vm.runInContext(src, c2, { filename: 'distributions.html#dice-lab' });
  if (!els['dice-stats'] || !els['dice-stats'].innerHTML) throw new Error('the readout row stayed empty');

  const seg = (id, attr, val) =>
    els[id].fire('click', { target: { closest: () => ({ getAttribute: () => String(val) }) } });
  return function read(mode, n, s) {
    seg('seg-mode', 'data-m', mode);
    if (s) seg('seg-sides', 'data-s', s);
    if (n) { els['d-n'].value = String(n); els['d-n'].fire('input', {}); }
    const vals = [...els['dice-stats'].innerHTML.matchAll(/class="v"[^>]*>([^<]*)</g)].map(m => m[1]);
    if (vals.length !== 5) throw new Error('expected 5 readouts, found ' + vals.length);
    return { top: vals[0], chance: vals[1], mean: parseFloat(vals[2]), sd: parseFloat(vals[3]),
             total: Number(vals[4].replace(/,/g, '')) };
  };
}

try {
  const read = driveDiceLab();
  const cases = [
    ['sum', 2, 6, '7', '6/36 (16.7%)'],
    ['sum', 3, 6, '10 or 11', '27/216 (12.5%)'],
    ['sum', 5, 6, '17 or 18', null],
    ['sum', 1, 6, 'all equal', '1/6 (16.7%)'],
    ['diff', null, 6, '0', '6/36 (16.7%)'],
    ['max', 2, 20, '20', '39/400 (9.8%)'],
    ['min', 2, 20, '1', '39/400 (9.8%)'],
    ['sich', null, null, '7', '6/36 (16.7%)']
  ];
  for (const [mode, n, s, top, chance] of cases) {
    const got = read(mode, n, s);
    const want = diceMoments(diceCounts(mode, n || 2, s || 6));
    const tag = `${mode} ${n || 2}d${s || 6}`;
    // the page prints 2 dp, so half a printed unit is the tolerance (plus float slack:
    // E[max of 2d20] is exactly 13.825 and toFixed lands on 13.82)
    eq(`page ${tag}: mean matches the exact counts`, got.mean, want.mean, 5.1e-3, 'section 8 above');
    eq(`page ${tag}: SD matches the exact counts`, got.sd, want.sd, 5.1e-3, 'section 8 above');
    eq(`page ${tag}: rolls counted`, got.total, diceCounts(mode, n || 2, s || 6).total, 0, 'section 8 above');
    if (got.top !== top) failures.push({ section, label: `page ${tag}: most likely outcome`, got: got.top, want: top, tol: 0, err: NaN, src: 'section 8 above' });
    else passed++;
    if (chance !== null) {
      if (got.chance !== chance) failures.push({ section, label: `page ${tag}: printed probability`, got: got.chance, want: chance, tol: 0, err: NaN, src: 'section 8 above' });
      else passed++;
    }
  }
} catch (e) {
  failures.push({ section, label: 'the dice lab could not be driven — ids or structure changed?',
    got: String(e.message), want: 'a runnable #dice-canvas script printing 5 readouts', tol: 0, err: NaN,
    src: 'distributions.html' });
}


/* ============================================================
   9 — the printed tables (tables.html)

   P80 put Table A, Table D and Table F on tables.html: the row-and-column
   lookup a paper exam still asks for, generated at runtime from the same
   viz.js functions the calculator uses. Every published table value is a
   claim, so this section drives the SHIPPED page under a DOM shim the way
   section 8 drives the dice lab, reads the <tbody> markup it generates, and
   compares every cell against viz.js.

   Table A's rows deserve a note: they run −3.4 up to −0.0 and then 0.0 up to
   3.4, 70 rows rather than 69, because on a negative row the column digit
   adds magnitude. Without the −0.0 row there is no cell for z = −0.09.
   ============================================================ */
head('printed tables (the shipped page)');

function drivePrintedTables() {
  const html = fs.readFileSync(path.join(ROOT, 'tables.html'), 'utf8');
  const src = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map(m => m[1]).filter(s => /tb-a-body/.test(s))[0];
  if (!src) throw new Error('no inline script mentioning tb-a-body');

  const els = {};
  const mk = () => {
    const on = {};
    const node = {
      innerHTML: '', textContent: '', value: '', hidden: false, tabIndex: -1, style: {},
      classList: { add: () => {}, remove: () => {}, toggle: () => {} },
      getAttribute: () => null, focus: () => {},
      addEventListener: (t, f) => { (on[t] = on[t] || []).push(f); },
      insertAdjacentHTML: (pos, h) => { node.innerHTML += h; },
      fire: (t, e) => (on[t] || []).forEach(f => f(e))
    };
    return node;
  };
  const c3 = { console };
  c3.window = c3;
  c3.document = { documentElement: {}, getElementById: id => els[id] || (els[id] = mk()) };
  c3.getComputedStyle = () => ({ getPropertyValue: () => '#000000' });
  c3.MutationObserver = function () { this.observe = () => {}; };
  c3.requestAnimationFrame = cb => cb();      // chunked build completes in one pass
  c3.addEventListener = () => {};
  c3.Event = function () {};
  vm.createContext(c3);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/viz.js'), 'utf8'), c3, { filename: 'viz.js' });
  vm.runInContext(src, c3, { filename: 'tables.html#printed-tables' });

  // the page boots showing Table A; the other two build when their tab is clicked
  const tab = key => els['seg-table'].fire('click', { target: { closest: () => ({ getAttribute: () => key }) } });
  tab('d'); tab('f');

  const grid = key => {
    const body = els['tb-' + key + '-body'];
    if (!body || !body.innerHTML) throw new Error('Table ' + key.toUpperCase() + ' body stayed empty');
    return [...body.innerHTML.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m => ({
      label: (/<th[^>]*>([^<]*)<\/th>/.exec(m[1]) || [, ''])[1],
      cells: [...m[1].matchAll(/<td[^>]*>([^<]*)<\/td>/g)].map(c => c[1])
    }));
  };
  const heads = key => [...(els['tb-' + key + '-head'].innerHTML)
    .matchAll(/<th[^>]*>([^<]*)<\/th>/g)].map(m => m[1]);
  const foot = key => [...(els['tb-' + key + '-foot'].innerHTML)
    .matchAll(/<th[^>]*>([^<]*)<\/th>/g)].map(m => m[1]);
  return { grid, heads, foot };
}

try {
  const page = drivePrintedTables();
  const MINUS = '−';
  const noZero = s => s.replace(/^0\./, '.');
  const crit4 = x => x < 10 ? x.toFixed(3) : x < 100 ? x.toFixed(2) : x.toFixed(1);
  const PCOL = [0.25, 0.2, 0.15, 0.1, 0.05, 0.025, 0.02, 0.01, 0.005, 0.0025, 0.001, 0.0005];
  const DF_T = [...Array(30).keys()].map(i => i + 1).concat([40, 50, 60, 80, 100, 1000, Infinity]);
  const DF_X = [...Array(30).keys()].map(i => i + 1).concat([40, 50, 60, 80, 100]);

  /* ---- shape: the row and column sets the prompt specifies ---- */
  const A = page.grid('a'), D = page.grid('d'), F = page.grid('f');
  is('Table A row count (−3.4…−0.0 then 0.0…3.4)', A.length, 70, 'P80 spec');
  is('Table A column count (.00….09)', A[0].cells.length, 10, 'P80 spec');
  is('Table D row count (1–30, 40, 50, 60, 80, 100, 1000, ∞)', D.length, 37, 'P80 spec');
  is('Table D column count', D[0].cells.length, 12, 'P80 spec');
  is('Table F row count (1–30, 40, 50, 60, 80, 100)', F.length, 35, 'P80 spec');
  is('Table F column count', F[0].cells.length, 12, 'P80 spec');
  is('Table A row 0 is −3.4', A[0].label, MINUS + '3.4', 'P80 spec');
  is('Table A carries the −0.0 row', A[34].label, MINUS + '0.0', 'P80 spec');
  is('Table A row 35 is 0.0', A[35].label, '0.0', 'P80 spec');
  is('Table D last row is ∞', D[36].label, '∞', 'P80 spec');
  is('Table D foot puts 95% under the .025 column', page.foot('d')[6], '95%', 'Moore Table D');
  is('Table D head column 6 is .025', page.heads('d')[6], '.025', 'Moore Table D');
  is('Table F head column 5 is .05', page.heads('f')[5], '.05', 'Moore Table F');

  /* ---- every cell of every table, recomputed from viz.js ---- */
  let bad = 0, first = '';
  const flag = (what, got, want) => { if (got !== want) { bad++; if (!first) first = `${what}: page "${got}", viz.js "${want}"`; } };
  A.forEach((row, r) => row.cells.forEach((got, c) => {
    const neg = r <= 34, tenth = neg ? 34 - r : r - 35;
    const z = (neg ? -1 : 1) * (tenth / 10 + c / 100);
    flag(`A[${row.label}][.0${c}]`, got, noZero(V.normCdf(z).toFixed(4)));
  }));
  D.forEach((row, r) => row.cells.forEach((got, c) => {
    const df = DF_T[r], p = PCOL[c];
    flag(`D[${row.label}][${p}]`, got, crit4(df === Infinity ? V.normInv(1 - p) : V.tInv(p, df)));
  }));
  F.forEach((row, r) => row.cells.forEach((got, c) => {
    flag(`F[${row.label}][${PCOL[c]}]`, got, V.chiSqInv(PCOL[c], DF_X[r]).toFixed(2));
  }));
  is(`all ${A.length * 10 + (D.length + F.length) * 12} table cells match viz.js${first ? ' (first miss: ' + first + ')' : ''}`, bad, 0, 'viz.js');

  /* ---- the published anchors, cell by cell, against PRINTED table values ----
     These are the numbers P80 named and the ones a student reads off paper. */
  const cellA = z => {
    const n = Math.round(z * 100), a = Math.abs(n), tenth = Math.floor(a / 10);
    return A[n < 0 ? 34 - tenth : 35 + tenth].cells[a % 10];
  };
  const cellD = (df, p) => D[DF_T.indexOf(df)].cells[PCOL.indexOf(p)];
  const cellF = (df, p) => F[DF_X.indexOf(df)].cells[PCOL.indexOf(p)];
  const printed = [
    ['Table A: P(Z < −2.40)', cellA(-2.40), '.0082'],
    ['Table A: P(Z < −2.41)', cellA(-2.41), '.0080'],
    ['Table A: P(Z < 1.00)', cellA(1.00), '.8413'],
    ['Table A: P(Z < −2.33)', cellA(-2.33), '.0099'],
    ['Table A: P(Z < 0.00)', cellA(0), '.5000'],
    ['Table A: P(Z < 1.96)', cellA(1.96), '.9750'],
    ['Table A: P(Z < −0.09) off the −0.0 row', cellA(-0.09), '.4641'],
    ['Table D: z* for 95% (df = ∞)', cellD(Infinity, 0.025), '1.960'],
    ['Table D: t* at df 5, 95%', cellD(5, 0.025), '2.571'],
    ['Table D: t* at df 10, one-tail .05', cellD(10, 0.05), '1.812'],
    ['Table D: t* at df 30, 95%', cellD(30, 0.025), '2.042'],
    ['Table D: t* at df 1, one-tail .0005', cellD(1, 0.0005), '636.6'],
    ['Table D: t* at df 100, one-tail .005', cellD(100, 0.005), '2.626'],
    ['Table F: χ² at df 6, α .05', cellF(6, 0.05), '12.59'],
    ['Table F: χ² at df 1, α .05', cellF(1, 0.05), '3.84'],
    ['Table F: χ² at df 1, α .001', cellF(1, 0.001), '10.83'],
    ['Table F: χ² at df 10, α .01', cellF(10, 0.01), '23.21'],
    ['Table F: χ² at df 30, α .05', cellF(30, 0.05), '43.77'],
    ['Table F: χ² at df 100, α .05', cellF(100, 0.05), '124.34']
  ];
  for (const [label, got, want] of printed) is(label, got, want, 'Moore, McCabe & Craig Tables A/D/F');
} catch (e) {
  failures.push({ section, label: 'the printed tables could not be driven — ids or structure changed?',
    got: String(e.message), want: 'a runnable tb-a-body script generating three tables', tol: 0, err: NaN,
    src: 'tables.html' });
}

/* ============================================================
   10 — the three quartile conventions (descriptives.html)

   P79 gave descriptives.html a Quartiles switch, because a paper exam and a
   statistics package disagree about what Q1 even is and a student who checks
   their hand work against this page used to conclude they had got it wrong.
   Three conventions:

     Textbook  the median of each half of the sorted data, with the overall
               median left out of both halves when n is odd (Moore, McCabe &
               Craig, and every hand method an intro exam marks)
     SPSS      the weighted average at (n + 1)p, what Frequencies prints
     R/Python  linear interpolation at 1 + (n - 1)p (R's type 7, NumPy,
               pandas, Excel's QUARTILE.INC) — this page's default, unchanged

   The section derives each convention independently here and then drives the
   SHIPPED page under a DOM shim, the way section 8 drives the dice lab and
   section 9 the printed tables: the transcription alone would only prove a
   copy of the arithmetic, not that the page still does it.

   The two datasets are the ones P79 published. The 18 contest totals give
   26.25/38.25, 26/39 and 26/40.75 — three answers to one question, which is
   the whole reason the switch exists. The 13 values are the odd-n case, where
   the textbook rule drops the median itself and lands somewhere type 7 never
   does.
   ============================================================ */
head('quartile conventions (the shipped page)');

const HOTDOG = [22, 22, 26, 26, 26, 27, 27, 28.5, 28.5, 29, 34, 34, 36, 39, 46, 47, 50, 71];
const THIRTEEN = [0.6, 1.2, 1.5, 1.6, 1.9, 2.1, 2.3, 2.5, 2.5, 2.8, 2.9, 3.3, 3.4];

const medOf = a => { const m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
const q7 = (s, p) => { const h = (s.length - 1) * p, lo = Math.floor(h);
  return s[lo] + (h - lo) * (s[Math.min(lo + 1, s.length - 1)] - s[lo]); };
const q6 = (s, p) => { const n = s.length, h = (n + 1) * p;
  if (h <= 1) return s[0];
  if (h >= n) return s[n - 1];
  const lo = Math.floor(h);
  return s[lo - 1] + (h - lo) * (s[lo] - s[lo - 1]); };
const qTb = (s, p) => { const n = s.length, half = n >> 1;
  const part = p < 0.5 ? s.slice(0, half) : s.slice(n % 2 ? half + 1 : half);
  return part.length ? medOf(part) : medOf(s); };

/* ---- the published pairs, straight from the three definitions ---- */
eq('18 totals, textbook Q1', qTb(HOTDOG, 0.25), 26, 0, 'P79: median of the lower nine');
eq('18 totals, textbook Q3', qTb(HOTDOG, 0.75), 39, 0, 'P79: median of the upper nine');
eq('18 totals, SPSS Q1', q6(HOTDOG, 0.25), 26, 0, 'weighted average at (n+1)p');
eq('18 totals, SPSS Q3', q6(HOTDOG, 0.75), 40.75, 1e-12, 'weighted average at (n+1)p');
eq('18 totals, R/Python Q1', q7(HOTDOG, 0.25), 26.25, 1e-12, 'R type 7');
eq('18 totals, R/Python Q3', q7(HOTDOG, 0.75), 38.25, 1e-12, 'R type 7');
eq('18 totals, median agrees across conventions', medOf(HOTDOG), 28.75, 0, 'the middle pair, 28.5 and 29');
eq('18 totals, textbook IQR', qTb(HOTDOG, 0.75) - qTb(HOTDOG, 0.25), 13, 0, 'P79');
eq('18 totals, textbook lower fence', qTb(HOTDOG, 0.25) - 1.5 * 13, 6.5, 0, 'Q1 − 1.5 × IQR');
eq('18 totals, textbook upper fence', qTb(HOTDOG, 0.75) + 1.5 * 13, 58.5, 0, 'Q3 + 1.5 × IQR');
is('18 totals, exactly one value past a textbook fence',
   HOTDOG.filter(v => v < 6.5 || v > 58.5).length, 1, 'the 71');
eq('13 values (odd n), textbook Q1', qTb(THIRTEEN, 0.25), 1.55, 1e-12, 'P79: median of the lower six');
eq('13 values (odd n), textbook Q3', qTb(THIRTEEN, 0.75), 2.85, 1e-12, 'P79: median of the upper six');
eq('13 values (odd n), R/Python Q1', q7(THIRTEEN, 0.25), 1.6, 1e-12, 'R type 7');
eq('13 values (odd n), R/Python Q3', q7(THIRTEEN, 0.75), 2.8, 1e-12, 'R type 7');

/* ---- and now the page itself ---- */
function driveDescriptives() {
  const html = fs.readFileSync(path.join(ROOT, 'descriptives.html'), 'utf8');
  const src = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map(m => m[1]).filter(s => /dc-quart/.test(s))[0];
  if (!src) throw new Error('no inline script mentioning dc-quart');

  const ctx2d = {};
  ['clearRect', 'fillRect', 'strokeRect', 'beginPath', 'moveTo', 'lineTo', 'arc', 'closePath',
   'fill', 'stroke', 'setLineDash', 'fillText', 'setTransform', 'save', 'restore'].forEach(n => { ctx2d[n] = () => {}; });
  ctx2d.measureText = t => ({ width: t.length * 6 });

  const els = {};
  const mk = () => {
    const on = {};
    const node = {
      innerHTML: '', textContent: '', value: '', style: {}, dataset: {},
      clientWidth: 720, parentElement: { clientWidth: 720 }, getContext: () => ctx2d,
      classList: { add: () => {}, remove: () => {}, toggle: () => {} },
      addEventListener: (t, f) => { (on[t] = on[t] || []).push(f); },
      // bound to the node, because the page's own handlers use `this`
      fire: (t, e) => (on[t] || []).forEach(f => f.call(node, e))
    };
    return node;
  };

  /* The Quartiles seg is built from the page's OWN markup, not from a list
     written here: which button carries class="active" in the HTML is the
     page's default, and a default switched quietly is exactly the change this
     section has to catch. The buttons really track the class, so the page's
     own convention() lookup is what gets tested. */
  const segHtml = /<div class="seg" id="dc-quart">([\s\S]*?)<\/div>/.exec(html);
  if (!segHtml) throw new Error('no #dc-quart seg markup');
  const btns = [...segHtml[1].matchAll(/<button([^>]*)>/g)].map(m => ({
    dataset: { q: (/data-q="([^"]*)"/.exec(m[1]) || [, ''])[1] },
    active: /class="[^"]*\bactive\b/.test(m[1]),
    closest: function () { return this; },
    classList: { toggle: function () {} }
  }));
  if (btns.length !== 3) throw new Error('expected 3 quartile buttons, found ' + btns.length);
  btns.forEach(b => { b.classList.toggle = (cls, on) => { if (cls === 'active') b.active = on; }; });
  const seg = mk();
  seg.querySelectorAll = () => btns;

  const c4 = { console };
  c4.window = c4;
  c4.document = {
    documentElement: {},
    getElementById: id => (id === 'dc-quart' ? seg : (els[id] || (els[id] = mk()))),
    querySelector: sel => (sel === '#dc-quart button.active' ? btns.find(b => b.active) || null : null)
  };
  c4.getComputedStyle = () => ({ getPropertyValue: () => '#000000' });
  c4.MutationObserver = function () { this.observe = () => {}; };
  c4.requestAnimationFrame = cb => cb();
  c4.addEventListener = () => {};
  vm.createContext(c4);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/viz.js'), 'utf8'), c4, { filename: 'viz.js' });
  vm.runInContext(src, c4, { filename: 'descriptives.html#calculator' });

  /* `which` is optional: passing nothing reads the page at its BOOT default,
     which is the only way to catch a default silently switched in the markup.
     Clicks are sticky, so the default read has to happen first. */
  return function read(values, which) {
    if (which) seg.fire('click', { target: btns.find(b => b.dataset.q === which) });
    els['dc-input'].value = values.join(' ');
    els['dc-input'].fire('input', {});
    els['dc-go'].fire('click', {});
    return {
      n: els['s-n'].textContent, mean: els['s-mean'].textContent, sd: els['s-sd'].textContent,
      med: els['s-med'].textContent, iqr: els['s-iqr'].textContent, out: els['s-out'].textContent
    };
  };
}

try {
  const read = driveDescriptives();
  const fmt = v => {           // the page's own significant-digit formatter
    const a = Math.abs(v);
    return v.toFixed(a >= 1000 ? 0 : a >= 100 ? 1 : a >= 1 ? 2 : 3);
  };
  // FIRST, before any tab is clicked: the default must not have moved. R/Python
  // is what every existing link, every worked number on the site and every
  // picture is drawn with, and P79's rule is never to switch a default quietly.
  const boot = read(HOTDOG);
  is('page boots on R/Python', boot.iqr, '26.25 – 38.25', 'P79 rule: never silently switch a default');
  is('page mean of the 18 totals', boot.mean, '34.39', 'Σx / n = 619 / 18');
  is('page SD of the 18 totals', boot.sd, '12.43', 'SS 2627.78, s² 154.58');

  const cases = [
    ['18 contest totals', HOTDOG, { textbook: [26, 39], spss: [26, 40.75], r: [26.25, 38.25] }],
    ['13 values (odd n)', THIRTEEN, { textbook: [1.55, 2.85], spss: [1.55, 2.85], r: [1.6, 2.8] }]
  ];
  for (const [tag, values, want] of cases) {
    for (const which of ['textbook', 'spss', 'r']) {
      const got = read(values, which);
      is(`page ${tag}, ${which}: Q1 – Q3`, got.iqr, fmt(want[which][0]) + ' – ' + fmt(want[which][1]),
         'the three definitions above');
      is(`page ${tag}, ${which}: n`, String(got.n), String(values.length), 'the pasted values');
    }
  }
  is('page median is the same under every convention', read(HOTDOG, 'textbook').med, boot.med, 'all three agree on the median');
  is('page flags the 71 as an outlier under the textbook rule', read(HOTDOG, 'textbook').out, '71.00', 'fences 6.5 and 58.5');
} catch (e) {
  failures.push({ section, label: 'the descriptives calculator could not be driven — ids or structure changed?',
    got: String(e.message), want: 'a runnable dc-quart script printing the stat row', tol: 0, err: NaN,
    src: 'descriptives.html' });
}


/* ============================================================
   11 — Build a Table (stats-1/chi-square-tests)

   P84 grew §1.16's 2×2 explorer into an r × c builder. Every cell prints its
   observed count, its expected count and its (O − E)²/E component; the block
   then prints the sum, the df, the exact p and the bracket a printed Table F
   gives. All of those are published claims, so this section derives them here
   from the counts alone and then drives the SHIPPED page under the same DOM
   shim sections 8, 9 and 10 use. Deriving them without driving the page would
   only prove a copy of the arithmetic.

   The page is driven through its OWN ?t= applier: the shim hands it a fake
   window.SC, captures the map the page registers with SC.preset, and calls the
   applier. So the widget is loaded the way a reader's URL loads it, and the
   page carries no test-only hook.

   Two anchors. The 2×2 default is the treatment trial the lesson's prose walks
   through cell by cell (χ² = 12.38, df 1). The 3 × 4 table is the commuting
   example the prose loads with ?t=, chosen so its p falls inside Table F
   rather than off the end of it: χ² = 18.77 on df 6 sits between the .005
   column (18.548) and the .0025 column (20.249), which is the bracket reading
   an exam wants and the one the readout has to reproduce.
   ============================================================ */
head('Build a Table (the shipped page)');

/* Expected counts, components and the statistic, from the counts alone. */
function chiTable(T) {
  const R = T.length, C = T[0].length;
  const rt = T.map(r => r.reduce((a, b) => a + b, 0));
  const ct = T[0].map((_, j) => T.reduce((a, r) => a + r[j], 0));
  const N = rt.reduce((a, b) => a + b, 0);
  const E = [], K = [];
  let chi = 0;
  for (let i = 0; i < R; i++) {
    E[i] = []; K[i] = [];
    for (let j = 0; j < C; j++) {
      const e = rt[i] * ct[j] / N;
      const k = (T[i][j] - e) * (T[i][j] - e) / e;
      E[i][j] = e; K[i][j] = k; chi += k;
    }
  }
  const df = (R - 1) * (C - 1);
  return { rt, ct, N, E, K, chi, df, p: V.chiSqUpper(chi, df) };
}

/* Table F's twelve upper-tail columns, in the order tables.html prints them. */
const CHI_P = [0.25, 0.2, 0.15, 0.1, 0.05, 0.025, 0.02, 0.01, 0.005, 0.0025, 0.001, 0.0005];
const CHI_L = ['.25', '.20', '.15', '.10', '.05', '.025', '.02', '.01', '.005', '.0025', '.001', '.0005'];
function chiBracket(chi, df) {
  const crit = CHI_P.map(p => V.chiSqInv(p, df));
  if (chi < crit[0]) return 'above ' + CHI_L[0];
  for (let i = 0; i < crit.length - 1; i++) {
    if (chi >= crit[i] && chi < crit[i + 1]) return 'between ' + CHI_L[i] + ' and ' + CHI_L[i + 1];
  }
  return 'below ' + CHI_L[CHI_L.length - 1];
}

const TRIAL = [[45, 20], [25, 40]];
const COMMUTE = [[27, 18, 27, 18], [18, 20, 35, 27], [12, 16, 37, 45]];

/* ---- the arithmetic, independent of the page ---- */
const trial = chiTable(TRIAL);
eq('trial 2×2: expected count in the first cell', trial.E[0][0], 35, 1e-12, '65 × 70 / 130');
eq('trial 2×2: first component', trial.K[0][0], 100 / 35, 1e-12, '(45 − 35)² / 35');
eq('trial 2×2: χ²', trial.chi, 12.380952380952381, 1e-9, 'the four components, 2.857 + 3.333 twice');
is('trial 2×2: df', trial.df, 1, '(2 − 1)(2 − 1)');
rel('trial 2×2: p', trial.p, 4.337e-4, 2e-3, 'VIZ.chiSqUpper(12.381, 1)');

const comm = chiTable(COMMUTE);
eq('3 × 4 commute: χ²', comm.chi, 18.769479, 5e-6, 'P84, recomputed from the twelve counts');
is('3 × 4 commute: df', comm.df, 6, '(3 − 1)(4 − 1)');
eq('3 × 4 commute: exact p', comm.p, 0.004571, 5e-7, 'VIZ.chiSqUpper(18.7695, 6)');
eq('3 × 4 commute: N', comm.N, 300, 0, 'the twelve counts');
eq('3 × 4 commute: largest component is the centre walkers', comm.K[0][0], 5.7316, 5e-5, '(27 − 17.1)² / 17.1');
// the components must add to the statistic, which is what makes "work the
// cells, then add" a legitimate hand method rather than an approximation
eq('3 × 4 commute: components add to χ²',
   comm.K.reduce((a, r) => a + r.reduce((x, y) => x + y, 0), 0), comm.chi, 1e-12, 'definition of χ²');
// expected counts always reproduce the observed margins
for (let i = 0; i < 3; i++) {
  eq(`3 × 4 commute: expected row ${i + 1} sums to its observed total`,
     comm.E[i].reduce((a, b) => a + b, 0), comm.rt[i], 1e-9, 'Σⱼ rᵢcⱼ/N = rᵢ');
}
// the bracket the prose publishes, against the criticals Table F prints
eq('Table F df 6, .005 column', V.chiSqInv(0.005, 6), 18.5476, 5e-5, 'printed Table F');
eq('Table F df 6, .0025 column', V.chiSqInv(0.0025, 6), 20.2494, 5e-5, 'printed Table F');
is('3 × 4 commute: Table F reading', chiBracket(comm.chi, comm.df), 'between .005 and .0025',
   'P84: 18.55 < 18.77 < 20.25');

/* ---- and now the page itself ---- */
function driveBuildATable() {
  const html = fs.readFileSync(path.join(ROOT, 'stats-1/chi-square-tests/index.html'), 'utf8');
  const src = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map(m => m[1]).filter(s => /ct-table/.test(s))[0];
  if (!src) throw new Error('no inline script mentioning ct-table');

  const ctx2d = {};
  ['clearRect', 'fillRect', 'strokeRect', 'beginPath', 'moveTo', 'lineTo', 'arc', 'closePath',
   'fill', 'stroke', 'setLineDash', 'fillText', 'setTransform', 'save', 'restore'].forEach(n => { ctx2d[n] = () => {}; });
  ctx2d.measureText = t => ({ width: String(t).length * 6 });

  const els = {};
  const mk = () => {
    const on = {};
    const node = {
      innerHTML: '', textContent: '', value: '', style: {}, dataset: {},
      clientWidth: 720, parentElement: { clientWidth: 720 }, getContext: () => ctx2d,
      classList: { add: () => {}, remove: () => {}, toggle: () => {} },
      querySelectorAll: () => [],
      addEventListener: (t, f) => { (on[t] = on[t] || []).push(f); },
      fire: (t, e) => (on[t] || []).forEach(f => f.call(node, e))
    };
    return node;
  };

  let applier = null;
  const c5 = { console };
  c5.window = c5;
  c5.document = { documentElement: {}, getElementById: id => els[id] || (els[id] = mk()) };
  c5.getComputedStyle = () => ({ getPropertyValue: () => '#000000' });
  c5.MutationObserver = function () { this.observe = () => {}; };
  c5.requestAnimationFrame = cb => cb();
  c5.addEventListener = () => {};
  c5.location = { search: '?t=1' };
  // the page's own opt-in path: whatever it registers here is what a URL drives
  c5.SC = { preset: map => { applier = map && map.t; } };
  vm.createContext(c5);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/viz.js'), 'utf8'), c5, { filename: 'viz.js' });
  vm.runInContext(src, c5, { filename: 'stats-1/chi-square-tests#build-a-table' });
  if (typeof applier !== 'function') throw new Error('the page registered no ?t= applier with SC.preset');

  const readout = () => ({
    chi: els['stat-chi'].textContent, df: els['stat-df'].textContent,
    p: els['stat-p'].textContent, tab: els['stat-tab'].textContent,
    cond: els['stat-cond'].textContent, N: String(els['ct-n'].textContent),
    cell: (i, j) => ({ e: els['ct-e-' + i + '-' + j].textContent,
                       k: els['ct-k-' + i + '-' + j].textContent })
  });
  if (!readout().chi) throw new Error('the readout row stayed empty on boot');
  // the BOOT state is read before anything is loaded: the default table is the
  // trial the lesson's prose works through, and a default changed quietly in
  // the markup is exactly what this has to catch
  return { boot: readout(), load: t => { applier(t); return readout(); } };
}

try {
  const page = driveBuildATable();
  const fmt2 = v => v.toFixed(2);

  is('page boots on the 2×2 trial: χ²', page.boot.chi, fmt2(trial.chi), 'the components above');
  is('page boots on the 2×2 trial: df', page.boot.df, '1', '(2 − 1)(2 − 1)');
  is('page boots on the 2×2 trial: N', page.boot.N, '130', '45 + 20 + 25 + 40');
  is('page boots on the 2×2 trial: expected in the first cell', page.boot.cell(0, 0).e, 'E 35.0', '65 × 70 / 130');
  is('page boots on the 2×2 trial: first component', page.boot.cell(0, 0).k, fmt2(trial.K[0][0]), '(45 − 35)² / 35');
  is('page boots on the 2×2 trial: conditions met', page.boot.cond, 'met', 'every expected count is 30 or 35');

  const got = page.load('27,18,27,18;18,20,35,27;12,16,37,45');
  is('page 3 × 4: χ²', got.chi, fmt2(comm.chi), 'the twelve components above');
  is('page 3 × 4: df', got.df, '6', '(3 − 1)(4 − 1)');
  is('page 3 × 4: N', got.N, '300', 'the twelve counts');
  is('page 3 × 4: exact p', got.p, comm.p.toFixed(4), 'VIZ.chiSqUpper(18.7695, 6)');
  is('page 3 × 4: Table F reading', got.tab, chiBracket(comm.chi, comm.df), 'the criticals above');
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      is(`page 3 × 4: expected count in cell ${i + 1},${j + 1}`,
         got.cell(i, j).e, 'E ' + comm.E[i][j].toFixed(1), 'rᵢcⱼ/N');
      is(`page 3 × 4: component in cell ${i + 1},${j + 1}`,
         got.cell(i, j).k, comm.K[i][j].toFixed(2), '(O − E)²/E');
    }
  }

  // the three textbook conditions, each on a table that trips exactly one of them
  is('page flags a 2×2 whose expected counts miss 5', page.load('2,3;3,2').cond,
     'a 2×2 needs all four expected at 5, lowest is 2.5', 'the 2×2 clause of the textbook rule');
  is('page flags an expected count below 1', page.load('1,1,1;1,1,1;1,1,20').cond,
     'an expected count of 0.32 is below 1', 'the "every expected count ≥ 1" clause');
  // 3,3,3;3,3,3;3,3,30 has expected counts 1.5, 1.5, 6 / 1.5, 1.5, 6 / 6, 6, 24:
  // four of nine below 5 while every one of them still clears 1, so it trips the
  // 20% clause on its own rather than the "at least 1" clause above it
  is('page flags more than 20% of expected counts below 5', page.load('3,3,3;3,3,3;3,3,30').cond,
     '4 of 9 expected counts are below 5', 'the 20% clause');

  // a mangled ?t= must leave the page on its default rather than half-read it
  for (const bad of ['1,2;3', '1,2,x;3,4,5', '1,2,3,4,5;1,2,3,4,5', '9,9', 'nonsense', '-4,5;6,7']) {
    const after = page.load('45,20;25,40');            // known-good state first
    is(`page ignores a mangled ?t=${bad}`, page.load(bad).chi, after.chi,
       'SC.dataParam\'s rule: reject the whole parameter, never half-read it');
  }
} catch (e) {
  failures.push({ section, label: 'Build a Table could not be driven — ids or structure changed?',
    got: String(e.message), want: 'a runnable ct-table script printing the stat row', tol: 0, err: NaN,
    src: 'stats-1/chi-square-tests' });
}


/* ============================================================
   12 — Build the ANOVA Table (stats-2/one-way-anova)

   P89 made the ANOVA table the interface: the widget derives SSG, SSE, SST,
   the three df, the two mean squares, F, p, the pooled SD and eta squared from
   an editable dataset, and blanks four of those cells in exam mode. Every one
   of them is a published claim, so this section derives the whole table from
   the sixteen numbers alone and then drives the SHIPPED page under the same
   DOM shim sections 8 to 11 use, through the page's OWN ?g= applier: the shim
   hands it a fake window.SC carrying groupParam lifted out of site.js, so the
   widget is loaded exactly the way a reader's URL loads it and the page needs
   no test-only hook.

   THE DIVISOR IS THE POINT. VIZ.sd divides by n, which is a population SD; the
   exam dialect's s, MSE and pooled SD all divide by n − 1. The frozen default
   was chosen so the two answers are far apart and both are round: with the
   sample form MSE is exactly 4 and sp exactly 2, and feeding the same formula
   VIZ.sd's population SDs would give 3 and 1.732. Both are asserted, so a
   future edit that reaches for VIZ.sd here fails rather than passing quietly.

   The frozen default is four fertilizer doses, four seedlings each: group
   means 13, 17, 19 and 23 against a grand mean of 18, SSG 208, SSE 48,
   SST 256, F(3, 12) = 17.33. The two-group anchor is the same first and last
   group, where F(1, 6) = 60.00 must equal the square of the pooled t of
   7.7460, since squaring a t on v df gives an F on (1, v).
   ============================================================ */
head('Build the ANOVA Table (the shipped page)');

const SEED = [[15, 14, 12, 11], [20, 18, 16, 14], [21, 17, 19, 19], [25, 24, 22, 21]];

const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
const ssOf = a => { const m = avg(a); return a.reduce((s, v) => s + (v - m) * (v - m), 0); };
/* the exam dialect: n − 1 under the root */
const sampleSD = a => Math.sqrt(ssOf(a) / (a.length - 1));

function anovaTable(G) {
  const all = [].concat(...G), N = all.length, I = G.length, gm = avg(all);
  const means = G.map(avg);
  const ssb = G.reduce((s, g, i) => s + g.length * (means[i] - gm) * (means[i] - gm), 0);
  const ssw = G.reduce((s, g) => s + ssOf(g), 0);
  const sst = all.reduce((s, v) => s + (v - gm) * (v - gm), 0);
  const dfb = I - 1, dfw = N - I, dft = N - 1;
  const msb = ssb / dfb, msw = ssw / dfw, f = msb / msw;
  return { all, N, I, gm, means, ssb, ssw, sst, dfb, dfw, dft, msb, msw, f,
           p: V.fUpper(f, dfb, dfw), sp: Math.sqrt(msw), eta: ssb / sst };
}

const seed = anovaTable(SEED);

/* ---- the arithmetic, independent of the page ---- */
is('seed: group means', seed.means.join(','), '13,17,19,23', 'the sixteen heights');
eq('seed: grand mean', seed.gm, 18, 1e-12, '(52 + 68 + 76 + 92) / 16');
eq('seed: SSG', seed.ssb, 208, 1e-12, '4 × (25 + 1 + 1 + 25)');
eq('seed: SSE', seed.ssw, 48, 1e-12, '10 + 20 + 8 + 10');
eq('seed: SST', seed.sst, 256, 1e-12, 'every height against the grand mean');
eq('seed: SST = SSG + SSE', seed.ssb + seed.ssw, seed.sst, 1e-12, 'the partition identity');
is('seed: df', [seed.dfb, seed.dfw, seed.dft].join(','), '3,12,15', 'I − 1, N − I, N − 1');
is('seed: df add', seed.dfb + seed.dfw, seed.dft, '(I − 1) + (N − I) = N − 1');
eq('seed: MSG', seed.msb, 208 / 3, 1e-12, 'SSG / dfG');
eq('seed: MSE', seed.msw, 4, 1e-12, 'SSE / dfE = 48 / 12');
eq('seed: F', seed.f, 52 / 3, 1e-12, 'MSG / MSE');
rel('seed: p', seed.p, 1.1672856e-4, 1e-6, 'VIZ.fUpper(17.3333, 3, 12)');
eq('seed: pooled SD', seed.sp, 2, 1e-12, '√MSE');
eq('seed: eta squared', seed.eta, 0.8125, 1e-12, 'SSG / SST = 208 / 256');
eq('seed: F* at .05 on (3, 12)', V.fInv(0.05, 3, 12), 3.4903, 5e-5, 'printed F table');

/* the divisor, asserted in both directions */
const sdsSample = SEED.map(sampleSD);
const sdsPopulation = SEED.map(g => V.sd(g));
eq('sample SD of the untreated group is on n − 1', sdsSample[0], Math.sqrt(10 / 3), 1e-12, 'SS 10, df 3');
eq('VIZ.sd of the same group is on n, and is smaller', sdsPopulation[0], Math.sqrt(10 / 4), 1e-12,
   'VIZ.sd divides by n — documented in CLAUDE.md');
const mseFromSampleSDs = SEED.reduce((s, g, i) => s + (g.length - 1) * sdsSample[i] * sdsSample[i], 0) / seed.dfw;
const mseFromPopulationSDs = SEED.reduce((s, g, i) => s + (g.length - 1) * sdsPopulation[i] * sdsPopulation[i], 0) / seed.dfw;
eq('MSE from Σ(nᵢ − 1)sᵢ² with the SAMPLE s', mseFromSampleSDs, 4, 1e-12, 'the exam-dialect identity');
eq('the same formula fed VIZ.sd gives 3, not 4', mseFromPopulationSDs, 3, 1e-12,
   'the defect this assertion exists to catch');

/* the two-group anchor: F = t² */
const pair = anovaTable([SEED[0], SEED[3]]);
const tPooled = (avg(SEED[3]) - avg(SEED[0])) /
  Math.sqrt(((ssOf(SEED[0]) + ssOf(SEED[3])) / 6) * (1 / 4 + 1 / 4));
eq('two groups: pooled t', tPooled, 7.745966692414834, 1e-9, '10 / √(3.3333 × 0.5)');
eq('two groups: F', pair.f, 60, 1e-9, 'MSG / MSE');
eq('two groups: F = t²', pair.f, tPooled * tPooled, 1e-9, 'squaring a t on v df gives an F on (1, v)');
eq('two groups: the two p-values agree', pair.p, 2 * V.tUpper(Math.abs(tPooled), 6), 1e-15,
   'the same test written twice');
rel('two groups: p', pair.p, 2.4325611e-4, 1e-6, 'VIZ.fUpper(60, 1, 6)');

/* ---- and now the page itself ---- */
function driveAnovaTable() {
  const html = fs.readFileSync(path.join(ROOT, 'stats-2/one-way-anova/index.html'), 'utf8');
  const src = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map(m => m[1]).filter(s => /at-table/.test(s))[0];
  if (!src) throw new Error('no inline script mentioning at-table');

  const ctx2d = {};
  ['clearRect', 'fillRect', 'strokeRect', 'beginPath', 'moveTo', 'lineTo', 'arc', 'closePath',
   'fill', 'stroke', 'setLineDash', 'fillText', 'setTransform', 'save', 'restore'].forEach(n => { ctx2d[n] = () => {}; });
  ctx2d.measureText = t => ({ width: String(t).length * 6 });

  const els = {};
  const mk = () => {
    const on = {};
    const node = {
      innerHTML: '', textContent: '', value: '', style: {}, dataset: {}, hidden: false,
      clientWidth: 720, parentElement: { clientWidth: 720 }, getContext: () => ctx2d,
      classList: { add: () => {}, remove: () => {}, toggle: () => {} },
      querySelectorAll: () => [], getAttribute: () => null,
      addEventListener: (t, f) => { (on[t] = on[t] || []).push(f); },
      fire: (t, e) => (on[t] || []).forEach(f => f.call(node, e))
    };
    return node;
  };

  /* the shared ?g= parser, lifted out of site.js rather than reimplemented:
     the question here is what the SHIPPED helper does with a URL */
  const siteSrc = fs.readFileSync(path.join(ROOT, 'assets/js/site.js'), 'utf8');
  const grab = (name) => {
    const i = siteSrc.indexOf('function ' + name);
    const j = siteSrc.indexOf('\n  }\n', i);
    if (i < 0 || j < 0) throw new Error('site.js no longer defines ' + name);
    return siteSrc.slice(i, j + 4);
  };
  const groupParam = new Function(grab('numeric') + grab('groupParam') + ';return groupParam;')();

  let map = null;
  const c6 = { console };
  c6.window = c6;
  c6.document = { documentElement: {}, getElementById: id => els[id] || (els[id] = mk()) };
  c6.getComputedStyle = () => ({ getPropertyValue: () => '#000000' });
  c6.MutationObserver = function () { this.observe = () => {}; };
  c6.requestAnimationFrame = cb => cb();
  c6.addEventListener = () => {};
  c6.location = { search: '?g=1' };
  c6.SC = { preset: m => { map = m; }, groupParam: groupParam };
  vm.createContext(c6);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/viz.js'), 'utf8'), c6, { filename: 'viz.js' });
  vm.runInContext(src, c6, { filename: 'stats-2/one-way-anova#build-the-anova-table' });
  if (!map || typeof map.g !== 'function') throw new Error('the page registered no ?g= applier with SC.preset');

  /* the table is written as markup, so it is read back as markup — the same
     way section 9 reads tables.html's <tbody> rather than trusting a copy */
  const cell = id => {
    const m = els['at-table'].innerHTML.match(new RegExp('<td id="' + id + '"[^>]*>([^<]*)<'));
    return m ? m[1] : null;
  };
  const readout = () => ({
    f: els['at-f'].textContent, p: els['at-p'].textContent, sp: els['at-sp'].textContent,
    eta: els['at-eta'].textContent, dec: els['at-dec'].textContent,
    sum: els['at-sum'].textContent,
    ssb: cell('at-c-ssb'), ssw: cell('at-c-ssw'), sst: cell('at-c-sst'),
    dfb: cell('at-c-dfb'), dfw: cell('at-c-dfw'), dft: cell('at-c-dft'),
    msb: cell('at-c-msb'), msw: cell('at-c-msw'), fc: cell('at-c-f'), pc: cell('at-c-p')
  });
  if (!readout().ssb) throw new Error('the table stayed empty on boot');
  // the BOOT state is read before any dataset is loaded: a frozen default
  // changed quietly in the markup is exactly what this has to catch
  return { boot: readout(), load: g => { map.g(g); return readout(); } };
}

try {
  const page = driveAnovaTable();
  const f2 = v => v.toFixed(2);

  is('page boots on the frozen seedlings: SSG', page.boot.ssb, f2(seed.ssb), '4 × Σ(x̄ᵢ − x̄)²');
  is('page boots on the frozen seedlings: SSE', page.boot.ssw, f2(seed.ssw), 'Σ(x − x̄ᵢ)²');
  is('page boots on the frozen seedlings: SST', page.boot.sst, f2(seed.sst), 'Σ(x − x̄)²');
  is('page boots on the frozen seedlings: dfG', page.boot.dfb, '3', 'I − 1');
  is('page boots on the frozen seedlings: dfE', page.boot.dfw, '12', 'N − I');
  is('page boots on the frozen seedlings: dfT', page.boot.dft, '15', 'N − 1');
  is('page boots on the frozen seedlings: MSG', page.boot.msb, f2(seed.msb), 'SSG / dfG');
  is('page boots on the frozen seedlings: MSE', page.boot.msw, f2(seed.msw), 'SSE / dfE');
  is('page boots on the frozen seedlings: F in the table', page.boot.fc, f2(seed.f), 'MSG / MSE');
  is('page boots on the frozen seedlings: F in the readout', page.boot.f, f2(seed.f), 'the same ratio');
  is('page boots on the frozen seedlings: pooled SD', page.boot.sp, f2(seed.sp), '√MSE');
  is('page boots on the frozen seedlings: eta squared', page.boot.eta, '.813', 'SSG / SST = .8125');
  is('page boots on the frozen seedlings: verdict', page.boot.dec, 'Group means differ', 'p = .0001');
  // the per-group s the page prints is the SAMPLE SD: 1.83, not VIZ.sd's 1.58
  is('page prints the untreated group\'s s on n − 1',
     /None: n = 4, mean 13\.00, s = 1\.83/.test(page.boot.sum), true,
     '√(10/3) = 1.826, where VIZ.sd would print 1.58');

  const t2 = page.load('15,14,12,11;25,24,22,21');
  is('page two-group ?g=: SSG', t2.ssb, f2(pair.ssb), 'the eight heights');
  is('page two-group ?g=: SSE', t2.ssw, f2(pair.ssw), 'the eight heights');
  is('page two-group ?g=: dfG', t2.dfb, '1', 'two groups');
  is('page two-group ?g=: dfE', t2.dfw, '6', 'N − I = 8 − 2');
  is('page two-group ?g=: F', t2.f, f2(pair.f), 'and 7.746² = 60.00');
  is('page two-group ?g=: eta squared', t2.eta, '.909', '200 / 220');

  // a mangled ?g= must leave the widget on its previous dataset rather than
  // half-read it — SC.groupParam's rule, asserted through the page
  for (const bad of ['1,2;3', '1,2', 'nonsense', '1,2;3,x', '1,2;;3,4', '1,2;3,4;5,6;7,8;9,10']) {
    const good = page.load('15,14,12,11;25,24,22,21');
    is(`page ignores a mangled ?g=${bad}`, page.load(bad).ssb, good.ssb,
       'reject the whole parameter, never half-read it');
  }
} catch (e) {
  failures.push({ section, label: 'Build the ANOVA Table could not be driven — ids or structure changed?',
    got: String(e.message), want: 'a runnable at-table script printing the ANOVA table', tol: 0, err: NaN,
    src: 'stats-2/one-way-anova' });
}

/* ============================================================
   13 — Contrast Builder (stats-2/post-hoc-tests)

   P90 put the follow-up arithmetic on the page: a contrast psi = Sum a_i x̄_i
   with its standard error borrowed from the ANOVA table, the t and the
   interval it implies, and every pairwise comparison judged twice, against
   the plain critical value and against the Bonferroni one. Each of those is
   a published claim, so this section derives them from the sixteen numbers
   and the coefficient row alone, then drives the SHIPPED widget under the
   same DOM shim sections 8 to 12 use, through the page's OWN ?g= and ?c=
   appliers: the shim hands it a fake window.SC carrying groupParam AND
   dataParam lifted out of site.js, so the widget is loaded exactly the way a
   reader's URL loads it and the page carries no test-only hook.

   THREE IDENTITIES ARE THE POINT OF THE SECTION, and each is asserted rather
   than described.

   (a) SCALE INVARIANCE. [3, -1, -1, -1] and [1, -1/3, -1/3, -1/3] are the
       same contrast: multiplying every coefficient by 3 multiplies both psi
       and its standard error by 3, so t cannot move. The prose says so and
       the widget's default is the whole-number version, so a future edit
       that rescales one half and not the other has to fail here.

   (b) A PAIRWISE COMPARISON IS A CONTRAST. Feeding [1, -1, 0, 0] through the
       contrast formulas must return exactly what the pairwise formula
       t = (x̄i - x̄j) / (sp * sqrt(1/ni + 1/nj)) returns, to machine
       precision. The widget computes the two panels down two code paths, and
       this is what stops them drifting apart.

   (c) THE INTERVAL IS THE TEST. |t| >= t* exactly when the interval excludes
       zero, since both are the same inequality rearranged. Asserted in both
       directions on the seedlings' own pairs: None vs Low clears t* and its
       plain interval misses zero, while its SIMULTANEOUS interval, built on
       t**, contains zero exactly as the corrected test declines to reject.

   THE DIVISOR IS CHECKED HERE TOO. VIZ.sd divides by n; every s, MSE and
   pooled SD in the exam dialect divides by n - 1. On the frozen default the
   two are far apart and both round: sp is exactly 2.00 on the sample form
   and 1.732 on VIZ.sd's, and the None group's s is 1.83 against 1.58. Both
   are asserted, and the page's printed s is read back, so a future edit that
   reaches for VIZ.sd fails rather than passing quietly.

   The published anchors, all four-groups-of-four on MSE = 4.00 with 12 error
   df: t*(12) = 2.179 and t**(12) at .05/6 = 3.153; the control-vs-rest
   contrast psî = -6.67, SE = 1.15, t = -5.77, 95% CI [-9.18, -4.15]; and the
   df = 73 pair the prose cites, t* = 1.993 against t** = 2.450.
   ============================================================ */
head('Contrast Builder (the shipped page)');

const CB_G = [[15, 14, 12, 11], [20, 18, 16, 14], [21, 17, 19, 19], [25, 24, 22, 21]];

function errTerm(G) {
  const all = [].concat(...G), N = all.length, I = G.length;
  const means = G.map(avg);
  const ssw = G.reduce((s, g) => s + ssOf(g), 0);
  const dfE = N - I, mse = ssw / dfE;
  return { N, I, means, ssw, dfE, mse, sp: Math.sqrt(mse) };
}
/* psi, its SE, t and the interval — the formulas exactly as §2.3 prints them */
function contrastOf(G, b, a, level) {
  const psi = a.reduce((s, ai, i) => s + ai * b.means[i], 0);
  const q = a.reduce((s, ai, i) => s + ai * ai / G[i].length, 0);
  const se = Math.sqrt(b.mse * q);
  const t = psi / se;
  const tc = V.tInv((1 - (level || 0.95)) / 2, b.dfE);
  return { psi, q, se, t, tc, p2: 2 * V.tUpper(Math.abs(t), b.dfE),
           p1: V.tUpper(Math.abs(t), b.dfE), lo: psi - tc * se, hi: psi + tc * se };
}

const cbB = errTerm(CB_G);

/* ---- the error term the contrasts borrow ---- */
eq('seedlings: MSE the contrast borrows', cbB.mse, 4, 1e-12, 'SSE 48 on 12 df');
is('seedlings: error df', cbB.dfE, 12, 'N − I = 16 − 4');
eq('seedlings: pooled SD on n − 1', cbB.sp, 2, 1e-12, '√MSE');
/* the identity SSE = Σ(nᵢ − 1)sᵢ² is the one the widget's readouts stand on,
   and it is only true of the SAMPLE s. Fed VIZ.sd's population SDs the same
   line returns MSE = 3 and a pooled SD of 1.732 instead of 4 and 2.00. */
eq('the same pooled SD built from VIZ.sd would be √3', Math.sqrt(
  CB_G.reduce((s, g) => s + (g.length - 1) * V.sd(g) * V.sd(g), 0) / cbB.dfE), Math.sqrt(3), 1e-12,
  'VIZ.sd divides by n — the defect this assertion exists to catch');
eq('seedlings: the None group\'s sample s', sampleSD(CB_G[0]), Math.sqrt(10 / 3), 1e-12, 'SS 10 on 3 df');
eq('seedlings: VIZ.sd of the same group is smaller', V.sd(CB_G[0]), Math.sqrt(10 / 4), 1e-12, 'divides by n');

/* ---- (a) scale invariance ---- */
const cWhole = contrastOf(CB_G, cbB, [3, -1, -1, -1]);
const cFrac = contrastOf(CB_G, cbB, [1, -1 / 3, -1 / 3, -1 / 3]);
eq('control vs rest, whole numbers: psî', cWhole.psi, -20, 1e-12, '3(13) − 17 − 19 − 23');
eq('control vs rest, whole numbers: SE', cWhole.se, Math.sqrt(12), 1e-12, '√(4 × 12/4)');
eq('control vs rest, fractions: psî', cFrac.psi, -20 / 3, 1e-12, '13 − 59/3');
eq('control vs rest, fractions: SE', cFrac.se, Math.sqrt(4 / 3), 1e-12, '√(4 × 1/3)');
eq('the two scalings give one t', cWhole.t, cFrac.t, 1e-14, 'scaling by 3 hits psî and SE alike');
eq('control vs rest: t', cFrac.t, -Math.sqrt(100 / 3), 1e-12, '−6.6667 / 1.1547');
rel('control vs rest: two-tailed p', cFrac.p2, 8.8319e-5, 1e-4, 'VIZ.tUpper(5.7735, 12) doubled');
eq('control vs rest: the one-tailed p is half of it', cFrac.p1 * 2, cFrac.p2, 1e-15, 'a planned direction halves the area');
eq('t*(12) two-tailed at .05', V.tInv(0.025, 12), 2.179, 5e-4, 'printed t table');
eq('control vs rest: interval, low', cFrac.lo, -9.183, 5e-4, 'psî − t* × SE');
eq('control vs rest: interval, high', cFrac.hi, -4.151, 5e-4, 'psî + t* × SE');
eq('the whole-number interval is exactly three times as wide',
   cWhole.hi - cWhole.lo, 3 * (cFrac.hi - cFrac.lo), 1e-12, 'the same statement in units of three');

/* the sum-to-zero rule is what makes psi a comparison and not a level:
   shift every group mean by the same amount and psî must not move */
const shifted = { ...cbB, means: cbB.means.map(m => m + 100) };
eq('adding 100 to every mean leaves psî unchanged',
   contrastOf(CB_G, shifted, [3, -1, -1, -1]).psi, cWhole.psi, 1e-11, 'Σaᵢ = 0');

/* ---- (b) a pairwise comparison IS a contrast ---- */
const pairSE = cbB.sp * Math.sqrt(1 / 4 + 1 / 4);
eq('pairwise standard error', pairSE, Math.SQRT2, 1e-12, 'sp √(1/4 + 1/4) = 2 × 0.7071');
const PAIRS = [[0, 1, -4], [0, 2, -6], [0, 3, -10], [1, 2, -2], [1, 3, -6], [2, 3, -4]];
for (const [i, j, d] of PAIRS) {
  const a = [0, 0, 0, 0]; a[i] = 1; a[j] = -1;
  const asContrast = contrastOf(CB_G, cbB, a);
  eq(`pair ${i}${j}: the pairwise formula and the contrast formula agree`,
     asContrast.t, d / pairSE, 1e-13, 'a pair is a contrast with 1 and −1');
  eq(`pair ${i}${j}: difference`, asContrast.psi, d, 1e-12, 'the two group means');
}

/* ---- the two critical values, and (c) the interval-versus-test identity ---- */
const tStar = V.tInv(0.025, 12), tStarStar = V.tInv(0.05 / 12, 12);
eq('plain critical t*(12)', tStar, 2.179, 5e-4, 'printed t table');
eq('Bonferroni critical t**(12) at .05/6', tStarStar, 3.153, 5e-4, 'the .0083 two-tailed critical');
is('the corrected bar is the higher one', tStarStar > tStar, true, 'that is what the correction does');
eq('per-test alpha', 0.05 / 6, 0.008333333333333333, 1e-15, 'alpha divided by six comparisons');
for (const [i, j, d] of PAIRS) {
  const t = d / pairSE;
  const plainLo = d - tStar * pairSE, plainHi = d + tStar * pairSE;
  const simLo = d - tStarStar * pairSE, simHi = d + tStarStar * pairSE;
  is(`pair ${i}${j}: plain test and plain interval agree`,
     Math.abs(t) >= tStar, !(plainLo <= 0 && plainHi >= 0), 'the same inequality rearranged');
  is(`pair ${i}${j}: corrected test and simultaneous interval agree`,
     Math.abs(t) >= tStarStar, !(simLo <= 0 && simHi >= 0), 'both built on t**');
}
/* the two comparisons the correction actually costs, named in the prose */
eq('None vs Low: t', -4 / pairSE, -2.8284271, 1e-6, '−4 / 1.4142');
is('None vs Low clears the plain bar', Math.abs(-4 / pairSE) >= tStar, true, '2.83 > 2.179');
is('None vs Low fails the corrected bar', Math.abs(-4 / pairSE) >= tStarStar, false, '2.83 < 3.153');
is('None vs High clears both', Math.abs(-10 / pairSE) >= tStarStar, true, '7.07 > 3.153');
rel('None vs Low: p', 2 * V.tUpper(Math.abs(-4 / pairSE), 12), 0.0152196, 1e-4, 'VIZ.tUpper doubled');
rel('None vs High: p', 2 * V.tUpper(Math.abs(-10 / pairSE), 12), 1.29888e-5, 1e-4, 'VIZ.tUpper doubled');

/* the df = 73 pair the prose cites as the realistic case */
eq('df 73: plain critical', V.tInv(0.025, 73), 1.993, 5e-4, 'printed t table');
eq('df 73: Bonferroni critical at .05/3', V.tInv(0.05 / 6, 73), 2.450, 5e-4, 'three comparisons, two-sided');

/* ---- and now the page itself ---- */
function driveContrastBuilder() {
  const html = fs.readFileSync(path.join(ROOT, 'stats-2/post-hoc-tests/index.html'), 'utf8');
  const src = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map(m => m[1]).filter(s => /cb-coefs/.test(s))[0];
  if (!src) throw new Error('no inline script mentioning cb-coefs');

  const ctx2d = {};
  ['clearRect', 'fillRect', 'strokeRect', 'beginPath', 'moveTo', 'lineTo', 'arc', 'closePath',
   'fill', 'stroke', 'setLineDash', 'fillText', 'setTransform', 'save', 'restore'].forEach(n => { ctx2d[n] = () => {}; });
  ctx2d.measureText = t => ({ width: String(t).length * 6 });

  const els = {};
  const mk = () => {
    const on = {};
    const node = {
      innerHTML: '', textContent: '', value: '', style: {}, dataset: {}, hidden: false,
      clientWidth: 720, parentElement: { clientWidth: 720 }, getContext: () => ctx2d,
      classList: { add: () => {}, remove: () => {}, toggle: () => {} },
      querySelectorAll: () => [], getAttribute: () => null,
      addEventListener: (t, f) => { (on[t] = on[t] || []).push(f); },
      fire: (t, e) => (on[t] || []).forEach(f => f.call(node, e))
    };
    return node;
  };

  /* both shared parsers lifted out of site.js rather than reimplemented: the
     question here is what the SHIPPED helpers do with a URL */
  const siteSrc = fs.readFileSync(path.join(ROOT, 'assets/js/site.js'), 'utf8');
  const grab = (name) => {
    const i = siteSrc.indexOf('function ' + name);
    const j = siteSrc.indexOf('\n  }\n', i);
    if (i < 0 || j < 0) throw new Error('site.js no longer defines ' + name);
    return siteSrc.slice(i, j + 4);
  };
  const parsers = new Function(grab('numeric') + grab('groupParam') + grab('dataParam') +
    ';return { groupParam: groupParam, dataParam: dataParam };')();

  let map = null;
  const c7 = { console };
  c7.window = c7;
  c7.document = { documentElement: {}, getElementById: id => els[id] || (els[id] = mk()), querySelector: () => mk() };
  c7.getComputedStyle = () => ({ getPropertyValue: () => '#000000' });
  c7.MutationObserver = function () { this.observe = () => {}; };
  c7.requestAnimationFrame = cb => cb();
  c7.addEventListener = () => {};
  c7.location = { search: '?c=1' };
  c7.SC = { preset: m => { map = m; }, groupParam: parsers.groupParam, dataParam: parsers.dataParam };
  vm.createContext(c7);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/viz.js'), 'utf8'), c7, { filename: 'viz.js' });
  vm.runInContext(src, c7, { filename: 'stats-2/post-hoc-tests#contrast-builder' });
  if (!map || typeof map.g !== 'function' || typeof map.c !== 'function') {
    throw new Error('the page registered no ?g= and ?c= appliers with SC.preset');
  }

  /* the pairs panel's readouts do not exist until the page has been switched
     into that mode, so a missing node reads as empty rather than throwing */
  const txt = id => (els[id] ? els[id].textContent : '');
  const readout = () => ({
    psi: txt('cb-psi'), se: txt('cb-se'), t: txt('cb-t'), df: txt('cb-df'),
    p2: txt('cb-p2'), p1: txt('cb-p1'), ci: txt('cb-ci'), sum: txt('cb-sum'),
    sp: txt('cb-sp'), m: txt('cb-m'), ab: txt('cb-ab'),
    tc: txt('cb-tc'), tcb: txt('cb-tcb'),
    table: els['cb-table'] ? els['cb-table'].innerHTML : ''
  });
  if (!readout().psi || readout().psi === '—') throw new Error('the widget printed no estimate on boot');
  // the BOOT state is read before anything is loaded: a frozen default or a
  // default coefficient row changed quietly in the markup is what this catches
  return { boot: readout(), load: (k, v) => { map[k](v); return readout(); } };
}

try {
  const cb = driveContrastBuilder();
  const row = (ix) => {
    const m = cb.boot.table.match(new RegExp('<tr id="cb-r' + ix + '">([\\s\\S]*?)</tr>'));
    return m ? m[1] : null;
  };

  is('page boots on the whole-number control-vs-rest contrast: psî', cb.boot.psi, '-20.00', '3(13) − 17 − 19 − 23');
  is('page boots: SE', cb.boot.se, '3.46', '√12');
  is('page boots: t', cb.boot.t, '-5.77', 'psî / SE');
  is('page boots: error df', cb.boot.df, '12', 'N − I');
  is('page boots: interval', cb.boot.ci, '[-27.55, -12.45]', 'psî ± t*(12) × SE');
  // the per-group s the page prints is the SAMPLE SD: 1.83, not VIZ.sd's 1.58
  is('page prints the None group\'s s on n − 1',
     /None: n = 4, mean 13\.00, s = 1\.83/.test(cb.boot.sum), true,
     '√(10/3) = 1.826, where VIZ.sd would print 1.58');

  const frac = cb.load('c', '1,-0.333333,-0.333333,-0.333333');
  is('page ?c= fractional: psî', frac.psi, '-6.67', '13 − 59/3');
  is('page ?c= fractional: SE', frac.se, '1.15', '√(4/3)');
  is('page ?c= fractional: the t is unchanged by the rescaling', frac.t, '-5.77', 'scale invariance');
  is('page ?c= fractional: interval', frac.ci, '[-9.18, -4.15]', 'the prose\'s worked interval');

  const pr = cb.load('mode', 'pairs');
  is('page pairs panel: pooled SD', pr.sp, '2.00', '√MSE on n − 1');
  is('page pairs panel: comparisons', pr.m, '6', 'I(I − 1)/2');
  is('page pairs panel: per-test alpha', pr.ab, '.0083', '.05 / 6');
  is('page pairs panel: plain critical', pr.tc, '2.179', 'printed t table');
  is('page pairs panel: Bonferroni critical', pr.tcb, '3.153', 'the .0083 two-tailed critical');
  const cells = (ix) => {
    const m = pr.table.match(new RegExp('<tr id="cb-r' + ix + '">([\\s\\S]*?)</tr>'));
    /* the p cell writes a literal &lt; for "< .0001", so it is decoded back */
    return m ? [...m[1].matchAll(/<td[^>]*>(.*?)<\/td>/g)].map(x => x[1].replace(/&lt;/g, '<')) : null;
  };
  is('page pairs panel: None vs Low reads reject then keep',
     (cells(0) || []).slice(0, 6).join('|'), 'None vs. Low|-4.00|-2.83|.0152|reject|keep',
     't = 2.83 sits between 2.179 and 3.153');
  is('page pairs panel: None vs Low simultaneous interval covers zero',
     (cells(0) || [])[6], '[-8.46, 0.46]', 'built on t**, so it agrees with the corrected verdict');
  is('page pairs panel: None vs High rejects twice',
     (cells(2) || []).slice(3, 6).join('|'), '< .0001|reject|reject', '7.07 clears both bars');
  is('page pairs panel: Low vs Medium keeps twice',
     (cells(3) || []).slice(2, 6).join('|'), '-1.41|.1827|keep|keep', '1.41 clears neither');

  // a mangled ?c= or ?g= must leave the widget where it was rather than
  // half-reading it — SC.dataParam's and SC.groupParam's rule, through the page
  cb.load('mode', 'one');
  const good = JSON.stringify(cb.load('c', '3,-1,-1,-1'));
  for (const bad of ['3,-1,-1', '3,-1,-1,-1,0', '2,-1,0,0', '0,0,0,0', 'nonsense', '3,-1,x,-1', '']) {
    is(`page ignores a mangled ?c=${bad}`, JSON.stringify(cb.load('c', bad)), good,
       'reject the whole parameter, never half-read it');
  }
  for (const bad of ['1,2;3', '1,2', 'nonsense', '1,2;3,x', '1,2;;3,4', '1,2;3,4;5,6;7,8;9,10;11,12']) {
    is(`page ignores a mangled ?g=${bad}`, JSON.stringify(cb.load('g', bad)), good,
       'reject the whole parameter, never half-read it');
  }

  // a three-group dataset through ?g=, then a pairwise contrast through ?c=
  const g3 = cb.load('g', '10,12,14,12;20,22,18,20;30,28,32,30');
  is('page ?g= three groups: error df', g3.df, '9', 'N − I = 12 − 3');
  is('page ?g= three groups: default psî', g3.psi, '-26.00', '2(12) − 20 − 30 with the default row');
  is('page ?g= three groups: prints s on n − 1',
     /Group 1: n = 4, mean 12\.00, s = 1\.63/.test(g3.sum), true, '√(8/3) = 1.633, VIZ.sd would print 1.41');
  const g3p = cb.load('c', '1,-1,0');
  is('page ?g= then ?c=: psî', g3p.psi, '-8.00', '12 − 20');
  is('page ?g= then ?c=: SE', g3p.se, '1.15', '√(8/3 × 1/2)');
  is('page ?g= then ?c=: t', g3p.t, '-6.93', 'and MSE = 24/9 on the sample form');
} catch (e) {
  failures.push({ section, label: 'Contrast Builder could not be driven — ids or structure changed?',
    got: String(e.message), want: 'a runnable cb-coefs script printing a contrast', tol: 0, err: NaN,
    src: 'stats-2/post-hoc-tests' });
}


/* ============================================================
   Report
   ============================================================ */
const line = '─'.repeat(60);
console.log(line);
console.log(`StatsCapybara math-check — ${passed + failures.length} assertions on assets/js/viz.js`);
console.log(line);

if (failures.length) {
  console.log(`\nFAILURES (${failures.length}):`);
  let last = '';
  for (const f of failures) {
    if (f.section !== last) { console.log(`\n  [${f.section}]`); last = f.section; }
    console.log(`  • ${f.label}`);
    console.log(`      got  ${f.got}`);
    console.log(`      want ${f.want}  (${f.relative ? 'rel. ≤' : '±'} ${f.tol}, source: ${f.src})`);
    if (Number.isFinite(f.err)) console.log(`      off by ${f.err.toExponential(3)}${f.relative ? ' (relative)' : ''}`);
  }
}

console.log(`\n${line}`);
if (failures.length === 0) console.log(`PASS — ${passed} assertions, 0 failures.`);
else console.log(`FAIL — ${failures.length} of ${passed + failures.length} assertions failed.`);
console.log(line);
process.exit(failures.length ? 1 : 0);
