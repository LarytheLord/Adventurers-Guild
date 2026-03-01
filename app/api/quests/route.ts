// app/api/quests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  // Check authentication but don't require it - allow public access to available quests
  const session = await getServerSession(authOptions);

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const companyId = searchParams.get('company_id');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause based on permissions
    const where: any = {};

    if (session && session.user) {
      if (session.user.role === 'company') {
        // Companies can see their own quests regardless of status
        where.OR = [
          { companyId: session.user.id },
          { status: 'available' },
        ];
      } else if (session.user.role === 'admin') {
        // Admins can see all quests - no additional filter needed
      } else {
        // Adventurers can see available quests and their assigned quests
        where.OR = [
          { status: 'available' },
          { assignments: { some: { userId: session.user.id } } },
        ];
      }
    } else {
      // Unauthenticated users can only see available quests
      where.status = 'available';
    }

    // Add filters if provided
    if (status && (!session || !session.user || session.user.role !== 'company')) {
      where.status = status;
    }
    if (category) {
      where.questCategory = category;
    }
    if (difficulty) {
      where.difficulty = difficulty;
    }
    if (companyId && session && session.user && (session.user.role === 'admin' || session.user.id === companyId)) {
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

    return NextResponse.json({ quests, success: true });
  } catch (error) {
    console.error('Error fetching quests:', error);
    return NextResponse.json({ error: 'Failed to fetch quests', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  // Only companies and admins can create quests
  if (session.user.role !== 'company' && session.user.role !== 'admin') {
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
        companyId: session.user.id,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json({ quest, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating quest:', error);
    return NextResponse.json({ error: 'Failed to create quest', success: false }, { status: 500 });
  }
}
