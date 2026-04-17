import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  '/', 
  '/portfolio', 
  '/blog', 
  '/notes', 
  '/now', 
  '/404',
  '/privacy',
  '/terms',
  '/pt-br', 
  '/pt-br/portfolio', 
  '/pt-br/blog', 
  '/pt-br/notes', 
  '/pt-br/now',
  '/blog/2026-03-ci-firmware.en',
  '/blog/2026-03-hello-embedded-systems.en',
  '/pt-br/blog/2026-03-hello-embedded-systems.pt-br',
  '/notes/note-cheatsheet.en',
  '/pt-br/notes/note-cheatsheet.pt-br',
  '/notes/mindmap-cheatsheet.en'
];

for (const path of PAGES) {
  test(`a11y check: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa', 'best-practice'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
