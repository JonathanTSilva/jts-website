import { test, expect } from '@playwright/test';

test.describe('Deep Search & Behavioral Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('search result selection and keyboard nav', async ({ page, request }) => {
    // Derive search term from the live index so the test is content-agnostic
    const indexRes = await request.get('/api/en/search-index.json');
    const items: Array<{ title: string }> = await indexRes.json();
    const searchTerm = items[0]?.title.split(' ')[0] ?? 'blog';

    // Open search dialog
    await page.keyboard.press('/');
    const dialog = page.locator('#search-dialog');
    await expect(dialog).toBeVisible();

    const input = page.locator('#search-input');
    await input.fill(searchTerm);

    // Wait for results to appear
    const results = page.locator('#search-results');
    const firstResult = results.locator('.search-result-item').first();
    await expect(firstResult).toBeVisible();

    // Navigate via keyboard
    await page.keyboard.press('ArrowDown');
    await expect(firstResult).toHaveClass(/active/);

    // Press Enter — should navigate to some blog or notes page
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/(blog|notes)\//);
  });

  test('no results found UI', async ({ page }) => {
    await page.keyboard.press('/');
    const input = page.locator('#search-input');
    await input.fill('NonExistentTermXYZ');

    const noResults = page.locator('.no-results');
    await expect(noResults).toBeVisible();
    const text = await noResults.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });

  test('escape to close', async ({ page }) => {
    await page.keyboard.press('/');
    const dialog = page.locator('#search-dialog');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('search locale isolation - EN', async ({ page, request }) => {
    const indexRes = await request.get('/api/en/search-index.json');
    const items: Array<{ title: string }> = await indexRes.json();
    const searchTerm = items[0]?.title.split(' ')[0] ?? 'blog';

    await page.goto('/');
    await page.keyboard.press('/');
    const input = page.locator('#search-input');
    await input.fill(searchTerm);

    const results = page.locator('.search-result-item');
    await expect(results.first()).toBeVisible();

    const count = await results.count();
    for (let i = 0; i < count; i++) {
      const url = await results.nth(i).getAttribute('href');
      expect(url).not.toContain('/pt-br/');
    }
  });

  test('search locale isolation - PT-BR', async ({ page, request }) => {
    const indexRes = await request.get('/api/pt-br/search-index.json');
    const items: Array<{ title: string }> = await indexRes.json();
    const searchTerm = items[0]?.title.split(' ')[0] ?? 'blog';

    await page.goto('/pt-br');
    await page.keyboard.press('/');
    const input = page.locator('#search-input');
    await input.fill(searchTerm);

    const results = page.locator('.search-result-item');
    await expect(results.first()).toBeVisible();

    const count = await results.count();
    for (let i = 0; i < count; i++) {
      const url = await results.nth(i).getAttribute('href');
      expect(url).toContain('/pt-br/');
    }
  });
});
