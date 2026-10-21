import { test, expect } from '@playwright/test';

test.describe('Home — title screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ko');
  });

  test('cover shows the studio title in manuscript cells', async ({ page }) => {
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toContainText('스튜디오');
    await expect(h1).toContainText('엘리시안');
  });

  test('game-style menu links to the main areas', async ({ page }) => {
    await expect(page.getByTestId('menu-start')).toHaveAttribute('href', /\/games$/);
    await expect(page.getByTestId('menu-studio')).toHaveAttribute('href', /\/about$/);
    await expect(page.getByTestId('menu-habom')).toHaveAttribute('href', /\/habom$/);
    await expect(page.getByTestId('menu-news')).toHaveAttribute('href', /\/news$/);
  });

  test('menu can be driven with the keyboard', async ({ page }) => {
    await page.getByTestId('menu-start').focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByTestId('menu-continue')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/ko\/about\/?$/);
  });

  test('"continue" is disabled until a work has been opened, then resumes it', async ({ page }) => {
    await page.getByTestId('menu-continue').click({ force: true });
    await expect(page.getByRole('status')).toContainText('아직 펼친 이야기가 없어요');

    await page.goto('/ko/games/memorial-circuit');
    await page.waitForFunction(() => !!localStorage.getItem('se:last')); // RememberGame 이 기억하는 시점까지 기다린다
    await page.goto('/ko');
    const cont = page.getByTestId('menu-continue');
    await expect(cont).toHaveAttribute('href', '/ko/games/memorial-circuit');
    await expect(cont).toContainText('메모리얼 서킷');
  });

  test('work strips are links to Elysian works only (no Habom work)', async ({ page }) => {
    const strips = page.getByRole('list', { name: '엘리시안의 작품' }).getByRole('link');
    await expect(strips).toHaveCount(4);
    await expect(page.getByRole('list', { name: '엘리시안의 작품' })).not.toContainText('셰어하우스');
  });

  test('has a Habom gateway section', async ({ page }) => {
    await expect(page.getByRole('link', { name: '하봄 둘러보기' })).toHaveAttribute('href', /\/habom$/);
  });

  test('footer shows the colophon with company information', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText('주식회사 스튜디오엘리시안');
    await expect(footer.locator('a[href*="x.com"]')).toBeVisible();
    await expect(footer.locator('a[href*="youtube"]')).toBeVisible();
    await expect(footer.locator('a[href*="instagram"]')).toBeVisible();
  });

  test('theme toggle switches to night and is remembered', async ({ page, isMobile }) => {
    test.skip(isMobile, '휴대폰에서는 테마 토글이 메뉴 안에 있다');
    await page.getByRole('button', { name: '화면 테마 전환' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  });

  test('no horizontal overflow', async ({ page }) => {
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(sw).toBeLessThanOrEqual(cw);
  });
});

test.describe('Home — mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('hamburger opens a focus-trapped menu that closes with Escape', async ({ page }) => {
    await page.goto('/ko');
    const btn = page.getByTestId('mobile-menu-button');
    await btn.click();
    const menu = page.getByTestId('mobile-menu');
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('link', { name: '작품' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
    await expect(btn).toBeFocused();
  });

  test('no horizontal overflow at 390px', async ({ page }) => {
    for (const path of ['/ko', '/ko/games', '/ko/games/memorial-circuit']) {
      await page.goto(path);
      const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(sw, path).toBeLessThanOrEqual(cw);
    }
  });
});
