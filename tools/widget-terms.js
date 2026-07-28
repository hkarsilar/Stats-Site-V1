#!/usr/bin/env node
/*
  widget-terms.js — does a lesson's INTERACTIVE print a quantity its PROSE never explains?

  Built in P39 run 17, from that run's own defect. `ml/neural-networks-intuition` shows a
  live readout reading "Epoch 412 · loss 0.031 · 4/4 corners". The word **Epoch** appeared
  nowhere else on the site: not in that lesson's prose, not in any other lesson, not in the
  glossary. A reader watching the number climb had no way to learn what was being counted.
  Nothing could have caught it — `audit.js` checks wiring, `prose-lint.js` reads rendered
  prose (and strips <script> before counting a word), and `faq-audit.js` reads FAQs. The
  strings a widget writes to the page at runtime were an unchecked teaching surface.

  This is step 2 of the P39 prompt ("the richest defect on this site is a term it USES and
  never TEACHES") turned from a hand grep into a scan, scoped inside a single lesson.

  WHAT IT MATCHES, and why it is this narrow
  ------------------------------------------
  A "reported quantity" is a capitalized label that the widget concatenates with a computed
  value: `el.textContent = "Epoch " + epoch + ...`. That shape is the defect. Three earlier
  and broader definitions were measured against the corpus first and all were rejected:

    - every word in every rendered literal          → 282 flags, ~all CSS class names,
                                                      HTML tag names and ordinary English
    - every capitalized word in a rendered literal  → 249 flags, dominated by button verbs
                                                      (Pause, Drag, Reset, Slide, Crank)
    - the same, minus sentence-initial words         → 2 flags, and it MISSED "Epoch", which
                                                      sits at the start of its own literal

  Two properties are load-bearing and should survive any edit:

  1. **Widget chrome is not prose.** `stripViz()` removes every `<div class="viz">` block
     before reading the lesson's prose. Without this the checker is silently useless: the
     widget's own initial markup (`<span id="nn-status">Epoch 0 · untrained</span>`) counts
     as "the lesson explains it", which is exactly how "Epoch" hid. Verified by running the
     scan against the pre-fix tree both ways: with the strip it reports Epoch and nothing
     else; without it, nothing at all.
  2. **Progress counters are excluded by SHAPE, not by name.** `"Score: " + n + " / " + total`
     is a self-test tally, not a taught statistic. The filter keys on the `" / "` literal
     following the interpolated value, so it generalizes to counters nobody has written yet.

  KNOWN FALSE POSITIVES (the residual, all inspected — see ACKED below). Chasing these to
  zero would mean over-fitting the filter to today's corpus, the same mistake VOICE.md
  rule 12 documents for the old British-spelling inventory. Four standing flags that a
  human reads once per run is the right trade.

  KNOWN BLIND SPOT: lowercase labels. `"loss " + x` is not matched, because requiring a
  capital is what holds precision. A lowercase quantity a lesson never explains will be
  missed. Documented rather than smoothed over.

  Editorial health, not build health — like prose-lint.js and faq-audit.js this is
  deliberately NOT wired into audit.js.

  Usage:
    node tools/widget-terms.js                  full report (exit 0 whatever it finds)
    node tools/widget-terms.js --strict         exit 1 on any flag not in ACKED
    node tools/widget-terms.js --lesson <slug>  one lesson, with the literal that flagged
*/

"use strict";
const fs = require("fs");
const path = require("path");

/* Inspected and benign. Each entry says why. Re-check these when a lesson changes;
   a term that stops being benign should be fixed in the lesson, not re-listed here. */
const ACKED = {
  "data/tidy-data": {
    Biology: "a value in the example data table (a course name), not a reported quantity",
    Spring: "a value in the example data table (a term/semester), not a reported quantity"
  },
  "methods/bias-and-blinding": {
    Case: "from the self-test tally \"Cases solved: n / N\"; a progress counter"
  },
  "writing/nonsignificant-results": {
    Calibration: "the self-test's own score label (\"Calibration: n / N\"), not a statistic"
  }
};

const ROOT = process.cwd();

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".claude", "node_modules", "__pycache__"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === "index.html") out.push(p);
  }
  return out;
}

/* Remove every <div class="viz"> … </div> block by div-depth matching.
   The widget's own labels are chrome; they do not teach the term they print. */
function stripViz(h) {
  let out = "", i = 0;
  for (;;) {
    const m = h.slice(i).match(/<div[^>]*class="[^"]*\bviz\b[^"]*"[^>]*>/i);
    if (!m) { out += h.slice(i); break; }
    const start = i + m.index;
    out += h.slice(i, start);
    const base = start + m[0].length;
    let j = base, depth = 1;
    for (const t of h.slice(base).matchAll(/<\/?div\b[^>]*>/gi)) {
      depth += t[0].startsWith("</") ? -1 : 1;
      j = base + t.index + t[0].length;
      if (depth === 0) break;
    }
    i = j;
  }
  return out;
}

function proseOf(h) {
  const b = stripViz(h)
    .replace(/<head[\s\S]*?<\/head>/i, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  return b.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").toLowerCase();
}

/* Capitalized labels the widget concatenates with a computed value. */
function reportedLabels(h) {
  const out = [];
  const scripts = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join("\n");
  for (const st of scripts.matchAll(/(?:textContent|innerHTML|innerText)\s*=\s*([^;]+);/g)) {
    const expr = st[1];
    for (const q of expr.matchAll(/("([^"\\]{1,140})"|'([^'\\]{1,140})')\s*(\+)?/g)) {
      const body = q[2] !== undefined ? q[2] : q[3];
      if (body === undefined) continue;
      if (q[4]) {
        const m = body.match(/([A-Z][a-z]{3,})[^A-Za-z]*$/);
        const rest = expr.slice(q.index + q[0].length);
        const nextLit = rest.match(/^\s*[A-Za-z_$][\w.$[\]()]*\s*\+\s*("|')([^"'\\]{0,12})/);
        const isCounter = nextLit && /^\s*\/\s/.test(nextLit[2]);   // "Label " + n + " / " + total
        if (m && !isCounter) out.push({ term: m[1], lit: body });
      }
      for (const m2 of body.matchAll(/\b([A-Z][a-z]{3,})\s*[:=]?\s*\d/g)) out.push({ term: m2[1], lit: body });
    }
  }
  return out;
}

function explained(prose, term) {
  const c = term.toLowerCase();
  if (prose.includes(c)) return true;
  if (c.endsWith("s") && prose.includes(c.slice(0, -1))) return true;
  if (prose.includes(c + "s")) return true;
  return false;
}

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const only = args.includes("--lesson") ? args[args.indexOf("--lesson") + 1] : null;

const files = walk(ROOT, []).filter(f => /<body[^>]*data-section=/.test(fs.readFileSync(f, "utf8")));
let flagged = 0, unacked = 0, scanned = 0;
const rows = [];

for (const f of files) {
  const slug = path.relative(ROOT, f).replace(/[\\/]index\.html$/, "").replace(/\\/g, "/");
  if (only && !slug.endsWith(only)) continue;
  scanned++;
  const h = fs.readFileSync(f, "utf8");
  const prose = proseOf(h);
  const seen = new Map();
  for (const r of reportedLabels(h)) {
    if (explained(prose, r.term)) continue;
    if (!seen.has(r.term)) seen.set(r.term, r.lit);
  }
  for (const [term, lit] of seen) {
    const ack = ACKED[slug] && ACKED[slug][term];
    flagged++;
    if (!ack) unacked++;
    rows.push({ slug, term, lit, ack });
  }
}

console.log("\nwidget-terms — quantities a lesson's interactive prints but its prose never explains\n");
if (!rows.length) {
  console.log("  no unexplained reported quantities.");
} else {
  for (const r of rows) {
    console.log("  [" + (r.ack ? "ack " : "FLAG") + "] " + r.slug + " → " + r.term);
    if (only || !r.ack) console.log("           literal: \"" + r.lit + "\" + <value>");
    if (r.ack) console.log("           benign: " + r.ack);
  }
}
console.log("\n  lessons scanned: " + scanned + " · flagged: " + flagged + " · not acknowledged: " + unacked);
if (strict && unacked) {
  console.log("\n  FAIL (--strict): " + unacked + " unexplained reported quantity/-ies.\n");
  process.exit(1);
}
console.log("");
