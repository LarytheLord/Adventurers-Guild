import { AssignmentStatus, Prisma, PrismaClient, QuestStatus } from '@prisma/client';

const REVIEW_STATUSES: AssignmentStatus[] = ['submitted', 'review'];

// Statuses that mean a company has accepted the adventurer (slot is filled)
const FILLED_STATUSES: AssignmentStatus[] = ['started', 'in_progress', 'submitted', 'review', 'completed'];

function deriveQuestStatus(
  statuses: AssignmentStatus[],
  currentStatus: QuestStatus,
  maxParticipants: number | null,
): QuestStatus {
  if (statuses.length === 0) {
    if (currentStatus === 'completed' || currentStatus === 'cancelled') return currentStatus;
    return 'available';
  }

  const active = statuses.filter(s => s !== 'cancelled');
  if (active.length === 0) return 'available';

  // Review takes priority
  if (active.some(s => REVIEW_STATUSES.includes(s))) return 'review';

  // Count how many slots are filled (adventurers the company has accepted)
  const filledCount = active.filter(s => FILLED_STATUSES.includes(s)).length;

  // Quest has open slots — keep it available so more adventurers can apply/be accepted
  if (maxParticipants === null || filledCount < maxParticipants) {
    if (active.every(s => s === 'completed')) return 'completed';
    return 'available';
  }

  // All slots filled
  if (active.every(s => s === 'completed')) return 'completed';
  return 'in_progress';
}

type DbClient = Prisma.TransactionClient | PrismaClient;

export async function syncQuestLifecycleStatus(
  db: DbClient,
  questId: string
): Promise<QuestStatus | null> {
  const quest = await db.quest.findUnique({
    where: { id: questId },
    select: { status: true, maxParticipants: true },
  });

  if (!quest) return null;
  if (quest.status === 'cancelled') return quest.status;

  const assignments = await db.questAssignment.findMany({
    where: { questId },
    select: { status: true },
  });

  const nextStatus = deriveQuestStatus(
    assignments.map(a => a.status),
    quest.status,
    quest.maxParticipants,
  );

  if (nextStatus !== quest.status) {
    await db.quest.update({
      where: { id: questId },
      data: { status: nextStatus },
    });
  }

  return nextStatus;
}
