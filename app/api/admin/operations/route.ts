import { NextRequest, NextResponse } from 'next/server';
import { prisma, withDbRetry } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const user = await requireAuth(request, 'admin');
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');
  const trackFilter = searchParams.get('track');

  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const activeStatuses = ['assigned', 'started', 'in_progress', 'pending_admin_review', 'needs_rework'];
    const where: Record<string, unknown> = {
      status: { in: activeStatuses },
    };

    if (statusFilter && activeStatuses.includes(statusFilter)) {
      where.status = { in: [statusFilter] };
    }

    if (trackFilter) {
      where.quest = { track: trackFilter };
    }

    const assignments = await prisma.questAssignment.findMany({
      where,
      select: {
        id: true,
        status: true,
        assignedAt: true,
        startedAt: true,
        completedAt: true,
        submittedAt: true,
        progress: true,
        lastUpdateAt: true,
        quest: {
          select: {
            id: true,
            title: true,
            track: true,
            difficulty: true,
            xpReward: true,
            monetaryReward: true,
            deadline: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rank: true,
          },
        },
        submissions: {
          orderBy: { submittedAt: 'desc' },
          take: 1,
          select: {
            id: true,
            submittedAt: true,
            reviewNotes: true,
            criteriaResults: true,
            qualityScore: true,
          },
        },
        dailyUpdates: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            createdAt: true,
            yesterday: true,
            today: true,
            blockers: true,
          },
        },
      },
      orderBy: { assignedAt: 'asc' },
    });

    const operationsData = assignments.map((a) => {
      const daysToDeadline = a.quest.deadline
        ? Math.ceil((new Date(a.quest.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      const lastUpdate = a.lastUpdateAt ?? a.startedAt;
      const isStale = lastUpdate ? lastUpdate < fortyEightHoursAgo : true;
      const isUpdateOverdue = lastUpdate ? lastUpdate < twentyFourHoursAgo : true;

      const hasSubmission = a.submissions.length > 0;
      const isReviewed = hasSubmission && a.submissions[0].reviewNotes != null;

      return {
        id: a.id,
        questId: a.quest.id,
        questTitle: a.quest.title,
        questTrack: a.quest.track,
        questDifficulty: a.quest.difficulty,
        xpReward: a.quest.xpReward,
        monetaryReward: a.quest.monetaryReward,
        deadline: a.quest.deadline,
        daysToDeadline,
        userId: a.user.id,
        userName: a.user.name,
        userEmail: a.user.email,
        userRank: a.user.rank,
        status: a.status,
        assignedAt: a.assignedAt.toISOString(),
        startedAt: a.startedAt?.toISOString() ?? null,
        completedAt: a.completedAt?.toISOString() ?? null,
        submittedAt: a.submittedAt?.toISOString() ?? null,
        progress: Number(a.progress),
        lastUpdateAt: lastUpdate?.toISOString() ?? null,
        isStale,
        isUpdateOverdue,
        hasSubmission,
        isReviewed,
        latestSubmission: hasSubmission
          ? {
              submittedAt: a.submissions[0].submittedAt.toISOString(),
              qualityScore: a.submissions[0].qualityScore,
              isReviewed,
            }
          : null,
        latestUpdate: a.dailyUpdates.length > 0
          ? {
              createdAt: a.dailyUpdates[0].createdAt.toISOString(),
              yesterday: a.dailyUpdates[0].yesterday,
              today: a.dailyUpdates[0].today,
              blockers: a.dailyUpdates[0].blockers,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      assignments: operationsData,
      total: operationsData.length,
      summary: {
        totalActive: operationsData.length,
        stale: operationsData.filter((a) => a.isStale).length,
        updateOverdue: operationsData.filter((a) => a.isUpdateOverdue).length,
        pendingReview: operationsData.filter((a) => a.status === 'pending_admin_review').length,
        needsRework: operationsData.filter((a) => a.status === 'needs_rework').length,
        hasSubmission: operationsData.filter((a) => a.hasSubmission).length,
      },
    });
  } catch (error) {
    console.error('Error fetching operations data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch operations data', success: false },
      { status: 500 }
    );
  }
}
