import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('en: blog index groups posts by year and month', async ({ page }) => {
    await page.goto('/blog');
    
    // Check for year and month headings
    await expect(page.getByRole('heading', { name: '2026', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'March', level: 3 })).toBeVisible();
    
    // Check for specific post
    await expect(page.getByText('Continuous Integration for Firmware')).toBeVisible();
  });

  test('pt-br: blog index groups posts by year and month', async ({ page }) => {
    await page.goto('/pt-br/blog');
    
    // Check for year and month headings
    await expect(page.getByRole('heading', { name: '2026', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Março', level: 3 })).toBeVisible();
    
    // Check for specific post (translated or fallback)
    await expect(page.getByText('Olá Sistemas Embarcados')).toBeVisible();
  });

  test('en: blog detail page renders content', async ({ page }) => {
    await page.goto('/blog/2026-03-hello-embedded-systems.en');
    await expect(page.getByRole('heading', { name: 'Hello Embedded Systems', level: 1 })).toBeVisible();
    await expect(page.getByText(/Published on March (9|10), 2026/)).toBeVisible();
  });

  test('pt-br: blog detail page renders content', async ({ page }) => {
    await page.goto('/pt-br/blog/2026-03-hello-embedded-systems.pt-br');
    await expect(page.getByRole('heading', { name: 'Olá Sistemas Embarcados', level: 1 })).toBeVisible();
  });

  test('translation fallback notice is visible', async ({ page }) => {
    // Navigate to a post that only exists in EN while in PT-BR context
    // Actually, in our current implementation, we generate paths for all slugs.
    // If I go to /pt-br/blog/2026-03-ci-firmware.en (which is the EN slug)
    await page.goto('/pt-br/blog/2026-03-ci-firmware.en');
    await expect(page.getByText(/Este post não está disponível em Português/i)).toBeVisible();
  });

  test('RSS feed is generated', async ({ page }) => {
    const response = await page.goto('/rss.xml');
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain('<rss');
    expect(text).toContain('Continuous Integration for Firmware');
  });
});
