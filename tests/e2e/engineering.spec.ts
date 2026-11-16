import { test, expect } from '@playwright/test';

test.describe('Engineering page', () => {
  test('en: renders summary tiles, handbook link and an accessible table', async ({ page }) => {
    await page.goto('/engineering');
    await expect(page.getByRole('heading', { name: 'Engineering', level: 1, exact: true })).toBeVisible();
    await expect(page.locator('.tile')).toHaveCount(2);
    await expect(page.locator('.tile').first()).toContainText('Repos on standard');
    await expect(page.locator('.tile').nth(1)).toContainText('CI green');
    await expect(page.locator('a[href="https://github.com/JonathanTSilva/.github/tree/main/handbook"]')).toBeVisible();

    await expect(page.getByRole('columnheader')).toHaveCount(7);
    const link = page.getByRole('link', { name: 'jts-website', exact: true });
    await expect(link).toHaveAttribute('href', 'https://github.com/JonathanTSilva/jts-website');
  });

  test('every badge image has alt text and points to a known badge host', async ({ page }) => {
    await page.goto('/engineering');
    const imgs = page.locator('.eng-table img');
    const count = await imgs.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const img = imgs.nth(i);
      await expect(img).toHaveAttribute('alt', /\S/);
      await expect(img).toHaveAttribute('src', /^https:\/\/(img\.shields\.io|codecov\.io|sonarcloud\.io)\//);
    }
  });

  test('pt-br: renders the translated page', async ({ page }) => {
    await page.goto('/pt-br/engineering');
    await expect(page.getByRole('heading', { name: 'Engenharia', level: 1, exact: true })).toBeVisible();
    await expect(page.locator('.tile').first()).toContainText('Repos no padrão');
    await expect(page.getByRole('columnheader', { name: 'Cobertura' })).toBeVisible();
  });

  test('footer links to the engineering page in both locales', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.site-footer a[href="/engineering"]')).toBeVisible();
    await page.goto('/pt-br');
    await expect(page.locator('.site-footer a[href="/pt-br/engineering"]')).toBeVisible();
  });
});
