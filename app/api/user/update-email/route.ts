import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const updateEmailSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  currentPassword: z.string().min(1, 'Current password is required'),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const { email, currentPassword } = updateEmailSchema.parse(json);
    const normalizedEmail = email.trim().toLowerCase();

    // Fetch user to verify password and check current email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // OAuth users have no password — email change via this endpoint is not supported for them
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Email change is not available for social login accounts. Please contact support.' },
        { status: 400 }
      );
    }

    // Require current password re-verification (security fix for account takeover)
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 403 });
    }

    // Prevent changing to the same email
    if (user.email.toLowerCase() === normalizedEmail) {
      return NextResponse.json({ error: 'New email must be different from current email' }, { status: 400 });
    }

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
