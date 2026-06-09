/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { AssignmentStatus, UserRole } from '@prisma/client';

import { requireAuth } from '@/lib/api-auth';
import { prisma, withDbRetry } from '@/lib/db';

function parseRangeDays(raw: string | null) {
  if (raw === '30d') return 30;
  if (raw === '90d') return 90;
  return 7;
}

/**
 * GET /api/admin/analytics
 * Returns: DAU, WAU, MAU, quest completion stats, rank distribution, revenue overview
 */
export async function GET(request: NextRequest) {
  const user = await requireAuth(request, 'admin');
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const rangeDays = parseRangeDays(searchParams.get('range'));
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const rangeStart = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);

    const [
      dau,
      wau,
      mau,
      totalAdventurers,
      totalCompanies,
      totalQuests,
      activeQuests,
      completedAssignments,
      pendingAssignments,
      rejectedAssignments,
      rankDistribution,
      questByCategory,
      questByTrack,
      activityByRange,
      completionDurations,
      topAdventurers,
    ] = await withDbRetry(() =>
      Promise.all([
        prisma.activityLog.groupBy({
          by: ['userId'],
          where: { createdAt: { gte: dayAgo } },
        }),
        prisma.activityLog.groupBy({
          by: ['userId'],
          where: { createdAt: { gte: weekAgo } },
        }),
        prisma.activityLog.groupBy({
          by: ['userId'],
          where: { createdAt: { gte: monthAgo } },
        }),
        prisma.user.count({ where: { role: UserRole.adventurer } }),
        prisma.user.count({ where: { role: UserRole.company } }),
        prisma.quest.count(),
        prisma.quest.count({
          where: { status: { in: ['available', 'in_progress', 'review'] } },
        }),
        prisma.questAssignment.count({
          where: {
            status: AssignmentStatus.completed,
            completedAt: { gte: rangeStart },
          },
        }),
        prisma.questAssignment.count({
          where: {
            status: {
              in: [
                AssignmentStatus.submitted,
                AssignmentStatus.pending_admin_review,
                AssignmentStatus.review,
              ],
            },
            assignedAt: { gte: rangeStart },
          },
        }),
        prisma.questAssignment.count({
          where: {
            status: {
              in: [AssignmentStatus.needs_rework, AssignmentStatus.cancelled],
            },
            assignedAt: { gte: rangeStart },
          },
        }),
        prisma.user.groupBy({
          by: ['rank'],
          _count: { id: true },
          where: { role: UserRole.adventurer },
          orderBy: { rank: 'desc' },
        }),
        prisma.quest.groupBy({
          by: ['questCategory'],
          _count: { id: true },
          where: { createdAt: { gte: rangeStart } },
        }),
        prisma.quest.groupBy({
          by: ['track'],
          _count: { id: true },
          where: { createdAt: { gte: rangeStart } },
        }),
        prisma.activityLog.groupBy({
          by: ['action'],
          _count: { id: true },
          where: { createdAt: { gte: rangeStart } },
          orderBy: { _count: { id: 'desc' } },
          take: 20,
        }),
        prisma.questAssignment.findMany({
          where: {
            status: AssignmentStatus.completed,
            completedAt: { gte: rangeStart },
            startedAt: { not: null },
          },
          select: {
            startedAt: true,
            completedAt: true,
          },
        }),
        prisma.questCompletion.groupBy({
          by: ['userId'],
          _count: { questId: true },
          where: { completionDate: { gte: rangeStart } },
          orderBy: { _count: { questId: 'desc' } },
          take: 10,
        }),
      ])
    );

    const completionDurationsInDays = completionDurations
      .map((assignment) => {
        if (!assignment.startedAt || !assignment.completedAt) return null;
        return (
          (assignment.completedAt.getTime() - assignment.startedAt.getTime()) /
          (1000 * 60 * 60 * 24)
        );
      })
      .filter((duration): duration is number => duration !== null && duration >= 0);

    const avgCompletionTimeDays =
      completionDurationsInDays.length > 0
        ? Number(
            (
              completionDurationsInDays.reduce((sum, duration) => sum + duration, 0) /
              completionDurationsInDays.length
            ).toFixed(1)
          )
        : null;

    const topAdventurerIds = topAdventurers.map((a) => a.userId);
    const topAdventurerUsers = await withDbRetry(() =>
      prisma.user.findMany({
        where: { id: { in: topAdventurerIds } },
        select: { id: true, name: true, username: true, rank: true },
      })
    );

    const topAdventurersWithNames = topAdventurers.map((a) => {
      const topUser = topAdventurerUsers.find((candidate) => candidate.id === a.userId);
      return {
        id: a.userId,
        name: topUser?.name || topUser?.username || 'Unknown',
        rank: topUser?.rank || 'F',
        completions: a._count.questId,
      };
    });

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          dau: dau.length,
          wau: wau.length,
          mau: mau.length,
          totalUsers: totalAdventurers + totalCompanies,
          totalAdventurers,
          totalCompanies,
        },
        quests: {
          totalQuests,
          activeQuests,
          completedQuests: completedAssignments,
          pendingQuests: pendingAssignments,
          rejectedQuests: rejectedAssignments,
          byCategory: questByCategory.map((q: any) => ({
            category: q.questCategory,
            count: q._count.id,
          })),
          byTrack: questByTrack.map((q: any) => ({
            track: q.track,
            count: q._count.id,
          })),
        },
        rankings: {
          rankDistribution: rankDistribution.map((r: any) => ({
            rank: r.rank,
            count: r._count.id,
          })),
          topAdventurers: topAdventurersWithNames,
        },
        activity: {
          windowLabel: `${rangeDays}d`,
          last7Days: activityByRange.map((a: any) => ({
            action: a.action,
            count: a._count.id,
          })),
        },
        completionMetrics: {
          avgCompletionTimeDays,
          completionRate:
            completedAssignments + rejectedAssignments + pendingAssignments > 0
              ? (
                  (completedAssignments /
                    (completedAssignments + rejectedAssignments + pendingAssignments)) *
                  100
                ).toFixed(1)
              : '0.0',
        },
        generatedAt: now.toISOString(),
        selectedRange: `${rangeDays}d`,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
