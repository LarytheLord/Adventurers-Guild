import { NextRequest, NextResponse } from 'next/server';
import { prisma, withDbRetry } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { generateReferralCode, REFEREE_SIGNUP_XP } from '@/lib/referral-utils';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['adventurer', 'company']).default('adventurer'),
  companyName: z.string().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be at most 20 characters').regex(/^[a-z0-9]+$/, 'Username can only contain lowercase letters and numbers').optional(),
  referralCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, role, companyName, referralCode: incomingRefCode } = result.data;
    const normalizedEmail = email.trim().toLowerCase();

    if (role === 'company' && !companyName) {
      return NextResponse.json(
        { error: 'Company name is required for company accounts' },
        { status: 400 }
      );
    }

    const existingUser = await withDbRetry(() =>
      prisma.user.findUnique({ where: { email: normalizedEmail } })
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    if (result.data.username) {
      const existingUsername = await withDbRetry(() =>
        prisma.user.findUnique({ where: { username: result.data.username } })
      );
      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const baseUsername = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20) || 'adventurer';

    let username = result.data.username ?? baseUsername;
    let suffix = 0;

    if (!result.data.username) {
      while (await withDbRetry(() => prisma.user.findUnique({ where: { username } }))) {
        suffix++;
        username = `${baseUsername}${suffix}`;
      }
    }

    // Resolve referrer from the incoming referral code
    let referrerId: string | null = null;
    if (incomingRefCode) {
      const referrer = await withDbRetry(() =>
        prisma.user.findUnique({
          where: { referralCode: incomingRefCode.toUpperCase() },
          select: { id: true },
        })
      );
      referrerId = referrer?.id ?? null;
    }

    // Generate a unique referral code for the new user
    let newReferralCode: string | null = null;
    for (let i = 0; i < 5; i++) {
      const candidate = generateReferralCode(name);
      const taken = await withDbRetry(() =>
        prisma.user.findUnique({ where: { referralCode: candidate }, select: { id: true } })
      );
      if (!taken) { newReferralCode = candidate; break; }
    }

    const user = await withDbRetry(() => prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role,
          username,
          referralCode: newReferralCode,
          referredById: referrerId ?? undefined,
          // Referee XP bonus on signup
          xp: referrerId ? REFEREE_SIGNUP_XP : 0,
        },
      });

      if (role === 'company') {
        await tx.companyProfile.create({
          data: { userId: newUser.id, companyName: companyName! },
        });
      } else {
        await tx.adventurerProfile.create({ data: { userId: newUser.id } });
      }

      return newUser;
    }));

    return NextResponse.json({
      success: true,
      userId: user.id,
      referralBonus: referrerId ? REFEREE_SIGNUP_XP : 0,
    }, { status: 201 });
  } catch (error) {
    // Concurrent signup race: unique constraint on email or username
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}