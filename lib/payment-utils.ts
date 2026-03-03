// lib/payment-utils.ts
// Note: This is a client-side utility that calls API routes.
// No direct database access needed.

// Types
export interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  questId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  fromUser?: { name: string; email: string };
  toUser?: { name: string; email: string };
  quest?: { title: string };
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
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_userId: fromUserId,
        to_userId: toUserId,
        questId: questId,
        amount,
        currency,
        description,
      }),
    });

    const result = await response.json();
    if (result.success) return result.transaction;
    throw new Error(result.error || 'Payment failed');
  } catch (error) {
    console.error('Error processing payment:', error);
    throw new Error('Failed to process payment');
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

  const response = await fetch(`/api/payments?${params.toString()}`);
  const result = await response.json();

  if (result.success) return result.transactions;
  throw new Error(result.error || 'Failed to fetch payment history');
}

// Get pending payments for a user
export async function getPendingPayments(userId: string): Promise<Transaction[]> {
  return getPaymentHistory(userId, 'incoming', 'pending');
}

// Calculate total earnings for an adventurer
export async function getTotalEarnings(userId: string): Promise<number> {
  const response = await fetch(`/api/payments?userId=${userId}&type=incoming&status=completed`);
  const result = await response.json();

  if (result.success) {
    return result.transactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  }
  throw new Error(result.error || 'Failed to calculate earnings');
}

// Calculate total spending for a company
export async function getTotalSpending(userId: string): Promise<number> {
  const response = await fetch(`/api/payments?userId=${userId}&type=outgoing&status=completed`);
  const result = await response.json();

  if (result.success) {
    return result.transactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  }
  throw new Error(result.error || 'Failed to calculate spending');
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
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { isValid: false, error: 'Card has expired' };
  }

  if (month > 12) {
    return { isValid: false, error: 'Invalid expiry month' };
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
