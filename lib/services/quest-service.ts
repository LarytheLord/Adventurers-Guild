import { ServiceResult, CreateQuestBody } from "./types";
import { SessionUser } from "../api-auth";
import { prisma } from "@/lib/db";
import { Prisma, QuestStatus, QuestTrack, QuestCategory, Quest, UserRank } from '@prisma/client';

export async function getQuests(searchParams: URLSearchParams, user: SessionUser | null): Promise<ServiceResult<Quest[]>> {
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');
  const track = searchParams.get('track');
  const companyId = searchParams.get('company_id');
  const rawLimit = parseInt(searchParams.get('limit') || '10', 10);
  const rawOffset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 100);
  const offset = isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search');

  let bootcampLink: { eligibleForRealQuests: boolean } | null = null;
  if (user && user.role === 'adventurer') {
    bootcampLink = await prisma.bootcampLink.findUnique({
      where: { userId: user.id },
      select: { eligibleForRealQuests: true },
    });
  }

  // Build visibility constraints based on role — applied as AND with search/filters below
  let visibilityFilter: Prisma.QuestWhereInput = {};

  if (user) {
    if (user.role === 'company') {
      visibilityFilter = { OR: [{ companyId: user.id }, { status: 'available', track: 'OPEN' }] };
    } else if (user.role === 'admin') {
      // no restriction
    } else if (bootcampLink) {
      // Bootcamp track lock is enforced here and cannot be overridden by query params
      const bootcampBase: Prisma.QuestWhereInput = {
        track: 'BOOTCAMP',
        ...(bootcampLink.eligibleForRealQuests ? {} : { source: 'TUTORIAL' }),
      };
      visibilityFilter = {
        AND: [
          bootcampBase,
          { OR: [{ status: 'available' }, { assignments: { some: { userId: user.id } } }] },
        ],
      };
    } else {
      visibilityFilter = {
        OR: [
          { status: 'available', track: 'OPEN' },
          { assignments: { some: { userId: user.id } } },
        ],
      };
    }
  } else {
    visibilityFilter = { status: 'available', track: 'OPEN' };
  }

  // Build optional filters — AND'd with visibility, never overriding it
  const filterClauses: Prisma.QuestWhereInput[] = [];

  if (status && user?.role !== 'company' && Object.values(QuestStatus).includes(status as QuestStatus)) {
    filterClauses.push({ status: status as QuestStatus });
  }
  if (search) {
    filterClauses.push({ OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]});
  }
  if (category && Object.values(QuestCategory).includes(category as QuestCategory)) {
    filterClauses.push({ questCategory: category as QuestCategory });
  }
  if (difficulty && Object.values(UserRank).includes(difficulty as UserRank)) {
    filterClauses.push({ difficulty: difficulty as UserRank });
  }
  // Bootcamp users cannot override their track lock
  if (track && !bootcampLink && Object.values(QuestTrack).includes(track as QuestTrack)) {
    filterClauses.push({ track: track as QuestTrack });
  }
  if (companyId && user && (user.role === 'admin' || user.id === companyId)) {
    filterClauses.push({ companyId });
  }

  const where: Prisma.QuestWhereInput =
    filterClauses.length > 0
      ? { AND: [visibilityFilter, ...filterClauses] }
      : visibilityFilter;

  const orderBy: Prisma.QuestOrderByWithRelationInput =
    sort === 'xp_desc'      ? { xpReward: 'desc' }
    : sort === 'pay_desc'   ? { monetaryReward: 'desc' }
    : sort === 'deadline_asc' ? { deadline: { sort: 'asc', nulls: 'last' } }
    : { createdAt: 'desc' };

  const quests = await prisma.quest.findMany({
    where,
    include: {
      company: {
        select: {
          name: true,
          // email intentionally omitted — not needed for public quest listing
        },
      },
    },
    orderBy,
    skip: offset,
    take: limit,
  });

  return { data: quests, error: null, status: 200 };
}

export async function createQuest(body: CreateQuestBody, user: SessionUser): Promise<ServiceResult<Quest>> {
  if (user.role !== 'company' && user.role !== 'admin') {
    return { error: 'Forbidden', data: null, status: 403 };
  }

  const {
    title, description, detailedDescription, questType, difficulty,
    xpReward, skillPointsReward, monetaryReward, requiredSkills,
    requiredRank, maxParticipants, questCategory, track, source,
    parentQuestId, deadline,
  } = body;

  if (!title || !description || !questType || !difficulty || !xpReward) {
    return { error: 'Missing required fields', data: null, status: 400 };
  }

  if (deadline && new Date(deadline) < new Date()) {
    return { error: 'Deadline cannot be in the past', data: null, status: 400 };
  }

  const quest = await prisma.quest.create({
    data: {
      title,
      description,
      detailedDescription,
      questType,
      difficulty,
      xpReward,
      skillPointsReward,
      monetaryReward,
      requiredSkills: requiredSkills || [],
      requiredRank,
      maxParticipants,
      questCategory,
      track: track || undefined,
      source: source || undefined,
      parentQuestId: parentQuestId || null,
      companyId: user.id,
      deadline: deadline ? new Date(deadline) : null,
    },
  });

  return { error: null, data: quest, status: 201 };
}
