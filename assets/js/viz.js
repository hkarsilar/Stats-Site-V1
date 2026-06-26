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

  // High-DPI canvas setup. Returns { ctx, w, h } in CSS pixels.
  function fit(canvas, cssHeight) {
    var ratio = window.devicePixelRatio || 1;
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

  function mean(a) { return a.reduce(function (s, v) { return s + v; }, 0) / a.length; }
  function sd(a) { var m = mean(a); return Math.sqrt(a.reduce(function (s, v) { return s + (v - m) * (v - m); }, 0) / a.length); }

  // Re-run fn whenever the light/dark theme flips (canvas reads CSS vars).
  function onTheme(fn) {
    new MutationObserver(fn).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  return { css: css, fit: fit, randn: randn, gauss: gauss, erf: erf, normCdf: normCdf, normPdf: normPdf, mean: mean, sd: sd, onTheme: onTheme };
})();
