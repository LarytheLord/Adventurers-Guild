// app/api/users/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        location: true,
        website: true,
        github: true,
        linkedin: true,
        discord: true,
        role: true,
        createdAt: true,
        companyProfile: {
          select: {
            companyName: true,
            companyWebsite: true,
            companyDescription: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found', success: false }, { status: 404 });
    }

    return NextResponse.json({ user, success: true });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile', success: false }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();

    // Build user update payload (only allowed fields)
    const userUpdate: Record<string, string | null> = {};
    if (typeof body.name === 'string') userUpdate.name = body.name.trim() || null;
    if (typeof body.username === 'string') {
      const username = body.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (username.length < 3 || username.length > 30) {
        return NextResponse.json({ error: 'Username must be 3-30 characters (letters, numbers, - _)', success: false }, { status: 400 });
      }
      const taken = await prisma.user.findUnique({ where: { username }, select: { id: true } });
      if (taken && taken.id !== authUser.id) {
        return NextResponse.json({ error: 'Username already taken', success: false }, { status: 409 });
      }
      userUpdate.username = username;
    }
    if (typeof body.bio === 'string') userUpdate.bio = body.bio.trim() || null;
    if (typeof body.location === 'string') userUpdate.location = body.location.trim() || null;
    if (typeof body.website === 'string') userUpdate.website = body.website.trim() || null;
    if (typeof body.github === 'string') userUpdate.github = body.github.trim() || null;
    if (typeof body.linkedin === 'string') userUpdate.linkedin = body.linkedin.trim() || null;
    if (typeof body.discord === 'string') userUpdate.discord = body.discord.trim() || null;

    if (Object.keys(userUpdate).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update', success: false }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: userUpdate,
      select: { id: true, name: true, username: true, email: true, bio: true, location: true, website: true, github: true, linkedin: true, discord: true },
    });

    // If company role, also update company profile fields
    if ((authUser.role === 'company') && (body.companyName || body.companyWebsite || body.companyDescription)) {
      const profileUpdate: Record<string, string | null> = {};
      if (typeof body.companyName === 'string') profileUpdate.companyName = body.companyName.trim();
      if (typeof body.companyWebsite === 'string') profileUpdate.companyWebsite = body.companyWebsite.trim() || null;
      if (typeof body.companyDescription === 'string') profileUpdate.companyDescription = body.companyDescription.trim() || null;

      if (Object.keys(profileUpdate).length > 0) {
        await prisma.companyProfile.update({
          where: { userId: authUser.id },
          data: profileUpdate,
        });
      }
    }

    return NextResponse.json({ user: updated, success: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile', success: false }, { status: 500 });
  }
}
