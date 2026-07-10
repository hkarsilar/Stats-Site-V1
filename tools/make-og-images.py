#!/usr/bin/env python3
"""make-og-images.py — StatsCapybara's Open Graph image generator.

Single source of truth for the site's social-share images. It draws:

  * assets/og.png                — the brand default (homepage + every tool
                                    page), evergreen subtitle so a growing
                                    lesson count never stales it.
  * assets/og-<course>.png       — one card per course in curriculum.js, in
                                    that course's accent, so a shared lesson
                                    link looks distinct and professional.

All 1200x630 (the Open Graph / Twitter `summary_large_image` spec). The
capybara is the same hand-drawn geometry as site.js's `capy()` and the
favicon — brand-consistent, no external art. Everything is drawn from
Pillow primitives; the only inputs are curriculum.js (titles + accents)
and styles.css (the `var(--x)` accent values), so there is nothing to keep
in sync by hand.

Second job (no Pillow needed): retag every ready lesson's <head> so its
og:image / twitter:image point at ITS course image. The homepage and tool
pages keep og.png. This is idempotent — rerun it any time (e.g. after
copying a lesson to create a new one) to keep every lesson pointed at the
right accent image.

Usage (from the repo root; `python` on Windows, `python3` on macos):

    python3 tools/make-og-images.py               # generate images + retag lessons
    python3 tools/make-og-images.py --images-only  # just (re)generate the PNGs
    python3 tools/make-og-images.py --retag-only    # just retag lesson heads (no Pillow)

Reproducible: rerunning regenerates byte-stable PNGs on the same machine
(no timestamps embedded). Fonts are resolved from a portable candidate
list (Arial on macos/Windows, DejaVu on Linux); the visual result is a
neutral bold grotesque that matches the site's self-hosted Inter closely.
"""

import argparse
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
CURRICULUM = os.path.join(ASSETS, "js", "curriculum.js")
STYLES = os.path.join(ASSETS, "css", "styles.css")

W, H = 1200, 630            # Open Graph canonical size
SS = 2                      # supersample factor: draw at 2x, downscale (crisp edges)

# Evergreen — never mentions a lesson count, so it can't go stale.
MAIN_HEADLINE = "Statistics You Can See, Touch, and Understand"
MAIN_SUBTITLE = "The friendly, interactive statistics course"

# Capybara palette — the cream variant that reads on any accent background
# (the favicon's browns would vanish on amber/slate). Dark features stay
# identical to capy() so it's recognisably the same mascot.
CAPY_HEAD = (242, 235, 217)
CAPY_EAR = (236, 227, 207)
CAPY_MUZZLE = (228, 216, 189)
CAPY_DARK = (58, 42, 27)
NAVY = (11, 17, 32)         # --bg dark; text corner is mixed toward this


# ------------------------------------------------------------------ parsing

def read(path):
    with open(path, "r", encoding="utf-8") as fh:
        return fh.read()


def css_vars():
    """Map `--name` -> #hex from the first :root block of styles.css."""
    src = read(STYLES)
    block = re.search(r":root\s*\{([^}]*)\}", src)
    text = block.group(1) if block else src
    out = {}
    for name, hexv in re.findall(r"(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;", text):
        out[name] = hexv
    return out


def resolve_accent(accent, cssmap):
    """'#f59e0b' -> hex; 'var(--primary)' -> the mapped hex."""
    accent = accent.strip()
    m = re.match(r"var\(\s*(--[\w-]+)\s*\)", accent)
    if m:
        return cssmap.get(m.group(1), "#6366f1")
    return accent


def load_tracks():
    src = read(CURRICULUM)
    block = re.search(r"window\.TRACKS\s*=\s*\[(.*?)\];", src, re.S)
    text = block.group(1) if block else ""
    tracks = {}
    for tid, title in re.findall(r'id:\s*"([^"]+)"\s*,\s*title:\s*"([^"]+)"', text):
        tracks[tid] = title
    return tracks


def load_courses():
    """Parse curriculum.js -> [{slug,title,subtitle,accent,track}] in order.

    The course-level slug/title/subtitle/accent/track quintet only occurs at
    course level (sections carry slug/title but never subtitle/accent/track),
    so this sequence uniquely identifies each course."""
    src = read(CURRICULUM)
    cssmap = css_vars()
    tracks = load_tracks()
    courses = []
    pat = re.compile(
        r'slug:\s*"([^"]+)"\s*,\s*title:\s*"([^"]+)"\s*,\s*'
        r'subtitle:\s*"([^"]+)"\s*,\s*accent:\s*"([^"]+)"\s*,\s*track:\s*"([^"]+)"'
    )
    for slug, title, subtitle, accent, track in pat.findall(src):
        courses.append({
            "slug": slug,
            "title": title,
            "subtitle": subtitle,
            "accent": resolve_accent(accent, cssmap),
            "track": tracks.get(track, ""),
        })
    return courses


# ------------------------------------------------------------------ colour

def hex_to_rgb(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def mix(c1, c2, t):
    """Linear blend c1 -> c2 by t in [0,1]."""
    return tuple(round(a + (b - a) * t) for a, b in zip(c1, c2))


# ------------------------------------------------------------------ drawing

def find_font(size, bold=True):
    from PIL import ImageFont
    candidates = ([
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf",
        "Arial Bold.ttf", "DejaVuSans-Bold.ttf",
    ] if bold else [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "C:\\Windows\\Fonts\\arial.ttf",
        "Arial.ttf", "DejaVuSans.ttf",
    ])
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def gradient(tl, br, w, h):
    """Smooth diagonal gradient tl (top-left) -> br (bottom-right).

    Computed at low resolution then upscaled — a diagonal ramp is smooth, so
    the LANCZOS upscale is indistinguishable from a per-pixel version and is
    thousands of times cheaper."""
    from PIL import Image
    sw, sh = 128, 67
    small = Image.new("RGB", (sw, sh))
    px = small.load()
    for y in range(sh):
        for x in range(sw):
            t = (x / (sw - 1) + y / (sh - 1)) / 2.0
            px[x, y] = mix(tl, br, t)
    return small.resize((w, h), Image.LANCZOS)


def draw_tracked(draw, xy, text, font, fill, tracking):
    """Left-aligned text with extra letter spacing (for the eyebrow)."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking


def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for word in words:
        trial = word if not cur else cur + " " + word
        if draw.textlength(trial, font=font) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def draw_capybara(draw, cx, cy, height):
    """Port of site.js capy() (viewBox 0 0 64 60) to canvas coords, centred on
    (cx, cy) at the given pixel height. Cream palette; dark eyes/nostrils."""
    scale = height / 60.0
    ox = cx - 32 * scale
    oy = cy - 30 * scale   # viewBox mid-y ~30 (head spans 14..54)

    def E(ecx, ecy, rx, ry, fill):
        draw.ellipse([ox + (ecx - rx) * scale, oy + (ecy - ry) * scale,
                      ox + (ecx + rx) * scale, oy + (ecy + ry) * scale], fill=fill)

    E(19, 15, 7, 6, CAPY_EAR)                 # left ear
    E(45, 15, 7, 6, CAPY_EAR)                 # right ear
    draw.rounded_rectangle(                    # head
        [ox + 9 * scale, oy + 14 * scale, ox + 55 * scale, oy + 54 * scale],
        radius=17 * scale, fill=CAPY_HEAD)
    E(32, 44, 16, 12, CAPY_MUZZLE)            # muzzle
    E(23, 31, 2.7, 2.7, CAPY_DARK)            # left eye
    E(41, 31, 2.7, 2.7, CAPY_DARK)            # right eye
    E(26.5, 45, 2.3, 1.6, CAPY_DARK)         # left nostril
    E(37.5, 45, 2.3, 1.6, CAPY_DARK)         # right nostril


def bell_curve_layer(w, h):
    """Faint white gaussian + baseline across the lower third — the same
    decorative motif as the original og.png."""
    from PIL import Image, ImageDraw
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    base_y = h * 0.86
    amp = h * 0.30
    cx = w * 0.44
    sigma = w * 0.16
    pts = []
    x = w * 0.02
    while x <= w * 0.98:
        import math
        y = base_y - amp * math.exp(-((x - cx) ** 2) / (2 * sigma ** 2))
        pts.append((x, y))
        x += w * 0.006
    d.line(pts, fill=(255, 255, 255, 34), width=max(2, round(3 * SS / 2)))
    d.line([(w * 0.02, base_y), (w * 0.98, base_y)],
           fill=(255, 255, 255, 26), width=max(2, round(3 * SS / 2)))
    return layer


def shadow_layer(w, h, cx, cy, ch):
    """Soft drop shadow so the cream capybara lifts off any accent."""
    from PIL import Image, ImageDraw, ImageFilter
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    rw, rh = ch * 0.62, ch * 0.52
    d.ellipse([cx - rw, cy - rh + ch * 0.06, cx + rw, cy + rh + ch * 0.06],
              fill=(10, 14, 25, 90))
    return layer.filter(ImageFilter.GaussianBlur(ch * 0.06))


def make_card(out_path, accent_hex, eyebrow, title, subtitle, footer,
              big_headline=None):
    """Render one 1200x630 card. If big_headline is set (the main og.png), it
    replaces the title/subtitle stack with a single wrapped headline."""
    from PIL import Image, ImageDraw

    accent = hex_to_rgb(accent_hex)
    w, h = W * SS, H * SS
    tl = mix(accent, NAVY, 0.50)   # text corner — dark enough for white text
    br = accent                     # capy corner — full accent (course identity)

    img = gradient(tl, br, w, h).convert("RGBA")
    img.alpha_composite(bell_curve_layer(w, h))

    # capybara + its shadow, right side
    cap_h = 300 * SS
    cx, cy = int(0.815 * w), int(0.57 * h)
    img.alpha_composite(shadow_layer(w, h, cx, cy, cap_h))
    draw = ImageDraw.Draw(img)
    draw_capybara(draw, cx, cy, cap_h)

    white = (255, 255, 255, 255)
    faint = (255, 255, 255, 200)
    margin = 72 * SS
    text_max = int(0.60 * w)

    # brand wordmark (top-left)
    draw.text((margin, 60 * SS), "StatsCapybara",
              font=find_font(44 * SS, bold=True), fill=white)

    if big_headline is not None:
        # main og.png — one wrapped headline + a bottom subtitle
        hf = find_font(80 * SS, bold=True)
        lines = wrap(draw, big_headline, hf, text_max)
        y = 190 * SS
        for ln in lines:
            draw.text((margin, y), ln, font=hf, fill=white)
            y += int(96 * SS)
        draw.text((margin, 545 * SS), subtitle,
                  font=find_font(34 * SS, bold=False), fill=faint)
    else:
        # course card — eyebrow (track) + big title + wrapped subtitle
        if eyebrow:
            draw_tracked(draw, (margin + 2 * SS, 232 * SS), eyebrow.upper(),
                         find_font(25 * SS, bold=True), (255, 255, 255, 180),
                         4 * SS)
        tf = find_font(100 * SS, bold=True)
        draw.text((margin, 262 * SS), title, font=tf, fill=white)
        sf = find_font(46 * SS, bold=False)
        y = 400 * SS
        for ln in wrap(draw, subtitle, sf, text_max):
            draw.text((margin, y), ln, font=sf, fill=faint)
            y += int(58 * SS)
        draw.text((margin, 552 * SS), footer,
                  font=find_font(28 * SS, bold=False), fill=(255, 255, 255, 170))

    img = img.convert("RGB").resize((W, H), Image.LANCZOS)
    img.save(out_path, "PNG", optimize=True)
    return out_path


# ------------------------------------------------------------------ commands

def generate_images():
    courses = load_courses()
    made = []
    made.append(make_card(
        os.path.join(ASSETS, "og.png"), "#6366f1",
        eyebrow=None, title=None, subtitle=MAIN_SUBTITLE, footer=None,
        big_headline=MAIN_HEADLINE))
    # main og keeps the two-hue brand gradient (indigo -> teal), so override:
    _remake_main(courses)
    for c in courses:
        out = os.path.join(ASSETS, "og-%s.png" % c["slug"])
        make_card(out, c["accent"], eyebrow=c["track"], title=c["title"],
                  subtitle=c["subtitle"], footer="statscapybara.com")
        made.append(out)
    for p in made:
        print("  wrote %s" % os.path.relpath(p, ROOT))
    return made


def _remake_main(courses):
    """The homepage/brand og.png uses the signature indigo->teal gradient
    rather than a single accent. Rendered here to keep make_card single-accent
    and simple."""
    from PIL import Image, ImageDraw
    cssmap = css_vars()
    indigo = hex_to_rgb(cssmap.get("--primary", "#6366f1"))
    teal = hex_to_rgb(cssmap.get("--secondary", "#14b8a6"))
    w, h = W * SS, H * SS
    img = gradient(mix(indigo, NAVY, 0.28), teal, w, h).convert("RGBA")
    img.alpha_composite(bell_curve_layer(w, h))
    cap_h = 300 * SS
    cx, cy = int(0.815 * w), int(0.57 * h)
    img.alpha_composite(shadow_layer(w, h, cx, cy, cap_h))
    draw = ImageDraw.Draw(img)
    draw_capybara(draw, cx, cy, cap_h)
    white = (255, 255, 255, 255)
    margin = 72 * SS
    draw.text((margin, 60 * SS), "StatsCapybara",
              font=find_font(44 * SS, bold=True), fill=white)
    hf = find_font(80 * SS, bold=True)
    y = 190 * SS
    for ln in wrap(draw, MAIN_HEADLINE, hf, int(0.60 * w)):
        draw.text((margin, y), ln, font=hf, fill=white)
        y += int(96 * SS)
    draw.text((margin, 545 * SS), MAIN_SUBTITLE,
              font=find_font(34 * SS, bold=False), fill=(255, 255, 255, 200))
    img = img.convert("RGB").resize((W, H), Image.LANCZOS)
    img.save(os.path.join(ASSETS, "og.png"), "PNG", optimize=True)


def retag_lessons():
    """Point every ready lesson's og:image + twitter:image at its course
    image. Idempotent. Returns the number of files changed."""
    courses = {c["slug"]: c for c in load_courses()}
    src = read(CURRICULUM)
    # flat list of (course, slug, ready) from CURRICULUM_FLAT reality
    changed = 0
    for course in courses:
        # find every ready section slug for this course by scanning its block
        cblock = re.search(
            r'slug:\s*"%s".*?sections:\s*\[(.*?)\]\s*\}' % re.escape(course),
            src, re.S)
        if not cblock:
            continue
        for sslug, ready in re.findall(
                r'slug:\s*"([^"]+)"[^}]*?(ready:\s*true)?\s*\}', cblock.group(1)):
            if not ready:
                continue
            page = os.path.join(ROOT, course, sslug, "index.html")
            if not os.path.exists(page):
                continue
            html = read(page)
            img_url = "https://statscapybara.com/assets/og-%s.png" % course
            new = re.sub(
                r'(<meta property="og:image" content=")[^"]*(")',
                r"\g<1>%s\g<2>" % img_url, html)
            new = re.sub(
                r'(<meta name="twitter:image" content=")[^"]*(")',
                r"\g<1>%s\g<2>" % img_url, new)
            if new != html:
                with open(page, "w", encoding="utf-8") as fh:
                    fh.write(new)
                changed += 1
    print("  retagged %d lesson page(s)" % changed)
    return changed


def main():
    ap = argparse.ArgumentParser(description="Generate per-course OG images and retag lessons.")
    ap.add_argument("--images-only", action="store_true", help="only (re)generate PNGs")
    ap.add_argument("--retag-only", action="store_true", help="only retag lesson heads (no Pillow)")
    args = ap.parse_args()

    if not args.retag_only:
        try:
            import PIL  # noqa: F401
        except ImportError:
            print("Pillow is required to generate images: python3 -m pip install Pillow",
                  file=sys.stderr)
            sys.exit(1)
        print("Generating OG images...")
        generate_images()
    if not args.images_only:
        print("Retagging lesson heads...")
        retag_lessons()
    print("Done.")


if __name__ == "__main__":
    main()
