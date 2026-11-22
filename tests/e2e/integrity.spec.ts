import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { contentPath, ogImagePath } from '../../src/lib/content/routes';
import type { Locale } from '../../src/lib/content/locale';

interface ContentFile {
  slug: string;
  language: Locale;
}

/** Reads slug and language from each file's frontmatter, as the site does. */
function readContent(dir: 'blog' | 'notes'): ContentFile[] {
  const root = path.join(process.cwd(), 'src/content', dir);
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const { data } = matter(fs.readFileSync(path.join(root, f), 'utf8'));
      return { slug: String(data.slug), language: data.language as Locale };
    });
}

test.describe('Indexing surfaces', () => {
  test('robots.txt returns 200 with correct directives', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain('User-agent: *');
    expect(text).toContain('Allow: /');
    expect(text).toContain('Sitemap: https://www.jontobias.com/sitemap-index.xml');
  });

  test('sitemap-index.xml returns 200', async ({ request }) => {
    const response = await request.get('/sitemap-index.xml');
    expect(response.status()).toBe(200);
  });

  test('sitemap-0.xml returns 200', async ({ request }) => {
    const response = await request.get('/sitemap-0.xml');
    expect(response.status()).toBe(200);
  });

  test('sitemap leaves out the E2E fixture pages', async ({ request }) => {
    const xml = await (await request.get('/sitemap-0.xml')).text();
    expect(xml).not.toContain('test-fixtures');
  });

  test('search index and RSS feeds leave out the E2E fixtures', async ({ request }) => {
    const urls = ['/api/en/search-index.json', '/api/pt-br/search-index.json', '/rss.xml', '/pt-br/rss.xml', '/notes/rss.xml', '/pt-br/notes/rss.xml'];
    for (const url of urls) {
      const body = await (await request.get(url)).text();
      expect(body, url).not.toContain('test-fixtures');
    }
  });

  test('sitemap includes bilingual legal pages', async ({ request }) => {
    const response = await request.get('/sitemap-0.xml');
    expect(response.ok()).toBe(true);

    const xml = await response.text();
    expect(xml).toContain('https://www.jontobias.com/privacy/');
    expect(xml).toContain('https://www.jontobias.com/terms/');
    expect(xml).toContain('https://www.jontobias.com/pt-br/privacy/');
    expect(xml).toContain('https://www.jontobias.com/pt-br/terms/');
  });
});

test.describe('Build Integrity', () => {
  test('sitemap should contain all content slugs', async ({ request }) => {
    const response = await request.get('/sitemap-0.xml');
    expect(response.ok()).toBe(true);
    const xml = await response.text();

    for (const { slug, language } of readContent('blog')) {
      expect(xml).toContain(contentPath('blog', language, slug));
    }
    for (const { slug, language } of readContent('notes')) {
      expect(xml).toContain(contentPath('notes', language, slug));
    }
  });

  test('RSS feeds should be valid and contain content items', async ({ request }) => {
    const slugsOf = (dir: 'blog' | 'notes', language: Locale): string[] =>
      readContent(dir).filter((c) => c.language === language).map((c) => c.slug);
    const enBlogSlugs = slugsOf('blog', 'en');
    const ptBlogSlugs = slugsOf('blog', 'pt-br');
    const enNotesSlugs = slugsOf('notes', 'en');
    const ptNotesSlugs = slugsOf('notes', 'pt-br');

    // English Blog RSS
    const blogRss = await request.get('/rss.xml');
    expect(blogRss.ok()).toBe(true);
    const blogXml = await blogRss.text();
    expect(blogXml).toContain("<title>Jonathan&apos;s Blog</title>");
    for (const slug of enBlogSlugs) {
      expect(blogXml).toContain(`https://www.jontobias.com${contentPath('blog', 'en', slug)}`);
    }
    // PT-BR posts must NOT appear in the EN feed
    expect(blogXml).not.toContain('/pt-br/blog/');

    // PT-BR Blog RSS
    const ptBlogRss = await request.get('/pt-br/rss.xml');
    expect(ptBlogRss.ok()).toBe(true);
    const ptBlogXml = await ptBlogRss.text();
    expect(ptBlogXml).toContain('<language>pt-br</language>');
    for (const slug of ptBlogSlugs) {
      expect(ptBlogXml).toContain(`https://www.jontobias.com${contentPath('blog', 'pt-br', slug)}`);
    }

    // English Notes RSS
    const notesRss = await request.get('/notes/rss.xml');
    expect(notesRss.ok()).toBe(true);
    const notesXml = await notesRss.text();
    expect(notesXml).toContain("<title>Jonathan&apos;s Notes</title>");
    for (const slug of enNotesSlugs) {
      expect(notesXml).toContain(`https://www.jontobias.com${contentPath('notes', 'en', slug)}`);
    }
    expect(notesXml).not.toContain('/pt-br/notes/');

    // PT-BR Notes RSS
    const ptNotesRss = await request.get('/pt-br/notes/rss.xml');
    expect(ptNotesRss.ok()).toBe(true);
    const ptNotesXml = await ptNotesRss.text();
    expect(ptNotesXml).toContain('<language>pt-br</language>');
    for (const slug of ptNotesSlugs) {
      expect(ptNotesXml).toContain(`https://www.jontobias.com${contentPath('notes', 'pt-br', slug)}`);
    }
  });

  test('every blog post and note should have a reachable og:image meta tag', async ({ page, request }) => {
    const items = [
      ...readContent('blog').map((c) => ({ base: 'blog', ...c })),
      ...readContent('notes').map((c) => ({ base: 'notes', ...c })),
    ];

    for (const { base, slug, language } of items) {
      await page.goto(contentPath(base, language, slug));
      const ogImage = await page.locator('meta[property="og:image"]').first().getAttribute('content');
      expect(ogImage).toBeTruthy();
      expect(ogImage).toContain(ogImagePath(base, language, slug));

      // Reachability check: strip the domain so the request hits the local test server,
      // not the production site (which may not have this content yet).
      const imagePath = new URL(ogImage!).pathname;
      const imageResponse = await request.get(imagePath);
      expect(imageResponse.status(), `og:image for ${language} ${base}/${slug} should be reachable`).toBe(200);
    }
  });
});
