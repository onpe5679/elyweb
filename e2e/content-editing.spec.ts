import { test, expect } from '@playwright/test';

/**
 * Verifies the admin → web editing pipeline end-to-end:
 * editing a company_settings value in the real admin UI is reflected on the
 * public site. Non-destructive: captures the original value and restores it.
 *
 * Requires a running admin (localhost:5175) + web (localhost:3000) wired to a
 * Supabase backend, and admin credentials via env. Skipped otherwise.
 */
const ADMIN_URL = 'http://localhost:5175';

test.describe('Admin → Web content editing pipeline', () => {
  test.skip(({}, _testInfo) => !process.env.ADMIN_TEST_EMAIL, 'Requires admin credentials');

  test('editing vision_body in admin is reflected on the home page', async ({ page }) => {
    const marker = `VISION_E2E_${Date.now()}`;

    // --- login ---
    await page.goto(ADMIN_URL);
    await page.getByRole('textbox', { name: /email/i }).fill(process.env.ADMIN_TEST_EMAIL!);
    await page.getByRole('textbox', { name: /password/i }).fill(process.env.ADMIN_TEST_PASSWORD!);
    await page.getByRole('button', { name: /sign in|login|로그인/i }).click();
    await expect(page.getByRole('menuitem', { name: /settings|설정/i })).toBeVisible({ timeout: 15000 });

    // --- open the vision_body setting ---
    await page.goto(`${ADMIN_URL}/#/company_settings`);
    await page.getByText('vision_body', { exact: true }).click();

    const koField = page.locator('textarea[name="value_ko"]').first();
    await expect(koField).toBeVisible({ timeout: 10000 });
    const original = await koField.inputValue();

    // --- set a unique marker and save ---
    await koField.fill(marker);
    await page.getByRole('button', { name: /save|저장/i }).click();

    try {
      // --- verify on the public home page ---
      await page.goto('http://localhost:3000/ko', { waitUntil: 'networkidle' });
      await expect(page.getByText(marker)).toBeVisible({ timeout: 15000 });
    } finally {
      // --- restore the original value (non-destructive) ---
      await page.goto(`${ADMIN_URL}/#/company_settings`);
      await page.getByText('vision_body', { exact: true }).click();
      const restoreField = page.locator('textarea[name="value_ko"]').first();
      await expect(restoreField).toBeVisible({ timeout: 10000 });
      await restoreField.fill(original);
      await page.getByRole('button', { name: /save|저장/i }).click();
    }
  });
});
