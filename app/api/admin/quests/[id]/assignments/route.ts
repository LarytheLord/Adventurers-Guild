import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

// GET /api/admin/quests/[id]/assignments
// Returns all assignments for a quest with user info and latest submission
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAuth(request, 'admin');
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { id: questId } = await params;

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: { id: true, title: true, status: true, maxParticipants: true },
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    const assignments = await prisma.questAssignment.findMany({
      where: { questId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rank: true,
            xp: true,
          },
        },
        submissions: {
          orderBy: { submittedAt: 'desc' },
          take: 1,
          select: {
            id: true,
            submittedAt: true,
            reviewNotes: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return NextResponse.json({ quest, assignments, total: assignments.length, success: true });
  } catch (error) {
    console.error('Admin quest assignments error:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments', success: false }, { status: 500 });
  }
}
