# Phase 3 Optimization, Monitoring, and Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the analytics, consent, legal, and SEO work from Phases 1 and 2 into a maintainable operating routine with clear documentation and regression coverage.

**Architecture:** Keep Phase 3 lightweight and operational. Prefer documentation, small helper refactors, and low-cost automated checks over new product features. Use the existing test suite and CI pipeline as the enforcement surface instead of adding a separate governance toolchain.

**Tech Stack:** Astro, TypeScript, Playwright, Vitest, GitHub Actions, docs under `docs/site-operations/`.

---

### Task 1: Capture the Site Governance Model

**Files:**
- Create: `docs/site-operations/site-governance.md`
- Create: `docs/site-operations/analytics-review-routine.md`
- Modify: `README.md`

- [ ] **Step 1: Write `docs/site-operations/site-governance.md` covering when analytics, legal copy, consent behavior, and SEO rules must be revisited**
- [ ] **Step 2: Write `docs/site-operations/analytics-review-routine.md` describing the weekly or monthly review loop for traffic, referrers, top pages, and lead/contact events**
- [ ] **Step 3: Add links to the governance docs from `README.md`**
- [ ] **Step 4: Commit the governance documentation baseline**

```bash
git add docs/site-operations/site-governance.md docs/site-operations/analytics-review-routine.md README.md
git commit -m "docs: add site governance documentation"
```

### Task 2: Refine the Event Taxonomy After Real Usage Review

**Files:**
- Modify: `src/lib/analytics/events.ts`
- Modify: `docs/site-operations/analytics-and-consent.md`
- Modify: `tests/unit/analytics-consent.test.ts`
- Modify: `tests/e2e/analytics-consent.spec.ts`

- [ ] **Step 1: Review the Phase 1 event list against real reporting needs and decide whether to keep or remove low-signal events such as `contact_section_view`**
- [ ] **Step 2: Add or update unit tests so the supported event names remain explicit and versioned**
- [ ] **Step 3: Update `src/lib/analytics/events.ts` to match the final event taxonomy**
- [ ] **Step 4: Update `docs/site-operations/analytics-and-consent.md` so the documented event list matches implementation**
- [ ] **Step 5: Re-run `pnpm test:unit -- --run tests/unit/analytics-consent.test.ts` and `pnpm test:e2e -- tests/e2e/analytics-consent.spec.ts` and verify PASS**
- [ ] **Step 6: Commit the refined event taxonomy**

```bash
git add src/lib/analytics/events.ts docs/site-operations/analytics-and-consent.md tests/unit/analytics-consent.test.ts tests/e2e/analytics-consent.spec.ts
git commit -m "chore: refine analytics event taxonomy"
```

### Task 3: Add Regression Tests for SEO and Legal Invariants

**Files:**
- Create: `tests/e2e/governance.spec.ts`
- Modify: `tests/e2e/integrity.spec.ts`
- Modify: `tests/e2e/seo.spec.ts`
- Modify: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Add failing regression checks for bilingual legal page availability, effective-date presence, canonical tags on major surfaces, and alternate locale links on translated pages**
- [ ] **Step 2: Run `pnpm test:e2e -- tests/e2e/governance.spec.ts tests/e2e/integrity.spec.ts tests/e2e/seo.spec.ts tests/e2e/smoke.spec.ts` and verify FAIL where coverage is missing**
- [ ] **Step 3: Implement the smallest code or test fixture updates required to make those invariants stable**
- [ ] **Step 4: Re-run the targeted E2E suite and verify PASS**
- [ ] **Step 5: Commit the governance regression tests**

```bash
git add tests/e2e/governance.spec.ts tests/e2e/integrity.spec.ts tests/e2e/seo.spec.ts tests/e2e/smoke.spec.ts
git commit -m "test: add governance regression coverage"
```

### Task 4: Tighten CI Expectations Around the New Governance Surfaces

**Files:**
- Modify: `.github/workflows/pipeline.yml`
- Modify: `package.json`

- [ ] **Step 1: Review whether the existing `pnpm test:e2e`, `pnpm test:unit`, `pnpm check`, and `pnpm build` steps already cover the new governance tests**
- [ ] **Step 2: Only if needed, add narrower scripts in `package.json` for SEO/legal smoke verification so they can be run locally without the full suite**
- [ ] **Step 3: Only if needed, update `.github/workflows/pipeline.yml` to call the new narrower scripts or preserve the current full-suite behavior explicitly**
- [ ] **Step 4: Run the exact local command sequence that CI will use and verify PASS**
- [ ] **Step 5: Commit any CI or script changes**

```bash
git add .github/workflows/pipeline.yml package.json
git commit -m "ci: align pipeline with governance checks"
```

### Task 5: Final Phase Verification and Handoff

**Files:**
- Modify: `docs/site-operations/site-governance.md`
- Modify: `README.md`

- [ ] **Step 1: Update `docs/site-operations/site-governance.md` with the final source-of-truth list of documents and tests**
- [ ] **Step 2: Add a short roadmap-complete note in `README.md` if that helps future contributors find the operations docs**
- [ ] **Step 3: Run `pnpm check` and verify PASS**
- [ ] **Step 4: Run `pnpm test:unit` and verify PASS**
- [ ] **Step 5: Run `pnpm test:e2e -- tests/e2e/governance.spec.ts tests/e2e/analytics-consent.spec.ts tests/e2e/seo.spec.ts tests/e2e/integrity.spec.ts tests/e2e/smoke.spec.ts` and verify PASS**
- [ ] **Step 6: Run `pnpm build` and verify PASS**
- [ ] **Step 7: Commit the completed Phase 3 work**

```bash
git add docs/site-operations/site-governance.md README.md
git commit -m "docs: finalize site governance handoff"
```

