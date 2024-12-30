'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { ApiError, FetchOptions } from '../types';
import { getApiClient } from '../utils/apiClient';

export function useApi<T>(
  url: string | null,
  apiClient: ReturnType<typeof getApiClient>,
  options?: SWRConfiguration,
  fetchOptions?: FetchOptions
) {
  const { data, error, isLoading, mutate } = useSWR<T, ApiError>(
    url,
    (url) => apiClient.fetch<T>(url, fetchOptions),
    {
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        if (retryCount >= 3) return;
        if (error.status === 401 || error.status === 403) return;

        setTimeout(() => revalidate({ retryCount: retryCount + 1 }), 3000);
      },
      ...options,
    }
  );

  return { data, error, isLoading, mutate };
}