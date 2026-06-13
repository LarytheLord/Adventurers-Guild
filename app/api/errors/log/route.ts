import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { apiRateLimit } from '@/lib/rate-limit';

/**
 * API endpoint for logging client-side errors
 * POST /api/errors/log
 */
export async function POST(request: NextRequest) {
  // Rate limit early (IP-based) to prevent abuse even before auth
  const rateLimitResponse = apiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // Require authentication — this endpoint must not be callable by unauthenticated users
    const authUser = await requireAuth(request, 'adventurer', 'company', 'admin');
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const errorLog = await request.json();

    // Strict validation + length caps to prevent abuse / DB bloat
    if (typeof errorLog.message !== 'string' || errorLog.message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid error log format' },
        { status: 400 }
      );
    }
    const message = errorLog.message.length > 2000 ? errorLog.message.slice(0, 2000) : errorLog.message;

    // Whitelist severity
    const allowedSeverities = ['info', 'warning', 'error', 'critical'] as const;
    let severity: (typeof allowedSeverities)[number] = 'error';
    if (typeof errorLog.severity === 'string') {
      const s = errorLog.severity.toLowerCase() as (typeof allowedSeverities)[number];
      if ((allowedSeverities as readonly string[]).includes(s)) {
        severity = s;
      }
    }

    const url = typeof errorLog.url === 'string' ? errorLog.url.slice(0, 500) : undefined;
    const userAgent = typeof errorLog.userAgent === 'string' ? errorLog.userAgent.slice(0, 300) : undefined;

    // Sanitize timestamp
    let timestamp: Date;
    try {
      timestamp = errorLog.timestamp ? new Date(errorLog.timestamp) : new Date();
      if (isNaN(timestamp.getTime())) timestamp = new Date();
    } catch {
      timestamp = new Date();
    }

    console.error('Client Error Logged:', {
      severity,
      message,
      url,
      timestamp,
      userAgent,
      userId: authUser.id,
    });

    await prisma.errorLog.create({
      data: {
        message,
        severity,
        url,
        userAgent,
        timestamp,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging endpoint failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log error' },
      { status: 500 }
    );
  }
}

// Prevent caching of error logs
export const dynamic = 'force-dynamic';
