// Every claim below cites an official page: docs.stripe.com or razorpay.com/docs only.
// Code examples are short and follow the shape of the official examples; check them
// against the linked pages before you paste them into production.

export const CHECKLIST_PATH = '/guides/payment-webhook-checklist-razorpay-stripe';
export const CHECKLIST_TITLE = 'Payment webhook checklist for Razorpay and Stripe (Next.js)';
export const CHECKLIST_DESCRIPTION =
  'Six checks for a payment webhook in a Next.js app: verify the signature on the raw body, reject unsigned or stale events, ignore repeats, never trust client amounts, mark orders paid only from the webhook, and test with test mode and the CLI. Each check links to the official docs.';
export const CHECKLIST_PUBLISHED = '2026-11-19';
export const LAUNCH_CHECK_HREF = '/launch-check?src=guide';

export const CHECKLIST_CONTEXT =
  'In a private test on a small app we wrote with planted flaws, none of six free static scanners flagged a webhook that skips signature checks or one that processes the same event twice, so this checklist is the manual check.';

export interface DocRef {
  label: string;
  url: string;
}

export interface ChecklistItem {
  id: string;
  heading: string;
  check: string;
  stripe: DocRef[];
  razorpay: DocRef[];
  note?: string;
}

const STRIPE_WEBHOOKS = 'https://docs.stripe.com/webhooks';
const STRIPE_SIG = 'https://docs.stripe.com/webhooks/signature';
const STRIPE_CLI = 'https://docs.stripe.com/stripe-cli';
const STRIPE_TEST = 'https://docs.stripe.com/testing';
const RZP_WEBHOOKS = 'https://razorpay.com/docs/webhooks/';
const RZP_VALIDATE = 'https://razorpay.com/docs/webhooks/validate-test/';
const RZP_PAYMENTS_TEST = 'https://razorpay.com/docs/payments/payment-gateway/test-card-details/';

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'raw-body-signature',
    heading: '1. Verify the signature on the raw request body',
    check:
      'Both providers sign the exact bytes they send. In a Next.js route handler, read the body with req.text() and verify before you parse it. If you call req.json() first and re-serialise, the bytes change and verification fails, or worse, you skip it to make the error go away.',
    stripe: [{ label: 'Stripe: check the webhook signatures', url: STRIPE_SIG }],
    razorpay: [{ label: 'Razorpay: validate webhooks', url: RZP_VALIDATE }],
  },
  {
    id: 'reject-unsigned-stale',
    heading: '2. Reject unsigned or stale events',
    check:
      'Return an error and do no work when the signature header is missing or does not match. Stripe signs a timestamp into its header and the library rejects events outside a tolerance window, which stops an old captured request being replayed. Razorpay does not put a timestamp in its signature, so it cannot reject by age for you: add your own check on the event created_at and your own replay record (item 3).',
    stripe: [{ label: 'Stripe: replay attacks and timestamp tolerance', url: STRIPE_SIG }],
    razorpay: [{ label: 'Razorpay: webhook payload and headers', url: RZP_WEBHOOKS }],
  },
  {
    id: 'idempotency',
    heading: '3. Make the handler idempotent: store the event or payment id, ignore repeats',
    check:
      'Providers retry and can deliver the same event more than once. Store the event id (Stripe event.id, Razorpay x-razorpay-event-id header) with a unique constraint, in the same transaction as the state change, and return 200 without doing the work a second time.',
    stripe: [{ label: 'Stripe: handle duplicate events', url: STRIPE_WEBHOOKS }],
    razorpay: [{ label: 'Razorpay: webhooks and event id', url: RZP_WEBHOOKS }],
  },
  {
    id: 'server-side-amounts',
    heading: '4. Never trust amounts from the client',
    check:
      'Work out the price on your server from your own product records, and create the order or Checkout Session there. When the webhook arrives, compare the amount and currency in the verified event with the order you stored. A price sent from the browser can be changed by anyone.',
    stripe: [{ label: 'Stripe: fulfil orders after checkout', url: 'https://docs.stripe.com/checkout/fulfillment' }],
    razorpay: [{ label: 'Razorpay: create an order on your server', url: 'https://razorpay.com/docs/payments/orders/' }],
  },
  {
    id: 'paid-only-from-webhook',
    heading: '5. Mark an order paid only from the verified webhook',
    check:
      'The success page and the client callback are for showing a message. They can be skipped, forged or never reached. Flip the order to paid only inside the handler that passed items 1 to 3, and let the success page read the order status from your database.',
    stripe: [{ label: 'Stripe: fulfil orders after checkout', url: 'https://docs.stripe.com/checkout/fulfillment' }],
    razorpay: [{ label: 'Razorpay: validate webhooks', url: RZP_VALIDATE }],
  },
  {
    id: 'test-mode-and-cli',
    heading: '6. Test with test mode and the CLI, including the failure cases',
    check:
      'Use test keys, never live ones. With Stripe, run the CLI to forward events to localhost and trigger test events. With Razorpay, use test mode and its test payment details, then use the webhook test option in the Dashboard. Then send a request with a bad signature and send the same event twice, and confirm you get a rejection and one state change.',
    stripe: [
      { label: 'Stripe CLI', url: STRIPE_CLI },
      { label: 'Stripe: test your integration', url: STRIPE_TEST },
    ],
    razorpay: [
      { label: 'Razorpay: test webhooks', url: RZP_VALIDATE },
      { label: 'Razorpay: test payment details', url: RZP_PAYMENTS_TEST },
    ],
  },
];

export interface CodeExample {
  provider: 'Stripe' | 'Razorpay';
  file: string;
  source: DocRef;
  code: string;
}

export const CHECKLIST_EXAMPLES: CodeExample[] = [
  {
    provider: 'Stripe',
    file: 'app/api/webhooks/stripe/route.ts',
    source: { label: 'Stripe: check the webhook signatures', url: STRIPE_SIG },
    code: `import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text(); // raw body: verify before you parse
  const sig = req.headers.get('stripe-signature');
  if (!sig) return new NextResponse('Missing signature', { status: 400 });

  let event: Stripe.Event;
  try {
    // Also rejects events older than the default 5 minute tolerance.
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  // Insert event.id with a unique constraint; if it already exists, return 200.
  // Then handle event.type (for example checkout.session.completed) and mark the order paid.
  return NextResponse.json({ received: true });
}`,
  },
  {
    provider: 'Razorpay',
    file: 'app/api/webhooks/razorpay/route.ts',
    source: { label: 'Razorpay: validate webhooks', url: RZP_VALIDATE },
    code: `import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.text(); // raw body: verify before you parse
  const signature = req.headers.get('x-razorpay-signature');
  const eventId = req.headers.get('x-razorpay-event-id');
  if (!signature || !eventId) return new NextResponse('Missing headers', { status: 400 });

  if (!validateWebhookSignature(body, signature, process.env.RAZORPAY_WEBHOOK_SECRET!)) {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(body);
  // Insert eventId with a unique constraint; if it already exists, return 200.
  // Check event.created_at is recent, then handle event.event (for example payment.captured)
  // and compare amount and currency with the order you stored.
  return NextResponse.json({ received: true });
}`,
  },
];

export const CHECKLIST_FAQ_NOTE =
  'Examples follow the shape of the official docs. Check them against the linked pages and your SDK version before you ship.';

export function allDocsUrls(): string[] {
  const urls = new Set<string>();
  for (const i of CHECKLIST_ITEMS) {
    for (const r of [...i.stripe, ...i.razorpay]) urls.add(r.url);
  }
  for (const e of CHECKLIST_EXAMPLES) urls.add(e.source.url);
  return [...urls];
}

/** All visible copy as one string, for tests. */
export function checklistPlainText(): string {
  const parts: string[] = [CHECKLIST_TITLE, CHECKLIST_DESCRIPTION, CHECKLIST_CONTEXT, LAUNCH_CHECK_HREF];
  for (const i of CHECKLIST_ITEMS) {
    parts.push(i.heading, i.check);
    for (const r of [...i.stripe, ...i.razorpay]) parts.push(r.label, r.url);
  }
  for (const e of CHECKLIST_EXAMPLES) parts.push(e.provider, e.file, e.code);
  return parts.join('\n');
}
