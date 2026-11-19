// Checks table for the sample Launch Check report. Everything here is
// FICTIONAL and DERIVED from findings already on the page: every FAIL row is
// one finding (same title, same fix) and every PASS row is one line from the
// "What already works" list. Nothing new is claimed here.

import { SAMPLE_FINDINGS, SAMPLE_SUMMARY } from './sample-report';

export const SAMPLE_CHECKS_DATE = '2026-11-19';

export const SAMPLE_CHECKS_LABEL = 'Sample checks table on a fictional app';

export type CheckCategory =
  | 'auth'
  | 'data access'
  | 'secrets'
  | 'payments'
  | 'deployment'
  | 'performance'
  | 'privacy';

export const CHECK_CATEGORY_ORDER: CheckCategory[] = [
  'auth',
  'data access',
  'secrets',
  'payments',
  'deployment',
  'performance',
  'privacy',
];

export type CheckRow = {
  check: string;
  category: CheckCategory;
  result: 'PASS' | 'FAIL';
  /** Only on FAIL rows. */
  fix?: string;
  /** Only on FAIL rows: the finding on the page this row comes from. */
  findingId?: string;
};

const FINDING_CATEGORY: Record<string, CheckCategory> = {
  'P-1': 'payments',
  'P-2': 'payments',
  'P-3': 'payments',
  'P-4': 'secrets',
  'D-1': 'deployment',
  'D-2': 'deployment',
  'D-3': 'deployment',
  'D-4': 'deployment',
  'C-1': 'performance',
  'C-2': 'performance',
  'C-3': 'performance',
  'C-4': 'performance',
  'S-1': 'data access',
  'S-2': 'secrets',
  'S-3': 'auth',
  'S-4': 'privacy',
};

// One category per line of SAMPLE_SUMMARY.wentWell, in the same order.
const WENT_WELL_CATEGORY: CheckCategory[] = ['auth', 'secrets', 'deployment'];

export const SAMPLE_CHECKS: CheckRow[] = [
  ...SAMPLE_FINDINGS.map(
    (f): CheckRow => ({
      check: f.title,
      category: FINDING_CATEGORY[f.id],
      result: 'FAIL',
      fix: f.fix,
      findingId: f.id,
    }),
  ),
  ...SAMPLE_SUMMARY.wentWell.map(
    (w, i): CheckRow => ({ check: w, category: WENT_WELL_CATEGORY[i], result: 'PASS' }),
  ),
];

/** Number of FAIL rows per category, for the categories that appear in the table. */
export function failCountsByCategory(): Partial<Record<CheckCategory, number>> {
  const counts: Partial<Record<CheckCategory, number>> = {};
  for (const r of SAMPLE_CHECKS) {
    if (r.result !== 'FAIL') continue;
    counts[r.category] = (counts[r.category] ?? 0) + 1;
  }
  return counts;
}
