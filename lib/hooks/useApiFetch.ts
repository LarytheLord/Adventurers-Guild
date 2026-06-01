// lib/hooks/useApiFetch.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

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

  const fetchData = useCallback(async (options: ApiOptions = {}): Promise<T | null> => {
    const {
      method = initialOptions.method || 'GET',
      body,
      cache = initialOptions.cache,
      showToast = true,
      successMessage,
      errorMessage,
    } = options;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (cache) {
        fetchOptions.cache = cache;
      }

      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
      }

      // Use fetchWithAuth to handle 401s and include credentials
      const response = await fetchWithAuth(endpoint, fetchOptions);
      let data: Record<string, unknown>;

      // Try to parse JSON, handle non-JSON responses gracefully
      try {
        data = await response.json();
      } catch {
        setState(prev => ({ ...prev, error: 'Invalid response from server', loading: false }));
        return null;
      }

      // Handle HTTP errors
      if (!response.ok) {
        // Don't show toast for 401 - fetchWithAuth already redirects
        const errorMsg = errorMessage || (data.error as string) || `Failed to ${method.toLowerCase()} data`;
        if (showToast && response.status !== 401) {
          toast.error(errorMsg);
        }
        setState(prev => ({ ...prev, error: errorMsg, loading: false }));
        return null;
      }

      if (showToast && successMessage) {
        toast.success(successMessage);
      }

      // Normalize response: handle various API response shapes
      // The API returns { success: boolean; quests/data/error: ... }
      // We need to extract the actual data regardless of shape
      let extractedData: unknown;

      if (data && typeof data === 'object') {
        // Direct data field
        if ('data' in data && data.data !== undefined) {
          extractedData = data.data;
        }
        // Wrapped in success object (e.g., { success: true, quests: [...] })
        else if ('success' in data && data.success) {
          // Try common payload keys
          extractedData = (data.quests as unknown)
            ?? (data.users as unknown)
            ?? (data.quest as unknown)
            ?? (data.user as unknown)
            ?? (data.assignments as unknown)
            ?? (data.submissions as unknown)
            ?? (data.stats as unknown)
            ?? data;
        }
        // Already unwrapped data
        else {
          extractedData = data;
        }
      } else {
        extractedData = data;
      }

      setState({
        data: extractedData as T,
        loading: false,
        error: null,
      });

      return extractedData as T;
    } catch (error) {
      const errorMsg = errorMessage || (error instanceof Error ? error.message : 'Network error occurred');
      if (showToast) {
        toast.error(errorMsg);
      }
      setState(prev => ({ ...prev, error: errorMsg, loading: false }));
      return null;
    }
  }, [endpoint, initialOptions.cache, initialOptions.method]);

  // Auto-fetch on mount if not skipped
  useEffect(() => {
    if (!initialOptions.skip && initialOptions.method !== 'POST' && initialOptions.method !== 'PUT' && initialOptions.method !== 'DELETE' && initialOptions.method !== 'PATCH') {
      fetchData();
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
