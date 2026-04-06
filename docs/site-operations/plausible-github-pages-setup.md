# Plausible Setup for GitHub Pages

This guide covers the safe public steps to connect this site to Plausible Analytics when it is deployed through GitHub Pages.

## What This Site Already Does

- loads Plausible only after a visitor accepts analytics in the consent banner
- tracks pageviews through Plausible
- tracks these lead events:
  - `cv_download`
  - `email_click`
  - `linkedin_click`
  - `github_click`

## Step 1: Create the Plausible Site

1. Sign in to Plausible.
2. Create a new site.
3. Use `www.jontobias.com` as the domain.
4. Keep the default hosted Plausible script unless you intentionally self-host later.

Recommended outcome:

- site domain: `www.jontobias.com`
- script host: `https://plausible.io`
- script path: `https://plausible.io/js/script.js`

## Step 2: Confirm the Site Domain Matches Production

This repository is built with:

- Astro site URL: `https://www.jontobias.com`
- Plausible default domain: `www.jontobias.com`

If production stays on `www.jontobias.com`, the current code already matches the expected domain.

If production domain changes later, update:

- `astro.config.mjs`
- `src/lib/analytics/config.ts`
- any deployment variables that override Plausible settings

## Step 3: Configure GitHub Actions Variables

Because this site builds on GitHub Actions for GitHub Pages, set these repository variables or secrets in GitHub:

- `PUBLIC_PLAUSIBLE_DOMAIN`
- `PUBLIC_PLAUSIBLE_API_HOST`
- `PUBLIC_PLAUSIBLE_SCRIPT_SRC`

Recommended values:

```text
PUBLIC_PLAUSIBLE_DOMAIN=www.jontobias.com
PUBLIC_PLAUSIBLE_API_HOST=https://plausible.io
PUBLIC_PLAUSIBLE_SCRIPT_SRC=https://plausible.io/js/script.js
```

These values are not sensitive on their own. They can be stored as repository variables. Secrets are only needed if you later add something private, such as an API key.

## Step 4: Add the Variables in GitHub

In GitHub:

1. Open the repository.
2. Go to `Settings`.
3. Go to `Secrets and variables` > `Actions`.
4. Open the `Variables` tab.
5. Add the three `PUBLIC_PLAUSIBLE_*` values above.

If you prefer, you can store them as Actions secrets instead, but plain repository variables are enough for this configuration.

Important:

- Astro reads these values at build time through `import.meta.env`
- GitHub repository variables must be explicitly passed into the workflow environment
- this repository's pipeline already exports these variables in `.github/workflows/pipeline.yml`

## Step 5: Redeploy

After adding the variables:

1. push a commit to `main`, or
2. re-run the latest Pages workflow from GitHub Actions

Then verify in production:

- the consent banner appears for a fresh visitor
- accepting consent loads the Plausible script
- rejecting consent does not load the Plausible script

## Step 6: Verify Events in Plausible

Once the site is live and consent is accepted, check the Plausible dashboard for:

- pageviews
- unique visitors
- top pages
- referrers
- countries and devices
- custom events:
  - `cv_download`
  - `email_click`
  - `linkedin_click`
  - `github_click`

## Operational Notes

- The analytics integration lives in `src/components/site/AnalyticsScripts.astro`.
- Consent behavior lives in `src/components/site/ConsentBanner.astro`.
- The current event taxonomy is documented in `docs/site-operations/analytics-and-consent.md`.
- The ongoing review loop is documented in `docs/site-operations/analytics-review-routine.md`.

## Keep Private

Do not commit any of the following to this public repository:

- Plausible account URLs specific to your workspace
- shared dashboard URLs if you consider them private
- screenshots of real traffic
- exported reports
- API keys or tokens
- notes about suspicious referrers, traffic spikes, or personal operating habits
