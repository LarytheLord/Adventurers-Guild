import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const user = await getAuthUser(req);

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(params.id)) {
    return NextResponse.json({ success: false, error: 'Quest not found' }, { status: 404 });
  }

  try {
    const quest = await prisma.quest.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
        parentQuest: {
          select: {
            id: true,
            title: true,
            track: true,
            difficulty: true,
            status: true,
          },
        },
        subQuests: {
          select: {
            id: true,
            title: true,
            track: true,
            difficulty: true,
            status: true,
            source: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                rank: true,
                xp: true,
                email: true,
              },
            },
            submissions: {
              select: {
                id: true,
                status: true,
                submissionContent: true,
                submissionNotes: true,
              },
              orderBy: { submittedAt: 'desc' },
              take: 1,
            },
          },
        },
        party: {
          include: {
            leader: { select: { id: true, name: true, rank: true } },
            members: {
              include: { user: { select: { id: true, name: true, rank: true } } },
              orderBy: { joinedAt: 'asc' },
            },
          },
        },
      },
    });

    if (!quest) {
      return NextResponse.json({ success: false, error: 'Quest not found' }, { status: 404 });
    }

    // Track enforcement: bootcamp students cannot access non-BOOTCAMP quests
    if (user && user.role === 'adventurer') {
      const bootcampLink = await prisma.bootcampLink.findUnique({
        where: { userId: user.id },
        select: { eligibleForRealQuests: true },
      });
      if (bootcampLink) {
        if (quest.track !== 'BOOTCAMP') {
          return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }
        if (!bootcampLink.eligibleForRealQuests && quest.source !== 'TUTORIAL') {
          return NextResponse.json({ success: false, error: 'Complete tutorial quests first' }, { status: 403 });
        }
      }
    }

    const isAdmin = user?.role === 'admin';
    const isOwner =
      user?.role === 'company' &&
      !!quest.companyId &&
      user.id === quest.companyId;
    const userId = user?.id;

    const assignments =
      isAdmin || isOwner
        ? quest.assignments
        : userId
          ? quest.assignments.filter((assignment) => assignment.userId === userId)
          : [];

    const sanitizedCompany = isAdmin || isOwner
      ? quest.company
      : quest.company
        ? {
            id: quest.company.id,
            name: quest.company.name,
            avatar: quest.company.avatar,
          }
        : null;

    const normalizedQuest = {
      ...quest,
      company: sanitizedCompany,
      assignments,
    };

    return NextResponse.json({
      success: true,
      quest: normalizedQuest,
      quests: [normalizedQuest],
    });
  } catch (error) {
    console.error('Error fetching quest:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch quest' }, { status: 500 });
  }
}
