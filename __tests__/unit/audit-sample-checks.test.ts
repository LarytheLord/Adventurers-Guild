import fs from 'fs';
import path from 'path';
import { SAMPLE_FINDINGS, SAMPLE_SUMMARY } from '@/lib/audit-offer/sample-report';
import {
  SAMPLE_CHECKS,
  SAMPLE_CHECKS_DATE,
  SAMPLE_CHECKS_LABEL,
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

  it('category counts equal the number of FAIL rows', () => {
    const counts = failCountsByCategory();
    for (const [category, n] of Object.entries(counts)) {
      expect(n).toBe(SAMPLE_CHECKS.filter((r) => r.result === 'FAIL' && r.category === category).length);
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
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
});
