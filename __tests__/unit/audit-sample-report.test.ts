import fs from 'fs';
import path from 'path';
import { AUDIT_AREAS, AUDIT_PACKAGES } from '@/lib/audit-offer/content';
import * as report from '@/lib/audit-offer/sample-report';

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

const SEVERITIES = ['critical', 'high', 'medium', 'low'];

describe('sample report: banner and fictional framing', () => {
  it('has the exact banner text', () => {
    expect(report.SAMPLE_REPORT_BANNER).toBe('Sample report on a fictional app. Not a real client.');
  });

  it('names the demo app as fictional', () => {
    expect(report.SAMPLE_APP_LINE).toBe('Demo Bookings, a fictional app built for this sample');
  });

  it('page renders the banner and the app line from the data source, banner first', () => {
    const src = read('app/audit/sample-report/page.tsx');
    expect(src).toContain('SAMPLE_REPORT_BANNER');
    expect(src).toContain('SAMPLE_APP_LINE');
    expect(src.indexOf('{SAMPLE_REPORT_BANNER}')).toBeGreaterThan(-1);
    expect(src.indexOf('{SAMPLE_REPORT_BANNER}')).toBeLessThan(src.indexOf('id="summary"'));
    expect(src).toContain('role="note"');
  });

  it('uses only reserved example domains, never a real one', () => {
    const t = JSON.stringify(report);
    const domains = t.match(/[a-z0-9-]+(\.[a-z0-9-]+)+/gi) ?? [];
    for (const d of domains) {
      if (/\.(ts|tsx|js|json|md)$/i.test(d)) continue;
      expect(d.toLowerCase()).toMatch(/\.example$|^[0-9.]+$|^e\.g\.$|^i\.e\.$/);
    }
  });
});

describe('sample report: structure', () => {
  const findings = report.SAMPLE_FINDINGS;

  it('covers the same four areas, in the same order, as the offer page', () => {
    expect(report.SAMPLE_AREA_ORDER).toEqual(AUDIT_AREAS.map((a) => a.id));
    expect(report.SAMPLE_AREA_ORDER).toEqual(['payments', 'deployment', 'performance', 'security']);
  });

  it('has the same number of findings in each area', () => {
    const counts = report.SAMPLE_AREA_ORDER.map((id) => findings.filter((f) => f.area === id).length);
    expect(new Set(counts).size).toBe(1);
    expect(counts[0]).toBeGreaterThanOrEqual(3);
  });

  it('gives every finding severity, evidence type, fix and effort estimate', () => {
    const ids = new Set<string>();
    for (const f of findings) {
      expect(ids.has(f.id)).toBe(false);
      ids.add(f.id);
      expect(SEVERITIES).toContain(f.severity);
      expect(Object.keys(report.EVIDENCE_TYPES)).toContain(f.evidence);
      expect(f.title.length).toBeGreaterThan(10);
      expect(f.what.length).toBeGreaterThan(20);
      expect(f.evidenceNote.length).toBeGreaterThan(10);
      expect(f.fix.length).toBeGreaterThan(10);
      expect(f.effortHours).toBeGreaterThan(0);
    }
  });

  it('shows all four severities so the scale is clear', () => {
    for (const s of SEVERITIES) expect(findings.some((f) => f.severity === s)).toBe(true);
  });

  it('summary counts match the findings', () => {
    const counts = report.summaryCounts();
    for (const s of SEVERITIES) {
      expect(counts[s as keyof typeof counts]).toBe(findings.filter((f) => f.severity === s).length);
    }
    expect(counts.total).toBe(findings.length);
  });

  it('page has sections for summary, each area, quote and retest', () => {
    const src = read('app/audit/sample-report/page.tsx');
    for (const id of ['summary', 'how-to-read', 'findings', 'quote', 'retest']) {
      expect(src).toContain(`id="${id}"`);
    }
    expect(src).toContain('SAMPLE_FINDINGS');
    expect(src).toContain('AUDIT_AREAS');
  });
});

describe('sample report: fixed quote', () => {
  const q = report.SAMPLE_QUOTE;

  it('scopes the quote to the critical and high findings, as /audit says', () => {
    const wanted = report.SAMPLE_FINDINGS.filter((f) => f.severity === 'critical' || f.severity === 'high').map((f) => f.id);
    expect([...q.includedFindingIds].sort()).toEqual([...wanted].sort());
  });

  it('adds up the effort for the included findings', () => {
    const sum = report.SAMPLE_FINDINGS.filter((f) => q.includedFindingIds.includes(f.id)).reduce(
      (n, f) => n + f.effortHours,
      0,
    );
    expect(report.quoteEffortHours()).toBe(sum);
  });

  it('has the structural parts of a quote', () => {
    expect(q.scope.length).toBeGreaterThan(0);
    expect(q.notIncluded.length).toBeGreaterThan(0);
    expect(q.priceDependsOn.length).toBeGreaterThan(0);
    expect(q.priceStatement.toLowerCase()).toContain('fixed');
    expect(q.creditStatement).toContain('$99');
  });

  it('shows no dollar amount beyond the ones already on /audit', () => {
    const published = new Set(['$99', '$800', '$150']);
    const all = JSON.stringify(report) + read('app/audit/sample-report/page.tsx');
    const amounts = all.match(/\$\s?\d[\d,.]*/g) ?? [];
    for (const a of amounts) expect(published.has(a.replace(/\s/g, '').replace(/[.,]+$/, ''))).toBe(true);
    // the published figures really are the ones on /audit
    expect(AUDIT_PACKAGES.map((p) => p.price)).toEqual(['$99', 'From $800', 'From $150/month']);
  });
});

describe('sample report: retest', () => {
  it('retests every finding in the quote and nothing outside it', () => {
    const ids = report.SAMPLE_RETEST.map((r) => r.findingId).sort();
    expect(ids).toEqual([...report.SAMPLE_QUOTE.includedFindingIds].sort());
  });

  it('uses known statuses and says what was re-run', () => {
    for (const r of report.SAMPLE_RETEST) {
      expect(['closed', 'partly closed', 'open']).toContain(r.status);
      expect(r.method.length).toBeGreaterThan(15);
    }
  });

  it('is honest: not everything is closed in the sample', () => {
    expect(report.SAMPLE_RETEST.some((r) => r.status !== 'closed')).toBe(true);
  });
});

describe('sample report: honesty and format', () => {
  const all = JSON.stringify(report) + read('app/audit/sample-report/page.tsx');

  it('is pure ASCII', () => {
    // eslint-disable-next-line no-control-regex
    expect(/^[\x00-\x7F]*$/.test(all)).toBe(true);
  });

  it('never claims to be a CERT-In empanelled auditor', () => {
    const t = all.toLowerCase();
    expect(t).toMatch(/not a cert-in empanelled auditor/);
    expect(t).not.toMatch(/(we are|guild is) (a )?cert-in empanelled/);
    for (const bad of ['certified', 'we guarantee', 'guaranteed', 'testimonial', 'trusted by']) {
      expect(t).not.toContain(bad);
    }
  });

  it('does not contain exploit commands or real secrets', () => {
    const t = all.toLowerCase();
    for (const bad of ['curl ', 'select *', 'sk_live', 'whsec_', 'eyj']) expect(t).not.toContain(bad);
  });
});

describe('sample report: linking', () => {
  it('/audit links to the sample report', () => {
    expect(report.SAMPLE_REPORT_PATH).toBe('/audit/sample-report');
    expect(read('app/audit/page.tsx')).toContain('SAMPLE_REPORT_PATH');
  });

  it('shows the site footer on the sample report', () => {
    expect(read('components/ConditionalFooter.tsx')).toContain("'/audit/sample-report'");
  });
});
