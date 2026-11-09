import {
  AUDIT_MAILTO,
  AUDIT_PACKAGES,
  CHECKLIST_GROUPS,
} from '@/lib/audit-offer/content';

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
    expect(AUDIT_MAILTO.startsWith('mailto:abid@guilds.work?subject=Production%20Check%20request&body=')).toBe(true);
  });

  it('checklist has about 25 items, each with check and why', () => {
    const items = CHECKLIST_GROUPS.flatMap((g) => g.items);
    expect(items.length).toBeGreaterThanOrEqual(22);
    expect(items.length).toBeLessThanOrEqual(28);
    for (const i of items) {
      expect(i.check.length).toBeGreaterThan(10);
      expect(i.why.length).toBeGreaterThan(10);
    }
  });

  it('checklist has no commands or exploit steps', () => {
    const t = JSON.stringify(CHECKLIST_GROUPS).toLowerCase();
    for (const bad of ['curl', 'select *', 'service_role key to', 'payload', 'exploit']) {
      expect(t).not.toContain(bad);
    }
  });
});
