/**
 * Error Logging Utility
 * 
 * Provides a centralized error logging service for the application.
 * Can be easily extended to integrate with services like Sentry, LogRocket, etc.
 */

interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100; // Keep last 100 errors in memory
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Log an error with context
   */
  logError(
    error: Error,
    errorInfo?: { componentStack?: string },
    context?: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      severity,
      context,
    };

    // Add to in-memory logs
    this.logs.unshift(errorLog);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Log to console in development
    if (!this.isProduction) {
      console.group(`🔴 Error Logged [${severity.toUpperCase()}]`);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      if (errorInfo?.componentStack) {
        console.error('Component Stack:', errorInfo.componentStack);
      }
      if (context) {
        console.log('Context:', context);
      }
      console.groupEnd();
    }

    // Send to server endpoint in production
    if (this.isProduction && typeof window !== 'undefined') {
      this.sendToServer(errorLog);
    }

    // TODO: Integrate with error tracking service
    // Example integrations:
    // this.sendToSentry(errorLog);
    // this.sendToLogRocket(errorLog);
    // this.sendToDatadog(errorLog);
  }

  /**
   * Send error to server endpoint
   */
  private async sendToServer(errorLog: ErrorLog): Promise<void> {
    try {
      await fetch('/api/errors/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      });
    } catch (err) {
      // Silently fail if logging endpoint is unavailable
      console.error('Failed to send error to server:', err);
    }
  }

  /**
   * Get recent error logs (useful for debugging)
   */
  getRecentLogs(count = 10): ErrorLog[] {
    return this.logs.slice(0, count);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Integration with Sentry (example)
   * Uncomment and install @sentry/nextjs to use
   */
  // private sendToSentry(errorLog: ErrorLog): void {
  //   if (typeof window !== 'undefined' && window.Sentry) {
  //     window.Sentry.captureException(new Error(errorLog.message), {
  //       level: errorLog.severity,
  //       extra: {
  //         stack: errorLog.stack,
  //         componentStack: errorLog.componentStack,
  //         context: errorLog.context,
  //       },
  //     });
  //   }
  // }

  /**
   * Integration with LogRocket (example)
   * Uncomment and install logrocket to use
   */
  // private sendToLogRocket(errorLog: ErrorLog): void {
  //   if (typeof window !== 'undefined' && window.LogRocket) {
  //     window.LogRocket.captureException(new Error(errorLog.message), {
  //       extra: {
  //         severity: errorLog.severity,
  //         componentStack: errorLog.componentStack,
  //         context: errorLog.context,
  //       },
  //     });
  //   }
  // }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

/**
 * Convenience function for logging errors
 */
export function logError(
  error: Error,
  errorInfo?: { componentStack?: string },
  context?: Record<string, any>,
  severity?: 'low' | 'medium' | 'high' | 'critical'
): void {
  errorLogger.logError(error, errorInfo, context, severity);
}

/**
 * Helper to determine error severity based on error type
 */
export function getErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
  const message = error.message.toLowerCase();
  
  // Critical errors
  if (
    message.includes('database') ||
    message.includes('authentication') ||
    message.includes('payment') ||
    message.includes('security')
  ) {
    return 'critical';
  }
  
  // High severity errors
  if (
    message.includes('network') ||
    message.includes('api') ||
    message.includes('timeout') ||
    message.includes('unauthorized')
  ) {
    return 'high';
  }
  
  // Low severity errors
  if (
    message.includes('validation') ||
    message.includes('input') ||
    message.includes('format')
  ) {
    return 'low';
  }
  
  // Default to medium
  return 'medium';
}

export default errorLogger;
