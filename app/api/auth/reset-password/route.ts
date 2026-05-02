import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { prisma } from '@/lib/db';
import { resetPasswordSchema } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedBody = resetPasswordSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsedBody.error.flatten() },
        { status: 400 }
      );
    }
    const { token, password } = parsedBody.data;

    const tokenHash = createHash('sha256').update(token).digest('hex');

    // Find the token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    if (resetToken.usedAt) {
      return NextResponse.json({ error: 'This reset token has already been used' }, { status: 400 });
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json({ error: 'Reset token has expired' }, { status: 400 });
    }

    // Hash new password and update
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
