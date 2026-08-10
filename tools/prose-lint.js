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
   budget).

   THE SHARED JS SURFACES (P39 run 13). The strings site.js injects
   into lessons are prose a reader reads, and nothing measured them
   until this: three consecutive refresh runs found a British spelling
   in a software.js tip or a checks.js
   "why" only by reading the diff back. Four sources are scanned
   here — checks.js (question, options, why), software.js (SPSS and
   JASP steps, the APA sentence, tips), the # comments inside
   snippets.js (the code around them is out of scope by the same
   rule that leaves ggplot's colour = "grey" alone), and site.js's
   QUIPS. What --strict enforces differs by surface on purpose:
     • checks.js + software.js — the full budget-0 rule set. This is
       ordinary site prose that happens to live in a .js file.
     • snippets.js comments + QUIPS — rule 12 (British spellings)
       only. A code comment is a terse annotation, not paragraph
       prose, and CLAUDE.md holds quips to be exempt brand voice;
       spelling is neither judgment nor voice, so it applies to all.
   Em-dashes are reported for these surfaces and not gated: the
   em-dash budget in VOICE.md is per PAGE, and none of these are
   pages.

   INLINE-SCRIPT STRINGS (P39 run 14). Run 13 closed the four SHARED
   js surfaces and left the biggest one open: every page's own inline
   <script>. A lesson's interactive prints verdicts, chart labels,
   log lines and interpretation sentences straight to the reader, and
   quiz.html's 208-question BANK lives there too — none of it reaches
   extractProse(), which strips <script> before it counts a word. The
   run-14 defect was a cleaning-log line reading standardise_group()
   under a checkbox labeled "Standardize categories": visible on the
   page, invisible to every check the site had.

   Two design notes, both learned by testing the checker against the
   unfixed tree BEFORE trusting it:
     • The spelling scan reads EVERY string literal; the prose-like
       filter gates only the reported patterns. The first attempt
       filtered first and missed the very defect it was written for,
       because "standardise_group()  — mapped " carries one real word.
     • It matches on LETTER boundaries, not \b. \bstandardise\b does
       not fire inside standardise_group, since _ is a word character,
       and snake_case is exactly the shape these strings take.
   Enforcement is rule 12 only, for the reason snippet comments are:
   a chart axis label is not paragraph prose. Everything else here is
   reported, not gated.
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

/* VOICE.md rule 12 — the site is American English.
   ------------------------------------------------------------------
   HOW THIS RULE IS MATCHED, AND WHY IT CHANGED (P39 run 16).
   Runs 9–15 used a hand-written inventory of British forms. It failed
   four separate times, each time on a word nobody had thought to list:
   run 9 found modelling/flavours/unravelling after four hand sweeps,
   run 14 found "capitalisation", run 16 found "editorialise",
   "parenthesised" and "unlabelled" — the last of which the inventory
   DID contain as "labelled" and still missed, because \b does not fire
   inside a prefixed word.
   The inventory had the polarity backwards. The words that legitimately
   end in -ise/-our are a small CLOSED class (surprise, exercise, four,
   hour); the words that should end in -ize/-or are OPEN — any author can
   coin "editorialize". So the two open classes are now matched
   GENERATIVELY and their exceptions allow-listed, while the classes that
   genuinely cannot be generalised (-re, doubled consonants, the -ce
   nouns, misc) keep an inventory. Inventory entries of 6+ characters
   also match as a SUFFIX, so unlabelled/kilometres/epicentre are caught
   without listing every prefix.
   Two forms stay DELIBERATELY allowed and must stay allowed:
     • "analyses" — identical to the American plural of "analysis" (a
       substring sweep once rewrote it to "analyzes" seven times);
     • "enrolled"/"enrolling" — already correct American forms (only the
       bare "enrol"/"enrols" differ), likewise "programmed"/"analogue".
   Code literals are out of scope by construction: this linter reads
   rendered prose, so snippets.js's ggplot color="grey" is untouched. */

/* Words that really do end in -ise in American English. Closed class. */
const ISE_OK = [
  'advertise', 'advise', 'anise', 'apprise', 'arise', 'chastise', 'circumcise', 'comprise',
  'compromise', 'concise', 'demise', 'despise', 'devise', 'disfranchise', 'enfranchise',
  'enterprise', 'excise', 'exercise', 'expertise', 'franchise', 'highrise', 'improvise',
  'incise', 'merchandise', 'moonrise', 'mortise', 'paradise', 'precise', 'premise', 'promise',
  'reprise', 'revise', 'rise', 'sunrise', 'supervise', 'surmise', 'surprise', 'televise',
  'treatise', 'valise',
];
/* Words that really do end in -our. Closed class. */
const OUR_OK = [
  'amour', 'contour', 'detour', 'devour', 'dour', 'flour', 'four', 'glamour', 'hour', 'our',
  'paramour', 'pompadour', 'pour', 'scour', 'sour', 'tour', 'tourism', 'tourist', 'troubadour',
  'velour', 'your',
];
/* "analyses" is also the American plural of "analysis" — see the note above. */
const YSE_OK = ['analyses'];

/* base → the inflected forms that must also be allowed */
const inflect = (w) => {
  const out = [w, w + 's'];
  if (w.endsWith('e')) out.push(w + 'd', w.slice(0, -1) + 'ing', w + 'ment', w + 'ments', w + 'r', w + 'rs');
  else out.push(w + 'ed', w + 'ing', w + 'ly', w + 'ism', w + 'ist', w + 'ists', w + 'hood', w + 'hoods');
  return out;
};
/* An allowed word stays allowed under an ordinary derivational prefix
   (unsupervised, repromise), but a prefix is NOT free-form: matching the
   allow list as a bare suffix would excuse "categorise", which ends in
   "rise". */
const PRE = '(?:un|re|pre|non|over|under|mis|co|inter|counter|super|sub|dis|out|self|im|in|en|de)?';
const ALLOW = [
  ...[...ISE_OK, ...OUR_OK, ...YSE_OK].flatMap(inflect).map((w) => PRE + w),
  /* -aise/-oise/-uise never spell a British -ize verb (raise, noise, cruise,
     disguise, turquoise), and -wise is an open English suffix this site uses
     constantly (listwise, pairwise, stepwise). Inflections included, since
     "raises" and "raising" are the forms that actually appear. */
  '[A-Za-z]*(?:ais|ois|uis|wis)(?:e|es|ed|ing|er|ers)',
];
const ALLOW_RE = '(?!(?:' + ALLOW.join('|') + ')(?![A-Za-z]))';

/* The two open classes, matched by shape rather than by memory.
   -iser/-isers are deliberately NOT in the -ise suffix set: "Kaiser",
   "adviser", "miser" and "riser" are all legitimate, and no British -iser
   noun has ever appeared on this site. Add one to the inventory if it does. */
const BRIT_GENERATIVE =
  '(?<![A-Za-z])' + ALLOW_RE + '(?:' +
    '[A-Za-z]*(?:is|ys)(?:e|es|ed|ing|ation|ations)' +                 // -ise / -yse / -isation
    '|[A-Za-z]*our(?:s|ed|ing|ite|ites|ful|fully|less|able|ably|al|ally|ism|ist|ists|hood|hoods|ly)?' +
  ')(?![A-Za-z])';

/* The classes that cannot be generalised: -re, doubled consonants, -ce
   nouns, and one-offs. Entries of 6+ chars also match as a suffix. */
const BRIT_SPELLINGS = [
  // -re
  'centre', 'centres', 'centred', 'centring', 'metre', 'metres', 'litre', 'litres',
  'fibre', 'fibres', 'theatre', 'theatres', 'calibre', 'sombre', 'spectre', 'lustre',
  // doubled consonants
  'cancelling', 'cancelled', 'labelling', 'labelled', 'modelling', 'modelled',
  'travelling', 'travelled', 'signalling', 'signalled', 'fuelled', 'totalled',
  'marvelled', 'unravelling', 'unravelled', 'levelling', 'levelled',
  // -ence / -ce nouns and misc
  'defence', 'offence', 'licence', 'licences', 'pretence',
  'artefact', 'artefacts', 'artefactual', 'enrol', 'enrols',
  'grey', 'greyed', 'sceptic', 'sceptics', 'sceptical', 'sceptically', 'scepticism',
  'judgement', 'judgements', 'ageing', 'programme', 'programmes',
  'manoeuvre', 'manoeuvres', 'moustache', 'plough', 'storey', 'storeys', 'tyre', 'tyres',
];
const BRIT_LONG = BRIT_SPELLINGS.filter((w) => w.length >= 6);
const BRIT_SHORT = BRIT_SPELLINGS.filter((w) => w.length < 6);
const BRIT_INVENTORY =
  '(?<![A-Za-z])(?:[A-Za-z]*(?:' + BRIT_LONG.join('|') + ')|(?:' + BRIT_SHORT.join('|') + '))(?![A-Za-z])';

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
  {
    id: 'britspell', col: 'brit', budget: 0,
    label: `British spellings (the site is American English)`,
    res: [new RegExp(BRIT_INVENTORY, 'gi'), new RegExp(BRIT_GENERATIVE, 'gi')],
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
  'cheat-test-chooser.html', 'cheat-apa.html', 'cheat-assumptions.html', 'privacy.html'];
const GUIDES =['analyze-thesis-data-jasp', 'spss-output-to-apa', 'choose-statistics-dissertation', 'clean-survey-data', 'complete-worked-project'];
/* section hubs — <folder>/index.html for a folder that publishes pages but is
   not a course (guides/). Mirrors HUB_FOLDERS in tools/audit.js. */
const HUB_FOLDERS = ['guides'];
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

/* Slice a balanced […] starting at src[start], honoring quotes + \ escapes. */
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
    // heuristic worst-first ranking: hard-budget overages + every banned-flavor hit
    score: Math.max(0, dashes - EMDASH_PAGE_MAX) + Math.max(0, faqDashes - EMDASH_FAQ_MAX)
      + banned + counts['think-of'] + Math.max(0, counts.notice - NOTICE_PAGE_MAX) + verdicts.length,
    banned,
  };
}

const COURSE_PAGES = (win.CURRICULUM || []).map((c) => c.slug);

/* ============================================================
   JS-injected prose (see the header note) — five surfaces, two
   strictness levels. Each entry: { file, strict: 'all' | 'spell',
   items: [{ key, text }] }.
   ============================================================ */

const stripTags = (s) => decodeEntities(String(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/* ------------------------------------------------------------------
   Inline-script strings (P39 run 14) — see the header note.
   ------------------------------------------------------------------ */

/* Rule 12 on LETTER boundaries rather than \b, because these strings
   are code-shaped: \bstandardise\b never fires inside
   standardise_group (_ is a word character), which is precisely how
   the run-14 defect stayed invisible. Both halves of rule 12 (the
   generative classes and the inventory) are already letter-bounded
   since run 16, so this surface reuses them unchanged. */
const BRIT_LETTER_BOUNDED = new RegExp('(?:' + BRIT_INVENTORY + ')|(?:' + BRIT_GENERATIVE + ')', 'gi');

/* A page's own <script> blocks: no src=, and never the JSON-LD. */
function inlineScriptBlocks(html) {
  const out = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1] || '';
    if (/\bsrc\s*=/i.test(attrs)) continue;
    if (/type\s*=\s*["']application\/ld\+json/i.test(attrs)) continue;
    out.push(m[2]);
  }
  return out;
}

/* Every string literal in a block of JS, quotes and \ escapes honored,
   // and /* comments skipped so their contents aren't read as code. */
function stringLiterals(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (ch === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i); if (i < 0) break; i += 2; continue; }
    if (ch === '"' || ch === "'" || ch === '`') {
      const q = ch;
      let j = i + 1, buf = '';
      while (j < src.length) {
        if (src[j] === '\\') { buf += src[j + 1] === 'n' ? ' ' : src[j + 1]; j += 2; continue; }
        if (src[j] === q) break;
        buf += src[j];
        j++;
      }
      out.push(buf);
      i = j + 1;
      continue;
    }
    i++;
  }
  return out;
}

/* Would a reader recognize this literal as a sentence rather than a
   selector, a colour, a URL or an id? Used ONLY to decide what the
   non-spelling patterns are reported against — see the header note. */
const NOT_PROSE = /[{;]|^\s*[.#][A-Za-z-]+|^[a-z-]+\s*:\s*\S+$|^\d|^#[0-9a-f]{3,8}$/i;
function proseLike(s) {
  const t = stripTags(s).replace(/\s+/g, ' ').trim();
  if (t.length < 12) return null;
  if (/^https?:|^\.\.?\//.test(t)) return null;
  if (NOT_PROSE.test(t)) return null;
  if (!/[a-z]{3}/.test(t)) return null;
  const words = t.split(' ').filter((w) => /^[A-Za-z][A-Za-z'’-]{2,}$/.test(w));
  return words.length >= 3 ? t : null;
}

function inlineScriptStrings() {
  const files = [
    ...READY.map((s) => `${s.course}/${s.slug}/index.html`),
    ...GUIDES.map((g) => `guides/${g}/index.html`),
    ...COURSE_PAGES.map((c) => `${c}/index.html`),
    ...HUB_FOLDERS.map((h) => `${h}/index.html`),
    ...ROOT_PAGES,
  ];
  const items = [];
  for (const p of files) {
    const file = path.join(ROOT, p);
    if (!fs.existsSync(file)) continue;
    for (const src of inlineScriptBlocks(read(file))) {
      for (const lit of stringLiterals(src)) {
        const flat = stripTags(lit).replace(/\s+/g, ' ').trim();
        if (!flat) continue;
        /* spellText is scanned for rule 12 always; text carries the
           prose-like subset the other patterns are measured on. */
        items.push({ key: p, text: proseLike(lit) || '', spellText: flat });
      }
    }
  }
  return items;
}

function jsSurfaces() {
  const out = [];
  const inj = loadWindow([
    path.join(ROOT, 'assets/js/checks.js'),
    path.join(ROOT, 'assets/js/software.js'),
    path.join(ROOT, 'assets/js/snippets.js'),
  ]);

  const checks = [];
  for (const [slug, qs] of Object.entries(inj.CHECKS || {})) {
    qs.forEach((q, i) => {
      checks.push({ key: `${slug} · Q${i + 1}`, text: stripTags(q.q) });
      (q.o || []).forEach((o, j) => checks.push({ key: `${slug} · Q${i + 1} option ${j + 1}`, text: stripTags(o) }));
      checks.push({ key: `${slug} · Q${i + 1} why`, text: stripTags(q.why) });
    });
  }
  out.push({ file: 'assets/js/checks.js', strict: 'all', items: checks });

  const software = [];
  for (const [slug, e] of Object.entries(inj.SOFTWARE || {})) {
    (e.spss || []).forEach((s, i) => software.push({ key: `${slug} · SPSS ${i + 1}`, text: stripTags(s) }));
    (e.jasp || []).forEach((s, i) => software.push({ key: `${slug} · JASP ${i + 1}`, text: stripTags(s) }));
    if (e.apa) software.push({ key: `${slug} · APA sentence`, text: stripTags(e.apa) });
    (e.tips || []).forEach((t, i) => software.push({ key: `${slug} · tip ${i + 1}`, text: stripTags(t) }));
  }
  out.push({ file: 'assets/js/software.js', strict: 'all', items: software });

  /* Only the # comments: the code itself is out of scope, exactly as
     ggplot's colour = "grey" is in the page-prose scanner. Verified
     that no snippet uses '#' for anything but a comment. */
  const comments = [];
  for (const [slug, e] of Object.entries(inj.SNIPPETS || {})) {
    for (const lang of Object.keys(e)) {
      String(e[lang]).split('\n').forEach((lineText, i) => {
        const at = lineText.indexOf('#');
        if (at < 0) return;
        const c = lineText.slice(at + 1).trim();
        if (c) comments.push({ key: `${slug} · ${lang} line ${i + 1}`, text: c });
      });
    }
  }
  out.push({ file: 'assets/js/snippets.js (comments)', strict: 'spell', items: comments });

  /* QUIPS lives inside site.js, which needs a DOM to run — slice the
     object literal out and evaluate just that. */
  const siteSrc = read(path.join(ROOT, 'assets/js/site.js'));
  const quips = [];
  for (const [name, marker] of [['QUIPS', 'var QUIPS = {'], ['QUIP_POOL', 'var QUIP_POOL = [']]) {
    const at = siteSrc.indexOf(marker);
    if (at < 0) continue;
    const lit = sliceBalanced(siteSrc, siteSrc.indexOf(marker.endsWith('{') ? '{' : '[', at));
    if (!lit) continue;
    const val = vm.runInNewContext('(' + lit + ')');
    const entries = Array.isArray(val) ? val.map((t, i) => [`${name} ${i + 1}`, t]) : Object.entries(val);
    for (const [k, t] of entries) quips.push({ key: k, text: stripTags(t) });
  }
  out.push({ file: 'assets/js/site.js (QUIPS)', strict: 'spell', items: quips });

  /* glossary-data.js — 274 definitions in the site's own voice, and until
     P39 run 25 no linter of any kind read them (the page scanner sees only
     the empty shell glossary.html renders into). Run 25 wrote "Analysing"
     into a new entry and caught it by eye, which is the surface arguing for
     itself. Held to rule 12 only: a definition is a dictionary entry, so its
     dash rate and its "the point is" are not paragraph-prose questions. */
  const gloss = [];
  for (const g of loadWindow([path.join(ROOT, 'assets/js/glossary-data.js')]).GLOSSARY || []) {
    gloss.push({ key: g.t, text: stripTags(g.t + '. ' + g.d) });
  }
  out.push({ file: 'assets/js/glossary-data.js', strict: 'spell', items: gloss });

  /* one token before the space, so --page inline-scripts inspects it. */
  out.push({ file: 'inline-scripts (every page)', strict: 'spell', items: inlineScriptStrings(), spellAll: true });

  for (const s of out) {
    s.hits = [];
    s.dashes = 0;
    for (const it of s.items) {
      s.dashes += countDashes(it.text);
      for (const h of findHits(it.text, it.key)) {
        /* on a spellAll surface the raw scan below owns rule 12
           outright, so drop the \b hits here rather than count the
           same word twice. */
        if (s.spellAll && h.pattern === 'britspell') continue;
        s.hits.push(h);
      }
      /* spellAll surfaces re-scan the RAW literal for rule 12, on
         letter boundaries — see the header note: filtering to prose
         first, or trusting \b, each hides a snake_case spelling. */
      if (s.spellAll && it.spellText) {
        const t = it.spellText;
        for (const m of t.matchAll(BRIT_LETTER_BOUNDED)) {
          const from = Math.max(0, m.index - 30);
          const to = Math.min(t.length, m.index + m[0].length + 30);
          s.hits.push({
            pattern: 'britspell',
            source: it.key,
            snippet: `…${t.slice(from, m.index)}»${m[0]}«${t.slice(m.index + m[0].length, to)}…`,
          });
        }
      }
    }
    s.counts = {};
    for (const p of PATTERNS) s.counts[p.id] = s.hits.filter((h) => h.pattern === p.id).length;
  }
  return out;
}

const JS_SURFACES = jsSurfaces();

/* A surface's strict failures: every banned pattern, or spelling only. */
function jsStrictFails() {
  const fails = [];
  for (const s of JS_SURFACES) {
    const rules = PATTERNS.filter((p) => p.budget === 0 && (s.strict === 'all' || p.id === 'britspell'));
    for (const p of rules) {
      for (const h of s.hits.filter((x) => x.pattern === p.id)) {
        fails.push(`${s.file} — ${h.source}: banned ${p.id} ${h.snippet}`);
      }
    }
  }
  return fails;
}

const pages = [];
for (const s of READY) pages.push(scanPage('lesson', `${s.course}/${s.slug}/`, path.join(ROOT, s.course, s.slug, 'index.html'), s.slug));
for (const g of GUIDES) pages.push(scanPage('guide', `guides/${g}/`, path.join(ROOT, 'guides', g, 'index.html'), null));
for (const c of COURSE_PAGES) pages.push(scanPage('course', `${c}/`, path.join(ROOT, c, 'index.html'), null));
for (const h of HUB_FOLDERS) pages.push(scanPage('hub', `${h}/`, path.join(ROOT, h, 'index.html'), null));
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
  fails.push(...jsStrictFails());
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

  console.log('\nJS-INJECTED PROSE (not pages, so no em-dash budget — see the header note)');
  console.log(line(96));
  console.log(pad('surface', 40) + rpad('strings', 9) + rpad('em—', 6) + rpad('banned', 8) + rpad('enforced', 10));
  for (const s of JS_SURFACES) {
    const rules = PATTERNS.filter((p) => p.budget === 0 && (s.strict === 'all' || p.id === 'britspell'));
    const banned = rules.reduce((n, p) => n + s.counts[p.id], 0);
    console.log(pad(s.file, 40) + rpad(s.items.length, 9) + rpad(s.dashes, 6) + rpad(banned, 8)
      + rpad(s.strict === 'all' ? 'all rules' : 'spelling', 10));
  }

  const worst = [...pages].sort((a, b) => b.score - a.score || b.dashes - a.dashes).slice(0, 10);
  console.log('\nWORST 10 PAGES');
  console.log(line(96));
  console.log(HEADER);
  for (const pg of worst) console.log(pageRow(pg));
}

const args = process.argv.slice(2);

if (args[0] === '--page') {
  /* a JS surface can be inspected the same way: --page assets/js/software.js */
  const surface = JS_SURFACES.find((s) => s.file.split(' ')[0] === (args[1] || '').replace(/^\.\//, ''));
  if (surface) {
    console.log(`${surface.file} — ${surface.items.length} strings · ${surface.dashes} em-dashes (not budgeted) · --strict enforces `
      + (surface.strict === 'all' ? 'every budget-0 rule' : 'British spellings only'));
    if (!surface.hits.length) console.log('\nno pattern hits.');
    for (const p of PATTERNS) {
      const hits = surface.hits.filter((h) => h.pattern === p.id);
      if (!hits.length) continue;
      const gated = surface.strict === 'all' || p.id === 'britspell';
      console.log(`\n${p.label} — ${hits.length}×${gated ? '' : ' (reported, not gated on this surface)'}`);
      for (const h of hits) console.log(`  [${h.source}] ${h.snippet}`);
    }
    process.exit(0);
  }
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
