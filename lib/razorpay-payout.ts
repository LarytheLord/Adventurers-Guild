import { prisma } from '@/lib/db';
import { createRazorpayPayout, isRazorpayConfigured } from './razorpay';

export async function processQuestPayment(
  questId: string,
  adventurerUserId: string,
  amount: number,
  currency: string = 'INR'
) {
  const existingTx = await prisma.transaction.findFirst({
    where: {
      toUserId: adventurerUserId,
      questId: questId,
      status: 'completed',
      paymentProvider: { in: ['razorpay', 'simulated'] },
    },
  });
  if (existingTx) {
    return { success: true, alreadyProcessed: true };
  }

  const adventurer = await prisma.adventurerProfile.findUnique({
    where: { userId: adventurerUserId },
    select: { razorpayFundAccountId: true },
  });
  if (!adventurer?.razorpayFundAccountId) {
    return { success: false, error: 'No bank account linked' };
  }

  const platformFee = Math.round(amount * 0.15);
  const adventurerAmount = amount - platformFee;

  if (isRazorpayConfigured()) {
    try {
      const amountInPaise = Math.round(adventurerAmount * 100);
      const payout = await createRazorpayPayout({
        fundAccountId: adventurer.razorpayFundAccountId,
        amount: amountInPaise,
        currency,
        purpose: 'quest_reward',
        referenceId: `quest_${questId}_user_${adventurerUserId}`,
      });
      await prisma.transaction.create({
        data: {
          toUserId: adventurerUserId,
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
      return { success: true, transferId: payout.id };
    } catch (error: unknown) {
      console.error('Razorpay payout failed:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  } else {
    await prisma.transaction.create({
      data: {
        toUserId: adventurerUserId,
        questId: questId,
        amount: adventurerAmount,
        platformFee: platformFee,
        platformFeeRate: 0.15,
        status: 'completed',
        paymentProvider: 'simulated',
        providerPaymentId: `sim_${Date.now()}`,
        completedAt: new Date(),
      },
    });
    return { success: true, simulated: true };
  }
}