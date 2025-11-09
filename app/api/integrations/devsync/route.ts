import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import { DevSyncService } from '@/lib/devsync-service';

// Initialize Supabase client
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

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
    const questId = searchParams.get('quest_id');

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
  const { devsync_user_id, access_token, refresh_token } = params;

  if (!devsync_user_id || !access_token) {
    return Response.json({ error: 'Missing required parameters', success: false }, { status: 400 });
  }

  const success = await devsyncService.linkAccount(userId, devsync_user_id, access_token, refresh_token);

  if (success) {
    return Response.json({ success: true });
  } else {
    return Response.json({ error: 'Failed to link account', success: false }, { status: 500 });
  }
}

async function handleCreateProject(userId: string, params: any) {
  const { quest_id } = params;

  if (!quest_id) {
    return Response.json({ error: 'Missing quest_id', success: false }, { status: 400 });
  }

  // Verify user has permission to create project for this quest
  const { data: quest, error: questError } = await supabase
    .from('quests')
    .select('company_id')
    .eq('id', quest_id)
    .single();

  if (questError || !quest) {
    return Response.json({ error: 'Quest not found', success: false }, { status: 404 });
  }

  if (userId !== quest.company_id) {
    return Response.json({ error: 'Unauthorized to create project for this quest', success: false }, { status: 403 });
  }

  const result = await devsyncService.createProjectFromQuest(quest_id, userId);

  if (result.success) {
    return Response.json({ success: true, project_id: result.projectId });
  } else {
    return Response.json({ error: result.error, success: false }, { status: 500 });
  }
}

async function handleStartSession(userId: string, params: any) {
  const { quest_id, session_type } = params;

  if (!quest_id) {
    return Response.json({ error: 'Missing quest_id', success: false }, { status: 400 });
  }

  const result = await devsyncService.startCollaborationSession(quest_id, userId, session_type);

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
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select(`
        id,
        title,
        status,
        users!quests_company_id_fkey (
          id
        )
      `)
      .eq('id', questId)
      .single();

    if (questError || !quest) {
      return Response.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    // Verify user has permission to access this quest
    const isCompany = userId === quest.users?.[0]?.id;
    const isAdventurer = await checkUserAssignedToQuest(userId, questId);

    if (!isCompany && !isAdventurer) {
      return Response.json({ error: 'Unauthorized to access quest', success: false }, { status: 403 });
    }

    // Get project mapping
    const { data: mapping, error: mappingError } = await supabase
      .from('quest_project_mappings')
      .select('devsync_project_id')
      .eq('quest_id', questId)
      .single();

    if (mappingError || !mapping) {
      return Response.json({ error: 'No DevSync project linked to this quest', success: false }, { status: 404 });
    }

    // Get project activity from DevSync
    const activity = await devsyncService.getProjectActivity(mapping.devsync_project_id);

    return Response.json({ 
      success: true, 
      project_id: mapping.devsync_project_id,
      quest: quest,
      activity: activity
    });
  } catch (error) {
    console.error('Error getting project status:', error);
    return Response.json({ error: 'Failed to get project status', success: false }, { status: 500 });
  }
}

async function checkUserAssignedToQuest(userId: string, questId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('quest_assignments')
      .select('id')
      .eq('user_id', userId)
      .eq('quest_id', questId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking quest assignment:', error);
    return false;
  }
}