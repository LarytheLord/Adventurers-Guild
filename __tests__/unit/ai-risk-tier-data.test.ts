import {
  AI_RISK_FACTORS,
  AI_RISK_SCORES,
  AI_RISK_TIERS,
  AI_RISK_TIER_MAILTO,
  AI_RISK_PREPARE,
  CERTIN_PDF_URL,
  tierForScore,
  compositeScore,
} from '@/lib/ai-risk-tier/data';

describe('AI risk tier data (CERT-In AI Security Auditing Guidelines v1.0, Section 5)', () => {
  const allText = JSON.stringify({
    AI_RISK_FACTORS,
    AI_RISK_SCORES,
    AI_RISK_TIERS,
    AI_RISK_TIER_MAILTO,
    AI_RISK_PREPARE,
    CERTIN_PDF_URL,
  });

  it('is pure ASCII', () => {
    // eslint-disable-next-line no-control-regex
    expect(/^[\x00-\x7F]*$/.test(allText)).toBe(true);
  });

  it('has the eight factors F1..F8 with a description and four calibration levels', () => {
    expect(AI_RISK_FACTORS.map((f) => f.id)).toEqual(['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8']);
    for (const f of AI_RISK_FACTORS) {
      expect(f.name.length).toBeGreaterThan(3);
      expect(f.question.length).toBeGreaterThan(20);
      expect(f.levels).toHaveLength(4);
      for (const l of f.levels) expect(l.length).toBeGreaterThan(5);
    }
  });

  it('uses the 1-4 scoring scale', () => {
    expect(AI_RISK_SCORES.map((s) => [s.value, s.label])).toEqual([
      [1, 'Low'],
      [2, 'Moderate'],
      [3, 'High'],
      [4, 'Critical'],
    ]);
  });

  it('band thresholds match Table 11 (8-12, 13-19, 20-26, 27-32)', () => {
    expect(AI_RISK_TIERS.map((t) => [t.tier, t.min, t.max])).toEqual([
      [1, 8, 12],
      [2, 13, 19],
      [3, 20, 26],
      [4, 27, 32],
    ]);
    expect(AI_RISK_TIERS.map((t) => t.label)).toEqual(['Low', 'Moderate', 'High', 'Critical']);
  });

  it('bands cover every reachable score 8..32 with no gap or overlap', () => {
    const min = AI_RISK_FACTORS.length * 1;
    const max = AI_RISK_FACTORS.length * 4;
    expect([min, max]).toEqual([8, 32]);
    for (let s = min; s <= max; s++) {
      expect(AI_RISK_TIERS.filter((t) => s >= t.min && s <= t.max)).toHaveLength(1);
    }
  });

  it('every tier has a non-empty audit requirement string', () => {
    for (const t of AI_RISK_TIERS) {
      expect(typeof t.requirement).toBe('string');
      expect(t.requirement.trim().length).toBeGreaterThan(20);
    }
  });

  it('quotes the minimum audit requirement of Table 11', () => {
    expect(AI_RISK_TIERS[0].requirement).toBe('Self-assessment or basic internal review with documented evidence.');
    expect(AI_RISK_TIERS[1].requirement).toContain('Independent audit by CERT-In empanelled auditing organisations at least annually.');
    expect(AI_RISK_TIERS[2].requirement).toContain('Periodic Independent third-party audit by CERT-In empanelled auditing organisations');
    expect(AI_RISK_TIERS[3].requirement).toBe('Independent audit by CERT-In empanelled auditing organisation with continuous monitoring.');
  });

  it('tierForScore and compositeScore work at the edges', () => {
    expect(tierForScore(8)?.tier).toBe(1);
    expect(tierForScore(12)?.tier).toBe(1);
    expect(tierForScore(13)?.tier).toBe(2);
    expect(tierForScore(19)?.tier).toBe(2);
    expect(tierForScore(20)?.tier).toBe(3);
    expect(tierForScore(26)?.tier).toBe(3);
    expect(tierForScore(27)?.tier).toBe(4);
    expect(tierForScore(32)?.tier).toBe(4);
    expect(tierForScore(7)).toBeNull();
    expect(tierForScore(33)).toBeNull();
    expect(compositeScore({ F1: 1, F2: 2, F3: 3, F4: 4, F5: 1, F6: 1, F7: 1, F8: 1 })).toBe(14);
    expect(compositeScore({ F1: 1 })).toBeNull();
  });

  it('what-to-prepare items each carry a section number and the PDF link is the CERT-In one', () => {
    expect(AI_RISK_PREPARE.length).toBeGreaterThanOrEqual(4);
    for (const p of AI_RISK_PREPARE) {
      expect(p.section).toMatch(/^[0-9]+(\.[0-9]+)*$/);
      expect(p.title.length).toBeGreaterThan(3);
      expect(p.detail.length).toBeGreaterThan(20);
    }
    expect(CERTIN_PDF_URL).toBe('https://www.cert-in.org.in/PDF/AI_Security_Auditing_Guidelines.pdf');
  });

  it('mailto goes to abid@guilds.work with the audit readiness subject and a body asking for the three things', () => {
    expect(AI_RISK_TIER_MAILTO.startsWith('mailto:abid@guilds.work?subject=AI%20audit%20readiness&body=')).toBe(true);
    const body = decodeURIComponent(AI_RISK_TIER_MAILTO.split('&body=')[1]);
    expect(body).toMatch(/Company/);
    expect(body).toMatch(/AI systems/);
    expect(body).toMatch(/tier/i);
  });
});
