# Phase 2 Technical SEO Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve metadata quality, multilingual SEO signals, structured data coverage, and indexing clarity across the personal website.

**Architecture:** Extend the existing centralized SEO layer rather than scattering metadata logic across pages. Keep canonical, alternate locale, and structured data generation in dedicated helpers, then update page surfaces only where page-specific titles, descriptions, or schema inputs differ.

**Tech Stack:** Astro, TypeScript, `@astrojs/sitemap`, Playwright, Vitest, existing `src/lib/seo/metadata.ts` and `src/components/site/SeoHead.astro`.

---

### Task 1: Audit and Expand the SEO Core

**Files:**
- Modify: `src/lib/seo/metadata.ts`
- Modify: `src/components/site/SeoHead.astro`
- Create: `tests/unit/seo-metadata.test.ts`

- [ ] **Step 1: Write failing unit tests for canonical generation, alternate locale generation, and page-type-aware titles/descriptions**
- [ ] **Step 2: Run `pnpm test:unit -- --run tests/unit/seo-metadata.test.ts` and verify FAIL**
- [ ] **Step 3: Extend `src/lib/seo/metadata.ts` with page-type-aware defaults and cleaner metadata contracts**
- [ ] **Step 4: Update `src/components/site/SeoHead.astro` so it emits the expanded metadata consistently**
- [ ] **Step 5: Re-run `pnpm test:unit -- --run tests/unit/seo-metadata.test.ts` and verify PASS**
- [ ] **Step 6: Commit the SEO core updates**

```bash
git add src/lib/seo/metadata.ts src/components/site/SeoHead.astro tests/unit/seo-metadata.test.ts
git commit -m "feat: strengthen shared seo metadata generation"
```

### Task 2: Add Structured Data Helpers

**Files:**
- Create: `src/lib/seo/schema.ts`
- Create: `src/components/site/StructuredData.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `tests/unit/seo-metadata.test.ts`
- Create: `tests/e2e/seo.spec.ts`

- [ ] **Step 1: Add failing tests that expect JSON-LD for site-wide surfaces and article surfaces**
- [ ] **Step 2: Run `pnpm test:unit -- --run tests/unit/seo-metadata.test.ts` and `pnpm test:e2e -- tests/e2e/seo.spec.ts` and verify FAIL**
- [ ] **Step 3: Implement `src/lib/seo/schema.ts` for `Person`, `WebSite`, and article-like schema generation**
- [ ] **Step 4: Implement `src/components/site/StructuredData.astro` to render JSON-LD safely**
- [ ] **Step 5: Mount structured data support in `src/layouts/BaseLayout.astro` without duplicating per-page head logic**
- [ ] **Step 6: Re-run the targeted unit and E2E tests and verify PASS**
- [ ] **Step 7: Commit the structured data layer**

```bash
git add src/lib/seo/schema.ts src/components/site/StructuredData.astro src/layouts/BaseLayout.astro tests/unit/seo-metadata.test.ts tests/e2e/seo.spec.ts
git commit -m "feat: add structured data support"
```

### Task 3: Improve Metadata on High-Value Pages

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/pt-br/index.astro`
- Modify: `src/pages/portfolio/index.astro`
- Modify: `src/pages/pt-br/portfolio/index.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/pt-br/blog/index.astro`
- Modify: `src/pages/blog/[slug].astro`
- Modify: `src/pages/pt-br/blog/[slug].astro`
- Modify: `src/pages/notes/index.astro`
- Modify: `src/pages/pt-br/notes/index.astro`
- Modify: `src/pages/notes/[slug].astro`
- Modify: `src/pages/pt-br/notes/[slug].astro`
- Modify: `src/pages/now/index.astro`
- Modify: `src/pages/pt-br/now/index.astro`
- Modify: `src/pages/privacy.astro`
- Modify: `src/pages/terms.astro`
- Modify: `src/pages/pt-br/privacy.astro`
- Modify: `src/pages/pt-br/terms.astro`
- Modify: `tests/e2e/seo.spec.ts`

- [ ] **Step 1: Add E2E assertions for page-specific titles, descriptions, canonicals, and hreflang tags on representative EN and PT-BR pages**
- [ ] **Step 2: Run `pnpm test:e2e -- tests/e2e/seo.spec.ts` and verify FAIL on the current metadata gaps**
- [ ] **Step 3: Update high-value landing pages with stronger explicit titles and descriptions**
- [ ] **Step 4: Update article and note page templates so summary fields and images map cleanly into the shared SEO layer**
- [ ] **Step 5: Update legal pages so they inherit non-placeholder metadata**
- [ ] **Step 6: Re-run `pnpm test:e2e -- tests/e2e/seo.spec.ts` and verify PASS**
- [ ] **Step 7: Commit the page-level metadata improvements**

```bash
git add src/pages/index.astro src/pages/pt-br/index.astro src/pages/portfolio/index.astro src/pages/pt-br/portfolio/index.astro src/pages/blog/index.astro src/pages/pt-br/blog/index.astro src/pages/blog/[slug].astro src/pages/pt-br/blog/[slug].astro src/pages/notes/index.astro src/pages/pt-br/notes/index.astro src/pages/notes/[slug].astro src/pages/pt-br/notes/[slug].astro src/pages/now/index.astro src/pages/pt-br/now/index.astro src/pages/privacy.astro src/pages/terms.astro src/pages/pt-br/privacy.astro src/pages/pt-br/terms.astro tests/e2e/seo.spec.ts
git commit -m "feat: improve metadata for core page types"
```

### Task 4: Tighten Indexing Surfaces and Multilingual Signals

**Files:**
- Create: `public/robots.txt`
- Modify: `astro.config.mjs`
- Modify: `tests/e2e/integrity.spec.ts`
- Modify: `tests/e2e/seo.spec.ts`

- [ ] **Step 1: Add failing integrity assertions for `robots.txt`, sitemap reachability, and multilingual alternate links**
- [ ] **Step 2: Run `pnpm test:e2e -- tests/e2e/integrity.spec.ts tests/e2e/seo.spec.ts` and verify FAIL where coverage is missing**
- [ ] **Step 3: Create `public/robots.txt` with the deployed site URL and sitemap reference**
- [ ] **Step 4: Review `astro.config.mjs` and adjust sitemap-related settings only if the generated output needs tightening**
- [ ] **Step 5: Re-run the targeted E2E suite and verify PASS**
- [ ] **Step 6: Commit the indexing-surface improvements**

```bash
git add public/robots.txt astro.config.mjs tests/e2e/integrity.spec.ts tests/e2e/seo.spec.ts
git commit -m "feat: add robots and multilingual seo checks"
```

### Task 5: Improve Internal Linking Cues Where SEO and UX Both Benefit

**Files:**
- Modify: `src/components/home/HomeSections.astro`
- Modify: `src/components/blog/BlogList.astro`
- Modify: `src/components/notes/NotesGrid.astro`
- Modify: `tests/e2e/home.spec.ts`
- Modify: `tests/e2e/blog.spec.ts`
- Modify: `tests/e2e/notes.spec.ts`

- [ ] **Step 1: Identify the minimum internal-linking changes that improve section discoverability without rewriting content**
- [ ] **Step 2: Add failing E2E checks for those links if coverage does not exist yet**
- [ ] **Step 3: Update homepage, blog index, and notes index surfaces with clearer navigational links where justified**
- [ ] **Step 4: Re-run `pnpm test:e2e -- tests/e2e/home.spec.ts tests/e2e/blog.spec.ts tests/e2e/notes.spec.ts` and verify PASS**
- [ ] **Step 5: Commit the internal-linking improvements**

```bash
git add src/components/home/HomeSections.astro src/components/blog/BlogList.astro src/components/notes/NotesGrid.astro tests/e2e/home.spec.ts tests/e2e/blog.spec.ts tests/e2e/notes.spec.ts
git commit -m "feat: improve internal linking cues"
```

### Task 6: Document the SEO Rules and Verify the Phase

**Files:**
- Create: `docs/site-operations/seo-checklist.md`
- Modify: `README.md`

- [ ] **Step 1: Document the metadata rules, schema choices, and multilingual SEO invariants in `docs/site-operations/seo-checklist.md`**
- [ ] **Step 2: Add a pointer from `README.md` to the SEO checklist**
- [ ] **Step 3: Run `pnpm check` and verify PASS**
- [ ] **Step 4: Run `pnpm test:unit` and verify PASS**
- [ ] **Step 5: Run `pnpm test:e2e -- tests/e2e/seo.spec.ts tests/e2e/integrity.spec.ts tests/e2e/home.spec.ts tests/e2e/blog.spec.ts tests/e2e/notes.spec.ts` and verify PASS**
- [ ] **Step 6: Run `pnpm build` and verify PASS**
- [ ] **Step 7: Commit the completed Phase 2 work**

```bash
git add docs/site-operations/seo-checklist.md README.md
git commit -m "docs: add seo maintenance checklist"
```

