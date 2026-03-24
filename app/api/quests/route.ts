// app/api/quests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';
import { Prisma, QuestStatus, QuestCategory, UserRank, QuestTrack } from '@prisma/client';

type QuestSortOption = 'newest' | 'xp_desc' | 'pay_desc' | 'deadline_soon';

export async function GET(request: NextRequest) {
  // Check authentication but don't require it - allow public access to available quests
  const user = await getAuthUser(request);

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const track = searchParams.get('track');
    const search = searchParams.get('search')?.trim();
    const sort = (searchParams.get('sort') as QuestSortOption | null) ?? 'newest';
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

    const filters: Prisma.QuestWhereInput[] = [];

    if (user) {
      if (user.role === 'company') {
        // Companies can see their own quests regardless of status
        filters.push({
          OR: [
            { companyId: user.id },
            { status: 'available' },
          ],
        });
      } else if (user.role === 'admin') {
        // Admins can see all quests - no additional filter needed
      } else if (bootcampLink) {
        // Bootcamp students: ONLY see BOOTCAMP track quests (API-enforced)
        const bootcampVisibility: Prisma.QuestWhereInput = {
          track: 'BOOTCAMP',
          OR: [
            { status: 'available' },
            { assignments: { some: { userId: user.id } } },
          ],
        };
        if (!bootcampLink.eligibleForRealQuests) {
          // Ineligible bootcamp students: only see TUTORIAL source quests
          bootcampVisibility.source = 'TUTORIAL';
        }
        filters.push(bootcampVisibility);
      } else {
        // Regular adventurers: see OPEN quests + their assigned quests
        filters.push({
          OR: [
            { status: 'available', track: 'OPEN' },
            { assignments: { some: { userId: user.id } } },
          ],
        });
      }
    } else {
      // Unauthenticated users: only see OPEN track available quests
      filters.push({ status: 'available', track: 'OPEN' });
    }

    // Add filters on top of role-based visibility.
    if (status && (!user || user.role !== 'company')) {
      filters.push({ status: status as QuestStatus });
    }
    if (category && Object.values(QuestCategory).includes(category as QuestCategory)) {
      filters.push({ questCategory: category as QuestCategory });
    }
    if (difficulty && Object.values(UserRank).includes(difficulty as UserRank)) {
      filters.push({ difficulty: difficulty as UserRank });
    }
    if (track && Object.values(QuestTrack).includes(track as QuestTrack)) {
      filters.push({ track: track as QuestTrack });
    }
    if (companyId && user && (user.role === 'admin' || user.id === companyId)) {
      filters.push({ companyId });
    }
    if (search) {
      filters.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.QuestWhereInput =
      filters.length === 0 ? {} : filters.length === 1 ? filters[0] : { AND: filters };

    const orderBy: Prisma.QuestOrderByWithRelationInput[] =
      sort === 'xp_desc'
        ? [{ xpReward: 'desc' }, { createdAt: 'desc' }]
        : sort === 'pay_desc'
          ? [{ monetaryReward: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }]
          : sort === 'deadline_soon'
            ? [{ deadline: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }]
            : [{ createdAt: 'desc' }];

    const quests = await prisma.quest.findMany({
      where,
      orderBy,
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

    return NextResponse.json({ quests, success: true });
  } catch (error) {
    console.error('Error fetching quests:', error);
    return NextResponse.json({ error: 'Failed to fetch quests', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }
  if (user.role !== 'company' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Only companies and admins can create quests', success: false }, { status: 403 });
  }

  try {
    const body = await request.json();
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
      return NextResponse.json({ error: 'Missing required fields', success: false }, { status: 400 });
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

    return NextResponse.json({ quest, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating quest:', error);
    return NextResponse.json({ error: 'Failed to create quest', success: false }, { status: 500 });
  }
}
