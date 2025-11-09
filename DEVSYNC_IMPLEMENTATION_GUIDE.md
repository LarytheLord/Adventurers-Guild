# DevSync Integration Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the DevSync integration into The Adventurers Guild platform. This integration will enable real-time collaboration features for adventurers and companies working on quests.

## Prerequisites

Before beginning the implementation, ensure you have:

- Access to DevSync API credentials
- Understanding of the Adventurers Guild codebase structure
- Knowledge of Next.js, React, TypeScript, and Supabase
- Development environment properly configured

## Phase 1: Setup and Configuration (Days 1-3)

### 1.1 Environment Configuration

Add the following environment variables to your `.env.local` file:

```bash
# DevSync Integration
NEXT_PUBLIC_DEVSYNC_API_URL=https://api.devsync.codes
DEVSYNC_API_KEY=your-devsync-api-key
DEVSYNC_WEBHOOK_SECRET=your-webhook-signing-secret
NEXT_PUBLIC_DEVSYNC_CLIENT_ID=your-client-id
DEVSYNC_CLIENT_SECRET=your-client-secret
```

### 1.2 Dependency Installation

Install the required dependencies for the integration:

```bash
npm install @devsync/sdk axios crypto
```

### 1.3 Database Schema Updates

Update your Supabase schema to include DevSync-specific tables:

```sql
-- Add DevSync integration tables
create table if not exists public.devsync_projects (
  id uuid default uuid_generate_v4() primary key,
  quest_id uuid references public.quests(id) on delete cascade,
  devsync_project_id text unique not null,
  sync_enabled boolean default true,
  auto_update_status boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.devsync_sessions (
  id uuid default uuid_generate_v4() primary key,
  devsync_project_id text not null,
  quest_id uuid references public.quests(id) on delete cascade,
  session_type text check (session_type in ('coding', 'review', 'meeting')),
  status text check (status in ('active', 'ended', 'cancelled')) default 'active',
  started_at timestamp with time zone default timezone('utc'::text, now()),
  ended_at timestamp with time zone,
  participants uuid[], -- Array of user IDs
  session_metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add indexes for performance
create index idx_devsync_projects_quest_id on public.devsync_projects(quest_id);
create index idx_devsync_projects_devsync_project_id on public.devsync_projects(devsync_project_id);
create index idx_devsync_sessions_project_id on public.devsync_sessions(devsync_project_id);
create index idx_devsync_sessions_quest_id on public.devsync_sessions(quest_id);
```

### 1.4 API Route Setup

Create the integration API routes:

```bash
mkdir -p app/api/integrations/devsync
```

## Phase 2: Core Integration Implementation (Days 4-10)

### 2.1 Authentication Integration

Create an authentication handler for DevSync OAuth:

```typescript
// lib/devsync-auth.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

export async function exchangeCodeForToken(code: string) {
  const response = await fetch('https://api.devsync.codes/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.DEVSYNC_CLIENT_ID,
      client_secret: env.DEVSYNC_CLIENT_SECRET,
      code,
      redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/api/integrations/devsync/callback`,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  return response.json();
}

export async function saveUserDevSyncToken(userId: string, tokenData: any) {
  const { error } = await supabase
    .from('devsync_connections')
    .upsert({
      user_id: userId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    });

  if (error) {
    throw new Error(`Failed to save DevSync token: ${error.message}`);
  }
}
```

### 2.2 Project Synchronization

Implement the quest-to-project creation functionality:

```typescript
// lib/devsync-sync.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

export async function createDevSyncProjectFromQuest(questId: string, userId: string) {
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
      users!quests_company_id_fkey (
        name,
        email
      )
    `)
    .eq('id', questId)
    .single();

  if (questError) {
    throw new Error(`Failed to fetch quest: ${questError.message}`);
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
    throw new Error(`Failed to fetch assignments: ${assignmentsError.message}`);
  }

  // Get company's DevSync token
  const { data: connection, error: connectionError } = await supabase
    .from('devsync_connections')
    .select('access_token')
    .eq('user_id', quest.company_id)
    .single();

  if (connectionError) {
    throw new Error('Company has not connected to DevSync');
  }

  // Create project in DevSync
  const response = await fetch(`${env.NEXT_PUBLIC_DEVSYNC_API_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${connection.access_token}`,
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
          user_id: quest.company_id, // This would need to be the DevSync user ID
          role: 'owner' 
        },
        ...assignments.map(assignment => ({
          user_id: assignment.user_id, // This would need to be the DevSync user ID
          role: 'contributor'
        }))
      ],
      metadata: {
        quest_id: questId,
        source_platform: 'adventurers-guild',
        company: quest.users?.name,
        difficulty: quest.difficulty,
        xp_reward: quest.xp_reward,
        skill_points_reward: quest.skill_points_reward,
        monetary_reward: quest.monetary_reward,
        required_skills: quest.required_skills
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create DevSync project: ${response.statusText}`);
  }

  const result = await response.json();

  // Store the mapping in our database
  const { error: mappingError } = await supabase
    .from('devsync_projects')
    .insert({
      quest_id: questId,
      devsync_project_id: result.project.id,
      sync_enabled: true,
      auto_update_status: true
    });

  if (mappingError) {
    console.error('Error storing project mapping:', mappingError);
    // Don't throw error as the project was created in DevSync, just log it
  }

  return result;
}
```

### 2.3 API Route Implementation

Create the main integration API route:

```typescript
// app/api/integrations/devsync/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createDevSyncProjectFromQuest } from '@/lib/devsync-sync';
import { exchangeCodeForToken, saveUserDevSyncToken } from '@/lib/devsync-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'create-project':
        return handleCreateProject(session.user.id, params);
      case 'exchange-token':
        return handleExchangeToken(params);
      case 'start-session':
        return handleStartSession(session.user.id, params);
      default:
        return Response.json({ error: 'Invalid action', success: false }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in DevSync API:', error);
    return Response.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}

async function handleCreateProject(userId: string, params: any) {
  const { quest_id } = params;

  if (!quest_id) {
    return Response.json({ error: 'Missing quest_id', success: false }, { status: 400 });
  }

  // Verify user has permission to create project for this quest
  // Only companies can create projects for their quests
  const { data: quest, error: questError } = await supabase
    .from('quests')
    .select('company_id')
    .eq('id', quest_id)
    .single();

  if (questError || !quest) {
    return Response.json({ error: 'Quest not found', success: false }, { status: 404 });
  }

  if (quest.company_id !== userId) {
    return Response.json({ error: 'Unauthorized to create project for this quest', success: false }, { status: 403 });
  }

  try {
    const result = await createDevSyncProjectFromQuest(quest_id, userId);
    return Response.json({ success: true, project: result });
  } catch (error) {
    console.error('Error creating DevSync project:', error);
    return Response.json({ error: error instanceof Error ? error.message : 'Failed to create project', success: false }, { status: 500 });
  }
}

async function handleExchangeToken(params: any) {
  const { code } = params;

  if (!code) {
    return Response.json({ error: 'Missing authorization code', success: false }, { status: 400 });
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    
    // In a real implementation, you'd get the user ID from the session
    // For now, we'll skip this step as it requires additional implementation
    // await saveUserDevSyncToken(userId, tokenData);

    return Response.json({ success: true, token: tokenData });
  } catch (error) {
    console.error('Error exchanging token:', error);
    return Response.json({ error: error instanceof Error ? error.message : 'Failed to exchange token', success: false }, { status: 500 });
  }
}

async function handleStartSession(userId: string, params: any) {
  const { quest_id, session_type = 'coding' } = params;

  if (!quest_id) {
    return Response.json({ error: 'Missing quest_id', success: false }, { status: 400 });
  }

  // Get the DevSync project mapping
  const { data: mapping, error: mappingError } = await supabase
    .from('devsync_projects')
    .select('devsync_project_id')
    .eq('quest_id', quest_id)
    .single();

  if (mappingError || !mapping) {
    return Response.json({ error: 'No DevSync project linked to this quest', success: false }, { status: 404 });
  }

  // Verify user has access to this quest
  const hasAccess = await verifyUserAccess(userId, quest_id);
  if (!hasAccess) {
    return Response.json({ error: 'Unauthorized to start session for this quest', success: false }, { status: 403 });
  }

  // Start session in DevSync
  const { data: connection, error: connectionError } = await supabase
    .from('devsync_connections')
    .select('access_token')
    .eq('user_id', userId)
    .single();

  if (connectionError) {
    return Response.json({ error: 'User not connected to DevSync', success: false }, { status: 400 });
  }

  const response = await fetch(`${env.NEXT_PUBLIC_DEVSYNC_API_URL}/projects/${mapping.devsync_project_id}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${connection.access_token}`,
    },
    body: JSON.stringify({
      type: session_type,
      participants: [userId],
      metadata: {
        quest_id,
        source_platform: 'adventurers-guild'
      }
    })
  });

  if (!response.ok) {
    return Response.json({ error: 'Failed to start session in DevSync', success: false }, { status: 500 });
  }

  const result = await response.json();

  // Store session in our database
  const { error: sessionError } = await supabase
    .from('devsync_sessions')
    .insert({
      devsync_project_id: mapping.devsync_project_id,
      quest_id,
      session_type,
      status: 'active',
      participants: [userId]
    });

  if (sessionError) {
    console.error('Error storing session:', sessionError);
    // Don't fail the response as the session was created in DevSync
  }

  return Response.json({ success: true, session: result.session });
}

async function verifyUserAccess(userId: string, questId: string): Promise<boolean> {
  // Check if user is company that created the quest
  const { data: quest, error: questError } = await supabase
    .from('quests')
    .select('company_id')
    .eq('id', questId)
    .single();

  if (questError || !quest) {
    return false;
  }

  if (quest.company_id === userId) {
    return true;
  }

  // Check if user is assigned to the quest
  const { data: assignment, error: assignmentError } = await supabase
    .from('quest_assignments')
    .select('id')
    .eq('quest_id', questId)
    .eq('user_id', userId)
    .single();

  return !assignmentError && !!assignment;
}
```

## Phase 3: Frontend Integration (Days 11-15)

### 3.1 Create DevSync Integration Component

```tsx
// components/DevSyncIntegration.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Link, Unlink, ExternalLink, Users, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface DevSyncIntegrationProps {
  questId: string;
  onProjectCreated?: (projectId: string) => void;
}

export default function DevSyncIntegration({ questId, onProjectCreated }: DevSyncIntegrationProps) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkIntegrationStatus();
  }, [questId, session]);

  const checkIntegrationStatus = async () => {
    if (!session?.user?.id || !questId) return;

    try {
      setLoading(true);
      setError(null);

      // Check if user is connected to DevSync
      const connectionResponse = await fetch('/api/integrations/devsync/connection');
      const connectionData = await connectionResponse.json();

      if (connectionData.success) {
        setIsConnected(true);
      }

      // Check if project exists for this quest
      const projectResponse = await fetch(`/api/integrations/devsync/project?quest_id=${questId}`);
      const projectData = await projectResponse.json();

      if (projectData.success && projectData.project) {
        setProjectId(projectData.project.devsync_project_id);
      }
    } catch (err) {
      console.error('Error checking integration status:', err);
      setError('Failed to check integration status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // Redirect to DevSync OAuth flow
    window.location.href = `${process.env.NEXT_PUBLIC_DEVSYNC_API_URL}/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_DEVSYNC_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin)}/api/integrations/devsync/callback&response_type=code&scope=read+write+collaborate`;
  };

  const handleCreateProject = async () => {
    if (!session?.user?.id || !questId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/integrations/devsync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-project',
          quest_id: questId
        }),
      });

      const result = await response.json();

      if (result.success) {
        setProjectId(result.project.id);
        toast.success('DevSync project created successfully!');
        onProjectCreated?.(result.project.id);
      } else {
        setError(result.error || 'Failed to create project');
        toast.error(result.error || 'Failed to create project');
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setError('An error occurred while creating the project');
      toast.error('An error occurred while creating the project');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProject = () => {
    if (projectId) {
      window.open(`${process.env.NEXT_PUBLIC_DEVSYNC_API_URL}/projects/${projectId}`, '_blank');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
              <Link className="w-5 h-5 mr-2" />
              DevSync Integration
            </CardTitle>
            <CardDescription>
              Collaborate in real-time on your quest
            </CardDescription>
          </div>
          {isConnected && (
            <Badge variant="secondary">Connected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isConnected ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your DevSync account to enable real-time collaboration features for this quest.
            </p>
            <Button onClick={handleConnect} className="w-full">
              <Link className="w-4 h-4 mr-2" />
              Connect DevSync Account
            </Button>
          </div>
        ) : projectId ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <span className="font-medium">Project Created</span>
              <Badge variant="outline">Active</Badge>
            </div>
            <Button onClick={handleOpenProject} className="w-full" variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in DevSync
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create a collaborative project space for this quest to enable real-time coding with your team.
            </p>
            <Button onClick={handleCreateProject} className="w-full">
              Create DevSync Project
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 3.2 Integrate into Quest Detail Pages

Update the quest detail page to include the DevSync integration component:

```tsx
// In app/dashboard/quests/[id]/page.tsx, add to the imports:
import DevSyncIntegration from '@/components/DevSyncIntegration';

// In the component, add the DevSync integration section:
{session?.user?.role === 'company' && (
  <DevSyncIntegration 
    questId={questId} 
    onProjectCreated={(projectId) => {
      // Handle project creation callback
      console.log('DevSync project created:', projectId);
    }}
  />
)}
```

## Phase 4: Testing and Validation (Days 16-18)

### 4.1 Unit Tests

Create unit tests for the integration functions:

```typescript
// __tests__/integration/devsync.test.ts
import { createDevSyncProjectFromQuest } from '@/lib/devsync-sync';

describe('DevSync Integration', () => {
  test('creates project from quest successfully', async () => {
    const mockQuestId = 'test-quest-id';
    const mockUserId = 'test-user-id';
    
    // Mock the Supabase calls
    jest.spyOn(supabase, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: mockQuestId,
          title: 'Test Quest',
          description: 'Test Description',
          company_id: mockUserId,
        },
        error: null,
      }),
    } as any);

    // Add more mocking as needed for the function

    const result = await createDevSyncProjectFromQuest(mockQuestId, mockUserId);
    
    expect(result).toBeDefined();
  });

  test('handles errors appropriately', async () => {
    // Test error handling
  });
});
```

### 4.2 Integration Tests

Test the API routes with different scenarios:

```typescript
// __tests__/api/devsync-integration.test.ts
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/integrations/devsync/route';

describe('DevSync API Routes', () => {
  test('requires authentication', async () => {
    // Mock request without session
    const mockRequest = new NextRequest('http://localhost:3000/api/integrations/devsync', {
      method: 'POST',
      body: JSON.stringify({ action: 'create-project', quest_id: 'test' }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
  });

  test('validates required parameters', async () => {
    // Test with invalid parameters
  });
});
```

## Phase 5: Deployment and Monitoring (Days 19-21)

### 5.1 Deployment Configuration

Update your Vercel configuration for the new integration:

```javascript
// vercel.json
{
  "functions": {
    "app/api/integrations/devsync/route.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### 5.2 Monitoring Setup

Implement logging and monitoring for the integration:

```typescript
// lib/monitoring.ts
import { logError, getErrorSeverity } from './error-logger';

export function logIntegrationEvent(eventType: string, data: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    platform: 'devsync',
    data,
  };

  console.log('[DevSync Integration]', JSON.stringify(logEntry));
}

export function monitorIntegrationHealth() {
  // Health check for integration endpoints
  return fetch(`${process.env.NEXT_PUBLIC_DEVSYNC_API_URL}/health`)
    .then(response => response.ok)
    .catch(() => false);
}
```

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify OAuth credentials are correct
   - Check redirect URIs match exactly
   - Ensure tokens are properly stored and refreshed

2. **Project Creation Failures**
   - Confirm user has proper permissions
   - Verify quest exists and is in appropriate status
   - Check DevSync API limits and quotas

3. **Synchronization Issues**
   - Validate webhook signatures
   - Check rate limits on both platforms
   - Verify data format compatibility

### Debugging Tips

- Enable detailed logging for integration calls
- Use staging environment for testing before production
- Monitor API response times and error rates
- Implement circuit breakers for external service calls

## Conclusion

This implementation guide provides a comprehensive roadmap for integrating DevSync into The Adventurers Guild platform. Following this guide will result in a robust, secure, and scalable integration that enhances the user experience while maintaining the independence of both platforms.