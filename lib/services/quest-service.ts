import { ServiceResult, updateQuestBody, CreateQuestBody } from "./types";
import { SessionUser } from "../api-auth";
import { prisma } from "@/lib/db";
import { Prisma, QuestStatus, QuestTrack, QuestCategory, Quest, UserRank, QuestSubmission } from '@prisma/client';
import { processQuestPayment } from "../razorpay-payout";
import { AssignmentStatus } from "@prisma/client";
import { syncQuestLifecycleStatus } from "../quest-lifecycle";


async function getQuests(searchParams: URLSearchParams, user: SessionUser | null): Promise<ServiceResult<Quest[]>> {
  // Parse query parameters
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');
  const track = searchParams.get('track');
  const companyId = searchParams.get('company_id');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search');

  // Check if user is a bootcamp student (has BootcampLink)
  let bootcampLink: { eligibleForRealQuests: boolean } | null = null;
  if (user && user.role === 'adventurer') {
    bootcampLink = await prisma.bootcampLink.findUnique({
      where: { userId: user.id },
      select: { eligibleForRealQuests: true },
    });
  }

  // Build where clause based on permissions
  const where: Prisma.QuestWhereInput = {};

  if (user) {
    if (user.role === 'company') {
      // Companies can see their own quests regardless of status
      where.OR = [
        { companyId: user.id },
        { status: 'available' },
      ];
    } else if (user.role === 'admin') {
      // Admins can see all quests - no additional filter needed
    } else if (bootcampLink) {
      // Bootcamp students: ONLY see BOOTCAMP track quests (API-enforced)
      where.track = 'BOOTCAMP';
      if (!bootcampLink.eligibleForRealQuests) {
        // Ineligible bootcamp students: only see TUTORIAL source quests
        where.source = 'TUTORIAL';
      }
      where.OR = [
        { status: 'available' },
        { assignments: { some: { userId: user.id } } },
      ];
    } else {
      // Regular adventurers: see OPEN quests + their assigned quests
      where.OR = [
        { status: 'available', track: 'OPEN' },
        { assignments: { some: { userId: user.id } } },
      ];
    }
  } else {
    // Unauthenticated users: only see OPEN track available quests
    where.status = 'available';
    where.track = 'OPEN';
  }

  // Add filters if provided (track filter overridden for bootcamp users above)
  if (status && (!user || user.role !== 'company')) {
    where.status = status as QuestStatus;
  }

  if (search) {
    where.OR = [
      ...(Array.isArray(where.OR) ? where.OR : []),
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.questCategory = category as QuestCategory;
  }
  if (difficulty) {
    where.difficulty = difficulty as UserRank;
  }
  // Only allow track filter override for admin/company — bootcamp students are locked
  if (track && Object.values(QuestTrack).includes(track as QuestTrack) && !bootcampLink) {
    where.track = track as QuestTrack;
  }
  if (companyId && user && (user.role === 'admin' || user.id === companyId)) {
    where.companyId = companyId;
  }

  const orderBy: Prisma.QuestOrderByWithRelationInput =
    sort === 'xp_desc'
      ? { xpReward: 'desc' }
      : sort === 'pay_desc'
        ? { monetaryReward: 'desc' }
        : sort === 'deadline_asc'
          ? { deadline: { sort: 'asc', nulls: 'last' } }
          : { createdAt: 'desc' };

  const quests = await prisma.quest.findMany({
    where,
    include: {
      company: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy,
    skip: offset,
    take: limit,
  });

  return { data: quests, error: null, status: 200 };
}

async function createQuest(body: CreateQuestBody, user: SessionUser): Promise<ServiceResult<Quest>> {
  const {
    title,
    description,
    detailedDescription,
    questType,
    difficulty,
    xpReward,
    skillPointsReward,
    monetaryReward,
    requiredSkills,
    requiredRank,
    maxParticipants,
    questCategory,
    track,
    source,
    parentQuestId,
    deadline,
  } = body;

  // Validate required fields
  if (!title || !description || !questType || !difficulty || !xpReward) {
    return { error: 'Missing required fields', data: null, status: 400 };
  }

  // Create the quest with the authenticated user as the company
  const quest = await prisma.quest.create({
    data: {
      title,
      description,
      detailedDescription: detailedDescription,
      questType: questType,
      difficulty,
      xpReward: xpReward,
      skillPointsReward: skillPointsReward,
      monetaryReward: monetaryReward,
      requiredSkills: requiredSkills || [],
      requiredRank: requiredRank,
      maxParticipants: maxParticipants,
      questCategory: questCategory,
      track: track || undefined,
      source: source || undefined,
      parentQuestId: parentQuestId || null,
      companyId: user.id,
      deadline: deadline ? new Date(deadline) : null,
    },
  });

  return { error: null, data: quest, status: 201 };
}

export async function updateQuest(body: updateQuestBody, user: SessionUser): Promise<ServiceResult<QuestSubmission>> {
    const { submissionId, status, review_notes, quality_score } = body;
    const reviewerId = user.id; // Use authenticated user's ID

    // Validate required fields
    if (!submissionId || !status) {
      return { data: null, error: 'Missing required fields', status: 400 };
    }

    // Check if the user has permission to update this submission
    // Only admins, or company users for their own quests can review submissions
    // First get the submission
    const submission = await prisma.questSubmission.findUnique({
      where: { id: submissionId },
      select: { id: true, assignmentId: true, status: true },
    });

    if (!submission) {
      return { error: 'Submission not found', data: null, status: 404 };
    }

    // Then get the assignment to check quest details
    const assignmentData = await prisma.questAssignment.findUnique({
      where: { id: submission.assignmentId },
      select: {
        questId: true,
        userId: true,
        quest: {
          select: {
            companyId: true,
            title: true,
          },
        },
      },
    });

    if (!assignmentData) {
      return { error: 'Assignment not found', data: null, status: 404 };
    }

    // Check permissions
    if (user.role !== 'admin' &&
      (user.role !== 'company' || !assignmentData.quest || assignmentData.quest.companyId !== user.id)) {
      return { error: 'Unauthorized to review this submission', data: null, status: 403 };
    }

    const wasAlreadyApproved = submission.status === 'approved';

    const reviewResult = await prisma.$transaction(
      async (tx) => {
        const updatedSubmission = await tx.questSubmission.update({
          where: { id: submissionId },
          data: {
            status,
            reviewNotes: review_notes || undefined,
            qualityScore: quality_score || undefined,
            reviewerId,
            reviewedAt: status !== 'pending' ? new Date() : undefined,
          },
        });

        let newAssignmentStatus: AssignmentStatus | null = null;
        if (status === 'approved') {
          newAssignmentStatus = 'completed';
        } else if (status === 'needs_rework' || status === 'rejected') {
          newAssignmentStatus = 'in_progress';
        }

        if (newAssignmentStatus) {
          await tx.questAssignment.update({
            where: { id: submission.assignmentId },
            data: {
              status: newAssignmentStatus,
              ...(newAssignmentStatus === 'completed' ? { completedAt: new Date() } : {}),
            },
          });
        }

        await syncQuestLifecycleStatus(tx, assignmentData.questId);

        let rewardsPayload: { userId: string; xpReward: number; skillPointsReward: number; questTitle: string } | null = null;
        let paymentInfo: { questId: string; userId: string; track: string; monetaryReward: number } | null = null;

        if (status === 'approved' && !wasAlreadyApproved) {
          const quest = await tx.quest.findUnique({
            where: { id: assignmentData.questId },
            select: {
              xpReward: true,
              skillPointsReward: true,
              track: true,
              monetaryReward: true,
            },
          });

          if (!quest) throw new Error('Quest not found for completion recording');

          await tx.questCompletion.upsert({
            where: {
              questId_userId: {
                questId: assignmentData.questId,
                userId: assignmentData.userId,
              },
            },
            create: {
              questId: assignmentData.questId,
              userId: assignmentData.userId,
              xpEarned: quest.xpReward,
              skillPointsEarned: quest.skillPointsReward,
              qualityScore: quality_score || null,
            },
            update: {
              xpEarned: quest.xpReward,
              skillPointsEarned: quest.skillPointsReward,
              qualityScore: quality_score || null,
            },
          });

          rewardsPayload = {
            userId: assignmentData.userId,
            xpReward: quest.xpReward,
            skillPointsReward: quest.skillPointsReward,
            questTitle: assignmentData.quest?.title ?? '',
          };

          // Prepare payment info for after transaction (only if monetary reward exists)
          if (quest.monetaryReward && quest.track !== 'BOOTCAMP') {
            paymentInfo = {
              questId: assignmentData.questId,
              userId: assignmentData.userId,
              track: quest.track,
              monetaryReward: Number(quest.monetaryReward),
            };
          }
        }

        return { submission: updatedSubmission, rewardsPayload, paymentInfo };
      },
      { maxWait: 10_000, timeout: 20_000 }
    );

    // Process XP and skill points (existing logic)
    if (reviewResult.rewardsPayload) {
      const { updateUserXpAndSkills } = await import('@/lib/xp-utils');
      await updateUserXpAndSkills(
        reviewResult.rewardsPayload.userId,
        reviewResult.rewardsPayload.xpReward,
        reviewResult.rewardsPayload.skillPointsReward,
        assignmentData.questId
      );

      // Task 1.4: Tutorial quest completion tracking for bootcamp students
      const { questTitle, userId: rewardUserId } = reviewResult.rewardsPayload;
      if (questTitle.startsWith('Tutorial:')) {
        const bootcampLink = await prisma.bootcampLink.findUnique({
          where: { userId: rewardUserId },
          select: { tutorialQuest1Complete: true, tutorialQuest2Complete: true },
        });
        if (bootcampLink) {
          const updateData: { tutorialQuest1Complete?: boolean; tutorialQuest2Complete?: boolean; eligibleForRealQuests?: boolean } = {};
          if (questTitle.startsWith('Tutorial: First Blood')) updateData.tutorialQuest1Complete = true;
          if (questTitle.startsWith('Tutorial: Party Up')) updateData.tutorialQuest2Complete = true;
          const tq1 = updateData.tutorialQuest1Complete ?? bootcampLink.tutorialQuest1Complete;
          const tq2 = updateData.tutorialQuest2Complete ?? bootcampLink.tutorialQuest2Complete;
          if (tq1 && tq2) updateData.eligibleForRealQuests = true;
          if (Object.keys(updateData).length > 0) {
            await prisma.bootcampLink.update({ where: { userId: rewardUserId }, data: updateData });
          }
        }
      }
    }

    // Process payment (Razorpay or simulated)
    if (reviewResult.paymentInfo &&
      reviewResult.paymentInfo.track !== 'BOOTCAMP' &&
      reviewResult.paymentInfo.monetaryReward > 0) {
      const paymentResult = await processQuestPayment(
        reviewResult.paymentInfo.questId,
        reviewResult.paymentInfo.userId,
        reviewResult.paymentInfo.monetaryReward,
        'INR'
      );
      if (!paymentResult.success) {
        console.error('Payment failed for quest', reviewResult.paymentInfo.questId, paymentResult.error);
        // Optionally create a notification for admin
      } else {
        console.log('Payment successful', paymentResult);
      }
    }

    return { data: reviewResult.submission, error: null, status: 200 };
}


export {
  getQuests,
  createQuest,
  // updateQuest
}