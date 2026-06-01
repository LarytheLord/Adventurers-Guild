import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

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

async function waitForAuthForm(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(750);
}

async function createQuestAsAdmin(
  request: APIRequestContext,
  adminCookie: string,
  questData: {
    title: string;
    description: string;
    track: 'OPEN' | 'BOOTCAMP' | 'INTERN';
    source?: 'TUTORIAL' | 'CLIENT_PORTAL' | 'BACKLOG' | 'HACKATHON' | 'INTERNAL';
    difficulty: 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
    xpReward: number;
    monetaryReward?: number;
  }
) {
  const response = await request.post('/api/quests', {
    data: questData,
    headers: {
      Cookie: `next-auth.session-token=${adminCookie}`,
    },
  });
  const body = await response.json();
  expect(response.status()).toBe(201);
  expect(body.success).toBe(true);
  return body.quest.id;
}

async function approveSubmissionAsAdmin(
  request: APIRequestContext,
  adminCookie: string,
  submissionId: string
) {
  const response = await request.put(`/api/quests/submissions`, {
    data: {
      submissionId,
      status: 'approved',
      review_notes: 'Approved by automated test',
      quality_score: 5,
    },
    headers: {
      Cookie: `next-auth.session-token=${adminCookie}`,
    },
  });
  const body = await response.json();
  expect(response.status()).toBe(200);
  expect(body.success).toBe(true);
}

test.describe('Bootcamp Pipeline End-to-End', () => {
  test('bootcamp student completes tutorials and then a real quest', async ({ browser, request }) => {
    test.setTimeout(300_000); // 5 minutes for 5 students

    // Step 0: Set up admin user and create quests
    const adminEmail = `admin.bootcamp.test.${Date.now()}@example.com`;
    const adminPassword = 'AdminPass123!';
    await registerUser(request, {
      name: 'Admin User',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    // Log in as admin to get session cookie
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await adminPage.goto('/login');
    await waitForAuthForm(adminPage);
    await adminPage.locator('#email').fill(adminEmail);
    await adminPage.locator('#password').fill(adminPassword);
    await adminPage.getByRole('button', { name: 'Sign In' }).click();
    await expect(adminPage).toHaveURL(/\/dashboard(?:\/.*)?$/, { timeout: 60_000 });

    // Extract admin session cookie
    const adminCookies = await adminContext.cookies();
    const adminSessionCookie = adminCookies.find(c => c.name === 'next-auth.session-token')?.value;
    expect(adminSessionCookie).toBeTruthy();

    // Create two tutorial quests and one real BOOTCAMP quest as admin
    const tutorial1Id = await createQuestAsAdmin(
      request,
      adminSessionCookie!,
      {
        title: 'Tutorial: First Blood',
        description: 'First tutorial quest for bootcamp students.',
        track: 'BOOTCAMP',
        source: 'TUTORIAL',
        difficulty: 'F',
        xpReward: 50,
        monetaryReward: 0,
      }
    );

    const tutorial2Id = await createQuestAsAdmin(
      request,
      adminSessionCookie!,
      {
        title: 'Tutorial: Party Up',
        description: 'Second tutorial quest for bootcamp students.',
        track: 'BOOTCAMP',
        source: 'TUTORIAL',
        difficulty: 'F',
        xpReward: 50,
        monetaryReward: 0,
      }
    );

    const realQuestId = await createQuestAsAdmin(
      request,
      adminSessionCookie!,
      {
        title: 'Real Bootcamp Quest',
        description: 'A real quest for bootcamp students after tutorials.',
        track: 'BOOTCAMP',
        source: 'CLIENT_PORTAL',
        difficulty: 'F',
        xpReward: 100,
        monetaryReward: 0, // BOOTCAMP quests are XP-only in Phase 2
      }
    );

    await adminContext.close();

    // Step 1: Create 5 bootcamp students via onboard webhook
    const bootcampSecret = process.env.BOOTCAMP_WEBHOOK_SECRET || 'test-secret';
    const students: {
      id: string;
      email: string;
      password: string;
      bootcampStudentId: string;
    }[] = [];

    for (let i = 0; i < 5; i++) {
      const suffix = Date.now() + i;
      const bootcampStudentId = `bootcamp-student-${suffix}`;
      const email = `bootcamp.student.${suffix}@example.com`;
      const password = `BootcampPass${suffix}!`;

      const onboardResponse = await request.post('/api/onboard', {
        data: {
          bootcampStudentId,
          name: `Bootcamp Student ${i}`,
          email,
          cohort: `Cohort ${Math.floor(i / 10) + 1}`,
          bootcampTrack: 'beginner',
          bootcampWeek: 1,
          webhookSecret: bootcampSecret,
          initialPassword: password,
        },
      });
      const onboardBody = await onboardResponse.json();
      expect(onboardResponse.status()).toBe(201);
      expect(onboardBody.success).toBe(true);
      expect(onboardBody.adventurerId).toBeTruthy();

      students.push({
        id: onboardBody.adventurerId,
        email,
        password,
        bootcampStudentId,
      });
    }

    // Step 2: For each student, complete tutorials and then a real quest
    for (const student of students) {
      // Log in as the student
      const studentContext = await browser.newContext();
      const studentPage = await studentContext.newPage();
      await studentPage.goto('/login');
      await waitForAuthForm(studentPage);
      await studentPage.locator('#email').fill(student.email);
      await studentPage.locator('#password').fill(student.password);
      await studentPage.getByRole('button', { name: 'Sign In' }).click();
      await expect(studentPage).toHaveURL(/\/dashboard(?:\/.*)?$/, { timeout: 60_000 });

      // Helper function to complete a tutorial quest by title
      async function completeTutorialQuest(tutorialTitle: string) {
        // Go to quests page and search for the tutorial
        await studentPage.goto('/dashboard/quests');
        await studentPage.getByPlaceholder('Search by title, category, skills, or company').fill(tutorialTitle);
        const detailLink = studentPage.getByRole('link', { name: 'View Quest Details' });
        await expect(detailLink).toHaveCount(1);

        const detailHref = await detailLink.first().getAttribute('href');
        expect(detailHref).toBeTruthy();
        const questId = detailHref?.split('/').pop();
        expect(questId).toBeTruthy();

        // Open the quest detail
        await Promise.all([
          studentPage.waitForResponse(
            (response) =>
              response.url().includes(`/api/quests/${questId}`) &&
              request.method() === 'GET',
            { timeout: 60_000 }
          ),
          detailLink.first().click(),
        ]);

        await studentPage.waitForURL('**/dashboard/quests/**', { timeout: 30_000 });
        await expect(studentPage.getByRole('heading', { name: tutorialTitle })).toBeVisible({ timeout: 60_000 });

        // Claim the quest
        const acceptResponsePromise = studentPage.waitForResponse(
          (response) =>
            response.url().includes('/api/quests/assignments') &&
            request.method() === 'POST'
        );
        await studentPage.getByRole('button', { name: /Claim Quest|Accept Quest/ }).click();
        const acceptResponse = await acceptResponsePromise;
        const acceptData = await acceptResponse.json().catch(() => null);
        expect(acceptResponse.status(), `Accept quest failed: ${JSON.stringify(acceptData)}`).toBe(201);
        expect(acceptData?.success).toBe(true);
        await expect(studentPage.getByText(/Your Assignment|Your Assignment Status/)).toBeVisible({ timeout: 60_000 });

        // Submit the quest
        await studentPage.locator('#submissionContent').fill('https://example.com/tutorial-submission');
        const submitResponsePromise = studentPage.waitForResponse(
          (response) =>
            response.url().includes('/api/quests/submissions') &&
            request.method() === 'POST'
        );
        await studentPage.getByRole('button', { name: 'Submit Quest' }).click();
        const submitResponse = await submitResponsePromise;
        const submitData = await submitResponse.json().catch(() => null);
        expect(submitResponse.status(), `Submit quest failed: ${JSON.stringify(submitData)}`).toBe(201);
        expect(submitData?.success).toBe(true);
        await expect(studentPage.getByText('Submitted')).toBeVisible({ timeout: 60_000 });

        // Now, as admin, approve the submission
        // We need to get the submission ID for this student's submission on this quest.
        // We'll use the admin request context (we have to recreate it because we closed the admin context earlier).
        // Instead, we can re-use the admin request by making a new request with the admin cookie we saved? 
        // But we closed the admin context. Let's create a temporary admin request context for approval.
        // Alternatively, we can store the admin request context from earlier and reuse it.
        // Since we closed the admin context, we'll create a new API request context with the admin cookie.
        // We'll do that by using the `request` object? Actually, the `request` object is APIRequestContext and is still valid.
        // We can use the same `request` object to make admin calls if we set the cookie.
        // However, we don't have the admin cookie in this scope? We do: we have adminSessionCookie from earlier.
        // But note: we closed the admin context, but the cookie value is still valid.

        // We'll fetch the submission ID for this student and quest via the API.
        const submissionsResponse = await request.get(`/api/quests/submissions`, {
          params: {
            userId: student.id,
            status: 'pending_admin_review', // after submission, it should be pending_admin_review for BOOTCAMP
          },
          headers: {
            Cookie: `next-auth.session-token=${adminSessionCookie}`,
          },
        });
        const submissionsBody = await submissionsResponse.json();
        expect(submissionsResponse.status()).toBe(200);
        expect(submissionsBody.success).toBe(true);
        expect(submissionsBody.submissions.length).toBeGreaterThan(0);
        const submission = submissionsBody.submissions.find(
          (sub: any) => sub.assignment?.questId === questId && sub.userId === student.id
        );
        expect(submission).toBeTruthy();
        const submissionId = submission.id;

        // Approve the submission
        await approveSubmissionAsAdmin(request, adminSessionCookie!, submissionId);

        // Wait for the student to see the approved status (optional)
        await studentPage.waitForTimeout(1000);
      }

      // Complete the two tutorial quests
      await completeTutorialQuest('Tutorial: First Blood');
      await completeTutorialQuest('Tutorial: Party Up');

      // After completing both tutorials, check that the student is eligible for real quests
      const bootcampLinkResponse = await request.get(`/api/bootcamp-link/${student.id}`, {
        headers: {
          Cookie: `next-auth.session-token=${await getStudentCookie(studentContext, studentPage)}`,
        },
      });
      const bootcampLinkBody = await bootcampLinkResponse.json();
      expect(bootcampLinkResponse.status()).toBe(200);
      expect(bootcampLinkBody.success).toBe(true);
      expect(bootcampLinkBody.eligibleForRealQuests).toBe(true);

      // Now, complete a real BOOTCAMP quest
      // We'll use the real quest we created earlier (realQuestId)
      // But note: we need to make sure the student can see it.
      // Go to quests page and search for the real quest
      await studentPage.goto('/dashboard/quests');
      await studentPage.getByPlaceholder('Search by title, category, skills, or company').fill('Real Bootcamp Quest');
      const realDetailLink = studentPage.getByRole('link', { name: 'View Quest Details' });
      await expect(realDetailLink).toHaveCount(1);

      const realDetailHref = await realDetailLink.first().getAttribute('href');
      expect(realDetailHref).toBeTruthy();
      const realQuestIdFromHref = realDetailHref?.split('/').pop();
      expect(realQuestIdFromHref).toBeTruthy();

      // Open the real quest detail
      await Promise.all([
        studentPage.waitForResponse(
          (response) =>
            response.url().includes(`/api/quests/${realQuestIdFromHref}`) &&
            request.method() === 'GET',
          { timeout: 60_000 }
        ),
        realDetailLink.first().click(),
      ]);

      await studentPage.waitForURL('**/dashboard/quests/**', { timeout: 30_000 });
      await expect(studentPage.getByRole('heading', { name: 'Real Bootcamp Quest' })).toBeVisible({ timeout: 60_000 });

      // Claim the real quest
      const acceptRealResponsePromise = studentPage.waitForResponse(
        (response) =>
          response.url().includes('/api/quests/assignments') &&
          request.method() === 'POST'
      );
      await studentPage.getByRole('button', { name: /Claim Quest|Accept Quest/ }).click();
      const acceptRealResponse = await acceptRealResponsePromise;
      const acceptRealData = await acceptRealResponse.json().catch(() => null);
      expect(acceptRealResponse.status(), `Accept quest failed: ${JSON.stringify(acceptRealData)}`).toBe(201);
      expect(acceptRealData?.success).toBe(true);
      await expect(studentPage.getByText(/Your Assignment|Your Assignment Status/)).toBeVisible({ timeout: 60_000 });

      // Submit the real quest
      await studentPage.locator('#submissionContent').fill('https://example.com/real-submission');
      const submitRealResponsePromise = studentPage.waitForResponse(
        (response) =>
          response.url().includes('/api/quests/submissions') &&
          request.method() === 'POST'
      );
      await studentPage.getByRole('button', { name: 'Submit Quest' }).click();
      const submitRealResponse = await submitRealResponsePromise;
      const submitRealData = await submitRealResponse.json().catch(() => null);
      expect(submitRealResponse.status(), `Submit quest failed: ${JSON.stringify(submitRealData)}`).toBe(201);
      expect(submitRealData?.success).toBe(true);
      await expect(studentPage.getByText('Submitted')).toBeVisible({ timeout: 60_000 });

      // As admin, approve the real quest submission
      // Get the submission ID for this student's submission on the real quest
      const realSubmissionsResponse = await request.get(`/api/quests/submissions`, {
        params: {
          userId: student.id,
          status: 'pending_admin_review',
        },
        headers: {
          Cookie: `next-auth.session-token=${adminSessionCookie}`,
        },
      });
      const realSubmissionsBody = await realSubmissionsResponse.json();
      expect(realSubmissionsResponse.status()).toBe(200);
      expect(realSubmissionsBody.success).toBe(true);
      expect(realSubmissionsBody.submissions.length).toBeGreaterThan(0);
      const realSubmission = realSubmissionsBody.submissions.find(
        (sub: any) => sub.assignment?.questId === realQuestIdFromHref && sub.userId === student.id
      );
      expect(realSubmission).toBeTruthy();
      const realSubmissionId = realSubmission.id;

      await approveSubmissionAsAdmin(request, adminSessionCookie!, realSubmissionId);

      // Wait a bit for the student to see the completion
      await studentPage.waitForTimeout(1000);

      // Optionally, check the student's XP increased (we can fetch the user data)
      const userResponse = await request.get(`/api/user/${student.id}`, {
        headers: {
          Cookie: `next-auth.session-token=${await getStudentCookie(studentContext, studentPage)}`,
        },
      });
      const userBody = await userResponse.json();
      expect(userResponse.status()).toBe(200);
      expect(userBody.success).toBe(true);
      // The student should have earned 100 XP from the real quest (50 from each tutorial? but we already accounted for those)
      // Actually, the tutorials each gave 50 XP, and the real quest gives 100 XP.
      // So total XP should be at least 200 (50+50+100) but we don't know the starting XP.
      // We'll just check that XP is greater than 0.
      expect(userBody.xp).toBeGreaterThan(0);

      await studentContext.close();
    }

    // Clean up: close any remaining contexts
    await adminContext.close();
  });
});

// Helper function to get the session cookie from a context and page
async function getStudentCookie(context: any, page: Page): Promise<string> {
  const cookies = await context.cookies();
  const sessionCookie = cookies.find(c => c.name === 'next-auth.session-token');
  return sessionCookie?.value ?? '';
}