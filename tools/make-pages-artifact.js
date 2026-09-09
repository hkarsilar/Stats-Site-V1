#!/usr/bin/env node
/* ============================================================
   make-pages-artifact.js — assemble the directory GitHub Pages
   publishes: the committed tree MINUS the development files.

   Zero-dependency Node script (Node ≥ 14, built-ins only: fs, path,
   child_process). Run from the repo root:

       node tools/make-pages-artifact.js [outDir]   # default _site
       node tools/make-pages-artifact.js --list     # show the split, write nothing

   WHY THIS EXISTS (P78). GitHub Pages used to serve this repo straight
   off the `main` branch, and `.nojekyll` makes that literal: every file
   was published verbatim, so statscapybara.com/CLAUDE.md opened with
   "guidance to Claude Code" and /PROMPTS.md, /ROADMAP.md, /VOICE.md,
   /AGENTS.md and /README.md narrated the whole development process to
   anyone who truncated a URL. "Unlinked and un-indexed" was a fine SEO
   judgment and no defense at all. This script is the filter: the
   workflow in .github/workflows/pages.yml runs it and uploads its
   output, so the six planning docs and tools/ 404 on the domain.

   IT IS NOT A BUILD STEP AND MUST NEVER BECOME ONE. Nothing here is
   processed, minified, templated or rewritten — every file that ships
   is copied byte-for-byte. CLAUDE.md's no-build law still governs the
   site itself; this is deploy plumbing, and the only thing it decides
   is which files are in the box.

   THE SOURCE OF TRUTH IS THE COMMITTED TREE, enumerated with
   `git ls-files`, not a filesystem walk. That is what the branch-deploy
   served, so the artifact stays exactly "what Pages published before,
   minus the list" — and it means local cruft (a .DS_Store, a stray
   _c.js, a __pycache__) can never reach the artifact locally and then
   be absent in CI, which is the one way a local proof could lie.

   The same script assembles the artifact in CI and in the local proof,
   so the exclude list below is the ONE definition of what is public.
   Editing it changes the live site's file inventory — read EXCLUDE's
   reasons before adding to it, and re-run the local proof afterwards.
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

/* Paths are repo-root-relative. An entry matches itself and, for a
   directory, everything beneath it. Each carries the reason it is not
   public, so a future session can weigh an addition rather than guess. */
const EXCLUDE = [
  ["CLAUDE.md", "development guide — names the tooling and the process"],
  ["AGENTS.md", "the same guide, mirrored for Codex"],
  ["PROMPTS.md", "the numbered session prompts"],
  ["ROADMAP.md", "the development plan and its status tracker"],
  ["VOICE.md", "the editorial rules the prose is written against"],
  ["README.md", "repo orientation, not reader-facing"],
  ["CONTRIBUTING.md", "how to work ON the repo — license.html is the reader-facing version"],
  ["statscapybara-restructure-prompt.md", "the course-restructure session brief"],
  ["tools/", "the checkers, their narration, and faq_data.py"],
  [".claude/", "editor/session config"],
  [".github/", "the workflow that builds this artifact"],
  [".gitignore", "repo housekeeping, no site value"],
  [".gitattributes", "repo housekeeping, no site value"],
  [".git/", "history — never tracked, listed so the intent is explicit"]
];

/* A cheap over-exclusion gate: these must survive into every artifact.
   Over-excluding is the failure mode a diff of the EXCLUDED side would
   not catch, and a missing CNAME silently drops the custom domain. */
const REQUIRED = [
  "index.html",
  "CNAME",
  ".nojekyll",
  "robots.txt",
  "sitemap.xml",
  "sw.js",
  "offline.html",
  "404.html",
  "site.webmanifest",
  "assets/css/styles.css",
  "assets/js/site.js",
  "assets/js/search-index.js"
];

const DIRS = EXCLUDE.filter(e => e[0].endsWith("/")).map(e => e[0].slice(0, -1));
const FILES = EXCLUDE.filter(e => !e[0].endsWith("/")).map(e => e[0]);

function isExcluded(rel) {
  if (FILES.indexOf(rel) !== -1) return true;
  return DIRS.some(d => rel === d || rel.startsWith(d + "/"));
}

/* Enumerate the committed tree. -z survives spaces and unicode in paths. */
function trackedFiles() {
  let out;
  try {
    out = execFileSync("git", ["ls-files", "-z"], { cwd: process.cwd(), maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    console.error("ERROR: `git ls-files` failed. Run this from the repo root, with git available.");
    console.error(String(e.message || e));
    process.exit(1);
  }
  return String(out).split("\0").filter(Boolean);
}

function walk(dir, base, acc) {
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    const rel = base ? base + "/" + name : name;
    if (fs.statSync(abs).isDirectory()) walk(abs, rel, acc);
    else acc.push(rel);
  }
  return acc;
}

function main() {
  const args = process.argv.slice(2);
  const listOnly = args.indexOf("--list") !== -1;
  const outArg = args.filter(a => !a.startsWith("--"))[0] || "_site";

  const tracked = trackedFiles();
  const keep = tracked.filter(f => !isExcluded(f));
  const drop = tracked.filter(f => isExcluded(f));

  console.log("make-pages-artifact — the committed tree minus the development files\n");
  console.log("EXCLUDED (" + drop.length + " tracked files):");
  for (const [p, why] of EXCLUDE) {
    const n = drop.filter(f => (p.endsWith("/") ? f.startsWith(p) : f === p)).length;
    console.log("  " + (n ? String(n).padStart(4) : "   0") + "  " + p.padEnd(16) + why);
  }
  console.log("\nPUBLISHED: " + keep.length + " files");

  if (listOnly) return;

  const out = path.resolve(process.cwd(), outArg);
  const root = path.resolve(process.cwd());
  if (out === root || root.startsWith(out + path.sep)) {
    console.error("\nERROR: refusing to write the artifact to " + out + " — it is the repo root or an ancestor of it.");
    process.exit(1);
  }
  if (fs.existsSync(path.join(out, ".git"))) {
    console.error("\nERROR: refusing to overwrite " + out + " — it holds a .git directory.");
    process.exit(1);
  }

  fs.rmSync(out, { recursive: true, force: true });
  let bytes = 0;
  for (const rel of keep) {
    const src = path.resolve(root, rel);
    if (!fs.existsSync(src)) {
      console.error("\nERROR: tracked file missing from the working tree: " + rel);
      process.exit(1);
    }
    const dst = path.join(out, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    bytes += fs.statSync(src).size;
  }

  /* Verify what actually landed, rather than trusting the copy loop. */
  const written = walk(out, "", []);
  const leaked = written.filter(isExcluded);
  const missing = REQUIRED.filter(f => !fs.existsSync(path.join(out, f)));
  const short = keep.filter(f => !fs.existsSync(path.join(out, f)));

  console.log("\nWROTE " + written.length + " files (" + (bytes / 1048576).toFixed(1) + " MB) to " + out);

  let bad = false;
  if (leaked.length) { console.error("\nERROR: excluded files reached the artifact:\n  " + leaked.join("\n  ")); bad = true; }
  if (missing.length) { console.error("\nERROR: required site files missing from the artifact:\n  " + missing.join("\n  ")); bad = true; }
  if (short.length) { console.error("\nERROR: files were not copied:\n  " + short.join("\n  ")); bad = true; }
  if (bad) process.exit(1);

  console.log("VERIFIED — nothing excluded leaked, every required site file is present.");
}

main();
