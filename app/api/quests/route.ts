// app/api/quests/submissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { getQuests, createQuest, updateQuest } from '@/lib/services/quest-service';

export async function GET(request: NextRequest) {
  // Check authentication
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }
  // Parse query parameters
  const { searchParams } = new URL(request.url);

  const result = await getQuests(searchParams, user);
  if (result.error) {
    return NextResponse.json({ error: result.error, success: false }, { status: result.status });
  }
  return NextResponse.json({ quests: result.data, success: true }, { status: 201 });
}

export async function POST(request: NextRequest) {
  // Check authentication
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  const body = await request.json();

  const result = await createQuest(body, user);
  if (result.error) {
    return NextResponse.json({ error: result.error, success: false }, { status: result.status });
  }
  return NextResponse.json({ quest: result.data, success: true }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  // Check authentication
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  const body = await request.json();

  const result = await updateQuest(body, user);
  if (result.error) {
    return NextResponse.json({ error: result.error, success: false }, { status: result.status });
  }
  return NextResponse.json({ submission: result.data, success: true }, { status: 201 });
}
