# VIT Student Recruitment Campaign Setup

## Overview
This guide explains how to run the VIT student recruitment email campaign using the `recruit-vit-students.ts` script.

---

## 1️⃣ Prerequisites

### Resend API Key
1. Go to [resend.com](https://resend.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Copy your API key

### Environment Setup
Add your Resend API key to `.env.local`:

```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANT:** Never commit this key to git. It's already in `.gitignore`.

### Sender Email Domain
The script sends from `noreply@guilds.work`. To use this:
1. In Resend dashboard, verify the `guilds.work` domain
2. Or change `RESEND_FROM_EMAIL` in the script to your verified domain

---

## 2️⃣ Running the Campaign

### Quick Start
```bash
# Run the script
npx ts-node scripts/recruit-vit-students.ts
```

### What Happens
1. ✅ Reads student data from `temp/Untitled spreadsheet.xlsx`
2. ✅ Loads previous send log to avoid duplicates
3. ✅ Shows stats (total, already sent, new to send)
4. ✅ Sends emails with 500ms delay between each (respects rate limits)
5. ✅ Logs all results to `recruitment-logs.json`

### Expected Output
```
📧 VIT Student Recruitment Campaign
=====================================

📂 Reading student data...
✅ Found 353 students

📊 Stats:
   Total students: 353
   Already sent: 0
   New to send: 353

[1/353] Sending to vcreddy1995@gmail.com...
   ✅ Sent to Chiranjeevi reddy veerapureddy
[2/353] Sending to mukeshpotnuru2005@gmail.com...
   ✅ Sent to Potnuru Mukesh
...

=====================================
✅ Campaign Complete!
   Sent: 353
   Failed: 0
   Log: recruitment-logs.json
```

---

## 3️⃣ Rate Limiting

**Resend Free Tier Limits:**
- ~100 emails/day
- This script respects limits by:
  - Sending 500ms apart (120 emails/10 min)
  - Logging all sends to track daily usage
  - Skipping already-sent emails (idempotent)

**Recommended Usage:**
- **Day 1:** Run once (first 100 emails)
- **Day 2:** Run again (next 100 emails)
- **Day 3:** Run again (remaining 153 emails)

---

## 4️⃣ Tracking & Analytics

### Log File: `recruitment-logs.json`
```json
[
  {
    "timestamp": "2026-06-10T10:30:45.123Z",
    "email": "student@vit.ac.in",
    "name": "Student Name",
    "status": "sent",
    "error": null
  },
  {
    "timestamp": "2026-06-10T10:31:15.456Z",
    "email": "invalid@example.com",
    "name": "Another Student",
    "status": "failed",
    "error": "Invalid email"
  }
]
```

### View Results
```bash
# Count sent emails
cat recruitment-logs.json | grep '"status": "sent"' | wc -l

# Find failures
cat recruitment-logs.json | grep '"status": "failed"'

# Pretty print
cat recruitment-logs.json | jq '.'
```

---

## 5️⃣ Email Content

The script sends a **highly targeted email** that includes:

✅ **Hook:** "Real projects, real pay, real credentials"  
✅ **Value Props:**
- Build verified portfolio (Guild Card)
- Earn money while learning (₹10k-50k per project)
- Direct mentorship + internships
- Bootcamp structure with ranking system

✅ **Clear CTA:** Link to `guilds.work` signup  
✅ **Community:** WhatsApp channel (important for engagement)  
✅ **Contact:** Direct email to `abid@guilds.work`  

---

## 6️⃣ Customization

### Change Email Template
Edit the `generateEmailHTML()` function in `scripts/recruit-vit-students.ts`:
- Subject line (currently: "You're Invited: Real Projects, Real Pay, Real Credentials")
- HTML content
- Links (guilds.work, LinkedIn, WhatsApp, X, email)

### Change Sender Details
```typescript
// Line 17-18
const RESEND_FROM_EMAIL = 'noreply@guilds.work';
// or
const RESEND_FROM_EMAIL = 'recruitment@guilds.work';
```

### Change Delay Between Sends
```typescript
// Line 19 (currently 500ms)
const DELAY_BETWEEN_SENDS_MS = 500;
// Safe range: 200-1000ms
```

---

## 7️⃣ Monitoring & Follow-up

### Track Email Opens
Set up Resend webhook to track:
- Email opens
- Clicks on links
- Bounces (invalid emails)

### Expected Response Rate
- **Industry avg:** 2-5% click-through rate
- **Expected:** 7-14 clicks on signup link (353 emails)
- **Expected signups:** 2-7 students (conservative estimate)

### Follow-up Strategy
1. **Day 1-2:** Initial send + let them discover
2. **Day 3-4:** Check signups + follow up (WhatsApp channel posts)
3. **Day 7:** Email reminder ("Still interested in ₹X per project?")
4. **Weekly:** Community engagement (WhatsApp channel stories, LinkedIn posts)

---

## 8️⃣ Troubleshooting

### "RESEND_API_KEY not found"
```bash
# Verify .env.local exists and has the key
cat .env.local | grep RESEND_API_KEY

# If missing, add it:
echo "RESEND_API_KEY=re_xxxx" >> .env.local
```

### "Excel file not found"
```bash
# Verify file location
ls -la temp/Untitled\ spreadsheet.xlsx

# If missing, copy from Downloads:
cp ~/Downloads/Untitled\ spreadsheet.xlsx ./temp/
```

### Email sending fails
Check Resend dashboard for:
- Domain verification status
- API quota usage
- Bounce/invalid email list

---

## 9️⃣ Next Steps After Campaign

1. **Monitor WhatsApp Channel**
   - Link: https://whatsapp.com/channel/0029Vb8p9Eq5PO19TVAu8G1R
   - Post daily tips/quest updates
   - Answer questions in real-time

2. **Follow Up Personally**
   - For high-interest students (LinkedIn viewers)
   - For top performers (once they sign up)
   - For technical questions → Slack/Discord

3. **Optimize Email**
   - Track open rates in Resend
   - A/B test subject line if needed
   - Update email based on feedback

4. **Scale Outreach**
   - Repeat for other colleges (once VIT pipeline is warm)
   - Target by major (CSE first, then others)
   - Leverage student referrals (incentivize)

---

## 🔟 Support

**Questions about the campaign?**
- Email: abid@guilds.work
- WhatsApp: [Community channel](https://whatsapp.com/channel/0029Vb8p9Eq5PO19TVAu8G1R)
- LinkedIn: [Adventurers Guild](https://www.linkedin.com/company/adventurers-guild/)

---

## Script Metadata
- **Created:** June 10, 2026
- **Status:** Production Ready
- **Rate Limit:** ~100 emails/day (Resend free tier)
- **Log File:** `recruitment-logs.json`
- **Author:** Claude Code
