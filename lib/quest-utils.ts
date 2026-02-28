// lib/quest-utils.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Types for our data
export interface Quest {
  id: string;
  title: string;
  description: string;
  detailed_description?: string;
  quest_type: string;
  status: string;
  difficulty: string;
  xp_reward: number;
  skill_points_reward: number;
  monetary_reward?: number;
  required_skills: string[];
  required_rank?: string;
  max_participants?: number;
  quest_category: string;
  company_id: string;
  created_at: string;
  deadline?: string;
  users?: {
    name: string;
    email: string;
  };
}

export interface QuestAssignment {
  id: string;
  quest_id: string;
  user_id: string;
  assigned_at: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  progress: number;
  quests?: Quest;
}

export interface QuestSubmission {
  id: string;
  assignment_id: string;
  user_id: string;
  submission_content: string;
  submission_notes?: string;
  submitted_at: string;
  status: string;
  reviewer_id?: string;
  reviewed_at?: string;
  review_notes?: string;
  quality_score?: number;
}

// Fetch all available quests
export async function fetchAvailableQuests(): Promise<Quest[]> {
  const { data, error } = await supabase
    .from('quests')
    .select(`
      id,
      title,
      description,
      quest_type,
      status,
      difficulty,
      xp_reward,
      skill_points_reward,
      monetary_reward,
      required_skills,
      required_rank,
      max_participants,
      quest_category,
      company_id,
      created_at,
      deadline,
      users!quests_company_id_fkey (
        name,
        email
      )
    `)
    .eq('status', 'available');

  if (error) {
    console.error('Error fetching quests:', error);
    throw new Error('Failed to fetch quests');
  }

  // Transform data to handle array access issues
  return (data || []).map((item: any) => {
    const userData = Array.isArray(item.users) ? item.users[0] : item.users;
    return {
      ...item,
      users: userData || { name: '', email: '' }
    };
  }) as Quest[];
}

// Fetch quests for a specific user
export async function fetchUserQuests(userId: string): Promise<QuestAssignment[]> {
  const { data, error } = await supabase
    .from('quest_assignments')
    .select(`
      id,
      quest_id,
      user_id,
      assigned_at,
      status,
      started_at,
      completed_at,
      progress,
      quests (
        title,
        description,
        quest_type,
        status,
        difficulty,
        xp_reward,
        skill_points_reward,
        required_skills,
        required_rank,
        quest_category,
        deadline
      )
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user quests:', error);
    throw new Error('Failed to fetch user quests');
  }

  // Transform data to handle array access issues
  return (data || []).map((item: any) => {
    const questData = Array.isArray(item.quests) ? item.quests[0] : item.quests;
    return {
      ...item,
      quests: questData
    };
  }) as QuestAssignment[];
}

// Fetch quest by ID
export async function fetchQuestById(questId: string): Promise<Quest | null> {
  const { data, error } = await supabase
    .from('quests')
    .select(`
      id,
      title,
      description,
      detailed_description,
      quest_type,
      status,
      difficulty,
      xp_reward,
      skill_points_reward,
      monetary_reward,
      required_skills,
      required_rank,
      max_participants,
      quest_category,
      company_id,
      created_at,
      deadline,
      users!quests_company_id_fkey (
        name,
        email
      )
    `)
    .eq('id', questId)
    .single();

  if (error) {
    console.error('Error fetching quest:', error);
    return null;
  }

  // Transform data to handle array access issues
  if (data) {
    const userData = Array.isArray(data.users) ? data.users[0] : data.users;
    return {
      ...data,
      users: userData || { name: '', email: '' }
    } as Quest;
  }

  return data;
}

// Assign user to a quest
export async function assignToQuest(questId: string, userId: string): Promise<QuestAssignment | null> {
  // Check if the quest is available
  const quest = await fetchQuestById(questId);
  if (!quest || quest.status !== 'available') {
    throw new Error('Quest is not available');
  }

  // Check max participants
  if (quest.max_participants) {
    const { count, error } = await supabase
      .from('quest_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('quest_id', questId)
      .neq('status', 'cancelled');

    if (error) {
      console.error('Error checking participant count:', error);
      throw new Error('Error checking participant count');
    }

    if (count && count >= quest.max_participants) {
      throw new Error('Maximum participants reached for this quest');
    }
  }

  // Create assignment
  const { data, error } = await supabase
    .from('quest_assignments')
    .insert([{
      quest_id: questId,
      user_id: userId,
      status: 'assigned'
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating quest assignment:', error);
    throw new Error('Failed to assign to quest');
  }

  // Update quest status if it's a single-participant quest
  if (!quest.max_participants || quest.max_participants === 1) {
    await supabase
      .from('quests')
      .update({ status: 'in_progress' })
      .eq('id', questId);
  }

  return data;
}

// Submit a quest for review
export async function submitQuest(
  assignmentId: string,
  userId: string,
  submissionContent: string,
  submissionNotes?: string
): Promise<QuestSubmission | null> {
  // Check if assignment exists and is in a valid state for submission
  const { data: assignment, error: assignmentError } = await supabase
    .from('quest_assignments')
    .select('status')
    .eq('id', assignmentId)
    .single();

  if (assignmentError || !assignment || !['assigned', 'started', 'in_progress'].includes(assignment.status)) {
    throw new Error('Invalid assignment state for submission');
  }

  // Create submission
  const { data, error } = await supabase
    .from('quest_submissions')
    .insert([{
      assignment_id: assignmentId,
      user_id: userId,
      submission_content: submissionContent,
      submission_notes: submissionNotes || null
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating quest submission:', error);
    throw new Error('Failed to create quest submission');
  }

  // Update assignment status to submitted
  await supabase
    .from('quest_assignments')
    .update({ status: 'submitted' })
    .eq('id', assignmentId);

  return data;
}

// Update quest assignment status
export async function updateAssignmentStatus(
  assignmentId: string,
  status: string,
  progress?: number
): Promise<QuestAssignment | null> {
  const { data, error } = await supabase
    .from('quest_assignments')
    .update({
      status,
      progress: progress !== undefined ? progress : undefined,
      started_at: status === 'started' ? new Date().toISOString() : undefined,
      completed_at: status === 'completed' ? new Date().toISOString() : undefined
    })
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating assignment status:', error);
    throw new Error('Failed to update assignment status');
  }

  return data;
}

// Delegate to centralized rank module
import { getNextRankThreshold } from './ranks';
export function getNextRank(currentXp: number): { rank: string; nextRankXp: number } {
  const { currentRank, nextRankXp } = getNextRankThreshold(currentXp);
  return { rank: currentRank, nextRankXp };
}