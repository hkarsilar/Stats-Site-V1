#!/usr/bin/env node
/* ============================================================
   audit.js — StatsCapybara's permanent health check.

   Zero-dependency Node script (Node ≥ 14, built-ins only: fs, path, vm).
   Run from the repo root BEFORE every commit:

       node tools/audit.js

   It cross-checks the single-source-of-truth data files (curriculum.js,
   checks.js, snippets.js, software.js, tools/faq_data.py, site.js's QUIPS,
   sitemap.xml, search-index.js) against every lesson and tool page on disk
   and reports anything that has drifted out of sync.

   Exit code 0 only when there are no ERRORS. WARNINGS and INFO never fail
   the build (mtimes, description lengths, optional coverage).

   What it verifies (mirrors ROADMAP.md prompt P1):
     1. Coverage — every ready lesson slug has CHECKS (3×4), FAQs (3),
        a QUIPS line, a SNIPPETS entry (warn), a SOFTWARE entry (info), and
        a sitemap URL; no stale/orphan keys anywhere.
     2. Per-lesson HTML — one GA tag, canonical + og:url = true URL,
        og:type article, LearningResource+BreadcrumbList+FAQPage JSON-LD all
        parse, data-course/data-section correct, "Section N.n" eyebrow matches
        curriculum, meta description present (50–160 chars).
     3. Root/tool pages — GA, canonical, meta description, OG present;
        404.html carries the GA tag only.
     4. All internal href/src links resolve on disk; no leading-slash paths.
     5. Search index — freshness (mtime) + every ready slug indexed.
     6. Homepage counts — the course/lesson totals in index.html match reality.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');            // …/site
const GA_ID = 'G-80HCM6EZVN';
const BASE_URL = 'https://statscapybara.com/';

/* ---------- finding collectors ---------- */
const errors = [], warnings = [], infos = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const info = (m) => infos.push(m);
const read = (p) => fs.readFileSync(p, 'utf8');
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

/* ============================================================
   Small parsing helpers
   ============================================================ */

/* Run a set of `window.X = …` browser scripts in a sandbox and return the
   populated window. Exact — no fragile regex for the big data objects. */
function loadWindow(files) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (const f of files) {
    try { vm.runInContext(read(f), sandbox, { filename: f }); }
    catch (e) { err(`could not evaluate ${rel(f)}: ${e.message}`); }
  }
  return sandbox.window;
}

/* Slice a balanced {…} or […] starting at src[start] (which must be the
   opening bracket), honouring '…' "…" `…` strings and \ escapes. */
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
    if (ch === '"' || ch === "'" || ch === '`') { str = ch; continue; }
    if (ch === open) depth++;
    else if (ch === close && --depth === 0) return src.slice(start, i + 1);
  }
  return null;
}

/* Pull a literal object/array out of site.js by its `var NAME =` declaration
   (QUIPS/SEARCH_PAGES/TOOLBOX live inside an IIFE, so we can't eval the file). */
function extractLiteral(src, marker) {
  const at = src.indexOf(marker);
  if (at < 0) return null;
  let i = at + marker.length;
  while (i < src.length && src[i] !== '{' && src[i] !== '[') i++;
  const text = sliceBalanced(src, i);
  if (!text) return null;
  try { return vm.runInNewContext('(' + text + ')'); }
  catch (e) { err(`could not parse ${marker.trim()} from site.js: ${e.message}`); return null; }
}

/* All attributes of a single tag string → { name: value } (lowercased keys). */
function attrs(tag) {
  const out = {}, re = /([a-zA-Z:_-]+)\s*=\s*"([^"]*)"/g;
  let m; while ((m = re.exec(tag))) out[m[1].toLowerCase()] = m[2];
  return out;
}
const metaTags = (src) => (src.match(/<meta\b[^>]*>/gi) || []).map(attrs);
const metaName = (ms, n) => (ms.find((x) => (x.name || '') === n) || {}).content ?? null;
const metaProp = (ms, p) => (ms.find((x) => (x.property || '') === p) || {}).content ?? null;

function canonicalOf(src) {
  for (const l of src.match(/<link\b[^>]*>/gi) || []) {
    const a = attrs(l);
    if ((a.rel || '') === 'canonical') return a.href || null;
  }
  return null;
}

function jsonLd(src) {
  const out = [], re = /<script\b([^>]*)type="application\/ld\+json"([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(src))) {
    const isFaq = /data-faq/.test(m[1] + m[2]);
    let parsed = null, ok = true;
    try { parsed = JSON.parse(m[3].trim()); } catch (e) { ok = false; }
    out.push({ isFaq, parsed, ok });
  }
  return out;
}

/* Every href/src in the page markup, with inline <script> bodies stripped
   first (script-built links are dynamic/BASE-prefixed, not static resources).
   <script src="…"> tags are kept — their src is a real resource link. */
function staticLinks(src) {
  const cleaned = src.replace(/<script\b(?![^>]*\ssrc=)[^>]*>[\s\S]*?<\/script>/gi, ' ');
  const out = [], re = /\b(?:href|src)\s*=\s*"([^"]*)"/gi;
  let m; while ((m = re.exec(cleaned))) out.push(m[1]);
  return out;
}

function checkLinks(file) {
  const dir = path.dirname(file);
  for (const href of staticLinks(read(file))) {
    if (!href) continue;
    if (/^(https?:)?\/\//i.test(href)) continue;              // external / protocol-relative
    if (/^(mailto:|tel:|data:|javascript:|#)/i.test(href)) continue;
    if (href[0] === '/') { err(`${rel(file)} → leading-slash absolute path: ${href}`); continue; }
    let clean = href.split('#')[0].split('?')[0];
    if (!clean) continue;
    let target = path.resolve(dir, clean);
    if (clean.endsWith('/')) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) err(`${rel(file)} → broken link: ${href}`);
  }
}

/* Count exactly-one-GA-tag: the id appears once in the loader src and once in
   the gtag('config', …) call, i.e. two references total. */
function gaCount(src) { return (src.match(new RegExp(GA_ID, 'g')) || []).length; }

/* Parse tools/faq_data.py → { slug: numberOfQ&Apairs }. The file is very
   regular: top-level `"slug": [ ("Q","A"), … ]` entries at column 0. */
function parseFaqCounts(src) {
  const counts = {};
  const re = /^"([\w-]+)":\s*\[/gm;
  let m;
  while ((m = re.exec(src))) {
    const bracket = src.indexOf('[', m.index);
    const list = sliceBalanced(src, bracket);
    if (!list) { counts[m[1]] = -1; continue; }
    // count '(' that open a Q&A tuple — i.e. parens outside of strings
    let n = 0, str = null, esc = false;
    for (let i = 1; i < list.length; i++) {
      const ch = list[i];
      if (str) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === str) str = null; continue; }
      if (ch === '"' || ch === "'") { str = ch; continue; }
      if (ch === '(') n++;
    }
    counts[m[1]] = n;
  }
  return counts;
}

/* ============================================================
   Load the single sources of truth
   ============================================================ */
const JS = (n) => path.join(ROOT, 'assets/js', n);
const win = loadWindow([JS('curriculum.js'), JS('checks.js'), JS('snippets.js'), JS('software.js'), JS('search-index.js')]);
const CURRICULUM = win.CURRICULUM || [];
const FLAT = win.CURRICULUM_FLAT || [];
const CHECKS = win.CHECKS || {};
const SNIPPETS = win.SNIPPETS || {};
const SOFTWARE = win.SOFTWARE || {};
const SEARCH_INDEX = win.SEARCH_INDEX || { lessons: {}, pages: [] };

const siteSrc = read(JS('site.js'));
const QUIPS = extractLiteral(siteSrc, 'var QUIPS = ') || {};

const READY = FLAT.filter((s) => s.ready);
const readySlugs = new Set(READY.map((s) => s.slug));
const allSlugs = new Set(FLAT.map((s) => s.slug));
const slugCourse = {}, slugN = {};
FLAT.forEach((s) => { slugCourse[s.slug] = s.course; slugN[s.slug] = s.n; });
const courseSlugs = new Set(CURRICULUM.map((c) => c.slug));   // any track, not just stats-N

/* root / tool pages (excluding the self-contained 404.html) */
const ROOT_PAGES = ['index.html', 'quiz.html', 'glossary.html', 'toolbox.html', 'which-test.html',
  'tables.html', 'formulas.html', 'distributions.html', 'effect-sizes.html', 'descriptives.html', 'power.html'];
/* allowed non-lesson QUIPS keys: index→"home" plus each root page's basename */
const rootKeys = new Set(['home', ...ROOT_PAGES.filter((f) => f !== 'index.html').map((f) => f.replace('.html', ''))]);

/* sitemap URLs */
const sitemapSrc = read(path.join(ROOT, 'sitemap.xml'));
const sitemapLocs = new Set((sitemapSrc.match(/<loc>([^<]+)<\/loc>/g) || []).map((l) => l.replace(/<\/?loc>/g, '')));

/* faq counts */
const faqCounts = parseFaqCounts(read(path.join(ROOT, 'tools/faq_data.py')));

/* ============================================================
   CHECK 1 — coverage + no orphans
   ============================================================ */
for (const s of READY) {
  const slug = s.slug;
  // CHECKS: exactly 3 well-formed questions × 4 options
  const c = CHECKS[slug];
  if (!c) err(`CHECKS missing entry for "${slug}"`);
  else if (!Array.isArray(c) || c.length !== 3) err(`CHECKS["${slug}"] must have exactly 3 questions (has ${Array.isArray(c) ? c.length : 'non-array'})`);
  else c.forEach((q, i) => {
    if (!q || typeof q.q !== 'string' || !q.q.trim()) err(`CHECKS["${slug}"][${i}] missing question text`);
    if (!Array.isArray(q.o) || q.o.length !== 4) err(`CHECKS["${slug}"][${i}] must have exactly 4 options`);
    if (!Number.isInteger(q.a) || q.a < 0 || q.a > 3) err(`CHECKS["${slug}"][${i}] answer index must be 0–3 (got ${q.a})`);
    if (typeof q.why !== 'string' || !q.why.trim()) err(`CHECKS["${slug}"][${i}] missing "why" explanation`);
  });

  // FAQs: exactly 3 Q&As
  const fc = faqCounts[slug];
  if (fc === undefined) err(`faq_data.py missing entry for "${slug}"`);
  else if (fc !== 3) err(`faq_data.py["${slug}"] must have exactly 3 Q&As (has ${fc})`);

  // QUIPS
  if (!QUIPS[slug] || !String(QUIPS[slug]).trim()) err(`QUIPS missing a quip for "${slug}"`);

  // SNIPPETS (warn only)
  if (!SNIPPETS[slug]) warn(`SNIPPETS has no entry for "${slug}"`);

  // SOFTWARE (info only — only analysis lessons have one)
  if (!SOFTWARE[slug]) info(`SOFTWARE has no entry for "${slug}" (fine if conceptual)`);

  // sitemap
  if (!sitemapLocs.has(`${BASE_URL}${s.course}/${slug}/`)) err(`sitemap.xml missing ${s.course}/${slug}/`);
}

/* orphan / stale keys */
const orphan = (obj, label, sev) => Object.keys(obj).forEach((k) => {
  if (!allSlugs.has(k)) sev(`${label} has stale key "${k}" (no such lesson)`);
});
orphan(CHECKS, 'CHECKS', err);
orphan(SNIPPETS, 'SNIPPETS', err);
orphan(SOFTWARE, 'SOFTWARE', err);
Object.keys(faqCounts).forEach((k) => { if (!allSlugs.has(k)) err(`faq_data.py has stale key "${k}" (no such lesson)`); });
Object.keys(QUIPS).forEach((k) => { if (!allSlugs.has(k) && !rootKeys.has(k)) err(`QUIPS has stale key "${k}" (not a lesson or root page)`); });
// every root page deserves a quip
rootKeys.forEach((k) => { if (!QUIPS[k]) warn(`QUIPS has no quip for root page "${k}"`); });

/* ============================================================
   CHECK 2 — per-lesson HTML
   ============================================================ */
for (const s of READY) {
  const file = path.join(ROOT, s.course, s.slug, 'index.html');
  if (!fs.existsSync(file)) { err(`missing lesson page: ${s.course}/${s.slug}/index.html`); continue; }
  const src = read(file);
  const trueUrl = `${BASE_URL}${s.course}/${s.slug}/`;
  const ms = metaTags(src);

  // one GA tag
  const ga = gaCount(src);
  if (ga !== 2) err(`${rel(file)} → expected exactly one GA tag (2 ${GA_ID} refs), found ${ga}`);

  // canonical + og:url = true URL
  const canon = canonicalOf(src);
  if (canon !== trueUrl) err(`${rel(file)} → canonical is ${canon || 'MISSING'}, expected ${trueUrl}`);
  const ogUrl = metaProp(ms, 'og:url');
  if (ogUrl !== trueUrl) err(`${rel(file)} → og:url is ${ogUrl || 'MISSING'}, expected ${trueUrl}`);

  // og:type article
  const ogType = metaProp(ms, 'og:type');
  if (ogType !== 'article') err(`${rel(file)} → og:type is "${ogType || 'MISSING'}", expected "article"`);

  // JSON-LD blocks
  const lds = jsonLd(src);
  if (lds.some((b) => !b.ok)) err(`${rel(file)} → a JSON-LD block does not parse`);
  const typesOf = (b) => Array.isArray(b.parsed) ? b.parsed.map((x) => x['@type']) : b.parsed ? [b.parsed['@type']] : [];
  const allTypes = lds.filter((b) => b.ok && !b.isFaq).flatMap(typesOf);
  if (!allTypes.includes('LearningResource')) err(`${rel(file)} → missing LearningResource JSON-LD`);
  if (!allTypes.includes('BreadcrumbList')) err(`${rel(file)} → missing BreadcrumbList JSON-LD`);
  const faqLd = lds.find((b) => b.isFaq);
  if (!faqLd) err(`${rel(file)} → missing FAQPage JSON-LD (data-faq)`);
  else if (!faqLd.ok || (faqLd.parsed && faqLd.parsed['@type'] !== 'FAQPage')) err(`${rel(file)} → data-faq block is not a valid FAQPage`);

  // data-course / data-section
  const body = (src.match(/<body\b[^>]*>/i) || [''])[0];
  const ba = attrs(body);
  if (ba['data-course'] !== s.course) err(`${rel(file)} → data-course is "${ba['data-course'] || 'MISSING'}", expected "${s.course}"`);
  if (ba['data-section'] !== s.slug) err(`${rel(file)} → data-section is "${ba['data-section'] || 'MISSING'}", expected "${s.slug}"`);

  // Section N.n eyebrow
  const eb = src.match(/<span class="lesson-eyebrow">\s*Section\s+([\d.]+)\s*<\/span>/);
  if (!eb) err(`${rel(file)} → no "Section N.n" eyebrow found`);
  else if (eb[1] !== slugN[s.slug]) err(`${rel(file)} → eyebrow "Section ${eb[1]}" ≠ curriculum "${slugN[s.slug]}"`);

  // meta description present (error) + length 50–160 (warn)
  const desc = metaName(ms, 'description');
  if (!desc) err(`${rel(file)} → missing meta description`);
  else if (desc.length < 50 || desc.length > 160) warn(`${rel(file)} → meta description is ${desc.length} chars (want 50–160)`);
}

/* ============================================================
   CHECK 3 — root / tool pages + 404
   ============================================================ */
for (const f of ROOT_PAGES) {
  const file = path.join(ROOT, f);
  if (!fs.existsSync(file)) { err(`missing root page: ${f}`); continue; }
  const src = read(file), ms = metaTags(src);
  if (gaCount(src) !== 2) err(`${f} → expected exactly one GA tag (2 ${GA_ID} refs), found ${gaCount(src)}`);
  if (!canonicalOf(src)) err(`${f} → missing canonical`);
  if (!metaName(ms, 'description')) err(`${f} → missing meta description`);
  for (const p of ['og:title', 'og:type', 'og:url']) if (!metaProp(ms, p)) err(`${f} → missing ${p}`);
  for (const p of ['og:image', 'og:description']) if (!metaProp(ms, p)) warn(`${f} → missing ${p}`);
}
// 404.html: self-contained, GA only
const p404 = path.join(ROOT, '404.html');
if (!fs.existsSync(p404)) err('missing 404.html');
else if (gaCount(read(p404)) !== 2) err(`404.html → expected exactly one GA tag (2 ${GA_ID} refs), found ${gaCount(read(p404))}`);

/* ============================================================
   CHECK 4 — internal links resolve (lessons + root pages; not 404)
   ============================================================ */
for (const s of READY) {
  const file = path.join(ROOT, s.course, s.slug, 'index.html');
  if (fs.existsSync(file)) checkLinks(file);
}
for (const f of ROOT_PAGES) {
  const file = path.join(ROOT, f);
  if (fs.existsSync(file)) checkLinks(file);
}

/* ============================================================
   CHECK 5 — search index freshness + coverage
   ============================================================ */
const siPath = JS('search-index.js');
const siMtime = fs.statSync(siPath).mtimeMs;
for (const s of READY) {
  const lf = path.join(ROOT, s.course, s.slug, 'index.html');
  if (fs.existsSync(lf) && fs.statSync(lf).mtimeMs > siMtime + 1000)
    warn(`search-index.js is older than lesson ${s.course}/${s.slug} — rerun tools/build-search-index.py`);
  if (!SEARCH_INDEX.lessons || !(s.slug in SEARCH_INDEX.lessons))
    err(`search-index.js has no entry for "${s.slug}"`);
}
// stale sitemap lesson entries (any course track, not just stats-N)
sitemapLocs.forEach((loc) => {
  const m = loc.match(/^https:\/\/statscapybara\.com\/([\w-]+)\/([\w-]+)\/$/);
  if (m && courseSlugs.has(m[1]) && !readySlugs.has(m[2])) warn(`sitemap.xml lists ${m[1]}/${m[2]}/ which is not a ready lesson`);
});

/* ============================================================
   CHECK 6 — homepage counts match curriculum reality
   ============================================================ */
const idx = read(path.join(ROOT, 'index.html'));
const courseCount = CURRICULUM.length;
const lessonCount = READY.length;
const cm = idx.match(/(\d+)\s+courses/i);
if (cm && +cm[1] !== courseCount) err(`index.html says "${cm[1]} courses" but curriculum has ${courseCount}`);
for (const lm of idx.matchAll(/(\d+)\s+(?:interactive |hands-on )?lessons/gi))
  if (+lm[1] !== lessonCount) err(`index.html says "${lm[1]} … lessons" but curriculum has ${lessonCount} ready lessons`);

/* ============================================================
   Report
   ============================================================ */
const line = '─'.repeat(60);
console.log(line);
console.log(`StatsCapybara audit — ${READY.length} lessons, ${CURRICULUM.length} courses`);
console.log(line);
const dump = (label, arr) => { if (arr.length) { console.log(`\n${label} (${arr.length}):`); arr.forEach((m) => console.log(`  • ${m}`)); } };
dump('ERRORS', errors);
dump('WARNINGS', warnings);
dump('INFO', infos);
console.log(`\n${line}`);
if (errors.length === 0) console.log(`PASS — 0 errors, ${warnings.length} warnings, ${infos.length} info.`);
else console.log(`FAIL — ${errors.length} errors, ${warnings.length} warnings, ${infos.length} info.`);
console.log(line);
process.exit(errors.length ? 1 : 0);
