// app/api/teams/members/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Validate team ID or user ID is provided
    if (!teamId && !userId) {
      return Response.json({ error: 'Either Team ID or User ID is required', success: false }, { status: 400 });
    }

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (teamId) {
      where.teamId = teamId;
    }
    if (userId) {
      where.userId = userId;
    }
    if (role) {
      where.role = role;
    }

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
      skip: parseInt(offset),
      take: parseInt(limit),
    });

    return Response.json({ members: data, success: true });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return Response.json({ error: 'Failed to fetch team members', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['teamId', 'userId', 'invitedBy'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    // Check if team exists and if user is allowed to invite members
    const team = await prisma.team.findUnique({
      where: { id: body.teamId },
      select: { ownerUserId: true, maxMembers: true },
    });

    if (!team) {
      return Response.json({ error: 'Team not found', success: false }, { status: 404 });
    }

    // Verify that the inviting user is the team owner or admin
    if (team.ownerUserId !== body.invitedBy) {
      const existingMember = await prisma.teamMember.findFirst({
        where: {
          teamId: body.teamId,
          userId: body.invitedBy,
        },
        select: { role: true },
      });

      if (!existingMember || existingMember.role !== 'admin') {
        return Response.json({ error: 'Only team owners and admins can invite members', success: false }, { status: 403 });
      }
    }

    // Check if team has reached max members
    const count = await prisma.teamMember.count({
      where: {
        teamId: body.teamId,
        isActive: true,
      },
    });

    if (team.maxMembers && count >= team.maxMembers) {
      return Response.json({ error: 'Team has reached maximum members', success: false }, { status: 400 });
    }

    // Check if user is already a member
    const existingMemberCheck = await prisma.teamMember.findFirst({
      where: {
        teamId: body.teamId,
        userId: body.userId,
      },
      select: { id: true },
    });

    if (existingMemberCheck) {
      return Response.json({ error: 'User is already a member of this team', success: false }, { status: 400 });
    }

    // Add the member to the team (default role is 'member')
    const data = await prisma.teamMember.create({
      data: {
        teamId: body.teamId,
        userId: body.userId,
        role: body.role || 'member',
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
    const body = await request.json();
    const { member_id, current_userId, role } = body;

    // Validate required fields
    if (!member_id || !current_userId) {
      return Response.json({ error: 'Member ID and User ID are required', success: false }, { status: 400 });
    }

    // Get the current member record to access teamId
    const currentMember = await prisma.teamMember.findUnique({
      where: { id: member_id },
      select: { teamId: true, userId: true, role: true },
    });

    if (!currentMember) {
      return Response.json({ error: 'Team member not found', success: false }, { status: 404 });
    }

    const teamId = currentMember.teamId;

    // Check if the current user is the team owner or an admin
    const requesterRole = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: current_userId,
      },
      select: { role: true },
    });

    if (!requesterRole || (requesterRole.role !== 'owner' && requesterRole.role !== 'admin')) {
      return Response.json({ error: 'Only team owners and admins can update member roles', success: false }, { status: 403 });
    }

    // Prevent demoting or promoting a team owner
    if (currentMember.role === 'owner') {
      return Response.json({ error: 'Cannot change role of team owner', success: false }, { status: 400 });
    }

    // Prevent a non-owner from changing roles
    if (requesterRole.role !== 'owner' && role === 'owner') {
      return Response.json({ error: 'Only team owners can assign owner role', success: false }, { status: 400 });
    }

    // Update the member role
    const data = await prisma.teamMember.update({
      where: { id: member_id },
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
    const body = await request.json();
    const { member_id, current_userId } = body;

    // Validate required fields
    if (!member_id || !current_userId) {
      return Response.json({ error: 'Member ID and User ID are required', success: false }, { status: 400 });
    }

    // Get the current member record
    const currentMember = await prisma.teamMember.findUnique({
      where: { id: member_id },
      select: { teamId: true, userId: true, role: true },
    });

    if (!currentMember) {
      return Response.json({ error: 'Team member not found', success: false }, { status: 404 });
    }

    const teamId = currentMember.teamId;
    const userIdToRemove = currentMember.userId;

    // Check if the current user is the team owner or an admin
    const requesterRole = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: current_userId,
      },
      select: { role: true },
    });

    if (!requesterRole) {
      return Response.json({ error: 'Requester not found in team', success: false }, { status: 404 });
    }

    // Allow users to remove themselves from a team unless they are the owner
    if (current_userId === userIdToRemove) {
      if (currentMember.role === 'owner') {
        return Response.json({ error: 'Team owner cannot leave the team. Transfer ownership or delete the team.', success: false }, { status: 400 });
      }
    } else if (requesterRole.role !== 'owner' && requesterRole.role !== 'admin') {
      return Response.json({ error: 'Only team owners and admins can remove other members', success: false }, { status: 403 });
    }

    // Remove the member from the team
    await prisma.teamMember.update({
      where: { id: member_id },
      data: { isActive: false },
    });

    return Response.json({ message: 'Team member removed successfully', success: true });
  } catch (error) {
    console.error('Error removing team member:', error);
    return Response.json({ error: 'Failed to remove team member', success: false }, { status: 500 });
  }
}
