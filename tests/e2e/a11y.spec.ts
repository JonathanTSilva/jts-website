import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  '/',
  '/portfolio',
  '/blog',
  '/notes',
  '/now',
  '/engineering',
  '/404',
  '/privacy',
  '/terms',
  '/pt-br',
  '/pt-br/portfolio',
  '/pt-br/blog',
  '/pt-br/notes',
  '/pt-br/now',
  '/pt-br/engineering',
  // Article pages use the repo-owned fixtures, so they do not depend on synced content.
  // fixture-markdown covers every callout type, code block and colour class.
  '/test-fixtures/blog/fixture-en-only',
  '/pt-br/test-fixtures/blog/fixture-en-only',
  '/test-fixtures/blog/fixture-markdown/',
  '/pt-br/test-fixtures/blog/fixture-markdown/',
  '/test-fixtures/notes/fixture-note',
  '/pt-br/test-fixtures/notes/fixture-note',
  '/test-fixtures/notes/fixture-mindmap',
  '/test-fixtures/notes/fixture-book',
  '/test-fixtures/notes/fixture-whiteboard'
];

const THEMES = ['light', 'dark'] as const;

for (const theme of THEMES) {
  for (const path of PAGES) {
    test(`a11y check (${theme}): ${path}`, async ({ page }) => {
      await page.addInitScript((value) => {
        localStorage.setItem('theme-preference', value);
      }, theme);
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2aa', 'wcag21aa', 'best-practice'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test('PT skip link is Portuguese', async ({ page }) => {
  await page.goto('/pt-br/');
  await expect(page.locator('.skip-link')).toHaveText('Pular para o conteúdo');
});

test('PT site chrome is Portuguese', async ({ page }) => {
  await page.goto('/pt-br/');
  await expect(page.locator('.logo-img')).toHaveAttribute('alt', 'Logo da JTS');
  await expect(page.locator('.search-field')).toHaveAttribute('aria-label', 'Abrir busca');
  await expect(page.locator('.search-field input')).toHaveAttribute('placeholder', 'Buscar...');
  await expect(page.locator('.theme-toggle').first()).toHaveAttribute('aria-label', 'Alternar tema');
  await expect(page.locator('.lang-pill').first()).toHaveAttribute('aria-label', 'Seletor de idioma');
  await expect(page.locator('.hero')).toHaveAttribute('aria-label', 'Introdução');
  await expect(page.locator('.footer-social-link[aria-label="Feed RSS"]')).toHaveAttribute('href', '/pt-br/rss.xml');
});

test('PT blog, post and portfolio chrome is Portuguese', async ({ page }) => {
  await page.goto('/pt-br/blog');
  await expect(page.locator('.blog-filter-bar')).toHaveAttribute('aria-label', 'Filtrar por categoria');
  await expect(page.locator('.filter-category-btn[data-category="all"]')).toContainText('Todos');

  // The post navigation only renders when a post has a neighbour, so it is checked on a real post.
  const entries = page.locator('a.blog-entry');
  if ((await entries.count()) >= 2) {
    await entries.first().click();
    await expect(page.locator('.post-nav')).toHaveAttribute('aria-label', 'Navegação entre posts');
  }

  await page.goto('/pt-br/test-fixtures/blog/fixture-en-only');
  await expect(page.locator('.share-btn[data-platform="copy"]')).toHaveAttribute('aria-label', 'Copiar link');
  await expect(page.locator('.share-btn[data-platform="linkedin"]')).toHaveAttribute('aria-label', 'Compartilhar no LinkedIn');

  await page.goto('/pt-br/portfolio');
  await expect(page.locator('.badge-work').first()).toHaveText('TRABALHO');
  await expect(page.locator('.badge-edu').first()).toHaveText('FORMAÇÃO');
  await expect(page.locator('.card-status[data-status="Active"]').first()).toHaveText('Ativo');
});

test('EN footer RSS link points at the English feed', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.footer-social-link[aria-label="RSS feed"]')).toHaveAttribute('href', '/rss.xml');
});
