import { expect, test, type APIRequestContext } from '@playwright/test';

async function waitForBackoff(attempt: number) {
  await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
}

async function registerUser(request: APIRequestContext, payload: Record<string, string>) {
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await request.post('/api/auth/register', {
        data: payload,
        timeout: 30_000,
      });
      const body = await response.json().catch(() => null);

      if (response.status() === 201) {
        return;
      }

      if (response.status() >= 500 && attempt < maxAttempts) {
        await waitForBackoff(attempt);
        continue;
      }

      expect(response.status(), `Registration failed: ${JSON.stringify(body)}`).toBe(201);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await waitForBackoff(attempt);
        continue;
      }
      throw error;
    }
  }

  throw lastError ?? new Error('Registration failed after retries');
}

test.describe('Quest Flow', () => {
  test('company posts quest and adventurer accepts + submits', async ({ browser, request }) => {
    test.setTimeout(180_000);

    const suffix = Date.now();
    const companyEmail = `e2e.company.${suffix}@example.com`;
    const adventurerEmail = `e2e.adventurer.${suffix}@example.com`;
    const password = 'E2EPass123!';
    const questTitle = `E2E Quest ${suffix}`;

    await registerUser(request, {
      name: 'E2E Company',
      email: companyEmail,
      password,
      role: 'company',
      companyName: 'E2E Company',
    });

    await registerUser(request, {
      name: 'E2E Adventurer',
      email: adventurerEmail,
      password,
      role: 'adventurer',
    });

    const companyContext = await browser.newContext();
    const companyPage = await companyContext.newPage();

    await companyPage.goto('/login');
    await companyPage.locator('#email').fill(companyEmail);
    await companyPage.locator('#password').fill(password);
    await companyPage.getByRole('button', { name: 'Sign In' }).click();
    await expect(companyPage).toHaveURL(/\/dashboard(?:\/company)?(?:\?.*)?$/, { timeout: 60_000 });

    await companyPage.goto('/dashboard/company/create-quest');
    await companyPage.locator('#title').fill(questTitle);
    await companyPage.locator('#description').fill('E2E quest description for frontend-backend flow.');
    await companyPage.locator('#requiredSkills').fill('TypeScript, Next.js');
    await companyPage.getByRole('button', { name: 'Create Quest' }).click();
    await expect(companyPage).toHaveURL(/\/dashboard\/company\/quests(?:\?.*)?$/, { timeout: 60_000 });

    await companyPage.getByPlaceholder('Search by title, category, or status').fill(questTitle);
    await expect(companyPage.getByText(questTitle)).toBeVisible();

    await companyContext.close();

    const adventurerContext = await browser.newContext();
    const adventurerPage = await adventurerContext.newPage();

    await adventurerPage.goto('/login');
    await adventurerPage.locator('#email').fill(adventurerEmail);
    await adventurerPage.locator('#password').fill(password);
    await adventurerPage.getByRole('button', { name: 'Sign In' }).click();
    await expect(adventurerPage).toHaveURL(/\/dashboard(?:\?.*)?$/, { timeout: 60_000 });

    await adventurerPage.goto('/dashboard/quests');
    await adventurerPage.getByPlaceholder('Search by title, category, skills, or company').fill(questTitle);
    await expect(adventurerPage.getByRole('link', { name: 'View Quest Details' })).toHaveCount(1);
    await adventurerPage.getByRole('link', { name: 'View Quest Details' }).click();

    await adventurerPage.waitForURL('**/dashboard/quests/**', { timeout: 30_000 });
    await expect(adventurerPage.getByRole('heading', { name: questTitle })).toBeVisible();

    const acceptResponsePromise = adventurerPage.waitForResponse(
      (response) =>
        response.url().includes('/api/quests/assignments') &&
        response.request().method() === 'POST'
    );
    await adventurerPage.getByRole('button', { name: 'Accept Quest' }).click();
    const acceptResponse = await acceptResponsePromise;
    const acceptData = await acceptResponse.json().catch(() => null);
    expect(acceptResponse.status(), `Accept quest failed: ${JSON.stringify(acceptData)}`).toBe(201);
    expect(acceptData?.success).toBe(true);
    await expect(adventurerPage.getByText('Your Assignment Status')).toBeVisible({ timeout: 60_000 });

    await adventurerPage.locator('#submissionContent').fill('https://example.com/e2e-submission');
    const submitResponsePromise = adventurerPage.waitForResponse(
      (response) =>
        response.url().includes('/api/quests/submissions') &&
        response.request().method() === 'POST'
    );
    await adventurerPage.getByRole('button', { name: 'Submit Quest' }).click();
    const submitResponse = await submitResponsePromise;
    const submitData = await submitResponse.json().catch(() => null);
    expect(submitResponse.status(), `Submit quest failed: ${JSON.stringify(submitData)}`).toBe(201);
    expect(submitData?.success).toBe(true);
    await expect(adventurerPage.getByText('Submitted')).toBeVisible({ timeout: 60_000 });

    await adventurerContext.close();
  });
});
