import { test, expect } from '@playwright/test';

async function getJsonLdTypes(page: import('@playwright/test').Page): Promise<string[]> {
  const scripts = await page.locator('script[type="application/ld+json"]').all();
  const jsonLd = await Promise.all(scripts.map(s => s.textContent()));
  return jsonLd.map(j => JSON.parse(j!)).map(d => d['@type']);
}

test.describe('Page metadata quality', () => {
  test('EN homepage has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Tobias | Senior Embedded Software Engineer');
  });

  test('EN homepage has non-empty meta description', async ({ page }) => {
    await page.goto('/');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
  });

  test('PT-BR homepage has correct title', async ({ page }) => {
    await page.goto('/pt-br');
    await expect(page).toHaveTitle('Tobias | Engenheiro Sênior de Software Embarcado');
  });

  test('EN blog index has correct title', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveTitle('Blog | Tobias');
  });

  test('EN portfolio has correct title', async ({ page }) => {
    await page.goto('/portfolio');
    await expect(page).toHaveTitle('Portfolio | Tobias');
  });

  test('EN portfolio has non-empty meta description', async ({ page }) => {
    await page.goto('/portfolio');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
  });

  test('EN notes index has correct title', async ({ page }) => {
    await page.goto('/notes');
    await expect(page).toHaveTitle('Notes | Tobias');
  });

  test('EN now page has correct title', async ({ page }) => {
    await page.goto('/now');
    await expect(page).toHaveTitle('Now | Tobias');
  });

  test('EN blog index has non-empty meta description', async ({ page }) => {
    await page.goto('/blog');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
  });

  test('EN notes index has non-empty meta description', async ({ page }) => {
    await page.goto('/notes');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
  });

  test('EN now page has non-empty meta description', async ({ page }) => {
    await page.goto('/now');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    expect(desc).toMatch(/focused/i);
  });

  test('EN privacy page has non-empty meta description', async ({ page }) => {
    await page.goto('/privacy');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
  });

  test('EN homepage has canonical link', async ({ page }) => {
    await page.goto('/');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
    expect(canonical).toMatch(/jontobias\.com\/?$/);
  });

  test('EN homepage has x-default hreflang pointing to EN URL', async ({ page }) => {
    await page.goto('/');
    const xDefault = await page.locator('link[rel="alternate"][hreflang="x-default"]').getAttribute('href');
    expect(xDefault).toBeTruthy();
    expect(xDefault).not.toContain('/pt-br');
  });

  test('EN homepage has hreflang for en and pt-br', async ({ page }) => {
    await page.goto('/');
    const enHref = await page.locator('link[rel="alternate"][hreflang="en"]').getAttribute('href');
    const ptHref = await page.locator('link[rel="alternate"][hreflang="pt-br"]').getAttribute('href');
    expect(enHref).toBeTruthy();
    expect(ptHref).toBeTruthy();
    expect(ptHref).toContain('/pt-br');
  });

  test('PT-BR blog index has correct title', async ({ page }) => {
    await page.goto('/pt-br/blog');
    await expect(page).toHaveTitle('Blog | Tobias');
  });

  test('PT-BR notes index has correct title', async ({ page }) => {
    await page.goto('/pt-br/notes');
    await expect(page).toHaveTitle('Notas | Tobias');
  });

  test('PT-BR portfolio has correct title', async ({ page }) => {
    await page.goto('/pt-br/portfolio');
    const title = await page.title();
    expect(title).toContain('Portfólio');
  });

  test('EN privacy page title contains site name', async ({ page }) => {
    await page.goto('/privacy');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).toContain('Tobias');
  });

  test('EN terms page title contains site name', async ({ page }) => {
    await page.goto('/terms');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).toContain('Tobias');
  });
});

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
