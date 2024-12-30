"use server";
import { ApiConfig, FetchOptions } from '../types';
import { getApiClient } from '../utils/apiClient';

export async function createServerAction(config: Partial<ApiConfig>) {
  const fullConfig: ApiConfig = {
    baseUrl: process.env.API_URL!,
    tokenPrefix: 'Bearer',
    accessTokenLifetime: 300,
    refreshTokenLifetime: 86400,
    autoRefresh: true,
    csrfEnabled: true,
    ...config,
  };
  return getApiClient(fullConfig);
}