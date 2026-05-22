import { prisma, withDbRetry } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const quest = await withDbRetry(() =>
      prisma.quest.findUnique({
        where: { id },
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

    if (!quest) {
      return Response.json({ error: 'Quest not found' }, { status: 404 });
    }

    return Response.json({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      detailedDescription: quest.detailedDescription,
      company: quest.company?.companyProfile?.companyName ?? quest.company?.name ?? 'Unknown Company',
      companyId: quest.companyId,
      difficulty: quest.difficulty,
      track: quest.track,
      xpReward: quest.xpReward,
      monetaryReward: quest.monetaryReward ? Number(quest.monetaryReward) : null,
      deadline: quest.deadline ? quest.deadline.toISOString() : null,
      requiredSkills: quest.requiredSkills,
      applicants: quest._count.assignments,
      status: quest.status,
      createdAt: quest.createdAt.toISOString(),
    });
  } catch {
    return Response.json({ error: 'Failed to fetch quest' }, { status: 500 });
  }
}
