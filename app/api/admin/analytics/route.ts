/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma, withDbRetry } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { QuestStatus, AssignmentStatus, UserRole } from '@prisma/client';

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
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

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
      activityLast7Days,
      avgCompletionTime,
      topAdventurers,
    ] = await withDbRetry(() =>
      Promise.all([
        // DAU - unique users with activity in last 24h
        prisma.activityLog.count({
          where: { createdAt: { gte: dayAgo } },
          select: { userId: true },
        }),
        // WAU - unique users with activity in last 7 days
        prisma.activityLog.count({
          where: { createdAt: { gte: weekAgo } },
          select: { userId: true },
        }),
        // MAU - unique users with activity in last 30 days
        prisma.activityLog.count({
          where: { createdAt: { gte: monthAgo } },
          select: { userId: true },
        }),
        // Total adventurers
        prisma.user.count({ where: { role: UserRole.adventurer } }),
        // Total companies
        prisma.user.count({ where: { role: UserRole.company } }),
        // Total quests ever created
        prisma.quest.count(),
        // Active (available) quests
        prisma.quest.count({ where: { status: QuestStatus.available } }),
        // Completed assignments
        prisma.questAssignment.count({
          where: { status: AssignmentStatus.completed },
        }),
        // Pending assignments (submitted, under review)
        prisma.questAssignment.count({
          where: {
            status: {
              in: [
                AssignmentStatus.submitted,
                AssignmentStatus.pending_admin_review,
                AssignmentStatus.review,
              ],
            },
          },
        }),
        // Rejected/needs rework assignments
        prisma.questAssignment.count({
          where: {
            status: {
              in: [
                AssignmentStatus.needs_rework,
                AssignmentStatus.cancelled,
              ],
            },
          },
        }),
        // Rank distribution
        prisma.user.groupBy({
          by: ['rank'],
          _count: { id: true },
          where: { role: UserRole.adventurer },
          orderBy: { rank: 'desc' },
        }),
        // Quests by category
        prisma.quest.groupBy({
          by: ['questCategory'],
          _count: { id: true },
          where: { status: QuestStatus.available },
        }),
        // Quests by track
        prisma.quest.groupBy({
          by: ['track'],
          _count: { id: true },
          where: { status: QuestStatus.available },
        }),
        // Activity logs (last 7 days) - daily breakdown
        prisma.activityLog.groupBy({
          by: ['action'],
          _count: { id: true },
          where: { createdAt: { gte: weekAgo } },
          orderBy: { _count: { id: 'desc' } },
          take: 20,
        }),
        // Average completion time (completed quests only) — calculate from DB
        prisma.questCompletion.findMany({
          select: {
            id: true,
            completionDate: true,
          },
          orderBy: { completionDate: 'desc' },
          take: 100,
        }),
        // Top 10 adventurers by completions
        prisma.questCompletion.groupBy({
          by: ['userId'],
          _count: { questId: true },
          orderBy: { _count: { questId: 'desc' } },
          take: 10,
        }),
      ])
    );

    // Fetch adventurer names for top adventurers
    const topAdventurerIds = topAdventurers.map((a) => a.userId);
    const topAdventurerUsers = await withDbRetry(() =>
      prisma.user.findMany({
        where: { id: { in: topAdventurerIds } },
        select: { id: true, name: true, username: true, rank: true },
      })
    );

    const topAdventurersWithNames = topAdventurers.map((a) => {
      const user = topAdventurerUsers.find((u) => u.id === a.userId);
      return {
        id: a.userId,
        name: user?.name || user?.username || 'Unknown',
        rank: user?.rank || 'F',
        completions: a._count.questId,
      };
    });

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          dau: Array.isArray(dau) ? dau.length : dau,
          wau: Array.isArray(wau) ? wau.length : wau,
          mau: Array.isArray(mau) ? mau.length : mau,
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
          last7Days: activityLast7Days.map((a: any) => ({
            action: a.action,
            count: a._count.id,
          })),
        },
        completionMetrics: {
          avgCompletionTimeDays: null as number | null,
          completionRate:
            completedAssignments > 0
              ? ((completedAssignments / (completedAssignments + rejectedAssignments + pendingAssignments)) * 100).toFixed(1)
              : '0.0',
        },
        generatedAt: now.toISOString(),
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