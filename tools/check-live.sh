#!/usr/bin/env bash
# ============================================================
# check-live.sh — is the domain serving the filtered artifact of this commit?
#
# Shell and curl only. Run from the repo root:
#
#     bash tools/check-live.sh                                  # https://statscapybara.com, one pass
#     bash tools/check-live.sh --wait 60 --for 180              # what pages.yml's verify job runs
#     bash tools/check-live.sh --for 10 http://localhost:8097   # the local proof (P122)
#
# WHY (P122). Until Settings → Pages → Source reads "GitHub Actions",
# every push to main starts two deploys: pages.yml, which publishes the
# filtered artifact (tools/make-pages-artifact.js), and GitHub's legacy
# "pages build and deployment", which uploads the whole repository. The
# domain serves whichever finishes last. On 6 Oct 2026 the legacy one
# won by a second and the planning docs were most likely public for five
# hours. This sandbox's proxy refuses statscapybara.com, so the check
# has to run on a GitHub runner: pages.yml's verify job after every
# deploy, and health.yml once a week.
#
# A pass means all of these held on the same attempt:
#   - the homepage returns 200;
#   - the planning docs and tools/audit.js return 404 (the legacy deploy
#     serves them as 200, so this is what tells the two deploys apart);
#   - the served sw.js carries the CACHE_VERSION of the checked-out
#     commit, so the deploy that is live is this commit's.
#
# A pass does NOT prove the setting is fixed. A legacy run can stay open
# for most of an hour (run 37442209222 on 6 Oct stayed open 45 minutes)
# and finish after this check. Only the workflow-run list settles it: if
# a "pages build and deployment" run still appears for the latest
# commit on main, the setting is unchanged.
#
# Options:
#   --wait S   sleep S seconds before the first attempt (default 0). The
#              verify job waits 60 s so a legacy deploy that finishes a
#              moment after the filtered one is caught.
#   --for S    keep retrying with a growing pause (5, 10, 20, 30, 30 … s)
#              until S seconds after the first attempt (default 0: one
#              attempt). Covers CDN lag after a deploy.
#   BASE       the site root (default https://statscapybara.com).
#
# Every request carries a throwaway query string and Cache-Control:
# no-cache, so the answer comes from the Pages origin rather than a CDN
# copy made before the deploy. Exit 0 on a pass, 1 on a failure, 2 on a
# usage error. On GitHub it also writes a table to $GITHUB_STEP_SUMMARY
# and an error annotation, and a failed run emails the repository owner.
# That email is the alert.
# ============================================================
set -u

usage() { echo "check-live: $1 (see the header of tools/check-live.sh)" >&2; exit 2; }
seconds() { case "$1" in ""|*[!0-9]*) usage "$2 takes whole seconds" ;; esac; }

WAIT=0
FOR=0
BASE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --wait) [ $# -ge 2 ] || usage "--wait needs a value"; seconds "$2" --wait; WAIT="$2"; shift 2 ;;
    --for)  [ $# -ge 2 ] || usage "--for needs a value";  seconds "$2" --for;  FOR="$2";  shift 2 ;;
    -*) usage "unknown option $1" ;;
    *)  BASE="$1"; shift ;;
  esac
done
BASE="${BASE:-https://statscapybara.com}"
BASE="${BASE%/}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXPECTED="$(sed -n 's/^const CACHE_VERSION = "\([^"]*\)".*/\1/p' "$ROOT/sw.js" | head -n 1)"
if [ -z "$EXPECTED" ]; then
  echo "check-live: no CACHE_VERSION line in $ROOT/sw.js" >&2
  exit 2
fi

# Paths the filtered artifact leaves out. One 200 here means the legacy
# deploy is live. EXCLUDE in make-pages-artifact.js is the full list.
MUST_404=(/CLAUDE.md /AGENTS.md /PROMPTS.md /ROADMAP.md /VOICE.md /README.md /tools/audit.js)

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# status URL → prints the HTTP status (000 when curl could not connect)
# and leaves the body in $TMP/body.
status() {
  curl -sS -o "$TMP/body" -w '%{http_code}' --max-time 20 \
       -H 'Cache-Control: no-cache' "$1?live-check=$(date +%s)$RANDOM" 2>"$TMP/err" || true
}

ROWS=""     # markdown table rows from the latest attempt
FAILS=0
LEAKS=0     # excluded paths served as 200 on the latest attempt

attempt() {
  ROWS=""
  FAILS=0
  LEAKS=0
  local code mark

  code="$(status "$BASE/")"
  if [ "$code" = 200 ]; then mark=pass; else mark=FAIL; FAILS=$((FAILS + 1)); fi
  ROWS+="| \`/\` | 200 | $code | $mark |"$'\n'

  for p in "${MUST_404[@]}"; do
    code="$(status "$BASE$p")"
    if [ "$code" = 404 ]; then mark=pass; else mark=FAIL; FAILS=$((FAILS + 1)); fi
    [ "$code" = 200 ] && LEAKS=$((LEAKS + 1))
    ROWS+="| \`$p\` | 404 | $code | $mark |"$'\n'
  done

  code="$(status "$BASE/sw.js")"
  local seen="none"
  if [ "$code" = 200 ]; then
    seen="$(sed -n 's/^const CACHE_VERSION = "\([^"]*\)".*/\1/p' "$TMP/body" | head -n 1)"
    seen="${seen:-none}"
  fi
  if [ "$code" = 200 ] && [ "$seen" = "$EXPECTED" ]; then mark=pass; else mark=FAIL; FAILS=$((FAILS + 1)); fi
  ROWS+="| \`/sw.js\` CACHE_VERSION | 200, $EXPECTED | $code, $seen | $mark |"$'\n'
}

echo "check-live: $BASE, expecting CACHE_VERSION $EXPECTED"
if [ "$WAIT" -gt 0 ]; then
  echo "check-live: waiting ${WAIT}s so a late legacy deploy is caught"
  sleep "$WAIT"
fi

START=$SECONDS
N=0
PAUSE=5
while :; do
  N=$((N + 1))
  attempt
  ELAPSED=$((SECONDS - START))
  echo "check-live: attempt $N at +${ELAPSED}s, $FAILS check(s) failing"
  [ "$FAILS" -eq 0 ] && break
  [ $((ELAPSED + PAUSE)) -gt "$FOR" ] && break
  sleep "$PAUSE"
  PAUSE=$((PAUSE * 2)); [ "$PAUSE" -gt 30 ] && PAUSE=30
done

TABLE="| Request | Want | Got | |"$'\n'"|---|---|---|---|"$'\n'"$ROWS"
printf '\n%s\n' "$TABLE"

if [ "$FAILS" -eq 0 ]; then
  VERDICT="Live check passed on attempt $N: $BASE serves the filtered artifact with CACHE_VERSION $EXPECTED."
elif [ "$LEAKS" -gt 0 ]; then
  VERDICT="Live check FAILED after $N attempt(s): $BASE serves $LEAKS file(s) the filtered artifact leaves out, so the legacy branch deploy is live. Fix: Settings → Pages → Build and deployment → Source → \"GitHub Actions\"."
else
  VERDICT="Live check FAILED after $N attempt(s): $FAILS check(s) still failing on $BASE. No excluded file is served; read the table (000 means no connection, an old CACHE_VERSION means this commit's deploy is not live yet)."
fi
echo "$VERDICT"

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  printf '### Live domain\n\n%s\n\n%s\n' "$VERDICT" "$TABLE" >> "$GITHUB_STEP_SUMMARY"
fi
if [ "$FAILS" -ne 0 ]; then
  [ -n "${GITHUB_ACTIONS:-}" ] && echo "::error title=Live check failed::$VERDICT"
  exit 1
fi
exit 0
