import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, companyName } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const validRoles = ['adventurer', 'company'];
    const userRole = validRoles.includes(role) ? role : 'adventurer';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user + profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: userRole,
          rank: 'F',
          xp: 0,
          skillPoints: 0,
          level: 1,
        },
      });

      // Create role-specific profile
      if (userRole === 'company') {
        await tx.companyProfile.create({
          data: {
            userId: newUser.id,
            companyName: companyName || name,
            isVerified: false,
          },
        });
      } else {
        await tx.adventurerProfile.create({
          data: {
            userId: newUser.id,
            availabilityStatus: 'available',
            questCompletionRate: 0,
            totalQuestsCompleted: 0,
            currentStreak: 0,
            maxStreak: 0,
          },
        });
      }

      return newUser;
    });

    return NextResponse.json({
      message: 'Registration successful',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
