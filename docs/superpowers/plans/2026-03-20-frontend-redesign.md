# Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the visual layer of the personal website with a cohesive token-driven design system, Geist typography, tubelight nav indicator, iOS-style theme toggle, animated hero (background paths + typewriter), bento project cards, unified timeline, and a toast system — all in pure Astro + CSS + vanilla JS with no new runtime dependencies.

**Architecture:** Three sequential layers — tokens first (foundation), shell second (every-page chrome), pages last. Each layer is independently verifiable before the next begins. All token values live in `src/styles/tokens.css`; components consume them via CSS custom properties only.

**Tech Stack:** Astro, TypeScript, CSS custom properties, vanilla JS, `geist` npm package (self-hosted fonts), Playwright (E2E), Vitest (unit)

**Spec:** `docs/superpowers/specs/2026-03-19-frontend-redesign-design.md`

---

## Planned File Structure

### Layer 1 — Token System
| Action | File | Responsibility |
|--------|------|----------------|
| Create | `CLAUDE.md` | Project conventions reference |
| Rewrite | `src/styles/tokens.css` | Single source of truth for all design tokens |
| Modify | `src/styles/global.css` | Geist imports, updated utilities, button styles |
| Migrate | All `src/**/*.{astro,css,ts}` | Rename `--color-*` tokens to unprefixed names |

### Layer 2 — Shell
| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/layouts/BaseLayout.astro` | Mount Toast, update container token |
| Rewrite | `src/components/site/Header.astro` | Scroll blur, tubelight indicator, mobile drawer |
| Rewrite | `src/components/site/Footer.astro` | Three-column layout with social icons |
| Rewrite | `src/components/site/ThemeToggle.astro` | iOS pill with Moon/Sun SVGs |
| Modify | `src/components/site/LanguageSwitcher.astro` | Geist Mono, active/inactive styles |
| Create | `src/components/site/Toast.astro` | `window.showToast()` global, 4 variants |

### Layer 3 — Pages
| Action | File | Responsibility |
|--------|------|----------------|
| Rewrite | `src/components/home/Hero.astro` | Background paths SVG + typewriter |
| Modify | `src/pages/index.astro` | Mount Hero, wire up homepage |
| Modify | `src/components/home/HomeSections.astro` | Section pattern + bento project preview |
| Modify | `src/components/home/ContactSection.astro` | Updated styles |
| Modify | `src/components/blog/BlogList.astro` | Two-column year/entry layout |
| Modify | `src/pages/blog/index.astro` | Prose layout updates |
| Modify | `src/pages/blog/[slug].astro` | Post detail prose styles |
| Modify | `src/pages/pt-br/blog/index.astro` | PT-BR blog list |
| Modify | `src/pages/pt-br/blog/[slug].astro` | PT-BR blog post detail |
| Modify | `src/components/notes/NotesGrid.astro` | colorToken top border, hover lift |
| Modify | `src/components/notes/NotesFilters.astro` | Pill filter bar, accent active state |
| Modify | `src/pages/notes/index.astro` | Grid + filter layout |
| Modify | `src/pages/notes/[slug].astro` | Prose styles |
| Modify | `src/pages/pt-br/notes/index.astro` | PT-BR notes grid |
| Modify | `src/pages/pt-br/notes/[slug].astro` | PT-BR note detail |
| Modify | `src/content/portfolio/types.ts` | Add `type` to ExperienceEntry; `featured`/`icon`/`status` to Project |
| Modify | `src/content/portfolio/experience.ts` | Backfill `type:'work'`; add education entries |
| Modify | `src/content/portfolio/projects.ts` | Add `featured`, `icon`, `status` fields |
| Rewrite | `src/components/portfolio/ProjectCard.astro` | Bento grid card |
| Create | `src/components/portfolio/TimelineItem.astro` | Unified work+education timeline entry |
| Delete | `src/components/portfolio/ExperienceItem.astro` | Replaced by TimelineItem |
| Modify | `src/components/portfolio/PublicationItem.astro` | Updated styles |
| Modify | `src/pages/portfolio/index.astro` | Bento grid + unified timeline |
| Modify | `src/pages/now/index.astro` | Prose styles, status badge |
| Modify | `src/components/search/SearchDialog.astro` | Blur overlay, new input style |
| Verify | `src/pages/pt-br/**` | All PT-BR routes inherit styles correctly |

---

## Task 1: Create CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Create CLAUDE.md at the repository root**

```markdown
# CLAUDE.md — jts-website

## Project Source of Truth
- **Design Spec:** `docs/superpowers/specs/2026-03-19-personal-website-design.md`
- **Frontend Redesign Spec:** `docs/superpowers/specs/2026-03-19-frontend-redesign-design.md`
- **Implementation Plan:** `docs/superpowers/plans/2026-03-19-personal-website-implementation.md`
- **Frontend Redesign Plan:** `docs/superpowers/plans/2026-03-20-frontend-redesign.md`

## Engineering Core Principles
- **Static-First:** Astro, deterministic builds, no runtime services
- **Content as Contract:** Strict Zod validation, publish-blocking on invalid content
- **Bilingual by Design:** English default (`/`), Portuguese under `/pt-br/`
- **Component Discipline:** Small, focused Astro components, CSS variables only
- **Accessibility First:** Semantic markup, keyboard nav, focus states, correct contrast

## Design System

### Token Conventions
All visual values come from `src/styles/tokens.css`. Prefer CSS tokens over hardcoded values.
Intentional exceptions: toast status-semantic colors (`#22c55e`, `#ef4444`, `#f59e0b`) and
ThemeToggle thumb backgrounds (`#252538`, `#FFFFFF`) are hardcoded because no semantic token maps to them.

Key tokens:
- Colors: `--bg`, `--surface`, `--surface-high`, `--border`, `--text`, `--text-muted`, `--accent`, `--accent-hover`, `--accent-dim`
- Typography: `--font-sans` (Geist), `--font-mono` (Geist Mono), `--text-xs` through `--text-4xl`
- Spacing: `--space-1` through `--space-24`, `--section-gap`, `--content-gap`, `--card-padding`
- Layout: `--container-max` (52rem prose), `--wide-max` (72rem portfolio)
- Radii: `--radius-sm` (4px) / `--radius-md` (8px) / `--radius-lg` (12px) / `--radius-full` (9999px)
- Motion: `--duration-fast` (150ms) / `--duration-base` (250ms) / `--duration-slow` (350ms)
- Easing: `--ease-out` / `--ease-in-out`
- Shadows: `--shadow-sm` / `--shadow-md` / `--shadow-lg`

### Styling Conventions
- CSS variables from tokens.css exclusively — no Tailwind, no hardcoded values (except noted above)
- Component-scoped `<style>` blocks in Astro files
- Both `[data-theme='light']` and `[data-theme='dark']` must look polished
- Monospace font (`--font-mono`) for: dates, metadata labels, tag slugs, code, technical accents
- Sans font (`--font-sans`) for: all body text, headings, UI labels

### colorToken
Notes support an optional `colorToken` frontmatter field — a raw CSS color string.
Use directly as a CSS value; fall back to `var(--accent)` when absent.

## Interactive Components
- **ThemeToggle:** pill/track with Moon+Sun SVGs, `role="switch"`, `aria-checked`, vanilla JS
- **LanguageSwitcher:** `EN` / `PT` in Geist Mono, active locale weight 600
- **SearchDialog:** opened via `window.openSearch()` or pressing `/`; focus trap; Esc closes
- **Header mobile drawer:** `aria-expanded`, `aria-controls`, closes on link click and Escape
- **Nav active indicator:** tubelight pill + glow, position calculated in vanilla JS on load
- **Toast:** `window.showToast({ message, variant, title?, duration? })`; 4 variants; auto-dismiss
- **Hero typewriter:** vanilla JS, cycles phrases, `prefers-reduced-motion` respected
- **Hero background paths:** CSS-animated SVG, `prefers-reduced-motion` respected
- **Bento project cards:** pure CSS hover (dot pattern, lift, border accent), no JS needed

## Plan Mode Protocol
Before any code changes, review:
1. Content model alignment with spec
2. Validation and schema compliance
3. Test coverage gaps
4. Build determinism and SEO metadata
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "chore: add CLAUDE.md with design system and component conventions"
```

---

## Task 2: Token Naming Migration

Rename all old `--color-*` token references across `src/` before rewriting `tokens.css`. Doing the rename first keeps the site in a working state throughout.

**Files:**
- Modify: All `.astro`, `.css`, `.ts` files under `src/` that use old token names

- [ ] **Step 1: Verify the current list of old token usages**

```bash
grep -r "\-\-color-" /home/jonathan/Projects/jts-website/src --include="*.astro" --include="*.css" --include="*.ts" -l
```

Expected: a list of files — BaseLayout.astro, global.css, Header.astro, Footer.astro, ThemeToggle.astro, Hero.astro, and others.

- [ ] **Step 2: Rename `--color-bg` → `--bg` across src/**

```bash
find /home/jonathan/Projects/jts-website/src -type f \( -name "*.astro" -o -name "*.css" -o -name "*.ts" \) -exec sed -i 's/var(--color-bg)/var(--bg)/g' {} +
```

- [ ] **Step 3: Rename `--color-surface` → `--surface`**

```bash
find /home/jonathan/Projects/jts-website/src -type f \( -name "*.astro" -o -name "*.css" -o -name "*.ts" \) -exec sed -i 's/var(--color-surface)/var(--surface)/g' {} +
```

- [ ] **Step 4: Rename `--color-text-muted` → `--text-muted` (must run before `--color-text` to avoid partial match)**

```bash
find /home/jonathan/Projects/jts-website/src -type f \( -name "*.astro" -o -name "*.css" -o -name "*.ts" \) -exec sed -i 's/var(--color-text-muted)/var(--text-muted)/g' {} +
```

- [ ] **Step 5: Rename `--color-text` → `--text`**

```bash
find /home/jonathan/Projects/jts-website/src -type f \( -name "*.astro" -o -name "*.css" -o -name "*.ts" \) -exec sed -i 's/var(--color-text)/var(--text)/g' {} +
```

- [ ] **Step 6: Rename `--color-accent-muted` → `--accent-dim` (before `--color-accent`)**

```bash
find /home/jonathan/Projects/jts-website/src -type f \( -name "*.astro" -o -name "*.css" -o -name "*.ts" \) -exec sed -i 's/var(--color-accent-muted)/var(--accent-dim)/g' {} +
```

- [ ] **Step 7: Rename `--color-accent` → `--accent`**

```bash
find /home/jonathan/Projects/jts-website/src -type f \( -name "*.astro" -o -name "*.css" -o -name "*.ts" \) -exec sed -i 's/var(--color-accent)/var(--accent)/g' {} +
```

- [ ] **Step 8: Rename `--color-border` → `--border`**

```bash
find /home/jonathan/Projects/jts-website/src -type f \( -name "*.astro" -o -name "*.css" -o -name "*.ts" \) -exec sed -i 's/var(--color-border)/var(--border)/g' {} +
```

- [ ] **Step 9: Rename `--color-link-hover` → `--accent-hover` (before `--color-link`)**

```bash
find /home/jonathan/Projects/jts-website/src -type f \( -name "*.astro" -o -name "*.css" -o -name "*.ts" \) -exec sed -i 's/var(--color-link-hover)/var(--accent-hover)/g' {} +
```

- [ ] **Step 10: Rename `--color-link` → `--accent`**

```bash
find /home/jonathan/Projects/jts-website/src -type f \( -name "*.astro" -o -name "*.css" -o -name "*.ts" \) -exec sed -i 's/var(--color-link)/var(--accent)/g' {} +
```

- [ ] **Step 11: Rename `--container-max-width` → `--container-max` in BaseLayout.astro**

```bash
sed -i 's/var(--container-max-width)/var(--container-max)/g' /home/jonathan/Projects/jts-website/src/layouts/BaseLayout.astro
```

- [ ] **Step 12: Rename `--max-width` → `--container-max` in global.css**

```bash
sed -i 's/var(--max-width)/var(--container-max)/g' /home/jonathan/Projects/jts-website/src/styles/global.css
```

- [ ] **Step 13: Verify no old token names remain**

```bash
grep -r "\-\-color-\|var(--max-width)\|var(--container-max-width)" /home/jonathan/Projects/jts-website/src --include="*.astro" --include="*.css" --include="*.ts"
```

Expected: no output (all old names replaced).

- [ ] **Step 14: Verify build still passes**

```bash
cd /home/jonathan/Projects/jts-website && pnpm build
```

Expected: build completes without errors. The site will still use old token values (tokens.css not yet rewritten) — that is correct at this stage.

- [ ] **Step 15: Commit**

```bash
git add -u src/
git commit -m "refactor: migrate CSS token names from --color-* prefix to unprefixed convention"
```

---

## Task 3: Rewrite tokens.css + Install Geist + Update global.css

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Install the geist npm package**

```bash
cd /home/jonathan/Projects/jts-website && pnpm add geist
```

Expected: `geist` appears in `package.json` dependencies.

- [ ] **Step 2: Rewrite `src/styles/tokens.css`**

```css
/* ============================================================
   DESIGN TOKENS — jts-website
   Single source of truth. All components consume these only.
   ============================================================ */

:root {
  /* Typography */
  --font-sans: 'Geist', system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, monospace;

  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.5rem;

  --leading-tight:   1.2;
  --leading-normal:  1.5;
  --leading-relaxed: 1.7;

  --weight-normal:   400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;

  /* Spacing — 8-point scale */
  --space-1:  0.25rem;
  --space-2:  0.5rem;
  --space-3:  0.75rem;
  --space-4:  1rem;
  /* Note: --space-5 is intentionally omitted — scale jumps 4→6 on the 8-point grid */
  --space-6:  1.5rem;
  --space-8:  2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;

  /* Semantic spacing */
  --section-gap:  var(--space-20);
  --content-gap:  var(--space-8);
  --card-padding: var(--space-6);

  /* Layout */
  --container-max: 52rem;
  --wide-max:      72rem;

  /* Radii */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-full: 9999px;

  /* Motion */
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 350ms;
  --ease-out:     cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Dark theme ─────────────────────────────────────────── */
[data-theme='dark'] {
  --bg:           #0A0A0F;
  --surface:      #111118;
  --surface-high: #16161F;
  --border:       #1E1E2E;
  --text:         #E8E8F2;
  --text-muted:   #6E7191;
  --accent:       #6272EA;
  --accent-hover: #7B8EF5;
  --accent-dim:   rgba(98, 114, 234, 0.10);

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.40);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.50);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.60);
}

/* ── Light theme ────────────────────────────────────────── */
[data-theme='light'] {
  --bg:           #F7F8FC;
  --surface:      #FFFFFF;
  --surface-high: #EEF0F8;
  --border:       #DDE0EE;
  --text:         #0F1117;
  --text-muted:   #60657A;
  --accent:       #4A5BD4;
  --accent-hover: #3A4BBE;
  --accent-dim:   rgba(74, 91, 212, 0.10);

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.10);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.16);
}
```

- [ ] **Step 3: Rewrite `src/styles/global.css`**

```css
@import 'geist/dist/fonts/geist-sans/style.css';
@import 'geist/dist/fonts/geist-mono/style.css';
@import './tokens.css';

/* ── Reset ──────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }
html, body { height: 100%; }

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  background-color: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  transition: background-color var(--duration-base) var(--ease-in-out),
              color var(--duration-base) var(--ease-in-out);
}

img, picture, video, canvas, svg { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; }
p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }

/* ── Site layout ────────────────────────────────────────── */
.site-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ── Typography hierarchy ───────────────────────────────── */
h1 {
  font-size: var(--text-3xl);
  line-height: var(--leading-tight);
  font-weight: var(--weight-bold);
  color: var(--text);
  margin-bottom: var(--space-4);
}
h2 {
  font-size: var(--text-2xl);
  line-height: var(--leading-tight);
  font-weight: var(--weight-semibold);
  color: var(--text);
  margin-top: var(--space-8);
  margin-bottom: var(--space-4);
}
h3 {
  font-size: var(--text-xl);
  line-height: var(--leading-normal);
  font-weight: var(--weight-semibold);
  color: var(--text);
  margin-top: var(--space-6);
  margin-bottom: var(--space-2);
}

@media (min-width: 48rem) {
  h1 { font-size: var(--text-4xl); }
}

a {
  color: var(--accent);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);
}
a:hover { color: var(--accent-hover); text-decoration: underline; }

/* ── Layout utilities ───────────────────────────────────── */
.container {
  max-width: var(--container-max);
  margin-inline: auto;
  padding-inline: var(--space-4);
}

.container--wide {
  max-width: var(--wide-max);
  margin-inline: auto;
  padding-inline: var(--space-4);
}

/* ── Button styles ──────────────────────────────────────── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--accent);
  color: #fff;
  padding: var(--space-2) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out);
}
.btn-primary:hover { background: var(--accent-hover); text-decoration: none; color: #fff; }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: transparent;
  color: var(--text);
  padding: var(--space-2) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
  text-decoration: none;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: border-color var(--duration-fast) var(--ease-out),
              background var(--duration-fast) var(--ease-out);
}
.btn-secondary:hover {
  border-color: var(--accent);
  background: var(--accent-dim);
  text-decoration: none;
  color: var(--text);
}

/* ── Tag / pill ─────────────────────────────────────────── */
.tag {
  display: inline-block;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--surface-high);
  color: var(--text-muted);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  white-space: nowrap;
}

/* ── Prose (blog/notes/now content) ─────────────────────── */
.prose {
  max-width: var(--container-max);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text);
}
.prose p { margin-bottom: var(--space-4); }
.prose h2 { border-left: 3px solid var(--accent); padding-left: var(--space-3); }
.prose pre {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  margin-bottom: var(--space-4);
}
.prose code:not(pre code) {
  font-family: var(--font-mono);
  font-size: 0.875em;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 1px 4px;
}

/* ── Accessibility ──────────────────────────────────────── */
.sr-only, .visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border-width: 0;
}

.skip-link {
  position: absolute;
  top: -100px;
  left: var(--space-4);
  background: var(--accent);
  color: #fff;
  padding: var(--space-2) var(--space-4);
  z-index: 10000;
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  font-weight: var(--weight-medium);
  transition: top var(--duration-fast);
}
.skip-link:focus { top: 0; }

*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}

/* ── Misc ───────────────────────────────────────────────── */
.list-none { list-style: none; padding: 0; }
```

- [ ] **Step 4: Verify build and both themes render without errors**

```bash
cd /home/jonathan/Projects/jts-website && pnpm build
```

Expected: build passes. Open `pnpm preview` and manually verify light and dark themes load with Geist font (visible in browser DevTools → Fonts) and correct color values.

- [ ] **Step 5: Run existing unit tests to confirm no regressions**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:unit
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/styles/tokens.css src/styles/global.css package.json pnpm-lock.yaml
git commit -m "feat: rewrite design tokens, install Geist fonts, update global styles"
```

---

## Task 4: BaseLayout + Toast Component

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Create: `src/components/site/Toast.astro`
- Modify: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Write a failing E2E test for the toast system**

Add to `tests/e2e/smoke.spec.ts`:

```typescript
test('window.showToast fires a toast and it disappears after duration', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    (window as any).showToast({ message: 'Hello toast', variant: 'success', duration: 1000 });
  });
  await expect(page.locator('.toast-card')).toBeVisible();
  await expect(page.locator('.toast-card')).toContainText('Hello toast');
  // after 1s + animation it should be gone
  await page.waitForTimeout(1500);
  await expect(page.locator('.toast-card')).not.toBeVisible();
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/smoke.spec.ts
```

Expected: FAIL — `window.showToast` is not defined yet.

- [ ] **Step 3: Create `src/components/site/Toast.astro`**

```astro
---
// Toast.astro — global toast notification system
// API: window.showToast({ message, variant?, title?, duration? })
---

<div id="toast-container" aria-live="polite" aria-atomic="false"></div>

<style>
  #toast-container {
    position: fixed;
    bottom: var(--space-6);
    right: var(--space-6);
    z-index: 200;
    display: flex;
    flex-direction: column-reverse;
    gap: var(--space-2);
    pointer-events: none;
  }

  .toast-card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    max-width: 320px;
    padding: var(--space-3) var(--space-4);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    pointer-events: all;
    /* entry */
    animation: toast-in var(--duration-base) var(--ease-out) forwards;
  }

  .toast-card.toast-exit {
    animation: toast-out var(--duration-base) var(--ease-out) forwards;
  }

  @keyframes toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes toast-out {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(4px); }
  }

  .toast-card[data-variant='default'] { border-left: 4px solid var(--border); }
  .toast-card[data-variant='success'] { border-left: 4px solid #22c55e; }
  .toast-card[data-variant='error']   { border-left: 4px solid #ef4444; }
  .toast-card[data-variant='warning'] { border-left: 4px solid #f59e0b; }

  .toast-icon { flex-shrink: 0; width: 16px; height: 16px; margin-top: 1px; }
  .toast-card[data-variant='default'] .toast-icon { color: var(--text-muted); }
  .toast-card[data-variant='success'] .toast-icon { color: #22c55e; }
  .toast-card[data-variant='error']   .toast-icon { color: #ef4444; }
  .toast-card[data-variant='warning'] .toast-icon { color: #f59e0b; }

  .toast-body { flex: 1; min-width: 0; }
  .toast-title {
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    margin-bottom: 2px;
    line-height: var(--leading-normal);
  }
  .toast-card[data-variant='default'] .toast-title { color: var(--text); }
  .toast-card[data-variant='success'] .toast-title { color: #22c55e; }
  .toast-card[data-variant='error']   .toast-title { color: #ef4444; }
  .toast-card[data-variant='warning'] .toast-title { color: #f59e0b; }

  .toast-message {
    font-size: var(--text-xs);
    color: var(--text-muted);
    line-height: var(--leading-normal);
  }

  .toast-dismiss {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    padding: 0;
    line-height: 1;
    font-size: var(--text-base);
    flex-shrink: 0;
    transition: color var(--duration-fast);
  }
  .toast-dismiss:hover { color: var(--text); }
</style>

<script>
  type ToastVariant = 'default' | 'success' | 'error' | 'warning';

  interface ToastOptions {
    message: string;
    variant?: ToastVariant;
    title?: string;
    duration?: number;
  }

  const ICONS: Record<ToastVariant, string> = {
    default: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533ZM8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/></svg>`,
    success: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm3.354 5.354a.5.5 0 0 0-.708-.708L7 8.293 5.354 6.646a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l4-4Z"/></svg>`,
    error:   `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm-.354 5.354a.5.5 0 0 1 .708 0L8 6.293l-.354-.354a.5.5 0 0 1 .708-.708L8 5.586l.354-.354a.5.5 0 0 1 .708.708L8.707 6.5l.354.354a.5.5 0 0 1-.708.708L8 7.207l-.354.354a.5.5 0 0 1-.708-.708L7.293 6.5l-.354-.354a.5.5 0 0 1 0-.792ZM8 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/></svg>`,
    warning: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057Zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566ZM8 6c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 6.995A.905.905 0 0 1 8 6Zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/></svg>`,
  };

  function showToast({ message, variant = 'default', title, duration = 4000 }: ToastOptions) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const card = document.createElement('div');
    card.className = 'toast-card';
    card.setAttribute('data-variant', variant);
    card.setAttribute('role', 'status');

    card.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${ICONS[variant]}</span>
      <div class="toast-body">
        ${title ? `<p class="toast-title">${title}</p>` : ''}
        <p class="toast-message">${message}</p>
      </div>
      <button class="toast-dismiss" aria-label="Dismiss">×</button>
    `;

    function dismiss() {
      card.classList.add('toast-exit');
      card.addEventListener('animationend', () => card.remove(), { once: true });
    }

    card.querySelector('.toast-dismiss')?.addEventListener('click', dismiss);
    container.appendChild(card);

    const timer = setTimeout(dismiss, duration);
    card.querySelector('.toast-dismiss')?.addEventListener('click', () => clearTimeout(timer), { once: true });
  }

  (window as any).showToast = showToast;
</script>
```

- [ ] **Step 4: Mount Toast in `src/layouts/BaseLayout.astro`**

Add the import and `<Toast />` component after `<SearchDialog />`:

```astro
import Toast from '../components/site/Toast.astro';
```

And in the `<body>`:
```astro
<Toast />
```

Also update the `<style is:global>` block to use `--container-max` (already done in Task 2), confirming `max-width: var(--container-max)` is correct.

- [ ] **Step 5: Run the toast E2E test**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/smoke.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/site/Toast.astro src/layouts/BaseLayout.astro tests/e2e/smoke.spec.ts
git commit -m "feat: add Toast component with window.showToast() global API"
```

---

## Task 5: Header Redesign

**Files:**
- Rewrite: `src/components/site/Header.astro`
- Modify: `tests/e2e/theme.spec.ts`

- [ ] **Step 1: Write failing E2E tests for header scroll and mobile drawer**

Add to `tests/e2e/theme.spec.ts`:

```typescript
test('header gains scrolled class after page scroll', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 200));
  await expect(page.locator('.site-header')).toHaveClass(/scrolled/);
});

test('mobile drawer opens and closes via hamburger', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const hamburger = page.getByRole('button', { name: /menu/i });
  await expect(page.locator('#mobile-nav')).not.toBeVisible();
  await hamburger.click();
  await expect(page.locator('#mobile-nav')).toBeVisible();
  await hamburger.click();
  await expect(page.locator('#mobile-nav')).not.toBeVisible();
});
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/theme.spec.ts
```

Expected: new tests FAIL; existing theme test may still pass.

- [ ] **Step 3: Rewrite `src/components/site/Header.astro`**

```astro
---
import { getNavigation } from '../../lib/navigation';
import { type Locale } from '../../lib/content/locale';
import ThemeToggle from './ThemeToggle.astro';
import LanguageSwitcher from './LanguageSwitcher.astro';

interface Props {
  locale: Locale;
  currentPath?: string;
}

const { locale, currentPath = Astro.url.pathname } = Astro.props;
const navItems = getNavigation(locale);
---

<header class="site-header" id="site-header">
  <div class="header-inner">
    <a href={locale === 'en' ? '/' : `/${locale}`} class="logo" aria-label="Home">
      Jonathan
    </a>

    <nav class="main-nav" aria-label="Main navigation" id="main-nav">
      <span class="nav-indicator" aria-hidden="true"></span>
      <ul class="nav-list">
        {navItems.map((item) => (
          <li>
            <a
              href={item.href}
              class={currentPath === item.href || (item.href !== '/' && item.href !== '/pt-br' && currentPath.startsWith(item.href)) ? 'active' : ''}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>

    <div class="header-actions">
      <button class="search-btn" aria-label="Open search" onclick="window.openSearch?.()">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
          <circle cx="8" cy="8" r="5"/><path d="m13 13 3 3"/>
        </svg>
      </button>
      <LanguageSwitcher currentLocale={locale} currentPath={currentPath} />
      <ThemeToggle />
    </div>

    <button
      class="hamburger"
      id="hamburger"
      aria-label="Open menu"
      aria-expanded="false"
      aria-controls="mobile-nav"
      type="button"
    >
      <span class="ham-icon ham-open" aria-hidden="true">☰</span>
      <span class="ham-icon ham-close" aria-hidden="true">✕</span>
    </button>
  </div>

  <div class="mobile-nav" id="mobile-nav" aria-hidden="true">
    <ul class="mobile-nav-list">
      {navItems.map((item) => (
        <li><a href={item.href}>{item.label}</a></li>
      ))}
    </ul>
    <div class="mobile-actions">
      <LanguageSwitcher currentLocale={locale} currentPath={currentPath} />
      <ThemeToggle />
    </div>
  </div>
</header>

<script>
  const header = document.getElementById('site-header');
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  // ── Scroll blur ──────────────────────────────────────────
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:100%;pointer-events:none;';
  document.body.prepend(sentinel);

  const io = new IntersectionObserver(([entry]) => {
    header?.classList.toggle('scrolled', !entry.isIntersecting);
  }, { threshold: 1 });
  io.observe(sentinel);

  // ── Mobile drawer ────────────────────────────────────────
  function setDrawer(open: boolean) {
    hamburger?.setAttribute('aria-expanded', String(open));
    mobileNav?.setAttribute('aria-hidden', String(!open));
    mobileNav?.classList.toggle('open', open);
    hamburger?.querySelector('.ham-open')?.classList.toggle('hidden', open);
    hamburger?.querySelector('.ham-close')?.classList.toggle('hidden', !open);
    if (!open) hamburger?.setAttribute('aria-label', 'Open menu');
    else hamburger?.setAttribute('aria-label', 'Close menu');
  }

  hamburger?.addEventListener('click', () => {
    const isOpen = mobileNav?.classList.contains('open');
    setDrawer(!isOpen);
  });

  mobileNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setDrawer(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav?.classList.contains('open')) setDrawer(false);
  });

  // ── Tubelight nav indicator ──────────────────────────────
  const nav = document.querySelector('.main-nav') as HTMLElement | null;
  const indicator = nav?.querySelector('.nav-indicator') as HTMLElement | null;
  const activeLink = nav?.querySelector('a.active') as HTMLElement | null;

  function moveIndicator(target: HTMLElement) {
    if (!indicator || !nav) return;
    indicator.style.left  = target.offsetLeft + 'px';
    indicator.style.width = target.offsetWidth + 'px';
    indicator.style.opacity = '1';
  }

  if (activeLink) {
    // Snap without transition on load
    indicator?.style.setProperty('transition', 'none');
    moveIndicator(activeLink);
    requestAnimationFrame(() => {
      indicator?.style.removeProperty('transition');
    });
  }

  nav?.querySelectorAll<HTMLAnchorElement>('a').forEach(link => {
    link.addEventListener('mouseenter', () => moveIndicator(link));
    link.addEventListener('mouseleave', () => { if (activeLink) moveIndicator(activeLink); });
  });
</script>

<style>
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

  .site-header.scrolled {
    background: var(--surface-high);
    backdrop-filter: blur(12px);
    border-bottom-color: var(--border);
  }

  .header-inner {
    max-width: var(--wide-max);
    margin-inline: auto;
    padding-inline: var(--space-6);
    height: 4rem;
    display: flex;
    align-items: center;
    gap: var(--space-6);
  }

  .logo {
    font-family: var(--font-sans);
    font-weight: var(--weight-semibold);
    font-size: var(--text-base);
    color: var(--text);
    text-decoration: none;
    flex-shrink: 0;
  }
  .logo:hover { color: var(--accent); text-decoration: none; }

  /* ── Desktop nav ── */
  .main-nav {
    display: none;
    position: relative;
    flex: 1;
    justify-content: center;
  }
  @media (min-width: 48rem) { .main-nav { display: flex; } }

  .nav-list {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    list-style: none;
    padding: 0;
    margin: 0;
  }

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
    transition: color var(--duration-fast) var(--ease-out);
  }
  .nav-list a:hover, .nav-list a.active { color: var(--text); text-decoration: none; }
  .nav-list a.active { color: var(--accent); }

  .nav-indicator {
    position: absolute;
    height: 32px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--surface-high);
    border-radius: var(--radius-full);
    opacity: 0;
    pointer-events: none;
    transition: left var(--duration-base) var(--ease-out),
                width var(--duration-base) var(--ease-out),
                opacity var(--duration-fast);
  }

  .nav-indicator::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 40%;
    height: 2px;
    border-radius: 1px;
    background: var(--accent);
    box-shadow: 0 0 8px 2px var(--accent);
    opacity: 0.8;
  }

  /* ── Header actions ── */
  .header-actions {
    display: none;
    align-items: center;
    gap: var(--space-3);
    margin-left: auto;
  }
  @media (min-width: 48rem) { .header-actions { display: flex; } }

  .search-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    padding: var(--space-1);
    display: flex;
    align-items: center;
    border-radius: var(--radius-sm);
    transition: color var(--duration-fast);
  }
  .search-btn:hover { color: var(--text); }

  /* ── Hamburger ── */
  .hamburger {
    display: flex;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    padding: var(--space-1);
    margin-left: auto;
    font-size: var(--text-lg);
    line-height: 1;
  }
  @media (min-width: 48rem) { .hamburger { display: none; } }

  .ham-icon.hidden { display: none; }

  /* ── Mobile drawer ── */
  .mobile-nav {
    display: block;
    overflow: hidden;
    max-height: 0;
    background: var(--surface-high);
    border-top: 1px solid var(--border);
    transition: max-height var(--duration-slow) var(--ease-out);
  }
  .mobile-nav.open { max-height: 400px; }

  @media (min-width: 48rem) { .mobile-nav { display: none; } }

  .mobile-nav-list {
    list-style: none;
    padding: var(--space-4) var(--space-6);
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .mobile-nav-list a {
    display: block;
    padding: var(--space-2) 0;
    font-size: var(--text-base);
    color: var(--text-muted);
    text-decoration: none;
    font-weight: var(--weight-medium);
  }
  .mobile-nav-list a:hover { color: var(--text); text-decoration: none; }

  .mobile-actions {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-6) var(--space-6);
    border-top: 1px solid var(--border);
  }
</style>
```

- [ ] **Step 4: Run header tests**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/theme.spec.ts
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/site/Header.astro tests/e2e/theme.spec.ts
git commit -m "feat: redesign Header with scroll blur, tubelight indicator, and mobile drawer"
```

---

## Task 6: ThemeToggle Pill + LanguageSwitcher + Footer

**Files:**
- Rewrite: `src/components/site/ThemeToggle.astro`
- Modify: `src/components/site/LanguageSwitcher.astro`
- Rewrite: `src/components/site/Footer.astro`
- Modify: `tests/e2e/theme.spec.ts`

- [ ] **Step 1: Update the theme toggle E2E test to match pill behavior**

In `tests/e2e/theme.spec.ts`, update the existing toggle test:

```typescript
test('theme toggle pill switches theme and persists on reload', async ({ page }) => {
  await page.goto('/');
  const toggle = page.locator('.theme-toggle');
  await expect(toggle).toBeVisible();
  // get initial theme
  const initialTheme = await page.locator('html').getAttribute('data-theme');
  await toggle.click();
  const newTheme = await page.locator('html').getAttribute('data-theme');
  expect(newTheme).not.toBe(initialTheme);
  // persists
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', newTheme!);
});
```

- [ ] **Step 2: Run to confirm it fails**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/theme.spec.ts --grep "theme toggle pill"
```

Expected: FAIL (no `.theme-toggle` selector matches current button).

- [ ] **Step 3: Rewrite `src/components/site/ThemeToggle.astro`**

```astro
---
---
<button
  class="theme-toggle"
  role="switch"
  aria-checked="false"
  aria-label="Toggle theme"
  type="button"
>
  <span class="toggle-thumb" aria-hidden="true">
    <!-- Moon SVG (dark mode active) -->
    <svg class="icon-moon" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M13 9.5a6.5 6.5 0 1 1-8-6.285A5 5 0 0 0 13 9.5Z"/>
    </svg>
    <!-- Sun SVG (light mode active) -->
    <svg class="icon-sun" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <circle cx="7" cy="7" r="2.5"/>
      <path d="M7 1v1M7 12v1M1 7h1M12 7h1M2.93 2.93l.7.7M10.37 10.37l.7.7M2.93 11.07l.7-.7M10.37 3.63l.7-.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/>
    </svg>
  </span>
  <span class="toggle-inactive" aria-hidden="true">
    <!-- Sun SVG (inactive in dark mode) -->
    <svg class="icon-sun-dim" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <circle cx="7" cy="7" r="2.5"/>
      <path d="M7 1v1M7 12v1M1 7h1M12 7h1M2.93 2.93l.7.7M10.37 10.37l.7.7M2.93 11.07l.7-.7M10.37 3.63l.7-.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/>
    </svg>
    <!-- Moon SVG (inactive in light mode) -->
    <svg class="icon-moon-dim" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M13 9.5a6.5 6.5 0 1 1-8-6.285A5 5 0 0 0 13 9.5Z"/>
    </svg>
  </span>
</button>

<script>
  import { toggleTheme, getTheme } from '../../lib/theme/theme';

  function applyToggleState(theme: string) {
    const toggle = document.querySelector('.theme-toggle') as HTMLButtonElement | null;
    if (!toggle) return;
    const isDark = theme === 'dark';
    toggle.setAttribute('aria-checked', String(isDark));
    toggle.setAttribute('data-theme-state', theme);
  }

  const toggle = document.querySelector('.theme-toggle');
  applyToggleState(getTheme());

  toggle?.addEventListener('click', () => {
    toggleTheme();
    applyToggleState(getTheme());
  });
</script>

<style>
  .theme-toggle {
    position: relative;
    width: 3.5rem;
    height: 1.75rem;
    border-radius: var(--radius-full);
    padding: 2px;
    background: var(--surface-high);
    border: 1px solid var(--border);
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    transition: border-color var(--duration-fast);
  }
  .theme-toggle:hover { border-color: var(--text-muted); }

  .toggle-thumb {
    position: absolute;
    left: 2px;
    width: 1.35rem;
    height: 1.35rem;
    border-radius: 50%;
    background: #252538;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text);
    transition: transform var(--duration-base) var(--ease-in-out),
                background var(--duration-base) var(--ease-in-out);
  }

  .toggle-inactive {
    position: absolute;
    right: 4px;
    width: 1.35rem;
    height: 1.35rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    opacity: 0.35;
  }

  /* Dark state — thumb left, shows Moon; inactive right shows Sun */
  .icon-sun, .icon-moon-dim { display: none; }
  .icon-moon, .icon-sun-dim { display: block; }

  /* Light state */
  [data-theme-state='light'] .toggle-thumb {
    transform: translateX(calc(3.5rem - 1.35rem - 4px));
    background: #ffffff;
  }
  [data-theme-state='light'] .toggle-inactive {
    right: auto;
    left: 4px;
  }
  [data-theme-state='light'] .icon-moon { display: none; }
  [data-theme-state='light'] .icon-sun  { display: block; }
  [data-theme-state='light'] .icon-sun-dim  { display: none; }
  [data-theme-state='light'] .icon-moon-dim { display: block; }
</style>
```

- [ ] **Step 4: Update `src/components/site/LanguageSwitcher.astro`**

Read the existing file first, then update its styles to use Geist Mono and new token names. The props interface should also accept `currentPath`:

```astro
---
import { type Locale } from '../../lib/content/locale';

interface Props {
  currentLocale: Locale;
  currentPath?: string;
}

const { currentLocale } = Astro.props;
const enHref = '/';
const ptHref = '/pt-br';
---

<div class="lang-switcher" aria-label="Language switcher">
  <a href={enHref} class={currentLocale === 'en' ? 'active' : ''} hreflang="en">EN</a>
  <span class="sep" aria-hidden="true">/</span>
  <a href={ptHref} class={currentLocale === 'pt-br' ? 'active' : ''} hreflang="pt-BR">PT</a>
</div>

<style>
  .lang-switcher {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }

  .lang-switcher a {
    color: var(--text-muted);
    text-decoration: none;
    font-weight: var(--weight-normal);
    transition: color var(--duration-fast);
    padding: 2px 4px;
  }
  .lang-switcher a:hover { color: var(--text); text-decoration: none; }
  .lang-switcher a.active { color: var(--text); font-weight: var(--weight-semibold); }

  .sep { color: var(--text-muted); }
</style>
```

- [ ] **Step 5: Rewrite `src/components/site/Footer.astro`**

```astro
---
interface Props {
  locale: 'en' | 'pt-br';
}

const { locale } = Astro.props;
const currentYear = new Date().getFullYear();

const t = {
  en:    { rights: 'All rights reserved.' },
  'pt-br': { rights: 'Todos os direitos reservados.' },
}[locale];
---

<footer class="site-footer">
  <div class="footer-inner">
    <p class="footer-copy">&copy; {currentYear} Jonathan. {t.rights}</p>

    <div class="social-links">
      <a href="https://github.com" aria-label="GitHub" rel="noopener noreferrer" target="_blank">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"/>
        </svg>
      </a>
      <a href="https://linkedin.com" aria-label="LinkedIn" rel="noopener noreferrer" target="_blank">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
      <a href="/rss.xml" aria-label="RSS feed" target="_blank">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/>
        </svg>
      </a>
    </div>

    <div class="footer-lang">
      <a href="/" hreflang="en">EN</a>
      <span>/</span>
      <a href="/pt-br" hreflang="pt-BR">PT</a>
    </div>
  </div>
</footer>

<style>
  .site-footer {
    border-top: 1px solid var(--border);
    padding-block: var(--space-8);
    color: var(--text-muted);
    font-size: var(--text-sm);
  }

  .footer-inner {
    max-width: var(--wide-max);
    margin-inline: auto;
    padding-inline: var(--space-6);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  .footer-copy { margin: 0; }

  .social-links {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .social-links a {
    color: var(--text-muted);
    text-decoration: none;
    display: flex;
    transition: color var(--duration-fast);
  }
  .social-links a:hover { color: var(--text); text-decoration: none; }

  .footer-lang {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }
  .footer-lang a {
    color: var(--text-muted);
    text-decoration: none;
    transition: color var(--duration-fast);
  }
  .footer-lang a:hover { color: var(--text); }
  .footer-lang span { color: var(--text-muted); }
</style>
```

- [ ] **Step 6: Run theme tests**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/theme.spec.ts
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/site/ThemeToggle.astro src/components/site/LanguageSwitcher.astro src/components/site/Footer.astro tests/e2e/theme.spec.ts
git commit -m "feat: redesign ThemeToggle pill, LanguageSwitcher, and Footer"
```

---

## Task 7: Hero Component — Background Paths + Typewriter

**Files:**
- Rewrite: `src/components/home/Hero.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/pt-br/index.astro`
- Modify: `tests/e2e/home.spec.ts`

- [ ] **Step 1: Write failing E2E tests for Hero**

Add to `tests/e2e/home.spec.ts`:

```typescript
test('hero renders name, monospace label, CTA buttons, and typewriter', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero h1')).toBeVisible();
  await expect(page.locator('.typewriter-prefix')).toBeVisible();
  await expect(page.locator('a[href="/portfolio"]').first()).toBeVisible();
  await expect(page.locator('a[href="/blog"]').first()).toBeVisible();
});

test('hero does not render a nav element', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero nav')).not.toBeAttached();
});
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/home.spec.ts
```

Expected: at least the nav check fails (hero currently renders nav).

- [ ] **Step 3: Rewrite `src/components/home/Hero.astro`**

```astro
---
import type { Locale } from '../../lib/content/locale';

interface Props {
  locale: Locale;
  typewriterPrefix: string;
  typewriterPhrases: string[];
}

const { locale, typewriterPrefix, typewriterPhrases } = Astro.props;

const t = {
  en: {
    label: '// embedded systems engineer',
    name: 'Jonathan',
    portfolioCta: 'View Portfolio',
    blogCta: 'Read Blog',
  },
  'pt-br': {
    label: '// engenheiro de software embarcado',
    name: 'Jonathan',
    portfolioCta: 'Ver Portfólio',
    blogCta: 'Ler Blog',
  },
}[locale];

const portfolioHref = locale === 'en' ? '/portfolio' : '/pt-br/portfolio';
const blogHref      = locale === 'en' ? '/blog'      : '/pt-br/blog';

// Generate 36 SVG paths using the spec formula
const paths = Array.from({ length: 36 }, (_, i) => {
  const d = `M${-380 - i*5} ${-189 + i*6} C${-380 - i*5} ${-189 + i*6} ${-312 - i*5} ${216 - i*6} ${152 - i*5} ${343 - i*6} C${616 - i*5} ${470 - i*6} ${684 - i*5} ${875 - i*6} ${684 - i*5} ${875 - i*6}`;
  const opacity = +(0.04 + i * 0.004).toFixed(3);
  const strokeWidth = +(0.5 + i * 0.029).toFixed(2);
  const duration = +(20 + i * 0.42).toFixed(1);
  const delay = +(-i * 0.22).toFixed(2);
  return { d, opacity, strokeWidth, duration, delay };
});
---

<section class="hero" aria-label="Introduction">
  <!-- Background paths -->
  <svg
    class="hero-paths"
    viewBox="0 0 1200 500"
    fill="none"
    aria-hidden="true"
  >
    {paths.map((p) => (
      <path
        d={p.d}
        stroke="currentColor"
        stroke-width={p.strokeWidth}
        stroke-opacity={p.opacity}
        stroke-dasharray="2000"
        stroke-dashoffset="2000"
        style={`animation: hero-flow ${p.duration}s ${p.delay}s linear infinite alternate;`}
      />
    ))}
  </svg>

  <!-- Content -->
  <div class="hero-content">
    <p class="hero-label">{t.label}</p>
    <h1 class="hero-name">{t.name}</h1>

    <p class="typewriter-line" aria-label={typewriterPrefix + typewriterPhrases[0]}>
      <span class="typewriter-prefix">{typewriterPrefix}</span><span
        class="typewriter-text"
        id="typewriter-text"
        aria-live="polite"
      ></span><span class="typewriter-cursor" aria-hidden="true">|</span>
    </p>

    <div class="hero-cta">
      <a href={portfolioHref} class="btn-primary">{t.portfolioCta}</a>
      <a href={blogHref} class="btn-secondary">{t.blogCta}</a>
    </div>
  </div>
</section>

<script define:vars={{ typewriterPhrases }}>
  const el = document.getElementById('typewriter-text');
  if (!el) throw new Error('typewriter-text element not found');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    el.textContent = typewriterPhrases[0];
    const cursor = document.querySelector('.typewriter-cursor');
    if (cursor) (cursor as HTMLElement).style.display = 'none';
  } else {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const phrase = typewriterPhrases[phraseIndex];
      if (!deleting) {
        el.textContent = phrase.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex === phrase.length) {
          deleting = true;
          setTimeout(tick, 2000);
          return;
        }
        setTimeout(tick, 60);
      } else {
        el.textContent = phrase.slice(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % typewriterPhrases.length;
          setTimeout(tick, 300);
          return;
        }
        setTimeout(tick, 35);
      }
    }
    setTimeout(tick, 800);
  }
</script>

<style>
  .hero {
    position: relative;
    padding-block: var(--section-gap);
    overflow: hidden;
    color: var(--border); /* drives currentColor for SVG paths */
  }

  /* Background paths */
  .hero-paths {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes hero-flow {
    from { stroke-dashoffset: 2000; }
    to   { stroke-dashoffset: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-paths path { animation: none !important; }
  }

  /* Content layer */
  .hero-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    max-width: 40rem;
  }

  .hero-label {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-muted);
    margin: 0;
  }

  .hero-name {
    font-size: var(--text-4xl);
    font-weight: var(--weight-bold);
    color: var(--text);
    line-height: var(--leading-tight);
    margin: 0;
  }

  /* Typewriter */
  .typewriter-line {
    font-size: var(--text-lg);
    font-weight: var(--weight-normal);
    margin: 0;
    line-height: var(--leading-normal);
  }

  .typewriter-prefix { color: var(--text-muted); }
  .typewriter-text   { color: var(--accent); }

  .typewriter-cursor {
    color: var(--accent);
    animation: blink 0.8s step-end infinite;
    margin-left: 1px;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .typewriter-cursor { display: none; }
  }

  /* CTAs */
  .hero-cta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-2);
  }
</style>
```

- [ ] **Step 4: Update `src/pages/index.astro` to pass typewriter props**

Find the `<Hero>` usage and update it:

```astro
<Hero
  locale="en"
  typewriterPrefix="born to "
  typewriterPhrases={["build reliable systems", "write clean code", "solve hard problems", "ship things that last"]}
/>
```

Remove any nav-link props that were previously passed.

- [ ] **Step 5: Update `src/pages/pt-br/index.astro`**

```astro
<Hero
  locale="pt-br"
  typewriterPrefix="nascido para "
  typewriterPhrases={["construir sistemas confiáveis", "escrever código limpo", "resolver problemas difíceis", "entregar coisas que durem"]}
/>
```

- [ ] **Step 6: Run home tests**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/home.spec.ts
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/home/Hero.astro src/pages/index.astro src/pages/pt-br/index.astro tests/e2e/home.spec.ts
git commit -m "feat: redesign Hero with background paths animation and typewriter effect"
```

---

## Task 8: HomeSections + ContactSection

**Files:**
- Modify: `src/components/home/HomeSections.astro`
- Modify: `src/components/home/ContactSection.astro`
- Modify: `tests/e2e/home.spec.ts`

- [ ] **Step 1: Add failing E2E test for section label and blog preview layout**

Add to `tests/e2e/home.spec.ts`:

```typescript
test('homepage sections use monospace labels and token-based styles', async ({ page }) => {
  await page.goto('/');
  const sectionLabel = page.locator('.section-label').first();
  await expect(sectionLabel).toBeVisible();
  // Blog preview rows should each have a title and a date
  const blogRow = page.locator('.blog-preview-row').first();
  await expect(blogRow).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/home.spec.ts
```

Expected: FAIL — `.section-label` not found.

- [ ] **Step 3: Update `src/components/home/HomeSections.astro`**

Read the current file, then rewrite its `<style>` block and section markup to match the spec's section pattern: monospace section label, heading, items, view-all link. Apply the blog preview list style (no cards, one line per item with dot separator and date), notes preview card style, and bento projects preview style. Key changes:

- Add `.section-label` class: `font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em;`
- Blog list items: `display: flex; justify-content: space-between; align-items: baseline; gap: var(--space-4);` with title hover underline in `--accent` and date in `var(--font-mono)`
- Notes preview cards: `background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--card-padding);` with hover `box-shadow: var(--shadow-md); border-color: var(--accent); transition: all var(--duration-base) var(--ease-out);`
- Projects preview: use the same bento card markup as `ProjectCard.astro` (Task 10)

- [ ] **Step 4: Update `src/components/home/ContactSection.astro`**

Update styles to use new token names and the design system's button classes.

- [ ] **Step 5: Run E2E test to verify it passes**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/home.spec.ts
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/home/HomeSections.astro src/components/home/ContactSection.astro tests/e2e/home.spec.ts
git commit -m "feat: redesign HomeSections and ContactSection"
```

---

## Task 9: Blog Pages

**Files:**
- Modify: `src/components/blog/BlogList.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/blog/[slug].astro`
- Modify: `src/pages/pt-br/blog/index.astro`
- Modify: `src/pages/pt-br/blog/[slug].astro`
- Modify: `tests/e2e/blog.spec.ts`

- [ ] **Step 1: Add failing E2E tests for blog two-column layout and prose styles**

Add to `tests/e2e/blog.spec.ts`:

```typescript
test('blog list uses two-column year/entry layout', async ({ page }) => {
  await page.goto('/blog');
  // Year column rendered with monospace font class
  const yearLabel = page.locator('.blog-year').first();
  await expect(yearLabel).toBeVisible();
});

test('blog post applies prose class', async ({ page }) => {
  // Navigate to the first available post
  await page.goto('/blog');
  const firstLink = page.locator('a[href^="/blog/"]').first();
  await firstLink.click();
  const prose = page.locator('.prose');
  await expect(prose).toBeVisible();
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/blog.spec.ts
```

Expected: FAIL — `.blog-year` not found.

- [ ] **Step 3: Update `src/components/blog/BlogList.astro`**

Update the existing component to render the two-column year/entry layout:
- Outer wrapper: `display: grid; grid-template-columns: 5rem 1fr; gap: var(--space-6) var(--space-8);` on desktop, single column on mobile
- Year label: `font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-muted); position: sticky; top: 5rem;`
- Each entry row: title + `·` + date + optional lang pill, all on one line

- [ ] **Step 4: Update blog detail page styles in `src/pages/blog/[slug].astro`**

Apply the `.prose` class from global.css to the blog post content wrapper. Ensure the post header uses `--text-3xl` for title and Geist Mono for date metadata.

- [ ] **Step 5: Update `src/pages/blog/index.astro`**

Ensure the container uses `max-width: var(--container-max)`.

- [ ] **Step 6: Mirror changes in pt-br blog pages**

Apply the same updates to `src/pages/pt-br/blog/index.astro` and `src/pages/pt-br/blog/[slug].astro`.

- [ ] **Step 7: Run blog tests to verify they pass**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/blog.spec.ts
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/blog/ src/pages/blog/ src/pages/pt-br/blog/ tests/e2e/blog.spec.ts
git commit -m "feat: redesign blog index and post detail pages"
```

---

## Task 10: Notes Pages

**Files:**
- Modify: `src/components/notes/NotesGrid.astro`
- Modify: `src/components/notes/NotesFilters.astro`
- Modify: `src/pages/notes/index.astro`
- Modify: `src/pages/notes/[slug].astro`
- Modify: `src/pages/pt-br/notes/index.astro`
- Modify: `src/pages/pt-br/notes/[slug].astro`
- Modify: `tests/e2e/notes.spec.ts`

- [ ] **Step 1: Add failing E2E tests for notes card and filter pill styles**

Add to `tests/e2e/notes.spec.ts`:

```typescript
test('notes cards have colorToken border and tag pills', async ({ page }) => {
  await page.goto('/notes');
  const card = page.locator('.note-card').first();
  await expect(card).toBeVisible();
  // Filter pills should be present
  const filterPill = page.locator('.filter-btn').first();
  await expect(filterPill).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/notes.spec.ts
```

Expected: FAIL — `.note-card` or `.filter-btn` not found.

- [ ] **Step 3: Update `src/components/notes/NotesGrid.astro`**

Update the card styles:
- `border-top: 3px solid ${note.colorToken ?? 'var(--accent)'}` (inline style on the card)
- Card: `background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--card-padding); position: relative; overflow: hidden;`
- Hover: `transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--accent);` via CSS transition
- Tags as `.tag` pill elements using global `.tag` class

- [ ] **Step 4: Update `src/components/notes/NotesFilters.astro`**

Update filter button styles:
- Pill buttons: `border-radius: var(--radius-full); padding: var(--space-1) var(--space-4); font-size: var(--text-sm); border: 1px solid var(--border); background: var(--surface); cursor: pointer; transition: all var(--duration-fast) var(--ease-out);`
- Active state: `background: var(--accent); border-color: var(--accent); color: #fff;`
- Inactive hover: `border-color: var(--accent); color: var(--text);`

- [ ] **Step 5: Update notes detail page to use `.prose` class**

Mirror the blog post detail prose styling in `src/pages/notes/[slug].astro`.

- [ ] **Step 6: Mirror changes in pt-br notes pages**

- [ ] **Step 7: Run notes tests to verify they pass**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/notes.spec.ts
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/notes/ src/pages/notes/ src/pages/pt-br/notes/ tests/e2e/notes.spec.ts
git commit -m "feat: redesign Notes grid, filters, and detail pages"
```

---

## Task 11: Portfolio Data Model

**Files:**
- Modify: `src/content/portfolio/types.ts`
- Modify: `src/content/portfolio/experience.ts`
- Modify: `src/content/portfolio/projects.ts`

- [ ] **Step 1: Update `src/content/portfolio/types.ts`**

```typescript
export interface LocalizedString {
  en: string;
  "pt-br": string;
}

export interface Project {
  title: LocalizedString;
  description: LocalizedString;
  tags: string[];
  link?: string;
  github?: string;
  role?: LocalizedString;
  year: number;
  featured?: boolean;           // spans 2 columns in bento grid
  icon?: string;                // emoji or single character, e.g. "⚙️"
  status?: 'Active' | 'Archived' | 'Featured';
}

export interface Publication {
  title: LocalizedString;
  publisher: string;
  date: string;
  link?: string;
  type: "article" | "paper" | "book" | "talk";
}

export interface ExperienceEntry {
  type: 'work' | 'education';   // required — backfill all work entries
  title: LocalizedString;
  company: string;              // company name for work, institution name for education
  location: LocalizedString;
  startDate: string;            // YYYY-MM
  endDate?: string;             // YYYY-MM or undefined = Present
  description: LocalizedString[];
  tags: string[];
}
```

- [ ] **Step 2: Backfill `type` and update `src/content/portfolio/experience.ts`**

Add `type: 'work'` to existing entries and add at least one education entry:

```typescript
import type { ExperienceEntry } from "./types";

export const experience: ExperienceEntry[] = [
  {
    type: 'work',
    title: {
      en: "Senior Embedded Software Engineer",
      "pt-br": "Engenheiro Sênior de Software Embarcado",
    },
    company: "Acme Electronics",
    location: { en: "São Paulo, Brazil", "pt-br": "São Paulo, Brasil" },
    startDate: "2020-01",
    description: [
      { en: "Lead development of embedded systems for industrial automation.", "pt-br": "Liderança no desenvolvimento de sistemas embarcados para automação industrial." },
      { en: "Designed and implemented a custom real-time kernel.", "pt-br": "Projetei e implementei um kernel de tempo real personalizado." },
    ],
    tags: ["Embedded C", "RTOS", "ARM", "Automation"],
  },
  {
    type: 'work',
    title: {
      en: "Embedded Software Developer",
      "pt-br": "Desenvolvedor de Software Embarcado",
    },
    company: "Tech Solutions",
    location: { en: "Joinville, Brazil", "pt-br": "Joinville, Brasil" },
    startDate: "2017-06",
    endDate: "2019-12",
    description: [
      { en: "Developed firmware for consumer electronics.", "pt-br": "Desenvolvi firmware para eletrônicos de consumo." },
    ],
    tags: ["C++", "FreeRTOS", "Bluetooth Low Energy"],
  },
  {
    type: 'education',
    title: {
      en: "B.Sc. Computer Engineering",
      "pt-br": "Bacharelado em Engenharia de Computação",
    },
    company: "Federal University of Technology",
    location: { en: "Brazil", "pt-br": "Brasil" },
    startDate: "2013-02",
    endDate: "2017-12",
    description: [
      { en: "Focus on embedded systems, digital electronics, and real-time operating systems.", "pt-br": "Foco em sistemas embarcados, eletrônica digital e sistemas operacionais de tempo real." },
    ],
    tags: ["Embedded Systems", "Digital Electronics", "RTOS"],
  },
];
```

- [ ] **Step 3: Update `src/content/portfolio/projects.ts`**

Add `icon`, `status`, and `featured` fields:

```typescript
import type { Project } from "./types";

export const projects: Project[] = [
  {
    title: { en: "Embedded RTOS Kernel", "pt-br": "Kernel RTOS Embarcado" },
    description: {
      en: "A real-time operating system kernel for ARM Cortex-M microcontrollers.",
      "pt-br": "Um kernel de sistema operacional de tempo real para microcontroladores ARM Cortex-M.",
    },
    tags: ["C", "RTOS", "ARM", "Cortex-M"],
    year: 2023,
    github: "https://github.com/example/rtos-kernel",
    role: { en: "Lead Developer", "pt-br": "Desenvolvedor Principal" },
    icon: "⚙️",
    status: "Active",
    featured: true,
  },
  {
    title: { en: "Automated Test Harness", "pt-br": "Harness de Teste Automatizado" },
    description: {
      en: "Distributed testing framework for firmware validation.",
      "pt-br": "Framework de testes distribuídos para validação de firmware.",
    },
    tags: ["Python", "CI/CD", "Firmware", "Automation"],
    year: 2024,
    link: "https://example.com/test-harness",
    role: { en: "Architect", "pt-br": "Arquiteto" },
    icon: "🧪",
    status: "Active",
  },
];
```

- [ ] **Step 4: Verify TypeScript types check**

```bash
cd /home/jonathan/Projects/jts-website && pnpm astro check
```

Expected: no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/content/portfolio/types.ts src/content/portfolio/experience.ts src/content/portfolio/projects.ts
git commit -m "feat: extend portfolio data model with type, featured, icon, and status fields"
```

---

## Task 12: Portfolio Components + Page

**Files:**
- Rewrite: `src/components/portfolio/ProjectCard.astro`
- Create: `src/components/portfolio/TimelineItem.astro`
- Delete: `src/components/portfolio/ExperienceItem.astro`
- Modify: `src/components/portfolio/PublicationItem.astro`
- Modify: `src/pages/portfolio/index.astro`
- Modify: `src/pages/pt-br/portfolio/index.astro`
- Modify: `tests/e2e/portfolio.spec.ts`

- [ ] **Step 1: Add failing E2E tests for bento grid and unified timeline**

Add to `tests/e2e/portfolio.spec.ts`:

```typescript
test('portfolio bento grid renders project cards', async ({ page }) => {
  await page.goto('/portfolio');
  const bentoGrid = page.locator('.bento-grid');
  await expect(bentoGrid).toBeVisible();
  const projectCard = page.locator('.project-card').first();
  await expect(projectCard).toBeVisible();
});

test('portfolio unified timeline shows work and education entries', async ({ page }) => {
  await page.goto('/portfolio');
  const timelineItems = page.locator('.timeline-item');
  await expect(timelineItems.first()).toBeVisible();
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/portfolio.spec.ts
```

Expected: FAIL — `.bento-grid` not found.

- [ ] **Step 3: Rewrite `src/components/portfolio/ProjectCard.astro`**

```astro
---
import type { Project } from '../../content/portfolio/types';
import { type Locale } from '../../lib/content/locale';

interface Props {
  project: Project;
  locale: Locale;
}

const { project, locale } = Astro.props;
const title = project.title[locale];
const description = project.description[locale];
---

<article
  class:list={['project-card', project.featured && 'always-active']}
  style={project.featured ? 'grid-column: span 2;' : ''}
>
  <div class="card-top">
    {project.icon && <span class="card-icon" aria-hidden="true">{project.icon}</span>}
    <span class="card-status">{project.status ?? 'Active'}</span>
  </div>

  <div class="card-body">
    <h3 class="card-title">
      {title}
      <span class="card-meta">{project.year}</span>
    </h3>
    <p class="card-description">{description}</p>
  </div>

  <div class="card-footer">
    <div class="card-tags">
      {project.tags.map(tag => <span class="tag">{tag}</span>)}
    </div>
    <div class="card-links">
      {project.github && (
        <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"/></svg>
        </a>
      )}
      {project.link && (
        <a href={project.link} target="_blank" rel="noopener noreferrer" aria-label="Live">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      )}
      <span class="card-cta" aria-hidden="true">→</span>
    </div>
  </div>
</article>

<style>
  .project-card {
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--card-padding);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    overflow: hidden;
    color: var(--text);
    transition: transform var(--duration-base) var(--ease-out),
                box-shadow var(--duration-base) var(--ease-out),
                border-color var(--duration-base) var(--ease-out);
  }

  /* Dot pattern overlay */
  .project-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
    background-size: 4px 4px;
    opacity: 0;
    transition: opacity var(--duration-base) var(--ease-out);
  }

  .project-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--accent);
  }
  .project-card:hover::after { opacity: 0.04; }

  /* Always-active (featured) */
  .project-card.always-active {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--accent);
  }
  .project-card.always-active::after { opacity: 0.04; }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-icon {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-high);
    border-radius: var(--radius-sm);
    font-size: var(--text-base);
  }

  .card-status {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-muted);
    background: var(--surface-high);
    padding: 2px var(--space-2);
    border-radius: var(--radius-sm);
  }

  .card-body { flex: 1; }

  .card-title {
    font-size: var(--text-base);
    font-weight: var(--weight-semibold);
    color: var(--text);
    margin: 0 0 var(--space-2);
    line-height: var(--leading-normal);
  }

  .card-meta {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-muted);
    font-weight: var(--weight-normal);
    margin-left: var(--space-2);
  }

  .card-description {
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: var(--leading-relaxed);
    margin: 0;
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    margin-top: auto;
  }

  .card-tags { display: flex; flex-wrap: wrap; gap: var(--space-1); }

  .card-links {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-shrink: 0;
  }
  .card-links a {
    color: var(--text-muted);
    text-decoration: none;
    display: flex;
    transition: color var(--duration-fast);
  }
  .card-links a:hover { color: var(--accent); }

  .card-cta {
    font-size: var(--text-sm);
    color: var(--text-muted);
    opacity: 0;
    transition: opacity var(--duration-fast);
  }
  .project-card:hover .card-cta { opacity: 1; }
</style>
```

- [ ] **Step 4: Create `src/components/portfolio/TimelineItem.astro`**

```astro
---
import type { ExperienceEntry } from '../../content/portfolio/types';
import type { Locale } from '../../lib/content/locale';

interface Props {
  entry: ExperienceEntry;
  locale: Locale;
}

const { entry, locale } = Astro.props;
const title = entry.title[locale];
const location = entry.location[locale];
const descriptions = entry.description.map(d => d[locale]);

const startLabel = entry.startDate.replace('-', '/');
const endLabel = entry.endDate ? entry.endDate.replace('-', '/') : (locale === 'en' ? 'Present' : 'Atual');
const dateRange = `${startLabel} – ${endLabel}`;
---

<div class="timeline-item">
  <div class="timeline-dot" aria-hidden="true"></div>
  <div class="timeline-content">
    <div class="timeline-header">
      <span class:list={['timeline-badge', entry.type === 'work' ? 'badge-work' : 'badge-edu']}>
        {entry.type === 'work' ? 'WORK' : 'EDUCATION'}
      </span>
      <span class="timeline-company">{entry.company}</span>
      <span class="timeline-date">{dateRange}</span>
    </div>
    <h3 class="timeline-title">{title}</h3>
    <p class="timeline-location">{location}</p>
    {descriptions.map(desc => <p class="timeline-desc">{desc}</p>)}
    <div class="timeline-tags">
      {entry.tags.map(tag => <span class="tag">{tag}</span>)}
    </div>
  </div>
</div>

<style>
  .timeline-item {
    display: grid;
    grid-template-columns: 1.5rem 1fr;
    gap: var(--space-4);
    position: relative;
  }

  .timeline-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent);
    outline: 3px solid var(--surface);
    outline-offset: 1px;
    margin-top: 4px;
    flex-shrink: 0;
    justify-self: center;
    position: relative;
    z-index: 1;
  }

  .timeline-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding-bottom: var(--space-8);
  }

  .timeline-header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  .timeline-badge {
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    padding: 1px var(--space-2);
    border-radius: var(--radius-sm);
  }
  .badge-work { background: var(--accent-dim); color: var(--accent); }
  .badge-edu  { background: var(--surface-high); color: var(--text-muted); }

  .timeline-company { font-weight: var(--weight-medium); color: var(--text); }
  .timeline-date    { margin-left: auto; }

  .timeline-title {
    font-size: var(--text-base);
    font-weight: var(--weight-semibold);
    color: var(--text);
    margin: 0;
  }

  .timeline-location {
    font-size: var(--text-sm);
    color: var(--text-muted);
    margin: 0;
  }

  .timeline-desc {
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: var(--leading-relaxed);
    margin: 0;
  }

  .timeline-tags { display: flex; flex-wrap: wrap; gap: var(--space-1); }
</style>
```

- [ ] **Step 5: Delete the old ExperienceItem component**

```bash
rm /home/jonathan/Projects/jts-website/src/components/portfolio/ExperienceItem.astro
```

- [ ] **Step 6: Update `src/components/portfolio/PublicationItem.astro`**

Update its styles to use new token names and `.tag` class for type badges.

- [ ] **Step 7: Rewrite `src/pages/portfolio/index.astro`**

Read the current file, then update it to:
- Use `--wide-max` container for the page wrapper
- Import and use `TimelineItem` (sorted by `startDate` descending)
- Render projects as a bento grid using `ProjectCard`
- Keep `PublicationItem` for publications list
- Add CV download prominent button

Sort the experience array by `startDate` descending before rendering:

```astro
---
import { experience } from '../../content/portfolio/experience';
// Sort descending by startDate
const sortedExperience = [...experience].sort((a, b) =>
  b.startDate.localeCompare(a.startDate)
);
---
```

- [ ] **Step 8: Mirror portfolio page for pt-br**

Apply same updates to `src/pages/pt-br/portfolio/index.astro`.

- [ ] **Step 9: Run E2E tests to verify they pass**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/portfolio.spec.ts
```

Expected: all pass.

- [ ] **Step 10: Run type checks and build**

```bash
cd /home/jonathan/Projects/jts-website && pnpm astro check && pnpm build
```

Expected: no errors.

- [ ] **Step 11: Commit**

```bash
git add src/components/portfolio/ src/pages/portfolio/ src/pages/pt-br/portfolio/ tests/e2e/portfolio.spec.ts
git commit -m "feat: redesign Portfolio with bento ProjectCard, unified TimelineItem, and --wide-max layout"
```

---

## Task 13: Now Page + Search Dialog

**Files:**
- Modify: `src/pages/now/index.astro`
- Modify: `src/pages/pt-br/now/index.astro`
- Modify: `src/components/search/SearchDialog.astro`
- Modify: `tests/e2e/now.spec.ts`

- [ ] **Step 1: Add failing E2E test for now page status badge**

Add to `tests/e2e/now.spec.ts`:

```typescript
test('now page has status badge and prose class', async ({ page }) => {
  await page.goto('/now');
  const prose = page.locator('.prose');
  await expect(prose).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/now.spec.ts
```

Expected: FAIL — `.prose` not found on now page.

- [ ] **Step 3: Update now page styles**

In `src/pages/now/index.astro`, add status badge and apply `.prose` class:

```astro
{frontmatter.status && (
  <span class="now-status">{frontmatter.status}</span>
)}
<p class="now-updated">
  <!-- updated date in Geist Mono --text-sm --text-muted -->
</p>
<div class="prose">
  <Content />
</div>
```

Add to the page `<style>`:

```css
.now-status {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  background: var(--accent-dim);
  color: var(--accent);
  padding: 2px var(--space-3);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-2);
}
.now-updated {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}
```

Mirror in `src/pages/pt-br/now/index.astro`.

- [ ] **Step 4: Update `src/components/search/SearchDialog.astro`**

Update the dialog styles to match spec:
- Full-screen overlay: `backdrop-filter: blur(8px)` + `background: rgba(0,0,0,0.5)` scrim
- Panel: `background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); max-width: 560px; width: 90vw;`
- Input: `font-size: var(--text-lg); border: none; border-bottom: 1px solid var(--border); background: transparent; color: var(--text);` with `::placeholder { color: var(--text-muted); }`
- Results: type badge `BLOG` / `NOTE` in `font-family: var(--font-mono); font-size: var(--text-xs)` before each result
- Active result: `background: var(--accent-dim)`

- [ ] **Step 5: Run E2E tests to verify they pass**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e tests/e2e/now.spec.ts
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/pages/now/ src/pages/pt-br/now/ src/components/search/SearchDialog.astro tests/e2e/now.spec.ts
git commit -m "feat: redesign Now page and Search dialog"
```

---

## Task 14: Full Verification + PT-BR Routes

**Files:**
- Verify: `src/pages/pt-br/**`

- [ ] **Step 1: Run the full unit test suite**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:unit
```

Expected: all pass.

- [ ] **Step 2: Run the full E2E suite**

```bash
cd /home/jonathan/Projects/jts-website && pnpm test:e2e
```

Expected: all pass.

- [ ] **Step 3: Run Astro type checks**

```bash
cd /home/jonathan/Projects/jts-website && pnpm astro check
```

Expected: no type errors.

- [ ] **Step 4: Build the site**

```bash
cd /home/jonathan/Projects/jts-website && pnpm build
```

Expected: build completes, `dist/` populated with static output.

- [ ] **Step 5: Preview and manually verify PT-BR routes**

```bash
cd /home/jonathan/Projects/jts-website && pnpm preview
```

Visit manually: `/pt-br/`, `/pt-br/portfolio`, `/pt-br/blog`, `/pt-br/notes`, `/pt-br/now`

Verify:
- All pages render with Geist fonts
- Both themes look correct in each locale
- Typewriter shows Portuguese phrases on `/pt-br/`
- Language switcher correctly links between locales
- No visible broken styles or missing tokens

- [ ] **Step 6: Verify no new dependencies were added**

```bash
cd /home/jonathan/Projects/jts-website && grep -E "framer-motion|react|tailwind|shadcn" package.json
```

Expected: no output (none of these packages present).

- [ ] **Step 7: Final commit**

```bash
git add -u
git commit -m "chore: final verification — frontend redesign complete"
```

---

## Execution Notes

- Execute tasks in order: token migration before token rewrite, shell before pages, data model before components.
- Do not skip Task 2 (migration) before Task 3 (rewrite) — doing both at once will cause ambiguous intermediate breakage.
- If a build fails mid-task, check the failing token names first (`grep -r "\-\-color-" src/`).
- Keep component `<style>` blocks scoped. Only `global.css` exports shared utilities (`.prose`, `.tag`, `.btn-primary`, `.btn-secondary`, `.container`, `.container--wide`).
- The `<svg>` for Moon and Sun icons in ThemeToggle can be replaced with your own paths if the provided paths don't match your design preference.
