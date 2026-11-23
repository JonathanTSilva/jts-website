#!/usr/bin/env bash
# Install the OS packages the Playwright browsers need, plus any extra apt
# packages given as arguments, on an Ubuntu CI runner. One slow apt mirror must
# not use up the job's time budget (issue #154: 126 MB at 121 kB/s took 17 min).
#
# How:
# - Only the browsers the suites use (chromium, webkit), not Firefox.
# - One `apt-get update` for everything (Playwright deps and the extras).
# - Downloads run with a time limit per attempt. A retry keeps the .deb files
#   already fetched and points the runner's mirror list at another Ubuntu mirror.
# - Packages are unpacked only after every download is complete, so a timeout
#   never interrupts dpkg.
#
# Usage: scripts/install-ci-system-deps.sh [extra-apt-package ...]
# Env:   PLAYWRIGHT_BROWSERS  browsers whose OS deps to install (default: "chromium webkit")
#        APT_ATTEMPT_SECONDS  time limit for each update/download attempt (default: 90;
#                             a normal download takes 10-40 s)
#        APT_ATTEMPTS         number of attempts (default: 3)
#        APT_MIRROR_FILE      mirror list to rewrite on retry (default: /etc/apt/apt-mirrors.txt; for tests)
set -euo pipefail

browsers=${PLAYWRIGHT_BROWSERS:-chromium webkit}
attempt_seconds=${APT_ATTEMPT_SECONDS:-90}
attempts=${APT_ATTEMPTS:-3}
extras=("$@")

# GitHub's Ubuntu images read their archive mirror from this file
# (sources use mirror+file:/etc/apt/apt-mirrors.txt).
mirror_file=${APT_MIRROR_FILE:-/etc/apt/apt-mirrors.txt}
fallback_mirrors=(http://azure.archive.ubuntu.com/ubuntu/ http://archive.ubuntu.com/ubuntu/)
# Stalled connections fail in 30 s instead of hanging until the attempt limit.
apt_opts=(-o Acquire::Retries=3 -o Acquire::http::Timeout=30 -o Acquire::https::Timeout=30)

sudo=()
[ "$(id -u)" -eq 0 ] || sudo=(sudo)

original_mirrors=""
if [ -f "$mirror_file" ]; then
  original_mirrors=$(cat "$mirror_file")
  echo "Runner mirror list ($mirror_file):"
  echo "$original_mirrors"
fi

restore_mirrors() {
  if [ -n "$original_mirrors" ]; then
    printf '%s\n' "$original_mirrors" | "${sudo[@]}" tee "$mirror_file" >/dev/null
  fi
}
trap restore_mirrors EXIT

# Attempt N >= 2 uses the (N-1)th fallback mirror that is not the runner's own.
use_fallback_mirror() {
  local n=$1 current candidates=() m
  [ -n "$original_mirrors" ] || { echo "No $mirror_file; retrying the same sources."; return; }
  current=$(printf '%s\n' "$original_mirrors" | head -n1 | cut -f1)
  for m in "${fallback_mirrors[@]}"; do
    [ "$m" = "$current" ] || candidates+=("$m")
  done
  m=${candidates[$(( (n - 2) % ${#candidates[@]} ))]}
  echo "Switching apt mirror to $m"
  printf '%s\n' "$m" | "${sudo[@]}" tee "$mirror_file" >/dev/null
}

limited() {
  "${sudo[@]}" timeout "$attempt_seconds" "$@"
}

# Package names Playwright would install for $browsers, from its own dry run
# (it simulates the install with apt-get -s and lists what is missing).
resolve_playwright_packages() {
  local out
  # shellcheck disable=SC2086 # $browsers is a word list on purpose
  out=$(pnpm exec playwright install-deps --dry-run $browsers 2>&1) || true
  if grep -q "All system dependencies are installed" <<<"$out"; then
    playwright_packages=()
    return
  fi
  mapfile -t playwright_packages < <(sed -n 's/^  \([a-z0-9][a-z0-9.+:-]*\)$/\1/p' <<<"$out")
  if [ "${#playwright_packages[@]}" -eq 0 ]; then
    echo "::error title=Playwright deps::Could not read the package list from 'playwright install-deps --dry-run'. Output:"
    echo "$out"
    exit 1
  fi
}

playwright_packages=()
resolved=false
start=$SECONDS
for ((i = 1; i <= attempts; i++)); do
  [ "$i" -eq 1 ] || use_fallback_mirror "$i"
  echo "::group::apt attempt $i/$attempts (limit ${attempt_seconds}s per command)"
  t=$SECONDS
  if ! limited apt-get "${apt_opts[@]}" update; then
    echo "::endgroup::"
    echo "::warning title=apt update::Attempt $i/$attempts: apt-get update failed or passed ${attempt_seconds}s ($((SECONDS - t))s)."
    continue
  fi
  if [ "$resolved" = false ]; then
    resolve_playwright_packages
    resolved=true
    echo "Playwright packages for '$browsers': ${#playwright_packages[@]}; extras: ${extras[*]:-none}"
  fi
  if limited apt-get "${apt_opts[@]}" install -y --no-install-recommends --download-only \
      "${playwright_packages[@]}" "${extras[@]}"; then
    echo "::endgroup::"
    echo "apt download finished on attempt $i in $((SECONDS - t))s."
    break
  fi
  echo "::endgroup::"
  echo "::warning title=apt download::Attempt $i/$attempts: download failed or passed ${attempt_seconds}s ($((SECONDS - t))s). Downloaded files are kept for the next attempt."
done

if [ "$i" -gt "$attempts" ]; then
  echo "::error title=apt mirrors too slow::Could not download the Playwright OS packages and '${extras[*]:-}' in $attempts attempts of ${attempt_seconds}s ($((SECONDS - start))s in total). The Ubuntu mirrors were slow or unreachable; re-run the job."
  exit 1
fi

echo "::group::Unpack and install (no network)"
"${sudo[@]}" apt-get "${apt_opts[@]}" install -y --no-install-recommends \
  "${playwright_packages[@]}" "${extras[@]}"
echo "::endgroup::"
echo "OS packages installed in $((SECONDS - start))s."
