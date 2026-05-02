import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('Login page should render correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Login/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Invalid login should show error message', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Check for error message (sonner toast or similar)
    // We might need to adjust this selector based on how errors are displayed
    await expect(page.getByText(/Invalid login credentials/i).or(page.getByText(/Error/i))).toBeVisible();
  });

  // Note: For a real test, we'd use a test user and verify successful login.
  // Since we don't want to mess with real data, we could use the Supabase admin API 
  // to create/delete a temporary test user.
});
