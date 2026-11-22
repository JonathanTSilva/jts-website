import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { LEGACY_SLUGS } from '../../src/data/legacy-slugs';
import { readSearchIndex } from './helpers/content';

// Real, live content of the build (never fixtures): article-page tests below navigate from its indexes.
const hasLive = (type: 'blog' | 'notes', locale: 'en' | 'pt-br' = 'en') =>
  readSearchIndex(locale).some((i) => i.type === type);

async function getJsonLdTypes(page: import('@playwright/test').Page): Promise<string[]> {
  const scripts = await page.locator('script[type="application/ld+json"]').all();
  const jsonLd = await Promise.all(scripts.map(s => s.textContent()));
  return jsonLd.map(j => JSON.parse(j!)).map(d => d['@type']);
}

async function getFirstContentLink(page: import('@playwright/test').Page, selector: string): Promise<string> {
  const href = await page.locator(selector).first().getAttribute('href');
  expect(href).toBeTruthy();
  return href!;
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
    expect(desc!.length).toBeGreaterThan(20);
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

  test('EN note detail page has canonical and non-empty description', async ({ page }) => {
    test.skip(!hasLive('notes'), 'no live English note in the build');
    await page.goto('/notes');
    await page.goto(await getFirstContentLink(page, 'a.note-link'));

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');

    expect(canonical).toContain('/notes/');
    expect(desc).toBeTruthy();
  });

  test('PT-BR note detail page exposes article og:type', async ({ page }) => {
    test.skip(!hasLive('notes', 'pt-br'), 'no live Portuguese note in the build');
    await page.goto('/pt-br/notes');
    await page.goto(await getFirstContentLink(page, 'a.note-link'));

    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    expect(ogType).toBe('article');
  });

  test('EN privacy page has hreflang pt-br pointing to the translated legal page', async ({ page }) => {
    await page.goto('/privacy');
    const href = await page.locator('link[rel="alternate"][hreflang="pt-br"]').getAttribute('href');
    expect(href).toBe('https://www.jontobias.com/pt-br/privacy/');
  });

  test('PT-BR terms page has hreflang en pointing to the translated legal page', async ({ page }) => {
    await page.goto('/pt-br/terms');
    const href = await page.locator('link[rel="alternate"][hreflang="en"]').getAttribute('href');
    expect(href).toBe('https://www.jontobias.com/terms/');
  });
});

test.describe('Multilingual alternate links', () => {
  test('EN blog index has hreflang pt-br pointing to PT-BR blog', async ({ page }) => {
    await page.goto('/blog');
    const href = await page.locator('link[rel="alternate"][hreflang="pt-br"]').getAttribute('href');
    expect(href).toBe('https://www.jontobias.com/pt-br/blog/');
  });

  test('PT-BR blog index has hreflang en pointing to EN blog', async ({ page }) => {
    await page.goto('/pt-br/blog');
    const href = await page.locator('link[rel="alternate"][hreflang="en"]').getAttribute('href');
    expect(href).toBe('https://www.jontobias.com/blog/');
  });

  test('EN blog index has x-default hreflang pointing to EN URL', async ({ page }) => {
    await page.goto('/blog');
    const href = await page.locator('link[rel="alternate"][hreflang="x-default"]').getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).not.toContain('/pt-br');
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
    test.skip(!hasLive('blog'), 'no live English blog post in the build');
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

test.describe('Translation-aware hreflang', () => {
  test('article hreflang points to the real translation', async ({ page }) => {
    test.skip(!hasLive('blog'), 'no live English blog post in the build');
    await page.goto('/blog');
    const href = await page.locator('a.blog-entry').first().getAttribute('href');
    expect(href).toBeTruthy();
    const hasTranslation = readSearchIndex('pt-br').some((i) => i.url === '/pt-br' + href!.replace(/\/$/, ''));
    test.skip(!hasTranslation, 'the newest post has no Portuguese translation');
    await page.goto(href!);

    const hreflangHref = await page
      .locator('link[rel="alternate"][hreflang="pt-br"]')
      .getAttribute('href');
    const switcherHref = await page
      .locator('a.lang-btn[data-locale="pt-br"]')
      .first()
      .getAttribute('href');
    expect(hreflangHref).toBeTruthy();
    expect(switcherHref).toBeTruthy();

    const normalize = (p: string) => p.replace(/\/+$/, '');
    expect(normalize(new URL(hreflangHref!).pathname)).toBe(normalize(switcherHref!));

    const response = await page.request.get(switcherHref!);
    expect(response.status()).toBe(200);
  });
});

test.describe('Legacy slug redirects', () => {
  // Old URLs were shared (LinkedIn etc.) and must still land on the post. The cases come from
  // LEGACY_SLUGS, so they follow the real content; an entry whose target page no longer exists
  // in the build (a deleted post) is left out instead of failing.
  const targetExists = (target: string) => fs.existsSync(path.join(process.cwd(), 'dist', target, 'index.html'));

  const cases = LEGACY_SLUGS.flatMap(({ collection, oldBase, newSlug }) => [
    { from: `/${collection}/${oldBase}.en/`, target: `/${collection}/${newSlug}` },
    { from: `/pt-br/${collection}/${oldBase}.pt-br/`, target: `/pt-br/${collection}/${newSlug}` },
  ]).filter(({ target }) => targetExists(target));

  test.skip(cases.length === 0, 'no legacy slug points at a page that exists in the build');

  for (const { from, target } of cases) {
    test(`old shared URL still reaches the post: ${from}`, async ({ page }) => {
      await page.goto(from);
      await page.waitForURL(new RegExp(`${target}/?$`));
      await expect(page.locator('h1').first()).toBeVisible();
    });
  }

  test('the redirect page is noindex so old URLs do not get indexed', async ({ page }) => {
    const response = await page.request.get(cases[0]!.from);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toMatch(/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i);
  });
});
