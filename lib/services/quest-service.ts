import { ServiceResult } from "./types";
import { SessionUser } from "../api-auth";
import { prisma } from "@/lib/db";
import { Prisma, QuestStatus, QuestTrack, QuestCategory, Quest, UserRank } from '@prisma/client';
import { CreateQuestBody } from './types';

async function getQuests(searchParams: URLSearchParams, user: SessionUser | null): Promise<ServiceResult<Quest[]>> {
    // Parse query parameters
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const track = searchParams.get('track');
    const companyId = searchParams.get('company_id');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

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

// async function updateQuest() {

// }



export {
	getQuests,
	createQuest,
	// updateQuest
}