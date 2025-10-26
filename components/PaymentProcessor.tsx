// components/PaymentProcessor.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface PaymentFormProps {
  questId: string;
  questTitle: string;
  amount: number;
  companyId: string;
  adventurerId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PaymentProcessor({ 
  questId, 
  questTitle, 
  amount, 
  companyId, 
  adventurerId, 
  onSuccess, 
  onCancel 
}: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date
  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
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
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCvc(value);
  };

  const validateForm = () => {
    if (!cardNumber.replace(/\s/g, '')) {
      setError('Card number is required');
      return false;
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Card number must be 16 digits');
      return false;
    }
    if (!expiry) {
      setError('Expiry date is required');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError('Invalid expiry date format (MM/YY)');
      return false;
    }
    const [month, year] = expiry.split('/').map(Number);
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      setError('Card has expired');
      return false;
    }
    if (month > 12) {
      setError('Invalid expiry month');
      return false;
    }
    if (!cvc) {
      setError('CVC is required');
      return false;
    }
    if (cvc.length < 3) {
      setError('CVC must be 3-4 digits');
      return false;
    }
    
    setError('');
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real implementation, this would be a secure call to your backend,
      // which would then communicate with a payment processor like Stripe
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_user_id: companyId,      // Company paying
          to_user_id: adventurerId,     // Adventurer receiving payment
          quest_id: questId,
          amount,
          currency: 'USD',
          payment_method: paymentMethod,
          card_info: {
            number: cardNumber,
            expiry,
            cvc
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Payment of $${amount} completed successfully for "${questTitle}"`);
        onSuccess?.();
      } else {
        setError(result.error || 'Payment failed');
        toast.error(result.error || 'Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An error occurred during payment processing');
      toast.error('An error occurred during payment processing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Complete Payment
        </CardTitle>
        <CardDescription>
          Pay for quest completion: {questTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Amount</span>
            <span className="text-2xl font-bold text-primary">
              ${amount.toFixed(2)}
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            For quest: {questTitle}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Credit/Debit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="card-number">Card Number</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiry}
                onChange={handleExpiryChange}
                maxLength={5}
              />
            </div>
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                placeholder="123"
                value={cvc}
                onChange={handleCvcChange}
                maxLength={4}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        <div className="mt-6 flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1" 
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="mr-2 h-4 w-4" />
                Pay ${amount.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}