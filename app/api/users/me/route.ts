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
    
    if (typeof body.name === 'string') {
      if (body.name.length > 100) return NextResponse.json({ error: 'Name cannot exceed 100 characters', success: false }, { status: 400 });
      userUpdate.name = body.name.trim() || null;
    }
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
    if (typeof body.bio === 'string') {
      if (body.bio.length > 500) return NextResponse.json({ error: 'Bio cannot exceed 500 characters', success: false }, { status: 400 });
      userUpdate.bio = body.bio.trim() || null;
    }
    if (typeof body.location === 'string') {
      if (body.location.length > 100) return NextResponse.json({ error: 'Location cannot exceed 100 characters', success: false }, { status: 400 });
      userUpdate.location = body.location.trim() || null;
    }
    if (typeof body.website === 'string') {
      if (body.website.length > 255) return NextResponse.json({ error: 'Website cannot exceed 255 characters', success: false }, { status: 400 });
      userUpdate.website = body.website.trim() || null;
    }
    if (typeof body.github === 'string') {
      if (body.github.length > 255) return NextResponse.json({ error: 'GitHub URL cannot exceed 255 characters', success: false }, { status: 400 });
      userUpdate.github = body.github.trim() || null;
    }
    if (typeof body.linkedin === 'string') {
      if (body.linkedin.length > 255) return NextResponse.json({ error: 'LinkedIn URL cannot exceed 255 characters', success: false }, { status: 400 });
      userUpdate.linkedin = body.linkedin.trim() || null;
    }
    if (typeof body.discord === 'string') {
      if (body.discord.length > 255) return NextResponse.json({ error: 'Discord handle cannot exceed 255 characters', success: false }, { status: 400 });
      userUpdate.discord = body.discord.trim() || null;
    }
    if (typeof body.phone === 'string') {
      if (body.phone.length > 50) return NextResponse.json({ error: 'Phone cannot exceed 50 characters', success: false }, { status: 400 });
      userUpdate.phone = body.phone.trim() || null;
    }

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
      if (typeof body.companyName === 'string') {
        if (body.companyName.length > 100) return NextResponse.json({ error: 'Company Name cannot exceed 100 characters', success: false }, { status: 400 });
        profileUpdate.companyName = body.companyName.trim();
      }
      if (typeof body.companyWebsite === 'string') {
        if (body.companyWebsite.length > 255) return NextResponse.json({ error: 'Company Website cannot exceed 255 characters', success: false }, { status: 400 });
        profileUpdate.companyWebsite = body.companyWebsite.trim() || null;
      }
      if (typeof body.companyDescription === 'string') {
        if (body.companyDescription.length > 500) return NextResponse.json({ error: 'Company Description cannot exceed 500 characters', success: false }, { status: 400 });
        profileUpdate.companyDescription = body.companyDescription.trim() || null;
      }

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
