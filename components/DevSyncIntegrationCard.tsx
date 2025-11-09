'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Link, Unlink, ExternalLink, Users, Target, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Quest {
  id: string;
  title: string;
  description: string;
  status: string;
  difficulty: string;
  xp_reward: number;
  skill_points_reward: number;
  monetary_reward?: number;
  company_id: string;
}

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

interface DevSyncIntegrationCardProps {
  questId: string;
}

export default function DevSyncIntegrationCard({ questId }: DevSyncIntegrationCardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [connection, setConnection] = useState<DevSyncConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user && questId) {
      fetchQuestAndConnection();
    }
  }, [status, session, questId]);

  const fetchQuestAndConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch quest details
      const questResponse = await fetch(`/api/quests/${questId}`);
      const questData = await questResponse.json();

      if (!questData.success || !questData.quests?.[0]) {
        setError('Failed to fetch quest details');
        return;
      }

      const questDetails = questData.quests[0];
      
      // Verify user has permission to access this quest
      if (session?.user?.id !== questDetails.company_id && session?.user?.role !== 'admin') {
        setError('Unauthorized to access this quest');
        return;
      }

      setQuest(questDetails);

      // Check if user has DevSync connection
      const connectionResponse = await fetch('/api/integrations/devsync/connection');
      const connectionData = await connectionResponse.json();

      if (connectionData.success) {
        setConnection(connectionData.connection);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectDevSync = () => {
    // Redirect to DevSync OAuth flow
    window.location.href = `${process.env.NEXT_PUBLIC_DEVSYNC_URL}/oauth/authorize?redirect_uri=${encodeURIComponent(window.location.origin)}`;
  };

  const handleCreateDevSyncProject = async () => {
    if (!questId || !session?.user?.id) {
      setError('Missing required information');
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/integrations/devsync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_project',
          quest_id: questId
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the quest details
        fetchQuestAndConnection();
        router.push(`/dashboard/company/quests/${questId}?tab=devsync`);
      } else {
        setError(result.error || 'Failed to create DevSync project');
      }
    } catch (err) {
      console.error('Error creating DevSync project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create DevSync project');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStartCollaborationSession = async () => {
    if (!questId || !session?.user?.id) {
      setError('Missing required information');
      return;
    }

    try {
      const response = await fetch('/api/integrations/devsync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start_session',
          quest_id: questId,
          session_type: 'coding'
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Open the DevSync collaboration session in a new tab
        window.open(`${process.env.NEXT_PUBLIC_DEVSYNC_URL}/projects/${result.projectId}`, '_blank');
      } else {
        setError(result.error || 'Failed to start collaboration session');
      }
    } catch (err) {
      console.error('Error starting collaboration session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start collaboration session');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DevSync Integration</CardTitle>
          <CardDescription>Connecting your development workflow</CardDescription>
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DevSync Integration</CardTitle>
          <CardDescription>Connecting your development workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
            <CardDescription>Connect your development workflow</CardDescription>
          </div>
          {connection && (
            <Badge variant="secondary">Connected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!connection ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your DevSync account to enable real-time collaboration and advanced project management features.
            </p>
            <Button onClick={handleConnectDevSync} className="w-full">
              <Link className="w-4 h-4 mr-2" />
              Connect DevSync Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-primary" />
                <span className="text-sm font-medium">DevSync Connected</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => {}}>
                <Unlink className="w-3 h-3 mr-1" />
                Disconnect
              </Button>
            </div>

            {quest && (
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{quest.title}</h4>
                  <Badge variant="outline">{quest.difficulty}-Rank</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{quest.description}</p>
                
                <div className="flex items-center gap-4 text-sm mb-4">
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                    <span>{quest.xp_reward} XP</span>
                  </div>
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-1 text-blue-500" />
                    <span>{quest.skill_points_reward} SP</span>
                  </div>
                  {quest.monetary_reward && (
                    <div className="flex items-center">
                      <span>${quest.monetary_reward}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={handleCreateDevSyncProject} 
                    disabled={isSyncing}
                    className="w-full"
                  >
                    {isSyncing ? 'Creating...' : 'Create DevSync Project'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleStartCollaborationSession}
                    className="w-full"
                  >
                    Start Collaboration Session
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground mt-4">
              <p>• Real-time code collaboration with adventurers</p>
              <p>• Advanced project management features</p>
              <p>• Integrated version control and code review</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}