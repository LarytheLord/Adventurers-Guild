import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';
import {
  createConnectAccount,
  createConnectOnboardingLink,
  getStripeAccount,
  isStripeConfigured,
} from '@/lib/stripe';

function getBaseUrl(request: NextRequest): string {
  const configuredUrl = process.env.NEXTAUTH_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  return (configuredUrl || request.nextUrl.origin).replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    if (authUser.role !== 'adventurer') {
      return Response.json({ error: 'Only adventurers can set up payouts', success: false }, { status: 403 });
    }

    if (!isStripeConfigured()) {
      return Response.json(
        { error: 'Stripe payout onboarding is not configured', success: false },
        { status: 503 }
      );
    }

    const adventurer = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        adventurerProfile: {
          select: {
            stripeAccountId: true,
            stripeOnboardingDone: true,
          },
        },
      },
    });

    if (!adventurer?.adventurerProfile) {
      return Response.json({ error: 'Adventurer profile not found', success: false }, { status: 404 });
    }

    let stripeAccountId = adventurer.adventurerProfile.stripeAccountId;
    if (!stripeAccountId) {
      const account = await createConnectAccount({
        email: adventurer.email,
        name: adventurer.name ?? undefined,
      });
      stripeAccountId = account.id;

      await prisma.adventurerProfile.update({
        where: { userId: authUser.id },
        data: {
          stripeAccountId,
          stripeOnboardingDone: false,
        },
      });
    }

    const existingAccount = await getStripeAccount(stripeAccountId);
    const onboardingDone = Boolean(
      existingAccount.details_submitted ||
        (existingAccount.charges_enabled && existingAccount.payouts_enabled)
    );

    if (onboardingDone !== adventurer.adventurerProfile.stripeOnboardingDone) {
      await prisma.adventurerProfile.update({
        where: { userId: authUser.id },
        data: { stripeOnboardingDone: onboardingDone },
      });
    }

    if (onboardingDone) {
      return Response.json({
        success: true,
        alreadyConnected: true,
        stripeAccountId,
      });
    }

    const baseUrl = getBaseUrl(request);
    const onboardingUrl = await createConnectOnboardingLink({
      accountId: stripeAccountId,
      returnUrl: `${baseUrl}/api/payments/stripe/connect/callback?account=${encodeURIComponent(stripeAccountId)}`,
      refreshUrl: `${baseUrl}/dashboard/settings?stripe=retry`,
    });

    return Response.json({
      success: true,
      onboardingUrl,
      stripeAccountId,
    });
  } catch (error) {
    console.error('Stripe connect onboarding error:', error);
    return Response.json({ error: 'Failed to start Stripe onboarding', success: false }, { status: 500 });
  }
}
