#!/usr/bin/env node
/* ============================================================
   Bake each lesson's "On this page" box into its HTML.

   Run from the repo root:
       node tools/make-lesson-tocs.js            # write the boxes
       node tools/make-lesson-tocs.js --check    # verify only, exit 1 on drift

   Why baked: site.js used to build the box at runtime and insert it after
   the lede. On a slow phone connection the browser paints the article
   before the 170 KB site.js arrives, so the box pushed everything below
   the lede down by 200 to 300 px after first paint. P38 (15 Oct 2026)
   measured a cumulative layout shift of 0.09 to 0.19 at 412 px on
   simulated slow 4G, against Google's 0.1 line. A box that is in the HTML
   from the start cannot shift anything.

   What it writes, per ready lesson with a lede and at least four h2s
   (the same rule renderTOC() in site.js applies):
     - an id on every h2 in the article that lacks one, slugified exactly
       as ensureH2Ids() does (hand-written ids win; a slug that collides
       with any other id on the page gets "-x" appended), so the copy-link
       buttons and old shared links keep their anchors;
     - <nav class="lesson-toc"> on its own line straight after the lede,
       holding the same markup renderTOC() produced.
   renderTOC() still builds the box for any lesson that lacks one, so a
   new lesson works before this script has run. audit.js calls check()
   and fails on a box that no longer matches its headings: after adding,
   removing or renaming an h2, rerun this script.

   Search, prose-lint and the editorial checkers read the article; the
   lesson-toc nav repeats the headings, so build-search-index.py drops it
   from lesson text (the index stays as it was before baking).
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

function readyLessons() {
  const src = fs.readFileSync(path.join(ROOT, "assets/js/curriculum.js"), "utf8");
  const window = {};
  new Function("window", src)(window);
  const out = [];
  for (const c of window.CURRICULUM)
    for (const s of c.sections) if (s.ready) out.push(`${c.slug}/${s.slug}/index.html`);
  return out;
}

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", mdash: "—", ndash: "–", hellip: "…", sup2: "²", sup3: "³", times: "×", minus: "−", le: "≤", ge: "≥", middot: "·" };
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (m, e) => {
    if (e[0] === "#") return String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : +e.slice(1));
    if (ENT[e] === undefined) throw new Error("unknown entity " + m);
    return ENT[e];
  });
}
const textOf = (inner) => decode(inner.replace(/<[^>]*>/g, ""));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, "&nbsp;");

const TOC_RE = /\n[ \t]*<nav class="lesson-toc"[^>]*>[\s\S]*?<\/nav>(?=\n)/;
const H2_RE = /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g;

/* The page as it should be, or null when the lesson gets no box. */
function render(src) {
  src = src.replace(TOC_RE, "");
  const a0 = src.indexOf('<article class="lesson">');
  const a1 = src.indexOf("</article>", a0);
  if (a0 < 0 || a1 < 0) return null;
  let art = src.slice(a0, a1);
  const heads = [...art.matchAll(H2_RE)];
  const lede = /\n([ \t]*)<p class="lede"[^>]*>[\s\S]*?<\/p>[^\n]*(?=\n)/.exec(art);
  if (heads.length < 4 || !lede) return null;

  // every id on the page except the h2s', as ensureH2Ids() sees them
  const taken = {};
  const withoutH2 = src.replace(H2_RE, "");
  for (const m of withoutH2.matchAll(/\sid="([^"]+)"/g)) taken[m[1]] = 1;
  const items = [];
  for (const h of heads) {
    const own = /\sid="([^"]+)"/.exec(h[1] || "");
    const text = textOf(h[2]);
    let id;
    if (own) id = own[1];
    else {
      id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
      while (taken[id]) id += "-x";
    }
    taken[id] = 1;
    items.push({ h, own: !!own, id, text });
  }
  // put the ids on the headings (back to front so offsets hold)
  for (const it of items.slice().reverse()) {
    if (it.own) continue;
    const i = it.h.index, open = `<h2${it.h[1] || ""}>`;
    art = art.slice(0, i) + `<h2 id="${it.id}"${it.h[1] || ""}>` + art.slice(i + open.length);
  }
  const indent = lede[1];
  const nav = `\n${indent}<nav class="lesson-toc" aria-label="On this page"><span class="toc-label">On this page</span>` +
    items.map((it) => `<a href="#${it.id}">${esc(it.text)}</a>`).join("") + "</nav>";
  const at = art.search(/\n[ \t]*<p class="lede"/) + lede[0].length;
  art = art.slice(0, at) + nav + art.slice(at);
  return src.slice(0, a0) + art + src.slice(a1);
}

/* Lessons whose file differs from what render() would write. */
function check() {
  const bad = [];
  for (const rel of readyLessons()) {
    const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
    const want = render(src);
    if (want === null ? TOC_RE.test(src) : want !== src) bad.push(rel);
  }
  return bad;
}

if (require.main === module) {
  if (process.argv.includes("--check")) {
    const bad = check();
    if (bad.length) {
      console.log(`FAIL — ${bad.length} lesson box(es) out of date; run node tools/make-lesson-tocs.js:`);
      bad.forEach((b) => console.log("  " + b));
      process.exit(1);
    }
    console.log("PASS — every lesson's On this page box matches its headings.");
  } else {
    let n = 0, boxed = 0;
    for (const rel of readyLessons()) {
      const p = path.join(ROOT, rel);
      const src = fs.readFileSync(p, "utf8");
      let want = render(src);
      if (want === null) want = src.replace(TOC_RE, "");
      else boxed++;
      if (want !== src) { fs.writeFileSync(p, want); n++; }
    }
    console.log(`${boxed} lessons carry a box; ${n} file(s) rewritten.`);
  }
}

module.exports = { check, render };
