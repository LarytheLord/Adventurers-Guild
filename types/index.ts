/**
 * Shared TypeScript types and interfaces
 */

// ============================================================================
// User Types
// ============================================================================

export type UserRole = 'adventurer' | 'company' | 'admin';
export type UserRank = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  rank: UserRank;
  xp: number;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Quest Types
// ============================================================================

export type QuestStatus = 'open' | 'in_progress' | 'submitted' | 'completed' | 'cancelled';
export type QuestDifficulty = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  xpReward: number;
  status: QuestStatus;
  companyId: string;
  company?: User;
  assignedTo?: string;
  assignedUser?: User;
  requiredSkills?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
}

export interface QuestSubmission {
  id: string;
  questId: string;
  quest?: Quest;
  userId: string;
  user?: User;
  submissionUrl: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  reviewedBy?: string;
  createdAt: Date;
  reviewedAt?: Date;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Form Types
// ============================================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateQuestFormData {
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  xpReward: number;
  requiredSkills?: string[];
  deadline?: Date;
}

// ============================================================================
// NextAuth Extensions
// ============================================================================

declare module 'next-auth' {
  interface Session {
    user: User;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    rank: UserRank;
    xp: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    rank: UserRank;
    xp: number;
  }
}

// ============================================================================
// Component Props
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : any;
