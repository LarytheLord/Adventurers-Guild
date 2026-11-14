import {
  DPDP_QUESTION_COUNT,
  assessReadiness,
  validateQuestions,
  type DpdpQuestion,
} from '@/lib/dpdp-readiness/engine';
import {
  DPDP_PHASE_DATES,
  DPDP_PHASE_DATES_NOTE,
  DPDP_QUESTIONS,
  DPDP_RULES_NOTIFICATION,
} from '@/lib/dpdp-readiness/data';

function q(id: string, over: Partial<DpdpQuestion> = {}): DpdpQuestion {
  return {
    id,
    topic: 'notice',
    question: 'Do you do the thing?',
    provision: { kind: 'section', ref: 'PLACEHOLDER' },
    fix: 'Do the thing.',
    ...over,
  };
}

describe('assessReadiness (scoring logic)', () => {
  const qs = [q('a'), q('b'), q('c'), q('d')];

  it('returns null until every question is answered', () => {
    expect(assessReadiness(qs, { a: 'yes', b: 'no' })).toBeNull();
    expect(assessReadiness(qs, {})).toBeNull();
  });

  it('counts yes answers and lists every no answer as a gap, in question order', () => {
    const r = assessReadiness(qs, { a: 'yes', b: 'no', c: 'yes', d: 'no' });
    expect(r).not.toBeNull();
    expect(r!.yes).toBe(2);
    expect(r!.total).toBe(4);
    expect(r!.percent).toBe(50);
    expect(r!.gaps.map((g) => g.id)).toEqual(['b', 'd']);
  });

  it('has no gaps and 100 percent when everything is yes', () => {
    const r = assessReadiness(qs, { a: 'yes', b: 'yes', c: 'yes', d: 'yes' });
    expect(r!.gaps).toEqual([]);
    expect(r!.percent).toBe(100);
  });

  it('has 0 percent when everything is no', () => {
    const r = assessReadiness(qs, { a: 'no', b: 'no', c: 'no', d: 'no' });
    expect(r!.percent).toBe(0);
    expect(r!.gaps).toHaveLength(4);
  });

  it('rounds the percentage to a whole number', () => {
    const three = [q('a'), q('b'), q('c')];
    expect(assessReadiness(three, { a: 'yes', b: 'no', c: 'no' })!.percent).toBe(33);
    expect(assessReadiness(three, { a: 'yes', b: 'yes', c: 'no' })!.percent).toBe(67);
  });

  it('ignores answers for ids that are not questions', () => {
    const r = assessReadiness(qs, { a: 'yes', b: 'yes', c: 'yes', d: 'yes', zzz: 'no' });
    expect(r!.gaps).toEqual([]);
  });

  it('returns null for an empty question list rather than dividing by zero', () => {
    expect(assessReadiness([], {})).toBeNull();
  });

  it('carries the provision and fix of each gap through to the result', () => {
    const r = assessReadiness([q('a', { fix: 'Fix A.' })], { a: 'no' });
    expect(r!.gaps[0].provision).toEqual({ kind: 'section', ref: 'PLACEHOLDER' });
    expect(r!.gaps[0].fix).toBe('Fix A.');
  });
});

describe('validateQuestions (content rules)', () => {
  it('passes a well-formed list', () => {
    expect(validateQuestions([q('a'), q('b')])).toEqual([]);
  });

  it('flags a question with no provision reference', () => {
    const errs = validateQuestions([q('a', { provision: { kind: 'rule', ref: '' } })]);
    expect(errs.join(' ')).toMatch(/a.*provision/i);
  });

  it('flags duplicate ids', () => {
    expect(validateQuestions([q('a'), q('a')]).join(' ')).toMatch(/duplicate/i);
  });

  it('flags non-ASCII text', () => {
    expect(validateQuestions([q('a', { fix: 'Don' + String.fromCharCode(0x2019) + 't.' })]).join(' ')).toMatch(/ascii/i);
  });

  it('flags a missing fix or question', () => {
    expect(validateQuestions([q('a', { fix: '' })]).length).toBeGreaterThan(0);
    expect(validateQuestions([q('a', { question: ' ' })]).length).toBeGreaterThan(0);
  });
});

describe('DPDP_QUESTIONS (shipped content)', () => {
  it('has no validation errors', () => {
    expect(validateQuestions(DPDP_QUESTIONS)).toEqual([]);
  });

  it('has exactly 20 questions', () => {
    expect(DPDP_QUESTIONS).toHaveLength(DPDP_QUESTION_COUNT);
    expect(DPDP_QUESTION_COUNT).toBe(20);
  });

  it('every question cites a section of the Act in a plausible form', () => {
    for (const x of DPDP_QUESTIONS) {
      expect(x.provision.kind).toBe('section');
      expect(x.provision.ref).toMatch(/^\d{1,2}(\([0-9a-z]{1,3}\))*$/);
    }
  });

  it('cites no rule numbers: the Rules text was not read, so none may be invented', () => {
    expect(DPDP_QUESTIONS.filter((x) => x.provision.kind === 'rule')).toEqual([]);
  });

  it('covers all ten required topics', () => {
    const topics = new Set(DPDP_QUESTIONS.map((x) => x.topic));
    for (const t of [
      'notice',
      'consent',
      'purpose-limitation',
      'children',
      'security',
      'breach',
      'retention-erasure',
      'grievance',
      'significant-data-fiduciary',
      'processors',
    ]) {
      expect(topics.has(t as never)).toBe(true);
    }
  });

  it('phrases every question as a yes/no question and gives a fix of a full sentence', () => {
    for (const x of DPDP_QUESTIONS) {
      expect(x.question).toContain('?');
      expect(x.fix.length).toBeGreaterThan(40);
    }
  });
});

describe('notice questions cite what each provision covers', () => {
  const byId = (id: string) => DPDP_QUESTIONS.find((x) => x.id === id)!;

  it('notice-language is about language only and cites 5(3)', () => {
    const x = byId('notice-language');
    expect(x.provision.ref).toBe('5(3)');
    expect(x.question).toMatch(/English|Eighth Schedule/);
    expect(x.question).not.toMatch(/plain language|contact|Data Protection Officer/i);
    expect(x.fix).not.toMatch(/plain language|contact/i);
  });

  it('the contact person is a separate question citing 8(9)', () => {
    const x = byId('grievance-contact');
    expect(x.provision.ref).toBe('8(9)');
    expect(x.question).toMatch(/contact/i);
  });
});

describe('DPDP source note and dates', () => {
  it('names the Rules only by G.S.R. 846(E) and attributes phase dates to secondary sources', () => {
    expect(DPDP_RULES_NOTIFICATION).toMatch(/G\.S\.R\. 846\(E\)/);
    expect(DPDP_RULES_NOTIFICATION).toMatch(/as reported by Bar & Bench and Mondaq/);
    expect(DPDP_RULES_NOTIFICATION).not.toMatch(/84[345]\(E\)/);
    expect(DPDP_PHASE_DATES_NOTE).toMatch(/as reported by/i);
    expect(DPDP_PHASE_DATES_NOTE).toMatch(/check the Gazette/i);
    expect(DPDP_PHASE_DATES.map((d) => d.date)).toEqual(['14 November 2025', '14 November 2026', '14 May 2027']);
  });

  it('is ASCII', () => {
    const all = JSON.stringify({ DPDP_RULES_NOTIFICATION, DPDP_PHASE_DATES_NOTE, DPDP_PHASE_DATES });
    // eslint-disable-next-line no-control-regex
    expect(/^[\x00-\x7F]*$/.test(all)).toBe(true);
  });
});
