/**
 * Environment variable validation and type-safe access
 * This ensures all required environment variables are present at runtime
 */

import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Authentication
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),

  // Email (optional — only needed for /api/send-email)
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.string().optional().default('587'),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  ADMIN_EMAIL: z.string().email().optional(),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // DevSync Integration
  NEXT_PUBLIC_DEVSYNC_API_URL: z.string().url().optional(),
  DEVSYNC_API_KEY: z.string().optional(),

  // Optional: Analytics
  NEXT_PUBLIC_GA_ID: z.string().optional(),

  // Optional: Error Tracking
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // Optional: Rate Limiting
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Parse and validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      console.error('❌ Invalid environment variables:');
      console.error(missingVars.join('\n'));
      throw new Error('Environment validation failed. Check your .env.local file.');
    }
    throw error;
  }
}

export const env = validateEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
