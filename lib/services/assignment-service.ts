import { ServiceResult } from "./types.js";
import { prisma } from '@/lib/db';
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';
import { logActivity } from '@/lib/activity-logger';
import { SessionUser } from "../api-auth.js";
import { Prisma, AssignmentStatus } from '@prisma/client';

export async function applyToQuest(questId: any, user: SessionUser): Promise<ServiceResult<any>> {
  // Validate required fields
  try {
    if (!questId) {
      return { data: null, error: 'Missing required fields', status: 400 };
    }
    if (!user.id) {
      return { data: null, error: 'Missing required fields', status: 400 };
    }

    // Check if the quest exists and is available
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: { status: true, maxParticipants: true, title: true, track: true },
    });

    if (!quest || quest.status !== 'available') {
      return { data: null, error: 'Quest not available', status: 400 };
    }

    // Task 1.4: Bootcamp tutorial gating
    // Bootcamp-linked users who haven't completed tutorials can only apply to tutorial quests
    if (user.role === 'adventurer') {
      const bootcampLink = await prisma.bootcampLink.findUnique({
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

    // Check if the max number of accepted participants has been reached.
    // Only count adventurers the company has accepted (started or beyond),
    // matching the same statuses used in quest-lifecycle.ts to keep a slot "filled".
    if (quest.maxParticipants) {
      const count = await prisma.questAssignment.count({
        where: {
          questId: questId,
          status: { in: ['started', 'in_progress', 'submitted', 'pending_admin_review', 'review', 'needs_rework', 'completed'] },
        },
      });

      if (count >= quest.maxParticipants) {
        return { data: null, error: 'Maximum participants reached for this quest', status: 400 };
      }
    }

    // Check if user is already assigned to this quest (ignore cancelled)
    const existingAssignment = await prisma.questAssignment.findFirst({
      where: {
        questId: questId,
        userId: user.id,
        status: { not: 'cancelled' },
      },
    });

    if (existingAssignment) {
      return { data: null, error: 'You are already assigned to this quest', status: 400 };
    }

    // Create the assignment
    const assignment = await prisma.$transaction(
      async (tx) => {
        const created = await tx.questAssignment.create({
          data: {
            questId: questId,
            userId: user.id,
            status: 'assigned',
          },
        });

        await syncQuestLifecycleStatus(tx, questId);

        // Log activity
        await logActivity(user.id, 'quest_apply', { questId }, tx);

        return created;
      },
      { maxWait: 10_000, timeout: 20_000 }
    );

    return { data: assignment, error: null, status: 200 };
  } catch (error) {
    console.error('Error applying to quest:', error);
    return { data: null, error: 'Failed to apply to quest', status: 500 };
  }
}

export async function updateAssignment() {
  
}

export async function getAssignments(searchParams: URLSearchParams, user: SessionUser): Promise<ServiceResult<any>> {
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