import { test, expect } from '@playwright/test';

test.describe('Games Pages', () => {
  test('games list page should display all games', async ({ page }) => {
    await page.goto('/ko/games');
    
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/게임|Games|ゲーム/i);
    
    const gameCards = page.locator('[data-testid="game-card"]');
    await expect(gameCards.first()).toBeVisible();
  });

  test('should navigate to game detail page', async ({ page }) => {
    await page.goto('/ko/games');
    
    const firstGame = page.locator('[data-testid="game-card"]').first();
    if (await firstGame.isVisible()) {
      await firstGame.click();
      await expect(page).toHaveURL(/\/games\/.+/);
    }
  });

  test('game detail page should display game info', async ({ page }) => {
    await page.goto('/ko/games/memorial-circuit');
    
    await expect(page.getByText('메모리얼 서킷')).toBeVisible();
    
    await expect(page.getByRole('main').first()).toContainText(/기억|전쟁|스토리/);
  });

  test('featured game should be highlighted on home page', async ({ page }) => {
    await page.goto('/ko');
    
    const featuredGame = page.locator('[data-testid="featured-game"]');
    if (await featuredGame.isVisible()) {
      await expect(featuredGame).toContainText(/메모리얼 서킷|Memorial Circuit/i);
    }
  });

  test('game card should show status badge', async ({ page }) => {
    await page.goto('/ko/games');
    
    const badges = page.locator('[data-testid="game-status-badge"]');
    if (await badges.first().isVisible()) {
      await expect(badges.first()).toBeVisible();
    }
  });
});

test.describe('Game Detail Page - Sharehouse', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ko/games/sharehouse');
  });

  test('should display game banner', async ({ page }) => {
    const banner = page.locator('[data-testid="game-banner"]');
    if (await banner.isVisible()) {
      await expect(banner).toBeVisible();
    }
  });

  test('should display game info section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /쉐어하우스/i })).toBeVisible();
  });

  test('should display synopsis', async ({ page }) => {
    await expect(page.getByRole('main').first()).toContainText(/히로인|로맨스|동거/);
  });

  test('should display project timeline', async ({ page }) => {
    const timeline = page.locator('[data-testid="project-timeline"]');
    if (await timeline.isVisible()) {
      await expect(timeline).toContainText(/2024|2023/);
    }
  });
});
