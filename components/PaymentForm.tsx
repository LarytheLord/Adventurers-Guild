'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CreditCard, CheckCircle } from 'lucide-react';
import { validatePaymentInfo, formatCurrency } from '@/lib/payment-utils';
import { processPayment } from '@/lib/payment-utils';

interface PaymentFormProps {
  questId: string;
  companyId: string;
  adventurerId: string;
  amount: number;
  currency?: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

export default function PaymentForm({
  questId,
  companyId,
  adventurerId,
  amount,
  currency = 'USD',
  onSuccess,
  onCancel
}: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})$/);
    if (!match) return '';
    
    const parts = [match[1], match[2], match[3], match[4]].filter(Boolean);
    return parts.join(' ');
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,2})$/);
    if (!match) return '';
    
    const parts = [match[1], match[2]].filter(Boolean);
    return parts.join('/');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvc(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate payment information
    const validation = validatePaymentInfo(cardNumber, expiry, cvc);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid card information');
      setLoading(false);
      return;
    }

    try {
      // In a real implementation, you would tokenize the card with Stripe
      // For now, we'll call the processPayment function directly
      const transaction = await processPayment(
        companyId,
        adventurerId,
        questId,
        amount,
        currency,
        `Payment for quest completion: ${questId}`
      );

      if (transaction) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess(transaction.id);
        }, 1500);
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-xl mt-4">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment of {formatCurrency(amount, currency)} has been processed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-6">
            The adventurer will be notified of the payment.
          </p>
          <Button className="w-full" onClick={() => onSuccess('')}>
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>
          Pay {formatCurrency(amount, currency)} for quest completion
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cardName">Name on Card</Label>
            <Input
              id="cardName"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              required
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={handleExpiryChange}
                required
                maxLength={5}
              />
            </div>
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                type="text"
                placeholder="123"
                value={cvc}
                onChange={handleCvcChange}
                required
                maxLength={4}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-current" />
                  Processing...
                </div>
              ) : (
                `Pay ${formatCurrency(amount, currency)}`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}