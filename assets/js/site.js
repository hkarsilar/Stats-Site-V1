/* ============================================================
   Shared chrome for every page: theme toggle, homepage curriculum
   index, lesson sidebar, and prev/next — all generated from
   curriculum.js so there's one source of truth.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- base path ----------
     Lesson pages live two folders deep (/<course>/<slug>/), the homepage
     at the root. Using relative links keeps the whole site working no
     matter what the repo/folder is named or how deep it's hosted. */
  var BASE = (document.body && document.body.getAttribute("data-section")) ? "../../" : "";

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

  /* ---------- top nav ---------- */
  function renderNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    nav.innerHTML =
      '<div class="nav-inner">' +
        '<a class="brand" href="' + (BASE || "./") + '" style="display:inline-flex;align-items:center;gap:.45rem">' + capy(28) + 'Stats<span class="dot">Capybara</span></a>' +
        '<div class="nav-links">' +
          '<a class="nav-link hide-mobile" href="' + BASE + '#curriculum">Curriculum</a>' +
          '<a class="nav-link" href="' + BASE + 'quiz.html">Quiz</a>' +
          '<a class="nav-link hide-mobile" href="' + BASE + '#about">About</a>' +
          '<button id="theme-toggle" class="icon-btn" aria-label="Toggle theme"></button>' +
        '</div>' +
      '</div>';
    var btn = document.getElementById("theme-toggle");
    btn.innerHTML = currentTheme() === "dark" ? sun() : moon();
    btn.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  }

  /* ---------- homepage curriculum grid ---------- */
  function renderCurriculum() {
    var host = document.getElementById("curriculum-grid");
    if (!host) return;
    host.innerHTML = window.CURRICULUM.map(function (c) {
      var items = c.sections.map(function (s) {
        var inner =
          '<span class="sec-dot"></span>' +
          '<span><span class="sec-num">' + s.n + '</span>' + s.title + '</span>';
        return s.ready
          ? '<li><a href="' + BASE + c.slug + '/' + s.slug + '/">' + inner + '</a></li>'
          : '<li><a style="cursor:default;opacity:.65" title="Coming soon">' + inner +
              '<span style="margin-left:auto;font-size:.68rem;color:var(--text-faint)">soon</span></a></li>';
      }).join("");
      return (
        '<div class="course-card" style="--accent:' + c.accent + '">' +
          '<div class="ch"><h3>' + c.title + '</h3><span>' + c.subtitle + '</span></div>' +
          '<ul>' + items + '</ul>' +
        '</div>'
      );
    }).join("");
  }

  /* ---------- lesson sidebar ---------- */
  function renderSidebar() {
    var host = document.getElementById("sidebar");
    if (!host) return;
    var here = document.body.getAttribute("data-section");
    var html = window.CURRICULUM.map(function (c) {
      var links = c.sections.map(function (s) {
        var cls = s.slug === here ? "active" : "";
        var label = '<span class="n">' + s.n + '</span>' + s.title;
        if (s.ready || s.slug === here) {
          return '<a class="' + cls + '" href="' + BASE + c.slug + '/' + s.slug + '/">' + label + '</a>';
        }
        return '<a style="cursor:default;opacity:.55" title="Coming soon">' + label + '</a>';
      }).join("");
      return '<h4>' + c.title + '</h4>' + links;
    }).join("");
    host.innerHTML = '<div class="sidebar-sticky">' + html + '</div>';
  }

  /* ---------- prev / next ---------- */
  function renderLessonNav() {
    var host = document.getElementById("lesson-nav");
    if (!host) return;
    var here = document.body.getAttribute("data-section");
    var flat = window.CURRICULUM_FLAT;
    var i = flat.findIndex(function (s) { return s.slug === here; });
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

  /* ---------- "Buy me a coffee" (every page) ---------- */
  function renderKofi() {
    var c = document.querySelector(".footer .container");
    if (!c || c.querySelector(".kofi")) return;
    var a = document.createElement("a");
    a.className = "kofi"; a.href = "https://ko-fi.com/M3E322A3ML"; a.target = "_blank"; a.rel = "noopener";
    a.style.cssText = "display:inline-flex;align-items:center;order:2";
    a.innerHTML = '<img height="34" loading="lazy" style="border:0;height:34px" src="https://storage.ko-fi.com/cdn/kofi2.png?v=6" alt="Buy Me a Coffee at ko-fi.com" />';
    // keep it centered between the two footer spans
    c.insertBefore(a, c.lastElementChild);
  }

  /* ---------- go ---------- */
  function init() {
    renderNav();
    renderCurriculum();
    renderSidebar();
    renderLessonNav();
    renderKofi();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
