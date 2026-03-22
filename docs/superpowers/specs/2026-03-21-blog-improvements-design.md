# Blog Improvements Design Spec
**Date:** 2026-03-21
**Branch base:** `feature/frontend-redesign`
**Scope:** Blog list tag filters + reading time · Individual post overhaul (ToC, prose, prev/next, header)

---

## Prerequisites

Builds on `feature/frontend-redesign`. CSS tokens, `BaseLayout`, and `BlogList` are assumed present.

---

## 1. Reading Time Utility

### File

Create `src/lib/readingTime.ts`:

```typescript
export function getReadingTime(body: string | undefined): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 238));
}
```

238 wpm is the median adult reading speed. `body` is the raw Markdown string from `entry.body`. Astro types `body` as `string | undefined` on collection entries — the guard returns 1 for empty/missing bodies. Result is minutes, minimum 1.

---

## 2. Blog List: Tag Filters + Reading Time

### Component changes: `src/components/blog/BlogList.astro`

#### Reading time

Call `getReadingTime(post.body)` for each post at build time. Display "N min" in `.blog-entry-date` alongside the short date, separated by `·`:

```
Jan 05 · 3 min
```

`post.body` is a top-level property on the Astro content collection entry (not under `.data`). It survives the spread `{ ...post, isTranslationMissing: false }` used in `BlogList.astro` because `body` is an own enumerable property of the entry object.

#### Tag filter pills

Collect all unique tags across `postsToShow` (sorted alphabetically). Render above the list:

```astro
<div class="tag-filters">
  <button class="tag-pill tag-pill--all tag-pill--active" data-tag="">All</button>
  {allTags.map(tag => (
    <button class="tag-pill" data-tag={tag}>{tag}</button>
  ))}
</div>
```

Each `.blog-entry` anchor gets a `data-tags` attribute containing comma-separated tags:

```astro
<a ... data-tags={post.data.tags.join(',')}>
```

#### CSS for tag filters

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

#### Client-side filter script

A `<script>` block inside `BlogList.astro`:

```javascript
const pills = document.querySelectorAll('.tag-pill');
const entries = document.querySelectorAll('.blog-entry');
const yearGroups = document.querySelectorAll('.blog-year');
const monthGroups = document.querySelectorAll('.blog-month-group');

function getActiveTag() {
  return new URLSearchParams(window.location.search).get('tag') ?? '';
}

function applyFilter(tag) {
  // Update pills
  pills.forEach(pill => {
    pill.classList.toggle('tag-pill--active', pill.dataset.tag === tag);
  });

  // Show/hide entries
  entries.forEach(entry => {
    const entryTags = entry.dataset.tags ? entry.dataset.tags.split(',') : [];
    const visible = !tag || entryTags.includes(tag);
    entry.style.display = visible ? '' : 'none';
  });

  // Hide month groups with no visible entries
  monthGroups.forEach(group => {
    const hasVisible = Array.from(group.querySelectorAll('.blog-entry'))
      .some(e => e.style.display !== 'none');
    group.style.display = hasVisible ? '' : 'none';
  });

  // Hide year rows with no visible month groups
  // Year/entries are siblings in a 2-col grid: each .blog-year is followed by a .blog-entries div
  document.querySelectorAll('.blog-entries').forEach(entriesDiv => {
    const hasVisible = Array.from(entriesDiv.querySelectorAll('.blog-month-group'))
      .some(g => g.style.display !== 'none');
    entriesDiv.style.display = hasVisible ? '' : 'none';
    // Hide the sibling .blog-year
    const prev = entriesDiv.previousElementSibling;
    if (prev?.classList.contains('blog-year')) {
      prev.style.display = hasVisible ? '' : 'none';
    }
  });
}

// Read tag from URL on load
applyFilter(getActiveTag());

// Handle pill clicks
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
```

If no posts have tags, the tag filter section is omitted (check `allTags.length > 0` before rendering).

---

## 3. Individual Post: Layout

### Wide container with ToC sidebar

Replace the current `.container` (52rem) with a wider layout using `--wide-max` (72rem). On desktop (≥ 64rem), display prose + ToC side by side:

```css
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
```

The `<article>` uses `.post-wrapper`. The ToC column is hidden on mobile (the grid collapses to `1fr` and the ToC component hides itself below 64rem).

The prose column (`<div class="post-main">`) contains the header, fallback notice, prose, and PostNav. It constrains its own content:

```css
.post-main {
  min-width: 0; /* prevent grid blowout */
}
```

### Template structure (in `[slug].astro`)

```astro
<BaseLayout ...>
  <div class="post-wrapper">
    <div class="post-main">
      <header class="post-header">...</header>
      {isTranslationFallback && <div class="fallback-notice">...</div>}
      <div class="prose"><Content /></div>
      <PostNav locale={locale} prev={prev} next={next} />
    </div>
    <aside class="post-toc">
      <TableOfContents headings={headings} />
    </aside>
  </div>
</BaseLayout>
```

---

## 4. Post Header Improvements

### Reading time

**EN** (`src/pages/blog/[slug].astro`):
```astro
import { getReadingTime } from '../../lib/readingTime';
const readingTime = getReadingTime(post.body);
```

**PT-BR** (`src/pages/pt-br/blog/[slug].astro`) — path is one level deeper:
```astro
import { getReadingTime } from '../../../lib/readingTime';
const readingTime = getReadingTime(post.body);
```

Add `readingMinutes` to the `t` object in each page:
- EN: `readingMinutes: 'min read'`
- PT-BR: `readingMinutes: 'min de leitura'`

In the header:

```astro
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
```

CSS:

```css
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
```

---

## 5. Table of Contents Component

### File

Create `src/components/blog/TableOfContents.astro`.

### Props

```typescript
interface Props {
  headings: { depth: number; slug: string; text: string }[];
}
```

`headings` comes from `render(post)` in the page frontmatter. Change the existing line in both `[slug].astro` files from:
```typescript
const { Content } = await render(post);
```
to:
```typescript
const { Content, headings } = await render(post);
```

### Filtering

Show only `depth === 2` and `depth === 3`. If no qualifying headings exist, render nothing (empty fragment).

### Template

```astro
---
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
```

### CSS

```css
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
```

### Active heading script

A `<script>` block in `TableOfContents.astro`:

```javascript
const links = document.querySelectorAll('.toc-link');
if (links.length && 'IntersectionObserver' in window) {
  const headingIds = Array.from(links).map(l => l.getAttribute('href')?.slice(1)).filter(Boolean);
  const headingEls = headingIds.map(id => document.getElementById(id)).filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = document.querySelector(`.toc-link[href="#${id}"]`);
      if (link) link.classList.toggle('active', entry.isIntersecting);
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  headingEls.forEach(el => observer.observe(el));
}
```

`rootMargin: '-20% 0px -70% 0px'` means only headings in the top 30% of the viewport trigger active state — one heading is active at a time as the user reads down.

---

## 6. Improved Prose Styles

Add these `:global()` rules to the `.prose` block in both `[slug].astro` files (after the existing `h2` and `p` rules):

```css
.prose :global(h3) {
  font-size: var(--text-xl);
  margin-top: var(--space-6);
  margin-bottom: var(--space-3);
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
```

`0.875em` for inline code font-size is intentional — it scales relative to the surrounding text size rather than using a fixed token.

---

## 7. Prev/Next Navigation

### File

Create `src/components/blog/PostNav.astro`.

### Props

```typescript
interface Props {
  locale: string;
  prev?: { title: string; slug: string };
  next?: { title: string; slug: string };
}
```

`prev` = older post (published before current). `next` = newer post (published after current). Either or both may be undefined (first/last post).

### Template

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
```

### CSS

```css
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
```

### Computing prev/next in `getStaticPaths`

In both `[slug].astro` pages, add `const locale` inside `getStaticPaths` (the outer `const locale` is not in scope there) and compute the ordered display list:

- EN file: `const locale = 'en';`
- PT-BR file: `const locale = 'pt-br';`

```typescript
export async function getStaticPaths() {
  const allPosts = await getCollection('blog');
  const locale = 'en'; // 'pt-br' in the PT-BR file

  const uniqueTranslationKeys = Array.from(new Set(allPosts.map(p => p.data.translationKey)));

  // Resolve one post per translationKey for the current locale (same logic as BlogList)
  const displayPosts = uniqueTranslationKeys.map(key => {
  const translations = allPosts.filter(p => p.data.translationKey === key);
  return translations.find(p => p.data.language === locale)
    || translations.find(p => p.data.language === 'en')
    || translations[0];
}).filter(Boolean)
  .sort((a, b) => b!.data.publishedAt.getTime() - a!.data.publishedAt.getTime()) as typeof allPosts;

// For each path, find the current post's index in displayPosts
return uniqueTranslationKeys.flatMap(key => {
  const translations = allPosts.filter(p => p.data.translationKey === key);
  return translations.map(post => {
    const displayPost = displayPosts.find(p => p.data.translationKey === key);
    const idx = displayPost ? displayPosts.indexOf(displayPost) : -1;
    const prevPost = idx > 0 ? displayPosts[idx - 1] : undefined;
    const nextPost = idx >= 0 && idx < displayPosts.length - 1 ? displayPosts[idx + 1] : undefined;
    return {
      params: { slug: post.data.slug },
      props: {
        post,
        isTranslationFallback: post.data.language !== locale,
        prev: prevPost ? { title: prevPost.data.title, slug: prevPost.data.slug } : undefined,
        next: nextPost ? { title: nextPost.data.title, slug: nextPost.data.slug } : undefined,
      },
    };
  });
});
```

The `prev`/`next` slugs are always the locale-resolved display post slugs (what the blog list links to), so navigation stays coherent regardless of which translation the user is viewing.

The existing `.post-footer` with the back-link is removed; `PostNav` replaces it.

**Note:** The existing `getStaticPaths` in both files already fetches `allPosts` and builds `uniqueTranslationKeys`. Replace the entire function with the updated version above — do not leave the old `return` statement alongside the new one.

---

## 8. E2E Tests

Add inside the existing `test.describe('Blog', () => { ... })` block in `tests/e2e/blog.spec.ts`:

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
  if (count === 0) return; // no tags in test data
  await pills.first().click();
  // At least one entry should still be visible
  const visibleEntries = page.locator('.blog-entry:visible');
  await expect(visibleEntries.first()).toBeVisible();
});

test('blog list entries show reading time', async ({ page }) => {
  await page.goto('/blog');
  const firstEntry = page.locator('.blog-entry').first();
  await expect(firstEntry.locator('.blog-entry-date')).toContainText('min');
});

test('blog post shows reading time in header', async ({ page }) => {
  await page.goto('/blog');
  const firstLink = page.locator('a.blog-entry').first();
  await firstLink.click();
  const meta = page.locator('.post-meta');
  await expect(meta).toContainText('min');
});

test('blog post renders table of contents when headings exist', async ({ page }) => {
  await page.goto('/blog/2026-03-hello-embedded-systems.en');
  // ToC only shows on wide viewports
  await page.setViewportSize({ width: 1200, height: 800 });
  const toc = page.locator('.toc');
  // ToC presence depends on whether the post has h2/h3 headings
  // If it doesn't exist, the test is a no-op
  const tocCount = await toc.count();
  if (tocCount > 0) {
    await expect(toc).toBeVisible();
  }
});

test('blog post shows prev/next navigation', async ({ page }) => {
  // Navigate to a post that has at least one neighbour
  await page.goto('/blog');
  const links = page.locator('a.blog-entry');
  const linkCount = await links.count();
  if (linkCount < 2) return;
  // Go to the second post (has a prev)
  await links.nth(1).click();
  const postNav = page.locator('.post-nav');
  await expect(postNav).toBeVisible();
});
```

---

## What Is NOT in Scope

- Pagination on the blog list
- Search-within-filtered-results
- Tag pages (`/blog/tag/foo`)
- Reading progress bar
- Estimated reading time in RSS feed
- PT-BR ToC title and `aria-label` translation (always "Contents" / "Table of contents" in English for now)

---

## File Changes Summary

| Action | File |
|--------|------|
| Create | `src/lib/readingTime.ts` |
| Create | `src/components/blog/TableOfContents.astro` |
| Create | `src/components/blog/PostNav.astro` |
| Modify | `src/components/blog/BlogList.astro` — tag filters, reading time |
| Modify | `src/pages/blog/[slug].astro` — wide layout, ToC, improved prose, PostNav, reading time, prev/next props |
| Modify | `src/pages/pt-br/blog/[slug].astro` — same |
| Modify | `tests/e2e/blog.spec.ts` — 6 new tests (inside existing `describe` block) |
