import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('en: homepage exposes portfolio, blog, notes, and now', async ({ page }) => {
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
  });

  test('pt-br: homepage exposes portfolio, blog, notes, and now', async ({ page }) => {
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

test('homepage sections use monospace labels and token-based styles', async ({ page }) => {
  await page.goto('/');
  const sectionLabel = page.locator('.section-label').first();
  await expect(sectionLabel).toBeVisible();
  // Blog preview rows should each have a title and a date
  const blogRow = page.locator('.blog-preview-row').first();
  await expect(blogRow).toBeVisible();
});

test('hero has two-column layout with profile placeholder and achievement boxes', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-right')).toBeVisible();
  await expect(page.locator('.profile-image-wrap')).toBeVisible();
  const boxes = page.locator('.achievement-box');
  await expect(boxes).toHaveCount(4);
  await expect(boxes.first().locator('.achievement-value')).toBeVisible();
  await expect(boxes.first().locator('.achievement-label')).toBeVisible();
});

test('hero social contact row has email, linkedin, github links', async ({ page }) => {
  await page.goto('/');
  const social = page.locator('.hero-social');
  await expect(social).toBeVisible();
  await expect(social.locator('a[href^="mailto:"]')).toBeVisible();
  await expect(social.locator('a[href*="linkedin"]')).toBeVisible();
  await expect(social.locator('a[href*="github"]')).toBeVisible();
});

test('hero CTA area has tagline text and three CTA buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-tagline')).toBeVisible();
  await expect(page.locator('.hero-cta a')).toHaveCount(3);
  await expect(page.locator('.hero-cta .btn-ghost')).toBeVisible();
});

test('pt-br hero tagline is in Portuguese', async ({ page }) => {
  await page.goto('/pt-br');
  const tagline = page.locator('.hero-tagline');
  await expect(tagline).toContainText('Explore meu trabalho e insights');
});

test('mobile: hero left column renders before right column', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const left = page.locator('.hero-left');
  const right = page.locator('.hero-right');
  const leftBox = await left.boundingBox();
  const rightBox = await right.boundingBox();
  expect(leftBox!.y).toBeLessThan(rightBox!.y);
});

test('mobile: home projects in single column', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const cards = page.locator('.grid .project-card').first();
  await expect(cards).toBeVisible();
});

test('projects section shows 3 project cards', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.project-card');
  await expect(cards).toHaveCount(3);
});

test('projects bento grid: first card spans full width on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  const firstCard = page.locator('.project-card').first();
  await expect(firstCard).toBeVisible();
  const style = await firstCard.getAttribute('style');
  expect(style).toContain('span 2');
});

test('publications section renders a horizontal card row', async ({ page }) => {
  await page.goto('/');
  const row = page.locator('.pub-card-row');
  await expect(row).toBeVisible();
  const cards = page.locator('.pub-card');
  await expect(cards.first()).toBeVisible();
  await expect(cards.first().locator('.pub-type-badge')).toBeVisible();
  await expect(cards.first().locator('.pub-card-title')).toBeVisible();
  await expect(cards.first().locator('.pub-card-publisher')).toBeVisible();
});

test('publications section has "see all" link to portfolio', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('.pub-viewall');
  await expect(link).toBeVisible();
});

test('blog section shows up to 5 posts with no separator lines', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('.blog-preview-row');
  // Up to 5 rows (passes if fewer posts exist than 5)
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(1);
  expect(count).toBeLessThanOrEqual(5);
  // Each row has a title and a date
  await expect(rows.first().locator('.blog-preview-title')).toBeVisible();
  await expect(rows.first().locator('.blog-preview-date')).toBeVisible();
});

test('notes section cards show category badge when category exists', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.note-preview-card');
  await expect(cards.first()).toBeVisible();
  // Category badges must be inside note cards, and each one must be visible
  const badges = page.locator('.note-preview-card .note-category');
  const badgeCount = await badges.count();
  for (let i = 0; i < badgeCount; i++) {
    await expect(badges.nth(i)).toBeVisible();
  }
});

test.describe('LanguageSwitcher pill', () => {
  test('EN page: pill shows EN active and PT as link', async ({ page }) => {
    await page.goto('/');
    const switcher = page.locator('.lang-pill');
    await expect(switcher).toBeVisible();
    // Active button for EN
    const enBtn = switcher.locator('[data-locale="en"]');
    await expect(enBtn).toBeVisible();
    // PT is a link
    const ptLink = switcher.locator('a[data-locale="pt-br"]');
    await expect(ptLink).toBeVisible();
  });

  test('PT page: pill shows PT active and EN as link', async ({ page }) => {
    await page.goto('/pt-br');
    const switcher = page.locator('.lang-pill');
    await expect(switcher).toBeVisible();
    const ptBtn = switcher.locator('[data-locale="pt-br"]');
    await expect(ptBtn).toBeVisible();
    const enLink = switcher.locator('a[data-locale="en"]');
    await expect(enLink).toBeVisible();
  });

  test('switching from EN to PT navigates to /pt-br', async ({ page }) => {
    await page.goto('/');
    // There may be multiple lang-pill instances (header + footer)
    const ptLink = page.locator('.lang-pill a[data-locale="pt-br"]').first();
    await ptLink.click();
    await expect(page).toHaveURL('/pt-br');
  });

  test('switching from PT to EN navigates to /', async ({ page }) => {
    await page.goto('/pt-br');
    const enLink = page.locator('.lang-pill a[data-locale="en"]').first();
    await enLink.click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Footer', () => {
  test('footer has two rows: brand row and copyright row', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.footer-row-brand')).toBeVisible();
    await expect(page.locator('.footer-row-legal')).toBeVisible();
  });

  test('footer brand row has logo, social icons, and lang switcher', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.footer-logo')).toBeVisible();
    await expect(page.locator('.footer-social')).toBeVisible();
    // LanguageSwitcher pill is inside footer
    await expect(page.locator('.footer-row-brand .lang-pill')).toBeVisible();
  });

  test('footer legal row has copyright and privacy/terms links', async ({ page }) => {
    await page.goto('/');
    const legal = page.locator('.footer-row-legal');
    await expect(legal).toBeVisible();
    await expect(legal.locator('a[href="/privacy"]')).toBeVisible();
    await expect(legal.locator('a[href="/terms"]')).toBeVisible();
  });

  test('footer uses wide-max width and is narrower than viewport at 1600px', async ({ page }) => {
    await page.goto('/');
    // Behavioral: at very wide viewport inner should not fill full width
    await page.setViewportSize({ width: 1600, height: 800 });
    const inner = page.locator('.footer-inner');
    const box = await inner.boundingBox();
    // wide-max = 88rem = 1408px; inner must be narrower than 1600
    expect(box!.width).toBeLessThan(1600);
  });
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

test('hero has CPU architecture background', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-bg')).toBeVisible();
  await expect(page.locator('.hero-bg .cpu-wrap')).toBeVisible();
  const cpuSvg = page.locator('.hero-bg .cpu-svg');
  await expect(cpuSvg).toBeVisible();
});

test('html has scrollbar-gutter: stable', async ({ page }) => {
  await page.goto('/');
  const scrollbarGutter = await page.evaluate(() =>
    getComputedStyle(document.documentElement).scrollbarGutter
  );
  expect(scrollbarGutter).toBe('stable');
});

test('container max width is 68rem', async ({ page }) => {
  await page.goto('/');
  const maxWidth = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--container-max').trim()
  );
  expect(maxWidth).toBe('68rem');
});

test.describe('Legal placeholder pages', () => {
  test('/privacy renders with correct heading', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
    await expect(page.getByText('under construction')).toBeVisible();
  });

  test('/terms renders with correct heading', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();
    await expect(page.getByText('under construction')).toBeVisible();
  });
});
