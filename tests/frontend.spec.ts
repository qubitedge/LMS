import { test, expect } from '@playwright/test';

test.describe('Frontend Route Testing', () => {
  const protectedRoutes = ['/dashboard', '/progress', '/leaderboard', '/profile'];

  for (const route of protectedRoutes) {
    test(`Unauthenticated user should be redirected from ${route} to login`, async ({ page }) => {
      await page.goto(route);
      // Depending on how middleware is set up, it might be a redirect to /login
      await expect(page).toHaveURL(/login/);
    });
  }

  test('Public pages should be accessible', async ({ page }) => {
    await page.goto('/');
    // Check if landing page or dashboard (if public) renders
    expect(page.url()).not.toContain('/login');
  });
});
