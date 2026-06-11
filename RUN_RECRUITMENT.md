# 🚀 Quick Start: VIT Student Recruitment Campaign

## 60-Second Setup

### Step 1: Get Your Resend API Key (2 min)
1. Go to https://resend.com/dashboard/api-keys
2. Copy your API key (starts with `re_`)
3. Add to `.env.local`:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
   ```

### Step 2: Run the Campaign (1 click)
```bash
npx ts-node scripts/recruit-vit-students.ts
```

### Step 3: Watch It Work! ✨
The script will:
- ✅ Load 250 VIT students
- ✅ Send personalized emails (500ms apart, respects rate limits)
- ✅ Log all results to `recruitment-logs.json`
- ✅ Skip already-sent emails if you run it again

---

## What Happens After

### The Email They Receive
📧 Subject: `🎮 You're Invited: Real Projects, Real Pay, Real Credentials`

**Key CTAs:**
- 🎯 Sign up on [guilds.work](https://guilds.work)
- 💬 Join WhatsApp channel for updates: [link](https://whatsapp.com/channel/0029Vb8p9Eq5PO19TVAu8G1R)
- 📧 Questions: [abid@guilds.work](mailto:abid@guilds.work)

### Expected Results (Conservative)
- **Email delivery rate:** ~95-98% (some invalid emails)
- **Open rate:** 15-25% (students check recruitment emails)
- **Click rate:** 2-5% (estimated 5-12 clicks on signup)
- **Signup rate:** 1-3% (2-7 new students)

---

## Rate Limits

**Resend Free Tier:** ~100 emails/day

**Split across 3 days:**
- **Day 1:** Run script → sends first 100 emails → wait
- **Day 2:** Run script → sends next 100 emails → wait  
- **Day 3:** Run script → sends remaining 50 emails

The script automatically skips already-sent emails, so you can safely run it multiple times.

---

## Monitoring

### View Results (Real-Time)
```bash
# See all sent emails
cat recruitment-logs.json | grep '"status": "sent"' | wc -l

# See failures
cat recruitment-logs.json | jq '.[] | select(.status == "failed")'

# Pretty print everything
cat recruitment-logs.json | jq '.'
```

### Track Engagement
1. Go to Resend dashboard → **Emails** tab
2. Filter by domain: `guilds.work`
3. View open rates, click rates, bounces

---

## Customize (Optional)

### Change Email Subject
Edit `scripts/recruit-vit-students.ts` line 228:
```typescript
subject: '🎮 You\'re Invited: Real Projects, Real Pay, Real Credentials',
// Change to:
subject: '💰 Earn While You Learn - VIT Students Only',
```

### Change Email Body
Edit `generateEmailHTML()` function (lines 123-217) to customize:
- Hook/headline
- Value props
- Links
- CTAs

### Change Sender Email
Edit line 17:
```typescript
const RESEND_FROM_EMAIL = 'noreply@guilds.work';
// Change to:
const RESEND_FROM_EMAIL = 'recruitment@guilds.work';
```

---

## Troubleshooting

### ❌ "RESEND_API_KEY not found"
```bash
# Check if .env.local exists
cat .env.local | grep RESEND_API_KEY

# If not, add it
echo "RESEND_API_KEY=re_xxxxx" >> .env.local
```

### ❌ "Excel file not found"
```bash
# Make sure temp directory exists
mkdir -p temp

# Check file location
ls -la temp/Untitled\ spreadsheet.xlsx
```

### ❌ Emails failing with "API key is invalid"
- Verify your Resend API key is correct
- Check API key hasn't expired in Resend dashboard
- Make sure `guilds.work` domain is verified in Resend

---

## Follow-Up Strategy

**After emails are sent:**

### Day 1-2: Let Them Discover
- Emails arrive + students see the message
- Monitor WhatsApp channel for questions

### Day 3-4: Community Engagement
- Post in WhatsApp channel: "What can you build with ₹X per project?"
- Share a success story from an early adopter
- Answer technical questions

### Day 7: Email Reminder
Consider sending a follow-up email to non-openers:
- "Still interested in real projects + real money?"
- Highlight biggest differentiator (e.g., "Earn ₹50k by summer")

### Ongoing: Nurture Pipeline
- Weekly WhatsApp posts with quest highlights
- LinkedIn updates about new internship opportunities
- Direct outreach to engaged students

---

## Success Metrics

| Metric | Target | How to Check |
|--------|--------|-------------|
| **Delivery Rate** | 95%+ | Resend dashboard |
| **Open Rate** | 15%+ | Email analytics |
| **Click Rate** | 2%+ | Resend dashboard |
| **Signup Rate** | 1%+ | Check users registered in AG |
| **Response Rate** | 5%+ | Monitor abid@guilds.work emails |

---

## Next Steps

1. ✅ Set up `.env.local` with Resend API key
2. ✅ Run: `npx ts-node scripts/recruit-vit-students.ts`
3. ✅ Monitor results in `recruitment-logs.json`
4. ✅ Join WhatsApp channel to engage with students
5. ✅ Track signups in AG dashboard

---

## Questions?

- 📧 Email: abid@guilds.work
- 💬 WhatsApp: [Community channel](https://whatsapp.com/channel/0029Vb8p9Eq5PO19TVAu8G1R)
- 🔗 LinkedIn: [Adventurers Guild](https://www.linkedin.com/company/adventurers-guild/)

---

**Happy recruiting! 🎉**
