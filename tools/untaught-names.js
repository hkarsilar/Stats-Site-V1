#!/usr/bin/env node
/* ============================================================
   untaught-names.js — does the site NAME a method and never say what it is?

   Zero-dependency Node script (built-ins only). Run from the repo root:

       node tools/untaught-names.js            # report
       node tools/untaught-names.js --verbose  # every candidate with its count
       node tools/untaught-names.js --strict   # exit 1 on any flag not in ACKED

   Editorial health, not build health, so like prose-lint.js, faq-audit.js,
   widget-terms.js, link-promises.js and advice-terms.js it is deliberately
   NOT wired into audit.js and NOT a commit gate.

   WHY IT EXISTS (P39 run 20). Nearly every refresh run has found the same
   defect by hand: the site drops a NAME in passing and no page ever says
   what it stands for. Run 20's instance was "Weber's law", which appeared
   exactly once on the whole site, in a subordinate clause of
   stats-3/psychometric-functions ("the lifted-weight experiments that gave
   us Weber's law"), with the law itself stated nowhere. Earlier runs found
   the same shape in Pocock, O'Brien, GRIM, TOST, HC3, WCSS and
   rank-biserial, every time by reading rather than by checking.

   The three existing term checkers cover the other surfaces and not this
   one: widget-terms.js reads what an INTERACTIVE prints, advice-terms.js
   reads what software.js/checks.js ADVISE, link-promises.js reads what a
   LINK ANCHOR promises. Ordinary lesson prose was the gap.

   THE RULE: an EPONYM that occurs exactly once across the whole site is a
   name the site drops and never picks up. An eponym is a capitalized
   surname, a possessive, and a HEAD NOUN naming a method — "Weber's law",
   "Mauchly's test", "Bessel's correction". Occurrence count is the axis.

   FIVE DEFINITIONS WERE MEASURED AGAINST THE CORPUS AND DISCARDED FIRST,
   which is the part worth keeping.

   (a) "Never wrapped in <strong> anywhere" as the proxy for untaught gave
       10 flags including Levene's test, Mauchly's test and Cohen's kappa,
       all of which the site plainly teaches. Bolding is a first-use
       convention, not a completeness guarantee; occurrence count needs no
       convention to hold.
   (b) Any possessive + any lower-case word, instead of a closed list of
       head nouns, gave 69 flags: "That's the", "Let's build", "Marek's
       neighbor", "Yesterday's posterior". An apostrophe-s is a possessive;
       it names a method only when the head noun is one.
   (c) Not normalizing apostrophes inflated the once-only list from 2 to 8.
       Lesson HTML writes Welch's with a straight quote and software.js
       writes Welch’s with a curly one, so half that list was one term
       counted as two. LOAD-BEARING: keep the normalization.
   (d) AN ACRONYM CLASS WAS BUILT, MEASURED AND DROPPED. Two or more
       capitals is easy to match and impossible to judge: after filtering
       ordinary words set in capitals (PARTICIPATE, CONSENT, OMNIBUS) and
       indexed series (PC3 in "variance in PC1-PC3"), 26 flags remained and
       they were BBC, USB, USD, API, OS, UX, WCAG, AA, WWII, IRL, HK
       alongside MCMC, JAGS, QRP and OLS. What makes an acronym owed an
       explanation is its DOMAIN, and domain cannot be read off shape. The
       alternative is a hand-kept list of technical acronyms, which is the
       inventory mistake VOICE.md rule 12 documents. Run 20 found "2AFC"
       by hand and that is where finds of this kind will keep coming from.
   (e) The first shout filter lower-cased the text before collecting its
       vocabulary, so every acronym inserted its own lower-case form and
       masked itself: GDPR, MCMC and SDT were all silently filtered and
       only acronyms containing a digit ever flagged. Caught by the
       reintroduce-the-defect step, which is why that step exists. The
       class is gone now, but the trap generalizes: build a vocabulary of
       what the corpus writes in lower case from the ORIGINAL case.

   THE GLOSSARY TRAP, walked into during development and recorded so the
   next reader does not repeat it: glossary-data.js is PLAIN TEXT, not
   HTML, and its definitions legitimately contain "p < .05". Running it
   through an HTML tag-strip treats everything from a "<" to the next ">"
   as one tag and eats most of the deck, which made Simpson's paradox look
   like a once-only name when the glossary defines it perfectly well. The
   same trap is documented in CLAUDE.md for build-search-index.py. Plain
   text gets plainText(); only HTML gets textify().

   KNOWN BLIND SPOTS, stated rather than smoothed over. A name made of
   ORDINARY LOWERCASE WORDS is invisible here: run 20's other finds were
   "staircase", "guess rate" and the equal-variance assumption, none of
   them capitalized, all of them found by reading. So are acronyms, per
   (d). And a name used TWICE passes even if both uses are bare mentions.

   If it fires: say what the name means, in prose, on some page. Only add
   to ACKED when the site genuinely owes no explanation.
   ============================================================ */

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STRICT = process.argv.includes('--strict');
const VERBOSE = process.argv.includes('--verbose');

/* Acknowledged-benign flags. Keep this SHORT: a growing table means the
   rule is wrong, not that the corpus is unusual. */
const ACKED = {
  /* empty today — the corpus is clean */
};

/* Head nouns that turn a possessive into the name of a method. */
const HEAD_NOUNS = ['law', 'test', 'rule', 'correction', 'theorem', 'method', 'procedure',
                    'paradox', 'criterion', 'trace', 'inequality', 'kappa', 'lambda', 'alpha', 'd'];
const EPONYM = new RegExp(`\\b([A-Z][a-z]{2,}'s\\s+(?:${HEAD_NOUNS.join('|')}))\\b`, 'g');

/* ---------- corpus ---------- */
function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === '_site') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (p !== path.join(ROOT, 'tools')) walk(p, out); }
    else if (e.name.endsWith('.html')) out.push(path.relative(ROOT, p));
  }
  return out;
}

/* HTML -> rendered prose. Comments go first: an <!-- node -e ... --> block
   carries verification arithmetic that no reader ever sees. */
function textify(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<head[\s\S]*?<\/head>/i, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ');
}
/* Plain text (glossary definitions) needs whitespace collapsing and nothing else. */
function plainText(s) { return s.replace(/[’‘]/g, "'").replace(/\s+/g, ' '); }

/* snippets.js: only the # comments are the site speaking. A function name or
   an argument is a quotation from the library, the same scope rule
   advice-terms.js uses for SPSS/JASP menu steps. */
function snippetComments(src) {
  return (src.match(/#[^\\'"\n]*/g) || []).join(' ').replace(/[’‘]/g, "'");
}

const files = walk(ROOT, []);
const counts = new Map();        // term -> { n, files:Set }

function tally(text, source) {
  for (const m of text.matchAll(EPONYM)) {
    const term = m[1].replace(/\s+/g, ' ');
    if (!counts.has(term)) counts.set(term, { n: 0, files: new Set() });
    const e = counts.get(term); e.n++; e.files.add(source);
  }
}

for (const f of files) tally(textify(fs.readFileSync(path.join(ROOT, f), 'utf8')), f);
for (const f of ['assets/js/checks.js', 'assets/js/software.js', 'tools/faq_data.py']) {
  tally(textify(fs.readFileSync(path.join(ROOT, f), 'utf8')), f);
}
tally(plainText(fs.readFileSync(path.join(ROOT, 'assets/js/glossary-data.js'), 'utf8')), 'assets/js/glossary-data.js');
tally(snippetComments(fs.readFileSync(path.join(ROOT, 'assets/js/snippets.js'), 'utf8')), 'assets/js/snippets.js');

/* ---------- flags ---------- */
const flags = [...counts.entries()]
  .filter(([, e]) => e.n === 1)
  .map(([term, e]) => ({ term, file: [...e.files][0] }))
  .sort((a, b) => a.term.localeCompare(b.term));

console.log(`untaught-names — ${files.length} pages + 5 shared sources`);
console.log(`  ${counts.size} distinct eponyms named on the site`);

if (VERBOSE) {
  console.log('\nevery eponym, by occurrence count:');
  [...counts.entries()].sort((a, b) => a[1].n - b[1].n || a[0].localeCompare(b[0]))
    .forEach(([t, e]) => console.log(`  ${String(e.n).padStart(4)}  ${t.padEnd(24)} ${[...e.files].slice(0, 3).join(', ')}`));
}

const unacked = flags.filter(f => !(f.term in ACKED));
console.log(`\n${flags.length} name(s) used exactly once sitewide` + (flags.length ? ':' : ' — nothing to report.'));
for (const f of flags) {
  const ack = ACKED[f.term];
  console.log(`  ${ack ? 'ACKED ' : 'FLAG  '}${f.term}`);
  console.log(`         ${f.file}`);
  if (ack) console.log(`         ${ack}`);
}

if (STRICT && unacked.length) {
  console.error(`\nuntaught-names --strict: ${unacked.length} name(s) used once and explained nowhere.`);
  process.exit(1);
}
if (STRICT) console.log('\nuntaught-names --strict: clean.');
