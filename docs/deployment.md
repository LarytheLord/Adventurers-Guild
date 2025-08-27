# Deployment Guide

This guide explains how to deploy The Adventurers Guild platform to production.

## Prerequisites

1. Supabase account and project
2. Vercel account
3. Domain name (optional)

## Supabase Setup

### 1. Database Schema

Apply the latest database schema:

```bash
# Link to your Supabase project (replace with your project ref)
supabase link --project-ref YOUR_PROJECT_REF

# Push the database schema
supabase db push
```

### 2. Storage Buckets

Create the following storage buckets in your Supabase project:

1. `avatars` - For user profile pictures
2. `quest-files` - For quest-related files

Set appropriate access policies for each bucket:
- Public read access for avatars
- Authenticated read/write access for quest files

### 3. Authentication

Configure the following OAuth providers in your Supabase dashboard:

1. Google OAuth
2. GitHub OAuth

### 4. Email Settings

Configure SMTP settings in your Supabase project:

- SMTP Host: smtp.gmail.com
- SMTP Port: 587
- SMTP User: your-email@gmail.com
- SMTP Password: your-app-password

## Environment Variables

Set the following environment variables in your Vercel project:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=your-admin-email@gmail.com

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME="The Adventurers Guild"

# Storage Configuration
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_AVATARS=avatars
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_QUEST_FILES=quest-files

# AI Rank Test Service (optional)
AI_SERVICE_URL=your_ai_service_url
AI_SERVICE_API_KEY=your_ai_service_api_key
AI_SERVICE_TIMEOUT=30000

# Stripe Configuration (for future payments)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_RANK_TEST=true
NEXT_PUBLIC_ENABLE_OAUTH=true
NEXT_PUBLIC_ENABLE_PAYMENTS=false

# Environment
NODE_ENV=production
```

## Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set all environment variables as listed above
3. Deploy the project

## Post-Deployment Steps

### 1. Seed Database

Run the seed script to populate initial data:

```bash
supabase db seed
```

### 2. Configure Custom Domain (Optional)

If using a custom domain:
1. Add domain in Vercel dashboard
2. Update DNS records as instructed
3. Update `NEXT_PUBLIC_APP_URL` environment variable

### 3. Test All Functionality

Verify that all features work correctly:
- User registration and login
- OAuth authentication
- Email sending
- Quest creation and management
- Skill tree and progression
- Profile management
- Role-based access control

## Troubleshooting

### Authentication Issues

If users can't log in:
1. Verify OAuth provider configurations
2. Check environment variables
3. Ensure database triggers are working

### Database Issues

If database operations fail:
1. Run `supabase db push` to ensure schema is up to date
2. Check for any failed migrations
3. Verify database connection settings

### Email Issues

If emails aren't sending:
1. Verify SMTP settings
2. Check spam/junk folders
3. Ensure app passwords are being used (not regular passwords)

## Maintenance

Regular maintenance tasks:
1. Monitor database performance
2. Update dependencies
3. Review security settings
4. Backup database regularly