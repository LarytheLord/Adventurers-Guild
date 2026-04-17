'use client';

import { QuestTable } from './QuestTable';
import type { CompanyQuest } from './company-portal-types';

interface CompanyQuestListProps {
  companyQuests: CompanyQuest[];
  loading: boolean;
  onDeleteQuest: (questId: string) => void;
  onEditQuest: (questId: string) => void;
  onViewQuest: (questId: string) => void;
  limit?: number;
}

export default function CompanyQuestList({
  companyQuests,
  loading,
  onDeleteQuest,
  onEditQuest,
  onViewQuest,
  limit,
}: CompanyQuestListProps) {
  return (
    <QuestTable
      quests={companyQuests}
      loading={loading}
      onDeleteQuest={onDeleteQuest}
      onEditQuest={onEditQuest}
      onViewQuest={onViewQuest}
      limit={limit}
    />
  );
}
