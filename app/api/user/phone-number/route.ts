import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  phoneNumber: z.string().min(10, 'Please enter a valid WhatsApp number'),
});

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'adventurer') {
      return NextResponse.json({ error: 'Only adventurers can update this profile' }, { status: 403 });
    }

    const json = await req.json();
    const data = schema.parse(json);

    await prisma.adventurerProfile.update({
      where: { userId: session.user.id },
      data: {
        phoneNumber: data.phoneNumber,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update phone number:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
