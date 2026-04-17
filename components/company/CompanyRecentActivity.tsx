'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';
import CompanyQuestList from './CompanyQuestList';
import type { CompanyQuest } from './company-portal-types';

interface CompanyRecentActivityProps {
  companyQuests: CompanyQuest[];
  loading: boolean;
  onCreateQuest: () => void;
  onDeleteQuest: (questId: string) => void;
  onEditQuest: (questId: string) => void;
  onViewQuest: (questId: string) => void;
}

export default function CompanyRecentActivity({
  companyQuests,
  loading,
  onCreateQuest,
  onDeleteQuest,
  onEditQuest,
  onViewQuest,
}: CompanyRecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Quests</CardTitle>
        <CardDescription>Your latest posted quests</CardDescription>
      </CardHeader>
      <CardContent>
        {companyQuests.length === 0 ? (
          <div className="py-8 text-center sm:py-12">
            <Target className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium sm:text-xl">No quests yet</h3>
            <p className="mb-4 text-sm text-muted-foreground sm:text-base">Create your first quest to get started</p>
            <Button className="mt-4" onClick={onCreateQuest}>
              <Plus className="mr-2 h-4 w-4" />
              Create Quest
            </Button>
          </div>
        ) : (
          <CompanyQuestList
            companyQuests={companyQuests}
            loading={loading}
            onDeleteQuest={onDeleteQuest}
            onEditQuest={onEditQuest}
            onViewQuest={onViewQuest}
            limit={5}
          />
        )}
      </CardContent>
    </Card>
  );
}
