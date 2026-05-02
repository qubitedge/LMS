# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> Login page should render correctly
- Location: tests\auth.spec.ts:4:7

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /Login/i
Received string:  "qubitedge LMS | Internship Learning Management System"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    8 × unexpected value "qubitedge LMS | Internship Learning Management System"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e4]:
      - img "Login Background" [ref=e6]
      - generic [ref=e9]:
        - generic [ref=e10]:
          - img "qubitedge Logo" [ref=e13]
          - generic [ref=e14]:
            - heading "Welcome Back" [level=1] [ref=e15]
            - paragraph [ref=e16]: Sign in to the qubitedge LMS Portal to continue your internship journey.
        - generic [ref=e17]:
          - generic [ref=e18]:
            - generic [ref=e19]: Email Address
            - textbox "Email Address" [ref=e20]:
              - /placeholder: name@qubitedge.com
          - generic [ref=e21]:
            - generic [ref=e22]:
              - generic [ref=e23]: Password
              - link "Forgot Password?" [ref=e24] [cursor=pointer]:
                - /url: /forgot-password
            - textbox "Password" [ref=e25]:
              - /placeholder: ••••••••
          - button "Sign In" [ref=e26]
        - paragraph [ref=e28]:
          - text: Don't have an account?
          - link "Contact your administrator." [ref=e29] [cursor=pointer]:
            - /url: mailto:likhithmanakala@gmail.com
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e35] [cursor=pointer]:
    - img [ref=e36]
  - alert [ref=e39]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication Flow', () => {
  4  |   test('Login page should render correctly', async ({ page }) => {
  5  |     await page.goto('/login');
> 6  |     await expect(page).toHaveTitle(/Login/i);
     |                        ^ Error: expect(page).toHaveTitle(expected) failed
  7  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  8  |     await expect(page.locator('input[type="password"]')).toBeVisible();
  9  |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  10 |   });
  11 | 
  12 |   test('Invalid login should show error message', async ({ page }) => {
  13 |     await page.goto('/login');
  14 |     await page.fill('input[type="email"]', 'wrong@example.com');
  15 |     await page.fill('input[type="password"]', 'wrongpassword');
  16 |     await page.click('button[type="submit"]');
  17 |     
  18 |     // Check for error message (sonner toast or similar)
  19 |     // We might need to adjust this selector based on how errors are displayed
  20 |     await expect(page.getByText(/Invalid login credentials/i).or(page.getByText(/Error/i))).toBeVisible();
  21 |   });
  22 | 
  23 |   // Note: For a real test, we'd use a test user and verify successful login.
  24 |   // Since we don't want to mess with real data, we could use the Supabase admin API 
  25 |   // to create/delete a temporary test user.
  26 | });
  27 | 
```