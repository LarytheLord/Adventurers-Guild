import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return Response.json({ error: 'Quest not found' }, { status: 404 });
  }

  try {
    const quest = await prisma.quest.findUnique({
      where: { id },
      include: {
        company: {
          include: { companyProfile: true },
        },
        _count: {
          select: { assignments: true },
        },
      },
    });

    if (!quest) {
      return Response.json({ error: 'Quest not found' }, { status: 404 });
    }

    return Response.json({
      quest: {
        id: quest.id,
        title: quest.title,
        description: quest.description,
        detailedDescription: quest.detailedDescription,
        questType: quest.questType,
        difficulty: quest.difficulty,
        xpReward: quest.xpReward,
        skillPointsReward: quest.skillPointsReward,
        monetaryReward: quest.monetaryReward ? Number(quest.monetaryReward) : null,
        requiredSkills: quest.requiredSkills,
        requiredRank: quest.requiredRank,
        maxParticipants: quest.maxParticipants,
        questCategory: quest.questCategory,
        track: quest.track,
        status: quest.status,
        deadline: quest.deadline?.toISOString() ?? null,
        company: quest.company?.companyProfile?.companyName ?? quest.company?.name ?? 'Unknown Company',
        companyId: quest.companyId,
        applicants: quest._count.assignments,
      },
    });
  } catch {
    return Response.json({ error: 'Failed to fetch quest' }, { status: 500 });
  }
}
