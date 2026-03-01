// lib/devsync-service.ts
import { prisma } from './db';

interface DevSyncConnection {
  id: string;
  userId: string;
  devsyncUserId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  scopes: string[];
  createdAt: string;
  updatedAt: string;
}

export class DevSyncService {
  private devsyncApiUrl: string;
  private devsyncApiKey: string;

  constructor() {
    this.devsyncApiUrl = process.env.NEXT_PUBLIC_DEVSYNC_API_URL || 'https://api.devsync.codes';
    this.devsyncApiKey = process.env.DEVSYNC_API_KEY || '';
  }

  async linkAccount(userId: string, devsyncUserId: string, accessToken: string, _refreshToken?: string): Promise<boolean> {
    // DevSync tables are not yet in Prisma schema — placeholder
    console.log('DevSync linkAccount called for user:', userId, devsyncUserId, accessToken);
    return true;
  }

  async getConnection(_userId: string): Promise<DevSyncConnection | null> {
    // DevSync tables are not yet in Prisma schema — placeholder
    return null;
  }

  async createProjectFromQuest(questId: string, userId: string): Promise<{ success: boolean; projectId?: string; error?: string }> {
    try {
      const quest = await prisma.quest.findUnique({
        where: { id: questId },
        include: { company: { select: { name: true, email: true } } },
      });

      if (!quest) return { success: false, error: 'Quest not found' };
      if (userId !== quest.companyId) return { success: false, error: 'Unauthorized' };

      const assignments = await prisma.questAssignment.findMany({
        where: { questId, status: { not: 'cancelled' } },
        include: { user: { select: { name: true, email: true } } },
      });

      const connection = await this.getConnection(userId);
      if (!connection) return { success: false, error: 'Company not connected to DevSync' };

      const response = await fetch(`${this.devsyncApiUrl}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${connection.accessToken}`,
          'X-API-Key': this.devsyncApiKey,
        },
        body: JSON.stringify({
          name: quest.title,
          description: quest.description,
          collaborators: assignments.map((a) => ({ userId: a.userId, role: 'contributor' })),
          metadata: { questId: questId, source_platform: 'adventurers-guild' },
        }),
      });

      const result = await response.json();
      if (!response.ok) return { success: false, error: result.message || 'Failed to create project' };

      return { success: true, projectId: result.project.id };
    } catch (error) {
      console.error('Error creating project from quest:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateQuestFromProject(projectId: string, status: string, progress: number): Promise<boolean> {
    // DevSync tables not in Prisma schema — placeholder
    console.log('updateQuestFromProject called:', projectId, status, progress);
    return false;
  }

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
        return 'available';
    }
  }

  async getProjectActivity(_projectId: string, _limit: number = 50, _offset: number = 0): Promise<any[]> {
    return [];
  }

  async startCollaborationSession(questId: string, userId: string, _sessionType: string = 'coding'): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: { companyId: true },
    });

    if (!quest) return { success: false, error: 'Quest not found' };

    const isCompany = userId === quest.companyId;
    const isAdventurer = await this.isUserAssignedToQuest(userId, questId);

    if (!isCompany && !isAdventurer) return { success: false, error: 'Unauthorized' };

    return { success: false, error: 'DevSync integration not fully configured' };
  }

  private async isUserAssignedToQuest(userId: string, questId: string): Promise<boolean> {
    const assignment = await prisma.questAssignment.findFirst({
      where: { userId, questId },
      select: { id: true },
    });
    return !!assignment;
  }
}
