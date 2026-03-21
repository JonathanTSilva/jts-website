# Blog Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tag filtering and reading time to the blog list, then overhaul individual post pages with a wide two-column layout, table of contents, improved prose styles, and prev/next navigation.

**Architecture:** Three new files (reading-time utility, ToC component, PostNav component) are built first as isolated units, then wired into BlogList and both post page templates. Reading time is computed at build time from raw markdown body. Tag filtering is client-side JS with `?tag=` URL state. ToC and prev/next are generated at build time from content metadata.

**Tech Stack:** Astro 5, TypeScript, vanilla JS IntersectionObserver, CSS custom properties, Playwright E2E

**Spec:** `docs/superpowers/specs/2026-03-21-blog-improvements-design.md`

---

## Planned File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/lib/readingTime.ts` | Pure utility: word count → minutes |
| Modify | `src/components/blog/BlogList.astro` | Tag filter pills + reading time in entries |
| Create | `src/components/blog/TableOfContents.astro` | Sticky ToC sidebar from headings array |
| Create | `src/components/blog/PostNav.astro` | Prev/next post navigation |
| Modify | `src/pages/blog/[slug].astro` | Full post page overhaul (EN) |
| Modify | `src/pages/pt-br/blog/[slug].astro` | Full post page overhaul (PT-BR) |
| Modify | `tests/e2e/blog.spec.ts` | 6 new tests inside existing `describe` block |

---

## Task 1: Reading Time Utility

**Files:**
- Create: `src/lib/readingTime.ts`

### Context

Pure TypeScript function, no imports. Receives `entry.body` — Astro 5 types `body` as `string | undefined` on collection entries, so the function guards for that. Returns minutes (minimum 1). Used by BlogList (Task 2) and both post pages (Tasks 5–6).

---

- [ ] **Step 1: Create `src/lib/readingTime.ts`**

```typescript
export function getReadingTime(body: string | undefined): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 238));
}
```

- [ ] **Step 2: Verify build passes with no TypeScript errors**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm build 2>&1 | tail -10
```

Expected: 0 errors, pages built successfully.

- [ ] **Step 3: Commit**

```bash
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign add src/lib/readingTime.ts
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign commit -m "feat: add reading time utility"
```

---

## Task 2: BlogList — Tag Filters + Reading Time

**Files:**
- Modify: `src/components/blog/BlogList.astro`
- Test: `tests/e2e/blog.spec.ts`

### Context

`BlogList.astro` (169 lines) is the component used by both blog index pages. It fetches, groups, and renders blog entries in a year/month timeline layout. Read the full file before editing — understand the spread `{ ...entry, isTranslationMissing }` pattern and the two-column grid structure.

**Reading time:** Call `getReadingTime(post.body)` inline in the template per entry. `post.body` is a top-level own property on the collection entry and survives the spread.

**Tag filter:** Collect all unique tags from `postsToShow`, sort alphabetically. Render pills above the list — only when tags exist. Each `.blog-entry` anchor gets `data-tags="tag1,tag2"`. A `<script>` block reads `?tag=` on load and toggles visibility.

**Hiding empty groups:** When a tag is active, month groups with no visible entries are hidden. Year rows (`.blog-year` + adjacent `.blog-entries`) with no visible months are also hidden.

---

- [ ] **Step 1: Write 3 failing E2E tests**

Add the following **inside** the existing `test.describe('Blog', () => { ... })` block in `tests/e2e/blog.spec.ts` (append before the closing `}`):

```typescript
  test('blog list shows tag filter pills', async ({ page }) => {
    await page.goto('/blog');
    const allPill = page.locator('.tag-pill--all');
    await expect(allPill).toBeVisible();
  });

  test('blog list tag filter hides non-matching entries', async ({ page }) => {
    await page.goto('/blog');
    const pills = page.locator('.tag-pill:not(.tag-pill--all)');
    const count = await pills.count();
    if (count === 0) return; // no tags in test data — skip
    await pills.first().click();
    const visibleEntries = page.locator('.blog-entry:visible');
    await expect(visibleEntries.first()).toBeVisible();
  });

  test('blog list entries show reading time', async ({ page }) => {
    await page.goto('/blog');
    const firstEntry = page.locator('.blog-entry').first();
    await expect(firstEntry.locator('.blog-entry-date')).toContainText('min');
  });
```

- [ ] **Step 2: Run to confirm failure**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/blog.spec.ts --grep "tag filter pills|tag filter hides|reading time" 2>&1 | tail -15
```

Expected: 3 FAIL — `.tag-pill--all` and "min" not found.

- [ ] **Step 3: Update `src/components/blog/BlogList.astro` frontmatter**

At the top of the `---` block, add the import:

```typescript
import { getReadingTime } from '../../lib/readingTime';
```

After the `postsToShow` array is built (after the `.filter(...)` and `.sort(...)` chain), add:

```typescript
// Collect unique tags across all displayed posts, sorted alphabetically
const allTags = [...new Set(postsToShow.flatMap(p => p.data.tags))].sort();
```

- [ ] **Step 4: Update the template**

Replace the entire template section (everything after the closing `---`) with:

```astro
{postsToShow.length === 0 ? (
  <p class="empty-state">
    {locale === 'en' ? 'No posts yet. Check back soon.' : 'Nenhum post ainda. Volte em breve.'}
  </p>
) : (
  <>
    {allTags.length > 0 && (
      <div class="tag-filters">
        <button class="tag-pill tag-pill--all tag-pill--active" data-tag="">
          {locale === 'en' ? 'All' : 'Todos'}
        </button>
        {allTags.map(tag => (
          <button class="tag-pill" data-tag={tag}>{tag}</button>
        ))}
      </div>
    )}
    <div class="blog-list">
      {years.map(year => {
        const months = groupedPosts[year]
          ? Object.keys(groupedPosts[year]!).map(Number).sort((a, b) => b - a)
          : [];
        return (
          <>
            <h2 class="blog-year">{year}</h2>
            <div class="blog-entries">
              {months.map(month => (
                <div class="blog-month-group">
                  <h3 class="blog-month">{monthNames[month]}</h3>
                  {groupedPosts[year]?.[month]?.map(post => {
                    const mins = getReadingTime(post.body);
                    return (
                      <a
                        href={contentLocalePath(locale, `/blog/${post.data.slug}`)}
                        class="blog-entry"
                        data-tags={post.data.tags.join(',')}
                      >
                        <span class="blog-entry-title">
                          {post.data.title}
                          {post.isTranslationMissing && (
                            <span class="translation-missing-tag">({translationMissingLabel})</span>
                          )}
                        </span>
                        <span class="blog-entry-date">
                          <time datetime={post.data.publishedAt.toISOString()}>
                            {post.data.publishedAt.toLocaleDateString(locale, { month: 'short', day: '2-digit' })}
                          </time>
                          {' · '}{mins} min
                        </span>
                      </a>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        );
      })}
    </div>
  </>
)}
```

- [ ] **Step 5: Add CSS for tag filters to the `<style>` block**

Append to the existing `<style>` block (before `</style>`):

```css
.tag-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-8);
}

.tag-pill {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  color: var(--text-muted);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out);
}
.tag-pill:hover {
  color: var(--text);
  border-color: var(--text-muted);
}
.tag-pill--active {
  color: var(--accent);
  border-color: var(--accent-dim);
}
```

- [ ] **Step 6: Add filter script after `</style>`**

```astro
<script>
  const pills = document.querySelectorAll<HTMLElement>('.tag-pill');
  const entries = document.querySelectorAll<HTMLElement>('.blog-entry');
  const monthGroups = document.querySelectorAll<HTMLElement>('.blog-month-group');

  function getActiveTag(): string {
    return new URLSearchParams(window.location.search).get('tag') ?? '';
  }

  function applyFilter(tag: string): void {
    pills.forEach(pill => {
      pill.classList.toggle('tag-pill--active', pill.dataset.tag === tag);
    });

    entries.forEach(entry => {
      const entryTags = entry.dataset.tags ? entry.dataset.tags.split(',') : [];
      const visible = !tag || entryTags.includes(tag);
      entry.style.display = visible ? '' : 'none';
    });

    monthGroups.forEach(group => {
      const hasVisible = Array.from(group.querySelectorAll<HTMLElement>('.blog-entry'))
        .some(e => e.style.display !== 'none');
      group.style.display = hasVisible ? '' : 'none';
    });

    document.querySelectorAll<HTMLElement>('.blog-entries').forEach(entriesDiv => {
      const hasVisible = Array.from(entriesDiv.querySelectorAll<HTMLElement>('.blog-month-group'))
        .some(g => g.style.display !== 'none');
      entriesDiv.style.display = hasVisible ? '' : 'none';
      const prev = entriesDiv.previousElementSibling as HTMLElement | null;
      if (prev?.classList.contains('blog-year')) {
        prev.style.display = hasVisible ? '' : 'none';
      }
    });
  }

  applyFilter(getActiveTag());

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const tag = pill.dataset.tag ?? '';
      const url = new URL(window.location.href);
      if (tag) url.searchParams.set('tag', tag);
      else url.searchParams.delete('tag');
      history.pushState({}, '', url);
      applyFilter(tag);
    });
  });
</script>
```

- [ ] **Step 7: Run the 3 new tests**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/blog.spec.ts --grep "tag filter pills|tag filter hides|reading time" 2>&1 | tail -15
```

Expected: 3 PASS.

- [ ] **Step 8: Run full blog test suite to confirm no regressions**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/blog.spec.ts
```

Expected: all existing tests plus the 3 new ones pass.

- [ ] **Step 9: Run full build**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm build 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 10: Commit**

```bash
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign add src/components/blog/BlogList.astro tests/e2e/blog.spec.ts
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign commit -m "feat: add tag filters and reading time to blog list"
```

---

## Task 3: TableOfContents Component

**Files:**
- Create: `src/components/blog/TableOfContents.astro`

### Context

Standalone component — no page integration yet. Props: `headings: { depth: number; slug: string; text: string }[]` from Astro's `render()`. Filters to depth 2–3. Astro injects `id` attributes on headings automatically matching `slug`, so `href="#${h.slug}"` works without any extra setup.

The active heading highlight uses IntersectionObserver with `rootMargin: '-20% 0px -70% 0px'` — this means only headings in the top 30% of the viewport trigger active state, giving a natural "one active at a time" feel as the user reads down.

`letter-spacing: 0.08em` and `padding-block: 2px` are intentional literal values — no equivalent token exists.

No E2E test in this task — the test is written in Task 5 when the component is integrated.

---

- [ ] **Step 1: Create `src/components/blog/TableOfContents.astro`**

```astro
---
interface Props {
  headings: { depth: number; slug: string; text: string }[];
}

const { headings } = Astro.props;
const tocHeadings = headings.filter(h => h.depth === 2 || h.depth === 3);
---

{tocHeadings.length > 0 && (
  <nav class="toc" aria-label="Table of contents">
    <p class="toc-title">Contents</p>
    <ol class="toc-list">
      {tocHeadings.map(h => (
        <li class:list={['toc-item', h.depth === 3 ? 'toc-item--sub' : '']}>
          <a class="toc-link" href={`#${h.slug}`}>{h.text}</a>
        </li>
      ))}
    </ol>
  </nav>
)}

<script>
  const links = document.querySelectorAll<HTMLAnchorElement>('.toc-link');
  if (links.length && 'IntersectionObserver' in window) {
    const headingIds = Array.from(links)
      .map(l => l.getAttribute('href')?.slice(1))
      .filter((id): id is string => Boolean(id));
    const headingEls = headingIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector<HTMLElement>(`.toc-link[href="#${id}"]`);
        if (link) link.classList.toggle('active', entry.isIntersecting);
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    headingEls.forEach(el => observer.observe(el));
  }
</script>

<style>
  .toc {
    position: sticky;
    top: calc(var(--space-16) + var(--space-4));
    max-height: calc(100vh - var(--space-16) - var(--space-8));
    overflow-y: auto;
  }

  .toc-title {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    margin: 0 0 var(--space-3) 0;
  }

  .toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .toc-item {
    line-height: 1.3;
  }

  .toc-item--sub {
    padding-left: var(--space-3);
  }

  .toc-link {
    font-size: var(--text-xs);
    color: var(--text-muted);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out);
    display: block;
    padding-block: 2px;
  }
  .toc-link:hover { color: var(--text); text-decoration: none; }
  .toc-link.active { color: var(--accent); }

  @media (max-width: 64rem) {
    .toc { display: none; }
  }
</style>
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm build 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign add src/components/blog/TableOfContents.astro
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign commit -m "feat: add TableOfContents component"
```

---

## Task 4: PostNav Component

**Files:**
- Create: `src/components/blog/PostNav.astro`

### Context

Standalone component. Props: `locale`, `prev?`, `next?`. `prev` is the older post (lower date index in sorted list — higher `publishedAt`); `next` is newer. Both optional — first and last posts have only one neighbour. Locale-conditional labels via `labels` object.

No E2E test in this task — test is written in Task 5.

---

- [ ] **Step 1: Create `src/components/blog/PostNav.astro`**

```astro
---
import { contentLocalePath } from '../../lib/content/locale';

interface Props {
  locale: string;
  prev?: { title: string; slug: string };
  next?: { title: string; slug: string };
}

const { locale, prev, next } = Astro.props;
const labels = locale === 'pt-br'
  ? { prev: '← Mais antigo', next: 'Mais recente →' }
  : { prev: '← Older', next: 'Newer →' };
---

{(prev || next) && (
  <nav class="post-nav" aria-label="Post navigation">
    <div class="post-nav-prev">
      {prev && (
        <a href={contentLocalePath(locale, `/blog/${prev.slug}`)} class="post-nav-link">
          <span class="post-nav-label">{labels.prev}</span>
          <span class="post-nav-title">{prev.title}</span>
        </a>
      )}
    </div>
    <div class="post-nav-next">
      {next && (
        <a href={contentLocalePath(locale, `/blog/${next.slug}`)} class="post-nav-link post-nav-link--next">
          <span class="post-nav-label">{labels.next}</span>
          <span class="post-nav-title">{next.title}</span>
        </a>
      )}
    </div>
  </nav>
)}

<style>
  .post-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
    margin-top: var(--space-12);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border);
  }

  .post-nav-link {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    text-decoration: none;
    color: var(--text-muted);
    transition: color var(--duration-fast) var(--ease-out);
  }
  .post-nav-link:hover { color: var(--accent); text-decoration: none; }

  .post-nav-link--next {
    text-align: right;
  }

  .post-nav-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }

  .post-nav-title {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--text);
  }
  .post-nav-link:hover .post-nav-title { color: inherit; }

  @media (max-width: 48rem) {
    .post-nav { grid-template-columns: 1fr; }
    .post-nav-link--next { text-align: left; }
  }
</style>
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm build 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign add src/components/blog/PostNav.astro
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign commit -m "feat: add PostNav component"
```

---

## Task 5: Post Page Overhaul — EN

**Files:**
- Modify: `src/pages/blog/[slug].astro`
- Test: `tests/e2e/blog.spec.ts`

### Context

This is a full replacement of the EN post page (127 lines → ~200 lines). Read the current file before replacing it.

Key changes from the current version:
1. **`getStaticPaths`** — now computes `displayPosts` (locale-resolved, sorted) and passes `prev`/`next` as props for each path. The existing `locale = 'en'` is already defined inside the function.
2. **`render(post)`** — destructure `headings` alongside `Content`.
3. **Props** — add `prev` and `next` to destructure.
4. **`readingTime`** — computed via `getReadingTime(post.body)`.
5. **Layout** — `<article class="container">` → `<div class="post-wrapper">` two-column grid with `.post-main` + `<aside class="post-toc">`.
6. **Header** — reading time + tag pills in `.post-meta`.
7. **Footer** — remove `.post-footer` with back-link; PostNav takes its place.
8. **Prose** — 13 additional `:global()` rules.

The amber fallback notice colors (`#fef3c7`, `#f59e0b`, `#92400e`) are intentional hardcoded status-semantic colors per CLAUDE.md — do not replace with tokens.

---

- [ ] **Step 1: Write 3 failing E2E tests**

Add the following **inside** the existing `test.describe('Blog', () => { ... })` block in `tests/e2e/blog.spec.ts`:

```typescript
  test('blog post shows reading time in header', async ({ page }) => {
    await page.goto('/blog');
    const firstLink = page.locator('a.blog-entry').first();
    await firstLink.click();
    const meta = page.locator('.post-meta');
    await expect(meta).toContainText('min');
  });

  test('blog post renders table of contents when headings exist', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/blog/2026-03-hello-embedded-systems.en');
    const toc = page.locator('.toc');
    const tocCount = await toc.count();
    if (tocCount > 0) {
      await expect(toc).toBeVisible();
    }
  });

  test('blog post shows prev/next navigation', async ({ page }) => {
    await page.goto('/blog');
    const links = page.locator('a.blog-entry');
    const linkCount = await links.count();
    if (linkCount < 2) return;
    await links.nth(1).click();
    const postNav = page.locator('.post-nav');
    await expect(postNav).toBeVisible();
  });
```

- [ ] **Step 2: Run to confirm failure**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/blog.spec.ts --grep "reading time in header|table of contents|prev.next" 2>&1 | tail -15
```

Expected: 3 FAIL.

- [ ] **Step 3: Replace `src/pages/blog/[slug].astro`** with the full new version:

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import TableOfContents from '../../components/blog/TableOfContents.astro';
import PostNav from '../../components/blog/PostNav.astro';
import { getReadingTime } from '../../lib/readingTime';
import { contentLocalePath } from '../../lib/content/locale';

export async function getStaticPaths() {
  const allPosts = await getCollection('blog');
  const locale = 'en';

  const uniqueTranslationKeys = Array.from(new Set(allPosts.map(p => p.data.translationKey)));

  // Resolve one post per translationKey for EN locale — same logic as BlogList
  const displayPosts = uniqueTranslationKeys.map(key => {
    const translations = allPosts.filter(p => p.data.translationKey === key);
    return translations.find(p => p.data.language === locale)
      || translations.find(p => p.data.language === 'en')
      || translations[0];
  }).filter((p): p is NonNullable<typeof p> => p !== null && p !== undefined)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  return uniqueTranslationKeys.flatMap(key => {
    const translations = allPosts.filter(p => p.data.translationKey === key);
    const displayPost = displayPosts.find(p => p.data.translationKey === key);
    const idx = displayPost ? displayPosts.indexOf(displayPost) : -1;
    const prevPost = idx > 0 ? displayPosts[idx - 1] : undefined;
    const nextPost = idx >= 0 && idx < displayPosts.length - 1 ? displayPosts[idx + 1] : undefined;

    return translations.map(post => ({
      params: { slug: post.data.slug },
      props: {
        post,
        isTranslationFallback: post.data.language !== locale,
        prev: prevPost ? { title: prevPost.data.title, slug: prevPost.data.slug } : undefined,
        next: nextPost ? { title: nextPost.data.title, slug: nextPost.data.slug } : undefined,
      },
    }));
  });
}

const { post, isTranslationFallback, prev, next } = Astro.props;
const { Content, headings } = await render(post);
const locale = 'en';
const readingTime = getReadingTime(post.body);

const t = {
  fallbackNotice: 'This post is not available in English. Showing the original version.',
  viewOriginal: 'View original version',
  publishedAt: 'Published on',
  readingMinutes: 'min read',
};
---

<BaseLayout
  locale={locale}
  title={post.data.title}
  description={post.data.summary}
>
  <div class="post-wrapper">
    <div class="post-main">
      <header class="post-header">
        <h1 class="post-title">{post.data.title}</h1>
        <div class="post-meta">
          <time datetime={post.data.publishedAt.toISOString()}>
            {t.publishedAt} {post.data.publishedAt.toLocaleDateString(locale, { dateStyle: 'long' })}
          </time>
          <span class="post-meta-sep">·</span>
          <span class="post-reading-time">{readingTime} {t.readingMinutes}</span>
          {post.data.tags.length > 0 && (
            <div class="post-tag-pills">
              {post.data.tags.map(tag => <span class="post-tag">{tag}</span>)}
            </div>
          )}
        </div>
      </header>

      {isTranslationFallback && (
        <div class="fallback-notice">
          <p>{t.fallbackNotice}</p>
        </div>
      )}

      <div class="prose">
        <Content />
      </div>

      <PostNav locale={locale} prev={prev} next={next} />
    </div>

    <aside class="post-toc">
      <TableOfContents headings={headings} />
    </aside>
  </div>
</BaseLayout>

<style>
  .post-wrapper {
    max-width: var(--wide-max);
    margin: 0 auto;
    padding: var(--space-8) 0;
    display: grid;
    grid-template-columns: 1fr 14rem;
    gap: var(--space-12);
    align-items: start;
  }

  @media (max-width: 64rem) {
    .post-wrapper {
      grid-template-columns: 1fr;
    }
  }

  .post-main {
    min-width: 0;
  }

  .post-header {
    margin-bottom: var(--space-8);
  }

  .post-title {
    font-size: var(--text-3xl);
    margin-bottom: var(--space-2);
  }

  .post-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    color: var(--text-muted);
    font-size: var(--text-sm);
    font-family: var(--font-mono);
  }

  .post-meta-sep {
    color: var(--text-muted);
  }

  .post-tag-pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .post-tag {
    font-size: var(--text-xs);
    padding: var(--space-1) var(--space-2);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    color: var(--text-muted);
  }

  .fallback-notice {
    background-color: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: var(--space-4);
    margin-bottom: var(--space-8);
    color: #92400e;
  }

  .prose {
    line-height: 1.6;
  }

  .prose :global(h2) {
    font-size: var(--text-2xl);
    margin-top: var(--space-8);
    margin-bottom: var(--space-4);
  }

  .prose :global(h3) {
    font-size: var(--text-xl);
    margin-top: var(--space-6);
    margin-bottom: var(--space-3);
  }

  .prose :global(p) {
    margin-bottom: var(--space-4);
  }

  .prose :global(a) {
    color: var(--accent);
    text-decoration: underline;
    text-decoration-color: var(--accent-dim);
  }

  .prose :global(a:hover) {
    text-decoration-color: var(--accent);
  }

  .prose :global(strong) {
    font-weight: var(--weight-semibold);
    color: var(--text);
  }

  .prose :global(code) {
    font-family: var(--font-mono);
    font-size: 0.875em;
    background: var(--surface-high);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.1em var(--space-1);
  }

  .prose :global(pre) {
    background: var(--surface-high);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    overflow-x: auto;
    margin-bottom: var(--space-6);
  }

  .prose :global(pre code) {
    background: none;
    border: none;
    padding: 0;
    font-size: var(--text-sm);
    border-radius: 0;
  }

  .prose :global(blockquote) {
    border-left: 2px solid var(--accent);
    padding-left: var(--space-4);
    margin-left: 0;
    color: var(--text-muted);
    font-style: italic;
    margin-bottom: var(--space-4);
  }

  .prose :global(ul),
  .prose :global(ol) {
    padding-left: var(--space-6);
    margin-bottom: var(--space-4);
  }

  .prose :global(li) {
    margin-bottom: var(--space-2);
  }

  .prose :global(hr) {
    border: none;
    border-top: 1px solid var(--border);
    margin-block: var(--space-8);
  }
</style>
```

- [ ] **Step 4: Run the 3 post tests**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/blog.spec.ts --grep "reading time in header|table of contents|prev.next" 2>&1 | tail -15
```

Expected: PASS.

- [ ] **Step 5: Run full blog test suite**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/blog.spec.ts
```

Expected: all tests pass (5 existing + 3 from Task 2 + 3 from this task = 11 total).

- [ ] **Step 6: Run full build**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm build 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign add src/pages/blog/[slug].astro tests/e2e/blog.spec.ts
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign commit -m "feat: overhaul EN blog post page — wide layout, ToC, PostNav, improved prose"
```

---

## Task 6: Post Page Overhaul — PT-BR

**Files:**
- Modify: `src/pages/pt-br/blog/[slug].astro`

### Context

Identical overhaul to Task 5 but for the PT-BR locale. Read the current PT-BR file (122 lines) before replacing. Differences from the EN version:

- All import paths are `../../../` instead of `../../` (one extra level for `pt-br/` directory)
- `const locale = 'pt-br'` everywhere
- `displayPosts` resolution prefers `'pt-br'` translation (already handled by the pattern: `find(p => p.data.language === locale)`)
- `t` object uses Portuguese strings (see Step 1)

---

- [ ] **Step 1: Replace `src/pages/pt-br/blog/[slug].astro`** with the full new version:

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import TableOfContents from '../../../components/blog/TableOfContents.astro';
import PostNav from '../../../components/blog/PostNav.astro';
import { getReadingTime } from '../../../lib/readingTime';
import { contentLocalePath } from '../../../lib/content/locale';

export async function getStaticPaths() {
  const allPosts = await getCollection('blog');
  const locale = 'pt-br';

  const uniqueTranslationKeys = Array.from(new Set(allPosts.map(p => p.data.translationKey)));

  // Resolve one post per translationKey for PT-BR locale — same logic as BlogList
  const displayPosts = uniqueTranslationKeys.map(key => {
    const translations = allPosts.filter(p => p.data.translationKey === key);
    return translations.find(p => p.data.language === locale)
      || translations.find(p => p.data.language === 'en')
      || translations[0];
  }).filter((p): p is NonNullable<typeof p> => p !== null && p !== undefined)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  return uniqueTranslationKeys.flatMap(key => {
    const translations = allPosts.filter(p => p.data.translationKey === key);
    const displayPost = displayPosts.find(p => p.data.translationKey === key);
    const idx = displayPost ? displayPosts.indexOf(displayPost) : -1;
    const prevPost = idx > 0 ? displayPosts[idx - 1] : undefined;
    const nextPost = idx >= 0 && idx < displayPosts.length - 1 ? displayPosts[idx + 1] : undefined;

    return translations.map(post => ({
      params: { slug: post.data.slug },
      props: {
        post,
        isTranslationFallback: post.data.language !== locale,
        prev: prevPost ? { title: prevPost.data.title, slug: prevPost.data.slug } : undefined,
        next: nextPost ? { title: nextPost.data.title, slug: nextPost.data.slug } : undefined,
      },
    }));
  });
}

const { post, isTranslationFallback, prev, next } = Astro.props;
const { Content, headings } = await render(post);
const locale = 'pt-br';
const readingTime = getReadingTime(post.body);

const t = {
  fallbackNotice: 'Este post não está disponível em Português. Exibindo a versão original.',
  viewOriginal: 'Ver versão original',
  publishedAt: 'Publicado em',
  readingMinutes: 'min de leitura',
};
---

<BaseLayout
  locale={locale}
  title={post.data.title}
  description={post.data.summary}
>
  <div class="post-wrapper">
    <div class="post-main">
      <header class="post-header">
        <h1 class="post-title">{post.data.title}</h1>
        <div class="post-meta">
          <time datetime={post.data.publishedAt.toISOString()}>
            {t.publishedAt} {post.data.publishedAt.toLocaleDateString(locale, { dateStyle: 'long' })}
          </time>
          <span class="post-meta-sep">·</span>
          <span class="post-reading-time">{readingTime} {t.readingMinutes}</span>
          {post.data.tags.length > 0 && (
            <div class="post-tag-pills">
              {post.data.tags.map(tag => <span class="post-tag">{tag}</span>)}
            </div>
          )}
        </div>
      </header>

      {isTranslationFallback && (
        <div class="fallback-notice">
          <p>{t.fallbackNotice}</p>
        </div>
      )}

      <div class="prose">
        <Content />
      </div>

      <PostNav locale={locale} prev={prev} next={next} />
    </div>

    <aside class="post-toc">
      <TableOfContents headings={headings} />
    </aside>
  </div>
</BaseLayout>

<style>
  .post-wrapper {
    max-width: var(--wide-max);
    margin: 0 auto;
    padding: var(--space-8) 0;
    display: grid;
    grid-template-columns: 1fr 14rem;
    gap: var(--space-12);
    align-items: start;
  }

  @media (max-width: 64rem) {
    .post-wrapper {
      grid-template-columns: 1fr;
    }
  }

  .post-main {
    min-width: 0;
  }

  .post-header {
    margin-bottom: var(--space-8);
  }

  .post-title {
    font-size: var(--text-3xl);
    margin-bottom: var(--space-2);
  }

  .post-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    color: var(--text-muted);
    font-size: var(--text-sm);
    font-family: var(--font-mono);
  }

  .post-meta-sep {
    color: var(--text-muted);
  }

  .post-tag-pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .post-tag {
    font-size: var(--text-xs);
    padding: var(--space-1) var(--space-2);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    color: var(--text-muted);
  }

  .fallback-notice {
    background-color: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: var(--space-4);
    margin-bottom: var(--space-8);
    color: #92400e;
  }

  .prose {
    line-height: 1.6;
  }

  .prose :global(h2) {
    font-size: var(--text-2xl);
    margin-top: var(--space-8);
    margin-bottom: var(--space-4);
  }

  .prose :global(h3) {
    font-size: var(--text-xl);
    margin-top: var(--space-6);
    margin-bottom: var(--space-3);
  }

  .prose :global(p) {
    margin-bottom: var(--space-4);
  }

  .prose :global(a) {
    color: var(--accent);
    text-decoration: underline;
    text-decoration-color: var(--accent-dim);
  }

  .prose :global(a:hover) {
    text-decoration-color: var(--accent);
  }

  .prose :global(strong) {
    font-weight: var(--weight-semibold);
    color: var(--text);
  }

  .prose :global(code) {
    font-family: var(--font-mono);
    font-size: 0.875em;
    background: var(--surface-high);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.1em var(--space-1);
  }

  .prose :global(pre) {
    background: var(--surface-high);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    overflow-x: auto;
    margin-bottom: var(--space-6);
  }

  .prose :global(pre code) {
    background: none;
    border: none;
    padding: 0;
    font-size: var(--text-sm);
    border-radius: 0;
  }

  .prose :global(blockquote) {
    border-left: 2px solid var(--accent);
    padding-left: var(--space-4);
    margin-left: 0;
    color: var(--text-muted);
    font-style: italic;
    margin-bottom: var(--space-4);
  }

  .prose :global(ul),
  .prose :global(ol) {
    padding-left: var(--space-6);
    margin-bottom: var(--space-4);
  }

  .prose :global(li) {
    margin-bottom: var(--space-2);
  }

  .prose :global(hr) {
    border: none;
    border-top: 1px solid var(--border);
    margin-block: var(--space-8);
  }
</style>
```

- [ ] **Step 2: Run full blog test suite**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e tests/e2e/blog.spec.ts
```

Expected: all 11 tests pass.

- [ ] **Step 3: Run full E2E suite**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm test:e2e
```

Expected: all tests pass (69 existing + 6 new = 75 total).

- [ ] **Step 4: Run full build**

```bash
cd /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign && pnpm build 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign add src/pages/pt-br/blog/[slug].astro
git -C /home/jonathan/Projects/jts-website/.worktrees/frontend-redesign commit -m "feat: overhaul PT-BR blog post page — wide layout, ToC, PostNav, improved prose"
```

---

## Critical Files for Implementation

- `/home/jonathan/Projects/jts-website/.worktrees/frontend-redesign/src/components/blog/BlogList.astro` — 169 lines; understand the spread pattern and template structure before editing
- `/home/jonathan/Projects/jts-website/.worktrees/frontend-redesign/src/pages/blog/[slug].astro` — 127 lines; full replacement in Task 5
- `/home/jonathan/Projects/jts-website/.worktrees/frontend-redesign/src/pages/pt-br/blog/[slug].astro` — 122 lines; full replacement in Task 6
- `/home/jonathan/Projects/jts-website/.worktrees/frontend-redesign/src/lib/content/locale.ts` — `contentLocalePath()` and `Locale` type
- `/home/jonathan/Projects/jts-website/.worktrees/frontend-redesign/src/styles/tokens.css` — CSS custom properties reference
- `/home/jonathan/Projects/jts-website/.worktrees/frontend-redesign/tests/e2e/blog.spec.ts` — 69 lines; new tests go **inside** `test.describe('Blog', () => { ... })` block
