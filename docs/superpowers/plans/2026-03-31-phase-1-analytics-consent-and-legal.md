# Phase 1 Analytics, Consent, and Legal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hosted analytics foundation with lead/contact event tracking, a compact branded consent banner, and production-ready bilingual privacy and terms pages.

**Architecture:** Keep all cross-cutting behavior centralized in the existing layout. Add a small analytics module for configuration, consent state, and event naming; render consent-aware analytics scripts from the shared layout; and update the existing legal pages instead of introducing a separate CMS or plugin layer.

**Tech Stack:** Astro, TypeScript, Playwright, Vitest, hosted analytics provider (recommended: Plausible), existing site design system.

---

### Task 1: Establish the Phase 1 File Structure

**Files:**
- Create: `src/lib/analytics/config.ts`
- Create: `src/lib/analytics/consent.ts`
- Create: `src/lib/analytics/events.ts`
- Create: `src/components/site/AnalyticsScripts.astro`
- Create: `src/components/site/ConsentBanner.astro`
- Create: `tests/unit/analytics-consent.test.ts`
- Create: `tests/e2e/analytics-consent.spec.ts`
- Modify: `src/env.d.ts`
- Modify: `README.md`

- [ ] **Step 1: Create the analytics module directory structure**
- [ ] **Step 2: Define environment-backed analytics configuration in `src/lib/analytics/config.ts`**
- [ ] **Step 3: Define consent keys, default states, and serialization helpers in `src/lib/analytics/consent.ts`**
- [ ] **Step 4: Define the allowed event names and payload shape in `src/lib/analytics/events.ts`**
- [ ] **Step 5: Add environment variable typing in `src/env.d.ts` for the selected hosted provider**
- [ ] **Step 6: Document the new environment variables and provider choice in `README.md`**
- [ ] **Step 7: Commit the scaffolding**

```bash
git add src/lib/analytics src/components/site src/env.d.ts README.md tests/unit/analytics-consent.test.ts tests/e2e/analytics-consent.spec.ts
git commit -m "chore: scaffold analytics and consent modules"
```

### Task 2: Build Consent State and Banner UI

**Files:**
- Create: `src/components/site/ConsentBanner.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css`
- Test: `tests/e2e/analytics-consent.spec.ts`
- Test: `tests/unit/analytics-consent.test.ts`

- [ ] **Step 1: Write the failing unit tests for consent parsing and persistence behavior**
- [ ] **Step 2: Run `pnpm test:unit -- --run tests/unit/analytics-consent.test.ts` and verify the new tests fail for missing logic**
- [ ] **Step 3: Implement the consent helper logic in `src/lib/analytics/consent.ts`**
- [ ] **Step 4: Create `src/components/site/ConsentBanner.astro` with EN/PT-BR copy, accept/reject actions, and a compact layout**
- [ ] **Step 5: Mount the banner in `src/layouts/BaseLayout.astro` so it is available site-wide**
- [ ] **Step 6: Add any required shared styling hooks to `src/styles/global.css` without diverging from the current visual language**
- [ ] **Step 7: Extend `tests/e2e/analytics-consent.spec.ts` to cover first-load visibility, dismissal after choice, and locale-aware copy**
- [ ] **Step 8: Run `pnpm test:unit -- --run tests/unit/analytics-consent.test.ts` and verify PASS**
- [ ] **Step 9: Run `pnpm test:e2e -- tests/e2e/analytics-consent.spec.ts` and verify PASS**
- [ ] **Step 10: Commit the banner and consent flow**

```bash
git add src/lib/analytics/consent.ts src/components/site/ConsentBanner.astro src/layouts/BaseLayout.astro src/styles/global.css tests/unit/analytics-consent.test.ts tests/e2e/analytics-consent.spec.ts
git commit -m "feat: add consent banner and persistence"
```

### Task 3: Add Consent-Gated Analytics Script Loading

**Files:**
- Create: `src/components/site/AnalyticsScripts.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/lib/analytics/config.ts`
- Modify: `tests/e2e/analytics-consent.spec.ts`

- [ ] **Step 1: Extend the E2E test to assert analytics is not initialized before consent**
- [ ] **Step 2: Run `pnpm test:e2e -- tests/e2e/analytics-consent.spec.ts` and verify FAIL on missing script gating**
- [ ] **Step 3: Implement `src/components/site/AnalyticsScripts.astro` to render the hosted provider snippet only when analytics is enabled**
- [ ] **Step 4: Add provider-specific configuration helpers in `src/lib/analytics/config.ts`**
- [ ] **Step 5: Wire `AnalyticsScripts` into `src/layouts/BaseLayout.astro` after the consent state is available**
- [ ] **Step 6: Re-run `pnpm test:e2e -- tests/e2e/analytics-consent.spec.ts` and verify PASS**
- [ ] **Step 7: Commit the consent-gated analytics integration**

```bash
git add src/components/site/AnalyticsScripts.astro src/layouts/BaseLayout.astro src/lib/analytics/config.ts tests/e2e/analytics-consent.spec.ts
git commit -m "feat: gate analytics loading on consent"
```

### Task 4: Instrument High-Value Lead and Contact Events

**Files:**
- Modify: `src/components/home/Hero.astro`
- Modify: `src/components/home/ContactSection.astro`
- Modify: `src/components/site/Footer.astro`
- Modify: `src/pages/portfolio/index.astro`
- Modify: `src/pages/pt-br/portfolio/index.astro`
- Modify: `src/lib/analytics/events.ts`
- Modify: `tests/e2e/home.spec.ts`
- Modify: `tests/e2e/portfolio.spec.ts`
- Modify: `tests/e2e/analytics-consent.spec.ts`

- [ ] **Step 1: Add E2E assertions that the hero, footer, contact section, and portfolio CV links expose stable selectors or data attributes for analytics events**
- [ ] **Step 2: Run the targeted Playwright tests and verify they fail before instrumentation**

```bash
pnpm test:e2e -- tests/e2e/home.spec.ts tests/e2e/portfolio.spec.ts tests/e2e/analytics-consent.spec.ts
```

- [ ] **Step 3: Add stable event metadata hooks to hero social links in `src/components/home/Hero.astro`**
- [ ] **Step 4: Add stable event metadata hooks to homepage contact buttons in `src/components/home/ContactSection.astro`**
- [ ] **Step 5: Add stable event metadata hooks to footer social links in `src/components/site/Footer.astro`**
- [ ] **Step 6: Add stable event metadata hooks to the CV download links in `src/pages/portfolio/index.astro` and `src/pages/pt-br/portfolio/index.astro`**
- [ ] **Step 7: Implement the client-side event dispatch bridge in `src/lib/analytics/events.ts`**
- [ ] **Step 8: Update Playwright tests to verify the expected hooks exist and do not regress across locales**
- [ ] **Step 9: Re-run the targeted Playwright tests and verify PASS**
- [ ] **Step 10: Commit the event instrumentation**

```bash
git add src/components/home/Hero.astro src/components/home/ContactSection.astro src/components/site/Footer.astro src/pages/portfolio/index.astro src/pages/pt-br/portfolio/index.astro src/lib/analytics/events.ts tests/e2e/home.spec.ts tests/e2e/portfolio.spec.ts tests/e2e/analytics-consent.spec.ts
git commit -m "feat: track lead and contact interactions"
```

### Task 5: Replace Placeholder Privacy and Terms Pages

**Files:**
- Modify: `src/pages/privacy.astro`
- Modify: `src/pages/terms.astro`
- Modify: `src/pages/pt-br/privacy.astro`
- Modify: `src/pages/pt-br/terms.astro`
- Modify: `tests/e2e/home.spec.ts`
- Modify: `tests/e2e/smoke.spec.ts`
- Modify: `tests/e2e/a11y.spec.ts`

- [ ] **Step 1: Draft the EN privacy policy content to match the implemented analytics, consent, cookies, and contact behavior**
- [ ] **Step 2: Draft the EN terms of service content for a personal portfolio/blog with downloadable CV and outbound links**
- [ ] **Step 3: Translate and adapt the privacy policy in `src/pages/pt-br/privacy.astro`**
- [ ] **Step 4: Translate and adapt the terms in `src/pages/pt-br/terms.astro`**
- [ ] **Step 5: Update E2E tests so they check for effective date, real section headings, and footer navigation to legal pages**
- [ ] **Step 6: Run `pnpm test:e2e -- tests/e2e/home.spec.ts tests/e2e/smoke.spec.ts tests/e2e/a11y.spec.ts` and verify PASS**
- [ ] **Step 7: Commit the legal pages**

```bash
git add src/pages/privacy.astro src/pages/terms.astro src/pages/pt-br/privacy.astro src/pages/pt-br/terms.astro tests/e2e/home.spec.ts tests/e2e/smoke.spec.ts tests/e2e/a11y.spec.ts
git commit -m "docs: publish privacy policy and terms pages"
```

### Task 6: Write the Phase 1 Operations Note and Verify End-to-End

**Files:**
- Create: `docs/site-operations/analytics-and-consent.md`
- Modify: `README.md`

- [ ] **Step 1: Document the selected analytics provider, tracked events, consent behavior, and legal update triggers in `docs/site-operations/analytics-and-consent.md`**
- [ ] **Step 2: Add a short pointer to that document in `README.md`**
- [ ] **Step 3: Run `pnpm check` and verify PASS**
- [ ] **Step 4: Run `pnpm test:unit` and verify PASS**
- [ ] **Step 5: Run `pnpm test:e2e -- tests/e2e/analytics-consent.spec.ts tests/e2e/home.spec.ts tests/e2e/portfolio.spec.ts tests/e2e/smoke.spec.ts tests/e2e/a11y.spec.ts` and verify PASS**
- [ ] **Step 6: Run `pnpm build` and verify PASS**
- [ ] **Step 7: Commit the completed Phase 1 work**

```bash
git add docs/site-operations/analytics-and-consent.md README.md
git commit -m "docs: add analytics and consent operations note"
```

