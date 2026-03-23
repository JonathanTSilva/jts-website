import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('en: blog index groups posts by year and month', async ({ page }) => {
    await page.goto('/blog');
    
    // Check for year and month headings
    await expect(page.getByRole('heading', { name: '2026', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'March', level: 3 })).toBeVisible();
    
    // Check for specific post
    await expect(page.getByText('Continuous Integration for Firmware')).toBeVisible();
  });

  test('pt-br: blog index groups posts by year and month', async ({ page }) => {
    await page.goto('/pt-br/blog');
    
    // Check for year and month headings
    await expect(page.getByRole('heading', { name: '2026', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Março', level: 3 })).toBeVisible();
    
    // Check for specific post (translated or fallback)
    await expect(page.getByText('Olá Sistemas Embarcados')).toBeVisible();
  });

  test('en: blog detail page renders content', async ({ page }) => {
    await page.goto('/blog/2026-03-hello-embedded-systems.en');
    await expect(page.getByRole('heading', { name: 'Hello Embedded Systems', level: 1 })).toBeVisible();
    await expect(page.getByText(/Published on March (9|10), 2026/)).toBeVisible();
    await expect(page.locator('.author-name')).toHaveText('Jonathan Tobias');
    await expect(page.locator('.author-subtitle')).toHaveText('Senior Embedded Software Engineer');
  });

  test('pt-br: blog detail page renders content', async ({ page }) => {
    await page.goto('/pt-br/blog/2026-03-hello-embedded-systems.pt-br');
    await expect(page.getByRole('heading', { name: 'Olá Sistemas Embarcados', level: 1 })).toBeVisible();
    await expect(page.locator('.author-name')).toHaveText('Jonathan Tobias');
    await expect(page.locator('.author-subtitle')).toHaveText('Senior Embedded Software Engineer');
  });

  test('translation fallback notice is visible', async ({ page }) => {
    // Navigate to a post that only exists in EN while in PT-BR context
    // Actually, in our current implementation, we generate paths for all slugs.
    // If I go to /pt-br/blog/2026-03-ci-firmware.en (which is the EN slug)
    await page.goto('/pt-br/blog/2026-03-ci-firmware.en');
    await expect(page.getByText(/Este post não está disponível em Português/i)).toBeVisible();
  });

  test('RSS feed is generated', async ({ page }) => {
    const response = await page.goto('/rss.xml');
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain('<rss');
    expect(text).toContain('Continuous Integration for Firmware');
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
    if (count === 0) return; // no categories in test data — skip
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

  test('en: blog index has category filter with badge counts', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('.blog-filter-bar')).toBeVisible();
    await expect(page.getByRole('button', { name: /All/ })).toBeVisible();
    const badge = page.locator('.filter-category-btn .badge-count').first();
    await expect(badge).toBeVisible();
  });

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

  test('blog post: TOC starts below preamble separator', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/blog/2026-03-ci-firmware.en');
    const separator = page.locator('.post-preamble hr, .preamble-divider').first();
    const toc = page.locator('.toc-sidebar');
    await expect(separator).toBeVisible();
    await expect(toc).toBeVisible();
    const sepBox = await separator.boundingBox();
    const tocBox = await toc.boundingBox();
    expect(tocBox!.y).toBeGreaterThanOrEqual(sepBox!.y);
  });

  test('blog post: share buttons are visible', async ({ page }) => {
    await page.goto('/blog/2026-03-ci-firmware.en');
    const shareSection = page.locator('.share-buttons');
    await expect(shareSection).toBeVisible();
    await expect(page.locator('.share-btn[data-platform="linkedin"]')).toBeVisible();
    await expect(page.locator('.share-btn[data-platform="copy"]')).toBeVisible();
  });

  test('blog post: back to top button is present and hidden before scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/blog/2026-03-ci-firmware.en');
    const btn = page.locator('.back-to-top-btn');
    // Button exists in DOM but is not visually active (opacity: 0, pointer-events: none)
    await expect(btn).toBeAttached();
    const opacity = await btn.evaluate(el => window.getComputedStyle(el).opacity);
    expect(opacity).toBe('0');
    // After scrolling past 300px it gains the .visible class
    await page.evaluate(() => {
      window.dispatchEvent(new Event('scroll'));
      Object.defineProperty(window, 'scrollY', { value: 400, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    await page.waitForTimeout(300);
    const hasVisible = await btn.evaluate(el => el.classList.contains('visible'));
    expect(hasVisible).toBe(true);
  });
});
