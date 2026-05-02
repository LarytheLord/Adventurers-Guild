// app/api/payments/route.ts
import { NextRequest } from 'next/server';
import { validatePaymentInfo } from '@/lib/payment-utils';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    // Users can only view their own transactions (unless admin)
    const userId = authUser.role === 'admin' ? (searchParams.get('userId') || authUser.id) : authUser.id;
    const type = searchParams.get('type'); // 'incoming' or 'outgoing'
    const status = searchParams.get('status');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    if (!userId) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    let limit: number | null = null;
    if (limitParam !== null) {
      limit = Number.parseInt(limitParam, 10);
      if (!Number.isFinite(limit) || limit <= 0) {
        return Response.json({ error: 'limit must be a positive integer', success: false }, { status: 400 });
      }
    }

    let offset = 0;
    if (offsetParam !== null) {
      offset = Number.parseInt(offsetParam, 10);
      if (!Number.isFinite(offset) || offset < 0) {
        return Response.json({ error: 'offset must be a non-negative integer', success: false }, { status: 400 });
      }
    }

    // Build where clause based on type
    const where: Record<string, unknown> = {};

    if (type === 'incoming') {
      where.toUserId = userId;
    } else if (type === 'outgoing') {
      where.fromUserId = userId;
    } else {
      where.OR = [
        { fromUserId: userId },
        { toUserId: userId },
      ];
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
      skip: offset,
      ...(limit ? { take: limit } : {}),
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

    const body = await request.json();
    const fromUserId =
      typeof body.fromUserId === 'string'
        ? body.fromUserId
        : typeof body.from_userId === 'string'
          ? body.from_userId
          : '';
    const toUserId =
      typeof body.toUserId === 'string'
        ? body.toUserId
        : typeof body.to_userId === 'string'
          ? body.to_userId
          : '';
    const questId = typeof body.questId === 'string' ? body.questId : '';
    const amount = typeof body.amount === 'number' ? body.amount : Number(body.amount);
    const currency = typeof body.currency === 'string' ? body.currency.trim().toUpperCase() : '';
    const paymentInfo = body.paymentInfo ?? body.payment_info;
    const paymentMethod =
      typeof body.paymentMethod === 'string'
        ? body.paymentMethod
        : typeof body.payment_method === 'string'
          ? body.payment_method
          : 'credit_card';
    const description = typeof body.description === 'string' ? body.description : undefined;

    // Validate required fields
    if (!fromUserId || !toUserId || !questId || !currency) {
      return Response.json(
        { error: 'fromUserId, toUserId, questId, amount, and currency are required', success: false },
        { status: 400 }
      );
    }

    if (
      !fromUserId.trim() ||
      !toUserId.trim() ||
      !questId.trim()
    ) {
      return Response.json(
        { error: 'fromUserId, toUserId, and questId must be non-empty strings', success: false },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json({ error: 'amount must be a positive number', success: false }, { status: 400 });
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

    // Validate payment information
    if (paymentInfo) {
      const validation = validatePaymentInfo(
        paymentInfo.card_number,
        paymentInfo.expiry,
        paymentInfo.cvc
      );

      if (!validation.isValid) {
        return Response.json({ error: validation.error, success: false }, { status: 400 });
      }
    }

    // Verify that the quest exists and is completed
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: { title: true, status: true, xpReward: true, skillPointsReward: true, companyId: true },
    });

    if (!quest) {
      return Response.json({ error: 'Quest not found', success: false }, { status: 404 });
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

    // Check if a payment already exists for this quest
    const existingPayment = await prisma.transaction.findFirst({
      where: {
        questId,
        toUserId,
      },
      select: { id: true },
    });

    if (existingPayment) {
      return Response.json({ error: 'Payment already exists for this quest', success: false }, { status: 400 });
    }

    // In a real implementation, you would integrate with a payment processor like Stripe
    // For now, we'll simulate the payment and create a transaction record

    const transaction = await prisma.transaction.create({
      data: {
        fromUserId,
        toUserId,
        questId,
        amount,
        currency,
        status: 'pending', // Initially pending until payment processor confirms
        paymentMethod,
        description: description || `Payment for quest completion: ${quest.title}`,
        transactionId: `txn_${Date.now()}`, // In real implementation, this would come from payment processor
      },
    });

    // Simulate payment processing (in a real app, this would be handled by a webhook from the payment processor)
    // For now, we'll immediately update the status to completed
    const completedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Update company spending
    const { updateCompanySpending } = await import('@/lib/xp-utils');
    try {
      await updateCompanySpending(fromUserId, amount);
    } catch (e) {
      console.error('Error updating company spending:', e);
    }

    // Send notification to receiving user
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
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return Response.json({ error: 'Failed to process payment', success: false }, { status: 500 });
  }
}
