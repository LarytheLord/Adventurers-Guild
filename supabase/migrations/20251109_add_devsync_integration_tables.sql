-- Add DevSync integration tables

-- Create table to store DevSync account connections
CREATE TABLE IF NOT EXISTS devsync_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  devsync_user_id TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  scopes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table to map quests to DevSync projects
CREATE TABLE IF NOT EXISTS quest_project_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id UUID REFERENCES quests ON DELETE CASCADE,
  devsync_project_id TEXT NOT NULL,
  sync_enabled BOOLEAN DEFAULT TRUE,
  auto_update_status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quest_id, devsync_project_id)
);

-- Create table for collaboration sessions
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  devsync_project_id TEXT NOT NULL,
  quest_id UUID REFERENCES quests ON DELETE CASCADE,
  session_type TEXT CHECK (session_type IN ('coding', 'review', 'meeting')),
  status TEXT CHECK (status IN ('active', 'ended', 'cancelled')) DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  participants UUID[], -- Array of user IDs
  session_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_devsync_connections_user_id ON devsync_connections(user_id);
CREATE INDEX idx_devsync_connections_devsync_user_id ON devsync_connections(devsync_user_id);
CREATE INDEX idx_quest_project_mappings_quest_id ON quest_project_mappings(quest_id);
CREATE INDEX idx_quest_project_mappings_devsync_project_id ON quest_project_mappings(devsync_project_id);
CREATE INDEX idx_collaboration_sessions_project_id ON collaboration_sessions(devsync_project_id);
CREATE INDEX idx_collaboration_sessions_quest_id ON collaboration_sessions(quest_id);

-- Add RLS policies
ALTER TABLE devsync_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_project_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for DevSync connections
CREATE POLICY "Users can view own DevSync connections" ON devsync_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own DevSync connections" ON devsync_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own DevSync connections" ON devsync_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own DevSync connections" ON devsync_connections
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for quest-project mappings
CREATE POLICY "Authorized users can view quest-project mappings" ON quest_project_mappings
    FOR SELECT USING (
      auth.uid() IN (
        SELECT company_id FROM quests WHERE id = quest_id
      ) OR 
      auth.uid() IN (
        SELECT user_id FROM quest_assignments WHERE quest_id = quest_id
      ) OR
      EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
      )
    );

CREATE POLICY "Companies can create quest-project mappings" ON quest_project_mappings
    FOR INSERT WITH CHECK (
      auth.uid() IN (
        SELECT company_id FROM quests WHERE id = quest_id
      )
    );

-- Create policies for collaboration sessions
CREATE POLICY "Authorized users can view collaboration sessions" ON collaboration_sessions
    FOR SELECT USING (
      auth.uid() = ANY(participants) OR
      auth.uid() IN (
        SELECT company_id FROM quests WHERE id = quest_id
      ) OR
      EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
      )
    );

CREATE POLICY "Quest participants can create collaboration sessions" ON collaboration_sessions
    FOR INSERT WITH CHECK (
      auth.uid() IN (
        SELECT user_id FROM quest_assignments WHERE quest_id = quest_id
      ) OR
      auth.uid() IN (
        SELECT company_id FROM quests WHERE id = quest_id
      )
    );

-- Add updated_at trigger
CREATE TRIGGER update_devsync_connections_updated_at 
    BEFORE UPDATE ON devsync_connections 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_quest_project_mappings_updated_at 
    BEFORE UPDATE ON quest_project_mappings 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_collaboration_sessions_updated_at 
    BEFORE UPDATE ON collaboration_sessions 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();