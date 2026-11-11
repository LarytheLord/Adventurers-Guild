// Sample Launch Check report. Everything here is FICTIONAL: the app, the
// findings and the numbers were written for this page. No real client.

export const SAMPLE_REPORT_PATH = '/audit/sample-report';

export const SAMPLE_REPORT_BANNER = 'Sample report on a fictional app. Not a real client.';

export const SAMPLE_APP_LINE = 'Demo Bookings, a fictional app built for this sample';

export const SAMPLE_APP = {
  what: 'Demo Bookings lets customers book appointments with independent providers and pay a deposit online.',
  stack: 'Built with Lovable and Supabase, payments through Stripe, hosted on a custom domain (demo-bookings.example).',
  scope:
    'We checked the four Launch Check areas on the live app and on a test copy, using two test customer accounts and Stripe test mode. We did no load testing and touched no third-party systems.',
};

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type AreaId = 'payments' | 'deployment' | 'performance' | 'security';

export const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];

export const SEVERITY_MEANING: Record<Severity, string> = {
  critical: 'Anyone can read or change other people\'s data, or get paid access for free, right now.',
  high: 'Likely to cause real loss or break a core flow soon.',
  medium: 'A real weakness that needs a particular situation to hurt you.',
  low: 'Worth tidying up. Little risk on its own.',
};

export const EVIDENCE_TYPES = {
  reproduced: 'We did it ourselves on a test account or test copy and saw the result.',
  measured: 'A standard tool measured it and we kept the output.',
  configuration: 'We looked at the settings in a dashboard or host and kept a screenshot.',
  code: 'We read the code or the build output. We did not trigger it.',
  document: 'We read a page or policy and compared it with what the app does.',
} as const;

export type EvidenceType = keyof typeof EVIDENCE_TYPES;

export const SAMPLE_AREA_ORDER: AreaId[] = ['payments', 'deployment', 'performance', 'security'];

export type Finding = {
  id: string;
  area: AreaId;
  severity: Severity;
  title: string;
  what: string;
  evidence: EvidenceType;
  evidenceNote: string;
  fix: string;
  effortHours: number;
};

export const SAMPLE_FINDINGS: Finding[] = [
  // Payments
  {
    id: 'P-1',
    area: 'payments',
    severity: 'critical',
    title: 'The booking price is taken from the browser',
    what: 'The checkout request carries the amount. The server charges whatever amount it receives.',
    evidence: 'reproduced',
    evidenceNote: 'In Stripe test mode we changed the amount in the request and a booking was created at the price we chose.',
    fix: 'Look up the price on the server from the service record and ignore any amount sent by the browser.',
    effortHours: 3,
  },
  {
    id: 'P-2',
    area: 'payments',
    severity: 'high',
    title: 'Payment webhooks are not verified, and a repeat confirms the booking twice',
    what: 'The webhook endpoint accepts any request that looks like a payment event, and handles a repeated event again.',
    evidence: 'reproduced',
    evidenceNote: 'We sent a hand-made test event with no signature and the booking was marked paid. Sending it twice produced two confirmation emails.',
    fix: 'Verify the signature on the raw request body, and store the id of each handled event so repeats are skipped.',
    effortHours: 4,
  },
  {
    id: 'P-3',
    area: 'payments',
    severity: 'medium',
    title: 'A refund does not cancel the booking',
    what: 'After a refund the customer keeps a confirmed booking and the time slot stays taken.',
    evidence: 'reproduced',
    evidenceNote: 'We refunded a test payment in the Stripe dashboard. The booking stayed confirmed.',
    fix: 'Handle the refund event: mark the booking cancelled and free the slot.',
    effortHours: 3,
  },
  {
    id: 'P-4',
    area: 'payments',
    severity: 'low',
    title: 'Preview builds carry the live payment key',
    what: 'Preview deployments use the same live publishable key as production, so a test run could take a real card.',
    evidence: 'configuration',
    evidenceNote: 'The host settings show one set of payment variables shared by production and preview. Previews are not public today.',
    fix: 'Give preview builds their own test keys and keep the live keys on production only.',
    effortHours: 1,
  },

  // Deployment
  {
    id: 'D-1',
    area: 'deployment',
    severity: 'high',
    title: 'The email key is missing on the production host, so confirmation emails never send',
    what: 'Emails work in the builder preview but the variable was never set on the production host. The failure is silent.',
    evidence: 'reproduced',
    evidenceNote: 'We made a booking on the live app. No confirmation email arrived and the host logs show an empty key.',
    fix: 'Set the variable on production, and make the app log an error when an email cannot be sent.',
    effortHours: 1,
  },
  {
    id: 'D-2',
    area: 'deployment',
    severity: 'medium',
    title: 'Email records are incomplete: no DKIM for the sender, no DMARC',
    what: 'SPF exists but the sending service has no DKIM record and the domain has no DMARC policy. Emails may land in spam and are easier to fake.',
    evidence: 'configuration',
    evidenceNote: 'A DNS lookup of the domain shows an SPF record and no DKIM or DMARC records.',
    fix: 'Add the DKIM records from the sending service and a DMARC record that starts in monitoring mode.',
    effortHours: 1,
  },
  {
    id: 'D-3',
    area: 'deployment',
    severity: 'high',
    title: 'The database has no backups, and none has ever been restored',
    what: 'The database plan includes no backups. If data is deleted or corrupted, it is gone.',
    evidence: 'configuration',
    evidenceNote: 'The database dashboard shows no backup schedule and no restore points.',
    fix: 'Switch on backups or schedule a nightly export, then restore one into a test copy and write down the steps.',
    effortHours: 3,
  },
  {
    id: 'D-4',
    area: 'deployment',
    severity: 'low',
    title: 'The www address does not redirect to the main address',
    what: 'Two copies of the site answer, which splits login sessions and search results between them.',
    evidence: 'reproduced',
    evidenceNote: 'Opening the www address in a browser loads the site without redirecting. A login there does not carry over.',
    fix: 'Add a permanent redirect from one address to the other and update the login redirect list.',
    effortHours: 1,
  },

  // Performance and cost
  {
    id: 'C-1',
    area: 'performance',
    severity: 'medium',
    title: 'The home page sends oversized images',
    what: 'The home page downloads about 4 MB of images, most of it one hero photo that is far larger than it is shown.',
    evidence: 'measured',
    evidenceNote: 'A mobile-profile Lighthouse run lists the hero photo as the largest item and flags it for resizing.',
    fix: 'Resize and compress the images, serve a modern format and load below-the-fold images lazily.',
    effortHours: 3,
  },
  {
    id: 'C-2',
    area: 'performance',
    severity: 'medium',
    title: 'The calendar page filters on columns with no index',
    what: 'The calendar looks up bookings by provider and start time. Neither column has an index, so it slows down as bookings grow.',
    evidence: 'code',
    evidenceNote: 'The query in the calendar page and the table definition show the filter and no matching index.',
    fix: 'Add one combined index on provider and start time and re-measure the page.',
    effortHours: 1,
  },
  {
    id: 'C-3',
    area: 'performance',
    severity: 'high',
    title: 'The reminder endpoint has no per-user limit and no spend cap',
    what: 'Any logged-in user can trigger reminder emails and text messages without limit. Both are paid per message.',
    evidence: 'code',
    evidenceNote: 'The route code has no rate limit. At 10,000 visits a month we estimate about 6,000 sends against a free allowance of 3,000, so the bill would start there.',
    fix: 'Add a per-user daily limit on the server, and set a spend cap and a billing alert on the email and text accounts.',
    effortHours: 3,
  },
  {
    id: 'C-4',
    area: 'performance',
    severity: 'low',
    title: 'A chat widget and web fonts block the first paint',
    what: 'The chat widget script and two font files load before the page content, adding about half a second on a mobile connection.',
    evidence: 'measured',
    evidenceNote: 'The Lighthouse run lists them under render-blocking resources.',
    fix: 'Defer the widget until after load and preload only the font weights in use.',
    effortHours: 1,
  },

  // Security
  {
    id: 'S-1',
    area: 'security',
    severity: 'critical',
    title: 'Row level security is off on the bookings table',
    what: 'Anyone holding the public key, which is in the site code, can read every customer\'s name, phone number and bookings.',
    evidence: 'reproduced',
    evidenceNote: 'Using only the public key and test account A, we read the rows that belong to test account B.',
    fix: 'Switch on row level security, add owner-only policies for read, create and update, and test with two accounts.',
    effortHours: 4,
  },
  {
    id: 'S-2',
    area: 'security',
    severity: 'high',
    title: 'A service-level secret key is inside the browser code',
    what: 'The key was saved under a variable name with a public prefix, so it is shipped to every visitor. It bypasses all access rules.',
    evidence: 'code',
    evidenceNote: 'The built JavaScript contains a service-level key. We did not use it.',
    fix: 'Rotate the key, since deleting it from the code does not make it safe, and move the work that needs it to a server function.',
    effortHours: 3,
  },
  {
    id: 'S-3',
    area: 'security',
    severity: 'medium',
    title: 'Password reset reveals which emails have an account, and links do not expire',
    what: 'The reset form answers differently for known and unknown emails, and an old reset link still works.',
    evidence: 'reproduced',
    evidenceNote: 'We tried one known and one unknown test email and got two different messages. A link from the day before still worked.',
    fix: 'Show one message for every email and make reset links expire after a short time.',
    effortHours: 1,
  },
  {
    id: 'S-4',
    area: 'security',
    severity: 'low',
    title: 'The privacy policy does not mention the text message provider',
    what: 'Phone numbers are sent to a text message service that the privacy policy does not name.',
    evidence: 'document',
    evidenceNote: 'We compared the policy page with the list of services the app calls.',
    fix: 'Add the provider and what is sent to it. The owner should have the final wording checked.',
    effortHours: 1,
  },
];

export function summaryCounts(): Record<Severity, number> & { total: number } {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
  for (const f of SAMPLE_FINDINGS) {
    counts[f.severity] += 1;
    counts.total += 1;
  }
  return counts;
}

export const SAMPLE_SUMMARY = {
  headline:
    'Demo Bookings should not take real customers or real money yet. Two critical findings let a visitor read other customers\' data and pay a price they choose.',
  fixFirst: ['S-1', 'P-1', 'S-2'],
  wentWell: [
    'Sign-up and login work, and admin pages check the user on the server.',
    'Stripe keys are not in the browser code. Only the publishable key is.',
    'The domain has HTTPS and a valid certificate.',
  ],
};

export type QuoteLine = { label: string; detail: string };

export const SAMPLE_QUOTE = {
  includedFindingIds: ['P-1', 'P-2', 'D-1', 'D-3', 'C-3', 'S-1', 'S-2'],
  scope: [
    { label: 'What we fix', detail: 'Every critical and high finding, listed by id with its effort estimate.' },
    { label: 'What you get at the end', detail: 'The fixes live on your production app, a note of what changed, and a retest of each one.' },
  ] as QuoteLine[],
  notIncluded: [
    'Medium and low findings. We list them with effort so you can add any of them as a separate fixed line before work starts.',
    'New features, redesigns or moving to a different host.',
    'Load testing and testing of third-party systems.',
  ],
  priceDependsOn: [
    'The size of your app and how many screens and routes each fix touches.',
    'How many critical and high findings the Check turns up.',
    'Whether we need access to accounts that only you can open, such as billing and DNS.',
  ],
  priceStatement:
    'One fixed price for the whole list above, stated as a single amount in your real quote. It is not billed by the hour, and the effort hours here are our planning estimate, not the price. This sample shows no price.',
  creditStatement:
    'Published starting points are on the offer page: Check $99, Fix from $800. The $99 for the Check is credited to the Fix.',
  ifMoreFound:
    'If we find more work after the quote is accepted, we tell you and quote it separately. You decide. The agreed price does not change.',
};

export function quoteEffortHours(): number {
  return SAMPLE_FINDINGS.filter((f) => SAMPLE_QUOTE.includedFindingIds.includes(f.id)).reduce(
    (n, f) => n + f.effortHours,
    0,
  );
}

export type RetestStatus = 'closed' | 'partly closed' | 'open';

export type RetestRow = { findingId: string; status: RetestStatus; method: string; note: string };

export const SAMPLE_RETEST: RetestRow[] = [
  {
    findingId: 'S-1',
    status: 'closed',
    method: 'Repeated the two-account read with the public key.',
    note: 'Account A now gets no rows that belong to account B.',
  },
  {
    findingId: 'P-1',
    status: 'closed',
    method: 'Repeated the test-mode checkout with a changed amount in the request.',
    note: 'The server ignored the amount and charged the stored price.',
  },
  {
    findingId: 'S-2',
    status: 'closed',
    method: 'Rebuilt the app and searched the output. Tried the old key against the database.',
    note: 'The key is no longer in the browser code and the old key is rejected.',
  },
  {
    findingId: 'P-2',
    status: 'closed',
    method: 'Sent an unsigned test event, then a signed one twice.',
    note: 'The unsigned event was refused and the repeat did not send a second email.',
  },
  {
    findingId: 'D-1',
    status: 'closed',
    method: 'Made a booking on the live app.',
    note: 'The confirmation email arrived within a minute.',
  },
  {
    findingId: 'D-3',
    status: 'closed',
    method: 'Restored the latest backup into a test copy and counted rows.',
    note: 'The row counts matched. The restore steps are written down.',
  },
  {
    findingId: 'C-3',
    status: 'partly closed',
    method: 'Triggered the reminder route past the daily limit with one test user.',
    note: 'The per-user limit works. The spend cap on the text message account is still open: only the owner can set it in their billing page.',
  },
];

export const SAMPLE_RETEST_NOTE =
  'A retest repeats the original check. It shows what was closed on the day we tested, not that nothing else can go wrong.';

export const SAMPLE_HONEST_NOTE =
  'This is a made-up report to show the format. A real Launch Check is a point-in-time review, not a guarantee that nothing can go wrong. Guild is not a CERT-In empanelled auditor, and a Launch Check is not an audit or a certificate.';
