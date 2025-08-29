-- Supabase Database Schema for Adventurers Guild
-- This file contains the complete database schema with policies and triggers

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
CREATE TYPE user_role AS ENUM ('student', 'company', 'admin', 'client');
CREATE TYPE user_rank AS ENUM ('F', 'D', 'C', 'B', 'A', 'S');
CREATE TYPE quest_status AS ENUM ('draft', 'active', 'in_progress', 'completed', 'cancelled');
CREATE TYPE quest_difficulty AS ENUM ('F', 'D', 'C', 'B', 'A', 'S');
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected', 'revision_requested');
CREATE TYPE transaction_source AS ENUM ('quest_completion', 'achievement', 'bonus', 'penalty');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  role user_role DEFAULT 'student',
  rank user_rank DEFAULT 'F',
  xp INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  bio TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  location TEXT,
  skills JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill categories
CREATE TABLE public.skill_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  max_skill_points INTEGER DEFAULT 3000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual skills
CREATE TABLE public.skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES skill_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  max_level INTEGER DEFAULT 5,
  points_per_level INTEGER DEFAULT 100,
  prerequisites JSONB DEFAULT '[]', -- Array of skill IDs
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User skill progress
CREATE TABLE public.user_skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 0,
  skill_points INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- Quests table
CREATE TABLE public.quests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  difficulty quest_difficulty NOT NULL,
  xp_reward INTEGER NOT NULL,
  skill_rewards JSONB DEFAULT '{}', -- {"frontend": 150, "backend": 100}
  budget DECIMAL(10,2),
  payment_amount DECIMAL(10,2),
  deadline TIMESTAMP WITH TIME ZONE,
  status quest_status DEFAULT 'draft',
  company_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id),
  max_applicants INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quest applications
CREATE TABLE public.quest_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cover_letter TEXT,
  proposed_timeline TEXT,
  status submission_status DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT,
  UNIQUE(quest_id, user_id)
);

-- Quest submissions
CREATE TABLE public.quest_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  submission_url TEXT,
  github_repo TEXT,
  demo_url TEXT,
  description TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  status submission_status DEFAULT 'pending',
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_id UUID REFERENCES users(id)
);

-- Skill point transactions (audit trail)
CREATE TABLE public.skill_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  source_type transaction_source NOT NULL,
  source_id UUID, -- quest_id, achievement_id, etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements
CREATE TABLE public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  badge_color TEXT,
  xp_reward INTEGER DEFAULT 0,
  skill_rewards JSONB DEFAULT '{}',
  requirements JSONB NOT NULL, -- Conditions to unlock
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements
CREATE TABLE public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'quest_update', 'skill_unlock', 'achievement', etc.
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies (extended info for company users)
CREATE TABLE public.companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  company_size TEXT,
  description TEXT,
  logo_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_rank ON users(rank);
CREATE INDEX idx_quests_status ON quests(status);
CREATE INDEX idx_quests_difficulty ON quests(difficulty);
CREATE INDEX idx_quests_company_id ON quests(company_id);
CREATE INDEX idx_quest_applications_user_id ON quest_applications(user_id);
CREATE INDEX idx_quest_applications_quest_id ON quest_applications(quest_id);
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_skill_transactions_user_id ON skill_transactions(user_id);
CREATE INDEX idx_notifications_user_id_unread ON notifications(user_id, is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_skills_updated_at BEFORE UPDATE ON user_skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Admins can view all users" ON public.users
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

CREATE POLICY "Admins can update any user" ON public.users
FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Skill categories policies
CREATE POLICY "Everyone can view skill categories" ON public.skill_categories
FOR SELECT TO authenticated, anon USING (is_active = true);

-- Skills policies
CREATE POLICY "Everyone can view skills" ON public.skills
FOR SELECT TO authenticated, anon USING (is_active = true);

-- User skills policies
CREATE POLICY "Users can view their own skills" ON public.user_skills
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update their own skills" ON public.user_skills
FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can view all user skills" ON public.user_skills
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

CREATE POLICY "Admins can update any user skills" ON public.user_skills
FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Quests policies
CREATE POLICY "Everyone can view active quests" ON public.quests
FOR SELECT TO authenticated, anon USING (status IN ('active', 'in_progress', 'completed'));

CREATE POLICY "Companies can view their own quests" ON public.quests
FOR SELECT TO authenticated USING (
  company_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role IN ('company', 'admin')
  )
);

CREATE POLICY "Companies can create quests" ON public.quests
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role IN ('company', 'admin', 'client')
  )
);

CREATE POLICY "Companies can update their own quests" ON public.quests
FOR UPDATE TO authenticated USING (
  company_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

CREATE POLICY "Companies can delete their own quests" ON public.quests
FOR DELETE TO authenticated USING (
  company_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Quest applications policies
CREATE POLICY "Users can view their own applications" ON public.quest_applications
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Companies can view applications for their quests" ON public.quest_applications
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.quests q 
    WHERE q.id = quest_id AND q.company_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

CREATE POLICY "Students can create applications" ON public.quest_applications
FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'student'
  )
);

CREATE POLICY "Companies can update application status" ON public.quest_applications
FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.quests q 
    WHERE q.id = quest_id AND q.company_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Quest submissions policies
CREATE POLICY "Users can view their own submissions" ON public.quest_submissions
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Companies can view submissions for their quests" ON public.quest_submissions
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.quests q 
    WHERE q.id = quest_id AND q.company_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

CREATE POLICY "Students can create submissions for their applications" ON public.quest_submissions
FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'student'
  ) AND
  EXISTS (
    SELECT 1 FROM public.quest_applications qa 
    WHERE qa.quest_id = quest_id AND qa.user_id = auth.uid() AND qa.status = 'approved'
  )
);

CREATE POLICY "Companies can update submission status" ON public.quest_submissions
FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.quests q 
    WHERE q.id = quest_id AND q.company_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Skill transactions policies
CREATE POLICY "Users can view their own transactions" ON public.skill_transactions
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions" ON public.skill_transactions
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Achievements policies
CREATE POLICY "Everyone can view active achievements" ON public.achievements
FOR SELECT TO authenticated, anon USING (is_active = true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can view all user achievements" ON public.user_achievements
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
FOR INSERT TO authenticated, anon WITH CHECK (true);

-- Companies policies
CREATE POLICY "Users can view their own company info" ON public.companies
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update their own company info" ON public.companies
FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can view all companies" ON public.companies
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

CREATE POLICY "Admins can update any company info" ON public.companies
FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Storage Buckets Setup
-- Note: These need to be created in the Supabase dashboard or via CLI
-- Bucket names: avatars, quest-files

-- Storage Policies for avatars bucket
-- CREATE POLICY "Anyone can read avatars" ON storage.objects
-- FOR SELECT TO authenticated, anon USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can upload their own avatars" ON storage.objects
-- FOR INSERT TO authenticated WITH CHECK (
--   bucket_id = 'avatars' AND
--   (storage.foldername(name))[1] = auth.uid()::text
-- );

-- CREATE POLICY "Users can update their own avatars" ON storage.objects
-- FOR UPDATE TO authenticated USING (
--   bucket_id = 'avatars' AND
--   (storage.foldername(name))[1] = auth.uid()::text
-- );

-- CREATE POLICY "Users can delete their own avatars" ON storage.objects
-- FOR DELETE TO authenticated USING (
--   bucket_id = 'avatars' AND
--   (storage.foldername(name))[1] = auth.uid()::text
-- );

-- Storage Policies for quest-files bucket
-- CREATE POLICY "Authenticated users can read quest files" ON storage.objects
-- FOR SELECT TO authenticated USING (bucket_id = 'quest-files');

-- CREATE POLICY "Quest participants can upload files" ON storage.objects
-- FOR INSERT TO authenticated WITH CHECK (
--   bucket_id = 'quest-files' AND
--   EXISTS (
--     SELECT 1 FROM public.quests q
--     WHERE q.id = (storage.foldername(name))[1]::uuid AND
--     (q.company_id = auth.uid() OR q.assigned_to = auth.uid())
--   )
-- );

-- Functions for business logic

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'company' THEN 'company'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'client' THEN 'client'::user_role
      ELSE 'student'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user XP and rank when quest is completed
CREATE OR REPLACE FUNCTION public.update_user_xp_on_quest_completion()
RETURNS TRIGGER AS $$
DECLARE
  user_rank user_rank;
BEGIN
  -- Only update when submission is approved
  IF NEW.status = 'approved' THEN
    -- Update user XP
    UPDATE public.users
    SET xp = xp + (SELECT xp_reward FROM public.quests WHERE id = NEW.quest_id)
    WHERE id = NEW.user_id;
    
    -- Update user rank based on XP
    SELECT 
      CASE 
        WHEN xp >= 10000 THEN 'S'::user_rank
        WHEN xp >= 5000 THEN 'A'::user_rank
        WHEN xp >= 2000 THEN 'B'::user_rank
        WHEN xp >= 1000 THEN 'C'::user_rank
        WHEN xp >= 500 THEN 'D'::user_rank
        ELSE 'F'::user_rank
      END INTO user_rank
    FROM public.users
    WHERE id = NEW.user_id;
    
    UPDATE public.users
    SET rank = user_rank
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for quest submission approval
DROP TRIGGER IF EXISTS on_quest_submission_approved ON public.quest_submissions;
CREATE TRIGGER on_quest_submission_approved
  AFTER UPDATE ON public.quest_submissions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.update_user_xp_on_quest_completion();

-- Function to unlock skills when prerequisites are met
CREATE OR REPLACE FUNCTION public.unlock_skill_if_prerequisites_met()
RETURNS TRIGGER AS $$
BEGIN
  -- This function would be called when a user's skill points are updated
  -- Implementation would check if all prerequisites for other skills are met
  -- and automatically unlock them
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, authenticated;