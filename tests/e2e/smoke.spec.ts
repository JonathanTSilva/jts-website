import { test, expect } from '@playwright/test';

test('harness is functional', async () => {
  expect(true).toBe(true);
});

test('pt-br privacy policy page loads', async ({ page }) => {
  const response = await page.goto('/pt-br/privacy');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: /Política de Privacidade/i })).toBeVisible();
});

test('pt-br terms of service page loads', async ({ page }) => {
  const response = await page.goto('/pt-br/terms');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: /Termos de Serviço/i })).toBeVisible();
});

test('OG image generates for blog post', async ({ page }) => {
  const response = await page.goto('/og/blog/2026-03-ci-firmware.en.png');
  expect(response?.status()).toBe(200);
  expect(response?.headers()['content-type']).toContain('image/png');
});

test('OG image generates for note', async ({ page }) => {
  const response = await page.goto('/og/notes/debugging-habits.en.png');
  expect(response?.status()).toBe(200);
  expect(response?.headers()['content-type']).toContain('image/png');
});

test('window.showToast fires a toast and it disappears after duration', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    (window as any).showToast({ message: 'Hello toast', variant: 'success', duration: 1000 });
  });
  await expect(page.locator('.toast-card')).toBeVisible();
  await expect(page.locator('.toast-card')).toContainText('Hello toast');
  // after 1s + animation it should be gone
  await page.waitForTimeout(1500);
  await expect(page.locator('.toast-card')).not.toBeVisible();
});
