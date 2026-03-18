import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

// GET /api/admin/qa-queue — FIFO list of submissions pending QA review
export async function GET(request: NextRequest) {
  const user = await requireAuth(request, 'admin');
  if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });

  const assignments = await prisma.questAssignment.findMany({
    where: { status: 'pending_admin_review' },
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
    orderBy: { assignedAt: 'asc' }, // oldest first — FIFO
  });

  return NextResponse.json({ assignments, total: assignments.length, success: true });
}
