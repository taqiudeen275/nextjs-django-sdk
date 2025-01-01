"use server";

import { ApiConfig, FetchOptions } from '../types';
import { getApiClient } from '../utils/apiClient';

const validateConfig = (config: Partial<ApiConfig>): void => {
  if (!process.env.API_URL && !config.baseUrl) {
    throw new Error('API_URL environment variable or baseUrl config is required');
  }
};

export async function createServerAction(config: Partial<ApiConfig>) {
  validateConfig(config);

  const fullConfig: ApiConfig = {
    baseUrl: config.baseUrl || process.env.API_URL || '',
    tokenPrefix: config.tokenPrefix || 'Bearer',
    accessTokenLifetime: config.accessTokenLifetime || 300,
    refreshTokenLifetime: config.refreshTokenLifetime || 86400,
    autoRefresh: config.autoRefresh ?? true,
    csrfEnabled: config.csrfEnabled ?? true,
    retryAttempts: config.retryAttempts || 3,
    retryDelay: config.retryDelay || 3000,
  };

  return getApiClient(fullConfig);
}