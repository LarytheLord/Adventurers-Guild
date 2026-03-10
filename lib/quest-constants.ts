// Shared constants for quest forms and displays.
// Single source of truth — used by create-quest, edit-quest, admin pages, etc.

export const QUEST_CATEGORIES = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'ai_ml', label: 'AI / ML' },
  { value: 'devops', label: 'DevOps' },
  { value: 'security', label: 'Security' },
  { value: 'qa', label: 'QA' },
  { value: 'design', label: 'Design' },
  { value: 'data_science', label: 'Data Science' },
] as const;

export const QUEST_TYPES = [
  { value: 'commission', label: 'Commission' },
  { value: 'bug_bounty', label: 'Bug Bounty' },
  { value: 'code_refactor', label: 'Code Refactor' },
  { value: 'internal', label: 'Internal' },
  { value: 'learning', label: 'Learning' },
] as const;

export const DIFFICULTY_RANKS = ['F', 'E', 'D', 'C', 'B', 'A', 'S'] as const;

export const QUEST_STATUS_COLORS: Record<string, string> = {
  available:   'bg-emerald-100 text-emerald-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review:      'bg-amber-100 text-amber-800',
  completed:   'bg-slate-100 text-slate-700',
  cancelled:   'bg-red-100 text-red-700',
  draft:       'bg-zinc-100 text-zinc-700',
};

export const QUEST_STATUS_LABELS: Record<string, string> = {
  available:   'Available',
  in_progress: 'In Progress',
  review:      'Under Review',
  completed:   'Completed',
  cancelled:   'Cancelled',
  draft:       'Draft',
};

export const RANK_COLORS: Record<string, string> = {
  S: 'bg-amber-100 text-amber-800',
  A: 'bg-violet-100 text-violet-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-green-100 text-green-800',
  D: 'bg-slate-100 text-slate-700',
  E: 'bg-purple-100 text-purple-800',
  F: 'bg-gray-100 text-gray-700',
};
