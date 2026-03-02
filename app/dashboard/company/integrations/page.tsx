'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Settings, CheckCircle, Clock } from 'lucide-react';

const INTEGRATIONS = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Sync repositories, review pull requests, and track commits from quests.',
    status: 'coming_soon',
    icon: (
      <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
        <span className="text-white dark:text-black text-xs font-bold">GH</span>
      </div>
    ),
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get quest notifications, submission updates, and team alerts in Slack.',
    status: 'coming_soon',
    icon: (
      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
        <span className="text-white text-xs font-bold">S</span>
      </div>
    ),
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Map quests to Jira tickets and sync progress automatically.',
    status: 'coming_soon',
    icon: (
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <span className="text-white text-xs font-bold">J</span>
      </div>
    ),
  },
];

export default function CompanyIntegrationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (
      status === 'authenticated' &&
      session?.user?.role !== 'company' &&
      session?.user?.role !== 'admin'
    ) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
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
        <Button className="mt-4" onClick={() => setError(null)}>
          Dismiss
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Platform Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect your development tools to streamline the quest workflow.
        </p>
      </div>

      <Button variant="outline" onClick={() => router.push('/dashboard/company')} className="mb-6">
        ← Back to Dashboard
      </Button>

      {/* Integration cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {INTEGRATIONS.map((integration) => (
          <Card key={integration.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-3">
                {integration.icon}
                <Badge variant="outline" className="text-xs text-slate-500">
                  <Clock className="w-3 h-3 mr-1" />
                  Coming Soon
                </Badge>
              </div>
              <CardTitle className="text-base">{integration.name}</CardTitle>
              <CardDescription className="text-sm">{integration.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button variant="outline" size="sm" className="w-full" disabled>
                <Settings className="w-4 h-4 mr-2" />
                Connect
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>What integrations unlock</CardTitle>
          <CardDescription>
            Once connected, your tools work seamlessly with the Guild&apos;s quest system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: 'Automated status sync',
                desc: 'Quest progress updates flow directly to your project management tools.',
              },
              {
                title: 'Code review pipeline',
                desc: 'Pull request reviews from adventurers surface directly in your existing tools.',
              },
              {
                title: 'Team notifications',
                desc: 'Keep your whole team in the loop on submissions and approvals.',
              },
              {
                title: 'Analytics',
                desc: 'Track velocity, quality metrics, and cost per feature across all quests.',
              },
            ].map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">{benefit.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
