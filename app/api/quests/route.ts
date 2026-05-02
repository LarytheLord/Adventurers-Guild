import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { getQuests, createQuest } from '@/lib/services/quest-service';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const { searchParams } = new URL(request.url);

    const result = await getQuests(searchParams, user);
    if (result.error) {
      return NextResponse.json({ error: result.error, success: false }, { status: result.status });
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
        party: {
          select: {
            id: true,
            leaderId: true,
            track: true,
            maxSize: true,
            members: {
              select: {
                id: true,
                userId: true,
                isLeader: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    rank: true,
                    avatar: true,
                  },
                },
              },
              orderBy: {
                joinedAt: 'asc',
              },
            },
          },
        },
      },
      orderBy,
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
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const result = await createQuest(body, user);
    if (result.error) {
      return NextResponse.json({ error: result.error, success: false }, { status: result.status });
    }
    return NextResponse.json({ quest: result.data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating quest:', error);
    return NextResponse.json({ error: 'Failed to create quest', success: false }, { status: 500 });
  }
}
