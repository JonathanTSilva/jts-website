import { test, expect } from '@playwright/test';

test('portfolio page loads', async ({ page }) => {
  await page.goto('/portfolio');
  await expect(page).toHaveTitle(/Portfolio/i);
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
});
