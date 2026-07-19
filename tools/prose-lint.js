#!/usr/bin/env node
/* ============================================================
   prose-lint.js — the measuring stick for VOICE.md (P40)

   Counts the machine-tell constructions and em-dash load in every
   piece of rendered prose on the site: lesson bodies, guides, the
   audited root/tool pages, every FAQ answer in tools/faq_data.py,
   and every meta description.

   Run from the repo root (zero dependencies, Node built-ins only):

     node tools/prose-lint.js                 # full report, worst pages first
     node tools/prose-lint.js --page <path>   # one page, every hit with a snippet
     node tools/prose-lint.js --strict        # exit 1 if any hard budget is exceeded

   The PATTERNS table + budget constants below MIRROR VOICE.md's
   HARD RULES — if you change a rule there, change it here in the
   same commit (VOICE.md says the same). Voice is editorial
   judgment, not build health, so this script is deliberately NOT
   wired into tools/audit.js.

   What counts as "prose" here: the <body> text of a page with
   <script>/<style>/<pre> blocks, comments, and tags stripped and
   entities decoded. A lesson's baked-in FAQ block is excluded from
   its page text (the FAQ answers are linted separately from their
   single source of truth, tools/faq_data.py, under their own
   budget). JS-injected strings (checks.js "why"s, software.js
   tips, snippets.js comments, QUIPS) are outside this script's
   scope — P46 applies VOICE.md to those by hand, and quips are
   exempt brand voice anyway.
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(p, 'utf8');

/* ============================================================
   Budgets + patterns — MIRROR of VOICE.md's HARD RULES (keep in sync!)
   ============================================================ */

const EMDASH_PAGE_MAX = 10;       // rule 1 — per page of prose (FAQ block excluded)
const EMDASH_FAQ_MAX = 3;         // rule 2 — ≤1 per answer on average × 3 answers per lesson
const THINK_SITE_MAX = 3;         // rule 8 — "Think of it as" sitewide
const NOTICE_PAGE_MAX = 1;        // rule 10 — "Notice how/that" per page
const ANDWATCH_SHARE_MAX = 0.15;  // rule 11 — "…and watch…" meta descriptions

/* budget: 0 = banned outright (sitewide zero); 'site' / 'page' budgets are
   enforced in strictCheck() below. Regexes are heuristics tuned against the
   real corpus — they're the measuring stick, not a grammar. */
const PATTERNS = [
  {
    id: 'contrast', col: 'punch', budget: 0,
    label: `the contrast punch ("isn't just X — it's Y" / "it's not about X — it's Y")`,
    res: [
      /\b(?:is|was|are|were|does|do|did)n['’]t\s+(?:just\s+|only\s+|about\s+)?[^—.;:!?]{1,80}?—\s*(?:it|that|this|they|you|we|he|she)\b/gi,
      /\b(?:it|this|that)['’]s\s+not\s+(?:just\s+|only\s+|about\s+)?[^—.;:!?]{1,80}?—\s*(?:it|that|this|they|you|we)\b/gi,
    ],
  },
  {
    id: 'heres', col: 'heres', budget: 0,
    label: `the "Here's the …" setup ("Here's the thing/why/how/twist/catch")`,
    res: [/\bhere['’]s\s+(?:the\s+\w+|why|how)\b/gi],
  },
  {
    id: 'point-is', col: 'point', budget: 0,
    label: `"The point is"`,
    res: [/\bthe\s+point\s+is\b/gi],
  },
  {
    id: 'whole-point', col: 'whole', budget: 0,
    label: `"That's the whole point/lesson/job"`,
    res: [/\bthat['’]s\s+the\s+whole\s+(?:point|lesson|job)\b/gi],
  },
  {
    id: 'quietly', col: 'quiet', budget: 0,
    label: `"quietly" (as an intensifier — lint counts every use; reword literal ones too)`,
    res: [/\bquietly\b/gi],
  },
  {
    id: 'think-of', col: 'think', budget: 'site', // ≤ THINK_SITE_MAX sitewide
    label: `"Think of it as" (≤ ${THINK_SITE_MAX} sitewide)`,
    res: [/\bthink\s+of\s+it\s+as\b/gi],
  },
  {
    id: 'notice', col: 'notice', budget: 'page', // ≤ NOTICE_PAGE_MAX per page
    label: `"Notice how/that" (≤ ${NOTICE_PAGE_MAX} per page)`,
    res: [/\bnotice\s+(?:how|that)\b/gi],
  },
];

/* FAQ answers must not open with a verdict word + dash (VOICE.md rule 7);
   a bare "No." as a complete first sentence is fine — and doesn't match. */
const VERDICT_OPENER = /^["“'‘]?(?:no|yes)\s*[—–]/i;

/* meta descriptions built on the "…and watch…" formula (rule 11) */
const AND_WATCH = /\band\s+watch\b/i;

/* ============================================================
   Page lists — keep in sync with tools/audit.js (ROOT_PAGES / GUIDES)
   ============================================================ */
const ROOT_PAGES = ['index.html', 'quiz.html', 'glossary.html', 'toolbox.html', 'teachers.html', 'which-test.html', 'which-chart.html',
  'plan.html', 'tables.html', 'formulas.html', 'distributions.html', 'effect-sizes.html', 'descriptives.html', 'correlation.html', 'power.html', 'apa.html', 'problems.html', 'datasets.html', 'flashcards.html', 'progress.html',
  'cheat-test-chooser.html', 'cheat-apa.html', 'cheat-assumptions.html'];
const GUIDES = ['analyze-thesis-data-jasp', 'spss-output-to-apa', 'choose-statistics-dissertation', 'clean-survey-data'];
/* course landing pages — <course>/index.html (P61); derived from the curriculum below */

/* ============================================================
   Small helpers (same approach as tools/audit.js)
   ============================================================ */

function loadWindow(files) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (const f of files) vm.runInContext(read(f), sandbox, { filename: f });
  return sandbox.window;
}

/* Slice a balanced […] starting at src[start], honouring quotes + \ escapes. */
function sliceBalanced(src, start) {
  const open = src[start], close = open === '{' ? '}' : ']';
  let depth = 0, str = null, esc = false;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (str) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === str) str = null;
      continue;
    }
    if (ch === '"' || ch === "'") { str = ch; continue; }
    if (ch === open) depth++;
    else if (ch === close && --depth === 0) return src.slice(start, i + 1);
  }
  return null;
}

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
  times: '×', minus: '−', middot: '·', bull: '•', rarr: '→', larr: '←', harr: '↔',
  le: '≤', ge: '≥', ne: '≠', asymp: '≈', plusmn: '±', deg: '°', sup2: '²', sup3: '³',
  frac12: '½', radic: '√', infin: '∞', sum: '∑', alpha: 'α', beta: 'β', chi: 'χ',
  eta: 'η', mu: 'μ', sigma: 'σ', rho: 'ρ', phi: 'φ', lambda: 'λ', omega: 'ω', delta: 'δ', epsilon: 'ε',
};
function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-zA-Z]+[0-9]*);/g, (m, n) => NAMED_ENTITIES[n.toLowerCase()] ?? m);
}

/* Rendered prose of a page: <body> text minus scripts/styles/<pre>/comments/
   tags, entities decoded, whitespace collapsed. stripFaq removes a lesson's
   baked-in FAQ block (linted separately from faq_data.py). */
function extractProse(html, stripFaq) {
  let s = html;
  const bodyAt = s.search(/<body\b/i);
  if (bodyAt >= 0) s = s.slice(bodyAt);
  if (stripFaq) s = s.replace(/<!--\s*faq:start[\s\S]*?<!--\s*faq:end\s*-->/g, ' ');
  s = s
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  return decodeEntities(s).replace(/\s+/g, ' ').trim();
}

function metaDescription(html) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (/name\s*=\s*"description"/i.test(tag)) {
      const m = tag.match(/content\s*=\s*"([^"]*)"/i);
      if (m) return decodeEntities(m[1]);
    }
  }
  return null;
}

/* ---------- tools/faq_data.py → { slug: [answer plaintext, …] } ----------
   The file is very regular (audit.js parses it the same way): top-level
   `"slug": [ ("Q", "A"), … ]` entries at column 0. Handles \-escapes,
   implicit string concatenation, and # comments. */
function parsePyTuple(src, start) { // src[start] === '('
  let i = start + 1, depth = 1, str = null, buf = '';
  const parts = [], values = [];
  const flush = () => { if (parts.length) { values.push(parts.join('')); parts.length = 0; } };
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (str) {
      if (ch === '\\') { const n = src[i + 1]; buf += n === 'n' ? '\n' : n === 't' ? '\t' : n; i += 2; continue; }
      if (ch === str) { parts.push(buf); buf = ''; str = null; i++; continue; }
      buf += ch; i++; continue;
    }
    if (ch === '"' || ch === "'") { str = ch; i++; continue; }
    if (ch === '#') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (ch === '(') depth++;
    else if (ch === ')') { depth--; if (!depth) break; }
    else if (ch === ',' && depth === 1) flush();
    i++;
  }
  flush();
  return { end: i, values };
}
function parseFaqAnswers(src) {
  const out = {};
  const re = /^"([\w-]+)":\s*\[/gm;
  let m;
  while ((m = re.exec(src))) {
    const list = sliceBalanced(src, src.indexOf('[', m.index));
    if (!list) continue;
    const answers = [];
    let i = 1, str = null, esc = false;
    while (i < list.length - 1) {
      const ch = list[i];
      if (str) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === str) str = null; i++; continue; }
      if (ch === '"' || ch === "'") { str = ch; i++; continue; }
      if (ch === '#') { while (i < list.length && list[i] !== '\n') i++; continue; }
      if (ch === '(') {
        const t = parsePyTuple(list, i);
        if (t.values.length >= 2) answers.push(t.values[t.values.length - 1]); // answer = last value
        i = t.end + 1; continue;
      }
      i++;
    }
    out[m[1]] = answers.map((a) => decodeEntities(a.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim());
  }
  return out;
}

/* ============================================================
   Scan
   ============================================================ */

const win = loadWindow([path.join(ROOT, 'assets/js/curriculum.js')]);
const READY = (win.CURRICULUM_FLAT || []).filter((s) => s.ready);
const FAQ_ANSWERS = parseFaqAnswers(read(path.join(ROOT, 'tools/faq_data.py')));

function findHits(text, source) {
  const hits = [];
  for (const p of PATTERNS) {
    for (const re of p.res) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text))) {
        const from = Math.max(0, m.index - 30);
        const to = Math.min(text.length, m.index + m[0].length + 30);
        hits.push({ pattern: p.id, source, snippet: `…${text.slice(from, m.index)}»${m[0]}«${text.slice(m.index + m[0].length, to)}…` });
      }
    }
  }
  return hits;
}
const countDashes = (text) => (text.match(/—/g) || []).length;

function scanPage(kind, label, file, slug) {
  const html = read(file);
  const prose = extractProse(html, kind === 'lesson');
  const desc = metaDescription(html);
  const faqAnswers = kind === 'lesson' ? FAQ_ANSWERS[slug] || [] : [];

  const hits = findHits(prose, 'prose');
  faqAnswers.forEach((a, i) => hits.push(...findHits(a, `FAQ answer ${i + 1}`)));
  if (desc) hits.push(...findHits(desc, 'meta description'));

  const verdicts = [];
  faqAnswers.forEach((a, i) => {
    const m = a.match(VERDICT_OPENER);
    if (m) verdicts.push({ source: `FAQ answer ${i + 1}`, snippet: `»${a.slice(0, 60)}…«` });
  });

  const counts = {};
  for (const p of PATTERNS) counts[p.id] = hits.filter((h) => h.pattern === p.id).length;

  const words = prose ? prose.split(' ').length : 0;
  const dashes = countDashes(prose);
  const faqDashes = faqAnswers.reduce((n, a) => n + countDashes(a), 0);
  const banned = PATTERNS.filter((p) => p.budget === 0).reduce((n, p) => n + counts[p.id], 0);

  return {
    kind, label, file, slug, words, dashes, faqDashes, counts, hits, verdicts, desc,
    rate: words ? (dashes * 1000) / words : 0,
    andWatch: !!(desc && AND_WATCH.test(desc)),
    // heuristic worst-first ranking: hard-budget overages + every banned-flavour hit
    score: Math.max(0, dashes - EMDASH_PAGE_MAX) + Math.max(0, faqDashes - EMDASH_FAQ_MAX)
      + banned + counts['think-of'] + Math.max(0, counts.notice - NOTICE_PAGE_MAX) + verdicts.length,
    banned,
  };
}

const COURSE_PAGES = (win.CURRICULUM || []).map((c) => c.slug);

const pages = [];
for (const s of READY) pages.push(scanPage('lesson', `${s.course}/${s.slug}/`, path.join(ROOT, s.course, s.slug, 'index.html'), s.slug));
for (const g of GUIDES) pages.push(scanPage('guide', `guides/${g}/`, path.join(ROOT, 'guides', g, 'index.html'), null));
for (const c of COURSE_PAGES) pages.push(scanPage('course', `${c}/`, path.join(ROOT, c, 'index.html'), null));
for (const f of ROOT_PAGES) pages.push(scanPage('root', f, path.join(ROOT, f), null));

/* ============================================================
   Aggregates + strict budgets
   ============================================================ */

const totalByPattern = {};
for (const p of PATTERNS) totalByPattern[p.id] = pages.reduce((n, pg) => n + pg.counts[p.id], 0);
const verdictTotal = pages.reduce((n, pg) => n + pg.verdicts.length, 0);
const descPages = pages.filter((pg) => pg.desc);
const andWatchPages = pages.filter((pg) => pg.andWatch);
const andWatchShare = descPages.length ? andWatchPages.length / descPages.length : 0;

const median = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

function strictCheck() {
  const fails = [];
  for (const pg of pages) {
    if (pg.dashes > EMDASH_PAGE_MAX) fails.push(`${pg.label} — ${pg.dashes} em-dashes in page prose (budget ${EMDASH_PAGE_MAX})`);
    if (pg.faqDashes > EMDASH_FAQ_MAX) fails.push(`${pg.label} — ${pg.faqDashes} em-dashes across its FAQ answers (budget ${EMDASH_FAQ_MAX})`);
    if (pg.counts.notice > NOTICE_PAGE_MAX) fails.push(`${pg.label} — ${pg.counts.notice}× "Notice how/that" (budget ${NOTICE_PAGE_MAX}/page)`);
    for (const v of pg.verdicts) fails.push(`${pg.label} — ${v.source} opens with a verdict word: ${v.snippet}`);
    for (const p of PATTERNS.filter((x) => x.budget === 0)) {
      if (pg.counts[p.id] > 0) fails.push(`${pg.label} — ${pg.counts[p.id]}× banned: ${p.label}`);
    }
  }
  if (totalByPattern['think-of'] > THINK_SITE_MAX)
    fails.push(`sitewide — ${totalByPattern['think-of']}× "Think of it as" (budget ${THINK_SITE_MAX} sitewide)`);
  if (andWatchShare > ANDWATCH_SHARE_MAX)
    fails.push(`sitewide — ${andWatchPages.length}/${descPages.length} meta descriptions (${(andWatchShare * 100).toFixed(0)}%) use "…and watch…" (budget ${ANDWATCH_SHARE_MAX * 100}%)`);
  return fails;
}

/* ============================================================
   Reports
   ============================================================ */

const pad = (s, n) => String(s).padEnd(n);
const rpad = (s, n) => String(s).padStart(n);
const line = (n) => '─'.repeat(n);

function pageRow(pg) {
  return pad(pg.label, 46) + rpad(pg.words, 6) + rpad(pg.dashes, 5) + rpad(pg.rate.toFixed(1), 6)
    + rpad(pg.kind === 'lesson' ? pg.faqDashes : '·', 5) + rpad(pg.banned, 7)
    + rpad(pg.counts['think-of'], 6) + rpad(pg.counts.notice, 7) + rpad(pg.kind === 'lesson' ? pg.verdicts.length : '·', 8)
    + rpad(pg.score, 6);
}
const HEADER = pad('page', 46) + rpad('words', 6) + rpad('em—', 5) + rpad('/1k', 6)
  + rpad('faq—', 5) + rpad('banned', 7) + rpad('think', 6) + rpad('notice', 7) + rpad('verdict', 8) + rpad('score', 6);

function printSitewide() {
  const lessons = pages.filter((p) => p.kind === 'lesson');
  console.log('\nSITEWIDE');
  console.log(line(96));
  console.log(`  em-dashes in page prose: ${pages.reduce((n, p) => n + p.dashes, 0)} total · lesson median ${median(lessons.map((p) => p.dashes))} · max ${Math.max(...pages.map((p) => p.dashes))} · ${pages.filter((p) => p.dashes > EMDASH_PAGE_MAX).length}/${pages.length} pages over the ≤${EMDASH_PAGE_MAX} budget`);
  console.log(`  em-dashes in FAQ answers: ${lessons.reduce((n, p) => n + p.faqDashes, 0)} total across ${lessons.length}×3 answers · ${lessons.filter((p) => p.faqDashes > EMDASH_FAQ_MAX).length} lessons over the ≤${EMDASH_FAQ_MAX}/trio budget`);
  console.log(`  FAQ verdict openers ("No — "/"Yes — "): ${verdictTotal} (budget 0)`);
  for (const p of PATTERNS) {
    const budget = p.budget === 0 ? 'budget 0' : p.budget === 'site' ? `budget ${THINK_SITE_MAX} sitewide` : `budget ${NOTICE_PAGE_MAX}/page`;
    console.log(`  ${p.label}: ${totalByPattern[p.id]} (${budget})`);
  }
  console.log(`  "…and watch…" meta descriptions: ${andWatchPages.length}/${descPages.length} = ${(andWatchShare * 100).toFixed(1)}% (budget ≤ ${ANDWATCH_SHARE_MAX * 100}%)`);

  const worst = [...pages].sort((a, b) => b.score - a.score || b.dashes - a.dashes).slice(0, 10);
  console.log('\nWORST 10 PAGES');
  console.log(line(96));
  console.log(HEADER);
  for (const pg of worst) console.log(pageRow(pg));
}

const args = process.argv.slice(2);

if (args[0] === '--page') {
  const want = (args[1] || '').replace(/^\.\//, '').replace(/\/?(index\.html)?$/, '');
  const pg = pages.find((p) => p.label.replace(/\/$/, '') === want || p.label === args[1]);
  if (!pg) { console.error(`prose-lint: no such page "${args[1]}" (expected e.g. stats-1/central-limit-theorem or tables.html)`); process.exit(2); }
  console.log(`${pg.label} — ${pg.words} words · ${pg.dashes} em-dashes (${pg.rate.toFixed(1)}/1k, budget ≤ ${EMDASH_PAGE_MAX})`
    + (pg.kind === 'lesson' ? ` · ${pg.faqDashes} FAQ em-dashes (budget ≤ ${EMDASH_FAQ_MAX})` : ''));
  if (pg.desc) console.log(`meta description${pg.andWatch ? ' (uses "…and watch…")' : ''}: ${pg.desc}`);
  if (!pg.hits.length && !pg.verdicts.length) console.log('\nno pattern hits.');
  for (const p of PATTERNS) {
    const hits = pg.hits.filter((h) => h.pattern === p.id);
    if (!hits.length) continue;
    console.log(`\n${p.label} — ${hits.length}×`);
    for (const h of hits) console.log(`  [${h.source}] ${h.snippet}`);
  }
  if (pg.verdicts.length) {
    console.log(`\nFAQ verdict openers — ${pg.verdicts.length}×`);
    for (const v of pg.verdicts) console.log(`  [${v.source}] ${v.snippet}`);
  }
  process.exit(0);
}

if (args[0] === '--strict') {
  const fails = strictCheck();
  if (fails.length) {
    console.log(`prose-lint --strict: ${fails.length} hard-budget violation${fails.length === 1 ? '' : 's'} (VOICE.md)\n`);
    for (const f of fails) console.log(`  ✗ ${f}`);
    printSitewide();
    process.exit(1);
  }
  console.log('prose-lint --strict: all VOICE.md hard budgets met.');
  printSitewide();
  process.exit(0);
}

/* default: full report, worst first */
console.log(`StatsCapybara prose lint — ${pages.length} pages (${READY.length} lessons, ${GUIDES.length} guides, ${COURSE_PAGES.length} course, ${ROOT_PAGES.length} root) · ${Object.values(FAQ_ANSWERS).reduce((n, a) => n + a.length, 0)} FAQ answers · ${descPages.length} meta descriptions`);
console.log(`budgets: em-dash ≤ ${EMDASH_PAGE_MAX}/page + ≤ ${EMDASH_FAQ_MAX}/FAQ trio · banned constructions 0 · think ≤ ${THINK_SITE_MAX} sitewide · notice ≤ ${NOTICE_PAGE_MAX}/page · "and watch" ≤ ${ANDWATCH_SHARE_MAX * 100}% of descriptions`);
console.log(line(96));
console.log(HEADER);
for (const pg of [...pages].sort((a, b) => b.score - a.score || b.dashes - a.dashes)) console.log(pageRow(pg));
printSitewide();
