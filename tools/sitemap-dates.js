#!/usr/bin/env node
/* ============================================================
   sitemap-dates.js — set every <lastmod> in sitemap.xml to the date
   the page last changed.

   Run from the repo root:
       node tools/sitemap-dates.js            # rewrite the dates in place
       node tools/sitemap-dates.js --check    # verify only, exit 1 on any mismatch

   A page's date is the committer date of the last commit that touched
   its file (git log -1 --format=%cs -- <file>). A page with uncommitted
   changes, staged or not, gets today's date instead, because the commit
   that carries it will be dated today. So the order is: edit, run this,
   commit both. Run with --check after the commit and it passes.

   Why: until P125 every lastmod was typed by hand when a page was added
   and never touched again. On 7 Oct 2026 all 145 were older than their
   page's last commit (the homepage said 2026-07-02; it last changed on
   5 Oct). Search engines ignore lastmod once they find it unreliable, so
   a stale date is worse than none.

   Kept out of tools/audit.js on purpose: audit must run on a copy of the
   files with no git history, and this cannot. For the same reason it
   refuses to run in a shallow clone, where `git log -1` would report the
   clone's oldest commit for every file that has not changed since.

   A <loc> maps to a file the way the server resolves it: the site root
   and any URL ending in "/" mean that folder's index.html, and anything
   else is the file itself. A <loc> with no file behind it is an error.
   A <url> with no <lastmod> gets one, after its <loc>.
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const SITEMAP = path.join(ROOT, "sitemap.xml");
const BASE = "https://statscapybara.com/";
const CHECK = process.argv.includes("--check");

const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();

if (git("rev-parse", "--is-shallow-repository") === "true") {
  console.error("sitemap-dates: this is a shallow clone, so git cannot see when most pages last changed.\n" +
    "Fetch the full history first (git fetch --unshallow), then run this again.");
  process.exit(2);
}

/* Local date, the same calendar the commit about to be made will carry. */
const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

/* Every path git reports as changed and not yet committed: modified,
   staged, added or untracked. Porcelain v1 gives "XY path", or
   "XY old -> new" for a rename. */
const dirty = new Set();
for (const line of git("status", "--porcelain", "--untracked-files=all").split("\n")) {
  if (!line) continue;
  const p = line.slice(3);
  dirty.add(p.includes(" -> ") ? p.split(" -> ")[1] : p);
}

function fileFor(loc) {
  if (!loc.startsWith(BASE)) return null;
  let rel = loc.slice(BASE.length);
  if (rel === "" || rel.endsWith("/")) rel += "index.html";
  return rel;
}

function dateFor(rel) {
  if (dirty.has(rel)) return today;
  const d = git("log", "-1", "--format=%cs", "--", rel);
  return d || today;   // never committed: it will be, today
}

const src = fs.readFileSync(SITEMAP, "utf8");
const problems = [], changed = [];
let urls = 0;
const out = src.replace(/<url>([\s\S]*?)<\/url>/g, (block, inner) => {
  urls++;
  const lm = inner.match(/<loc>([^<]+)<\/loc>/);
  if (!lm) { problems.push("a <url> with no <loc>"); return block; }
  const loc = lm[1].trim();
  const rel = fileFor(loc);
  if (!rel || !fs.existsSync(path.join(ROOT, rel))) {
    problems.push(`${loc} → no file at ${rel || "(not under " + BASE + ")"}`);
    return block;
  }
  const want = dateFor(rel);
  const dm = inner.match(/<lastmod>([^<]*)<\/lastmod>/);
  const have = dm ? dm[1].trim() : null;
  if (have === want) return block;
  changed.push(`${loc}  ${have || "(none)"} → ${want}`);
  if (dm) return block.replace(dm[0], `<lastmod>${want}</lastmod>`);
  const indent = (block.match(/\n([ \t]*)<loc>/) || [, "    "])[1];
  return block.replace(lm[0], `${lm[0]}\n${indent}<lastmod>${want}</lastmod>`);
});

for (const p of problems) console.error("ERROR  " + p);
if (CHECK) {
  for (const c of changed) console.log("STALE  " + c);
  const bad = changed.length + problems.length;
  console.log(bad
    ? `sitemap-dates --check: ${changed.length} of ${urls} lastmod dates differ from git` +
      (problems.length ? `, ${problems.length} URL(s) with no file` : "") + ". Run node tools/sitemap-dates.js."
    : `sitemap-dates --check: all ${urls} lastmod dates match the last commit to each page.`);
  process.exit(bad ? 1 : 0);
}
if (changed.length) fs.writeFileSync(SITEMAP, out);
for (const c of changed) console.log("set    " + c);
console.log(`sitemap-dates: ${changed.length} of ${urls} lastmod dates updated` +
  (problems.length ? `, ${problems.length} URL(s) with no file` : "") + ".");
process.exit(problems.length ? 1 : 0);
