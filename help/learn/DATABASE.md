# Database Schema Documentation

This document provides detailed information about the database schema used in The Adventurers Guild platform.

## Overview

The Adventurers Guild uses PostgreSQL as its primary database, hosted on Supabase. The schema is designed to support:

1. **User Management** - Authentication, profiles, and roles
2. **Quest System** - Creation, application, and completion of quests
3. **Skill Development** - Skill trees, progress tracking, and achievements
4. **Gamification** - XP, ranks, and rewards system
5. **Community Features** - Notifications and social interactions

## Custom Types

### user_role
Enumeration of user roles in the system:
```sql
CREATE TYPE user_role AS ENUM ('student', 'company', 'admin', 'client');
```

### user_rank
Enumeration of user ranks in the gamification system:
```sql
CREATE TYPE user_rank AS ENUM ('F', 'D', 'C', 'B', 'A', 'S');
```

### quest_status
Enumeration of quest statuses:
```sql
CREATE TYPE quest_status AS ENUM ('draft', 'active', 'in_progress', 'completed', 'cancelled');
```

### quest_difficulty
Enumeration of quest difficulty levels:
```sql
CREATE TYPE quest_difficulty AS ENUM ('F', 'D', 'C', 'B', 'A', 'S');
```

### submission_status
Enumeration of submission statuses:
```sql
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected', 'revision_requested');
```

### transaction_source
Enumeration of sources for skill point transactions:
```sql
CREATE TYPE transaction_source AS ENUM ('quest_completion', 'achievement', 'bonus', 'penalty');
```

## Tables

### users
Extends Supabase auth.users with additional profile information.

**Columns:**
- `id` (UUID, PK) - References auth.users(id)
- `email` (TEXT, Unique) - User email address
- `name` (TEXT) - User's full name
- `username` (TEXT, Unique) - Unique username
- `avatar_url` (TEXT) - URL to user's avatar image
- `role` (user_role) - User's role (default: 'student')
- `rank` (user_rank) - User's current rank (default: 'F')
- `xp` (INTEGER) - Total experience points (default: 0)
- `total_earnings` (DECIMAL(10,2)) - Total earnings from quests (default: 0)
- `bio` (TEXT) - User biography
- `github_url` (TEXT) - Link to GitHub profile
- `linkedin_url` (TEXT) - Link to LinkedIn profile
- `location` (TEXT) - User's location
- `skills` (JSONB) - User's skills (default: '{}')
- `is_active` (BOOLEAN) - Account status (default: true)
- `created_at` (TIMESTAMP WITH TIME ZONE) - Creation timestamp (default: NOW())
- `updated_at` (TIMESTAMP WITH TIME ZONE) - Last update timestamp (default: NOW())

**Indexes:**
- `idx_users_role` - Index on role column
- `idx_users_rank` - Index on rank column

### skill_categories
Categories for organizing skills in the skill tree.

**Columns:**
- `id` (UUID, PK) - Unique identifier (default: uuid_generate_v4())
- `name` (TEXT) - Category name
- `description` (TEXT) - Category description
- `icon` (TEXT) - Icon identifier
- `color` (TEXT) - Color for UI representation
- `max_skill_points` (INTEGER) - Maximum skill points in this category (default: 3000)
- `created_at` (TIMESTAMP WITH TIME ZONE) - Creation timestamp (default: NOW())

### skills
Individual skills within categories.

**Columns:**
- `id` (UUID, PK) - Unique identifier (default: uuid_generate_v4())
- `category_id` (UUID, FK) - References skill_categories(id) with CASCADE DELETE
- `name` (TEXT) - Skill name
- `description` (TEXT) - Skill description
- `max_level` (INTEGER) - Maximum level for this skill (default: 5)
- `points_per_level` (INTEGER) - Points required per level (default: 100)
- `prerequisites` (JSONB) - Array of prerequisite skill IDs (default: '[]')
- `icon` (TEXT) - Icon identifier
- `color` (TEXT) - Color for UI representation
- `is_active` (BOOLEAN) - Skill availability (default: true)
- `created_at` (TIMESTAMP WITH TIME ZONE) - Creation timestamp (default: NOW())

### user_skills
Tracks user progress in individual skills.

**Columns:**
- `id` (UUID, PK) - Unique identifier (default: uuid_generate_v4())
- `user_id` (UUID, FK) - References users(id) with CASCADE DELETE
- `skill_id` (UUID, FK) - References skills(id) with CASCADE DELETE
- `level` (INTEGER) - Current skill level (default: 0)
- `skill_points` (INTEGER) - Current skill points (default: 0)
- `is_unlocked` (BOOLEAN) - Whether skill is unlocked (default: false)
- `unlocked_at` (TIMESTAMP WITH TIME ZONE) - When skill was unlocked
- `created_at` (TIMESTAMP WITH TIME ZONE) - Creation timestamp (default: NOW())
- `updated_at` (TIMESTAMP WITH TIME ZONE) - Last update timestamp (default: NOW())

**Constraints:**
- Unique constraint on (user_id, skill_id)

**Indexes:**
- `idx_user_skills_user_id` - Index on user_id column

### quests
Quests/commissions posted by companies.

**Columns:**
- `id` (UUID, PK) - Unique identifier (default: uuid_generate_v4())
- `title` (TEXT) - Quest title
- `description` (TEXT) - Quest description
- `requirements` (TEXT) - Quest requirements
- `difficulty` (quest_difficulty) - Quest difficulty level
- `xp_reward` (INTEGER) - XP reward for completion
- `skill_rewards` (JSONB) - Skill point rewards (default: '{}')
- `budget` (DECIMAL(10,2)) - Total budget for quest
- `payment_amount` (DECIMAL(10,2)) - Amount paid to adventurer
- `deadline` (TIMESTAMP WITH TIME ZONE) - Quest deadline
- `status` (quest_status) - Current quest status (default: 'draft')
- `company_id` (UUID, FK) - References users(id) with CASCADE DELETE
- `assigned_to` (UUID, FK) - References users(id)
- `max_applicants` (INTEGER) - Maximum number of applicants (default: 1)
- `tags` (TEXT[]) - Array of tags (default: '{}')
- `attachments` (JSONB) - Array of attachment URLs (default: '[]')
- `is_featured` (BOOLEAN) - Whether quest is featured (default: false)
- `created_at` (TIMESTAMP WITH TIME ZONE) - Creation timestamp (default: NOW())
- `updated_at` (TIMESTAMP WITH TIME ZONE) - Last update timestamp (default: NOW())

**Indexes:**
- `idx_quests_status` - Index on status column
- `idx_quests_difficulty` - Index on difficulty column
- `idx_quests_company_id` - Index on company_id column

### quest_applications
Applications from adventurers for quests.

**Columns:**
- `id` (UUID, PK) - Unique identifier (default: uuid_generate_v4())
- `quest_id` (UUID, FK) - References quests(id) with CASCADE DELETE
- `user_id` (UUID, FK) - References users(id) with CASCADE DELETE
- `cover_letter` (TEXT) - Application cover letter
- `proposed_timeline` (TEXT) - Proposed completion timeline
- `status` (submission_status) - Application status (default: 'pending')
- `applied_at` (TIMESTAMP WITH TIME ZONE) - Application timestamp (default: NOW())
- `reviewed_at` (TIMESTAMP WITH TIME ZONE) - Review timestamp
- `reviewer_notes` (TEXT) - Notes from reviewer

**Constraints:**
- Unique constraint on (quest_id, user_id)

**Indexes:**
- `idx_quest_applications_user_id` - Index on user_id column
- `idx_quest_applications_quest_id` - Index on quest_id column

### quest_submissions
Submissions from adventurers for completed quests.

**Columns:**
- `id` (UUID, PK) - Unique identifier (default: uuid_generate_v4())
- `quest_id` (UUID, FK) - References quests(id) with CASCADE DELETE
- `user_id` (UUID, FK) - References users(id) with CASCADE DELETE
- `submission_url` (TEXT) - URL to submission (e.g., GitHub repo)
- `github_repo` (TEXT) - GitHub repository name
- `demo_url` (TEXT) - URL to demo/preview
- `description` (TEXT) - Submission description
- `attachments` (JSONB) - Array of attachment URLs (default: '[]')
- `status` (submission_status) - Submission status (default: 'pending')
- `feedback` (TEXT) - Feedback from reviewer
- `rating` (INTEGER) - 1-5 star rating (CHECK: rating >= 1 AND rating <= 5)
- `submitted_at` (TIMESTAMP WITH TIME ZONE) - Submission timestamp (default: NOW())
- `reviewed_at` (TIMESTAMP WITH TIME ZONE) - Review timestamp
- `reviewer_id` (UUID, FK) - References users(id)

### skill_transactions
Audit trail of skill point transactions.

**Columns:**
- `id` (UUID, PK) - Unique identifier (default: uuid_generate_v4())
- `user_id` (UUID, FK) - References users(id) with CASCADE DELETE
- `skill_id` (UUID, FK) - References skills(id) with CASCADE DELETE
- `points` (INTEGER) - Points awarded/deducted (positive/negative)
- `source_type` (transaction_source) - Source of transaction
- `source_id` (UUID) - ID of source (quest_id, achievement_id, etc.)
- `description` (TEXT) - Description of transaction
- `created_at` (TIMESTAMP WITH TIME ZONE) - Transaction timestamp (default: NOW())

**Indexes:**
- `idx_skill_transactions_user_id` - Index on user_id column

### achievements
Available achievements for users to unlock.

**Columns:**
- `id` (UUID, PK) - Unique identifier (default: uuid_generate_v4())
- `name` (TEXT) - Achievement name
- `description` (TEXT) - Achievement description
- `icon` (TEXT) - Icon identifier
- `badge_color` (TEXT) - Color for badge display
- `xp_reward` (INTEGER) - XP reward (default: 0)
- `skill_rewards` (JSONB) - Skill point rewards (default: '{}')
- `requirements` (JSONB) - Conditions to unlock (not null)
- `is_active` (BOOLEAN) - Achievement availability (default: true)
- `created_at` (TIMESTAMP WITH TIME ZONE) - Creation timestamp (default: NOW())

### user_achievements
Tracks which achievements users have unlocked.

**Columns:**
- `id` (UUID, PK) - Unique identifier (default: uuid_generate_v4())
- `user_id` (UUID, FK) - References users(id) with CASCADE DELETE
- `achievement_id` (UUID, FK) - References achievements(id) with CASCADE DELETE
- `earned_at` (TIMESTAMP WITH TIME ZONE) - When achievement was earned (default: NOW())

**Constraints:**
- Unique constraint on (user_id, achievement_id)

### notifications
User notifications for various events.

**Columns:**
- `id` (UUID, PK) - Unique identifier (default: uuid_generate_v4())
- `user_id` (UUID, FK) - References users(id) with CASCADE DELETE
- `title` (TEXT) - Notification title
- `message` (TEXT) - Notification message
- `type` (TEXT) - Type of notification ('quest_update', 'skill_unlock', 'achievement', etc.)
- `data` (JSONB) - Additional data (default: '{}')
- `is_read` (BOOLEAN) - Read status (default: false)
- `created_at` (TIMESTAMP WITH TIME ZONE) - Creation timestamp (default: NOW())

**Indexes:**
- `idx_notifications_user_id_unread` - Composite index on user_id and is_read

### companies
Extended information for company users.

**Columns:**
- `id` (UUID, PK) - Unique identifier (default: uuid_generate_v4())
- `user_id` (UUID, FK) - References users(id) with CASCADE DELETE (Unique)
- `company_name` (TEXT) - Company name (not null)
- `website` (TEXT) - Company website
- `industry` (TEXT) - Industry/sector
- `company_size` (TEXT) - Company size
- `description` (TEXT) - Company description
- `logo_url` (TEXT) - URL to company logo
- `verified` (BOOLEAN) - Verification status (default: false)
- `created_at` (TIMESTAMP WITH TIME ZONE) - Creation timestamp (default: NOW())

## Relationships

### User Relationships
```
users 1---* user_skills
users 1---* quest_applications
users 1---* quest_submissions
users 1---1 companies (for company users)
users 1---* quests (as company)
users 1---* quest_submissions (as reviewer)
users 1---* skill_transactions
users 1---* user_achievements
users 1---* notifications
```

### Quest Relationships
```
quests 1---* quest_applications
quests 1---* quest_submissions
quests 1---1 users (company_id)
quests 1---1 users (assigned_to)
```

### Skill Relationships
```
skill_categories 1---* skills
skills 1---* user_skills
skills 1---* skill_transactions
```

### Achievement Relationships
```
achievements 1---* user_achievements
```

## Triggers

### update_updated_at_column
Function to automatically update the `updated_at` timestamp:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

**Applied to:**
- `users` table
- `user_skills` table
- `quests` table

## Indexes Summary

All key foreign keys and frequently queried columns have indexes:
- `idx_users_role` - Users by role
- `idx_users_rank` - Users by rank
- `idx_quests_status` - Quests by status
- `idx_quests_difficulty` - Quests by difficulty
- `idx_quests_company_id` - Quests by company
- `idx_quest_applications_user_id` - Applications by user
- `idx_quest_applications_quest_id` - Applications by quest
- `idx_user_skills_user_id` - Skills by user
- `idx_skill_transactions_user_id` - Transactions by user
- `idx_notifications_user_id_unread` - Notifications by user and read status

## Row Level Security (RLS)

RLS policies are implemented to ensure data security:
- Users can only view/edit their own data
- Companies can view/edit their own quests
- Admins have broader access for moderation
- Companies can review applications for their quests
- Users can view public quest information

## Sample Queries

### Get user profile with skills
```sql
SELECT u.*, 
       json_agg(us.*) as user_skills
FROM users u
LEFT JOIN user_skills us ON u.id = us.user_id
WHERE u.id = 'user-uuid'
GROUP BY u.id;
```

### Get quests with company information
```sql
SELECT q.*, 
       u.company_name as company_name,
       u.logo_url as company_logo
FROM quests q
JOIN users u ON q.company_id = u.id
WHERE q.status = 'active'
ORDER BY q.created_at DESC;
```

### Get user's quest applications
```sql
SELECT qa.*, 
       q.title as quest_title,
       q.difficulty as quest_difficulty
FROM quest_applications qa
JOIN quests q ON qa.quest_id = q.id
WHERE qa.user_id = 'user-uuid'
ORDER BY qa.applied_at DESC;
```

This schema is designed to be flexible and scalable while maintaining data integrity through proper relationships and constraints.