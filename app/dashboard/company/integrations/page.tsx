'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Link, Unlink, Settings, Target, Users, Calendar, CheckCircle } from 'lucide-react';
import DevSyncIntegrationCard from '@/components/DevSyncIntegrationCard';

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
  created_at: string;
  deadline?: string;
}

interface Integration {
  platform: string;
  connected: boolean;
  last_sync?: string;
  status: string;
}

export default function CompanyIntegrationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([
    { platform: 'DevSync', connected: false, status: 'disconnected' },
    { platform: 'GitHub', connected: false, status: 'pending' },
    { platform: 'Slack', connected: false, status: 'pending' },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'company' && session.user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchCompanyQuests = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!session?.user?.id) {
          setError('User ID not found');
          return;
        }

        // Fetch quests belonging to this company
        const response = await fetch(`/api/quests?company_id=${session.user.id}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Failed to fetch quests');
          return;
        }

        setQuests(data.quests || []);
      } catch (err) {
        console.error('Error fetching quests:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch quests');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchCompanyQuests();
    }
  }, [status, session, router]);

  const handleConnectIntegration = (platform: string) => {
    switch (platform) {
      case 'DevSync':
        // Redirect to DevSync OAuth flow
        window.location.href = `${process.env.NEXT_PUBLIC_DEVSYNC_URL}/oauth/authorize?redirect_uri=${encodeURIComponent(window.location.origin)}`;
        break;
      case 'GitHub':
        // Handle GitHub OAuth flow
        window.location.href = 'https://github.com/login/oauth/authorize';
        break;
      case 'Slack':
        // Handle Slack OAuth flow
        window.location.href = 'https://slack.com/oauth/v2/authorize';
        break;
      default:
        setError('Unknown integration platform');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Platform Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect and manage integrations with external development platforms
        </p>
      </div>

      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push('/dashboard/company')}>
          ← Back to Company Dashboard
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Platforms</CardTitle>
              <CardDescription>
                Manage your external platform connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration, index) => (
                  <div 
                    key={integration.platform} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {integration.platform === 'DevSync' && <Link className="w-5 h-5" />}
                        {integration.platform === 'GitHub' && (
                          <div className="w-5 h-5 bg-black dark:bg-white rounded-sm flex items-center justify-center">
                            <span className="text-white dark:text-black text-xs font-bold">GH</span>
                          </div>
                        )}
                        {integration.platform === 'Slack' && (
                          <div className="w-5 h-5 bg-purple-500 rounded-sm flex items-center justify-center">
                            <span className="text-white text-xs font-bold">S</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{integration.platform}</h3>
                        <p className="text-sm text-muted-foreground">
                          {integration.connected 
                            ? `Last sync: ${integration.last_sync || 'Just now'}` 
                            : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={integration.connected ? 'default' : 'outline'}>
                        {integration.status}
                      </Badge>
                      
                      {integration.connected ? (
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleConnectIntegration(integration.platform)}
                          size="sm"
                        >
                          <Link className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Benefits</CardTitle>
              <CardDescription>
                How integrations enhance your development workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Real-time Collaboration</h4>
                    <p className="text-sm text-muted-foreground">
                      Work directly with adventurers in shared development environments
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Version Control</h4>
                    <p className="text-sm text-muted-foreground">
                      Track code changes and maintain quality throughout development
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Automated Reviews</h4>
                    <p className="text-sm text-muted-foreground">
                      Get automated code quality reviews and feedback
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Project Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Gain insights into development progress and productivity
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>DevSync Integration</CardTitle>
              <CardDescription>
                Connect with the DevSync platform for real-time collaboration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DevSyncIntegrationCard questId="" /> {/* Will be passed dynamically based on selection */}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quests Available for Integration</CardTitle>
              <CardDescription>
                Select a quest to connect with DevSync
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quests.length === 0 ? (
                <div className="text-center py-6">
                  <Target className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No quests available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create a quest to get started with integrations
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quests.map((quest) => (
                    <div 
                      key={quest.id} 
                      className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => {
                        // Set the selected quest for the DevSync integration card
                        const devSyncCard = document.getElementById('devsync-integration-card');
                        if (devSyncCard) {
                          // In a real implementation, we would update the prop
                          console.log('Selected quest:', quest.id);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium truncate">{quest.title}</h4>
                        <Badge variant="outline">{quest.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {quest.description}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <Users className="w-3 h-3 mr-1" />
                        <span>{quest.xp_reward} XP</span>
                        {quest.monetary_reward && (
                          <>
                            <span className="mx-2">•</span>
                            <span>${quest.monetary_reward}</span>
                          </>
                        )}
                        {quest.deadline && (
                          <>
                            <span className="mx-2">•</span>
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{new Date(quest.deadline).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}