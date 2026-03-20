// lib/hooks/useApiFetch.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown>;
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

      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(endpoint, fetchOptions);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = errorMessage || data.error || `Failed to ${method.toLowerCase()} data`;
        if (showToast) {
          toast.error(errorMsg);
        }
        setState(prev => ({ ...prev, error: errorMsg, loading: false }));
        return null;
      }

      if (showToast && successMessage) {
        toast.success(successMessage);
      }

      setState({
        data: data.data || data,
        loading: false,
        error: null,
      });

      return data.data || data;
    } catch (error) {
      const errorMsg = errorMessage || (error instanceof Error ? error.message : 'Network error occurred');
      if (showToast) {
        toast.error(errorMsg);
      }
      setState(prev => ({ ...prev, error: errorMsg, loading: false }));
      return null;
    }
  }, [endpoint, initialOptions.method]);

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
