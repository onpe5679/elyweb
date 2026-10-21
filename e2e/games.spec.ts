import { test, expect } from '@playwright/test';

test.describe('Works list', () => {
  test('lists every work as a spread with a status marker', async ({ page }) => {
    await page.goto('/ko/games');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('작품');
    const cards = page.locator('[data-testid="game-card"]');
    await expect(cards).toHaveCount(5);
    await expect(cards.first()).toBeVisible();
  });

  test('series filter narrows the list', async ({ page }) => {
    await page.goto('/ko/games');
    const filter = page.getByTestId('series-filter');
    await filter.getByRole('button', { name: 'Old Engine Series' }).click();
    await expect(page.locator('[data-testid="game-card"]')).toHaveCount(3);
    await filter.getByRole('button', { name: '전체' }).click();
    await expect(page.locator('[data-testid="game-card"]')).toHaveCount(5);
  });

  test('image and title both open the detail page', async ({ page }) => {
    await page.goto('/ko/games');
    await page.locator('[data-testid="game-card"]').first().getByRole('link').first().click();
    await expect(page).toHaveURL(/\/games\/.+/);
  });
});

test.describe('Game detail — Elysian work (Memorial Circuit)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ko/games/memorial-circuit');
  });

  test('hero shows key visual, title, series and the main store button', async ({ page }) => {
    await expect(page.getByTestId('game-banner')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('메모리얼 서킷');
    await expect(page.getByRole('link', { name: /Steam에서 보기/ })).toHaveAttribute('href', /store\.steampowered\.com/);
  });

  test('sticky tabs exist only for sections that have content', async ({ page }) => {
    const tabs = page.getByRole('navigation', { name: '작품 상세 구역' });
    for (const name of ['소개', '도판', '영상', '제작진', '연혁']) {
      await expect(tabs.getByRole('link', { name })).toBeVisible();
    }
  });

  test('synopsis, info panel, credits and timeline render real content', async ({ page }) => {
    const main = page.getByRole('main');
    await expect(main).toContainText('플롯 인더스트리');
    await expect(page.getByRole('complementary', { name: '작품 정보' })).toContainText('Old Engine Series');
    await expect(page.locator('#credits')).toContainText('권요한');
    await expect(page.locator('#history')).toContainText('스팀 출시');
  });

  test('gallery opens a lightbox that can be closed with Escape', async ({ page }) => {
    await page.locator('#gallery button').first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('has no dialogue experience (Habom only)', async ({ page }) => {
    await expect(page.getByRole('button', { name: /체험/ })).toHaveCount(0);
  });

  test('does not overflow horizontally', async ({ page }) => {
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(sw).toBeLessThanOrEqual(cw);
  });
});

test.describe('Game detail — works with little content', () => {
  test('in-development work shows only the sections it has', async ({ page }) => {
    await page.goto('/ko/games/cella');
    const tabs = page.getByRole('navigation', { name: '작품 상세 구역' });
    await expect(tabs.getByRole('link', { name: '소개' })).toBeVisible();
    await expect(tabs.getByRole('link', { name: '영상' })).toHaveCount(0);
    await expect(tabs.getByRole('link', { name: '제작진' })).toHaveCount(0);
  });

  test('unknown slug returns the 404 page', async ({ page }) => {
    const res = await page.goto('/ko/games/nope-not-here');
    expect(res?.status()).toBe(404);
  });
});

test.describe('Game detail — Habom work (Sharehouse)', () => {
  test('uses the Habom brand and offers the dialogue experience', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    await expect(page.locator('[data-brand="habom"]').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('셰어하우스');
    await expect(page.getByRole('button', { name: /체험/ }).first()).toBeVisible();
    await expect(page.getByRole('main')).toContainText(/동거|룸메이트|셰어하우스/);
  });
});
