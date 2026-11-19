import fs from 'fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Page from '@/app/audit/sample-report/page';
import path from 'path';
import { SAMPLE_FINDINGS, SAMPLE_SUMMARY } from '@/lib/audit-offer/sample-report';
import {
  SAMPLE_CHECKS,
  SAMPLE_CHECKS_DATE,
  SAMPLE_CHECKS_LABEL,
  CHECK_CATEGORY_ORDER,
  failCountsByCategory,
} from '@/lib/audit-offer/sample-checks';

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

describe('sample checks table', () => {
  it('has a date in ISO form and a sample label', () => {
    expect(SAMPLE_CHECKS_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(SAMPLE_CHECKS_LABEL.toLowerCase()).toContain('sample');
  });

  it('every row is PASS or FAIL', () => {
    for (const r of SAMPLE_CHECKS) expect(['PASS', 'FAIL']).toContain(r.result);
  });

  it('every FAIL row has a one-line fix text', () => {
    const fails = SAMPLE_CHECKS.filter((r) => r.result === 'FAIL');
    expect(fails.length).toBeGreaterThan(0);
    for (const r of fails) {
      expect(typeof r.fix).toBe('string');
      expect((r.fix ?? '').trim().length).toBeGreaterThan(10);
      expect(r.fix).not.toMatch(/\n/);
    }
  });

  it('PASS rows carry no fix', () => {
    for (const r of SAMPLE_CHECKS.filter((x) => x.result === 'PASS')) expect(r.fix).toBeUndefined();
  });

  // Expected values below were read by hand from lib/audit-offer/sample-report.ts
  // (16 findings, 3 "what already works" lines). They are deliberately NOT
  // computed from the data under test.
  const EXPECTED_FAIL_COUNTS = {
    auth: 1,
    'data access': 1,
    secrets: 1,
    payments: 4,
    deployment: 4,
    performance: 4,
    privacy: 1,
  };

  const EXPECTED_FAIL_IDS: Record<string, string[]> = {
    auth: ['S-3'],
    'data access': ['S-1'],
    secrets: ['S-2'],
    payments: ['P-1', 'P-2', 'P-3', 'P-4'],
    deployment: ['D-1', 'D-2', 'D-3', 'D-4'],
    performance: ['C-1', 'C-2', 'C-3', 'C-4'],
    privacy: ['S-4'],
  };

  const EXPECTED_PASS = [
    { check: 'Sign-up and login work, and admin pages check the user on the server.', category: 'auth' },
    { check: 'Stripe keys are not in the browser code. Only the publishable key is.', category: 'secrets' },
    { check: 'The domain has HTTPS and a valid certificate.', category: 'deployment' },
  ];

  it('has 16 FAIL rows and 3 PASS rows', () => {
    expect(SAMPLE_CHECKS.filter((r) => r.result === 'FAIL')).toHaveLength(16);
    expect(SAMPLE_CHECKS.filter((r) => r.result === 'PASS')).toHaveLength(3);
  });

  it('every row has a category that is in CHECK_CATEGORY_ORDER', () => {
    for (const r of SAMPLE_CHECKS) expect(CHECK_CATEGORY_ORDER).toContain(r.category);
  });

  it('FAIL counts per category match the hand-read sample report', () => {
    expect(failCountsByCategory()).toEqual(EXPECTED_FAIL_COUNTS);
  });

  it('each finding id sits in the category read from the sample report', () => {
    for (const [category, ids] of Object.entries(EXPECTED_FAIL_IDS)) {
      const got = SAMPLE_CHECKS.filter((r) => r.result === 'FAIL' && r.category === category).map((r) => r.findingId);
      expect(got.sort()).toEqual([...ids].sort());
    }
  });

  it('PASS rows are mapped by their text to the expected category', () => {
    const passes = SAMPLE_CHECKS.filter((r) => r.result === 'PASS').map((r) => ({ check: r.check, category: r.category }));
    expect(passes).toEqual(EXPECTED_PASS);
  });

  it('count tiles sum to the number of FAIL rows', () => {
    const total = Object.values(failCountsByCategory()).reduce((a, b) => a + (b ?? 0), 0);
    expect(total).toBe(SAMPLE_CHECKS.filter((r) => r.result === 'FAIL').length);
  });

  it('is derived from the page: one FAIL row per finding, one PASS row per "already works" line', () => {
    const fails = SAMPLE_CHECKS.filter((r) => r.result === 'FAIL');
    expect(fails.map((r) => r.findingId).sort()).toEqual(SAMPLE_FINDINGS.map((f) => f.id).sort());
    for (const r of fails) {
      const f = SAMPLE_FINDINGS.find((x) => x.id === r.findingId)!;
      expect(r.check).toBe(f.title);
      expect(r.fix).toBe(f.fix);
    }
    const passes = SAMPLE_CHECKS.filter((r) => r.result === 'PASS');
    expect(passes.map((r) => r.check)).toEqual(SAMPLE_SUMMARY.wentWell);
  });

  it('page renders the table above the summary and keeps the findings section', () => {
    const src = read('app/audit/sample-report/page.tsx');
    expect(src).toContain('SAMPLE_CHECKS');
    expect(src.indexOf('id="checks"')).toBeGreaterThan(-1);
    expect(src.indexOf('id="checks"')).toBeLessThan(src.indexOf('id="summary"'));
    expect(src).toContain('id="findings"');
  });

  describe('rendered page', () => {
    const html = renderToStaticMarkup(createElement(Page));

    it('has a #finding-<id> anchor for every FAIL row, and each row links to it', () => {
      for (const f of SAMPLE_FINDINGS) {
        expect(html).toContain(`id="finding-${f.id}"`);
        expect(html).toContain(`href="#finding-${f.id}"`);
      }
      const checksHtml = html.slice(html.indexOf('id="checks"'), html.indexOf('id="summary"'));
      for (const r of SAMPLE_CHECKS.filter((x) => x.result === 'FAIL')) {
        expect(checksHtml).toContain(`href="#finding-${r.findingId}"`);
      }
    });

    it('renders count tiles that match the data and sum to the FAIL rows', () => {
      const list = html.match(/<ul data-testid="fail-counts"[^>]*>([\s\S]*?)<\/ul>/);
      expect(list).not.toBeNull();
      const tiles = [...list![1].matchAll(/<li[^>]*><p[^>]*>(\d+)<\/p><p[^>]*>([^<]+)<\/p><\/li>/g)].map((m) => ({
        category: m[2],
        n: Number(m[1]),
      }));
      const expected = CHECK_CATEGORY_ORDER.filter((c) => EXPECTED_FAIL_COUNTS[c as keyof typeof EXPECTED_FAIL_COUNTS]).map(
        (c) => ({ category: c, n: EXPECTED_FAIL_COUNTS[c as keyof typeof EXPECTED_FAIL_COUNTS] }),
      );
      expect(tiles).toEqual(expected);
      expect(tiles.reduce((a, t) => a + t.n, 0)).toBe(16);
      const failRows = (html.match(/data-result="FAIL"/g) ?? []).length;
      expect(failRows).toBe(16);
    });
  });
});
