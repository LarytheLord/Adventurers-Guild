import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/api-auth';
import { prisma, withDbRetry } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'admin');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const [
      totalUsers,
      totalQuests,
      activeQuests,
      completedQuests,
      pendingQaCount,
      recentUsers,
      recentActivity,
    ] = await withDbRetry(() =>
      Promise.all([
        prisma.user.count(),
        prisma.quest.count(),
        prisma.quest.count({
          where: { status: { in: ['available', 'in_progress', 'review'] } },
        }),
        prisma.questAssignment.count({
          where: { status: 'completed' },
        }),
        prisma.questAssignment.count({
          where: { status: 'pending_admin_review' },
        }),
        prisma.user.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            rank: true,
            xp: true,
            level: true,
            createdAt: true,
          },
        }),
        prisma.activityLog.findMany({
          take: 8,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                rank: true,
              },
            },
          },
        }),
      ])
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalQuests,
        activeQuests,
        completedQuests,
        pendingQaCount,
      },
      recentUsers,
      recentActivity: recentActivity.map((entry) => ({
        id: entry.id,
        action: entry.action,
        createdAt: entry.createdAt.toISOString(),
        user: {
          name: entry.user?.name || entry.user?.email || 'Unknown',
          rank: entry.user?.rank || null,
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin overview', success: false },
      { status: 500 }
    );
  }
}
