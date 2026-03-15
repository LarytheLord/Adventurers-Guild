import { NextRequest } from 'next/server';
import { prisma, withDbRetry } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const VALID_BOOTCAMP_TRACKS = ['animal_advocacy', 'climate_action', 'ai_safety', 'hybrid'] as const;

interface OnboardPayload {
  bootcampStudentId: string;
  name: string;
  email: string;
  bootcampTrack: (typeof VALID_BOOTCAMP_TRACKS)[number];
  bootcampWeek: number;
  webhookSecret: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: OnboardPayload = await request.json();

    // 1. Validate webhook secret
    const expectedSecret = process.env.BOOTCAMP_WEBHOOK_SECRET;
    if (!expectedSecret || body.webhookSecret !== expectedSecret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate required fields
    if (!body.bootcampStudentId || !body.name || !body.email || !body.bootcampTrack) {
      return Response.json({ error: 'Missing required fields: bootcampStudentId, name, email, bootcampTrack' }, { status: 400 });
    }

    const normalizedEmail = body.email.trim().toLowerCase();

    // Validate bootcamp track
    if (!VALID_BOOTCAMP_TRACKS.includes(body.bootcampTrack)) {
      return Response.json({ error: `Invalid bootcampTrack. Must be one of: ${VALID_BOOTCAMP_TRACKS.join(', ')}` }, { status: 400 });
    }

    // Validate bootcamp week
    const bootcampWeek = body.bootcampWeek ?? 1;
    if (bootcampWeek < 1 || bootcampWeek > 10) {
      return Response.json({ error: 'bootcampWeek must be between 1 and 10' }, { status: 400 });
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
        return Response.json(
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

      return Response.json({
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
      return Response.json(
        { error: 'Email already registered. Contact support to link bootcamp enrollment.' },
        { status: 409 }
      );
    }

    // 5. Create User + AdventurerProfile + BootcampLink in transaction
    const generatedPassword = crypto.randomBytes(16).toString('hex');
    const passwordHash = await bcrypt.hash(generatedPassword, 12);

    const user = await withDbRetry(() =>
      prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: body.name.trim(),
            email: normalizedEmail,
            passwordHash,
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
            bootcampTrack: body.bootcampTrack,
            bootcampWeek,
            eligibleForRealQuests: false,
          },
        });

        return newUser;
      })
    );

    return Response.json(
      {
        success: true,
        adventurerId: user.id,
        rank: 'F',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Onboard webhook error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
