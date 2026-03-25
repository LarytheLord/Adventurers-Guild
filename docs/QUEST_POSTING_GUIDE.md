# Quest Posting Guide for External Projects

> How to post quests from your project onto the Adventurers Guild quest board.
> This guide is designed for AI agents (Claude, Cursor, Copilot) assisting project maintainers.

---

## Overview

Adventurers Guild is a developer marketplace where developers ("Adventurers") complete real coding tasks ("Quests") and earn XP + rank. By posting your project's tasks as quests, you get access to ranked developers who deliver verified work.

---

## Step 1: Prepare Your Quest

Every quest needs these fields. Fill them ALL — adventurers rely on this info to decide whether to claim and how to deliver.

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| **title** | Short, action-oriented title (under 80 chars) | `AI Therapy Chat UI — Patient Session Interface` |
| **description** | 1-3 sentence summary of what needs to be built | `Build the patient-facing chat interface for AI therapy sessions...` |
| **detailedDescription** | Full spec (see template below) | Markdown with repo link, issue link, setup, acceptance criteria |
| **difficulty** | F / E / D / C / B / A / S (see Difficulty Guide below) | `D` |
| **xpReward** | XP awarded on completion (see XP Guide below) | `3000` |
| **questCategory** | One of: `frontend`, `backend`, `fullstack`, `mobile`, `ai_ml`, `devops`, `security`, `qa`, `design`, `data_science` | `frontend` |
| **requiredSkills** | Array of skill tags | `["React", "TypeScript", "Next.js"]` |
| **maxParticipants** | How many adventurers can work on this (usually 1) | `1` |
| **deadline** | ISO date string or null | `2026-04-15T00:00:00Z` |

### Optional Fields

| Field | Description | Default |
|-------|-------------|---------|
| **monetaryReward** | Payment in USD (null = XP only) | `null` |
| **requiredRank** | Minimum rank to claim (null = any rank) | `null` |
| **skillPointsReward** | Skill points awarded | `0` |

---

## Step 2: Write the Detailed Description

This is what the adventurer sees when they open the quest. It must contain EVERYTHING they need to start working. Use this template:

```markdown
## Repository
https://github.com/YOUR_ORG/YOUR_REPO

## GitHub Issue
https://github.com/YOUR_ORG/YOUR_REPO/issues/NUMBER

## What to Build
- Bullet point list of exactly what needs to be created
- Be specific: file paths, component names, API endpoints
- Include any architecture decisions already made

## Tech Stack
- List every technology the adventurer needs to know
- Include versions if they matter (e.g., "Next.js 15 App Router")

## Setup
```bash
git clone https://github.com/YOUR_ORG/YOUR_REPO
cd YOUR_REPO
npm install  # or pip install -r requirements.txt
npm run dev  # or python main.py
```

## Key Files
| File | Purpose |
|------|---------|
| `src/components/Feature.tsx` | Where the new component goes |
| `src/api/endpoint.ts` | API route to integrate with |
| `prisma/schema.prisma` | Database schema (if relevant) |

## Design Reference
- Link to Figma, screenshot, or description of visual requirements
- Or: "Match existing design patterns in the codebase"

## Acceptance Criteria
- [ ] Criterion 1 (testable, specific)
- [ ] Criterion 2
- [ ] Criterion 3
- [ ] Mobile responsive
- [ ] Type-check passes (`npx tsc --noEmit` or equivalent)
- [ ] No lint errors
```

---

## Step 3: Post the Quest

### Option A: Via the AG Admin Panel (Recommended)

1. Log in as admin at `adventurersguild.space/admin`
2. Go to Quests > Create New Quest
3. Fill all fields from Step 1
4. Paste the detailed description from Step 2

### Option B: Via the API

```bash
curl -X POST https://adventurersguild.space/api/admin/quests \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION" \
  -d '{
    "title": "Your Quest Title",
    "description": "Short summary",
    "detailedDescription": "Full markdown spec (see template above)",
    "difficulty": "D",
    "xpReward": 3000,
    "skillPointsReward": 150,
    "questCategory": "frontend",
    "requiredSkills": ["React", "TypeScript"],
    "maxParticipants": 1,
    "deadline": "2026-04-15T00:00:00Z",
    "track": "OPEN",
    "status": "available"
  }'
```

### Option C: Via Neon MCP (Direct DB — for trusted internal use)

```sql
INSERT INTO quests (
  id, title, description, detailed_description,
  quest_type, status, difficulty, xp_reward, skill_points_reward,
  required_skills, quest_category, track, source,
  company_id, max_participants, deadline, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Your Quest Title',
  'Short summary of the task',
  E'## Repository\nhttps://github.com/...\n\n## GitHub Issue\n...\n\n## What to Build\n...',
  'commission', 'available', 'D', 3000, 150,
  ARRAY['React', 'TypeScript'],
  'frontend', 'OPEN', 'CLIENT_PORTAL',
  'YOUR_COMPANY_USER_UUID', 1,
  '2026-04-15 00:00:00+00', NOW(), NOW()
);
```

**Neon project ID:** `empty-night-45827202`

---

## Difficulty Guide

Match your task to the right rank. Adventurers use this to gauge effort and whether they're qualified.

| Rank | Complexity | Time Estimate | Examples |
|------|-----------|---------------|---------|
| **F** | Trivial, follow-the-pattern | 1-2 hours | Fix a typo, add a CSS class, update copy |
| **E** | Small feature, single file | 2-4 hours | Add a filter dropdown, create a simple API endpoint |
| **D** | Feature with 3-5 files | 4-8 hours | Build a dashboard page, create a CRUD API, integrate a library |
| **C** | Multi-component feature | 1-2 days | Real-time chat, payment flow, complex form with validation |
| **B** | Architectural work | 2-4 days | Design a system, refactor a module, build an integration layer |
| **A** | Major subsystem | 1-2 weeks | Auth system, payment infrastructure, CI/CD pipeline |
| **S** | Whole product feature | 2+ weeks | Full marketplace module, AI pipeline, distributed system |

## XP Reward Guide

| Rank | Suggested XP | Suggested Skill Points |
|------|-------------|----------------------|
| F | 50-100 | 10-25 |
| E | 100-200 | 25-75 |
| D | 200-500 or 2000-3000 (paid) | 100-200 |
| C | 350-700 or 4000-5000 (paid) | 200-300 |
| B | 500-1000 or 6000-8000 (paid) | 300-400 |
| A | 1000-2000 or 8000-12000 (paid) | 400-600 |
| S | 2000+ or 12000+ (paid) | 600+ |

Lower XP = AG platform quests (contributors building AG itself).
Higher XP = external project quests (real client work).

---

## Quest Category Reference

| Category | When to Use |
|----------|-------------|
| `frontend` | UI components, pages, styling, animations |
| `backend` | API routes, database, server logic |
| `fullstack` | Spans both frontend and backend |
| `mobile` | Mobile-specific UI or React Native |
| `ai_ml` | Machine learning, LLM integration, NLP |
| `devops` | CI/CD, deployment, infrastructure |
| `security` | Auth, encryption, vulnerability fixes |
| `qa` | Testing, E2E tests, test infrastructure |
| `design` | UI/UX design, design system work |
| `data_science` | Data pipelines, analytics, visualization |

---

## Checklist Before Posting

- [ ] Title is clear and action-oriented
- [ ] Description tells an adventurer what they're building in 2 sentences
- [ ] Detailed description has: repo link, issue link, setup instructions, acceptance criteria
- [ ] Difficulty matches actual complexity (see guide)
- [ ] Required skills are accurate (don't over-list)
- [ ] Deadline is realistic
- [ ] Quest is self-contained — adventurer doesn't need to DM you for missing context
- [ ] If there are dependencies (other quests must be done first), mention them

---

## Example: Well-Written Quest

**Title:** `AI Therapy Chat UI — Patient Session Interface`

**Why this works:**
- Title says exactly what it is
- Description gives context (Knight Medicare + Chimera)
- Detailed description has repo link, issue link, file paths, setup, and 6 testable acceptance criteria
- Difficulty (D) matches scope (4-8 hours, 3-5 files)
- Required skills are specific and accurate
- Adventurer can clone, run, and start building immediately

---

*Last updated: 2026-03-24*
