#!/usr/bin/env node
/* ============================================================
   symbol-names.js — does the site ever SAY the name of a symbol it TEACHES?

   Zero-dependency Node script (built-ins only). Run from the repo root:

       node tools/symbol-names.js             # report
       node tools/symbol-names.js --verbose   # every symbol, with its pages
       node tools/symbol-names.js --symbol ρ  # one symbol, every page and context
       node tools/symbol-names.js --strict    # exit 1 on any flag not in ACKED

   Editorial health, not build health, so like prose-lint.js, faq-audit.js,
   widget-terms.js, link-promises.js, advice-terms.js, untaught-names.js,
   worked-examples.js, search-reach.js and prescription-terms.js it is
   deliberately NOT wired into audit.js and NOT a commit gate.

   WHY IT EXISTS (P39 run 24). Run 23 left a standing note: a bare Greek
   letter is unreachable by the site's own search, because site.js's
   squash() strips every non-alphanumeric character out of a query, so "ε"
   reduces to the empty string however the corpus is written. Run 23 wrote
   around it once, by spelling "epsilon" in the new section. This asks the
   question of the whole corpus, and the answer was worse than expected:
   THIRTEEN Greek letters were used in the site's prose and NOT ONE page
   using them ever wrote the name. Spearman's ρ is taught on ten pages and
   the word "rho" appeared on none of them; the population mean μ is
   introduced in §1.1 and carried through nine pages without ever being
   called mu. Searching the built index for "Spearman rho" returned zero.

   The cost is two-sided and both sides are real. A reader who cannot say
   the symbol cannot look it up, ask about it, or read the formula aloud;
   and the site's own search, which indexes prose, has nothing to match.

   THE RULE: for every Greek letter that appears in rendered prose, at
   least one page that USES the symbol must also SPELL its name. The
   pairing is what teaches: a name on some other page does not help a
   reader looking at this formula.

   WHAT WAS MEASURED AND DISCARDED, which is the part worth keeping.

   (a) A PER-PAGE gate (every page using a symbol must name it) flags 54 of
       126 pages. Clearing that means either an inventory of 54 exceptions,
       which is the mistake VOICE.md rule 12 documents, or writing "(alpha)"
       beside all 30 uses of α, which is worse prose. The gate is per
       SYMBOL, and the per-page misses are reported without being gated.
   (b) A PROXIMITY variant (the name within 200 characters of some use of
       the symbol on the same page) was built and measured: on this corpus
       it returns the IDENTICAL flag set to the page-level rule, 13 for 13.
       It buys nothing today and adds a constant to tune, so it is gone.
   (c) Matching the NAME anywhere sitewide, rather than on a page that uses
       the symbol, drops the flag set from 13 to 7: γ, λ and σ have their
       names written somewhere on the site, always on a page that does not
       use the letter (σ in a lesson about a different quantity, gamma in
       the distribution playground). That is exactly the reader who is left
       stranded, so the weaker gate is the wrong one.

   KNOWN BLIND SPOTS, stated rather than smoothed over. Only GREEK letters
   are checked: the same argument applies to x̄, ŷ, σ̂ and ∑, and a table of
   spoken names for those ("x-bar", "y-hat") is a judgment call this script
   does not make. A name written on the page in a DIFFERENT sense passes
   (a page about the "beta" of a regression coefficient clears β even if it
   never connects the two). And the check reads HTML pages only, so a
   symbol living solely in software.js or checks.js is invisible here;
   advice-terms.js owns those surfaces.

   If it fires: name the letter once, in prose, on a page that teaches it
   ("its mean μ (mu)"). Only add to ACKED when the site genuinely owes no
   name.
   ============================================================ */

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const STRICT = argv.includes('--strict');
const VERBOSE = argv.includes('--verbose');
const ONE = (() => { const i = argv.indexOf('--symbol'); return i >= 0 ? argv[i + 1] : null; })();

/* Acknowledged-benign flags. Keep this SHORT: a growing table means the
   rule is wrong, not that the corpus is unusual. */
const ACKED = {
  'π': 'the circle constant, not a quantity the site teaches — it appears inside √(π/2) and √3⁄π, where naming it would explain nothing to anyone who can read the formula',
};

/* Greek letters and the word a reader would type or say. Upper and lower
   case are separate keys because they are separate characters in the
   corpus, and either one alone leaves the reader stranded. */
const NAMES = {
  'α': 'alpha', 'β': 'beta', 'γ': 'gamma', 'Γ': 'gamma', 'δ': 'delta', 'Δ': 'delta',
  'ε': 'epsilon', 'ζ': 'zeta', 'η': 'eta', 'θ': 'theta', 'Θ': 'theta', 'ι': 'iota',
  'κ': 'kappa', 'λ': 'lambda', 'Λ': 'lambda', 'μ': 'mu', 'ν': 'nu', 'ξ': 'xi',
  'π': 'pi', 'Π': 'pi', 'ρ': 'rho', 'σ': 'sigma', 'Σ': 'sigma', 'τ': 'tau',
  'υ': 'upsilon', 'φ': 'phi', 'Φ': 'phi', 'χ': 'chi', 'ψ': 'psi', 'ω': 'omega', 'Ω': 'omega',
};

/* ---------- corpus: every HTML page the site serves as prose ---------- */
function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (p !== path.join(ROOT, 'tools')) walk(p, out); }
    else if (e.name.endsWith('.html')) out.push(path.relative(ROOT, p));
  }
  return out;
}

/* HTML -> rendered prose. Comments first: an <!-- node -e ... --> block
   carries verification arithmetic no reader ever sees, and problems.html
   is full of them. <head> goes too, since a meta description is not the
   page teaching anything. */
function textify(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<head[\s\S]*?<\/head>/i, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ');
}

const SKIP = new Set(['404.html', 'offline.html']);   // self-contained, no prose of their own
const pages = walk(ROOT, [])
  .filter(f => !SKIP.has(path.basename(f)))
  .map(f => ({ file: f, text: textify(fs.readFileSync(path.join(ROOT, f), 'utf8')) }));

/* ---------- tally ---------- */
const rows = [];
for (const [ch, name] of Object.entries(NAMES)) {
  const nameRe = new RegExp('\\b' + name + '\\b', 'i');
  const users = pages.filter(p => p.text.includes(ch));
  if (!users.length) continue;
  const naming = users.filter(p => nameRe.test(p.text));
  rows.push({
    ch, name,
    uses: users.map(p => ({ file: p.file, n: p.text.split(ch).length - 1, names: nameRe.test(p.text) })),
    naming: naming.length,
  });
}
rows.sort((a, b) => (a.naming - b.naming) || (b.uses.length - a.uses.length));

/* ---------- one symbol ---------- */
if (ONE) {
  const row = rows.find(r => r.ch === ONE);
  if (!row) { console.log(`"${ONE}" does not appear in the site's prose.`); process.exit(0); }
  console.log(`${row.ch}  (${row.name}) — used on ${row.uses.length} page(s); ${row.naming} of them write the name\n`);
  for (const u of row.uses) {
    const text = pages.find(p => p.file === u.file).text;
    const i = text.indexOf(row.ch);
    console.log(`  ${u.names ? '✓' : '·'} ${u.file}  (×${u.n})`);
    console.log(`      …${text.slice(Math.max(0, i - 60), i + 60).trim()}…`);
  }
  process.exit(0);
}

/* ---------- report ---------- */
console.log('symbol-names — a Greek letter the site teaches should be named somewhere it is used\n');
const flagged = rows.filter(r => r.naming === 0);
const clean = rows.filter(r => r.naming > 0);

if (VERBOSE) {
  console.log('  every symbol in the corpus (pages using it / pages that also name it):');
  for (const r of rows) console.log(`    ${r.ch}  ${r.name.padEnd(8)} ${String(r.uses.length).padStart(3)} pages, ${r.naming} name it`);
  console.log('');
}

let real = 0;
for (const r of flagged) {
  const acked = ACKED[r.ch];
  if (acked) { console.log(`  ~ ${r.ch} (${r.name}) — ACKED: ${acked}`); continue; }
  real++;
  const top = r.uses.slice().sort((a, b) => b.n - a.n).slice(0, 3)
    .map(u => `${u.file} ×${u.n}`).join(', ');
  console.log(`  ✗ ${r.ch} (${r.name}) — used on ${r.uses.length} page(s), named on none`);
  console.log(`      heaviest: ${top}`);
}
if (!real) console.log('  no unnamed symbols.');

/* Per-page misses are INFORMATION, never a gate — see note (a) in the header. */
const misses = [];
for (const r of rows) for (const u of r.uses) if (!u.names) misses.push({ file: u.file, ch: r.ch });
const byFile = new Map();
for (const m of misses) byFile.set(m.file, (byFile.get(m.file) || []).concat(m.ch));
console.log(`\n  info: ${byFile.size} of ${pages.length} pages use a symbol they do not name (not gated).`);
if (VERBOSE) {
  [...byFile.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 15)
    .forEach(([f, cs]) => console.log(`    ${f}: ${cs.join(' ')}`));
}

console.log(`\n  ${rows.length} symbols in the corpus · ${clean.length} named · ${flagged.length} unnamed (${real} not acknowledged)`);
if (STRICT && real) { console.error(`\nFAIL — ${real} symbol(s) the site never names.`); process.exit(1); }
