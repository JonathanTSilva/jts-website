import { test, expect } from '@playwright/test';

test.describe('Now page', () => {
  test('now page renders current focus content', async ({ page }) => {
    await page.goto('/now');
    await expect(page.getByRole('heading', { name: 'Now', level: 1, exact: true })).toBeVisible();
    // Check for specific content fragments to be more robust
    await expect(page.locator('.prose')).toContainText('Schneider Electric');
    await expect(page.locator('.prose')).toContainText('industrial connectivity');
  });

  test('pt-br: now page renders translated content', async ({ page }) => {
    await page.goto('/pt-br/now');
    await expect(page.getByRole('heading', { name: 'Agora', level: 1, exact: true })).toBeVisible();
    await expect(page.locator('.prose')).toContainText('Schneider Electric');
    await expect(page.locator('.prose')).toContainText('conectividade industrial');
  });

  test('now page has status badge and prose class', async ({ page }) => {
    await page.goto('/now');
    // Updated class name from status-badge to now-status
    await expect(page.locator('.now-status')).toBeVisible();
    await expect(page.locator('.prose')).toBeVisible();
  });
});
