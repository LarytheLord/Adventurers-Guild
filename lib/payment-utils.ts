// lib/payment-utils.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Types
export interface Transaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  quest_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transaction_id?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        quest_id: questId,
        amount,
        currency,
        description
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      return result.transaction;
    } else {
      throw new Error(result.error || 'Payment failed');
    }
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
  let params = new URLSearchParams();
  params.append('user_id', userId);
  params.append('type', type);
  
  if (status) {
    params.append('status', status);
  }

  const response = await fetch(`/api/payments?${params.toString()}`);
  const result = await response.json();
  
  if (result.success) {
    return result.transactions;
  } else {
    throw new Error(result.error || 'Failed to fetch payment history');
  }
}

// Get pending payments for a user
export async function getPendingPayments(userId: string): Promise<Transaction[]> {
  return getPaymentHistory(userId, 'incoming', 'pending');
}

// Calculate total earnings for an adventurer
export async function getTotalEarnings(userId: string): Promise<number> {
  const response = await fetch(`/api/payments?user_id=${userId}&type=incoming&status=completed`);
  const result = await response.json();
  
  if (result.success) {
    return result.transactions.reduce((sum: number, transaction: Transaction) => 
      sum + transaction.amount, 0
    );
  } else {
    throw new Error(result.error || 'Failed to calculate earnings');
  }
}

// Calculate total spending for a company
export async function getTotalSpending(userId: string): Promise<number> {
  const response = await fetch(`/api/payments?user_id=${userId}&type=outgoing&status=completed`);
  const result = await response.json();
  
  if (result.success) {
    return result.transactions.reduce((sum: number, transaction: Transaction) => 
      sum + transaction.amount, 0
    );
  } else {
    throw new Error(result.error || 'Failed to calculate spending');
  }
}

// Validate payment information
export function validatePaymentInfo(cardNumber: string, expiry: string, cvc: string): { isValid: boolean; error?: string } {
  // Remove spaces from card number
  const cleanCardNumber = cardNumber.replace(/\s/g, '');
  
  // Validate card number length (basic check)
  if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
    return { isValid: false, error: 'Card number must be 16 digits' };
  }
  
  // Validate expiry date format
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
  
  // Validate CVC
  if (cvc.length < 3 || cvc.length > 4 || !/^\d+$/.test(cvc)) {
    return { isValid: false, error: 'CVC must be 3-4 digits' };
  }
  
  return { isValid: true };
}

// Format currency amount
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
}