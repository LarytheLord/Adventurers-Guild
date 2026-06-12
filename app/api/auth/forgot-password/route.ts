import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/mail';
import { createHash, randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    // Generate token
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    // Send email FIRST — only save the token to DB if email succeeds.
    // This prevents dangling tokens when the mail service is down.
    await sendEmail({
      to: normalizedEmail,
      subject: 'Reset your password — Guild',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="font-size:20px;font-weight:700;color:#0f172a">Reset your password</h2>
          <p style="color:#475569;font-size:14px">You requested a password reset for your Guild account.</p>
          <a href="${resetLink}" style="display:inline-block;margin:20px 0;padding:12px 24px;background:#f97316;color:#fff;font-weight:700;font-size:14px;border-radius:8px;text-decoration:none">
            Reset password
          </a>
          <p style="color:#94a3b8;font-size:12px">This link expires in 24 hours. If you didn't request a reset, ignore this email.</p>
          <p style="color:#94a3b8;font-size:11px;word-break:break-all">Or copy this link: ${resetLink}</p>
        </div>
      `,
    });

    // Email sent — now persist the token
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token: tokenHash, expiresAt },
    });

    return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error('[forgot-password] ERROR:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
