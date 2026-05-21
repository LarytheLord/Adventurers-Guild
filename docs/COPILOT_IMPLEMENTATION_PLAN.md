# Adventurers Guild Copilot: Implementation Plan

## Strategic Overview

**Vision**: Transform Adventurers Guild from a **work marketplace** into a **learn-while-you-earn platform** by embedding an AI copilot that guides adventurers through quests with contextual hints, scaffolded learning, and skill development tracking.

**Market Positioning**: Compete with bootcamps (learning) + freelance platforms (earning) simultaneously. This unlocks B2B2C partnerships with coding bootcamps and enterprise training programs.

**Success Metrics**:
- **Phase 1 (MVP)**: 30% faster quest completion time for F/E rank adventurers using hints
- **Phase 2**: 50%+ engagement with conversational AI features
- **Phase 3**: Measurable skill progression (adventurers move 1+ rank faster with adaptive path)

---

## Phase 1: MVP — Context-Aware Hint Sidebar (Weeks 1–2)

**Goal**: Launch hint system for beta. Minimal AI overhead, maximum user validation. Use this to validate the concept before investing in Claude API.

### Architecture

```
Quest Detail Page (existing)
├── Main Content (left, 70%)
│   ├── Quest Title, Description
│   ├── Requirements, Skills
│   ├── Submit Work Button
│   └── Submissions List
└── Hint Panel (right sidebar, 30%) ← NEW
    ├── "Getting Started" tips
    ├── Category-based hints (React, Node, etc.)
    ├── Common mistakes
    ├── Links to resources
    └── "Still stuck? Open chat" CTA
```

### Implementation Checklist

#### 1. Create Hint Content Database (2 hours)
- File: `lib/quest-hints.ts`
- Structure: hints keyed by `questCategory` (frontend, backend, fullstack, ai_ml, etc.)
- Each hint object:
  ```typescript
  interface QuestHint {
    category: QuestCategory;
    difficulty: UserRank;
    section: 'getting_started' | 'common_mistakes' | 'patterns' | 'resources';
    title: string;
    content: string;
    resourceLinks?: { title: string; url: string }[];
  }
  ```
- Content: 3–5 hints per category, per difficulty level (~60 hints total, written by you)

**Effort**: 2 hours (most is writing helpful hint text, not code)

#### 2. Create `/api/public/quest-hints` Endpoint (1 hour)
- File: `app/api/public/quest-hints/route.ts`
- Query params: `?category=frontend&difficulty=F`
- Returns: `{ hints: QuestHint[], resourceLinks: Link[] }`
- No auth required (public endpoint for all adventurers)
- Cache aggressively (hints rarely change)

**Effort**: 1 hour

#### 3. Build `HintPanel` Component (3 hours)
- File: `components/quest/HintPanel.tsx`
- Features:
  - Tab interface: "Getting Started" | "Common Mistakes" | "Patterns" | "Resources"
  - Expandable hint cards (starts collapsed, user clicks to expand)
  - "Open Full Chat" button (disabled for Phase 1, enabled Phase 2)
  - Hint counter: "Viewing hint 1/3" (encourages users to explore all hints)
  - Copy-to-clipboard for code snippets in hints
- Responsive: Sidebar on desktop, collapsible drawer on mobile
- Styling: Consistent with existing quest detail UI (orange accents, rounded corners)

**Effort**: 3 hours

#### 4. Integrate HintPanel into Quest Detail Page (1 hour)
- File: `app/dashboard/quests/[id]/page.tsx` (or wherever quest detail lives)
- Layout: 70/30 split (content/sidebar)
- On mobile: Drawer below main content with toggle button
- Fetch hints on page load: `useEffect(() => { fetchHints(category, difficulty) }, [category, difficulty])`

**Effort**: 1 hour

#### 5. Add Loading States & Error Handling (1 hour)
- Show skeleton loaders while hints fetch
- Graceful fallback if API fails (show "Tips unavailable" message)
- Log failures for debugging

**Effort**: 1 hour

**Phase 1 Total Effort: 8 hours (~1 day of focused work)**

### Content Writing (Parallel, 3–4 hours)
- Write 60 helpful hints (3–4 per category/difficulty combo)
- Follow pattern: "Do X, not Y" or "Check Z first"
- Example (Frontend/F-Rank):
  - ✅ "Start by reading the component requirements. Check if any state management hints are in the description."
  - ✅ "Common mistake: Forgetting to import hooks. Double-check all `import { ... } from 'react'`."
  - ✅ "Pattern: Use `useState` for simple state, consider context for complex trees."
  - ✅ "Resources: https://react.dev/learn | https://github.com/you/quest-examples"

**Effort**: 3–4 hours (you + Adil split this)

### Phase 1 Launch Checklist
- [ ] `quest-hints.ts` populated with 60+ hints
- [ ] `/api/public/quest-hints` endpoint live and tested
- [ ] `HintPanel` component built and styled
- [ ] Integrated into quest detail page (desktop + mobile responsive)
- [ ] Error handling + loading states working
- [ ] Screenshot/demo for VC pitch deck
- [ ] Beta launch: invite 5–10 alpha users to test hints feedback

**Phase 1 Success Criteria**:
- Hints load in <500ms
- 50%+ of adventurers who see hints actually click them
- Qualitative feedback: "Helpful", "Clear", "Want more"
- Ready to pitch: "See how our copilot helps new developers succeed"

---

## Phase 2: Conversational AI — Full Copilot (Weeks 3–6)

**Goal**: Enable multi-turn debugging conversations. Transform hints into a real AI assistant.

### Architecture

```
HintPanel (Phase 1)
│
├── ✅ Static hints (visible by default)
└── 💬 Chat interface below hints
    ├── Message history
    ├── Context: Quest details auto-included
    ├── Claude API integration
    └── Streaming responses (real-time typing effect)
```

### Implementation Checklist

#### 1. Add Chat Schema to Database (1 hour)
- File: `prisma/schema.prisma`
- New model: `ChatSession`
  ```prisma
  model ChatSession {
    id              String    @id @default(uuid()) @db.Uuid
    adventurerId    String    @map("adventurer_id") @db.Uuid
    questId         String    @map("quest_id") @db.Uuid
    messages        ChatMessage[]
    createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz
    updatedAt       DateTime  @updatedAt @map("updated_at") @db.Timestamptz
    
    adventurer User   @relation(fields: [adventurerId], references: [id], onDelete: Cascade)
    quest      Quest  @relation(fields: [questId], references: [id], onDelete: Cascade)
    
    @@index([adventurerId])
    @@index([questId])
    @@map("chat_sessions")
  }

  model ChatMessage {
    id            String    @id @default(uuid()) @db.Uuid
    sessionId     String    @map("session_id") @db.Uuid
    role          String    // "user" | "assistant"
    content       String    @db.Text
    createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz
    
    session ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
    
    @@index([sessionId])
    @@map("chat_messages")
  }
  ```
- Migration: `npx prisma migrate dev --name add_copilot_chat`

**Effort**: 1 hour

#### 2. Create Claude API Integration (2 hours)
- File: `lib/copilot.ts`
- Function: `async function getAIHint(questContext, userMessage, chatHistory) → string`
- System prompt:
  ```
  You are a helpful coding mentor for junior developers. Your role:
  1. Help them think through problems, not solve them directly
  2. Ask clarifying questions when stuck
  3. Suggest debugging patterns, not code solutions
  4. Point to docs/resources
  5. Encourage exploration
  
  Context: [Quest title, description, requirements, difficulty]
  ```
- Input: Quest details + user message + chat history
- Output: Streaming response (use `ai.streamText()` for real-time typing)
- Cost optimization: Cache quest context (Claude prompt caching = 90% discount on repeated context)

**Effort**: 2 hours

#### 3. Create `/api/chat` Endpoint (2 hours)
- File: `app/api/chat/route.ts`
- POST endpoint: `{ questId, message }`
- Auth: Require logged-in adventurer
- Logic:
  1. Fetch/create ChatSession for this (adventurer, quest)
  2. Save user message
  3. Call `getAIHint(questContext, message, history)`
  4. Stream response to client
  5. Save assistant response
- Rate limiting: Max 20 messages per quest (prevent abuse)

**Effort**: 2 hours

#### 4. Build Chat UI Component (3 hours)
- File: `components/quest/CopilotChat.tsx`
- Features:
  - Expandable chat interface (initially hidden, toggle from HintPanel)
  - Message list (scrollable history)
  - Input field with "Send" button
  - Streaming response display (typing effect)
  - Error handling ("Something went wrong, try again")
  - "Copy message" button on assistant responses
  - Context banner: "Copilot is analyzing [Quest Name]..."
- Styling: Match HintPanel, use orange accent for assistant messages

**Effort**: 3 hours

#### 5. Integrate into HintPanel (1 hour)
- Add chat toggle button to HintPanel
- Show chat UI below hints when toggled open
- Keep hints visible above (don't hide them)

**Effort**: 1 hour

#### 6. Add Streaming & Client-Side Message Handling (2 hours)
- Use React `useEffect` + EventSource or fetch streaming
- Display assistant message in real-time as it arrives
- Disable input while waiting for response
- Auto-scroll to latest message

**Effort**: 2 hours

**Phase 2 Total Effort: 11 hours (~1.5 days)**

### Optional: Usage Analytics (1 hour)
- Log: quest_id, adventurer_id, message_count, resolved (yes/no)
- Use for Phase 3 learning path optimization

### Phase 2 Launch Checklist
- [ ] ChatSession & ChatMessage models in DB
- [ ] Claude API integration with prompt caching
- [ ] `/api/chat` endpoint live and rate-limited
- [ ] CopilotChat component built and styled
- [ ] Streaming responses working smoothly
- [ ] Beta: invite 50+ alpha users, collect feedback
- [ ] Analytics dashboard: monitor usage patterns
- [ ] Update VC deck: "See our AI mentor in action"

**Phase 2 Success Criteria**:
- Average response time: <2 seconds (with streaming)
- 30%+ of users engage with chat (not just hints)
- Qualitative: "Actually helped me debug" vs "Gave me the answer" (measure feedback)
- Cost: <$0.10 per chat session (with prompt caching)

---

## Phase 3: Adaptive Learning Paths (Weeks 7–12)

**Goal**: Use copilot interaction data to personalize learning journeys. Create a talent development engine.

### What Gets Built

1. **Skill Gap Detection**
   - Analyze chat messages: What did adventurer struggle with?
   - Tag messages: "struggling with async/await" or "doesn't understand recursion"
   - Store: `SkillGap` model in DB

2. **Adaptive Difficulty**
   - If adventurer asks many basic questions on a D-rank quest → offer easier E/F quests next
   - If adventurer breezes through quests → unlock harder ones early
   - Store: `AdventurerLearningProfile` model with skill scores

3. **Personalized Quest Recommendations**
   - Algorithm: Find quests that fill skill gaps at appropriate difficulty
   - Show in dashboard: "Recommended next quest: Node.js async patterns (E-Rank)"
   - Track: Did adventurer complete recommended quest? (feedback loop)

### Schema Changes (3 hours)
```prisma
model SkillGap {
  id            String   @id @default(uuid()) @db.Uuid
  adventurerId  String   @map("adventurer_id") @db.Uuid
  skillName     String   // "async/await", "recursion", etc.
  detectedAt    DateTime @default(now()) @map("detected_at") @db.Timestamptz
  frequency     Int      @default(1) // How many times detected
  resolved      Boolean  @default(false) // Did they master it later?
  
  adventurer User @relation(fields: [adventurerId], references: [id], onDelete: Cascade)
  
  @@index([adventurerId])
  @@map("skill_gaps")
}

model AdventurerLearningProfile {
  id            String   @id @default(uuid()) @db.Uuid
  adventurerId  String   @unique @map("adventurer_id") @db.Uuid
  skillScores   Json     // { "React": 0.7, "Node": 0.5, ... }
  lastUpdated   DateTime @updatedAt @map("last_updated") @db.Timestamptz
  
  adventurer User @relation(fields: [adventurerId], references: [id], onDelete: Cascade)
  
  @@map("adventurer_learning_profiles")
}
```

### Implementation (8 hours)
1. Extract skill tags from chat messages (NLP or manual rules) — 2 hours
2. Skill gap detection pipeline — 2 hours
3. Adaptive quiz/difficulty algorithm — 2 hours
4. Recommendation engine + dashboard widget — 2 hours

### Phase 3 ROI
- **User retention**: +40% (learning paths create habit)
- **Companies**: Get better-trained developers (skill tracking visible in profiles)
- **Licensing opportunity**: Enterprise training teams pay for adaptive learning analytics

---

## Go-to-Market Strategy

### For VC Pitch Deck (Use Phases 1–2)

**Slide 1: Problem**
- "Developers want to earn money *and* learn skills"
- "Bootcamps teach but don't place; freelance platforms place but don't teach"

**Slide 2: Solution**
- "Adventurers Guild: Learn while you earn with an AI copilot mentor"
- Show 3-panel screenshot:
  1. Quest detail page (left)
  2. Hint sidebar (right)
  3. Chat interface (bottom)

**Slide 3: Technology**
- "Claude API powers personalized AI guidance"
- "Adaptive learning engine (Phase 3) optimizes skill development"
- "Real-time analytics: Track which skills need help"

**Slide 4: Traction**
- "Alpha test: 50 adventurers, 30% use hints daily"
- "Completion time: 35% faster with copilot"
- "Companies: 20% higher submission quality from trained adventurers"

**Slide 5: Business Model**
- Phase 1–2: Free (user acquisition, validation)
- Phase 3: Premium tier ($9/mo) for companies to see adventurer skill reports + learning recommendations
- Bootcamp partnerships: Revenue share on placement premium

### Beta Launch Strategy (Week 1 of Phase 1)

1. **Invite**: 10 adventurers from existing user base
2. **Brief**: "Help us test our new copilot mentor"
3. **Collect feedback**: In-app survey after each quest
4. **Iterate**: Refine hints based on feedback (Thursday→Friday fix cycle)
5. **Go public**: Week 2, announce to all users in dashboard

### Bootcamp Partnership Pitch
- "Your students get real work + AI mentorship"
- "We track their skill development"
- "You pay 15% revenue share on their completed quests; we handle the tech"

---

## Effort & Timeline Summary

| Phase | Work | Timeline | Team |
|-------|------|----------|------|
| **1: MVP Hints** | 8h code + 4h content | Week 1–2 | You + Adil (4h each) |
| **2: AI Chat** | 11h code + 2h prompt engineering | Week 3–4 | You (primary) |
| **3: Adaptive** | 12h code + analytics | Week 5–8 | You + Adil (split) |
| **Total** | 37 hours (~1 sprint) | 2 months | 2 people |

**Quick wins (this week)**:
- [ ] Write 60 hints (4 hours, you + Adil split)
- [ ] Build Phase 1 MVP (8 hours, you)
- [ ] Screenshot for VC deck (30 min)

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Claude API costs explode | Use prompt caching, rate limit, monitor spend |
| Users get addicted to chat (don't learn) | Measure outcome: do they complete quests faster or slower? |
| Hints are wrong/unhelpful | Beta test with 10 users, iterate hints weekly |
| Scaling: API latency | Cache query results, async jobs for analytics |

---

## Success Metrics (Track Weekly)

```
Phase 1:
- Hint panel views: 50%+ of quest viewers
- Click-through: 30%+ of viewers click at least one hint
- NPS feedback: "Did this help?" (target: 7+/10)

Phase 2:
- Chat engagement: 20%+ of adventurers use chat
- Average session length: 3+ messages
- Message sentiment: Extract from responses (are they helping?)

Phase 3:
- Completion rate: 40%+ faster (with learning path vs. without)
- Skill mastery: Adventurers move 1 rank faster on average
- Revenue: Bootcamp partnerships signed
```

---

## Questions to Lock In (Before Starting)

1. **Phase 1 Launch**: Include in beta (Week 2) or post-launch (after soft launch)?
2. **Monetization**: Free forever or premium tier in Phase 3?
3. **Content**: You writing hints, or want help from contributors?
4. **Bootcamp**: Which bootcamp(s) do you want to partner with first?

---

**Next Step**: Start Phase 1 today. You can have a working MVP by end of Week 1.
