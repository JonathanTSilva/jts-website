import { test, expect } from '@playwright/test';

async function getJsonLdTypes(page: import('@playwright/test').Page): Promise<string[]> {
  const scripts = await page.locator('script[type="application/ld+json"]').all();
  const jsonLd = await Promise.all(scripts.map(s => s.textContent()));
  return jsonLd.map(j => JSON.parse(j!)).map(d => d['@type']);
}

test.describe('Structured Data (JSON-LD)', () => {
  test('homepage (/) has WebSite JSON-LD', async ({ page }) => {
    await page.goto('/');
    const types = await getJsonLdTypes(page);
    expect(types).toContain('WebSite');
  });

  test('homepage (/) has Person JSON-LD', async ({ page }) => {
    await page.goto('/');
    const types = await getJsonLdTypes(page);
    expect(types).toContain('Person');
  });

  test('blog post page has BlogPosting JSON-LD', async ({ page }) => {
    await page.goto('/blog');
    const firstLink = page.locator('a.blog-entry').first();
    const href = await firstLink.getAttribute('href');
    await page.goto(href!);

    const types = await getJsonLdTypes(page);
    expect(types).toContain('BlogPosting');
  });

  test('pt-br homepage (/pt-br) has WebSite JSON-LD', async ({ page }) => {
    await page.goto('/pt-br');
    const types = await getJsonLdTypes(page);
    expect(types).toContain('WebSite');
  });
});
