-- Add onboarding columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_step TEXT,
ADD COLUMN IF NOT EXISTS assessment_score INTEGER,
ADD COLUMN IF NOT EXISTS assessment_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create user_onboarding table to track onboarding progress
CREATE TABLE IF NOT EXISTS user_onboarding (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    completed_steps TEXT[] DEFAULT '{}',
    skipped_steps TEXT[] DEFAULT '{}',
    step_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create user_profiles table for additional profile data
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create companies table for company-specific data
CREATE TABLE IF NOT EXISTS companies (
    id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT,
    size TEXT,
    website TEXT,
    description TEXT,
    logo_url TEXT,
    founded_year INTEGER,
    tech_stack JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create company_verifications table
CREATE TABLE IF NOT EXISTS company_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES users(id) ON DELETE CASCADE,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    submitted_documents TEXT[] DEFAULT '{}',
    business_license TEXT,
    tax_id TEXT,
    banking_info JSONB,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(company_id)
);

-- Add updated_at trigger for user_onboarding
CREATE OR REPLACE FUNCTION update_user_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_onboarding_updated_at
    BEFORE UPDATE ON user_onboarding
    FOR EACH ROW
    EXECUTE FUNCTION update_user_onboarding_updated_at();

-- Add updated_at trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger for companies
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_company_verifications_status ON company_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_company_verifications_company_id ON company_verifications(company_id);

-- Enable RLS on all tables
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_onboarding
CREATE POLICY "Users can view own onboarding progress" ON user_onboarding
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress" ON user_onboarding
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for companies
CREATE POLICY "Companies can view own data" ON companies
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Companies can update own data" ON companies
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Public can view approved companies" ON companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM company_verifications cv 
            WHERE cv.company_id = id AND cv.verification_status = 'approved'
        )
    );

-- RLS Policies for company_verifications
CREATE POLICY "Companies can view own verification" ON company_verifications
    FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "Companies can insert own verification" ON company_verifications
    FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Companies can update own verification" ON company_verifications
    FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "Admins can view all verifications" ON company_verifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update verifications" ON company_verifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert some basic achievements for onboarding
INSERT INTO achievements (id, name, description, badge_color, icon, xp_reward, requirements, category)
VALUES 
    ('first-steps-adventurer', 'First Steps', 'Completed onboarding as an adventurer', 'bg-blue-500', '🎯', 100, '{"onboarding_completed": true}', 'onboarding'),
    ('guild-founder', 'Guild Founder', 'Completed onboarding as a company', 'bg-green-500', '🏢', 50, '{"onboarding_completed": true, "role": "company"}', 'onboarding'),
    ('assessment-taker', 'Skill Assessor', 'Completed the skills assessment', 'bg-purple-500', '🧠', 75, '{"assessment_completed": true}', 'skills'),
    ('first-quest-complete', 'Quest Completionist', 'Completed your first tutorial quest', 'bg-yellow-500', '⚔️', 50, '{"tutorial_quest_completed": true}', 'quests')
ON CONFLICT (id) DO NOTHING;

-- Add some basic skill categories and skills for onboarding
INSERT INTO skill_categories (id, name, description, icon, color, display_order)
VALUES 
    ('frontend', 'Frontend Development', 'Build user interfaces and web experiences', 'Code', 'bg-blue-500', 1),
    ('backend', 'Backend Development', 'Create server-side applications and APIs', 'Server', 'bg-green-500', 2),
    ('database', 'Database Design', 'Design and manage data storage solutions', 'Database', 'bg-purple-500', 3),
    ('mobile', 'Mobile Development', 'Build mobile applications', 'Smartphone', 'bg-orange-500', 4),
    ('devops', 'DevOps & Infrastructure', 'Deploy and maintain production systems', 'Zap', 'bg-red-500', 5)
ON CONFLICT (id) DO NOTHING;

-- Add basic skills for assessment
INSERT INTO skills (id, category_id, name, description, icon, color, max_level, points_per_level, prerequisites, difficulty_level)
VALUES 
    ('html-css', 'frontend', 'HTML & CSS', 'Fundamental web markup and styling', 'Code', 'bg-blue-500', 5, 20, '[]', 'beginner'),
    ('javascript-basics', 'frontend', 'JavaScript Basics', 'Core JavaScript programming concepts', 'Code', 'bg-yellow-500', 5, 25, '["html-css"]', 'beginner'),
    ('react', 'frontend', 'React', 'Build dynamic user interfaces with React', 'Code', 'bg-blue-600', 5, 30, '["javascript-basics"]', 'intermediate'),
    ('nodejs', 'backend', 'Node.js', 'Server-side JavaScript development', 'Server', 'bg-green-500', 5, 30, '["javascript-basics"]', 'intermediate'),
    ('sql-basics', 'database', 'SQL Fundamentals', 'Basic database queries and operations', 'Database', 'bg-purple-500', 5, 25, '[]', 'beginner'),
    ('git-basics', 'devops', 'Git Version Control', 'Version control with Git', 'Zap', 'bg-gray-500', 5, 20, '[]', 'beginner')
ON CONFLICT (id) DO NOTHING;
