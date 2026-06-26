# hakan.science

A free, interactive statistics course for people with no stats background — built for visual learners. Plain static HTML/CSS/JS, no build step, hosted on GitHub Pages.

## How it's structured

```
index.html                  Homepage
404.html                    Shown for any unknown URL
assets/css/styles.css       The whole design system (light + dark)
assets/js/curriculum.js     Single source of truth — every course & section
assets/js/site.js           Shared nav, theme toggle, sidebar, prev/next
stats-1/<topic>/index.html  One folder per lesson  → clean URL + refresh-proof
```

To **add or rename a lesson**, edit `assets/js/curriculum.js` (set `ready: true`
once the page exists). The homepage index, every sidebar, and the prev/next
links all read from that one file.

## Preview locally

Lessons use root-absolute paths (`/assets/...`), so open them through a tiny
local server rather than double-clicking:

```
python -m http.server 8099
```

Then visit http://localhost:8099/ . (Run it from inside this folder.)

## Publish / update (GitHub Desktop)

First time:
1. In GitHub Desktop: **File → Add local repository**, choose this folder.
2. Click **Publish repository**. Name it `your-username.github.io` (so it serves
   at the site root), keep it public.
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a
   branch → `main` / `(root)` → Save.** Wait ~1 minute; your site is live at
   `https://your-username.github.io/`.

Every time after: make changes → **Commit** → **Push** in GitHub Desktop. The
live site updates automatically in under a minute. No uploads, no Hostinger.

## Custom domain (hakan.science) — optional

Keep the domain registered (it can stay at Hostinger as registrar — you only
drop the *hosting* plan), then:
1. GitHub repo **Settings → Pages → Custom domain → `hakan.science` → Save**
   (this commits a `CNAME` file for you).
2. At your DNS provider, point the domain at GitHub Pages:
   - `A` records for the apex `@` → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `CNAME` for `www` → `your-username.github.io`
3. Back in Pages settings, tick **Enforce HTTPS**.
