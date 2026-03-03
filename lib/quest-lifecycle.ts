import { AssignmentStatus, Prisma, PrismaClient, QuestStatus } from '@prisma/client';

const REVIEW_STATUSES: AssignmentStatus[] = ['submitted', 'review'];
const ACTIVE_STATUSES: AssignmentStatus[] = ['assigned', 'started', 'in_progress'];

function deriveQuestStatus(statuses: AssignmentStatus[], currentStatus: QuestStatus): QuestStatus {
  if (statuses.length === 0) {
    if (currentStatus === 'completed' || currentStatus === 'cancelled') {
      return currentStatus;
    }
    return 'available';
  }

  if (statuses.some((status) => REVIEW_STATUSES.includes(status))) {
    return 'review';
  }

  if (statuses.some((status) => ACTIVE_STATUSES.includes(status))) {
    return 'in_progress';
  }

  if (statuses.some((status) => status === 'completed')) {
    return 'completed';
  }

  return 'available';
}

type DbClient = Prisma.TransactionClient | PrismaClient;

export async function syncQuestLifecycleStatus(
  db: DbClient,
  questId: string
): Promise<QuestStatus | null> {
  const quest = await db.quest.findUnique({
    where: { id: questId },
    select: { status: true },
  });

  if (!quest) return null;
  if (quest.status === 'cancelled') return quest.status;

  const assignments = await db.questAssignment.findMany({
    where: { questId },
    select: { status: true },
  });

  const nextStatus = deriveQuestStatus(
    assignments.map((assignment) => assignment.status),
    quest.status
  );
  if (nextStatus !== quest.status) {
    await db.quest.update({
      where: { id: questId },
      data: { status: nextStatus },
    });
  }

  return nextStatus;
}
