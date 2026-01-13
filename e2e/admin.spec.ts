import { test, expect } from '@playwright/test';

test.describe('Admin Site', () => {
  const ADMIN_URL = 'http://localhost:5175';

  test('should load admin page', async ({ page }) => {
    const response = await page.goto(ADMIN_URL);
    expect(response?.status()).toBe(200);
    
    const pageTitle = await page.title();
    expect(pageTitle).toContain('Studio Elysian');
  });

  test('should show error on invalid credentials', async ({ page }) => {
    test.skip(true, 'Login error testing requires specific UI elements');
  });
});

test.describe('Admin Dashboard (Authenticated)', () => {
  const ADMIN_URL = 'http://localhost:5175';
  
  test.skip(({ }, testInfo) => !process.env.ADMIN_TEST_EMAIL, 'Requires admin credentials');

  test.beforeEach(async ({ page }) => {
    await page.goto(ADMIN_URL);
    
    await page.getByRole('textbox', { name: /email/i }).fill(process.env.ADMIN_TEST_EMAIL!);
    await page.getByRole('textbox', { name: /password/i }).fill(process.env.ADMIN_TEST_PASSWORD!);
    await page.getByRole('button', { name: /sign in|login/i }).click();
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should display dashboard after login', async ({ page }) => {
    await expect(page.getByText(/dashboard|대시보드/i)).toBeVisible();
  });

  test('should have Games resource in menu', async ({ page }) => {
    await expect(page.getByRole('menuitem', { name: /games|게임/i })).toBeVisible();
  });

  test('should have News resource in menu', async ({ page }) => {
    await expect(page.getByRole('menuitem', { name: /news|뉴스|새소식/i })).toBeVisible();
  });

  test('should have Timeline resource in menu', async ({ page }) => {
    await expect(page.getByRole('menuitem', { name: /timeline|연혁/i })).toBeVisible();
  });

  test('should have Settings resource in menu', async ({ page }) => {
    await expect(page.getByRole('menuitem', { name: /settings|설정/i })).toBeVisible();
  });

  test('should navigate to Games list', async ({ page }) => {
    await page.getByRole('menuitem', { name: /games|게임/i }).click();
    await expect(page.getByRole('heading', { name: /games|게임/i })).toBeVisible();
  });

  test('should be able to create new game', async ({ page }) => {
    await page.getByRole('menuitem', { name: /games|게임/i }).click();
    await page.getByRole('button', { name: /create|새로 만들기/i }).click();
    
    await expect(page.getByRole('textbox', { name: /slug/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /title/i })).toBeVisible();
  });
});
