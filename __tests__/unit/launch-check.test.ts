import fs from 'fs';
import path from 'path';
import * as offer from '@/lib/audit-offer/content';
import * as home from '@/lib/home/content';

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

describe('Launch Check: four areas', () => {
  const areas = (offer as unknown as { AUDIT_AREAS?: Array<{ id: string; title: string; summary: string; checks: string[] }> })
    .AUDIT_AREAS;

  it('defines exactly four areas with equal weight', () => {
    expect(areas).toBeDefined();
    expect(areas!.map((a) => a.id)).toEqual(['payments', 'deployment', 'performance', 'security']);
    const sizes = new Set(areas!.map((a) => a.checks.length));
    expect(sizes.size).toBe(1);
    expect(areas![0].checks.length).toBeGreaterThanOrEqual(4);
  });

  it('names the required topics in each area', () => {
    const text = (id: string) =>
      JSON.stringify(areas!.find((a) => a.id === id)).toLowerCase();
    for (const t of ['razorpay', 'stripe', 'webhook', 'refund', 'test', 'live']) expect(text('payments')).toContain(t);
    for (const t of ['env', 'domain', 'spf', 'backup']) expect(text('deployment')).toContain(t);
    for (const t of ['speed', 'index', 'image', 'bill', 'visits']) expect(text('performance')).toContain(t);
    for (const t of ['row level security', 'secret', 'login']) expect(text('security')).toContain(t);
  });

  it('audit page renders every area from the data source', () => {
    const src = read('app/audit/page.tsx');
    expect(src).toContain('AUDIT_AREAS.map');
    expect(src).toContain('Launch Check');
    expect(src).not.toContain('Production Check');
    expect(src).not.toContain('AUDIT_CHECKS');
    for (const name of ['Lovable', 'Bolt', 'Replit', 'v0', 'Cursor']) expect(src).toContain(name);
  });

  it('keeps the published prices and adds the fixed-quote note', () => {
    expect(offer.AUDIT_PACKAGES.map((p) => p.price)).toEqual(['$99', 'From $800', 'From $150/month']);
    expect(JSON.stringify(offer).toLowerCase()).toContain('fixed quote after the check');
    expect(read('app/audit/page.tsx')).toContain('AUDIT_PRICE_NOTE');
  });

  it('stays honest: no invented figures, testimonials or auditor claims', () => {
    const all = (JSON.stringify(offer) + read('app/audit/page.tsx') + read('app/checklist/page.tsx')).toLowerCase();
    expect(all).not.toContain('114');
    for (const bad of ['testimonial', 'trusted by', 'certified', 'we guarantee', 'guaranteed']) expect(all).not.toContain(bad);
    expect(all).toMatch(/not a cert-in empanelled auditor/);
    expect(all).not.toMatch(/(we are|guild is) (a )?cert-in empanelled/);
  });

  it('home offer card and nav use the new name', () => {
    const offerCard = home.HOME_OFFERS.find((o) => o.id === 'production-check')!;
    const t = JSON.stringify(offerCard) + JSON.stringify(home.HOME_HERO);
    expect(t).toContain('Launch Check');
    expect(t).not.toContain('Production Check');
    expect(t.toLowerCase()).toContain('payments');
    expect(read('components/Navigation.tsx')).toContain("label: 'Launch Check'");
  });

  it('checklist intro points to the Launch Check and the new groups exist', () => {
    const src = read('app/checklist/page.tsx');
    expect(src).toContain('Launch Check');
    expect(src).not.toContain('Production Check');
    expect(src).not.toContain('114');
    const ids = offer.CHECKLIST_GROUPS.map((g) => g.id);
    expect(ids).toEqual(expect.arrayContaining(['payments', 'deployment', 'performance']));
    expect(offer.CHECKLIST_GROUPS.find((g) => g.id === 'payments')!.items.length).toBeGreaterThanOrEqual(6);
  });
});
