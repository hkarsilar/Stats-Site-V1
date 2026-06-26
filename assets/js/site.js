/* ============================================================
   Shared chrome for every page: theme toggle, homepage curriculum
   index, lesson sidebar, and prev/next — all generated from
   curriculum.js so there's one source of truth.
   ============================================================ */
(function () {
  "use strict";

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
        '<a class="brand" href="/">hakan<span class="dot">.</span>science</a>' +
        '<div class="nav-links">' +
          '<a class="nav-link hide-mobile" href="/#curriculum">Curriculum</a>' +
          '<a class="nav-link hide-mobile" href="/#about">About</a>' +
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
          ? '<li><a href="/' + c.slug + '/' + s.slug + '/">' + inner + '</a></li>'
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
          return '<a class="' + cls + '" href="/' + c.slug + '/' + s.slug + '/">' + label + '</a>';
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
      html += '<a class="prev" href="/' + prev.course + '/' + prev.slug + '/">' + arrowL +
        '<span><span class="lbl">Previous</span>' + prev.n + ' ' + prev.title + '</span></a>';
    }
    if (next) {
      html += '<a class="next" href="/' + next.course + '/' + next.slug + '/">' +
        '<span><span class="lbl">Next</span>' + next.n + ' ' + next.title + '</span>' + arrowR + '</a>';
    }
    host.innerHTML = html;
  }

  /* ---------- go ---------- */
  function init() {
    renderNav();
    renderCurriculum();
    renderSidebar();
    renderLessonNav();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
