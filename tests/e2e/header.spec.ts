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

  test('tubelight indicator does not move on hover', async ({ page }) => {
    await page.goto('/');
    const indicator = page.locator('.nav-indicator');

    // Get initial position on page load
    const initialLeft = await indicator.evaluate(el =>
      (el as HTMLElement).style.left
    );

    // Hover a non-active link
    const links = page.locator('.nav-list a');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const isActive = await link.evaluate(el => el.classList.contains('active'));
      if (!isActive) {
        await link.hover();
        break;
      }
    }

    const afterHoverLeft = await indicator.evaluate(el =>
      (el as HTMLElement).style.left
    );
    expect(afterHoverLeft).toBe(initialLeft);
  });

  test('nav links show hover background pill (CSS only)', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('.nav-list a');
    const firstLink = links.first();
    await firstLink.hover();
    const hasHoverTransition = await firstLink.evaluate(el =>
      window.getComputedStyle(el).transition.includes('background')
    );
    expect(hasHoverTransition).toBe(true);

    // After hovering, the link should have a visible background color
    const bgColor = await firstLink.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(bgColor).not.toBe('transparent');
  });

  test('tubelight indicator lands on correct link on PT-BR route', async ({ page }) => {
    await page.goto('/pt-br');
    const indicator = page.locator('.nav-indicator');
    const activeLink = page.locator('.nav-list a.active');

    // Indicator must be visible (opacity: 1 set via JS)
    const opacity = await indicator.evaluate(el =>
      (el as HTMLElement).style.opacity
    );
    expect(opacity).toBe('1');

    // Indicator left position must match the active link's offset
    const indicatorLeft = await indicator.evaluate(el =>
      (el as HTMLElement).style.left
    );
    const activeLinkLeft = await activeLink.evaluate(el =>
      (el as HTMLElement).offsetLeft + 'px'
    );
    expect(indicatorLeft).toBe(activeLinkLeft);
  });
});
