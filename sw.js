/* ============================================================
   StatsCapybara — service worker
   Makes the site installable and usable offline once visited,
   WITHOUT ever serving a stale lesson while the reader is online.

   Strategy:
     • App shell (CSS / shared JS / font / icons / offline page) is
       precached on install so the chrome always works offline.
     • /assets/…  → CACHE-FIRST (styles, scripts, fonts, images are
       effectively immutable at a given URL; a content change ships a
       new deploy + a bumped CACHE_VERSION, which wipes the old cache).
     • HTML navigations → NETWORK-FIRST: an online reader always gets
       the freshest page; the cached copy is only a fallback for when
       the network is gone. Uncached pages fall back to offline.html.

   Paths are RELATIVE to this file's location (the site root), so the
   worker resolves correctly whether the site is served from the domain
   root (statscapybara.com/) or a project subpath (…/Stats-Site-V1/).

   ---- CACHE_VERSION bump policy ----
   Bump CACHE_VERSION on every deploy that changes ANY precached shell
   asset (styles.css, site.js, curriculum.js, viz.js, the font, an icon,
   or offline.html). Bumping it renames the cache, so install repopulates
   and activate deletes the previous cache. HTML is network-first, so a
   bump is NOT required for prose/lesson edits — but it never hurts.
   (Also documented next to the deploy step in CLAUDE.md.)
   ============================================================ */

const CACHE_VERSION = "sc-v1";
const CACHE = CACHE_VERSION;

/* absolute URL of the offline fallback, resolved against this SW's location
   (the site root) — so cache.match finds it no matter the hosting base path */
const OFFLINE_URL = new URL("offline.html", self.location.href).href;

/* the app shell: everything the site's chrome needs to run offline.
   Relative URLs resolve against self.location (root), matching the same
   absolute URLs the pages request via ../../assets/… etc. */
const SHELL = [
  "offline.html",
  "site.webmanifest",
  "assets/css/styles.css",
  "assets/js/site.js",
  "assets/js/curriculum.js",
  "assets/js/viz.js",
  "assets/fonts/Inter.woff2",
  "assets/favicon.svg",
  "assets/favicon.ico",
  "assets/icon-192.png",
  "assets/icon-512.png"
];

/* ---------- install: precache the shell, then take over ASAP ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // add each item independently so one missing file can't brick install
      Promise.allSettled(
        SHELL.map((u) => cache.add(new Request(u, { cache: "reload" })))
      )
    ).then(() => self.skipWaiting())
  );
});

/* ---------- activate: drop old caches, claim open pages ---------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* only cache safe, same-origin, non-redirected 200s (never GA/Ko-fi, never opaque) */
function cacheable(res) {
  return res && res.ok && res.type === "basic" && !res.redirected;
}
function putCopy(req, res) {
  const copy = res.clone();
  caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
  return res;
}

/* HTML: try the network first (fresh when online), fall back to cache,
   then to the offline page for anything we've never seen. */
function networkFirst(req) {
  return fetch(req)
    .then((res) => (cacheable(res) ? putCopy(req, res) : res))
    .catch(() =>
      caches.match(req).then((hit) =>
        hit ||
        caches.match(req, { ignoreSearch: true }).then((h2) =>
          h2 || caches.match(OFFLINE_URL)
        )
      )
    );
}

/* Assets: serve from cache immediately, otherwise fetch (and cache) it. */
function cacheFirst(req) {
  return caches.match(req).then((hit) =>
    hit ||
    fetch(req)
      .then((res) => (cacheable(res) ? putCopy(req, res) : res))
      .catch(() => hit) // undefined → surfaces as a network error, which is correct offline
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;                 // leave POST/PUT/… to the network
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;  // GA, Ko-fi, etc. pass straight through

  if (req.mode === "navigate") {                    // page loads → network-first
    event.respondWith(networkFirst(req));
    return;
  }
  event.respondWith(cacheFirst(req));               // assets & other same-origin GETs
});
