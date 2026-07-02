-- Migration: Add QuestBriefSchema fields to quests table
-- Issue: #257 - QuestBriefSchema fields missing from Prisma schema
-- Date: 2025-07-02

-- Add structured quest brief fields
ALTER TABLE public.quests 
ADD COLUMN IF NOT EXISTS submission_instructions TEXT,
ADD COLUMN IF NOT EXISTS expected_deliverables JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS client_resources JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS problem_statement TEXT,
ADD COLUMN IF NOT EXISTS acceptance_criteria JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS starter_repo TEXT,
ADD COLUMN IF NOT EXISTS estimated_hours INTEGER,
ADD COLUMN IF NOT EXISTS squad_size TEXT DEFAULT 'solo',
ADD COLUMN IF NOT EXISTS ip_terms TEXT,
ADD COLUMN IF NOT EXISTS client_org TEXT;

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_quests_squad_size ON public.quests(squad_size);
CREATE INDEX IF NOT EXISTS idx_quests_estimated_hours ON public.quests(estimated_hours);
CREATE INDEX IF NOT EXISTS idx_quests_client_org ON public.quests(client_org);