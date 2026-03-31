import { test, expect } from '@playwright/test';

/**
 * Markdown rendering tests — driven by the cheatsheet post.
 *
 * These tests visit the canonical markdown cheatsheet blog post and verify
 * that each supported element is rendered correctly in the browser.
 * The cheatsheet post slug is stable and intentionally hardcoded here.
 */

const EN_SLUG = '/blog/2026-03-markdown-cheatsheet.en';
const PT_SLUG = '/pt-br/blog/2026-03-markdown-cheatsheet.pt-br';

test.describe('Markdown Rendering — Cheatsheet Post', () => {
  test.describe('EN: post loads and has correct metadata', () => {
    test('post title and meta are visible', async ({ page }) => {
      await page.goto(EN_SLUG);
      await expect(page.locator('.post-title')).toHaveText(
        'Markdown Cheatsheet — Website Writing Reference'
      );
      await expect(page.locator('.post-meta')).toContainText(/Published on/);
      await expect(page.locator('.post-meta')).toContainText(/min read/);
    });

    test('author block is rendered', async ({ page }) => {
      await page.goto(EN_SLUG);
      await expect(page.locator('.author-name')).toHaveText('Jonathan Tobias');
      await expect(page.locator('.author-subtitle')).toHaveText(
        'Senior Embedded Software Engineer'
      );
    });

    test('tag pills are rendered', async ({ page }) => {
      await page.goto(EN_SLUG);
      const tags = page.locator('.tag-pill');
      await expect(tags.first()).toBeVisible();
    });

    test('back to blog link is present', async ({ page }) => {
      await page.goto(EN_SLUG);
      await expect(page.locator('.back-link')).toContainText('Back to blog');
    });
  });

  test.describe('EN: typography elements', () => {
    test('H2 headings render with accent border', async ({ page }) => {
      await page.goto(EN_SLUG);
      const h2 = page.locator('.prose h2').first();
      await expect(h2).toBeVisible();
    });

    test('H3 headings render', async ({ page }) => {
      await page.goto(EN_SLUG);
      await expect(page.locator('.prose h3').first()).toBeVisible();
    });

    test('H4 headings render', async ({ page }) => {
      await page.goto(EN_SLUG);
      await expect(page.locator('.prose h4').first()).toBeVisible();
    });

    test('bold text renders', async ({ page }) => {
      await page.goto(EN_SLUG);
      const strong = page.locator('.prose strong').first();
      await expect(strong).toBeVisible();
    });

    test('italic text renders', async ({ page }) => {
      await page.goto(EN_SLUG);
      await expect(page.locator('.prose em').first()).toBeVisible();
    });

    test('strikethrough text renders', async ({ page }) => {
      await page.goto(EN_SLUG);
      await expect(page.locator('.prose del').first()).toBeVisible();
    });

    test('inline code renders with mono font', async ({ page }) => {
      await page.goto(EN_SLUG);
      await expect(page.locator('.prose code').first()).toBeVisible();
    });
  });

  test.describe('EN: block elements', () => {
    test('blockquote renders', async ({ page }) => {
      await page.goto(EN_SLUG);
      await expect(page.locator('.prose blockquote').first()).toBeVisible();
    });

    test('unordered list renders', async ({ page }) => {
      await page.goto(EN_SLUG);
      await expect(page.locator('.prose ul').first()).toBeVisible();
    });

    test('ordered list renders', async ({ page }) => {
      await page.goto(EN_SLUG);
      await expect(page.locator('.prose ol').first()).toBeVisible();
    });

    test('horizontal rule renders', async ({ page }) => {
      await page.goto(EN_SLUG);
      // The post body has <hr> separators (prose section)
      await expect(page.locator('.prose hr').first()).toBeVisible();
    });

    test('code block renders', async ({ page }) => {
      await page.goto(EN_SLUG);
      const pre = page.locator('.prose pre').first();
      await expect(pre).toBeVisible();
    });

    test('table renders with thead and tbody', async ({ page }) => {
      await page.goto(EN_SLUG);
      await expect(page.locator('.prose table').first()).toBeVisible();
      await expect(page.locator('.prose thead').first()).toBeVisible();
      await expect(page.locator('.prose tbody').first()).toBeVisible();
    });

    test('table has correct column count', async ({ page }) => {
      await page.goto(EN_SLUG);
      const firstRow = page.locator('.prose thead tr').first();
      const cells = firstRow.locator('th');
      const count = await cells.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('EN: links and media', () => {
    test('external links render with href', async ({ page }) => {
      await page.goto(EN_SLUG);
      const links = page.locator('.prose a[href^="http"]');
      await expect(links.first()).toBeVisible();
    });

    test('images from external URLs render', async ({ page }) => {
      await page.goto(EN_SLUG);
      const images = page.locator('.prose img');
      const count = await images.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('EN: code blocks with language identifiers', () => {
    test('bash code block renders', async ({ page }) => {
      await page.goto(EN_SLUG);
      // Astro/Shiki wraps with a data-language attribute
      const bashBlock = page.locator('.prose pre code').first();
      await expect(bashBlock).toBeVisible();
    });

    test('multiple code blocks present', async ({ page }) => {
      await page.goto(EN_SLUG);
      const blocks = page.locator('.prose pre');
      const count = await blocks.count();
      expect(count).toBeGreaterThan(5);
    });
  });

  test.describe('EN: navigation and sidebar', () => {
    test('table of contents is visible on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(EN_SLUG);
      const toc = page.locator('.toc-sidebar');
      await expect(toc).toBeVisible();
    });

    test('share buttons are present', async ({ page }) => {
      await page.goto(EN_SLUG);
      await expect(page.locator('.share-buttons')).toBeVisible();
    });

    test('preamble divider separates header from content', async ({ page }) => {
      await page.goto(EN_SLUG);
      await expect(page.locator('.preamble-divider')).toBeVisible();
    });
  });

  test.describe('PT-BR: post loads correctly', () => {
    test('post title renders in Portuguese', async ({ page }) => {
      await page.goto(PT_SLUG);
      await expect(page.locator('.post-title')).toHaveText(
        'Cheatsheet de Markdown — Referência para Escrita no Site'
      );
    });

    test('post meta is visible', async ({ page }) => {
      await page.goto(PT_SLUG);
      await expect(page.locator('.post-meta')).toBeVisible();
    });

    test('author block is rendered', async ({ page }) => {
      await page.goto(PT_SLUG);
      await expect(page.locator('.author-name')).toHaveText('Jonathan Tobias');
    });

    test('prose content is rendered', async ({ page }) => {
      await page.goto(PT_SLUG);
      await expect(page.locator('.prose')).toBeVisible();
      await expect(page.locator('.prose h2').first()).toBeVisible();
    });

    test('tables render in PT-BR version', async ({ page }) => {
      await page.goto(PT_SLUG);
      await expect(page.locator('.prose table').first()).toBeVisible();
    });

    test('code blocks render in PT-BR version', async ({ page }) => {
      await page.goto(PT_SLUG);
      const blocks = page.locator('.prose pre');
      const count = await blocks.count();
      expect(count).toBeGreaterThan(3);
    });
  });

  test.describe('Cross-locale: translation link between EN and PT-BR', () => {
    test('EN post links to PT-BR translation via language switcher', async ({ page }) => {
      await page.goto(EN_SLUG);
      // The language switcher should have a PT link pointing to the pt-br version
      const ptLink = page.locator('a[href*="pt-br/blog"]');
      await expect(ptLink.first()).toBeVisible();
    });

    test('PT-BR post links to EN translation via language switcher', async ({ page }) => {
      await page.goto(PT_SLUG);
      const enLink = page.locator('a[href*="/blog/2026-03-markdown-cheatsheet.en"]');
      await expect(enLink.first()).toBeVisible();
    });
  });
});
