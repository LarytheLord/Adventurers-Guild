import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

// GET /api/admin/qa-queue — FIFO list of submissions pending QA review
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'admin');
    if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });

    const assignments = await prisma.questAssignment.findMany({
      where: { status: 'pending_admin_review' },
      include: {
        quest: {
          select: {
            id: true,
            title: true,
            track: true,
            difficulty: true,
            xpReward: true,
            monetaryReward: true,
            detailedDescription: true,
            acceptanceCriteria: true,
            briefData: true,
            fieldTemplate: { select: { briefFields: true, submissionFields: true } },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rank: true,
            bootcampLink: { select: { cohort: true, bootcampTrack: true, bootcampWeek: true } },
          },
        },
        submissions: {
          orderBy: { submittedAt: 'desc' },
          take: 1,
          select: {
            id: true,
            submissionContent: true,
            submissionNotes: true,
            submissionData: true,
            submittedAt: true,
            reviewNotes: true,
          },
        },
      },
      orderBy: { assignedAt: 'asc' }, // oldest first — FIFO
    });

    return NextResponse.json({ assignments, total: assignments.length, success: true });
  } catch (error) {
    console.error('QA queue GET error:', error);
    return NextResponse.json({ error: 'Failed to load QA queue', success: false }, { status: 500 });
  }
}
