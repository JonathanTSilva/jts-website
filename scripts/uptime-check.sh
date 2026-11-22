#!/usr/bin/env bash
# uptime-check.sh
#
# Fetches the key URLs of the live site and checks that /.well-known/security.txt
# does not expire within 30 days. Every check runs, then the result is written
# as Markdown to <report-file> (and to $GITHUB_STEP_SUMMARY when set). Exits 1
# when any check failed.
#
#   uptime-check.sh <report-file>
#
# BASE_URL    site to check (default https://www.jontobias.com)
# FAIL_PROBE  "true" adds a path that does not exist, to prove the failure path

set -uo pipefail

if [ "$#" -ne 1 ]; then
  echo "usage: $0 <report-file>" >&2
  exit 2
fi

report="$1"
base="${BASE_URL:-https://www.jontobias.com}"
base="${base%/}"
min_days=30

paths=(
  "/"
  "/pt-br/"
  "/rss.xml"
  "/sitemap-index.xml"
  "/.well-known/security.txt"
)
if [ "${FAIL_PROBE:-}" = "true" ]; then
  paths+=("/site-health-probe-does-not-exist/")
fi

failures=0
rows=()

record() {
  # record <ok|fail> <check> <detail>
  if [ "$1" = "ok" ]; then
    rows+=("| ok | $2 | $3 |")
  else
    rows+=("| FAIL | $2 | $3 |")
    failures=$((failures + 1))
  fi
  echo "[$1] $2: $3"
}

fetch() {
  # fetch <url> <output-file>: bounded, retried, fails on HTTP errors.
  curl -fsS --max-time 20 --retry 2 --retry-delay 5 --retry-connrefused \
    --output "$2" --write-out '%{http_code}' "$1" 2> "$2.err"
}

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

for path in "${paths[@]}"; do
  url="${base}${path}"
  rm -f "$work/body" "$work/body.err"
  if code="$(fetch "$url" "$work/body")"; then
    record ok "GET $path" "HTTP $code"
  else
    reason="$(tr '\n' ' ' < "$work/body.err" | cut -c1-200)"
    record fail "GET $path" "${code:-no response} ${reason}"
  fi
  if [ "$path" = "/.well-known/security.txt" ] && [ -s "$work/body" ]; then
    cp "$work/body" "$work/security.txt"
  fi
done

# security.txt must stay valid (RFC 9116): fail while there are still 30 days left.
expires=""
if [ -s "$work/security.txt" ]; then
  expires="$(grep -i -m1 '^Expires:' "$work/security.txt" | cut -d: -f2- | tr -d '\r' | sed 's/^ *//' || true)"
fi
if [ -n "$expires" ]; then
  if expires_epoch="$(date -d "$expires" +%s 2> /dev/null)"; then
    days=$(((expires_epoch - $(date +%s)) / 86400))
    if [ "$days" -gt "$min_days" ]; then
      record ok "security.txt Expires" "$expires, $days days left"
    else
      record fail "security.txt Expires" "$expires, $days days left (renew at least $min_days days ahead)"
    fi
  else
    record fail "security.txt Expires" "cannot parse '$expires'"
  fi
else
  record fail "security.txt Expires" "no Expires field to check"
fi

{
  echo "## Uptime check"
  echo
  echo "Site: $base"
  echo
  echo "| Result | Check | Detail |"
  echo "|---|---|---|"
  printf '%s\n' "${rows[@]}"
  echo
  if [ "$failures" -eq 0 ]; then
    echo "All checks passed."
  else
    echo "$failures check(s) failed."
  fi
} > "$report"

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  cat "$report" >> "$GITHUB_STEP_SUMMARY"
fi

[ "$failures" -eq 0 ]
