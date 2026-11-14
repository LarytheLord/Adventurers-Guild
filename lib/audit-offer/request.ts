// Request a Launch Check: builds a prefilled mailto. No server route, no
// database, no third-party service. Nothing typed in the form leaves the
// browser until the founder sends the email from their own mail app.

export const REQUEST_MAIL_TO = 'abid@guilds.work';
export const REQUEST_SUBJECT = 'Launch Check request';

export const BUILDERS = ['Lovable', 'Bolt', 'Replit', 'v0', 'Cursor', 'Other'] as const;
export type Builder = (typeof BUILDERS)[number];
export type Payments = 'yes' | 'no';

export const CONSENT_LABEL = 'I own this app or have written permission to have it checked';

export const FREE_OFFER_LINE =
  'We are doing the first 3 checks free in exchange for honest feedback and an anonymised case study';

export const NEXT_STEPS = [
  'We reply within 2 working days.',
  'We only check apps you own, or have written permission to have checked.',
  'You get a written report with each finding and its severity.',
  'You get a fixed quote for any fixes, before any work starts.',
];

export type RequestInput = {
  appUrl: string;
  builder: Builder | '';
  whatItDoes: string;
  payments: Payments | '';
  email: string;
  consent: boolean;
};

export type RequestErrors = Partial<Record<keyof RequestInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateRequest(input: RequestInput): RequestErrors {
  const errors: RequestErrors = {};
  const url = input.appUrl.trim();
  if (!url) errors.appUrl = 'Enter the link to your app.';
  else if (!isHttpUrl(url)) errors.appUrl = 'Enter a full link that starts with https://';
  if (!(BUILDERS as readonly string[]).includes(input.builder)) errors.builder = 'Choose the tool you built it with.';
  if (!input.whatItDoes.trim()) errors.whatItDoes = 'Write a line on what the app does.';
  if (input.payments !== 'yes' && input.payments !== 'no') errors.payments = 'Say whether the app takes payments.';
  if (!EMAIL_RE.test(input.email.trim())) errors.email = 'Enter an email we can reply to.';
  if (!input.consent) errors.consent = 'Please confirm you own the app or have written permission.';
  return errors;
}

export type MailtoResult = { ok: true; href: string } | { ok: false; errors: RequestErrors };

export function buildRequestMailto(input: RequestInput): MailtoResult {
  const errors = validateRequest(input);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const body = [
    'Hi,',
    '',
    'I would like a Launch Check.',
    '',
    `App URL: ${input.appUrl.trim()}`,
    `Built with: ${input.builder}`,
    `What the app does: ${input.whatItDoes.trim()}`,
    `Takes payments: ${input.payments === 'yes' ? 'Yes' : 'No'}`,
    `Reply email: ${input.email.trim()}`,
    `Consent: ${CONSENT_LABEL}`,
  ].join('\n');

  // encodeURIComponent escapes & = ? and non-ASCII, so the result is ASCII
  // and a typed value cannot add extra mail headers.
  const href = `mailto:${REQUEST_MAIL_TO}?subject=${encodeURIComponent(REQUEST_SUBJECT)}&body=${encodeURIComponent(body)}`;
  return { ok: true, href };
}
