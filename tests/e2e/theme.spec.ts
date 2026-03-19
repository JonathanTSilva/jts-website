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
    const toggle = page.getByRole('button', { name: /toggle theme/i });
    const html = page.locator('html');

    const initialTheme = await html.getAttribute('data-theme');
    const targetTheme = initialTheme === 'light' ? 'dark' : 'light';

    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', targetTheme);

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', targetTheme);
  });

  test('theme toggle is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /toggle theme/i });
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
