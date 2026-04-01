import { Prisma, PrismaClient, QuestWorkflowEventType } from '@prisma/client';

type DbClient = Prisma.TransactionClient | PrismaClient;

export type QuestWorkflowActor = {
  userId?: string | null;
  role?: string | null;
};

type RecordQuestWorkflowEventInput = {
  questId: string;
  assignmentId?: string | null;
  submissionId?: string | null;
  actorUserId?: string | null;
  actorRole?: string | null;
  eventType: QuestWorkflowEventType;
  payload?: Prisma.InputJsonValue | null;
};

function sanitizeActorValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function buildQuestWorkflowActor(
  user?: { id?: string | null; role?: string | null } | null
): QuestWorkflowActor {
  return {
    userId: sanitizeActorValue(user?.id),
    role: sanitizeActorValue(user?.role),
  };
}

export async function recordQuestWorkflowEvent(
  db: DbClient,
  input: RecordQuestWorkflowEventInput
): Promise<void> {
  await db.questWorkflowEvent.create({
    data: {
      questId: input.questId,
      assignmentId: input.assignmentId ?? null,
      submissionId: input.submissionId ?? null,
      actorUserId: sanitizeActorValue(input.actorUserId),
      actorRole: sanitizeActorValue(input.actorRole),
      eventType: input.eventType,
      payload: input.payload ?? Prisma.JsonNull,
    },
  });
}
