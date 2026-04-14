// app/api/admin/activity/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'admin');
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '50')), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get recent activity feed (paginated)
    const recentActivity = await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rank: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Get daily active users (count distinct userId where createdAt > 24h ago)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyActiveUsers = await prisma.activityLog.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    // Get activity breakdown by type
    const activityBreakdown = await prisma.activityLog.groupBy({
      by: ['action'],
      _count: {
        action: true,
      },
      _sum: {
        points: true,
      },
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
    });

    return Response.json({
      recentActivity,
      dailyActiveUsers: dailyActiveUsers.length,
      activityBreakdown: activityBreakdown.map(item => ({
        action: item.action,
        count: item._count.action,
        totalPoints: item._sum.points || 0,
      })),
      success: true,
    });
  } catch (error) {
    console.error('Error fetching activity data:', error);
    return Response.json({ error: 'Failed to fetch activity data', success: false }, { status: 500 });
  }
}
