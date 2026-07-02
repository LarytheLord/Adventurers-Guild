import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const user = await requireAuth(request, 'admin');
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const where: any = {
      status: { in: ['started', 'in_progress', 'needs_rework'] },
      startedAt: { not: null },
      OR: [
        { lastUpdateAt: { lt: oneDayAgo } },
        {
          AND: [
            { lastUpdateAt: null },
            { startedAt: { lt: oneDayAgo } }
          ]
        }
      ]
    };

    const assignments = await prisma.questAssignment.findMany({
      where,
      include: {
        quest: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            adventurerProfile: {
              select: {
                guildScore: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastUpdateAt: 'asc',
      },
    });

    const formatted = assignments.map((ass) => {
      const lastUpdate = ass.lastUpdateAt || ass.startedAt;
      const hoursSince = lastUpdate 
        ? Math.floor((Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60))
        : 24;

      return {
        assignmentId: ass.id,
        questId: ass.quest.id,
        questTitle: ass.quest.title,
        studentId: ass.user.id,
        studentName: ass.user.name || 'Unknown',
        studentEmail: ass.user.email,
        guildScore: ass.user.adventurerProfile?.guildScore ?? 100,
        lastUpdateAt: ass.lastUpdateAt,
        startedAt: ass.startedAt,
        hoursSinceLastUpdate: hoursSince,
      };
    });

    return NextResponse.json({ assignments: formatted, success: true });
  } catch (error) {
    console.error('Failed to fetch missed updates:', error);
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}
