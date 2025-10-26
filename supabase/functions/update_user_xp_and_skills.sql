-- SQL function to update user XP and skills
CREATE OR REPLACE FUNCTION update_user_xp_and_skills(
  user_id_input UUID,
  xp_gained INTEGER,
  skill_points_gained INTEGER
)
RETURNS VOID AS $$
DECLARE
  current_xp INTEGER;
  current_level INTEGER;
  current_rank TEXT;
  new_xp INTEGER;
  new_level INTEGER;
  new_rank TEXT;
BEGIN
  -- Get current user stats
  SELECT xp, level, rank INTO current_xp, current_level, current_rank
  FROM users
  WHERE id = user_id_input;

  -- Calculate new XP
  new_xp := current_xp + xp_gained;

  -- Calculate new level based on XP (simple implementation: 1000 XP per level)
  new_level := current_level + FLOOR((new_xp - current_xp) / 1000);

  -- Update user XP and level
  UPDATE users
  SET xp = new_xp,
      level = new_level,
      skill_points = skill_points + skill_points_gained
  WHERE id = user_id_input;

  -- Calculate new rank based on total XP (simple implementation)
  -- Assuming: F: 0-999 XP, E: 1000-2999, D: 3000-5999, C: 6000-9999, B: 10000-14999, A: 15000-24999, S: 25000+
  CASE
    WHEN new_xp >= 25000 THEN new_rank := 'S';
    WHEN new_xp >= 15000 THEN new_rank := 'A';
    WHEN new_xp >= 10000 THEN new_rank := 'B';
    WHEN new_xp >= 6000 THEN new_rank := 'C';
    WHEN new_xp >= 3000 THEN new_rank := 'D';
    WHEN new_xp >= 1000 THEN new_rank := 'E';
    ELSE new_rank := 'F';
  END CASE;

  -- Update user rank if it changed
  IF current_rank != new_rank THEN
    UPDATE users
    SET rank = new_rank
    WHERE id = user_id_input;

    -- Here you could add logic to send a notification about rank up
  END IF;

  -- Update adventurer profile stats
  UPDATE adventurer_profiles
  SET total_quests_completed = total_quests_completed + 1,
      quest_completion_rate = (
        SELECT 
          CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(
              (COUNT(CASE WHEN qc.status = 'completed' THEN 1 END) * 100.0 / COUNT(*)), 2
            )
          END
        FROM quest_completions qc
        WHERE qc.user_id = user_id_input
      )
  WHERE user_id = user_id_input;
END;
$$ LANGUAGE plpgsql;