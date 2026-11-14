import {
  BUILDERS,
  CONSENT_LABEL,
  FREE_OFFER_LINE,
  NEXT_STEPS,
  REQUEST_MAIL_TO,
  buildRequestMailto,
  validateRequest,
  type RequestInput,
} from '@/lib/audit-offer/request';
import { AUDIT_PACKAGES } from '@/lib/audit-offer/content';

const good: RequestInput = {
  appUrl: 'https://my-app.example.com',
  builder: 'Lovable',
  whatItDoes: 'Booking tool for yoga studios',
  payments: 'yes',
  email: 'founder@example.com',
  consent: true,
};

function decodeBody(mailto: string): string {
  const q = mailto.split('?')[1];
  const body = q.split('&').find((p) => p.startsWith('body='))!;
  return decodeURIComponent(body.slice('body='.length));
}

describe('request launch check form', () => {
  it('offers the agreed builders', () => {
    expect(BUILDERS).toEqual(['Lovable', 'Bolt', 'Replit', 'v0', 'Cursor', 'Other']);
  });

  it('builds a mailto to the guild address with a subject', () => {
    const r = buildRequestMailto(good);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(REQUEST_MAIL_TO).toBe('abid@guilds.work');
    expect(r.href.startsWith('mailto:abid@guilds.work?subject=Launch%20Check%20request&body=')).toBe(true);
  });

  it('puts every field in the body', () => {
    const r = buildRequestMailto(good);
    if (!r.ok) throw new Error('expected ok');
    const body = decodeBody(r.href);
    expect(body).toContain('App URL: https://my-app.example.com');
    expect(body).toContain('Built with: Lovable');
    expect(body).toContain('What the app does: Booking tool for yoga studios');
    expect(body).toContain('Takes payments: Yes');
    expect(body).toContain('Reply email: founder@example.com');
    expect(body).toContain(`Consent: ${CONSENT_LABEL}`);
  });

  it('reports payments no', () => {
    const r = buildRequestMailto({ ...good, payments: 'no' });
    if (!r.ok) throw new Error('expected ok');
    expect(decodeBody(r.href)).toContain('Takes payments: No');
  });

  it('requires consent', () => {
    const r = buildRequestMailto({ ...good, consent: false });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.consent).toBeTruthy();
    expect(validateRequest({ ...good, consent: false }).consent).toBeTruthy();
  });

  it('consent label is the agreed wording', () => {
    expect(CONSENT_LABEL).toBe('I own this app or have written permission to have it checked');
  });

  it('requires app url, what it does, a valid email, a known builder and a payments answer', () => {
    expect(validateRequest({ ...good, appUrl: '' }).appUrl).toBeTruthy();
    expect(validateRequest({ ...good, appUrl: 'not a url' }).appUrl).toBeTruthy();
    expect(validateRequest({ ...good, appUrl: 'javascript:alert(1)' }).appUrl).toBeTruthy();
    expect(validateRequest({ ...good, whatItDoes: '   ' }).whatItDoes).toBeTruthy();
    expect(validateRequest({ ...good, email: 'nope' }).email).toBeTruthy();
    expect(validateRequest({ ...good, builder: '' as never }).builder).toBeTruthy();
    expect(validateRequest({ ...good, payments: '' as never }).payments).toBeTruthy();
    expect(validateRequest(good)).toEqual({});
  });

  it('refuses to build a mailto when invalid', () => {
    const r = buildRequestMailto({ ...good, email: '' });
    expect(r.ok).toBe(false);
  });

  it('keeps the mailto ASCII even when the user types other characters', () => {
    const r = buildRequestMailto({ ...good, whatItDoes: 'Café ₹ menu & orders = fun\nline two' });
    if (!r.ok) throw new Error('expected ok');
    // eslint-disable-next-line no-control-regex
    expect(/^[\x00-\x7F]*$/.test(r.href)).toBe(true);
    expect(r.href).not.toMatch(/[\r\n ]/);
    expect(decodeBody(r.href)).toContain('line two');
  });

  it('does not let a typed value inject extra mailto headers', () => {
    const r = buildRequestMailto({ ...good, whatItDoes: 'x&bcc=evil@example.com' });
    if (!r.ok) throw new Error('expected ok');
    expect(r.href).not.toContain('&bcc=');
    expect(r.href.split('?')[1].split('&').map((p) => p.split('=')[0])).toEqual(['subject', 'body']);
  });

  it('what happens next has the four agreed points', () => {
    expect(NEXT_STEPS).toHaveLength(4);
    const t = NEXT_STEPS.join(' ').toLowerCase();
    expect(t).toContain('2 working days');
    expect(t).toContain('only check apps you own');
    expect(t).toContain('written report');
    expect(t).toContain('fixed quote');
  });

  it('free offer line is the exact wording', () => {
    expect(FREE_OFFER_LINE).toBe(
      'We are doing the first 3 checks free in exchange for honest feedback and an anonymised case study',
    );
  });

  it('all static copy is ASCII and never claims CERT-In empanelment', () => {
    const t = JSON.stringify({ BUILDERS, CONSENT_LABEL, FREE_OFFER_LINE, NEXT_STEPS });
    // eslint-disable-next-line no-control-regex
    expect(/^[\x00-\x7F]*$/.test(t)).toBe(true);
    expect(t.toLowerCase()).not.toContain('empanelled');
  });

  it('prices on /audit are unchanged', () => {
    expect(AUDIT_PACKAGES.map((p) => p.price)).toEqual(['$99', 'From $800', 'From $150/month']);
  });
});
