'use client';

import { CompanyStats } from './CompanyStats';
import type { CompanyQuest } from './company-portal-types';

interface CompanyDashboardStatsProps {
  companyQuests: CompanyQuest[];
}

export default function CompanyDashboardStats({ companyQuests }: CompanyDashboardStatsProps) {
  return <CompanyStats companyQuests={companyQuests} />;
}
