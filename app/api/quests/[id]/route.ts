import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const quest = await prisma.quest.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    // Transform to match previous response shape (company data was under "users" key)
    const transformedQuest = {
      ...quest,
      users: quest.company || { name: '', email: '' },
    };

    return NextResponse.json({ quest: transformedQuest, quests: [transformedQuest], success: true });
  } catch (error) {
    console.error('Error fetching quest:', error);
    return NextResponse.json({ error: 'Failed to fetch quest', success: false }, { status: 500 });
  }
}
