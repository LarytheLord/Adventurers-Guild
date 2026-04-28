import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';
import { validatePaymentInfo } from '@/lib/payment-utils';

type PaymentRequestBody = {
  fromUserId?: unknown;
  from_userId?: unknown;
  toUserId?: unknown;
  to_userId?: unknown;
  questId?: unknown;
  amount?: unknown;
  currency?: unknown;
  paymentMethod?: unknown;
  payment_info?: unknown;
  paymentInfo?: unknown;
  description?: unknown;
};

type PaymentInfo = {
  card_number?: unknown;
  expiry?: unknown;
  cvc?: unknown;
};

function asTrimmedString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asPositiveNumber(value: unknown): number | null {
  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
}

function asPaymentInfo(value: unknown): PaymentInfo | null {
  return value && typeof value === 'object' ? (value as PaymentInfo) : null;
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId =
      authUser.role === 'admin' ? searchParams.get('userId') || authUser.id : authUser.id;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    if (!userId) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    const where: Record<string, unknown> = {};

    if (type === 'incoming') {
      where.toUserId = userId;
    } else if (type === 'outgoing') {
      where.fromUserId = userId;
    } else {
      where.OR = [{ fromUserId: userId }, { toUserId: userId }];
    }

    if (status) {
      where.status = status;
    }

    const data = await prisma.transaction.findMany({
      where,
      include: {
        fromUser: {
          select: {
            name: true,
            email: true,
          },
        },
        toUser: {
          select: {
            name: true,
            email: true,
          },
        },
        quest: {
          select: {
            title: true,
          },
        },
      },
      skip: parseInt(offset, 10),
      take: parseInt(limit, 10),
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ transactions: data, success: true });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return Response.json({ error: 'Failed to fetch transactions', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = (await request.json()) as PaymentRequestBody;
    const fromUserId = asTrimmedString(body.fromUserId) ?? asTrimmedString(body.from_userId);
    const toUserId = asTrimmedString(body.toUserId) ?? asTrimmedString(body.to_userId);
    const questId = asTrimmedString(body.questId);
    const amount = asPositiveNumber(body.amount);
    const currency = asTrimmedString(body.currency)?.toUpperCase() ?? 'USD';
    const paymentMethod = asTrimmedString(body.paymentMethod) ?? 'credit_card';
    const description = asTrimmedString(body.description);
    const paymentInfo = asPaymentInfo(body.paymentInfo) ?? asPaymentInfo(body.payment_info);

    if (!fromUserId || !toUserId || !questId || amount === null) {
      return Response.json(
        { error: 'fromUserId, toUserId, questId, amount, and currency are required', success: false },
        { status: 400 }
      );
    }

    if (authUser.role !== 'admin' && fromUserId !== authUser.id) {
      return Response.json(
        { error: 'You can only initiate payments from your own account', success: false },
        { status: 403 }
      );
    }

    if (fromUserId === toUserId) {
      return Response.json(
        { error: 'Sender and receiver cannot be the same user', success: false },
        { status: 400 }
      );
    }

    if (paymentInfo) {
      const validation = validatePaymentInfo(
        String(paymentInfo.card_number ?? ''),
        String(paymentInfo.expiry ?? ''),
        String(paymentInfo.cvc ?? '')
      );

      if (!validation.isValid) {
        return Response.json({ error: validation.error, success: false }, { status: 400 });
      }
    }

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: {
        title: true,
        status: true,
        track: true,
        monetaryReward: true,
        companyId: true,
      },
    });

    if (!quest) {
      return Response.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    if (quest.track === 'BOOTCAMP') {
      return Response.json({
        success: true,
        skipped: true,
        transaction: null,
        message: 'BOOTCAMP quests are XP-only and do not create payment intents.',
      });
    }

    if (quest.status !== 'completed') {
      return Response.json({ error: 'Quest must be completed before payment', success: false }, { status: 400 });
    }

    if (!quest.companyId) {
      return Response.json({ error: 'Quest is not linked to a company', success: false }, { status: 400 });
    }

    if (authUser.role !== 'admin' && quest.companyId !== authUser.id) {
      return Response.json(
        { error: 'You can only pay for your own quests', success: false },
        { status: 403 }
      );
    }

    if (authUser.role !== 'admin' && fromUserId !== quest.companyId) {
      return Response.json(
        { error: 'fromUserId must match the quest owner', success: false },
        { status: 403 }
      );
    }

    const recipient = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { role: true, isActive: true },
    });

    if (!recipient || !recipient.isActive || recipient.role !== 'adventurer') {
      return Response.json({ error: 'Invalid adventurer account', success: false }, { status: 400 });
    }

    const completionRecord = await prisma.questCompletion.findUnique({
      where: {
        questId_userId: {
          questId,
          userId: toUserId,
        },
      },
      select: { id: true },
    });

    if (!completionRecord) {
      return Response.json(
        { error: 'Selected adventurer has not completed this quest', success: false },
        { status: 400 }
      );
    }

    const existingPayment = await prisma.transaction.findFirst({
      where: {
        questId,
        toUserId,
        status: {
          notIn: ['failed', 'cancelled'],
        },
      },
      select: { id: true },
    });

    if (existingPayment) {
      return Response.json({ error: 'Payment already exists for this quest', success: false }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        fromUserId,
        toUserId,
        questId,
        amount,
        currency,
        status: 'pending',
        paymentMethod,
        paymentProvider: 'simulated',
        description: description ?? `Payment for quest completion: ${quest.title}`,
        transactionId: `txn_${Date.now()}`,
      },
    });

    const completedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    const { updateCompanySpending } = await import('@/lib/xp-utils');
    try {
      await updateCompanySpending(fromUserId, amount);
    } catch (error) {
      console.error('Error updating company spending:', error);
    }

    await prisma.notification.create({
      data: {
        userId: toUserId,
        title: 'Payment Received',
        message: `You've received payment of ${amount} ${currency} for completing the quest "${quest.title}"`,
        type: 'payment_received',
        data: {
          questId,
          amount,
          currency,
        },
      },
    });

    return Response.json({
      transaction: completedTransaction,
      success: true,
      message: 'Payment processed successfully',
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return Response.json({ error: 'Failed to process payment', success: false }, { status: 500 });
  }
}
