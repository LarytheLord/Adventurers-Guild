-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('adventurer', 'company', 'admin');

-- CreateEnum
CREATE TYPE "UserRank" AS ENUM ('F', 'E', 'D', 'C', 'B', 'A', 'S');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('available', 'busy', 'on_leave');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('startup', 'small', 'medium', 'large', 'enterprise');

-- CreateEnum
CREATE TYPE "QuestType" AS ENUM ('commission', 'internal', 'bug_bounty', 'code_refactor', 'learning');

-- CreateEnum
CREATE TYPE "QuestStatus" AS ENUM ('draft', 'available', 'in_progress', 'review', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "QuestCategory" AS ENUM ('frontend', 'backend', 'fullstack', 'mobile', 'ai_ml', 'devops', 'security', 'qa', 'design', 'data_science');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('assigned', 'started', 'in_progress', 'submitted', 'pending_admin_review', 'review', 'completed', 'cancelled', 'needs_rework');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('pending', 'under_review', 'approved', 'needs_rework', 'rejected', 'superseded');

-- CreateEnum
CREATE TYPE "RevisionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "QuestTrack" AS ENUM ('OPEN', 'INTERN', 'BOOTCAMP');

-- CreateEnum
CREATE TYPE "QuestSource" AS ENUM ('BACKLOG', 'HACKATHON', 'CLIENT_PORTAL', 'INTERNAL', 'TUTORIAL');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('owner', 'admin', 'member');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('quest_assigned', 'quest_updated', 'quest_completed', 'quest_reviewed', 'new_message', 'rank_up', 'skill_unlocked', 'team_invite', 'payment_received', 'system_message', 'mentorship_request', 'mentorship_approved', 'stale_update');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('company', 'identity', 'skill', 'portfolio');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'approved', 'rejected', 'in_review');

-- CreateTable
CREATE TABLE "quest_field_templates" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quest_category" "QuestCategory",
    "quest_type" "QuestType",
    "brief_fields" JSONB NOT NULL,
    "submission_fields" JSONB NOT NULL,
    "default_criteria" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "quest_field_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'adventurer',
    "rank" "UserRank" NOT NULL DEFAULT 'F',
    "xp" INTEGER NOT NULL DEFAULT 0,
    "skill_points" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "last_login_at" TIMESTAMPTZ,
    "bio" TEXT,
    "location" TEXT,
    "website" TEXT,
    "discord" TEXT,
    "github" TEXT,
    "linkedin" TEXT,
    "avatar" TEXT,
    "mentor_eligible" BOOLEAN NOT NULL DEFAULT false,
    "mentor_tier" INTEGER,
    "mentor_badge_count" INTEGER NOT NULL DEFAULT 0,
    "referral_code" TEXT,
    "referred_by_id" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bootcamp_links" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "bootcamp_student_id" TEXT NOT NULL,
    "cohort" TEXT,
    "bootcamp_track" TEXT NOT NULL,
    "bootcamp_week" INTEGER NOT NULL DEFAULT 1,
    "enrolled_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "graduated_at" TIMESTAMPTZ,
    "tutorial_quest_1_complete" BOOLEAN NOT NULL DEFAULT false,
    "tutorial_quest_2_complete" BOOLEAN NOT NULL DEFAULT false,
    "eligible_for_real_quests" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "bootcamp_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adventurer_profiles" (
    "user_id" UUID NOT NULL,
    "specialization" TEXT,
    "primary_skills" TEXT[],
    "availability_status" "AvailabilityStatus" NOT NULL DEFAULT 'available',
    "quest_completion_rate" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "total_quests_completed" INTEGER NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "max_streak" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" DATE,
    "last_streak_date" DATE,
    "streak_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "stripe_account_id" TEXT,
    "razorpay_contact_id" TEXT,
    "razorpay_fund_account_id" TEXT,
    "student_type" TEXT,
    "institution_name" TEXT,
    "year_or_experience" TEXT,
    "interests" TEXT[],
    "daily_work_hours" TEXT,
    "expectations" TEXT,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "auto_assign" BOOLEAN NOT NULL DEFAULT false,
    "guild_score" INTEGER NOT NULL DEFAULT 100,
    "delivery_rate" DECIMAL(5,2) NOT NULL DEFAULT 100.0,
    "on_time_rate" DECIMAL(5,2) NOT NULL DEFAULT 100.0,
    "update_consistency" DECIMAL(5,2) NOT NULL DEFAULT 100.0,
    "phone_number" TEXT,

    CONSTRAINT "adventurer_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "company_profiles" (
    "user_id" UUID NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_website" TEXT,
    "company_description" TEXT,
    "industry" TEXT,
    "size" "CompanySize",
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "quests_posted" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "stripe_customer_id" TEXT,
    "razorpay_customer_id" TEXT,
    "subscription_plan" TEXT NOT NULL DEFAULT 'starter',
    "stripe_subscription_id" TEXT,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "quests" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "detailed_description" TEXT,
    "quest_type" "QuestType" NOT NULL DEFAULT 'commission',
    "status" "QuestStatus" NOT NULL DEFAULT 'available',
    "difficulty" "UserRank" NOT NULL DEFAULT 'D',
    "xp_reward" INTEGER NOT NULL,
    "skill_points_reward" INTEGER NOT NULL DEFAULT 0,
    "monetary_reward" DECIMAL(10,2),
    "required_skills" TEXT[],
    "required_rank" "UserRank",
    "max_participants" INTEGER,
    "quest_category" "QuestCategory" NOT NULL,
    "track" "QuestTrack" NOT NULL DEFAULT 'OPEN',
    "source" "QuestSource" NOT NULL DEFAULT 'CLIENT_PORTAL',
    "company_id" UUID,
    "admin_notes" JSONB,
    "parent_quest_id" UUID,
    "max_revisions" INTEGER NOT NULL DEFAULT 2,
    "revision_count" INTEGER NOT NULL DEFAULT 0,
    "hackathon_event_id" TEXT,
    "partner_org_name" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deadline" TIMESTAMPTZ,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "field_template_id" UUID,
    "brief_data" JSONB,
    "acceptance_criteria" TEXT[],
    "tasks" TEXT[],
    "qa_criteria" JSONB,

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathon_events" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "date" TIMESTAMPTZ NOT NULL,
    "total_teams" INTEGER,
    "quests_created" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hackathon_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revision_requests" (
    "id" UUID NOT NULL,
    "quest_id" UUID NOT NULL,
    "unmet_criteria" TEXT[],
    "description" TEXT NOT NULL,
    "is_new_scope" BOOLEAN NOT NULL DEFAULT false,
    "status" "RevisionStatus" NOT NULL DEFAULT 'PENDING',
    "deadline" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ,

    CONSTRAINT "revision_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,

    CONSTRAINT "skill_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" UUID,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "experience_points" INTEGER NOT NULL DEFAULT 0,
    "last_practiced_at" TIMESTAMPTZ,

    CONSTRAINT "skill_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatar_url" TEXT,
    "max_members" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "owner_user_id" UUID,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_assignments" (
    "id" UUID NOT NULL,
    "quest_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'assigned',
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "progress" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "submitted_at" TIMESTAMPTZ,
    "notes" TEXT,
    "completed_tasks" TEXT[],
    "last_update_at" TIMESTAMPTZ,

    CONSTRAINT "quest_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_submissions" (
    "id" UUID NOT NULL,
    "assignment_id" UUID NOT NULL,
    "user_id" UUID,
    "submission_content" TEXT NOT NULL,
    "submission_notes" TEXT,
    "submission_data" JSONB,
    "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'pending',
    "reviewer_id" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "review_notes" JSONB,
    "criteria_results" JSONB,
    "quality_score" INTEGER,

    CONSTRAINT "quest_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_completions" (
    "id" UUID NOT NULL,
    "quest_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "completion_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xp_earned" INTEGER NOT NULL,
    "skill_points_earned" INTEGER NOT NULL,
    "quality_score" INTEGER,

    CONSTRAINT "quest_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "data" JSONB,
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_requests" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "request_type" "VerificationType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "request_data" JSONB NOT NULL,
    "admin_notes" TEXT,
    "admin_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "processed_at" TIMESTAMPTZ,

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "from_user_id" UUID,
    "to_user_id" UUID,
    "quest_id" UUID,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_method" TEXT NOT NULL DEFAULT 'credit_card',
    "transaction_id" TEXT,
    "description" TEXT,
    "payment_provider" TEXT,
    "provider_payment_id" TEXT,
    "provider_order_id" TEXT,
    "platform_fee" DECIMAL(10,2),
    "platform_fee_rate" DECIMAL(4,4),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentorships" (
    "id" UUID NOT NULL,
    "mentor_id" UUID NOT NULL,
    "mentee_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "start_date" TIMESTAMPTZ,
    "end_date" TIMESTAMPTZ,
    "goals" TEXT[],
    "progress" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "mentorships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_logs" (
    "id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'error',
    "url" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parties" (
    "id" UUID NOT NULL,
    "quest_id" UUID NOT NULL,
    "leader_id" UUID NOT NULL,
    "track" "QuestTrack" NOT NULL,
    "max_size" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party_members" (
    "id" UUID NOT NULL,
    "party_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_leader" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "party_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_key_budgets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "week_start" TIMESTAMPTZ NOT NULL,
    "spent" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "cap" DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "api_key_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "unlocked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_rewards" (
    "id" UUID NOT NULL,
    "giver_id" UUID NOT NULL,
    "earner_id" UUID NOT NULL,
    "event" TEXT NOT NULL,
    "xp_awarded" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_updates" (
    "id" UUID NOT NULL,
    "assignment_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "yesterday" TEXT NOT NULL,
    "today" TEXT NOT NULL,
    "blockers" TEXT,
    "evidence_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quest_field_templates_quest_category_idx" ON "quest_field_templates"("quest_category");

-- CreateIndex
CREATE INDEX "quest_field_templates_quest_type_idx" ON "quest_field_templates"("quest_type");

-- CreateIndex
CREATE INDEX "quest_field_templates_is_active_idx" ON "quest_field_templates"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_rank_idx" ON "users"("rank");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "users_referral_code_idx" ON "users"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "bootcamp_links_user_id_key" ON "bootcamp_links"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "bootcamp_links_bootcamp_student_id_key" ON "bootcamp_links"("bootcamp_student_id");

-- CreateIndex
CREATE INDEX "quests_company_id_idx" ON "quests"("company_id");

-- CreateIndex
CREATE INDEX "quests_status_idx" ON "quests"("status");

-- CreateIndex
CREATE INDEX "quests_quest_category_idx" ON "quests"("quest_category");

-- CreateIndex
CREATE INDEX "quests_difficulty_idx" ON "quests"("difficulty");

-- CreateIndex
CREATE INDEX "quests_track_idx" ON "quests"("track");

-- CreateIndex
CREATE INDEX "quests_source_idx" ON "quests"("source");

-- CreateIndex
CREATE INDEX "quests_parent_quest_id_idx" ON "quests"("parent_quest_id");

-- CreateIndex
CREATE INDEX "quests_field_template_id_idx" ON "quests"("field_template_id");

-- CreateIndex
CREATE INDEX "quests_created_at_idx" ON "quests"("created_at");

-- CreateIndex
CREATE INDEX "revision_requests_quest_id_idx" ON "revision_requests"("quest_id");

-- CreateIndex
CREATE INDEX "revision_requests_status_idx" ON "revision_requests"("status");

-- CreateIndex
CREATE INDEX "skill_progress_user_id_idx" ON "skill_progress"("user_id");

-- CreateIndex
CREATE INDEX "skill_progress_skill_id_idx" ON "skill_progress"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_progress_user_id_skill_id_key" ON "skill_progress"("user_id", "skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_user_id_key" ON "team_members"("team_id", "user_id");

-- CreateIndex
CREATE INDEX "quest_assignments_user_id_idx" ON "quest_assignments"("user_id");

-- CreateIndex
CREATE INDEX "quest_assignments_quest_id_idx" ON "quest_assignments"("quest_id");

-- CreateIndex
CREATE INDEX "quest_assignments_status_idx" ON "quest_assignments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "quest_assignments_quest_id_user_id_key" ON "quest_assignments"("quest_id", "user_id");

-- CreateIndex
CREATE INDEX "quest_submissions_assignment_id_idx" ON "quest_submissions"("assignment_id");

-- CreateIndex
CREATE INDEX "quest_submissions_status_idx" ON "quest_submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "quest_completions_quest_id_user_id_key" ON "quest_completions"("quest_id", "user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transaction_id_key" ON "transactions"("transaction_id");

-- CreateIndex
CREATE INDEX "transactions_from_user_id_idx" ON "transactions"("from_user_id");

-- CreateIndex
CREATE INDEX "transactions_to_user_id_idx" ON "transactions"("to_user_id");

-- CreateIndex
CREATE INDEX "transactions_quest_id_idx" ON "transactions"("quest_id");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- CreateIndex
CREATE INDEX "transactions_completed_at_idx" ON "transactions"("completed_at");

-- CreateIndex
CREATE INDEX "mentorships_mentor_id_idx" ON "mentorships"("mentor_id");

-- CreateIndex
CREATE INDEX "mentorships_mentee_id_idx" ON "mentorships"("mentee_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "error_logs_severity_idx" ON "error_logs"("severity");

-- CreateIndex
CREATE INDEX "error_logs_timestamp_idx" ON "error_logs"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "parties_quest_id_key" ON "parties"("quest_id");

-- CreateIndex
CREATE UNIQUE INDEX "party_members_party_id_user_id_key" ON "party_members"("party_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_key_budgets_user_id_week_start_key" ON "api_key_budgets"("user_id", "week_start");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "achievements_user_id_idx" ON "achievements"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_user_id_type_key" ON "achievements"("user_id", "type");

-- CreateIndex
CREATE INDEX "referral_rewards_giver_id_idx" ON "referral_rewards"("giver_id");

-- CreateIndex
CREATE INDEX "referral_rewards_earner_id_idx" ON "referral_rewards"("earner_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_rewards_giver_id_earner_id_event_key" ON "referral_rewards"("giver_id", "earner_id", "event");

-- CreateIndex
CREATE INDEX "daily_updates_assignment_id_idx" ON "daily_updates"("assignment_id");

-- CreateIndex
CREATE INDEX "daily_updates_user_id_idx" ON "daily_updates"("user_id");

-- CreateIndex
CREATE INDEX "daily_updates_created_at_idx" ON "daily_updates"("created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_links" ADD CONSTRAINT "bootcamp_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adventurer_profiles" ADD CONSTRAINT "adventurer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_field_template_id_fkey" FOREIGN KEY ("field_template_id") REFERENCES "quest_field_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_parent_quest_id_fkey" FOREIGN KEY ("parent_quest_id") REFERENCES "quests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_requests" ADD CONSTRAINT "revision_requests_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "skill_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_progress" ADD CONSTRAINT "skill_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_progress" ADD CONSTRAINT "skill_progress_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_assignments" ADD CONSTRAINT "quest_assignments_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_assignments" ADD CONSTRAINT "quest_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_submissions" ADD CONSTRAINT "quest_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "quest_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_submissions" ADD CONSTRAINT "quest_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_submissions" ADD CONSTRAINT "quest_submissions_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_completions" ADD CONSTRAINT "quest_completions_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_completions" ADD CONSTRAINT "quest_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorships" ADD CONSTRAINT "mentorships_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorships" ADD CONSTRAINT "mentorships_mentee_id_fkey" FOREIGN KEY ("mentee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parties" ADD CONSTRAINT "parties_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parties" ADD CONSTRAINT "parties_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_members" ADD CONSTRAINT "party_members_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_members" ADD CONSTRAINT "party_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key_budgets" ADD CONSTRAINT "api_key_budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_giver_id_fkey" FOREIGN KEY ("giver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_earner_id_fkey" FOREIGN KEY ("earner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_updates" ADD CONSTRAINT "daily_updates_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "quest_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_updates" ADD CONSTRAINT "daily_updates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
