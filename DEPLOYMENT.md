# Deployment Guide - Adventurers Guild

## Staging Environment Setup (Vercel)

### 1. Connect Repository to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository: `LarytheLord/adventurers-guild`
4. Configure project settings

### 2. Environment Variables for Staging
Add these environment variables in Vercel project settings:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=your_neon_staging_url
DATABASE_URL_UNPOOLED=your_neon_staging_unpooled_url

# Authentication
NEXTAUTH_URL=https://your-staging-url.vercel.app
NEXTAUTH_SECRET=generate_with_openssl_rand_-base64_32

# Application
NEXT_PUBLIC_APP_URL=https://your-staging-url.vercel.app

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_ACCOUNT_NUMBER=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_EMAIL=admin@adventurersguild.com

# Sentry (Optional for staging)
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=adventurers-guild

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

# Bootcamp
BOOTCAMP_WEBHOOK_SECRET=generate_secure_random_string
```

### 3. Deploy Staging
Vercel automatically deploys on push to `main` branch. For staging:
- Create a `staging` branch for pre-production testing
- Or use Vercel's preview deployments for PRs

### 4. Database Migrations
```bash
# Run migrations on staging database
npx prisma migrate deploy
npx prisma generate
```

### 5. Seed Staging Data
```bash
# Seed the database with test data
npm run seed
```

## Production Deployment

### 1. Production Environment
- Create separate Vercel project or use production branch
- Use production environment variables (different from staging)
- Use Razorpay **LIVE** mode credentials

### 2. Rollback Strategy
Vercel keeps deployment history. To rollback:
1. Go to Vercel Dashboard → Deployments
2. Find the last known good deployment
3. Click "..." → "Promote to Production"

### 3. Database Rollback
```bash
# If migration needs rollback
npx prisma migrate resolve --rolled-back [migration_name]
```

## Post-Deployment Checklist

- [ ] Verify authentication works (login/register)
- [ ] Test quest creation flow (as company)
- [ ] Test quest application flow (as adventurer)
- [ ] Verify payment integration (test mode)
- [ ] Check email notifications
- [ ] Monitor Sentry for errors
- [ ] Test rate limiting (try rapid API requests)
- [ ] Verify legal pages are accessible

## Monitoring

### Sentry
- Dashboard: https://sentry.io/[org]/[project]/
- Check for errors after deployment
- Set up alerts for critical errors

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor Core Web Vitals

### Database Monitoring
- Neon dashboard: https://console.neon.tech/
- Monitor connection pool usage
- Check slow query log

## Support
- Technical issues: admin@adventurersguild.com
- Vercel docs: https://vercel.com/docs
- Next.js docs: https://nextjs.org/docs
