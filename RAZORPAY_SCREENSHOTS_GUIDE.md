# Razorpay Integration Screenshots - Adventurers Guild

## 1. Payment Flow (Inbound - Company Pays Quest Reward)

### Quest Posting Page
URL: https://adventurersguild.dev/dashboard/company/create-quest
- Company posts a quest with monetary reward (e.g., ₹10,000)
- Platform fee (15%) added automatically
- Total charge: ₹11,500 (₹10,000 + ₹1,500 fee)

### Razorpay Checkout
- Company clicks "Pay & Post Quest"
- Razorpay Standard Checkout opens
- Payment method: UPI, Netbanking, Cards, Wallets
- Amount displayed: ₹11,500 INR

### After Payment
- Quest goes live on /dashboard/quests
- Company redirected to /dashboard/company/quests
- Transaction recorded in DB (status: completed)

---

## 2. Payout Flow (Outbound - Developer Receives Payment)

### Quest Completion
URL: https://adventurersguild.dev/dashboard/quests/[id]
- Developer submits completed work
- Company reviews and approves
- Admin can trigger payout from /admin/qa-queue

### RazorpayX Payout
- Developer links bank account via Razorpay Contact API
- Fund Account created for developer
- On approval: RazorpayX transfer to developer's bank
- Amount: ₹8,500 (₹10,000 - ₹1,500 fee)

### Developer Receives
- Direct bank transfer (NEFT/IMPS)
- Transaction ID: razorpay_payout_xxx
- Notification: "Payout of ₹8,500 received"

---

## 3. API Endpoints (For Razorpay Technical Review)

### Payment Order Creation
```
POST /api/payments/razorpay/order
Body: { questId: "abc123", amount: 11500 }
Response: { orderId: "order_xxx", amount: 11500, currency: "INR" }
```

### Webhook Handler
```
POST /api/payments/webhooks/razorpay
Headers: 
  - x-razorpay-signature: "sha256=..."
Body: { event: "payment.captured", payload: { order_id: "order_xxx" } }
```

### Payout Trigger (Admin)
```
POST /api/admin/quests/[id]/approve
Body: { action: "approve_and_payout" }
→ Triggers RazorpayX transfer to developer's fund account
```

---

## 4. Environment Variables (For Razorpay Verification)

```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_ACCOUNT_NUMBER=xxxxxxxxx (for RazorpayX)
RAZORPAY_WEBHOOK_SECRET=xxxxx
```

---

## 5. Volume Projections

| Period | Inbound Payments | Outbound Payouts | Total Volume (₹) |
|--------|------------------|-------------------|---------------------|
| Month 1 (Early Access) | 15-20 | 12-15 | ₹1.7L - ₹2.3L |
| Month 2 (Growth) | 30-40 | 25-35 | ₹3.5L - ₹4.5L |
| Month 3 (Scale) | 50-75 | 40-60 | ₹6L - ₹8L |

---

## 6. Compliance Checklist

- ✅ GSTIN: In process (will provide before go-live)
- ✅ Business Type: Service marketplace (not e-commerce)
- ✅ Currency: INR only (Indian market focus)
- ✅ Refund Policy: 7-day window (stated in Terms)
- ✅ KYC: Developers verified via RazorpayX before first payout
- ✅ Webhook Security: HMAC-SHA256 signature verification

---

Screenshots can be provided upon request (staging site: https://adventurersguild.vercel.app)

Contact: admin@adventurersguild.dev
Phone: [Your phone number]
