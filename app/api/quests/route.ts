import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';
import { getQuests } from '@/lib/services/quest-service';

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
