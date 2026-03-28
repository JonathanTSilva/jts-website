import { test, expect } from '@playwright/test';

test.describe('404 Page', () => {
  test('404 page renders and is branded (English default)', async ({ page }) => {
    // Navigate to /404 page directly
    await page.goto('/404');
    
    // Check for error code
    await expect(page.locator('.error-code')).toHaveText('0x404');
    
    // Check for "Signal Lost" heading
    await expect(page.locator('.error-title')).toContainText('Signal Lost');
    
    // Check for descriptive text
    await expect(page.locator('.error-text')).toContainText('The requested memory address is invalid or has been reallocated.');
    
    // Check for CTA link
    const backBtn = page.locator('#back-home');
    await expect(backBtn).toBeVisible();
    await expect(backBtn).toHaveText('Back to main branch');
    await expect(backBtn).toHaveAttribute('href', '/');
  });

  test('404 page shows PT-BR content when browser language is PT', async ({ page }) => {
    // Mock navigator.language before navigation
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        get: function() { return 'pt-BR'; }
      });
    });
    
    await page.goto('/404');
    
    // Check for "Sinal Perdido" heading
    await expect(page.locator('.error-title')).toContainText('Sinal Perdido');
    
    // Check for PT descriptive text
    await expect(page.locator('.error-text')).toContainText('O endereço de memória solicitado é inválido ou foi realocado.');
    
    // Check for PT CTA link text
    const backBtn = page.locator('#back-home');
    await expect(backBtn).toHaveText('Voltar ao início');
  });

  test('404 page shows PT-BR content when navigating from a /pt-br path', async ({ page }) => {
    // When a user navigates to a non-existent page starting with /pt-br/, 
    // it should show PT content even if browser is EN.
    
    // Note: Astro dev server might behave differently than preview.
    // In production/preview, 404.html is served for all non-found paths.
    
    await page.goto('/pt-br/not-a-real-page-at-all');
    
    // We expect the status to be 404 (though Playwright might not care unless we check)
    // and the content to be our 404 page in PT.
    await expect(page.locator('.error-title')).toContainText('Sinal Perdido');
    await expect(page.locator('#back-home')).toHaveText('Voltar ao início');
  });
});
