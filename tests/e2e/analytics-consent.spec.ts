import { test, expect } from '@playwright/test';

test.describe('Consent Banner', () => {
  test('shows a compact consent banner on first load in English', async ({ page }) => {
    await page.goto('/');

    const banner = page.locator('[data-testid="consent-banner"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Privacy choices');
    await expect(banner.getByRole('button', { name: 'Accept analytics' })).toBeVisible();
    await expect(banner.getByRole('button', { name: 'Reject' })).toBeVisible();
    await expect(page.locator('script[data-analytics-script="plausible"]')).toHaveCount(0);
  });

  test('shows localized copy on first load in Portuguese', async ({ page }) => {
    await page.goto('/pt-br/');

    const banner = page.locator('[data-testid="consent-banner"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Escolhas de privacidade');
    await expect(banner.getByRole('button', { name: 'Aceitar analytics' })).toBeVisible();
    await expect(banner.getByRole('button', { name: 'Recusar' })).toBeVisible();
  });

  test('stores accepted consent and hides the banner on reload', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Accept analytics' }).click();

    await expect(page.locator('[data-testid="consent-banner"]')).toBeHidden();
    await expect(page.locator('script[data-analytics-script="plausible"]')).toHaveCount(1);

    const storedConsent = await page.evaluate(() => window.localStorage.getItem('jts-consent'));
    expect(storedConsent).toContain('"analytics":true');

    await page.reload();

    await expect(page.locator('[data-testid="consent-banner"]')).toBeHidden();
  });

  test('stores rejected consent and hides the banner on reload', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Reject' }).click();

    await expect(page.locator('[data-testid="consent-banner"]')).toBeHidden();
    await expect(page.locator('script[data-analytics-script="plausible"]')).toHaveCount(0);

    const storedConsent = await page.evaluate(() => window.localStorage.getItem('jts-consent'));
    expect(storedConsent).toContain('"analytics":false');

    await page.reload();

    await expect(page.locator('[data-testid="consent-banner"]')).toBeHidden();
  });
});
