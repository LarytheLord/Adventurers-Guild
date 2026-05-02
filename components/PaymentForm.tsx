'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/payment-utils';
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
  const [billingContact, setBillingContact] = useState('');
  const [approvedSettlement, setApprovedSettlement] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const normalizedBillingContact = billingContact.trim();
    if (!normalizedBillingContact) {
      setError('Billing contact is required');
      return;
    }
    if (normalizedBillingContact.length > 120) {
      setError('Billing contact must be 120 characters or fewer');
      return;
    }

    if (!adventurerId) {
      setError('No adventurer selected for payment');
      return;
    }

    if (!approvedSettlement) {
      setError('Please confirm that this settlement has been approved');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }

    setLoading(true);

    try {
      const transaction = await processPayment(
        companyId,
        adventurerId,
        questId,
        amount,
        currency,
        `Settlement approved by ${normalizedBillingContact} for quest ${questId}`
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
          Approve {formatCurrency(amount, currency)} for quest completion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-900">
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>
            This flow records a payout approval only. It no longer collects raw card data inside the app.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="billingContact">Billing Contact</Label>
            <Input
              id="billingContact"
              type="text"
              placeholder="Jane Finance"
              value={billingContact}
              onChange={(e) => setBillingContact(e.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="approvedSettlement"
                checked={approvedSettlement}
                onCheckedChange={(checked) => setApprovedSettlement(checked === true)}
              />
              <div className="space-y-1">
                <Label htmlFor="approvedSettlement" className="font-medium">
                  I confirm this quest deliverable was approved for payout.
                </Label>
                <p className="text-sm text-muted-foreground">
                  In a production processor flow, this step should redirect to Stripe or Razorpay checkout.
                </p>
              </div>
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
                  Recording...
                </div>
              ) : (
                `Approve ${formatCurrency(amount, currency)}`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
