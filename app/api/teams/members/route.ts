import { TeamRole } from '@prisma/client';
import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

const MAX_LIMIT = 50;
const TEAM_ROLES: TeamRole[] = ['owner', 'admin', 'member'];

function toSafeInt(rawValue: string | null, fallback: number, min = 0, max = MAX_LIMIT) {
  const parsed = Number.parseInt(rawValue ?? '', 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function parseTeamRole(value: unknown): TeamRole | null {
  if (typeof value !== 'string') return null;
  return TEAM_ROLES.includes(value as TeamRole) ? (value as TeamRole) : null;
}

async function getRequesterTeamRole(teamId: string, userId: string, ownerUserId?: string | null) {
  if (ownerUserId && ownerUserId === userId) {
    return 'owner' as TeamRole;
  }

  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId,
      isActive: true,
    },
    select: { role: true },
  });

  return membership?.role ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const limit = toSafeInt(searchParams.get('limit'), 10, 1, MAX_LIMIT);
    const offset = toSafeInt(searchParams.get('offset'), 0, 0, 10000);

    if (!teamId && !userId) {
      return Response.json(
        { error: 'Either Team ID or User ID is required', success: false },
        { status: 400 }
      );
    }

    if (userId && authUser.role !== 'admin' && userId !== authUser.id) {
      return Response.json({ error: 'Forbidden', success: false }, { status: 403 });
    }

    if (teamId && authUser.role !== 'admin') {
      const requesterRole = await getRequesterTeamRole(teamId, authUser.id);
      if (!requesterRole) {
        return Response.json({ error: 'Forbidden', success: false }, { status: 403 });
      }
    }

    const parsedRole = role ? parseTeamRole(role) : null;
    if (role && !parsedRole) {
      return Response.json({ error: 'Invalid role filter', success: false }, { status: 400 });
    }

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (teamId) where.teamId = teamId;
    if (userId) where.userId = userId;
    if (parsedRole) where.role = parsedRole;

    const data = await prisma.teamMember.findMany({
      where,
      select: {
        id: true,
        teamId: true,
        userId: true,
        role: true,
        joinedAt: true,
        isActive: true,
        team: {
          select: {
            id: true,
            name: true,
            ownerUserId: true,
          },
        },
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
      skip: offset,
      take: limit,
      orderBy: { joinedAt: 'desc' },
    });

    return Response.json({ members: data, success: true });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return Response.json({ error: 'Failed to fetch team members', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const teamId = typeof body.teamId === 'string' ? body.teamId : '';
    const requestedUserId = typeof body.userId === 'string' ? body.userId : '';
    const inviteEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const requestedRole = parseTeamRole(body.role) ?? 'member';

    if (!teamId) {
      return Response.json({ error: 'teamId is required', success: false }, { status: 400 });
    }
    if (!requestedUserId && !inviteEmail) {
      return Response.json(
        { error: 'Either userId or email is required', success: false },
        { status: 400 }
      );
    }
    if (requestedRole === 'owner') {
      return Response.json(
        { error: 'Assigning owner role is not supported via this endpoint', success: false },
        { status: 400 }
      );
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { ownerUserId: true, maxMembers: true, isActive: true },
    });

    if (!team || !team.isActive) {
      return Response.json({ error: 'Team not found', success: false }, { status: 404 });
    }

    if (authUser.role !== 'admin') {
      const requesterRole = await getRequesterTeamRole(teamId, authUser.id, team.ownerUserId);
      if (!requesterRole || (requesterRole !== 'owner' && requesterRole !== 'admin')) {
        return Response.json(
          { error: 'Only team owners and admins can invite members', success: false },
          { status: 403 }
        );
      }
    }

    let targetUserId = requestedUserId;
    if (!targetUserId && inviteEmail) {
      const invitedUser = await prisma.user.findUnique({
        where: { email: inviteEmail },
        select: { id: true },
      });
      if (!invitedUser) {
        return Response.json({ error: 'No user found with this email', success: false }, { status: 404 });
      }
      targetUserId = invitedUser.id;
    }

    const activeMemberCount = await prisma.teamMember.count({
      where: {
        teamId,
        isActive: true,
      },
    });

    if (team.maxMembers && activeMemberCount >= team.maxMembers) {
      return Response.json(
        { error: 'Team has reached maximum members', success: false },
        { status: 400 }
      );
    }

    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: targetUserId,
      },
      select: { id: true, isActive: true },
    });

    if (existingMembership?.isActive) {
      return Response.json(
        { error: 'User is already a member of this team', success: false },
        { status: 400 }
      );
    }

    const data = existingMembership
      ? await prisma.teamMember.update({
          where: { id: existingMembership.id },
          data: { isActive: true, role: requestedRole },
        })
      : await prisma.teamMember.create({
          data: {
            teamId,
            userId: targetUserId,
            role: requestedRole,
          },
        });

    return Response.json({ member: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error adding team member:', error);
    return Response.json({ error: 'Failed to add team member', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const memberId = typeof body.member_id === 'string' ? body.member_id : '';
    const role = parseTeamRole(body.role);

    if (!memberId || !role) {
      return Response.json(
        { error: 'Member ID and valid role are required', success: false },
        { status: 400 }
      );
    }
    if (role === 'owner') {
      return Response.json(
        { error: 'Use ownership transfer flow to assign owner role', success: false },
        { status: 400 }
      );
    }

    const currentMember = await prisma.teamMember.findUnique({
      where: { id: memberId },
      select: { teamId: true, userId: true, role: true, isActive: true },
    });

    if (!currentMember || !currentMember.isActive) {
      return Response.json({ error: 'Team member not found', success: false }, { status: 404 });
    }

    const team = await prisma.team.findUnique({
      where: { id: currentMember.teamId },
      select: { ownerUserId: true },
    });
    if (!team) {
      return Response.json({ error: 'Team not found', success: false }, { status: 404 });
    }

    if (authUser.role !== 'admin') {
      const requesterRole = await getRequesterTeamRole(currentMember.teamId, authUser.id, team.ownerUserId);
      if (!requesterRole || (requesterRole !== 'owner' && requesterRole !== 'admin')) {
        return Response.json(
          { error: 'Only team owners and admins can update member roles', success: false },
          { status: 403 }
        );
      }
    }

    if (currentMember.role === 'owner') {
      return Response.json(
        { error: 'Cannot change role of team owner', success: false },
        { status: 400 }
      );
    }

    const data = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role },
    });

    return Response.json({ member: data, success: true });
  } catch (error) {
    console.error('Error updating team member:', error);
    return Response.json({ error: 'Failed to update team member', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const memberId = typeof body.member_id === 'string' ? body.member_id : '';

    if (!memberId) {
      return Response.json({ error: 'Member ID is required', success: false }, { status: 400 });
    }

    const currentMember = await prisma.teamMember.findUnique({
      where: { id: memberId },
      select: { id: true, teamId: true, userId: true, role: true, isActive: true },
    });

    if (!currentMember || !currentMember.isActive) {
      return Response.json({ error: 'Team member not found', success: false }, { status: 404 });
    }

    const team = await prisma.team.findUnique({
      where: { id: currentMember.teamId },
      select: { ownerUserId: true },
    });
    if (!team) {
      return Response.json({ error: 'Team not found', success: false }, { status: 404 });
    }

    const isSelfRemoval = authUser.id === currentMember.userId;
    const requesterRole =
      authUser.role === 'admin'
        ? 'owner'
        : await getRequesterTeamRole(currentMember.teamId, authUser.id, team.ownerUserId);

    if (!requesterRole) {
      return Response.json({ error: 'Requester not found in team', success: false }, { status: 404 });
    }

    if (isSelfRemoval) {
      if (currentMember.role === 'owner') {
        return Response.json(
          {
            error: 'Team owner cannot leave the team. Transfer ownership or delete the team.',
            success: false,
          },
          { status: 400 }
        );
      }
    } else if (requesterRole !== 'owner' && requesterRole !== 'admin') {
      return Response.json(
        { error: 'Only team owners and admins can remove other members', success: false },
        { status: 403 }
      );
    }

    await prisma.teamMember.update({
      where: { id: memberId },
      data: { isActive: false },
    });

    return Response.json({ message: 'Team member removed successfully', success: true });
  } catch (error) {
    console.error('Error removing team member:', error);
    return Response.json({ error: 'Failed to remove team member', success: false }, { status: 500 });
  }
}
