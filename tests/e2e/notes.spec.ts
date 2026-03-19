import { test, expect } from '@playwright/test';

test.describe('Notes', () => {
  test('en: notes index and filtering', async ({ page }) => {
    await page.goto('/notes');
    
    await expect(page.getByRole('heading', { name: 'Notes', level: 1 })).toBeVisible();
    
    // Check for filters
    await expect(page.getByText('Categories')).toBeVisible();
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    
    // Check for specific note card
    await expect(page.getByText('Debugging Habits')).toBeVisible();
  });

  test('search dialog functions correctly', async ({ page }) => {
    await page.goto('/');
    
    // Open search with shortcut
    await page.keyboard.press('/');
    await expect(page.getByRole('dialog')).toBeVisible();
    
    const input = page.getByPlaceholder('Search blog and notes...');
    await input.fill('Firmware');
    
    // Wait for results
    await expect(page.getByRole('dialog').getByText('Continuous Integration for Firmware')).toBeVisible();
    
    // Close search
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
