import { test, expect } from '@playwright/test';
import { readSearchIndex } from './helpers/content';
import { getNoteAccentColor } from '../../src/lib/notes';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

// Index tests read the real notes (never fixtures); detail-page tests use the fixtures.
const liveNotes = readSearchIndex('en').filter((i) => i.type === 'notes');
const NO_NOTES = 'no live English note in the build';

/** `#rrggbb` to the `rgb(r, g, b)` string getComputedStyle returns. */
function hexToRgb(hex: string): string | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = Number.parseInt(m[1]!, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

/** Accent color every live English note card should show, from the real frontmatter. */
function expectedCardColors(): string[] {
  const dir = path.join(process.cwd(), 'src/content/notes');
  const colors = new Set<string>();
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (data.language !== 'en') continue;
    const rgb = hexToRgb(getNoteAccentColor(data.colorToken, data.category));
    if (rgb) colors.add(rgb);
  }
  return [...colors];
}

test.describe('Notes', () => {
  test('en: notes index and filtering', async ({ page }) => {
    test.skip(liveNotes.length === 0, NO_NOTES);
    await page.goto('/notes');

    await expect(page.getByRole('heading', { name: 'Notes', level: 1 })).toBeVisible();

    // Check for filters
    await expect(page.getByText('Categories')).toBeVisible();
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();

    // The newest real note has a card (titles come from the build, not from this file)
    await expect(page.locator('.note-card').getByText(liveNotes[0]!.title, { exact: true }).first()).toBeVisible();
  });

  test('search dialog functions correctly', async ({ page, request }) => {
    // Derive a search term from the actual index so the test is content-agnostic
    const indexRes = await request.get('/api/en/search-index.json');
    const items: Array<{ title: string }> = await indexRes.json();
    const searchTerm = items[0]?.title.split(' ')[0] ?? 'blog';

    await page.goto('/');

    // Open search with shortcut
    await page.keyboard.press('/');
    await expect(page.getByRole('dialog')).toBeVisible();

    const input = page.getByPlaceholder('Search blog and notes...');
    await input.fill(searchTerm);

    // Wait for at least one result
    await expect(page.getByRole('dialog').locator('.search-result-item').first()).toBeVisible();

    // Close search
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('notes cards have colorToken border and tag pills', async ({ page }) => {
    test.skip(liveNotes.length === 0, NO_NOTES);
    await page.goto('/notes');
    const card = page.locator('.note-card').first();
    await expect(card).toBeVisible();
    // Filter pills should be present
    const filterPill = page.locator('.filter-item').first();
    await expect(filterPill).toBeVisible();
  });

  test('search dialog focus trapping and keyboard navigation', async ({ page, request }) => {
    const indexRes = await request.get('/api/en/search-index.json');
    const items: Array<{ title: string }> = await indexRes.json();
    const searchTerm = items[0]?.title.split(' ')[0] ?? 'blog';

    await page.goto('/');

    // Open search
    await page.keyboard.press('/');
    await expect(page.getByRole('dialog')).toBeVisible();

    // Input should be focused
    const input = page.getByPlaceholder('Search blog and notes...');
    await expect(input).toBeFocused();

    // Fill something to get results
    await input.fill(searchTerm);
    await expect(page.getByRole('dialog').locator('.search-result-item').first()).toBeVisible();

    // Tab through elements
    await page.keyboard.press('Tab'); // Should go to close button
    const closeBtn = page.getByRole('button', { name: /close/i });
    await expect(closeBtn).toBeFocused();

    await page.keyboard.press('Tab'); // Should go to the first result link
    const firstResult = page.getByRole('dialog').getByRole('link').first();
    await expect(firstResult).toBeFocused();

    // Shift+Tab back to close button
    await page.keyboard.press('Shift+Tab');
    await expect(closeBtn).toBeFocused();

    // Shift+Tab back to input
    await page.keyboard.press('Shift+Tab');
    await expect(input).toBeFocused();

    // Shift+Tab should wrap to the last element (which should be the last result link or the close button if no results)
    await page.keyboard.press('Shift+Tab');
    const lastResult = page.getByRole('dialog').getByRole('link').last();
    await expect(lastResult).toBeFocused();
  });

  test('notes category buttons have badge counts', async ({ page }) => {
    test.skip(liveNotes.length === 0, NO_NOTES);
    await page.goto('/notes');
    const badge = page.locator('.filter-item .item-count').first();
    await expect(badge).toBeVisible();
    const text = await badge.textContent();
    expect(Number(text?.trim())).toBeGreaterThan(0);
  });

  test('notes index cards reflect category color', async ({ page }) => {
    test.skip(liveNotes.length === 0, NO_NOTES);
    await page.goto('/notes');
    const cards = page.locator('.note-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Expected accent colors come from the real notes' frontmatter (colorToken, else category).
    const expectedColors = expectedCardColors();
    test.skip(expectedColors.length === 0, 'no note accent color is a plain #rrggbb value');

    let foundCategoryColor = false;
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const borderTop = await card.evaluate((el) => window.getComputedStyle(el).borderTopColor);
      if (expectedColors.includes(borderTop)) {
        foundCategoryColor = true;
        break;
      }
    }
    expect(foundCategoryColor).toBe(true);
  });

  test('note page: has back to notes button', async ({ page }) => {
    await page.goto('/test-fixtures/notes/fixture-note');
    await expect(page.locator('.back-link')).toBeVisible();
    await expect(page.locator('.back-link')).toContainText('Back to notes');
  });

  test('note page: has share buttons', async ({ page }) => {
    await page.goto('/test-fixtures/notes/fixture-note');
    await expect(page.locator('.share-buttons')).toBeVisible();
  });

  test('notes RSS feed uses canonical www domain', async ({ page }) => {
    const response = await page.goto('/notes/rss.xml');
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain('<rss');
    expect(text).toContain('https://www.jontobias.com');
  });

  test('en: notes index has link to blog section', async ({ page }) => {
    await page.goto('/notes');
    await expect(page.locator('a.cross-section-nav[href="/blog"]')).toBeVisible();
  });

  test('pt-br: notes index has link to blog section', async ({ page }) => {
    await page.goto('/pt-br/notes');
    await expect(page.locator('a.cross-section-nav[href="/pt-br/blog"]')).toBeVisible();
  });

  test('book note: renders cover image and metadata', async ({ page }) => {
    await page.goto('/test-fixtures/notes/fixture-book');
    await expect(page.locator('.book-cover')).toBeVisible();
    await expect(page.locator('.book-author')).toBeVisible();
    await expect(page.locator('.book-rating')).toBeVisible();
    await expect(page.locator('.book-status')).toBeVisible();
  });

  test('mindmap note: renders mindmap-tree element with root node', async ({ page }) => {
    await page.goto('/test-fixtures/notes/fixture-mindmap');
    await expect(page.locator('.mindmap-tree')).toBeVisible();
    const root = page.locator('.mindmap-root .mindmap-label').first();
    await expect(root).toBeVisible();
    await expect(root).toContainText('Note System');
  });

  test('whiteboard note: applies whiteboard canvas and Patrick Hand font', async ({ page }) => {
    await page.goto('/test-fixtures/notes/fixture-whiteboard');
    await expect(page.locator('[data-whiteboard]')).toBeVisible();
    await expect(page.locator('.whiteboard-columns')).toBeVisible();
    const fontFamily = await page.locator('.whiteboard-columns').evaluate(
      el => window.getComputedStyle(el).fontFamily
    );
    expect(fontFamily).toContain('Patrick Hand');
  });

  test('book note card: shows author and status metadata in index', async ({ page }) => {
    await page.goto('/notes');
    const bookCard = page.locator('.book-note-card').first();
    test.skip((await bookCard.count()) === 0, 'no book note in the real content');
    await expect(bookCard).toBeVisible();
    await expect(bookCard.locator('.book-author')).toBeVisible();
    await expect(bookCard.locator('.book-status')).toBeVisible();
  });

  test('mindmap card: shows type badge in index', async ({ page }) => {
    await page.goto('/notes');
    const mindmapCard = page.locator('.mindmap-note-card').first();
    test.skip((await mindmapCard.count()) === 0, 'no mindmap note in the real content');
    await expect(mindmapCard).toBeVisible();
    await expect(mindmapCard.locator('.type-badge')).toBeVisible();
  });
});
