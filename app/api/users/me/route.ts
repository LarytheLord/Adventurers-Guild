// app/api/users/me/route.ts
import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();

    // Build user update payload (only allowed fields)
    const userUpdate: Record<string, string | null> = {};
    if (typeof body.name === 'string') userUpdate.name = body.name.trim() || null;
    if (typeof body.bio === 'string') userUpdate.bio = body.bio.trim() || null;
    if (typeof body.location === 'string') userUpdate.location = body.location.trim() || null;
    if (typeof body.website === 'string') userUpdate.website = body.website.trim() || null;
    if (typeof body.github === 'string') userUpdate.github = body.github.trim() || null;
    if (typeof body.linkedin === 'string') userUpdate.linkedin = body.linkedin.trim() || null;
    if (typeof body.discord === 'string') userUpdate.discord = body.discord.trim() || null;

    if (Object.keys(userUpdate).length === 0) {
      return Response.json({ error: 'No valid fields to update', success: false }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: userUpdate,
      select: { id: true, name: true, email: true, bio: true, location: true, website: true, github: true, linkedin: true, discord: true },
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

    return Response.json({ user: updated, success: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return Response.json({ error: 'Failed to update profile', success: false }, { status: 500 });
  }
}
