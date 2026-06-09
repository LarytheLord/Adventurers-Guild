import { NextResponse } from 'next/server';
import { prisma, withDbRetry } from '@/lib/db';

export async function GET() {
  try {
    const adventurers = await withDbRetry(() =>
      prisma.user.findMany({
        where: { role: 'adventurer' },
        orderBy: [{ xp: 'desc' }],
        take: 5,
        select: {
          id: true,
          name: true,
          rank: true,
          xp: true,
          level: true,
          adventurerProfile: {
            select: {
              totalQuestsCompleted: true,
              specialization: true,
            },
          },
        },
      })
    );

    return NextResponse.json({
      success: true,
      adventurers: adventurers.map((a, i) => ({
        id: a.id,
        name: a.name ?? 'Adventurer',
        rank: a.rank ?? 'F',
        xp: a.xp ?? 0,
        level: a.level ?? 1,
        questsCompleted: a.adventurerProfile?.totalQuestsCompleted ?? 0,
        specialization: a.adventurerProfile?.specialization ?? null,
        position: i + 1,
      })),
    });
  } catch {
    return NextResponse.json({ success: false, adventurers: [] }, { status: 500 });
  }
}
