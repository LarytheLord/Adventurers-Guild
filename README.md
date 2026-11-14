# Guild

Guild runs independent checks on apps and AI systems before people rely on them.
This repo is the code for the Guild website.

Guild is early stage. It gives no legal advice. It is not a CERT-In empanelled
auditor and does not issue a CERT-In audit or certificate. We help you prepare for
one, and we can test as a partner to firms that are empanelled.

## What is on the site

Free self-checks run in your browser. Nothing you answer is sent to us.

- `/` - home page. It leads with the Launch Check.
- `/launch-check` - a free 20-question self-check for apps built with Lovable, Bolt,
  Replit, v0 or Cursor. It covers payments, deployment, performance and cost, and
  security. The page also has a form to request a Launch Check. The form opens your
  own mail app with a prefilled email; the site does not store it.
- `/audit` - the paid Launch Check and what it includes (see below).
- `/checklist` - a checklist of 48 items, in groups, each with a reason.
- `/dpdp-readiness` - a free 20-question self-check mapped to the Digital Personal
  Data Protection Act 2023. Not legal advice.
- `/guides` - hub for the guides. They include
  `/guides/dpdp-rules-what-startups-must-do`, and four CERT-In guides:
  `/guides/cert-in-ai-security-auditing-guidelines`,
  `/guides/cert-in-ai-audit-evidence-checklist`,
  `/guides/does-cert-in-require-an-ai-audit` and
  `/guides/what-is-an-ai-risk-tier-cert-in`. There is also
  `/guides/check-supabase-rls-lovable-bolt`.
- `/ai-risk-tier` - a free calculator that scores an AI system on the eight risk
  factors in the CERT-In AI Security Auditing Guidelines (v1.0, 4 November 2026) and
  shows its tier.
- `/indic-ai-qa` - a two-week pilot of AI quality checks for Hindi, Gujarati and
  Hinglish.

### Paid offers on /audit

| Package | Price | What it is |
|---|---|---|
| Check | $99, 2 working days | A report with each finding rated critical, high, medium or low, plus a fixed quote to fix what we found. The $99 is credited to a Fix. |
| Fix | From $800 | We fix the critical and high findings, re-check them and say what is closed. The price is a fixed quote after the Check. |
| Care | From $150/month | Dependency and platform updates, a monthly backup check, monitoring, and 2 hours of fixes each month. |

We only test your own app. We do not test third-party systems and do not do load
testing.

## Related repo

- [rls-open-check](https://github.com/LarytheLord/rls-open-check) - a separate
  linter that checks Supabase row level security rules. It moved out of this repo.

## Tech stack

- Next.js 15 (App Router, `next` ^15.5.9) and React 18, in TypeScript
- Tailwind CSS
- Prisma 6 with PostgreSQL on Neon
- NextAuth for login
- Jest for unit and API tests, Playwright for end-to-end and accessibility tests
- Deployed on Vercel

## Run it locally

You need Node.js, npm, and a Postgres database (a free Neon project works).

```bash
git clone https://github.com/LarytheLord/Adventurers-Guild.git
cd Adventurers-Guild
npm install
cp .env.example .env.local
# fill in .env.local
npm run db:push
npm run dev
```

The app runs at `http://localhost:3000`. `npm install` also runs `prisma generate`.
`npm run db:push` runs a guard script first (`scripts/db-guard.js`); read
`docs/DATABASE_SAFETY.md` before pointing it at a database you care about.

Other scripts: `npm run build`, `npm run start`, `npm run lint`,
`npm run type-check`, `npm run db:seed`, `npm run db:studio`.

### Environment variables

Names only, from `.env.example`. Do not commit real values.

- Database: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`
- Auth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- GitHub API: `GITHUB_TOKEN`
- Email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ADMIN_EMAIL`
- Integrations: `BOOTCAMP_WEBHOOK_SECRET`, `NEXT_PUBLIC_DEVSYNC_API_URL`,
  `DEVSYNC_API_KEY`
- App and analytics: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_GA_ID`
- Error tracking: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`
- Rate limiting: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Limits: `MAX_QUEST_XP`, `MAX_QUEST_SP`, `MAX_QUEST_MONETARY`

## Tests

```bash
npm run test             # Jest
npm run test:e2e:smoke   # Playwright smoke tests
npm run test:a11y        # Playwright accessibility tests
```

Also available: `npm run test:unit`, `npm run test:api`, `npm run test:e2e`.

## Legacy code

Legacy quest marketplace code remains under `app/quests`, `app/adventurer`,
`app/adventurers`, `app/company` and `app/admin`, with matching routes in
`app/api`, and is not the current product.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) first. Report security problems as described
in [SECURITY.md](SECURITY.md).

## License

See [License.md](License.md). It is a custom, all-rights-reserved license, not an
open-source license. Read it before you copy or reuse any code.
