import { expect, test, type Page } from '@playwright/test';

type PublicPage = { path: string; heading: RegExp };

const PAGES: PublicPage[] = [
  { path: '/', heading: /Independent checks for the AI you ship/i },
  { path: '/audit', heading: /Built your app with an AI tool/i },
  { path: '/audit/sample-report', heading: /What a Launch Check report looks like/i },
  { path: '/checklist', heading: /The AI-built app launch checklist/i },
  { path: '/launch-check', heading: /Is your AI-built app ready for real users and real money/i },
  { path: '/ai-risk-tier', heading: /Which CERT-In risk tier is your AI system/i },
  {
    path: '/guides/cert-in-ai-security-auditing-guidelines',
    heading: /CERT-In AI Security Auditing Guidelines/i,
  },
];

function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    // Vercel Analytics injects /_vercel/insights/script.js, which only exists
    // on Vercel. Under next start it 404s, so it is not a site defect.
    if (msg.location().url.includes('/_vercel/')) return;
    errors.push(`console: ${msg.text()} (${msg.location().url})`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

for (const { path, heading } of PAGES) {
  test.describe(path, () => {
    test('returns 200 and shows its main heading', async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 }).first()).toContainText(heading);
    });

    test('has no console errors', async ({ page }) => {
      const errors = watchConsole(page);
      await page.goto(path, { waitUntil: 'networkidle' });
      expect(errors).toEqual([]);
    });

    test('every internal link resolves', async ({ page, request, baseURL }) => {
      await page.goto(path);
      const hrefs = await page
        .locator('a[href]')
        .evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));

      const origin = new URL(baseURL ?? 'http://127.0.0.1').origin;
      const targets = new Set<string>();
      const anchors = new Set<string>();

      for (const href of hrefs) {
        if (!href) continue;
        if (href.startsWith('#')) {
          if (href.length > 1) anchors.add(href.slice(1));
          continue;
        }
        if (/^(mailto|tel|javascript):/i.test(href)) continue;
        const url = new URL(href, `${origin}${path}`);
        if (url.origin !== origin) continue;
        targets.add(url.pathname + url.search);
      }

      expect(targets.size, 'page should have at least one internal link').toBeGreaterThan(0);

      const broken: string[] = [];
      for (const target of targets) {
        const res = await request.get(target);
        if (res.status() >= 400) broken.push(`${target} -> ${res.status()}`);
      }
      for (const id of anchors) {
        const count = await page.locator(`[id="${id}"]`).count();
        if (count === 0) broken.push(`#${id} -> no element with that id`);
      }
      expect(broken).toEqual([]);
    });
  });
}
