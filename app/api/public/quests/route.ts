import { NextRequest } from 'next/server';
import { prisma, withDbRetry } from '@/lib/db';
import { QuestStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '3', 10) || 3, 1), 60);
    const category = url.searchParams.get('category');

    const quests = await withDbRetry(() =>
      prisma.quest.findMany({
        where: { status: QuestStatus.available, track: 'OPEN', questCategory: category ?? undefined } as any,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          company: { include: { companyProfile: true } },
          _count: { select: { assignments: true } },
        },
      })
    );

    const shaped = quests.map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      company: q.company?.companyProfile?.companyName ?? q.company?.name ?? 'Unknown Company',
      difficulty: q.difficulty,
      questCategory: q.questCategory,
      track: q.track,
      source: q.source,
      xpReward: q.xpReward,
      monetaryReward: q.monetaryReward ? Number(q.monetaryReward) : null,
      deadline: q.deadline ? q.deadline.toISOString() : null,
      requiredSkills: q.requiredSkills,
      applicants: q._count.assignments,
    }));

    return Response.json({ quests: shaped });
  } catch {
    return Response.json({ error: 'Failed to fetch quests' }, { status: 500 });
  }
}
