import { test, expect } from '@playwright/test';

test.describe('Internationalization (ko / en / ja)', () => {
  test('root redirects to a locale', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(ko|en|ja)\/?$/);
  });

  for (const [loc, title, work] of [
    ['ko', '스튜디오', '메모리얼 서킷'],
    ['en', 'STUDIO', 'Memorial Circuit'],
    ['ja', 'スタジオ', 'メモリアルサーキット'],
  ] as const) {
    test(`${loc}: html lang, cover title and work names`, async ({ page }) => {
      await page.goto(`/${loc}`);
      await expect(page.locator('html')).toHaveAttribute('lang', loc);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(title);
      await expect(page.getByRole('main')).toContainText(work);
    });

    test(`${loc}: pages do not overflow at 390px`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      for (const path of ['', '/games', '/games/sharehouse', '/habom', '/about', '/contact']) {
        await page.goto(`/${loc}${path}`);
        const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
        expect(sw, `${loc}${path}`).toBeLessThanOrEqual(cw);
      }
    });
  }

  test('language switcher keeps the current page', async ({ page, isMobile }) => {
    test.skip(isMobile, '휴대폰에서는 언어 전환이 메뉴 안에 있다');
    await page.goto('/ko/games');
    await page.getByRole('group', { name: '언어' }).getByRole('link', { name: 'EN' }).click();
    await expect(page).toHaveURL(/\/en\/games\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Works');
    await page.getByRole('group', { name: 'Language' }).getByRole('link', { name: 'JA' }).click();
    await expect(page).toHaveURL(/\/ja\/games\/?$/);
  });
});
