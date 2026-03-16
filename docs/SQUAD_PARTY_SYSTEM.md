# Squad/Party System — Full Specification

## Context

The Open Paws org plan describes delivery like this:
> "Mixed-rank squads handle delivery — senior Adventurers mentor juniors automatically through the Party Leader structure."

The Party system is the core delivery mechanism for both tracks:
- **INTERN track** — squads of 3–5, D+ rank quests, Party Leader owns delivery
- **BOOTCAMP track** — pairs (2 members max), E-rank quests, senior member leads

Clients never interact with individual students — they interact with the quest outcome and with Open Paws as mediator. The Party is the delivery unit, not the individual.

---

## Data Model

### New models to add to `prisma/schema.prisma`

```prisma
model Party {
  id        String     @id @default(uuid()) @db.Uuid
  questId   String     @unique @map("quest_id") @db.Uuid
  leaderId  String     @map("leader_id") @db.Uuid
  track     QuestTrack
  maxSize   Int        @default(5) @map("max_size")
  createdAt DateTime   @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime   @updatedAt @map("updated_at") @db.Timestamptz

  quest   Quest         @relation(fields: [questId], references: [id])
  leader  User          @relation("PartyLeader", fields: [leaderId], references: [id])
  members PartyMember[]

  @@map("parties")
}

model PartyMember {
  id       String   @id @default(uuid()) @db.Uuid
  partyId  String   @map("party_id") @db.Uuid
  userId   String   @map("user_id") @db.Uuid
  isLeader Boolean  @default(false) @map("is_leader")
  joinedAt DateTime @default(now()) @map("joined_at") @db.Timestamptz

  party Party @relation(fields: [partyId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id])

  @@unique([partyId, userId])
  @@map("party_members")
}
```

### Relations to add to existing models

Add to `User`:
```prisma
ledParties    Party[]       @relation("PartyLeader")
partyMembers  PartyMember[]
```

Add to `Quest`:
```prisma
party  Party?
```

### Migration

```bash
npx prisma migrate dev --name add-party-squad-system
```

---

## Business Rules

| Rule | Detail |
|------|--------|
| One party per quest | `questId` is `@unique` — a quest has at most 1 party |
| Leader is a member | When party is created, leader is auto-added as `PartyMember` with `isLeader: true` |
| Leader rank constraint | Leader's rank must be >= quest difficulty. D-rank quest requires D+ leader. |
| BOOTCAMP cap | `maxSize = 2` for BOOTCAMP track parties |
| INTERN cap | `maxSize = 5` for INTERN track parties |
| No self-duplicate | `@@unique([partyId, userId])` — can't join the same party twice |
| Leader can't be removed | `DELETE /api/parties/[id]/members/[userId]` must reject if `isLeader = true` |
| Open quests only | Can only form a party on a quest with status `available` or `in_progress` |

---

## API Endpoints

### `POST /api/parties`

Create a party for a quest. The caller becomes the party leader.

**Auth**: `adventurer` or `admin`

**Request body**:
```typescript
{
  questId: string;    // UUID — the quest to form a party for
}
```

**Logic**:
1. Validate `questId` — quest must exist, status must be `available` or `in_progress`
2. Check quest has no party yet (would violate unique constraint)
3. Validate caller's rank >= quest difficulty (skip for admin)
4. Determine `maxSize`: `quest.track === 'BOOTCAMP' ? 2 : 5`
5. Create `Party` with `leaderId = caller.id`, `track = quest.track`
6. Create `PartyMember` with `userId = caller.id`, `isLeader = true`
7. Return `{ party: { id, questId, leaderId, maxSize, track, members: [...] } }`

**Error responses**:
- `400` if questId missing
- `404` if quest not found
- `409` if party already exists for quest
- `403` if caller's rank is below quest difficulty
- `403` if quest is BOOTCAMP track and caller has no BootcampLink

**File**: `app/api/parties/route.ts`

---

### `POST /api/parties/[id]/members`

Add a member to an existing party.

**Auth**: `adventurer` (only party leader can add) or `admin`

**Request body**:
```typescript
{
  userId: string;   // UUID — user to add to party
}
```

**Logic**:
1. Fetch party with members
2. Verify caller is party leader (`party.leaderId === caller.id`) — unless admin
3. Check party is not full (`members.length < party.maxSize`)
4. Validate the target user exists and is an adventurer
5. For BOOTCAMP parties: target user must have a BootcampLink
6. Create `PartyMember`
7. Return updated party with members

**Error responses**:
- `403` if caller is not party leader (and not admin)
- `409` if user is already a party member
- `400` if party is full

**File**: `app/api/parties/[id]/members/route.ts`

---

### `DELETE /api/parties/[id]/members/[userId]`

Remove a member from a party.

**Auth**: `adventurer` (leader only) or `admin`

**Logic**:
1. Verify caller is party leader (or admin)
2. Reject if `userId` is the leader (cannot remove leader)
3. Delete `PartyMember` record

**Error responses**:
- `403` if caller is not leader
- `400` if trying to remove the leader

**File**: `app/api/parties/[id]/members/[userId]/route.ts`

---

### `GET /api/parties/[id]`

Get party details with members.

**Auth**: any authenticated user (public party info)

**Response**:
```typescript
{
  party: {
    id: string;
    questId: string;
    leaderId: string;
    track: QuestTrack;
    maxSize: number;
    createdAt: string;
    leader: { id: string; name: string; rank: string };
    members: Array<{
      id: string;
      userId: string;
      isLeader: boolean;
      joinedAt: string;
      user: { id: string; name: string; rank: string };
    }>;
  }
}
```

**File**: `app/api/parties/[id]/route.ts`

---

### Update to `GET /api/quests/[id]`

Add party relation to the quest response:

```typescript
include: {
  party: {
    include: {
      leader: { select: { id: true, name: true } },
      members: {
        include: {
          user: { select: { id: true, name: true } }
        }
      }
    }
  }
}
```

---

## Frontend Changes

### Quest Detail Page (`app/dashboard/quests/[id]/page.tsx`)

Add a **Party Panel** section below quest details:

**If no party exists** and quest is `available`:
- Show "Form a party" button (adventurer only)
- Shows quest max party size and track constraints

**If party exists** and viewer is party leader:
- Show party members list with ranks
- "Add member" button (opens search modal for adventurer usernames)
- Each non-leader member has "Remove" button

**If party exists** and viewer is a party member (not leader):
- Show party members list, read-only

**If party exists** and viewer is not in the party:
- Show party members (names and ranks only)
- "Request to join" — sends a notification to party leader (Phase 3 feature; Phase 2 is invite-only)

### Design pattern
Follow the existing `QuestAssignmentCard` component style. Use `shadcn/ui` Card, Badge (for ranks), and Avatar components. Rank badges use `<RankBadge>` component.

---

## Files to Create/Modify

| Action | File |
|--------|------|
| Create | `app/api/parties/route.ts` |
| Create | `app/api/parties/[id]/route.ts` |
| Create | `app/api/parties/[id]/members/route.ts` |
| Create | `app/api/parties/[id]/members/[userId]/route.ts` |
| Modify | `app/api/quests/[id]/route.ts` — add party include |
| Modify | `app/dashboard/quests/[id]/page.tsx` — add Party Panel UI |
| Modify | `prisma/schema.prisma` — add Party + PartyMember models |
| Run | `npx prisma migrate dev --name add-party-squad-system` |

---

## Acceptance Criteria

- [ ] `Party` and `PartyMember` models exist in schema with migration applied
- [ ] `POST /api/parties` creates party and auto-adds leader as member with `isLeader: true`
- [ ] `POST /api/parties` returns 403 if leader's rank is below quest difficulty
- [ ] `POST /api/parties/[id]/members` adds member, respects `maxSize`
- [ ] `POST /api/parties/[id]/members` returns 400 if party is full
- [ ] BOOTCAMP parties enforce `maxSize = 2`
- [ ] INTERN parties enforce `maxSize = 5`
- [ ] `DELETE /api/parties/[id]/members/[userId]` returns 400 if target is leader
- [ ] `GET /api/quests/[id]` response includes `party` with members when party exists
- [ ] Quest detail page shows Party Panel with correct state per viewer role
- [ ] `npm run lint` → 0 errors
- [ ] `npm run type-check` → 0 errors
- [ ] `npm run build` → passes

---

## What NOT to Do

- Do not implement "request to join" — that's Phase 3
- Do not add party chat or messaging — that's Discord
- Do not change the quest assignment flow (assignments still exist separately for XP/payment attribution)
- Do not allow parties on OPEN track quests in Phase 2 — OPEN track is individual
- Do not add party formation to the admin quest creation form — admin creates the quest, adventurers form the party
