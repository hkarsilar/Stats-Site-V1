#!/usr/bin/env node
/* ============================================================================
   advice-terms.js — does the site's own ADVICE name a thing its PROSE never
   teaches?  (P39 run 19)

   The advice surfaces are `software.js`'s APA sentences and tips and
   `checks.js`'s question + why: places where the site, in its own voice, tells
   a reader to report a statistic or tick a box.  Nothing checked that the
   things named there are ever explained anywhere.  Run 19 found three by hand:
   `rank-biserial`, which the JASP tip told readers to report and which
   appeared in exactly one file on the whole site (that tip); `HC3`, offered as
   the fix for heteroscedasticity with no page saying what a
   heteroscedasticity-consistent standard error is; and `WCSS`, used cold in a
   k-means answer.

   This is the ADVICE counterpart to `widget-terms.js`, which asks the same
   question of the strings a lesson's INTERACTIVE prints.  Both exist because
   `prose-lint.js` strips `<script>` before it counts a word, so neither
   surface reaches any prose checker.

   THE RULE.  Pull the technical NAMES out of the advice (a hyphenated compound
   like `rank-biserial`, or an acronym like `HC3`/`REML`), then require that the
   site's rendered prose contains them.  Two gates carry the precision, and both
   were arrived at by measuring the corpus rather than by taste:

   1. SCOPE: tips + APA sentences + check questions and whys, and NOT the
      SPSS/JASP menu steps or the code inside `snippets.js`.  A menu label and a
      function name are QUOTATIONS from the software's own interface; the site
      is not obliged to teach `ZRESID` or `ncvTest`, and including steps put
      exactly those on the list (8 flags, ~2 genuine).  Tips and whys are the
      site speaking, so a word there is a promise.
   2. STEM GATE: a part is "untaught" only when the prose contains neither the
      word itself NOR any word sharing its first five letters.  Without it,
      ordinary English compounds flood the report — `near-powerless`,
      `self-efficacy`, `between-stratum`, `non-existent` — because the exact
      form is absent while the site plainly knows the word.  Measured: 7 flags
      without the gate, 3 with it, and both genuine defects survive.

   KNOWN BLIND SPOT, stated rather than smoothed over: an untaught term made of
   ORDINARY words is invisible here.  The `snippets.js` comment reading
   "# formal heteroscedasticity test" above a `car::ncvTest()` call promises a
   named test the site never names, and every word in that comment is common.
   Catching that needs a different instrument.

   Editorial health, not build health, so like prose-lint / faq-audit /
   widget-terms / link-promises this is deliberately NOT part of audit.js.

   Usage:
     node tools/advice-terms.js               # full report
     node tools/advice-terms.js --surface software.js
     node tools/advice-terms.js --strict      # exit 1 on any flag not in ACKED
   ============================================================================ */

"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

/* Acknowledged benign — a flag that is genuinely not a taught quantity.
   Keep this SHORT.  A new unexplained term should fire, not be filtered away. */
const ACKED = {
  "self-defeating": "ordinary English in a debriefing answer, not a statistic"
};

const args = process.argv.slice(2);
const STRICT = args.includes("--strict");
const only = (function () { const i = args.indexOf("--surface"); return i >= 0 ? args[i + 1] : null; })();

/* ---------- the prose corpus: every rendered word on the site ---------- */
function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "node_modules" || e.name === "_site") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}
function renderedProse() {
  let s = "";
  for (const f of walk(ROOT, [])) {
    let h = fs.readFileSync(f, "utf8");
    // <script> goes first: a quiz distractor or a widget label is not teaching,
    // and software.js/checks.js are injected at runtime, so dropping scripts is
    // also what keeps the advice surfaces from vouching for themselves.
    h = h.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
    s += " " + h.replace(/<[^>]+>/g, " ");
  }
  return s;
}
const WORDS = new Set(renderedProse().toLowerCase().match(/[a-z]+\d*/g) || []);
const STEMS = new Set([...WORDS].filter(w => w.length >= 5).map(w => w.slice(0, 5)));
function untaught(w) {
  if (WORDS.has(w)) return false;
  return !(w.length >= 5 && STEMS.has(w.slice(0, 5)));
}

/* ---------- the advice surfaces ---------- */
function load(rel, global_) {
  delete require.cache[require.resolve(path.join(ROOT, rel))];
  global.window = {};
  require(path.join(ROOT, rel));
  return global.window[global_];
}
const surfaces = [];
const SOFTWARE = load("assets/js/software.js", "SOFTWARE");
for (const slug in SOFTWARE) {
  const e = SOFTWARE[slug];
  if (e.apa) surfaces.push({ src: "software.js", slug, text: e.apa });
  (e.tips || []).forEach(t => surfaces.push({ src: "software.js", slug, text: t }));
}
const CHECKS = load("assets/js/checks.js", "CHECKS");
for (const slug in CHECKS) {
  CHECKS[slug].forEach(q => surfaces.push({ src: "checks.js", slug, text: q.q + " " + q.why }));
}

/* ---------- scan ---------- */
const HYPHEN = /\b([A-Za-z]{3,})[-‑–](\w*[A-Za-z]{3,})\b/g;
const ACRONYM = /\b([A-Z]{3,}\d?|[A-Z]{2,}\d)\b/g;

const flags = new Map();          // term -> { src, slugs:Set, why }
let scanned = 0;

for (const s of surfaces) {
  if (only && s.src !== only) continue;
  scanned++;
  const txt = s.text.replace(/<[^>]+>/g, " ");
  for (const m of txt.matchAll(HYPHEN)) {
    const parts = [m[1].toLowerCase(), m[2].toLowerCase()];
    const miss = parts.filter(untaught);
    if (!miss.length) continue;
    const k = m[0];
    if (!flags.has(k)) flags.set(k, { src: s.src, slugs: new Set(), why: "part not in any prose: " + miss.join(", ") });
    flags.get(k).slugs.add(s.slug);
  }
  for (const m of txt.matchAll(ACRONYM)) {
    if (!untaught(m[1].toLowerCase())) continue;
    const k = m[1];
    if (!flags.has(k)) flags.set(k, { src: s.src, slugs: new Set(), why: "acronym never expanded in prose" });
    flags.get(k).slugs.add(s.slug);
  }
}

/* ---------- report ---------- */
const line = "─".repeat(60);
console.log("\n" + line);
console.log("advice-terms — named things the site's advice uses and its prose never teaches");
console.log(line);
console.log(`scanned ${scanned} advice strings against ${WORDS.size} distinct prose words\n`);

let live = 0;
if (!flags.size) console.log("  no flags.");
for (const [term, info] of [...flags].sort((a, b) => a[0].localeCompare(b[0]))) {
  const ack = Object.prototype.hasOwnProperty.call(ACKED, term);
  if (!ack) live++;
  console.log(`  ${ack ? "[ok  ]" : "[FLAG]"} ${term}`);
  console.log(`         ${info.src} · ${[...info.slugs].join(", ")}`);
  console.log(`         ${ack ? "acked: " + ACKED[term] : info.why}`);
}

console.log("\n" + line);
console.log(`${flags.size} flag(s), ${live} not acknowledged.`);
console.log("If one fires, teach the term somewhere in prose; only add to ACKED");
console.log("when the word genuinely is not a quantity the site owes an explanation.");
console.log(line + "\n");

if (STRICT && live > 0) process.exit(1);
