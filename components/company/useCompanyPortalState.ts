'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useApiFetch } from '@/lib/hooks';
import type { CompanyQuest, QuestFormData } from './company-portal-types';

interface CompanyQuestsResponse {
  success: boolean;
  quests: CompanyQuest[];
  error?: string;
}

const EMPTY_COMPANY_QUESTS: CompanyQuest[] = [];

export function useCompanyPortalState(companyId: string) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const shouldFetch = Boolean(companyId) && (activeTab === 'quests' || activeTab === 'dashboard');
  const {
    data,
    loading,
    refetch: loadCompanyQuests,
    mutate,
  } = useApiFetch<CompanyQuestsResponse>(`/api/company/quests?company_id=${companyId}`, {
    skip: !shouldFetch,
  });
  const companyQuests = data?.quests ?? EMPTY_COMPANY_QUESTS;

  const handleCreateQuest = async (formData: QuestFormData) => {
    try {
      const response = await fetch('/api/company/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          company_id: companyId,
          requiredSkills: formData.requiredSkills.filter((skill) => skill.trim() !== ''),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Quest created successfully');
        await loadCompanyQuests();
        setActiveTab('quests');
      } else {
        toast.error(data.error || 'Failed to create quest');
      }
    } catch (error) {
      console.error('Error creating quest:', error);
      toast.error('Error creating quest');
    }
  };

  const handleDeleteQuest = async (questId: string) => {
    if (!window.confirm('Are you sure you want to cancel this quest? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/company/quests', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questId,
          company_id: companyId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Quest cancelled successfully');
        mutate({
          success: true,
          quests: companyQuests.filter((quest) => quest.id !== questId),
        });
      } else {
        toast.error(data.error || 'Failed to cancel quest');
      }
    } catch (error) {
      console.error('Error cancelling quest:', error);
      toast.error('Error cancelling quest');
    }
  };

  const handleViewQuest = (questId: string) => {
    console.log('View quest:', questId);
  };

  const handleEditQuest = (questId: string) => {
    console.log('Edit quest:', questId);
  };

  return {
    activeTab,
    companyQuests,
    handleCreateQuest,
    handleDeleteQuest,
    handleEditQuest,
    handleViewQuest,
    loading,
    setActiveTab,
  };
}
