import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

// GET /api/admin/qa-queue — FIFO list of submissions pending QA review, or completed assignments for payment
export async function GET(request: NextRequest) {
  const user = await requireAuth(request, 'admin');
  if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending_admin_review';

  if (!['pending_admin_review', 'completed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status param — use pending_admin_review or completed', success: false }, { status: 400 });
  }

  const assignments = await prisma.questAssignment.findMany({
    where: { status: status as any },
    include: {
      quest: {
        select: { id: true, title: true, track: true, difficulty: true, xpReward: true, monetaryReward: true },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          rank: true,
          bootcampLink: { select: { bootcampTrack: true, bootcampWeek: true } },
        },
      },
      submissions: {
        orderBy: { submittedAt: 'desc' },
        take: 1,
        select: {
          id: true,
          submissionContent: true,
          submissionNotes: true,
          submittedAt: true,
          reviewNotes: true,
        },
      },
    },
    orderBy: status === 'completed' ? { completedAt: 'desc' } : { assignedAt: 'asc' },
  });

  // Check for existing payments on completed assignments to prevent double-pay
  let paymentMap: Record<string, boolean> = {};
  if (status === 'completed' && assignments.length > 0) {
    const existingPayments = await prisma.transaction.findMany({
      where: {
        questId: { in: assignments.map(a => a.questId) },
        toUserId: { in: assignments.map(a => a.userId) },
        status: 'completed',
      },
      select: { questId: true, toUserId: true },
    });
    for (const tx of existingPayments) {
      paymentMap[`${tx.questId}_${tx.toUserId}`] = true;
    }
  }

  return NextResponse.json({ assignments, total: assignments.length, success: true, paymentMap });
}
