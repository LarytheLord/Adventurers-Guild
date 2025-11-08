// lib/error-logger.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error logging interface
 */
export interface ErrorContext {
  componentStack?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  props?: Record<string, any>;
  additionalData?: Record<string, any>;
  component?: string;
  boundary?: string;
}

/**
 * Get error severity based on error type and message
 */
export function getErrorSeverity(error: Error): ErrorSeverity {
  const errorString = error.toString().toLowerCase();
  
  if (errorString.includes('network') || errorString.includes('timeout')) {
    return 'medium';
  }
  
  if (errorString.includes('permission denied') || errorString.includes('access denied')) {
    return 'high';
  }
  
  if (errorString.includes('internal server error') || errorString.includes('server error')) {
    return 'critical';
  }
  
  if (errorString.includes('invalid') || errorString.includes('malformed')) {
    return 'medium';
  }
  
  // Default to low severity for most errors
  return 'low';
}

/**
 * Log error to console and external services
 */
export async function logError(
  error: Error,
  errorInfo: ErrorContext,
  context: ErrorContext,
  severity: ErrorSeverity = 'low'
): Promise<void> {
  // In a real implementation, you would integrate with:
  // - Sentry
  // - LogRocket
  // - Custom logging service
  // - Email notifications for critical errors
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    errorInfo,
    context,
    severity,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', logEntry);
  }

  // In production, you would send this to your logging service
  // Example: await sendToLoggingService(logEntry);
  
  // For now, we'll just log to console
  console.warn(`[${severity.toUpperCase()}] Error logged: ${error.message}`);
}

/**
 * Log error with automatic context detection
 */
export async function logErrorWithContext(
  error: Error,
  errorInfo?: ErrorContext,
  additionalContext?: Record<string, any>
): Promise<void> {
  // Try to get user session context
  let userId: string | undefined;
  try {
    // This would work in server components
    // const session = await getServerSession(authOptions);
    // userId = session?.user?.id;
  } catch (e) {
    // Ignore session errors
  }

  const context: ErrorContext = {
    userId,
    ...additionalContext,
  };

  await logError(error, errorInfo || {}, context);
}

/**
 * Create a structured error handler
 */
export function createErrorHandler(componentName: string) {
  return async function handleError(error: Error, errorInfo?: ErrorContext) {
    const context: ErrorContext = {
      component: componentName,
      ...errorInfo,
    };
    
    await logErrorWithContext(error, errorInfo, context);
  };
}
