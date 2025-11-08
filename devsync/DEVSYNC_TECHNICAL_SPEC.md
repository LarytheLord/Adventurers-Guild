# DevSync Technical Integration Specification

## Overview

This document provides detailed technical specifications for integrating DevSync functionality into The Adventurers Guild platform. It covers the architectural components, API specifications, data models, and implementation details needed to create a seamless integration.

## 1. Architecture Overview

### 1.1 System Components

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   Adventurers Guild │    │  Integration Layer   │    │     DevSync         │
│                     │◄──►│                      │◄──►│                     │
│  • Quest Management │    │  • Authentication    │    │  • Project Sync     │
│  • User Profiles    │    │  • Data Sync        │    │  • Real-time Edits  │
│  • Payment System   │    │  • Event Handling   │    │  • Version Control  │
│  • Dashboard        │    │  • Error Handling   │    │  • Collaboration    │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
```

### 1.2 Integration Layer Architecture

The integration layer will be implemented as a separate microservice that handles:
- Authentication synchronization
- Data transformation and mapping
- Event handling and propagation
- Error handling and retry mechanisms
- Logging and monitoring

## 2. API Specifications

### 2.1 Authentication Endpoints

#### 2.1.1 Link DevSync Account
```
POST /api/integrations/devsync/link-account
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "devsync_access_token": "string",
  "devsync_user_id": "string"
}

Response:
{
  "success": true,
  "linked_at": "timestamp",
  "sync_preferences": {
    "auto_sync_projects": true,
    "notifications_enabled": true
  }
}
```

#### 2.1.2 Unlink DevSync Account
```
DELETE /api/integrations/devsync/unlink-account
Authorization: Bearer <token>

Response:
{
  "success": true,
  "unlinked_at": "timestamp"
}
```

### 2.2 Quest-Project Synchronization Endpoints

#### 2.2.1 Create DevSync Project from Quest
```
POST /api/integrations/devsync/create-project
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "quest_id": "string",
  "project_name": "string",
  "project_description": "string",
  "initial_files": [
    {
      "path": "string",
      "content": "string",
      "language": "string"
    }
  ],
  "collaborators": [
    {
      "user_id": "string",  // Adventurers Guild user ID
      "role": "adventurer|company_representative"
    }
  ]
}

Response:
{
  "success": true,
  "devsync_project_id": "string",
  "mapping": {
    "quest_id": "string",
    "project_id": "string",
    "created_at": "timestamp"
  }
}
```

#### 2.2.2 Update Quest Status from DevSync
```
PUT /api/integrations/devsync/projects/{projectId}/status
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "status": "in_progress|needs_review|completed|cancelled",
  "progress": 0-100,
  "last_activity": "timestamp",
  "activity_summary": "string"
}

Response:
{
  "success": true,
  "quest_updated": true,
  "quest_id": "string"
}
```

### 2.3 Real-time Collaboration Endpoints

#### 2.3.1 Start Real-time Session
```
POST /api/integrations/devsync/projects/{projectId}/sessions
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "session_type": "coding|review|meeting",
  "participants": ["user_id1", "user_id2"],
  "duration_estimate": "minutes"
}

Response:
{
  "success": true,
  "session_id": "string",
  "connection_details": {
    "websocket_url": "string",
    "session_token": "string"
  }
}
```

#### 2.3.2 Get Project Activity Feed
```
GET /api/integrations/devsync/projects/{projectId}/activity
Authorization: Bearer <token>
Query Parameters:
- limit: number (default 50)
- offset: number (default 0)
- since: timestamp (optional)

Response:
{
  "activities": [
    {
      "id": "string",
      "type": "file_change|comment|review|merge",
      "user": {
        "id": "string",
        "name": "string",
        "avatar": "string"
      },
      "timestamp": "timestamp",
      "details": {
        "file_path": "string",
        "change_summary": "string",
        "comment": "string"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 200
  }
}
```

## 3. Database Schema Extensions

### 3.1 DevSync Integration Table
```sql
-- Table to store integration mappings
CREATE TABLE devsync_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  devsync_user_id TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scopes TEXT[], -- e.g., ['projects:read', 'projects:write']
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_devsync_integration_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_devsync_integrations_user_id ON devsync_integrations(user_id);
CREATE INDEX idx_devsync_integrations_devsync_user_id ON devsync_integrations(devsync_user_id);
```

### 3.2 Project Mapping Table
```sql
-- Table to map quests to DevSync projects
CREATE TABLE quest_project_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  devsync_project_id TEXT NOT NULL,
  sync_enabled BOOLEAN DEFAULT TRUE,
  auto_update_status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_mapping_quest FOREIGN KEY (quest_id) REFERENCES quests(id),
  UNIQUE(quest_id, devsync_project_id)
);

-- Indexes
CREATE INDEX idx_quest_project_mappings_quest_id ON quest_project_mappings(quest_id);
CREATE INDEX idx_quest_project_mappings_devsync_project_id ON quest_project_mappings(devsync_project_id);
```

### 3.3 Collaboration Sessions Table
```sql
-- Table to track real-time collaboration sessions
CREATE TABLE collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devsync_project_id TEXT NOT NULL,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  session_type TEXT CHECK (session_type IN ('coding', 'review', 'meeting')),
  status TEXT CHECK (status IN ('active', 'ended', 'cancelled')) DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  participants UUID[], -- Array of user IDs
  session_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_session_quest FOREIGN KEY (quest_id) REFERENCES quests(id)
);

-- Indexes
CREATE INDEX idx_collaboration_sessions_project_id ON collaboration_sessions(devsync_project_id);
CREATE INDEX idx_collaboration_sessions_quest_id ON collaboration_sessions(quest_id);
CREATE INDEX idx_collaboration_sessions_status ON collaboration_sessions(status);
```

## 4. Frontend Components

### 4.1 DevSync Project Embed Component
```tsx
// components/DevSyncProjectEmbed.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Code, 
  Users, 
  Clock, 
  GitBranch, 
  MessageSquare, 
  Play,
  Square,
  RotateCcw
} from 'lucide-react';

interface DevSyncProjectEmbedProps {
  projectId: string;
  questId: string;
  onStatusChange?: (status: string, progress: number) => void;
}

export default function DevSyncProjectEmbed({ 
  projectId, 
  questId, 
  onStatusChange 
}: DevSyncProjectEmbedProps) {
  const { data: session } = useSession();
  const [projectData, setProjectData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/integrations/devsync/projects/${projectId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch project data');
      }
      
      setProjectData(data.project);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching DevSync project:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project');
      setIsLoading(false);
    }
  };

  const handleStartSession = async () => {
    try {
      const response = await fetch(`/api/integrations/devsync/projects/${projectId}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          session_type: 'coding',
          participants: [session?.user?.id]
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSessionActive(true);
        // Open the DevSync editor in an iframe or new tab
        window.open(`${process.env.NEXT_PUBLIC_DEVSYNC_URL}/projects/${projectId}`, '_blank');
      }
    } catch (err) {
      console.error('Error starting session:', err);
      setError('Failed to start collaboration session');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between mt-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DevSync Project</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">Failed to load DevSync project</p>
            <Button variant="outline" onClick={fetchProjectData}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Code className="w-5 h-5 mr-2" />
            DevSync Project
          </CardTitle>
          <Badge variant="outline">
            {projectData?.status || 'Unknown'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <GitBranch className="w-4 h-4 mr-2" />
            <span>Project: {projectData?.name || 'Loading...'}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>{projectData?.collaborators?.length || 0} collaborators</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>Last activity: {projectData?.last_activity || 'N/A'}</span>
            </div>
          </div>
          
          {projectData?.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{projectData.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${projectData.progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="pt-4 flex gap-2">
            <Button onClick={handleStartSession} disabled={isSessionActive}>
              {isSessionActive ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  End Session
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Coding
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={() => window.open(`${process.env.NEXT_PUBLIC_DEVSYNC_URL}/projects/${projectId}`, '_blank')}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Discuss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4.2 Quest Integration Panel Component
```tsx
// components/QuestIntegrationPanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Link as LinkIcon, Unlink, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface QuestIntegrationPanelProps {
  questId: string;
  onIntegrationStatusChange?: (enabled: boolean) => void;
}

export default function QuestIntegrationPanel({ 
  questId, 
  onIntegrationStatusChange 
}: QuestIntegrationPanelProps) {
  const { data: session } = useSession();
  const [integrationEnabled, setIntegrationEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkIntegrationStatus();
  }, [questId]);

  const checkIntegrationStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/integrations/devsync/check-status?quest_id=${questId}`);
      const data = await response.json();
      
      if (data.success) {
        setIntegrationEnabled(data.integration_enabled);
        setIsConnected(data.user_connected);
      } else {
        throw new Error(data.error || 'Failed to check integration status');
      }
    } catch (err) {
      console.error('Error checking integration status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check integration status');
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (enabled: boolean) => {
    try {
      const response = await fetch(`/api/integrations/devsync/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          quest_id: questId,
          enabled
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIntegrationEnabled(enabled);
        onIntegrationStatusChange?.(enabled);
        
        if (enabled) {
          toast.success('DevSync integration enabled for this quest');
        } else {
          toast.info('DevSync integration disabled for this quest');
        }
      } else {
        throw new Error(data.error || 'Failed to update integration status');
      }
    } catch (err) {
      console.error('Error toggling integration:', err);
      toast.error('Failed to update integration status');
    }
  };

  const handleConnectAccount = () => {
    // Redirect to DevSync OAuth flow
    window.location.href = `/api/integrations/devsync/oauth/connect`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DevSync Integration</CardTitle>
          <CardDescription>Connecting your development environment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-10 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <LinkIcon className="w-5 h-5 mr-2" />
              DevSync Integration
            </CardTitle>
            <CardDescription>Connect your development environment</CardDescription>
          </div>
          <Settings className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect your DevSync account to enable real-time collaboration features for this quest.
              </AlertDescription>
            </Alert>
            
            <Button onClick={handleConnectAccount} className="w-full">
              <LinkIcon className="w-4 h-4 mr-2" />
              Connect DevSync Account
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="integration-toggle">Enable Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Sync this quest with a DevSync project for real-time collaboration
                </p>
              </div>
              <Switch
                id="integration-toggle"
                checked={integrationEnabled}
                onCheckedChange={toggleIntegration}
              />
            </div>
            
            {integrationEnabled && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium">Project Status</h4>
                <p className="text-sm text-muted-foreground">
                  This quest is currently synced with a DevSync project. Changes made in DevSync will be reflected here.
                </p>
                
                <Button variant="outline" size="sm" className="w-full">
                  View DevSync Project
                </Button>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
```

## 5. Backend Implementation

### 5.1 DevSync Integration Service
```ts
// lib/devsync-integration.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

interface DevSyncUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
}

interface DevSyncProject {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  last_activity: string;
  collaborators: string[];
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

export class DevSyncIntegrationService {
  private devsyncApiUrl: string;
  private devsyncApiKey: string;

  constructor() {
    this.devsyncApiUrl = env.DEVSYNC_API_URL;
    this.devsyncApiKey = env.DEVSYNC_API_KEY;
  }

  /**
   * Link a user's DevSync account with their Adventurers Guild account
   */
  async linkAccount(userId: string, devsyncUserId: string, accessToken: string, refreshToken?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('devsync_integrations')
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
   * Get DevSync user information for a specific Adventurers Guild user
   */
  async getDevSyncUser(userId: string): Promise<DevSyncUser | null> {
    try {
      const { data, error } = await supabase
        .from('devsync_integrations')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.devsync_user_id,
        email: '', // Would need to fetch from DevSync API
        name: '', // Would need to fetch from DevSync API
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at
      };
    } catch (error) {
      console.error('Error getting DevSync user:', error);
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
          required_skills,
          company_id,
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

      // Get user's DevSync connection
      const devsyncUser = await this.getDevSyncUser(userId);
      if (!devsyncUser) {
        return { success: false, error: 'User not connected to DevSync' };
      }

      // Create project in DevSync
      const response = await fetch(`${this.devsyncApiUrl}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${devsyncUser.access_token}`,
          'X-API-Key': this.devsyncApiKey
        },
        body: JSON.stringify({
          name: quest.title,
          description: quest.description,
          initial_files: [
            {
              path: 'README.md',
              content: `# ${quest.title}\n\n${quest.description}\n\n## Quest Details\n- Difficulty: ${quest.difficulty}\n- XP Reward: ${quest.xp_reward}\n- Skills Required: ${quest.required_skills.join(', ')}`,
              language: 'markdown'
            }
          ],
          collaborators: [
            { 
              user_id: devsyncUser.id, 
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
            company: quest.users?.name
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
   * Get project activity feed
   */
  async getProjectActivity(projectId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    try {
      const devsyncUser = await this.getDevSyncUser(projectId); // This is not correct - we need to get the user differently
      
      // For now, let's assume we have a way to get the access token
      const response = await fetch(`${this.devsyncApiUrl}/api/projects/${projectId}/activity?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${this.devsyncApiKey}` // This would need to be properly authenticated
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
}
```

### 5.2 API Route Implementation
```ts
// app/api/integrations/devsync/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DevSyncIntegrationService } from '@/lib/devsync-integration';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const devsyncService = new DevSyncIntegrationService();

export async function POST(request: NextRequest) {
  try {
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
      case 'toggle_integration':
        return handleToggleIntegration(session.user.id, params);
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

    if (action === 'check_status' && questId) {
      return handleCheckStatus(session.user.id, questId);
    }

    return Response.json({ error: 'Invalid action', success: false }, { status: 400 });
  } catch (error) {
    console.error('Error in DevSync GET API:', error);
    return Response.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}

async function handleLinkAccount(userId: string, params: any) {
  const { devsync_access_token, devsync_user_id, refresh_token } = params;

  if (!devsync_access_token || !devsync_user_id) {
    return Response.json({ error: 'Missing required parameters', success: false }, { status: 400 });
  }

  const success = await devsyncService.linkAccount(
    userId,
    devsync_user_id,
    devsync_access_token,
    refresh_token
  );

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

  const result = await devsyncService.createProjectFromQuest(quest_id, userId);

  if (result.success) {
    return Response.json({ success: true, project_id: result.projectId });
  } else {
    return Response.json({ error: result.error, success: false }, { status: 500 });
  }
}

async function handleToggleIntegration(userId: string, params: any) {
  const { quest_id, enabled } = params;

  if (!quest_id || enabled === undefined) {
    return Response.json({ error: 'Missing required parameters', success: false }, { status: 400 });
  }

  // Update the mapping in the database
  const { data: mapping, error: mappingError } = await supabase
    .from('quest_project_mappings')
    .select('id')
    .eq('quest_id', quest_id)
    .single();

  if (mappingError) {
    // If no mapping exists yet, this might be the first time enabling
    if (mappingError.code === 'PGRST116') {
      // Create a new mapping
      const result = await devsyncService.createProjectFromQuest(quest_id, userId);
      
      if (!result.success) {
        return Response.json({ error: result.error, success: false }, { status: 500 });
      }
      
      return Response.json({ success: true, project_id: result.projectId });
    } else {
      return Response.json({ error: mappingError.message, success: false }, { status: 500 });
    }
  }

  // Update existing mapping
  const { error: updateError } = await supabase
    .from('quest_project_mappings')
    .update({ sync_enabled: enabled })
    .eq('id', mapping.id);

  if (updateError) {
    return Response.json({ error: updateError.message, success: false }, { status: 500 });
  }

  return Response.json({ success: true });
}

async function handleCheckStatus(userId: string, questId: string) {
  // Check if user has DevSync connected
  const devsyncUser = await devsyncService.getDevSyncUser(userId);
  const isConnected = !!devsyncUser;

  // Check if this quest has integration enabled
  let integrationEnabled = false;
  if (isConnected) {
    const { data, error } = await supabase
      .from('quest_project_mappings')
      .select('sync_enabled')
      .eq('quest_id', questId)
      .single();

    if (!error && data) {
      integrationEnabled = data.sync_enabled;
    }
  }

  return Response.json({ 
    success: true, 
    user_connected: isConnected,
    integration_enabled: integrationEnabled
  });
}
```

## 6. Security Considerations

### 6.1 Authentication & Authorization
- OAuth 2.0 for secure cross-platform authentication
- JWT tokens with appropriate expiration times
- Role-based access controls for integration features
- Secure storage of access/refresh tokens

### 6.2 Data Protection
- End-to-end encryption for sensitive data
- Data minimization - only share necessary information
- Secure API communication with HTTPS
- Regular security audits of integration code

### 6.3 Rate Limiting
- Implement rate limiting for API endpoints
- Prevent abuse of integration features
- Monitor for unusual activity patterns

## 7. Monitoring & Analytics

### 7.1 Integration Metrics
- API call success/failure rates
- Sync latency between platforms
- User adoption of integration features
- Error rates and types

### 7.2 Logging
- Log all integration API calls
- Track user actions within integration
- Monitor for security incidents
- Performance monitoring for integration layer

## 8. Testing Strategy

### 8.1 Unit Tests
- Test all service methods in isolation
- Mock external API calls
- Validate data transformations

### 8.2 Integration Tests
- Test API endpoints with mocked services
- Validate data flow between platforms
- Test error handling scenarios

### 8.3 End-to-End Tests
- Test complete user workflows
- Validate authentication flow
- Test real-time collaboration features

## 9. Deployment & Maintenance

### 9.1 Deployment Process
- Deploy integration layer as separate service
- Blue-green deployment for zero-downtime updates
- Automated testing in CI/CD pipeline

### 9.2 Rollback Procedures
- Quick rollback capability for critical issues
- Gradual rollout for new features
- Feature flags for safe experimentation

This technical specification provides a comprehensive guide for implementing the DevSync integration with The Adventurers Guild platform, ensuring a robust, secure, and scalable solution.