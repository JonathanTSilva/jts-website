import { test, expect } from '@playwright/test';

test('harness is functional', async () => {
  expect(true).toBe(true);
});

test('pt-br privacy policy page loads', async ({ page }) => {
  const response = await page.goto('/pt-br/privacy');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: /Política de Privacidade/i })).toBeVisible();
});

test('pt-br home page loads', async ({ page }) => {
  await page.goto('/pt-br/');
  await expect(page.getByRole('heading', { name: 'Tobias', level: 1 })).toBeVisible();
});
