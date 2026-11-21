// Checks table for the sample Launch Check report. Everything here is
// FICTIONAL and DERIVED from findings already on the page: every FAIL row is
// one finding (same title, same fix) and every PASS row is one line from the
// "What already works" list. Nothing new is claimed here.

import { SAMPLE_FINDINGS, SAMPLE_SUMMARY, type FindingId } from './sample-report';

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
  findingId?: FindingId;
};

// Category of every finding, keyed by id. Typed over FindingId, so adding a
// finding id to sample-report.ts without a line here fails type-check.
// Each line quotes the finding title that justifies it.
const FINDING_CATEGORY: Record<FindingId, CheckCategory> = {
  // "The booking price is taken from the browser": the amount charged at checkout.
  'P-1': 'payments',
  // "Payment webhooks are not verified, and a repeat confirms the booking twice": payment events.
  'P-2': 'payments',
  // "A refund does not cancel the booking": refund handling.
  'P-3': 'payments',
  // "Preview builds carry the live payment key": the key is the live PUBLISHABLE key
  // (not a secret), and the risk is a real card being charged from a preview, so
  // this is a payments finding, not secrets.
  'P-4': 'payments',
  // "The email key is missing on the production host, so confirmation emails never send":
  // a variable not set on the production host.
  'D-1': 'deployment',
  // "Email records are incomplete: no DKIM for the sender, no DMARC": DNS for the domain.
  'D-2': 'deployment',
  // "The database has no backups, and none has ever been restored": hosting setup.
  'D-3': 'deployment',
  // "The www address does not redirect to the main address": domain and host config.
  'D-4': 'deployment',
  // "The home page sends oversized images": page weight, measured with Lighthouse.
  'C-1': 'performance',
  // "The calendar page filters on columns with no index": slow query as data grows.
  'C-2': 'performance',
  // "The reminder endpoint has no per-user limit and no spend cap": its report area is
  // "Performance and cost"; the finding is about cost (paid sends), so it stays here.
  'C-3': 'performance',
  // "A chat widget and web fonts block the first paint": render-blocking resources.
  'C-4': 'performance',
  // "Row level security is off on the bookings table": who can read which rows.
  'S-1': 'data access',
  // "A service-level secret key is inside the browser code": a secret exposed to visitors.
  'S-2': 'secrets',
  // "Password reset reveals which emails have an account, and links do not expire": account access.
  'S-3': 'auth',
  // "The privacy policy does not mention the text message provider": what the policy tells users.
  'S-4': 'privacy',
};

type WentWell = (typeof SAMPLE_SUMMARY.wentWell)[number];

// Category of every "What already works" line, keyed by its text (not by position).
// SAMPLE_SUMMARY.wentWell is `as const`, so a changed or added line without an
// entry here fails type-check.
const WENT_WELL_CATEGORY: Record<WentWell, CheckCategory> = {
  // "Sign-up and login work, and admin pages check the user on the server."
  'Sign-up and login work, and admin pages check the user on the server.': 'auth',
  // "Stripe keys are not in the browser code. Only the publishable key is.": key handling.
  'Stripe keys are not in the browser code. Only the publishable key is.': 'secrets',
  // "The domain has HTTPS and a valid certificate.": domain and host setup.
  'The domain has HTTPS and a valid certificate.': 'deployment',
};

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
    (w): CheckRow => ({ check: w, category: WENT_WELL_CATEGORY[w], result: 'PASS' }),
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
