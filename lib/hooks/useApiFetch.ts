// lib/hooks/useApiFetch.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import {
  getErrorMessageFromPayload,
  getStatusFallbackMessage,
  isAbortError,
  readResponsePayload,
  normalizeRequestError,
} from '@/lib/http';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown>;
  cache?: RequestCache;
  showToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  skip?: boolean;
  headers?: HeadersInit;
  timeoutMs?: number;
  retryCount?: number;
}

interface UseApiFetchReturn<T> extends ApiState<T> {
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
  execute: (options?: ApiOptions) => Promise<T | null>;
}

/**
 * A comprehensive hook for handling API requests with common patterns
 * 
 * @param endpoint - The API endpoint to fetch from
 * @param initialOptions - Default options for the fetch request
 * @returns State and control functions for the API request
 * 
 * @example
 * // Basic GET request
 * const { data, loading, error } = useApiFetch('/api/users');
 * 
 * @example
 * // POST request with body
 * const { execute, loading } = useApiFetch('/api/users', { method: 'POST' });
 * await execute({ body: { name: 'John' } });
 * 
 * @example
 * // Manual fetch with custom options
 * const { execute } = useApiFetch('/api/users');
 * await execute({ method: 'POST', body: { name: 'John' } });
 */
export function useApiFetch<T = unknown>(
  endpoint: string,
  initialOptions: ApiOptions = {}
): UseApiFetchReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: !initialOptions.skip,
    error: null,
  });
  const abortControllerRef = useRef<AbortController | null>(null);
  const latestRequestIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const fetchData = useCallback(async (options: ApiOptions = {}): Promise<T | null> => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    const {
      method = initialOptions.method || 'GET',
      body,
      cache = initialOptions.cache,
      showToast = true,
      successMessage,
      errorMessage,
      headers = initialOptions.headers,
      timeoutMs = initialOptions.timeoutMs,
      retryCount = initialOptions.retryCount ?? ((initialOptions.method || 'GET') === 'GET' ? 1 : 0),
    } = options;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: controller.signal,
      };

      if (cache) {
        fetchOptions.cache = cache;
      }

      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetchWithAuth(endpoint, {
        ...fetchOptions,
        timeoutMs,
        retryCount,
      });
      const payload = await readResponsePayload<Record<string, unknown> | T>(response);

      if (!mountedRef.current || latestRequestIdRef.current !== requestId) {
        return null;
      }

      if (!response.ok) {
        const errorMsg =
          errorMessage ||
          getErrorMessageFromPayload(payload, getStatusFallbackMessage(response.status));
        if (showToast) {
          toast.error(errorMsg);
        }
        setState(prev => ({ ...prev, error: errorMsg, loading: false }));
        return null;
      }

      if (payload === null) {
        const emptyData = null;
        setState({
          data: emptyData,
          loading: false,
          error: null,
        });
        if (showToast && successMessage) {
          toast.success(successMessage);
        }
        return emptyData;
      }

      const responseData =
        typeof payload === 'object' && payload !== null && 'data' in payload
          ? ((payload as { data?: T | null }).data ?? null)
          : (payload as T);

      if (showToast && successMessage) {
        toast.success(successMessage);
      }

      setState({
        data: responseData,
        loading: false,
        error: null,
      });

      return responseData;
    } catch (error) {
      if (isAbortError(error)) {
        return null;
      }

      const normalizedError = normalizeRequestError(error, 'Network error occurred');
      const errorMsg = errorMessage || normalizedError.message;
      if (showToast) {
        toast.error(errorMsg);
      }

      if (mountedRef.current && latestRequestIdRef.current === requestId) {
        setState(prev => ({ ...prev, error: errorMsg, loading: false }));
      }
      return null;
    }
  }, [
    endpoint,
    initialOptions.cache,
    initialOptions.headers,
    initialOptions.method,
    initialOptions.retryCount,
    initialOptions.timeoutMs,
  ]);

  // Auto-fetch on mount if not skipped
  useEffect(() => {
    if (!initialOptions.skip && initialOptions.method !== 'POST' && initialOptions.method !== 'PUT' && initialOptions.method !== 'DELETE' && initialOptions.method !== 'PATCH') {
      void fetchData();
    }
  }, [endpoint, fetchData, initialOptions.skip, initialOptions.method]);

  const refetch = useCallback(async () => {
    await fetchData(initialOptions);
  }, [fetchData, initialOptions]);

  const mutate = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const execute = useCallback(async (options?: ApiOptions): Promise<T | null> => {
    return fetchData(options);
  }, [fetchData]);

  return {
    ...state,
    refetch,
    mutate,
    execute,
  };
}

/**
 * Simplified hook for GET requests with automatic fetching
 * 
 * @param endpoint - The API endpoint to fetch from
 * @returns State and refetch function
 * 
 * @example
 * const { data, loading, error, refetch } = useGet('/api/users');
 */
export function useGet<T = unknown>(endpoint: string) {
  return useApiFetch<T>(endpoint, { method: 'GET' });
}

/**
 * Hook for POST requests
 * 
 * @param endpoint - The API endpoint to POST to
 * @returns Execute function and state
 * 
 * @example
 * const { execute, loading } = usePost('/api/users');
 * await execute({ body: { name: 'John' } });
 */
export function usePost<T = unknown>(endpoint: string) {
  return useApiFetch<T>(endpoint, { method: 'POST', skip: true });
}

/**
 * Hook for PUT requests
 * 
 * @param endpoint - The API endpoint to PUT to
 * @returns Execute function and state
 * 
 * @example
 * const { execute, loading } = usePut('/api/users/1');
 * await execute({ body: { name: 'Jane' } });
 */
export function usePut<T = unknown>(endpoint: string) {
  return useApiFetch<T>(endpoint, { method: 'PUT', skip: true });
}

/**
 * Hook for DELETE requests
 * 
 * @param endpoint - The API endpoint to DELETE from
 * @returns Execute function and state
 * 
 * @example
 * const { execute, loading } = useDelete('/api/users/1');
 * await execute();
 */
export function useDelete<T = unknown>(endpoint: string) {
  return useApiFetch<T>(endpoint, { method: 'DELETE', skip: true });
}
