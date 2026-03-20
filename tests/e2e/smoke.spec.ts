import { test, expect } from '@playwright/test';

test('harness is functional', async () => {
  expect(true).toBe(true);
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
