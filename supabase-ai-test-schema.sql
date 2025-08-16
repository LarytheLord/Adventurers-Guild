-- AI Rank Test Schema for Adventurers Guild
-- This table stores AI rank test attempts and results

-- Create enum for test status
CREATE TYPE test_status AS ENUM ('in_progress', 'completed', 'abandoned', 'error');

-- Create enum for test difficulty (maps to ranks)
CREATE TYPE test_difficulty AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- AI Rank Tests table
CREATE TABLE public.ai_rank_tests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  test_difficulty test_difficulty NOT NULL,
  test_type TEXT NOT NULL, -- 'coding', 'problem_solving', 'system_design'
  
  -- Test content
  problem_statement TEXT NOT NULL,
  test_cases JSONB NOT NULL, -- Array of input/output pairs
  hints JSONB DEFAULT '[]', -- Optional hints
  
  -- User submission
  user_code TEXT,
  language TEXT, -- 'javascript', 'python', 'typescript', etc.
  submission_time TIMESTAMP WITH TIME ZONE,
  
  -- AI evaluation
  ai_evaluation JSONB, -- Detailed evaluation from AI service
  test_results JSONB, -- Test case results
  score INTEGER CHECK (score >= 0 AND score <= 100),
  feedback TEXT,
  
  -- Rank determination
  suggested_rank user_rank,
  xp_awarded INTEGER DEFAULT 0,
  
  -- Metadata
  status test_status DEFAULT 'in_progress',
  time_limit_minutes INTEGER DEFAULT 60,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Test Templates (predefined tests)
CREATE TABLE public.ai_test_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty test_difficulty NOT NULL,
  test_type TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  test_cases JSONB NOT NULL,
  solution_template TEXT, -- Starter code
  hints JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  expected_time_minutes INTEGER DEFAULT 30,
  xp_reward INTEGER NOT NULL,
  rank_requirement user_rank, -- Minimum rank to unlock this test
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User test history for analytics
CREATE TABLE public.ai_test_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  test_id UUID REFERENCES public.ai_rank_tests(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'started', 'submitted', 'completed', 'abandoned'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_ai_rank_tests_user_id ON public.ai_rank_tests(user_id);
CREATE INDEX idx_ai_rank_tests_status ON public.ai_rank_tests(status);
CREATE INDEX idx_ai_test_history_user_id ON public.ai_test_history(user_id);
CREATE INDEX idx_ai_test_templates_difficulty ON public.ai_test_templates(difficulty);

-- Enable RLS
ALTER TABLE public.ai_rank_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_test_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_test_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI Rank Tests
CREATE POLICY "Users can view their own tests" ON public.ai_rank_tests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tests" ON public.ai_rank_tests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own in-progress tests" ON public.ai_rank_tests
  FOR UPDATE USING (auth.uid() = user_id AND status = 'in_progress');

-- RLS Policies for Test Templates
CREATE POLICY "Anyone can view active templates" ON public.ai_test_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage templates" ON public.ai_test_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- RLS Policies for Test History
CREATE POLICY "Users can view their own history" ON public.ai_test_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert history" ON public.ai_test_history
  FOR INSERT WITH CHECK (true); -- Will be inserted via service role

-- Function to process AI rank test completion
CREATE OR REPLACE FUNCTION public.process_ai_test_completion(
  p_test_id UUID,
  p_score INTEGER,
  p_suggested_rank user_rank
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_xp_reward INTEGER;
  v_current_rank user_rank;
BEGIN
  -- Get user ID and calculate XP reward
  SELECT user_id INTO v_user_id
  FROM public.ai_rank_tests
  WHERE id = p_test_id;
  
  -- Calculate XP based on score
  v_xp_reward := CASE
    WHEN p_score >= 90 THEN 1000
    WHEN p_score >= 80 THEN 750
    WHEN p_score >= 70 THEN 500
    WHEN p_score >= 60 THEN 250
    ELSE 100
  END;
  
  -- Update test record
  UPDATE public.ai_rank_tests
  SET 
    status = 'completed',
    score = p_score,
    suggested_rank = p_suggested_rank,
    xp_awarded = v_xp_reward,
    completed_at = NOW()
  WHERE id = p_test_id;
  
  -- Get current rank
  SELECT rank INTO v_current_rank
  FROM public.users
  WHERE id = v_user_id;
  
  -- Update user rank if suggested rank is higher
  IF p_suggested_rank > v_current_rank THEN
    UPDATE public.users
    SET rank = p_suggested_rank
    WHERE id = v_user_id;
    
    -- Send notification
    INSERT INTO public.notifications (user_id, title, message, type, data)
    VALUES (
      v_user_id,
      'AI Rank Test Completed!',
      format('Based on your performance, you have been promoted to %s rank!', p_suggested_rank),
      'ai_test_complete',
      jsonb_build_object(
        'test_id', p_test_id,
        'score', p_score,
        'old_rank', v_current_rank,
        'new_rank', p_suggested_rank,
        'xp_awarded', v_xp_reward
      )
    );
  ELSE
    -- Just send completion notification
    INSERT INTO public.notifications (user_id, title, message, type, data)
    VALUES (
      v_user_id,
      'AI Rank Test Completed!',
      format('You scored %s%% on the test and earned %s XP!', p_score, v_xp_reward),
      'ai_test_complete',
      jsonb_build_object(
        'test_id', p_test_id,
        'score', p_score,
        'xp_awarded', v_xp_reward
      )
    );
  END IF;
  
  -- Award XP
  PERFORM public.update_user_xp_and_rank(v_user_id, v_xp_reward, 'ai_rank_test');
  
  -- Log to history
  INSERT INTO public.ai_test_history (user_id, test_id, action, metadata)
  VALUES (
    v_user_id,
    p_test_id,
    'completed',
    jsonb_build_object('score', p_score, 'xp_awarded', v_xp_reward)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample test templates
INSERT INTO public.ai_test_templates (
  title, description, difficulty, test_type, problem_statement, 
  test_cases, solution_template, hints, tags, xp_reward
) VALUES
(
  'Two Sum',
  'Find two numbers that add up to a target',
  'beginner',
  'coding',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  '[
    {"input": {"nums": [2,7,11,15], "target": 9}, "output": [0,1]},
    {"input": {"nums": [3,2,4], "target": 6}, "output": [1,2]},
    {"input": {"nums": [3,3], "target": 6}, "output": [0,1]}
  ]'::jsonb,
  'function twoSum(nums, target) {\n  // Your code here\n}',
  '["Consider using a hash map", "Think about time complexity"]'::jsonb,
  ARRAY['arrays', 'hash-map'],
  500
),
(
  'Valid Parentheses',
  'Check if parentheses are valid',
  'intermediate',
  'coding',
  'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.',
  '[
    {"input": {"s": "()"}, "output": true},
    {"input": {"s": "()[]{}"}, "output": true},
    {"input": {"s": "(]"}, "output": false},
    {"input": {"s": "([)]"}, "output": false}
  ]'::jsonb,
  'function isValid(s) {\n  // Your code here\n}',
  '["Use a stack", "Match opening with closing brackets"]'::jsonb,
  ARRAY['stack', 'string'],
  750
);
