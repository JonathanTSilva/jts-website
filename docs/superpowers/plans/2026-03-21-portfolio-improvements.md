# Portfolio Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a profile image to the About section, a tag-frequency skills cloud between About and Projects, and a scroll-driven accent highlight on the timeline left line.

**Architecture:** Three independent features implemented as isolated changes. `skills.ts` is a pure aggregation utility with no UI. `AboutSection.astro` and `SkillsCloud.astro` are new components that replace inline markup in both portfolio pages. The timeline highlight is a CSS class toggle driven by a single `IntersectionObserver` script added to the page.

**Tech Stack:** Astro 5, TypeScript, vanilla JS IntersectionObserver, CSS custom properties, Playwright E2E

**Spec:** `docs/superpowers/specs/2026-03-21-portfolio-improvements-design.md`

---

## Planned File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/lib/skills.ts` | Aggregate tags from projects + experience into `{tag, count}[]` sorted by count |
| Create | `src/components/portfolio/AboutSection.astro` | Two-column about layout with profile image placeholder |
| Create | `src/components/portfolio/SkillsCloud.astro` | Tag frequency cloud with three visual tiers |
| Modify | `src/components/portfolio/TimelineItem.astro` | Add `.timeline-line` div + active CSS + reduced-motion |
| Modify | `src/pages/portfolio/index.astro` | Use new components, remove `.timeline::before`, add observer script, add `t.skills` |
| Modify | `src/pages/pt-br/portfolio/index.astro` | Same as EN page |
| Modify | `tests/e2e/portfolio.spec.ts` | Add 3 new behavioral tests |

---

## Task 1: Skills Data Aggregation

**Files:**
- Create: `src/lib/skills.ts`
- Test: `tests/e2e/portfolio.spec.ts`

### Context

`projects.ts` exports `projects: Project[]` and `experience.ts` exports `experience: ExperienceEntry[]`, both with `tags: string[]`. This utility aggregates all tags, counts occurrences, and returns them sorted by frequency. No UI — pure build-time data. Called from `SkillsCloud.astro` in Task 3.

---

- [ ] **Step 1: Write failing E2E test for skills cloud presence**

Add to `tests/e2e/portfolio.spec.ts`:

```typescript
test('skills cloud renders at least one pill', async ({ page }) => {
  await page.goto('/portfolio');
  const cloud = page.locator('.skills-cloud');
  await expect(cloud).toBeVisible();
  const pills = cloud.locator('.skill-pill');
  const count = await pills.count();
  expect(count).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/portfolio.spec.ts --grep "skills cloud"
```

Expected: FAIL — `.skills-cloud` not found.

- [ ] **Step 3: Create `src/lib/skills.ts`**

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

- [ ] **Step 4: Run build to confirm no TypeScript errors**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm build
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign add src/lib/skills.ts tests/e2e/portfolio.spec.ts
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign commit -m "feat: add skills tag aggregation utility"
```

---

## Task 2: AboutSection Component

**Files:**
- Create: `src/components/portfolio/AboutSection.astro`
- Modify: `src/pages/portfolio/index.astro`
- Modify: `src/pages/pt-br/portfolio/index.astro`
- Test: `tests/e2e/portfolio.spec.ts`

### Context

Currently both portfolio pages inline the about Markdown like this:

```astro
// In frontmatter:
const aboutModule = await import(`../../content/portfolio/about.${locale}.md`);
const { Content: AboutContent } = aboutModule;

// In template:
<section class="portfolio-section">
  <h2>{t.about}</h2>
  <div class="prose-constrained"><div class="prose"><AboutContent /></div></div>
</section>
```

Replace with `<AboutSection locale={locale} aboutLabel={t.about} />`. The component handles the import internally. The import path from `src/components/portfolio/` to `src/content/portfolio/` is `../../content/portfolio/about.${locale}.md` — same as the page.

The section heading must match the existing `h2` style in both pages (`font-size: var(--text-2xl); border-bottom: 1px solid var(--border); padding-bottom: var(--space-2)`) — do NOT define a new style class. Use a scoped `<style>` block inside the component with the same `h2` rule.

The `12rem` image dimension has no token equivalent — it is an intentional hardcoded value.

---

- [ ] **Step 1: Write failing E2E test for about image wrapper**

Add to `tests/e2e/portfolio.spec.ts`:

```typescript
test('about section shows image or placeholder', async ({ page }) => {
  await page.goto('/portfolio');
  const imageWrap = page.locator('.about-image-wrap');
  await expect(imageWrap).toBeVisible();
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/portfolio.spec.ts --grep "about section"
```

Expected: FAIL — `.about-image-wrap` not found.

- [ ] **Step 3: Create `src/components/portfolio/AboutSection.astro`**

```astro
---
import { type Locale } from '../../lib/content/locale';

interface Props {
  locale: Locale;
  aboutLabel: string;
}

const { locale, aboutLabel } = Astro.props;
const aboutModule = await import(`../../content/portfolio/about.${locale}.md`);
const { Content: AboutContent } = aboutModule;
---

<section class="portfolio-section">
  <h2>{aboutLabel}</h2>
  <div class="about-grid">
    <div class="about-image-wrap">
      <img
        src="/assets/images/profile.jpg"
        alt="Jonathan"
        class="about-image"
        onerror="this.style.display='none';this.parentElement.classList.add('about-placeholder')"
      />
    </div>
    <div class="prose-constrained">
      <div class="prose">
        <AboutContent />
      </div>
    </div>
  </div>
</section>

<style>
  h2 {
    font-size: var(--text-2xl);
    margin-bottom: var(--space-8);
    border-bottom: 1px solid var(--border);
    padding-bottom: var(--space-2);
    color: var(--text);
  }

  .about-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-8);
    align-items: start;
  }

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

  .prose-constrained {
    max-width: var(--container-max);
  }

  .prose {
    line-height: var(--leading-relaxed);
    color: var(--text-muted);
  }

  @media (max-width: 48rem) {
    .about-grid {
      grid-template-columns: 1fr;
    }
    .about-image-wrap {
      margin-inline: auto;
    }
  }
</style>
```

- [ ] **Step 4: Update `src/pages/portfolio/index.astro`**

In the frontmatter, remove:
```astro
const aboutModule = await import(`../../content/portfolio/about.${locale}.md`);
const { Content: AboutContent } = aboutModule;
```

Add import at top of frontmatter:
```astro
import AboutSection from '../../components/portfolio/AboutSection.astro';
```

In the template, replace:
```astro
<section class="portfolio-section">
  <h2>{t.about}</h2>
  <div class="prose-constrained">
    <div class="prose">
      <AboutContent />
    </div>
  </div>
</section>
```
With:
```astro
<AboutSection locale={locale} aboutLabel={t.about} />
```

Also remove `.prose-constrained` and `.prose` rules from the page `<style>` block (they are now inside `AboutSection.astro`):
```css
/* DELETE from page <style>: */
.prose-constrained {
  max-width: var(--container-max);
}

.prose {
  line-height: var(--leading-relaxed);
  color: var(--text-muted);
}
```

**Note:** The Publications section also uses `.prose-constrained` — check whether it's still present. If yes, keep `.prose-constrained` in the page style and remove only `.prose`. If the rule is duplicated, the page rule takes precedence for elements outside the component (Astro scopes component styles).

Actually, to be safe: keep `.prose-constrained` in the page `<style>` since Publications still uses it, and only remove `.prose` from the page (it's not used outside About).

- [ ] **Step 5: Update `src/pages/pt-br/portfolio/index.astro`**

Same changes as Step 4. The import path changes:
```astro
import AboutSection from '../../../components/portfolio/AboutSection.astro';
```

Remove the `aboutModule` import and `AboutContent` destructure from the frontmatter. Replace the about section with:
```astro
<AboutSection locale={locale} aboutLabel={t.about} />
```

Remove `.prose` rule from the page `<style>` (keep `.prose-constrained` for Publications).

- [ ] **Step 6: Run tests to confirm pass**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/portfolio.spec.ts --grep "about section"
```

Expected: PASS.

- [ ] **Step 7: Run full build**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm build
```

Expected: 0 errors.

- [ ] **Step 8: Commit**

```bash
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign add src/components/portfolio/AboutSection.astro src/pages/portfolio/index.astro src/pages/pt-br/portfolio/index.astro tests/e2e/portfolio.spec.ts
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign commit -m "feat: extract AboutSection component with profile image placeholder"
```

---

## Task 3: SkillsCloud Component

**Files:**
- Create: `src/components/portfolio/SkillsCloud.astro`
- Modify: `src/pages/portfolio/index.astro`
- Modify: `src/pages/pt-br/portfolio/index.astro`

### Context

Calls `getSkills()` from `src/lib/skills.ts` (Task 1). The first element in the returned array is the top-tier pill (rank 1 = highest count). Pills at count ≥ 3 are high-tier. All others are normal-tier. Placed between AboutSection and Projects section on both pages.

---

- [ ] **Step 1: Create `src/components/portfolio/SkillsCloud.astro`**

The failing test from Task 1 (`skills cloud renders at least one pill`) is already written — this task implements the component to make it pass.

```astro
---
import { getSkills } from '../../lib/skills';
import { type Locale } from '../../lib/content/locale';

interface Props {
  locale: Locale;
  skillsLabel: string;
}

const { skillsLabel } = Astro.props;
const skills = getSkills();
---

<section class="portfolio-section">
  <h2>{skillsLabel}</h2>
  <div class="skills-cloud">
    {skills.map((skill, index) => {
      const isTop = index === 0;
      const isHigh = !isTop && skill.count >= 3;
      return (
        <span class:list={['skill-pill', isTop ? 'skill-pill--top' : isHigh ? 'skill-pill--high' : 'skill-pill--normal']}>
          {skill.tag}
        </span>
      );
    })}
  </div>
</section>

<style>
  h2 {
    font-size: var(--text-2xl);
    margin-bottom: var(--space-8);
    border-bottom: 1px solid var(--border);
    padding-bottom: var(--space-2);
    color: var(--text);
  }

  .skills-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .skill-pill {
    font-family: var(--font-mono);
    background: var(--surface);
    border-radius: var(--radius-full);
    border: 1px solid var(--border);
  }

  .skill-pill--top {
    font-size: var(--text-sm);
    padding: var(--space-1) var(--space-3);
    color: var(--accent);
    border-color: var(--accent-dim);
  }

  .skill-pill--high {
    font-size: var(--text-sm);
    padding: var(--space-1) var(--space-3);
    color: var(--text);
    border-color: var(--border);
  }

  .skill-pill--normal {
    font-size: var(--text-xs);
    padding: var(--space-1) var(--space-2);
    color: var(--text-muted);
    border-color: var(--border);
  }
</style>
```

- [ ] **Step 2: Add SkillsCloud to `src/pages/portfolio/index.astro`**

Add import in frontmatter:
```astro
import SkillsCloud from '../../components/portfolio/SkillsCloud.astro';
```

Add `skills: 'Skills'` to the `t` object:
```typescript
const t = {
  title: 'Portfolio',
  about: 'Biography',
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects',
  publications: 'Publications',
  downloadCv: 'Download CV (PDF)',
};
```

Insert `<SkillsCloud locale={locale} skillsLabel={t.skills} />` between `<AboutSection />` and the Projects section:
```astro
<AboutSection locale={locale} aboutLabel={t.about} />
<SkillsCloud locale={locale} skillsLabel={t.skills} />

<section class="portfolio-section">
  <h2>{t.projects}</h2>
  ...
```

- [ ] **Step 3: Add SkillsCloud to `src/pages/pt-br/portfolio/index.astro`**

Same pattern. Import path:
```astro
import SkillsCloud from '../../../components/portfolio/SkillsCloud.astro';
```

Add `skills: 'Habilidades'` to `t`. Insert component between AboutSection and Projects.

- [ ] **Step 4: Run skills cloud test**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/portfolio.spec.ts --grep "skills cloud"
```

Expected: PASS.

- [ ] **Step 5: Run full build**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm build
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign add src/components/portfolio/SkillsCloud.astro src/pages/portfolio/index.astro src/pages/pt-br/portfolio/index.astro
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign commit -m "feat: add SkillsCloud component with tag frequency tiers"
```

---

## Task 4: Timeline Scroll Highlight

**Files:**
- Modify: `src/components/portfolio/TimelineItem.astro`
- Modify: `src/pages/portfolio/index.astro`
- Modify: `src/pages/pt-br/portfolio/index.astro`
- Test: `tests/e2e/portfolio.spec.ts`

### Context

The current `.timeline::before` pseudo-element in both portfolio page `<style>` blocks creates a **single unbroken vertical line** across all items. Since `::before` is on the container, not individual items, toggling a class on `.timeline-item` cannot affect its color.

The fix: remove `.timeline::before` from both pages, add a `<div class="timeline-line">` inside each `TimelineItem`, positioned absolutely to span each item's left edge.

Current `TimelineItem.astro` structure (for reference):
- `.timeline-item` — `display: grid; grid-template-columns: 1.5rem 1fr; position: relative`
- `.timeline-dot` — 10px circle at `margin-top: 4px; justify-self: center; z-index: 1`
- `.timeline-content` — right column content

The new `.timeline-line` sits in the left column (the 1.5rem slot) behind the dot. It uses `position: absolute` (the parent `.timeline-item` is already `position: relative`). The `.timeline-dot`'s `z-index: 1` ensures it renders above the line.

---

- [ ] **Step 1: Write failing E2E test for timeline highlight**

Add to `tests/e2e/portfolio.spec.ts`:

```typescript
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

- [ ] **Step 2: Run to confirm failure**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/portfolio.spec.ts --grep "timeline line"
```

Expected: FAIL — no `.timeline-item--active` elements.

- [ ] **Step 3: Add `.timeline-line` div to `TimelineItem.astro`**

In the template, add `<div class="timeline-line" aria-hidden="true"></div>` as the first child of `.timeline-item`, before `.timeline-dot`:

```astro
<div class="timeline-item">
  <div class="timeline-line" aria-hidden="true"></div>
  <div class="timeline-dot" aria-hidden="true"></div>
  <div class="timeline-content">
    <div class="timeline-header">
      ...
```

Add to the `<style>` block (after the existing `.timeline-item` rule):

```css
.timeline-line {
  position: absolute;
  left: calc(0.75rem - 1px);
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

- [ ] **Step 4: Remove `.timeline::before` from `src/pages/portfolio/index.astro`**

In the `<style>` block, delete the entire rule:
```css
/* DELETE: */
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

- [ ] **Step 5: Remove `.timeline::before` from `src/pages/pt-br/portfolio/index.astro`**

Same deletion — the identical rule exists in the pt-br page `<style>` block.

- [ ] **Step 6: Add IntersectionObserver script to `src/pages/portfolio/index.astro`**

After the closing `</div>` of the timeline section (before `</div>` of `.portfolio-wrapper`), add:

```astro
<script>
  const items = document.querySelectorAll('.timeline-item');
  if (items.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('timeline-item--active', entry.isIntersecting);
      });
    }, { rootMargin: '-30% 0px -30% 0px' });
    items.forEach(item => observer.observe(item));
  }
</script>
```

- [ ] **Step 7: Add same script to `src/pages/pt-br/portfolio/index.astro`**

Identical `<script>` block in the same position.

- [ ] **Step 8: Run timeline test**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/portfolio.spec.ts --grep "timeline line"
```

Expected: PASS.

- [ ] **Step 9: Run full portfolio test suite**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/portfolio.spec.ts
```

Expected: all 6 tests pass (3 existing + 3 new).

- [ ] **Step 10: Run full E2E suite**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e
```

Expected: all tests pass.

- [ ] **Step 11: Run full build**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm build
```

Expected: 0 errors.

- [ ] **Step 12: Commit**

```bash
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign add src/components/portfolio/TimelineItem.astro src/pages/portfolio/index.astro src/pages/pt-br/portfolio/index.astro tests/e2e/portfolio.spec.ts
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign commit -m "feat: scroll-driven timeline line highlight via IntersectionObserver"
```

---

## Critical Files for Implementation

- `/home/jonathan/Projects/jts-website/.worktrees/frontend-redesign/src/components/portfolio/TimelineItem.astro` — current structure, `position: relative` already set, dot has `z-index: 1`
- `/home/jonathan/Projects/jts-website/.worktrees/frontend-redesign/src/pages/portfolio/index.astro` — EN portfolio page, contains `.timeline::before` to remove
- `/home/jonathan/Projects/jts-website/.worktrees/frontend-redesign/src/pages/pt-br/portfolio/index.astro` — PT-BR portfolio page, same changes
- `/home/jonathan/Projects/jts-website/.worktrees/frontend-redesign/src/content/portfolio/experience.ts` — exports `experience: ExperienceEntry[]`, each entry has `tags: string[]`
- `/home/jonathan/Projects/jts-website/.worktrees/frontend-redesign/src/content/portfolio/projects.ts` — exports `projects: Project[]`, each project has `tags: string[]`
- `/home/jonathan/Projects/jts-website/.worktrees/frontend-redesign/tests/e2e/portfolio.spec.ts` — existing 3 tests; 3 new tests added across Tasks 1, 2, 4
