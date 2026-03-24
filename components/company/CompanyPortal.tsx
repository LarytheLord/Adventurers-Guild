'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompanyDashboardStats from './CompanyDashboardStats';
import CompanyQuestList from './CompanyQuestList';
import CompanyRecentActivity from './CompanyRecentActivity';
import { QuestForm } from './QuestForm';
import { useCompanyPortalState } from './useCompanyPortalState';

interface CompanyPortalProps {
  companyId: string;
}

export default function CompanyPortal({ companyId }: CompanyPortalProps) {
  const state = useCompanyPortalState(companyId);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Company Portal</h1>
        <p className="text-muted-foreground">Manage your quests and projects</p>
      </div>
      <Tabs value={state.activeTab} onValueChange={state.setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="quests">Manage Quests</TabsTrigger>
          <TabsTrigger value="create">Create Quest</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="space-y-6">
          <CompanyDashboardStats companyQuests={state.companyQuests} />
          <CompanyRecentActivity
            companyQuests={state.companyQuests}
            loading={state.loading}
            onCreateQuest={() => state.setActiveTab('create')}
            onDeleteQuest={state.handleDeleteQuest}
            onEditQuest={state.handleEditQuest}
            onViewQuest={state.handleViewQuest}
          />
        </TabsContent>
        <TabsContent value="quests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Quests</CardTitle>
              <CardDescription>View and manage all your posted quests</CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyQuestList
                companyQuests={state.companyQuests}
                loading={state.loading}
                onDeleteQuest={state.handleDeleteQuest}
                onEditQuest={state.handleEditQuest}
                onViewQuest={state.handleViewQuest}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="create" className="space-y-6">
          <QuestForm onSubmit={state.handleCreateQuest} submitLabel="Create Quest" loading={state.loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
