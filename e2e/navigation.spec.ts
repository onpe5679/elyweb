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

  test('header order: 스튜디오 소개 · 작품 · 새 소식 · 문의 · 프레스 (no 하봄)', async ({ page }) => {
    await expect(nav(page).getByRole('link')).toHaveText(['스튜디오 소개', '작품', '새 소식', '문의', '프레스']);
  });

  for (const [label, url] of [
    ['스튜디오 소개', /\/ko\/about\/?$/],
    ['작품', /\/ko\/games\/?$/],
    ['새 소식', /\/ko\/news\/?$/],
    ['문의', /\/ko\/contact\/?$/],
    ['프레스', /\/ko\/press\/?$/],
  ] as const) {
    test(`header link "${label}" navigates`, async ({ page }) => {
      await nav(page).getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(url);
    });
  }

  test('current page is marked in the header', async ({ page }) => {
    await page.goto('/ko/games');
    await expect(nav(page).getByRole('link', { name: '작품', exact: true })).toHaveAttribute('aria-current', 'page');
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
    for (const name of ['스튜디오 소개', '작품', '새 소식', '문의', '프레스', '하봄 스튜디오']) {
      await expect(footer.getByRole('link', { name, exact: true })).toBeVisible();
    }
    await expect(footer).toContainText(/© \d{4} Studio Elysian/);
    await expect(footer.getByRole('link', { name: '개인정보처리방침' })).toBeVisible();
  });
});

test.describe('Secondary pages render', () => {
  for (const [path, text] of [
    ['/ko/about', /무궁한 이야기의 지평선/],
    ['/ko/news', /새소식|새 소식|News/],
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

  test('about page: history newest first, no team list', async ({ page }) => {
    await page.goto('/ko/about');
    await expect(page.locator('#history')).toBeVisible();
    await expect(page.getByTestId('team-list')).toHaveCount(0);
    const dates = await page.locator('[data-testid="history-table"] tbody th').allInnerTexts();
    const numeric = dates.map((d) => d.trim()).filter((d) => /^\d{4}/.test(d));
    expect(numeric.length).toBeGreaterThan(2);
    expect([...numeric].sort().reverse()).toEqual(numeric);
    // "숫자로 보는 스튜디오"는 2026-11 회의에서 삭제(숫자는 메인 비전에만)
    await expect(page.getByText('숫자로 보는 스튜디오')).toHaveCount(0);
  });

  test('press page: studio kit, then one row of buttons per title (EN / KR / STORE PAGE)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/ko/press');
    await expect(page.getByTestId('press-games').locator('li[id^="press-"]')).toHaveCount(5);
    const fest = page.locator('#press-festival-not-over').getByTestId('press-game-links').getByRole('link');
    await expect(fest).toHaveText([/EN/, /KR/, /STORE PAGE/]);
    await expect(fest.nth(0)).toHaveAttribute('href', /drive\.google\.com\/drive\/folders\//);
    await expect(fest.nth(2)).toHaveAttribute('href', /store\.steampowered\.com\/app\/2946110/);
    await expect(page.locator('#press-memorial-circuit')).not.toContainText('키 비주얼');
    // FHD 첫 화면에 작품별 자료 첫 줄까지 보인다
    const top = await page.locator('#press-cella').evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeLessThan(1080);
  });

  test('contact page is email-only (no form)', async ({ page }) => {
    await page.goto('/ko/contact');
    await expect(page.locator('form')).toHaveCount(0);
    await expect(page.getByTestId('contact-email').getByRole('link').first()).toHaveAttribute('href', 'mailto:contact@studioelysian.co');
    // 공식 SNS 아래 작품별 SNS
    const games = page.getByTestId('contact-game-sns').getByRole('link');
    await expect(games).toHaveCount(3);
    await expect(page.getByTestId('contact-game-sns')).toContainText('@fest_isnt_over');
  });

  test('unknown route shows a branded 404', async ({ page }) => {
    const res = await page.goto('/ko/this-page-does-not-exist');
    expect(res?.status()).toBe(404);
  });
});
