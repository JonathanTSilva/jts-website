import { test, expect } from '@playwright/test';

test('portfolio page loads', async ({ page }) => {
  await page.goto('/portfolio');
  await expect(page).toHaveTitle(/Portfolio/i);
});

test('portfolio CV link points to the public PDF', async ({ page }) => {
  await page.goto('/portfolio');
  const cvLink = page.getByRole('link', { name: 'Download CV (PDF)' });
  await expect(cvLink).toHaveAttribute('href', '/assets/cv/jonathan-cv.pdf');
  await expect(cvLink).toHaveAttribute('download', '');
});

test('pt-br portfolio CV link points to the public PDF', async ({ page }) => {
  await page.goto('/pt-br/portfolio');
  const cvLink = page.getByRole('link', { name: 'Baixar CV (PDF)' });
  await expect(cvLink).toHaveAttribute('href', '/assets/cv/jonathan-cv.pdf');
  await expect(cvLink).toHaveAttribute('download', '');
});

test('portfolio bento grid renders project cards', async ({ page }) => {
  await page.goto('/portfolio');
  const bentoGrid = page.locator('.bento-grid');
  await expect(bentoGrid).toBeVisible();
  const projectCard = page.locator('.project-card').first();
  await expect(projectCard).toBeVisible();
});

test('portfolio unified timeline shows work and education entries', async ({ page }) => {
  await page.goto('/portfolio');
  const timelineItems = page.locator('.timeline-item');
  await expect(timelineItems.first()).toBeVisible();
});

test('skills cloud renders at least one pill', async ({ page }) => {
  await page.goto('/portfolio');
  const cloud = page.locator('.skills-cloud');
  await expect(cloud).toBeVisible();
  const pills = cloud.locator('.skill-pill');
  const count = await pills.count();
  expect(count).toBeGreaterThan(0);
});

test('about section shows image or placeholder', async ({ page }) => {
  await page.goto('/portfolio');
  const imageWrap = page.locator('.about-image-wrap');
  await expect(imageWrap).toBeVisible();
  await expect(page.locator('.about-image')).toHaveAttribute('alt', 'Jonathan Tobias');
});

test('timeline line highlights on scroll', async ({ page }) => {
  await page.goto('/portfolio');
  // Scroll to the timeline section
  const firstItem = page.locator('.timeline-item').first();
  await firstItem.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300); // allow IntersectionObserver to fire
  // At least one item should be active
  const activeItems = page.locator('.timeline-item--active');
  const activeCount = await activeItems.count();
  expect(activeCount).toBeGreaterThan(0);
});
