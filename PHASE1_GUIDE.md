# Phase 1 Pilot Guide — The Adventurers Guild
**Audience:** Admins running the first intern/bootcamp cohort
**Goal:** Create quests → interns choose and complete them → collect UX observations

---

## Step 1: Create Your Admin Account

If you don't have an admin account yet, you need to set the role directly in the database.

**Option A — Promote an existing account:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```
Run this in the Neon console at https://console.neon.tech → your project → SQL editor.

**Option B — Register normally, then promote:**
1. Go to `/register` and create an adventurer account
2. Promote it via the SQL command above

After logging in as admin, you'll be taken to your dashboard. Navigate to `/admin` to reach the Admin Dashboard.

---

## Step 2: Create Quests

### From the Admin Dashboard (`/admin`)
1. Click **"Create Quest"** in the Phase 1 Quick Actions section
2. Fill out the quest form (see field guide below)
3. Click **"Create Quest"** — the quest is immediately live and visible to interns

### From Quest Management (`/admin/quests`)
1. Click **"Create Quest"** in the top-right corner
2. Fill out the form
3. After saving, you'll be redirected back to `/admin/quests` with the new quest in the list

### Quest Form Field Guide

| Field | What to enter | Example |
|-------|--------------|---------|
| **Quest Title** | Short, clear name for the task | "Build a REST API for user authentication" |
| **Short Description** | 2-3 sentences explaining what needs to be done | "Create a Node.js Express API with JWT auth, user registration, and login endpoints." |
| **Detailed Requirements** | Step-by-step acceptance criteria | "1. POST /register creates a user. 2. POST /login returns a JWT. 3. Protected route returns user profile." |
| **Quest Type** | Category of work | Commission (default for real projects) |
| **Category** | Tech area | Backend, Frontend, Fullstack, etc. |
| **Difficulty** | F = absolute beginner, S = expert | D or E for most interns |
| **Required Skills** | Comma-separated tech stack | "Node.js, Express, JWT, PostgreSQL" |
| **Minimum Rank** | Lock quest to experienced users | Leave as "Any Rank" for Phase 1 |
| **Deadline** | When work is due | Optional — useful for time-boxed sprints |
| **Max Participants** | How many interns can take this quest | Set to match your cohort size, or leave at 1 for solo quests |
| **XP Reward** | Points awarded on completion | 500 XP for small tasks, 1000+ for larger ones |
| **Skill Points** | Secondary reward | Optional — matches XP roughly (10 SP per 100 XP) |
| **Payment (INR)** | Cash reward | Leave at 0 for intern pilots |

**Tips for good quest descriptions:**
- Be explicit about what "done" looks like (acceptance criteria)
- Include links to relevant repos, docs, or designs in Detailed Requirements
- Avoid jargon — assume the intern knows the tech but not your internal processes
- If you expect a specific format (GitHub link, Notion doc, Figma file), say so

---

## Step 3: Walk Interns Through Quest Selection

### What interns see at `/dashboard/quests`
- A grid of all available quests
- Filters by difficulty, category, and skills
- Search by keyword
- Each card shows: title, difficulty rank, XP reward, skills, deadline

### What to tell interns:
1. "Log in at [your URL]/login with the credentials we sent you"
2. "Go to 'Quest Board' in the sidebar"
3. "Browse quests, click 'View Details' on one you're interested in"
4. "Read the full description and requirements"
5. "Click 'Accept Quest' to claim it — only one person can be accepted per slot"
6. "Once the quest is yours, submit your work from the same page"

### Accept → Start → Submit flow
```
Intern accepts quest → status = "Assigned" (pending admin approval)
Admin accepts the applicant → status = "Started" (intern can now work)
Intern submits work → status = "Under Review"
Admin reviews → Approve / Request Rework / Reject
On approval → XP/SP awarded, intern levels up
```

---

## Step 4: Review Submissions

### As admin, navigate to `/admin/quests`
1. Find the quest in the list — it will show the applicant count
2. Click **"View"** to open the company quest detail page
3. Go to the **Applicants** tab:
   - **Accept** pending applicants to let them start
   - Once submitted, you'll see "Work Submitted — awaiting your review"
   - Choose: **Approve & Award XP** / **Request Rework** / **Reject**

### When to use each action
| Action | Use when |
|--------|---------|
| Approve & Award XP | Work meets all acceptance criteria |
| Request Rework | Work is close but needs specific changes — add feedback in notes |
| Reject | Work doesn't meet minimum bar and intern should start over |

---

## Step 5: Record Observation Notes

After each session with interns, add notes while the memory is fresh.

### From `/admin/quests`
1. Find the quest
2. Click the **"Notes"** button (sticky note icon)
3. Existing notes appear in the dialog
4. Type your observation and click **"Save Note"**

### What to record
Capture anything that reveals UX friction or confusion:

- "Intern X didn't understand what 'detailed requirements' meant — consider a tooltip or example"
- "Two interns asked how to check if a quest was already taken"
- "Deadline field was confusing — they thought it was the deadline to apply, not to complete"
- "XP reward didn't mean anything to them yet — should explain the rank system first"
- "Quest description was clear but missing tech stack requirements — interns had to ask"

Notes are timestamped, author-attributed, and admin-only (interns never see them).

---

## Step 6: Export Notes for Review

### Current export method (Phase 1)
Notes are stored per quest. To collect all observations:

1. Go to `/admin/quests`
2. For each quest with notes, click **"Notes"** — copy the content
3. Paste into your shared doc or spreadsheet

(A bulk export endpoint is on the Phase 2 roadmap)

### Recommended note-review structure
After each pilot session, review notes with your team and classify:
- **Confusing UI** → schedule a UX fix
- **Missing content** → update quest descriptions or add tooltips
- **Missing feature** → add to Phase 2 backlog
- **Works well** → document as a pattern to replicate

---

## Phase 2 Handoff Checklist

When transitioning to Phase 2 (external organizations create their own quests):

- [ ] Remove the `admin` role requirement workaround — organizations should use `company` accounts
- [ ] Add guided quest creation wizard (replaces the current form)
- [ ] Add tooltips to every form field
- [ ] Add "Preview Quest" button to show how the quest appears to adventurers
- [ ] Add email notifications when adventurers apply and when work is submitted
- [ ] Add progress tracking within a quest (milestone check-ins)
- [ ] Build analytics dashboard for organizations (applications per quest, time to completion)
- [ ] Incorporate observation notes into product roadmap decisions

---

## Troubleshooting

### "I can't create quests as admin"
- Make sure you're logged in and your account has `role = 'admin'` in the DB
- Navigate to `/admin` — if you see the admin dashboard, your role is correct
- Use the "Create Quest" button from `/admin`, not from `/dashboard/company`

### "An intern can't find any quests"
- Go to `/admin/quests` and check quest statuses
- Quests must have status `available` to appear on the board
- The quest board at `/dashboard/quests` filters by `status=available` by default

### "An intern applied but doesn't see their quest"
- The intern needs to go to `/dashboard/my-quests`
- Their assignment has status `assigned` (pending your acceptance)
- Go to `/admin/quests` → View quest → Applicants tab → Accept the intern

### "Submission review buttons aren't showing"
- The assignment must be in `submitted` or `review` status
- The adventurer must have clicked "Submit Quest" from their quest detail page
- Refresh the page if buttons aren't appearing after submission

### "Build/deploy is failing"
- Run `npm run type-check` locally — fix all errors before pushing
- Check `NEXTAUTH_URL` is set to your production domain on Vercel
- Check all 5 required env vars are set in Vercel project settings
