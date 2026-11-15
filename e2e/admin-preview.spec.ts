import { test, expect } from '@playwright/test';

// 미리보기 어드민(VITE_ADMIN_PREVIEW=1, 스냅샷 데이터·저장 안 됨)으로 새 어드민 구조를 확인한다.
//   cd apps/admin && VITE_ADMIN_PREVIEW=1 npx vite --port 5191
//   ADMIN_PREVIEW_URL=http://127.0.0.1:5191 npx playwright test e2e/admin-preview.spec.ts --project=chromium
const URL = process.env.ADMIN_PREVIEW_URL || 'http://127.0.0.1:5191/';

test.describe('Admin (preview mode)', () => {
  test.skip(({ isMobile }) => isMobile, '데스크톱 전용');

  test('dashboard explains the new site structure', async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByTestId('preview-banner')).toBeVisible();
    await expect(page.getByRole('heading', { name: '새 사이트 구조' })).toBeVisible();
    for (const area of ['메인', '작품 목록', '게임 상세', '하봄', '스튜디오 소개', '새 소식', '문의', '프레스']) {
      await expect(page.getByText(area, { exact: true }).first()).toBeVisible();
    }
  });

  test('menu is Korean and ordered like the site', async ({ page }) => {
    await page.goto(URL);
    const menu = page.locator('.RaMenu-open, .RaSidebar-fixed').first();
    await expect(menu).toContainText('작품');
    await expect(menu).toContainText('스튜디오 연혁');
    await expect(menu).toContainText('프레스 자료');
    await expect(menu).toContainText('사이트 설정');
    await expect(menu).toContainText('팀원 (보류·미노출)');
  });

  test('featured game is exclusive (dashboard select)', async ({ page }) => {
    await page.goto(URL);
    await page.getByTestId('featured-select').click();
    await page.getByRole('option', { name: '메모리얼 서킷' }).click();
    await expect(page.getByText('현재: 메모리얼 서킷')).toBeVisible();
    await expect(page.getByText(/^현재: /)).toHaveCount(1);
    await page.goto(URL + '#/games');
    await expect(page.locator('tbody tr').filter({ hasText: '메모리얼 서킷' })).toContainText('대표작');
    await expect(page.locator('tbody .MuiChip-colorPrimary')).toHaveCount(1);
  });

  test('games list shows studio (Elysian / Habom)', async ({ page }) => {
    await page.goto(URL + '#/games');
    await expect(page.locator('tbody tr').filter({ hasText: '셰어하우스' })).toContainText('하봄');
    await expect(page.locator('tbody tr').filter({ hasText: '메모리얼 서킷' })).toContainText('엘리시안');
  });

  test('settings list says where each key appears', async ({ page }) => {
    await page.goto(URL + '#/company_settings');
    await expect(page.locator('tbody tr').filter({ hasText: 'contact_email' })).toContainText('문의 페이지');
    await expect(page.locator('tbody tr').filter({ hasText: 'logo_mark_dark' })).toContainText('사용 안 함');
  });

  test('section editor explains the timeline type', async ({ page }) => {
    await page.goto(URL + '#/games');
    await page.locator('tbody tr').filter({ hasText: '메모리얼 서킷' }).click();
    await expect(page.getByText('엘리시안 작품입니다')).toBeVisible();
    await page.locator('tr').filter({ hasText: 'timeline' }).getByRole('link', { name: /편집/ }).click();
    await expect(page.getByText('섹션으로는 표시되지 않음')).toBeVisible();
  });
});
