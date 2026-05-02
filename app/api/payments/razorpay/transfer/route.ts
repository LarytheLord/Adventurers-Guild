import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { createRazorpayPayout, isRazorpayConfigured } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: 'Razorpay not configured. Use simulated payment.' },
        { status: 501 }
      );
    }

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { companyProfile: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = user.role === 'admin';
    const isCompany = !!user.companyProfile;
    if (!isAdmin && !isCompany) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins or companies can approve payments' },
        { status: 403 }
      );
    }

    const { questId, userId, amount, currency = 'INR' } = await req.json();
    if (!questId || !userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Missing required fields: questId, userId, amount' },
        { status: 400 }
      );
    }

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      include: { company: true },
    });
    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    // 🚫 BOOTCAMP and TUTORIAL exclusion
    if (quest.track === 'BOOTCAMP' || quest.source === 'TUTORIAL') {
      return NextResponse.json(
        { error: 'BOOTCAMP or TUTORIAL quests do not support payments – XP only' },
        { status: 400 }
      );
    }

    const adventurer = await prisma.adventurerProfile.findUnique({
      where: { userId: userId },
      select: { razorpayFundAccountId: true },
    });
    if (!adventurer?.razorpayFundAccountId) {
      return NextResponse.json(
        { error: 'Adventurer has not set up a bank account for payouts' },
        { status: 400 }
      );
    }

    const platformFee = Math.round(amount * 0.15);
    const adventurerAmount = amount - platformFee;
    const amountInPaise = Math.round(adventurerAmount * 100);

    const payout = await createRazorpayPayout({
      fundAccountId: adventurer.razorpayFundAccountId,
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      purpose: 'quest_reward',
      referenceId: `quest_${questId}_user_${userId}`,
    });

    const transaction = await prisma.transaction.create({
      data: {
        fromUserId: quest.companyId ?? undefined,
        toUserId: userId,
        questId: questId,
        amount: adventurerAmount,
        platformFee: platformFee,
        platformFeeRate: 0.15,
        status: 'completed',
        paymentProvider: 'razorpay',
        providerPaymentId: payout.id,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      transferId: payout.id,
      transactionId: transaction.id,
      amount: adventurerAmount,
      platformFee: platformFee,
    });
  } catch (error: unknown) {
    console.error('Razorpay transfer error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}