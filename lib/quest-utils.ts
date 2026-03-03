// lib/quest-utils.ts
import { prisma } from './db';

// Types for our data
export interface Quest {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  questType: string;
  status: string;
  difficulty: string;
  xpReward: number;
  skillPointsReward: number;
  monetaryReward?: number;
  requiredSkills: string[];
  requiredRank?: string;
  maxParticipants?: number;
  questCategory: string;
  companyId: string;
  createdAt: string;
  deadline?: string;
  company?: {
    name: string;
    email: string;
  };
}

export interface QuestAssignment {
  id: string;
  questId: string;
  userId: string;
  assignedAt: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  progress: number;
  quest?: Quest;
}

export interface QuestSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  submissionContent: string;
  submissionNotes?: string;
  submittedAt: string;
  status: string;
  reviewerId?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  qualityScore?: number;
}

// Fetch all available quests
export async function fetchAvailableQuests(): Promise<Quest[]> {
  const quests = await prisma.quest.findMany({
    where: { status: 'available' },
    include: {
      company: { select: { name: true, email: true } },
    },
  });

  return quests.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    detailedDescription: q.detailedDescription ?? undefined,
    questType: q.questType,
    status: q.status,
    difficulty: q.difficulty,
    xpReward: q.xpReward,
    skillPointsReward: q.skillPointsReward,
    monetaryReward: q.monetaryReward ? Number(q.monetaryReward) : undefined,
    requiredSkills: q.requiredSkills,
    requiredRank: q.requiredRank ?? undefined,
    maxParticipants: q.maxParticipants ?? undefined,
    questCategory: q.questCategory,
    companyId: q.companyId ?? '',
    createdAt: q.createdAt.toISOString(),
    deadline: q.deadline?.toISOString(),
    company: q.company ? { name: q.company.name ?? '', email: q.company.email } : undefined,
  }));
}

// Fetch quests for a specific user
export async function fetchUserQuests(userId: string) {
  const assignments = await prisma.questAssignment.findMany({
    where: { userId },
    include: {
      quest: {
        select: {
          title: true,
          description: true,
          questType: true,
          status: true,
          difficulty: true,
          xpReward: true,
          skillPointsReward: true,
          requiredSkills: true,
          requiredRank: true,
          questCategory: true,
          deadline: true,
        },
      },
    },
  });

  return assignments.map((a) => ({
    id: a.id,
    questId: a.questId,
    userId: a.userId,
    assignedAt: a.assignedAt.toISOString(),
    status: a.status,
    startedAt: a.startedAt?.toISOString(),
    completedAt: a.completedAt?.toISOString(),
    progress: Number(a.progress),
    quest: a.quest,
  }));
}

// Fetch quest by ID
export async function fetchQuestById(questId: string): Promise<Quest | null> {
  const q = await prisma.quest.findUnique({
    where: { id: questId },
    include: {
      company: { select: { name: true, email: true } },
    },
  });

  if (!q) return null;

  return {
    id: q.id,
    title: q.title,
    description: q.description,
    detailedDescription: q.detailedDescription ?? undefined,
    questType: q.questType,
    status: q.status,
    difficulty: q.difficulty,
    xpReward: q.xpReward,
    skillPointsReward: q.skillPointsReward,
    monetaryReward: q.monetaryReward ? Number(q.monetaryReward) : undefined,
    requiredSkills: q.requiredSkills,
    requiredRank: q.requiredRank ?? undefined,
    maxParticipants: q.maxParticipants ?? undefined,
    questCategory: q.questCategory,
    companyId: q.companyId ?? '',
    createdAt: q.createdAt.toISOString(),
    deadline: q.deadline?.toISOString(),
    company: q.company ? { name: q.company.name ?? '', email: q.company.email } : undefined,
  };
}

// Assign user to a quest
export async function assignToQuest(questId: string, userId: string): Promise<QuestAssignment | null> {
  const quest = await fetchQuestById(questId);
  if (!quest || quest.status !== 'available') {
    throw new Error('Quest is not available');
  }

  if (quest.maxParticipants) {
    const count = await prisma.questAssignment.count({
      where: { questId, status: { not: 'cancelled' } },
    });

    if (count >= quest.maxParticipants) {
      throw new Error('Maximum participants reached for this quest');
    }
  }

  const assignment = await prisma.questAssignment.create({
    data: { questId, userId, status: 'assigned' },
  });

  if (!quest.maxParticipants || quest.maxParticipants === 1) {
    await prisma.quest.update({
      where: { id: questId },
      data: { status: 'in_progress' },
    });
  }

  return {
    id: assignment.id,
    questId: assignment.questId,
    userId: assignment.userId,
    assignedAt: assignment.assignedAt.toISOString(),
    status: assignment.status,
    progress: Number(assignment.progress),
  };
}

// Submit a quest for review
export async function submitQuest(
  assignmentId: string,
  userId: string,
  submissionContent: string,
  submissionNotes?: string
): Promise<QuestSubmission | null> {
  const assignment = await prisma.questAssignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment || !['assigned', 'started', 'in_progress'].includes(assignment.status)) {
    throw new Error('Invalid assignment state for submission');
  }

  const submission = await prisma.questSubmission.create({
    data: {
      assignmentId,
      userId,
      submissionContent,
      submissionNotes: submissionNotes || null,
    },
  });

  await prisma.questAssignment.update({
    where: { id: assignmentId },
    data: { status: 'submitted' },
  });

  return {
    id: submission.id,
    assignmentId: submission.assignmentId,
    userId: submission.userId ?? '',
    submissionContent: submission.submissionContent,
    submissionNotes: submission.submissionNotes ?? undefined,
    submittedAt: submission.submittedAt.toISOString(),
    status: submission.status,
  };
}

// Update quest assignment status
export async function updateAssignmentStatus(
  assignmentId: string,
  status: string,
  progress?: number
): Promise<QuestAssignment | null> {
  const data: Record<string, unknown> = { status };
  if (progress !== undefined) data.progress = progress;
  if (status === 'started') data.startedAt = new Date();
  if (status === 'completed') data.completedAt = new Date();

  const assignment = await prisma.questAssignment.update({
    where: { id: assignmentId },
    data,
  });

  return {
    id: assignment.id,
    questId: assignment.questId,
    userId: assignment.userId,
    assignedAt: assignment.assignedAt.toISOString(),
    status: assignment.status,
    startedAt: assignment.startedAt?.toISOString(),
    completedAt: assignment.completedAt?.toISOString(),
    progress: Number(assignment.progress),
  };
}

// Delegate to centralized rank module
import { getNextRankThreshold } from './ranks';
export function getNextRank(currentXp: number): { rank: string; nextRankXp: number } {
  const { currentRank, nextRankXp } = getNextRankThreshold(currentXp);
  return { rank: currentRank, nextRankXp };
}
