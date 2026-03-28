import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

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

  test('RSS feeds should be valid and contain content', async ({ request }) => {
    // Blog RSS
    const blogRss = await request.get('/rss.xml');
    expect(blogRss.ok()).toBe(true);
    const blogXml = await blogRss.text();
    expect(blogXml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(blogXml).toContain('<rss version="2.0"');
    expect(blogXml).toContain('<channel>');
    expect(blogXml).toContain('<title>Jonathan’s Blog</title>');
    expect(blogXml).toContain('<link>https://www.jontobias.com/</link>');
    expect(blogXml).toContain('<item>'); // Should have at least one item

    // Notes RSS
    const notesRss = await request.get('/notes/rss.xml');
    expect(notesRss.ok()).toBe(true);
    const notesXml = await notesRss.text();
    expect(notesXml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(notesXml).toContain('<rss version="2.0"');
    expect(notesXml).toContain('<channel>');
    expect(notesXml).toContain('<title>Jonathan’s Notes</title>');
    expect(notesXml).toContain('<link>https://www.jontobias.com/</link>');
    expect(notesXml).toContain('<item>'); // Should have at least one item
  });

  test('every blog post and note should have an og:image meta tag', async ({ page }) => {
    const blogDir = path.join(process.cwd(), 'src/content/blog');
    const notesDir = path.join(process.cwd(), 'src/content/notes');
    
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
    const notesFiles = fs.readdirSync(notesDir).filter(f => f.endsWith('.md'));

    const blogSlugs = blogFiles.map(f => f.replace(/\.(en|pt-br)\.md$/, '.$1'));
    const notesSlugs = notesFiles.map(f => f.replace(/\.(en|pt-br)\.md$/, '.$1'));

    // Check blog posts
    for (const slug of blogSlugs) {
      await page.goto(`/blog/${slug}`);
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(ogImage).toBeTruthy();
      expect(ogImage).toContain(`/og/blog/${slug}.png`);
    }

    // Check notes
    for (const slug of notesSlugs) {
      await page.goto(`/notes/${slug}`);
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(ogImage).toBeTruthy();
      expect(ogImage).toContain(`/og/notes/${slug}.png`);
    }
  });
});
