import { NextRequest, NextResponse } from 'next/server';

type RateLimitStore = Map<string, { count: number; resetAt: number }>;

// In-memory store (use Upstash Redis in production)
const globalStore = globalThis as unknown as {
  rateLimitStore?: RateLimitStore;
};

const store: RateLimitStore = globalStore.rateLimitStore ?? new Map<string, { count: number; resetAt: number }>();
if (!globalStore.rateLimitStore) {
  globalStore.rateLimitStore = store;
}

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: NextRequest) => string;
}

export function isRateLimited(
  request: NextRequest,
  options: RateLimitOptions
): boolean {
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  const {
    windowMs = 60 * 1000,
    maxRequests = 60,
    keyGenerator = (req) => {
      const forwardedFor = req.headers.get('x-forwarded-for');
      const ip = forwardedFor?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
      return ip;
    },
  } = options;

  const key = keyGenerator(request);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  store.set(key, entry);

  // Clean up old entries periodically
  if (store.size > 1000) {
    for (const [k, v] of store.entries()) {
      if (now > v.resetAt) store.delete(k);
    }
  }

  return entry.count > maxRequests;
}

export function rateLimitMiddleware(
  request: NextRequest,
  options: RateLimitOptions
): NextResponse | null {
  if (isRateLimited(request, options)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }
  return null;
}

// Pre-configured limiters for common use cases
export const authRateLimit = (req: NextRequest) =>
  rateLimitMiddleware(req, { windowMs: 15 * 60 * 1000, maxRequests: 10 });

export const apiRateLimit = (req: NextRequest) =>
  rateLimitMiddleware(req, { windowMs: 60 * 1000, maxRequests: 60 });

export const strictRateLimit = (req: NextRequest) =>
  rateLimitMiddleware(req, { windowMs: 15 * 60 * 1000, maxRequests: 20 });
