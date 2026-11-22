#!/usr/bin/env bash
# site-health-issue.sh
#
# Keeps one GitHub issue per site-health check in step with the check result.
#
#   site-health-issue.sh <failed|passed> <title> <label> <body-file>
#
#   failed  Comment the body on the open issue with that title and label, or
#           open a new one when there is none.
#   passed  Comment "check passes again" and close the open issue, if any.
#           The body file is not read.
#
# Needs the `gh` CLI with GH_TOKEN (issues: write). GITHUB_REPOSITORY is set by
# Actions; GITHUB_SERVER_URL and GITHUB_RUN_ID add a link to the run.
# DRY_RUN=1 prints the commands that change anything instead of running them.
#
# The body must hold public URLs only: issues of a public repository are public.

set -euo pipefail

if [[ "$#" -ne 4 ]]; then
  echo "usage: $0 <failed|passed> <title> <label> <body-file>" >&2
  exit 2
fi

status="$1"
title="$2"
label="$3"
body_file="$4"

case "$status" in
  failed | passed) ;;
  *)
    echo "status must be 'failed' or 'passed', got '$status'" >&2
    exit 2
    ;;
esac

# GitHub rejects bodies over 65536 characters; leave room for the footer.
max_body_bytes=60000

mutate() {
  if [[ "${DRY_RUN:-}" = "1" ]]; then
    printf 'DRY_RUN:'
    printf ' %q' "$@"
    printf '\n'
  else
    "$@"
  fi
}

run_url=""
if [[ -n "${GITHUB_RUN_ID:-}" ]] && [[ -n "${GITHUB_REPOSITORY:-}" ]]; then
  run_url="${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
fi

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

# Labels are created when missing (--force also makes a repeat run a no-op).
if [[ "$status" = "failed" ]]; then
  mutate gh label create site-health --force --color "b60205" \
    --description "Automated site health checks"
  mutate gh label create "$label" --force --color "d93f0b" \
    --description "Automated site health check: $label"
fi

# An exact title match among the open issues that carry both labels.
existing="$(
  gh issue list --state open --label site-health --label "$label" --limit 100 \
    --json number,title \
    | jq -r --arg title "$title" '[.[] | select(.title == $title)][0].number // empty'
)"

if [[ "$status" = "failed" ]]; then
  if [[ ! -s "$body_file" ]]; then
    echo "body file '$body_file' is missing or empty" >&2
    exit 1
  fi

  {
    head -c "$max_body_bytes" "$body_file"
    if [[ "$(wc -c < "$body_file")" -gt "$max_body_bytes" ]]; then
      printf '\n\n_Report truncated. See the run for the full list._\n'
    fi
    if [[ -n "$run_url" ]]; then
      printf '\n\nRun: %s\n' "$run_url"
    fi
  } > "$tmp"

  if [[ -n "$existing" ]]; then
    echo "Commenting on issue #$existing"
    mutate gh issue comment "$existing" --body-file "$tmp"
  else
    echo "Opening a new issue: $title"
    mutate gh issue create --title "$title" --label site-health --label "$label" \
      --body-file "$tmp"
  fi
else
  if [[ -n "$existing" ]]; then
    echo "Check passes again, closing issue #$existing"
    {
      printf 'The check passes again.'
      if [[ -n "$run_url" ]]; then
        printf ' Run: %s' "$run_url"
      fi
      printf '\n'
    } > "$tmp"
    mutate gh issue comment "$existing" --body-file "$tmp"
    mutate gh issue close "$existing" --reason completed
  else
    echo "Check passes and no issue is open."
  fi
fi
