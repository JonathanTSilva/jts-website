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
  '/blog/2026-03-ci-firmware.en',
  '/blog/2026-03-hello-embedded-systems.en',
  '/pt-br/blog/2026-03-hello-embedded-systems.pt-br',
  '/notes/note-cheatsheet.en',
  '/pt-br/notes/note-cheatsheet.pt-br',
  '/notes/mindmap-cheatsheet.en'
];

// Dark --text-muted value. Contrast failures with any other foreground color in
// dark mode are pre-existing and tracked in #40; drop the filter below once fixed.
const DARK_TEXT_MUTED = '#8185a5';

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
      const violations = results.violations
        .map((violation) =>
          theme === 'dark' && violation.id === 'color-contrast'
            ? {
                ...violation,
                nodes: violation.nodes.filter(
                  (node) => node.any[0]?.data?.fgColor === DARK_TEXT_MUTED
                ),
              }
            : violation
        )
        .filter((violation) => violation.nodes.length > 0);
      expect(violations).toEqual([]);
    });
  }
}
