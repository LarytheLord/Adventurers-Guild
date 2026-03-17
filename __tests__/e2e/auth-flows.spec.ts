import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

async function expectAdventurerDashboard(page: Page) {
  await expect(page).toHaveURL(/\/dashboard(?:\?.*)?$/, { timeout: 60_000 });
  await expect(page.getByText('Adventurer Command Center')).toBeVisible({ timeout: 30_000 });
}

async function waitForAuthForm(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(750);
}

async function registerUser(request: APIRequestContext, payload: Record<string, string>) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await request.post('/api/auth/register', {
      data: payload,
      timeout: 30_000,
    });
    const body = await response.json().catch(() => null);

    if (response.status() === 201) {
      return;
    }

    if (response.status() >= 500 && attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      continue;
    }

    expect(response.status(), `Registration failed: ${JSON.stringify(body)}`).toBe(201);
    return;
  }
}

test.describe('Auth Core Flows', () => {
  test('adventurer registration redirects to dashboard', async ({ page }) => {
    test.setTimeout(120_000);

    const email = `e2e.adventurer.${Date.now()}@example.com`;
    const password = 'E2EPass123!';

    await page.goto('/register');
    await waitForAuthForm(page);

    await page.locator('#name').fill('E2E Adventurer');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: 'Join as Adventurer' }).click();

    await expectAdventurerDashboard(page);
  });

  test('credentials login redirects adventurer to dashboard', async ({ page, request }) => {
    test.setTimeout(120_000);

    const email = `e2e.login.${Date.now()}@example.com`;
    const password = 'E2EPass123!';

    await registerUser(request, {
      name: 'E2E Login User',
      email,
      password,
      role: 'adventurer',
    });

    await page.goto('/login');
    await waitForAuthForm(page);
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expectAdventurerDashboard(page);
  });
});
