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

Create `src/components/portfolio/AboutSection.astro`. The portfolio page (`src/pages/portfolio/index.astro` and `src/pages/pt-br/portfolio/index.astro`) currently imports and renders the about Markdown inline — replace that block with `<AboutSection locale={locale} />`.

### Layout

Two-column grid on desktop (≥ 48rem), single column stacked on mobile:

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
}
```

On mobile the image stacks above the prose, centered.

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

- `width: 12rem; height: 12rem` (no token equivalent — hardcoded dimension)
- `aspect-ratio: 1 / 1; object-fit: cover`
- `border: 1px solid var(--border); border-radius: var(--radius-md)`
- Placeholder (when image absent): `.about-placeholder { background: var(--surface-high); border-radius: var(--radius-md); width: 12rem; height: 12rem; }`
- On mobile: `margin-inline: auto` to center

### Prose

The right column renders `<AboutContent />` from the locale-specific Markdown file inside a `.prose` div (same pattern as current inline implementation).

### Section Label

The section uses the existing `.section-label` + `.section-heading` pattern (matching other portfolio sections), with label `// about` (EN) / `// sobre` (PT).

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

### Component

Create `src/components/portfolio/SkillsCloud.astro`. Accepts `locale: Locale` prop (for the section label).

### Visual Design

**Section label/heading:** Same `// skills` (EN) / `// habilidades` (PT) section header pattern.

**Pill tier system** based on `count`:

| Tier | Condition | `font-size` | `padding` | `color` | `border-color` |
|------|-----------|-------------|-----------|---------|----------------|
| Top | highest count (rank 1) | `var(--text-sm)` | `var(--space-1) var(--space-3)` | `var(--accent)` | `var(--accent-dim)` |
| High | count ≥ 3 | `var(--text-sm)` | `var(--space-1) var(--space-3)` | `var(--text)` | `var(--border)` |
| Normal | count < 3 | `var(--text-xs)` | `2px var(--space-2)` | `var(--text-muted)` | `var(--border)` |

All pills:
- `font-family: var(--font-mono)`
- `background: var(--surface)`
- `border-radius: var(--radius-full)`
- `border: 1px solid <see tier>`
- No interaction (no hover, no links) — decorative/informational only

**Container:** `display: flex; flex-wrap: wrap; gap: var(--space-2);`

### Placement

Between the About section and the Projects section on the portfolio page.

---

## 3. Scroll-Driven Timeline Line Highlight

### Mechanism

A single `IntersectionObserver` instance, instantiated once per page load, watches all `.timeline-item` elements. It uses `rootMargin: '-30% 0px -30% 0px'` to define an active band in the middle 40% of the viewport. When an item enters this band, it receives class `.timeline-item--active`; when it exits, the class is removed.

### Script Location

An inline `<script>` block in the portfolio page (`src/pages/portfolio/index.astro` and `src/pages/pt-br/portfolio/index.astro`), after the timeline section markup:

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

### Visual State

The left line segment in `TimelineItem.astro` is currently rendered as a positioned element (the `::before` pseudo-element or a `.timeline-line` div). Add a CSS rule:

```css
/* Default: border color */
.timeline-item .timeline-line {
  background: var(--border);
  transition: background var(--duration-base) var(--ease-out);
}

/* Active: accent color */
.timeline-item--active .timeline-line {
  background: var(--accent);
}
```

Only the left vertical line changes color. Text, dot, card content, and opacity are unaffected.

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .timeline-item .timeline-line {
    transition: none;
  }
}
```

The color change still happens; only the transition is suppressed.

### Implementation Note

The `.timeline-line` class must be an actual DOM element (not a `::before` pseudo-element) for the CSS class toggle to work. If the current `TimelineItem.astro` uses `::before` for the line, replace it with a `<div class="timeline-line">` positioned absolutely within the item wrapper.

---

## What Is NOT in Scope

- Skills data file with manually curated categories (tags are aggregated from existing data)
- Any interaction on skill pills (no hover, no filtering)
- Timeline dot scaling or text opacity changes on scroll
- PT-BR counterpart for `/privacy` and `/terms` (separate spec)
- Any new content (projects, experience entries) beyond what exists

---

## File Changes Summary

| Action | File |
|--------|------|
| Create | `src/components/portfolio/AboutSection.astro` |
| Create | `src/components/portfolio/SkillsCloud.astro` |
| Create | `src/lib/skills.ts` |
| Modify | `src/components/portfolio/TimelineItem.astro` — add `.timeline-line` div, CSS active state |
| Modify | `src/pages/portfolio/index.astro` — use AboutSection, add SkillsCloud, add observer script |
| Modify | `src/pages/pt-br/portfolio/index.astro` — same as above |
| Modify | `tests/e2e/portfolio.spec.ts` — add tests for image placeholder, skills cloud, timeline highlight |
