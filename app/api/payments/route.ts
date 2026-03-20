// app/api/payments/route.ts
import { NextRequest } from 'next/server';
import { validatePaymentInfo } from '@/lib/payment-utils';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
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
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['from_userId', 'to_userId', 'questId', 'amount', 'currency'];
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    if (
      typeof body.from_userId !== 'string' ||
      typeof body.to_userId !== 'string' ||
      typeof body.questId !== 'string' ||
      !body.from_userId.trim() ||
      !body.to_userId.trim() ||
      !body.questId.trim()
    ) {
      return Response.json(
        { error: 'from_userId, to_userId, and questId must be non-empty strings', success: false },
        { status: 400 }
      );
    }

    if (authUser.role !== 'admin' && body.from_userId !== authUser.id) {
      return Response.json(
        { error: 'You can only initiate payments from your own account', success: false },
        { status: 403 }
      );
    }
    if (body.from_userId === body.to_userId) {
      return Response.json(
        { error: 'Sender and receiver cannot be the same user', success: false },
        { status: 400 }
      );
    }

    // Validate payment information
    if (body.payment_info) {
      const validation = validatePaymentInfo(
        body.payment_info.card_number,
        body.payment_info.expiry,
        body.payment_info.cvc
      );

      if (!validation.isValid) {
        return Response.json({ error: validation.error, success: false }, { status: 400 });
      }
    }

    // Verify that the quest exists and is completed
    const quest = await prisma.quest.findUnique({
      where: { id: body.questId },
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

    if (authUser.role !== 'admin' && body.from_userId !== quest.companyId) {
      return Response.json(
        { error: 'from_userId must match the quest owner', success: false },
        { status: 403 }
      );
    }

    const recipient = await prisma.user.findUnique({
      where: { id: body.to_userId },
      select: { role: true, isActive: true },
    });

    if (!recipient || !recipient.isActive || recipient.role !== 'adventurer') {
      return Response.json({ error: 'Invalid adventurer account', success: false }, { status: 400 });
    }

    const completionRecord = await prisma.questCompletion.findUnique({
      where: {
        questId_userId: {
          questId: body.questId,
          userId: body.to_userId,
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
        questId: body.questId,
        toUserId: body.to_userId,
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
        fromUserId: body.from_userId,
        toUserId: body.to_userId,
        questId: body.questId,
        amount: body.amount,
        currency: body.currency,
        status: 'pending', // Initially pending until payment processor confirms
        paymentMethod: body.paymentMethod || 'credit_card',
        description: body.description || `Payment for quest completion: ${quest.title}`,
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
      await updateCompanySpending(body.from_userId, body.amount);
    } catch (e) {
      console.error('Error updating company spending:', e);
    }

    // Send notification to receiving user
    await prisma.notification.create({
      data: {
        userId: body.to_userId,
        title: 'Payment Received',
        message: `You've received payment of ${body.amount} ${body.currency} for completing the quest "${quest.title}"`,
        type: 'payment_received',
        data: {
          questId: body.questId,
          amount: body.amount,
          currency: body.currency,
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
