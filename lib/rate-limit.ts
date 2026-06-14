import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from './env';

// Upstash Redis rate limiters (persistent across Vercel cold starts / serverless instances).
// Falls back gracefully (no limiting) in development or if Upstash env vars are not configured.
// See docs/DEPLOYMENT.md for setup.

let strictRatelimit: Ratelimit | null = null;
let apiRatelimit: Ratelimit | null = null;

if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = Redis.fromEnv();
  strictRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '15 m'),
    analytics: true,
  });
  apiRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
  });
}

function getIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

async function checkRateLimit(
  request: NextRequest,
  ratelimit: Ratelimit | null,
  identifier?: string
): Promise<NextResponse | null> {
  if (process.env.NODE_ENV === 'development') {
    return null;
  }
  if (!ratelimit) {
    // No Redis configured — rate limiting disabled (common in local dev).
    // In production you must set UPSTASH_REDIS_REST_URL + TOKEN (see DEPLOYMENT.md).
    return null;
  }

  const ip = identifier || getIp(request);
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }
  return null;
}

// Public API — now async (required for Upstash Redis calls)
export const strictRateLimit = (req: NextRequest) => checkRateLimit(req, strictRatelimit);
export const apiRateLimit = (req: NextRequest) => checkRateLimit(req, apiRatelimit);

// Optional: for custom per-endpoint limits (e.g. very strict on register)
export async function strictRateLimitForKey(request: NextRequest, key: string) {
  return checkRateLimit(request, strictRatelimit, key);
}
