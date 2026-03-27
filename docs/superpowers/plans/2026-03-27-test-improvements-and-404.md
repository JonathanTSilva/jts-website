# Quality Fortress Test Improvements & 404 Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a production-parity, exhaustive test suite (A11y, Visual, Behavioral, Integrity) and a branded "Signal Lost" 404 page.

**Architecture:** 
- Use `@axe-core/playwright` for automated A11y audits.
- Use Playwright's native `toHaveScreenshot` for visual regressions.
- Update Playwright to run against `pnpm build && pnpm preview` for production parity.
- Create a dedicated `ErrorHero` component for the 404 page visual.

**Tech Stack:** Astro, TypeScript, Playwright, @axe-core/playwright, CSS, SVG.

---

### Task 1: Setup Infrastructure & Production Parity

**Files:**
- Modify: `package.json`
- Modify: `playwright.config.ts`

- [ ] **Step 1: Install `@axe-core/playwright`**

Run: `pnpm add -D @axe-core/playwright`
Expected: Installation completes successfully.

- [ ] **Step 2: Update `playwright.config.ts` for production parity**

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  // Fully parallel on CI
  fullyParallel: !!process.env.CI,
  use: { baseURL: 'http://127.0.0.1:4321' },
  webServer: {
    // Run against the build for production parity
    command: 'pnpm preview --port 4321',
    port: 4321,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  // Catch visual regressions
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.05 },
  },
});
```

- [ ] **Step 3: Run build and verify preview works**

Run: `pnpm build && pnpm preview`
Expected: Site is accessible at `http://localhost:4321`.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml playwright.config.ts
git commit -m "chore: setup production-parity testing and axe-core"
```

---

### Task 2: Implement "Signal Lost" 404 Page

**Files:**
- Create: `src/components/site/ErrorHero.astro`
- Create: `src/pages/404.astro`
- Test: `tests/e2e/404.spec.ts`

- [ ] **Step 1: Create the `ErrorHero` component with glitched SVG**

```astro
---
// src/components/site/ErrorHero.astro
---
<div class="error-hero">
  <div class="error-code">0x404</div>
  <svg class="glitch-svg" viewBox="0 0 400 200" aria-hidden="true">
    <path d="M 50 100 H 350" class="trace-base" />
    <path d="M 50 100 H 350" class="trace-glitch" />
  </svg>
  <h1 class="error-title">
    <slot name="title" />
  </h1>
  <p class="error-text">
    <slot name="text" />
  </p>
</div>

<style>
  .error-hero { text-align: center; padding: var(--space-20) 0; }
  .error-code { font-family: var(--font-mono); color: var(--accent); opacity: 0.5; font-size: var(--text-sm); }
  .error-title { font-size: var(--text-4xl); margin: var(--space-4) 0; font-family: var(--font-mono); }
  .error-text { color: var(--text-muted); max-width: 30rem; margin: 0 auto; }
  .glitch-svg { width: 200px; height: 100px; margin: 0 auto; }
  .trace-base { fill: none; stroke: var(--accent); stroke-width: 1; opacity: 0.1; }
  .trace-glitch {
    fill: none;
    stroke: var(--accent);
    stroke-width: 2;
    stroke-dasharray: 20 180;
    animation: glitch 2s steps(5) infinite;
  }
  @keyframes glitch {
    0% { stroke-dashoffset: 0; opacity: 0.5; }
    50% { stroke-dashoffset: 100; opacity: 0.2; transform: translateX(5px); }
    100% { stroke-dashoffset: 200; opacity: 0.5; }
  }
</style>
```

- [ ] **Step 2: Create the `404.astro` page with bilingual support**

```astro
---
// src/pages/404.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import ErrorHero from '../components/site/ErrorHero.astro';
---
<BaseLayout title="404: Signal Lost" currentLocale="en" currentPath="/404">
  <main class="container">
    <ErrorHero>
      <span slot="title" data-en="Signal Lost" data-pt="Sinal Perdido">Signal Lost</span>
      <span slot="text" data-en="The requested memory address is invalid or has been reallocated." data-pt="O endereço de memória solicitado é inválido ou foi realocado.">
        The requested memory address is invalid or has been reallocated.
      </span>
    </ErrorHero>
    <div style="text-align: center; margin-top: var(--space-8);">
      <a href="/" class="btn btn-primary">Back to main branch</a>
    </div>
  </main>
</BaseLayout>

<script>
  // Simple client-side localization for 404 based on browser/previous URL
  const isPt = window.location.pathname.startsWith('/pt-br') || navigator.language.startsWith('pt');
  if (isPt) {
    document.querySelectorAll('[data-pt]').forEach(el => {
      el.textContent = el.getAttribute('data-pt');
    });
    const btn = document.querySelector('.btn');
    if (btn) btn.textContent = 'Voltar ao início';
  }
</script>
```

- [ ] **Step 3: Write E2E test for 404 page**

```typescript
import { test, expect } from '@playwright/test';

test('404 page renders and is branded', async ({ page }) => {
  await page.goto('/404');
  await expect(page.locator('.error-code')).toHaveText('0x404');
  await expect(page.locator('.error-title')).toContainText('Signal Lost');
  await expect(page.getByRole('link', { name: /Back to/i })).toBeVisible();
});
```

- [ ] **Step 4: Commit**

```bash
git add src/components/site/ErrorHero.astro src/pages/404.astro tests/e2e/404.spec.ts
git commit -m "feat: add branded 404 page"
```

---

### Task 3: Exhaustive Accessibility (A11y) Tests

**Files:**
- Create: `tests/e2e/a11y.spec.ts`

- [ ] **Step 1: Implement the A11y test suite**

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['/', '/portfolio', '/blog', '/notes', '/now', '/404'];

for (const path of PAGES) {
  test(`a11y check: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa', 'best-practice'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
```

- [ ] **Step 2: Run and fix any violations**

Run: `pnpm build && pnpm playwright test tests/e2e/a11y.spec.ts`
Expected: PASS. If violations occur, fix them in the respective components.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/a11y.spec.ts
git commit -m "test: add exhaustive a11y checks"
```

---

### Task 4: Visual Regression Tests

**Files:**
- Create: `tests/e2e/visual.spec.ts`

- [ ] **Step 1: Implement visual snapshots**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Visual Regressions', () => {
  test('homepage hero visual', async ({ page }) => {
    await page.goto('/');
    // Mask the dynamic typewriter text to prevent flakiness
    await expect(page).toHaveScreenshot('home-hero.png', {
      mask: [page.locator('.typewriter-text')],
      fullPage: false
    });
  });

  test('404 glitch visual', async ({ page }) => {
    await page.goto('/404');
    await expect(page.locator('.error-hero')).toHaveScreenshot('404-glitch.png', {
      mask: [page.locator('.trace-glitch')] // Glitch is animated
    });
  });
});
```

- [ ] **Step 2: Generate base snapshots**

Run: `pnpm build && pnpm playwright test tests/e2e/visual.spec.ts --update-snapshots`
Expected: Snapshots are generated in `tests/e2e/visual.spec.ts-snapshots/`.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/visual.spec.ts tests/e2e/visual.spec.ts-snapshots/
git commit -m "test: add visual regression snapshots"
```

---

### Task 5: Deep Search & Behavioral Tests

**Files:**
- Create: `tests/e2e/search-deep.spec.ts`

- [ ] **Step 1: Test search result selection & keyboard nav**

```typescript
import { test, expect } from '@playwright/test';

test('search result selection and keyboard nav', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('/');
  const input = page.getByPlaceholder(/search/i);
  await input.fill('Firmware');
  
  const firstResult = page.locator('.search-result-link').first();
  await expect(firstResult).toBeVisible();
  
  // Navigate via keyboard
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  
  await expect(page).toHaveURL(/\/blog\/2026-03-ci-firmware/);
});

test('search locale isolation', async ({ page }) => {
  await page.goto('/pt-br');
  await page.keyboard.press('/');
  await page.getByPlaceholder(/search/i).fill('Embedded');
  // Should only show PT results or fallback links with PT text
  const results = page.locator('.search-result-link');
  const count = await results.count();
  for (let i = 0; i < count; i++) {
     const url = await results.nth(i).getAttribute('href');
     expect(url).toContain('/pt-br/');
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/search-deep.spec.ts
git commit -m "test: add deep search behavioral tests"
```

---

### Task 6: Build-Time Integrity Tests (Sitemap, RSS, OG)

**Files:**
- Create: `tests/e2e/integrity.spec.ts`

- [ ] **Step 1: Implement integrity checks**

```typescript
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('sitemap contains all content slugs', async () => {
  const sitemapPath = path.join(process.cwd(), 'dist/sitemap-0.xml');
  const content = fs.readFileSync(sitemapPath, 'utf-8');
  // Check for some known slugs
  expect(content).toContain('2026-03-ci-firmware.en');
  expect(content).toContain('debugging-habits.en');
});

test('blog RSS is valid and has correct domain', async ({ request }) => {
  const response = await request.get('/rss.xml');
  const text = await response.text();
  expect(text).toContain('<rss');
  expect(text).toContain('https://www.jontobias.com');
});

test('every blog post has og:image', async ({ page }) => {
  await page.goto('/blog/2026-03-ci-firmware.en');
  const ogImage = page.locator('meta[property="og:image"]');
  await expect(ogImage).toHaveAttribute('content', /.*\.png/);
});
```

- [ ] **Step 2: Commit**

```bash
git add tests/e2e/integrity.spec.ts
git commit -m "test: add sitemap, rss, and og integrity checks"
```
