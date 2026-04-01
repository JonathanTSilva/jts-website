# Analytics and Consent Operations

## Provider

- Primary provider: Plausible Analytics
- Integration mode: consent-gated client script loaded from the shared site layout
- Environment variables:
  - `PUBLIC_PLAUSIBLE_DOMAIN`
  - `PUBLIC_PLAUSIBLE_API_HOST`
  - `PUBLIC_PLAUSIBLE_SCRIPT_SRC`

## Consent Behavior

- Consent is stored in `localStorage` under `jts-consent`
- Default state is analytics disabled until a visitor makes a choice
- The consent banner is rendered site-wide through the shared layout
- Accepting consent stores `{"analytics":true,"updatedAt":"<ISO timestamp>"}`
- Rejecting consent stores `{"analytics":false,"updatedAt":"<ISO timestamp>"}`
- The Plausible script is only appended after analytics consent is granted

## Tracked Events

- `cv_download`
  - surfaces: portfolio header download button in EN and PT-BR
- `email_click`
  - surfaces: homepage hero, footer, future contact surfaces using the same attribute pattern
- `linkedin_click`
  - surfaces: homepage hero and footer
- `github_click`
  - surfaces: homepage hero and footer

## Implementation Notes

- Event hooks use `data-analytics-event` and optional `data-analytics-props`
- The global analytics script listens for click events on those attributes and dispatches Plausible custom events
- The integration is isolated in:
  - `src/lib/analytics/`
  - `src/components/site/ConsentBanner.astro`
  - `src/components/site/AnalyticsScripts.astro`

## When to Update This Document

Update this file when:

- the analytics provider changes
- the consent model changes
- a new tracked event is added or removed
- a new third-party script is introduced
- the legal pages are updated to reflect changed data collection behavior
