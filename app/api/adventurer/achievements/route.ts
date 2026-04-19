import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { ACHIEVEMENTS } from '@/lib/achievements';

export async function GET(request: NextRequest) {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetching unlocked achievements
    const unlockedAchievements = await prisma.achievement.findMany({
      where: { userId: authUser.id },
      select: {
        type: true,
        unlockedAt: true,
        metadata: true,
      },
    });

    // Fetching user stats
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        rank: true,
        xp: true,
        adventurerProfile: {
          select: {
            totalQuestsCompleted: true,
            UserRank: true,
            currentStreak: true,
            ledParties: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const unlockedSet = new Set(unlockedAchievements.map((a) => a.type));

    // locked and unlocked achievements
    const achievements = Object.entries(ACHIEVEMENTS).map(([key, achievement]) => {
      const isUnlocked = unlockedSet.has(key);
      const unlockedRecord = unlockedAchievements.find((a) => a.type === key);

      return {
        id: key,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        isUnlocked,
        unlockedAt: isUnlocked ? unlockedRecord?.unlockedAt : null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        achievements,
        stats: {
          totalUnlocked: unlockedAchievements.length,
          totalAchievements: Object.keys(ACHIEVEMENTS).length,
        },
      },
      { status: 200 }
    );
  }