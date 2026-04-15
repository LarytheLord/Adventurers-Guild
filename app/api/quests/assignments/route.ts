// app/api/quests/assignments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AssignmentStatus, Prisma } from '@prisma/client';
import { syncQuestLifecycleStatus } from '@/lib/quest-lifecycle';
import { getAuthUser } from '@/lib/api-auth';
import { logActivity } from '@/lib/activity-logger';
import { applyToQuest, getAssignments, updateAssignment } from '@/lib/services/assignment-service';

export async function GET(request: NextRequest) {
  // Check authentication
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }
  // Parse query parameters
  const { searchParams } = new URL(request.url);

  // Build where clause based on permissions
  const result = await getAssignments(searchParams, user);
  if (result.error) {
    return NextResponse.json({ error: result.error, success: false }, { status: result.status });
  }
  return NextResponse.json({ assignments: result.data, success: true });
}

export async function POST(request: NextRequest) {
  // Check authentication
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  if (user.role !== 'adventurer' && user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Only adventurers can apply to quests', success: false },
      { status: 403 }
    );
  }
  const body = await request.json();
  const { questId } = body;
  const result = await applyToQuest(questId, user);
  if (result.error) {
    return NextResponse.json({ error: result.error, success: false }, { status: result.status });
  }
  return NextResponse.json({ assignment: result.data, success: true }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  // Check authentication
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }
  const body = await request.json();
  const result = await updateAssignment(body, user);
  if (result.error) {
    return NextResponse.json({ error: result.error, success: false }, { status: result.status });
  }
  return NextResponse.json({ assignment: result.data, success: true });

}
