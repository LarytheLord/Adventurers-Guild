import { NextRequest, NextResponse } from 'next/server';
import { prisma, withDbRetry } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const VALID_BOOTCAMP_TRACKS = ['animal_advocacy', 'climate_action', 'ai_safety', 'hybrid', 'beginner'] as const;

interface OnboardPayload {
  bootcampStudentId: string;
  name: string;
  email: string;
  cohort?: string;
  bootcampTrack: (typeof VALID_BOOTCAMP_TRACKS)[number];
  bootcampWeek?: number;
  webhookSecret?: string; // legacy: allow secret in body
  initialPassword?: string; // optional: provided by bootcamp system for initial login
}

function readBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function POST(request: NextRequest) {
  try {
    const body: OnboardPayload = await request.json();

    // 1. Validate webhook secret (Authorization: Bearer ... OR body.webhookSecret)
    const expectedSecret = process.env.BOOTCAMP_WEBHOOK_SECRET;
    const providedSecret = readBearerToken(request) ?? body.webhookSecret ?? null;
    const safeEqual = (a: string, b: string) =>
      a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    if (!expectedSecret || !providedSecret || !safeEqual(providedSecret, expectedSecret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate required fields
    if (!body.bootcampStudentId || !body.name || !body.email || !body.bootcampTrack) {
      return NextResponse.json(
        { error: 'Missing required fields: bootcampStudentId, name, email, bootcampTrack' },
        { status: 400 }
      );
    }

    const normalizedEmail = body.email.trim().toLowerCase();

    // Validate bootcamp track
    if (!VALID_BOOTCAMP_TRACKS.includes(body.bootcampTrack)) {
      return NextResponse.json({ error: `Invalid bootcampTrack. Must be one of: ${VALID_BOOTCAMP_TRACKS.join(', ')}` }, { status: 400 });
    }

    // Validate bootcamp week
    const bootcampWeek = body.bootcampWeek ?? 1;
    if (bootcampWeek < 1 || bootcampWeek > 10) {
      return NextResponse.json({ error: 'bootcampWeek must be between 1 and 10' }, { status: 400 });
    }

    // 3. Check for existing BootcampLink — idempotent update if same student
    const existingLink = await withDbRetry(() =>
      prisma.bootcampLink.findUnique({
        where: { bootcampStudentId: body.bootcampStudentId },
        include: { user: { select: { id: true, email: true } } },
      })
    );

    if (existingLink) {
      // Same student re-enrolling: update bootcampWeek (idempotent)
      if (existingLink.user.email !== normalizedEmail) {
        return NextResponse.json(
          { error: 'Student ID already linked to a different email' },
          { status: 409 }
        );
      }

      await withDbRetry(() =>
        prisma.bootcampLink.update({
          where: { bootcampStudentId: body.bootcampStudentId },
          data: { bootcampWeek },
        })
      );

      return NextResponse.json({
        success: true,
        adventurerId: existingLink.userId,
        rank: 'F',
        message: 'Existing enrollment updated',
      });
    }

    // 4. Check if email is already registered (non-bootcamp user)
    const existingUser = await withDbRetry(() =>
      prisma.user.findUnique({ where: { email: normalizedEmail } })
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered. Contact support to link bootcamp enrollment.' },
        { status: 409 }
      );
    }

    // 5. Create User + AdventurerProfile + BootcampLink in transaction
    const passwordPlaintext =
      typeof body.initialPassword === 'string' && body.initialPassword.trim().length >= 8
        ? body.initialPassword.trim()
        : crypto.randomBytes(16).toString('hex');
    const passwordHash = await bcrypt.hash(passwordPlaintext, 12);

    const user = await withDbRetry(() =>
      prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: body.name.trim(),
            email: normalizedEmail,
            passwordHash,
            username: body.name.trim().toLowerCase().replace(/\s+/g, '-'),
            role: 'adventurer',
            rank: 'F',
          },
        });

        await tx.adventurerProfile.create({
          data: { userId: newUser.id },
        });

        await tx.bootcampLink.create({
          data: {
            userId: newUser.id,
            bootcampStudentId: body.bootcampStudentId,
            cohort: body.cohort?.trim() || null,
            bootcampTrack: body.bootcampTrack,
            bootcampWeek,
            eligibleForRealQuests: false,
          },
        });

        return newUser;
      })
    );

    const shouldReturnPassword = process.env.BOOTCAMP_ONBOARD_RETURN_PASSWORD === 'true';

    return NextResponse.json(
      {
        success: true,
        adventurerId: user.id,
        rank: 'F',
        ...(shouldReturnPassword ? { initialPassword: passwordPlaintext } : {}),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Onboard webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
