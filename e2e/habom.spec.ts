import { test, expect, type Page } from '@playwright/test';

/** 체험 오버레이를 끝까지(엔딩 요약까지) 진행한다. 선택지는 pick(i)번을 고른다. */
async function playThrough(page: Page, pick: (n: number) => number = () => 0) {
  const choices = page.getByTestId('exp-choice');
  let made = 0;
  for (let i = 0; i < 120; i++) {
    if (await page.getByTestId('exp-summary').isVisible().catch(() => false)) return;
    if (await choices.first().isVisible().catch(() => false)) {
      await choices.nth(pick(made++)).click();
    } else {
      await page.keyboard.press('Enter');
    }
    await page.waitForTimeout(60);
  }
  throw new Error('experience did not reach an ending');
}

test.describe('Habom brand page', () => {
  test('shows the Habom home with its works and a way back to Elysian', async ({ page }) => {
    await page.goto('/ko/habom');
    await expect(page.locator('[data-brand="habom"]').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByTestId('habom-game-card')).toHaveCount(1);
    await expect(page.getByRole('link', { name: /스튜디오 엘리시안/ }).first()).toHaveAttribute('href', /\/ko\/?$/);
  });

  test('is reachable from the Elysian header and keeps the draft-logo notice', async ({ page, isMobile }) => {
    test.skip(isMobile, '데스크톱 헤더 전용');
    await page.goto('/ko');
    await page.getByRole('navigation', { name: '주 메뉴' }).getByRole('link', { name: '하봄' }).click();
    await expect(page).toHaveURL(/\/ko\/habom\/?$/);
    await expect(page.locator('body')).toContainText('공식 로고');
  });
});

test.describe('Dialogue & choice experience (Habom only)', () => {
  test('opens from the Habom game page, labelled as a draft sample', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    await page.getByRole('button', { name: /체험/ }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId('exp-draft-badge')).toContainText('공식 게임 내용이 아닙니다');
  });

  test('Escape closes it and returns focus to the opener', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    const opener = page.getByRole('button', { name: /체험/ }).first();
    await opener.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test('Tab stays inside the dialog', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    await page.getByRole('button', { name: /체험/ }).first().click();
    const dialog = page.getByRole('dialog');
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
  });

  test('keyboard flow: advance, choose with 1/2/3, reach an ending, restart', async ({ page }) => {
    await page.goto('/ko/games/sharehouse?play=1');
    await expect(page.getByRole('dialog')).toBeVisible();
    // 첫 선택지가 나올 때까지 Enter 로 진행
    for (let i = 0; i < 40 && !(await page.getByTestId('exp-choice').first().isVisible().catch(() => false)); i++) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(60);
    }
    await expect(page.getByTestId('exp-choice')).toHaveCount(3);
    await page.keyboard.press('2');
    await expect(page.getByTestId('exp-choice-count')).toContainText('1');
    await playThrough(page);
    await expect(page.getByTestId('exp-summary')).toBeVisible();
    await expect(page.getByTestId('exp-ending-title')).not.toBeEmpty();
    await page.getByTestId('exp-summary-restart').click();
    await expect(page.getByTestId('exp-summary')).toHaveCount(0);
    await expect(page.getByTestId('exp-box')).toBeVisible();
  });

  test('different choices lead to different endings', async ({ page }) => {
    // 선택지마다 보기가 가리키는 룸메이트가 다르다(experience-script.ts): 같은 사람을 세 번 고르면 그 사람의 엔딩,
    // 한 번씩 고르면 '다 같이' 엔딩. 아래 배열은 [지혜 ×3, 윤하 ×3, 세은 ×3] 이 되는 선택 순서다.
    const routes = { jihye: [1, 2, 0], yunha: [0, 1, 2], saeun: [2, 0, 1] };
    const endings: Record<string, string> = {};
    for (const [who, order] of Object.entries(routes)) {
      await page.goto('/ko/games/sharehouse?play=1');
      await playThrough(page, (n) => order[n]);
      endings[who] = (await page.getByTestId('exp-summary').getAttribute('data-ending')) || '';
    }
    expect(new Set(Object.values(endings)).size).toBe(3);
    // 모두 한 번씩 → 네 번째 엔딩
    await page.goto('/ko/games/sharehouse?play=1');
    await playThrough(page, () => 0);
    expect(Object.values(endings)).not.toContain((await page.getByTestId('exp-summary').getAttribute('data-ending')) || '');
  });

  test('?play=1 opens it once and the param is removed on close', async ({ page }) => {
    await page.goto('/ko/games/sharehouse?play=1');
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await page.getByTestId('exp-close').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(page.url()).not.toContain('play=1');
  });

  test('the header "체험하기" link on Habom pages opens the experience', async ({ page, isMobile }) => {
    test.skip(isMobile, '데스크톱 헤더 전용');
    await page.goto('/ko/habom');
    await page.getByRole('navigation', { name: '주 메뉴' }).getByRole('link', { name: '체험하기' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('is never offered on Elysian works, even with ?play=1', async ({ page }) => {
    for (const slug of ['memorial-circuit', 'IBAT', 'cella', 'festival-not-over']) {
      await page.goto(`/ko/games/${slug}?play=1`);
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.getByRole('button', { name: /체험/ })).toHaveCount(0);
    }
    await page.goto('/ko');
    await expect(page.getByRole('button', { name: /체험/ })).toHaveCount(0);
  });

  test('works on a phone viewport without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/ko/games/sharehouse?play=1');
    await expect(page.getByRole('dialog')).toBeVisible();
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(sw).toBeLessThanOrEqual(cw);
    await playThrough(page);
    const after = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(after.sw).toBeLessThanOrEqual(after.cw);
  });
});
