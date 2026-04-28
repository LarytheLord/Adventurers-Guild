'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CreditCard, Loader2, RefreshCw, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type StripeFlashStatus =
  | 'success'
  | 'pending'
  | 'retry'
  | 'error'
  | 'unavailable'
  | 'missing-account'
  | 'unauthorized'
  | 'forbidden';

interface PayoutSetupCardProps {
  stripeConfigured: boolean;
  stripeAccountId: string | null;
  stripeOnboardingDone: boolean;
  flashStatus?: string;
}

const FLASH_MESSAGES: Record<
  StripeFlashStatus,
  { title: string; description: string; variant?: 'default' | 'destructive' }
> = {
  success: {
    title: 'Payouts active',
    description: 'Your Stripe account is connected and ready for quest payouts.',
  },
  pending: {
    title: 'Finish onboarding',
    description: 'Stripe still needs a few details before payouts can go live.',
  },
  retry: {
    title: 'Onboarding link expired',
    description: 'Generate a fresh Stripe onboarding link and continue setup.',
  },
  error: {
    title: 'Stripe setup failed',
    description: 'We could not finish the Stripe callback. Try the payout setup again.',
    variant: 'destructive',
  },
  unavailable: {
    title: 'Stripe unavailable',
    description: 'Stripe keys are not configured in this environment yet.',
    variant: 'destructive',
  },
  'missing-account': {
    title: 'Missing Stripe account',
    description: 'No Stripe account was found for this callback. Start setup again.',
    variant: 'destructive',
  },
  unauthorized: {
    title: 'Sign in required',
    description: 'Please sign in again before continuing Stripe onboarding.',
    variant: 'destructive',
  },
  forbidden: {
    title: 'Payout setup is limited to adventurers',
    description: 'Only adventurer accounts can connect Stripe payouts.',
    variant: 'destructive',
  },
};

function isStripeFlashStatus(value: string | undefined): value is StripeFlashStatus {
  return Boolean(value && value in FLASH_MESSAGES);
}

export default function PayoutSetupCard({
  stripeConfigured,
  stripeAccountId,
  stripeOnboardingDone,
  flashStatus,
}: PayoutSetupCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/payments/stripe/connect', {
        method: 'POST',
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to start Stripe onboarding');
      }

      if (result.alreadyConnected) {
        toast.success('Payouts are already active.');
        router.refresh();
        return;
      }

      if (!result.onboardingUrl) {
        throw new Error('Stripe did not return an onboarding URL');
      }

      window.location.assign(result.onboardingUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start Stripe onboarding');
    } finally {
      setLoading(false);
    }
  };

  const flashMessage = isStripeFlashStatus(flashStatus) ? FLASH_MESSAGES[flashStatus] : null;
  const statusLabel = !stripeConfigured
    ? 'Unavailable'
    : stripeOnboardingDone
      ? 'Active'
      : stripeAccountId
        ? 'Pending'
        : 'Not connected';

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Payout Setup
            </CardTitle>
            <CardDescription className="mt-1">
              Connect Stripe so approved quest rewards can be paid out to your bank account.
            </CardDescription>
          </div>
          <Badge variant={stripeOnboardingDone ? 'default' : 'outline'}>{statusLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {flashMessage && (
          <Alert variant={flashMessage.variant}>
            {flashMessage.variant === 'destructive' ? (
              <ShieldAlert className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <AlertTitle>{flashMessage.title}</AlertTitle>
            <AlertDescription>{flashMessage.description}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-xl border bg-muted/40 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {stripeOnboardingDone ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-1">
              <p className="font-medium">
                {stripeOnboardingDone
                  ? 'Bank account connected via Stripe'
                  : 'Bank account not connected yet'}
              </p>
              <p className="text-sm text-muted-foreground">
                {stripeOnboardingDone
                  ? 'Payouts active. Approved quest rewards can be routed to your connected Stripe account.'
                  : 'Finish Stripe Connect onboarding once to activate real payouts for paid quest work.'}
              </p>
              {stripeAccountId && (
                <p className="text-xs text-muted-foreground">Stripe account: {stripeAccountId}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {stripeConfigured
              ? 'The existing simulated payment flow still works when Stripe is unavailable.'
              : 'This environment is running without Stripe test keys, so payouts cannot be connected here yet.'}
          </p>
          <Button onClick={handleSetup} disabled={loading || !stripeConfigured || stripeOnboardingDone}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening Stripe
              </>
            ) : stripeOnboardingDone ? (
              'Payouts active'
            ) : (
              'Set up payouts'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
