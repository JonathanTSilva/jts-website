import { test, expect } from '@playwright/test';

test.describe('Notes', () => {
  test('en: notes index and filtering', async ({ page }) => {
    await page.goto('/notes');
    
    await expect(page.getByRole('heading', { name: 'Notes', level: 1 })).toBeVisible();
    
    // Check for filters
    await expect(page.getByText('Categories')).toBeVisible();
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    
    // Check for specific note card
    await expect(page.getByText('Debugging Habits')).toBeVisible();
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
    await page.goto('/notes');
    const badge = page.locator('.filter-item .item-count').first();
    await expect(badge).toBeVisible();
    const text = await badge.textContent();
    expect(Number(text?.trim())).toBeGreaterThan(0);
  });

    test('notes index cards reflect category color', async ({ page }) => {
    await page.goto('/notes');
    const cards = page.locator('.note-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    const expectedColors = [
      'rgb(30, 58, 138)', // Blue 900
      'rgb(6, 78, 59)',   // Green 900
      'rgb(120, 53, 15)'  // Amber 900
    ];

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
    await page.goto('/notes/debugging-habits.en');
    await expect(page.locator('.back-link')).toBeVisible();
    await expect(page.locator('.back-link')).toContainText('Back to notes');
  });

  test('note page: has share buttons', async ({ page }) => {
    await page.goto('/notes/debugging-habits.en');
    await expect(page.locator('.share-buttons')).toBeVisible();
  });

  test('notes RSS feed uses canonical www domain', async ({ page }) => {
    const response = await page.goto('/notes/rss.xml');
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain('<rss');
    expect(text).toContain('https://www.jontobias.com');
  });
});
