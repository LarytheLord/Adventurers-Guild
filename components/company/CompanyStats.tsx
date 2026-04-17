// components/company/CompanyStats.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, Coins } from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  description: string;
  status: string;
  monetaryReward?: number;
}

interface CompanyStatsProps {
  companyQuests: Quest[];
}

export function CompanyStats({ companyQuests }: CompanyStatsProps) {
  const totalQuests = companyQuests.length;
  const activeQuests = companyQuests.filter(q =>
    q.status === 'available' || q.status === 'in_progress'
  ).length;
  const completedQuests = companyQuests.filter(q => q.status === 'completed').length;
  const totalSpent = companyQuests.reduce((sum, quest) => sum + (quest.monetaryReward || 0), 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Quests</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalQuests}</div>
          <p className="text-xs text-muted-foreground">+{totalQuests} this month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Quests</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeQuests}</div>
          <p className="text-xs text-muted-foreground">Currently running</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Quests</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedQuests}</div>
          <p className="text-xs text-muted-foreground">Successfully delivered</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">On platform</p>
        </CardContent>
      </Card>
    </div>
  );
}
