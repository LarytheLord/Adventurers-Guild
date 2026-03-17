/**
 * Unified payment provider abstraction.
 *
 * Routes payments to Stripe or Razorpay based on currency:
 *   - INR → Razorpay (Indian payments, UPI, netbanking, cards)
 *   - USD/EUR/GBP/other → Stripe (international payments)
 *   - Fallback → simulated (when no provider is configured)
 *
 * The rest of the app calls these functions without knowing
 * which provider is handling the payment.
 */

import { isStripeConfigured, createStripePaymentIntent, captureStripePayment, cancelStripePayment } from './stripe';
import { isRazorpayConfigured, createRazorpayOrder, verifyRazorpaySignature } from './razorpay';

export type PaymentProvider = 'stripe' | 'razorpay' | 'simulated';

export interface CreatePaymentResult {
  provider: PaymentProvider;
  providerPaymentId: string; // Stripe PaymentIntent ID or Razorpay order ID
  providerOrderId?: string;  // Razorpay order ID (same as providerPaymentId for Razorpay)
  clientSecret?: string;     // Stripe client secret for frontend
  amount: number;
  currency: string;
  status: 'pending' | 'requires_action';
}

export interface CaptureResult {
  provider: PaymentProvider;
  providerPaymentId: string;
  status: 'completed' | 'failed';
}

const PLATFORM_FEE_RATE = 0.15; // 15%

/**
 * Determine which payment provider to use based on currency.
 */
export function resolveProvider(currency: string): PaymentProvider {
  const upper = currency.toUpperCase();
  if (upper === 'INR' && isRazorpayConfigured()) return 'razorpay';
  if (isStripeConfigured()) return 'stripe';
  return 'simulated';
}

/**
 * Convert a decimal amount to the smallest currency unit.
 * USD → cents (multiply by 100), INR → paise (multiply by 100).
 */
export function toSmallestUnit(amount: number, currency: string): number {
  // Most currencies use 100 subunits. Some (JPY, KRW) use 1.
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP'];
  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) return Math.round(amount);
  return Math.round(amount * 100);
}

/**
 * Calculate platform fee for a given amount.
 */
export function calculatePlatformFee(amount: number): {
  platformFee: number;
  feeRate: number;
  totalCharge: number;
} {
  const platformFee = Math.round(amount * PLATFORM_FEE_RATE * 100) / 100;
  return {
    platformFee,
    feeRate: PLATFORM_FEE_RATE,
    totalCharge: amount + platformFee,
  };
}

/**
 * Create a payment authorization (hold funds).
 * Called when a quest is accepted and company wants to escrow payment.
 */
export async function createPayment(params: {
  amount: number; // decimal amount (e.g. 350.00)
  currency: string;
  questId: string;
  questTitle: string;
  companyId: string;
  adventurerId: string;
  companyStripeCustomerId?: string;
}): Promise<CreatePaymentResult> {
  const provider = resolveProvider(params.currency);
  const { totalCharge } = calculatePlatformFee(params.amount);
  const smallestUnit = toSmallestUnit(totalCharge, params.currency);
  const metadata = {
    questId: params.questId,
    questTitle: params.questTitle,
    companyId: params.companyId,
    adventurerId: params.adventurerId,
    platformFeeRate: String(PLATFORM_FEE_RATE),
  };

  if (provider === 'stripe') {
    const pi = await createStripePaymentIntent({
      amount: smallestUnit,
      currency: params.currency,
      companyStripeCustomerId: params.companyStripeCustomerId,
      metadata,
    });
    return {
      provider: 'stripe',
      providerPaymentId: pi.id,
      clientSecret: pi.client_secret ?? undefined,
      amount: smallestUnit,
      currency: params.currency,
      status: 'requires_action',
    };
  }

  if (provider === 'razorpay') {
    const order = await createRazorpayOrder({
      amount: smallestUnit,
      currency: params.currency,
      receipt: `quest_${params.questId}`,
      notes: metadata,
    });
    return {
      provider: 'razorpay',
      providerPaymentId: order.id,
      providerOrderId: order.id,
      amount: smallestUnit,
      currency: params.currency,
      status: 'requires_action',
    };
  }

  // Simulated fallback
  return {
    provider: 'simulated',
    providerPaymentId: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    amount: smallestUnit,
    currency: params.currency,
    status: 'pending',
  };
}

/**
 * Capture a previously held payment (after quest approval).
 */
export async function capturePayment(params: {
  provider: PaymentProvider;
  providerPaymentId: string;
}): Promise<CaptureResult> {
  if (params.provider === 'stripe') {
    const pi = await captureStripePayment(params.providerPaymentId);
    return {
      provider: 'stripe',
      providerPaymentId: pi.id,
      status: pi.status === 'succeeded' ? 'completed' : 'failed',
    };
  }

  // Razorpay payments are captured automatically on the client side
  // after signature verification. This is a no-op for Razorpay.
  if (params.provider === 'razorpay') {
    return {
      provider: 'razorpay',
      providerPaymentId: params.providerPaymentId,
      status: 'completed',
    };
  }

  // Simulated
  return {
    provider: 'simulated',
    providerPaymentId: params.providerPaymentId,
    status: 'completed',
  };
}

/**
 * Cancel/refund a held payment (quest rejected or cancelled).
 */
export async function cancelPayment(params: {
  provider: PaymentProvider;
  providerPaymentId: string;
}): Promise<{ status: 'cancelled' | 'failed' }> {
  if (params.provider === 'stripe') {
    const pi = await cancelStripePayment(params.providerPaymentId);
    return { status: pi.status === 'canceled' ? 'cancelled' : 'failed' };
  }

  // Razorpay doesn't support pre-capture cancellation the same way.
  // If the order was never paid, it auto-expires.
  return { status: 'cancelled' };
}

/**
 * Verify a Razorpay client-side payment callback.
 */
export function verifyRazorpayPayment(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  return verifyRazorpaySignature(params);
}
