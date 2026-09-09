/* ============================================================
   Tiny shared toolkit for the interactive lessons. Keeps each
   lesson's own <script> focused on its idea, not boilerplate.
   Exposed as window.VIZ.
   ============================================================ */
window.VIZ = (function () {
  "use strict";

  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /* True when the visitor has asked their OS for reduced motion. Lessons with
     "draw-many" animation loops (sample-by-sample builds, ROC sweeps, k-means
     steps) should check this and jump straight to the final frame instead of
     animating. CSS transitions/animations are already neutralized by the
     prefers-reduced-motion block in styles.css — this covers JS-driven ones. */
  function reducedMotion() {
    try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
    catch (e) { return false; }
  }

  /* True when the primary pointer is a finger rather than a mouse. Read live
     (not cached at boot) so a hybrid laptop-with-touchscreen and the browser's
     device emulation both get the right answer. */
  function coarsePointer() {
    try { return !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches); }
    catch (e) { return false; }
  }

  /* Grab radius for a canvas drag hit-test, in CSS pixels. Hit-tests tuned by
     eye are mouse-sized (14–18px); a finger pad needs ~24px to land reliably.
     Call this at pointerdown — on a mouse it returns `base` unchanged, so
     mouse behavior stays exactly as it was. Callers that compare SQUARED
     distances should square the result. */
  var GRAB_TOUCH = 24;
  function grabRadius(base) {
    return coarsePointer() ? Math.max(base, GRAB_TOUCH) : base;
  }

  // Coalesce bursty callbacks (resize + ResizeObserver both fire on a window
  // resize) into at most one call per animation frame — avoids the double
  // redraw and keeps resizing smooth. Returns a wrapped fn; call it freely.
  function rafThrottle(fn) {
    var scheduled = false;
    return function () {
      if (scheduled) return;
      scheduled = true;
      (window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); })(function () {
        scheduled = false;
        fn();
      });
    };
  }

  // High-DPI canvas setup. Returns { ctx, w, h } in CSS pixels.
  // DPR is capped at 2: beyond that the backing store grows quadratically
  // (a 3× phone would allocate 2.25× the pixels of a 2× screen) for no visible
  // gain on these flat charts, so cap it to keep memory/paint cost sane on 4K.
  function fit(canvas, cssHeight) {
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth || canvas.parentElement.clientWidth || 640;
    canvas.width = w * ratio;
    canvas.height = cssHeight * ratio;
    canvas.style.height = cssHeight + "px";
    var ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { ctx: ctx, w: w, h: cssHeight };
  }

  // Standard normal via Box–Muller.
  function randn() {
    var u = 1 - Math.random(), v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function gauss(mu, sd) { return mu + sd * randn(); }

  function erf(x) {
    var t = 1 / (1 + 0.3275911 * Math.abs(x));
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return x >= 0 ? y : -y;
  }
  function normCdf(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
  function normPdf(x, mu, sd) { var z = (x - mu) / sd; return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI)); }
  // inverse standard-normal CDF (Acklam's algorithm) — used for Q-Q plots
  function normInv(p) {
    if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
    var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    var b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    var c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    var d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    var plow = 0.02425, phigh = 1 - plow, q, r;
    if (p < plow) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p <= phigh) { q = p - 0.5; r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  function mean(a) { return a.reduce(function (s, v) { return s + v; }, 0) / a.length; }
  function sd(a) { var m = mean(a); return Math.sqrt(a.reduce(function (s, v) { return s + (v - m) * (v - m); }, 0) / a.length); }

  // Re-run fn whenever the light/dark theme flips (canvas reads CSS vars).
  function onTheme(fn) {
    new MutationObserver(fn).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  /* ---- special functions for exact F / chi-square p-values ----
     (Lanczos log-gamma, regularized incomplete gamma & beta) */
  function gammaln(xx) {
    var cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    var x = xx, y = xx, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp);
    var ser = 1.000000000190015;
    for (var j = 0; j < 6; j++) { y++; ser += cof[j] / y; }
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }
  /* NR's two branches, split out so the UPPER tail can be returned DIRECTLY.
     `1 - gammp(a, x)` cancels catastrophically once the upper tail falls below
     ~1e-16 and reaches exactly 0 — yet gcf below already computes that upper
     tail, so gammq hands it back untouched instead of reconstructing it by
     subtraction. gammp keeps the identical arithmetic it always had. */
  function gser(a, x) {   // lower tail P(a,x), series — used for x < a+1
    var ap = a, sum = 1 / a, del = sum;
    for (var n = 0; n < 300; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-13) break; }
    return sum * Math.exp(-x + a * Math.log(x) - gammaln(a));
  }
  function gcf(a, x) {    // upper tail Q(a,x), continued fraction — used for x >= a+1
    var FPMIN = 1e-300, b = x + 1 - a, c = 1 / FPMIN, d = 1 / b, h = d;
    for (var i = 1; i <= 300; i++) {
      var an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = b + an / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d; var dl = d * c; h *= dl;
      if (Math.abs(dl - 1) < 1e-13) break;
    }
    return Math.exp(-x + a * Math.log(x) - gammaln(a)) * h;
  }
  function gammp(a, x) {  // regularized lower incomplete gamma P(a,x)
    if (x <= 0 || a <= 0) return 0;
    return x < a + 1 ? gser(a, x) : 1 - gcf(a, x);
  }
  function gammq(a, x) {  // regularized UPPER incomplete gamma Q(a,x) — exact in the far tail
    if (a <= 0 || x <= 0) return 1;
    return x < a + 1 ? 1 - gser(a, x) : gcf(a, x);
  }
  function betacf(a, b, x) {
    var FPMIN = 1e-300, qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN; d = 1 / d; var h = d;
    for (var m = 1; m <= 300; m++) {
      var m2 = 2 * m, aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d; var del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-13) break;
    }
    return h;
  }
  function betaBt(a, b, x) {
    return Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x));
  }
  function betai(a, b, x) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    var bt = betaBt(a, b, x);
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  }
  /* 1 − I_x(a,b), with the branches SWAPPED relative to betai: whichever side is
     small is the one computed directly, so neither tail is ever reconstructed by
     subtracting a number close to 1. This is what stops a far-tail F p-value
     from collapsing to exactly 0. */
  function betaiUpper(a, b, x) {
    if (x <= 0) return 1; if (x >= 1) return 0;
    var bt = betaBt(a, b, x);
    return x < (a + 1) / (a + b + 2) ? 1 - bt * betacf(a, b, x) / a : bt * betacf(b, a, 1 - x) / b;
  }
  /* Upper tail of the standard normal, exact where `1 − normCdf(z)` is not.
     erf above is A&S 7.1.26, accurate to ~1.5e-7 ABSOLUTE — fine near the center,
     meaningless in a tail whose true value is far smaller, and exactly 0 for
     z ≥ 9. Q(z) = ½·erfc(z/√2) = ½·Q(½, z²/2) rides the incomplete gamma
     instead: ~5e-14 RELATIVE out to z ≈ 37. Prefer this over `1 - normCdf(z)`
     anywhere a small p-value is displayed. (normCdf itself is unchanged — no
     improvement to it could help, since `1 − Q` rounds to exactly 1.0 in
     float64 for z ≳ 8.3 regardless of how accurate Q is.) */
  function normQ(z) { return z < 0 ? 1 - normQ(-z) : 0.5 * gammq(0.5, z * z / 2); }
  // upper-tail p-values
  function fUpper(f, d1, d2) { return f <= 0 ? 1 : betaiUpper(d1 / 2, d2 / 2, d1 * f / (d1 * f + d2)); }
  function chiSqUpper(x, k) { return x <= 0 ? 1 : gammq(k / 2, x / 2); }
  function tUpper(t, v) {
    var p = 0.5 * betai(v / 2, 0.5, v / (v + t * t));
    return t >= 0 ? p : 1 - p;
  }

  /* ---- densities (for drawing the curves) ---- */
  function tPdf(t, v) {
    return Math.exp(gammaln((v + 1) / 2) - gammaln(v / 2) - 0.5 * Math.log(v * Math.PI) - ((v + 1) / 2) * Math.log(1 + t * t / v));
  }
  function chiSqPdf(x, k) {
    if (x <= 0) return 0;
    return Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - gammaln(k / 2) - (k / 2) * Math.LN2);
  }
  function fPdf(x, d1, d2) {
    if (x <= 0) return 0;
    var lnB = gammaln(d1 / 2) + gammaln(d2 / 2) - gammaln((d1 + d2) / 2);
    return Math.exp(0.5 * (d1 * Math.log(d1 * x) + d2 * Math.log(d2) - (d1 + d2) * Math.log(d1 * x + d2)) - Math.log(x) - lnB);
  }

  /* ---- inverse (quantile) functions: value with upper-tail area = alpha.
     Bisection on the exact CDFs — slow-ish but rock solid. ---- */
  function invUpper(fn, alpha) {
    if (alpha <= 0 || alpha >= 1) return NaN;
    var hi = 1;
    while (fn(hi) > alpha && hi < 1e12) hi *= 2;
    var lo = 0;
    for (var i = 0; i < 200; i++) {
      var mid = (lo + hi) / 2;
      if (fn(mid) > alpha) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  function tInv(alpha, v) {           // upper-tail critical t (alpha < .5 → positive)
    if (alpha === 0.5) return 0;
    return alpha < 0.5 ? invUpper(function (t) { return tUpper(t, v); }, alpha)
                       : -invUpper(function (t) { return tUpper(t, v); }, 1 - alpha);
  }
  function chiSqInv(alpha, k) { return invUpper(function (x) { return chiSqUpper(x, k); }, alpha); }
  function fInv(alpha, d1, d2) { return invUpper(function (x) { return fUpper(x, d1, d2); }, alpha); }

  /* ---- noncentral distributions (power & sample-size analysis) ----
     Exact CDFs of the noncentral t, chi-square, and F, so power.html (and
     any lesson) can compute power without normal-approximation shortcuts.
       nctCdf(t, df, ncp)      P(T ≤ t),   T ~ noncentral t(df, ncp)
       ncx2Cdf(x, df, ncp)     P(X ≤ x),   X ~ noncentral χ²(df, ncp)
       ncfCdf(f, d1, d2, ncp)  P(F ≤ f),   F ~ noncentral F(d1, d2, ncp)
     ncp is the noncentrality parameter (λ for χ²/F, δ for t). */

  // Σ_j  Poisson(j; lam) · term(j), summed OUTWARD from the Poisson mode so it
  // stays accurate for large lam. Every term(j) here is a probability in [0,1],
  // so truncating tiny-weight tails bounds the error by the omitted mass.
  function poissonMix(lam, term) {
    if (!(lam > 0)) return term(0);
    var mode = Math.floor(lam), sum = 0, TINY = 1e-15, j, w;
    w = Math.exp(-lam + mode * Math.log(lam) - gammaln(mode + 1));   // Pois(mode)
    for (j = mode; j < mode + 1e6; j++) {                 // upward from the mode
      sum += w * term(j);
      if (j > mode && w < TINY) break;
      w *= lam / (j + 1);                                 // Pois(j) → Pois(j+1)
    }
    if (mode > 0) {                                       // downward from mode-1
      w = Math.exp(-lam + (mode - 1) * Math.log(lam) - gammaln(mode));
      for (j = mode - 1; j >= 0; j--) {
        sum += w * term(j);
        if (w < TINY) break;
        w *= j / lam;                                     // Pois(j) → Pois(j-1)
      }
    }
    return sum;
  }
  // noncentral χ² CDF = Poisson-weighted mixture of central χ² CDFs (df + 2j).
  function ncx2Cdf(x, k, ncp) {
    if (x <= 0) return 0;
    if (!(ncp > 0)) return gammp(k / 2, x / 2);
    return poissonMix(ncp / 2, function (j) { return gammp((k + 2 * j) / 2, x / 2); });
  }
  // noncentral F CDF = Poisson-weighted mixture of central-F (incomplete-beta) CDFs.
  function ncfCdf(f, d1, d2, ncp) {
    if (f <= 0) return 0;
    var x = d1 * f / (d1 * f + d2);
    if (!(ncp > 0)) return betai(d1 / 2, d2 / 2, x);
    return poissonMix(ncp / 2, function (j) { return betai(d1 / 2 + j, d2 / 2, x); });
  }
  // noncentral t CDF — Lenth (1989) Algorithm AS 243: a twin incomplete-beta
  // series in the odd/even powers, plus a Φ(-δ) point mass. Accurate to ~1e-12.
  function nctCdf(t, df, del) {
    if (!isFinite(t)) return t > 0 ? 1 : 0;
    var negdel = false, tt = t, d = del;
    if (t < 0) { negdel = true; tt = -t; d = -del; }      // work with t ≥ 0, flip at end
    var x = tt * tt / (tt * tt + df), tnc = 0;
    if (x > 0) {
      var lambda = d * d;
      var p = 0.5 * Math.exp(-0.5 * lambda);
      var q = Math.sqrt(2 / Math.PI) * p * d;
      var s = 0.5 - p;
      var a = 0.5, b = 0.5 * df;
      var rxb = Math.pow(1 - x, b);
      var albeta = gammaln(a) + gammaln(b) - gammaln(a + b);
      var xodd = betai(a, b, x);
      var godd = 2 * rxb * Math.exp(a * Math.log(x) - albeta);
      var xeven = 1 - rxb, geven = b * x * rxb;
      tnc = p * xodd + q * xeven;
      for (var it = 1; it <= 1000; it++) {
        a += 1;
        xodd -= godd; xeven -= geven;
        godd *= x * (a + b - 1) / a;
        geven *= x * (a + b - 0.5) / (a + 0.5);
        p *= lambda / (2 * it); q *= lambda / (2 * it + 1);
        s -= p;
        tnc += p * xodd + q * xeven;
        if (Math.abs(2 * s * (xodd - godd)) < 1e-12) break;
      }
    }
    tnc = Math.min(Math.max(tnc + normCdf(-d), 0), 1);    // + P(Z ≤ -δ)
    return negdel ? 1 - tnc : tnc;
  }

  /* ---- confidence intervals on effect sizes ----
     APA 7 asks for an interval around the estimate, and for d, partial η²,
     R² and Cramér's V there is no ± formula: the interval is found by
     INVERTING the test — asking which noncentrality values would leave the
     observed statistic at the edge of its own distribution. That is why those
     effect sizes are so often reported bare, and why apa.html can report them.
       ncpCI(cdf, level)          [λL, λU] for any CDF that decreases in λ
       nctCI(t, df, level)        interval on a t's noncentrality δ; scale it
                                  by d/t to get the interval on Cohen's d
       varExpCI(F, d1, d2, level) interval on partial η² (= η² one-way) or R²
       vCI(chi, df, N, k, level)  interval on Cramér's V; k = min(rows,cols)−1
       rCI(r, n, level)           Fisher r-to-z interval (closed form)
     The λ of a χ² or F is a sum of squares and cannot be negative, so those
     intervals truncate at zero. The δ of a t is SIGNED (the effect can point
     the other way), so nctCI brackets on both sides and a nonsignificant
     result correctly returns a negative lower limit rather than a clamped 0.
     The λ → proportion-of-variance step divides by d1 + d2 + 1, the standard
     mapping; it leaves the interval slightly off-center from the sample η²,
     which is a property of the method rather than a bug, because the point
     estimate and the interval come from different formulas. */
  function ncpSolve(cdf, target) {                       // λ ≥ 0 (χ², F)
    if (!(cdf(0) > target)) return 0;                    // already below at λ = 0
    var lo = 0, hi = 1;
    while (cdf(hi) > target && hi < 1e5) hi *= 2;
    if (cdf(hi) > target) return NaN;                    // never crossed — say so
    for (var i = 0; i < 100 && hi - lo > 1e-9 * (1 + hi); i++) {
      var mid = (lo + hi) / 2;
      if (cdf(mid) > target) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  function ncpCI(cdf, level) {
    var a = (1 - (level > 0 && level < 1 ? level : 0.95)) / 2;
    return [ncpSolve(cdf, 1 - a), ncpSolve(cdf, a)];
  }
  function deltaSolve(t, df, target) {                   // δ ∈ ℝ (t)
    var lo = t, hi = t, step = 1, i;
    for (i = 0; i < 60 && nctCdf(t, df, lo) < target; i++) { lo -= step; step *= 2; }
    for (step = 1, i = 0; i < 60 && nctCdf(t, df, hi) > target; i++) { hi += step; step *= 2; }
    for (i = 0; i < 100 && hi - lo > 1e-9 * (1 + Math.abs(hi)); i++) {
      var mid = (lo + hi) / 2;
      if (nctCdf(t, df, mid) > target) lo = mid; else hi = mid;   // cdf decreases in δ
    }
    return (lo + hi) / 2;
  }
  function nctCI(t, df, level) {
    if (!isFinite(t) || !(df > 0)) return null;
    var a = (1 - (level > 0 && level < 1 ? level : 0.95)) / 2;
    return [deltaSolve(t, df, 1 - a), deltaSolve(t, df, a)];
  }
  function varExpCI(F, d1, d2, level) {
    if (!(F > 0) || !(d1 > 0) || !(d2 > 0)) return null;
    var N = d1 + d2 + 1;
    var ci = ncpCI(function (lam) { return ncfCdf(F, d1, d2, lam); }, level);
    return [ci[0] / (ci[0] + N), ci[1] / (ci[1] + N)];
  }
  function vCI(chi, df, N, k, level) {
    if (!(chi > 0) || !(df > 0) || !(N > 0) || !(k > 0)) return null;
    var ci = ncpCI(function (lam) { return ncx2Cdf(chi, df, lam); }, level);
    return [Math.sqrt(ci[0] / (N * k)), Math.sqrt(ci[1] / (N * k))];
  }
  function rCI(r, n, level) {
    if (!(n > 3) || !isFinite(r) || Math.abs(r) >= 1) return null;
    var z = Math.atanh(r), se = 1 / Math.sqrt(n - 3);
    var zc = normInv(1 - (1 - (level > 0 && level < 1 ? level : 0.95)) / 2);
    return [Math.tanh(z - zc * se), Math.tanh(z + zc * se)];
  }

  /* ---------- exact null distributions for the rank tests (P88) ----------
     A paper exam reads U, W and Spearman's rho off a critical-value table,
     and every one of those tables is a tail of an exactly countable null
     distribution. Nothing here is an approximation or a transcription:

       U  the number of arrangements of m X's and n Y's giving U = u is the
          number of partitions of u into at most m parts of size at most n.
          Placing the last symbol gives counts(m,n)[u] = counts(m-1,n)[u-n]
          + counts(m,n-1)[u], since a trailing X sits above all n Y's already
          placed and a trailing Y sits above none. The whole 20 x 20 table
          costs about 45,000 additions, so it is built once and cached.
       W  the number of subsets of {1..n} summing to w, i.e. the coefficients
          of the product of (1 + q^i). One convolution per i.
       S  the Spearman statistic S = sum of d^2 over all n! rankings, counted
          by a DP over positions carrying a bitmask of the ranks already used.
          Exact to n = SPEAR_EXACT (13); beyond it the cost doubles per step,
          so spearCrit falls back to the t approximation and spearExact()
          reports which side of that line an n is on.

     Critical values follow the convention every printed table uses: the most
     generous value whose exact tail probability is still at or below alpha,
     so the test's real size never exceeds its nominal one. Only ACHIEVABLE
     values count — S is always even, and stepping through the odd gaps would
     report a rho no ranking can produce. */
  var MWU_MAX = 20, mwuAll = null;
  function mwuBuild() {
    if (mwuAll) return mwuAll;
    var t = [], i, j, u, a, p, q;
    for (i = 0; i <= MWU_MAX; i++) { t.push([]); for (j = 0; j <= MWU_MAX; j++) t[i].push(null); }
    t[0][0] = new Float64Array([1]);
    for (i = 0; i <= MWU_MAX; i++) for (j = 0; j <= MWU_MAX; j++) {
      if (i === 0 && j === 0) continue;
      a = new Float64Array(i * j + 1);
      if (i > 0) { p = t[i - 1][j]; for (u = 0; u < p.length; u++) a[u + j] += p[u]; }
      if (j > 0) { q = t[i][j - 1]; for (u = 0; u < q.length; u++) a[u] += q[u]; }
      t[i][j] = a;
    }
    mwuAll = t;
    return t;
  }
  function mwuCounts(m, n) {
    if (!(m >= 1 && n >= 1 && m <= MWU_MAX && n <= MWU_MAX)) return null;
    return mwuBuild()[Math.round(m)][Math.round(n)];
  }
  function tailCrit(counts, total, aOne) {
    var cum = 0, best = null, k;
    for (k = 0; k < counts.length; k++) {
      if (!counts[k]) continue;                       // an unreachable value is not a critical value
      if ((cum + counts[k]) / total <= aOne + 1e-12) { cum += counts[k]; best = k; }
      else break;
    }
    return best;
  }
  function tailP(counts, total, x) {
    var s = 0, k, top = Math.min(x, counts.length - 1);
    for (k = 0; k <= top; k++) s += counts[k];
    return s / total;
  }
  function nCk(n, k) { var r = 1, t; for (t = 1; t <= k; t++) r = r * (n - k + t) / t; return r; }
  function oneSided(alpha, tails) { return tails === 1 ? alpha : alpha / 2; }

  function mwuLower(u, m, n) {                         // exact P(U <= u), U either of the two
    var c = mwuCounts(m, n);
    return c ? tailP(c, nCk(m + n, m), u) : null;
  }
  function mwuCrit(m, n, alpha, tails) {               // reject when the smaller U <= this
    var c = mwuCounts(m, n);
    return c ? tailCrit(c, nCk(m + n, m), oneSided(alpha, tails)) : null;
  }
  function mwuP(u, m, n, tails) {                      // u = the SMALLER U
    var p = mwuLower(u, m, n);
    return p === null ? null : Math.min(1, (tails === 1 ? 1 : 2) * p);
  }

  var WSR_MAX = 40, wsrCache = [new Float64Array([1])];
  function wsrCounts(n) {
    if (!(n >= 1 && n <= WSR_MAX)) return null;
    n = Math.round(n);
    for (var k = wsrCache.length; k <= n; k++) {
      var prev = wsrCache[k - 1], a = new Float64Array(k * (k + 1) / 2 + 1), w;
      for (w = 0; w < prev.length; w++) { a[w] += prev[w]; a[w + k] += prev[w]; }
      wsrCache.push(a);
    }
    return wsrCache[n];
  }
  function wsrLower(w, n) {                            // exact P(T+ <= w)
    var c = wsrCounts(n);
    return c ? tailP(c, Math.pow(2, n), w) : null;
  }
  function wsrCrit(n, alpha, tails) {                  // reject when the smaller of T+/T- <= this
    var c = wsrCounts(n);
    return c ? tailCrit(c, Math.pow(2, n), oneSided(alpha, tails)) : null;
  }
  function wsrP(w, n, tails) {                         // w = the SMALLER of T+ and T-
    var p = wsrLower(w, n);
    return p === null ? null : Math.min(1, (tails === 1 ? 1 : 2) * p);
  }

  var SPEAR_EXACT = 13, spearCache = {};
  function spearExact(n) { return n >= 2 && n <= SPEAR_EXACT; }
  function spearMaxS(n) { return n * (n * n - 1) / 3; }
  function spearRho(s, n) { return 1 - 6 * s / (n * (n * n - 1)); }
  function spearS(rho, n) { return Math.round((1 - rho) * n * (n * n - 1) / 6); }
  function spearCounts(n) {
    if (!spearExact(n)) return null;
    n = Math.round(n);
    if (spearCache[n]) return spearCache[n];
    var maxS = spearMaxS(n), cur = {}, pos, v, d, nm, mask, arr, t, s, nxt, keys, i;
    cur[0] = new Float64Array([1]);
    for (pos = 0; pos < n; pos++) {
      nxt = {}; keys = Object.keys(cur);
      for (i = 0; i < keys.length; i++) {
        mask = +keys[i]; arr = cur[keys[i]];
        for (v = 0; v < n; v++) {
          if (mask & (1 << v)) continue;
          d = pos - v; nm = mask | (1 << v);
          t = nxt[nm] || (nxt[nm] = new Float64Array(maxS + 1));
          for (s = 0; s < arr.length; s++) if (arr[s]) t[s + d * d] += arr[s];
        }
      }
      cur = nxt;
    }
    spearCache[n] = cur[(1 << n) - 1];
    return spearCache[n];
  }
  function spearFact(n) { var r = 1, i; for (i = 2; i <= n; i++) r *= i; return r; }
  function spearUpper(rho, n) {                        // exact P(rho_s >= rho), no ties
    var c = spearCounts(n);
    if (!c) return null;
    return tailP(c, spearFact(n), spearS(rho, n));
  }
  function spearCrit(n, alpha, tails) {                // reject when |rho_s| >= this
    var aOne = oneSided(alpha, tails), c = spearCounts(n), s, tc;
    if (c) {
      tc = tailCrit(c, spearFact(n), aOne);
      return tc === null ? null : spearRho(tc, n);
    }
    if (!(n > 2)) return null;
    /* Above the exact range, find the last ACHIEVABLE value of S (they are
       the even ones) whose tail is still within alpha, so the approximate
       rows are built by the same rule as the exact ones. The tail grows with
       S, so this is a bisection rather than a walk — n = 30 has 4,496 even
       values of S and each trial costs a continued fraction. */
    var lo = 0, hi = spearMaxS(n) / 2, mid, best = null;
    if (spearAS89(spearMaxS(n), n) > aOne + 1e-12) return null;
    while (lo <= hi) {
      mid = Math.floor((lo + hi) / 2);
      if (spearAS89(spearMaxS(n) - 2 * mid, n) <= aOne + 1e-12) { best = 2 * mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    return best === null ? null : spearRho(best, n);
  }
  /* AS 89 (Best & Roberts 1975): the Edgeworth series for the upper tail of
     S, which is what R's cor.test uses for moderate n. It reproduces the
     exact critical values at n = 14 and 16 to four decimals, and the plain t
     approximation does not (t alone gives .532 at n = 14 where the exact
     value is .5385). Argument is S, not rho; P(rho >= r) is the tail at
     Smax - S(r), which the exact symmetry of S makes an identity. */
  var AS89 = [0.2274, 0.2531, 0.1745, 0.0758, 0.1033, 0.3932, 0.0879, 0.0151, 0.0072, 0.0831, 0.0131, 4.6e-4];
  function spearAS89(s, n) {
    var b = 1 / n, x = (6 * (s - 1) * b / (n * n - 1) - 1) * Math.sqrt(1 / b - 1), y = x * x;
    var u = x * b * (AS89[0] + b * (AS89[1] + AS89[2] * b)
          + y * (-AS89[3] + b * (AS89[4] + AS89[5] * b)
          - y * b * (AS89[6] + AS89[7] * b - y * (AS89[8] - AS89[9] * b + y * b * (AS89[10] - AS89[11] * y)))));
    return Math.max(0, Math.min(1, u / Math.exp(y / 2) + normQ(x)));
  }
  function spearP(rho, n, tails) {
    var m = (tails === 1 ? 1 : 2), a = Math.abs(rho);
    if (spearExact(n)) return Math.min(1, m * spearUpper(a, n));
    if (!(n > 2) || a > 1) return null;
    return Math.min(1, m * spearAS89(spearMaxS(n) - spearS(a, n), n));
  }

  return { css: css, reducedMotion: reducedMotion, coarsePointer: coarsePointer, grabRadius: grabRadius, rafThrottle: rafThrottle, fit: fit, randn: randn, gauss: gauss, erf: erf, normCdf: normCdf, normQ: normQ, normPdf: normPdf, normInv: normInv, mean: mean, sd: sd, onTheme: onTheme, gammaln: gammaln, gammp: gammp, gammq: gammq, betai: betai, betaiUpper: betaiUpper, fUpper: fUpper, chiSqUpper: chiSqUpper, tUpper: tUpper, tPdf: tPdf, chiSqPdf: chiSqPdf, fPdf: fPdf, tInv: tInv, chiSqInv: chiSqInv, fInv: fInv, nctCdf: nctCdf, ncx2Cdf: ncx2Cdf, ncfCdf: ncfCdf, ncpCI: ncpCI, nctCI: nctCI, varExpCI: varExpCI, vCI: vCI, rCI: rCI, mwuCounts: mwuCounts, mwuLower: mwuLower, mwuCrit: mwuCrit, mwuP: mwuP, wsrCounts: wsrCounts, wsrLower: wsrLower, wsrCrit: wsrCrit, wsrP: wsrP, spearCounts: spearCounts, spearExact: spearExact, spearRho: spearRho, spearUpper: spearUpper, spearCrit: spearCrit, spearP: spearP, spearAS89: spearAS89 };
})();
