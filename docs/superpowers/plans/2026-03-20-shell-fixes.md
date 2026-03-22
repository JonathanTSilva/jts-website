# Shell Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all shell-layer bugs and UX issues — header fixed positioning, tubelight click-only behavior, inline search bar, hamburger icon, mobile theme toggle, and language switcher removal.

**Architecture:** All changes are confined to `Header.astro`, `ThemeToggle.astro`, `tokens.css`, and `global.css`. No new components are created. Each task is independently testable via Playwright E2E tests in `tests/e2e/header.spec.ts`.

**Tech Stack:** Astro, vanilla TypeScript (inline `<script>`), CSS custom properties, Playwright E2E

**Prerequisite:** The `feature/frontend-redesign` branch must be merged into `main` before this plan is executed. All token and component references below correspond to that codebase, not the original `main`.

**Spec:** `docs/superpowers/specs/2026-03-20-shell-fixes-design.md`

---

## Planned File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/styles/tokens.css` | Add `--z-header` token |
| Modify | `src/styles/global.css` | Add `padding-top` to `.site-wrapper` |
| Modify | `src/components/site/Header.astro` | All header fixes (positioning, nav, search, hamburger, language switcher removal) |
| Modify | `src/components/site/ThemeToggle.astro` | Fix `querySelectorAll` wiring + moon SVG |
| Create | `tests/e2e/header.spec.ts` | E2E tests for all shell fixes |
| Modify | `tests/e2e/theme.spec.ts` | Add mobile theme toggle test |

---

## Task 1: Header Fixed Positioning

**Files:**
- Modify: `src/styles/tokens.css` (add `--z-header`)
- Modify: `src/styles/global.css` (`.site-wrapper` padding-top)
- Modify: `src/components/site/Header.astro` (position, z-index, inner max-width)
- Create: `tests/e2e/header.spec.ts`

- [ ] **Step 1: Write failing E2E test**

Create `tests/e2e/header.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Header', () => {
  test('header is fixed at top and content is not hidden beneath it', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('#site-header');
    const position = await header.evaluate(el =>
      window.getComputedStyle(el).position
    );
    expect(position).toBe('fixed');

    // Scroll down and verify header is still visible
    await page.evaluate(() => window.scrollBy(0, 500));
    await expect(header).toBeVisible();

    // Verify content is not hidden under the header
    const wrapper = page.locator('.site-wrapper');
    const paddingTop = await wrapper.evaluate(el =>
      parseInt(window.getComputedStyle(el).paddingTop)
    );
    expect(paddingTop).toBeGreaterThan(0);
  });

  test('header inner content is constrained by container-max', async ({ page }) => {
    await page.goto('/');
    const inner = page.locator('.header-inner');
    // Verify max-width is set (any non-'none' value from the token is acceptable)
    const maxWidth = await inner.evaluate(el =>
      window.getComputedStyle(el).maxWidth
    );
    expect(maxWidth).not.toBe('none');
    // At viewport wider than 52rem, inner should not fill the full viewport
    await page.setViewportSize({ width: 1400, height: 800 });
    const innerBox = await inner.boundingBox();
    expect(innerBox!.width).toBeLessThan(1400);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd <worktree-path> && pnpm test:e2e tests/e2e/header.spec.ts
```

Expected: FAIL — `position` is `sticky`, not `fixed`.

- [ ] **Step 3: Add `--z-header` token to `tokens.css`**

In `src/styles/tokens.css`, in the `:root` block after the `--wide-max` line:

```css
  /* Z-index scale */
  --z-header: 100;
```

- [ ] **Step 4: Fix header positioning and inner width in `Header.astro`**

In the `<style>` block of `src/components/site/Header.astro`:

Change the full `.site-header` rule from:
```css
  .site-header {
    position: sticky;
    top: 0;
    z-index: 50;
    width: 100%;
    background: transparent;
    transition: background var(--duration-base) var(--ease-in-out),
                border-color var(--duration-base) var(--ease-in-out),
                backdrop-filter var(--duration-base) var(--ease-in-out);
    border-bottom: 1px solid transparent;
  }
```
To:
```css
  .site-header {
    position: fixed;
    top: 0;
    z-index: var(--z-header);
    width: 100%;
    background: transparent;
    transition: background var(--duration-base) var(--ease-in-out),
                border-color var(--duration-base) var(--ease-in-out),
                backdrop-filter var(--duration-base) var(--ease-in-out);
    border-bottom: 1px solid transparent;
  }
```

Change `.header-inner` `max-width` from:
```css
    max-width: var(--wide-max);
```
To:
```css
    max-width: var(--container-max);
```

- [ ] **Step 5: Add `padding-top` to `.site-wrapper` in `global.css`**

In `src/styles/global.css`, update `.site-wrapper`:

```css
.site-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 4rem; /* matches header height */
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd <worktree-path> && pnpm test:e2e tests/e2e/header.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Run full build to confirm no regressions**

```bash
cd <worktree-path> && pnpm build
```

Expected: 0 errors.

- [ ] **Step 8: Commit**

```bash
git add src/styles/tokens.css src/styles/global.css src/components/site/Header.astro tests/e2e/header.spec.ts
git commit -m "fix: make header fixed-position with container-max alignment and body offset"
```

---

## Task 2: Tubelight Click-Only + Nav Hover Pill

**Files:**
- Modify: `src/components/site/Header.astro`

- [ ] **Step 1: Add failing E2E tests**

Add to `tests/e2e/header.spec.ts` (inside the `test.describe('Header', ...)` block):

```typescript
  test('tubelight indicator does not move on hover', async ({ page }) => {
    await page.goto('/');
    const indicator = page.locator('.nav-indicator');

    // Get initial position on page load
    const initialLeft = await indicator.evaluate(el =>
      (el as HTMLElement).style.left
    );

    // Hover a non-active link
    const links = page.locator('.nav-list a');
    const count = await links.count();
    // Find a non-active link to hover
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const isActive = await link.evaluate(el => el.classList.contains('active'));
      if (!isActive) {
        await link.hover();
        break;
      }
    }

    const afterHoverLeft = await indicator.evaluate(el =>
      (el as HTMLElement).style.left
    );
    expect(afterHoverLeft).toBe(initialLeft);
  });

  test('nav links show hover background pill (CSS only)', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('.nav-list a');
    const firstLink = links.first();
    await firstLink.hover();
    const hasHoverTransition = await firstLink.evaluate(el =>
      window.getComputedStyle(el).transition.includes('background')
    );
    expect(hasHoverTransition).toBe(true);
  });

  test('tubelight indicator lands on correct link on PT-BR route', async ({ page }) => {
    await page.goto('/pt-br');
    const indicator = page.locator('.nav-indicator');
    const activeLink = page.locator('.nav-list a.active');

    // Indicator must be visible (opacity: 1 set via JS)
    const opacity = await indicator.evaluate(el =>
      (el as HTMLElement).style.opacity
    );
    expect(opacity).toBe('1');

    // Indicator left position must match the active link's offset
    const indicatorLeft = await indicator.evaluate(el =>
      (el as HTMLElement).style.left
    );
    const activeLinkLeft = await activeLink.evaluate(el =>
      (el as HTMLElement).offsetLeft + 'px'
    );
    expect(indicatorLeft).toBe(activeLinkLeft);
  });
```

- [ ] **Step 2: Run tests to verify the hover test fails**

```bash
cd <worktree-path> && pnpm test:e2e tests/e2e/header.spec.ts
```

Expected: "tubelight indicator does not move on hover" FAIL — indicator moves on hover.

- [ ] **Step 3: Remove hover tracking from `Header.astro` script**

In `src/components/site/Header.astro`, in the `<script>` block, find and **delete** these lines:

```typescript
  nav?.querySelectorAll<HTMLAnchorElement>('a').forEach(link => {
    link.addEventListener('mouseenter', () => moveIndicator(link));
    link.addEventListener('mouseleave', () => { if (activeLink) moveIndicator(activeLink); });
  });
```

The `moveIndicator` function and the initial `activeLink` positioning block remain — only the hover listeners are removed.

- [ ] **Step 4: Replace nav link CSS rules in `Header.astro`**

The existing CSS has these two rules that must be **replaced entirely**:
```css
  /* REMOVE THESE EXISTING RULES: */
  .nav-list a:hover, .nav-list a.active { color: var(--text); text-decoration: none; }
  .nav-list a.active { color: var(--accent); }
```

Replace the `.nav-list a` rule block (lines starting at `  .nav-list a {`) with the full updated version, and remove the two rules above:

```css
  .nav-list a {
    display: block;
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--text-muted);
    text-decoration: none;
    border-radius: var(--radius-full);
    position: relative;
    z-index: 1;
    transition: color var(--duration-fast) var(--ease-out),
                background var(--duration-fast) var(--ease-out);
  }
  .nav-list a:hover {
    background: var(--surface-high);
    color: var(--text);
    text-decoration: none;
  }
  .nav-list a.active {
    color: var(--accent);
    text-decoration: none;
  }
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd <worktree-path> && pnpm test:e2e tests/e2e/header.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/site/Header.astro tests/e2e/header.spec.ts
git commit -m "fix: tubelight indicator stays on active link only; add CSS hover pill"
```

---

## Task 3: Search Bar Redesign

**Files:**
- Modify: `src/components/site/Header.astro`

- [ ] **Step 1: Add failing E2E test**

Add to `tests/e2e/header.spec.ts`:

```typescript
  test('search field is visible on desktop and opens dialog on click', async ({ page }) => {
    await page.goto('/');
    const searchField = page.locator('.search-field');
    await expect(searchField).toBeVisible();

    // Clicking the field should open the search dialog
    await searchField.click();
    // The search dialog uses role="dialog" when open
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 2000 });
  });

  test('search field is visible on mobile in header bar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const searchField = page.locator('.search-field');
    await expect(searchField).toBeVisible();
  });
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd <worktree-path> && pnpm test:e2e tests/e2e/header.spec.ts
```

Expected: FAIL — `.search-field` not found.

- [ ] **Step 3: Replace search button with inline input field in `Header.astro`**

In the `<header>` markup, find:

```astro
      <button class="search-btn" aria-label="Open search" onclick="window.openSearch?.()">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
          <circle cx="8" cy="8" r="5"/><path d="m13 13 3 3"/>
        </svg>
      </button>
```

Replace with:

```astro
      <div class="search-field" role="button" tabindex="0" aria-label="Open search">
        <input
          type="text"
          placeholder="Search..."
          readonly
          tabindex="-1"
          aria-hidden="true"
        />
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
          <circle cx="8" cy="8" r="5"/><path d="m13 13 3 3"/>
        </svg>
      </div>
```

Add to the `<script>` block in `Header.astro`:

```typescript
  // ── Search field ─────────────────────────────────────────
  document.querySelector('.search-field')?.addEventListener('click', () => {
    if (typeof window.openSearch === 'function') window.openSearch();
  });
  document.querySelector('.search-field')?.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
      if (typeof window.openSearch === 'function') window.openSearch();
    }
  });
```

- [ ] **Step 4: Add/replace CSS for search field in `Header.astro`**

Remove the `.search-btn` styles and add:

```css
  .search-field {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    padding: var(--space-1) var(--space-3);
    cursor: pointer;
    width: 160px;
    transition: border-color var(--duration-fast);
  }
  .search-field:hover { border-color: var(--text-muted); }

  .search-field input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: var(--text-sm);
    color: var(--text-muted);
    cursor: pointer;
    pointer-events: none;
    width: 100%;
    min-width: 0;
  }
  .search-field input::placeholder { color: var(--text-muted); }
  .search-field svg { flex-shrink: 0; color: var(--text-muted); }

  /* Mobile: always visible, compressed width */
  @media (max-width: 47.9375rem) {
    .header-actions { display: flex; }
    .search-field { width: 120px; }
    .main-nav { display: none; }
  }
```

Note: The `.header-actions` is currently `display: none` on mobile. This override makes it visible on mobile but hides only the nav, not the actions.

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd <worktree-path> && pnpm test:e2e tests/e2e/header.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Run build to confirm no regressions**

```bash
cd <worktree-path> && pnpm build
```

- [ ] **Step 7: Commit**

```bash
git add src/components/site/Header.astro tests/e2e/header.spec.ts
git commit -m "feat: replace search icon button with inline search field, visible on mobile"
```

---

## Task 4: Fix Hamburger Icon Bug

**Files:**
- Modify: `src/components/site/Header.astro`

- [ ] **Step 1: Add failing E2E test**

Add to `tests/e2e/header.spec.ts`:

```typescript
  test('hamburger shows only menu icon when closed', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const menuIcon = page.locator('#hamburger .ham-open');
    const closeIcon = page.locator('#hamburger .ham-close');

    await expect(menuIcon).toBeVisible();
    await expect(closeIcon).not.toBeVisible();
  });

  test('hamburger shows only close icon when menu is open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    await page.locator('#hamburger').click();

    const menuIcon = page.locator('#hamburger .ham-open');
    const closeIcon = page.locator('#hamburger .ham-close');

    await expect(menuIcon).not.toBeVisible();
    await expect(closeIcon).toBeVisible();
  });
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd <worktree-path> && pnpm test:e2e tests/e2e/header.spec.ts
```

Expected: FAIL — both icons visible simultaneously.

- [ ] **Step 3: Replace unicode icons with SVG in `Header.astro` markup**

Find:
```astro
      <span class="ham-icon ham-open" aria-hidden="true">☰</span>
      <span class="ham-icon ham-close" aria-hidden="true">✕</span>
```

Replace with:
```astro
      <svg class="ham-icon ham-open" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
        <line x1="3" y1="6" x2="17" y2="6"/>
        <line x1="3" y1="10" x2="17" y2="10"/>
        <line x1="3" y1="14" x2="17" y2="14"/>
      </svg>
      <svg class="ham-icon ham-close" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
        <line x1="4" y1="4" x2="16" y2="16"/>
        <line x1="16" y1="4" x2="4" y2="16"/>
      </svg>
```

- [ ] **Step 4: Fix hamburger CSS in `Header.astro` to use `aria-expanded` selectors**

Replace the existing `.ham-icon` CSS:
```css
  .ham-icon.hidden { display: none; }
```

With:
```css
  .ham-open  { display: block; }
  .ham-close { display: none; }
  #hamburger[aria-expanded="true"]  .ham-open  { display: none; }
  #hamburger[aria-expanded="true"]  .ham-close { display: block; }
```

- [ ] **Step 5: Simplify hamburger JS — remove the `.hidden` class manipulation**

In the `setDrawer` function in the `<script>` block, remove these lines:

```typescript
    hamburger?.querySelector('.ham-open')?.classList.toggle('hidden', open);
    hamburger?.querySelector('.ham-close')?.classList.toggle('hidden', !open);
```

The `aria-expanded` attribute is still set by the remaining lines — the CSS now does all the icon switching.

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd <worktree-path> && pnpm test:e2e tests/e2e/header.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/site/Header.astro tests/e2e/header.spec.ts
git commit -m "fix: hamburger icon shows only three-lines or X based on aria-expanded state"
```

---

## Task 5: ThemeToggle Mobile Fix + Moon Icon

**Files:**
- Modify: `src/components/site/ThemeToggle.astro`
- Modify: `tests/e2e/theme.spec.ts`

- [ ] **Step 1: Add failing mobile theme toggle test**

Add to `tests/e2e/theme.spec.ts`, inside the existing `test.describe` block:

```typescript
  test('theme toggle works from mobile drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Open mobile drawer
    await page.locator('#hamburger').click();

    // Click the toggle inside the drawer
    const mobileToggle = page.locator('.mobile-actions .theme-toggle');
    const html = page.locator('html');

    const initialTheme = await html.getAttribute('data-theme');
    const targetTheme = initialTheme === 'light' ? 'dark' : 'light';

    await mobileToggle.click();
    await expect(html).toHaveAttribute('data-theme', targetTheme);
  });
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd <worktree-path> && pnpm test:e2e tests/e2e/theme.spec.ts
```

Expected: FAIL — mobile toggle click does not change theme.

- [ ] **Step 3: Fix `ThemeToggle.astro` — add `data-theme-toggle` attribute and replace `querySelector` with `querySelectorAll`**

In the `<button>` markup of `src/components/site/ThemeToggle.astro`, add the `data-theme-toggle` attribute:

```astro
<button
  class="theme-toggle"
  data-theme-toggle
  role="switch"
  aria-checked="false"
  aria-label="Toggle theme"
  type="button"
>
```

Then replace the entire `<script>` block with:

```typescript
<script>
  import { toggleTheme, getTheme } from '../../lib/theme/theme';

  function applyToggleState(theme: string) {
    document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach(toggle => {
      toggle.setAttribute('aria-checked', String(theme === 'dark'));
      toggle.setAttribute('data-theme-state', theme);
    });
  }

  // Apply initial state to all instances
  applyToggleState(getTheme());

  // Wire up all instances
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggleTheme();
      applyToggleState(getTheme());
    });
  });
</script>
```

- [ ] **Step 4: Fix the moon SVG in `ThemeToggle.astro`**

The current moon path may clip on some renderers. Replace both moon SVG instances (`.icon-moon` and `.icon-moon-dim`) with a single-path crescent. Using a path avoids the overlapping-circle approach (which would require knowing the exact thumb background color, which is a hardcoded exception `#252538`/`#ffffff` that varies by theme state).

Use this clean crescent path for both instances:

```astro
    <!-- Moon SVG (dark mode active) -->
    <svg class="icon-moon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
```

```astro
    <!-- Moon SVG (inactive in light mode) -->
    <svg class="icon-moon-dim" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
```

This is the standard Feather Icons crescent moon path — it is self-contained, renders cleanly in any context regardless of background color, and matches the size of the existing sun icon.

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd <worktree-path> && pnpm test:e2e tests/e2e/theme.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Visual verification of moon icon**

Start dev server and manually verify:

```bash
cd <worktree-path> && pnpm dev
```

Visit `http://localhost:4321`, switch to dark mode — moon should render as a clean crescent without clipping.

- [ ] **Step 7: Commit**

```bash
git add src/components/site/ThemeToggle.astro tests/e2e/theme.spec.ts
git commit -m "fix: wire all ThemeToggle instances with querySelectorAll; fix moon crescent SVG"
```

---

## Task 6: Remove LanguageSwitcher from Header

**Files:**
- Modify: `src/components/site/Header.astro`

- [ ] **Step 1: Add failing E2E test**

Add to `tests/e2e/header.spec.ts`:

```typescript
  test('language switcher is not present in the header', async ({ page }) => {
    await page.goto('/');
    // The language switcher renders EN / PT links
    const headerActions = page.locator('.header-actions');
    await expect(headerActions.locator('.lang-switcher')).not.toBeVisible();

    await page.setViewportSize({ width: 375, height: 812 });
    await page.locator('#hamburger').click();
    const mobileActions = page.locator('.mobile-actions');
    await expect(mobileActions.locator('.lang-switcher')).not.toBeVisible();
  });
```

Note: inspect `LanguageSwitcher.astro` to confirm the wrapper class name (likely `.lang-switcher` or similar). Adjust the selector if different.

- [ ] **Step 2: Run test to verify it fails**

```bash
cd <worktree-path> && pnpm test:e2e tests/e2e/header.spec.ts
```

Expected: FAIL — `.lang-switcher` is found in header/mobile drawer.

- [ ] **Step 3: Read `LanguageSwitcher.astro` to confirm wrapper class**

```bash
grep -n "class=" <worktree-path>/src/components/site/LanguageSwitcher.astro | head -5
```

Update the test selector in Step 1 to match the actual class if different.

- [ ] **Step 4: Remove `LanguageSwitcher` from `Header.astro`**

In `src/components/site/Header.astro`, in the frontmatter, remove:
```astro
import LanguageSwitcher from './LanguageSwitcher.astro';
```

In the `<header>` markup, remove from `.header-actions`:
```astro
      <LanguageSwitcher currentLocale={locale} currentPath={currentPath} />
```

And remove from `.mobile-actions`:
```astro
      <LanguageSwitcher currentLocale={locale} currentPath={currentPath} />
```

Also remove the `currentPath` prop from the `Props` interface and `const` if it is no longer used elsewhere in the component. Check first — `currentPath` is still used for active link detection in the nav, so keep it.

- [ ] **Step 5: Run type check and build**

```bash
cd <worktree-path> && pnpm astro check && pnpm build
```

Expected: 0 errors.

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd <worktree-path> && pnpm test:e2e tests/e2e/header.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Run full E2E suite**

```bash
cd <worktree-path> && pnpm test:e2e
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/site/Header.astro tests/e2e/header.spec.ts
git commit -m "feat: remove LanguageSwitcher from header — will live in footer only"
```

---

## Execution Notes

- Execute tasks in order — Task 1 (fixed positioning) affects all other visual tests.
- The worktree for this plan should branch from `main` **after** `feature/frontend-redesign` is merged. Do not execute against the unmerged branch.
- The `<worktree-path>` placeholder must be replaced with the actual worktree path (e.g., `/home/jonathan/Projects/jts-website/.worktrees/shell-fixes`).
- After all 6 tasks are done, run the full suite one final time: `pnpm test:unit && pnpm test:e2e`.
