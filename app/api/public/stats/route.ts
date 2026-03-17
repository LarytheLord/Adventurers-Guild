import { prisma, withDbRetry } from '@/lib/db';
import { AssignmentStatus, UserRole, QuestStatus } from '@prisma/client';

export async function GET() {
  try {
    const [adventurerCount, companyCount, completedCount, openCount] = await withDbRetry(() =>
      Promise.all([
        prisma.user.count({ where: { role: UserRole.adventurer } }),
        prisma.user.count({ where: { role: UserRole.company } }),
        prisma.questAssignment.count({ where: { status: AssignmentStatus.completed } }),
        prisma.quest.count({ where: { status: QuestStatus.available } }),
      ])
    );

    return Response.json({
      adventurers: adventurerCount,
      companies: companyCount,
      completedQuests: completedCount,
      openQuests: openCount,
    });
  } catch {
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
