import { test, expect } from '@playwright/test';

test.describe('Header', () => {
  test('header brand uses Jonathan Tobias', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.logo-name')).toHaveText('Jonathan Tobias');
  });

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
    await page.waitForTimeout(200); // allow --duration-fast (150ms) transition to complete

    // After hovering, the link should have a visible background color
    const bgColor = await firstLink.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(bgColor).not.toBe('transparent');
  });

  test('search field is visible on desktop and opens dialog on click', async ({ page }) => {
    await page.goto('/');
    const searchField = page.locator('.search-field');
    await expect(searchField).toBeVisible();

    // Clicking the field should open the search dialog
    await searchField.click();
    // The search dialog uses role="dialog" when open
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 2000 });
  });

  test('search field is hidden on mobile; search icon button is shown instead', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('.search-field')).toBeHidden();
    await expect(page.locator('.search-icon-btn')).toBeVisible();
  });

  test('mobile: theme toggle is right-aligned in drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.click('#hamburger');
    const mobileActions = page.locator('.mobile-actions');
    await expect(mobileActions).toBeVisible();
    const toggleBox = await mobileActions.locator('> *').first().boundingBox();
    const viewport = page.viewportSize()!;
    // Toggle center should be in the right half of the viewport
    expect(toggleBox!.x + toggleBox!.width / 2).toBeGreaterThan(viewport.width / 2);
  });

  test('mobile: search shows icon only, opens dialog on click', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('.search-field')).toBeHidden();
    await expect(page.locator('.search-icon-btn')).toBeVisible();
    await page.click('.search-icon-btn');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('search input has readonly attribute to prevent mobile keyboard', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('.search-field input');
    await expect(input).toHaveAttribute('readonly', '');
  });

  test('hamburger shows only menu icon when closed', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const menuIcon = page.locator('#hamburger .ham-open');
    const closeIcon = page.locator('#hamburger .ham-close');

    await expect(menuIcon).toBeVisible();
    await expect(closeIcon).not.toBeVisible();
  });

  test('hamburger shows only close icon when menu is open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    await page.locator('#hamburger').click();

    const menuIcon = page.locator('#hamburger .ham-open');
    const closeIcon = page.locator('#hamburger .ham-close');

    await expect(menuIcon).not.toBeVisible();
    await expect(closeIcon).toBeVisible();
  });

  test('language switcher is not present in the header', async ({ page }) => {
    await page.goto('/');
    // The language switcher renders EN / PT links
    const headerActions = page.locator('.header-actions');
    await expect(headerActions.locator('.lang-switcher')).not.toBeVisible();

    await page.setViewportSize({ width: 375, height: 812 });
    await page.locator('#hamburger').click();
    const mobileActions = page.locator('.mobile-actions');
    await expect(mobileActions.locator('.lang-switcher')).not.toBeVisible();
  });

  test('tubelight indicator lands on correct link on PT-BR route', async ({ page }) => {
    await page.goto('/pt-br');

    // Wait until the indicator is positioned and aligned with the active link.
    // Uses waitForFunction to tolerate font/layout settling under concurrent load.
    await page.waitForFunction(() => {
      const ind = document.querySelector('.nav-indicator') as HTMLElement;
      const link = document.querySelector('.nav-list a.active') as HTMLElement;
      if (!ind || !link) return false;
      return ind.style.opacity === '1' && ind.style.left === link.offsetLeft + 'px';
    });
  });
});
