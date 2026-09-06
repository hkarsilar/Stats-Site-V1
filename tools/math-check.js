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
