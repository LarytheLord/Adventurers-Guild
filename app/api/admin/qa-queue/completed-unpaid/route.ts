import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

// GET /api/admin/qa-queue/completed-unpaid — completed assignments with reward > 0 and no transaction
export async function GET(request: NextRequest) {
  const user = await requireAuth(request, 'admin');
  if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });

  const assignments = await prisma.questAssignment.findMany({
    where: {
      status: 'completed',
      quest: {
        monetaryReward: { gt: 0 },
      },
    },
    include: {
      quest: {
        select: {
          id: true,
          title: true,
          track: true,
          difficulty: true,
          xpReward: true,
          monetaryReward: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          rank: true,
          adventurerProfile: {
            select: {
              razorpayFundAccountId: true,
            },
          },
        },
      },
      submissions: {
        orderBy: { submittedAt: 'desc' },
        take: 1,
        select: {
          id: true,
          submittedAt: true,
        },
      },
    },
    orderBy: { completedAt: 'desc' },
  });

  const questIds = assignments.map((a) => a.questId);
  const existingTransactions = await prisma.transaction.findMany({
    where: {
      questId: { in: questIds },
      status: 'completed',
      paymentProvider: { in: ['razorpay', 'simulated'] },
    },
    select: { questId: true, toUserId: true },
  });

  const paidQuestUserPairs = new Set(
    existingTransactions.map((t) => `${t.questId}:${t.toUserId}`)
  );

  const unpaidAssignments = assignments.filter(
    (a) => !paidQuestUserPairs.has(`${a.questId}:${a.userId}`)
  );

  return NextResponse.json({
    assignments: unpaidAssignments,
    total: unpaidAssignments.length,
    success: true,
  });
}
