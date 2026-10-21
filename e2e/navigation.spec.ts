import { test, expect } from '@playwright/test';

test.describe('Header navigation (Elysian)', () => {
  test.skip(({ isMobile }) => isMobile, '데스크톱 전용: 휴대폰에서는 햄버거 메뉴(home.spec)로 이동한다');
  test.beforeEach(async ({ page }) => {
    await page.goto('/ko');
  });

  const nav = (page: import('@playwright/test').Page) => page.getByRole('navigation', { name: '주 메뉴' });

  test('logo links to home', async ({ page }) => {
    await page.goto('/ko/about');
    await page.getByRole('link', { name: 'Studio Elysian' }).first().click();
    await expect(page).toHaveURL(/\/ko\/?$/);
  });

  for (const [label, url] of [
    ['작품', /\/ko\/games\/?$/],
    ['스튜디오', /\/ko\/about\/?$/],
    ['새소식', /\/ko\/news\/?$/],
    ['하봄', /\/ko\/habom\/?$/],
    ['문의', /\/ko\/contact\/?$/],
  ] as const) {
    test(`header link "${label}" navigates`, async ({ page }) => {
      await nav(page).getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(url);
    });
  }

  test('current page is marked in the header', async ({ page }) => {
    await page.goto('/ko/games');
    await expect(nav(page).getByRole('link', { name: '작품' })).toHaveAttribute('aria-current', 'page');
  });

  test('press kit is reachable from the footer', async ({ page }) => {
    await page.locator('footer').getByRole('link', { name: '프레스' }).click();
    await expect(page).toHaveURL(/\/press/);
  });
});

test.describe('Footer', () => {
  test('sitemap, social links and copyright', async ({ page }) => {
    await page.goto('/ko');
    const footer = page.locator('footer');
    for (const name of ['작품', '스튜디오', '새소식', '하봄', '문의', '프레스']) {
      await expect(footer.getByRole('link', { name, exact: true })).toBeVisible();
    }
    await expect(footer).toContainText(/© \d{4} Studio Elysian/);
    await expect(footer.getByRole('link', { name: '개인정보처리방침' })).toBeVisible();
  });
});

test.describe('Secondary pages render', () => {
  for (const [path, text] of [
    ['/ko/about', /무궁한 이야기의 지평선/],
    ['/ko/news', /새소식|News/],
    ['/ko/press', /프레스|Press/i],
    ['/ko/contact', /문의|Contact/i],
    ['/ko/privacy', /개인정보/],
    ['/ko/team/gwon-yohan', /권요한/],
  ] as const) {
    test(`${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole('main')).toContainText(text);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    });
  }

  test('about page has the history anchor used by the home page', async ({ page }) => {
    await page.goto('/ko/about');
    await expect(page.locator('#history')).toBeVisible();
  });

  test('unknown route shows a branded 404', async ({ page }) => {
    const res = await page.goto('/ko/this-page-does-not-exist');
    expect(res?.status()).toBe(404);
  });
});
