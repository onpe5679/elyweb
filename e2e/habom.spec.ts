import { test, expect, type Page } from '@playwright/test';

/** 미니 체험 창을 엔딩 카드까지 진행한다. 선택지는 pick 번째를 고른다. */
async function playThrough(page: Page, pick = 0) {
  for (let i = 0; i < 80; i++) {
    if (await page.getByTestId('demo-end').isVisible().catch(() => false)) return;
    const choice = page.getByTestId('demo-choice');
    if (await choice.first().isVisible().catch(() => false)) {
      await choice.nth(pick).click();
    } else {
      await page.getByTestId('demo-line').click();
    }
    await page.waitForTimeout(40);
  }
  throw new Error('demo did not reach the ending');
}

test.describe('Habom Studio home (concept C chrome)', () => {
  test('shows the Habom home with its works and a way back to Elysian', async ({ page }) => {
    await page.goto('/ko/habom');
    await expect(page.locator('[data-brand="habom"]').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: '하봄 스튜디오' })).toBeVisible();
    await expect(page.getByTestId('habom-game-card')).toHaveCount(1);
    await expect(page.getByTestId('habom-to-elysian')).toHaveAttribute('href', /\/ko\/?$/);
    // 임시 워드마크 안내는 푸터에 남아 있다
    await expect(page.locator('footer')).toContainText('임시 워드마크');
  });

  test('a work card leads to its detail page, and "미니 체험" opens the demo there', async ({ page }) => {
    await page.goto('/ko/habom');
    const card = page.getByTestId('habom-game-card').first();
    await card.getByRole('link', { name: /미니 체험/ }).click();
    await expect(page).toHaveURL(/\/ko\/games\/sharehouse\/?(#demo)?$/);
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});

test.describe('Habom game detail', () => {
  test('follows the meeting layout: stores in the hero, exhibitions in the info, no history section', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    const hero = page.getByTestId('game-banner');
    await expect(hero.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(hero.getByTestId('game-stores').getByRole('link', { name: /Steam/ })).toHaveAttribute('href', /steampowered/);
    await expect(page.getByTestId('game-exhibitions')).toContainText('플레이엑스포');
    await expect(page.locator('#history')).toHaveCount(0);
    await expect(page.locator('#store')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: '연혁' })).toHaveCount(0);
    // 이미지 구역에는 제목이 없다
    await expect(page.locator('#gallery h2')).toHaveCount(0);
    await expect(page.getByTestId('credits')).toBeVisible();
  });

  test('section numbers stay sequential', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    const badges = page.locator('main section h2').locator('xpath=preceding-sibling::span[1]');
    const nums = (await badges.allInnerTexts()).map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
    expect(nums.length).toBeGreaterThan(1);
    nums.forEach((n, i) => expect(n).toBe(i + 1));
  });

  test('the image carousel scrolls sideways with its buttons', async ({ page, isMobile }) => {
    test.skip(isMobile, '데스크톱 폭에서 이미지가 넘칠 때만 버튼이 보인다');
    await page.goto('/ko/games/sharehouse');
    const list = page.locator('#gallery ul').first();
    await list.scrollIntoViewIfNeeded();
    const next = page.locator('#gallery').getByRole('button', { name: '다음 이미지' });
    if (!(await next.isVisible().catch(() => false))) test.skip(true, '이미지가 한 화면에 다 들어간다');
    const before = await list.evaluate((el) => el.scrollLeft);
    await next.click();
    await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
  });
});

test.describe('Mini demo (Habom only)', () => {
  test('opens from the hero, labelled as a sample script', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    await page.getByTestId('game-banner').getByRole('button', { name: /미니 체험/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByTestId('demo-draft-badge')).toContainText('시안용 예시 대본');
  });

  test('advance, choose, reach the ending and play again', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    await page.getByTestId('demo-preview').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await playThrough(page, 1);
    await expect(page.getByTestId('demo-end')).toBeVisible();
    await page.getByTestId('demo-end').getByRole('button', { name: '다시 하기' }).click();
    await expect(page.getByTestId('demo-line')).toBeVisible();
  });

  test('Escape closes it and returns focus to the opener', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    const opener = page.getByTestId('demo-preview');
    await opener.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test('?demo=1 opens it once and the param is removed', async ({ page }) => {
    await page.goto('/ko/games/sharehouse?demo=1');
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(page.url()).not.toContain('demo=1');
    await page.getByTestId('demo-close').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('is never offered on Elysian works', async ({ page }) => {
    for (const slug of ['memorial-circuit', 'IBAT', 'cella', 'festival-not-over']) {
      await page.goto(`/ko/games/${slug}?demo=1`);
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.getByRole('button', { name: /미니 체험/ })).toHaveCount(0);
    }
  });

  test('works on a phone viewport without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/ko/games/sharehouse?demo=1');
    await expect(page.getByRole('dialog')).toBeVisible();
    await playThrough(page);
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(sw).toBeLessThanOrEqual(cw);
  });
});
