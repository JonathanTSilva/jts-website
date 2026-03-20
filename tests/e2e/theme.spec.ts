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
    const toggle = page.locator('.theme-toggle').first();
    const html = page.locator('html');

    const initialTheme = await html.getAttribute('data-theme');
    const targetTheme = initialTheme === 'light' ? 'dark' : 'light';

    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', targetTheme);

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', targetTheme);
  });

  test('theme toggle pill switches theme and persists on reload', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('.theme-toggle').first();
    await expect(toggle).toBeVisible();
    // get initial theme
    const initialTheme = await page.locator('html').getAttribute('data-theme');
    await toggle.click();
    const newTheme = await page.locator('html').getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
    // persists
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', newTheme!);
  });

  test('theme toggle is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('.theme-toggle').first();
    const html = page.locator('html');
    
    await page.keyboard.press('Tab');
    let focused = false;
    for (let i = 0; i < 15; i++) {
      const isFocused = await toggle.evaluate((el) => document.activeElement === el);
      if (isFocused) {
        focused = true;
        break;
      }
      await page.keyboard.press('Tab');
    }
    
    expect(focused).toBe(true);
    
    const initialTheme = await html.getAttribute('data-theme');
    const targetTheme = initialTheme === 'light' ? 'dark' : 'light';

    await page.keyboard.press('Enter');
    await expect(html).toHaveAttribute('data-theme', targetTheme);
  });
});

test('header gains scrolled class after page scroll', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForFunction(() => document.getElementById('site-header')?.classList.contains('scrolled'));
  await expect(page.locator('.site-header')).toHaveClass(/scrolled/);
});

test('mobile drawer opens and closes via hamburger', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const hamburger = page.locator('#hamburger');
  await expect(hamburger).toHaveRole('button');
  await expect(page.locator('#mobile-nav')).not.toBeVisible();
  await hamburger.click();
  await expect(page.locator('#mobile-nav')).toBeVisible();
  await hamburger.click();
  await expect(page.locator('#mobile-nav')).not.toBeVisible();
});
