import { test, expect } from '@playwright/test';

test('harness is functional', async () => {
  expect(true).toBe(true);
});

test('pt-br privacy policy page loads', async ({ page }) => {
  const response = await page.goto('/pt-br/privacy');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: /Política de Privacidade/i })).toBeVisible();
  await expect(page.getByText(/data de vigência: 31 de março de 2026/i)).toBeVisible();
});

test('english legal pages load with production copy', async ({ page }) => {
  const privacyResponse = await page.goto('/privacy');
  expect(privacyResponse?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: /Privacy Policy/i })).toBeVisible();
  await expect(page.getByText(/Effective date: March 31, 2026/i)).toBeVisible();

  const termsResponse = await page.goto('/terms');
  expect(termsResponse?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: /Terms of Service/i })).toBeVisible();
  await expect(page.getByText(/Effective date: March 31, 2026/i)).toBeVisible();
});

test('pt-br home page loads', async ({ page }) => {
  await page.goto('/pt-br/');
  await expect(page.getByRole('heading', { name: 'Tobias', level: 1 })).toBeVisible();
});
