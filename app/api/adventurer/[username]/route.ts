import { NextRequest, NextResponse } from 'next/server';
import { prisma, withDbRetry } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await props.params;

    const user = await withDbRetry(() =>
      prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          name: true,
          username: true,
          rank: true,
          xp: true,
          level: true,
          skillPoints: true,
          bio: true,
          location: true,
          github: true,
          linkedin: true,
          avatar: true,
          createdAt: true,
          adventurerProfile: {
            select: {
              primarySkills: true,
              specialization: true,
              totalQuestsCompleted: true,
              questCompletionRate: true,
              currentStreak: true,
              maxStreak: true,
            },
          },
          questCompletions: {
            take: 10,
            orderBy: { completionDate: 'desc' },
            include: {
              quest: {
                select: {
                  title: true,
                  difficulty: true,
                  questCategory: true,
                  track: true,
                  xpReward: true,
                },
              },
            },
          },
        },
      })
    );

    if (!user) {
      return NextResponse.json({ error: 'Adventurer not found' }, { status: 404 });
    }

    const formattedUser = {
      ...user,
      joinedAt: user.createdAt.toISOString(),
      profile: user.adventurerProfile ? {
        skills: user.adventurerProfile.primarySkills,
        specialization: user.adventurerProfile.specialization,
        totalQuestsCompleted: user.adventurerProfile.totalQuestsCompleted,
        completionRate: user.adventurerProfile.questCompletionRate.toString(),
        currentStreak: user.adventurerProfile.currentStreak,
        maxStreak: user.adventurerProfile.maxStreak,
      } : null,
      questHistory: user.questCompletions.map((qc) => {
        return {
          title: qc.quest.title,
          difficulty: qc.quest.difficulty,
          category: qc.quest.questCategory,
          track: qc.quest.track,
          xpEarned: qc.xpEarned,
          qualityScore: qc.qualityScore,
          completedAt: qc.completionDate.toISOString(),
        };
      }),
      stats: {
        totalXpEarned: user.xp,
        averageQuality: user.questCompletions.length > 0 ? user.questCompletions.reduce((acc, qc) => acc + (qc.qualityScore || 0), 0) / user.questCompletions.length : null,
        questCount: user.questCompletions.length,
      },
    };

    return NextResponse.json({ success: true, adventurer: formattedUser });
  } catch (error) {
    console.error('Fetch public profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
