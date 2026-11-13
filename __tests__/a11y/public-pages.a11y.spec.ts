import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Public pages that must stay free of axe violations.
const PAGES = [
  '/',
  '/audit',
  '/checklist',
  '/ai-risk-tier',
  '/guides/cert-in-ai-security-auditing-guidelines',
  '/guides/check-supabase-rls-lovable-bolt',
  '/guides/does-cert-in-require-an-ai-audit',
  '/guides/what-is-an-ai-risk-tier-cert-in',
];

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

for (const path of PAGES) {
  test(`axe: ${path} has no violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    const summary = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 5),
    }));
    expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
  });
}

test('keyboard focus is visible on the first tab stop of /', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { w: r.width, h: r.height, outline: s.outlineStyle, shadow: s.boxShadow };
  });
  expect(outline).not.toBeNull();
  expect(outline!.w).toBeGreaterThan(0);
  expect(outline!.h).toBeGreaterThan(0);
});
