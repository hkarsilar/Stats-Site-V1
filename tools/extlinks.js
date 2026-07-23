#!/usr/bin/env node
/* ============================================================
   extlinks.js — external-link checker for the quarterly P38 health audit.

   Zero-dependency Node script (Node ≥ 14, built-ins only: fs, path, http,
   https, url). Run from the repo root:

       node tools/extlinks.js              # check every external link
       node tools/extlinks.js --verbose    # also list the OK ones in full
       node tools/extlinks.js --strict     # exit 1 if anything is broken

   THIS IS NOT A COMMIT GATE and must never become one. It needs the
   network, so a flaky café wifi would fail a commit that broke nothing.
   audit.js is the gate (it already proves every INTERNAL link resolves on
   disk); this is the quarterly helper that proves the OUTBOUND ones are
   still alive. Default exit code is 0 whatever it finds — read the report.

   What it scans: every .html file in the repo plus the shared scripts in
   assets/js/ (the Ko-fi button URLs live in site.js, not in any page), with
   .claude/worktrees and the generated search-index.js excluded. Own-domain
   statscapybara.com links are skipped — audit.js owns those.

   Bot-blocking: several hosts serve a non-200 to anything that isn't a real
   browser. Those are cataloged in ALLOW below with the status they are
   known to return and a note on how it was verified by hand, so a genuine
   404 never hides inside a familiar-looking failure. Re-verify an ALLOW
   entry in a real browser during each P38 run rather than trusting it
   forever — that's the point of the "verified" field.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const VERBOSE = process.argv.includes('--verbose');
const STRICT = process.argv.includes('--strict');

const TIMEOUT_MS = 15000;
const CONCURRENCY = 6;
const MAX_REDIRECTS = 5;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

/* Hosts that block non-browser clients. status = what they return to this
   script; verified = when the URL was last confirmed fine in a real browser. */
const ALLOW = [
  { host: 'ko-fi.com', status: [403], why: 'Cloudflare bot check; the button and page work in a browser', verified: 'P38, 23 Jul 2026 — page loaded in-browser, Tip button + statscapybara.com link present' },
  { host: 'storage.ko-fi.com', status: [403], why: 'same Cloudflare rule as ko-fi.com; the button image itself returns 200', verified: 'P38, 23 Jul 2026 — button image still 200 to this script' },
  { host: 'www.linkedin.com', status: [999], why: 'LinkedIn answers 999 to every non-browser request; the vanity URL resolves but a logged-out browser hits the auth wall, so the render needs a signed-in check', verified: 'P38, 23 Jul 2026 — URL resolved (no 404); auth wall, so confirm the profile itself while signed in' },
  { host: 'linkedin.com', status: [999], why: 'as www.linkedin.com', verified: 'P38, 23 Jul 2026' },
];

const allowFor = (u) => {
  let host;
  try { host = new URL(u).hostname; } catch (e) { return null; }
  return ALLOW.find((a) => a.host === host) || null;
};

/* ============================================================
   1 — collect
   ============================================================ */
const SKIP_DIRS = new Set(['.git', 'node_modules', '.claude']);
const SKIP_FILES = new Set(['search-index.js']);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full, out);
    } else if (!SKIP_FILES.has(entry.name)) {
      const ext = path.extname(entry.name);
      if (ext === '.html' || ext === '.js') out.push(full);
    }
  }
  return out;
}

/* Pull every absolute http(s) URL out of a quoted attribute or JS string.
   The trailing character class stops at the closing quote, whitespace, or a
   delimiter, which is enough for the shapes this site actually contains. */
const URL_RE = /["'(]\s*(https?:\/\/[^"'\s)<>\\]+)/g;

const links = new Map();                       // url → Set of repo-relative files
for (const file of walk(ROOT, [])) {
  const rel = path.relative(ROOT, file);
  const text = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = URL_RE.exec(text)) !== null) {
    // xmlns="http://www.w3.org/2000/svg" is a namespace IDENTIFIER, not a
    // link — nothing ever fetches it, and w3.org answers 403 to this script.
    if (/xmlns(:[a-z]+)?\s*=\s*$/i.test(text.slice(Math.max(0, m.index - 24), m.index))) continue;
    let url = m[1].replace(/&amp;/g, '&').replace(/[.,;]+$/, '');
    let host;
    try { host = new URL(url).hostname; } catch (e) { continue; }
    if (host === 'statscapybara.com' || host === 'www.statscapybara.com') continue;
    if (!links.has(url)) links.set(url, new Set());
    links.get(url).add(rel);
  }
}

const urls = [...links.keys()].sort();
if (urls.length === 0) {
  console.log('extlinks: no external links found.');
  process.exit(0);
}

/* ============================================================
   2 — fetch
   ============================================================ */
function check(url, redirects) {
  redirects = redirects || 0;
  return new Promise((resolve) => {
    let parsed;
    try { parsed = new URL(url); } catch (e) { return resolve({ url, error: 'unparseable URL' }); }
    const mod = parsed.protocol === 'https:' ? https : http;

    const req = mod.get(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    }, (res) => {
      const status = res.statusCode;
      const loc = res.headers.location;
      // We only need the status line, never the body.
      res.destroy();
      if (status >= 300 && status < 400 && loc && redirects < MAX_REDIRECTS) {
        let next;
        try { next = new URL(loc, url).href; } catch (e) { return resolve({ url, status, error: `bad redirect target "${loc}"` }); }
        return check(next, redirects + 1).then((r) => resolve({ ...r, url, redirectedTo: r.url === next ? next : r.redirectedTo || next }));
      }
      resolve({ url, status, redirectedTo: redirects ? url : undefined });
    });

    req.setTimeout(TIMEOUT_MS, () => { req.destroy(); resolve({ url, error: `timeout after ${TIMEOUT_MS / 1000}s` }); });
    req.on('error', (e) => resolve({ url, error: e.code || e.message }));
  });
}

async function run() {
  const results = [];
  let next = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY, urls.length) }, async () => {
    while (next < urls.length) {
      const url = urls[next++];
      results.push(await check(url));
    }
  });
  await Promise.all(workers);
  report(results);
}

/* ============================================================
   3 — report
   ============================================================ */
function report(results) {
  const ok = [], blocked = [], broken = [];

  for (const r of results.sort((a, b) => a.url.localeCompare(b.url))) {
    const allow = allowFor(r.url);
    if (!r.error && r.status >= 200 && r.status < 400) ok.push(r);
    else if (allow && !r.error && allow.status.includes(r.status)) blocked.push({ ...r, allow });
    else broken.push({ ...r, allow });
  }

  const line = '─'.repeat(60);
  const where = (r) => [...links.get(r.url)].sort().join(', ');
  console.log(line);
  console.log(`StatsCapybara external links — ${results.length} unique URLs`);
  console.log(line);

  console.log(`\nOK (${ok.length}):`);
  for (const r of ok) {
    console.log(`  ✓ ${r.status}  ${r.url}${r.redirectedTo ? `  → ${r.redirectedTo}` : ''}`);
    if (VERBOSE) console.log(`         in: ${where(r)}`);
  }

  if (blocked.length) {
    console.log(`\nBOT-BLOCKED, known fine (${blocked.length}):`);
    for (const r of blocked) {
      console.log(`  ~ ${r.status}  ${r.url}`);
      console.log(`         ${r.allow.why}`);
      console.log(`         last verified in a browser: ${r.allow.verified}`);
      if (VERBOSE) console.log(`         in: ${where(r)}`);
    }
  }

  if (broken.length) {
    console.log(`\nBROKEN — check these by hand (${broken.length}):`);
    for (const r of broken) {
      console.log(`  ✗ ${r.error ? r.error : r.status}  ${r.url}`);
      console.log(`         in: ${where(r)}`);
      if (r.allow) console.log(`         NOTE: this host is on the allow-list for ${r.allow.status.join('/')}, but returned something else — treat as a real failure.`);
    }
  }

  console.log(`\n${line}`);
  console.log(`${ok.length} ok · ${blocked.length} bot-blocked (known) · ${broken.length} broken`);
  if (broken.length) console.log('Network-dependent: re-run a broken URL before editing the site — and open it in a browser.');
  console.log(line);
  process.exit(STRICT && broken.length ? 1 : 0);
}

run();
