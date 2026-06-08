-- Additive migration for the Quest Context Loop feature.
-- Applied via `prisma db execute` because `prisma db push` is blocked by a
-- pre-existing drift (12 legacy users with NULL username). These statements
-- touch NO existing data — they only add a new table and new columns.

-- 1. QuestFieldTemplate ------------------------------------------------------
CREATE TABLE IF NOT EXISTS "quest_field_templates" (
  "id"                UUID         NOT NULL DEFAULT gen_random_uuid(),
  "name"              TEXT         NOT NULL,
  "description"       TEXT,
  "quest_category"    "QuestCategory",
  "quest_type"        "QuestType",
  "brief_fields"      JSONB        NOT NULL,
  "submission_fields" JSONB        NOT NULL,
  "default_criteria"  TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
  "is_active"         BOOLEAN      NOT NULL DEFAULT true,
  "is_default"        BOOLEAN      NOT NULL DEFAULT false,
  "created_at"        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updated_at"        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT "quest_field_templates_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "quest_field_templates_quest_category_idx" ON "quest_field_templates"("quest_category");
CREATE INDEX IF NOT EXISTS "quest_field_templates_quest_type_idx"     ON "quest_field_templates"("quest_type");
CREATE INDEX IF NOT EXISTS "quest_field_templates_is_active_idx"      ON "quest_field_templates"("is_active");

-- 2. Quest: structured brief side -------------------------------------------
ALTER TABLE "quests" ADD COLUMN IF NOT EXISTS "field_template_id"   UUID;
ALTER TABLE "quests" ADD COLUMN IF NOT EXISTS "brief_data"          JSONB;
ALTER TABLE "quests" ADD COLUMN IF NOT EXISTS "acceptance_criteria" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
CREATE INDEX IF NOT EXISTS "quests_field_template_id_idx" ON "quests"("field_template_id");

DO $$ BEGIN
  ALTER TABLE "quests"
    ADD CONSTRAINT "quests_field_template_id_fkey"
    FOREIGN KEY ("field_template_id") REFERENCES "quest_field_templates"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. QuestSubmission: structured submission + evaluation side ----------------
ALTER TABLE "quest_submissions" ADD COLUMN IF NOT EXISTS "submission_data"  JSONB;
ALTER TABLE "quest_submissions" ADD COLUMN IF NOT EXISTS "criteria_results" JSONB;
