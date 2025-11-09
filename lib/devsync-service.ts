// lib/devsync-service.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

interface DevSyncConnection {
  id: string;
  user_id: string;
  devsync_user_id: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  scopes: string[];
  created_at: string;
  updated_at: string;
}

interface QuestProjectMapping {
  id: string;
  quest_id: string;
  devsync_project_id: string;
  sync_enabled: boolean;
  auto_update_status: boolean;
  created_at: string;
  updated_at: string;
}

interface CollaborationSession {
  id: string;
  devsync_project_id: string;
  quest_id: string;
  session_type: string;
  status: string;
  started_at: string;
  ended_at?: string;
  participants: string[];
  session_metadata: any;
  created_at: string;
  updated_at: string;
}

export class DevSyncService {
  private devsyncApiUrl: string;
  private devsyncApiKey: string;

  constructor() {
    this.devsyncApiUrl = env.NEXT_PUBLIC_DEVSYNC_API_URL || 'https://api.devsync.codes';
    this.devsyncApiKey = env.DEVSYNC_API_KEY || '';
  }

  /**
   * Link a user's DevSync account with their Adventurers Guild account
   */
  async linkAccount(userId: string, devsyncUserId: string, accessToken: string, refreshToken?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('devsync_connections')
        .insert([{
          user_id: userId,
          devsync_user_id: devsyncUserId,
          access_token: accessToken,
          refresh_token: refreshToken,
          scopes: ['projects:read', 'projects:write', 'collaboration:read', 'collaboration:write']
        }]);

      if (error) {
        console.error('Error linking DevSync account:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in linkAccount:', error);
      return false;
    }
  }

  /**
   * Get DevSync connection details for a user
   */
  async getConnection(userId: string): Promise<DevSyncConnection | null> {
    try {
      const { data, error } = await supabase
        .from('devsync_connections')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting DevSync connection:', error);
      return null;
    }
  }

  /**
   * Create a DevSync project from an Adventurers Guild quest
   */
  async createProjectFromQuest(questId: string, userId: string): Promise<{ success: boolean; projectId?: string; error?: string }> {
    try {
      // Get quest details
      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select(`
          id,
          title,
          description,
          detailed_description,
          quest_type,
          difficulty,
          xp_reward,
          skill_points_reward,
          monetary_reward,
          required_skills,
          required_rank,
          max_participants,
          quest_category,
          company_id,
          created_at,
          deadline,
          users!quests_company_id_fkey (
            name,
            email
          )
        `)
        .eq('id', questId)
        .single();

      if (questError || !quest) {
        return { success: false, error: 'Quest not found' };
      }

      // Verify user has permission to create project for this quest
      if (userId !== quest.company_id) {
        return { success: false, error: 'Unauthorized to create project for this quest' };
      }

      // Get assigned adventurers
      const { data: assignments, error: assignmentsError } = await supabase
        .from('quest_assignments')
        .select(`
          user_id,
          users (
            name,
            email
          )
        `)
        .eq('quest_id', questId)
        .neq('status', 'cancelled');

      if (assignmentsError) {
        return { success: false, error: 'Failed to get quest assignments' };
      }

      // Get company's DevSync connection
      const devsyncConnection = await this.getConnection(userId);
      if (!devsyncConnection) {
        return { success: false, error: 'Company not connected to DevSync' };
      }

      // Create project in DevSync
      const response = await fetch(`${this.devsyncApiUrl}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${devsyncConnection.access_token}`,
          'X-API-Key': this.devsyncApiKey
        },
        body: JSON.stringify({
          name: quest.title,
          description: quest.description,
          initial_files: [
            {
              path: 'README.md',
              content: `# ${quest.title}\n\n${quest.description}\n\n## Quest Details\n- Difficulty: ${quest.difficulty}\n- XP Reward: ${quest.xp_reward}\n- Skills Required: ${quest.required_skills?.join(', ') || 'None'}`,
              language: 'markdown'
            }
          ],
          collaborators: [
            {
              user_id: devsyncConnection.devsync_user_id,
              role: 'owner'
            },
            ...assignments.map(assignment => ({
              user_id: assignment.user_id, // This would need to be mapped to DevSync user ID
              role: 'contributor'
            }))
          ],
          metadata: {
            quest_id: questId,
            source_platform: 'adventurers-guild',
            company: quest.users?.[0]?.name,
            difficulty: quest.difficulty,
            xp_reward: quest.xp_reward,
            skill_points_reward: quest.skill_points_reward,
            monetary_reward: quest.monetary_reward,
            required_skills: quest.required_skills
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.message || 'Failed to create project in DevSync' };
      }

      // Store the mapping in our database
      const { error: mappingError } = await supabase
        .from('quest_project_mappings')
        .insert([{
          quest_id: questId,
          devsync_project_id: result.project.id,
          sync_enabled: true,
          auto_update_status: true
        }]);

      if (mappingError) {
        console.error('Error storing project mapping:', mappingError);
        // We still return success as the project was created in DevSync
      }

      return { success: true, projectId: result.project.id };
    } catch (error) {
      console.error('Error creating project from quest:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update quest status based on DevSync project status
   */
  async updateQuestFromProject(projectId: string, status: string, progress: number): Promise<boolean> {
    try {
      // Get the mapping
      const { data: mapping, error: mappingError } = await supabase
        .from('quest_project_mappings')
        .select('quest_id')
        .eq('devsync_project_id', projectId)
        .single();

      if (mappingError || !mapping) {
        console.error('No mapping found for project:', projectId);
        return false;
      }

      // Update the quest status
      const { error: updateError } = await supabase
        .from('quests')
        .update({
          status: this.mapDevSyncStatusToQuestStatus(status),
          updated_at: new Date().toISOString()
        })
        .eq('id', mapping.quest_id);

      if (updateError) {
        console.error('Error updating quest status:', updateError);
        return false;
      }

      // Update assignment progress if needed
      const { error: assignmentError } = await supabase
        .from('quest_assignments')
        .update({
          progress: progress,
          updated_at: new Date().toISOString()
        })
        .eq('quest_id', mapping.quest_id);

      if (assignmentError) {
        console.error('Error updating assignment progress:', assignmentError);
        // Don't return false as the main quest update was successful
      }

      return true;
    } catch (error) {
      console.error('Error updating quest from project:', error);
      return false;
    }
  }

  /**
   * Map DevSync status to quest status
   */
  private mapDevSyncStatusToQuestStatus(devsyncStatus: string): string {
    switch (devsyncStatus.toLowerCase()) {
      case 'active':
      case 'in_progress':
        return 'in_progress';
      case 'review':
      case 'needs_review':
        return 'review';
      case 'completed':
      case 'done':
        return 'completed';
      case 'cancelled':
      case 'archived':
        return 'cancelled';
      default:
        return 'available'; // Default to available
    }
  }

  /**
   * Get project activity feed from DevSync
   */
  async getProjectActivity(projectId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    try {
      const connection = await this.getConnectionForProject(projectId);
      if (!connection) {
        console.error('No connection found for project:', projectId);
        return [];
      }

      const response = await fetch(`${this.devsyncApiUrl}/api/projects/${projectId}/activity?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
          'X-API-Key': this.devsyncApiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch activity: ${response.statusText}`);
      }

      const result = await response.json();
      return result.activities || [];
    } catch (error) {
      console.error('Error getting project activity:', error);
      return [];
    }
  }

  /**
   * Get connection for a specific project
   */
  private async getConnectionForProject(projectId: string): Promise<DevSyncConnection | null> {
    try {
      const { data: mapping, error: mappingError } = await supabase
        .from('quest_project_mappings')
        .select('quest_id')
        .eq('devsync_project_id', projectId)
        .single();

      if (mappingError || !mapping) {
        return null;
      }

      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select('company_id')
        .eq('id', mapping.quest_id)
        .single();

      if (questError || !quest) {
        return null;
      }

      return this.getConnection(quest.company_id);
    } catch (error) {
      console.error('Error getting connection for project:', error);
      return null;
    }
  }

  /**
   * Start a collaboration session
   */
  async startCollaborationSession(questId: string, userId: string, sessionType: string = 'coding'): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      // Verify user has permission to start session for this quest
      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select('company_id')
        .eq('id', questId)
        .single();

      if (questError || !quest) {
        return { success: false, error: 'Quest not found' };
      }

      // Check if user is company or assigned adventurer
      const isCompany = userId === quest.company_id;
      const isAdventurer = await this.isUserAssignedToQuest(userId, questId);

      if (!isCompany && !isAdventurer) {
        return { success: false, error: 'Unauthorized to start session for this quest' };
      }

      // Get the project mapping
      const { data: mapping, error: mappingError } = await supabase
        .from('quest_project_mappings')
        .select('devsync_project_id')
        .eq('quest_id', questId)
        .single();

      if (mappingError || !mapping) {
        return { success: false, error: 'No DevSync project linked to this quest' };
      }

      // Start session in DevSync
      const connection = await this.getConnection(userId);
      if (!connection) {
        return { success: false, error: 'User not connected to DevSync' };
      }

      const response = await fetch(`${this.devsyncApiUrl}/api/projects/${mapping.devsync_project_id}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${connection.access_token}`,
          'X-API-Key': this.devsyncApiKey
        },
        body: JSON.stringify({
          type: sessionType,
          metadata: {
            quest_id: questId,
            source_platform: 'adventurers-guild'
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.message || 'Failed to start collaboration session in DevSync' };
      }

      // Store session in our database
      const { error: sessionError } = await supabase
        .from('collaboration_sessions')
        .insert([{
          devsync_project_id: mapping.devsync_project_id,
          quest_id: questId,
          session_type: sessionType,
          status: 'active',
          participants: [userId] // Initially just the creator
        }]);

      if (sessionError) {
        console.error('Error storing collaboration session:', sessionError);
      }

      return { success: true, sessionId: result.session.id };
    } catch (error) {
      console.error('Error starting collaboration session:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Check if user is assigned to a quest
   */
  private async isUserAssignedToQuest(userId: string, questId: string): Promise<boolean> {
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
}