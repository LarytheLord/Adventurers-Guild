# Claude Code Instructions — Adventurers Guild

## Session Start Protocol

1. Read these files in order: `CLAUDE.md`, `docs/IMPLEMENTATION_TASKS.md`, `docs/QUEST_BRIEF_SCHEMA.md`, `docs/ARCHITECTURE_DECISIONS.md`
2. Examine `prisma/schema.prisma` and `app/api/` directory structure
3. Confirm understanding of the two-track architecture and current implementation state
4. State which task you'll work on and which files you need to examine first

## Task Protocol

For every task:

1. **Read before writing.** Read every file you'll modify. Understand the existing patterns before changing anything.
2. **Check the schema.** If the task involves data, verify `prisma/schema.prisma` has the fields you need. If not, schema migration comes first.
3. **Follow existing patterns.** Look at how similar features are built (e.g., existing API routes, existing page components). Match the style.
4. **Validate enums.** When accepting string parameters that map to Prisma enums, validate with `Object.values(EnumName).includes(value as EnumName)` and return 400 if invalid.
5. **Handle Neon cold-start.** Wrap server-component Prisma calls in `withDbRetry()` from `lib/db.ts`. API routes use try/catch.
6. **Run checks.** After implementation, run `npm run lint`, `npm run type-check`, and `npm run build`. Fix any errors before declaring done.
7. **Mark task complete** only when all acceptance criteria pass and checks are green.

## Code Style Rules

### API Routes
- Use `requireAuth(...roles)` from `lib/api-auth.ts` for auth/role checks
- Validate required fields before any DB operations
- UUID format: `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
- Return structured JSON: `{ data }` on success, `{ error: string }` on failure
- Clamp pagination: `Math.min(Math.max(1, parseInt(limit)), 200)`

### Database
- Import enums from `@prisma/client`: `import { QuestStatus, UserRole } from '@prisma/client'`
- Use `Prisma.QuestWhereInput` (not `Record<string, unknown>`) for where clauses
- Prisma client is a singleton at `lib/db.ts` — never instantiate a new one
- Cast string params to enums: `where.status = status as QuestStatus`

### Frontend
- Pages under `app/dashboard/` are inside the dashboard layout (sidebar + header). Don't add nav/footer.
- Use `'use client'` only when needed (hooks, event handlers, browser APIs)
- Prefer server components for data fetching where possible
- Orange-500 is the primary accent. Don't introduce new accent colors.
- Use `<RankBadge rank={rank} />` for rank display — never raw colored text

### Auth
- NextAuth v4 with JWT strategy
- Session shape: `{ user: { id, email, name, role, rank, xp } }`
- Admin has no CompanyProfile — always guard admin-specific code paths
- `getServerSession(authOptions)` for server components; `useSession()` for client components

## Security Rules

- Never trust client-provided IDs for ownership — always verify against session user
- Validate all enum inputs server-side (don't rely on frontend dropdowns)
- Admin endpoints require `requireAuth('admin')`
- Company endpoints require `requireAuth('company', 'admin')`
- Quest ownership: company can only modify their own quests; admin can modify any
- No raw SQL — use Prisma for all queries
- Sanitize user input before storing (trim strings, validate lengths)

## Architecture Constraints (Do Not Violate)

These are from `docs/ARCHITECTURE_DECISIONS.md` — read that file for full rationale:

1. **Two-track system**: `track` field on Quest separates INTERN from BOOTCAMP work
2. **F/E only for bootcamp**: Bootcamp students never see D+ quests — enforced at API level, not just UI
3. **Tutorial quests mandatory**: `BootcampLink.eligibleForRealQuests` requires both tutorials complete
4. **Structured modification forms**: Not freeform text — clients check which acceptance criteria failed
5. **2-revision cap**: `revisionCount >= maxRevisions` triggers escalation, not another revision
6. **No DevSync**: Students use GitHub + Discord. Remove any DevSync references.
7. **Sub-quests link to parent**: `parentQuestId` is self-referential on Quest
8. **Shared review pool**: No `assignedReviewer` field — reviews happen on GitHub
9. **No bootcamp payment in Phase 1**: Bootcamp students earn XP/portfolio only
10. **All Open Paws branding**: No Electric Sheep or C4C references anywhere

## When You're Stuck

1. Re-read the relevant docs (ARCHITECTURE_DECISIONS.md, QUEST_BRIEF_SCHEMA.md)
2. Check how similar functionality is already built in the codebase
3. If a schema field is missing, **add it first** — don't work around missing data
4. If tests fail, debug the actual error — don't retry blindly
5. If you're unsure about a design decision, ask rather than guess

## Quality Gates

Before marking any task as done:
- [ ] `npm run lint` passes (warnings OK, no errors)
- [ ] `npm run type-check` passes (0 errors)
- [ ] `npm run build` passes clean
- [ ] All acceptance criteria from the task spec are met
- [ ] No hardcoded fake data introduced
- [ ] No new security vulnerabilities (OWASP top 10)
