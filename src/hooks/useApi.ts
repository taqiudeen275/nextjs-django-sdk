'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { ApiError, FetchOptions } from '../types';
import { getApiClient } from '../utils/apiClient';

interface UseApiOptions extends SWRConfiguration {
  retryAttempts?: number;
  retryDelay?: number;
}

export function useApi<T>(
  url: string | null,
  apiClient: ReturnType<typeof getApiClient>,
  options?: UseApiOptions,
  fetchOptions?: FetchOptions
) {
  const { data, error, isLoading, mutate } = useSWR<T, ApiError>(
    url,
    async (url) => {
      try {
        return await apiClient.fetch<T>(url, fetchOptions);
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }
        throw new ApiError('Failed to fetch data', 0, error);
      }
    },
    {
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Don't retry on 401/403 errors
        if (error.status === 401 || error.status === 403) return;
        
        // Don't retry if we've hit the retry limit
        const maxRetries = options?.retryAttempts || 3;
        if (retryCount >= maxRetries) return;
        
        // Don't retry for certain error types
        if (error.status === 404 || error.status === 422) return;
        
        // Exponential backoff
        const delay = options?.retryDelay || 3000;
        const backoffDelay = delay * Math.pow(2, retryCount);
        
        setTimeout(() => revalidate({ retryCount }), backoffDelay);
      },
      ...options,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
    isError: !!error,
  };
}