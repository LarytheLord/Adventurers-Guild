-- Row Level Security Policies for Adventurers Guild
-- These policies ensure users can only access data they're authorized to see

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

-- Users policies
CREATE POLICY "Users can view all public profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Skill categories and skills (public read)
CREATE POLICY "Anyone can view skill categories" ON public.skill_categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view skills" ON public.skills
  FOR SELECT USING (true);

-- User skills policies
CREATE POLICY "Users can view all user skills" ON public.user_skills
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own skills" ON public.user_skills
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert user skills" ON public.user_skills
  FOR INSERT WITH CHECK (true); -- Will be handled by functions

-- Quests policies
CREATE POLICY "Anyone can view active quests" ON public.quests
  FOR SELECT USING (status = 'active' OR auth.uid() = company_id OR auth.uid() = assigned_to);

CREATE POLICY "Companies can create quests" ON public.quests
  FOR INSERT WITH CHECK (
    auth.uid() = company_id AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'company')
  );

CREATE POLICY "Companies can update their own quests" ON public.quests
  FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "Companies can delete their own quests" ON public.quests
  FOR DELETE USING (auth.uid() = company_id);

-- Quest applications policies
CREATE POLICY "Users can view applications for their quests or their own applications" ON public.quest_applications
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.quests WHERE id = quest_id AND company_id = auth.uid())
  );

CREATE POLICY "Students can apply to quests" ON public.quest_applications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'student')
  );

CREATE POLICY "Users can update their own applications" ON public.quest_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Quest submissions policies
CREATE POLICY "Users can view submissions for their quests or their own submissions" ON public.quest_submissions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.quests WHERE id = quest_id AND company_id = auth.uid())
  );

CREATE POLICY "Assigned users can submit work" ON public.quest_submissions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.quests WHERE id = quest_id AND assigned_to = auth.uid())
  );

CREATE POLICY "Users can update their own submissions" ON public.quest_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- Skill transactions policies
CREATE POLICY "Users can view their own skill transactions" ON public.skill_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert skill transactions" ON public.skill_transactions
  FOR INSERT WITH CHECK (true); -- Will be handled by functions

-- Achievements policies (public read)
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view all user achievements" ON public.user_achievements
  FOR SELECT USING (true);

CREATE POLICY "System can insert user achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true); -- Will be handled by functions

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true); -- Will be handled by functions

-- Companies policies
CREATE POLICY "Anyone can view company info" ON public.companies
  FOR SELECT USING (true);

CREATE POLICY "Companies can update their own info" ON public.companies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Companies can insert their own info" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);