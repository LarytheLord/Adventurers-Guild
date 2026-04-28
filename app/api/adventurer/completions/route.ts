import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { prisma, withDbRetry } from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await requireAuth(request, 'adventurer');

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const completions = await withDbRetry(() =>
    prisma.questCompletion.findMany({
      where: { userId: user.id },
      include: {
        quest: {
          select: {
            title: true,
            difficulty: true,
            questCategory: true,
          },
        },
      },
      orderBy: { completionDate: 'desc' },
    })
  );

  const data = completions.map((c) => ({
    id: c.id,
    questId: c.questId,
    title: c.quest.title,
    difficulty: c.quest.difficulty,
    questCategory: c.quest.questCategory,
    xpEarned: c.xpEarned,
    qualityScore: c.qualityScore,
    completionDate: c.completionDate,
  }));

  return NextResponse.json({ success: true, completions: data });
}
