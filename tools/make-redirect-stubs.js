#!/usr/bin/env node
/* ============================================================
   Regenerate the redirect stubs left behind by the four-courses-
   to-three restructure. ONE map, one template, 25 files.

   Run from the repo root:
       node tools/make-redirect-stubs.js            # write the stubs
       node tools/make-redirect-stubs.js --check    # verify only, exit 1 on drift

   Why stubs at all: statscapybara.com is on GitHub Pages, which serves
   static files and cannot issue a 301 — there is no _redirects,
   vercel.json or .htaccess equivalent. A stub is the only redirect this
   host can perform, so it has to do the whole job:

     - meta refresh, delay 0, FIRST in the head so it is parsed as early
       as possible. This is what forwards a reader with JavaScript off.
     - robots noindex + canonical, so search engines treat the old URL as
       a permanent move rather than indexing the stub.
     - a JS location.replace that forwards location.search and
       location.hash. The meta refresh alone DROPS the query string, and
       old ?embed=1 iframes and SC.preset deep links depend on it. It is
       relative, so it still resolves under subpath hosting.
     - the visible sentence and link, the fallback for anyone whose
       browser blocks both.

   No stub may target another stub. --check enforces that, along with
   every field above, so a chain can never be introduced by editing MAP.
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

/* old path -> new path. Exact pairs only: never a wildcard. A rule like
   stats-3/* -> stats-2/* would move the whole of Stats 3 and break the site. */
const MAP = [
  ["stats-2/chi-square-tests", "stats-1/chi-square-tests"],
  ["stats-2/correlation", "stats-1/correlation"],
  ["stats-2/simple-linear-regression", "stats-1/simple-linear-regression"],
  ["stats-1/effect-size-and-power", "stats-3/effect-size-and-power"],
  ["stats-3/multiple-regression", "stats-2/multiple-regression"],
  ["stats-3/multicollinearity-and-variable-selection", "stats-2/multicollinearity-and-variable-selection"],
  ["stats-3/categorical-predictors-and-dummy-coding", "stats-2/categorical-predictors-and-dummy-coding"],
  ["stats-3/ancova", "stats-2/ancova"],
  ["stats-3/interactions-in-regression", "stats-2/interactions-in-regression"],
  ["stats-3/logistic-regression", "stats-2/logistic-regression"],
  ["stats-3/assumptions-of-regression", "stats-2/assumptions-of-regression"],
  ["stats-3/model-comparison", "stats-2/model-comparison"],
  ["stats-4/bootstrap-and-resampling", "stats-3/bootstrap-and-resampling"],
  ["stats-4/bayesian-thinking", "stats-3/bayesian-thinking"],
  ["stats-4/bayesian-estimation", "stats-3/bayesian-estimation"],
  ["stats-4/generalized-linear-models", "stats-3/generalized-linear-models"],
  ["stats-4/mixed-and-multilevel-models", "stats-3/mixed-and-multilevel-models"],
  ["stats-4/cross-validation-and-overfitting", "stats-3/cross-validation-and-overfitting"],
  ["stats-4/causal-dags-and-confounding", "stats-3/causal-dags-and-confounding"],
  ["stats-4/survival-analysis", "stats-3/survival-analysis"],
  ["stats-4/missing-data", "stats-3/missing-data"],
  ["stats-4/meta-analysis", "stats-3/meta-analysis"],
  ["stats-4/psychometric-functions", "stats-3/psychometric-functions"],
  ["stats-4/signal-detection-theory", "stats-3/signal-detection-theory"],
  ["stats-4", "stats-3"],
];

const SITE = "https://statscapybara.com";
const OLD_PATHS = new Set(MAP.map(([o]) => o));

function stub(oldPath, newPath) {
  const depth = oldPath.split("/").length;      // 2 for a lesson, 1 for stats-4/
  const rel = "../".repeat(depth) + newPath + "/";
  const abs = "/" + newPath + "/";
  const label = "statscapybara.com/" + newPath + "/";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved — StatsCapybara</title>
<meta http-equiv="refresh" content="0; url=${abs}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${SITE}${abs}">
<script>location.replace("${rel}" + location.search + location.hash);</script>
</head>
<body>
<p>This lesson has moved to
<a href="${rel}">${label}</a>.</p>
</body>
</html>
`;
}

const check = process.argv.includes("--check");
let changed = 0, bad = 0;

for (const [oldPath, newPath] of MAP) {
  if (OLD_PATHS.has(newPath)) {                 // a chain would strand the reader
    console.error(`CHAIN: ${oldPath} targets ${newPath}, which is itself a stub`);
    bad++; continue;
  }
  const target = path.join(ROOT, newPath, "index.html");
  if (!fs.existsSync(target)) {
    console.error(`DEAD TARGET: ${oldPath} -> ${newPath} (no page there)`);
    bad++; continue;
  }
  const file = path.join(ROOT, oldPath, "index.html");
  const want = stub(oldPath, newPath);
  const have = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (have === want) continue;
  if (check) { console.error(`DRIFTED: ${oldPath}/index.html`); bad++; continue; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, want);
  changed++;
}

if (bad) { console.error(`\nFAIL — ${bad} problem(s) across ${MAP.length} stubs.`); process.exit(1); }
console.log(check
  ? `PASS — all ${MAP.length} redirect stubs match the map, no chains, no dead targets.`
  : `wrote ${changed} of ${MAP.length} redirect stubs (${MAP.length - changed} already correct).`);
