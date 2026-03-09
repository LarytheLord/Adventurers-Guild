import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const user = await getAuthUser(req);

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
          },
        },
      },
    });

    if (!quest) {
      return NextResponse.json({ success: false, error: 'Quest not found' }, { status: 404 });
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
