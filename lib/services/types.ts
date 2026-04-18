import { AssignmentStatus, QuestType, UserRank, QuestTrack, QuestSource,QuestCategory } from "@prisma/client";

export type ServiceResult<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

export type UpdateAssignmentBody = {
  assignmentId: string;
  status: AssignmentStatus;
  progress?: number;
};

export type CreateQuestBody = {
  title: string;
  description: string;
  detailedDescription: string;
  questType: QuestType;
  difficulty: UserRank;
  xpReward: number;
  skillPointsReward: number;
  monetaryReward: number;
  requiredSkills: string[];
  requiredRank: UserRank;
  maxParticipants: number;
  questCategory: QuestCategory;
  track: QuestTrack;
  source: QuestSource;
  parentQuestId: string;
  deadline: string;
};