import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    const quest = await prisma.quest.findUnique({
      where: { id: params.id },
      select: { companyId: true },
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    if (user.role !== 'admin' && quest.companyId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const requestedLimit = Number.parseInt(searchParams.get('limit') ?? '20', 10);
    const limit = Number.isNaN(requestedLimit) ? 20 : Math.min(Math.max(requestedLimit, 1), 100);

    const events = await prisma.questWorkflowEvent.findMany({
      where: { questId: params.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ events, success: true });
  } catch (error) {
    console.error('Error fetching quest workflow events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quest workflow events', success: false },
      { status: 500 }
    );
  }
}
