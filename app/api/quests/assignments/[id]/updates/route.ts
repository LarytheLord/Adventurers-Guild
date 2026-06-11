import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';
import { recalculateGuildScore } from '@/lib/guild-score';
import { z } from 'zod';

const updateSchema = z.object({
  yesterday: z.string().min(3, 'Please describe what you did yesterday'),
  today: z.string().min(3, 'Please describe what you plan to do today'),
  blockers: z.string().optional(),
  evidenceUrl: z.string().url('Please enter a valid evidence URL').optional().or(z.literal('')),
});

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    const assignmentId = params.id;
    const body = await request.json();
    const parsed = updateSchema.parse(body);

    // Fetch assignment to verify ownership and state
    const assignment = await prisma.questAssignment.findUnique({
      where: { id: assignmentId },
      select: { userId: true, status: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found', success: false }, { status: 404 });
    }

    if (assignment.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized to post updates for this assignment', success: false }, { status: 403 });
    }

    // Create the DailyUpdate entry
    const dailyUpdate = await prisma.$transaction(async (tx) => {
      const update = await tx.dailyUpdate.create({
        data: {
          assignmentId,
          userId: user.id,
          yesterday: parsed.yesterday,
          today: parsed.today,
          blockers: parsed.blockers || null,
          evidenceUrl: parsed.evidenceUrl || null,
        },
      });

      // Update the lastUpdateAt field on QuestAssignment
      await tx.questAssignment.update({
        where: { id: assignmentId },
        data: { lastUpdateAt: new Date() },
      });

      // Recalculate Guild Score for the user
      await recalculateGuildScore(user.id, tx);

      return update;
    });

    return NextResponse.json({ dailyUpdate, success: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit daily update:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message, success: false }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}
