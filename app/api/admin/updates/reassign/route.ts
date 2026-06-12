import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';
import { getAuthUser } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    const { assignmentId } = await req.json();

    if (!assignmentId) {
      return NextResponse.json({ error: 'assignmentId is required', success: false }, { status: 400 });
    }

    const assignment = await prisma.questAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found', success: false }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Cancel the assignment
      await tx.questAssignment.update({
        where: { id: assignmentId },
        data: { status: 'cancelled' },
      });

      // Re-evaluate quest status (it will go back to available if slots open up)
      await syncQuestLifecycleStatus(tx, assignment.questId);
    });

    return NextResponse.json({ success: true, message: 'Quest reassigned successfully' });
  } catch (error) {
    console.error('Error reassigning quest:', error);
    return NextResponse.json({ error: 'Failed to reassign quest', success: false }, { status: 500 });
  }
}
