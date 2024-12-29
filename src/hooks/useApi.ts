'use client';

import useSWR, { SWRConfiguration } from 'swr';
import type { ApiClient } from '../lib/api-client';

export function useApi<T>(
  url: string | null,
  apiClient: ApiClient,
  config?: SWRConfiguration
) {
  return useSWR<T>(
    url,
    (url) => apiClient.fetch<T>(url),
    config
  );
}