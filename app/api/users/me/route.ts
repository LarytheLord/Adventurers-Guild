// app/api/users/me/route.ts
import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { profilePatchSchema } from '@/lib/validation/schemas';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        bio: true,
        location: true,
        website: true,
        github: true,
        linkedin: true,
        discord: true,
        createdAt: true,
        companyProfile: {
          select: {
            companyName: true,
            companyWebsite: true,
            companyDescription: true,
            industry: true,
            size: true,
            isVerified: true,
            questsPosted: true,
            totalSpent: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found', success: false }, { status: 404 });
    }

    const { companyProfile, ...userData } = user;
    return Response.json({ user: userData, companyProfile, success: true });
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    return Response.json({ error: 'Failed to fetch profile', success: false }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const parsedBody = profilePatchSchema.safeParse(body);
    if (!parsedBody.success) {
      return Response.json(
        { error: 'Validation failed', details: parsedBody.error.flatten(), success: false },
        { status: 400 }
      );
    }
    const payload = parsedBody.data;

    // Build user update payload (only allowed fields)
    const userUpdate: Record<string, string | null> = {};
    if (payload.name !== undefined) userUpdate.name = payload.name ?? null;
    if (typeof payload.username === 'string') {
      const username = payload.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (username.length < 3 || username.length > 30) {
        return Response.json({ error: 'Username must be 3-30 characters (letters, numbers, - _)', success: false }, { status: 400 });
      }
      const taken = await prisma.user.findUnique({ where: { username }, select: { id: true } });
      if (taken && taken.id !== authUser.id) {
        return Response.json({ error: 'Username already taken', success: false }, { status: 409 });
      }
      userUpdate.username = username;
    }
    if (payload.bio !== undefined) userUpdate.bio = payload.bio ?? null;
    if (payload.location !== undefined) userUpdate.location = payload.location ?? null;
    if (payload.website !== undefined) userUpdate.website = payload.website ?? null;
    if (payload.github !== undefined) userUpdate.github = payload.github ?? null;
    if (payload.linkedin !== undefined) userUpdate.linkedin = payload.linkedin ?? null;
    if (payload.discord !== undefined) userUpdate.discord = payload.discord ?? null;

    // If company role, also update company profile fields
    const canUpdateCompanyProfile =
      authUser.role === 'company' &&
      (payload.companyName !== undefined || payload.companyWebsite !== undefined || payload.companyDescription !== undefined);

    if (Object.keys(userUpdate).length === 0 && !canUpdateCompanyProfile) {
      return Response.json({ error: 'No valid fields to update', success: false }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: userUpdate,
      select: { id: true, name: true, username: true, email: true, bio: true, location: true, website: true, github: true, linkedin: true, discord: true },
    });

    // If company role, also update company profile fields
    if (canUpdateCompanyProfile) {
      const profileUpdate: Record<string, string | null> = {};
      if (payload.companyName !== undefined) {
        const companyName = payload.companyName ?? '';
        if (!companyName) {
          return Response.json({ error: 'Company name cannot be empty', success: false }, { status: 400 });
        }
        profileUpdate.companyName = companyName;
      }
      if (payload.companyWebsite !== undefined) profileUpdate.companyWebsite = payload.companyWebsite ?? null;
      if (payload.companyDescription !== undefined) profileUpdate.companyDescription = payload.companyDescription ?? null;

      if (Object.keys(profileUpdate).length > 0) {
        await prisma.companyProfile.update({
          where: { userId: authUser.id },
          data: profileUpdate,
        });
      }
    }

    return Response.json({ user: updated, success: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return Response.json({ error: 'Failed to update profile', success: false }, { status: 500 });
  }
}
