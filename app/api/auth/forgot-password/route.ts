import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/mail';
import { createHash, randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    console.log('[forgot-password] Request received for email:', normalizedEmail);

    if (!normalizedEmail) {
      console.log('[forgot-password] No email provided');
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    console.log('[forgot-password] User found:', !!user);

    // Always return success to prevent email enumeration
    if (!user) {
      console.log('[forgot-password] User not found, returning success message anyway');
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    // Generate token
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    console.log('[forgot-password] Generated reset token for user:', user.id);

    // Delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    console.log('[forgot-password] Cleaned up old tokens');

    // Create new token
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token: tokenHash, expiresAt },
    });
    console.log('[forgot-password] Created new reset token in DB');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    console.log('[forgot-password] Reset link:', resetLink);
    console.log('[forgot-password] Attempting to send email to:', normalizedEmail);

    // sendEmail now throws on failure — let the outer catch handle it
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
          <p style="color:#94a3b8;font-size:12px">This link expires in 1 hour. If you didn't request a reset, ignore this email.</p>
          <p style="color:#94a3b8;font-size:11px;word-break:break-all">Or copy this link: ${resetLink}</p>
        </div>
      `,
    });

    console.log('[forgot-password] Email sent successfully!');
    return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error('[forgot-password] ERROR:', error);
    if (error instanceof Error) {
      console.error('[forgot-password] Error message:', error.message);
      console.error('[forgot-password] Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
