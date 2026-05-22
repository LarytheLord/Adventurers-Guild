import { prisma, withDbRetry } from '@/lib/db';
import { QuestStatus } from '@prisma/client';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = Number(searchParams.get('limit')) || 50;

    const where: any = { status: QuestStatus.available, track: 'OPEN' };
    if (category) {
      where.questCategory = category;
    }

    const quests = await withDbRetry(() =>
      prisma.quest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          company: {
            include: { companyProfile: true },
          },
          _count: {
            select: { assignments: true },
          },
        },
      })
    );

    const shaped = quests.map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      company: q.company?.companyProfile?.companyName ?? q.company?.name ?? 'Unknown Company',
      difficulty: q.difficulty,
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
