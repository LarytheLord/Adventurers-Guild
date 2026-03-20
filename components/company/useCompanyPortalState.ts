'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { CompanyQuest, QuestFormData } from './company-portal-types';

export function useCompanyPortalState(companyId: string) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [companyQuests, setCompanyQuests] = useState<CompanyQuest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCompanyQuests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/company/quests?company_id=${companyId}`);
      const data = await response.json();

      if (data.success) {
        setCompanyQuests(data.quests);
      } else {
        toast.error(data.error || 'Failed to fetch quests');
      }
    } catch (error) {
      console.error('Error fetching company quests:', error);
      toast.error('Error fetching quests');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId && (activeTab === 'quests' || activeTab === 'dashboard')) {
      void loadCompanyQuests();
    }
  }, [activeTab, companyId, loadCompanyQuests]);

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
        setCompanyQuests((quests) => quests.filter((quest) => quest.id !== questId));
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
