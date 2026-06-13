import { ServiceResult } from "./types";
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';
import { logActivity } from '@/lib/activity-logger';
import { SessionUser } from "../api-auth";
import { prisma } from "@/lib/db";
import { Prisma, AssignmentStatus, QuestAssignment, UserRank } from '@prisma/client';
import { UpdateAssignmentBody } from './types';
import { PrismaClient } from "@prisma/client";
import { canUserAcceptQuest } from "@/lib/quest-access";

export async function applyToQuest(questId: string, user: SessionUser, tx: PrismaClient): Promise<ServiceResult<QuestAssignment>> {
  // Validate required fields
  try {
    if (!questId) {
      return { data: null, error: 'Missing required fields', status: 400 };
    }
    if (!user.id) {
      return { data: null, error: 'Missing required fields', status: 400 };
    }

    // Check if the quest exists and is available
    const quest = await tx.quest.findUnique({
      where: { id: questId },
      select: { status: true, maxParticipants: true, title: true, track: true, requiredRank: true },
    });

    if (!quest || quest.status !== 'available') {
      return { data: null, error: 'Quest not available', status: 400 };
    }

    // Check rank gating: user must have minimum rank to accept quest
    // Admins bypass rank checks, but adventurers must meet requirement
    // Use fresh DB rank (not stale JWT token) to avoid gating issues after rank-up
    if (user.role === 'adventurer') {
      const fresh = await tx.user.findUnique({
        where: { id: user.id },
        select: { rank: true },
      });
      const currentRank = (fresh?.rank || user.rank) as UserRank;
      const canAccept = canUserAcceptQuest(currentRank, quest.requiredRank);
      if (!canAccept) {
        return {
          data: null,
          error: `You must reach Rank ${quest.requiredRank} to accept this quest. Current rank: ${currentRank}`,
          status: 403,
        };
      }
    }

    // Task 1.4: Bootcamp tutorial gating
    // Admins bypass all gating — only adventurers are subject to tutorial requirements
    if (user.role === 'admin') {
      // Admin bypasses bootcamp tutorial gating
    } else if (user.role === 'adventurer') {
      const bootcampLink = await tx.bootcampLink.findUnique({
        where: { userId: user.id },
        select: { eligibleForRealQuests: true },
      });
      if (bootcampLink && !bootcampLink.eligibleForRealQuests) {
        const isTutorial = quest.title.startsWith('Tutorial:');
        if (!isTutorial) {
          return { data: null, error: 'Complete both tutorial quests first before applying to real quests', status: 403 };
        }
      }
    }

    // Check if user is already assigned to this quest (ignore cancelled) — pre-check only.
    const existingAssignment = await tx.questAssignment.findFirst({
      where: {
        questId: questId,
        userId: user.id,
        status: { not: 'cancelled' },
      },
    });

    if (existingAssignment) {
      return { data: null, error: 'You are already assigned to this quest', status: 400 };
    }

    // Slot check + insert run inside a serializable transaction to prevent race conditions.
    // Both the count and the insert must be atomic — two concurrent applications could
    // otherwise both pass the count check and both insert, over-filling the quest.
    const assignment = await tx.$transaction(
      async (tx) => {
        if (quest.maxParticipants) {
          const filledCount = await tx.questAssignment.count({
            where: {
              questId,
              status: { in: ['started', 'in_progress', 'submitted', 'pending_admin_review', 'review', 'needs_rework', 'completed'] },
            },
          });
          if (filledCount >= quest.maxParticipants) {
            throw new Error('Maximum participants reached for this quest');
          }
        }

        const created = await tx.questAssignment.create({
          data: {
            questId: questId,
            userId: user.id,
            status: 'assigned',
          },
        });

        await syncQuestLifecycleStatus(tx, questId);
        await logActivity(user.id, 'quest_apply', { questId }, tx);

        return created;
      },
      { maxWait: 10_000, timeout: 20_000, isolationLevel: 'Serializable' }
    );

    return { data: assignment, error: null, status: 200 };
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg === 'Maximum participants reached for this quest') {
      return { data: null, error: msg, status: 400 };
    }
    console.error('Error applying to quest:', error);
    return { data: null, error: 'Failed to apply to quest', status: 500 };
  }
}

export async function updateAssignment(body: UpdateAssignmentBody, user: SessionUser, tx: PrismaClient): Promise<ServiceResult<QuestAssignment>> {
  try {
    const { assignmentId, status, progress } = body;
    const userId = user.id; // Use authenticated user's ID

    // Validate required fields
    if (!assignmentId || !status) {
      return { data: null, error: 'Missing required fields', status: 400 };
    }

    const requestedStatus = status as AssignmentStatus;
    const adminStatuses: AssignmentStatus[] = [
      'assigned',
      'started',
      'in_progress',
      'submitted',
      'pending_admin_review',
      'review',
      'completed',
      'cancelled',
      'needs_rework',
    ];
    const adventurerStatuses: AssignmentStatus[] = ['started', 'in_progress'];
    const allowedStatuses = user.role === 'admin' ? adminStatuses : adventurerStatuses;

    if (!allowedStatuses.includes(requestedStatus)) {
      return { data: null, error: 'Invalid assignment status transition', status: 400 };
    }

    // Check if the user has permission to update this assignment
    // Only the assigned user or an admin can update the assignment
    const assignment = await tx.questAssignment.findUnique({
      where: { id: assignmentId },
      select: { userId: true, questId: true },
    });

    if (!assignment) {
      return { data: null, error: 'Assignment not found', status: 404 };
    }

    if (assignment.userId !== userId && user.role !== 'admin') {
      return { data: null, error: 'Unauthorized to update this assignment', status: 403 };
    }

    // Build update data
    const updateData: Record<string, unknown> = { status: requestedStatus };
    if (progress !== undefined) {
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return { data: null, error: 'progress must be a number between 0 and 100', status: 400 };
      }
      updateData.progress = progress;
    }
    if (requestedStatus === 'started') {
      updateData.startedAt = new Date();
    }
    if (requestedStatus === 'completed') {
      updateData.completedAt = new Date();
    }

    // here we are using transaction
    const updatedAssignment = await tx.$transaction(
      async (tx) => {
        const updated = await tx.questAssignment.update({
          where: { id: assignmentId },
          data: updateData,
        });

        await syncQuestLifecycleStatus(tx, assignment.questId);
        return updated;
      },
      { maxWait: 10_000, timeout: 20_000 }
    );

    return { data: updatedAssignment, error: null, status: 200 };
  } catch (error) {
    console.error('Error updating quest assignment:', error);
    return { data: null, error: 'Failed to update quest assignment', status: 500 };
  }
}

export async function getAssignments(searchParams: URLSearchParams, user: SessionUser): Promise<ServiceResult<QuestAssignment[]>> {
  try {
    const requestedUserId = searchParams.get('userId');
    const questId = searchParams.get('questId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const currentUserId = user.id;
    const currentUserRole = user.role;
    const where: Prisma.QuestAssignmentWhereInput = {};

    if (currentUserRole === 'adventurer') {
      // Adventurers can only see their own assignments
      where.userId = currentUserId;
    } else if (currentUserRole === 'company') {
      // Companies can see assignments for their quests
      where.quest = { companyId: currentUserId };
    } else if (currentUserRole === 'admin') {
      // Admins can see all assignments - no additional filter needed
    } else {
      // Other roles are not allowed
      return { data: null, error: 'Unauthorized', status: 403 };
    }

    // Add filters if provided (respecting permissions)
    if (requestedUserId && currentUserRole === 'admin') {
      // Only admins can request assignments for a specific user
      where.userId = requestedUserId;
    }
    if (questId) {
      where.questId = questId;
    }
    if (status) {
      const validStatuses: AssignmentStatus[] = [
        'assigned',
        'started',
        'in_progress',
        'submitted',
        'pending_admin_review',
        'review',
        'completed',
        'cancelled',
        'needs_rework',
      ];
      if (!validStatuses.includes(status as AssignmentStatus)) {
        return { data: null, error: 'Invalid status filter', status: 400 };
      }
      where.status = status as AssignmentStatus;
    }

    const assignments = await prisma.questAssignment.findMany({
      where,
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
      skip: offset,
      take: limit,
    });

    return { data: assignments, error: null, status: 200 };
  } catch (error) {
    console.error('Error fetching quest assignments:', error);
    return { data: null, error: 'Failed to fetch quest assignments', status: 500 };
  }
}