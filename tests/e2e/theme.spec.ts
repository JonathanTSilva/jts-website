import { test, expect } from '@playwright/test';

test.describe('Theme management', () => {
  test('initializes with light theme by default (or system preference)', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const theme = await html.getAttribute('data-theme');
    expect(['light', 'dark']).toContain(theme);
  });

  test('toggles theme and persists choice', async ({ page }) => {
    await page.goto('/');
    const isMobile = (page.viewportSize()?.width || 0) < 1024;
    if (isMobile) {
      await page.click('#hamburger');
      await page.waitForSelector('#mobile-nav', { state: 'visible' });
    }
    
    const toggle = isMobile ? page.locator('.mobile-actions .theme-toggle') : page.locator('.header-actions .theme-toggle');
    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');
    const targetTheme = initialTheme === 'light' ? 'dark' : 'light';

    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', targetTheme);

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', targetTheme);
  });
});
