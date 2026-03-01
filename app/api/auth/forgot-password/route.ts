import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/mail';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    // Generate token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // Create new token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'Reset Your Password - The Adventurers Guild',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 1 hour.</p>`,
    });

    // Log the token in development for testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset token for ${email}: ${token}`);
      console.log(`Reset link: ${resetLink}`);
    }

    return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
