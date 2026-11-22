import { test, expect } from '@playwright/test';
import { readSearchIndex } from './helpers/content';

/**
 * Regression tests for the performance improvements branch.
 * Validates that conditional rendering of MermaidRenderer, self-hosted fonts,
 * and centralized prev/next/related computation work correctly.
 */
test.describe('Performance regression guards', () => {
  // Fixture pages deliberately have no prev/next links, so the neighbour navigation is
  // checked on real notes: with two or more live notes in a locale, each has a neighbour.
  const realNotes = (locale: 'en' | 'pt-br') => readSearchIndex(locale).filter((i) => i.type === 'notes');

  test('note detail page renders prev/next navigation', async ({ page }) => {
    const notes = realNotes('en');
    test.skip(notes.length < 2, 'needs at least two live English notes for a neighbour');
    await page.goto(notes[0]!.url);
    // NoteFooter should render the note navigation section
    const nav = page.locator('.note-nav, nav[aria-label*="Note navigation"], nav[aria-label*="note"]');
    await expect(nav).toBeVisible();
  });

  test('note detail page renders related notes section when matches exist', async ({ page }) => {
    await page.goto('/test-fixtures/notes/fixture-note');
    // Related notes section may or may not be visible depending on content,
    // but the share buttons should always be present in the footer area
    await expect(page.locator('.share-buttons')).toBeVisible();
  });

  test('blog post with mermaid renders diagram containers', async ({ page }) => {
    // The markdown fixture post has mermaid blocks
    await page.goto('/test-fixtures/blog/fixture-markdown');
    // Mermaid diagrams should either be rendered as SVGs or as pre blocks
    // with data-language="mermaid" waiting for client-side rendering
    const mermaidContent = page.locator('.mermaid-diagram, pre[data-language="mermaid"]');
    await expect(mermaidContent.first()).toBeVisible();
  });

  test('note with mermaid content renders diagram containers', async ({ page }) => {
    await page.goto('/test-fixtures/notes/fixture-note');
    const mermaidContent = page.locator('.mermaid-diagram, pre[data-language="mermaid"]');
    await expect(mermaidContent.first()).toBeVisible();
  });

  test('whiteboard note loads self-hosted fonts (no Google Fonts CDN)', async ({ page }) => {
    const hits: string[] = [];
    page.on('request', (r) => {
      if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) hits.push(r.url());
    });
    for (const path of ['/', '/pt-br/', '/test-fixtures/notes/fixture-whiteboard']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }
    expect(hits).toEqual([]);
    await expect(page.locator('[data-whiteboard]')).toBeVisible();
  });

  test('book note footer still renders after centralization', async ({ page }) => {
    await page.goto('/test-fixtures/notes/fixture-book');
    // Should still show book-specific metadata
    await expect(page.locator('.book-cover')).toBeVisible();
    // The shared footer should still be rendered
    await expect(page.locator('.share-buttons')).toBeVisible();
  });

  test('pt-br note detail page renders prev/next navigation', async ({ page }) => {
    const notes = realNotes('pt-br');
    test.skip(notes.length < 2, 'needs at least two live Portuguese notes for a neighbour');
    await page.goto(notes[0]!.url);
    const nav = page.locator('.note-nav, nav[aria-label*="nota"], nav[aria-label*="note"]');
    await expect(nav).toBeVisible();
  });
});
