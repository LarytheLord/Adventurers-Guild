import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * API endpoint for logging client-side errors
 * POST /api/errors/log
 */
export async function POST(request: NextRequest) {
  try {
    const errorLog = await request.json();

    // Validate error log structure
    if (!errorLog.message || !errorLog.timestamp) {
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
      severity: errorLog.severity,
      message: errorLog.message,
      url: errorLog.url,
      timestamp: errorLog.timestamp,
      userAgent: errorLog.userAgent,
    });

    // Store in database
    await prisma.errorLog.create({
      data: {
        message: errorLog.message,
        severity: errorLog.severity || 'error',
        url: errorLog.url,
        userAgent: errorLog.userAgent,
        timestamp: new Date(errorLog.timestamp),
      },
    });

    // TODO: Send to error tracking service
    // if (process.env.SENTRY_DSN) {
    //   await sendToSentry(errorLog);
    // }

    // TODO: Send alerts for critical errors
    // if (errorLog.severity === 'critical') {
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
