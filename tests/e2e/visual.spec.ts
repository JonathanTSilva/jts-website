import { test, expect } from '@playwright/test';

test.describe('Visual Regressions', () => {
  test('homepage hero visual', async ({ page }) => {
    await page.goto('/');
    // Mask the dynamic typewriter text to prevent flakiness
    await expect(page).toHaveScreenshot('home-hero.png', {
      mask: [page.locator('.typewriter-text')],
      fullPage: false
    });
  });

  test('404 glitch visual', async ({ page }) => {
    await page.goto('/404');
    await expect(page.locator('.error-hero')).toHaveScreenshot('404-glitch.png', {
      mask: [page.locator('.trace-glitch')] // Glitch is animated
    });
  });
});
