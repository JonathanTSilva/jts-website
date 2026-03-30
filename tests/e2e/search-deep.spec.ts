import { test, expect } from '@playwright/test';

test.describe('Deep Search & Behavioral Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('search result selection and keyboard nav', async ({ page }) => {
    // Open search dialog
    await page.keyboard.press('/');
    const dialog = page.locator('#search-dialog');
    await expect(dialog).toBeVisible();
    
    const input = page.locator('#search-input');
    await input.fill('TEST');

    // Wait for results to appear
    const results = page.locator('#search-results');
    const firstResult = results.locator('.search-result-item').first();
    await expect(firstResult).toBeVisible();

    // Navigate via keyboard
    // Initial focus is on input. Pressing ArrowDown should highlight the first result.
    await page.keyboard.press('ArrowDown');

    // We expect the first result to have an 'active' class or be focused
    // Looking at SearchDialog.astro, it has a .search-result-item.active style
    await expect(firstResult).toHaveClass(/active/);

    // Press Enter to navigate
    await page.keyboard.press('Enter');

    // Should navigate to the blog post
    await expect(page).toHaveURL(/\/blog\/2026-03-everything-starts-here/);
  });

  test('no results found UI', async ({ page }) => {
    await page.keyboard.press('/');
    const input = page.locator('#search-input');
    await input.fill('NonExistentTermXYZ');
    
    const noResults = page.locator('.no-results');
    await expect(noResults).toBeVisible();
    // Check for text in either language (since it's a bilingual site)
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

  test('search locale isolation - EN', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('/');
    const input = page.locator('#search-input');
    await input.fill('Embedded');
    
    const results = page.locator('.search-result-item');
    await expect(results.first()).toBeVisible();
    
    const count = await results.count();
    for (let i = 0; i < count; i++) {
       const url = await results.nth(i).getAttribute('href');
       expect(url).not.toContain('/pt-br/');
    }
  });

  test('search locale isolation - PT-BR', async ({ page }) => {
    await page.goto('/pt-br');
    await page.keyboard.press('/');
    const input = page.locator('#search-input');
    await input.fill('TESTE');

    const results = page.locator('.search-result-item');
    await expect(results.first()).toBeVisible();
    
    const count = await results.count();
    for (let i = 0; i < count; i++) {
       const url = await results.nth(i).getAttribute('href');
       expect(url).toContain('/pt-br/');
    }
  });
});
