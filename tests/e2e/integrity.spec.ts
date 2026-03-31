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

  test('RSS feeds should be valid and contain content items', async ({ request }) => {
    // Get expected slugs from src/content
    const blogDir = path.join(process.cwd(), 'src/content/blog');
    const notesDir = path.join(process.cwd(), 'src/content/notes');
    
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
    const notesFiles = fs.readdirSync(notesDir).filter(f => f.endsWith('.md'));

    const blogSlugs = blogFiles.map(f => f.replace(/\.(en|pt-br)\.md$/, '.$1'));
    const notesSlugs = notesFiles.map(f => f.replace(/\.(en|pt-br)\.md$/, '.$1'));

    // Blog RSS
    const blogRss = await request.get('/rss.xml');
    expect(blogRss.ok()).toBe(true);
    const blogXml = await blogRss.text();
    expect(blogXml).toContain("<title>Jonathan&apos;s Blog</title>");
    
    for (const slug of blogSlugs) {
      // Some items might be in pt-br
      const isPtBr = slug.endsWith('.pt-br');
      const path = isPtBr ? `/pt-br/blog/${slug}` : `/blog/${slug}`;
      expect(blogXml).toContain(path);
    }

    // Notes RSS
    const notesRss = await request.get('/notes/rss.xml');
    expect(notesRss.ok()).toBe(true);
    const notesXml = await notesRss.text();
    expect(notesXml).toContain("<title>Jonathan&apos;s Notes</title>");
    
    for (const slug of notesSlugs) {
      const isPtBr = slug.endsWith('.pt-br');
      const path = isPtBr ? `/pt-br/notes/${slug}` : `/notes/${slug}`;
      expect(notesXml).toContain(path);
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
