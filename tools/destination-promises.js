#!/usr/bin/env node
/*
 * destination-promises.js — does a prescription's OWN destination deliver it?
 * --------------------------------------------------------------------------
 * P39 run 25. Editorial health, not build health: deliberately NOT part of
 * tools/audit.js and NOT a commit gate. Run it, read it, use your judgment.
 *
 * WHY THIS EXISTS
 * ---------------
 * The site has three checkers on either side of this question and a gap between
 * them. audit.js proves every internal link resolves on disk and that a
 * #fragment names a real id. link-promises.js (run 18) asks whether a link's
 * ANCHOR TEXT is delivered at the far end. prescription-terms.js (run 23) asks
 * whether a prescribed method is taught ANYWHERE on the site. None of them asks
 * the question a reader actually asks: I did what this row told me to do, I
 * clicked the section it named, and is the thing it told me to do in there?
 *
 * Run 25 found the shape by hand. cheat-assumptions.html's independence row
 * prescribes "McNemar's test for paired / repeated data" and points at §2.7,
 * and §2.7 did not contain the word McNemar. prescription-terms.js passed it,
 * correctly by its own rule: ml/train-test-split-and-generalization writes
 * "McNemar's test" in its prose, so the site does teach it — just not on the
 * page this poster sends you to. link-promises.js passed it too, because the
 * promise is in a SIBLING CELL rather than in the anchor, which reads "2.7".
 *
 * On its first run it found a second instance nobody knew about: the same
 * poster's normality row prescribes Mann-Whitney, Kruskal-Wallis and Dunn's
 * test and badged §2.5, which teaches none of the three (§2.6 does).
 *
 * THE RULE
 * --------
 * Take every authored UNIT that names both a method and a lesson: a <tr> or
 * <li> in a prescription surface, or a JS string literal in which-test.html /
 * plan.html that carries a lesson link. Pull the method names out of the unit's
 * text and require at least one of the lessons the unit itself links to name
 * that method in its own prose.
 *
 * WHY THIS IS NOT THE PER-DESTINATION GATING RUN 22 REJECTED
 * ----------------------------------------------------------
 * Run 22 measured a checker that guessed a term's destination from a glossary
 * back-link and got an 18% flag rate of pure phrase artifacts, needing a
 * 46-entry allow-list. The difference here is that NOBODY GUESSES: the unit
 * names its own destination, in the same row the author wrote. There is no
 * inference to be wrong about, which is why the flag rate is a tenth of that
 * on the same kind of corpus.
 *
 * MEASURED, NOT GUESSED
 * ---------------------
 * (a) THE UNIT MUST BE THE SMALLEST AUTHORED CHUNK. Widening it to the enclosing
 *     <table> or <section> lets a neighbouring row's link satisfy this row's
 *     promise, which is exactly the defect: the poster's normality row sits two
 *     rows from one badged §2.6, and a table-sized unit reports nothing at all.
 * (b) A SHAPE-2 NAME MUST NOT START MID-COMPOUND. "Use the Kruskal-Wallis test"
 *     yields the compound Kruskal-Wallis (shape 1) and also "Wallis test"
 *     (shape 2), whose destination gate then fails on a lesson that teaches
 *     Kruskal-Wallis nineteen times. Suppressing a shape-2 candidate preceded by
 *     a hyphen took the corpus from 4 flags to 3 and cost no genuine one.
 * (c) NAME EXTRACTION IS prescription-terms.js's, deliberately. Its two shapes
 *     were measured against this same corpus (22 flags for bare capitals, 10
 *     after a stem gate, 1 for compound-or-head-noun), and reproducing that
 *     measurement here would only let the two drift apart. Dash and apostrophe
 *     normalization are load-bearing for the same reasons runs 20 and 23 found.
 *
 * KNOWN BLIND SPOTS, stated rather than smoothed over:
 *   - A prescription in ORDINARY LOWERCASE WORDS is invisible, inherited from
 *     the name shapes. The poster's own "no hidden clustering" row is the live
 *     example: nothing here can see it, and run 25 found it by reading.
 *   - A unit with NO link is not checked. Silence about where to read is a
 *     different defect from pointing at the wrong place; prescription-terms.js
 *     covers whether the site teaches it at all.
 *   - The destination is checked as a WHOLE PAGE, not the #fragment the link
 *     names. A row pointing at #the-wrong-section of the right lesson passes.
 *
 * If it fires, retarget the link or teach the method at the destination. Only
 * add to ACKED when the pairing is genuinely fine.
 *
 * Usage:
 *   node tools/destination-promises.js                  # full report
 *   node tools/destination-promises.js --verbose        # every pair, matched or not
 *   node tools/destination-promises.js --surface plan.html
 *   node tools/destination-promises.js --strict         # exit 1 on any flag not in ACKED
 */

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

/* Acknowledged-benign flags: "surface | name" -> why it is fine.
   Empty on the run that shipped this. Keep it empty if you can. */
const ACKED = {};

/* Prescription surfaces: the places the site says "do this, read that". */
const SURFACES = ['cheat-apa.html', 'cheat-assumptions.html', 'cheat-test-chooser.html',
  'problems.html', 'which-test.html', 'plan.html'];

/* Files whose JS string literals are authored units too (their decision-tree
   leaves and plan cards live in the inline script, not in markup). */
const JS_UNIT_FILES = new Set(['which-test.html', 'plan.html']);

/* Method head nouns — kept identical to prescription-terms.js on purpose. */
const HEAD = ['test', 'tests', 'correction', 'corrections', 'ANOVA', 'HSD',
  'procedure', 'adjustment', 'method', 'statistic', 'distribution', 'rule',
  'criterion', 'estimator', 'regression', 'residual', 'residuals', 'trace',
  'lambda', 'alpha', 'kappa', 'd', 'V', 'U', 'W', 'Q', 't'];

const COURSES = 'stats-[1-4]|ml|methods|data|writing|ethics';
const LINK = new RegExp('href=\\\\?"((?:\\.\\./)*(?:' + COURSES + ')/[a-z0-9-]+/)(?:#[a-z0-9-]+)?\\\\?"', 'g');

/* --- text helpers ------------------------------------------------------- */

/* Curly quotes and every dash collapse to ASCII. Load-bearing: the same name is
   written three ways across these files (run 20 on apostrophes, 23 on dashes). */
const norm = s => s.replace(/[‘’]/g, "'")
                   .replace(/[–—−]/g, '-')
                   .replace(/\s+/g, ' ');

const textify = html => norm(
  html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&[a-z]+;/g, ' '));

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* --- name extraction (prescription-terms.js's two shapes) --------------- */

function methodNames(text) {
  const t = norm(text);
  const out = new Set();

  /* Shape 1: a hyphen-joined capitalized compound. */
  for (const m of t.matchAll(/\b([A-Z][a-z]+)-([A-Z][a-z]+)\b/g)) out.add(m[1] + '-' + m[2]);

  /* Shape 2: a capitalized name plus a method head noun, in one clause.
     A candidate whose name is preceded by a hyphen is the tail of a shape-1
     compound ("Kruskal-Wallis test" -> "Wallis test") and is suppressed. */
  for (const m of t.matchAll(/([A-Z][a-zA-Z]+)('s)?\s+([A-Za-z]+)\b/g)) {
    if (!HEAD.includes(m[3])) continue;
    if (m.index > 0 && t[m.index - 1] === '-') continue;
    out.add(m[1] + (m[2] ? "'s " : ' ') + m[3]);
  }
  return [...out];
}

/* --- destination prose -------------------------------------------------- */

const proseCache = new Map();
function lessonProse(rel) {
  if (proseCache.has(rel)) return proseCache.get(rel);
  const f = path.join(ROOT, rel, 'index.html');
  let v = null;
  if (fs.existsSync(f)) {
    const h = fs.readFileSync(f, 'utf8');
    const a = h.split('<article');
    v = textify(a.length > 1 ? a[1].split('</article>')[0] : h);
  }
  proseCache.set(rel, v);
  return v;
}

/* Does this page name this method? Tolerant of the ways the corpus writes it. */
function delivers(prose, name) {
  const p = prose.toLowerCase();
  const q = name.toLowerCase();
  if (p.includes(q)) return true;
  const poss = q.match(/^(.+?)'s (.+)$/);
  if (poss && p.includes(poss[1] + ' ' + poss[2])) return true;
  if (q.includes('-') && p.includes(q.replace(/-/g, ' '))) return true;
  const parts = q.split(/'s | /);
  if (parts.length === 2) {
    /* Name ... HeadNoun inside one clause, the shape-2 rule at the far end. */
    if (new RegExp(esc(parts[0]) + '[^.;:!?]{0,25}?' + esc(parts[1])).test(p)) return true;
  }
  return false;
}

/* --- units -------------------------------------------------------------- */

/* The smallest authored chunk holding both a method name and a lesson link.
   Widening this is what breaks the checker — see (a) in the header. */
function units(file) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const out = [];
  for (const m of src.matchAll(/<tr>[\s\S]*?<\/tr>|<li>[\s\S]*?<\/li>/g)) out.push(m[0]);
  if (JS_UNIT_FILES.has(file)) {
    for (const m of src.matchAll(/"((?:[^"\\]|\\.)*)"/g)) out.push(m[1]);
  }
  return out;
}

function destinations(raw) {
  LINK.lastIndex = 0;
  return [...new Set([...raw.matchAll(LINK)]
    .map(m => m[1].replace(/\\/g, '').replace(/^(\.\.\/)+/, '').replace(/\/$/, '')))];
}

/* --- run ---------------------------------------------------------------- */

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const verbose = args.includes('--verbose');
const only = (() => { const i = args.indexOf('--surface'); return i >= 0 ? args[i + 1] : null; })();

const flags = [];
const acked = [];
let nUnits = 0, nPairs = 0;
const matched = [];

for (const file of SURFACES) {
  if (only && file !== only) continue;
  if (!fs.existsSync(path.join(ROOT, file))) continue;
  for (const raw of units(file)) {
    const dests = destinations(raw);
    if (!dests.length) continue;
    nUnits++;
    const text = textify(raw);
    for (const name of methodNames(text)) {
      nPairs++;
      const ok = dests.some(d => { const p = lessonProse(d); return p === null || delivers(p, name); });
      const rec = { file, name, dests, text: text.trim().slice(0, 120) };
      if (ok) { matched.push(rec); continue; }
      if (ACKED[file + ' | ' + name]) acked.push(rec); else flags.push(rec);
    }
  }
}

const line = '─'.repeat(72);
console.log('\ndestination-promises — does a prescription\'s own destination deliver it?');
console.log(line);
console.log(`${nUnits} authored units carry a lesson link · ${nPairs} method/destination pairs checked`);

if (verbose) {
  console.log('\nmatched:');
  for (const m of matched) console.log(`  ok   ${m.name}  →  ${m.dests.join(', ')}   [${m.file}]`);
}

if (acked.length) {
  console.log(`\nacknowledged (${acked.length}):`);
  for (const a of acked) console.log(`  ~    ${a.name}  →  ${a.dests.join(', ')}   [${a.file}]`);
}

if (flags.length) {
  console.log(`\nFLAGS (${flags.length}) — prescribed here, not taught at the page this unit points to:`);
  for (const f of flags) {
    console.log(`\n  ${f.file}: "${f.name}"`);
    console.log(`    points at: ${f.dests.join(', ')}`);
    console.log(`    unit:      ${f.text}`);
  }
  console.log('\nFix the link or teach the method at the destination — not the check.');
} else {
  console.log('\nno flags: every named method is delivered by a page its own unit links to.');
}
console.log(line + '\n');

process.exit(strict && flags.length ? 1 : 0);
