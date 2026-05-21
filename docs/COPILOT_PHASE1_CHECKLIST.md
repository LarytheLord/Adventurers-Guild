# Phase 1 Implementation Checklist: Hint Sidebar MVP

## Timeline: Week 1–2 (This Week!)

### Day 1: Content + Architecture Setup (4 hours)

#### Task 1.1: Write Hint Database Content (2–3 hours)
**Owner**: You + Adil (split by category)

**File to create**: `lib/quest-hints.ts`

**Structure**: 
```typescript
export const questHints = {
  frontend: {
    F: [
      {
        section: 'getting_started',
        title: 'Start with the requirements',
        content: 'Read the "Deliverables" section carefully. Check if any starter code is provided.',
      },
      {
        section: 'common_mistakes',
        title: 'Import errors are the #1 issue',
        content: 'Make sure you\'ve imported all hooks and components. Use `import { ... } from "react"`',
      },
      // ... 3-5 total per difficulty
    ],
    E: [...],
    D: [...],
  },
  backend: { F: [...], E: [...], D: [...] },
  // ... repeat for: fullstack, ai_ml, mobile, devops, security, qa, design, data_science
}
```

**Content Guidelines** (copy-paste these):
- **Getting Started**: "Read X first", "Check if Y is provided", "Start by understanding Z"
- **Common Mistakes**: "Don't forget X", "Avoid this pattern", "This breaks when Y"
- **Patterns**: "Use X pattern for this", "Consider this approach", "Recommended way is..."
- **Resources**: "Helpful docs: [link]", "Example code: [link]"

**Example completed**:
```typescript
frontend: {
  F: [
    {
      section: 'getting_started',
      title: 'Understand the component requirements',
      content: 'Carefully read what props this component should accept. What should it render? What events should it handle?',
    },
    {
      section: 'getting_started',
      title: 'Check the test file for hints',
      content: 'The test file shows exactly how your component will be used. This is your spec.',
    },
    {
      section: 'common_mistakes',
      title: 'Forgetting to import React',
      content: 'Each file that uses JSX needs: `import { useState, useEffect } from "react"`',
    },
    {
      section: 'patterns',
      title: 'State management in React',
      content: 'Use `useState` for simple values, `useReducer` for complex logic, `useContext` for shared state.',
    },
    {
      section: 'resources',
      title: 'React documentation',
      content: 'https://react.dev/learn is your friend. Especially check the Hooks guide.',
    },
  ],
  E: [...similar but harder...],
  D: [...harder still...],
}
```

**Effort breakdown**:
- Frontend: 30 min (5 hints × 3 difficulties)
- Backend: 30 min
- Fullstack: 20 min (fewer, since it overlaps frontend + backend)
- AI/ML: 20 min
- Other (Mobile, DevOps, Security, QA, Design, Data Science): 20 min each
- **Total: ~2.5 hours** (you + Adil split, 1.25 each)

#### Task 1.2: Create API Route (1 hour)
**Owner**: You

**File**: `app/api/public/quest-hints/route.ts`

```typescript
import { questHints } from '@/lib/quest-hints';
import { QuestCategory, UserRank } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as QuestCategory | null;
  const difficulty = searchParams.get('difficulty') as UserRank | null;

  if (!category || !difficulty) {
    return Response.json({ error: 'Missing category or difficulty' }, { status: 400 });
  }

  const hints = questHints[category as keyof typeof questHints]?.[difficulty as keyof any];

  if (!hints) {
    return Response.json({ hints: [] });
  }

  return Response.json({
    hints,
    count: hints.length,
  });
}
```

**Testing**: 
```bash
curl "http://localhost:3000/api/public/quest-hints?category=frontend&difficulty=F"
```

---

### Day 2: Build UI Components (3 hours)

#### Task 2.1: Create HintPanel Component (2 hours)
**Owner**: You

**File**: `components/quest/HintPanel.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, AlertCircle, BookOpen, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Hint {
  section: 'getting_started' | 'common_mistakes' | 'patterns' | 'resources';
  title: string;
  content: string;
}

interface HintPanelProps {
  questCategory: string;
  questDifficulty: string;
}

export function HintPanel({ questCategory, questDifficulty }: HintPanelProps) {
  const [hints, setHints] = useState<Hint[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedHints, setExpandedHints] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchHints = async () => {
      try {
        const res = await fetch(
          `/api/public/quest-hints?category=${questCategory}&difficulty=${questDifficulty}`
        );
        const data = await res.json();
        setHints(data.hints || []);
      } catch (error) {
        console.error('Failed to fetch hints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHints();
  }, [questCategory, questDifficulty]);

  const toggleHint = (title: string) => {
    const newExpanded = new Set(expandedHints);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedHints(newExpanded);
  };

  const hintsBySection = {
    getting_started: hints.filter((h) => h.section === 'getting_started'),
    common_mistakes: hints.filter((h) => h.section === 'common_mistakes'),
    patterns: hints.filter((h) => h.section === 'patterns'),
    resources: hints.filter((h) => h.section === 'resources'),
  };

  return (
    <Card className="h-full bg-gradient-to-b from-orange-50 to-white border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-orange-500" />
          Copilot Hints
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading hints...</div>
        ) : hints.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No hints available for this quest.</div>
        ) : (
          <Tabs defaultValue="getting_started" className="w-full">
            <TabsList className="grid w-full grid-cols-4 text-xs mb-4">
              <TabsTrigger value="getting_started">Start</TabsTrigger>
              <TabsTrigger value="common_mistakes">Avoid</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="resources">Links</TabsTrigger>
            </TabsList>

            {Object.entries(hintsBySection).map(([section, sectionHints]) => (
              <TabsContent key={section} value={section} className="space-y-3 mt-0">
                {sectionHints.length === 0 ? (
                  <p className="text-sm text-slate-500">No hints in this category.</p>
                ) : (
                  sectionHints.map((hint, idx) => (
                    <div
                      key={`${section}-${idx}`}
                      className="border border-slate-200 rounded-lg overflow-hidden bg-white"
                    >
                      <button
                        onClick={() => toggleHint(`${section}-${idx}`)}
                        className="w-full px-4 py-3 flex items-start gap-2 hover:bg-orange-50 transition-colors"
                      >
                        {section === 'common_mistakes' && (
                          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        {section === 'resources' && (
                          <LinkIcon className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        )}
                        {(section === 'getting_started' || section === 'patterns') && (
                          <Lightbulb className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-sm font-medium text-left text-slate-900">
                          {hint.title}
                        </span>
                      </button>

                      {expandedHints.has(`${section}-${idx}`) && (
                        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                          <p className="text-sm text-slate-700 leading-relaxed">{hint.content}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}

        <div className="mt-6 pt-4 border-t border-slate-200">
          <Button
            disabled
            className="w-full bg-slate-300 text-slate-600 cursor-not-allowed"
            title="Coming in Phase 2"
          >
            💬 Open Full Chat (Coming Soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Task 2.2: Integrate into Quest Detail Page (1 hour)
**Owner**: You

**Find your quest detail page**: Likely `app/dashboard/quests/[id]/page.tsx` or similar

**Add this layout**:
```typescript
// At the top of the component, import HintPanel
import { HintPanel } from '@/components/quest/HintPanel';

// In your JSX, wrap the quest content in a 2-column layout:
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Main content: 2 columns (70%) */}
  <div className="lg:col-span-2">
    {/* Your existing quest detail content here */}
    <h1>{quest.title}</h1>
    <p>{quest.description}</p>
    {/* ... rest of quest details ... */}
  </div>

  {/* Sidebar: 1 column (30%) */}
  <div className="lg:col-span-1">
    <HintPanel questCategory={quest.questCategory} questDifficulty={quest.difficulty} />
  </div>
</div>
```

---

### Day 3: Testing & Polish (2 hours)

#### Task 3.1: Test All Paths (1 hour)
**Owner**: You

- [ ] Fetch hints API: `curl "http://localhost:3000/api/public/quest-hints?category=frontend&difficulty=F"`
- [ ] HintPanel loads on quest page
- [ ] Hints expand/collapse smoothly
- [ ] Mobile responsive: panel becomes full-width below quest content
- [ ] Error handling: gracefully show "No hints" if API fails

#### Task 3.2: Polish & Screenshot (1 hour)
**Owner**: You

- [ ] Verify colors match design (orange accents, slate text)
- [ ] Test on mobile (use browser dev tools)
- [ ] Screenshot for VC deck: "See how adventurers get real-time guidance"
- [ ] Write 1–2 sentence description for beta user email

---

### Day 4: Beta Launch (1 hour)

#### Task 4.1: Invite Alpha Users
**Owner**: You

**Email template**:
```
Subject: Help us test Adventurers Guild's new Copilot Hints

Hi [Name],

We're launching an AI-powered hint system to help adventurers learn faster. 
Your quest detail pages now include a "Copilot Hints" sidebar with tips, 
common mistakes, and resources.

Try it out this week and let us know what you think! Does it help?

[Link to quest board]

Reply with: ✅ Helpful | ❓ Could be better | 🚫 Doesn't help

-[Your name]
```

**Send to**: 10–15 most active adventurers on your platform

#### Task 4.2: Collect Feedback
**Owner**: You + Adil

- [ ] Daily check: Are users engaging with hints?
- [ ] Collect replies: Do they find it helpful?
- [ ] Iterate hints: If feedback is "too basic" → make harder; if "too hard" → simplify
- [ ] Log: Which hints get clicked most? (reveals pain points)

---

## Daily Standup Template (Use This!)

```
🎯 Today's Goal: [One clear task]

✅ Done:
- [Task + hours]
- [Task + hours]

⏳ In Progress:
- [Task + hours remaining]

🚧 Blockers:
- [Issue + solution]

📊 Metrics:
- Hints fetched: X/day
- Click-through rate: Y%
- User feedback: [sentiment]
```

---

## Git Commit Messages (Suggested)

```bash
# Day 1
git commit -m "feat: add quest hints database and API endpoint

- Add questHints with 60+ hints across all categories
- Create /api/public/quest-hints GET endpoint
- Support filtering by category and difficulty"

# Day 2
git commit -m "feat: build HintPanel component with tab interface

- Add HintPanel with 4 tabs: Getting Started, Common Mistakes, Patterns, Resources
- Implement expand/collapse for individual hints
- Add mobile-responsive sidebar layout"

git commit -m "feat: integrate HintPanel into quest detail page

- Add 70/30 layout: quest content / hints sidebar
- Mobile: panel becomes full-width drawer below content
- Ready for beta testing"

# Day 4
git commit -m "beta: launch Copilot Hints MVP to 10 alpha users

- Invite users to test and provide feedback
- Collect usage metrics and sentiment
- Iterate based on feedback throughout week"
```

---

## Success Criteria for Phase 1 ✅

By end of Week 1:
- [ ] 60+ hints written and deployed
- [ ] `/api/public/quest-hints` endpoint working
- [ ] HintPanel component responsive (desktop + mobile)
- [ ] Integrated into quest detail page
- [ ] 10 alpha users invited and testing
- [ ] Collecting feedback daily
- [ ] Screenshot ready for VC pitch

By end of Week 2:
- [ ] 50%+ of alpha users clicking hints
- [ ] Average rating: 7+/10 on "Did this help?"
- [ ] Refined hints based on feedback
- [ ] Ready to announce to all beta users
- [ ] VC pitch slide: "See our copilot in action"

---

## Files to Create/Modify

| File | Status | Owner | Time |
|------|--------|-------|------|
| `lib/quest-hints.ts` | Create | You + Adil | 2.5h |
| `app/api/public/quest-hints/route.ts` | Create | You | 1h |
| `components/quest/HintPanel.tsx` | Create | You | 2h |
| `app/dashboard/quests/[id]/page.tsx` | Modify | You | 1h |
| `docs/COPILOT_IMPLEMENTATION_PLAN.md` | ✅ Done | — | — |

**Total Effort: 8 hours (~1 day focused work)**

---

## Quick Reference: Hints Content Template

Copy-paste this for each category/difficulty combo:

```typescript
[categoryName]: {
  F: [
    { section: 'getting_started', title: '...', content: '...' },
    { section: 'getting_started', title: '...', content: '...' },
    { section: 'common_mistakes', title: '...', content: '...' },
    { section: 'patterns', title: '...', content: '...' },
    { section: 'resources', title: '...', content: '...' },
  ],
  E: [ /* same structure but harder */ ],
  D: [ /* harder still */ ],
}
```

---

## Next: Prepare for Phase 2

Once Phase 1 is live and validated:
1. Set up Claude API integration (get API key)
2. Design system prompt for copilot
3. Plan chat message schema

But **focus Phase 1 first**. Get user validation before investing in AI.

Good luck! 🚀
