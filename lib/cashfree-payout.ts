import { prisma } from '@/lib/db';
import { createCashfreePayout, isCashfreeConfigured, createCashfreeBeneficiary } from './cashfree';

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
      paymentProvider: { in: ['cashfree', 'simulated'] },
    },
  });
  if (existingTx) {
    return { success: true, alreadyProcessed: true };
  }

  const adventurer = await prisma.adventurerProfile.findUnique({
    where: { userId: adventurerUserId },
    select: { cashfreeBeneficiaryId: true },
  });
  if (!adventurer?.cashfreeBeneficiaryId) {
    return { success: false, error: 'No bank account linked' };
  }

  const platformFee = Math.round(amount * 0.15);
  const adventurerAmount = amount - platformFee;

  if (isCashfreeConfigured()) {
    try {
      const transferId = `quest_${questId}_user_${adventurerUserId}_${Date.now()}`;
      const payout = await createCashfreePayout({
        beneficiaryId: adventurer.cashfreeBeneficiaryId,
        amount: adventurerAmount,
        currency,
        transferId,
        remarks: `Quest reward for ${questId}`,
      });
      
      await prisma.transaction.create({
        data: {
          toUserId: adventurerUserId,
          questId: questId,
          amount: adventurerAmount,
          platformFee: platformFee,
          platformFeeRate: 0.15,
          status: 'completed',
          paymentProvider: 'cashfree',
          providerPaymentId: payout.id,
          completedAt: new Date(),
        },
      });
      return { success: true, transferId: payout.id };
    } catch (error: unknown) {
      console.error('Cashfree payout failed:', error);
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

/**
 * Link bank account for an adventurer (create beneficiary in Cashfree)
 */
export async function linkBankAccount(
  adventurerUserId: string,
  params: {
    name: string;
    email: string;
    phone: string;
    bankAccount: string;
    ifsc: string;
    address1: string;
    city: string;
    state: string;
    pincode: string;
  }
) {
  if (!isCashfreeConfigured()) {
    // Store locally for simulated mode
    await prisma.adventurerProfile.update({
      where: { userId: adventurerUserId },
      data: {
        cashfreeBeneficiaryId: `local_${adventurerUserId}`,
        bankAccountDetails: {
          name: params.name,
          email: params.email,
          phone: params.phone,
          bankAccount: params.bankAccount,
          ifsc: params.ifsc,
          address1: params.address1,
          city: params.city,
          state: params.state,
          pincode: params.pincode,
        },
      },
    });
    return { success: true, beneficiaryId: `local_${adventurerUserId}` };
  }

  try {
    const beneficiary = await createCashfreeBeneficiary({
      ...params,
      beneficiaryId: adventurerUserId,
    });
    
    await prisma.adventurerProfile.update({
      where: { userId: adventurerUserId },
      data: {
        cashfreeBeneficiaryId: beneficiary.beneId,
        bankAccountDetails: {
          name: params.name,
          email: params.email,
          phone: params.phone,
          bankAccount: params.bankAccount,
          ifsc: params.ifsc,
          address1: params.address1,
          city: params.city,
          state: params.state,
          pincode: params.pincode,
        },
      },
    });
    
    return { success: true, beneficiaryId: beneficiary.beneId };
  } catch (error: unknown) {
    console.error('Failed to link bank account:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}