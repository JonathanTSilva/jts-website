import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

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

    // Get expected slugs from src/content
    const blogDir = path.join(process.cwd(), 'src/content/blog');
    const notesDir = path.join(process.cwd(), 'src/content/notes');
    
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
    const notesFiles = fs.readdirSync(notesDir).filter(f => f.endsWith('.md'));

    // Extract slugs from filenames (assuming filename is the slug + extension)
    // Actually, we need to check how slugs are generated.
    // In Astro, it's usually the filename without extension.
    
    const blogSlugs = blogFiles.map(f => f.replace(/\.(en|pt-br)\.md$/, '.$1'));
    const notesSlugs = notesFiles.map(f => f.replace(/\.(en|pt-br)\.md$/, '.$1'));

    // Wait, let's look at the sitemap output from before:
    // https://www.jontobias.com/blog/2026-03-ci-firmware.en/
    // It seems it appends the locale and a trailing slash.

    for (const slug of blogSlugs) {
      expect(xml).toContain(`/blog/${slug}/`);
    }
    for (const slug of notesSlugs) {
      expect(xml).toContain(`/notes/${slug}/`);
    }
  });

  test('RSS feeds should be valid and contain content items', async ({ request }) => {
    const blogDir = path.join(process.cwd(), 'src/content/blog');
    const notesDir = path.join(process.cwd(), 'src/content/notes');

    const enBlogSlugs = fs.readdirSync(blogDir)
      .filter(f => f.endsWith('.en.md'))
      .map(f => f.replace(/\.en\.md$/, '.en'));
    const ptBlogSlugs = fs.readdirSync(blogDir)
      .filter(f => f.endsWith('.pt-br.md'))
      .map(f => f.replace(/\.pt-br\.md$/, '.pt-br'));
    const enNotesSlugs = fs.readdirSync(notesDir)
      .filter(f => f.endsWith('.en.md'))
      .map(f => f.replace(/\.en\.md$/, '.en'));
    const ptNotesSlugs = fs.readdirSync(notesDir)
      .filter(f => f.endsWith('.pt-br.md'))
      .map(f => f.replace(/\.pt-br\.md$/, '.pt-br'));

    // English Blog RSS
    const blogRss = await request.get('/rss.xml');
    expect(blogRss.ok()).toBe(true);
    const blogXml = await blogRss.text();
    expect(blogXml).toContain("<title>Jonathan&apos;s Blog</title>");
    for (const slug of enBlogSlugs) {
      expect(blogXml).toContain(`/blog/${slug}`);
    }
    // PT-BR posts must NOT appear in the EN feed
    for (const slug of ptBlogSlugs) {
      expect(blogXml).not.toContain(`/pt-br/blog/${slug}`);
    }

    // PT-BR Blog RSS
    const ptBlogRss = await request.get('/pt-br/rss.xml');
    expect(ptBlogRss.ok()).toBe(true);
    const ptBlogXml = await ptBlogRss.text();
    expect(ptBlogXml).toContain('<language>pt-br</language>');
    for (const slug of ptBlogSlugs) {
      expect(ptBlogXml).toContain(`/pt-br/blog/${slug}`);
    }

    // English Notes RSS
    const notesRss = await request.get('/notes/rss.xml');
    expect(notesRss.ok()).toBe(true);
    const notesXml = await notesRss.text();
    expect(notesXml).toContain("<title>Jonathan&apos;s Notes</title>");
    for (const slug of enNotesSlugs) {
      expect(notesXml).toContain(`/notes/${slug}`);
    }
    for (const slug of ptNotesSlugs) {
      expect(notesXml).not.toContain(`/pt-br/notes/${slug}`);
    }

    // PT-BR Notes RSS
    const ptNotesRss = await request.get('/pt-br/notes/rss.xml');
    expect(ptNotesRss.ok()).toBe(true);
    const ptNotesXml = await ptNotesRss.text();
    expect(ptNotesXml).toContain('<language>pt-br</language>');
    for (const slug of ptNotesSlugs) {
      expect(ptNotesXml).toContain(`/pt-br/notes/${slug}`);
    }
  });

  test('every blog post and note should have a reachable og:image meta tag', async ({ page, request }) => {
    const blogDir = path.join(process.cwd(), 'src/content/blog');
    const notesDir = path.join(process.cwd(), 'src/content/notes');
    
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
    const notesFiles = fs.readdirSync(notesDir).filter(f => f.endsWith('.md'));

    const blogSlugs = blogFiles.map(f => f.replace(/\.(en|pt-br)\.md$/, '.$1'));
    const notesSlugs = notesFiles.map(f => f.replace(/\.(en|pt-br)\.md$/, '.$1'));

    // Check blog posts
    for (const slug of blogSlugs) {
      await page.goto(`/blog/${slug}`);
      const ogImage = await page.locator('meta[property="og:image"]').first().getAttribute('content');
      expect(ogImage).toBeTruthy();
      expect(ogImage).toContain(`/og/blog/${slug}.png`);
      
      // Reachability check — strip domain so the request hits the local test server,
      // not the production site (which may not have this content yet).
      const imagePath = new URL(ogImage!).pathname;
      const imageResponse = await request.get(imagePath);
      expect(imageResponse.status(), `og:image for blog/${slug} should be reachable`).toBe(200);
    }

    // Check notes
    for (const slug of notesSlugs) {
      await page.goto(`/notes/${slug}`);
      const ogImage = await page.locator('meta[property="og:image"]').first().getAttribute('content');
      expect(ogImage).toBeTruthy();
      expect(ogImage).toContain(`/og/notes/${slug}.png`);

      // Reachability check — strip domain so the request hits the local test server.
      const imagePath = new URL(ogImage!).pathname;
      const imageResponse = await request.get(imagePath);
      expect(imageResponse.status(), `og:image for notes/${slug} should be reachable`).toBe(200);
    }
  });
});
