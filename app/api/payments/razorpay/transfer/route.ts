import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'admin');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { questId, userId, amount } = body;

    if (!questId || !userId || amount == null) {
      return NextResponse.json(
        { error: 'questId, userId, and amount are required', success: false },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number', success: false }, { status: 400 });
    }

    // Verify quest exists and has a monetary reward
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: { id: true, title: true, monetaryReward: true, companyId: true, status: true },
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    if (!quest.monetaryReward || Number(quest.monetaryReward) <= 0) {
      return NextResponse.json({ error: 'Quest has no monetary reward', success: false }, { status: 400 });
    }

    // Verify the assignment is completed
    const assignment = await prisma.questAssignment.findFirst({
      where: { questId, userId, status: 'completed' },
      select: { id: true },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'No completed assignment found for this quest and user', success: false },
        { status: 400 }
      );
    }

    // Check if transaction already exists
    const existingTx = await prisma.transaction.findFirst({
      where: { questId, toUserId: userId },
      select: { id: true },
    });

    if (existingTx) {
      return NextResponse.json(
        { error: 'Payment already initiated for this quest', success: false },
        { status: 409 }
      );
    }

    // Verify adventurer exists
    const adventurer = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true },
    });

    if (!adventurer || adventurer.role !== 'adventurer') {
      return NextResponse.json({ error: 'Invalid adventurer', success: false }, { status: 400 });
    }

    const rewardAmount = Number(quest.monetaryReward);
    const platformFee = rewardAmount - amount;
    const platformFeeRate = rewardAmount > 0 ? platformFee / rewardAmount : 0;

    // Create the transaction record
    const transaction = await prisma.transaction.create({
      data: {
        fromUserId: quest.companyId ?? undefined,
        toUserId: userId,
        questId,
        amount,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'razorpay_transfer',
        paymentProvider: 'razorpay',
        description: `Razorpay transfer for quest: ${quest.title}`,
        platformFee,
        platformFeeRate,
        transactionId: `txn_rp_${Date.now()}`,
        completedAt: new Date(),
      },
    });

    // Update company spending
    if (quest.companyId) {
      const { updateCompanySpending } = await import('@/lib/xp-utils');
      try {
        await updateCompanySpending(quest.companyId, rewardAmount);
      } catch (e) {
        console.error('Error updating company spending:', e);
      }
    }

    // Notify the adventurer
    await prisma.notification.create({
      data: {
        userId,
        title: 'Payment Initiated',
        message: `Your payment of $${amount.toFixed(2)} for "${quest.title}" has been processed.`,
        type: 'payment_received',
        data: { questId, amount, transactionId: transaction.id },
      },
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        platformFee: transaction.platformFee,
        status: transaction.status,
      },
      message: 'Transfer initiated successfully',
    });
  } catch (error) {
    console.error('Error initiating Razorpay transfer:', error);
    return NextResponse.json(
      { error: 'Failed to initiate transfer', success: false },
      { status: 500 }
    );
  }
}
