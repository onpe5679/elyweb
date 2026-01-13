import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('logo should link to home', async ({ page }) => {
    await page.goto('/ko/about');
    await page.locator('nav').getByRole('link').first().click();
    await expect(page).toHaveURL(/\/ko\/?$/);
  });

  test('should navigate to About page', async ({ page }) => {
    await page.locator('nav').getByRole('link', { name: /회사 소개|About|会社紹介/i }).click();
    await expect(page).toHaveURL(/\/about/);
  });

  test('should navigate to Games page', async ({ page }) => {
    await page.locator('nav').getByRole('link', { name: /게임 소개|Games|ゲーム紹介/i }).click();
    await expect(page).toHaveURL(/\/games/);
  });

  test('should navigate to News page', async ({ page }) => {
    await page.locator('nav').getByRole('link', { name: /새소식|News|お知らせ/i }).click();
    await expect(page).toHaveURL(/\/news/);
  });

  test('should navigate to Contact page', async ({ page }) => {
    await page.locator('nav').getByRole('link', { name: /문의하기|Contact|お問い合わせ/i }).click();
    await expect(page).toHaveURL(/\/contact/);
  });

  test('Press button should be visible', async ({ page }) => {
    await expect(page.locator('nav').getByRole('link', { name: 'PRESS' })).toBeVisible();
  });
});

test.describe('Footer Navigation', () => {
  test('footer should have quick links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    
    await expect(footer.getByText(/회사 소개|About/i)).toBeVisible();
    await expect(footer.getByText(/프로젝트|Projects/i)).toBeVisible();
  });

  test('footer should have social links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    
    // Check for social icons
    await expect(footer.locator('a[href*="twitter"], a[href*="x.com"]')).toBeVisible();
    await expect(footer.locator('a[href*="youtube"]')).toBeVisible();
    await expect(footer.locator('a[href*="instagram"]')).toBeVisible();
  });

  test('footer should have copyright notice', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toContainText(/© 2024 Studio Elysian/);
  });
});

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
  });

  test('should show mobile menu button', async ({ page }) => {
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(menuButton).toBeVisible();
  });

  test('should open mobile menu on click', async ({ page }) => {
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await menuButton.click();
    
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();
  });

  test('mobile menu should have all navigation items', async ({ page }) => {
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await menuButton.click();
    
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu.getByRole('link', { name: /홈|Home/i })).toBeVisible();
    await expect(mobileMenu.getByRole('link', { name: /회사 소개|About/i })).toBeVisible();
    await expect(mobileMenu.getByRole('link', { name: /게임|Games/i })).toBeVisible();
  });

  test('should close mobile menu after navigation', async ({ page }) => {
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await menuButton.click();
    
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await mobileMenu.getByRole('link', { name: /회사 소개|About/i }).click();
    
    await expect(mobileMenu).not.toBeVisible();
  });
});
