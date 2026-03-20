import { test, expect } from '@playwright/test';

test.describe('Now page', () => {
  test('now page renders current focus content', async ({ page }) => {
    await page.goto('/now');
    await expect(page.getByRole('heading', { name: 'Now', level: 1 })).toBeVisible();
    await expect(page.getByText('Currently focusing on:')).toBeVisible();
    await expect(page.getByText('Working on the personal website')).toBeVisible();
  });

  test('pt-br: now page renders translated content', async ({ page }) => {
    await page.goto('/pt-br/now');
    await expect(page.getByRole('heading', { name: 'Agora', level: 1 })).toBeVisible();
    await expect(page.getByText('Focado agora em:')).toBeVisible();
    await expect(page.getByText('Trabalhando no site pessoal')).toBeVisible();
  });

  test('now page has status badge and prose class', async ({ page }) => {
    await page.goto('/now');
    const prose = page.locator('.prose');
    await expect(prose).toBeVisible();
    const status = page.locator('.now-status');
    await expect(status).toBeVisible();
  });

});
