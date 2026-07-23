import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Rate limiting store (in-memory for simplicity, could use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const requestEmailChangeSchema = z.object({
  newEmail: z.string().email('Please provide a valid email address'),
  currentPassword: z.string().min(1, 'Current password is required'),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate limiting: max 3 requests per hour per user
    const now = Date.now();
    const userRateLimit = rateLimitStore.get(userId);
    
    if (userRateLimit && userRateLimit.resetTime > now) {
      if (userRateLimit.count >= 3) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
      rateLimitStore.set(userId, { ...userRateLimit, count: userRateLimit.count + 1 });
    } else {
      // Reset or create rate limit (1 hour)
      rateLimitStore.set(userId, { count: 1, resetTime: now + 60 * 60 * 1000 });
    }

    const json = await req.json();
    const { newEmail, currentPassword } = requestEmailChangeSchema.parse(json);
    const normalizedNewEmail = newEmail.trim().toLowerCase();

    // Fetch user to verify password and get current email
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    if (user.email.toLowerCase() === normalizedNewEmail) {
      return NextResponse.json({ error: 'New email must be different from current email' }, { status: 400 });
    }

    // Check if new email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedNewEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already in use by another account' },
        { status: 400 }
      );
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create email change request
    const emailChangeRequest = await prisma.emailChangeRequest.create({
      data: {
        userId,
        newEmail: normalizedNewEmail,
        token,
        expiresAt,
        status: 'pending',
      },
    });

    // TODO: Send verification email to OLD email address
    // In production, this would integrate with an email service like SendGrid, Resend, etc.
    const verificationLink = `${process.env.NEXTAUTH_URL}/api/user/confirm-email-change?token=${token}`;
    
    console.log(`Email change verification link for user ${userId}: ${verificationLink}`);
    console.log(`Email should be sent to OLD email: ${user.email}`);
    console.log(`New email requested: ${normalizedNewEmail}`);

    // For development/testing purposes, return the verification link
    // In production, remove this and only return success message
    return NextResponse.json({ 
      success: true, 
      message: 'Verification email sent to your current email address.',
      verificationLink: process.env.NODE_ENV === 'development' ? verificationLink : undefined
    });

  } catch (error) {
    console.error('Failed to request email change:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Something went wrong while processing your request' },
      { status: 500 }
    );
  }
}