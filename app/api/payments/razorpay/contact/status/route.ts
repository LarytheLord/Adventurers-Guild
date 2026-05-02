import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adventurer = await prisma.adventurerProfile.findFirst({
      where: { user: { email: session.user.email } },
      select: { razorpayFundAccountId: true },
    });

    return NextResponse.json({
      hasFundAccount: !!adventurer?.razorpayFundAccountId,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}