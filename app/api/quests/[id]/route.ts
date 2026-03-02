import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
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
                xp: true
              }
            }
          }
        }
      },
    });

    if (!quest) {
      return NextResponse.json({ success: false, error: 'Quest not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, quest });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch quest' }, { status: 500 });
  }
}