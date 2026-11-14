import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_A11Y_PORT || 3007);
const baseURL = process.env.BASE_URL ?? `http://127.0.0.1:${port}`;

// Runs axe against the already-built app. Run `npm run build` first.
export default defineConfig({
  testDir: './__tests__/a11y',
  testMatch: '**/*.a11y.spec.ts',
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: { baseURL, trace: 'off' },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Optional: point at a preinstalled Chromium instead of the bundled one.
        launchOptions: process.env.A11Y_CHROMIUM_PATH
          ? { executablePath: process.env.A11Y_CHROMIUM_PATH, args: ['--no-sandbox'] }
          : {},
      },
    },
  ],
  webServer: {
    command: `npm run start -- -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
