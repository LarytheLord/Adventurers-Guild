import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Public pages that must stay free of axe violations.
const PAGES = [
  '/',
  '/audit',
  '/audit/sample-report',
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
    await page.goto(path);
    await page.locator('main h1').first().waitFor();
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    const summary = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 5),
    }));
    expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
  });
}

test('first tab stop on / shows a visible focus indicator', async ({ page }) => {
  await page.goto('/');
  await page.locator('main h1').first().waitFor();
  await page.keyboard.press('Tab');
  const focus = page.locator(':focus');
  await expect(focus).toBeVisible();
  const style = await focus.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      outlineStyle: s.outlineStyle,
      outlineWidth: parseFloat(s.outlineWidth),
      boxShadow: s.boxShadow,
    };
  });
  const hasOutline = style.outlineStyle !== 'none' && style.outlineWidth > 0;
  const hasShadow = style.boxShadow !== 'none';
  expect(hasOutline || hasShadow, JSON.stringify(style)).toBe(true);
});
