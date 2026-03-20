import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('en: homepage exposes portfolio, blog, notes, now, and contact section', async ({ page }) => {
    await page.goto('/');
    
    await test.step('Header/Hero navigation', async () => {
      await expect(page.getByRole('link', { name: 'Portfolio' }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Blog' }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Notes' }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Now' }).first()).toBeVisible();
    });
    
    await test.step('Sections', async () => {
      await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Publications' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Latest Blog Posts' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Latest Notes' })).toBeVisible();
    });
    
    await test.step('CTAs', async () => {
      await expect(page.getByRole('link', { name: 'See full portfolio' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Download CV (PDF)' })).toBeVisible();
    });
    
    await test.step('Contact', async () => {
      await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Email' })).toBeVisible();
    });
  });

  test('pt-br: homepage exposes portfolio, blog, notes, now, and contact section', async ({ page }) => {
    await page.goto('/pt-br');
    
    await test.step('Header/Hero navigation', async () => {
      await expect(page.getByRole('link', { name: 'Portfólio' }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Blog' }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Notas' }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Agora' }).first()).toBeVisible();
    });
    
    await test.step('Sections', async () => {
      await expect(page.getByRole('heading', { name: 'Projetos' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Publicações' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Últimos Posts' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Últimas Notas' })).toBeVisible();
    });
    
    await test.step('CTAs', async () => {
      await expect(page.getByRole('link', { name: 'Ver portfólio completo' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Baixar CV (PDF)' })).toBeVisible();
    });
    
    await test.step('Contact', async () => {
      await expect(page.getByRole('heading', { name: 'Contato' })).toBeVisible();
    });
  });

  test('CV download link is correct', async ({ page }) => {
    await page.goto('/');
    const downloadLink = page.getByRole('link', { name: 'Download CV (PDF)' });
    await expect(downloadLink).toHaveAttribute('href', '/assets/cv/jonathan-cv.pdf');
    await expect(downloadLink).toHaveAttribute('download', '');
  });
});

test('hero renders name, monospace label, CTA buttons, and typewriter', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero h1')).toBeVisible();
  await expect(page.locator('.typewriter-prefix')).toBeVisible();
  await expect(page.locator('a[href="/portfolio"]').first()).toBeVisible();
  await expect(page.locator('a[href="/blog"]').first()).toBeVisible();
});

test('hero does not render a nav element', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero nav')).not.toBeAttached();
});

test.describe('Portfolio Page', () => {
  test('en: portfolio page renders all sections', async ({ page }) => {
    await page.goto('/portfolio');
    await test.step('Main headings', async () => {
      await expect(page.getByRole('heading', { name: 'Portfolio', level: 1 })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Biography' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Experience' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Publications' })).toBeVisible();
    });
  });

  test('pt-br: portfolio page renders all sections', async ({ page }) => {
    await page.goto('/pt-br/portfolio');
    await test.step('Main headings', async () => {
      await expect(page.getByRole('heading', { name: 'Portfólio', level: 1 })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Biografia' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Experiência' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Projetos' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Publicações' })).toBeVisible();
    });
  });
});
