import {
  RequestError,
  normalizeRequestError,
  shouldRetryRequest,
  waitForRetry,
} from '@/lib/http';

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RETRY_DELAYS_MS = [300, 1_000];

export interface FetchWithAuthOptions extends RequestInit {
  timeoutMs?: number;
  retryCount?: number;
}

/**
 * Wrapper around fetch that adds a sane timeout and handles 401 responses consistently.
 * When the server returns 401, the user's session has expired, so redirect to login.
 */
export async function fetchWithAuth(
  url: string,
  options: FetchWithAuthOptions = {}
): Promise<Response> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retryCount = 0,
    signal,
    ...requestOptions
  } = options;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    const controller = new AbortController();
    let timedOut = false;

    const abortFromCaller = () => controller.abort();
    if (signal) {
      if (signal.aborted) {
        controller.abort();
      } else {
        signal.addEventListener('abort', abortFromCaller, { once: true });
      }
    }

    const timeoutId =
      timeoutMs > 0
        ? setTimeout(() => {
            timedOut = true;
            controller.abort();
          }, timeoutMs)
        : undefined;

    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      if (response.status === 401 && typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
      }

      if (shouldRetryRequest(requestOptions.method, response.status, attempt, retryCount)) {
        await waitForRetry(DEFAULT_RETRY_DELAYS_MS[attempt] ?? 1_500);
        continue;
      }

      return response;
    } catch (error) {
      if (timedOut) {
        throw new RequestError(`Request timed out after ${timeoutMs}ms`, { isTimeout: true });
      }

      const normalizedError = normalizeRequestError(error, 'Request failed');
      const shouldRetryNetworkError =
        attempt < retryCount &&
        (requestOptions.method || 'GET').toUpperCase() === 'GET' &&
        (normalizedError.isNetwork || normalizedError.isTimeout);

      if (shouldRetryNetworkError) {
        await waitForRetry(DEFAULT_RETRY_DELAYS_MS[attempt] ?? 1_500);
        continue;
      }

      throw normalizedError;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (signal) {
        signal.removeEventListener('abort', abortFromCaller);
      }
    }
  }

  throw new RequestError('Request failed after retrying.');
}
