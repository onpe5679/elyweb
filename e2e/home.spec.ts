import { test, expect } from '@playwright/test';

test.describe('Home — cover', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ko');
  });

  test('cover shows the studio title (Myeongjo, not manuscript cells)', async ({ page }) => {
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toContainText('스튜디오');
    await expect(h1).toContainText('엘리시안');
    await expect(h1.locator('.cell')).toHaveCount(0);
  });

  test('menu: 스튜디오 소개 · 작품 · 새 소식 · 문의 (no "start"/"continue")', async ({ page }) => {
    await expect(page.getByTestId('menu-studio')).toHaveAttribute('href', /\/about$/);
    await expect(page.getByTestId('menu-works')).toHaveAttribute('href', /\/games$/);
    await expect(page.getByTestId('menu-news')).toHaveAttribute('href', /\/news$/);
    await expect(page.getByTestId('menu-contact')).toHaveAttribute('href', /\/contact$/);
    await expect(page.getByTestId('menu-start')).toHaveCount(0);
    await expect(page.getByTestId('menu-continue')).toHaveCount(0);
  });

  test('menu can be driven with the keyboard', async ({ page }) => {
    await page.getByTestId('menu-studio').focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByTestId('menu-works')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/ko\/games\/?$/);
  });

  test('work strips: Elysian works only, featured first, labelled by release year', async ({ page }) => {
    const list = page.getByRole('list', { name: '엘리시안의 작품' });
    const strips = list.getByRole('link');
    await expect(strips).toHaveCount(4);
    await expect(list).not.toContainText('셰어하우스');
    await expect(strips.first()).toHaveAttribute('aria-label', /시엘라의 사건수기/);
    await expect(list).not.toContainText('No.');
    await expect(list).toContainText('2024');
    await expect(list).toContainText('Coming Soon');
  });

  test('"현재 펼쳐진 이야기" shows the featured work (is_featured)', async ({ page }) => {
    const works = page.locator('#works');
    await expect(works.getByRole('heading', { level: 3 }).first()).toContainText('시엘라의 사건수기');
  });

  test('no theme toggle; Habom is a floating button', async ({ page }) => {
    await expect(page.getByRole('button', { name: '화면 테마 전환' })).toHaveCount(0);
    const fab = page.getByTestId('habom-fab');
    await expect(fab).toBeVisible();
    await expect(fab).toHaveAttribute('href', /\/habom$/);
  });

  test('has a Habom gateway section', async ({ page }) => {
    await expect(page.getByRole('link', { name: /하봄 둘러보기/ })).toHaveAttribute('href', /\/habom$/);
    // 2026-11 회의: "산하 스튜디오" 대신 "미연시 스튜디오"
    await expect(page.locator('#habom-title').locator('xpath=..')).toContainText('미연시 스튜디오');
    await expect(page.getByText('산하 스튜디오')).toHaveCount(0);
  });

  test('footer shows the colophon with company information', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText('주식회사 스튜디오엘리시안');
    await expect(footer.locator('a[href*="x.com"]')).toBeVisible();
    await expect(footer.locator('a[href*="youtube"]')).toBeVisible();
    await expect(footer.locator('a[href*="instagram"]')).toBeVisible();
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
    // 패널이 헤더 아래 화면 전체를 덮어야 한다(부모 backdrop-filter 에 갇혀 64px 띠가 되던 버그 회귀 방지)
    const box = await menu.boundingBox();
    const vh = page.viewportSize()!.height;
    expect(box!.height).toBeGreaterThan(vh - 64 - 2);
    for (const name of ['스튜디오 소개', '작품', '새 소식', '문의', '프레스', '하봄 스튜디오']) {
      const link = menu.getByRole('link', { name, exact: true });
      await expect(link).toBeInViewport();
    }
    // 실제로 손가락이 닿는 곳에 있는지(다른 요소에 가려지지 않음)
    const last = menu.getByRole('link', { name: '프레스', exact: true });
    const hit = await last.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
    });
    expect(hit).toBe(true);
    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
    await expect(btn).toBeFocused();
  });

  test('language can be changed from the mobile menu', async ({ page }) => {
    await page.goto('/ko/games');
    await page.getByTestId('mobile-menu-button').click();
    const langs = page.getByTestId('mobile-menu').getByTestId('language-menu').getByRole('link');
    await expect(langs).toHaveText(['한국어', 'English', '日本語']);
    await expect(langs.nth(1)).toBeInViewport();
    await langs.nth(1).click();
    await expect(page).toHaveURL(/\/en\/games\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByTestId('mobile-menu')).toHaveCount(0);
  });

  test('menu link navigates and closes the menu', async ({ page }) => {
    await page.goto('/ko');
    await page.getByTestId('mobile-menu-button').click();
    await page.getByTestId('mobile-menu').getByRole('link', { name: '문의', exact: true }).click();
    await expect(page).toHaveURL(/\/ko\/contact\/?$/);
    await expect(page.getByTestId('mobile-menu')).toHaveCount(0);
  });

  test('no horizontal overflow at 390px', async ({ page }) => {
    for (const path of ['/ko', '/ko/games', '/ko/games/memorial-circuit', '/ko/press', '/ko/contact']) {
      await page.goto(path);
      const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(sw, path).toBeLessThanOrEqual(cw);
    }
  });
});
