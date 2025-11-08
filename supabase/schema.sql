-- Supabase Schema for The Adventurers Guild
-- Correctly ordered schema with proper dependencies

-- First, create all the custom enum types
create type user_role as enum ('adventurer', 'company', 'admin');
create type user_rank as enum ('F', 'E', 'D', 'C', 'B', 'A', 'S');
create type availability_status as enum ('available', 'busy', 'on_leave');
create type company_size as enum ('startup', 'small', 'medium', 'large', 'enterprise');
create type quest_type as enum ('commission', 'internal', 'bug_bounty', 'code_refactor', 'learning');
create type quest_status as enum ('draft', 'available', 'in_progress', 'review', 'completed', 'cancelled');
create type quest_category as enum ('frontend', 'backend', 'fullstack', 'mobile', 'ai_ml', 'devops', 'security', 'qa', 'design', 'data_science');
create type assignment_status as enum ('assigned', 'started', 'in_progress', 'submitted', 'review', 'completed', 'cancelled');
create type submission_status as enum ('pending', 'under_review', 'approved', 'needs_rework', 'rejected');
create type team_role as enum ('owner', 'admin', 'member');
create type notification_type as enum ('quest_assigned', 'quest_updated', 'quest_completed', 'quest_reviewed', 'new_message', 'rank_up', 'skill_unlocked', 'team_invite', 'payment_received', 'system_message');
create type verification_type as enum ('company', 'identity', 'skill', 'portfolio');
create type verification_status as enum ('pending', 'approved', 'rejected', 'in_review');

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create base tables first (no foreign key dependencies)

-- Users table (extends auth.users)
create table if not exists public.users (
    id uuid references auth.users primary key,
    name text,
    email text unique,
    role user_role default 'adventurer',
    rank user_rank default 'F',
    xp integer default 0,
    skill_points integer default 0,
    level integer default 1,
    is_active boolean default true,
    is_verified boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now()),
    last_login_at timestamp with time zone,
    bio text,
    location text,
    website text,
    discord text,
    github text,
    linkedin text
);

-- Skill categories
create table if not exists public.skill_categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    icon text
);

-- Teams (without owner reference initially)
create table if not exists public.teams (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    avatar_url text,
    max_members integer default 5,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now()),
    is_active boolean default true,
    owner_user_id uuid
);

-- Create tables with single-level dependencies

-- Adventurer profiles
create table if not exists public.adventurer_profiles (
    user_id uuid references public.users primary key,
    specialization text,
    primary_skills text[],
    availability_status availability_status default 'available',
    quest_completion_rate decimal(5,2) default 0.00,
    total_quests_completed integer default 0,
    current_streak integer default 0,
    max_streak integer default 0
);

-- Company profiles
create table if not exists public.company_profiles (
    user_id uuid references public.users primary key,
    company_name text not null,
    company_website text,
    company_description text,
    industry text,
    size company_size,
    is_verified boolean default false,
    quests_posted integer default 0,
    total_spent decimal(10,2) default 0.00
);

-- Skills
create table if not exists public.skills (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text not null,
    category_id uuid references public.skill_categories
);

-- Add the foreign key constraint for teams now that users table exists
alter table public.teams 
add constraint fk_teams_owner 
foreign key (owner_user_id) references public.users(id);

-- Create tables with two-level dependencies

-- Quests table
create table if not exists public.quests (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text not null,
    detailed_description text,
    quest_type quest_type default 'commission',
    status quest_status default 'available',
    difficulty user_rank default 'D',
    xp_reward integer not null,
    skill_points_reward integer default 0,
    monetary_reward decimal(10,2),
    required_skills text[],
    required_rank user_rank,
    max_participants integer,
    quest_category quest_category not null,
    company_id uuid references public.users,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now()),
    deadline timestamp with time zone
);

-- Skill progress
create table if not exists public.skill_progress (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users on delete cascade,
    skill_id uuid references public.skills on delete cascade,
    level integer default 0 check (level >= 0 and level <= 5),
    experience_points integer default 0,
    last_practiced_at timestamp with time zone,
    unique(user_id, skill_id)
);

-- Team members
create table if not exists public.team_members (
    id uuid default uuid_generate_v4() primary key,
    team_id uuid references public.teams on delete cascade,
    user_id uuid references public.users on delete cascade,
    role team_role default 'member',
    joined_at timestamp with time zone default timezone('utc'::text, now()),
    is_active boolean default true,
    unique(team_id, user_id)
);

-- Create tables with three-level dependencies

-- Quest assignments
create table if not exists public.quest_assignments (
    id uuid default uuid_generate_v4() primary key,
    quest_id uuid references public.quests on delete cascade,
    user_id uuid references public.users on delete cascade,
    assigned_at timestamp with time zone default timezone('utc'::text, now()),
    status assignment_status default 'assigned',
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    progress decimal(5,2) default 0.00,
    unique(quest_id, user_id)
);

-- Notifications
create table if not exists public.notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users on delete cascade,
    title text not null,
    message text not null,
    type notification_type not null,
    data jsonb,
    read_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Verification requests
create table if not exists public.verification_requests (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users on delete cascade,
    request_type verification_type not null,
    status verification_status default 'pending',
    request_data jsonb not null,
    admin_notes text,
    admin_id uuid references public.users,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now()),
    processed_at timestamp with time zone
);

-- Create tables with four-level dependencies

-- Quest submissions
create table if not exists public.quest_submissions (
    id uuid default uuid_generate_v4() primary key,
    assignment_id uuid references public.quest_assignments on delete cascade,
    user_id uuid references public.users,
    submission_content text not null,
    submission_notes text,
    submitted_at timestamp with time zone default timezone('utc'::text, now()),
    status submission_status default 'pending',
    reviewer_id uuid references public.users,
    reviewed_at timestamp with time zone,
    review_notes text,
    quality_score integer check (quality_score >= 1 and quality_score <= 10)
);

-- Quest completions
create table if not exists public.quest_completions (
    id uuid default uuid_generate_v4() primary key,
    quest_id uuid references public.quests on delete cascade,
    user_id uuid references public.users on delete cascade,
    completion_date timestamp with time zone default timezone('utc'::text, now()),
    xp_earned integer not null,
    skill_points_earned integer not null,
    quality_score integer check (quality_score >= 1 and quality_score <= 10),
    unique(quest_id, user_id)
);

-- Transactions table for payments
create table if not exists public.transactions (
    id uuid default uuid_generate_v4() primary key,
    from_user_id uuid references public.users,
    to_user_id uuid references public.users,
    quest_id uuid references public.quests,
    amount decimal(10,2) not null,
    currency text default 'USD',
    status text default 'pending',
    payment_method text default 'credit_card',
    transaction_id text unique,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now()),
    completed_at timestamp with time zone
);

-- Enable Row Level Security (RLS) for all tables
alter table public.users enable row level security;
alter table public.adventurer_profiles enable row level security;
alter table public.company_profiles enable row level security;
alter table public.quests enable row level security;
alter table public.quest_assignments enable row level security;
alter table public.quest_submissions enable row level security;
alter table public.quest_completions enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.skill_categories enable row level security;
alter table public.skills enable row level security;
alter table public.skill_progress enable row level security;
alter table public.notifications enable row level security;
alter table public.verification_requests enable row level security;
alter table public.transactions enable row level security;

-- Create profiles view for easier access
create or replace view public.user_profiles as
select 
    u.id,
    u.name,
    u.email,
    u.role,
    u.rank,
    u.xp,
    u.skill_points,
    u.level,
    u.is_active,
    u.is_verified,
    u.bio,
    u.location,
    u.website,
    u.discord,
    u.github,
    u.linkedin,
    ap.specialization,
    ap.primary_skills,
    ap.availability_status,
    ap.quest_completion_rate,
    ap.total_quests_completed,
    ap.current_streak,
    ap.max_streak,
    cp.company_name,
    cp.company_website,
    cp.company_description,
    cp.industry,
    cp.size as company_size,
    cp.is_verified as company_is_verified,
    cp.quests_posted,
    cp.total_spent
from public.users u
left join public.adventurer_profiles ap on u.id = ap.user_id
left join public.company_profiles cp on u.id = cp.user_id;

-- Create indexes for better performance
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_rank on public.users(rank);
create index if not exists idx_users_is_active on public.users(is_active);
create index if not exists idx_quests_company_id on public.quests(company_id);
create index if not exists idx_quests_status on public.quests(status);
create index if not exists idx_quests_category on public.quests(quest_category);
create index if not exists idx_quests_difficulty on public.quests(difficulty);
create index if not exists idx_quests_created_at on public.quests(created_at);
create index if not exists idx_quest_assignments_user_id on public.quest_assignments(user_id);
create index if not exists idx_quest_assignments_quest_id on public.quest_assignments(quest_id);
create index if not exists idx_quest_assignments_status on public.quest_assignments(status);
create index if not exists idx_quest_submissions_assignment_id on public.quest_submissions(assignment_id);
create index if not exists idx_quest_submissions_status on public.quest_submissions(status);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_created_at on public.notifications(created_at);
create index if not exists idx_notifications_type on public.notifications(type);
create index if not exists idx_skill_progress_user_id on public.skill_progress(user_id);
create index if not exists idx_skill_progress_skill_id on public.skill_progress(skill_id);
create index if not exists idx_transactions_from_user_id on public.transactions(from_user_id);
create index if not exists idx_transactions_to_user_id on public.transactions(to_user_id);
create index if not exists idx_transactions_quest_id on public.transactions(quest_id);
create index if not exists idx_transactions_status on public.transactions(status);
create index if not exists idx_transactions_created_at on public.transactions(created_at);
create index if not exists idx_transactions_completed_at on public.transactions(completed_at);

-- RLS Policies

-- Users policies
create policy "Users can view own profile" on public.users
    for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
    for update using (auth.uid() = id);

-- Quests policies
create policy "Anyone can view available quests" on public.quests
    for select using (status = 'available');

create policy "Companies can create quests" on public.quests
    for insert with check (auth.uid() = company_id and exists (
        select 1 from public.users where id = auth.uid() and role = 'company'
    ));

create policy "Quest creators can update quests" on public.quests
    for update using (auth.uid() = company_id);

-- Quest assignments policies
create policy "Users can view own assignments" on public.quest_assignments
    for select using (auth.uid() = user_id);

create policy "Users can assign themselves to available quests" on public.quest_assignments
    for insert with check (exists (
        select 1 from public.quests q 
        where q.id = quest_id and q.status = 'available'
    ));

-- Notifications policies
create policy "Users can view own notifications" on public.notifications
    for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
    for update using (auth.uid() = user_id);

-- Transactions policies
create policy "Users can view own transactions" on public.transactions
    for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- Handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.users (id, name, email)
    values (new.id, new.raw_user_meta_data->>'name', new.email);
    return new;
end;
$$;

-- Trigger the handle_new_user function when a new user signs up
create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Update timestamp trigger
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

create trigger update_users_updated_at before update on public.users
    for each row execute procedure update_updated_at_column();

create trigger update_quests_updated_at before update on public.quests
    for each row execute procedure update_updated_at_column();

create trigger update_verification_requests_updated_at before update on public.verification_requests
    for each row execute procedure update_updated_at_column();

create trigger update_transactions_updated_at before update on public.transactions
    for each row execute procedure update_updated_at_column();

-- Grant permissions
grant all privileges on public.users to anon;
grant all privileges on public.users to authenticated;

grant all privileges on public.adventurer_profiles to anon;
grant all privileges on public.adventurer_profiles to authenticated;

grant all privileges on public.company_profiles to anon;
grant all privileges on public.company_profiles to authenticated;

grant all privileges on public.quests to anon;
grant all privileges on public.quests to authenticated;

grant all privileges on public.quest_assignments to anon;
grant all privileges on public.quest_assignments to authenticated;

grant all privileges on public.quest_submissions to anon;
grant all privileges on public.quest_submissions to authenticated;

grant all privileges on public.quest_completions to anon;
grant all privileges on public.quest_completions to authenticated;

grant all privileges on public.teams to anon;
grant all privileges on public.teams to authenticated;

grant all privileges on public.team_members to anon;
grant all privileges on public.team_members to authenticated;

grant all privileges on public.skill_categories to anon;
grant all privileges on public.skill_categories to authenticated;

grant all privileges on public.skills to anon;
grant all privileges on public.skills to authenticated;

grant all privileges on public.skill_progress to anon;
grant all privileges on public.skill_progress to authenticated;

grant all privileges on public.notifications to anon;
grant all privileges on public.notifications to authenticated;

grant all privileges on public.verification_requests to anon;
grant all privileges on public.verification_requests to authenticated;

grant all privileges on public.transactions to anon;
grant all privileges on public.transactions to authenticated;

-- Grant usage on UUID extension
grant usage on schema public to anon;
grant usage on schema public to authenticated;