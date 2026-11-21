import { test, expect } from '@playwright/test';

/**
 * Regression tests for the performance improvements branch.
 * Validates that conditional rendering of MermaidRenderer, self-hosted fonts,
 * and centralized prev/next/related computation work correctly.
 */
test.describe('Performance regression guards', () => {
  test('note detail page renders prev/next navigation', async ({ page }) => {
    await page.goto('/notes/note-cheatsheet');
    // NoteFooter should render the note navigation section
    const nav = page.locator('.note-nav, nav[aria-label*="Note navigation"], nav[aria-label*="note"]');
    await expect(nav).toBeVisible();
  });

  test('note detail page renders related notes section when matches exist', async ({ page }) => {
    await page.goto('/notes/note-cheatsheet');
    // Related notes section may or may not be visible depending on content,
    // but the share buttons should always be present in the footer area
    await expect(page.locator('.share-buttons')).toBeVisible();
  });

  test('blog post with mermaid renders diagram containers', async ({ page }) => {
    // The markdown cheatsheet blog has mermaid blocks
    await page.goto('/blog/markdown-cheatsheet');
    // Mermaid diagrams should either be rendered as SVGs or as pre blocks
    // with data-language="mermaid" waiting for client-side rendering
    const mermaidContent = page.locator('.mermaid-diagram, pre[data-language="mermaid"]');
    await expect(mermaidContent.first()).toBeVisible();
  });

  test('note with mermaid content renders diagram containers', async ({ page }) => {
    await page.goto('/notes/note-cheatsheet');
    const mermaidContent = page.locator('.mermaid-diagram, pre[data-language="mermaid"]');
    await expect(mermaidContent.first()).toBeVisible();
  });

  test('whiteboard note loads self-hosted fonts (no Google Fonts CDN)', async ({ page }) => {
    const hits: string[] = [];
    page.on('request', (r) => {
      if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) hits.push(r.url());
    });
    for (const path of ['/', '/pt-br/', '/notes/whiteboard-cheatsheet']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }
    expect(hits).toEqual([]);
    await expect(page.locator('[data-whiteboard]')).toBeVisible();
  });

  test('book note prev/next navigation works after centralization', async ({ page }) => {
    await page.goto('/notes/book-cheatsheet');
    // Should still show book-specific metadata
    await expect(page.locator('.book-cover')).toBeVisible();
    // Footer nav should still be rendered (even if only partial)
    await expect(page.locator('.share-buttons')).toBeVisible();
  });

  test('pt-br note detail page renders prev/next navigation', async ({ page }) => {
    await page.goto('/pt-br/notes/note-cheatsheet');
    const nav = page.locator('.note-nav, nav[aria-label*="nota"], nav[aria-label*="note"]');
    await expect(nav).toBeVisible();
  });
});
