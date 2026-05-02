import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

interface SearchResult {
  id: string;
  name: string | null;
  email: string;
  rank: string;
  avatar: string | null;
}

// GET /api/users/search?q=query — search users by name or email
export async function GET(request: NextRequest) {
  const user = await requireAuth(request, 'adventurer', 'admin');
  if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters', success: false },
      { status: 400 }
    );
  }

  try {
    const results = await prisma.user.findMany({
      where: {
        role: 'adventurer',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        rank: true,
        avatar: true,
      },
      take: 10,
    });

    const formattedResults: SearchResult[] = results.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      rank: u.rank,
      avatar: u.avatar,
    }));

    return NextResponse.json({ results: formattedResults, success: true });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Failed to search users', success: false }, { status: 500 });
  }
}
