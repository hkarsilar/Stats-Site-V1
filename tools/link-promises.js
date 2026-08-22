#!/usr/bin/env node
/*
  tools/link-promises.js — does a cross-link deliver what its wording promises?

  WHY THIS EXISTS (P39 run 18). `audit.js` proves every internal link resolves on
  disk and that any `#fragment` names a real id. Neither check can see the failure
  this run found by hand: `stats-3/power-analysis-for-complex-designs` sends readers
  to `stats-3/mixed-and-multilevel-models` for "the intraclass correlation", and
  that page contained the term ZERO times. P39 run 2 had swapped away the FAQ answer
  that held it, sixteen runs earlier, and nothing noticed. The href was fine; the
  promise was not. Call the class a BROKEN PROMISE.

  THE RULE. Take a prose link's anchor text, reduce it to its single most
  DISTINCTIVE content word (lowest document frequency across the site), and require
  that word to appear in the destination page's rendered prose. Distinctiveness is
  what makes this precise: an anchor almost always paraphrases ("repeated
  measurements within people" -> the RM-ANOVA lesson), so demanding the whole
  phrase is hopeless and demanding ANY word is toothless, because the common word
  in a paraphrase is on nearly every page. The rare word IS the promise.

  MEASURED, NOT ASSUMED (numbers in ROADMAP.md's run-18 note). Four broader rules
  were run against the corpus and discarded: deleting hyphens rather than splitting
  on them gave 174 flags of hyphenated test names; keeping card and sentence-length
  anchors gave 78; dropping the glossary gate gave 40, almost all ordinary English
  words that happen to be rare here ("scratch", "chooser", "lean"); and widening the
  promise to the six words BEFORE the link gave 71, because a mid-sentence fragment
  promises nothing coherent.

  KNOWN BLIND SPOT, stated rather than smoothed over. The promise has to be in the
  anchor text. The original stats-3 link says the words "intraclass correlation" in
  the sentence but wraps them around an anchor reading "multilevel models", which
  the target does contain, so this check does not catch that exact link; the
  lead-in experiment above is why it does not try to. What it does catch is the same
  defect wherever the promise is the thing clicked, which on its first run over 472
  prose links turned up two genuinely mis-targeted ones that nobody knew about:
  "k-nearest-neighbors" pointing at the regularization lesson, and "GRIM" pointing
  at the replication-crisis lesson instead of fraud-and-self-correction.

  SCOPE. Source pages: lessons, guides and course landing pages. Targets: any
  internal page on the site. Link text inside `.lesson-toc`, `.chome-list`,
  `.ds-index` and the prev/next nav is chrome, not prose, and is skipped.

  Not in audit.js, for prose-lint.js's reason: this is editorial health, not build
  health, and a legitimately re-worded page can trip it.

    node tools/link-promises.js                 # full report
    node tools/link-promises.js --page <path>   # one source page, every link
    node tools/link-promises.js --strict        # exit 1 on any flag not in ACKED
*/
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const STRICT = args.includes("--strict");
const ONLY = (() => { const i = args.indexOf("--page"); return i >= 0 ? args[i + 1] : null; })();

/* Acknowledged benign flags: anchor wording that is deliberately not repeated at
   the destination. Keep this SHORT — a growing table means the rule is wrong.
   Format: "<source page> -> <target page> :: <promise word>" */
const ACKED = new Set([
  // The anchor paraphrases; the destination uses the sibling word and teaches the
  // thing. Both were read and judged, not silenced by a pattern.
  'stats-2/one-way-anova/index.html -> stats-2/factorial-anova-two-way/index.html :: multiple',   // "multiple factors" ~ that page's "two factors"
  'ml/clustering-kmeans/index.html -> stats-2/one-way-anova/index.html :: cluster'                // "within-cluster spread" ~ ANOVA's "within-group" variance
]);

/* ---------------- page inventory ---------------- */
global.window = {};
require(path.join(ROOT, "assets/js/curriculum.js"));

const SOURCES = [];
window.CURRICULUM.forEach(c => {
  SOURCES.push(c.slug + "/index.html");
  c.sections.forEach(s => { if (s.ready) SOURCES.push(c.slug + "/" + s.slug + "/index.html"); });
});
fs.readdirSync(path.join(ROOT, "guides")).forEach(g => {
  const p = "guides/" + g + "/index.html";
  if (fs.existsSync(path.join(ROOT, p))) SOURCES.push(p);
});

/* ---------------- text extraction ---------------- */
const STOP = new Set(("the a an and or but of in on to for with from by as at is are was were be been " +
  "this that these those it its their your our his her they them you we i not no yes if then than " +
  "when where which who whom what how why all any each some more most other another same such only " +
  "own here there now also very can will just do does did done have has had into over under between " +
  "about above below after before again once both few many much own too s t don now lesson lessons " +
  "page pages section sections see read below above one two three").split(/\s+/));

function rendered(file) {                    // rendered prose of a page (no script/style/head)
  let h = fs.readFileSync(path.join(ROOT, file), "utf8");
  h = h.replace(/<head[\s\S]*?<\/head>/gi, " ")
       .replace(/<script[\s\S]*?<\/script>/gi, " ")
       .replace(/<style[\s\S]*?<\/style>/gi, " ")
       .replace(/<!--[\s\S]*?-->/g, " ")
       .replace(/<[^>]+>/g, " ")
       .replace(/&[a-z]+;|&#\d+;/gi, " ");
  return h.replace(/\s+/g, " ").toLowerCase();
}

/* A hyphen is a SEPARATOR, not a character to delete, and both sides must agree.
   Deleting it turned "independent-samples" into one token "independentsamples",
   which never matches a page that writes "Independent Samples" with a space —
   and the site does exactly that in several lesson titles. Splitting instead
   took the scan from 78 flags of hyphenated test names down to real ones. */
function words(text) {
  return (text.replace(/-/g, " ").match(/[a-z]+/g) || [])
    .filter(w => w.length >= 4 && !STOP.has(w));
}

/* ---------------- document frequency over every page on the site ---------------- */
function allPages() {
  const out = new Set(SOURCES);
  for (const f of fs.readdirSync(ROOT)) if (f.endsWith(".html") && f !== "offline.html" && f !== "404.html") out.add(f);
  return [...out];
}
const PAGES = allPages();
const TEXT = {};                              // page -> rendered prose
const DF = new Map();                         // word -> number of pages containing it
for (const p of PAGES) {
  TEXT[p] = rendered(p);
  for (const w of new Set(words(TEXT[p]))) DF.set(w, (DF.get(w) || 0) + 1);
}
const DF_CEILING = Math.ceil(PAGES.length * 0.40);   // a word on 40%+ of pages promises nothing

/* A promise word must name a CONCEPT the site teaches, and the site already keeps
   that list: `glossary-data.js`, its single source of truth for terminology.
   Rarity alone is the wrong axis — "scratch", "chooser", "lean" and "untidy" are
   all rarer here than "intraclass" and none of them promises anything. Gating on
   the glossary took the scan from 40 flags to a handful, every one worth reading.
   KNOWN BLIND SPOT, stated rather than smoothed over: a real concept that is not
   in the glossary is invisible to this check. That is the intended trade, and the
   fix for a missed one is to add the term to the glossary, which the site wants
   anyway. */
require(path.join(ROOT, "assets/js/glossary-data.js"));
const TERMS = new Set();
(window.GLOSSARY || []).forEach(g => (g.items || g.terms || []).forEach(t => {
  words(String(t.t || "").toLowerCase()).forEach(w => TERMS.add(w));
}));
if (!TERMS.size) {                            // flat array form
  (window.GLOSSARY || []).forEach(t => words(String(t.t || "").toLowerCase()).forEach(w => TERMS.add(w)));
}

/* target prose lookup, tolerant of plurals and hyphenation */
const SPACED = new Map();
function spaced(text) {
  let s = SPACED.get(text);
  if (s === undefined) { s = text.replace(/-/g, " "); SPACED.set(text, s); }
  return s;
}
function present(targetText, w) {
  const bag = spaced(targetText);
  const variants = [w, w + "s", w + "es", w.replace(/s$/, ""), w.replace(/e$/, "ing"), w.replace(/ing$/, "e"), w.replace(/ing$/, "")];
  for (const v of variants) {
    if (v.length < 4) continue;
    if (new RegExp("(^|[^a-z])" + v).test(bag)) return true;   // prefix match: plural/inflected forms
  }
  return false;
}

/* ---------------- link extraction ---------------- */
const CHROME = /\b(lesson-toc|chome-list|ds-index|lesson-nav|sidebar|tool-card|chome-tools|btn|pb-xref)\b/;
const MAX_ANCHOR_WORDS = 6;   // a prose link promises a term; a card promises a paragraph

function linksOf(file) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const a = html.indexOf('<article');
  const body = a < 0 ? html : html.slice(a);
  const depth = file.split("/").length - 1;
  const out = [];
  for (const m of body.matchAll(/<a\s+([^>]*?)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = m[1] + m[3];
    if (CHROME.test((attrs.match(/class="([^"]*)"/) || ["", ""])[1])) continue;
    const href = m[2];
    if (/^(https?:|mailto:|tel:|#)/.test(href)) continue;
    const text = m[4].replace(/<[^>]+>/g, " ").replace(/&[a-z]+;|&#\d+;/gi, " ").replace(/\s+/g, " ").trim();
    if (text.split(" ").length > MAX_ANCHOR_WORDS) continue;
    let t = href.split("#")[0].split("?")[0];
    if (!t) continue;
    let target = path.posix.normalize(path.posix.join(path.posix.dirname(file), t));
    if (target.endsWith("/")) target += "index.html";
    if (!/\.html$/.test(target)) target = path.posix.join(target, "index.html");
    out.push({ href, text, target, depth });
  }
  return out;
}

/* ---------------- scan ---------------- */
let flags = [], checked = 0, skippedGeneric = 0, missingTarget = 0;
const scan = ONLY ? SOURCES.filter(s => s.startsWith(ONLY.replace(/\/$/, ""))) : SOURCES;

for (const src of scan) {
  for (const L of linksOf(src)) {
    if (L.target === src) continue;
    if (!TEXT[L.target]) {
      if (!fs.existsSync(path.join(ROOT, L.target))) { missingTarget++; continue; }
      TEXT[L.target] = rendered(L.target);
    }
    const cand = [...new Set(words(L.text.toLowerCase()))]
      .filter(w => TERMS.has(w) && DF.has(w) && DF.get(w) <= DF_CEILING)
      .sort((x, y) => DF.get(x) - DF.get(y));
    if (!cand.length) { skippedGeneric++; if (ONLY) console.log("  skip (no distinctive word):", JSON.stringify(L.text), "->", L.target); continue; }
    const promise = cand[0];
    checked++;
    const ok = present(TEXT[L.target], promise);
    if (ONLY) console.log("  " + (ok ? "ok  " : "FLAG") + "  " + JSON.stringify(L.text) + " -> " + L.target + "   [" + promise + ", df " + DF.get(promise) + "]");
    if (!ok) flags.push({ src, target: L.target, text: L.text, promise, df: DF.get(promise) });
  }
}

const key = f => f.src + " -> " + f.target + " :: " + f.promise;
const live = flags.filter(f => !ACKED.has(key(f)));

if (!ONLY) {
  console.log("StatsCapybara link promises — " + scan.length + " source pages · " + checked +
              " prose links carrying a distinctive word (" + skippedGeneric + " navigational, skipped)");
  console.log("a link's promise = the rarest content word in its anchor text (document frequency ≤ " +
              DF_CEILING + " of " + PAGES.length + " pages)");
  console.log("─".repeat(96));
  if (!flags.length) console.log("no broken promises.");
  for (const f of flags) {
    console.log((ACKED.has(key(f)) ? "[ackd] " : "[FLAG] ") + f.src);
    console.log("        anchor " + JSON.stringify(f.text) + " -> " + f.target);
    console.log("        promises \"" + f.promise + "\" (df " + f.df + "), which that page never uses");
  }
  console.log("─".repeat(96));
  console.log(flags.length + " flagged, " + (flags.length - live.length) + " acknowledged, " + live.length + " live");
}
if (STRICT && live.length) process.exit(1);
