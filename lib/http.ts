const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);

export class RequestError extends Error {
  status?: number;
  payload?: unknown;
  isTimeout: boolean;
  isAbort: boolean;
  isNetwork: boolean;

  constructor(
    message: string,
    options: {
      status?: number;
      payload?: unknown;
      isTimeout?: boolean;
      isAbort?: boolean;
      isNetwork?: boolean;
    } = {}
  ) {
    super(message);
    this.name = 'RequestError';
    this.status = options.status;
    this.payload = options.payload;
    this.isTimeout = options.isTimeout ?? false;
    this.isAbort = options.isAbort ?? false;
    this.isNetwork = options.isNetwork ?? false;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getStatusFallbackMessage(status: number): string {
  switch (status) {
    case 400:
      return 'The request could not be processed.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource could not be found.';
    case 409:
      return 'This action conflicts with the current state.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'The server encountered an unexpected error.';
    case 502:
    case 503:
    case 504:
      return 'The service is temporarily unavailable. Please try again.';
    default:
      return 'The request could not be completed.';
  }
}

export function getErrorMessageFromPayload(payload: unknown, fallback: string): string {
  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim();
  }

  if (isRecord(payload)) {
    const errorMessage = payload.error;
    if (typeof errorMessage === 'string' && errorMessage.trim()) {
      return errorMessage.trim();
    }

    const message = payload.message;
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
  }

  return fallback;
}

export async function readResponsePayload<T = unknown>(response: Response): Promise<T | null> {
  const rawText = await response.text();
  if (!rawText.trim()) {
    return null;
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    return null;
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException
      ? error.name === 'AbortError'
      : error instanceof Error && error.name === 'AbortError'
  );
}

export function normalizeRequestError(error: unknown, fallback: string): RequestError {
  if (error instanceof RequestError) {
    return error;
  }

  if (isAbortError(error)) {
    return new RequestError('The request was cancelled.', { isAbort: true });
  }

  if (error instanceof Error) {
    const normalizedMessage = error.message.trim();

    if (normalizedMessage.toLowerCase().includes('timed out')) {
      return new RequestError(normalizedMessage || fallback, { isTimeout: true });
    }

    if (
      normalizedMessage.toLowerCase().includes('network') ||
      normalizedMessage.toLowerCase().includes('failed to fetch') ||
      normalizedMessage.toLowerCase().includes('load failed')
    ) {
      return new RequestError(
        'Network error. Check your connection and try again.',
        { isNetwork: true }
      );
    }

    return new RequestError(normalizedMessage || fallback);
  }

  return new RequestError(fallback);
}

export function shouldRetryRequest(
  method: string | undefined,
  status: number,
  attempt: number,
  retryCount: number
): boolean {
  const normalizedMethod = (method || 'GET').toUpperCase();
  return (
    attempt < retryCount &&
    (normalizedMethod === 'GET' || normalizedMethod === 'HEAD') &&
    RETRYABLE_STATUS_CODES.has(status)
  );
}

export async function waitForRetry(delayMs: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
