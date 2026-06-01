# Adventurers Guild — Admin Analytics Dashboard
# Page: /admin/analytics

## Overview

Displays platform health metrics for admin users:

- **DAU / WAU / MAU** — Daily, Weekly, Monthly Active Users
- **User Growth** — Adventurers vs Companies over time
- **Quest Pipeline** — Active, Completed, Rejected, Pending
- **Rank Distribution** — Bar chart of F→S distribution
- **Completion Metrics** — Fill rate, avg time, quality scores
- **Activity Feed** — Last 20 actions on the platform

## Implementation Plan

### Backend: `/app/api/admin/analytics/route.ts` ✅ ALREADY BUILT
- Endpoint: `GET /api/admin/analytics`
- Returns structured analytics data (see schema below)
- Protected: admin role only

### Frontend: `/admin/analytics/page.tsx`
- Recharts-based charts and graphs
- Real-time data from API
- Date range selector (7d / 30d / 90d)

### Schema: API Response
```json
{
  "success": true,
  "analytics": {
    "overview": {
      "dau": 12,
      "wau": 45,
      "mau": 89,
      "totalUsers": 104,
      "totalAdventurers": 89,
      "totalCompanies": 15
    },
    "quests": {
      "totalQuests": 14,
      "activeQuests": 8,
      "completedQuests": 6,
      "pendingQuests": 2,
      "rejectedQuests": 1,
      "byCategory": [...],
      "byTrack": [...]
    },
    "rankings": {
      "rankDistribution": [...],
      "topAdventurers": [...]
    },
    "activity": {
      "last7Days": [...]
    },
    "completionMetrics": {
      "completionRate": "75.0",
      "avgCompletionTimeDays": 3
    }
  }
}
```

## To Build the UI Page:

1. Create `app/admin/analytics/page.tsx`
2. Use `recharts` (already in dependencies) for charts
3. Fetch from `GET /api/admin/analytics`
4. Display: line chart (growth), bar chart (rank dist), pie chart (categories)
5. Add date range selector

## Status: Backend ✅ | Frontend 🔲