import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    console.log('[reset-password] Request received');

    if (!token || !password) {
      console.log('[reset-password] Missing token or password');
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      console.log('[reset-password] Password too short');
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    console.log('[reset-password] Token received (length:', token.length, ')');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    console.log('[reset-password] Token hash:', tokenHash.substring(0, 16) + '...');

    // Find the token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    console.log('[reset-password] Token lookup result:', !!resetToken);

    if (!resetToken) {
      console.log('[reset-password] Token not found in database');
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    console.log('[reset-password] Token found, checking validity...');

    if (resetToken.usedAt) {
      console.log('[reset-password] Token already used');
      return NextResponse.json({ error: 'This reset token has already been used' }, { status: 400 });
    }

    const now = new Date();
    console.log('[reset-password] Expiration check:', {
      now: now.toISOString(),
      expiresAt: resetToken.expiresAt.toISOString(),
      isExpired: now > resetToken.expiresAt,
    });

    if (now > resetToken.expiresAt) {
      console.log('[reset-password] Token expired');
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

    console.log('[reset-password] Password reset successful for user:', resetToken.userId);
    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('[reset-password] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
