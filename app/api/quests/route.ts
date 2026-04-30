import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { getQuests, createQuest } from '@/lib/services/quest-service';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const { searchParams } = new URL(request.url);

    const result = await getQuests(searchParams, user);
    if (result.error) {
      return NextResponse.json({ error: result.error, success: false }, { status: result.status });
    }
    return NextResponse.json({ quests: result.data, success: true }, { status: 200 });
  } catch (error) {
    console.error('Error fetching quests:', error);
    return NextResponse.json({ error: 'Failed to fetch quests', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Error creating quest:', error);
    return NextResponse.json({ error: 'Failed to create quest', success: false }, { status: 500 });
  }
}
