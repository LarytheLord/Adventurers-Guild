// app/api/quests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';
import { Prisma, QuestStatus, QuestCategory, UserRank, QuestTrack } from '@prisma/client';
import { createQuest, getQuests } from '@/lib/services/quest-service';

export async function GET(request: NextRequest) {
  // Check authentication but don't require it - allow public access to available quests
  const user = await getAuthUser(request);
  const { searchParams } = new URL(request.url);
  const result = await getQuests(searchParams, user);
  if (result.error) {
    return NextResponse.json({ error: result.error, success: false }, { status: result.status });
  }
  return NextResponse.json({ quests: result.data, success: true }, { status: 200 });
}

export async function POST(request: NextRequest) {
  // Check authentication
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }
  if (user.role !== 'company' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Only companies and admins can create quests', success: false }, { status: 403 });
  }

    const body = await request.json();
    const result = await createQuest(body, user);
    if (result.error) {
      return NextResponse.json({ error: result.error, success: false }, { status: result.status });
    }
    return NextResponse.json({ quest: result.data, success: true }, { status: 201 });
  
}
