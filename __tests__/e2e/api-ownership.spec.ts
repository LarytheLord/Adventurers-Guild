import { expect, test, type APIRequestContext, type Browser, type BrowserContext } from '@playwright/test';

async function loginAsCompany(browser: Browser, email: string, password: string): Promise<BrowserContext> {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/\/dashboard(?:\/company)?(?:\?.*)?$/, { timeout: 60_000 });

  return context;
}

async function registerCompany(request: APIRequestContext, payload: Record<string, string>) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await request.post('/api/auth/register', {
      data: payload,
      timeout: 30_000,
    });
    const body = await response.json().catch(() => null);

    if (response.status() === 201) {
      expect(body?.userId).toBeTruthy();
      return body;
    }

    if (response.status() >= 500 && attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      continue;
    }

    expect(response.status(), `Registration failed: ${JSON.stringify(body)}`).toBe(201);
    throw new Error('Unreachable');
  }

  throw new Error('Registration failed after retries');
}

test.describe('API Ownership Guardrails', () => {
  test('company quest ownership cannot be spoofed via company_id on create/update', async ({ browser, request }) => {
    test.setTimeout(180_000);

    const suffix = Date.now();
    const password = 'E2EPass123!';

    const companyAEmail = `e2e.owner.a.${suffix}@example.com`;
    const companyBEmail = `e2e.owner.b.${suffix}@example.com`;

    const registerAData = await registerCompany(request, {
      name: 'E2E Owner A',
      email: companyAEmail,
      password,
      role: 'company',
      companyName: 'Owner A Co',
    });

    const registerBData = await registerCompany(request, {
      name: 'E2E Owner B',
      email: companyBEmail,
      password,
      role: 'company',
      companyName: 'Owner B Co',
    });

    const companyAId = String(registerAData.userId);
    const companyBId = String(registerBData.userId);

    const companyAContext = await loginAsCompany(browser, companyAEmail, password);
    const companyBContext = await loginAsCompany(browser, companyBEmail, password);

    try {
      const questTitle = `Ownership Guard Quest ${suffix}`;

      const createAttempt = await companyAContext.request.post('/api/company/quests', {
        data: {
          title: questTitle,
          description: 'Ownership spoof guard test',
          questType: 'commission',
          difficulty: 'D',
          xpReward: 500,
          questCategory: 'backend',
          company_id: companyBId,
        },
      });

      expect(createAttempt.status()).toBe(201);
      const createData = await createAttempt.json();
      expect(createData.success).toBe(true);
      expect(String(createData.quest.companyId)).toBe(companyAId);
      expect(String(createData.quest.companyId)).not.toBe(companyBId);

      const questId = String(createData.quest.id);

      const bUpdateAttempt = await companyBContext.request.put('/api/company/quests', {
        data: {
          questId,
          title: `${questTitle} (tampered)`,
        },
      });

      expect(bUpdateAttempt.status()).toBe(403);

      const aUpdateAttempt = await companyAContext.request.put('/api/company/quests', {
        data: {
          questId,
          title: `${questTitle} (updated by owner)`,
          company_id: companyBId,
        },
      });

      expect(aUpdateAttempt.status()).toBe(200);
      const aUpdateData = await aUpdateAttempt.json();
      expect(aUpdateData.success).toBe(true);
      expect(String(aUpdateData.quest.companyId)).toBe(companyAId);
      expect(String(aUpdateData.quest.companyId)).not.toBe(companyBId);
    } finally {
      await companyAContext.close();
      await companyBContext.close();
    }
  });
});
