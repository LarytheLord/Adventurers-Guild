// app/api/admin/users/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { Prisma, UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth('admin');
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isVerified = searchParams.get('isVerified');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role as UserRole;
    }
    if (isVerified !== null) {
      where.isVerified = isVerified === 'true';
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const data = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        rank: true,
        xp: true,
        skillPoints: true,
        level: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        lastLoginAt: true,
        bio: true,
        location: true,
        website: true,
        discord: true,
        github: true,
        linkedin: true,
        adventurerProfile: {
          select: {
            specialization: true,
            primarySkills: true,
            availabilityStatus: true,
            questCompletionRate: true,
            totalQuestsCompleted: true,
          },
        },
        companyProfile: {
          select: {
            companyName: true,
            companyWebsite: true,
            isVerified: true,
          },
        },
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ users: data, success: true });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth('admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { userId, role, isVerified, isActive } = body;

    // Validate required fields
    if (!userId) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    // Update the user
    const updateData: Prisma.UserUpdateInput = {};
    if (role !== undefined) updateData.role = role;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (isActive !== undefined) updateData.isActive = isActive;

    const data = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return Response.json({ user: data, success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Failed to update user', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await requireAuth('admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    // Validate required field
    if (!userId) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    // Delete the user (in reality, you'd want to de-activate rather than hard delete)
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return Response.json({ message: 'User deactivated successfully', success: true });
  } catch (error) {
    console.error('Error deactivating user:', error);
    return Response.json({ error: 'Failed to deactivate user', success: false }, { status: 500 });
  }
}
