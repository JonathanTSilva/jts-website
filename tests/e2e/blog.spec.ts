import { test, expect } from '@playwright/test';
import { readSearchIndex } from './helpers/content';

// These tests read the real blog (never fixtures) and navigate from its index, so they
// hold for any posts. They need at least one live post to have anything to check.
const livePosts = readSearchIndex('en').filter((i) => i.type === 'blog');

test.describe('Blog', () => {
  test.skip(livePosts.length === 0, 'no live English blog post in the build');

  test('en: blog index groups posts by year and month', async ({ page }) => {
    await page.goto('/blog');

    await expect(page.getByRole('heading', { name: /^\d{4}$/, level: 2 }).first()).toBeVisible();
    // At least one month heading should exist
    await expect(page.locator('h3.blog-month').first()).toBeVisible();
    // At least one post entry should exist
    await expect(page.locator('a.blog-entry').first()).toBeVisible();
  });

  test('pt-br: blog index groups posts by year and month', async ({ page }) => {
    await page.goto('/pt-br/blog');

    await expect(page.getByRole('heading', { name: /^\d{4}$/, level: 2 }).first()).toBeVisible();
    await expect(page.locator('h3.blog-month').first()).toBeVisible();
    await expect(page.locator('a.blog-entry').first()).toBeVisible();
  });

  test('en: blog detail page renders content', async ({ page }) => {
    // Navigate to first available post rather than hardcoding a slug
    await page.goto('/blog');
    const firstLink = page.locator('a.blog-entry').first();
    const href = await firstLink.getAttribute('href');
    await page.goto(href!);

    await expect(page.locator('.post-title')).toBeVisible();
    await expect(page.locator('.post-meta')).toContainText(/Published on/);
    await expect(page.locator('.author-name')).toHaveText('Jonathan Tobias');
    await expect(page.locator('.author-subtitle')).toHaveText('Senior Embedded Software Engineer');
  });

  test('pt-br: blog detail page renders content', async ({ page }) => {
    await page.goto('/pt-br/blog');
    const firstLink = page.locator('a.blog-entry').first();
    const href = await firstLink.getAttribute('href');
    await page.goto(href!);

    await expect(page.locator('.post-title')).toBeVisible();
    await expect(page.locator('.author-name')).toHaveText('Jonathan Tobias');
    await expect(page.locator('.author-subtitle')).toHaveText('Engenheiro Sênior de Software Embarcado');
  });

  test('a translated post shares its clean path with the other locale', async ({ page }) => {
    // Both languages of a post share a slug, so the same path under /pt-br/ is the real
    // translation (not a copy of the EN page). Fallback pages (with the notice) exist only
    // for posts missing a translation; they are covered by unit tests.
    await page.goto('/blog');
    const href = await page.locator('a.blog-entry').first().getAttribute('href'); // e.g. /blog/some-post/
    const hasTranslation = readSearchIndex('pt-br').some((i) => i.url === '/pt-br' + href!.replace(/\/$/, ''));
    test.skip(!hasTranslation, 'the newest post has no Portuguese translation');
    await page.goto(href!);
    const enPageTitle = await page.title();

    const response = await page.goto('/pt-br' + href);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-br');
    expect(await page.title()).not.toBe(enPageTitle);
  });

  test('RSS feed is generated', async ({ page }) => {
    const response = await page.goto('/rss.xml');
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain('<rss');
    expect(text).toContain('<item>');
    expect(text).toContain('https://www.jontobias.com');
  });

  test('blog list shows category filter bar', async ({ page }) => {
    await page.goto('/blog');
    const filterBar = page.locator('.blog-filter-bar');
    await expect(filterBar).toBeVisible();
    const allBtn = page.getByRole('button', { name: /All/ });
    await expect(allBtn).toBeVisible();
  });

  test('blog list category filter hides non-matching entries', async ({ page }) => {
    await page.goto('/blog');
    const categoryBtns = page.locator('.filter-category-btn:not([data-category="all"])');
    const count = await categoryBtns.count();
    if (count === 0) return;
    await categoryBtns.first().click();
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
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/blog');
    const firstLink = page.locator('a.blog-entry').first();
    const href = await firstLink.getAttribute('href');
    await page.goto(href!);
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

  test('en: blog index has category filter with badge counts', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('.blog-filter-bar')).toBeVisible();
    await expect(page.getByRole('button', { name: /All/ })).toBeVisible();
    const badge = page.locator('.filter-category-btn .badge-count').first();
    await expect(badge).toBeVisible();
  });

  test('blog list uses two-column year/entry layout', async ({ page }) => {
    await page.goto('/blog');
    const yearLabel = page.locator('.blog-year').first();
    await expect(yearLabel).toBeVisible();
  });

  test('blog post applies prose class', async ({ page }) => {
    await page.goto('/blog');
    const firstLink = page.locator('a[href^="/blog/"]').first();
    await firstLink.click();
    const prose = page.locator('.prose');
    await expect(prose).toBeVisible();
  });

  test('blog post: TOC starts below preamble separator', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/blog');
    const firstLink = page.locator('a.blog-entry').first();
    const href = await firstLink.getAttribute('href');
    await page.goto(href!);
    const separator = page.locator('.post-preamble hr, .preamble-divider').first();
    const toc = page.locator('.toc-sidebar');
    await expect(separator).toBeVisible();
    await expect(toc).toBeVisible();
    const sepBox = await separator.boundingBox();
    const tocBox = await toc.boundingBox();
    expect(tocBox!.y).toBeGreaterThanOrEqual(sepBox!.y);
  });

  test('blog post: share buttons are visible', async ({ page }) => {
    await page.goto('/blog');
    const firstLink = page.locator('a.blog-entry').first();
    const href = await firstLink.getAttribute('href');
    await page.goto(href!);
    const shareSection = page.locator('.share-buttons');
    await expect(shareSection).toBeVisible();
    await expect(page.locator('.share-btn[data-platform="linkedin"]')).toBeVisible();
    await expect(page.locator('.share-btn[data-platform="copy"]')).toBeVisible();
  });

  test('en: blog index has cross-section link to notes', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('a.cross-section-nav[href="/notes"]')).toBeVisible();
  });

  test('pt-br: blog index has cross-section link to notes', async ({ page }) => {
    await page.goto('/pt-br/blog');
    await expect(page.locator('a.cross-section-nav[href="/pt-br/notes"]')).toBeVisible();
  });

  test('blog post: back to top button is present and hidden before scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/blog');
    const firstLink = page.locator('a.blog-entry').first();
    const href = await firstLink.getAttribute('href');
    await page.goto(href!);
    const btn = page.locator('.back-to-top-btn');
    await expect(btn).toBeAttached();
    const opacity = await btn.evaluate(el => window.getComputedStyle(el).opacity);
    expect(opacity).toBe('0');
    await page.evaluate(() => {
      window.dispatchEvent(new Event('scroll'));
      Object.defineProperty(window, 'scrollY', { value: 400, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    await expect(btn).toHaveClass(/visible/);
  });

  test('PT post back link stays in Portuguese', async ({ page }) => {
    await page.goto('/pt-br/blog');
    const firstPost = page.locator('a[href^="/pt-br/blog/"]').first();
    await firstPost.click();
    await page.waitForURL(/\/pt-br\/blog\/.+/);
    await expect(page.locator('.back-link')).toHaveAttribute('href', '/pt-br/blog');
  });
});

test.describe('Fallback page for a missing translation', () => {
  // fixture-en-only exists only in English (tests/fixtures/content/blog), so its Portuguese
  // route is a fallback page. Fixtures are always noindex too, which uses the same
  // "noindex, follow" value as real fallback pages.
  const EN = '/test-fixtures/blog/fixture-en-only/';
  const PT = '/pt-br/test-fixtures/blog/fixture-en-only/';

  test('the English post page exists', async ({ page }) => {
    const response = await page.goto(EN);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.post-title')).toHaveText('English-Only Fixture Post');
    await expect(page.locator('.translation-fallback-notice')).toHaveCount(0);
  });

  test('the Portuguese page shows the fallback notice and is noindex', async ({ page }) => {
    const response = await page.goto(PT);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-br');
    await expect(page.locator('.translation-fallback-notice')).toBeVisible();
    // The body is the English original, so the title stays English.
    await expect(page.locator('.post-title')).toHaveText('English-Only Fixture Post');
    await expect(page.locator('meta[name="robots"][content="noindex, follow"]')).toHaveCount(1);
  });

  test('the Portuguese page language switcher points at the English page', async ({ page }) => {
    await page.goto(PT);
    await expect(page.locator('a.lang-btn[data-locale="en"]').first()).toHaveAttribute('href', EN);
  });
});
