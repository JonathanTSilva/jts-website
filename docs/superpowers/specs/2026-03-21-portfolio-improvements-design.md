# Portfolio Page Improvements Design Spec
**Date:** 2026-03-21
**Branch base:** `feature/frontend-redesign`
**Scope:** About section with profile image · Skills cloud · Scroll-driven timeline line highlight

---

## Prerequisites

This spec builds on `feature/frontend-redesign`. Tokens, globals, and components from prior specs are assumed present.

---

## 1. About Section with Profile Image

### Component

Create `src/components/portfolio/AboutSection.astro`. The portfolio pages currently render the about Markdown inline:

```astro
const aboutModule = await import(`../../content/portfolio/about.${locale}.md`);
const { Content: AboutContent } = aboutModule;
// ...
<section class="portfolio-section">
  <h2>{t.about}</h2>
  <div class="prose-constrained"><div class="prose"><AboutContent /></div></div>
</section>
```

Replace this block in both `src/pages/portfolio/index.astro` and `src/pages/pt-br/portfolio/index.astro` with:

```astro
<AboutSection locale={locale} aboutLabel={t.about} />
```

`AboutSection.astro` receives `locale: Locale` and `aboutLabel: string` props, imports the Markdown internally.

### Layout

Two-column grid on desktop (≥ 48rem), single column stacked on mobile. The section wraps in `.portfolio-section` (matching the other portfolio sections) with an `<h2>` heading styled identically to the existing `h2` rule in the portfolio page (`font-size: var(--text-2xl); border-bottom: 1px solid var(--border); padding-bottom: var(--space-2)`):

```css
.about-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-8);
  align-items: start;
}

@media (max-width: 48rem) {
  .about-grid {
    grid-template-columns: 1fr;
  }
  .about-image-wrap {
    margin-inline: auto;
  }
}
```

On mobile the image stacks above the prose, centered via `margin-inline: auto` on the image wrapper.

### Profile Image

```astro
<div class="about-image-wrap">
  <img
    src="/assets/images/profile.jpg"
    alt="Jonathan"
    class="about-image"
    onerror="this.style.display='none';this.parentElement.classList.add('about-placeholder')"
  />
</div>
```

CSS:
```css
.about-image-wrap {
  width: 12rem;
  height: 12rem;
  flex-shrink: 0;
}
.about-image {
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  display: block;
}
.about-placeholder {
  background: var(--surface-high);
  border-radius: var(--radius-md);
  width: 12rem;
  height: 12rem;
}
```

`12rem` is a hardcoded dimension — no equivalent token exists in the spacing scale.

### Prose

The right column renders `<AboutContent />` from the locale-specific Markdown file inside `.prose-constrained > .prose` (same classes as the current inline implementation).

---

## 2. Skills Cloud

### Data Aggregation

Create `src/lib/skills.ts`:

```typescript
import { projects } from '../content/portfolio/projects';
import { experience } from '../content/portfolio/experience';

export interface SkillEntry {
  tag: string;
  count: number;
}

export function getSkills(): SkillEntry[] {
  const counts = new Map<string, number>();

  for (const project of projects) {
    for (const tag of project.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  for (const entry of experience) {
    for (const tag of entry.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
```

Import paths (`../content/portfolio/projects` and `../content/portfolio/experience`) resolve correctly from `src/lib/`.

### Component

Create `src/components/portfolio/SkillsCloud.astro`. Accepts `locale: Locale` and `skillsLabel: string` props. The portfolio pages pass `skillsLabel={t.skills}` with `t.skills = 'Skills'` (EN) / `'Habilidades'` (PT).

### Visual Design

**Section heading:** `<section class="portfolio-section"><h2>{skillsLabel}</h2>` — matching the existing `h2` style in the portfolio page.

**Pill tier system** based on `count`:

| Tier | Condition | `font-size` | `padding` | `color` | `border-color` |
|------|-----------|-------------|-----------|---------|----------------|
| Top | rank 1 (highest count) | `var(--text-sm)` | `var(--space-1) var(--space-3)` | `var(--accent)` | `var(--accent-dim)` |
| High | count ≥ 3 | `var(--text-sm)` | `var(--space-1) var(--space-3)` | `var(--text)` | `var(--border)` |
| Normal | count < 3 | `var(--text-xs)` | `var(--space-1) var(--space-2)` | `var(--text-muted)` | `var(--border)` |

Note: Normal tier uses `var(--space-1)` (4px) vertical padding — the smallest token in the spacing scale.

All pills:
- `font-family: var(--font-mono)`
- `background: var(--surface)`
- `border-radius: var(--radius-full)`
- `border: 1px solid <tier value>`
- No interaction (no hover, no links) — purely informational

**Container:** `display: flex; flex-wrap: wrap; gap: var(--space-2);`

### Placement

Between the About section and the Projects section on the portfolio page. Both `index.astro` pages need `t.skills` added to their translation objects.

---

## 3. Scroll-Driven Timeline Line Highlight

### DOM Change Required

The current `.timeline::before` pseudo-element in both portfolio page files creates a **single unbroken vertical line** spanning the full timeline. This cannot be independently highlighted per-item. It must be replaced with per-item line segments inside `TimelineItem.astro`.

**Step 1 — Remove from both portfolio pages:**
```css
/* DELETE this rule from .portfolio-page <style> in both index.astro files */
.timeline::before {
  content: '';
  position: absolute;
  left: calc(0.75rem - 1px);
  top: 4px;
  bottom: 0;
  width: 2px;
  background: var(--border);
}
```

**Step 2 — Add to `TimelineItem.astro`:**

Add a `<div class="timeline-line" aria-hidden="true"></div>` as the first child of `.timeline-item`, before `.timeline-dot`:

```astro
<div class="timeline-item">
  <div class="timeline-line" aria-hidden="true"></div>
  <div class="timeline-dot" aria-hidden="true"></div>
  <div class="timeline-content">
    ...
  </div>
</div>
```

CSS for the line (add to `TimelineItem.astro` `<style>`):

```css
.timeline-line {
  position: absolute;
  left: calc(0.75rem - 1px);  /* centers in the 1.5rem left column */
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border);
  transition: background var(--duration-base) var(--ease-out);
}

.timeline-item--active .timeline-line {
  background: var(--accent);
}

@media (prefers-reduced-motion: reduce) {
  .timeline-line {
    transition: none;
  }
}
```

The `.timeline-item` already has `position: relative`, so absolute positioning works. The `.timeline-dot` already has `z-index: 1` so it sits above the line.

### Observer Script

A single `<script>` block added to both portfolio page files, after the timeline section:

```javascript
const items = document.querySelectorAll('.timeline-item');
if (items.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('timeline-item--active', entry.isIntersecting);
    });
  }, { rootMargin: '-30% 0px -30% 0px' });
  items.forEach(item => observer.observe(item));
}
```

**Only the left vertical line segment changes color.** Text, dot, card content, and opacity are unaffected.

---

## E2E Tests

Add to `tests/e2e/portfolio.spec.ts`:

```typescript
test('about section shows image or placeholder', async ({ page }) => {
  await page.goto('/portfolio');
  // Either the real image or the placeholder fallback must be visible
  const imageWrap = page.locator('.about-image-wrap');
  await expect(imageWrap).toBeVisible();
});

test('skills cloud renders at least one pill', async ({ page }) => {
  await page.goto('/portfolio');
  const cloud = page.locator('.skills-cloud');
  await expect(cloud).toBeVisible();
  const pills = cloud.locator('.skill-pill');
  const count = await pills.count();
  expect(count).toBeGreaterThan(0);
});

test('timeline line highlights on scroll', async ({ page }) => {
  await page.goto('/portfolio');
  // Scroll to the timeline section
  const firstItem = page.locator('.timeline-item').first();
  await firstItem.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300); // allow IntersectionObserver to fire
  // At least one item should be active
  const activeItems = page.locator('.timeline-item--active');
  const activeCount = await activeItems.count();
  expect(activeCount).toBeGreaterThan(0);
});
```

---

## What Is NOT in Scope

- Skills data file with manually curated categories
- Any interaction on skill pills (no hover, no filtering, no links)
- Timeline dot scaling or text opacity changes on scroll
- PT-BR counterpart for `/privacy` and `/terms`
- Any new content (projects, experience entries)

---

## File Changes Summary

| Action | File |
|--------|------|
| Create | `src/components/portfolio/AboutSection.astro` |
| Create | `src/components/portfolio/SkillsCloud.astro` |
| Create | `src/lib/skills.ts` |
| Modify | `src/components/portfolio/TimelineItem.astro` — add `.timeline-line` div + active CSS |
| Modify | `src/pages/portfolio/index.astro` — use AboutSection, add SkillsCloud, remove `.timeline::before`, add observer script, add `t.skills` |
| Modify | `src/pages/pt-br/portfolio/index.astro` — same |
| Modify | `tests/e2e/portfolio.spec.ts` — 3 new tests |
