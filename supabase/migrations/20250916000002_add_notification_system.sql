-- Create enum for notification types
CREATE TYPE notification_type AS ENUM ('quest', 'payment', 'achievement', 'system', 'announcement', 'moderation', 'admin_action');

-- Create enum for notification priority
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create notifications table (already exists, but let's ensure it has all columns)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'system',
    priority notification_priority NOT NULL DEFAULT 'medium',
    data JSONB DEFAULT '{}',
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'priority') THEN
        ALTER TABLE notifications ADD COLUMN priority notification_priority NOT NULL DEFAULT 'medium';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'action_url') THEN
        ALTER TABLE notifications ADD COLUMN action_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
        ALTER TABLE notifications ADD COLUMN read_at TIMESTAMPTZ;
    END IF;
END $$;

-- Create user notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    preferences JSONB NOT NULL DEFAULT '{
        "email": {
            "questUpdates": true,
            "paymentNotifications": true,
            "achievements": true,
            "systemAnnouncements": true,
            "weeklyDigest": true
        },
        "push": {
            "questUpdates": true,
            "paymentNotifications": true,
            "achievements": true,
            "systemAnnouncements": false
        },
        "inApp": {
            "all": true
        }
    }',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification templates table for reusable notification content
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    title_template TEXT NOT NULL,
    message_template TEXT NOT NULL,
    type notification_type NOT NULL,
    priority notification_priority NOT NULL DEFAULT 'medium',
    variables TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification batches table for tracking bulk notifications
CREATE TABLE IF NOT EXISTS notification_batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    template_id UUID REFERENCES notification_templates(id),
    target_users_count INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    target_criteria JSONB DEFAULT '{}',
    sent_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_batches_status ON notification_batches(status);

-- Add updated_at triggers
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notification_preferences_updated_at
    BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_notification_preferences
CREATE POLICY "Users can view own preferences" ON user_notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON user_notification_preferences
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for notification_templates (admin only)
CREATE POLICY "Admins can manage templates" ON notification_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can read templates" ON notification_templates
    FOR SELECT USING (is_active = true);

-- RLS Policies for notification_batches (admin only)
CREATE POLICY "Admins can manage batches" ON notification_batches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert default notification templates
INSERT INTO notification_templates (name, title_template, message_template, type, priority, variables) VALUES
    ('quest_application', 'New Quest Application', 'Someone applied for your quest: {{quest_title}}', 'quest', 'medium', '["quest_title", "applicant_name"]'),
    ('quest_approved', 'Quest Application Approved! 🎉', 'Your application for "{{quest_title}}" has been approved. Time to start coding!', 'quest', 'high', '["quest_title"]'),
    ('quest_completed', 'Quest Completed! ⚔️', 'Congratulations! You''ve successfully completed "{{quest_title}}" and earned {{xp_earned}} XP!', 'quest', 'high', '["quest_title", "xp_earned"]'),
    ('payment_received', 'Payment Received 💰', 'You''ve received ${{amount}} for completing "{{quest_title}}"', 'payment', 'high', '["amount", "quest_title"]'),
    ('achievement_unlocked', 'Achievement Unlocked! 🏆', 'You''ve earned the "{{achievement_name}}" achievement and {{xp_reward}} XP!', 'achievement', 'medium', '["achievement_name", "xp_reward"]'),
    ('rank_up', 'Rank Up! 📈', 'Congratulations! You''ve advanced from rank {{old_rank}} to rank {{new_rank}}!', 'achievement', 'high', '["old_rank", "new_rank"]'),
    ('skill_unlocked', 'New Skill Unlocked! 🌟', 'You''ve unlocked the "{{skill_name}}" skill! Keep learning and growing.', 'achievement', 'low', '["skill_name"]'),
    ('welcome_student', 'Welcome to The Adventurers Guild!', 'Your adventurer profile is ready! Start exploring quests and building your skills.', 'system', 'medium', '[]'),
    ('welcome_company', 'Welcome to The Adventurers Guild!', 'Your company profile is ready! You can now start posting quests for talented developers.', 'system', 'medium', '[]')
ON CONFLICT (name) DO NOTHING;

-- Function to send notification using template
CREATE OR REPLACE FUNCTION send_templated_notification(
    p_user_id UUID,
    p_template_name TEXT,
    p_variables JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    template_record notification_templates%ROWTYPE;
    final_title TEXT;
    final_message TEXT;
    notification_id UUID;
    var_key TEXT;
    var_value TEXT;
BEGIN
    -- Get template
    SELECT * INTO template_record
    FROM notification_templates
    WHERE name = p_template_name AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template not found: %', p_template_name;
    END IF;
    
    -- Replace variables in title and message
    final_title := template_record.title_template;
    final_message := template_record.message_template;
    
    FOR var_key, var_value IN SELECT * FROM jsonb_each_text(p_variables)
    LOOP
        final_title := REPLACE(final_title, '{{' || var_key || '}}', var_value);
        final_message := REPLACE(final_message, '{{' || var_key || '}}', var_value);
    END LOOP;
    
    -- Insert notification
    INSERT INTO notifications (user_id, title, message, type, priority, data)
    VALUES (p_user_id, final_title, final_message, template_record.type, template_record.priority, p_variables)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old read notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE is_read = true
    AND created_at < NOW() - (days_old || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get notification summary
CREATE OR REPLACE FUNCTION get_notification_summary(p_user_id UUID)
RETURNS TABLE (
    unread_count BIGINT,
    urgent_count BIGINT,
    recent_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM notifications WHERE user_id = p_user_id AND is_read = false)::BIGINT,
        (SELECT COUNT(*) FROM notifications WHERE user_id = p_user_id AND is_read = false AND priority = 'urgent')::BIGINT,
        (SELECT COUNT(*) FROM notifications WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '24 hours')::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to automatically create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default preferences for new users
CREATE TRIGGER create_user_notification_preferences
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_preferences();
