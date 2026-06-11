import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    
    // 1. Check for unaccepted auto-assignments (> 6 hours)
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    
    const unacceptedAssignments = await prisma.questAssignment.findMany({
      where: {
        status: 'assigned',
        assignedAt: { lt: sixHoursAgo },
      },
    });

    const unacceptedIds = unacceptedAssignments.map(a => a.id);
    const unacceptedQuestIds = [...new Set(unacceptedAssignments.map(a => a.questId))];

    if (unacceptedIds.length > 0) {
      await prisma.$transaction(async (tx) => {
        // Cancel the assignments
        await tx.questAssignment.updateMany({
          where: { id: { in: unacceptedIds } },
          data: { status: 'cancelled' },
        });

        // Set quests back to available (syncQuestLifecycleStatus handles this logic perfectly)
        // We just need to trigger it for each quest
        for (const questId of unacceptedQuestIds) {
          await syncQuestLifecycleStatus(tx, questId);
        }
      });
    }

    // 2. Check for stalled active assignments (no updates for > 48 hours)
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const stalledAssignments = await prisma.questAssignment.findMany({
      where: {
        status: { in: ['started', 'in_progress'] },
        OR: [
          {
            lastUpdateAt: { lt: fortyEightHoursAgo },
          },
          {
            lastUpdateAt: null,
            startedAt: { lt: fortyEightHoursAgo },
          }
        ]
      },
    });

    const stalledIds = stalledAssignments.map(a => a.id);
    const stalledQuestIds = [...new Set(stalledAssignments.map(a => a.questId))];

    if (stalledIds.length > 0) {
      await prisma.$transaction(async (tx) => {
        // Cancel the assignments
        await tx.questAssignment.updateMany({
          where: { id: { in: stalledIds } },
          data: { status: 'cancelled' },
        });

        // Sync lifecycle for affected quests, which will revert them to available if slots open up
        for (const questId of stalledQuestIds) {
          await syncQuestLifecycleStatus(tx, questId);
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Processed cron job. Cancelled ${unacceptedIds.length} unaccepted assignments. Cancelled ${stalledIds.length} stalled assignments.`,
      details: {
        unaccepted: unacceptedIds,
        stalled: stalledIds
      }
    });

  } catch (error) {
    console.error('Error in cron check-assignments:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
