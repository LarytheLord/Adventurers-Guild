// lib/payment-utils.ts
// Note: This is a client-side utility that calls API routes.
// No direct database access needed.
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { getErrorMessageFromPayload, getStatusFallbackMessage, readResponsePayload } from '@/lib/http';

export interface Transaction {
  id: string;
  fromUserId?: string | null;
  toUserId?: string | null;
  questId?: string | null;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  fromUser?: { name: string; email: string };
  toUser?: { name: string; email: string };
  quest?: { title: string };
}

function normalizeTransaction(transaction: Partial<Transaction> & { amount?: number | string | null }): Transaction {
  return {
    id: transaction.id || '',
    fromUserId: transaction.fromUserId ?? null,
    toUserId: transaction.toUserId ?? null,
    questId: transaction.questId ?? null,
    amount:
      typeof transaction.amount === 'string'
        ? Number.parseFloat(transaction.amount)
        : Number(transaction.amount ?? 0),
    currency: transaction.currency || 'USD',
    status: transaction.status || 'pending',
    paymentMethod: transaction.paymentMethod || 'credit_card',
    transactionId: transaction.transactionId,
    description: transaction.description,
    createdAt: transaction.createdAt || new Date(0).toISOString(),
    updatedAt: transaction.updatedAt || new Date(0).toISOString(),
    completedAt: transaction.completedAt ?? null,
    fromUser: transaction.fromUser,
    toUser: transaction.toUser,
    quest: transaction.quest,
  };
}

// Process a payment for quest completion
export async function processPayment(
  fromUserId: string,
  toUserId: string,
  questId: string,
  amount: number,
  currency: string = 'USD',
  description?: string
): Promise<Transaction | null> {
  try {
    const response = await fetchWithAuth('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromUserId,
        toUserId,
        questId,
        amount,
        currency,
        description,
      }),
    });

    const result = await readResponsePayload<Record<string, unknown>>(response);
    if (response.ok && result?.success && result?.transaction) {
      return normalizeTransaction(result.transaction as any);
    }
    throw new Error(getErrorMessageFromPayload(result, getStatusFallbackMessage(response.status)));
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to process payment');
  }
}

// Get payment history for a user
export async function getPaymentHistory(
  userId: string,
  type: 'incoming' | 'outgoing' | 'all' = 'all',
  status?: string
): Promise<Transaction[]> {
  const params = new URLSearchParams();
  params.append('userId', userId);
  params.append('type', type);
  if (status) params.append('status', status);

  const response = await fetchWithAuth(`/api/payments?${params.toString()}`);
  const result = await readResponsePayload<Record<string, unknown>>(response);

  if (response.ok && result?.success) {
    const transactions = Array.isArray(result?.transactions) ? result.transactions : [];
    return transactions.map(normalizeTransaction);
  }
  throw new Error(getErrorMessageFromPayload(result, getStatusFallbackMessage(response.status)));
}

// Get pending payments for a user
export async function getPendingPayments(userId: string): Promise<Transaction[]> {
  return getPaymentHistory(userId, 'incoming', 'pending');
}

// Calculate total earnings for an adventurer
export async function getTotalEarnings(userId: string): Promise<number> {
  const transactions = await getPaymentHistory(userId, 'incoming', 'completed');
  return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
}

// Calculate total spending for a company
export async function getTotalSpending(userId: string): Promise<number> {
  const transactions = await getPaymentHistory(userId, 'outgoing', 'completed');
  return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
}

// Validate payment information
export function validatePaymentInfo(
  cardNumber: string,
  expiry: string,
  cvc: string
): { isValid: boolean; error?: string } {
  const cleanCardNumber = cardNumber.replace(/\s/g, '');

  if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
    return { isValid: false, error: 'Card number must be 16 digits' };
  }

  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return { isValid: false, error: 'Invalid expiry date format (MM/YY)' };
  }

  const [month, year] = expiry.split('/').map(Number);

  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Invalid expiry month' };
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { isValid: false, error: 'Card has expired' };
  }

  if (cvc.length < 3 || cvc.length > 4 || !/^\d+$/.test(cvc)) {
    return { isValid: false, error: 'CVC must be 3-4 digits' };
  }

  return { isValid: true };
}

// Format currency amount
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
