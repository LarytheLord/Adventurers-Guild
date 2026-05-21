import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { questId, source } = body;

    if (!questId) {
      return NextResponse.json({ error: 'Missing questId', success: false }, { status: 400 });
    }

    const validSources = ['twitter', 'linkedin', 'reddit', 'copy', 'other'];
    const shareSource = source && validSources.includes(source) ? source : 'other';

    const quest = await prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) {
      return NextResponse.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    await prisma.quest.update({
      where: { id: questId },
      data: { shareCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      shareCount: quest.shareCount + 1,
    });
  } catch (error) {
    console.error('Error tracking share:', error);
    return NextResponse.json({ error: 'Failed to track share', success: false }, { status: 500 });
  }
}
