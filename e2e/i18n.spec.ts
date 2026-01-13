import { test, expect } from '@playwright/test';

test.describe('Internationalization (i18n)', () => {
  test('Korean locale should be default', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(ko)?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  });

  test('should navigate to English locale', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('should navigate to Japanese locale', async ({ page }) => {
    await page.goto('/ja');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  });

  test('Korean page should have Korean content', async ({ page }) => {
    await page.goto('/ko');
    await expect(page.getByText('이야기를 만드는 사람들')).toBeVisible();
  });

  test('English page should have English content', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByText('FOR STORY-LOVERS')).toBeVisible();
  });

  test('Japanese page should have Japanese content', async ({ page }) => {
    await page.goto('/ja');
    // Check for Japanese text
    await expect(page.locator('body')).toContainText(/物語|ストーリー/);
  });

  test('language switcher should change locale', async ({ page }) => {
    await page.goto('/ko');
    
    const langSwitcher = page.locator('[data-testid="language-switcher"]');
    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      await page.getByText('English').click();
      await expect(page).toHaveURL(/\/en/);
    }
  });
});
