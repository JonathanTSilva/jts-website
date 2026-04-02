import { test, expect } from '@playwright/test';

const legalPages = [
  {
    path: '/privacy',
    title: /Privacy Policy \| Tobias/i,
    heading: /Privacy Policy/i,
    effectiveDate: /Effective date: March 31, 2026/i,
    alternateLocale: 'pt-br',
    alternatePath: 'https://www.jontobias.com/pt-br/privacy/',
  },
  {
    path: '/terms',
    title: /Terms of Service \| Tobias/i,
    heading: /Terms of Service/i,
    effectiveDate: /Effective date: March 31, 2026/i,
    alternateLocale: 'pt-br',
    alternatePath: 'https://www.jontobias.com/pt-br/terms/',
  },
  {
    path: '/pt-br/privacy',
    title: /Política de Privacidade \| Tobias/i,
    heading: /Política de Privacidade/i,
    effectiveDate: /Data de vigência: 31 de março de 2026/i,
    alternateLocale: 'en',
    alternatePath: 'https://www.jontobias.com/privacy/',
  },
  {
    path: '/pt-br/terms',
    title: /Termos de Serviço \| Tobias/i,
    heading: /Termos de Serviço/i,
    effectiveDate: /Data de vigência: 31 de março de 2026/i,
    alternateLocale: 'en',
    alternatePath: 'https://www.jontobias.com/terms/',
  },
];

test.describe('Site governance invariants', () => {
  for (const legalPage of legalPages) {
    test(`${legalPage.path} is published with effective date and alternate locale links`, async ({ page }) => {
      const response = await page.goto(legalPage.path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(legalPage.title);
      await expect(page.getByRole('heading', { name: legalPage.heading })).toBeVisible();
      await expect(page.getByText(legalPage.effectiveDate)).toBeVisible();

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe(`https://www.jontobias.com${legalPage.path}/`);

      const alternateHref = await page
        .locator(`link[rel="alternate"][hreflang="${legalPage.alternateLocale}"]`)
        .getAttribute('href');
      expect(alternateHref).toBe(legalPage.alternatePath);
    });
  }

  test('major entry points publish canonical URLs', async ({ page }) => {
    const routes = ['/', '/blog', '/notes', '/portfolio', '/now', '/pt-br', '/pt-br/blog', '/pt-br/notes'];

    for (const route of routes) {
      await page.goto(route);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical, `missing canonical for ${route}`).toBeTruthy();
      expect(canonical).toContain('https://www.jontobias.com');
    }
  });
});
