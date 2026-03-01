import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DevSyncService } from '@/lib/devsync-service';

const devsyncService = new DevSyncService();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'link_account':
        return handleLinkAccount(session.user.id, params);
      case 'create_project':
        return handleCreateProject(session.user.id, params);
      case 'start_session':
        return handleStartSession(session.user.id, params);
      case 'sync_quest_status':
        return handleSyncQuestStatus(params);
      default:
        return Response.json({ error: 'Invalid action', success: false }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in DevSync API:', error);
    return Response.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const questId = searchParams.get('questId');

    if (action === 'project_status' && questId) {
      return handleGetProjectStatus(session.user.id, questId);
    }

    return Response.json({ error: 'Invalid action or missing parameters', success: false }, { status: 400 });
  } catch (error) {
    console.error('Error in DevSync GET API:', error);
    return Response.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}

async function handleLinkAccount(userId: string, params: any) {
  const { devsync_userId, access_token, refresh_token } = params;

  if (!devsync_userId || !access_token) {
    return Response.json({ error: 'Missing required parameters', success: false }, { status: 400 });
  }

  const success = await devsyncService.linkAccount(userId, devsync_userId, access_token, refresh_token);

  if (success) {
    return Response.json({ success: true });
  } else {
    return Response.json({ error: 'Failed to link account', success: false }, { status: 500 });
  }
}

async function handleCreateProject(userId: string, params: any) {
  const { questId } = params;

  if (!questId) {
    return Response.json({ error: 'Missing questId', success: false }, { status: 400 });
  }

  // Verify user has permission to create project for this quest
  const quest = await prisma.quest.findUnique({
    where: { id: questId },
    select: { companyId: true },
  });

  if (!quest) {
    return Response.json({ error: 'Quest not found', success: false }, { status: 404 });
  }

  if (userId !== quest.companyId) {
    return Response.json({ error: 'Unauthorized to create project for this quest', success: false }, { status: 403 });
  }

  const result = await devsyncService.createProjectFromQuest(questId, userId);

  if (result.success) {
    return Response.json({ success: true, project_id: result.projectId });
  } else {
    return Response.json({ error: result.error, success: false }, { status: 500 });
  }
}

async function handleStartSession(userId: string, params: any) {
  const { questId, session_type } = params;

  if (!questId) {
    return Response.json({ error: 'Missing questId', success: false }, { status: 400 });
  }

  const result = await devsyncService.startCollaborationSession(questId, userId, session_type);

  if (result.success) {
    return Response.json({ success: true, session_id: result.sessionId });
  } else {
    return Response.json({ error: result.error, success: false }, { status: 500 });
  }
}

async function handleSyncQuestStatus(params: any) {
  const { project_id, status, progress } = params;

  if (!project_id || !status) {
    return Response.json({ error: 'Missing required parameters', success: false }, { status: 400 });
  }

  const success = await devsyncService.updateQuestFromProject(project_id, status, progress || 0);

  if (success) {
    return Response.json({ success: true });
  } else {
    return Response.json({ error: 'Failed to sync quest status', success: false }, { status: 500 });
  }
}

async function handleGetProjectStatus(userId: string, questId: string) {
  try {
    // Check if user has access to this quest
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: {
        id: true,
        title: true,
        status: true,
        companyId: true,
      },
    });

    if (!quest) {
      return Response.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    // Verify user has permission to access this quest
    const isCompany = userId === quest.companyId;
    const isAdventurer = await checkUserAssignedToQuest(userId, questId);

    if (!isCompany && !isAdventurer) {
      return Response.json({ error: 'Unauthorized to access quest', success: false }, { status: 403 });
    }

    // DevSync project mappings not yet implemented in Prisma schema
    // TODO: Add DevSyncProjectMapping model to schema when DevSync integration is ready
    return Response.json({ error: 'No DevSync project linked to this quest', success: false }, { status: 404 });
  } catch (error) {
    console.error('Error getting project status:', error);
    return Response.json({ error: 'Failed to get project status', success: false }, { status: 500 });
  }
}

async function checkUserAssignedToQuest(userId: string, questId: string): Promise<boolean> {
  try {
    const assignment = await prisma.questAssignment.findFirst({
      where: {
        userId: userId,
        questId: questId,
      },
      select: { id: true },
    });

    return !!assignment;
  } catch (error) {
    console.error('Error checking quest assignment:', error);
    return false;
  }
}
