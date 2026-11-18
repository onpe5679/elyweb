import { test, expect, type Page } from '@playwright/test';

/** 2026-11 모바일 점검에서 나온 문제들의 회귀 테스트 */

const overlap = (a: DOMRect | null, b: DOMRect | null) =>
  !!a && !!b && a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

async function rect(page: Page, sel: string) {
  return page.locator(sel).first().evaluate((el) => el.getBoundingClientRect().toJSON() as DOMRect);
}

test.describe('Mobile — touch', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('cover strips: first tap expands a collapsed strip, second tap opens the work', async ({ page }) => {
    await page.goto('/ko');
    const strips = page.locator('ol[aria-label] > li a');
    const second = strips.nth(1);
    const before = (await second.boundingBox())!.height;
    await second.tap();
    await page.waitForTimeout(900);
    await expect(page).toHaveURL(/\/ko\/?$/);
    expect((await second.boundingBox())!.height).toBeGreaterThan(before * 2);
    await second.tap();
    await expect(page).toHaveURL(/\/ko\/games\//);
  });

  test('press rows: titles never sit under the EN / KR / STORE PAGE buttons', async ({ page }) => {
    for (const w of [390, 430]) {
      await page.setViewportSize({ width: w, height: 900 });
      for (const loc of ['ko', 'ja']) {
        await page.goto(`/${loc}/press`);
        const rows = page.getByTestId('press-games').locator('li[id^="press-"]');
        for (let i = 0; i < (await rows.count()); i++) {
          const row = rows.nth(i);
          const title = await row.locator('a').first().evaluate((el) => el.getBoundingClientRect().toJSON() as DOMRect);
          const buttons = await row.getByTestId('press-game-links').evaluate((el) => el.getBoundingClientRect().toJSON() as DOMRect);
          expect(overlap(title, buttons), `${loc} ${w}px row ${i}`).toBe(false);
          expect(title.width, `${loc} ${w}px row ${i} title width`).toBeGreaterThan(120);
        }
      }
    }
  });

  test('floating Habom button stays compact and does not cover the footer links', async ({ page }) => {
    await page.goto('/ko/about');
    const fab = await rect(page, '[data-testid="habom-fab"]');
    expect(fab.width).toBeLessThan(140);
    expect(fab.height).toBeGreaterThanOrEqual(40);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(300);
    const fab2 = await rect(page, '[data-testid="habom-fab"]');
    const privacy = await rect(page, 'footer a[href$="/privacy"]');
    expect(overlap(fab2, privacy)).toBe(false);
  });

  test('Habom trailer closes when tapping outside the video', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    const trigger = page.locator('main button', { hasText: /PV|영상|트레일러/ }).first();
    test.skip((await trigger.count()) === 0, 'no trailer');
    await trigger.tap();
    const dialog = page.locator('dialog[open]');
    await expect(dialog).toBeVisible();
    await page.touchscreen.tap(195, 820);
    await expect(dialog).toHaveCount(0);
  });

  test('Habom header fits narrow phones (back link never overlaps the menu button)', async ({ page }) => {
    for (const w of [320, 360, 390]) {
      await page.setViewportSize({ width: w, height: 760 });
      await page.goto('/ko/habom');
      const back = await rect(page, '[data-testid="habom-to-elysian"]');
      const menu = await rect(page, '[data-testid="habom-menu-button"]');
      expect(overlap(back, menu), `${w}px`).toBe(false);
      expect(menu.right, `${w}px`).toBeLessThanOrEqual(w);
    }
  });
});

test.describe('Phone in landscape', () => {
  test.use({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });

  test('headers and section tabs scroll away instead of eating the screen', async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
    await page.locator('#demo').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 200));
    const stuck = await page.evaluate(() =>
      [...document.querySelectorAll('header, nav')].filter((el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return (cs.position === 'sticky' || cs.position === 'fixed') && r.top <= 0.5 && r.bottom > 0;
      }).length,
    );
    expect(stuck).toBe(0);
  });

  test('vision stats stay inside their cells', async ({ page }) => {
    await page.goto('/ko');
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll('dl dd')].filter((dd) => dd.scrollWidth > (dd.parentElement as HTMLElement).clientWidth + 1).length,
    );
    expect(bad).toBe(0);
  });
});
