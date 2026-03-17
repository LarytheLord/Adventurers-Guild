import Stripe from 'stripe';

// Singleton Stripe client — only initialized when keys are configured
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
    stripeInstance = new Stripe(key, { apiVersion: '2026-02-25.clover' });
  }
  return stripeInstance;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

/**
 * Create a Stripe PaymentIntent for a quest payment.
 * Company pays quest reward + platform fee. Adventurer receives via Connect transfer.
 */
export async function createStripePaymentIntent(params: {
  amount: number; // in smallest currency unit (cents for USD)
  currency: string;
  companyStripeCustomerId?: string;
  metadata: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  return stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency.toLowerCase(),
    customer: params.companyStripeCustomerId || undefined,
    metadata: params.metadata,
    capture_method: 'manual', // Hold funds until quest approved
  });
}

/**
 * Capture a held PaymentIntent (after quest approval).
 */
export async function captureStripePayment(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  return stripe.paymentIntents.capture(paymentIntentId);
}

/**
 * Cancel a held PaymentIntent (quest rejected/cancelled).
 */
export async function cancelStripePayment(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  return stripe.paymentIntents.cancel(paymentIntentId);
}

/**
 * Transfer funds to an adventurer's connected Stripe account.
 */
export async function transferToAdventurer(params: {
  amount: number; // in smallest currency unit
  currency: string;
  stripeAccountId: string;
  transferGroup: string;
}): Promise<Stripe.Transfer> {
  const stripe = getStripe();
  return stripe.transfers.create({
    amount: params.amount,
    currency: params.currency.toLowerCase(),
    destination: params.stripeAccountId,
    transfer_group: params.transferGroup,
  });
}

/**
 * Create a Stripe Connect onboarding link for an adventurer.
 */
export async function createConnectOnboardingLink(params: {
  accountId: string;
  returnUrl: string;
  refreshUrl: string;
}): Promise<string> {
  const stripe = getStripe();
  const link = await stripe.accountLinks.create({
    account: params.accountId,
    return_url: params.returnUrl,
    refresh_url: params.refreshUrl,
    type: 'account_onboarding',
  });
  return link.url;
}

/**
 * Create a Stripe Connect Express account for an adventurer.
 */
export async function createConnectAccount(params: {
  email: string;
  name?: string;
}): Promise<Stripe.Account> {
  const stripe = getStripe();
  return stripe.accounts.create({
    type: 'express',
    email: params.email,
    metadata: { platform: 'adventurers-guild' },
    capabilities: {
      transfers: { requested: true },
    },
    ...(params.name ? { individual: { first_name: params.name.split(' ')[0], last_name: params.name.split(' ').slice(1).join(' ') || undefined } } : {}),
  });
}

/**
 * Verify a Stripe webhook signature.
 */
export function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
