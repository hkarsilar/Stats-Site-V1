#!/usr/bin/env node
/* ============================================================================
   search-reach.js — can the site's own SEARCH find the things the site TEACHES?
   P39 run 22. Zero dependencies (Node built-ins only). Run from the repo root:

     node tools/search-reach.js               # every unreachable term
     node tools/search-reach.js --verbose     # every term with its hit count
     node tools/search-reach.js --term "Cramér's V"   # explain one term
     node tools/search-reach.js --strict      # exit 1 on any miss not in ACKED

   EDITORIAL HEALTH, NOT BUILD HEALTH. Like prose-lint, faq-audit, widget-terms,
   link-promises, advice-terms, untaught-names and worked-examples, this is
   deliberately NOT wired into audit.js and NOT a commit gate.

   WHY IT EXISTS. P39 run 13 found that 87 of 97 lessons were truncated in the
   generated index, so a quarter of the site's prose — including every baked-in
   FAQ answer — could not be found by the site's own search. It was caught by
   hand, by searching the rebuilt index for the terms that run had just added,
   and the prompt has asked every run since to repeat that step. This generalizes
   it from "the handful of terms this run wrote" to "everything the site claims
   to teach", and it runs in about a second.

   THE RULE. assets/js/glossary-data.js is the site's own declaration of what it
   teaches — 262 terms, maintained beside the lessons, read by glossary.html,
   flashcards.html and the index builder. Every headword must be findable in the
   BODY TEXT of at least one indexed page, using the matcher site.js actually
   ships. Zero body hits means one of four things, all worth knowing: the index
   truncated the page that teaches it, the page is missing from the index, the
   term lives only on a surface the builder never reads (software.js's injected
   SPSS/JASP blocks and apa.html's runtime strings are not index sources — an
   open item since run 21), or the search matcher itself cannot reach the string.

   The matcher is LIFTED VERBATIM from site.js by brace-matching, not
   reimplemented. A copy would drift, and the whole question here is what the
   shipped search does. If site.js renames norm/squash/flexChar/flexRe, this
   script fails loudly rather than testing a stale copy.

   BODY TEXT, NOT THE GLOSSARY CARD. glossFind() renders a definition card for
   any glossary term, so scoring against the glossary would pass by construction.
   The question worth asking is whether a PAGE teaches the term.

   TWO STRICTER DEFINITIONS WERE MEASURED AND DISCARDED.
   (a) Splitting compound headwords ("Hit rate & false-alarm rate", "Training
       vs. test data") and requiring each half separately: identical to the
       simple rule on this corpus, 0 misses either way, so the extra machinery
       buys nothing.
   (b) Checking each term against the SPECIFIC lesson its own back-link names
       (`s: "stats-1/hypothesis-testing-logic"`): 46 of 262 flagged, and the
       spot-checks were all phrase artifacts rather than teaching gaps — "Alpha"
       against a lesson that writes α, "Skewness" against one that writes
       "skewed", "1.5 × IQR rule" against one that writes "1.5 × IQR", "k-means
       clustering" against one that writes "k-means" nineteen times. An 18%
       flag rate would need a 46-entry ACKED table, which is the hand-kept
       inventory VOICE.md rule 12 documents as the mistake.

   WHAT IT FOUND ON ITS FIRST RUN. Two genuine defects, both since fixed in
   site.js. "Cramér's V" — taught in five lessons and emitted by apa.html —
   returned ZERO hits whether or not the reader typed the accent, because norm()
   strips diacritics from the query while the corpus is matched raw; ACCENT_FOLD
   closes that. And "Wilks lambda" returned nothing because the site writes
   "Wilks' Λ (lambda)", a gap no flat one-separator budget can cross; flexRe now
   allows up to three separators at the reader's own word boundaries, which also
   fixed "90% CI", an item run 21 measured and left.

   KNOWN BLIND SPOTS, stated rather than smoothed over. A term the glossary does
   not carry is invisible here — this measures reach, not coverage. A term found
   in ONE page passes even if the page that ought to teach it is truncated. And
   a term reachable only through a page's keyword list (`kw` in SEARCH_PAGES)
   still counts as a body hit for pages, which is right for the reader and loose
   for the index.

   If it fires: fix the index, the page, or the matcher — not the check.
   ========================================================================== */

"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");

/* Acknowledged-benign misses: term -> why the site owes no body-text hit.
   EMPTY TODAY, and it should stay short. A new entry means conceding that
   something in the glossary is not taught on any page. */
const ACKED = {};

/* ---------- lift the shipped matcher out of site.js ---------- */
function braceBlock(src, startIdx) {
  let i = src.indexOf("{", startIdx), depth = 0;
  for (let k = i; k < src.length; k++) {
    if (src[k] === "{") depth++;
    else if (src[k] === "}") { depth--; if (!depth) return src.slice(startIdx, k + 1); }
  }
  throw new Error("unbalanced braces from index " + startIdx);
}
function liftMatcher() {
  const src = fs.readFileSync(path.join(ROOT, "assets/js/site.js"), "utf8");
  const decls = [/var RE_DIA = [^;]+;/, /var ACCENT_FOLD = \{[\s\S]*?\};/].map(re => {
    const m = src.match(re);
    if (!m) throw new Error("site.js no longer declares " + re + " — update this script");
    return m[0];
  });
  const fns = ["norm", "squash", "flexChar", "flexRe"].map(n => {
    const i = src.indexOf("function " + n + "(");
    if (i < 0) throw new Error("site.js no longer defines " + n + "() — update this script");
    return braceBlock(src, i);
  });
  const sb = {};
  vm.createContext(sb);
  vm.runInContext(decls.join("\n") + "\n" + fns.join("\n"), sb);
  return sb;
}

/* ---------- load the glossary + the generated index ---------- */
function loadData() {
  const c = { window: {} };
  vm.createContext(c);
  for (const f of ["assets/js/glossary-data.js", "assets/js/search-index.js"]) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) { console.error("missing " + f + " — run tools/build-search-index.py"); process.exit(2); }
    vm.runInContext(fs.readFileSync(p, "utf8"), c);
  }
  return { glossary: c.window.GLOSSARY || [], index: c.window.SEARCH_INDEX || {} };
}

/* the headword is what glossFind() matches on: everything before a parenthesis */
function headword(term) { return String(term).split("(")[0].trim(); }

function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes("--strict");
  const verbose = argv.includes("--verbose");
  const ti = argv.indexOf("--term");
  const only = ti >= 0 ? argv[ti + 1] : null;

  const M = liftMatcher();
  const { glossary, index } = loadData();

  const bodies = [];
  for (const slug of Object.keys(index.lessons || {})) bodies.push({ id: slug, txt: index.lessons[slug] });
  for (const p of index.pages || []) bodies.push({ id: p.u || p.url || "(page)", txt: p.txt || "" });

  if (!glossary.length || !bodies.length) {
    console.error("nothing to check — glossary or index came back empty");
    process.exit(2);
  }

  /* index freshness: audit.js errors on this, so here it is only a note */
  const idxAge = fs.statSync(path.join(ROOT, "assets/js/search-index.js")).mtimeMs;
  const glossAge = fs.statSync(path.join(ROOT, "assets/js/glossary-data.js")).mtimeMs;
  const stale = glossAge > idxAge;

  const rows = [];
  for (const g of glossary) {
    const head = headword(g.t);
    if (only && String(g.t).toLowerCase().indexOf(String(only).toLowerCase()) < 0) continue;
    const re = M.flexRe(M.norm(head));
    const where = [];
    if (re) for (const b of bodies) if (re.test(b.txt)) where.push(b.id);
    rows.push({ term: g.t, head, re, where });
  }

  if (only) {
    if (!rows.length) { console.log("no glossary term matching " + JSON.stringify(only)); process.exit(0); }
    for (const r of rows) {
      console.log("\n" + r.term);
      console.log("  searched as : " + r.head);
      console.log("  pattern     : " + (r.re ? r.re.source : "(empty)"));
      console.log("  body hits   : " + r.where.length + (r.where.length ? "  — " + r.where.slice(0, 8).join(", ") + (r.where.length > 8 ? ", …" : "") : ""));
    }
    console.log("");
    process.exit(0);
  }

  const misses = rows.filter(r => !r.where.length);
  const unacked = misses.filter(r => !(r.term in ACKED));

  console.log("");
  console.log("search reach — " + rows.length + " glossary terms against " + bodies.length + " indexed bodies");
  if (stale) console.log("  NOTE: glossary-data.js is newer than search-index.js — rerun tools/build-search-index.py");
  console.log("");

  if (verbose) {
    rows.slice().sort((a, b) => a.where.length - b.where.length)
      .forEach(r => console.log("  " + String(r.where.length).padStart(4) + "  " + r.term));
    console.log("");
  }

  if (!misses.length) {
    console.log("  every term the glossary declares is reachable in at least one page's body text.");
  } else {
    console.log("  UNREACHABLE (" + misses.length + "):");
    for (const r of misses) {
      const ack = ACKED[r.term];
      console.log("   • " + r.term + "   [searched: " + r.head + "]" + (ack ? "\n       ACKED: " + ack : ""));
    }
  }

  const thin = rows.filter(r => r.where.length === 1);
  console.log("");
  console.log("  reachable on exactly one page: " + thin.length + " terms" + (thin.length && verbose ? " (" + thin.map(r => r.term).join(", ") + ")" : ""));
  console.log("");

  if (strict && unacked.length) {
    console.log("FAIL — " + unacked.length + " unreachable term(s) not in ACKED.");
    process.exit(1);
  }
  console.log((strict ? "PASS" : "done") + " — " + misses.length + " unreachable, " + (misses.length - unacked.length) + " acknowledged.");
  console.log("");
}

main();
