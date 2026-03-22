# General Improvements and Bug Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement nine independent feature groups: global layout stability, hero background redesign, mobile responsiveness fixes, PT-BR legal pages, blog category filter with badge counts, individual blog/notes page layout overhaul, back-to-top button, share buttons, and OG image generation.

**Architecture:** Each group is an independent change. Groups 9–11 (BackToTop, ShareButtons, OG images) are shared infrastructure consumed by Tasks 12–13 (blog post and notes page overhauls). All other groups are fully independent. Complete Tasks 1–8 in any order, then 9–11 before 12–13.

**Tech Stack:** Astro 5, TypeScript, vanilla JS, CSS custom properties, Playwright E2E, `satori`, `sharp`

**Spec:** `docs/superpowers/specs/2026-03-21-general-improvements-design.md`

---

## Planned File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/styles/global.css` | Add `scrollbar-gutter: stable` |
| Modify | `src/styles/tokens.css` | Increase `--container-max` and `--wide-max` |
| Modify | `src/components/home/Hero.astro` | Extract background to component; fix mobile column order |
| Create | `src/components/home/HeroBackground.astro` | SVG circuit board animation with CPU node and data pulses |
| Modify | `src/components/site/Header.astro` | Toggle right-align in drawer; search icon-only on mobile |
| Modify | `src/components/home/HomeSections.astro` | Collapse projects bento grid to single column on mobile (if not already done) |
| Create | `src/pages/pt-br/privacy.astro` | Portuguese privacy policy |
| Create | `src/pages/pt-br/terms.astro` | Portuguese terms of service |
| Modify | `src/lib/content/schemas.ts` | Add `category` field to `blogSchema` |
| Modify | `src/content/blog/*.md` | Add `category:` frontmatter to all blog posts |
| Modify | `src/components/blog/BlogList.astro` | Replace tag filter with category filter + badge counts |
| Modify | `src/components/notes/NotesFilters.astro` | Add badge counts to category buttons; tags have no count |
| Create | `src/components/site/BackToTop.astro` | Fixed back-to-top button using scroll event |
| Create | `src/components/site/ShareButtons.astro` | Social share row with locale-aware copy |
| Create | `src/lib/ogImage.ts` | Satori template + font loader |
| Create | `src/pages/og/blog/[slug].png.ts` | OG PNG endpoint for blog posts |
| Create | `src/pages/og/notes/[slug].png.ts` | OG PNG endpoint for notes |
| Modify | `src/pages/blog/[slug].astro` | Preamble + TOC two-column layout + BackToTop + ShareButtons + og:image |
| Modify | `src/pages/pt-br/blog/[slug].astro` | Same as EN blog post page |
| Modify | `src/pages/notes/[slug].astro` | Full layout overhaul + BackToTop + ShareButtons + og:image |
| Modify | `src/pages/pt-br/notes/[slug].astro` | Same as EN notes page |
| Modify | `tests/e2e/home.spec.ts` | Tests for hero background, mobile column order |
| Modify | `tests/e2e/blog.spec.ts` | Tests for category filter, badge counts, TOC layout |
| Modify | `tests/e2e/notes.spec.ts` | Tests for notes page layout, back-to-top, share buttons |

---

## Task 1: Global Layout Stability

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/styles/tokens.css`
- Test: `tests/e2e/home.spec.ts`

- [ ] **Step 1: Write failing test for scrollbar gutter**

Add inside the existing `home.spec.ts` describe block:

```typescript
test('html has scrollbar-gutter: stable', async ({ page }) => {
  await page.goto('/');
  const scrollbarGutter = await page.evaluate(() =>
    getComputedStyle(document.documentElement).scrollbarGutter
  );
  expect(scrollbarGutter).toBe('stable');
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx playwright test tests/e2e/home.spec.ts --grep "scrollbar-gutter" -x
```

Expected: FAIL — `scrollbarGutter` is not `'stable'`

- [ ] **Step 3: Add `scrollbar-gutter: stable` to `global.css`**

In `src/styles/global.css`, locate the `html, body { height: 100%; }` line and add to the `html` rule (or create one):

```css
html {
  scrollbar-gutter: stable;
}
```

- [ ] **Step 4: Write failing test for container width**

```typescript
test('container max width is 60rem', async ({ page }) => {
  await page.goto('/');
  const maxWidth = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--container-max').trim()
  );
  expect(maxWidth).toBe('60rem');
});
```

- [ ] **Step 5: Increase token values in `tokens.css`**

Find lines 48–49 in `src/styles/tokens.css`:

```css
/* Before */
  --container-max:        52rem;
  --wide-max:             72rem;

/* After */
  --container-max:        60rem;
  --wide-max:             80rem;
```

- [ ] **Step 6: Run all new tests to verify they pass**

```bash
npx playwright test tests/e2e/home.spec.ts --grep "scrollbar-gutter|container max" -x
```

Expected: 2 PASS

- [ ] **Step 7: Commit**

```bash
git add src/styles/global.css src/styles/tokens.css tests/e2e/home.spec.ts
git commit -m "fix: add scrollbar-gutter stability and increase content width tokens"
```

---

## Task 2: Hero Background Redesign

**Files:**
- Create: `src/components/home/HeroBackground.astro`
- Modify: `src/components/home/Hero.astro`
- Test: `tests/e2e/home.spec.ts`

**Context:** The current `Hero.astro` (line 37–45) generates 36 SVG paths inline for the background. Extract this into a dedicated `HeroBackground.astro` component with the new CPU/circuit design.

- [ ] **Step 1: Write failing test**

```typescript
test('hero has circuit background with CPU node', async ({ page }) => {
  await page.goto('/');
  const cpuNode = page.locator('.hero-bg .cpu-node');
  await expect(cpuNode).toBeVisible();
  const circuitPaths = page.locator('.hero-bg .circuit-path');
  const count = await circuitPaths.count();
  expect(count).toBeGreaterThan(0);
  await expect(circuitPaths.first()).toBeVisible();
});
```

Run: `npx playwright test tests/e2e/home.spec.ts --grep "circuit background" -x`
Expected: FAIL

- [ ] **Step 2: Create `src/components/home/HeroBackground.astro`**

```astro
---
// No props — this is a purely decorative background component.
// The SVG paths are defined with fixed coordinates on a 1440×900 viewBox.
// Pulse animations use CSS offset-path / offset-distance (motion path).

// Define 8 primary circuit paths radiating from the CPU node.
// CPU node is centered at x=720, y=80 (just below navbar).
// Each path: L-shaped route from edge to CPU node.
const paths = [
  // Left side routes
  { id: 'p1', d: 'M 0 200 L 400 200 L 400 80 L 680 80', color: 'var(--accent)', delay: '0s' },
  { id: 'p2', d: 'M 0 450 L 300 450 L 300 180 L 680 180', color: 'var(--accent-dim)', delay: '0.4s' },
  { id: 'p3', d: 'M 0 650 L 200 650 L 200 350 L 680 350', color: 'var(--text-muted)', delay: '0.8s' },
  { id: 'p4', d: 'M 0 820 L 150 820 L 150 500 L 600 500 L 600 160 L 680 160', color: 'var(--accent)', delay: '1.2s' },
  // Right side routes
  { id: 'p5', d: 'M 1440 200 L 1040 200 L 1040 80 L 760 80', color: 'var(--accent)', delay: '0.2s' },
  { id: 'p6', d: 'M 1440 450 L 1140 450 L 1140 180 L 760 180', color: 'var(--accent-dim)', delay: '0.6s' },
  { id: 'p7', d: 'M 1440 650 L 1240 650 L 1240 350 L 760 350', color: 'var(--text-muted)', delay: '1.0s' },
  { id: 'p8', d: 'M 1440 820 L 1290 820 L 1290 500 L 840 500 L 840 160 L 760 160', color: 'var(--accent)', delay: '1.4s' },
];
---

<div class="hero-bg" aria-hidden="true">
  <svg
    class="hero-bg-svg"
    viewBox="0 0 1440 900"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <!-- Path definitions for motion (referenced by id) -->
      {paths.map(p => (
        <path id={p.id} d={p.d} />
      ))}
    </defs>

    <!-- Circuit paths (static lines) -->
    {paths.map(p => (
      <use
        href={`#${p.id}`}
        class="circuit-path"
        stroke={p.color}
        stroke-width="1"
        fill="none"
        opacity="0.25"
      />
    ))}

    <!-- CPU Node centered at 720, 80 -->
    <g class="cpu-node" transform="translate(680, 40)">
      <!-- Outer rect -->
      <rect x="0" y="0" width="80" height="80" rx="4" stroke="var(--accent)" stroke-width="1.5" fill="none" opacity="0.6" />
      <!-- Inner grid lines -->
      <line x1="20" y1="0" x2="20" y2="80" stroke="var(--accent)" stroke-width="0.5" opacity="0.4" />
      <line x1="40" y1="0" x2="40" y2="80" stroke="var(--accent)" stroke-width="0.5" opacity="0.4" />
      <line x1="60" y1="0" x2="60" y2="80" stroke="var(--accent)" stroke-width="0.5" opacity="0.4" />
      <line x1="0" y1="20" x2="80" y2="20" stroke="var(--accent)" stroke-width="0.5" opacity="0.4" />
      <line x1="0" y1="40" x2="80" y2="40" stroke="var(--accent)" stroke-width="0.5" opacity="0.4" />
      <line x1="0" y1="60" x2="80" y2="60" stroke="var(--accent)" stroke-width="0.5" opacity="0.4" />
      <!-- Pin marks on left/right -->
      <rect x="-6" y="15" width="6" height="4" fill="var(--accent)" opacity="0.5" />
      <rect x="-6" y="35" width="6" height="4" fill="var(--accent)" opacity="0.5" />
      <rect x="-6" y="55" width="6" height="4" fill="var(--accent)" opacity="0.5" />
      <rect x="80" y="15" width="6" height="4" fill="var(--accent)" opacity="0.5" />
      <rect x="80" y="35" width="6" height="4" fill="var(--accent)" opacity="0.5" />
      <rect x="80" y="55" width="6" height="4" fill="var(--accent)" opacity="0.5" />
    </g>

    <!-- Data pulses: circles animated along each path using offset-path -->
    {paths.map((p, i) => (
      <circle
        class="data-pulse"
        r="4"
        fill={p.color}
        style={`--delay: ${p.delay}; filter: drop-shadow(0 0 4px ${p.color});`}
        data-path-id={p.id}
      />
    ))}
  </svg>
</div>

<style>
  .hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .hero-bg-svg {
    width: 100%;
    height: 100%;
    opacity: 0;
    animation: bg-fade-in 0.8s var(--ease-out) forwards;
  }

  @keyframes bg-fade-in {
    to { opacity: 1; }
  }

  .circuit-path {
    opacity: 0;
    animation: path-appear 0.8s var(--ease-out) 0.2s forwards;
  }

  @keyframes path-appear {
    to { opacity: 0.25; }
  }

  /* Data pulses: use offset-path (CSS Motion Path) */
  @media (prefers-reduced-motion: no-preference) {
    .data-pulse {
      offset-rotate: 0deg;
      animation: pulse-travel 4s linear var(--delay, 0s) infinite;
    }

    @keyframes pulse-travel {
      0%   { offset-distance: 0%; opacity: 0; }
      5%   { opacity: 1; }
      95%  { opacity: 1; }
      100% { offset-distance: 100%; opacity: 0; }
    }
  }

  /* Each pulse gets its offset-path from its path element.
     The data-path-id attribute is used by the script below to assign offset-path. */

  /* Light mode: slightly increased path opacity */
  [data-theme='light'] .circuit-path {
    opacity: 0;
    animation: path-appear-light 0.8s var(--ease-out) 0.2s forwards;
  }

  [data-theme='light'] .cpu-node rect,
  [data-theme='light'] .cpu-node line,
  [data-theme='light'] .cpu-node rect[fill] {
    opacity: 0.4;
  }

  @keyframes path-appear-light {
    to { opacity: 0.15; }
  }
</style>

<script>
  // Assign offset-path to each pulse based on its data-path-id
  // This must run after the SVG is in the DOM.
  function initPulses() {
    document.querySelectorAll<SVGCircleElement>('.data-pulse').forEach(pulse => {
      const pathId = pulse.dataset.pathId;
      if (pathId) {
        (pulse as HTMLElement).style.offsetPath = `path('${document.getElementById(pathId)?.getAttribute('d') ?? ''}')`;
      }
    });
  }
  initPulses();
  document.addEventListener('astro:page-load', initPulses);
</script>
```

- [ ] **Step 3: Replace inline background in `Hero.astro`**

In `src/components/home/Hero.astro`:

1. Remove lines 37–45 (the `const paths = Array.from(...)` array)
2. Add import at top of frontmatter: `import HeroBackground from './HeroBackground.astro';`
3. In the template, find the SVG/background rendering and replace it with `<HeroBackground />` placed as the first child of the hero wrapper with `position: relative` on the wrapper

The hero wrapper needs `position: relative; overflow: hidden` so the absolute-positioned background is clipped correctly.

- [ ] **Step 4: Run the test**

```bash
npx playwright test tests/e2e/home.spec.ts --grep "circuit background" -x
```

Expected: PASS

- [ ] **Step 5: Visual check** — run `pnpm run dev` and verify the circuit animation plays in both light and dark mode, and stops when prefers-reduced-motion is enabled (test with DevTools emulation).

- [ ] **Step 6: Commit**

```bash
git add src/components/home/HeroBackground.astro src/components/home/Hero.astro tests/e2e/home.spec.ts
git commit -m "feat: replace hero background with SVG circuit board animation"
```

---

## Task 3: Responsiveness Fixes

**Files:**
- Modify: `src/components/site/Header.astro`
- Modify: `src/components/home/Hero.astro`
- Test: `tests/e2e/home.spec.ts`, `tests/e2e/header.spec.ts`

### 3a: Theme Toggle Right-Aligned in Mobile Drawer

The mobile drawer shows `ThemeToggle` inside a `.mobile-actions` div (confirmed in `Header.astro`). It must appear right-aligned.

- [ ] **Step 1: Locate `.mobile-actions` in `Header.astro`**

Find the `.mobile-actions` flex container that wraps `<ThemeToggle />` in the drawer section. Apply `margin-left: auto` to the `ThemeToggle` wrapper inside it (or `justify-content: flex-end` on `.mobile-actions` itself if it only contains the toggle):

```css
/* In Header.astro <style> */
.mobile-actions {
  justify-content: flex-end;
}
```

If `.mobile-actions` contains other elements besides ThemeToggle, apply `margin-left: auto` to the ThemeToggle wrapper `<div>` directly instead.

- [ ] **Step 2: Write test**

In `tests/e2e/header.spec.ts`, add inside the existing describe block:

```typescript
test('mobile: theme toggle is right-aligned in drawer', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.click('#hamburger');
  const toggle = page.locator('.mobile-actions');
  await expect(toggle).toBeVisible();
  const box = await toggle.boundingBox();
  const viewport = page.viewportSize()!;
  // Toggle wrapper should start in the right half of the viewport
  expect(box!.x + box!.width / 2).toBeGreaterThan(viewport.width / 2);
});
```

Run: `npx playwright test tests/e2e/header.spec.ts --grep "right-aligned in drawer" -x`
Expected: PASS

### 3b: Mobile Hero Column Order

The hero uses a two-column grid. The current `Hero.astro` already has `@media (max-width: 48rem)` with `.hero-right { order: -1 }` which puts the right column first — this is the bug. Fix it by removing `order: -1` and ensuring left column comes first.

- [ ] **Step 3: Fix `.hero-right` order in `Hero.astro`**

In the `<style>` block, find the `@media (max-width: 48rem)` rule (project convention uses `rem`, not `px`). The actual class names are `.hero-left`, `.hero-right`, `.hero-grid`. Change:

```css
/* Before (buggy) */
@media (max-width: 48rem) {
  .hero-grid { grid-template-columns: 1fr; }
  .hero-right { order: -1; }
}

/* After (fixed) */
@media (max-width: 48rem) {
  .hero-grid { grid-template-columns: 1fr; }
  .hero-left  { order: 1; }
  .hero-right { order: 2; }
}
```

- [ ] **Step 4: Write test**

```typescript
test('mobile: hero left column renders before right column', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const left = page.locator('.hero-left'); // replace with actual class
  const right = page.locator('.hero-right');
  const leftBox = await left.boundingBox();
  const rightBox = await right.boundingBox();
  // Left column must have a lower Y position (comes first)
  expect(leftBox!.y).toBeLessThan(rightBox!.y);
});
```

Run: `npx playwright test tests/e2e/home.spec.ts --grep "hero left column" -x`
Expected: PASS

### 3c: Mobile Search Icon-Only

On mobile (≤768px), the search field shows only the icon button. Clicking it calls `window.openSearch()`.

- [ ] **Step 5: Update `Header.astro` search markup**

The current search markup is a `.search-field` div with an `<input>` and SVG icon. Restructure so that on mobile, the input is hidden and only the icon button is visible, placed before the hamburger:

```astro
<!-- In header-actions, before hamburger button -->
<button
  class="search-icon-btn"
  id="search-icon-btn"
  aria-label="Open search"
>
  <!-- Same magnifying glass SVG -->
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
    <circle cx="8" cy="8" r="5"/><path d="m13 13 3 3"/>
  </svg>
</button>
```

In the existing `<script>` block of `Header.astro` (where hamburger logic lives), add:

```javascript
const searchIconBtn = document.getElementById('search-icon-btn');
searchIconBtn?.addEventListener('click', () => { window.openSearch?.(); });
```

```css
/* Hide full search field on mobile, show icon button */
@media (max-width: 48rem) {
  .search-field { display: none; }
  .search-icon-btn { display: flex; align-items: center; justify-content: center; }
}

/* Hide icon button on desktop */
@media (min-width: 48.01rem) {
  .search-icon-btn { display: none; }
}

.search-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  transition: color var(--duration-fast) var(--ease-out);
}
.search-icon-btn:hover { color: var(--accent); }
```

- [ ] **Step 6: Write test**

```typescript
test('mobile: search shows icon only, opens dialog on click', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  // Full search field should be hidden
  await expect(page.locator('.search-field')).toBeHidden();
  // Icon button should be visible
  await expect(page.locator('.search-icon-btn')).toBeVisible();
  // Clicking opens the search dialog
  await page.click('.search-icon-btn');
  await expect(page.getByRole('dialog')).toBeVisible();
});
```

Run: `npx playwright test tests/e2e/header.spec.ts --grep "search shows icon" -x`
Expected: PASS

### 3d: Home Projects Bento — Single Column on Mobile

**Note:** `src/components/home/ProjectsSection.astro` does not exist. The projects grid lives in `src/components/home/HomeSections.astro`. The home section grid may already collapse to single column at `max-width: 48rem` — check first before writing new CSS.

- [ ] **Step 7: Check existing responsive behavior in `HomeSections.astro`**

```bash
grep -n "grid-template-columns\|48rem\|max-width" src/components/home/HomeSections.astro
```

If the projects `.grid` already has `grid-template-columns: 1fr` at `max-width: 48rem`, **this step is already complete** — skip to Step 9. If not, add:

```css
@media (max-width: 48rem) {
  .grid {                /* use the actual projects grid class name from HomeSections.astro */
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  .grid > * {
    grid-column: 1 / -1;
    grid-row: auto;
  }
}
```

- [ ] **Step 8: Write test**

Use the actual CSS class names from `HomeSections.astro` for the project cards:

```typescript
test('mobile: home projects in single column', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  // Adjust selector to match actual project card class in HomeSections.astro
  const cards = page.locator('.home-projects .grid > *');
  const count = await cards.count();
  if (count >= 2) {
    const box1 = await cards.nth(0).boundingBox();
    const box2 = await cards.nth(1).boundingBox();
    // Second card should be below first (single column = same x, higher y)
    expect(Math.abs(box1!.x - box2!.x)).toBeLessThan(10);
    expect(box2!.y).toBeGreaterThan(box1!.y);
  }
});
```

- [ ] **Step 9: Commit**

```bash
git add src/components/site/Header.astro src/components/home/Hero.astro src/components/home/HomeSections.astro tests/e2e/home.spec.ts tests/e2e/header.spec.ts
git commit -m "fix: mobile responsiveness — toggle align, hero order, search icon, bento grid"
```

---

## Task 4: PT-BR Legal Pages

**Files:**
- Create: `src/pages/pt-br/privacy.astro`
- Create: `src/pages/pt-br/terms.astro`
- Test: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Write failing tests**

Add to `tests/e2e/smoke.spec.ts`:

```typescript
test('pt-br privacy policy page loads', async ({ page }) => {
  const response = await page.goto('/pt-br/privacy');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: /Política de Privacidade/i })).toBeVisible();
});

test('pt-br terms of service page loads', async ({ page }) => {
  const response = await page.goto('/pt-br/terms');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: /Termos de Serviço/i })).toBeVisible();
});
```

Run: `npx playwright test tests/e2e/smoke.spec.ts --grep "pt-br privacy|pt-br terms" -x`
Expected: FAIL (404)

- [ ] **Step 2: Create `src/pages/pt-br/privacy.astro`**

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
---

<BaseLayout locale="pt-br" title="Política de Privacidade">
  <div class="container legal-page">
    <h1>Política de Privacidade</h1>
    <p class="last-updated">Última atualização: março de 2026</p>

    <section>
      <h2>1. Informações que Coletamos</h2>
      <p>Este site não coleta informações pessoais identificáveis. Não utilizamos cookies de rastreamento, análises de terceiros ou qualquer mecanismo de coleta de dados.</p>
    </section>

    <section>
      <h2>2. Conteúdo de Terceiros</h2>
      <p>Links externos levam a sites de terceiros com suas próprias políticas de privacidade. Não somos responsáveis pelo conteúdo ou pelas práticas desses sites.</p>
    </section>

    <section>
      <h2>3. Contato</h2>
      <p>Para perguntas sobre esta política, entre em contato pelo LinkedIn ou GitHub listados no rodapé.</p>
    </section>
  </div>
</BaseLayout>

<style>
  .legal-page {
    max-width: var(--container-max);
    margin: 0 auto;
    padding: var(--space-12) var(--space-6);
  }
  .legal-page h1 {
    font-size: var(--text-3xl);
    margin-bottom: var(--space-2);
  }
  .last-updated {
    color: var(--text-muted);
    font-size: var(--text-sm);
    font-family: var(--font-mono);
    margin-bottom: var(--space-10);
  }
  section {
    margin-bottom: var(--space-8);
  }
  section h2 {
    font-size: var(--text-xl);
    margin-bottom: var(--space-3);
  }
  section p {
    color: var(--text-muted);
    line-height: var(--leading-relaxed);
  }
</style>
```

- [ ] **Step 3: Create `src/pages/pt-br/terms.astro`**

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
---

<BaseLayout locale="pt-br" title="Termos de Serviço">
  <div class="container legal-page">
    <h1>Termos de Serviço</h1>
    <p class="last-updated">Última atualização: março de 2026</p>

    <section>
      <h2>1. Aceitação dos Termos</h2>
      <p>Ao acessar este site, você concorda com estes Termos de Serviço. Se não concordar, por favor, não utilize este site.</p>
    </section>

    <section>
      <h2>2. Uso do Conteúdo</h2>
      <p>O conteúdo deste site é fornecido apenas para fins informativos e educacionais. Você pode compartilhá-lo com atribuição adequada ao autor. Não reproduza o conteúdo para fins comerciais sem permissão prévia.</p>
    </section>

    <section>
      <h2>3. Isenção de Responsabilidade</h2>
      <p>O conteúdo é fornecido "como está", sem garantias de qualquer tipo. O autor não se responsabiliza por erros ou omissões, nem por danos resultantes do uso das informações aqui contidas.</p>
    </section>

    <section>
      <h2>4. Links Externos</h2>
      <p>Este site pode conter links para sites de terceiros. Esses links são fornecidos por conveniência e não implicam endosso do conteúdo externo.</p>
    </section>

    <section>
      <h2>5. Contato</h2>
      <p>Para perguntas sobre estes termos, entre em contato pelo LinkedIn ou GitHub listados no rodapé.</p>
    </section>
  </div>
</BaseLayout>

<style>
  .legal-page {
    max-width: var(--container-max);
    margin: 0 auto;
    padding: var(--space-12) var(--space-6);
  }
  .legal-page h1 {
    font-size: var(--text-3xl);
    margin-bottom: var(--space-2);
  }
  .last-updated {
    color: var(--text-muted);
    font-size: var(--text-sm);
    font-family: var(--font-mono);
    margin-bottom: var(--space-10);
  }
  section {
    margin-bottom: var(--space-8);
  }
  section h2 {
    font-size: var(--text-xl);
    margin-bottom: var(--space-3);
  }
  section p {
    color: var(--text-muted);
    line-height: var(--leading-relaxed);
  }
</style>
```

- [ ] **Step 4: Run tests**

```bash
npx playwright test tests/e2e/smoke.spec.ts --grep "pt-br privacy|pt-br terms" -x
```

Expected: 2 PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/pt-br/privacy.astro src/pages/pt-br/terms.astro tests/e2e/smoke.spec.ts
git commit -m "feat: add PT-BR privacy policy and terms of service pages"
```

---

## Task 5: Blog Schema + Category Frontmatter

**Files:**
- Modify: `src/lib/content/schemas.ts`
- Modify: All files in `src/content/blog/`
- Test: `tests/e2e/blog.spec.ts`

**Note:** Schema changes are validated by `pnpm run build`. No separate Playwright test is needed here — the failing test for category support is in Task 6 Step 1 (category filter bar visibility). Proceed directly to the schema change.

- [ ] **Step 1: Add `category` to `blogSchema` in `src/lib/content/schemas.ts`**

```typescript
export const blogSchema = z.object({
  slug: z.string().min(1),
  title: z.string(),
  language: languageEnum,
  translationKey: z.string().min(1),
  publishedAt: z.coerce.date(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),   // ADD THIS LINE
  updatedAt: z.coerce.date().optional(),
});
```

- [ ] **Step 2: Run `pnpm run build` to confirm schema compiles**

```bash
pnpm run build 2>&1 | tail -20
```

Expected: build succeeds (no new errors).

- [ ] **Step 3: Add `category` frontmatter to all blog post files**

List all blog posts: `ls src/content/blog/`

Assign a category from this taxonomy: `Software Engineering`, `Data Science`, `Career`, `General`

For each file in `src/content/blog/`, add `category: "..."` to the frontmatter. Example:

```yaml
# src/content/blog/2026-03-ci-firmware.en.md
---
slug: "2026-03-ci-firmware.en"
title: "Continuous Integration for Firmware"
language: "en"
translationKey: "ci-firmware"
publishedAt: "2026-03-20"
summary: "How to apply modern CI/CD practices to embedded development."
tags: ["CI/CD", "Firmware", "Automation"]
category: "Software Engineering"   # ADD
---
```

Do this for every `.md` file in `src/content/blog/`.

- [ ] **Step 4: Run build again to confirm no validation errors**

```bash
pnpm run build 2>&1 | grep -i error | head -20
```

Expected: no content validation errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/schemas.ts src/content/blog/
git commit -m "feat: add category field to blog schema and existing posts"
```

---

## Task 6: Blog Category Filter + Badge Counts

**Files:**
- Modify: `src/components/blog/BlogList.astro`
- Modify: `src/components/notes/NotesFilters.astro`
- Test: `tests/e2e/blog.spec.ts`, `tests/e2e/notes.spec.ts`

### 6a: Blog Category Filter

- [ ] **Step 1: Write failing test**

```typescript
test('en: blog index has category filter with badge counts', async ({ page }) => {
  await page.goto('/blog');
  // Category filter bar should be visible
  await expect(page.locator('.blog-filter-bar')).toBeVisible();
  // "All" button should be present
  await expect(page.getByRole('button', { name: /All/ })).toBeVisible();
  // Badge count should be visible on a category button
  const badge = page.locator('.filter-category-btn .badge-count').first();
  await expect(badge).toBeVisible();
});
```

Run: `npx playwright test tests/e2e/blog.spec.ts --grep "category filter" -x`
Expected: FAIL

- [ ] **Step 2: Update `BlogList.astro` — add category aggregation in the frontmatter script**

**First, verify the actual variable name** used for the post array in `BlogList.astro` (it is `postsToShow` — verify by reading the file). After the existing `allTags` line (approximately line 33), add:

```typescript
// Collect unique categories and their counts
const categoryCountMap = postsToShow.reduce((acc, post) => {
  const cat = post.data.category;
  if (cat) acc[cat] = (acc[cat] ?? 0) + 1;
  return acc;
}, {} as Record<string, number>);

const categories = Object.keys(categoryCountMap).sort();
const totalCount = postsToShow.length;
```

Remove **both** the `allTags` aggregation script line AND any `{allTags}` / tag-pill usage in the template below `---`. If `allTags` is referenced in the HTML template, remove those usages too, or the TypeScript compiler will error on the undefined variable.

- [ ] **Step 3: Add category filter bar HTML to `BlogList.astro` template**

Before the existing post list, add:

```astro
<div class="blog-filter-bar" role="toolbar" aria-label="Filter by category">
  <button
    class="filter-category-btn active"
    data-category="all"
  >
    All
    <span class="badge-count">{totalCount}</span>
  </button>
  {categories.map(cat => (
    <button
      class="filter-category-btn"
      data-category={cat}
    >
      {cat}
      <span class="badge-count">{categoryCountMap[cat]}</span>
    </button>
  ))}
</div>
```

Add `data-category={post.data.category ?? ''}` to each post entry `<li>` (or whatever wrapper is used) so the JS filter can read it.

- [ ] **Step 4: Add filter script + styles to `BlogList.astro`**

```html
<script>
  function initBlogFilter() {
    const bar = document.querySelector('.blog-filter-bar');
    if (!bar) return;
    const buttons = bar.querySelectorAll<HTMLButtonElement>('.filter-category-btn');
    const posts = document.querySelectorAll<HTMLElement>('[data-post-category]');

    function applyFilter(category: string) {
      posts.forEach(post => {
        const match = category === 'all' || post.dataset.postCategory === category;
        post.style.display = match ? '' : 'none';
      });
      buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
      });
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => applyFilter(btn.dataset.category ?? 'all'));
    });

    // Read initial state from URL
    const params = new URLSearchParams(location.search);
    const initial = params.get('category') ?? 'all';
    applyFilter(initial);
  }

  initBlogFilter();
  document.addEventListener('astro:page-load', initBlogFilter);
</script>

<style>
  .blog-filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-8);
  }

  .filter-category-btn {
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--text-sm);
    color: var(--text-muted);
    padding: var(--space-1) var(--space-3) var(--space-1) var(--space-2);
    transition: color var(--duration-fast) var(--ease-out);
    padding-right: var(--space-6); /* space for badge */
  }

  .filter-category-btn:hover,
  .filter-category-btn.active {
    color: var(--accent);
  }

  .filter-category-btn.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: var(--space-2);
    right: var(--space-2);
    height: 2px;
    background: var(--accent);
    box-shadow: 0 0 6px var(--accent);
    border-radius: var(--radius-full);
  }

  .badge-count {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 1.25rem;
    height: 1.25rem;
    background: var(--accent);
    color: #fff;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    font-weight: var(--weight-bold);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 var(--space-1);
  }
</style>
```

- [ ] **Step 5: Run test**

```bash
npx playwright test tests/e2e/blog.spec.ts --grep "category filter" -x
```

Expected: PASS

### 6b: Notes Category Badge Counts

`NotesFilters.astro` already renders category buttons. The props received are `categories: string[]` but not counts. The `notes/index.astro` already has `categoryCountMap` logic available.

- [ ] **Step 6: Update `NotesFilters.astro` to accept and render badge counts**

Change `Props`:

```typescript
interface Props {
  categories: string[];
  categoryCounts: Record<string, number>;  // ADD
  tags: string[];
  locale: Locale;
}

const { categories, categoryCounts, tags, locale } = Astro.props;
```

Update the category button template:

```astro
{categories.map(category => (
  <button class="filter-btn" data-filter="category" data-value={category}>
    {category}
    {categoryCounts[category] && (
      <span class="badge-count">{categoryCounts[category]}</span>
    )}
  </button>
))}
```

Add `.badge-count` styles (same as blog filter bar above) to `NotesFilters.astro`'s `<style>` block.

- [ ] **Step 7: Update `src/pages/notes/index.astro` to pass `categoryCounts`**

After the existing `categories` and `tags` lines, add:

```typescript
const categoryCounts = categories.reduce((acc, cat) => {
  acc[cat] = notesToShow.filter(n => n.data.category === cat).length;
  return acc;
}, {} as Record<string, number>);
```

Pass to `<NotesFilters categoryCounts={categoryCounts} ... />`.

Do the same in `src/pages/pt-br/notes/index.astro`.

- [ ] **Step 8: Write test and run**

```typescript
test('notes category buttons have badge counts', async ({ page }) => {
  await page.goto('/notes');
  const badge = page.locator('.filter-btn .badge-count').first();
  await expect(badge).toBeVisible();
  const text = await badge.textContent();
  expect(Number(text)).toBeGreaterThan(0);
});
```

```bash
npx playwright test tests/e2e/notes.spec.ts --grep "badge counts" -x
```

Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/components/blog/BlogList.astro src/components/notes/NotesFilters.astro src/pages/notes/index.astro src/pages/pt-br/notes/index.astro tests/e2e/blog.spec.ts tests/e2e/notes.spec.ts
git commit -m "feat: add blog category filter and badge counts to blog/notes filters"
```

---

## Task 7: Blog Individual Post — TOC Preamble Layout

**Files:**
- Modify: `src/pages/blog/[slug].astro`
- Modify: `src/pages/pt-br/blog/[slug].astro`
- Test: `tests/e2e/blog.spec.ts`

**Context:** The existing blog post pages already have a TOC sidebar (from the blog-improvements plan). This task adjusts the layout so the two-column grid starts below the preamble (back button → category → title → subtitle → metadata → tags → author → `<hr>`), not at the title.

- [ ] **Step 1: Write failing test**

```typescript
test('blog post: TOC starts below preamble separator', async ({ page }) => {
  await page.goto('/blog/2026-03-ci-firmware.en'); // use actual slug
  const separator = page.locator('.post-preamble hr').first();
  const toc = page.locator('.toc-sidebar');
  await expect(separator).toBeVisible();
  await expect(toc).toBeVisible();
  const sepBox = await separator.boundingBox();
  const tocBox = await toc.boundingBox();
  // TOC top must be at or below the separator
  expect(tocBox!.y).toBeGreaterThanOrEqual(sepBox!.y);
});
```

- [ ] **Step 2: Restructure the post layout in `src/pages/blog/[slug].astro`**

The template should follow this structure:

```astro
<div class="post-wrapper">
  <!-- Reading progress bar (full width, fixed at top) -->
  <!-- ... existing progress bar ... -->

  <div class="container">
    <!-- PREAMBLE: full width above the two-column grid -->
    <div class="post-preamble">
      <a href={locale === 'en' ? '/blog' : '/pt-br/blog'} class="back-link">
        ← {t.backToBlog ?? 'Back to blog'}
      </a>

      {post.data.category && (
        <span class="post-category">{post.data.category}</span>
      )}

      <h1 class="post-title">{post.data.title}</h1>

      {/* subtitle if exists — add subtitle to schema if missing */}

      <div class="post-meta">
        <time datetime={post.data.publishedAt.toISOString()}>
          {t.publishedAt} {post.data.publishedAt.toLocaleDateString(locale, { dateStyle: 'long' })}
        </time>
        <span>{readingTime} {t.readingMinutes}</span>
      </div>

      {post.data.tags.length > 0 && (
        <div class="post-tags">
          {post.data.tags.map(tag => <span class="tag-pill">#{tag}</span>)}
        </div>
      )}

      <!-- Author block -->
      <div class="author-block">
        <div class="author-avatar">
          <!-- placeholder circular image or initials -->
          <span>JT</span>
        </div>
        <div class="author-info">
          <span class="author-name">Jonathan</span>
          <span class="author-subtitle">Senior Software Engineer &amp; Educator</span>
        </div>
      </div>

      <hr class="preamble-divider" />
    </div>

    <!-- TWO-COLUMN GRID: starts here, after preamble -->
    <div class="post-body-grid">
      <div class="post-content">
        {/* PRESERVE: fallback notice from existing file */}
        {isTranslationFallback && (
          <div class="fallback-notice">
            <p>{t.fallbackNotice}</p>
          </div>
        )}

        <Content />

        {/* PRESERVE: PostNav prev/next from existing file */}
        <PostNav locale={locale} prev={prev} next={next} />

        {/* Share buttons — added in Task 9 */}
        {/* <ShareButtons title={post.data.title} url={Astro.url.href} type="post" locale={locale} /> */}
      </div>
      <aside class="toc-sidebar">
        <TableOfContents headings={headings} />
      </aside>
    </div>
  </div>
</div>
```

> **Preservation note:** The existing `src/pages/blog/[slug].astro` template has `.post-wrapper > .post-main` (with `post-header`, fallback notice, `.prose > <Content />`, and `<PostNav>`) and `.post-toc > <TableOfContents>`. The new structure wraps them in `.post-preamble` + `.post-body-grid`. Keep `isTranslationFallback`, `PostNav`, `readingTime`, all existing `t.` keys, and the `<TableOfContents headings={headings} />` call — do not delete any of these.

- [ ] **Step 3: Add layout CSS**

```css
.post-preamble {
  max-width: 100%;
  margin-bottom: var(--space-8);
}

.preamble-divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: var(--space-8) 0 0;
}

.post-body-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: var(--space-12);
  align-items: start;
}

.toc-sidebar {
  position: sticky;
  top: calc(var(--space-6) + 60px); /* 60px = approx navbar height */
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--space-4);
}

.author-block {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-6) 0;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--accent-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--accent);
  flex-shrink: 0;
}

.author-name {
  font-weight: var(--weight-semibold);
  display: block;
}

.author-subtitle {
  font-size: var(--text-sm);
  color: var(--text-muted);
  display: block;
}

.tag-pill {
  display: inline-block;
  background: var(--surface-high);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--text-muted);
  margin-right: var(--space-2);
  margin-bottom: var(--space-2);
}

/* Mobile: hide TOC, single column */
@media (max-width: 768px) {
  .post-body-grid {
    grid-template-columns: 1fr;
  }
  .toc-sidebar {
    display: none;
  }
}
```

- [ ] **Step 4: Repeat same changes in `src/pages/pt-br/blog/[slug].astro`** (same structure, use PT-BR locale strings)

- [ ] **Step 5: Run test**

```bash
npx playwright test tests/e2e/blog.spec.ts --grep "TOC starts below" -x
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/pages/blog/[slug].astro src/pages/pt-br/blog/[slug].astro tests/e2e/blog.spec.ts
git commit -m "feat: restructure blog post layout — preamble above TOC two-column grid"
```

---

## Task 8: BackToTop Component

**Files:**
- Create: `src/components/site/BackToTop.astro`
- Test: `tests/e2e/blog.spec.ts`

- [ ] **Step 1: Write failing test**

```typescript
test('blog post: back to top button appears on scroll', async ({ page }) => {
  await page.goto('/blog/2026-03-ci-firmware.en');
  const btn = page.locator('.back-to-top-btn');
  // Initially hidden
  await expect(btn).not.toBeVisible();
  // Scroll down
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect(btn).toBeVisible();
  // Click returns to top
  await btn.click();
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBe(0);
});
```

- [ ] **Step 2: Create `src/components/site/BackToTop.astro`**

```astro
---
// No props. Uses scroll event to show/hide.
---

<button
  class="back-to-top-btn"
  aria-label="Back to top"
>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="4 10 8 6 12 10"/>
  </svg>
</button>

<script>
  function initBackToTop() {
    const btn = document.querySelector<HTMLButtonElement>('.back-to-top-btn');
    if (!btn) return;

    function onScroll() {
      btn.classList.toggle('visible', window.scrollY > 300);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // set initial state

    btn.addEventListener('click', () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
    });
  }

  initBackToTop();
  document.addEventListener('astro:page-load', initBackToTop);
</script>

<style>
  .back-to-top-btn {
    position: fixed;
    bottom: var(--space-6);
    right: var(--space-6);
    z-index: 50;
    width: 44px;
    height: 44px;
    border-radius: var(--radius-full);
    background: var(--surface-high);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-md);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--duration-base) var(--ease-out),
                background var(--duration-fast) var(--ease-out),
                color var(--duration-fast) var(--ease-out);
  }

  .back-to-top-btn.visible {
    opacity: 1;
    pointer-events: auto;
  }

  .back-to-top-btn:hover {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }

  @media (prefers-reduced-motion: reduce) {
    .back-to-top-btn {
      transition: none;
    }
  }
</style>
```

- [ ] **Step 3: Add to blog post pages**

In `src/pages/blog/[slug].astro` and `src/pages/pt-br/blog/[slug].astro`:

1. Add import: `import BackToTop from '../../components/site/BackToTop.astro';`
2. Add `<BackToTop />` near the bottom of the template, outside the main content container.

- [ ] **Step 4: Run test**

```bash
npx playwright test tests/e2e/blog.spec.ts --grep "back to top" -x
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/site/BackToTop.astro src/pages/blog/[slug].astro src/pages/pt-br/blog/[slug].astro tests/e2e/blog.spec.ts
git commit -m "feat: add BackToTop component to blog post pages"
```

---

## Task 9: ShareButtons Component

**Files:**
- Create: `src/components/site/ShareButtons.astro`
- Test: `tests/e2e/blog.spec.ts`

- [ ] **Step 1: Write failing test**

```typescript
test('blog post: share buttons are visible', async ({ page }) => {
  await page.goto('/blog/2026-03-ci-firmware.en');
  const shareSection = page.locator('.share-buttons');
  await expect(shareSection).toBeVisible();
  // LinkedIn and Copy Link should be present
  await expect(page.locator('.share-btn[data-platform="linkedin"]')).toBeVisible();
  await expect(page.locator('.share-btn[data-platform="copy"]')).toBeVisible();
});
```

- [ ] **Step 2: Create `src/components/site/ShareButtons.astro`**

```astro
---
interface Props {
  title: string;
  url: string;
  type: 'post' | 'note';
  locale: 'en' | 'pt-br';
}

const { title, url, type, locale } = Astro.props;

const messages = {
  en: { post: `Check out this post: ${title} ${url}`, note: `Check out this note: ${title} ${url}` },
  'pt-br': { post: `Confira este artigo: ${title} ${url}`, note: `Confira esta nota: ${title} ${url}` },
};

const message = messages[locale][type];
const encodedMessage = encodeURIComponent(message);
const encodedUrl = encodeURIComponent(url);

const shareLinks = {
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`,
  whatsapp: `https://wa.me/?text=${encodedMessage}`,
};

const labels = {
  en: { share: `Share this ${type}`, copied: 'Link copied!' },
  'pt-br': { share: type === 'post' ? 'Compartilhar este artigo' : 'Compartilhar esta nota', copied: 'Link copiado!' },
}[locale];
---

<div class="share-buttons">
  <p class="share-label">{labels.share}</p>
  <div class="share-row">
    <!-- LinkedIn -->
    <a
      href={shareLinks.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      class="share-btn"
      data-platform="linkedin"
      aria-label="Share on LinkedIn"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
      </svg>
    </a>
    <!-- Twitter/X -->
    <a
      href={shareLinks.twitter}
      target="_blank"
      rel="noopener noreferrer"
      class="share-btn"
      data-platform="twitter"
      aria-label="Share on Twitter"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    </a>
    <!-- Facebook -->
    <a
      href={shareLinks.facebook}
      target="_blank"
      rel="noopener noreferrer"
      class="share-btn"
      data-platform="facebook"
      aria-label="Share on Facebook"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    </a>
    <!-- WhatsApp -->
    <a
      href={shareLinks.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      class="share-btn"
      data-platform="whatsapp"
      aria-label="Share on WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a13 13 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 1.99.583 3.842 1.59 5.395L2 22l4.705-1.232A10 10 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill-rule="evenodd" clip-rule="evenodd"/>
      </svg>
    </a>
    <!-- Copy Link -->
    <button
      class="share-btn"
      data-platform="copy"
      data-message={message}
      data-copied-label={labels.copied}
      aria-label="Copy link"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    </button>
  </div>
</div>

<script>
  function initShareButtons() {
    document.querySelectorAll<HTMLButtonElement>('.share-btn[data-platform="copy"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const msg = btn.dataset.message ?? '';
        const copiedLabel = btn.dataset.copiedLabel ?? 'Link copied!';
        try {
          await navigator.clipboard.writeText(msg);
          window.showToast?.({ message: copiedLabel, variant: 'success', duration: 2000 });
        } catch {
          // Fallback: select a temporary textarea
          const ta = document.createElement('textarea');
          ta.value = msg;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          window.showToast?.({ message: copiedLabel, variant: 'success', duration: 2000 });
        }
      });
    });
  }

  initShareButtons();
  document.addEventListener('astro:page-load', initShareButtons);
</script>

<style>
  .share-buttons {
    margin-top: var(--space-10);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border);
  }

  .share-label {
    font-size: var(--text-sm);
    color: var(--text-muted);
    margin-bottom: var(--space-4);
    font-family: var(--font-mono);
  }

  .share-row {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .share-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-muted);
    cursor: pointer;
    text-decoration: none;
    transition: background var(--duration-fast) var(--ease-out),
                color var(--duration-fast) var(--ease-out),
                border-color var(--duration-fast) var(--ease-out);
  }

  .share-btn:hover {
    background: var(--accent-dim);
    color: var(--accent);
    border-color: var(--accent);
  }
</style>
```

- [ ] **Step 3: Import and use in blog post pages**

In `src/pages/blog/[slug].astro`, add after the CTA card (inside `.post-content`):

```astro
import ShareButtons from '../../components/site/ShareButtons.astro';

<ShareButtons
  title={post.data.title}
  url={Astro.url.href}
  type="post"
  locale={locale}
/>
```

Same for `src/pages/pt-br/blog/[slug].astro`.

- [ ] **Step 4: Run test**

```bash
npx playwright test tests/e2e/blog.spec.ts --grep "share buttons" -x
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/site/ShareButtons.astro src/pages/blog/[slug].astro src/pages/pt-br/blog/[slug].astro tests/e2e/blog.spec.ts
git commit -m "feat: add ShareButtons component to blog post pages"
```

---

## Task 10: Notes Individual Page Layout

**Files:**
- Modify: `src/pages/notes/[slug].astro`
- Modify: `src/pages/pt-br/notes/[slug].astro`
- Test: `tests/e2e/notes.spec.ts`

**Context:** The current note page (line 40–53 of `src/pages/notes/[slug].astro`) has a basic header. Overhaul to match the spec layout: back button, category, title, subtitle, date, tags, separator, content, share section, related notes, back-to-top.

- [ ] **Step 1: Write failing tests**

```typescript
test('note page: has back to notes button', async ({ page }) => {
  // Use an actual note slug from src/content/notes/
  await page.goto('/notes/debugging-habits'); // adjust to real slug
  await expect(page.locator('.back-link')).toBeVisible();
  await expect(page.locator('.back-link')).toContainText('Back to notes');
});

test('note page: has share buttons and back-to-top', async ({ page }) => {
  await page.goto('/notes/debugging-habits');
  await expect(page.locator('.share-buttons')).toBeVisible();
});
```

- [ ] **Step 2: Get an actual note slug to use in tests**

```bash
ls src/content/notes/ | head -5
```

Use a real slug from the output in your test above.

- [ ] **Step 3: Rewrite `src/pages/notes/[slug].astro` template section**

In the frontmatter script, **add these imports** (the existing `getNoteAccentColor` import from `'../../lib/notes'` must be kept):

```typescript
import BackToTop from '../../components/site/BackToTop.astro';
import ShareButtons from '../../components/site/ShareButtons.astro';
```

Also add related notes query after the existing `render(note)` call:

```typescript
// Related notes: last 3 notes in same category, ordered oldest→newest (ascending)
const allNotesForRelated = await getCollection('notes');
const relatedNotes = allNotesForRelated
  .filter(n =>
    n.data.slug !== note.data.slug &&
    n.data.language === locale &&
    n.data.category === note.data.category
  )
  .sort((a, b) => a.data.publishedAt.getTime() - b.data.publishedAt.getTime())
  .slice(-3); // last 3 = most recent 3, ascending order = older on left
```

Update the `t` object to add:

```typescript
const t = {
  // ... keep existing keys ...
  back: '← Back to notes',
  backHref: '/notes',
  relatedNotes: 'Related Notes',
};
```

Template (replace the existing template below `---`):

```astro
<BaseLayout
  locale={locale}
  title={note.data.title}
  description={note.data.summary ?? undefined}
>
  <article class="container note-page" style={`--note-accent: ${getNoteAccentColor(note.data.colorToken, note.data.category)}`}>

    <!-- Back link -->
    <a href={t.backHref} class="back-link">{t.back}</a>

    <!-- Category badge -->
    {note.data.category && (
      <span class="note-category-badge">{note.data.category}</span>
    )}

    <!-- Title -->
    <h1 class="note-title">{note.data.title}</h1>

    <!-- Subtitle (summary used as subtitle if present) -->
    {note.data.summary && (
      <p class="note-subtitle">{note.data.summary}</p>
    )}

    <!-- Date -->
    <div class="note-meta">
      <time class="note-date" datetime={note.data.publishedAt.toISOString()}>
        {t.publishedAt} {note.data.publishedAt.toLocaleDateString(locale, { dateStyle: 'long' })}
      </time>
    </div>

    <!-- Tags -->
    {note.data.tags.length > 0 && (
      <div class="note-tags">
        {note.data.tags.map(tag => <span class="tag-pill">#{tag}</span>)}
      </div>
    )}

    <!-- Separator -->
    <hr class="preamble-divider" />

    <!-- Body content -->
    <div class="note-content prose">
      <Content />
    </div>

    <!-- Share -->
    <ShareButtons
      title={note.data.title}
      url={Astro.url.href}
      type="note"
      locale={locale}
    />

    <!-- Related notes: older on left, newer on right -->
    {relatedNotes.length > 0 && (
      <section class="related-notes">
        <h2 class="related-title">{t.relatedNotes}</h2>
        <div class="related-grid">
          {relatedNotes.map(related => (
            <a href={`${locale === 'en' ? '/notes' : '/pt-br/notes'}/${related.data.slug}`} class="related-card note-card"
               data-category={related.data.category ?? ''}
               style={`--note-accent: ${getNoteAccentColor(related.data.colorToken, related.data.category)}`}>
              <span class="note-date">{related.data.publishedAt.toLocaleDateString(locale, { dateStyle: 'medium' })}</span>
              <h3>{related.data.title}</h3>
              {related.data.category && <span class="note-category">{related.data.category}</span>}
            </a>
          ))}
        </div>
      </section>
    )}

  </article>

  <BackToTop />
</BaseLayout>
```

Add CSS for `.note-page`, `.note-category-badge`, `.note-title`, `.note-subtitle`, `.note-date`, `.tag-pill`, `.preamble-divider`, `.related-notes`, `.related-grid`, `.related-card` (reuse patterns from blog post styles — these are the same design; `.related-grid` is `display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4)` on desktop, `grid-template-columns: 1fr` on mobile).

- [ ] **Step 4: Repeat for `src/pages/pt-br/notes/[slug].astro`** with PT-BR strings:

```typescript
const t = {
  fallbackNotice: 'Esta nota não está disponível em Português. Mostrando a versão original.',
  publishedAt: 'Publicado em',
  back: '← Voltar para notas',
  backHref: '/pt-br/notes',
};
```

- [ ] **Step 5: Run tests**

```bash
npx playwright test tests/e2e/notes.spec.ts --grep "back to notes|share buttons" -x
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/pages/notes/[slug].astro src/pages/pt-br/notes/[slug].astro tests/e2e/notes.spec.ts
git commit -m "feat: overhaul notes individual page layout with share buttons and back-to-top"
```

---

## Task 11: OG Image Generation

**Files:**
- Create: `src/lib/ogImage.ts`
- Create: `src/pages/og/blog/[slug].png.ts`
- Create: `src/pages/og/notes/[slug].png.ts`
- Test: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Install dependencies**

```bash
pnpm add -D satori sharp
```

Verify `package.json` has both in `devDependencies`.

- [ ] **Step 2: Write failing test**

```typescript
test('OG image generates for blog post', async ({ page }) => {
  const response = await page.goto('/og/blog/2026-03-ci-firmware.en.png'); // use actual slug
  expect(response?.status()).toBe(200);
  expect(response?.headers()['content-type']).toContain('image/png');
});

test('OG image generates for note', async ({ page }) => {
  const response = await page.goto('/og/notes/debugging-habits.png'); // use actual slug
  expect(response?.status()).toBe(200);
  expect(response?.headers()['content-type']).toContain('image/png');
});
```

Run: `npx playwright test tests/e2e/smoke.spec.ts --grep "OG image" -x`
Expected: FAIL (404)

- [ ] **Step 3: Create `src/lib/ogImage.ts`**

```typescript
import { readFileSync } from 'fs';
import { resolve } from 'path';
import satori from 'satori';
import sharp from 'sharp';

// Load fonts once at module level
const geistFont = readFileSync(
  resolve('node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf')
);
const geistMonoFont = readFileSync(
  resolve('node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf')
);

export interface OGImageOptions {
  title: string;
  category?: string;
  siteName?: string;
  author?: string;
}

export async function generateOGImage(options: OGImageOptions): Promise<Buffer> {
  const {
    title,
    category,
    siteName = 'jts.dev',
    author = 'Jonathan',
  } = options;

  // Satori requires React-like JSX object syntax
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          background: '#0f0f1a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '60px 80px',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // Site name (top left)
          {
            type: 'p',
            props: {
              style: {
                position: 'absolute',
                top: '40px',
                left: '80px',
                fontFamily: 'Geist',
                fontSize: '16px',
                color: '#888',
                margin: 0,
              },
              children: siteName,
            },
          },
          // Category badge
          category && {
            type: 'div',
            props: {
              style: {
                background: '#7c3aed',
                color: '#fff',
                fontFamily: 'Geist',
                fontSize: '14px',
                padding: '4px 16px',
                borderRadius: '9999px',
                marginBottom: '16px',
                display: 'inline-flex',
              },
              children: category,
            },
          },
          // Title
          {
            type: 'h1',
            props: {
              style: {
                fontFamily: 'Geist',
                fontSize: '48px',
                fontWeight: '700',
                color: '#fff',
                lineHeight: '1.2',
                margin: 0,
                maxWidth: '900px',
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              },
              children: title,
            },
          },
          // Author + domain (bottom right)
          {
            type: 'p',
            props: {
              style: {
                position: 'absolute',
                bottom: '40px',
                right: '80px',
                fontFamily: 'Geist Mono',
                fontSize: '14px',
                color: '#888',
                margin: 0,
              },
              children: `${author} · ${siteName}`,
            },
          },
        ].filter(Boolean),
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Geist', data: geistFont, weight: 400, style: 'normal' },
        { name: 'Geist', data: geistFont, weight: 700, style: 'normal' },
        { name: 'Geist Mono', data: geistMonoFont, weight: 400, style: 'normal' },
      ],
    }
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}
```

- [ ] **Step 4: Create `src/pages/og/blog/[slug].png.ts`**

```typescript
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateOGImage } from '../../../lib/ogImage';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.data.slug },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as Awaited<ReturnType<typeof getStaticPaths>>[0]['props'];
  const png = await generateOGImage({
    title: post.data.title,
    category: post.data.category,
  });

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
```

- [ ] **Step 5: Create `src/pages/og/notes/[slug].png.ts`**

```typescript
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateOGImage } from '../../../lib/ogImage';

export const getStaticPaths: GetStaticPaths = async () => {
  const notes = await getCollection('notes');
  return notes.map(note => ({
    params: { slug: note.data.slug },
    props: { note },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { note } = props as Awaited<ReturnType<typeof getStaticPaths>>[0]['props'];
  const png = await generateOGImage({
    title: note.data.title,
    category: note.data.category,
  });

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
```

- [ ] **Step 6: Add `<slot name="head" />` to `BaseLayout.astro`**

`src/layouts/BaseLayout.astro` currently has no named head slot (confirmed). The `<head>` ends with `<SeoHead ... />`. Add a named slot immediately after:

```astro
<!-- In src/layouts/BaseLayout.astro, inside <head>, after <SeoHead /> -->
<SeoHead title={title} description={description} locale={locale} currentPath={Astro.url.pathname} />
<slot name="head" />   {/* ADD THIS LINE */}
```

- [ ] **Step 7: Add `og:image` meta to blog post and note layouts**

Now that `BaseLayout` has a `head` slot, use it in the four post/note page files:

```astro
<!-- In blog/[slug].astro and pt-br/blog/[slug].astro -->
<BaseLayout ...>
  <Fragment slot="head">
    <meta property="og:image" content={`/og/blog/${post.data.slug}.png`} />
  </Fragment>
  ...
</BaseLayout>
```

```astro
<!-- In notes/[slug].astro and pt-br/notes/[slug].astro -->
<BaseLayout ...>
  <Fragment slot="head">
    <meta property="og:image" content={`/og/notes/${note.data.slug}.png`} />
  </Fragment>
  ...
</BaseLayout>
```

- [ ] **Step 7: Run build to confirm OG images generate**

```bash
pnpm run build 2>&1 | grep -E "og/|error" | head -30
```

Expected: no errors, OG PNG routes visible in build output.

- [ ] **Step 8: Run tests**

```bash
npx playwright test tests/e2e/smoke.spec.ts --grep "OG image" -x
```

Expected: 2 PASS

- [ ] **Step 9: Commit**

```bash
git add src/lib/ogImage.ts src/pages/og/ tests/e2e/smoke.spec.ts src/pages/blog/[slug].astro src/pages/pt-br/blog/[slug].astro src/pages/notes/[slug].astro src/pages/pt-br/notes/[slug].astro
git commit -m "feat: add OG image generation for blog posts and notes"
```

---

## Final: Full Test Run

- [ ] **Step 1: Ensure dev/preview server is running**

```bash
pnpm run build && pnpm run preview
```

Playwright requires the server to be running. Open a second terminal and keep it running throughout the test run.

- [ ] **Step 2: Run full Playwright suite**

```bash
pnpm exec playwright test
```

Expected: all tests pass.

- [ ] **Step 3: Run clean build**

```bash
pnpm run build
```

Expected: clean build, no type errors, no content validation errors.

- [ ] **Step 4: Visual smoke check** — run `pnpm run preview` and check:
  - Home page circuit animation (dark and light mode)
  - Mobile layout at 375px (column order, search icon, bento grid)
  - Blog filter bar with badge counts
  - Individual blog post (preamble → separator → two-column)
  - Individual note page (back button, share, back-to-top)
  - PT-BR legal pages
  - OG image at `/og/blog/[slug].png`
