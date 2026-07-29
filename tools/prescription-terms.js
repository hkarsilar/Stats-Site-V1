#!/usr/bin/env node
/*
 * prescription-terms.js — does the site PRESCRIBE a method it never TEACHES?
 * -------------------------------------------------------------------------
 * P39 run 23. Editorial health, not build health: deliberately NOT part of
 * tools/audit.js and NOT a commit gate. Run it, read it, use your judgment.
 *
 * WHY THIS EXISTS
 * ---------------
 * advice-terms.js (run 19) asks the same question of software.js and checks.js,
 * because those are the site speaking in its own voice inside a .js file that
 * no prose checker reaches. It deliberately stops there. But the site tells a
 * reader what to run in four other places, and none of them is prose either:
 *
 *   - the three cheat posters' "If it's violated" column,
 *   - problems.html's worked solutions and answer lines,
 *   - which-test.html's decision-tree leaves,
 *   - plan.html's plan cards.
 *
 * Run 23 found the shape by hand: cheat-assumptions.html's equal-variances row
 * said "Use Welch's t / Welch's ANOVA", and while §1.12 teaches Welch's *t*,
 * NO LESSON ON THE SITE TAUGHT WELCH'S ANOVA. The two words appeared together
 * in exactly two files, that poster cell and a snippets.js code comment. A
 * reader who did as the poster said had nowhere to go to find out what it was.
 *
 * THE RULE
 * --------
 * A prescription surface may name a method only if the site's TEACHING prose
 * (lesson bodies + guides) names it too. Two candidate shapes, both closed:
 *
 *   1. a hyphen-joined capitalized compound  — Games-Howell, Greenhouse-Geisser,
 *      Benjamini-Hochberg, Brown-Forsythe, Welch-Satterthwaite;
 *   2. a capitalized name plus a METHOD HEAD NOUN — Welch's ANOVA, Dunnett's
 *      test, Tukey's HSD, Levene's test.
 *
 * The gate is the WHOLE pair, not the surname. That is the load-bearing part:
 * "Welch" is taught (Welch's t), so gating on the surname alone misses the very
 * defect this was written for. Shape 2 is checked as Name...HeadNoun inside one
 * clause (25 characters), which is what makes "Welch's ANOVA" fail while
 * "Welch's t" passes.
 *
 * MEASURED, NOT GUESSED
 * ---------------------
 * (a) DASH NORMALIZATION IS LOAD-BEARING. The posters write "Greenhouse–Geisser"
 *     with an en dash and the lesson writes "Greenhouse-Geisser" with a hyphen;
 *     which-test.html writes "Kruskal-Wallis" and the lesson writes "Kruskal–Wallis".
 *     Without normalizing, four of the corpus's best-taught names flag, and the
 *     report is nothing but dash noise. Same lesson run 20 learned on apostrophes.
 * (b) A BARE CAPITALIZED TOKEN IS THE WRONG CANDIDATE. Taking any capitalized
 *     word not found in prose gave 22 flags, and after a first-five-letters stem
 *     gate 10 — every one of them ordinary English or a scenario name (September,
 *     Yesterday, Marek, Queue, Sketch, Array, Migraine, Deprived, Unordered).
 *     Requiring either a compound or a head noun gave 1. What makes a capitalized
 *     word a method is not its rarity; it is the noun beside it.
 * (c) SNIPPETS.JS COMMENTS WERE TRIED AND DROPPED. Adding them took the corpus
 *     from 617 to 1,006 chunks and produced one extra flag, Iglewicz-Hoaglin,
 *     which data/outliers-in-practice teaches perfectly well; the hit came from
 *     the crude comment extraction, not from a gap. advice-terms.js already made
 *     the measured call that snippet code is a quotation from the software's own
 *     interface, and this tool keeps that boundary.
 *
 * KNOWN BLIND SPOTS, stated rather than smoothed over:
 *   - A method named in ORDINARY LOWERCASE WORDS is invisible ("the bootstrap
 *     percentile interval", "a rank-based follow-up"). Same limit advice-terms
 *     documents; the capital is what holds the precision.
 *   - The head-noun list is closed. A prescription reading "Welch's approach"
 *     passes, because "approach" is not on it. Widening it is cheap; widening it
 *     without measuring is how a checker starts reporting prose.
 *   - Prose is checked SITEWIDE, not against the page the prescription points at.
 *     Run 22 measured per-destination gating on a neighboring tool and found an
 *     18% flag rate of pure phrase artifacts, needing a 46-entry allow-list.
 *
 * If it fires, teach the method in a lesson, or reword the prescription to name
 * something the site does teach. Only add to ACKED when the site genuinely owes
 * no explanation.
 *
 * Usage:
 *   node tools/prescription-terms.js                 # full report
 *   node tools/prescription-terms.js --surface problems.html
 *   node tools/prescription-terms.js --strict        # exit 1 on any flag not in ACKED
 */

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

/* Acknowledged-benign flags: name -> why it is fine.
   Empty on the run that shipped this. Keep it empty if you can. */
const ACKED = {};

/* Method head nouns. Closed on purpose — see blind spots above. */
const HEAD = ['test', 'tests', 'correction', 'corrections', 'ANOVA', 'HSD',
  'procedure', 'adjustment', 'method', 'statistic', 'distribution', 'rule',
  'criterion', 'estimator', 'regression', 'residual', 'residuals', 'trace',
  'lambda', 'alpha', 'kappa', 'd', 'V', 'U', 'W', 'Q', 't'];

/* --- text helpers ------------------------------------------------------- */

/* Curly quotes and every dash collapse to their ASCII forms. Load-bearing:
   the same name is written three ways across these files. */
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

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['.git', '.claude', 'node_modules', 'assets', 'tools'].includes(e.name)) continue;
      walk(p, out);
    } else if (e.name === 'index.html') {
      out.push(path.relative(ROOT, p));
    }
  }
  return out;
}

const isTeaching = p =>
  /^(stats-[1-4]|ml|methods|data|writing|ethics)[/\\][^/\\]+[/\\]index\.html$/.test(p) ||
  /^guides[/\\]/.test(p);

/* --- corpora ------------------------------------------------------------ */

/* What the site TEACHES: lesson bodies and guides, rendered. */
function teachingProse() {
  let s = '';
  for (const p of walk(ROOT)) if (isTeaching(p)) s += ' ' + textify(fs.readFileSync(p, 'utf8'));
  return s;
}

/* What the site PRESCRIBES: four surfaces, each a place the site says
   "here is what to run" without being prose. */
function prescriptions() {
  const out = [];
  const add = (file, text) => { const t = norm(text).trim(); if (t) out.push({ file, text: t }); };

  for (const f of fs.readdirSync(ROOT).filter(x => /^cheat-.*\.html$/.test(x))) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of src.matchAll(/<td class="fix">([\s\S]*?)<\/td>/g)) add(f, textify(m[1]));
  }

  if (fs.existsSync(path.join(ROOT, 'problems.html'))) {
    const src = fs.readFileSync(path.join(ROOT, 'problems.html'), 'utf8');
    for (const m of src.matchAll(/<ol class="pb-steps">([\s\S]*?)<\/ol>/g)) add('problems.html', textify(m[1]));
    for (const m of src.matchAll(/<p class="pb-answer">([\s\S]*?)<\/p>/g)) add('problems.html', textify(m[1]));
  }

  /* which-test.html and plan.html carry their recommendations as string
     literals inside the page's largest inline script (NODES / LEAVES). */
  for (const f of ['which-test.html', 'plan.html']) {
    const fp = path.join(ROOT, f);
    if (!fs.existsSync(fp)) continue;
    const src = fs.readFileSync(fp, 'utf8');
    const big = [...src.matchAll(/<script>([\s\S]*?)<\/script>/g)]
      .map(m => m[1]).sort((a, b) => b.length - a.length)[0] || '';
    for (const m of big.matchAll(/'((?:[^'\\]|\\.){15,}?)'|"((?:[^"\\]|\\.){15,}?)"/g)) {
      add(f, textify(m[1] || m[2]));
    }
  }
  return out;
}

/* --- the check ---------------------------------------------------------- */

const COMPOUND = /\b([A-Z][a-zé]{2,}(?:-[A-Z][a-zé]{2,})+)(?:'s)?\b/g;
const NAMED = new RegExp("\\b([A-Z][a-z\\u00e9]{2,})'s\\s+(" + HEAD.join('|') + ")\\b", 'g');

function run() {
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  const si = args.indexOf('--surface');
  const only = si >= 0 ? args[si + 1] : null;

  const prose = teachingProse();
  let chunks = prescriptions();
  if (only) chunks = chunks.filter(c => c.file === only);

  const flags = new Map();   // key -> { where:Set, sample:string }
  const seen = new Set();

  for (const { file, text } of chunks) {
    for (const m of text.matchAll(COMPOUND)) {
      const key = m[1];
      seen.add(key);
      const re = new RegExp(key.replace(/-/g, '[- ]'), 'i');
      if (re.test(prose)) continue;
      record(flags, key, file, text);
    }
    for (const m of text.matchAll(NAMED)) {
      const key = m[1] + "'s " + m[2];
      seen.add(key);
      /* the pair must sit inside one clause of the prose, not merely both
         exist somewhere on the site */
      const re = new RegExp(m[1] + '[^.]{0,25}\\b' + m[2] + '\\b', 'i');
      if (re.test(prose)) continue;
      record(flags, key, file, text);
    }
  }

  const rows = [...flags.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const live = rows.filter(([k]) => !(k in ACKED));

  console.log('prescription-terms — ' + chunks.length + ' prescription chunks'
    + (only ? ' on ' + only : ' across posters + problems.html + which-test.html + plan.html'));
  console.log('  ' + seen.size + ' distinct method names prescribed');
  console.log('');

  if (!rows.length) {
    console.log('No prescribed method is missing from the site\'s teaching prose.');
    return 0;
  }

  console.log(rows.length + ' prescribed name(s) absent from lesson/guide prose:');
  for (const [key, info] of rows) {
    const acked = key in ACKED;
    console.log('  ' + (acked ? 'ACKED' : 'FLAG ') + '  ' + key);
    console.log('         ' + [...info.where].join(', '));
    console.log('         "' + info.sample.slice(0, 110) + (info.sample.length > 110 ? '…' : '') + '"');
    if (acked) console.log('         reason: ' + ACKED[key]);
  }

  if (strict && live.length) {
    console.log('\n--strict: ' + live.length + ' unacknowledged flag(s).');
    return 1;
  }
  return 0;
}

function record(map, key, file, text) {
  if (!map.has(key)) map.set(key, { where: new Set(), sample: text });
  map.get(key).where.add(file);
}

process.exit(run());
