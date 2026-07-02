/* ============================================================
   Shared chrome for every page: theme toggle, homepage curriculum
   index, lesson sidebar, prev/next, search, and progress tracking —
   all generated from curriculum.js so there's one source of truth.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- base path ----------
     Lesson pages live two folders deep (/<course>/<slug>/), the homepage
     at the root. Using relative links keeps the whole site working no
     matter what the repo/folder is named or how deep it's hosted. */
  var BASE = (document.body && document.body.getAttribute("data-section")) ? "../../" : "";
  var HERE = document.body ? document.body.getAttribute("data-section") : null;

  /* ---------- mascot ---------- */
  function capy(size) {
    var s = size || 26;
    return '<svg viewBox="0 0 64 60" width="' + s + '" height="' + s + '" aria-hidden="true" style="vertical-align:-6px;flex-shrink:0">' +
      '<ellipse cx="19" cy="15" rx="7" ry="6" fill="#9a6f43"/><ellipse cx="45" cy="15" rx="7" ry="6" fill="#9a6f43"/>' +
      '<rect x="9" y="14" width="46" height="40" rx="17" fill="#b3824f"/>' +
      '<ellipse cx="32" cy="44" rx="16" ry="12" fill="#9a6f43"/>' +
      '<circle cx="23" cy="31" r="2.7" fill="#3a2a1b"/><circle cx="41" cy="31" r="2.7" fill="#3a2a1b"/>' +
      '<ellipse cx="26.5" cy="45" rx="2.3" ry="1.6" fill="#3a2a1b"/><ellipse cx="37.5" cy="45" rx="2.3" ry="1.6" fill="#3a2a1b"/>' +
      '</svg>';
  }

  /* ---------- theme ---------- */
  var root = document.documentElement;
  function setTheme(t) {
    if (t === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    try { localStorage.setItem("theme", t); } catch (e) {}
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.innerHTML = t === "dark" ? sun() : moon();
  }
  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }
  function moon() { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'; }
  function sun() { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>'; }
  function iconSearch() { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'; }
  function iconMenu() { return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'; }

  /* ============================================================
     PROGRESS (localStorage)  —  { slug: { v: visitedTs, d: doneBool } }
     ============================================================ */
  var PKEY = "sc-progress", LKEY = "sc-last";
  function loadProgress() { try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch (e) { return {}; } }
  function saveProgress(p) { try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch (e) {} }
  function markVisited(slug) {
    if (!slug) return;
    var p = loadProgress();
    if (!p[slug]) { p[slug] = { v: Date.now(), d: false }; saveProgress(p); }
  }
  function isDone(slug) { var p = loadProgress(); return !!(p[slug] && p[slug].d); }
  function isVisited(slug) { var p = loadProgress(); return !!p[slug]; }
  function setDone(slug, val) {
    var p = loadProgress();
    p[slug] = p[slug] || { v: Date.now() };
    p[slug].d = val; saveProgress(p);
  }
  function setLast(rec) { try { localStorage.setItem(LKEY, JSON.stringify(rec)); } catch (e) {} }
  function getLast() { try { return JSON.parse(localStorage.getItem(LKEY)); } catch (e) { return null; } }

  /* best "check your understanding" score per lesson — { slug: { c, t } } */
  var CKEY = "sc-checks";
  function loadCheckScores() { try { return JSON.parse(localStorage.getItem(CKEY)) || {}; } catch (e) { return {}; } }
  function saveCheckScore(slug, correct, total) {
    try {
      var all = loadCheckScores();
      if (!all[slug] || correct > all[slug].c) { all[slug] = { c: correct, t: total }; localStorage.setItem(CKEY, JSON.stringify(all)); }
    } catch (e) {}
  }

  /* ---------- top nav ---------- */
  function renderNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    nav.innerHTML =
      '<div class="nav-inner">' +
        '<a class="brand" href="' + (BASE || "./") + '" style="display:inline-flex;align-items:center;gap:.45rem">' + capy(28) + 'Stats<span class="dot">Capybara</span></a>' +
        '<nav class="nav-links" id="nav-links" aria-label="Primary">' +
          '<a class="nav-link" href="' + BASE + '#curriculum">Curriculum</a>' +
          '<a class="nav-link" href="' + BASE + 'which-test.html">Which test?</a>' +
          '<a class="nav-link" href="' + BASE + 'tables.html">Tables</a>' +
          '<a class="nav-link" href="' + BASE + 'formulas.html">Formulas</a>' +
          '<a class="nav-link" href="' + BASE + 'quiz.html">Quiz</a>' +
          '<a class="nav-link" href="' + BASE + 'glossary.html">Glossary</a>' +
          '<a class="nav-link" href="' + BASE + '#about">About</a>' +
        '</nav>' +
        '<div class="nav-actions">' +
          '<a class="nav-kofi" href="https://ko-fi.com/M3E322A3ML" target="_blank" rel="noopener" title="Support StatsCapybara on Ko-fi">☕<span>Buy me a coffee</span></a>' +
          '<button id="nav-search" class="icon-btn" aria-label="Search lessons (press /)">' + iconSearch() + '</button>' +
          '<button id="theme-toggle" class="icon-btn" aria-label="Toggle theme"></button>' +
          '<button id="nav-toggle" class="icon-btn nav-toggle" aria-label="Menu" aria-controls="nav-links" aria-expanded="false">' + iconMenu() + '</button>' +
        '</div>' +
      '</div>';

    var btn = document.getElementById("theme-toggle");
    btn.innerHTML = currentTheme() === "dark" ? sun() : moon();
    btn.addEventListener("click", function () { setTheme(currentTheme() === "dark" ? "light" : "dark"); });

    document.getElementById("nav-search").addEventListener("click", openSearch);

    var tog = document.getElementById("nav-toggle");
    tog.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      tog.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // close the mobile menu after tapping a link
    document.getElementById("nav-links").addEventListener("click", function (e) {
      if (e.target.closest("a")) { document.body.classList.remove("nav-open"); tog.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- progress ring (SVG) for homepage cards ---------- */
  function ring(frac, accent) {
    var r = 20, c = 2 * Math.PI * r, off = c * (1 - frac), pct = Math.round(frac * 100);
    return '<span class="ring" title="' + pct + '% explored" style="--accent:' + accent + '">' +
      '<svg width="48" height="48" viewBox="0 0 48 48">' +
        '<circle class="ring-track" cx="24" cy="24" r="' + r + '" fill="none" stroke-width="4.5"/>' +
        '<circle class="ring-fill" cx="24" cy="24" r="' + r + '" fill="none" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
      '</svg><span class="ring-label">' + pct + '%</span></span>';
  }

  /* ---------- homepage curriculum grid ---------- */
  function renderCurriculum() {
    var host = document.getElementById("curriculum-grid");
    if (!host) return;
    host.innerHTML = window.CURRICULUM.map(function (c) {
      var ready = c.sections.filter(function (s) { return s.ready; });
      var visited = ready.filter(function (s) { return isVisited(s.slug); }).length;
      var frac = ready.length ? visited / ready.length : 0;
      var items = c.sections.map(function (s) {
        var state = isDone(s.slug) ? " done" : (isVisited(s.slug) ? " visited" : "");
        var inner =
          '<span class="sec-dot"></span>' +
          '<span><span class="sec-num">' + s.n + '</span>' + s.title + '</span>' +
          '<span class="sec-check" aria-hidden="true">✓</span>';
        return s.ready
          ? '<li><a class="' + state.trim() + '" href="' + BASE + c.slug + '/' + s.slug + '/">' + inner + '</a></li>'
          : '<li><a style="cursor:default;opacity:.65" title="Coming soon">' +
              '<span class="sec-dot"></span><span><span class="sec-num">' + s.n + '</span>' + s.title + '</span>' +
              '<span style="margin-left:auto;font-size:.68rem;color:var(--text-faint)">soon</span></a></li>';
      }).join("");
      return (
        '<div class="course-card" style="--accent:' + c.accent + '">' +
          '<div class="ch">' + ring(frac, c.accent) +
            '<span class="ch-text"><h3>' + c.title + '</h3><span>' + c.subtitle + '</span></span>' +
          '</div>' +
          '<ul>' + items + '</ul>' +
        '</div>'
      );
    }).join("");
  }

  /* ---------- resume banner (homepage) ---------- */
  function renderResume() {
    var grid = document.getElementById("curriculum-grid");
    if (!grid) return;
    var last = getLast();
    if (!last || isDone(last.slug)) {
      // if the very last lesson was finished, point at the next unexplored one instead
      last = firstUnexplored() || last;
      if (!last) return;
    }
    var bar = document.createElement("div");
    bar.className = "resume-bar";
    bar.innerHTML =
      capy(34) +
      '<span class="rb-text">Pick up where you left off — <strong>' + last.n + ' ' + last.title + '</strong></span>' +
      '<a class="btn btn-primary btn-sm" href="' + BASE + last.course + '/' + last.slug + '/">Resume →</a>';
    grid.parentNode.insertBefore(bar, grid);
  }
  function firstUnexplored() {
    var flat = window.CURRICULUM_FLAT;
    for (var i = 0; i < flat.length; i++) { if (flat[i].ready && !isVisited(flat[i].slug)) return flat[i]; }
    return null;
  }

  /* ---------- lesson sidebar ----------
     Each course is a collapsible <details> group; only the course
     containing the current lesson starts open, so the list never
     feels like a wall (especially on mobile). */
  function renderSidebar() {
    var host = document.getElementById("sidebar");
    if (!host) return;
    var chev = '<svg class="chev" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>';
    var html = window.CURRICULUM.map(function (c) {
      var isCurrent = c.sections.some(function (s) { return s.slug === HERE; });
      var doneN = c.sections.filter(function (s) { return isDone(s.slug); }).length;
      var links = c.sections.map(function (s) {
        var cls = (s.slug === HERE ? "active" : "") + (isDone(s.slug) ? " done" : "");
        var tick = isDone(s.slug) ? '<span class="tick" aria-hidden="true">✓</span>' : "";
        var label = '<span class="n">' + s.n + '</span>' + s.title + tick;
        if (s.ready || s.slug === HERE) {
          return '<a class="' + cls.trim() + '" href="' + BASE + c.slug + '/' + s.slug + '/">' + label + '</a>';
        }
        return '<a style="cursor:default;opacity:.55" title="Coming soon">' + label + '</a>';
      }).join("");
      return '<details class="sb-group"' + (isCurrent ? " open" : "") + ' style="--sb-accent:' + c.accent + '">' +
        '<summary>' + c.title +
          '<span class="sb-count">' + (doneN ? doneN + "/" + c.sections.length : c.sections.length) + '</span>' + chev +
        '</summary>' +
        '<div class="sb-links">' + links + '</div>' +
      '</details>';
    }).join("");
    html += '<div class="sb-capy">' + capy(30) + '<span>No rush — capybaras never cram.</span></div>';
    host.innerHTML = '<div class="sidebar-sticky">' + html + '</div>';
  }

  /* ---------- prev / next ---------- */
  function renderLessonNav() {
    var host = document.getElementById("lesson-nav");
    if (!host) return;
    var flat = window.CURRICULUM_FLAT;
    var i = flat.findIndex(function (s) { return s.slug === HERE; });
    if (i < 0) return;
    var prev = flat[i - 1], next = flat[i + 1];
    var html = "";
    var arrowL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
    var arrowR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
    if (prev) {
      html += '<a class="prev" href="' + BASE + prev.course + '/' + prev.slug + '/">' + arrowL +
        '<span><span class="lbl">Previous</span>' + prev.n + ' ' + prev.title + '</span></a>';
    }
    if (next) {
      html += '<a class="next" href="' + BASE + next.course + '/' + next.slug + '/">' +
        '<span><span class="lbl">Next</span>' + next.n + ' ' + next.title + '</span>' + arrowR + '</a>';
    }
    host.innerHTML = html;
  }

  /* ---------- "mark complete" toggle (lesson pages) ---------- */
  function renderLessonDone() {
    if (!HERE) return;
    var lessonNav = document.getElementById("lesson-nav");
    var article = lessonNav ? lessonNav.parentNode : document.querySelector(".lesson");
    if (!article) return;
    var wrap = document.createElement("div");
    wrap.className = "lesson-progress-head";
    var flat = window.CURRICULUM_FLAT, cur = flat.find(function (s) { return s.slug === HERE; });
    wrap.innerHTML = '<span style="color:var(--text-faint);font-size:.85rem">' + (cur ? cur.n : "") + '</span>';
    var btn = document.createElement("button");
    btn.className = "lesson-done" + (isDone(HERE) ? " done" : "");
    btn.type = "button";
    function paint() {
      var done = isDone(HERE);
      btn.className = "lesson-done" + (done ? " done" : "");
      btn.innerHTML = '<span class="box">' + (done ? "✓" : "") + '</span>' + (done ? "Completed" : "Mark as complete");
    }
    btn.addEventListener("click", function () { setDone(HERE, !isDone(HERE)); paint(); });
    paint();
    wrap.appendChild(btn);
    // place just above the prev/next nav
    if (lessonNav) article.insertBefore(wrap, lessonNav);
    else article.appendChild(wrap);
  }

  /* ---------- "On this page" mini-TOC (longer lessons only) ---------- */
  function renderTOC() {
    if (!HERE) return;
    var art = document.querySelector(".lesson");
    if (!art) return;
    var hs = art.querySelectorAll("h2");
    if (hs.length < 4) return;
    var used = {};
    var items = Array.prototype.map.call(hs, function (h) {
      var id = h.id || h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      while (used[id]) id += "-x";
      used[id] = 1; h.id = id;
      return '<a href="#' + id + '">' + h.textContent + '</a>';
    }).join("");
    var box = document.createElement("nav");
    box.className = "lesson-toc";
    box.setAttribute("aria-label", "On this page");
    box.innerHTML = '<span class="toc-label">On this page</span>' + items;
    var lede = art.querySelector(".lede");
    if (lede) lede.parentNode.insertBefore(box, lede.nextSibling);
  }

  /* ---------- "Try it yourself" R / Python snippets ----------
     Snippet data lives in assets/js/snippets.js, loaded lazily so
     non-lesson pages never pay for it. */
  function renderTryCode() {
    if (!HERE) return;
    var s = document.createElement("script");
    s.src = BASE + "assets/js/snippets.js";
    s.async = true;
    s.onload = function () {
      var sn = window.SNIPPETS && window.SNIPPETS[HERE];
      if (!sn) return;
      var nav = document.getElementById("lesson-nav");
      var host = nav ? nav.parentNode : document.querySelector(".lesson");
      if (!host) return;
      var box = document.createElement("div");
      box.className = "try-code";
      box.innerHTML =
        '<div class="tc-head"><span class="tc-title">💻 Try it yourself</span>' +
          '<span class="seg"><button class="active" data-lang="r">R</button><button data-lang="py">Python</button></span>' +
          '<button class="tc-copy" type="button">Copy</button></div>' +
        '<pre><code></code></pre>';
      var code = box.querySelector("code"), lang = "r";
      function show() { code.textContent = sn[lang]; }
      Array.prototype.forEach.call(box.querySelectorAll("[data-lang]"), function (b) {
        b.addEventListener("click", function () {
          lang = b.getAttribute("data-lang");
          Array.prototype.forEach.call(box.querySelectorAll("[data-lang]"), function (b2) {
            b2.className = b2 === b ? "active" : "";
          });
          show();
        });
      });
      var copyBtn = box.querySelector(".tc-copy");
      copyBtn.addEventListener("click", function () {
        try {
          navigator.clipboard.writeText(sn[lang]).then(function () {
            copyBtn.textContent = "Copied!";
            setTimeout(function () { copyBtn.textContent = "Copy"; }, 1200);
          });
        } catch (e) {}
      });
      show();
      var anchor = document.querySelector(".apa-report") || document.querySelector(".lesson-progress-head") || nav;
      host.insertBefore(box, anchor);
    };
    document.body.appendChild(s);
  }

  /* ---------- "Run it in SPSS / JASP" + "Write it up (APA 7)" ----------
     Data lives in assets/js/software.js, loaded lazily like the snippets.
     Final on-page order (whichever async script lands first):
     checks → SPSS/JASP → R/Python → APA → progress head. */
  function renderSoftware() {
    if (!HERE) return;
    var s = document.createElement("script");
    s.src = BASE + "assets/js/software.js";
    s.async = true;
    s.onload = function () {
      var sw = window.SOFTWARE && window.SOFTWARE[HERE];
      if (!sw) return;
      var nav = document.getElementById("lesson-nav");
      var host = nav ? nav.parentNode : document.querySelector(".lesson");
      if (!host) return;

      if (sw.spss || sw.jasp) {
        var box = document.createElement("section");
        box.className = "software";
        box.setAttribute("aria-label", "Run this analysis in SPSS or JASP");
        box.innerHTML =
          '<div class="sw-head"><span class="sw-title">🖱️ Run it in SPSS / JASP</span>' +
            '<span class="seg"><button type="button" class="active" data-app="spss">SPSS</button><button type="button" data-app="jasp">JASP</button></span></div>' +
          '<ol class="sw-steps"></ol>';
        var list = box.querySelector(".sw-steps"), app = "spss";
        var showSteps = function () {
          list.innerHTML = (sw[app] || []).map(function (step) { return "<li>" + step + "</li>"; }).join("");
        };
        Array.prototype.forEach.call(box.querySelectorAll("[data-app]"), function (b) {
          b.addEventListener("click", function () {
            app = b.getAttribute("data-app");
            Array.prototype.forEach.call(box.querySelectorAll("[data-app]"), function (b2) { b2.className = b2 === b ? "active" : ""; });
            showSteps();
          });
        });
        showSteps();
        var anchor1 = host.querySelector(".try-code") || document.querySelector(".apa-report") || document.querySelector(".lesson-progress-head") || nav;
        host.insertBefore(box, anchor1);
      }

      if (sw.apa) {
        var apa = document.createElement("section");
        apa.className = "apa-report";
        apa.setAttribute("aria-label", "How to report this analysis in APA style");
        apa.innerHTML =
          '<div class="sw-head"><span class="sw-title">📝 Write it up (APA 7)</span></div>' +
          '<p class="apa-label">Example results paragraph:</p>' +
          '<blockquote class="apa-quote">' + sw.apa + '</blockquote>' +
          (sw.tips && sw.tips.length ? '<ul class="apa-tips">' + sw.tips.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul>" : "");
        var anchor2 = document.querySelector(".lesson-progress-head") || nav;
        host.insertBefore(apa, anchor2);
      }
    };
    document.body.appendChild(s);
  }

  /* ---------- "Check your understanding" (lesson pages) ----------
     Question data lives in assets/js/checks.js, loaded lazily like
     the code snippets. Injected above the "Try it yourself" block
     (or the progress head if snippets haven't landed yet). */
  function renderChecks() {
    if (!HERE) return;
    var s = document.createElement("script");
    s.src = BASE + "assets/js/checks.js";
    s.async = true;
    s.onload = function () {
      var qs = window.CHECKS && window.CHECKS[HERE];
      if (!qs || !qs.length) return;
      var nav = document.getElementById("lesson-nav");
      var host = nav ? nav.parentNode : document.querySelector(".lesson");
      if (!host) return;
      var box = document.createElement("section");
      box.className = "checks";
      box.setAttribute("aria-label", "Check your understanding");
      var answered = 0, correct = 0;
      var head = document.createElement("div");
      head.className = "ck-head";
      head.innerHTML = '<span class="ck-title">🧠 Check your understanding</span><span class="ck-score" aria-live="polite"></span>';
      box.appendChild(head);
      var scoreEl = head.querySelector(".ck-score");
      var prev = loadCheckScores()[HERE];
      if (prev) scoreEl.textContent = "best so far: " + prev.c + " / " + prev.t;
      qs.forEach(function (item, qi) {
        var card = document.createElement("div");
        card.className = "ck-q";
        var p = document.createElement("p");
        p.className = "ck-text";
        p.textContent = (qi + 1) + ". " + item.q;
        card.appendChild(p);
        var opts = document.createElement("div");
        opts.className = "ck-opts";
        var fb = document.createElement("p");
        fb.className = "ck-fb";
        var done = false;
        item.o.forEach(function (text, i) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "ck-opt";
          b.textContent = text;
          b.addEventListener("click", function () {
            if (done) return;
            done = true; answered++;
            var btns = opts.querySelectorAll("button");
            Array.prototype.forEach.call(btns, function (b2, j) {
              b2.disabled = true;
              if (j === item.a) b2.classList.add("right");
            });
            if (i === item.a) { correct++; fb.innerHTML = '<strong class="ok">Correct.</strong> ' + item.why; }
            else { b.classList.add("wrong"); fb.innerHTML = '<strong class="no">Not quite.</strong> ' + item.why; }
            scoreEl.textContent = correct + " / " + qs.length;
            if (answered === qs.length) {
              scoreEl.textContent = correct + " / " + qs.length + (correct === qs.length ? " — nailed it!" : "");
              saveCheckScore(HERE, correct, qs.length);
              if (correct === qs.length && !isDone(HERE)) {
                var doneBtn = document.createElement("button");
                doneBtn.type = "button";
                doneBtn.className = "btn btn-primary btn-sm";
                doneBtn.style.margin = ".35rem 1.1rem  1rem";
                doneBtn.textContent = "✓ Mark this lesson complete";
                doneBtn.addEventListener("click", function () {
                  var toggle = document.querySelector(".lesson-done");
                  if (toggle && !isDone(HERE)) toggle.click();
                  doneBtn.remove();
                });
                box.appendChild(doneBtn);
              }
            }
          });
          opts.appendChild(b);
        });
        card.appendChild(opts);
        card.appendChild(fb);
        box.appendChild(card);
      });
      // keep the order: prose → checks → SPSS/JASP → try-code → APA → progress head
      var anchor = document.querySelector(".software") || host.querySelector(".try-code") ||
                   document.querySelector(".apa-report") || document.querySelector(".lesson-progress-head") || nav;
      host.insertBefore(box, anchor);
    };
    document.body.appendChild(s);
  }

  /* ---------- ← / → jump to the previous / next lesson ---------- */
  function wireLessonKeys() {
    if (!HERE) return;
    var flat = window.CURRICULUM_FLAT;
    var i = flat.findIndex(function (s) { return s.slug === HERE; });
    if (i < 0) return;
    document.addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      var el = document.activeElement;
      if (el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)) return;
      if (searchEl && searchEl.classList.contains("open")) return;
      var to = null;
      if (e.key === "ArrowLeft" && flat[i - 1]) to = flat[i - 1];
      else if (e.key === "ArrowRight" && flat[i + 1] && flat[i + 1].ready) to = flat[i + 1];
      if (to) window.location.href = BASE + to.course + "/" + to.slug + "/";
    });
  }

  /* ============================================================
     SEARCH OVERLAY
     ============================================================ */
  var searchEl = null, searchInput = null, searchResults = null, searchIdx = 0, searchMatches = [];
  function buildSearch() {
    if (searchEl) return;
    searchEl = document.createElement("div");
    searchEl.className = "search-overlay";
    searchEl.innerHTML =
      '<div class="search-panel" role="dialog" aria-label="Search lessons">' +
        '<input type="text" id="search-input" placeholder="Search lessons…" autocomplete="off" aria-label="Search lessons" />' +
        '<ul class="search-results" id="search-results"></ul>' +
        '<div class="search-hint"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>' +
      '</div>';
    document.body.appendChild(searchEl);
    searchInput = searchEl.querySelector("#search-input");
    searchResults = searchEl.querySelector("#search-results");
    searchEl.addEventListener("click", function (e) { if (e.target === searchEl) closeSearch(); });
    searchInput.addEventListener("input", runSearch);
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") { e.preventDefault(); go(); }
      else if (e.key === "Escape") { closeSearch(); }
    });
  }
  /* full-text index (assets/js/search-index.js) — fetched once, the first
     time the overlay opens, so normal page loads never pay for it */
  var indexRequested = false;
  function loadSearchIndex() {
    if (indexRequested || window.SEARCH_INDEX) return;
    indexRequested = true;
    var s = document.createElement("script");
    s.src = BASE + "assets/js/search-index.js";
    s.async = true;
    s.onload = function () { if (searchEl && searchEl.classList.contains("open")) runSearch(); };
    document.body.appendChild(s);
  }
  function openSearch() { buildSearch(); loadSearchIndex(); searchEl.classList.add("open"); searchInput.value = ""; runSearch(); searchInput.focus(); }
  function closeSearch() { if (searchEl) searchEl.classList.remove("open"); }
  // site pages surfaced alongside lessons in the search overlay
  var SEARCH_PAGES = [
    { title: "Which Test Should I Use?", url: "which-test.html", tag: "Tool", kw: "chooser decision anova t-test regression choose" },
    { title: "Statistical Tables & Calculators", url: "tables.html", tag: "Tool", kw: "z t chi-square f critical value p-value calculator table" },
    { title: "Statistics Formula Sheet", url: "formulas.html", tag: "Reference", kw: "formula cheat sheet equations print reference" },
    { title: "Distribution Playground", url: "distributions.html", tag: "Tool", kw: "normal binomial poisson beta exponential uniform pdf explore distribution" },
    { title: "Course Quiz", url: "quiz.html", tag: "Practice", kw: "test yourself questions practice" },
    { title: "Statistics Glossary", url: "glossary.html", tag: "Reference", kw: "terms definitions dictionary" }
  ];
  function escHtml(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  /* a short excerpt around the first occurrence of q, with the match <mark>ed */
  function snippetFor(txt, q) {
    var at = txt.toLowerCase().indexOf(q);
    if (at < 0) return null;
    var from = Math.max(0, at - 36), to = Math.min(txt.length, at + q.length + 72);
    return (from > 0 ? "…" : "") +
      escHtml(txt.slice(from, at)) + "<mark>" + escHtml(txt.slice(at, at + q.length)) + "</mark>" +
      escHtml(txt.slice(at + q.length, to)) + (to < txt.length ? "…" : "");
  }
  function runSearch() {
    var q = searchInput.value.trim().toLowerCase();
    var flat = window.CURRICULUM_FLAT.filter(function (s) { return s.ready; });
    var lessons = flat.filter(function (s) {
      return !q || (s.title.toLowerCase().indexOf(q) >= 0 || s.n.indexOf(q) >= 0 || s.courseTitle.toLowerCase().indexOf(q) >= 0);
    });
    var pages = SEARCH_PAGES.filter(function (p) {
      return !q || p.title.toLowerCase().indexOf(q) >= 0 || p.kw.indexOf(q) >= 0;
    }).map(function (p) { return { page: true, title: p.title, url: p.url, tag: p.tag }; });

    /* full-text pass: lessons/pages whose BODY mentions the query but whose
       title didn't already match — shown below title matches, with a snippet */
    var deep = [];
    if (q.length >= 3 && window.SEARCH_INDEX) {
      var seen = {};
      lessons.forEach(function (s) { seen[s.slug] = 1; });
      pages.forEach(function (p) { seen[p.url] = 1; });
      flat.forEach(function (s) {
        if (seen[s.slug]) return;
        var txt = window.SEARCH_INDEX.lessons[s.slug];
        if (!txt) return;
        var sn = snippetFor(txt, q);
        if (sn) deep.push({ course: s.course, slug: s.slug, n: s.n, title: s.title, courseTitle: s.courseTitle, snip: sn });
      });
      (window.SEARCH_INDEX.pages || []).forEach(function (p) {
        if (seen[p.u]) return;
        var meta = null;
        for (var i = 0; i < SEARCH_PAGES.length; i++) if (SEARCH_PAGES[i].url === p.u) meta = SEARCH_PAGES[i];
        var sn = snippetFor(p.txt, q);
        if (meta && sn) deep.push({ page: true, title: meta.title, url: meta.url, tag: meta.tag, snip: sn });
      });
    }

    searchMatches = pages.concat(lessons).concat(deep).slice(0, 40);
    searchIdx = 0;
    if (!searchMatches.length) {
      searchResults.innerHTML = '<li class="search-empty">' + capy(30) +
        '<span>No matches for “' + escHtml(q) + '” — the capybara looked everywhere. Try a shorter word?</span></li>';
      return;
    }
    searchResults.innerHTML = searchMatches.map(function (s, i) {
      var href = s.page ? BASE + s.url : BASE + s.course + "/" + s.slug + "/";
      return '<li><a class="' + (i === 0 ? "active" : "") + '" href="' + href + '">' +
        '<span class="n">' + (s.page ? "→" : s.n) + '</span><span>' + s.title +
        (s.snip ? '<small class="snip">' + s.snip + '</small>' : '') + '</span>' +
        '<span class="course-tag">' + (s.page ? s.tag : s.courseTitle) + '</span></a></li>';
    }).join("");
    Array.prototype.forEach.call(searchResults.querySelectorAll("a"), function (a, i) {
      a.addEventListener("mousemove", function () { setActive(i); });
    });
  }
  function setActive(i) {
    searchIdx = i;
    var as = searchResults.querySelectorAll("a");
    Array.prototype.forEach.call(as, function (a, j) { a.classList.toggle("active", j === i); });
  }
  function move(d) {
    if (!searchMatches.length) return;
    var i = (searchIdx + d + searchMatches.length) % searchMatches.length;
    setActive(i);
    var a = searchResults.querySelectorAll("a")[i];
    if (a) a.scrollIntoView({ block: "nearest" });
  }
  function go() {
    var a = searchResults.querySelectorAll("a")[searchIdx];
    if (a) window.location.href = a.getAttribute("href");
  }
  function wireSearchShortcuts() {
    document.addEventListener("keydown", function (e) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName) || (document.activeElement && document.activeElement.isContentEditable);
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); openSearch(); }
      else if (e.key === "/" && !typing) { e.preventDefault(); openSearch(); }
    });
  }

  /* ---------- "Buy me a coffee" (every page) ---------- */
  function renderKofi() {
    var c = document.querySelector(".footer .container");
    if (!c || c.querySelector(".kofi")) return;
    var a = document.createElement("a");
    a.className = "kofi"; a.href = "https://ko-fi.com/M3E322A3ML"; a.target = "_blank"; a.rel = "noopener";
    a.style.cssText = "display:inline-flex;align-items:center;order:2";
    a.innerHTML = '<img height="34" loading="lazy" style="border:0;height:34px" src="https://storage.ko-fi.com/cdn/kofi2.png?v=6" alt="Buy Me a Coffee at ko-fi.com" />';
    c.insertBefore(a, c.lastElementChild);
  }

  /* a small capybara next to the copyright line, on every page */
  function renderFooterCapy() {
    var c = document.querySelector(".footer .container");
    if (!c || c.querySelector(".footer-capy")) return;
    var first = c.firstElementChild;
    if (first) first.innerHTML = '<span class="footer-capy" aria-hidden="true">' + capy(22) + '</span>' + first.innerHTML;
  }

  /* ============================================================
     ACCESSIBILITY + HEAD extras (injected once, so all 40 pages
     get them without editing every file)
     ============================================================ */
  function injectA11y() {
    // skip link
    if (!document.querySelector(".skip-link")) {
      var main = document.querySelector("main");
      if (main) {
        if (!main.id) main.id = "main-content";
        var sk = document.createElement("a");
        sk.className = "skip-link"; sk.href = "#" + main.id; sk.textContent = "Skip to content";
        document.body.insertBefore(sk, document.body.firstChild);
      }
    }
    // label every interactive canvas for screen readers
    Array.prototype.forEach.call(document.querySelectorAll(".viz canvas"), function (cv) {
      if (cv.getAttribute("aria-label") || cv.getAttribute("role")) return;
      var viz = cv.closest(".viz"), title = viz && viz.querySelector(".viz-title");
      cv.setAttribute("role", "img");
      cv.setAttribute("aria-label", (title ? title.textContent.replace(/^[^\w]+/, "").trim() : "Interactive statistics visualization") + " — interactive chart");
    });
  }
  function injectHead() {
    var head = document.head;
    function link(attrs) {
      var l = document.createElement("link");
      Object.keys(attrs).forEach(function (k) { l.setAttribute(k, attrs[k]); });
      head.appendChild(l);
    }
    if (!head.querySelector('link[rel="icon"][type="image/svg+xml"]'))
      link({ rel: "icon", type: "image/svg+xml", href: BASE + "assets/favicon.svg" });
    if (!head.querySelector('link[rel="apple-touch-icon"]'))
      link({ rel: "apple-touch-icon", href: BASE + "assets/icon-180.png" });
    if (!head.querySelector('link[rel="manifest"]'))
      link({ rel: "manifest", href: BASE + "site.webmanifest" });
    if (!head.querySelector('meta[name="theme-color"]')) {
      var m = document.createElement("meta"); m.name = "theme-color"; m.content = "#6366f1"; head.appendChild(m);
    }
  }

  /* ---------- go ---------- */
  function init() {
    injectHead();
    injectA11y();
    renderNav();
    renderCurriculum();
    renderResume();
    renderSidebar();
    renderLessonNav();
    renderLessonDone();
    renderTOC();
    renderTryCode();
    renderChecks();
    renderSoftware();
    renderKofi();
    renderFooterCapy();
    wireSearchShortcuts();
    wireLessonKeys();
    // ?q=… deep link (also the target of the sitewide SearchAction schema)
    var qm = /[?&]q=([^&]+)/.exec(window.location.search);
    if (qm) {
      openSearch();
      searchInput.value = decodeURIComponent(qm[1].replace(/\+/g, " "));
      runSearch();
    }
    // record this lesson as visited + the resume anchor
    if (HERE) {
      markVisited(HERE);
      var cur = window.CURRICULUM_FLAT.find(function (s) { return s.slug === HERE; });
      if (cur) setLast({ course: cur.course, slug: cur.slug, n: cur.n, title: cur.title });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
