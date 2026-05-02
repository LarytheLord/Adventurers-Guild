import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { consumeRateLimit } from '@/lib/rate-limit';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;

/**
 * API endpoint for logging client-side errors
 * POST /api/errors/log
 */
export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = consumeRateLimit('client-error-log', ip, {
      windowMs: RATE_LIMIT_WINDOW_MS,
      maxRequests: RATE_LIMIT_MAX_REQUESTS,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many error reports. Please try again later.' },
        { status: 429 }
      );
    }

    const errorLog = await request.json();
    const message = typeof errorLog.message === 'string' ? errorLog.message.trim().slice(0, 2000) : '';
    const severity =
      typeof errorLog.severity === 'string' && ['info', 'warning', 'error', 'critical'].includes(errorLog.severity)
        ? errorLog.severity
        : 'error';
    const url = typeof errorLog.url === 'string' ? errorLog.url.slice(0, 2048) : null;
    const userAgent =
      typeof errorLog.userAgent === 'string'
        ? errorLog.userAgent.slice(0, 512)
        : request.headers.get('user-agent')?.slice(0, 512) || null;
    const timestamp = new Date(errorLog.timestamp);

    // Validate error log structure
    if (!message || Number.isNaN(timestamp.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid error log format' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Store in a database
    // 2. Send to error tracking service (Sentry, LogRocket, etc.)
    // 3. Send alerts for critical errors
    // 4. Aggregate for analytics

    // For now, log to server console
    console.error('Client Error Logged:', {
      severity,
      message,
      url,
      timestamp: timestamp.toISOString(),
      userAgent,
    });

    // Store in database
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
