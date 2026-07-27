#!/usr/bin/env node
/* tools/faq-audit.js — the FAQ freshness report (P39 run 15)

   Every P39 run does step 4 by hand: read a lesson's three "Common
   questions" against all 291 and swap any that restates its own
   lesson or duplicates another page. Fifteen runs have applied that
   judgment by eye, one lesson at a time, and it does not scale: the
   criterion is a comparison against 290 other answers that nobody
   can hold in their head. This measures the three inputs to that
   judgment so a run can spend its attention on the verdict.

   Run from the repo root (zero dependencies, Node built-ins only):

     node tools/faq-audit.js                  # ranked report + template census
     node tools/faq-audit.js --lesson <slug>  # one lesson, every score explained
     node tools/faq-audit.js --strict         # exit 1 on a STRUCTURAL fault only

   WHAT IT MEASURES (all three are signals, not verdicts):

     ECHO     a question whose content words are mostly contained in
              one of its own lesson's headings. "What is the
              difference between prediction and explanation?" against
              the h1 "Prediction vs Explanation" is the shape.
     REPRISE  an answer that largely repeats prose already in its own
              lesson body, measured as the share of the answer's
              4-word shingles that appear verbatim in the lesson.
              CLAUDE.md's rule is that answers COMPLEMENT the prose;
              this is that rule with a number attached.
     TWIN     a question or answer close to one on ANOTHER lesson.
              Run 13 found two of these by hand on a single lesson
              (llms-and-ai-in-research duplicated
              ethics/ai-in-research-ethics almost verbatim).

   WHAT --strict GATES. Only structural faults: a lesson without
   exactly 3 entries, a slug with no ready lesson, or two identical
   question strings. Everything else is REPORTED and left to
   judgment, for the same reason prose-lint is not in audit.js.
   Sometimes the honest answer to a high ECHO is "that is the
   question students actually ask, leave it" — run 12 correctly
   swapped none on one lesson. A ranked report a human reads is the
   deliverable; a threshold that failed a build would only teach
   future runs to write around the metric.

   DELIBERATELY NOT IN audit.js. This is editorial health, not build
   health. audit.js already enforces that FAQs exist, parse, and
   number three per lesson.

   CALIBRATION, AND THE ONE THING IT MISSES. Scored against the tree
   as it stood BEFORE run 15's swaps, where the five questions a human
   had already marked for replacement were known in advance: FOUR of
   the five came back as the highest-ECHO question on their own lesson
   (67%, 100%, 50%, 67%), two of them inside the sitewide top 12.
   The fifth, classification-metrics "What is the difference between
   precision and recall?", scored ECHO 0% and REPRISE 0% and the tool
   missed it completely — because it restates the lesson's BULLET LIST
   rather than a heading, and it paraphrases instead of copying, so
   neither a heading comparison nor a verbatim 4-gram overlap can see
   it. That is the honest boundary of this tool: it finds questions
   that echo the SHAPE of a lesson, not every question that adds
   nothing to it. Reading the three answers against the lesson is
   still the job; this narrows where to look first.
*/

'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(f, 'utf8');

/* ---------------------------------------------------------------- text */

const STOP = new Set((
  'a an the and or but if of in on at to for from by with without into as is are was were be been being ' +
  'do does did doing done have has had having i you it its this that these those my your our their there ' +
  'what which who whom when where why how can could should would will shall may might must not no nor so ' +
  'than then them they he she his her we us me about after all also any because before between both each ' +
  'even ever every few more most much only other over own same some such too very just now here ' +
  'get got go goes going make makes made use used using one two three'
).split(/\s+/));

const decodeEntities = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

/* content words: lowercased, de-punctuated, stopped, crudely de-pluralized */
function words(s) {
  return decodeEntities(String(s))
    .replace(/<[^>]+>/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map((w) => (w.length > 4 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w));
}
const wordSet = (s) => new Set(words(s));

/* share of A's words that also appear in B. Containment, not Jaccard: a
   short question sitting inside a longer heading should still score high. */
function containment(a, b) {
  if (!a.size) return 0;
  let n = 0;
  for (const w of a) if (b.has(w)) n++;
  return n / a.size;
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let n = 0;
  for (const w of a) if (b.has(w)) n++;
  return n / (a.size + b.size - n);
}

/* 4-word shingles over the raw word stream. Stopwords are KEPT here on
   purpose: verbatim reuse is what REPRISE detects, and the phrasing lives
   in the small words. */
function shingles(s, k = 4) {
  const w = decodeEntities(String(s))
    .replace(/<[^>]+>/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const out = new Set();
  for (let i = 0; i + k <= w.length; i++) out.add(w.slice(i, i + k).join(' '));
  return out;
}

/* ------------------------------------------------------- faq_data.py */

function sliceBalanced(src, open) {
  const close = { '[': ']', '(': ')' }[src[open]];
  let depth = 0, str = null, esc = false;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (str) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === str) str = null;
      continue;
    }
    if (ch === '"' || ch === "'") { str = ch; continue; }
    if (ch === '#') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (ch === src[open]) depth++;
    else if (ch === close) { depth--; if (!depth) return src.slice(open, i + 1); }
  }
  return null;
}

/* one Python tuple -> its string values. Adjacent string literals
   concatenate, the way Python joins them. */
function parseTuple(raw) {
  const values = [];
  let cur = null, i = 1, str = null, esc = false, buf = '';
  while (i < raw.length - 1) {
    const ch = raw[i];
    if (str) {
      if (esc) { buf += ch === 'n' ? '\n' : ch === 't' ? '\t' : ch; esc = false; }
      else if (ch === '\\') esc = true;
      else if (ch === str) { str = null; cur = (cur === null ? '' : cur) + buf; buf = ''; }
      else buf += ch;
      i++; continue;
    }
    if (ch === '"' || ch === "'") { str = ch; i++; continue; }
    if (ch === ',') { if (cur !== null) values.push(cur); cur = null; i++; continue; }
    if (ch === '#') { while (i < raw.length && raw[i] !== '\n') i++; continue; }
    i++;
  }
  if (cur !== null) values.push(cur);
  return values;
}

function parseFaqs(src) {
  const out = {};
  for (const m of src.matchAll(/^"([\w-]+)":\s*\[/gm)) {
    const list = sliceBalanced(src, src.indexOf('[', m.index));
    if (!list) continue;
    const pairs = [];
    let i = 1, str = null, esc = false;
    while (i < list.length - 1) {
      const ch = list[i];
      if (str) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === str) str = null;
        i++; continue;
      }
      if (ch === '"' || ch === "'") { str = ch; i++; continue; }
      if (ch === '#') { while (i < list.length && list[i] !== '\n') i++; continue; }
      if (ch === '(') {
        const raw = sliceBalanced(list, i);
        const values = parseTuple(raw);
        if (values.length >= 2) pairs.push({ q: values[0], a: values[values.length - 1] });
        i += raw.length; continue;
      }
      i++;
    }
    out[m[1]] = pairs;
  }
  return out;
}

/* --------------------------------------------------------- lesson prose */

function lessonFiles() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(read(path.join(ROOT, 'assets/js/curriculum.js')), sandbox);
  const map = {};
  for (const c of sandbox.window.CURRICULUM) {
    for (const s of c.sections) {
      if (s.ready) map[s.slug] = path.join(ROOT, c.slug, s.slug, 'index.html');
    }
  }
  return map;
}

/* headings (h1 + h2) and body prose, with the baked FAQ block removed */
function lessonParts(file) {
  if (!fs.existsSync(file)) return null;
  const html = read(file);
  const art = html.match(/<article class="lesson"[\s\S]*?<\/article>/);
  let s = art ? art[0] : html;
  s = s.replace(/<!--\s*faq:start[\s\S]*?<!--\s*faq:end\s*-->/g, ' ');
  const headings = [...s.matchAll(/<h([12])[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((m) => decodeEntities(m[2].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim())
    .filter((h) => h && !/^common questions$/i.test(h));
  const prose = decodeEntities(
    s.replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ').trim();
  return { headings, prose };
}

/* ------------------------------------------------------------- templates */

const TEMPLATES = [
  ['what-is-the-difference', /^what(?:'s| is| are)?\s+the\s+difference\s+between\b/i],
  ['what-is', /^what(?:'s| is| are| does| do)\b/i],
  ['why', /^why\b/i],
  ['how', /^how\b/i],
  ['can-i', /^can\s+i\b/i],
  ['should-i', /^should\s+i\b/i],
  ['do-i', /^do\s+i\b/i],
  ['my-…', /^my\b/i],
  ['is\/does', /^(?:is|are|does|do|did)\b/i],
];
const templateOf = (q) => (TEMPLATES.find(([, re]) => re.test(q.trim())) || ['other'])[0];

/* ------------------------------------------------------------------ main */

const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
const ONE = (() => { const i = args.indexOf('--lesson'); return i >= 0 ? args[i + 1] : null; })();

const FAQS = parseFaqs(read(path.join(ROOT, 'tools/faq_data.py')));
const FILES = lessonFiles();

const faults = [];
const all = [];

for (const [slug, pairs] of Object.entries(FAQS)) {
  const file = FILES[slug];
  if (!file) { faults.push(`${slug}: has FAQs but is not a ready lesson in curriculum.js`); continue; }
  if (pairs.length !== 3) faults.push(`${slug}: ${pairs.length} Q&As (must be exactly 3)`);
  const parts = lessonParts(file);
  if (!parts) { faults.push(`${slug}: lesson file missing (${path.relative(ROOT, file)})`); continue; }
  const proseShingles = shingles(parts.prose);
  pairs.forEach((p, i) => {
    const qw = wordSet(p.q);
    let echo = 0, echoOn = '';
    for (const h of parts.headings) {
      const c = containment(qw, wordSet(h));
      if (c > echo) { echo = c; echoOn = h; }
    }
    const sh = shingles(p.a);
    let reprise = 0;
    if (sh.size) {
      let n = 0;
      for (const g of sh) if (proseShingles.has(g)) n++;
      reprise = n / sh.size;
    }
    all.push({ slug, i, q: p.q, qw, aw: wordSet(p.a), echo, echoOn, reprise, tpl: templateOf(p.q) });
  });
}

/* an identical question string is a fault; a near one is a signal */
const seen = new Map();
for (const r of all) {
  const k = r.q.trim().toLowerCase();
  if (seen.has(k)) faults.push(`identical question on ${seen.get(k)} and ${r.slug}: "${r.q}"`);
  else seen.set(k, r.slug);
}

/* TWIN: closest counterpart on another lesson, by question and by answer */
for (const r of all) {
  r.twinQ = 0; r.twinA = 0; r.twinQOn = ''; r.twinAOn = '';
  for (const o of all) {
    if (o.slug === r.slug) continue;
    const jq = jaccard(r.qw, o.qw);
    if (jq > r.twinQ) { r.twinQ = jq; r.twinQOn = `${o.slug} #${o.i + 1}`; }
    const ja = jaccard(r.aw, o.aw);
    if (ja > r.twinA) { r.twinA = ja; r.twinAOn = `${o.slug} #${o.i + 1}`; }
  }
}

const pct = (x) => `${(x * 100).toFixed(0)}%`;
const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

if (ONE) {
  const mine = all.filter((r) => r.slug === ONE);
  if (!mine.length) { console.error(`no FAQs for "${ONE}"`); process.exit(1); }
  const parts = lessonParts(FILES[ONE]);
  console.log(`\n${ONE} — ${mine.length} Q&As`);
  console.log(`headings: ${parts.headings.join(' · ')}\n`);
  for (const r of mine) {
    console.log(`  #${r.i + 1} [${r.tpl}] ${r.q}`);
    console.log(`      ECHO    ${pct(r.echo)} of the question's content words sit in "${clip(r.echoOn, 56)}"`);
    console.log(`      REPRISE ${pct(r.reprise)} of the answer's 4-grams are already in the lesson body`);
    console.log(`      TWIN    question ${pct(r.twinQ)} (${r.twinQOn}) · answer ${pct(r.twinA)} (${r.twinAOn})`);
    console.log('');
  }
  process.exit(0);
}

function top(key, n, label, onKey) {
  console.log(`\n── ${label} (top ${n})`);
  [...all].sort((a, b) => b[key] - a[key]).slice(0, n).forEach((r) => {
    const on = onKey === 'echoOn' ? `heading "${clip(r.echoOn, 46)}"` : onKey ? r[onKey] : '';
    console.log(`  ${pct(r[key]).padStart(4)}  ${r.slug} #${r.i + 1}  ${clip(r.q, 62)}`);
    if (on) console.log(`        ↳ ${on}`);
  });
}

console.log(`FAQ audit — ${Object.keys(FAQS).length} lessons · ${all.length} Q&As`);
top('echo', 12, "ECHO — question restates one of its own lesson's headings", 'echoOn');
top('reprise', 10, 'REPRISE — answer repeats prose already in its own lesson', null);
top('twinQ', 8, 'TWIN (question) — closest question on another lesson', 'twinQOn');
top('twinA', 8, 'TWIN (answer) — closest answer on another lesson', 'twinAOn');

console.log('\n── opener template census');
const census = {};
for (const r of all) census[r.tpl] = (census[r.tpl] || 0) + 1;
Object.entries(census).sort((a, b) => b[1] - a[1]).forEach(([t, n]) => {
  console.log(`  ${String(n).padStart(3)}  ${pct(n / all.length).padStart(4)}  ${t}`);
});

if (faults.length) {
  console.log('\n── STRUCTURAL FAULTS');
  faults.forEach((f) => console.log(`  ✗ ${f}`));
} else {
  console.log('\nno structural faults.');
}
console.log('\nECHO / REPRISE / TWIN are signals for step 4 of P39, not verdicts.');
console.log('Only the structural faults are gated by --strict.');

process.exit(STRICT && faults.length ? 1 : 0);
