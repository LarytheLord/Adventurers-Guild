import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';
import { timingSafeEqual } from 'crypto';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  const safeEqual = (a: string, b: string) =>
    a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
  if (!authHeader || !safeEqual(authHeader, expected)) {
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

    // 2. Check for assignments with stale updates (> 48 hours) and notify
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const staleAssignments = await prisma.questAssignment.findMany({
      where: {
        status: { in: ['started', 'in_progress', 'pending_admin_review'] },
        OR: [
          {
            lastUpdateAt: { lt: fortyEightHoursAgo },
          },
          {
            lastUpdateAt: null,
            startedAt: { lt: fortyEightHoursAgo },
          },
        ],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        quest: { select: { id: true, title: true } },
      },
    });

    if (staleAssignments.length > 0) {
      await prisma.notification.createMany({
        data: staleAssignments.map((a) => ({
          userId: a.user.id,
          type: 'stale_update' as const,
          title: `Daily update overdue — ${a.quest.title}`,
          message: `You haven't submitted a daily update for ${a.quest.title} in over 48 hours. Please update your progress or this assignment may be cancelled.`,
          data: {
            questId: a.quest.id,
            assignmentId: a.id,
            lastUpdateAt: a.lastUpdateAt?.toISOString() ?? null,
          },
        })),
      });
      console.log(`[cron] Created ${staleAssignments.length} stale-update notifications.`);
    }

    return NextResponse.json({
      success: true,
      message: `Processed cron job. Cancelled ${unacceptedIds.length} unaccepted assignments. Created ${staleAssignments.length} stale-update notifications.`,
      details: {
        unaccepted: unacceptedIds,
        staleNotifications: staleAssignments.length,
      },
    });

  } catch (error) {
    console.error('Error in cron check-assignments:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
