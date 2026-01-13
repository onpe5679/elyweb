import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the hero section', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('FOR STORY-LOVERS');
    await expect(page.locator('h1')).toContainText('BY STORYTELLERS');
  });

  test('should have navigation with all menu items', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    await expect(nav.getByText('Studio Elysian', { exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: /홈|Home|ホーム/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /회사 소개|About|会社紹介/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /게임 소개|Games|ゲーム/i })).toBeVisible();
  });

  test('should display projects section', async ({ page }) => {
    const projectsSection = page.locator('#projects');
    await expect(projectsSection).toBeVisible();
    await expect(projectsSection.locator('h2')).toBeVisible();
  });

  test('should display stats bar', async ({ page }) => {
    await expect(page.getByText('2022', { exact: true })).toBeVisible();
    await expect(page.getByText('3+')).toBeVisible();
    await expect(page.getByText('296%')).toBeVisible();
  });

  test('should have working language switcher', async ({ page }) => {
    const langSwitcher = page.locator('[data-testid="language-switcher"]');
    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      await expect(page.getByText('English')).toBeVisible();
      await expect(page.getByText('日本語')).toBeVisible();
    }
  });

  test('should have footer with social links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText('Studio Elysian', { exact: true })).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('mobile navigation should have hamburger menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const hamburger = page.locator('[data-testid="mobile-menu-button"]');
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    }
  });
});
