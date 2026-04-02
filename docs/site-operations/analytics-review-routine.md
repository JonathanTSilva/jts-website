# Analytics Review Routine

Use this routine weekly or monthly to keep the site's traffic reporting useful without expanding tracking unnecessarily.

## Core Questions

- Which pages attract the most traffic?
- Which referrers or campaigns send meaningful visitors?
- Which pages lead to contact-oriented actions?
- Are lead events still limited to deliberate actions rather than passive impressions?

## Review Steps

1. Open the analytics dashboard for the previous 7 or 30 days.
2. Record top pages, referrers, entry pages, countries, and device mix.
3. Review lead events:
   - `cv_download`
   - `email_click`
   - `linkedin_click`
   - `github_click`
4. Compare lead-event counts against top pages to see which pages produce contact intent.
5. Check for anomalies:
   - sudden traffic spikes from unknown referrers
   - large drops in tracked lead events
   - event names that no longer match live UI labels or links
6. If analytics behavior changed, update:
   - `docs/site-operations/analytics-and-consent.md`
   - `docs/site-operations/site-governance.md`
   - the privacy policy if data collection changed materially

## Escalation Rules

- If a new third-party script is needed, review consent and privacy disclosures before deployment.
- If an event is low-signal or not actionable, remove it instead of keeping dashboard noise.
- If a new lead surface is added, assign its event name deliberately and add test coverage in the same change.

## Minimum Monthly Output

Keep a short private note with:

- date range reviewed
- top 3 pages
- top referrers
- lead-event totals
- any follow-up actions or documentation changes needed
