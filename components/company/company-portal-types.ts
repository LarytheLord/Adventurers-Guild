export interface CompanyQuest {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  questType: string;
  status: string;
  difficulty: string;
  xpReward: number;
  skillPointsReward: number;
  monetaryReward?: number;
  requiredSkills: string[];
  requiredRank?: string;
  maxParticipants?: number;
  questCategory: string;
  company_id: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
}

export interface QuestFormData {
  title: string;
  description: string;
  detailedDescription: string;
  questType: string;
  difficulty: string;
  xpReward: number;
  skillPointsReward: number;
  monetaryReward: number;
  requiredSkills: string[];
  requiredRank: string;
  maxParticipants: number;
  questCategory: string;
  deadline: string;
}
