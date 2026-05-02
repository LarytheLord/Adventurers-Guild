import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/mail';
import { createHash, randomBytes } from 'crypto';
import { forgotPasswordSchema } from '@/lib/validation/schemas';
import { consumeRateLimit } from '@/lib/rate-limit';

const FORGOT_PASSWORD_WINDOW_MS = 15 * 60 * 1000;
const FORGOT_PASSWORD_MAX_REQUESTS = 5;
const GENERIC_SUCCESS_MESSAGE = 'If an account exists, a reset link has been sent.';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedBody = forgotPasswordSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    const normalizedEmail = parsedBody.data.email.trim().toLowerCase();

    const rateLimit = consumeRateLimit('forgot-password', normalizedEmail, {
      windowMs: FORGOT_PASSWORD_WINDOW_MS,
      maxRequests: FORGOT_PASSWORD_MAX_REQUESTS,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many reset attempts. Please wait before trying again.' },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
    }

    // Generate token
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // Create new token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt,
      },
    });

    const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    await sendEmail({
      to: normalizedEmail,
      subject: 'Reset Your Password - The Adventurers Guild',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 1 hour.</p>`,
    });

    return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
