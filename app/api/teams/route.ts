import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

const MAX_LIMIT = 50;

function toSafeInt(rawValue: string | null, fallback: number, min = 0, max = MAX_LIMIT) {
  const parsed = Number.parseInt(rawValue ?? '', 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function clampMembers(raw: unknown) {
  if (typeof raw !== 'number') return 5;
  const normalized = Math.trunc(raw);
  return Math.min(Math.max(normalized, 2), 20);
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const search = searchParams.get('search')?.trim();
    const limit = toSafeInt(searchParams.get('limit'), 10, 1, MAX_LIMIT);
    const offset = toSafeInt(searchParams.get('offset'), 0, 0, 10000);

    if (requestedUserId && authUser.role !== 'admin' && requestedUserId !== authUser.id) {
      return Response.json({ error: 'Forbidden', success: false }, { status: 403 });
    }

    const targetUserId =
      authUser.role === 'admin' && requestedUserId ? requestedUserId : authUser.id;

    const memberships = await prisma.teamMember.findMany({
      where: {
        userId: targetUserId,
        isActive: true,
        team: {
          isActive: true,
          ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
        },
      },
      select: {
        role: true,
        joinedAt: true,
        team: {
          select: {
            id: true,
            name: true,
            description: true,
            avatarUrl: true,
            maxMembers: true,
            createdAt: true,
            updatedAt: true,
            isActive: true,
            ownerUserId: true,
            members: {
              where: { isActive: true },
              select: {
                id: true,
                userId: true,
                role: true,
                joinedAt: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    rank: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: { joinedAt: 'desc' },
    });

    const teams = memberships.map((membership) => ({
      id: membership.team.id,
      name: membership.team.name,
      description: membership.team.description,
      avatarUrl: membership.team.avatarUrl,
      maxMembers: membership.team.maxMembers,
      createdAt: membership.team.createdAt,
      updatedAt: membership.team.updatedAt,
      isActive: membership.team.isActive,
      ownerUserId: membership.team.ownerUserId,
      userRole: membership.role,
      joinedAt: membership.joinedAt,
      members: membership.team.members.map((member) => ({
        id: member.user.id,
        membershipId: member.id,
        userId: member.userId,
        name: member.user.name ?? '',
        email: member.user.email,
        rank: member.user.rank,
        avatar: member.user.avatar ?? '',
        role: member.role,
        joinedAt: member.joinedAt,
      })),
    }));

    return Response.json({ teams, success: true });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return Response.json({ error: 'Failed to fetch teams', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!name) {
      return Response.json({ error: 'name is required', success: false }, { status: 400 });
    }

    const ownerUserId =
      authUser.role === 'admin' && typeof body.owner_userId === 'string'
        ? body.owner_userId
        : authUser.id;

    const team = await prisma.team.create({
      data: {
        name,
        description: typeof body.description === 'string' ? body.description : null,
        avatarUrl: typeof body.avatarUrl === 'string' ? body.avatarUrl : null,
        maxMembers: clampMembers(body.max_members),
        ownerUserId,
      },
    });

    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: ownerUserId,
        role: 'owner',
      },
    });

    const fullTeam = await prisma.team.findUnique({
      where: { id: team.id },
      include: {
        members: {
          where: { isActive: true },
          select: {
            id: true,
            userId: true,
            role: true,
            joinedAt: true,
            isActive: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                rank: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return Response.json({ team: fullTeam ?? team, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return Response.json({ error: 'Failed to create team', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const teamId = typeof body.teamId === 'string' ? body.teamId : '';
    if (!teamId) {
      return Response.json({ error: 'Team ID is required', success: false }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { ownerUserId: true, isActive: true },
    });

    if (!team || !team.isActive) {
      return Response.json({ error: 'Team not found', success: false }, { status: 404 });
    }

    if (authUser.role !== 'admin' && team.ownerUserId !== authUser.id) {
      return Response.json(
        { error: 'Only team owners can update team details', success: false },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (typeof body.name === 'string' && body.name.trim()) {
      updateData.name = body.name.trim();
    }
    if (body.description === null || typeof body.description === 'string') {
      updateData.description = body.description;
    }
    if (body.avatarUrl === null || typeof body.avatarUrl === 'string') {
      updateData.avatarUrl = body.avatarUrl;
    }
    if (typeof body.max_members === 'number') {
      updateData.maxMembers = clampMembers(body.max_members);
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: 'No valid fields to update', success: false }, { status: 400 });
    }

    const data = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
    });

    return Response.json({ team: data, success: true });
  } catch (error) {
    console.error('Error updating team:', error);
    return Response.json({ error: 'Failed to update team', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const teamId = typeof body.teamId === 'string' ? body.teamId : '';
    if (!teamId) {
      return Response.json({ error: 'Team ID is required', success: false }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { ownerUserId: true, isActive: true },
    });

    if (!team || !team.isActive) {
      return Response.json({ error: 'Team not found', success: false }, { status: 404 });
    }

    if (authUser.role !== 'admin' && team.ownerUserId !== authUser.id) {
      return Response.json(
        { error: 'Only team owners can delete teams', success: false },
        { status: 403 }
      );
    }

    await prisma.team.update({
      where: { id: teamId },
      data: { isActive: false },
    });

    return Response.json({ message: 'Team deleted successfully', success: true });
  } catch (error) {
    console.error('Error deleting team:', error);
    return Response.json({ error: 'Failed to delete team', success: false }, { status: 500 });
  }
}
