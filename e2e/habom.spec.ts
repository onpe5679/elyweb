import { test, expect, type Page } from '@playwright/test';

/** 미니 체험: 새 게임 → (이름) → 프롤로그 시작까지 */
async function newGame(page: Page, name?: string) {
  const stage = page.getByTestId('demo-stage');
  await stage.scrollIntoViewIfNeeded();
  await stage.getByTestId('demo-new').click();
  if (name) await stage.getByTestId('demo-name').fill(name);
  await stage.getByTestId('demo-name-ok').click();
  await expect(stage.getByTestId('demo-line')).toBeAttached();
  return stage;
}

/** 프롤로그를 빨리 넘겨 장면 선택에서 pick 번째 장면을 연다 */
async function openScene(page: Page, pick = 0) {
  const stage = await newGame(page);
  await stage.getByTestId('demo-skip').click();
  await expect(stage.getByTestId('demo-choice')).toHaveCount(2, { timeout: 60_000 });
  await stage.getByTestId('demo-choice').nth(pick).click();
  await expect(stage.getByTestId('demo-line')).toBeAttached();
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
  const txt = await page.getByTestId('demo-counter').innerText();
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
  // 프롤로그(202줄)와 장면을 빨리 넘기는 테스트가 있어 넉넉하게
  test.describe.configure({ timeout: 90_000 });
  test.beforeEach(async ({ page }) => {
    // 이전 테스트의 저장·설정이 섞이지 않게
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('e2e-cleared')) {
        localStorage.removeItem('sharehouse-demo:saves');
        localStorage.removeItem('sharehouse-demo:settings');
        sessionStorage.setItem('e2e-cleared', '1');
      }
    });
  });

  test('is part of the page: the hero button only scrolls to it, no dialog or new window', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    const heroLink = page.getByTestId('game-banner').getByRole('link', { name: /미니 체험/ });
    await expect(heroLink).toHaveAttribute('href', '#demo');
    await heroLink.click();
    await expect(page).toHaveURL(/#demo$/);
    const stage = page.locator('#demo').getByTestId('demo-stage');
    await expect(stage).toBeInViewport();
    await expect(page.locator('#demo dialog, #demo [role="dialog"]')).toHaveCount(0);
    // 게임 타이틀 화면(메인 일러스트 + 로고 + 메뉴)
    await expect(stage.locator('img[src*="/habom/sharehouse-demo/img/title.webp"]')).toHaveCount(1);
    await expect(stage.getByTestId('demo-new')).toBeVisible();
    await expect(stage.getByTestId('demo-continue')).toBeDisabled();
    // 소리는 시작 전에는 나오지 않는다
    await expect(stage).toHaveAttribute('data-bgm', '');
  });

  test('new game: the prologue plays with the game UI, default name and real art', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ko/games/sharehouse');
    const stage = await newGame(page);
    expect(await lineNo(page)).toBe(1);
    await expect(stage).toHaveAttribute('data-bgm', /.+/);
    // 프롤로그 3번째 줄은 주인공 대사 — 이름을 비우면 영상처럼 "플레이어"
    await next(page, 2);
    await expect(stage.getByTestId('demo-text')).toContainText('플레이어');
    // 집에 들어가 지혜가 나오는 장면(대사 뒤쪽)까지 넘긴다
    for (let i = 0; i < 60 && !(await stage.locator('img[data-char="jihye"]').count()); i++) await next(page, 1);
    await expect(stage.locator('img[data-char="jihye"]')).toHaveAttribute('src', /\/sharehouse-demo\/img\/stand\/jihye-/);
    await expect(stage.locator('img[src*="/sharehouse-demo/img/bg/living-day"]')).toHaveCount(1);
    // 빠른 메뉴(게임과 같은 키 안내)
    for (const id of ['demo-menu', 'demo-auto', 'demo-skip', 'demo-log-button', 'demo-hide', 'demo-next']) await expect(stage.getByTestId(id)).toBeVisible();
    await expect(page.getByTestId('demo-live')).not.toBeEmpty();
  });

  test('Enter/Space advance only while the stage has focus (page keys are left alone)', async ({ page, isMobile }) => {
    test.skip(isMobile, '키보드 시나리오');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ko/games/sharehouse');
    await newGame(page);
    const advance = page.getByTestId('demo-line');
    const text = page.getByTestId('demo-text');
    await expect(advance).toBeFocused();
    await expect(text).toContainText('▼');
    await page.keyboard.press('Enter');
    await expect.poll(() => lineNo(page)).toBe(2);
    await expect(text).toContainText('▼');
    await page.keyboard.press(' ');
    await expect.poll(() => lineNo(page)).toBe(3);
    // 게임 단축키: A 자동 진행, H UI 숨기기
    await page.keyboard.press('a');
    await expect(page.getByTestId('demo-auto')).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('a');
    // Ctrl 은 누르고 있는 동안만 스킵
    await page.keyboard.down('Control');
    await expect(page.getByTestId('demo-skip')).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.up('Control');
    await expect(page.getByTestId('demo-skip')).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.press('h');
    await expect(text).toHaveCount(0);
    await advance.click();
    await expect(text).toBeVisible();
    // 무대 밖에 포커스가 있으면 Space 는 페이지 스크롤에 쓰인다
    await page.locator('#demo h2').click();
    const y = await page.evaluate(() => window.scrollY);
    const before = await lineNo(page);
    await page.keyboard.press(' ');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(y);
    expect(await lineNo(page)).toBe(before);
  });

  test('skip the prologue, choose a scene, reach the ending; the other scene and restart work', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    const stage = await openScene(page, 1);
    await expect(page.getByTestId('demo-progress')).not.toHaveAttribute('aria-valuenow', '100');
    await stage.getByTestId('demo-skip').click();
    const end = stage.getByTestId('demo-end');
    await expect(end).toBeVisible({ timeout: 60_000 });
    await expect(end.getByRole('link', { name: /Steam/ })).toHaveAttribute('href', /steampowered/);
    await expect(page.getByTestId('demo-progress')).toHaveAttribute('aria-valuenow', '100');
    await end.getByRole('button', { name: '다른 장면 보기' }).click();
    await expect(stage.getByTestId('demo-line')).toBeAttached();
    expect(await lineNo(page)).toBe(1);
    await next(page, 2);
    expect(await lineNo(page)).toBe(3);
    await stage.getByTestId('demo-menu').click();
    await stage.getByTestId('demo-restart').click();
    expect(await lineNo(page)).toBe(1);
  });

  test('backlog lists past lines (L key) and closes with Escape', async ({ page, isMobile }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ko/games/sharehouse');
    const stage = await newGame(page);
    await next(page, 12);
    if (isMobile) await stage.getByTestId('demo-log-button').click();
    else await page.keyboard.press('l');
    const log = stage.getByTestId('demo-log');
    await expect(log.locator('li')).toHaveCount(13);
    await page.keyboard.press('Escape');
    await expect(log).toHaveCount(0);
  });

  test('save to a slot, back to title, and continue from there', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ko/games/sharehouse');
    const stage = await newGame(page, '하루');
    await next(page, 5);
    expect(await lineNo(page)).toBe(6);
    await stage.getByTestId('demo-menu').click();
    await stage.getByTestId('demo-open-save').click();
    await stage.getByTestId('demo-save-slot').first().click();
    await expect(stage.getByTestId('demo-save-slot').first()).toContainText('프롤로그 · 6');
    await page.keyboard.press('Escape');
    await stage.getByTestId('demo-to-title').click();
    await page.reload();
    await page.getByTestId('demo-stage').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('demo-continue')).toBeEnabled();
    await page.getByTestId('demo-title-load').click();
    await page.getByTestId('demo-load-slot').nth(1).click();
    await expect.poll(() => lineNo(page)).toBe(6);
  });

  test('sound: volume and mute are remembered; music stops outside the demo', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    const stage = page.getByTestId('demo-stage');
    await stage.scrollIntoViewIfNeeded();
    await stage.getByTestId('demo-title-settings').click();
    const bgm = stage.getByTestId('demo-vol-bgm');
    await bgm.fill('25');
    await stage.getByTestId('demo-mute-check').check();
    await page.reload();
    await page.getByTestId('demo-stage').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('demo-mute')).toHaveAttribute('aria-pressed', 'true');
    await page.getByTestId('demo-mute').click();
    await expect(page.getByTestId('demo-mute')).toHaveAttribute('aria-pressed', 'false');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('sharehouse-demo:settings') || '{}'));
    expect(saved).toMatchObject({ bgm: 0.25, muted: false });
    // 새 게임을 누르면 소리가 켜지고, 구역이 화면 밖으로 나가면 멈췄다가 돌아오면 이어진다
    const stage2 = await newGame(page);
    await expect(stage2).toHaveAttribute('data-bgm', /.+/);
    await expect(stage2).toHaveAttribute('data-sound', 'on');
    await page.locator('#credits').scrollIntoViewIfNeeded();
    await expect(stage2).toHaveAttribute('data-sound', 'paused');
    await stage2.scrollIntoViewIfNeeded();
    await expect(stage2).toHaveAttribute('data-sound', 'on');
  });

  test('the player name replaces the protagonist name tag and <PlayerName> in text', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ko/games/sharehouse');
    const stage = await newGame(page, '하루');
    await next(page, 2);
    await expect(stage.getByTestId('demo-text')).toContainText('하루');
  });

  test('uses the localized script', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ja/games/sharehouse');
    const stage = await newGame(page);
    await next(page, 2);
    await expect(stage.getByTestId('demo-text')).toContainText('プレイヤー');
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
    await stage.getByTestId('demo-skip').click();
    await expect(stage.getByTestId('demo-end')).toBeVisible({ timeout: 60_000 });
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(sw).toBeLessThanOrEqual(cw);
  });
});
