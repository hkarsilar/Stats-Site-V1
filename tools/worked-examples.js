#!/usr/bin/env node
/* ============================================================
   worked-examples.js — does a published worked example hold together?

   Zero-dependency Node (built-ins only: fs, path, vm). Run from the repo root:

       node tools/worked-examples.js            # flags only
       node tools/worked-examples.js --verbose  # every pair it found
       node tools/worked-examples.js --strict   # exit 1 on any flag not in ACKED

   WHY IT EXISTS (P39 run 21). audit.js CHECK 9 recomputes the *p* beside a
   published statistic — the site's own statcheck, turned on itself. Nothing
   checked the other number in the same sentence: the EFFECT SIZE. Four
   examples were found by hand in one run, all of the same shape, none of them
   reachable by CHECK 9:
     • apa.html's regression default printed R² = .34 beside F(3, 96) = 14.20,
       which implies R² = .31;
     • apa.html's one-sample default printed d = 0.42 beside t(41) = 2.68,
       where n is fixed by df and d must be 0.41;
     • software.js's chi-square sentence gave "68% versus 45%" of N = 120
       alongside χ²(1) = 6.25, which no integer 2×2 table produces;
     • cheat-apa.html's worked sentence gave M/SD pairs that produce t = 2.44,
       not the t(78) = 2.02 printed two clauses later.
   Two of the four live in a TOOL'S FIELD DEFAULTS rather than in prose, which
   is why this script renders apa.html's own nine default sentences under a DOM
   shim and checks those too. A calculator's defaults are a worked example: the
   reader is meant to read them as correct before touching a single field.

   THE RULE. Two identities, both unconditional, both needing nothing but the
   statistic and its own degrees of freedom:
       partial η²  =  F·df₁ / (F·df₁ + df₂)
       R²          =  F·df₁ / (F·df₁ + df₂)
   plus one that holds only when the table shape is forced:
       φ = V = √(χ²/N)   when df = 1, because a 2×2 table has min(r,c)−1 = 1.

   ROUNDING IS HANDLED EXACTLY, NOT WITH A FUDGE FACTOR. A published F of 5.42
   stands for anything in [5.415, 5.425); the identity is monotone in F, so
   that interval maps to an interval of implied η², and the flag fires only
   when it fails to overlap the interval the published η² stands for. No
   tolerance constant appears anywhere in this file, and a two-decimal effect
   size beside a two-decimal F therefore cannot false-fire on rounding alone.

   WHAT IT DELIBERATELY SKIPS, all measured against this corpus rather than
   guessed at:
     • Cohen's d against t. For two independent groups d needs n₁ and n₂
       separately and almost no published sentence states them; for a paired or
       one-sample test n = df + 1 fixes it, but the sentence rarely says which
       design it is. apa.html's variant IS known, so its defaults are checked
       there; free prose is not.
     • Cramér's V when df > 1, because min(rows, cols) is not recoverable.
     • ΔR² (a hierarchical step needs the FULL model's R², which is elsewhere)
       and "adjusted R²" (a different quantity). Both are skipped by name.
     • Any pair with another test statistic between the two halves. That single
       rule is what kills the one false pairing this corpus contains, where
       software.js writes "…, F(1, 76) = 0.31, p = .58. There was also a main
       effect of caffeine, F(1, 76) = 9.31, p = .003, ηp² = .11" and a greedy
       80-character window hands the second effect's η² to the first effect.

   TWO OF THE FOUR DEFECTS ABOVE ARE OUTSIDE ITS REACH, and saying so is more
   useful than implying otherwise. The chi-square one (percentages against χ²)
   and the cheat-sheet one (M/SD pairs against t) are not identities: reversing
   them means searching for an integer 2×2 table that rounds to two published
   percentages, or guessing the group split behind a df. Both were found by
   arithmetic done by hand and both stay hand's work. What this script covers
   is the identity half, which is where three of this run's four surfaces sat.
   Proved by reintroducing four defects on three different surfaces: apa.html's
   R² default, apa.html's one-sample d default, an η²p in lesson HTML and an η²
   in a software.js walkthrough. Each fired with exit 1; each restore returned
   the file byte-identical and the exit code to 0.

   PLAIN η² IS THE ONE JUDGMENT CALL. η² equals partial η² only in a one-way
   between-subjects design. Six of the seven plain-η² pairs on this site are
   one-way and match exactly; the seventh is a repeated-measures example in
   guides/spss-output-to-apa, where η² is legitimately smaller than the partial
   η² the identity returns. That one sits in ACKED with its reason. Dropping
   plain η² altogether would have missed nothing today and would also have
   missed a one-way typo tomorrow, which is the commoner error.

   Editorial health, not build health: like prose-lint, faq-audit, widget-terms,
   link-promises, advice-terms and untaught-names, this is NOT wired into
   audit.js. If it fires, fix the example, not the check.
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const VERBOSE = process.argv.includes('--verbose');
const STRICT = process.argv.includes('--strict');

/* Known-benign flags. Each needs a reason, not just a key. */
const ACKED = [
  {
    where: 'guides/spss-output-to-apa/index.html',
    match: 'F(2, 66.43) = 13.10 / η² = .19',
    why: 'repeated measures: η² (total) is legitimately smaller than the partial η² the identity returns, because SS_total there includes the between-subject variance.'
  }
];

/* ---------- file walk ---------- */
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === '.claude' || e.name === 'node_modules' || e.name === '_site') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

/* ---------- HTML → the text a reader sees ---------- */
function textify(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<sup>\s*2\s*<\/sup>/gi, '²')
    .replace(/<sub>([^<]*)<\/sub>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&minus;/g, '−').replace(/&rarr;/g, '→')
    .replace(/\s+/g, ' ');
}

/* ---------- number helpers ---------- */
/* A published "5.42" stands for [5.415, 5.425). Return that interval, so no
   tolerance constant is ever needed. */
function band(str) {
  const s = String(str).replace('−', '-');
  const v = parseFloat(s);
  if (!Number.isFinite(v)) return null;
  const dot = s.indexOf('.');
  const dp = dot < 0 ? 0 : s.length - dot - 1;
  const half = 0.5 * Math.pow(10, -dp);
  return { v, lo: v - half, hi: v + half, dp };
}
const overlap = (a, b) => a.lo <= b.hi && b.lo <= a.hi;
const varExp = (F, d1, d2) => (F * d1) / (F * d1 + d2);

/* ---------- the pairing ---------- */
const STAT_BREAK = /(?:\b[Ftzr]\s*\(|χ²\s*\()/;   // another statistic starts here

const F_RE = /\bF\s*\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)\s*=\s*(\d+(?:\.\d+)?)/g;
const CHI_RE = /χ²\s*\(\s*(\d+)\s*,\s*N\s*=\s*(\d+)\s*\)\s*=\s*(\d+(?:\.\d+)?)/g;
const T_RE = /\bt\s*\(\s*(\d+)\s*\)\s*=\s*(\d+(?:\.\d+)?)/;

function clauseAfter(text, from) {
  let win = text.slice(from, from + 80);
  const stop = win.search(STAT_BREAK);
  if (stop >= 0) win = win.slice(0, stop);
  const cut = win.search(/[.:;]\s/);          // end of clause
  if (cut >= 0) win = win.slice(0, cut + 1);
  return win;
}

/* The effect size often comes FIRST — "R² = .31, 90% CI […], F(3, 96) = 14.20"
   is the ordinary APA order for a model, and reading only forward missed every
   R² on the site, including the defect this script was written for. Backward is
   the stricter direction: if any other statistic sits in the window, that one
   owns the effect size, so the pair is dropped rather than guessed at. The
   window also stops at the nearest CLAUSE boundary rather than only at a full
   stop, which is what separates the two shapes this corpus actually contains:
   "R² = .31, 90% CI […], F(3, 96) = 14.20" is one clause and pairs, while
   "…ηp² = .08: caffeine improved performance in the morning, F(1, 76) = 15.2"
   puts a colon between them, and that η² belongs to the earlier F. */
function clauseBefore(text, upto) {
  let win = text.slice(Math.max(0, upto - 80), upto);
  const cut = win.search(/[.:;]\s(?=[^.:;]*$)/);
  if (cut >= 0) win = win.slice(cut + 1);
  return STAT_BREAK.test(win) ? '' : win;
}

/* Find an effect size inside one clause. */
function effectIn(win) {
  let m = win.match(/(?:partial\s+η²|ηp²|η²p)\s*=\s*(−?\d*\.\d+)/);
  if (m) return { kind: 'partial-eta', label: 'partial η²', b: band(m[1]), raw: m[0] };
  m = win.match(/R²\s*=\s*(−?\d*\.\d+)/);
  if (m && !/adjusted\s*$|Δ\s*$/.test(win.slice(0, m.index))) {
    return { kind: 'r2', label: 'R²', b: band(m[1]), raw: m[0] };
  }
  m = win.match(/(?:^|[^lc])η²\s*=\s*(−?\d*\.\d+)/);   // plain η², not "partial η²"
  if (m) return { kind: 'eta', label: 'η²', b: band(m[1]), raw: 'η² = ' + m[1] };
  return null;
}

function phiIn(win) {
  const m = win.match(/(?:φ|V)\s*=\s*(−?\d*\.\d+)/);
  return m ? { label: m[0].split('=')[0].trim(), b: band(m[1]), raw: m[0] } : null;
}

const findings = [];
let pairs = 0;

function scan(where, text) {
  for (const m of text.matchAll(F_RE)) {
    const d1 = parseFloat(m[1]), d2 = parseFloat(m[2]), fb = band(m[3]);
    if (!fb || !(d1 > 0) || !(d2 > 0)) continue;
    const eff = effectIn(clauseAfter(text, m.index + m[0].length))
             || effectIn(clauseBefore(text, m.index));
    if (!eff || !eff.b) continue;
    pairs++;
    const impl = { lo: varExp(fb.lo, d1, d2), hi: varExp(fb.hi, d1, d2) };   // increasing in F
    const ok = overlap(impl, eff.b);
    if (VERBOSE || !ok) {
      findings.push({
        where, ok, desc: `${m[0]} / ${eff.raw}`,
        detail: `${eff.label} implied by F is ${impl.lo.toFixed(4)}–${impl.hi.toFixed(4)}, published ${eff.b.v}`
      });
    }
  }
  for (const m of text.matchAll(CHI_RE)) {
    const df = parseFloat(m[1]), N = parseFloat(m[2]), cb = band(m[3]);
    if (df !== 1 || !cb || !(N > 0)) continue;      // only a 2×2 forces k = 1
    const eff = phiIn(clauseAfter(text, m.index + m[0].length))
             || phiIn(clauseBefore(text, m.index));
    if (!eff || !eff.b) continue;
    pairs++;
    const impl = { lo: Math.sqrt(cb.lo / N), hi: Math.sqrt(cb.hi / N) };
    const ok = overlap(impl, eff.b);
    if (VERBOSE || !ok) {
      findings.push({
        where, ok, desc: `${m[0]} / ${eff.raw}`,
        detail: `${eff.label} implied by χ² is ${impl.lo.toFixed(4)}–${impl.hi.toFixed(4)}, published ${eff.b.v}`
      });
    }
  }
}

/* ---------- surfaces 1 and 2: every page, and software.js's APA strings ---------- */
for (const f of walk(ROOT)) {
  scan(path.relative(ROOT, f), textify(fs.readFileSync(f, 'utf8')));
}
{
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/software.js'), 'utf8'), ctx);
  const SW = ctx.window.SOFTWARE || {};
  for (const slug of Object.keys(SW)) {
    if (SW[slug].apa) scan(`assets/js/software.js [${slug}]`, textify(SW[slug].apa));
  }
}

/* ---------- surface 3: apa.html's own default sentences ----------
   Rendered, not read: the defaults live in ternaries inside the analysis
   config, so the only honest way to see what a reader sees is to run the
   page's formatter. The shim gives it just enough DOM to boot. */
let apaRendered = 0, apaError = null;
const COMBOS = [['t', 'ind'], ['t', 'paired'], ['t', 'one'], ['anova', 'one'], ['anova', 'fact'],
                ['chi', null], ['corr', null], ['reg', 'coef'], ['reg', 'model']];
try {
  const html = fs.readFileSync(path.join(ROOT, 'apa.html'), 'utf8');
  const src = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(b => b[1])
    .sort((a, b) => b.length - a.length)[0];
  const vizSrc = fs.readFileSync(path.join(ROOT, 'assets/js/viz.js'), 'utf8');

  for (const [a, v] of COMBOS) {
    const fields = new Map();
    const out = {};
    const els = new Map();
    const stub = (id) => ({
      id, _html: '', value: '', style: {},
      classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
      addEventListener() {}, querySelectorAll() { return []; },
      closest() { return null; }, getAttribute() { return null; }, setAttribute() {},
      get innerHTML() { return this._html; },
      set innerHTML(val) {
        this._html = val;
        if (id === 'apa-fields') {
          fields.clear();
          val.replace(/id="f-([^"]+)"[^>]*?value="([^"]*)"/g, (_, k, x) => { fields.set(k, { value: x }); return ''; });
        }
        if (id === 'apa-out') out.html = val;
      },
      get textContent() { return this._html.replace(/<[^>]+>/g, ''); }
    });
    const document = {
      getElementById(id) {
        if (id.slice(0, 2) === 'f-') return fields.get(id.slice(2)) || null;
        if (!els.has(id)) els.set(id, stub(id));
        return els.get(id);
      },
      querySelectorAll() { return []; },
      addEventListener() {}
    };
    const ctx = { console, document, URLSearchParams, navigator: {},
                  location: { search: '?a=' + a + (v ? '&v=' + v : '') } };
    ctx.window = ctx;
    vm.createContext(ctx);
    vm.runInContext(vizSrc, ctx);
    ctx.VIZ = ctx.window.VIZ;
    vm.runInContext(src, ctx);
    if (!out.html) throw new Error('apa.html rendered nothing for ' + a + (v ? '/' + v : ''));
    apaRendered++;
    const txt = textify(out.html);
    const where = `apa.html [defaults: ${a}${v ? '/' + v : ''}]`;
    scan(where, txt);

    /* d against t, which only this surface can do: the variant names the
       design, so for a paired or one-sample test n = df + 1 fixes d = t/√n. */
    if (a === 't' && (v === 'paired' || v === 'one')) {
      const mt = txt.match(T_RE);
      const md = txt.match(/\bdz?\s*=\s*(−?\d*\.?\d+)/);
      if (mt && md) {
        pairs++;
        const df = parseFloat(mt[1]), tb = band(mt[2]), db = band(md[1]);
        const n = df + 1;
        const impl = { lo: tb.lo / Math.sqrt(n), hi: tb.hi / Math.sqrt(n) };
        const ok = overlap(impl, db);
        if (VERBOSE || !ok) {
          findings.push({
            where, ok, desc: `${mt[0]} / ${md[0]}`,
            detail: `d implied by t/√(df+1) is ${impl.lo.toFixed(4)}–${impl.hi.toFixed(4)}, published ${db.v}`
          });
        }
      }
    }
  }
} catch (e) {
  apaError = e.message;
}

/* ---------- report ---------- */
const line = '─'.repeat(64);
const isAcked = (f) => ACKED.some(a => f.where === a.where && f.desc === a.match);
const bad = findings.filter(f => !f.ok && !isAcked(f));
const acked = findings.filter(f => !f.ok && isAcked(f));

console.log(line);
console.log(`StatsCapybara worked-example check — ${pairs} statistic/effect-size pairs`);
console.log(line);

if (apaError) {
  console.log(`\n! could not render apa.html's defaults: ${apaError}`);
  console.log(`  (the shim needs updating, or the formatter is broken — either is worth knowing)`);
} else {
  console.log(`\napa.html default sentences rendered and checked: ${apaRendered}/${COMBOS.length}`);
}

if (VERBOSE) {
  console.log('\nevery pair:');
  for (const f of findings) console.log(`  ${f.ok ? '·' : '✗'} ${f.where}\n      ${f.desc}\n      ${f.detail}`);
}

if (bad.length) {
  console.log(`\nMISMATCHES (${bad.length}):`);
  for (const f of bad) console.log(`\n  ${f.where}\n    ${f.desc}\n    ${f.detail}`);
}
if (acked.length) {
  console.log(`\nacknowledged (${acked.length}):`);
  for (const f of acked) {
    const a = ACKED.find(x => x.where === f.where && x.match === f.desc);
    console.log(`  · ${f.where} — ${f.desc}\n      ${a.why}`);
  }
}

console.log(`\n${line}`);
if (apaError) console.log(`FAIL — apa.html's defaults could not be rendered.`);
else if (bad.length) console.log(`FAIL — ${bad.length} worked example${bad.length > 1 ? 's do' : ' does'} not hold together.`);
else console.log(`PASS — every published effect size agrees with its own statistic.`);
console.log(line);

process.exit(STRICT && (bad.length || apaError) ? 1 : 0);
