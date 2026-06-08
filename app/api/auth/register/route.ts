import { NextRequest, NextResponse } from 'next/server';
import { prisma, withDbRetry } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['adventurer', 'company']).default('adventurer'),
  companyName: z.string().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be at most 20 characters').regex(/^[a-z0-9]+$/, 'Username can only contain lowercase letters and numbers').optional(),
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

    const { name, email, password, role, companyName } = result.data;
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

    const user = await withDbRetry(() => prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email: normalizedEmail, passwordHash, role, username },
      });

      if (role === 'company') {
        await tx.companyProfile.create({
          data: {
            userId: newUser.id,
            companyName: companyName!,
          },
        });
      } else {
        await tx.adventurerProfile.create({ data: { userId: newUser.id } });
      }

      return newUser;
    }));

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}