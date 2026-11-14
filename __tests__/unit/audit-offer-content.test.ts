import {
  AUDIT_MAILTO,
  AUDIT_PACKAGES,
  CHECKLIST_GROUPS,
} from '@/lib/audit-offer/content';
import { slugify } from '@/lib/launch-check/data';

describe('audit offer content', () => {
  const allText = JSON.stringify({ AUDIT_MAILTO, AUDIT_PACKAGES, CHECKLIST_GROUPS });

  it('is pure ASCII', () => {
    // eslint-disable-next-line no-control-regex
    expect(/^[\x00-\x7F]*$/.test(allText)).toBe(true);
  });

  it('has three packages with the agreed prices', () => {
    expect(AUDIT_PACKAGES.map((p) => p.name)).toEqual(['Check', 'Fix', 'Care']);
    expect(AUDIT_PACKAGES.map((p) => p.price)).toEqual(['$99', 'From $800', 'From $150/month']);
  });

  it('mailto points to the right address and subject', () => {
    expect(AUDIT_MAILTO.startsWith('mailto:abid@guilds.work?subject=Launch%20Check%20request&body=')).toBe(true);
  });

  it('checklist has 40 items, each with check and why', () => {
    const items = CHECKLIST_GROUPS.flatMap((g) => g.items);
    expect(items.length).toBe(40);
    for (const i of items) {
      expect(i.check.length).toBeGreaterThan(10);
      expect(i.why.length).toBeGreaterThan(10);
    }
  });

  it('checklist covers entitlements, server-side limits, hard caps and server-only paid keys', () => {
    const group = (id: string) => CHECKLIST_GROUPS.find((g) => g.id === id)!.items.map((i) => i.check.toLowerCase());
    expect(group('database').some((c) => c.includes('plan') && c.includes('credits') && c.includes('update'))).toBe(true);
    expect(group('cost').some((c) => c.includes('per-user and per-ip limits') && c.includes('server'))).toBe(true);
    expect(group('cost').some((c) => c.includes('hard spend limit'))).toBe(true);
    expect(group('secrets').some((c) => c.includes('stripe secret key') && c.includes('only used in server code'))).toBe(true);
  });

  it('checklist has an AI behaviour section with three checks', () => {
    const ai = CHECKLIST_GROUPS.find((g) => g.id === 'ai');
    expect(ai?.title).toBe('AI behaviour');
    expect(ai?.items).toHaveLength(3);
    const t = ai!.items.map((i) => i.check.toLowerCase()).join(' | ');
    expect(t).toContain('prompt injection');
    expect(t).toContain('tools and data it needs');
    expect(t).toContain('sql or html');
  });

  it('every checklist anchor is unique', () => {
    const slugs = CHECKLIST_GROUPS.flatMap((g) => g.items.map((i) => slugify(i.check)));
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('checklist has no commands or exploit steps', () => {
    const t = JSON.stringify(CHECKLIST_GROUPS).toLowerCase();
    for (const bad of ['curl', 'select *', 'service_role key to', 'payload', 'exploit']) {
      expect(t).not.toContain(bad);
    }
  });
});
