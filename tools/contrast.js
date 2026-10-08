#!/usr/bin/env node
/* ============================================================
   contrast.js — do the color pairs the site uses clear WCAG AA?

   Zero-dependency Node script (built-ins only). Run from the repo root:

       node tools/contrast.js            # every pair, both themes
       node tools/contrast.js --fails    # only the pairs under their minimum
       node tools/contrast.js --strict   # exit 1 on any pair under its minimum

   Not a commit gate, like the other checkers in CLAUDE.md's table.

   WHY IT EXISTS (P123). The homepage said "Text meets 4.5:1 contrast in
   both light and dark themes", and on 7 Oct 2026 axe-core counted 1,561
   text elements under the minimum in light mode (814 in dark), plus 1,441
   prose links that differed from their paragraph only by color. The palette
   notes in styles.css were right about the pairs they named and silent about
   the rest: --link was checked against --text, while lesson paragraphs are
   --text-muted, and most failures were course accents used as text. This
   script keeps the pairs in one table and recomputes them from styles.css,
   so a token edit shows its consequences before a browser does.

   WHAT IT READS. The declarations in styles.css's `:root { … }` block (the
   light theme) and in its `html[data-theme="dark"] { … }` block (the dark
   overrides). Both sit on <html>, so a token defined once in :root as
   var(--other) takes the dark value of --other in dark mode, exactly as in
   the browser. Values may be hex, rgb()/rgba(), var() with a fallback, and
   color-mix(in srgb, A p%, B), with `transparent` allowed as either side.
   A color with alpha is laid over the pair's background, or over --bg for a
   background.

   THE TABLE. PAIRS below: what is drawn, in what, on what, at what size.
   "normal" text needs 4.5:1; "large" text (24px, or 18.66px bold) and "ui"
   (a component boundary, a focus ring) need 3:1. Write the colors the way
   the CSS writes them, so a pair can be checked against its rule by eye.
   Course accents and a few semantic colors are literals in the CSS
   (body[data-course=…], .software …), so they are literals here too.

   BLIND SPOTS. It checks the table, not the pages: a new rule that puts an
   accent on a surface is invisible to it until someone adds the pair. The
   page-level sweep is axe-core in a browser, run from a scratchpad, never
   from the repo (P123's report has the method). It ignores opacity, which
   is why P123 replaced the opacity fades on text with --text-faint.
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");

const CSS = fs.readFileSync(path.join(__dirname, "..", "assets", "css", "styles.css"), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "");

// ---------- token blocks ----------
function blocks(selector) {
  const out = {};
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(CSS))) {
    if (m[1].trim() !== selector) continue;
    for (const d of m[2].split(";")) {
      const i = d.indexOf(":");
      if (i < 0) continue;
      const k = d.slice(0, i).trim(), v = d.slice(i + 1).trim();
      if (k.startsWith("--")) out[k] = v;
    }
  }
  return out;
}
const LIGHT = blocks(":root");
const DARK_ONLY = blocks('html[data-theme="dark"]');
const DARK = Object.assign({}, LIGHT, DARK_ONLY);
if (!Object.keys(LIGHT).length || !Object.keys(DARK_ONLY).length) {
  console.error("contrast.js: could not find the :root and dark token blocks in styles.css");
  process.exit(2);
}

// ---------- color evaluation: [r, g, b, a] with r,g,b in 0..255 ----------
function splitArgs(s) {
  const out = []; let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}
function evalColor(expr, T, seen) {
  expr = expr.trim();
  seen = seen || new Set();
  let m;
  if (expr === "transparent") return [0, 0, 0, 0];
  if (/^#[0-9a-f]{3,8}$/i.test(expr)) {
    let h = expr.slice(1);
    if (h.length <= 4) h = h.split("").map(c => c + c).join("");
    const n = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
    return n.concat(h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1);
  }
  if ((m = expr.match(/^rgba?\((.*)\)$/i))) {
    const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  if ((m = expr.match(/^var\((.*)\)$/))) {
    const [name, fb] = splitArgs(m[1]);
    if (T[name] != null && !seen.has(name)) { seen.add(name); return evalColor(T[name], T, seen); }
    if (fb != null) return evalColor(fb, T, seen);
    throw new Error("unknown token " + name);
  }
  if ((m = expr.match(/^color-mix\(in srgb,(.*)\)$/i))) {
    const [a, b] = splitArgs(m[1]).map(part => {
      const pm = part.match(/^(.*?)\s+([\d.]+)%$/);
      return pm ? { c: pm[1], p: +pm[2] / 100 } : { c: part, p: null };
    });
    let pa = a.p, pb = b.p;
    if (pa == null && pb == null) { pa = .5; pb = .5; } else if (pa == null) pa = 1 - pb; else if (pb == null) pb = 1 - pa;
    const A = evalColor(a.c, T, new Set(seen)), B = evalColor(b.c, T, new Set(seen));
    // CSS color-mix interpolates premultiplied colors, then un-premultiplies
    const alpha = A[3] * pa + B[3] * pb;
    if (alpha === 0) return [0, 0, 0, 0];
    const ch = i => (A[i] * A[3] * pa + B[i] * B[3] * pb) / alpha;
    return [ch(0), ch(1), ch(2), alpha];
  }
  throw new Error("can't read color: " + expr);
}
function over(top, under) {
  const t = top[3];
  return [0, 1, 2].map(i => top[i] * t + under[i] * (1 - t)).concat(1);
}
function lum(c) {
  const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}
function ratio(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function pair(fg, bg, T) {
  const page = evalColor("var(--bg)", T);
  const B = over(evalColor(bg, T), page);
  return ratio(over(evalColor(fg, T), B), B);
}
const hex = c => "#" + c.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, "0")).join("");

// ---------- the pairs ----------
// [what, fg, bg, size]. Seeded from the P123 axe-core sweep (7–8 Oct 2026):
// every failing group it found has its fixed pair here, plus the base text.
const COURSES = [
  // slug, accent as written in body[data-course=…] / curriculum.js
  ["stats-1", "var(--primary)"], ["stats-2", "var(--secondary)"], ["stats-3", "var(--success)"],
  ["methods", "#f59e0b"], ["data", "#06b6d4"], ["ethics", "#64748b"], ["ml", "#a855f7"], ["writing", "#84cc16"],
];
const PAIRS = [
  ["body text", "var(--text)", "var(--bg)", "normal"],
  ["body text on a card", "var(--text)", "var(--surface-2)", "normal"],
  ["lesson paragraph", "var(--text-muted)", "var(--surface)", "normal"],
  ["muted text on a soft panel", "var(--text-muted)", "var(--surface-2)", "normal"],
  ["faint text (captions, labels)", "var(--text-faint)", "var(--surface)", "normal"],
  ["faint text on a soft panel", "var(--text-faint)", "var(--surface-2)", "normal"],
  ["faint text on --bg-soft", "var(--text-faint)", "var(--bg-soft)", "normal"],
  ["prose link", "var(--link)", "var(--surface)", "normal"],
  ["prose link in a --surface-2 box (problems.html)", "var(--link)", "var(--surface-2)", "normal"],
  ["prose link in a key callout tint", "var(--link)", "color-mix(in srgb, var(--primary) 14%, var(--surface))", "normal"],
  ["prose link underline (the link cue, ui)", "var(--link-line)", "var(--surface)", "ui"],
  ["prose link underline on --surface-2", "var(--link-line)", "var(--surface-2)", "ui"],
  ["nav: active tab / Toolbox pill", "var(--primary-ink)", "color-mix(in srgb, var(--primary) 10%, var(--bg))", "normal"],
  ["Toolbox group headers", "var(--group-head)", "var(--surface)", "normal"],
  ["copied / done check", "var(--ok-ink)", "var(--surface)", "normal"],
  ["slider readout (.control .val)", "var(--primary-ink)", "var(--surface)", "normal"],
  ["glossary A–Z letter", "var(--primary-ink)", "var(--bg)", "normal"],
  ["button: white on --primary-strong", "#ffffff", "var(--primary-strong)", "normal"],
  ["button hover", "#ffffff", "color-mix(in srgb, var(--primary-strong) 90%, #000)", "normal"],
  ["SPSS/JASP active tab", "#ffffff", "var(--secondary-strong)", "normal"],
  ["R/Python active tab", "#ffffff", "var(--ok-strong)", "normal"],
  ["white on --bad-strong (wrong answer)", "#ffffff", "var(--bad-strong)", "normal"],
  ["white on --hl-strong (orange button)", "#ffffff", "var(--hl-strong)", "normal"],
  ["checks block numbering", "var(--violet-ink)", "var(--surface)", "normal"],
  ["green verdict on a soft panel", "var(--ok-ink)", "var(--surface-2)", "normal"],
  ["green verdict on a green tint", "var(--ok-ink)", "color-mix(in srgb, #22c55e 14%, var(--surface))", "normal"],
  ["red verdict", "var(--bad-ink)", "var(--surface)", "normal"],
  ["red text on a red tint (.bad cells)", "var(--bad-ink)", "color-mix(in srgb, #ef4444 20%, var(--surface))", "normal"],
  ["orange highlight text", "var(--hl-ink)", "var(--surface)", "normal"],
  ["orange highlight on a soft panel", "var(--hl-ink)", "var(--surface-2)", "normal"],
  ["chi-square heat cell: contribution", "var(--hl-ink)", "color-mix(in srgb, #f97316 24%, var(--surface))", "normal"],
  ["chi-square heat cell: expected count", "var(--text-muted)", "color-mix(in srgb, #f97316 24%, var(--surface))", "normal"],
  ["amber verdict", "var(--warn-ink)", "var(--surface)", "normal"],
  ["teal series label", "var(--secondary-ink)", "var(--surface)", "normal"],
  ["hero 'Touch' (large)", "color-mix(in srgb, var(--secondary) 70%, var(--text))", "color-mix(in srgb, var(--primary) 18%, var(--bg))", "large"],
  ["hero 'See' (large)", "var(--primary)", "color-mix(in srgb, var(--primary) 18%, var(--bg))", "large"],
  ["focus ring", "var(--primary)", "var(--bg)", "ui"],
];
for (const [slug, accent] of COURSES) {
  const ink = "var(--ink-" + slug + ")";
  PAIRS.push(
    [slug + ": eyebrow, prev/next, sidebar heading", ink, "var(--bg)", "normal"],
    [slug + ": homepage card title and § numbers", ink, `color-mix(in srgb, ${accent} 6%, var(--surface))`, "normal"],
    [slug + ": sidebar active lesson", ink, `color-mix(in srgb, ${accent} 13%, var(--bg))`, "normal"],
    [slug + ": table-of-contents number", ink, `color-mix(in srgb, ${accent} 12%, var(--surface))`, "normal"],
  );
}

// ---------- report ----------
const args = process.argv.slice(2);
const strict = args.includes("--strict"), onlyFails = args.includes("--fails");
const need = s => (s === "normal" ? 4.5 : 3);
let fails = 0;
const rows = PAIRS.map(([what, fg, bg, size]) => {
  const r = { what, size, need: need(size) };
  for (const [name, T] of [["light", LIGHT], ["dark", DARK]]) {
    try { r[name] = pair(fg, bg, T); r[name + "Fg"] = hex(evalColor(fg, T)); }
    catch (e) { r[name] = NaN; r.err = e.message; }
  }
  r.bad = !(r.light >= r.need) || !(r.dark >= r.need);
  if (r.bad) fails++;
  return r;
});
const f = x => (isFinite(x) ? x.toFixed(2) : " err").padStart(6);
console.log("contrast.js · " + PAIRS.length + " pairs · light | dark · minimum\n");
for (const r of rows) {
  if (onlyFails && !r.bad) continue;
  const mark = r.bad ? "✗" : " ";
  console.log(`${mark} ${f(r.light)} ${f(r.dark)}  ≥${r.need}  ${r.what}` + (r.err ? "  (" + r.err + ")" : ""));
}

// Why prose links carry an underline: the best a link color can do against
// the paragraph text it sits in, while still clearing 4.5:1 on the surface.
// WCAG 1.4.1 wants 3:1 from the surrounding text if color is the only cue.
function bestLinkGap(T) {
  const muted = over(evalColor("var(--text-muted)", T), evalColor("var(--surface)", T));
  const surf = evalColor("var(--surface)", T);
  const Ls = lum(surf), Lm = lum(muted);
  let best = 0;
  for (let i = 0; i <= 2000; i++) {
    const L = i / 2000;
    const toSurf = (Math.max(L, Ls) + .05) / (Math.min(L, Ls) + .05);
    if (toSurf < 4.5) continue;
    best = Math.max(best, (Math.max(L, Lm) + .05) / (Math.min(L, Lm) + .05));
  }
  return best;
}
console.log(`\nprose links: the best any color can sit from --text-muted while ≥4.5:1 on --surface is ` +
  `${bestLinkGap(LIGHT).toFixed(2)}:1 (light) and ${bestLinkGap(DARK).toFixed(2)}:1 (dark), under the 3:1 that ` +
  `color alone would need, so links are underlined.`);
console.log(`\n${fails ? fails + " pair" + (fails === 1 ? "" : "s") + " under the minimum" : "every pair clears its minimum"}.`);
if (strict && fails) process.exit(1);
