// Scoring and content rules for the DPDP readiness self-check.
// Pure functions, no I/O, so they can be tested without a browser.
// Question wording and provision references live in data.ts and must come
// from the Gazette text of the DPDP Act 2023 and the DPDP Rules 2025.

export const DPDP_QUESTION_COUNT = 20;

export type DpdpTopic =
  | 'notice'
  | 'consent'
  | 'purpose-limitation'
  | 'children'
  | 'security'
  | 'breach'
  | 'retention-erasure'
  | 'grievance'
  | 'significant-data-fiduciary'
  | 'processors';

export type Answer = 'yes' | 'no';

export interface ProvisionRef {
  /** 'section' is a section of the Act; 'rule' is a rule of the Rules. */
  kind: 'section' | 'rule';
  /** Number as printed in the Gazette text, for example "6(1)". */
  ref: string;
}

export interface DpdpQuestion {
  id: string;
  topic: DpdpTopic;
  /** Phrased so that Yes means the obligation is met. */
  question: string;
  provision: ProvisionRef;
  /** Plain-English fix shown when the answer is No. */
  fix: string;
}

export interface Gap {
  id: string;
  topic: DpdpTopic;
  question: string;
  provision: ProvisionRef;
  fix: string;
}

export interface ReadinessResult {
  yes: number;
  total: number;
  percent: number;
  gaps: Gap[];
}

/** Returns null until every question has an answer. */
export function assessReadiness(
  questions: DpdpQuestion[],
  answers: Record<string, Answer | undefined>,
): ReadinessResult | null {
  if (questions.length === 0) return null;
  if (questions.some((x) => answers[x.id] !== 'yes' && answers[x.id] !== 'no')) return null;
  const gaps: Gap[] = questions
    .filter((x) => answers[x.id] === 'no')
    .map(({ id, topic, question, provision, fix }) => ({ id, topic, question, provision, fix }));
  const yes = questions.length - gaps.length;
  return { yes, total: questions.length, percent: Math.round((yes / questions.length) * 100), gaps };
}

// eslint-disable-next-line no-control-regex
const ASCII = /^[\x00-\x7F]*$/;

/** Returns a list of human-readable problems; empty means the list is well formed. */
export function validateQuestions(questions: DpdpQuestion[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const x of questions) {
    if (seen.has(x.id)) errors.push(`${x.id}: duplicate id`);
    seen.add(x.id);
    if (!x.question.trim()) errors.push(`${x.id}: empty question`);
    if (!x.fix.trim()) errors.push(`${x.id}: empty fix`);
    if (!x.provision.ref.trim()) errors.push(`${x.id}: missing provision reference`);
    if (!ASCII.test(JSON.stringify(x))) errors.push(`${x.id}: non-ASCII text`);
  }
  return errors;
}
