# Site Governance

This document is the operational source of truth for when the website's analytics, consent, legal, and SEO surfaces must be reviewed.

## Governance Goals

- keep public disclosures aligned with actual site behavior
- keep analytics focused on high-signal lead and contact actions
- keep multilingual SEO surfaces stable as content and page types evolve
- make regressions visible through docs and automated tests instead of memory

## Change Triggers

Review the governance surfaces below whenever any of these happen:

- a new analytics provider, tag manager, embed, or third-party script is introduced
- a new tracked event is added, renamed, removed, or reclassified
- consent behavior, consent storage, or banner copy changes
- privacy policy or terms content changes
- a new public page type, locale, or major route is added
- canonical, alternate locale, sitemap, RSS, or structured-data rules change

## Governance Surfaces

- Analytics and consent:
  - [docs/site-operations/analytics-and-consent.md](./analytics-and-consent.md)
  - [docs/site-operations/analytics-review-routine.md](./analytics-review-routine.md)
  - `src/lib/analytics/`
  - `src/components/site/ConsentBanner.astro`
  - `src/components/site/AnalyticsScripts.astro`
- Legal pages:
  - `src/pages/privacy.astro`
  - `src/pages/terms.astro`
  - `src/pages/pt-br/privacy.astro`
  - `src/pages/pt-br/terms.astro`
- SEO operations:
  - [docs/site-operations/seo-checklist.md](./seo-checklist.md)
  - `src/components/site/SeoHead.astro`
  - `src/lib/seo/metadata.ts`
  - `src/lib/seo/schema.ts`

## Review Rhythm

- After every change to tracking, consent, legal, or SEO code: update the affected doc in the same pull request
- Monthly: run the analytics review routine and note whether tracked events still match business intent
- Before launching a new page type or locale: verify canonical URLs, alternate links, metadata defaults, and legal-link presence
- Before changing providers or adding third-party scripts: review privacy disclosures and consent requirements first

## Automated Enforcement

The following tests protect the governance baseline:

- `tests/unit/analytics-consent.test.ts`
- `tests/e2e/analytics-consent.spec.ts`
- `tests/e2e/governance.spec.ts`
- `tests/e2e/seo.spec.ts`
- `tests/e2e/integrity.spec.ts`
- `tests/e2e/smoke.spec.ts`

The standard validation commands remain:

- `pnpm check`
- `pnpm test:unit`
- `pnpm test:e2e`
- `pnpm build`

## Contributor Expectations

- do not add tracking for passive impressions unless there is a clear reporting need
- do not update legal copy without verifying the implementation still matches it
- do not add a new public route or locale without checking canonical and alternate links
- keep README links to the operations docs current so future contributors can find this material quickly
