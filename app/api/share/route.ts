import { prisma, withDbRetry } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { questId, platform } = await req.json();

    if (!questId || !platform) {
      return Response.json({ error: 'Missing questId or platform' }, { status: 400 });
    }

    await withDbRetry(() =>
      prisma.quest.update({
        where: { id: questId },
        data: { shareCount: { increment: 1 } },
      })
    );

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Failed to track share' }, { status: 500 });
  }
}
