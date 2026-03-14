import { prisma, withDbRetry } from '@/lib/db';
import { QuestStatus } from '@prisma/client';

export async function GET() {
  try {
    const quests = await withDbRetry(() =>
      prisma.quest.findMany({
        where: { status: QuestStatus.available },
        orderBy: { createdAt: 'desc' },
        take: 3,
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
