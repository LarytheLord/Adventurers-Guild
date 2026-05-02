'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useApiFetch } from '@/lib/hooks';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import type { CompanyQuest, QuestFormData } from './company-portal-types';
import { getErrorMessageFromPayload, getStatusFallbackMessage, readResponsePayload } from '@/lib/http';

interface CompanyQuestsResponse {
  success: boolean;
  quests: CompanyQuest[];
  error?: string;
}

const EMPTY_COMPANY_QUESTS: CompanyQuest[] = [];

export function useCompanyPortalState(companyId: string) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const router = useRouter();
  const shouldFetch = Boolean(companyId) && (activeTab === 'quests' || activeTab === 'dashboard');
  const {
    data,
    loading,
    refetch: loadCompanyQuests,
  } = useApiFetch<CompanyQuestsResponse>(`/api/company/quests?company_id=${companyId}`, {
    skip: !shouldFetch,
  });
  const companyQuests = data?.quests ?? EMPTY_COMPANY_QUESTS;

  const handleCreateQuest = async (formData: QuestFormData) => {
    try {
      const response = await fetchWithAuth('/api/company/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          requiredSkills: formData.requiredSkills.filter((skill) => skill.trim() !== ''),
        }),
      });

      const data = await readResponsePayload<Record<string, unknown>>(response);

      if (response.ok && data?.success) {
        toast.success('Quest created successfully');
        await loadCompanyQuests();
        setActiveTab('quests');
      } else {
        toast.error(getErrorMessageFromPayload(data, getStatusFallbackMessage(response.status)));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error creating quest');
    }
  };

  const handleDeleteQuest = async (questId: string) => {
    if (!window.confirm('Are you sure you want to cancel this quest? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetchWithAuth('/api/company/quests', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questId,
        }),
      });

      const data = await readResponsePayload<Record<string, unknown>>(response);

      if (response.ok && data?.success) {
        toast.success('Quest cancelled successfully');
        await loadCompanyQuests();
      } else {
        toast.error(getErrorMessageFromPayload(data, getStatusFallbackMessage(response.status)));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error cancelling quest');
    }
  };

  const handleViewQuest = (questId: string) => {
    router.push(`/dashboard/company/quests/${questId}`);
  };

  const handleEditQuest = (questId: string) => {
    router.push(`/dashboard/company/quests/${questId}/edit`);
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
