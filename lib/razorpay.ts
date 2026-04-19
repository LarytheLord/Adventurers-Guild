import Razorpay from 'razorpay';
import crypto from 'crypto';

// Singleton Razorpay client
let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new Error('RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET not configured');
    razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return razorpayInstance;
}

export function isRazorpayConfigured(): boolean {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/**
 * Create a Razorpay Order for a quest payment.
 * Company pays quest reward + platform fee in INR.
 */
export async function createRazorpayOrder(params: {
  amount: number; // in paise (smallest unit for INR — 100 paise = 1 INR)
  currency: string;
  receipt: string;
  notes: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: string; receipt: string }> {
  const rp = getRazorpay();
  const order = await rp.orders.create({
    amount: params.amount,
    currency: params.currency.toUpperCase(),
    receipt: params.receipt,
    notes: params.notes,
  });
  return {
    id: order.id,
    amount: order.amount as number,
    currency: order.currency,
    receipt: order.receipt ?? params.receipt,
  };
}

/**
 * Verify Razorpay payment signature after client-side checkout.
 * Returns true if signature is valid.
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error('RAZORPAY_KEY_SECRET not configured');

  const body = `${params.orderId}|${params.paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expectedSignature === params.signature;
}

/**
 * Fetch a Razorpay payment by ID.
 */
export async function fetchRazorpayPayment(
  paymentId: string
): Promise<{ id: string; status: string; amount: number; currency: string; method: string }> {
  const rp = getRazorpay();
  const payment = await rp.payments.fetch(paymentId);
  return {
    id: payment.id,
    status: payment.status as string,
    amount: payment.amount as number,
    currency: payment.currency as string,
    method: payment.method as string,
  };
}

/**
 * Create a Razorpay payout to an adventurer's bank account via RazorpayX.
 * Requires RazorpayX account (fund_account_id from adventurer profile).
 */
export async function createRazorpayPayout(params: {
  fundAccountId: string;
  amount: number; // in paise
  currency: string;
  purpose: string;
  referenceId: string;
}): Promise<{ id: string; status: string }> {
  const rp = getRazorpay();
  // RazorpayX payout API — only available on RazorpayX accounts
  const payout = await (rp as unknown as { payouts: { create: (opts: Record<string, unknown>) => Promise<{ id: string; status: string }> } }).payouts.create({
    account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
    fund_account_id: params.fundAccountId,
    amount: params.amount,
    currency: params.currency.toUpperCase(),
    mode: 'NEFT',
    purpose: params.purpose,
    reference_id: params.referenceId,
  });
  return { id: payout.id, status: payout.status };
}
/**
 /**
 * Create a Razorpay Contact for an adventurer.
 */
export async function createRazorpayContact(params: {
  name: string;
  email: string;
  contact: string;
  referenceId: string;
}): Promise<{ id: string }> {
  const rp = getRazorpay();
  // @ts-expect-error - Razorpay types don't include 'contacts' but it exists at runtime
  const contact = await rp.contacts.create({
    name: params.name,
    email: params.email,
    contact: params.contact,
    type: 'individual',
    reference_id: params.referenceId,
  });
  return { id: contact.id };
}

/**
 * Create a Razorpay Fund Account (bank account) for a contact.
 */
export async function createRazorpayFundAccount(params: {
  contactId: string;
  name: string;
  ifsc: string;
  accountNumber: string;
}): Promise<{ id: string }> {
  const rp = getRazorpay();
  // @ts-expect-error - Razorpay types don't include 'fundAccounts' but it exists at runtime
  const fundAccount = await rp.fundAccounts.create({
    contact_id: params.contactId,
    account_type: 'bank_account',
    bank_account: {
      name: params.name,
      ifsc: params.ifsc,
      account_number: params.accountNumber,
    },
  });
  return { id: fundAccount.id };
}

/**
 * Verify a Razorpay webhook signature.
 */
export function verifyRazorpayWebhook(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error('RAZORPAY_WEBHOOK_SECRET not configured');

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return expectedSignature === signature;
}
