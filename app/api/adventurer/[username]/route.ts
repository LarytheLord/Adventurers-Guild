import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ username: string }> }
) {
  const { username } = await props.params;

  if (!username || username.length < 2 || username.length > 40) {
    return NextResponse.json({ success: false, error: 'Invalid username' }, { status: 400 });
  }

  try {
    // Look up by username first, fall back to UUID for backwards-compat
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(username);

    const user = await prisma.user.findFirst({
      where: isUuid
        ? { id: username, role: 'adventurer', isActive: true }
        : { username, role: 'adventurer', isActive: true },
      select: {
        id: true,
        name: true,
        username: true,
        rank: true,
        xp: true,
        skillPoints: true,
        level: true,
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
            availabilityStatus: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Adventurer not found' }, { status: 404 });
    }

    // Get completed quest history (public info only)
    const completions = await prisma.questCompletion.findMany({
      where: { userId: user.id },
      include: {
        quest: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            questCategory: true,
            track: true,
          },
        },
      },
      orderBy: { completionDate: 'desc' },
      take: 50,
    });

    // Calculate stats from completions
    const totalXpFromCompletions = completions.reduce((sum, c) => sum + c.xpEarned, 0);
    const withQuality = completions.filter(c => c.qualityScore !== null);
    const avgQuality = withQuality.length > 0
      ? withQuality.reduce((sum, c) => sum + (c.qualityScore ?? 0), 0) / withQuality.length
      : null;

    const guildCard = {
      id: user.id,
      name: user.name,
      username: user.username,
      rank: user.rank,
      xp: user.xp,
      skillPoints: user.skillPoints,
      level: user.level,
      bio: user.bio,
      location: user.location,
      github: user.github,
      linkedin: user.linkedin,
      avatar: user.avatar,
      joinedAt: user.createdAt,
      profile: user.adventurerProfile
        ? {
            skills: user.adventurerProfile.primarySkills,
            specialization: user.adventurerProfile.specialization,
            totalQuestsCompleted: user.adventurerProfile.totalQuestsCompleted,
            completionRate: Number(user.adventurerProfile.questCompletionRate),
            currentStreak: user.adventurerProfile.currentStreak,
            maxStreak: user.adventurerProfile.maxStreak,
            availability: user.adventurerProfile.availabilityStatus,
          }
        : null,
      questHistory: completions.map((c) => ({
        title: c.quest.title,
        difficulty: c.quest.difficulty,
        category: c.quest.questCategory,
        track: c.quest.track,
        xpEarned: c.xpEarned,
        qualityScore: c.qualityScore,
        completedAt: c.completionDate,
      })),
      stats: {
        totalXpEarned: totalXpFromCompletions,
        averageQuality: avgQuality ? Number(avgQuality.toFixed(1)) : null,
        questCount: completions.length,
      },
    };

    return NextResponse.json({ success: true, adventurer: guildCard });
  } catch (error) {
    console.error('Error fetching adventurer profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}
