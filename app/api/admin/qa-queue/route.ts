import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { AssignmentStatus } from '@prisma/client';

// GET /api/admin/qa-queue — FIFO list of submissions pending QA review
// GET /api/admin/qa-queue?include=completed — also include completed unpaid assignments
export async function GET(request: NextRequest) {
  const user = await requireAuth(request, 'admin');
  if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const includeCompleted = searchParams.get('include') === 'completed';

  const where = includeCompleted
    ? { status: { in: [AssignmentStatus.pending_admin_review, AssignmentStatus.completed] } }
    : { status: AssignmentStatus.pending_admin_review };

  const assignments = await prisma.questAssignment.findMany({
    where,
    include: {
      quest: {
        select: { id: true, title: true, track: true, difficulty: true, xpReward: true, monetaryReward: true, companyId: true },
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
    orderBy: { assignedAt: 'asc' },
  });

  // For completed assignments, check if a transaction already exists
  const assignmentsWithPayment = await Promise.all(
    assignments.map(async (assignment) => {
      if (assignment.status !== 'completed') {
        return { ...assignment, hasTransaction: false };
      }
      const existingTx = await prisma.transaction.findFirst({
        where: { questId: assignment.questId, toUserId: assignment.userId },
        select: { id: true, status: true },
      });
      return { ...assignment, hasTransaction: !!existingTx, transactionStatus: existingTx?.status ?? null };
    })
  );

  return NextResponse.json({ assignments: assignmentsWithPayment, total: assignmentsWithPayment.length, success: true });
}
