import { test, expect } from '@playwright/test';

test.describe('Visual Regressions', () => {
  test('fixed header visual', async ({ page }) => {
    await page.goto('/');
    // Scroll to trigger fixed header background/blur
    await page.evaluate(() => window.scrollTo(0, 200));
    // Wait for scroll-triggered class to be applied
    const header = page.locator('.site-header');
    await expect(header).toHaveClass(/scrolled/);
    
    await expect(header).toHaveScreenshot('header-fixed.png');
  });

  test('footer branding visual', async ({ page }) => {
    await page.goto('/');
    // Scroll to bottom to ensure footer is in view
    const footer = page.locator('.site-footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toHaveScreenshot('footer-branding.png');
  });

  test('project card bento visual', async ({ page }) => {
    await page.goto('/portfolio');
    // Ensure at least one project card is visible
    const projectCard = page.locator('.project-card').first();
    await projectCard.waitFor();
    await expect(projectCard).toHaveScreenshot('project-card-bento.png');
  });

  test('404 glitch hero visual', async ({ page }) => {
    await page.goto('/404');
    await expect(page.locator('.error-hero')).toHaveScreenshot('404-glitch-hero.png', {
      mask: [page.locator('.trace-glitch')] // Glitch is animated
    });
  });
});
