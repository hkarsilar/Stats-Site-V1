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
        og:type article, og:image/twitter:image = the course's OG image (and
        it exists on disk), LearningResource+BreadcrumbList+FAQPage JSON-LD all
        parse, data-course/data-section correct, "Section N.n" eyebrow matches
        curriculum, meta description present (50–160 chars).
     3. Root/tool pages — GA, canonical, meta description, OG present;
        404.html carries the GA tag only. Guide pages (guides/<slug>/,
        P34) get the same checks plus og:type article, exact canonical/
        og:url, Article + BreadcrumbList JSON-LD, the body[data-guide]
        marker, and sitemap + search-index entries. Course landing pages
        (<course>/, P61; CHECK 3c) get GA, exact canonical/og:url,
        og:type website, og:image = that course's card (exists on disk),
        Course + BreadcrumbList JSON-LD, the body[data-course-home]
        marker, links, and sitemap + search-index entries — no QUIPS.
     4. All internal href/src links resolve on disk; no leading-slash paths.
     5. Search index — freshness (mtime) + every ready slug indexed.
     6. Homepage counts — the course/lesson totals in index.html match reality.
     7. Structured data (P36) — every JSON-LD object passes a per-type
        required-fields check (name/url; itemListElement for BreadcrumbList;
        mainEntity for FAQPage; …); every tool page carries a BreadcrumbList
        (Home → Statistics Toolbox → Tool) and quiz.html a Quiz block; the
        homepage carries Organization + WebSite (with SearchAction) + an
        ItemList of one Course per curriculum course whose names, lesson
        counts, track titles, first-lesson URLs, and educationalLevels all
        match curriculum.js; each lesson's LearningResource names its own
        course in isPartOf and carries the course's expected educationalLevel
        (stats-1 Beginner, stats-2 Intermediate, stats-3/4 and ml Advanced,
        toolkit courses Intermediate — see CORE_LEVELS).
     8. Meta hygiene (P36) — no two audited pages share a meta description,
        and every <title> follows "Thing — StatsCapybara" (the homepage is
        brand-first: "StatsCapybara — …").
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
   opening bracket), honoring '…' "…" `…` strings and \ escapes. */
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

/* Absolute site URL (https://statscapybara.com/…) → does it resolve to a
   file on disk? Used to verify og:image targets actually exist. */
function siteAssetExists(url) {
  if (!url || !url.startsWith(BASE_URL)) return false;
  const relPath = url.slice(BASE_URL.length).split(/[?#]/)[0];
  return fs.existsSync(path.join(ROOT, relPath));
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

/* Flatten parsed JSON-LD blocks → the top-level typed objects they contain
   (a block may be a single object, an array of objects, or a @graph). */
function ldObjects(lds) {
  const out = [];
  for (const b of lds) {
    if (!b.ok || !b.parsed) continue;
    const nodes = Array.isArray(b.parsed) ? b.parsed
      : Array.isArray(b.parsed['@graph']) ? b.parsed['@graph'] : [b.parsed];
    for (const n of nodes) if (n && typeof n === 'object') out.push(n);
  }
  return out;
}

/* CHECK 7 helper — minimal required fields per JSON-LD @type. Unknown types
   only need a name (or headline); list-bearing types get their list items
   sanity-checked too. */
const LD_REQUIRED = {
  LearningResource: ['name', 'description', 'url'],
  Article: ['headline', 'description', 'url'],
  Course: ['name', 'description', 'url'],
  Quiz: ['name', 'url'],
  WebSite: ['name', 'url'],
  Organization: ['name', 'url'],
  ItemList: ['itemListElement'],
  BreadcrumbList: ['itemListElement'],
  FAQPage: ['mainEntity']
};
function checkLdFields(label, objs) {
  for (const o of objs) {
    const t = o['@type'];
    if (!t) { err(`${label} → JSON-LD object without @type`); continue; }
    for (const f of LD_REQUIRED[t] || []) {
      const v = o[f];
      if (v === undefined || v === null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length))
        err(`${label} → ${t} JSON-LD missing required field "${f}"`);
    }
    if (t === 'BreadcrumbList' && Array.isArray(o.itemListElement))
      o.itemListElement.forEach((it, i) => {
        if (!it || it['@type'] !== 'ListItem' || !Number.isInteger(it.position) || !it.name || !it.item)
          err(`${label} → BreadcrumbList item ${i + 1} needs @type ListItem + position + name + item`);
      });
    if (t === 'FAQPage' && Array.isArray(o.mainEntity))
      o.mainEntity.forEach((q, i) => {
        if (!q || !q.name || !q.acceptedAnswer || !q.acceptedAnswer.text)
          err(`${label} → FAQPage question ${i + 1} needs name + acceptedAnswer.text`);
      });
  }
}

/* Expected LearningResource/Course educationalLevel per course (CHECK 7):
   the core track ramps Beginner → Advanced (ML & AI closes it, so it is
   Advanced too); toolkit courses sit at Intermediate (research-student
   audience). Every core course MUST be listed here — a core course absent
   from this map makes expectedLevel() return null, which silently disables
   the check for it rather than failing. */
const CORE_LEVELS = { 'stats-1': 'Beginner', 'stats-2': 'Intermediate', 'stats-3': 'Advanced', 'stats-4': 'Advanced', ml: 'Advanced' };
function expectedLevel(course) {
  if (CORE_LEVELS[course]) return CORE_LEVELS[course];
  const c = CURRICULUM.find((x) => x.slug === course);
  return c && (c.track || 'core') === 'toolkit' ? 'Intermediate' : null;
}

/* CHECK 8 accumulators — meta-description dedupe + title pattern, fed by
   the per-page loops below. */
const descSeen = new Map();   // description text → [pages]
function metaHygiene(label, src, ms) {
  const d = metaName(ms, 'description');
  if (d) {
    if (!descSeen.has(d)) descSeen.set(d, []);
    descSeen.get(d).push(label);
  }
  const t = (src.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
  if (!t) { err(`${label} → missing <title>`); return; }
  const title = t.trim();
  if (label === 'index.html') {
    if (!/^StatsCapybara\s+—\s/.test(title)) err(`${label} → homepage <title> should start with "StatsCapybara — " (got "${title}")`);
  } else if (!/—\sStatsCapybara$/.test(title)) {
    err(`${label} → <title> should end with "— StatsCapybara" (got "${title}")`);
  }
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

/* Ids declared statically in a file, cached. Only static ids count: a
   JS-injected anchor (see JS_IDS) can't be seen here. */
const idCache = new Map();
function staticIds(file) {
  if (!idCache.has(file)) {
    const src = read(file) || '';
    idCache.set(file, new Set([...src.matchAll(/\sid\s*=\s*"([^"]+)"/g)].map(m => m[1])));
  }
  return idCache.get(file);
}

/* Anchors that exist only after site.js runs, so a static scan can't see them.
   Keep this list short — each entry is a promise that some script injects it. */
const JS_IDS = new Set([
  'run-it',        // site.js injects the SPSS/JASP box (plan.html deep-links it)
  'main-content',  // site.js injectA11y()
]);

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
    if (!fs.existsSync(target)) { err(`${rel(file)} → broken link: ${href}`); continue; }
    /* …and if it carries a #fragment, that anchor must exist in the target.
       Nothing else checks this, so a typo'd `problems.html#p2-99` would just
       silently drop the reader at the top of the page. */
    const frag = href.includes('#') ? href.split('#').slice(1).join('#') : '';
    if (frag && !JS_IDS.has(frag) && target.endsWith('.html') && !staticIds(target).has(frag)) {
      err(`${rel(file)} → link to a missing anchor: ${href}`);
    }
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
const courseBySlug = {};
CURRICULUM.forEach((c) => { courseBySlug[c.slug] = c; });

/* root / tool pages (excluding the self-contained 404.html) */
const ROOT_PAGES = ['index.html', 'quiz.html', 'glossary.html', 'toolbox.html', 'teachers.html', 'which-test.html', 'which-chart.html',
  'plan.html', 'tables.html', 'formulas.html', 'distributions.html', 'effect-sizes.html', 'descriptives.html', 'correlation.html', 'power.html', 'apa.html', 'problems.html', 'datasets.html', 'flashcards.html', 'progress.html',
  'cheat-test-chooser.html', 'cheat-apa.html', 'cheat-assumptions.html', 'privacy.html'];
/* root pages whose BreadcrumbList is NOT Home → Statistics Toolbox → Tool.
   privacy.html (P69) is a site page, not a tool, so its trail is two levels. */
const NON_TOOL_ROOT = new Set(['privacy.html']);
/* long-form guides — guides/<slug>/index.html (P34); each is a body[data-guide] page */
const GUIDES = ['analyze-thesis-data-jasp', 'spss-output-to-apa', 'choose-statistics-dissertation', 'clean-survey-data', 'complete-worked-project'];
/* course landing pages — <course>/index.html (P61); each is a body[data-course-home] page.
   Derived from the curriculum, so adding a course automatically expects its landing page. */
const COURSE_PAGES = CURRICULUM.map((c) => c.slug);
/* allowed non-lesson QUIPS keys: index→"home" plus each root page's basename, plus guide slugs */
const rootKeys = new Set(['home', ...ROOT_PAGES.filter((f) => f !== 'index.html').map((f) => f.replace('.html', '')), ...GUIDES]);

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

  // og:image / twitter:image = this course's OG image, and it exists on disk
  const courseImg = `${BASE_URL}assets/og-${s.course}.png`;
  const ogImg = metaProp(ms, 'og:image');
  const twImg = metaName(ms, 'twitter:image');
  if (ogImg !== courseImg) err(`${rel(file)} → og:image is ${ogImg || 'MISSING'}, expected ${courseImg}`);
  if (twImg !== courseImg) err(`${rel(file)} → twitter:image is ${twImg || 'MISSING'}, expected ${courseImg}`);
  if (!siteAssetExists(courseImg)) err(`${rel(file)} → og:image ${courseImg} does not resolve to a file on disk`);

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

  // CHECK 7 — per-type required fields on every JSON-LD object (incl. the FAQ block)
  const objs = ldObjects(lds);
  checkLdFields(rel(file), objs);

  // CHECK 7 — LearningResource names its own course + carries the expected level
  const lr = objs.find((o) => o['@type'] === 'LearningResource');
  if (lr) {
    const c = courseBySlug[s.course];
    const wantPart = `StatsCapybara — ${c.title}: ${c.subtitle}`;
    const partName = lr.isPartOf && lr.isPartOf.name;
    if (partName !== wantPart) err(`${rel(file)} → LearningResource isPartOf is "${partName || 'MISSING'}", expected "${wantPart}"`);
    const wantLevel = expectedLevel(s.course);
    if (wantLevel && lr.educationalLevel !== wantLevel) err(`${rel(file)} → educationalLevel is "${lr.educationalLevel || 'MISSING'}", expected "${wantLevel}"`);
    if (lr.url !== trueUrl) err(`${rel(file)} → LearningResource url is ${lr.url || 'MISSING'}, expected ${trueUrl}`);
  }

  // CHECK 8 — description dedupe + title pattern
  metaHygiene(rel(file), src, ms);

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
  const rootDesc = metaName(ms, 'description');
  if (!rootDesc) err(`${f} → missing meta description`);
  else if (rootDesc.length < 50 || rootDesc.length > 160) warn(`${f} → meta description is ${rootDesc.length} chars (want 50–160)`);
  for (const p of ['og:title', 'og:type', 'og:url']) if (!metaProp(ms, p)) err(`${f} → missing ${p}`);
  for (const p of ['og:image', 'og:description']) if (!metaProp(ms, p)) warn(`${f} → missing ${p}`);
  // og:image (if present) must resolve to a file on disk
  const rootImg = metaProp(ms, 'og:image');
  if (rootImg && !siteAssetExists(rootImg)) err(`${f} → og:image ${rootImg} does not resolve to a file on disk`);

  // CHECK 7 — JSON-LD parses + per-type required fields; every tool page
  // carries a BreadcrumbList (Home → Statistics Toolbox → Tool), quiz.html
  // additionally a Quiz block. The homepage's blocks get their own deep
  // check against curriculum.js below.
  const lds = jsonLd(src);
  if (lds.some((b) => !b.ok)) err(`${f} → a JSON-LD block does not parse`);
  const objs = ldObjects(lds);
  checkLdFields(f, objs);
  const types = objs.map((o) => o['@type']);
  if (f !== 'index.html' && !types.includes('BreadcrumbList')) {
    err(`${f} → missing BreadcrumbList JSON-LD (${NON_TOOL_ROOT.has(f) ? 'Home → Page' : 'Home → Statistics Toolbox → Tool'})`);
  }
  if (f === 'quiz.html' && !types.includes('Quiz')) err(`${f} → missing Quiz JSON-LD`);

  // CHECK 8 — description dedupe + title pattern
  metaHygiene(f, src, ms);
}

/* ---- CHECK 7 (homepage) — Organization + WebSite (SearchAction) + an
   ItemList of Course objects that mirrors curriculum.js exactly ---- */
{
  const src = read(path.join(ROOT, 'index.html'));
  const objs = ldObjects(jsonLd(src));
  const org = objs.find((o) => o['@type'] === 'Organization');
  const web = objs.find((o) => o['@type'] === 'WebSite');
  const list = objs.find((o) => o['@type'] === 'ItemList');
  if (!org) err('index.html → missing Organization JSON-LD');
  else if (org.logo && !siteAssetExists(org.logo)) err(`index.html → Organization logo ${org.logo} does not resolve to a file on disk`);
  if (!web) err('index.html → missing WebSite JSON-LD');
  else {
    const act = web.potentialAction;
    if (!act || act['@type'] !== 'SearchAction' || !act.target || !/\{search_term_string\}/.test(act.target.urlTemplate || ''))
      err('index.html → WebSite JSON-LD lost its SearchAction ?q={search_term_string}');
  }
  if (!list) err('index.html → missing ItemList JSON-LD (one Course per course)');
  else {
    const items = Array.isArray(list.itemListElement) ? list.itemListElement : [];
    if (list.numberOfItems !== CURRICULUM.length) err(`index.html → ItemList numberOfItems is ${list.numberOfItems}, curriculum has ${CURRICULUM.length} courses`);
    if (items.length !== CURRICULUM.length) err(`index.html → ItemList has ${items.length} items, curriculum has ${CURRICULUM.length} courses`);
    CURRICULUM.forEach((c, i) => {
      const item = items[i] && items[i].item;
      const label = `index.html → ItemList course ${i + 1} (${c.slug})`;
      if (!item || item['@type'] !== 'Course') { err(`${label} is not a Course object`); return; }
      const wantName = `${c.title}: ${c.subtitle}`;
      if (item.name !== wantName) err(`${label} name is "${item.name}", expected "${wantName}"`);
      const ready = c.sections.filter((x) => x.ready);
      const nm = (item.description || '').match(/^(\d+) interactive lessons/);
      if (!nm || +nm[1] !== ready.length) err(`${label} description should start "${ready.length} interactive lessons" (got "${item.description}")`);
      const track = (win.TRACKS || []).find((t) => t.id === (c.track || 'core'));
      if (track && !(item.description || '').includes(track.title)) err(`${label} description should name its track "${track.title}"`);
      const wantUrl = `${BASE_URL}${c.slug}/`;   // P61: the course landing page, not the first lesson
      if (item.url !== wantUrl) err(`${label} url is ${item.url}, expected course landing page ${wantUrl}`);
      const wantLevel = expectedLevel(c.slug);
      if (wantLevel && item.educationalLevel !== wantLevel) err(`${label} educationalLevel is "${item.educationalLevel}", expected "${wantLevel}"`);
    });
  }
}
// 404.html: self-contained, GA only
const p404 = path.join(ROOT, '404.html');
if (!fs.existsSync(p404)) err('missing 404.html');
else if (gaCount(read(p404)) !== 2) err(`404.html → expected exactly one GA tag (2 ${GA_ID} refs), found ${gaCount(read(p404))}`);

/* ============================================================
   CHECK 3b — guide pages (guides/<slug>/index.html, P34):
   root-page SEO rules + og:type article, canonical/og:url = the
   guide's true URL, Article + BreadcrumbList JSON-LD, the
   body[data-guide] marker (what gives them lesson-depth BASE),
   a sitemap entry, and a search-index entry.
   ============================================================ */
for (const g of GUIDES) {
  const file = path.join(ROOT, 'guides', g, 'index.html');
  if (!fs.existsSync(file)) { err(`missing guide page: guides/${g}/index.html`); continue; }
  const src = read(file), ms = metaTags(src);
  const trueUrl = `${BASE_URL}guides/${g}/`;
  if (gaCount(src) !== 2) err(`guides/${g} → expected exactly one GA tag (2 ${GA_ID} refs), found ${gaCount(src)}`);
  const canon = canonicalOf(src);
  if (canon !== trueUrl) err(`guides/${g} → canonical is ${canon || 'MISSING'}, expected ${trueUrl}`);
  if (metaProp(ms, 'og:url') !== trueUrl) err(`guides/${g} → og:url is ${metaProp(ms, 'og:url') || 'MISSING'}, expected ${trueUrl}`);
  if (metaProp(ms, 'og:type') !== 'article') err(`guides/${g} → og:type is "${metaProp(ms, 'og:type') || 'MISSING'}", expected "article"`);
  const desc = metaName(ms, 'description');
  if (!desc) err(`guides/${g} → missing meta description`);
  else if (desc.length < 50 || desc.length > 160) warn(`guides/${g} → meta description is ${desc.length} chars (want 50–160)`);
  const gImg = metaProp(ms, 'og:image');
  if (!gImg) warn(`guides/${g} → missing og:image`);
  else if (!siteAssetExists(gImg)) err(`guides/${g} → og:image ${gImg} does not resolve to a file on disk`);
  const lds = jsonLd(src);
  if (lds.some((b) => !b.ok)) err(`guides/${g} → a JSON-LD block does not parse`);
  const gObjs = ldObjects(lds);
  const gTypes = gObjs.map((o) => o['@type']);
  if (!gTypes.includes('Article')) err(`guides/${g} → missing Article JSON-LD`);
  if (!gTypes.includes('BreadcrumbList')) err(`guides/${g} → missing BreadcrumbList JSON-LD`);
  checkLdFields(`guides/${g}`, gObjs);           // CHECK 7 — per-type required fields
  metaHygiene(`guides/${g}`, src, ms);           // CHECK 8 — dedupe + title pattern
  const body = (src.match(/<body\b[^>]*>/i) || [''])[0];
  if (attrs(body)['data-guide'] !== g) err(`guides/${g} → body data-guide is "${attrs(body)['data-guide'] || 'MISSING'}", expected "${g}"`);
  if (!sitemapLocs.has(trueUrl)) err(`sitemap.xml missing guides/${g}/`);
  if (!(SEARCH_INDEX.pages || []).some((p) => p.u === `guides/${g}/`)) err(`search-index.js has no page entry for "guides/${g}/" — rerun tools/build-search-index.py`);
}

/* ============================================================
   CHECK 3c — course landing pages (<course>/index.html, P61):
   the same SEO rules as a root page plus og:type website, exact
   canonical/og:url = the course's true URL, og:image = that course's
   OG card (and it exists on disk), Course + BreadcrumbList JSON-LD,
   the body[data-course-home] marker, and sitemap + search-index
   entries. No QUIPS entry is required (these pages have no sidebar to
   surface one) — nothing below asks for one.
   ============================================================ */
for (const slug of COURSE_PAGES) {
  const file = path.join(ROOT, slug, 'index.html');
  if (!fs.existsSync(file)) { err(`missing course landing page: ${slug}/index.html`); continue; }
  const src = read(file), ms = metaTags(src);
  const trueUrl = `${BASE_URL}${slug}/`;
  if (gaCount(src) !== 2) err(`${slug}/ → expected exactly one GA tag (2 ${GA_ID} refs), found ${gaCount(src)}`);
  const canon = canonicalOf(src);
  if (canon !== trueUrl) err(`${slug}/ → canonical is ${canon || 'MISSING'}, expected ${trueUrl}`);
  if (metaProp(ms, 'og:url') !== trueUrl) err(`${slug}/ → og:url is ${metaProp(ms, 'og:url') || 'MISSING'}, expected ${trueUrl}`);
  if (metaProp(ms, 'og:type') !== 'website') err(`${slug}/ → og:type is "${metaProp(ms, 'og:type') || 'MISSING'}", expected "website"`);
  const desc = metaName(ms, 'description');
  if (!desc) err(`${slug}/ → missing meta description`);
  else if (desc.length < 50 || desc.length > 160) warn(`${slug}/ → meta description is ${desc.length} chars (want 50–160)`);
  // og:image / twitter:image = this course's OG card, and it exists on disk
  const courseImg = `${BASE_URL}assets/og-${slug}.png`;
  const ogImg = metaProp(ms, 'og:image');
  const twImg = metaName(ms, 'twitter:image');
  if (ogImg !== courseImg) err(`${slug}/ → og:image is ${ogImg || 'MISSING'}, expected ${courseImg}`);
  if (twImg !== courseImg) err(`${slug}/ → twitter:image is ${twImg || 'MISSING'}, expected ${courseImg}`);
  if (!siteAssetExists(courseImg)) err(`${slug}/ → og:image ${courseImg} does not resolve to a file on disk`);
  // JSON-LD: Course + BreadcrumbList, both with required fields
  const lds = jsonLd(src);
  if (lds.some((b) => !b.ok)) err(`${slug}/ → a JSON-LD block does not parse`);
  const cObjs = ldObjects(lds);
  const cTypes = cObjs.map((o) => o['@type']);
  if (!cTypes.includes('Course')) err(`${slug}/ → missing Course JSON-LD`);
  if (!cTypes.includes('BreadcrumbList')) err(`${slug}/ → missing BreadcrumbList JSON-LD`);
  checkLdFields(`${slug}/`, cObjs);                 // CHECK 7 — per-type required fields
  // the Course block should mirror the homepage ItemList: name + landing-page url + level
  const course = courseBySlug[slug], courseLd = cObjs.find((o) => o['@type'] === 'Course');
  if (course && courseLd) {
    const wantName = `${course.title}: ${course.subtitle}`;
    if (courseLd.name !== wantName) err(`${slug}/ → Course JSON-LD name is "${courseLd.name}", expected "${wantName}"`);
    if (courseLd.url !== trueUrl) err(`${slug}/ → Course JSON-LD url is ${courseLd.url}, expected ${trueUrl}`);
    const wantLevel = expectedLevel(slug);
    if (wantLevel && courseLd.educationalLevel !== wantLevel) err(`${slug}/ → Course JSON-LD educationalLevel is "${courseLd.educationalLevel}", expected "${wantLevel}"`);
  }
  metaHygiene(`${slug}/`, src, ms);                 // CHECK 8 — dedupe + title pattern
  const body = (src.match(/<body\b[^>]*>/i) || [''])[0];
  if (attrs(body)['data-course-home'] !== slug) err(`${slug}/ → body data-course-home is "${attrs(body)['data-course-home'] || 'MISSING'}", expected "${slug}"`);
  if (!sitemapLocs.has(trueUrl)) err(`sitemap.xml missing ${slug}/`);
  if (!(SEARCH_INDEX.pages || []).some((p) => p.u === `${slug}/`)) err(`search-index.js has no page entry for "${slug}/" — rerun tools/build-search-index.py`);
}

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
for (const g of GUIDES) {
  const file = path.join(ROOT, 'guides', g, 'index.html');
  if (fs.existsSync(file)) checkLinks(file);
}
for (const slug of COURSE_PAGES) {
  const file = path.join(ROOT, slug, 'index.html');
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
/* The JSON-LD ItemList states per-course lesson counts ("13 interactive
   lessons…") — those are verified per-course by CHECK 7, so strip the
   JSON-LD blocks before scanning for the site-wide totals. */
const idx = read(path.join(ROOT, 'index.html'))
  .replace(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, ' ');
const courseCount = CURRICULUM.length;
const lessonCount = READY.length;
const cm = idx.match(/(\d+)\s+courses/i);
if (cm && +cm[1] !== courseCount) err(`index.html says "${cm[1]} courses" but curriculum has ${courseCount}`);
for (const lm of idx.matchAll(/(\d+)\s+(?:interactive |hands-on )?lessons/gi))
  if (+lm[1] !== lessonCount) err(`index.html says "${lm[1]} … lessons" but curriculum has ${lessonCount} ready lessons`);

/* ============================================================
   CHECK 8 — meta-description dedupe (titles are checked per page
   by metaHygiene as the loops above run)
   ============================================================ */
descSeen.forEach((pages, d) => {
  if (pages.length > 1) err(`duplicate meta description on ${pages.join(' + ')}: "${d.slice(0, 60)}…"`);
});

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
