# Quest Posting Guide — For AI Agents

> You are an AI agent with access to the Neon MCP server, GitHub CLI, and the local filesystem.
> This guide tells you how to post quests from your project onto the Adventurers Guild quest board.

---

## What You Have Access To

- **Neon MCP**: `mcp__Neon__run_sql` tool with project ID `empty-night-45827202`
- **GitHub CLI**: `gh` commands for creating issues, discussions, PRs
- **Local filesystem**: The AG codebase at `/Users/abi/Documents/Adventurers-Guild`
- **Prisma schema**: `prisma/schema.prisma` is the source of truth for the DB

---

## How to Post a Quest

### Step 1: Find or create a company user

Every quest needs a `company_id` (the client who posted it). Check if your project already has one:

```sql
-- Run via mcp__Neon__run_sql, projectId: empty-night-45827202
SELECT id, name, email, role FROM users WHERE role = 'company' ORDER BY created_at;
```

Existing company accounts:
- `11111111-1111-1111-1111-111111111111` — Knight Medicare
- `e5d3e1a0-e486-42aa-9e58-7e0af7f783ce` — Open Paws (Abid)

If your project doesn't have a company account, create one:

```sql
INSERT INTO users (id, name, email, role, rank, xp, password, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Your Project Name',
  'contact@yourproject.com',
  'company', 'F', 0,
  '$2a$12$placeholder', -- not a real login, just a board identity
  NOW(), NOW()
);
-- Then get the id:
SELECT id FROM users WHERE email = 'contact@yourproject.com';
```

### Step 2: Insert the quest

Use this exact SQL pattern. Fill EVERY field — adventurers need complete info to start working.

```sql
INSERT INTO quests (
  id, title, description, detailed_description,
  quest_type, status, difficulty, xp_reward, skill_points_reward,
  required_skills, quest_category, track, source,
  company_id, max_participants, deadline,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Your Quest Title — Concise Action Description',
  'One to three sentence summary. What is being built and why.',
  E'## Repository\nhttps://github.com/ORG/REPO\n\n## GitHub Issue\nhttps://github.com/ORG/REPO/issues/NUMBER\n\n## What to Build\n- Specific bullet points\n- File paths where work goes\n- API endpoints to create or modify\n\n## Tech Stack\n- Language, framework, libraries\n\n## Setup\n```bash\ngit clone https://github.com/ORG/REPO\ncd REPO\nnpm install && npm run dev\n```\n\n## Key Files\n| File | Purpose |\n|------|---------|\n| `src/thing.tsx` | Where the new code goes |\n| `src/api/route.ts` | API to integrate with |\n\n## Acceptance Criteria\n- [ ] Criterion 1\n- [ ] Criterion 2\n- [ ] Mobile responsive\n- [ ] Type-check passes\n- [ ] No lint errors',
  'commission',     -- quest_type: always 'commission' for external projects
  'available',      -- status: 'available' means it shows on the board
  'D',              -- difficulty: F/E/D/C/B/A/S (see guide below)
  3000,             -- xp_reward: see XP guide below
  150,              -- skill_points_reward
  ARRAY['React', 'TypeScript', 'Next.js'],  -- required_skills
  'frontend',       -- quest_category: see categories below
  'OPEN',           -- track: OPEN for external projects
  'CLIENT_PORTAL',  -- source: always CLIENT_PORTAL
  'YOUR-COMPANY-UUID-HERE',  -- company_id from Step 1
  1,                -- max_participants: usually 1
  '2026-04-15 00:00:00+00',  -- deadline (or NULL)
  NOW(), NOW()      -- created_at, updated_at: ALWAYS include these
);
```

### Step 3: Verify it's on the board

```sql
SELECT id, title, difficulty, status FROM quests ORDER BY created_at DESC LIMIT 5;
```

---

## The Detailed Description — THIS IS CRITICAL

The `detailed_description` field is what adventurers read to understand the full quest. If this is incomplete, nobody will claim it. Use escaped newlines (`\n`) in SQL or `E'...'` Postgres syntax.

**Every detailed description MUST have these sections:**

```
## Repository
Direct link to the repo

## GitHub Issue
Direct link to the issue (so adventurer can see discussion/context)

## What to Build
- Exact file paths to create or modify
- Component/function names
- API routes and their request/response shapes
- Any architecture decisions already made

## Tech Stack
- Every technology they need to know
- Versions if they matter

## Setup
Exact clone + install + run commands
The adventurer should go from zero to running in under 5 minutes

## Key Files
Table of existing files they need to understand before starting

## Acceptance Criteria
Checkboxes. Testable. Specific.
Always include:
- [ ] The actual feature works
- [ ] Mobile responsive (if frontend)
- [ ] Type-check passes
- [ ] No lint errors
```

---

## Reference Tables

### Difficulty

| Rank | Scope | Time | Use When |
|------|-------|------|----------|
| **F** | Single file, follow existing pattern | 1-2 hrs | Fix typo, add CSS, update copy |
| **E** | Small feature, 1-2 files | 2-4 hrs | Add filter, simple endpoint, small component |
| **D** | Feature across 3-5 files | 4-8 hrs | Dashboard page, CRUD API, library integration |
| **C** | Multi-component feature | 1-2 days | Real-time chat, payment flow, complex form |
| **B** | Architectural work | 2-4 days | System design, module refactor, integration layer |
| **A** | Major subsystem | 1-2 weeks | Auth system, payment infra, CI/CD pipeline |
| **S** | Whole product feature | 2+ weeks | Full marketplace module, AI pipeline |

### XP Rewards

| Rank | XP Range |
|------|----------|
| F | 50 - 100 |
| E | 100 - 200 |
| D | 2000 - 3000 |
| C | 4000 - 5000 |
| B | 6000 - 8000 |
| A | 8000 - 12000 |
| S | 12000+ |

### Quest Categories (enum values)

`frontend`, `backend`, `fullstack`, `mobile`, `ai_ml`, `devops`, `security`, `qa`, `design`, `data_science`

### Track Values

- `OPEN` — external projects, any adventurer can see
- `INTERN` — Open Paws intern track only
- `BOOTCAMP` — Open Paws bootcamp students only

Use `OPEN` for all external project quests.

---

## Also: Create a GitHub Issue on AG

After posting the quest to the DB, also create a matching GitHub issue so contributors can discover it through GitHub too:

```bash
gh issue create \
  --repo LarytheLord/Adventurers-Guild \
  --title "quest: Your Quest Title" \
  --label "contributor-friendly" \
  --body "Quest posted on the AG board.

**Source repo:** https://github.com/ORG/REPO
**Issue:** https://github.com/ORG/REPO/issues/NUMBER
**Difficulty:** D-rank | **XP:** 3000 | **Category:** frontend

See the quest board at adventurersguild.space for full details."
```

---

## Common Mistakes

1. **Forgetting `created_at, updated_at`** — the DB requires both. Always add `NOW(), NOW()` at the end.
2. **Missing repo/issue links** in detailed_description — adventurers won't know where to work.
3. **Vague acceptance criteria** — "make it work" is not a criterion. "Chat messages render in real-time with typing indicator" is.
4. **Wrong difficulty** — a 2-day task rated F will frustrate adventurers. Rate honestly.
5. **No setup instructions** — if the adventurer can't run the project in 5 minutes, they'll skip the quest.

---

## Quick Copy-Paste Template

For the AI agent: copy this, fill the values, run via `mcp__Neon__run_sql` with `projectId: "empty-night-45827202"`:

```sql
INSERT INTO quests (id, title, description, detailed_description, quest_type, status, difficulty, xp_reward, skill_points_reward, required_skills, quest_category, track, source, company_id, max_participants, deadline, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'TITLE',
  'SHORT_DESCRIPTION',
  E'## Repository\nURL\n\n## GitHub Issue\nURL\n\n## What to Build\n- DETAILS\n\n## Tech Stack\n- STACK\n\n## Setup\n```bash\nCOMMANDS\n```\n\n## Acceptance Criteria\n- [ ] CRITERIA',
  'commission', 'available', 'DIFFICULTY', XP, SKILL_POINTS,
  ARRAY['SKILL1', 'SKILL2'],
  'CATEGORY', 'OPEN', 'CLIENT_PORTAL',
  'COMPANY_UUID', 1, 'DEADLINE_OR_NULL',
  NOW(), NOW()
);
```

---

*Last updated: 2026-03-24*
