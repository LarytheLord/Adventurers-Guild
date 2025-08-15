export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          username: string | null
          avatar_url: string | null
          role: 'student' | 'company' | 'admin'
          rank: 'F' | 'D' | 'C' | 'B' | 'A' | 'S'
          xp: number
          total_earnings: number
          bio: string | null
          github_url: string | null
          linkedin_url: string | null
          location: string | null
          skills: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          username?: string | null
          avatar_url?: string | null
          role?: 'student' | 'company' | 'admin'
          rank?: 'F' | 'D' | 'C' | 'B' | 'A' | 'S'
          xp?: number
          total_earnings?: number
          bio?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          skills?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          username?: string | null
          avatar_url?: string | null
          role?: 'student' | 'company' | 'admin'
          rank?: 'F' | 'D' | 'C' | 'B' | 'A' | 'S'
          xp?: number
          total_earnings?: number
          bio?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          skills?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      quests: {
        Row: {
          id: string
          title: string
          description: string
          requirements: string | null
          difficulty: 'F' | 'D' | 'C' | 'B' | 'A' | 'S'
          xp_reward: number
          skill_rewards: Json
          budget: number | null
          payment_amount: number | null
          deadline: string | null
          status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled'
          company_id: string
          assigned_to: string | null
          max_applicants: number
          tags: string[]
          attachments: Json
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          requirements?: string | null
          difficulty: 'F' | 'D' | 'C' | 'B' | 'A' | 'S'
          xp_reward: number
          skill_rewards?: Json
          budget?: number | null
          payment_amount?: number | null
          deadline?: string | null
          status?: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled'
          company_id: string
          assigned_to?: string | null
          max_applicants?: number
          tags?: string[]
          attachments?: Json
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          requirements?: string | null
          difficulty?: 'F' | 'D' | 'C' | 'B' | 'A' | 'S'
          xp_reward?: number
          skill_rewards?: Json
          budget?: number | null
          payment_amount?: number | null
          deadline?: string | null
          status?: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled'
          company_id?: string
          assigned_to?: string | null
          max_applicants?: number
          tags?: string[]
          attachments?: Json
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      skill_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          max_skill_points: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          max_skill_points?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          max_skill_points?: number
          created_at?: string
        }
      }
      user_skills: {
        Row: {
          id: string
          user_id: string
          skill_id: string
          level: number
          skill_points: number
          is_unlocked: boolean
          unlocked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_id: string
          level?: number
          skill_points?: number
          is_unlocked?: boolean
          unlocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_id?: string
          level?: number
          skill_points?: number
          is_unlocked?: boolean
          unlocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'student' | 'company' | 'admin'
      user_rank: 'F' | 'D' | 'C' | 'B' | 'A' | 'S'
      quest_status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled'
      quest_difficulty: 'F' | 'D' | 'C' | 'B' | 'A' | 'S'
      submission_status: 'pending' | 'approved' | 'rejected' | 'revision_requested'
      transaction_source: 'quest_completion' | 'achievement' | 'bonus' | 'penalty'
    }
  }
}