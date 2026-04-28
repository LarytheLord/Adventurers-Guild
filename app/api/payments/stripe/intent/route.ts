import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';
import { calculatePlatformFee, toSmallestUnit } from '@/lib/payment-provider';
import { createStripeCustomer, getStripe, isStripeConfigured } from '@/lib/stripe';

type IntentBody = {
  questId?: unknown;
  adventurerId?: unknown;
  amount?: unknown;
  currency?: unknown;
};

function asTrimmedString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asPositiveNumber(value: unknown): number | null {
  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
}

function pickAdventurerId(
  requestedAdventurerId: string | null,
  completions: Array<{ userId: string }>,
  assignments: Array<{ userId: string; status: string }>
): string | null {
  if (requestedAdventurerId) {
    return requestedAdventurerId;
  }

  if (completions.length > 0) {
    return completions[0]?.userId ?? null;
  }

  const preferredAssignment =
    assignments.find((assignment) => assignment.status === 'completed') ??
    assignments.find((assignment) =>
      ['submitted', 'review', 'in_progress', 'started', 'assigned'].includes(assignment.status)
    );

  return preferredAssignment?.userId ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    if (!['company', 'admin'].includes(authUser.role)) {
      return Response.json(
        { error: 'Only company or admin users can create Stripe intents', success: false },
        { status: 403 }
      );
    }

    if (!isStripeConfigured()) {
      return Response.json({ error: 'Stripe is not configured', success: false }, { status: 503 });
    }

    const body = (await request.json()) as IntentBody;
    const questId = asTrimmedString(body.questId);
    const requestedAdventurerId = asTrimmedString(body.adventurerId);
    const amount = asPositiveNumber(body.amount);
    const currency = asTrimmedString(body.currency)?.toUpperCase() ?? 'USD';

    if (!questId || amount === null) {
      return Response.json(
        { error: 'questId, amount, and currency are required', success: false },
        { status: 400 }
      );
    }

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: {
        id: true,
        title: true,
        status: true,
        track: true,
        companyId: true,
        monetaryReward: true,
        assignments: {
          select: {
            userId: true,
            status: true,
          },
          orderBy: { assignedAt: 'desc' },
        },
        completions: {
          select: {
            userId: true,
          },
          orderBy: { completionDate: 'desc' },
        },
      },
    });

    if (!quest) {
      return Response.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    if (quest.track === 'BOOTCAMP') {
      return Response.json(
        { error: 'BOOTCAMP quests are XP-only and do not create payment intents', success: false },
        { status: 400 }
      );
    }

    if (!quest.companyId) {
      return Response.json({ error: 'Quest is not linked to a company', success: false }, { status: 400 });
    }

    if (authUser.role !== 'admin' && authUser.id !== quest.companyId) {
      return Response.json({ error: 'You can only pay for your own quests', success: false }, { status: 403 });
    }

    if (quest.status !== 'completed') {
      return Response.json({ error: 'Quest must be completed before payment', success: false }, { status: 400 });
    }

    const rewardAmount = Number(quest.monetaryReward ?? 0);
    if (!rewardAmount || rewardAmount <= 0) {
      return Response.json({ error: 'Quest does not have a monetary reward', success: false }, { status: 400 });
    }

    if (Math.abs(rewardAmount - amount) > 0.01) {
      return Response.json(
        { error: 'Requested amount does not match the quest reward', success: false },
        { status: 400 }
      );
    }

    const adventurerId = pickAdventurerId(requestedAdventurerId, quest.completions, quest.assignments);
    if (!adventurerId) {
      return Response.json(
        { error: 'No eligible adventurer found for this quest', success: false },
        { status: 400 }
      );
    }

    const existingPayment = await prisma.transaction.findFirst({
      where: {
        questId,
        toUserId: adventurerId,
        paymentProvider: 'stripe',
        status: {
          notIn: ['failed', 'cancelled'],
        },
      },
      select: { id: true, providerPaymentId: true },
    });

    if (existingPayment) {
      return Response.json(
        { error: 'A Stripe payment already exists for this quest', success: false },
        { status: 400 }
      );
    }

    const adventurer = await prisma.user.findUnique({
      where: { id: adventurerId },
      select: {
        id: true,
        role: true,
        isActive: true,
        adventurerProfile: {
          select: {
            stripeAccountId: true,
            stripeOnboardingDone: true,
          },
        },
      },
    });

    if (!adventurer || !adventurer.isActive || adventurer.role !== 'adventurer') {
      return Response.json({ error: 'Invalid adventurer account', success: false }, { status: 400 });
    }

    if (
      !adventurer.adventurerProfile?.stripeAccountId ||
      !adventurer.adventurerProfile.stripeOnboardingDone
    ) {
      return Response.json(
        {
          error: 'The selected adventurer has not completed Stripe payout onboarding yet',
          success: false,
        },
        { status: 400 }
      );
    }

    const company = await prisma.user.findUnique({
      where: { id: quest.companyId },
      select: {
        id: true,
        email: true,
        name: true,
        companyProfile: {
          select: {
            stripeCustomerId: true,
          },
        },
      },
    });

    if (!company?.companyProfile) {
      return Response.json({ error: 'Company billing profile not found', success: false }, { status: 404 });
    }

    let stripeCustomerId = company.companyProfile.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer({
        email: company.email,
        name: company.name,
        userId: company.id,
      });
      stripeCustomerId = customer.id;

      await prisma.companyProfile.update({
        where: { userId: company.id },
        data: { stripeCustomerId },
      });
    }

    const { platformFee, feeRate, totalCharge } = calculatePlatformFee(amount);
    const paymentIntentAmount = toSmallestUnit(totalCharge, currency);
    const applicationFeeAmount = toSmallestUnit(platformFee, currency);
    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentIntentAmount,
      currency: currency.toLowerCase(),
      customer: stripeCustomerId,
      capture_method: 'manual',
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: adventurer.adventurerProfile.stripeAccountId,
      },
      transfer_group: `quest_${questId}`,
      metadata: {
        questId,
        questTitle: quest.title,
        companyId: quest.companyId,
        adventurerId,
        platformFeeRate: String(feeRate),
      },
    });

    const transaction = await prisma.transaction.create({
      data: {
        fromUserId: quest.companyId,
        toUserId: adventurerId,
        questId,
        amount,
        currency,
        status: 'pending',
        paymentMethod: 'stripe',
        transactionId: paymentIntent.id,
        description: `Escrow payment for quest completion: ${quest.title}`,
        paymentProvider: 'stripe',
        providerPaymentId: paymentIntent.id,
        stripePaymentIntentId: paymentIntent.id,
        platformFee,
        platformFeeRate: feeRate,
      },
    });

    return Response.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      transaction,
      platformFee,
      totalCharge,
    });
  } catch (error) {
    console.error('Stripe intent creation error:', error);
    return Response.json({ error: 'Failed to create Stripe payment intent', success: false }, { status: 500 });
  }
}
