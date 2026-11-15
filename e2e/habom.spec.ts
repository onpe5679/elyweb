import { test, expect, type Page } from '@playwright/test';

/** 미니 체험: 시작 → 장면(pick 번째) 고르기까지 */
async function openScene(page: Page, pick = 0) {
  const stage = page.getByTestId('demo-stage');
  await stage.scrollIntoViewIfNeeded();
  await stage.getByTestId('demo-start').click();
  await expect(stage.getByTestId('demo-choice')).toHaveCount(2);
  await stage.getByTestId('demo-choice').nth(pick).click();
  await expect(stage.getByTestId('demo-line')).toBeVisible();
  return stage;
}

/** 타자 효과가 끝날 때(▼)까지 기다렸다가 다음 줄로 */
async function next(page: Page, times = 1) {
  const stage = page.getByTestId('demo-stage');
  for (let i = 0; i < times; i++) {
    await expect(stage.getByTestId('demo-text')).toContainText('▼');
    await stage.getByTestId('demo-line').click();
  }
}

/** 진행 표시("3 / 147")의 현재 줄 번호 */
async function lineNo(page: Page) {
  const txt = await page.locator('#demo').getByText(/^\d+ \/ \d+$/).innerText();
  return Number(txt.split('/')[0].trim());
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

  test('a work card leads to its detail page, and "미니 체험" goes to the demo section there', async ({ page }) => {
    await page.goto('/ko/habom');
    const card = page.getByTestId('habom-game-card').first();
    const link = card.getByRole('link', { name: /미니 체험/ });
    await expect(link).toHaveAttribute('href', /\/games\/sharehouse\/?#demo$/);
    await link.click();
    await expect(page).toHaveURL(/\/ko\/games\/sharehouse\/?#demo$/);
    await expect(page.getByTestId('demo-stage')).toBeInViewport();
    await expect(page.getByRole('dialog')).toHaveCount(0);
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

test.describe('Mini demo (Habom only, inline)', () => {
  test('is part of the page: the hero button only scrolls to it, no dialog or new window', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    const heroLink = page.getByTestId('game-banner').getByRole('link', { name: /미니 체험/ });
    await expect(heroLink).toHaveAttribute('href', '#demo');
    await heroLink.click();
    await expect(page).toHaveURL(/#demo$/);
    const stage = page.locator('#demo').getByTestId('demo-stage');
    await expect(stage).toBeInViewport();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('#demo dialog, #demo [role="dialog"]')).toHaveCount(0);
    // 실제 게임 리소스(타이틀 그림·로고)를 쓴다
    await expect(stage.locator('img[src*="/habom/sharehouse-demo/img/title.webp"]')).toHaveCount(1);
    await expect(page.getByTestId('demo-sample-badge')).toHaveCount(0);
  });

  test('start, pick a scene, advance lines with the real script and art', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    const stage = await openScene(page, 0);
    expect(await lineNo(page)).toBe(1);
    await next(page, 10); // 11번째 줄 = 지혜 등장
    expect(await lineNo(page)).toBe(11);
    await expect(stage.getByTestId('demo-text')).toContainText('류지혜');
    await expect(stage.locator('img[src*="/sharehouse-demo/img/stand/jihye-"]')).toHaveCount(1);
    await expect(stage.locator('img[src*="/sharehouse-demo/img/bg/"]')).toHaveCount(1);
    await expect(page.getByTestId('demo-live')).not.toBeEmpty();
  });

  test('Enter/Space advance only while the stage has focus (page keys are left alone)', async ({ page, isMobile }) => {
    test.skip(isMobile, '키보드 시나리오');
    await page.emulateMedia({ reducedMotion: 'reduce' }); // 타자 효과 없이 한 번에
    await page.goto('/ko/games/sharehouse');
    await openScene(page, 1);
    const advance = page.getByTestId('demo-line');
    const text = page.getByTestId('demo-text');
    await expect(advance).toBeFocused();
    await expect(text).toContainText('▼');
    await page.keyboard.press('Enter');
    await expect.poll(() => lineNo(page)).toBe(2);
    await expect(text).toContainText('▼');
    await page.keyboard.press(' ');
    await expect.poll(() => lineNo(page)).toBe(3);
    // 무대 밖에 포커스가 있으면 Space 는 페이지 스크롤에 쓰인다
    await page.locator('#demo h2').click();
    const y = await page.evaluate(() => window.scrollY);
    await page.keyboard.press(' ');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(y);
    expect(await lineNo(page)).toBe(3);
  });

  test('fast-forward reaches the ending card; the other scene and restart work', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    const stage = await openScene(page, 1);
    await page.getByTestId('demo-skip').click();
    const end = stage.getByTestId('demo-end');
    await expect(end).toBeVisible({ timeout: 30_000 });
    await expect(end.getByRole('link', { name: /Steam/ })).toHaveAttribute('href', /steampowered/);
    await expect(page.getByTestId('demo-progress')).toHaveAttribute('aria-valuenow', '100');
    await end.getByRole('button', { name: '다른 장면 보기' }).click();
    await expect(stage.getByTestId('demo-line')).toBeVisible();
    expect(await lineNo(page)).toBe(1);
    await next(page, 2);
    expect(await lineNo(page)).toBe(3);
    await page.getByTestId('demo-restart').click();
    expect(await lineNo(page)).toBe(1);
  });

  test('backlog lists past lines and closes with Escape', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ko/games/sharehouse');
    const stage = await openScene(page, 0);
    await next(page, 12);
    await page.getByTestId('demo-log-button').click();
    const log = stage.getByTestId('demo-log');
    await expect(log.locator('li')).toHaveCount(13);
    await page.keyboard.press('Escape');
    await expect(log).toHaveCount(0);
  });

  test('the player name replaces the protagonist name tag', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ko/games/sharehouse');
    const stage = page.getByTestId('demo-stage');
    await stage.scrollIntoViewIfNeeded();
    await stage.getByTestId('demo-name').fill('하루');
    await stage.getByTestId('demo-start').click();
    await stage.getByTestId('demo-choice').first().click();
    await expect(stage.getByTestId('demo-text')).toContainText('하루');
  });

  test('uses the localized script', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ja/games/sharehouse');
    const stage = await openScene(page, 1);
    await next(page, 10); // 11번째 줄 = 세은(紗夜) 등장
    await expect(stage.getByTestId('demo-text')).toContainText('紗夜');
  });

  test('is never offered on Elysian works', async ({ page }) => {
    for (const slug of ['memorial-circuit', 'IBAT', 'cella', 'festival-not-over']) {
      await page.goto(`/ko/games/${slug}`);
      await expect(page.getByTestId('demo-stage')).toHaveCount(0);
      await expect(page.getByRole('link', { name: /미니 체험/ })).toHaveCount(0);
    }
  });

  test('fits a phone viewport without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/ko/games/sharehouse');
    const stage = await openScene(page, 0);
    await page.getByTestId('demo-skip').click();
    await expect(stage.getByTestId('demo-end')).toBeVisible({ timeout: 30_000 });
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(sw).toBeLessThanOrEqual(cw);
  });
});
