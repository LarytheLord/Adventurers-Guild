import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';
import { getStripeAccount, isStripeConfigured } from '@/lib/stripe';

function redirectToSettings(request: NextRequest, status: string) {
  const url = new URL('/dashboard/settings', request.url);
  url.searchParams.set('stripe', status);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return redirectToSettings(request, 'unauthorized');
    }

    if (authUser.role !== 'adventurer') {
      return redirectToSettings(request, 'forbidden');
    }

    if (!isStripeConfigured()) {
      return redirectToSettings(request, 'unavailable');
    }

    const accountParam = request.nextUrl.searchParams.get('account')?.trim();
    const profile = await prisma.adventurerProfile.findUnique({
      where: { userId: authUser.id },
      select: {
        stripeAccountId: true,
      },
    });

    const stripeAccountId = accountParam || profile?.stripeAccountId;
    if (!stripeAccountId) {
      return redirectToSettings(request, 'missing-account');
    }

    const account = await getStripeAccount(stripeAccountId);
    if (!account.details_submitted) {
      await prisma.adventurerProfile.update({
        where: { userId: authUser.id },
        data: {
          stripeAccountId,
          stripeOnboardingDone: false,
        },
      });
      return redirectToSettings(request, 'pending');
    }

    await prisma.adventurerProfile.update({
      where: { userId: authUser.id },
      data: {
        stripeAccountId,
        stripeOnboardingDone: true,
      },
    });

    return redirectToSettings(request, 'success');
  } catch (error) {
    console.error('Stripe connect callback error:', error);
    return redirectToSettings(request, 'error');
  }
}
