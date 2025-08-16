-- Seed data for Adventurers Guild

-- Insert skill categories
INSERT INTO public.skill_categories (id, name, description, icon, color, max_skill_points) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Frontend Development', 'Client-side web development skills', 'monitor', '#3B82F6', 3000),
  ('b2c3d4e5-f678-90ab-cdef-123456789012', 'Backend Development', 'Server-side development skills', 'server', '#10B981', 3000),
  ('c3d4e5f6-7890-abcd-ef12-345678901234', 'Database & Data', 'Database design and data management', 'database', '#8B5CF6', 3000),
  ('d4e5f678-90ab-cdef-1234-567890123456', 'DevOps & Cloud', 'Deployment and infrastructure skills', 'cloud', '#F59E0B', 3000),
  ('e5f67890-abcd-ef12-3456-789012345678', 'Soft Skills', 'Communication and collaboration', 'users', '#EC4899', 3000);

-- Insert skills
INSERT INTO public.skills (id, category_id, name, description, max_level, points_per_level, icon, color, is_active) VALUES
  -- Frontend skills
  ('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'HTML/CSS', 'Markup and styling fundamentals', 5, 100, 'code', '#E34C26', true),
  ('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'JavaScript', 'Dynamic web programming', 5, 150, 'zap', '#F7DF1E', true),
  ('33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'React', 'Component-based UI library', 5, 200, 'atom', '#61DAFB', true),
  ('44444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'TypeScript', 'Type-safe JavaScript', 5, 150, 'shield', '#3178C6', true),
  
  -- Backend skills
  ('55555555-5555-5555-5555-555555555555', 'b2c3d4e5-f678-90ab-cdef-123456789012', 'Node.js', 'JavaScript runtime', 5, 150, 'server', '#339933', true),
  ('66666666-6666-6666-6666-666666666666', 'b2c3d4e5-f678-90ab-cdef-123456789012', 'Python', 'Versatile programming language', 5, 150, 'snake', '#3776AB', true),
  ('77777777-7777-7777-7777-777777777777', 'b2c3d4e5-f678-90ab-cdef-123456789012', 'REST APIs', 'API design and implementation', 5, 100, 'link', '#FF6B6B', true),
  
  -- Database skills
  ('88888888-8888-8888-8888-888888888888', 'c3d4e5f6-7890-abcd-ef12-345678901234', 'PostgreSQL', 'Relational database', 5, 150, 'database', '#336791', true),
  ('99999999-9999-9999-9999-999999999999', 'c3d4e5f6-7890-abcd-ef12-345678901234', 'MongoDB', 'NoSQL database', 5, 150, 'layers', '#47A248', true),
  
  -- DevOps skills
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'd4e5f678-90ab-cdef-1234-567890123456', 'Docker', 'Containerization', 5, 150, 'package', '#2496ED', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'd4e5f678-90ab-cdef-1234-567890123456', 'Git', 'Version control', 5, 100, 'git-branch', '#F05032', true),
  
  -- Soft skills
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'e5f67890-abcd-ef12-3456-789012345678', 'Communication', 'Clear and effective communication', 5, 100, 'message-circle', '#06B6D4', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'e5f67890-abcd-ef12-3456-789012345678', 'Problem Solving', 'Analytical thinking', 5, 150, 'lightbulb', '#FBBF24', true);

-- Insert achievements
INSERT INTO public.achievements (id, name, description, icon, badge_color, xp_reward, requirements, is_active) VALUES
  ('ach-001', 'First Quest', 'Complete your first quest', 'flag', '#10B981', 100, '{"quests_completed": 1}', true),
  ('ach-002', 'Rising Star', 'Reach D Rank', 'star', '#F59E0B', 500, '{"rank": "D"}', true),
  ('ach-003', 'Elite Adventurer', 'Reach A Rank', 'trophy', '#8B5CF6', 2000, '{"rank": "A"}', true),
  ('ach-004', 'Quest Master', 'Complete 10 quests', 'award', '#3B82F6', 1000, '{"quests_completed": 10}', true),
  ('ach-005', 'Skill Collector', 'Unlock 5 different skills', 'grid', '#EC4899', 500, '{"skills_unlocked": 5}', true),
  ('ach-006', 'Perfect Submission', 'Get a 5-star rating', 'star', '#FBBF24', 300, '{"perfect_rating": true}', true),
  ('ach-007', 'Team Player', 'Complete a team quest', 'users', '#06B6D4', 400, '{"team_quest": true}', true),
  ('ach-008', 'Speed Demon', 'Complete a quest before deadline', 'zap', '#EF4444', 200, '{"early_completion": true}', true),
  ('ach-009', 'Learning Path', 'Complete a quest line', 'route', '#10B981', 600, '{"quest_line_completed": true}', true),
  ('ach-010', 'Guild Legend', 'Reach S Rank', 'crown', '#FFD700', 5000, '{"rank": "S"}', true);

-- Create trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON public.quests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_skills_updated_at BEFORE UPDATE ON public.user_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user registration and initial setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert user profile
    INSERT INTO public.users (id, email, name, role, rank, xp)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
        'F',
        0
    );
    
    -- If the user is a company, create company profile
    IF NEW.raw_user_meta_data->>'role' = 'company' THEN
        INSERT INTO public.companies (user_id, company_name, verified)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'company_name', 'Unnamed Company'),
            false
        );
    END IF;
    
    -- Send welcome notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        NEW.id,
        'Welcome to The Adventurers Guild!',
        'Your journey begins now. Check out available quests or complete your profile to get started.',
        'welcome'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate and update XP/rank
CREATE OR REPLACE FUNCTION public.update_user_xp_and_rank(
    p_user_id UUID,
    p_xp_gained INTEGER,
    p_source TEXT
)
RETURNS VOID AS $$
DECLARE
    v_current_xp INTEGER;
    v_new_xp INTEGER;
    v_current_rank user_rank;
    v_new_rank user_rank;
BEGIN
    -- Get current XP and rank
    SELECT xp, rank INTO v_current_xp, v_current_rank
    FROM public.users
    WHERE id = p_user_id;
    
    -- Calculate new XP
    v_new_xp := v_current_xp + p_xp_gained;
    
    -- Determine new rank based on XP thresholds
    v_new_rank := CASE
        WHEN v_new_xp >= 50000 THEN 'S'::user_rank
        WHEN v_new_xp >= 25000 THEN 'A'::user_rank
        WHEN v_new_xp >= 10000 THEN 'B'::user_rank
        WHEN v_new_xp >= 5000 THEN 'C'::user_rank
        WHEN v_new_xp >= 1000 THEN 'D'::user_rank
        ELSE 'F'::user_rank
    END;
    
    -- Update user XP and rank
    UPDATE public.users
    SET xp = v_new_xp, rank = v_new_rank
    WHERE id = p_user_id;
    
    -- If rank changed, send notification
    IF v_new_rank != v_current_rank THEN
        INSERT INTO public.notifications (user_id, title, message, type, data)
        VALUES (
            p_user_id,
            'Rank Up!',
            format('Congratulations! You have reached %s rank!', v_new_rank),
            'rank_up',
            jsonb_build_object('old_rank', v_current_rank, 'new_rank', v_new_rank)
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
