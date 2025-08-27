-- WARNING: This script will completely remove all data and tables from your database!
-- ONLY run this if you want to completely reset your database!

-- Disable triggers to avoid issues during deletion
SET session_replication_role = replica;

-- Drop all tables in the correct order to avoid foreign key constraint issues
-- First drop tables with foreign key references
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.quest_submissions CASCADE;
DROP TABLE IF EXISTS public.quest_applications CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.skill_transactions CASCADE;
DROP TABLE IF EXISTS public.user_skills CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.quests CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.skill_categories CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;

-- Drop the users table last (since other tables reference it)
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.user_rank CASCADE;
DROP TYPE IF EXISTS public.quest_status CASCADE;
DROP TYPE IF EXISTS public.quest_difficulty CASCADE;
DROP TYPE IF EXISTS public.submission_status CASCADE;
DROP TYPE IF EXISTS public.transaction_source CASCADE;

-- Drop the trigger function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";