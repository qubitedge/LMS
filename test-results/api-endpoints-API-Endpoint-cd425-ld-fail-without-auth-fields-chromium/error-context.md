# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api-endpoints.spec.ts >> API Endpoint Testing >> POST /api/admin/create-user - should fail without auth/fields
- Location: tests\api-endpoints.spec.ts:5:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 200
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('API Endpoint Testing', () => {
  4  |   
  5  |   test('POST /api/admin/create-user - should fail without auth/fields', async ({ request }) => {
  6  |     const response = await request.post('/api/admin/create-user', {
  7  |       data: {}
  8  |     });
  9  |     // According to the code, it returns 400 for missing fields
> 10 |     expect(response.status()).toBe(400);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  11 |     const body = await response.json();
  12 |     expect(body.message).toBe('Missing required fields');
  13 |   });
  14 | 
  15 |   test('POST /api/attendance/mark - should fail for unauthorized', async ({ request }) => {
  16 |     const response = await request.post('/api/attendance/mark');
  17 |     expect(response.status()).toBe(401);
  18 |   });
  19 | 
  20 |   test('POST /api/quiz/submit - should fail for unauthorized', async ({ request }) => {
  21 |     const response = await request.post('/api/quiz/submit', {
  22 |       data: { quizId: 'some-id', answers: {} }
  23 |     });
  24 |     expect(response.status()).toBe(401);
  25 |   });
  26 | 
  27 |   test('POST /api/tasks/submit - should fail for unauthorized', async ({ request }) => {
  28 |     const response = await request.post('/api/tasks/submit', {
  29 |       data: { taskId: 'some-id', format: 'text', content: 'test' }
  30 |     });
  31 |     expect(response.status()).toBe(401);
  32 |   });
  33 | 
  34 |   // To test success cases, we need a session. 
  35 |   // We will handle that in the auth-protected tests or by injecting a session.
  36 | });
  37 | 
```