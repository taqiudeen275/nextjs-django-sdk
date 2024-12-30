'use client';

import { useApiConfig } from '../components/ApiProvider';
import { getApiClient } from '../utils/apiClient';

export function useApiClient() {
  const config = useApiConfig();
  return getApiClient(config);
}