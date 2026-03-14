# ARCHITECTURE_DECISIONS.md — Why Things Are The Way They Are

## Decisions Made (Do Not Revisit)

These decisions were made after stress-testing with the PM team. They are final for this phase.

### 1. Two-Track System (Not Single-Pool)
**Decision**: Separate intern track and bootcamp track, not one mixed pool.
**Why**: Bootcamp students can't ship production code yet. Mixing them with interns on D+ work would tank client quality. Separation means each track operates at its own level without risk contamination.
**Implication**: The `track` field on quests is the hard boundary. Bootcamp students cannot see or accept INTERN quests. This is enforced at the API level, not just UI.

### 2. F/E Only for Bootcamp Students
**Decision**: Bootcamp students are restricted to F and E rank quests.
**Why**: They can write basic code but have never shipped production. F/E tasks are small enough (< 200 lines, follows existing patterns) that quality risk is manageable. D+ requires architecture decisions they're not ready for.
**Implication**: Quest board API must filter by track. Never bypass this even for "advanced" bootcamp students — the transition to intern track is a future feature, not a Phase 1 feature.

### 3. Tutorial Quests Are Mandatory
**Decision**: Every bootcamp student completes 2 tutorial quests before real work.
**Why**: Proves they can navigate git, PRs, CI, and code review. Without this gate, first real deliverables will be embarrassing.
**Implication**: `BootcampLink.eligibleForRealQuests` is false until both `tutorialQuest1Complete` and `tutorialQuest2Complete` are true. Quest board for ineligible students only shows tutorial quests.

### 4. Structured Modification Forms (Not Freeform)
**Decision**: Client modification requests use a structured form with acceptance criteria checkboxes, not a text box.
**Why**: Freeform "make it better" requests cause infinite revision loops and scope creep. Structured forms force clients to identify which criteria aren't met, making the revision actionable.
**Implication**: The modification form must display the quest's acceptance criteria. Client checks which ones failed. Description is supplementary, not primary.

### 5. 2-Revision Cap
**Decision**: Maximum 2 revision cycles per quest, then escalation.
**Why**: Protects students from infinite revision loops. After 2 rounds, the issue is either a quality problem (reassign to stronger squad) or an expectations problem (client counseling on scope).
**Implication**: `quest.revisionCount` tracks this. At `revisionCount >= maxRevisions`, the modification form shows an escalation path instead of a revision form.

### 6. No DevSync
**Decision**: No DevSync integration. Students use GitHub + Discord.
**Why**: DevSync isn't built. GitHub + Discord is proven and sufficient. Adding a dependency on unbuilt infrastructure would block the launch.
**Implication**: Remove any DevSync references from the codebase if they exist. Don't build collaborative coding features. Focus on PR-based workflow.

### 7. Sub-Quests Link to Parent Quests
**Decision**: D+ quests (intern work) can have F/E sub-quests (bootcamp work).
**Why**: Intern work naturally generates small tasks (docs, tests, styling). Instead of tracking these separately, they're sub-quests visible on the bootcamp quest board. This creates an organic pipeline of F/E work.
**Implication**: `parentQuestId` is a self-referential field on Quest. Sub-quests inherit the client but can have a different track and rank. When displaying a parent quest, show its sub-quests. When displaying a sub-quest, link back to parent.

### 8. Shared Review Pool (Not Assigned Reviewers)
**Decision**: All 4 reviewers can review any PR. No formal rotation.
**Why**: Keeps it simple. Formal rotation adds coordination overhead. With 4 people and a Discord alert system, PRs get picked up naturally.
**Implication**: No `assignedReviewer` field needed in the database. Review happens on GitHub, not in-platform. The Discord bot alerts the #guild-reviews channel on new PRs.

### 9. No Payment in Phase 1 for Bootcamp Students
**Decision**: Bootcamp students earn XP and portfolio, not money, in Phase 1.
**Why**: Payment infrastructure is ready but adding paid bootcamp quests complicates things before the model is proven. Phase 2 introduces paid quests after validation.
**Implication**: Quest model doesn't need a payment field for Phase 1. Revenue comes from the intern track (existing client agreements) and future external client commissions.

### 10. All Open Paws Branding
**Decision**: No references to Electric Sheep, C4C, or Code for Compassion.
**Why**: Open Paws has separated from Electric Sheep. All operations are under Open Paws branding.
**Implication**: Search the codebase for any Electric Sheep or C4C references and remove them. Bootcamp webhook comes from "Open Paws Bootcamp", not "C4C Campus".

---

## Constraints

### Hard Constraints (Cannot Change)
- Next.js 15 App Router (existing stack)
- Neon PostgreSQL via Prisma (existing database)
- NextAuth.js credentials + JWT (existing auth)
- Vercel deployment (existing infra)
- MIT License (existing repo license)

### Soft Constraints (Could Change If Needed)
- shadcn/ui for new components (preferred but not mandatory)
- Discord for notifications (could add other channels later)
- GitHub for code review (could add in-platform review later)

### Performance Targets
- Quest board page load: < 2s
- Webhook onboard response: < 500ms
- Quest filtering query: < 200ms

### Security Requirements
- Webhook endpoint validates secret
- Track filtering enforced at API level, not just UI
- Bootcamp students cannot access intern quest details via direct URL
- Client cannot see student personal info (only squad ID)
