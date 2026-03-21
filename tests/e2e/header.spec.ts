import { test, expect } from '@playwright/test';

test.describe('Header', () => {
  test('header is fixed at top and content is not hidden beneath it', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('#site-header');

    // Get header top position before scrolling
    const topBefore = await header.evaluate(el => el.getBoundingClientRect().top);

    // Scroll down significantly
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(100); // allow scroll to settle

    // Header top should still be at (or very near) 0 — it is fixed
    const topAfter = await header.evaluate(el => el.getBoundingClientRect().top);
    expect(topAfter).toBeCloseTo(topBefore, 0);
    expect(topAfter).toBeLessThanOrEqual(1); // within 1px of top

    // Verify content is not hidden under the header
    const wrapper = page.locator('.site-wrapper');
    const paddingTop = await wrapper.evaluate(el =>
      parseInt(window.getComputedStyle(el).paddingTop)
    );
    expect(paddingTop).toBeGreaterThan(0);
  });

  test('header inner content is constrained by container-max', async ({ page }) => {
    await page.goto('/');
    const inner = page.locator('.header-inner');
    // Verify max-width is set (any non-'none' value from the token is acceptable)
    const maxWidth = await inner.evaluate(el =>
      window.getComputedStyle(el).maxWidth
    );
    expect(maxWidth).not.toBe('none');
    // At viewport wider than 52rem, inner should not fill the full viewport
    await page.setViewportSize({ width: 1400, height: 800 });
    const innerBox = await inner.boundingBox();
    expect(innerBox!.width).toBeLessThan(1400);
  });
});
