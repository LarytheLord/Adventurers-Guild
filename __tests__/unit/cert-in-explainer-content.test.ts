import {
  EXPLAINER_TITLE,
  EXPLAINER_DESCRIPTION,
  EXPLAINER_PATH,
  EXPLAINER_DISCLAIMER,
  EXPLAINER_MAILTO,
  CERTIN_PDF_URL,
  EXPLAINER_SECTIONS,
  EXPLAINER_FAQ,
  explainerPlainText,
} from '@/lib/cert-in-explainer/content';

describe('CERT-In AI security auditing guidelines explainer content', () => {
  it('is pure ASCII', () => {
    const all = JSON.stringify({
      EXPLAINER_TITLE,
      EXPLAINER_DESCRIPTION,
      EXPLAINER_PATH,
      EXPLAINER_DISCLAIMER,
      EXPLAINER_MAILTO,
      CERTIN_PDF_URL,
      EXPLAINER_SECTIONS,
      EXPLAINER_FAQ,
    });
    // eslint-disable-next-line no-control-regex
    expect(/^[\x00-\x7F]*$/.test(all)).toBe(true);
  });

  it('has 5 to 6 FAQ entries and every one has a question and an answer', () => {
    expect(EXPLAINER_FAQ.length).toBeGreaterThanOrEqual(5);
    expect(EXPLAINER_FAQ.length).toBeLessThanOrEqual(6);
    for (const f of EXPLAINER_FAQ) {
      expect(f.q.trim().length).toBeGreaterThan(10);
      expect(f.a.trim().length).toBeGreaterThan(40);
    }
  });

  it('links to the official PDF in the body', () => {
    expect(CERTIN_PDF_URL).toBe('https://www.cert-in.org.in/PDF/AI_Security_Auditing_Guidelines.pdf');
    expect(explainerPlainText()).toContain(CERTIN_PDF_URL);
  });

  it('uses the required route, title, mailto and disclaimer', () => {
    expect(EXPLAINER_PATH).toBe('/guides/cert-in-ai-security-auditing-guidelines');
    expect(EXPLAINER_TITLE).toBe('CERT-In AI Security Auditing Guidelines (2026), explained for startups');
    expect(EXPLAINER_MAILTO).toBe('mailto:abid@guilds.work?subject=AI%20audit%20readiness');
    expect(EXPLAINER_DISCLAIMER).toBe(
      'Guild is not a CERT-In empanelled auditor. This guide is unofficial and is not legal advice.',
    );
  });

  it('has the eight required sections in order', () => {
    expect(EXPLAINER_SECTIONS.map((s) => s.id)).toEqual([
      'what-was-published',
      'who-it-applies-to',
      'out-of-scope',
      'how-tiering-works',
      'small-companies',
      'what-auditors-need',
      'thirty-day-plan',
      'open-questions',
    ]);
  });

  it('quotes the key sentences exactly', () => {
    const t = explainerPlainText();
    expect(t).toContain('irrespective of organisational size');
    expect(t).toContain('all types and sizes of organisations');
    expect(t).toContain('Sole-auditor engagements are not permitted for Tier 3-4 systems');
    expect(t).toContain('purpose, owner, risk tier, deployment status, data sources, and model type');
    expect(t).toContain('/ai-risk-tier');
  });

  it('says plainly that no effective date or penalty was found', () => {
    const t = explainerPlainText().toLowerCase();
    expect(t).toContain('no effective date');
    expect(t).toContain('penalty');
  });

  it('is about 1,200 to 1,600 words', () => {
    const words = explainerPlainText().split(/\s+/).filter(Boolean).length;
    expect(words).toBeGreaterThanOrEqual(1200);
    expect(words).toBeLessThanOrEqual(1600);
  });
});
