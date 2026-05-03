import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

// GET /api/users/me/bootcamp — check if user is bootcamp enrolled
export async function GET(request: NextRequest) {
  const user = await requireAuth(request, 'adventurer');
  if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });

  try {
    const bootcampLink = await prisma.bootcampLink.findUnique({
      where: { userId: user.id },
      select: { id: true, bootcampTrack: true, enrolledAt: true },
    });

    return NextResponse.json({
      isBootcamp: !!bootcampLink,
      bootcampTrack: bootcampLink?.bootcampTrack ?? null,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching bootcamp status:', error);
    return NextResponse.json({ error: 'Failed to fetch bootcamp status', success: false }, { status: 500 });
  }
}
