-- BackFill required_rank from difficulty for all quests with null required_rank
-- This enables quest rank gating - users can only accept quests they're strong enough for
UPDATE quests
SET required_rank = difficulty
WHERE required_rank IS NULL;

-- Verify the backfill
-- SELECT COUNT(*) as null_count FROM quests WHERE required_rank IS NULL;
