-- Migration: Add complete_quest function for atomic quest completion
-- Issue: #324 - XP reward runs outside DB transaction
-- Date: 2025-07-03

-- Create function to atomically complete a quest and award XP
CREATE OR REPLACE FUNCTION public.complete_quest_with_rewards(
  p_user_id UUID,
  p_quest_id UUID,
  p_xp_amount INTEGER,
  p_new_rank VARCHAR(10),
  p_payment_amount DECIMAL(10,2)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user XP, rank, and earnings
  UPDATE public.users
  SET 
    xp = xp + p_xp_amount,
    rank = p_new_rank,
    total_earnings = total_earnings + p_payment_amount,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Update quest status to completed
  UPDATE public.quests
  SET status = 'completed', updated_at = NOW()
  WHERE id = p_quest_id;
END;
$$;

-- Create function to safely complete quest with proper error handling
CREATE OR REPLACE FUNCTION public.safe_complete_quest(
  p_user_id UUID,
  p_quest_id UUID,
  p_xp_amount INTEGER,
  p_new_rank VARCHAR(10),
  p_payment_amount DECIMAL(10,2),
  p_old_xp INTEGER,
  p_old_rank VARCHAR(10)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_success BOOLEAN := FALSE;
BEGIN
  -- Perform all updates in a single transaction
  -- If any update fails, the entire operation rolls back
  UPDATE public.users
  SET 
    xp = p_old_xp + p_xp_amount,
    rank = p_new_rank,
    total_earnings = total_earnings + p_payment_amount,
    updated_at = NOW()
  WHERE id = p_user_id
  AND xp = p_old_xp
  AND rank = p_old_rank;

  IF NOT FOUND THEN
    -- Rollback by not proceeding
    RETURN FALSE;
  END IF;

  UPDATE public.quests
  SET status = 'completed', updated_at = NOW()
  WHERE id = p_quest_id;

  IF FOUND THEN
    v_success := TRUE;
  END IF;

  RETURN v_success;
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback on any error
    RETURN FALSE;
END;
$$;