# Monetization Implementation Roadmap

Concrete technical steps to implement the financial model in the Adventurers Guild codebase.

---

## Phase 1: Stripe Connect + Service Fee (Weeks 1-3)

### 1.1 Stripe Connect Setup
- Install `stripe` npm package
- Create `/lib/stripe.ts` — Stripe singleton client
- Create `POST /api/stripe/connect/onboard` — generates Stripe Connect onboarding link for adventurers
- Create `GET /api/stripe/connect/callback` — handles return from Stripe onboarding
- Add `stripeAccountId` field to `AdventurerProfile` schema
- Add `stripeCustomerId` field to `CompanyProfile` schema
- Build UI: adventurer settings page with "Connect your bank account" button

### 1.2 Service Fee Integration
- Add to `prisma/schema.prisma`:
  ```
  platformFee     Decimal?  @map("platform_fee") @db.Decimal(10, 2)
  platformFeeRate Decimal?  @map("platform_fee_rate") @db.Decimal(4, 4)
  ```
  on the `Transaction` model
- Update quest creation form: show "Company pays: $X + $Y service fee = $Z total" preview
- Update `POST /api/payments` to calculate and store platformFee (15% of quest reward)
- Update company payments page to show fee breakdown

### 1.3 Escrow Flow
- Replace simulated `txn_${Date.now()}` with real Stripe PaymentIntent
- On quest acceptance: create PaymentIntent with `capture_method: 'manual'` (authorization hold)
- On quest approval: capture the payment, transfer to adventurer's Connect account minus platform fee
- On quest rejection/cancellation: cancel the PaymentIntent (release hold)
- Add `stripePaymentIntentId` to Transaction model

### 1.4 Webhook Handler
- Create `POST /api/stripe/webhooks` — handle Stripe webhook events
- Handle: `payment_intent.succeeded`, `payment_intent.payment_failed`, `transfer.created`, `account.updated`
- Update Transaction status based on webhook events

---

## Phase 2: Subscriptions + Boosts (Weeks 4-6)

### 2.1 Company Subscription Plans
- Create Stripe Products + Prices for Starter (free), Guild Partner ($149), Enterprise ($499)
- Add to `CompanyProfile` schema:
  ```
  subscriptionPlan  String   @default("starter") @map("subscription_plan")
  stripeSubId       String?  @map("stripe_subscription_id")
  questsThisMonth   Int      @default(0) @map("quests_this_month")
  billingCycleStart DateTime? @map("billing_cycle_start")
  ```
- Create `POST /api/stripe/checkout` — creates Checkout Session for plan upgrade
- Create `POST /api/stripe/portal` — opens Stripe Customer Portal for plan management
- Enforce quest limit: Starter = 3 quests/month (check `questsThisMonth` in POST /api/company/quests)
- Build UI: Company settings > "Billing & Plan" tab with plan comparison cards
- Reset `questsThisMonth` via Stripe webhook on subscription renewal

### 2.2 Quest Boost Feature
- Add to `Quest` schema:
  ```
  isFeatured    Boolean   @default(false) @map("is_featured")
  featuredUntil DateTime? @map("featured_until")
  isUrgent      Boolean   @default(false) @map("is_urgent")
  urgentUntil   DateTime? @map("urgent_until")
  ```
- Create `POST /api/quests/[id]/boost` — Stripe Checkout for $29 Featured or $49 Urgent
- Update quest listing queries: ORDER BY isUrgent DESC, isFeatured DESC, createdAt DESC
- Update QuestShowcase and quest board UI: show "Featured" / "Urgent" badges
- Cron or webhook to clear expired boosts (featuredUntil < now)

---

## Phase 3: Admin Revenue Dashboard (Week 7)

### 3.1 Revenue Analytics
- Create `GET /api/admin/revenue` — returns:
  - Total GMV (sum of all quest monetaryRewards)
  - Platform revenue (sum of platformFee on completed transactions)
  - MRR from subscriptions (count of active plans * price)
  - Boost revenue (count of boost purchases * price)
  - Quest fill rate, average time to fill
- Build `/admin/revenue` page with charts (recharts or tremor):
  - GMV over time (line chart)
  - Revenue by stream (stacked bar)
  - Active adventurers & companies (line chart)
  - Quest fill rate trend (area chart)

---

## Phase 4: Talent Pipeline (Weeks 8-10, Future)

### 4.1 Talent Search
- Create `GET /api/talent/search` — returns adventurer profiles filtered by rank, skills, completion rate, availability
- Add `isAvailableForHire Boolean @default(false)` to AdventurerProfile
- Build `/talent` directory page (companies only, behind subscription gate)
- Show: rank badge, skills, completion rate, quest count, portfolio samples

### 4.2 Direct Hire
- Create `HireOffer` model in schema (fromCompany, toAdventurer, salary, status, placementFee)
- Create `POST /api/talent/offer` — company sends offer
- Create `PUT /api/talent/offer/[id]` — adventurer accepts/declines
- On acceptance: charge 10% placement fee to company via Stripe
- Build notification flow for offers

---

## Database Migration Summary

All new fields to add to `prisma/schema.prisma`:

```prisma
// AdventurerProfile additions
model AdventurerProfile {
  stripeAccountId    String?  @map("stripe_account_id")
  isAvailableForHire Boolean  @default(false) @map("is_available_for_hire")
}

// CompanyProfile additions
model CompanyProfile {
  stripeCustomerId   String?  @map("stripe_customer_id")
  subscriptionPlan   String   @default("starter") @map("subscription_plan")
  stripeSubId        String?  @map("stripe_subscription_id")
  questsThisMonth    Int      @default(0) @map("quests_this_month")
  billingCycleStart  DateTime? @map("billing_cycle_start")
}

// Transaction additions
model Transaction {
  platformFee        Decimal? @map("platform_fee") @db.Decimal(10, 2)
  platformFeeRate    Decimal? @map("platform_fee_rate") @db.Decimal(4, 4)
  stripePaymentIntentId String? @map("stripe_payment_intent_id")
}

// Quest additions
model Quest {
  isFeatured    Boolean   @default(false) @map("is_featured")
  featuredUntil DateTime? @map("featured_until")
  isUrgent      Boolean   @default(false) @map("is_urgent")
  urgentUntil   DateTime? @map("urgent_until")
}
```

---

## Environment Variables Needed

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PARTNER_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## Priority Order

1. **Stripe Connect + real payments** (without this, nothing else works)
2. **Service fee on transactions** (this is the primary revenue)
3. **Escrow/hold flow** (trust and safety)
4. **Company subscriptions** (recurring revenue)
5. **Quest boosts** (easy upsell)
6. **Admin revenue dashboard** (visibility)
7. **Talent pipeline** (future growth)

---

*Last updated: 2026-03-11*
