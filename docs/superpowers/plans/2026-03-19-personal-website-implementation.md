# Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual, static-first personal website in Astro that publishes portfolio content plus Obsidian-synced blog, notes, and now content, with strict content validation, search, RSS, theme support, and CI-based sync/deploy workflows.

**Architecture:** The site will be an Astro application with typed content collections, schema-enforced Markdown contracts, locale-aware routes, and a small set of focused UI/layout components. Content sync from the private Obsidian repository lands in versioned website-repo content directories via GitHub Actions PRs, and all validation happens in the website repo before deploy. Search is implemented as a generated static index for blog and notes, while theme and locale behavior are handled in the app shell and content layer rather than ad hoc per page.

**Tech Stack:** Astro, TypeScript, Astro Content Collections, MDX, Zod, CSS variables, Vitest, Playwright, GitHub Actions, pnpm

---

## Planned File Structure

### Core app and configuration

- Create: `package.json`
- Create: `pnpm-lock.yaml`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`
- Create: `playwright.config.ts`
- Create: `.editorconfig`
- Create: `.gitignore`

### Content and schemas

- Create: `src/content/config.ts`
- Create: `src/content/portfolio/about.en.md`
- Create: `src/content/portfolio/about.pt-br.md`
- Create: `src/content/portfolio/projects.ts`
- Create: `src/content/portfolio/publications.ts`
- Create: `src/content/portfolio/experience.ts`
- Create: `src/content/portfolio/types.ts`
- Create: `src/content/blog/`
- Create: `src/content/notes/`
- Create: `src/content/now/`
- Create: `src/content/blog/2026-03-hello-embedded-systems.en.md`
- Create: `src/content/blog/2026-03-hello-embedded-systems.pt-br.md`
- Create: `src/content/blog/2026-03-ci-firmware.en.md`
- Create: `src/content/notes/debugging-habits.en.md`
- Create: `src/content/notes/debugging-habits.pt-br.md`
- Create: `src/content/notes/rtos-scheduling.en.md`
- Create: `src/content/now/index.en.md`
- Create: `src/content/now/index.pt-br.md`
- Create: `public/assets/cv/jonathan-cv.pdf`

### Domain utilities

- Create: `src/lib/content/validation.ts`
- Create: `src/lib/content/contracts.ts`
- Create: `src/lib/content/locale.ts`
- Create: `src/lib/content/search.ts`
- Create: `src/lib/content/rss.ts`
- Create: `src/lib/seo/metadata.ts`
- Create: `src/lib/theme/theme.ts`
- Create: `src/lib/theme/theme-inline-script.ts`

### UI and pages

- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/site/Header.astro`
- Create: `src/components/site/Footer.astro`
- Create: `src/components/site/ThemeToggle.astro`
- Create: `src/components/site/LanguageSwitcher.astro`
- Create: `src/components/site/SeoHead.astro`
- Create: `src/components/home/Hero.astro`
- Create: `src/components/home/ContactSection.astro`
- Create: `src/components/blog/BlogList.astro`
- Create: `src/components/notes/NotesGrid.astro`
- Create: `src/components/notes/NotesFilters.astro`
- Create: `src/components/search/SearchDialog.astro`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/pages/index.astro`
- Create: `src/pages/portfolio/index.astro`
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/[slug].astro`
- Create: `src/pages/notes/index.astro`
- Create: `src/pages/notes/[slug].astro`
- Create: `src/pages/now/index.astro`
- Create: `src/pages/rss.xml.ts`
- Create: `src/pages/notes/rss.xml.ts`
- Create: `src/pages/api/search-index.json.ts`
- Create: `src/pages/pt-br/index.astro`
- Create: `src/pages/pt-br/portfolio/index.astro`
- Create: `src/pages/pt-br/blog/index.astro`
- Create: `src/pages/pt-br/blog/[slug].astro`
- Create: `src/pages/pt-br/notes/index.astro`
- Create: `src/pages/pt-br/notes/[slug].astro`
- Create: `src/pages/pt-br/now/index.astro`

### Automation and validation

- Create: `scripts/validate-content.mjs`
- Create: `scripts/sync-content.mjs`
- Create: `scripts/build-search-index.mjs`
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/sync-content.yml`
- Create: `.github/workflows/deploy.yml`
- Create: `docs/automation/private-repo-sync-example.yml`
- Create: `docs/content-contracts/blog-template.md`
- Create: `docs/content-contracts/note-template.md`
- Create: `docs/content-contracts/now-template.md`

### Tests

- Create: `tests/unit/content/contracts.test.ts`
- Create: `tests/unit/content/locale.test.ts`
- Create: `tests/unit/content/search.test.ts`
- Create: `tests/e2e/home.spec.ts`
- Create: `tests/e2e/blog.spec.ts`
- Create: `tests/e2e/notes.spec.ts`
- Create: `tests/e2e/now.spec.ts`
- Create: `tests/e2e/theme.spec.ts`

## Implementation Decisions Locked In

- English uses unprefixed routes such as `/blog/my-post`.
- Brazilian Portuguese uses `/pt-br/...` routes.
- Search covers blog and notes only in the initial milestone.
- Locale-scoped indexes and search results show only active-locale items by default.
- When a translation is missing, locale switching routes users to the original-language page with a notice instead of generating a fake translated page.
- Manual sync is implemented as a GitHub Actions `workflow_dispatch` workflow in the website repo.
- Automatic sync is implemented by a website-repo workflow that accepts `repository_dispatch` from the private repo and reuses the same sync script as manual sync.
- Notes RSS is included in the initial implementation because it is low-cost once the feed pipeline exists.
- Theme behavior defaults to system preference, with user override stored in `localStorage`.

## Task 1: Bootstrap the Astro application and test harness

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`
- Create: `playwright.config.ts`
- Create: `.editorconfig`
- Create: `.gitignore`
- Create: `src/styles/global.css`
- Test: `package.json`

- [ ] **Step 1: Write the baseline project scripts and dependency list**

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:install": "playwright install --with-deps chromium",
    "test": "pnpm test:unit && pnpm test:e2e",
    "lint:content": "node scripts/validate-content.mjs"
  }
}
```

- [ ] **Step 2: Configure Astro integrations and strict TypeScript**

```js
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://example.com",
  integrations: [mdx(), sitemap()]
});
```

- [ ] **Step 3: Add the Playwright harness for later route and interaction tests**

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://127.0.0.1:4321" },
  webServer: {
    command: "pnpm astro dev --host 127.0.0.1 --port 4321",
    port: 4321,
    reuseExistingServer: !process.env.CI
  }
});
```

- [ ] **Step 4: Install dependencies and verify the app boots**

Run: `pnpm install`  
Expected: install completes without peer dependency failures

Run: `pnpm test:e2e:install`  
Expected: Playwright browser install completes successfully

Run: `pnpm astro check`  
Expected: exits successfully on the empty scaffold

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs tsconfig.json src/env.d.ts playwright.config.ts .editorconfig .gitignore src/styles/global.css
git commit -m "chore: bootstrap Astro website"
```

## Task 2: Define content collections, locale contracts, and fixtures

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/portfolio/about.en.md`
- Create: `src/content/portfolio/about.pt-br.md`
- Create: `src/content/portfolio/projects.ts`
- Create: `src/content/portfolio/publications.ts`
- Create: `src/content/portfolio/experience.ts`
- Create: `src/content/portfolio/types.ts`
- Create: `src/lib/content/locale.ts`
- Create: `src/content/blog/.gitkeep`
- Create: `src/content/notes/.gitkeep`
- Create: `src/content/now/.gitkeep`
- Create: `src/content/blog/2026-03-hello-embedded-systems.en.md`
- Create: `src/content/blog/2026-03-hello-embedded-systems.pt-br.md`
- Create: `src/content/blog/2026-03-ci-firmware.en.md`
- Create: `src/content/notes/debugging-habits.en.md`
- Create: `src/content/notes/debugging-habits.pt-br.md`
- Create: `src/content/notes/rtos-scheduling.en.md`
- Create: `src/content/now/index.en.md`
- Create: `src/content/now/index.pt-br.md`
- Create: `docs/content-contracts/blog-template.md`
- Create: `docs/content-contracts/note-template.md`
- Create: `docs/content-contracts/now-template.md`
- Test: `tests/unit/content/locale.test.ts`

- [ ] **Step 1: Write failing locale/content tests**

```ts
import { describe, expect, it } from "vitest";
import { contentLocalePath, isDefaultLocale } from "../../../src/lib/content/locale";

describe("locale helpers", () => {
  it("uses unprefixed routes for english", () => {
    expect(contentLocalePath("en", "/blog/test")).toBe("/blog/test");
  });

  it("prefixes brazilian portuguese routes", () => {
    expect(contentLocalePath("pt-br", "/blog/test")).toBe("/pt-br/blog/test");
  });

  it("marks english as the default locale", () => {
    expect(isDefaultLocale("en")).toBe(true);
  });
});
```

- [ ] **Step 2: Implement collection schemas with Zod**

```ts
const sharedLocalizedSchema = z.object({
  title: z.string(),
  language: z.enum(["en", "pt-br"]),
  translationKey: z.string().min(1)
});
```

- [ ] **Step 3: Seed representative content fixtures for deterministic tests**

Create fixtures covering:
- one translated blog pair
- one English-only blog post
- one translated note pair
- one English-only note
- one translated now page pair

Each fixture must use valid contract-compliant frontmatter so later build, RSS, search, and translation fallback tests have real content to exercise.

- [ ] **Step 4: Define and populate the localized portfolio data model**

Define explicit TypeScript types for:
- localized string fields
- project entries
- publication entries
- experience entries

Populate initial data in:
- `src/content/portfolio/projects.ts`
- `src/content/portfolio/publications.ts`
- `src/content/portfolio/experience.ts`

Populate initial narrative content in:
- `src/content/portfolio/about.en.md`
- `src/content/portfolio/about.pt-br.md`

These files must be sufficient for Task 5 to render homepage highlights and the full portfolio page in both locales without inventing new data structures.

- [ ] **Step 5: Add template docs matching the Obsidian contract**

Template docs must show:
- required frontmatter
- required sections
- allowed optional fields
- one valid example per content type

- [ ] **Step 6: Run tests and type checks**

Run: `pnpm test:unit tests/unit/content/locale.test.ts`  
Expected: PASS

Run: `pnpm astro check`  
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/content docs/content-contracts tests/unit/content/locale.test.ts src/content/config.ts src/lib/content/locale.ts
git commit -m "feat: add content collections and locale contracts"
```

## Task 3: Implement strict content validation and publish-blocking checks

**Files:**
- Create: `src/lib/content/contracts.ts`
- Create: `src/lib/content/validation.ts`
- Create: `scripts/validate-content.mjs`
- Test: `tests/unit/content/contracts.test.ts`

- [ ] **Step 1: Write failing validation tests**

```ts
it("rejects a blog post missing summary", async () => {
  const result = await validateFrontmatter("blog", {
    title: "Post",
    slug: "post",
    translationKey: "post",
    language: "en",
    publishedAt: "2026-03-19"
  });

  expect(result.success).toBe(false);
  expect(result.errors[0]).toContain("summary");
});
```

- [ ] **Step 2: Implement contract validators**

```ts
export function requireSections(body: string, headings: string[]) {
  return headings.filter((heading) => !body.includes(`## ${heading}`));
}
```

- [ ] **Step 3: Implement the CLI validator used by CI**

Run: `node scripts/validate-content.mjs`  
Expected: exits `0` with valid fixtures and exits non-zero on malformed fixtures

- [ ] **Step 4: Run the validation-focused test suite**

Run: `pnpm test:unit tests/unit/content/contracts.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/contracts.ts src/lib/content/validation.ts scripts/validate-content.mjs tests/unit/content/contracts.test.ts
git commit -m "feat: add strict content validation"
```

## Task 4: Build the global shell with themes, locale switching, and design tokens

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/site/Header.astro`
- Create: `src/components/site/Footer.astro`
- Create: `src/components/site/ThemeToggle.astro`
- Create: `src/components/site/LanguageSwitcher.astro`
- Create: `src/components/site/SeoHead.astro`
- Create: `src/lib/seo/metadata.ts`
- Create: `src/lib/theme/theme.ts`
- Create: `src/lib/theme/theme-inline-script.ts`
- Create: `src/styles/tokens.css`
- Modify: `src/styles/global.css`
- Test: `tests/e2e/theme.spec.ts`

- [ ] **Step 1: Write the failing theme behavior test**

```ts
test("persists manual theme override", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
```

- [ ] **Step 2: Define theme tokens and inline hydration-safe theme initialization**

```ts
const STORAGE_KEY = "theme-preference";
```

- [ ] **Step 3: Implement header/footer shell with locale-aware nav**

Navigation must include:
- Home
- Portfolio
- Blog
- Notes
- Now

- [ ] **Step 4: Add a shared search entry point to the shell**

The shell should include the trigger and container for the global search dialog, even if the search index implementation lands in Task 7.

- [ ] **Step 5: Add SEO and social metadata defaults to the layout**

Metadata support must cover:
- page title and description
- canonical URLs
- locale-aware alternate URLs
- Open Graph title, description, URL, and type
- Twitter card defaults

- [ ] **Step 6: Run unit and e2e checks**

Run: `pnpm test:e2e tests/e2e/theme.spec.ts`  
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/layouts src/components/site src/lib/theme src/lib/seo src/styles tests/e2e/theme.spec.ts
git commit -m "feat: add site shell themes and locale switching"
```

## Task 5: Implement homepage and portfolio pages

**Files:**
- Create: `src/components/home/Hero.astro`
- Create: `src/components/home/ContactSection.astro`
- Create: `src/pages/index.astro`
- Create: `src/pages/pt-br/index.astro`
- Create: `src/pages/portfolio/index.astro`
- Create: `src/pages/pt-br/portfolio/index.astro`
- Test: `tests/e2e/home.spec.ts`

- [ ] **Step 1: Write failing homepage test coverage**

```ts
test("homepage exposes portfolio, blog, notes, now, and contact section", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /portfolio/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /blog/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /notes/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /now/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /download cv/i })).toBeVisible();
  await expect(page.getByText(/contact/i)).toBeVisible();
});
```

- [ ] **Step 2: Render hybrid homepage sections and portfolio page**

Homepage must include:
- hero
- selected projects/publications
- latest blog posts
- latest notes
- call-to-action to the full portfolio
- call-to-action to download the CV
- contact section

Portfolio must include:
- about
- experience
- projects
- publications
- CV download

- [ ] **Step 3: Add Portuguese route variants with translated copy**

- [ ] **Step 4: Run the page tests**

Run: `pnpm test:e2e tests/e2e/home.spec.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/home src/pages/index.astro src/pages/pt-br/index.astro src/pages/portfolio/index.astro src/pages/pt-br/portfolio/index.astro src/content/portfolio public/assets/cv/jonathan-cv.pdf tests/e2e/home.spec.ts
git commit -m "feat: add homepage and portfolio pages"
```

## Task 6: Implement blog pages and blog RSS

**Files:**
- Create: `src/components/blog/BlogList.astro`
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/[slug].astro`
- Create: `src/pages/pt-br/blog/index.astro`
- Create: `src/pages/pt-br/blog/[slug].astro`
- Create: `src/lib/content/rss.ts`
- Create: `src/pages/rss.xml.ts`
- Test: `tests/e2e/blog.spec.ts`

- [ ] **Step 1: Write failing blog tests**

```ts
test("blog index groups posts by year and month", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByText("2026")).toBeVisible();
  await expect(page.getByText("March")).toBeVisible();
});
```

- [ ] **Step 2: Implement locale-aware blog loaders and grouped index rendering**

- [ ] **Step 3: Implement blog detail pages and missing-translation notice behavior**

- [ ] **Step 4: Add language-availability labels on blog indexes for entries missing a translation**

- [ ] **Step 5: Generate the blog RSS feed**

Run: `pnpm build`  
Expected: generated output includes `dist/rss.xml`

- [ ] **Step 6: Commit**

```bash
git add src/components/blog src/pages/blog src/pages/pt-br/blog src/lib/content/rss.ts src/pages/rss.xml.ts tests/e2e/blog.spec.ts
git commit -m "feat: add blog pages and RSS feed"
```

## Task 7: Implement notes pages, filters, search, and notes RSS

**Files:**
- Create: `src/components/notes/NotesGrid.astro`
- Create: `src/components/notes/NotesFilters.astro`
- Create: `src/components/search/SearchDialog.astro`
- Create: `src/lib/content/search.ts`
- Create: `scripts/build-search-index.mjs`
- Create: `src/pages/notes/index.astro`
- Create: `src/pages/notes/[slug].astro`
- Create: `src/pages/pt-br/notes/index.astro`
- Create: `src/pages/pt-br/notes/[slug].astro`
- Create: `src/pages/api/search-index.json.ts`
- Create: `src/pages/notes/rss.xml.ts`
- Test: `tests/unit/content/search.test.ts`
- Test: `tests/e2e/notes.spec.ts`

- [ ] **Step 1: Write failing search and notes browse tests**

```ts
it("builds locale-scoped search results from blog and notes content", async () => {
  const results = await buildSearchIndex({ locale: "en" });
  expect(results.every((entry) => entry.locale === "en")).toBe(true);
});
```

```ts
test("notes page exposes category filters and cards", async ({ page }) => {
  await page.goto("/notes");
  await expect(page.getByRole("button", { name: /all/i })).toBeVisible();
  await expect(page.locator("[data-note-card]")).toHaveCount(1);
});
```

- [ ] **Step 2: Implement notes grouping, filters, and locale-aware detail routes**

- [ ] **Step 3: Add language-availability labels on notes indexes for entries missing a translation**

- [ ] **Step 4: Implement static search index generation and keyboard-open search dialog**

The search index must include and rank:
- title with highest weight
- tags and categories with high weight
- content excerpts or body text with lower weight
- locale
- content type
- URL

The initial search experience must search blog and notes only.

- [ ] **Step 5: Generate notes RSS feed**

Run: `pnpm build`  
Expected: generated output includes `dist/notes/rss.xml`

- [ ] **Step 6: Run unit and e2e verification**

Run: `pnpm test:unit tests/unit/content/search.test.ts`  
Expected: PASS

Run: `pnpm test:e2e tests/e2e/notes.spec.ts`  
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/notes src/components/search src/lib/content/search.ts scripts/build-search-index.mjs src/pages/notes src/pages/pt-br/notes src/pages/api/search-index.json.ts src/pages/notes/rss.xml.ts tests/unit/content/search.test.ts tests/e2e/notes.spec.ts
git commit -m "feat: add notes search filters and RSS"
```

## Task 8: Implement the now page and translation fallback behavior

**Files:**
- Create: `src/pages/now/index.astro`
- Create: `src/pages/pt-br/now/index.astro`
- Test: `tests/e2e/now.spec.ts`

- [ ] **Step 1: Write the failing now page test**

```ts
test("now page renders current focus content from synced markdown", async ({ page }) => {
  await page.goto("/now");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
```

- [ ] **Step 2: Render the now page from its single-entry collection**

- [ ] **Step 3: Implement missing-translation routing to original-language now page with notice**

- [ ] **Step 4: Run the now page test**

Run: `pnpm test:e2e tests/e2e/now.spec.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/now src/pages/pt-br/now tests/e2e/now.spec.ts
git commit -m "feat: add now page"
```

## Task 9: Implement CI, sync workflows, and deployment gates

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/sync-content.yml`
- Create: `.github/workflows/deploy.yml`
- Create: `scripts/sync-content.mjs`
- Create: `docs/automation/private-repo-sync-example.yml`
- Modify: `scripts/validate-content.mjs`
- Modify: `scripts/build-search-index.mjs`

- [ ] **Step 1: Write workflow expectations into the YAMLs**

`ci.yml` must run:
- install
- `pnpm test:e2e:install`
- `pnpm astro check`
- `pnpm lint:content`
- `pnpm test:unit`
- `pnpm test:e2e`
- `pnpm build`

`sync-content.yml` must:
- expose `workflow_dispatch`
- expose `repository_dispatch` with an event such as `obsidian-content_updated`
- check out the website repo
- check out the private Obsidian repo into a temporary path using a read-only PAT or GitHub App token
- copy `08-Publish/Blog`, `08-Publish/Notes`, and `08-Publish/now.md` into `src/content/blog`, `src/content/notes`, and `src/content/now`
- run `node scripts/sync-content.mjs` to normalize filenames and clean removed entries
- run `pnpm lint:content`
- open or update a PR using a PR automation action

`docs/automation/private-repo-sync-example.yml` must:
- show the private-repo workflow that triggers on pushes affecting `08-Publish/**`
- dispatch the `repository_dispatch` event to the website repo
- document the required secret/token scope

`deploy.yml` must:
- run only after CI passes on the default branch

- [ ] **Step 2: Implement workflow files**

The sync implementation must reuse one script for both automatic and manual sync paths so content-copying logic exists in one place.

- [ ] **Step 3: Validate workflow syntax locally as far as practical**

Run: `pnpm build`  
Expected: PASS before deploy workflow is trusted

- [ ] **Step 4: Commit**

```bash
git add .github/workflows scripts/validate-content.mjs scripts/build-search-index.mjs
git commit -m "ci: add validation sync and deploy workflows"
```

## Task 10: Final QA, accessibility, and docs polish

**Files:**
- Modify: `README.md`
- Modify: `docs/content-contracts/blog-template.md`
- Modify: `docs/content-contracts/note-template.md`
- Modify: `docs/content-contracts/now-template.md`

- [ ] **Step 1: Write a project README**

README must document:
- local setup
- content directories
- locale route rules
- theme behavior
- sync workflow entry points
- validation workflow

- [ ] **Step 2: Add lightweight accessibility verification**

Verify:
- keyboard access for theme toggle
- keyboard access for locale switcher
- keyboard access for opening and using search
- visible focus states on interactive controls

- [ ] **Step 3: Run the full verification suite**

Run: `pnpm lint:content`  
Expected: PASS

Run: `pnpm test:unit`  
Expected: PASS

Run: `pnpm test:e2e`  
Expected: PASS

Run: `pnpm build`  
Expected: PASS with generated static output

Verify manually or by view-source checks:
- homepage has title, description, and canonical metadata
- blog posts emit Open Graph and Twitter metadata
- localized pages emit canonical and alternate locale links

- [ ] **Step 4: Commit**

```bash
git add README.md docs/content-contracts docs/automation
git commit -m "docs: finalize website setup and content contracts"
```

## Execution Notes

- Execute tasks in order.
- Do not start page implementation before content contracts and validation exist.
- Do not add a backend search service or CMS in this milestone.
- Keep components small and responsibility-focused.
- If a task reveals that a single file is growing too large, split it before continuing rather than accumulating complexity.

## Suggested Verification Checkpoints

- After Task 3: content validation and schema layer are stable.
- After Task 5: homepage and portfolio routes are usable in both locales.
- After Task 7: notes/search/RSS behavior is complete and testable.
- After Task 9: sync and deployment gates reflect the spec.
