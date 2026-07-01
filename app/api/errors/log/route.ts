import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { strictRateLimit } from '@/lib/rate-limit';

/**
 * API endpoint for logging client-side errors
 * POST /api/errors/log
 *
 * Security:
 * - Requires Authorization: Bearer <ERROR_LOG_API_KEY>
 * - Field length caps to prevent DB bloat / injection
 * - Severity whitelist
 * - IP-based rate limiting (20 req / 15 min via strictRateLimit)
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = await strictRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // Authentication: static API key (separate from other secrets, set per-deployment)
  const authHeader = request.headers.get('authorization') || '';
  const providedKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!env.ERROR_LOG_API_KEY || providedKey !== env.ERROR_LOG_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

  try {
    const errorLog = await request.json();

    // Validate error log structure
    if (!errorLog.message || !errorLog.timestamp) {
      return NextResponse.json(
        { success: false, error: 'Invalid error log format' },
        { status: 400 }
      );
    }

    // Cap lengths to prevent DB flooding and excessive storage
    const cappedMessage = String(errorLog.message).slice(0, 2000);
    const cappedUrl = errorLog.url ? String(errorLog.url).slice(0, 500) : undefined;
    const cappedUserAgent = errorLog.userAgent ? String(errorLog.userAgent).slice(0, 500) : undefined;

    // Whitelist severity
    const validSeverities = ['error', 'warning', 'info'];
    const severity = validSeverities.includes(errorLog.severity) ? errorLog.severity : 'error';

    // Parse timestamp safely
    const timestamp = new Date(errorLog.timestamp);
    if (isNaN(timestamp.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid timestamp' },
        { status: 400 }
      );
    }

    // Log to server console (with caps applied)
    console.error('Client Error Logged:', {
      severity,
      message: cappedMessage,
      url: cappedUrl,
      timestamp: errorLog.timestamp,
      userAgent: cappedUserAgent,
    });

    // Store in database (capped + validated)
    await prisma.errorLog.create({
      data: {
        message: cappedMessage,
        severity,
        url: cappedUrl,
        userAgent: cappedUserAgent,
        timestamp,
      },
    });

    // TODO: Send to error tracking service
    // if (process.env.SENTRY_DSN) {
    //   await sendToSentry(errorLog);
    // }

    // TODO: Send alerts for critical errors
    // if (severity === 'critical') {
    //   await sendAlertToAdmin(errorLog);
    // }

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
