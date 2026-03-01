// app/api/teams/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Validate user ID is provided
    if (!userId) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    // Build where clause for team memberships
    const where: any = {
      userId,
      isActive: true,
    };

    if (search) {
      where.team = {
        name: { contains: search, mode: 'insensitive' },
      };
    }

    // Get teams where user is a member
    const memberships = await prisma.teamMember.findMany({
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
            description: true,
            avatarUrl: true,
            maxMembers: true,
            createdAt: true,
            updatedAt: true,
            isActive: true,
            ownerUserId: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            rank: true,
          },
        },
      },
      skip: parseInt(offset),
      take: parseInt(limit),
    });

    // Transform the data to group members per team
    const teamsWithMembers = memberships.map((item: any) => {
      return {
        id: item.team?.id,
        name: item.team?.name,
        description: item.team?.description,
        avatarUrl: item.team?.avatarUrl,
        maxMembers: item.team?.maxMembers,
        createdAt: item.team?.createdAt,
        updatedAt: item.team?.updatedAt,
        isActive: item.team?.isActive,
        ownerUserId: item.team?.ownerUserId,
        userRole: item.role,
        joinedAt: item.joinedAt,
        members: [] as any[], // We'll populate this in a separate query
      };
    });

    // Get members for each team
    for (const team of teamsWithMembers) {
      const membersData = await prisma.teamMember.findMany({
        where: {
          teamId: team.id,
          isActive: true,
        },
        select: {
          id: true,
          teamId: true,
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
      });

      team.members = membersData.map((member: any) => ({
        id: member.user?.id || '',
        name: member.user?.name || '',
        email: member.user?.email || '',
        rank: member.user?.rank || 'F',
        avatar: member.user?.avatar || '',
        role: member.role,
        joinedAt: member.joinedAt,
      }));
    }

    return Response.json({ teams: teamsWithMembers, success: true });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return Response.json({ error: 'Failed to fetch teams', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'owner_userId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    // Create the team
    const team = await prisma.team.create({
      data: {
        name: body.name,
        description: body.description || null,
        avatarUrl: body.avatarUrl || null,
        maxMembers: body.max_members || 5,
        ownerUserId: body.owner_userId,
      },
    });

    // Add the owner as the first member
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: body.owner_userId,
        role: 'owner',
      },
    });

    // Get the complete team data with members
    const fullTeam = await prisma.team.findUnique({
      where: { id: team.id },
      include: {
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            joinedAt: true,
            isActive: true,
            user: {
              select: {
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

    if (!fullTeam) {
      // Return the basic team data even if we couldn't get members
      return Response.json({ team, success: true }, { status: 201 });
    }

    return Response.json({ team: fullTeam, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return Response.json({ error: 'Failed to create team', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, current_userId, ...updateFields } = body;

    // Validate required fields
    if (!teamId || !current_userId) {
      return Response.json({ error: 'Team ID and User ID are required', success: false }, { status: 400 });
    }

    // Check if the user is the team owner
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { ownerUserId: true },
    });

    if (!team) {
      return Response.json({ error: 'Team not found', success: false }, { status: 404 });
    }

    if (team.ownerUserId !== current_userId) {
      return Response.json({ error: 'Only team owners can update team details', success: false }, { status: 403 });
    }

    // Update the team
    const data = await prisma.team.update({
      where: { id: teamId },
      data: updateFields,
    });

    return Response.json({ team: data, success: true });
  } catch (error) {
    console.error('Error updating team:', error);
    return Response.json({ error: 'Failed to update team', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, current_userId } = body;

    // Validate required fields
    if (!teamId || !current_userId) {
      return Response.json({ error: 'Team ID and User ID are required', success: false }, { status: 400 });
    }

    // Check if the user is the team owner
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { ownerUserId: true },
    });

    if (!team) {
      return Response.json({ error: 'Team not found', success: false }, { status: 404 });
    }

    if (team.ownerUserId !== current_userId) {
      return Response.json({ error: 'Only team owners can delete teams', success: false }, { status: 403 });
    }

    // Delete the team (soft delete by setting isActive to false)
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
