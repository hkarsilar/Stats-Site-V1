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
     node tools/prose-lint.js --bold          # bold-lead bullets, worst pages first
     node tools/prose-lint.js --duplicates    # every cross-page duplicate passage
     node tools/prose-lint.js --strict        # exit 1 if any hard budget is exceeded

   The PATTERNS table + budget constants below MIRROR VOICE.md's
   HARD RULES — if you change a rule there, change it here in the
   same commit (VOICE.md says the same). Voice is editorial
   judgment, not build health, so this script is deliberately NOT
   wired into tools/audit.js.

   ROUND TWO (P73, 15 Aug 2026). Phase 10 got every page under its
   budgets and the site still read AI-made, because the budgets had
   been set where the 2026 corpus could reach rather than where a
   human editor lands — and the corpus then MIGRATED TO THE CAP: on
   15 Aug every one of 136 pages passed ≤10 em-dashes, six sat at
   exactly 10, the lesson median was 6, and the short tool pages ran
   18–34 per 1,000 words where a technical editor runs 1–3. Four
   things changed here, all mirrored in VOICE.md:
     • Rule 1 gained a SECOND CLAUSE the flat cap cannot fake. A page
       must pass ≤4 dashes AND ≤8 per 1,000 of its own words (floored,
       minimum allowance 1). The rate clause exists because
       descriptives.html holds 10 dashes in 291 words: the flat cap
       alone would bless 4 there, still triple a human rate.
     • Rule 2 fell from ≤3 to ≤1 across a lesson's three FAQ answers.
     • The five JS surfaces got their first dash budgets and are gated
       from now on. QUIPS stay exempt — brand voice, reported forever.
     • The report prints the lesson MEDIAN and an AT-THE-CAP count
       beside each budget, because "every page passes" was exactly the
       reading that hid the problem. Budgets are ceilings, not targets.
   Plus two REPORT-ONLY metrics — measured first, gated never, on
   faq-audit.js's precedent that gating a judgment metric only teaches
   future runs to write around it. See their notes further down.

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

const EMDASH_PAGE_MAX = 4;        // rule 1a — flat cap per page of prose (was 10 until P73)
const EMDASH_PER_1K = 8;          // rule 1b — …and per 1,000 words of that page's own prose
const EMDASH_RATE_FLOOR = 1;      // …with a minimum allowance, so a 50-word page isn't gated to 0
const EMDASH_FAQ_MAX = 1;         // rule 2 — across a lesson's three FAQ answers (was 3 until P73)
const THINK_SITE_MAX = 3;         // rule 8 — "Think of it as" sitewide
const NOTICE_PAGE_MAX = 1;        // rule 10 — "Notice how/that" per page
const ANDWATCH_SHARE_MAX = 0.15;  // rule 11 — "…and watch…" meta descriptions

/* Rule 1b: the dash allowance a page's own length earns it. floor(), never
   rounding up, with a floor of EMDASH_RATE_FLOOR so a short page keeps one.
   BOTH clauses gate, so a page's effective ceiling is the smaller of them —
   4 for anything from 500 words up, and tighter below that, which is where
   the worst rates on the site live (descriptives.html: 291 words → 2). */
const rateAllowance = (words) => Math.max(EMDASH_RATE_FLOOR, Math.floor((words * EMDASH_PER_1K) / 1000));
const dashCap = (words) => Math.min(EMDASH_PAGE_MAX, rateAllowance(words));

/* P73 — the first dash budgets for the injected surfaces. Rule 1 is per
   PAGE and none of these are pages, so they get absolute counts instead,
   each set near a quarter of its 15 Aug 2026 load (checks.js 203,
   software.js 66, glossary-data.js 127, inline-script literals 521,
   snippet comments 5 — already at budget). P77 pays these down; from now
   on --strict gates them. QUIPS are `null` = exempt on purpose: VOICE.md's
   anti-rule makes the capybara one-liners brand voice, so their dash count
   is reported forever and gated never. Keys are surface `file` strings. */
const JS_DASH_BUDGETS = {
  'assets/js/checks.js': 50,
  'assets/js/software.js': 15,
  'assets/js/snippets.js (comments)': 5,
  'assets/js/glossary-data.js': 30,
  'inline-scripts (every page)': 130,
  'assets/js/site.js (QUIPS)': null,
};

/* ------------------------------------------------------------------
   REPORT-ONLY METRIC 1 (P73) — the bold-lead bullet.
   `<li><strong>Term:</strong> explanation` is the shape a generated
   corpus reaches for whenever it has three related things to say, and
   no budget can see it: the dash count, the banned patterns and the
   spelling rules all pass on a page built entirely out of them.
   DEFINITION: an <li> whose first element child is a <strong>. Three
   narrower readings were measured against this corpus and discarded —
   requiring a colon inside the <strong> gives 117, requiring one just
   after it gives 12, and either-side gives 133, so the colon is a
   punctuation habit rather than the shape itself; every li/strong
   variant (literal `<li><strong>`, whitespace-tolerant, attribute-
   tolerant) returns the same 447, and not one of the 447 is a whole
   bolded item with no trailing prose. The Phase 16 addendum's hand
   count of 403 came from an ad-hoc scan whose definition wasn't
   recorded; this one is, so future runs measure the same thing.
   NO BUDGET: a bold-lead list is the right shape often enough — a
   glossary-ish rundown of named things — that a gated number would
   only push the next run into writing around it. It is a worklist.
   ------------------------------------------------------------------ */
const BOLD_LEAD_RE = /<li\b[^>]*>\s*<strong\b/gi;

/* ------------------------------------------------------------------
   REPORT-ONLY METRIC 2 (P73) — cross-page duplicate passages.
   An 8-word run of prose appearing on two DIFFERENT pages. Measured as
   a candidate on 15 Aug, where the single suspect turned out to be one
   page's FAQ block colliding with its own FAQPage JSON-LD rather than
   a cross-page repeat; this generalizes it to all 136 pages.
   Three things are load-bearing, each arrived at by measuring:
     • The baked <footer> is stripped first. It is the same sentence on
       every page, so without that every long page collides with every
       other on its own footer tail — 207 shingles before, 125 after,
       and the ones it removed were pure chrome. (Only the duplicate
       scan strips it: taking it out of extractProse would shift every
       page's word count and rate, breaking comparison with the P73
       baseline.) A lesson's FAQ block is already excluded upstream,
       and head JSON-LD never enters, since extractProse starts at
       <body> — between them, the 15 Aug false positive cannot recur.
     • A window needs at least SHINGLE_MIN_WORDY real words. Without
       it the report fills with APA statistics that legitimately repeat
       ("f 2 102 11 57 p lt 001") — those are shared NUMBERS, not
       shared prose, and the site's numbers are supposed to agree.
     • Overlapping windows are merged into maximal passages. One
       repeated sentence otherwise reports as four or five separate
       hits, which reads as five problems instead of one.
   NO BUDGET, and two benign classes stay in the report rather than
   being filtered out of it: a cheat poster deliberately mirrors
   which-test.html's decision tree, and a page naming another page's
   title matches its title. Filtering those would need a list of
   exceptions to maintain — VOICE.md rule 12's lesson — so they are
   left visible and explained instead.
   ------------------------------------------------------------------ */
const SHINGLE_N = 8;         // words per window
const SHINGLE_MIN_WORDY = 6; // …of which this many must be actual words

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
  'cheat-test-chooser.html', 'cheat-apa.html', 'cheat-assumptions.html', 'privacy.html', 'license.html'];
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
  frac12: '½', radic: '√', infin: '∞', sum: '∑', alpha: 'α', beta: 'β', chi: 'χ', divide: '÷',
  eta: 'η', mu: 'μ', sigma: 'σ', rho: 'ρ', phi: 'φ', lambda: 'λ', omega: 'ω', delta: 'δ', epsilon: 'ε',
};
function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-zA-Z]+[0-9]*);/g, (m, n) => NAMED_ENTITIES[n.toLowerCase()] ?? m);
}

/* ------------------------------------------------------------------
   READOUT PLACEHOLDERS (P74) — an em-dash that is a whole element's
   entire text content is a UI glyph, not prose.
   Every interactive on this site ships its stat readouts empty, as
   `<span class="v" id="s-mean">—</span>`, and JS overwrites them on
   boot. Nobody reads them; they are the canvas equivalent of a blank
   field. Counting them as page prose put FOUR pages on P73's worst-20
   worklist whose prose contains ZERO em-dashes — descriptives.html
   (the page cited to justify rule 1b: 10 dashes, all ten placeholders),
   stats-3/signal-detection-theory, ml/classification-metrics and
   stats-3/psychometric-functions — and made rule 1 unsatisfiable for
   them, since P74's iron rule puts the viz out of bounds. 241 of the
   site's 731 counted dashes (33%) were this.
   DEFINITION: an opening tag, optional whitespace, the dash, optional
   whitespace, a CLOSING tag. The looser `>—<` was measured first and
   discarded: it also swallows a dash sitting BETWEEN two sibling
   elements, which is doing real prose work — `<li><strong>HARKing</strong>
   — <em>Hypothesizing After the Results are Known</em></li>` in
   ethics/questionable-research-practices and methods/the-replication-crisis
   are exactly that shape, and are the whole 243-vs-241 difference.
   Stripping the enclosing `<div class="viz">` outright (widget-terms.js's
   stripViz) was the third candidate and is too blunt here: a viz block
   also holds its title, sub and control labels, which ARE prose and
   must stay linted.
   Blind spot, stated rather than smoothed over: a placeholder written
   as `<span>– </span>` (en dash) or as bare text with no element of its
   own is not matched. The site writes them one way today.
   ------------------------------------------------------------------ */
const READOUT_PLACEHOLDER = /(<(?!\/)[a-zA-Z][^>]*>)\s*—\s*(?=<\/)/g;

/* Rendered prose of a page: <body> text minus scripts/styles/<pre>/comments/
   readout placeholders/tags, entities decoded, whitespace collapsed. stripFaq
   removes a lesson's baked-in FAQ block (linted separately from faq_data.py).
   stripChrome additionally drops the baked <footer>, and is used ONLY by the
   duplicate-passage scan — see its note above for why it must not become the
   default. */
function extractProse(html, stripFaq, stripChrome) {
  let s = html;
  const bodyAt = s.search(/<body\b/i);
  if (bodyAt >= 0) s = s.slice(bodyAt);
  if (stripFaq) s = s.replace(/<!--\s*faq:start[\s\S]*?<!--\s*faq:end\s*-->/g, ' ');
  if (stripChrome) s = s.replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ');
  s = s
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(READOUT_PLACEHOLDER, '$1')
    .replace(/<[^>]+>/g, ' ');
  return decodeEntities(s).replace(/\s+/g, ' ').trim();
}

/* How many placeholders a page carries — reported, so the exclusion above is
   visible and auditable rather than silent. Same masking as extractProse. */
function countPlaceholders(html, stripFaq) {
  let s = html;
  const bodyAt = s.search(/<body\b/i);
  if (bodyAt >= 0) s = s.slice(bodyAt);
  if (stripFaq) s = s.replace(/<!--\s*faq:start[\s\S]*?<!--\s*faq:end\s*-->/g, ' ');
  s = s
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  return (s.match(READOUT_PLACEHOLDER) || []).length;
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
/* The overcorrection watch (P73, VOICE.md anti-rule 1): a dash paydown that
   turns every cut dash into a semicolon or a trailing "…" has traded one tell
   for another. Reported per page with NO budget — the number exists so
   P74–P77 can prove the swap didn't happen, not to be optimized. Only the
   real ellipsis character is counted; "..." typed as three periods appears
   in ranges and code and would measure something else. */
const countSemis = (text) => (text.match(/;/g) || []).length;
const countEllipses = (text) => (text.match(/…/g) || []).length;
/* Bold-lead bullets are counted on the HTML, not the rendered prose — the
   whole point is a markup shape, and extractProse has already thrown the
   tags away. Same FAQ exclusion as the prose scan, so a lesson isn't
   charged for the injected-FAQ markup it doesn't author here. */
function countBoldLead(html, stripFaq) {
  let s = html;
  const bodyAt = s.search(/<body\b/i);
  if (bodyAt >= 0) s = s.slice(bodyAt);
  if (stripFaq) s = s.replace(/<!--\s*faq:start[\s\S]*?<!--\s*faq:end\s*-->/g, ' ');
  return (s.match(BOLD_LEAD_RE) || []).length;
}

function scanPage(kind, label, file, slug) {
  const html = read(file);
  const prose = extractProse(html, kind === 'lesson');
  const dupProse = extractProse(html, kind === 'lesson', true);
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
  const cap = dashCap(words);

  return {
    kind, label, file, slug, words, dashes, faqDashes, counts, hits, verdicts, desc,
    dupProse,
    cap, rateCap: rateAllowance(words),
    placeholders: countPlaceholders(html, kind === 'lesson'),
    bold: countBoldLead(html, kind === 'lesson'),
    semis: countSemis(prose), ellipses: countEllipses(prose),
    rate: words ? (dashes * 1000) / words : 0,
    andWatch: !!(desc && AND_WATCH.test(desc)),
    // heuristic worst-first ranking: hard-budget overages + every banned-flavor hit.
    // Overage is against the EFFECTIVE cap (both clauses of rule 1), so the
    // worst-N table is a paydown worklist for P74–P77 rather than a flat-cap list.
    score: Math.max(0, dashes - cap) + Math.max(0, faqDashes - EMDASH_FAQ_MAX)
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
    s.dashMax = JS_DASH_BUDGETS[s.file];   // undefined = unlisted, null = exempt
    if (s.dashMax === undefined) s.dashMax = null;
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

/* A surface's strict failures: every banned pattern (or spelling only), plus
   its P73 dash budget where it has one. */
function jsStrictFails() {
  const fails = [];
  for (const s of JS_SURFACES) {
    const rules = PATTERNS.filter((p) => p.budget === 0 && (s.strict === 'all' || p.id === 'britspell'));
    for (const p of rules) {
      for (const h of s.hits.filter((x) => x.pattern === p.id)) {
        fails.push(`${s.file} — ${h.source}: banned ${p.id} ${h.snippet}`);
      }
    }
    if (s.dashMax !== null && s.dashes > s.dashMax) {
      fails.push(`${s.file} — ${s.dashes} em-dashes (budget ${s.dashMax})`);
    }
  }
  return fails;
}

/* ============================================================
   Cross-page duplicate passages (report-only) — see the note above.
   ============================================================ */

const wordyToken = (t) => /^[a-z'’]{2,}$/.test(t);
const tokenize = (text) => text.toLowerCase().replace(/[^a-z0-9'’\s]/g, ' ').split(/\s+/).filter(Boolean);

function duplicatePassages(pageList) {
  const toks = new Map();
  for (const pg of pageList) toks.set(pg.label, tokenize(pg.dupProse));

  /* shingle → Map(page label → its FIRST index on that page) */
  const shingles = new Map();
  for (const [label, w] of toks) {
    for (let i = 0; i + SHINGLE_N <= w.length; i++) {
      const win = w.slice(i, i + SHINGLE_N);
      if (win.filter(wordyToken).length < SHINGLE_MIN_WORDY) continue;
      const k = win.join(' ');
      let m = shingles.get(k);
      if (!m) { m = new Map(); shingles.set(k, m); }
      if (!m.has(label)) m.set(label, i);
    }
  }

  /* Group the duplicates by the exact set of pages they appear on, then
     merge overlapping windows within a group into one maximal passage. */
  const groups = new Map();
  let dupShingles = 0;
  for (const [, m] of shingles) {
    if (m.size < 2) continue;
    dupShingles++;
    const labels = [...m.keys()].sort();
    const sig = labels.join(' + ');
    let g = groups.get(sig);
    if (!g) { g = { labels, starts: [] }; groups.set(sig, g); }
    g.starts.push(m.get(labels[0]));
  }

  const passages = [];
  for (const { labels, starts } of groups.values()) {
    const w = toks.get(labels[0]);
    starts.sort((a, b) => a - b);
    let start = starts[0], end = starts[0] + SHINGLE_N;
    for (const i of starts.slice(1)) {
      if (i <= end) { end = Math.max(end, i + SHINGLE_N); continue; }
      passages.push({ labels, text: w.slice(start, end).join(' '), len: end - start });
      start = i; end = i + SHINGLE_N;
    }
    passages.push({ labels, text: w.slice(start, end).join(' '), len: end - start });
  }
  passages.sort((a, b) => b.len - a.len || a.labels[0].localeCompare(b.labels[0]));
  return { passages, dupShingles, totalShingles: shingles.size };
}

const pages = [];
for (const s of READY) pages.push(scanPage('lesson', `${s.course}/${s.slug}/`, path.join(ROOT, s.course, s.slug, 'index.html'), s.slug));
for (const g of GUIDES) pages.push(scanPage('guide', `guides/${g}/`, path.join(ROOT, 'guides', g, 'index.html'), null));
for (const c of COURSE_PAGES) pages.push(scanPage('course', `${c}/`, path.join(ROOT, c, 'index.html'), null));
for (const h of HUB_FOLDERS) pages.push(scanPage('hub', `${h}/`, path.join(ROOT, h, 'index.html'), null));
for (const f of ROOT_PAGES) pages.push(scanPage('root', f, path.join(ROOT, f), null));

const DUPES = duplicatePassages(pages);

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
    /* rule 1's two clauses fail separately, so the report says WHICH one a
       page missed — a 300-word tool page at 4 dashes passes the cap and
       fails the rate, and "4 is fine everywhere" is the belief this phase
       exists to correct. */
    if (pg.dashes > EMDASH_PAGE_MAX) fails.push(`${pg.label} — ${pg.dashes} em-dashes in page prose (budget ${EMDASH_PAGE_MAX}/page)`);
    if (pg.dashes > pg.rateCap) fails.push(`${pg.label} — ${pg.dashes} em-dashes in ${pg.words} words = ${pg.rate.toFixed(1)}/1k (budget ${EMDASH_PER_1K}/1k → ${pg.rateCap} here)`);
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
    + rpad(pg.cap, 5) + rpad(pg.kind === 'lesson' ? pg.faqDashes : '·', 5)
    + rpad(pg.bold, 6) + rpad(pg.semis, 6) + rpad(pg.ellipses, 5) + rpad(pg.banned, 7)
    + rpad(pg.counts['think-of'], 6) + rpad(pg.counts.notice, 7) + rpad(pg.kind === 'lesson' ? pg.verdicts.length : '·', 8)
    + rpad(pg.score, 6);
}
const HEADER = pad('page', 46) + rpad('words', 6) + rpad('em—', 5) + rpad('/1k', 6)
  + rpad('cap', 5) + rpad('faq—', 5) + rpad('bold', 6) + rpad('semi', 6) + rpad('ell', 5)
  + rpad('banned', 7) + rpad('think', 6) + rpad('notice', 7) + rpad('verdict', 8) + rpad('score', 6);
const W = 124;   // report width (the table above is 124 columns)

function printSitewide() {
  const lessons = pages.filter((p) => p.kind === 'lesson');
  /* "At the cap" is the number this phase exists because of: on 15 Aug every
     page passed and six sat at exactly the ceiling. A budget a corpus parks
     on is a target. Printed beside every budget from P73 on. */
  const atCap = pages.filter((p) => p.dashes === p.cap && p.cap > 0).length;
  const faqAtCap = lessons.filter((p) => p.faqDashes === EMDASH_FAQ_MAX).length;
  console.log('\nSITEWIDE');
  console.log(line(W));
  console.log(`  em-dashes in page prose: ${pages.reduce((n, p) => n + p.dashes, 0)} total · lesson median ${median(lessons.map((p) => p.dashes))} · max ${Math.max(...pages.map((p) => p.dashes))}`);
  console.log(`      rule 1a ≤${EMDASH_PAGE_MAX}/page: ${pages.filter((p) => p.dashes > EMDASH_PAGE_MAX).length}/${pages.length} pages over`
    + ` · rule 1b ≤${EMDASH_PER_1K}/1k words: ${pages.filter((p) => p.dashes > p.rateCap).length}/${pages.length} over`
    + ` · ${pages.filter((p) => p.dashes > p.cap).length}/${pages.length} over their effective cap · ${atCap} sitting exactly AT it`);
  console.log(`  em-dashes in FAQ answers: ${lessons.reduce((n, p) => n + p.faqDashes, 0)} total across ${lessons.length}×3 answers · median ${median(lessons.map((p) => p.faqDashes))}`
    + ` · ${lessons.filter((p) => p.faqDashes > EMDASH_FAQ_MAX).length} lessons over the ≤${EMDASH_FAQ_MAX}/trio budget · ${faqAtCap} at it`);
  console.log(`  budgets are CEILINGS, not targets — P74–P77 aim at a lesson median of ≤ 2, not every page at ${EMDASH_PAGE_MAX}`);
  console.log(`  readout placeholders excluded as UI, not prose (P74): ${pages.reduce((n, p) => n + p.placeholders, 0)} — see READOUT_PLACEHOLDER`);
  console.log(`  overcorrection watch (no budget, VOICE.md anti-rule): semicolons ${pages.reduce((n, p) => n + p.semis, 0)} total · lesson median ${median(lessons.map((p) => p.semis))} · max ${Math.max(...pages.map((p) => p.semis))}`
    + ` — ellipses ${pages.reduce((n, p) => n + p.ellipses, 0)} total · lesson median ${median(lessons.map((p) => p.ellipses))} · max ${Math.max(...pages.map((p) => p.ellipses))}`);
  console.log(`  FAQ verdict openers ("No — "/"Yes — "): ${verdictTotal} (budget 0)`);
  for (const p of PATTERNS) {
    const budget = p.budget === 0 ? 'budget 0' : p.budget === 'site' ? `budget ${THINK_SITE_MAX} sitewide` : `budget ${NOTICE_PAGE_MAX}/page`;
    console.log(`  ${p.label}: ${totalByPattern[p.id]} (${budget})`);
  }
  console.log(`  "…and watch…" meta descriptions: ${andWatchPages.length}/${descPages.length} = ${(andWatchShare * 100).toFixed(1)}% (budget ≤ ${ANDWATCH_SHARE_MAX * 100}%)`);

  console.log('\nJS-INJECTED PROSE (rule 1 is per PAGE, so these carry their own absolute dash budgets since P73)');
  console.log(line(W));
  console.log(pad('surface', 40) + rpad('strings', 9) + rpad('em—', 6) + rpad('budget', 8) + rpad('over', 7) + rpad('banned', 8) + rpad('enforced', 11));
  for (const s of JS_SURFACES) {
    const rules = PATTERNS.filter((p) => p.budget === 0 && (s.strict === 'all' || p.id === 'britspell'));
    const banned = rules.reduce((n, p) => n + s.counts[p.id], 0);
    const over = s.dashMax === null ? '·' : s.dashes > s.dashMax ? `+${s.dashes - s.dashMax}` : s.dashes === s.dashMax ? 'AT' : 'ok';
    console.log(pad(s.file, 40) + rpad(s.items.length, 9) + rpad(s.dashes, 6)
      + rpad(s.dashMax === null ? 'exempt' : s.dashMax, 8) + rpad(over, 7) + rpad(banned, 8)
      + rpad(s.strict === 'all' ? 'all rules' : 'spelling', 11));
  }

  /* Phase 16's one-number exit criterion (P77): every em-dash a reader can
     actually meet, wherever it lives. Printed here so the closing run reads
     it off the tool instead of adding up eight numbers by hand. 1,801 on
     15 Aug 2026; the phase targets under ~500. QUIPS are counted — they are
     exempt from being GATED, not from being seen. */
  const readerVisible = pages.reduce((n, p) => n + p.dashes + p.faqDashes, 0)
    + JS_SURFACES.reduce((n, s) => n + s.dashes, 0);
  console.log(`\n  READER-VISIBLE EM-DASHES SITEWIDE (page prose + FAQ answers + every injected surface): ${readerVisible}`);

  /* ---- report-only metric 1: bold-lead bullets ---- */
  const lg = pages.filter((p) => p.kind === 'lesson' || p.kind === 'guide');
  console.log(`\nBOLD-LEAD BULLETS  <li><strong>Term:</strong> …  (report only, no budget — P74/P75's reshaping worklist)`);
  console.log(line(W));
  console.log(`  ${lg.reduce((n, p) => n + p.bold, 0)} across ${lg.filter((p) => p.bold > 0).length}/${lg.length} lessons+guides`
    + ` · ${pages.reduce((n, p) => n + p.bold, 0)} across all ${pages.length} pages · lesson median ${median(pages.filter((p) => p.kind === 'lesson').map((p) => p.bold))}`);
  const worstBold = [...pages].sort((a, b) => b.bold - a.bold).filter((p) => p.bold > 0);
  for (const pg of worstBold.slice(0, 15)) console.log(`  ${rpad(pg.bold, 4)}  ${pg.label}`);
  if (worstBold.length > 15) console.log(`  … ${worstBold.length - 15} more pages with at least one (node tools/prose-lint.js --bold)`);

  /* ---- report-only metric 2: cross-page duplicate passages ---- */
  console.log(`\nCROSS-PAGE DUPLICATE PASSAGES  (${SHINGLE_N}-word runs shared by 2+ pages; report only, no budget)`);
  console.log(line(W));
  if (!DUPES.passages.length) {
    console.log(`  none — no ${SHINGLE_N}-word run of prose appears on two different pages. The corpus is clean here; add no rule.`);
  } else {
    console.log(`  ${DUPES.dupShingles} duplicate shingles of ${DUPES.totalShingles} → ${DUPES.passages.length} merged passages. Longest first:`);
    for (const p of DUPES.passages.slice(0, 12)) {
      console.log(`  [${p.len}w] ${p.labels.join(' + ')}`);
      console.log(`        "${p.text}"`);
    }
    if (DUPES.passages.length > 12) console.log(`  … ${DUPES.passages.length - 12} more (node tools/prose-lint.js --duplicates)`);
  }

  const worst = [...pages].sort((a, b) => b.score - a.score || b.dashes - a.dashes).slice(0, 20);
  console.log('\nWORST 20 PAGES');
  console.log(line(W));
  console.log(HEADER);
  for (const pg of worst) console.log(pageRow(pg));
}

const args = process.argv.slice(2);

if (args[0] === '--bold') {
  const rows = [...pages].sort((a, b) => b.bold - a.bold).filter((p) => p.bold > 0);
  const lg = pages.filter((p) => p.kind === 'lesson' || p.kind === 'guide');
  console.log(`bold-lead bullets — ${lg.reduce((n, p) => n + p.bold, 0)} across lessons+guides, ${pages.reduce((n, p) => n + p.bold, 0)} sitewide (report only, no budget)`);
  console.log(line(W));
  for (const pg of rows) console.log(`  ${rpad(pg.bold, 4)}  ${pg.label}`);
  process.exit(0);
}

if (args[0] === '--duplicates') {
  console.log(`cross-page duplicate passages — ${SHINGLE_N}-word runs of prose shared by 2+ pages (report only, no budget)`);
  console.log(line(W));
  if (!DUPES.passages.length) console.log('  none.');
  for (const p of DUPES.passages) {
    console.log(`  [${p.len}w] ${p.labels.join(' + ')}`);
    console.log(`        "${p.text}"`);
  }
  process.exit(0);
}

if (args[0] === '--page') {
  /* a JS surface can be inspected the same way: --page assets/js/software.js */
  const surface = JS_SURFACES.find((s) => s.file.split(' ')[0] === (args[1] || '').replace(/^\.\//, ''));
  if (surface) {
    console.log(`${surface.file} — ${surface.items.length} strings · ${surface.dashes} em-dashes `
      + (surface.dashMax === null ? '(exempt from the dash budget)' : `(budget ${surface.dashMax}${surface.dashes > surface.dashMax ? `, over by ${surface.dashes - surface.dashMax}` : ''})`)
      + ` · --strict enforces `
      + (surface.strict === 'all' ? 'every budget-0 rule' : 'British spellings only')
      + (surface.dashMax === null ? '' : ' + the dash budget'));
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
  console.log(`${pg.label} — ${pg.words} words · ${pg.dashes} em-dashes (${pg.rate.toFixed(1)}/1k)`
    + ` · budget ≤ ${EMDASH_PAGE_MAX}/page AND ≤ ${EMDASH_PER_1K}/1k = ${pg.rateCap} here, so ≤ ${pg.cap}`
    + (pg.dashes > pg.cap ? ` — OVER by ${pg.dashes - pg.cap}` : pg.dashes === pg.cap ? ' — at the cap' : '')
    + (pg.kind === 'lesson' ? ` · ${pg.faqDashes} FAQ em-dashes (budget ≤ ${EMDASH_FAQ_MAX})` : ''));
  console.log(`bold-lead bullets ${pg.bold} · semicolons ${pg.semis} · ellipses ${pg.ellipses}  (report only, no budget)`);
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
console.log(`budgets: em-dash ≤ ${EMDASH_PAGE_MAX}/page AND ≤ ${EMDASH_PER_1K}/1k words · ≤ ${EMDASH_FAQ_MAX}/FAQ trio · banned constructions 0 · think ≤ ${THINK_SITE_MAX} sitewide · notice ≤ ${NOTICE_PAGE_MAX}/page · "and watch" ≤ ${ANDWATCH_SHARE_MAX * 100}% of descriptions`);
console.log(line(W));
console.log(HEADER);
for (const pg of [...pages].sort((a, b) => b.score - a.score || b.dashes - a.dashes)) console.log(pageRow(pg));
printSitewide();
