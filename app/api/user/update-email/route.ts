import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateEmailSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const { email } = updateEmailSchema.parse(json);
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already in use by another account' },
        { status: 400 }
      );
    }

    // Update user's email
    await prisma.user.update({
      where: { id: session.user.id },
      data: { email: normalizedEmail },
    });

    return NextResponse.json({ success: true, email: normalizedEmail });
  } catch (error) {
    console.error('Failed to update email:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Something went wrong while updating your email' },
      { status: 500 }
    );
  }
}
