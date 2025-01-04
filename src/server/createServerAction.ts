// --- START OF FILE createServerAction.ts ---
"use server";

import { cookies } from 'next/headers';
import { ApiConfig, FetchOptions } from '../types';
import { getApiClient } from '../utils/apiClient';

const validateConfig = (config: Partial<ApiConfig>): void => {
  if (!process.env.API_URL && !config.baseUrl) {
    throw new Error('API_URL environment variable or baseUrl config is required');
  }
};

export async function createServerAction(config: Partial<ApiConfig>, accessToken?: string) {
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

  // Override the getHeaders function for server-side requests
  const apiClient = getApiClient(fullConfig);
  const originalGetHeaders = apiClient.getHeaders;

  apiClient.getHeaders = async (hasBody: boolean = false) => {
    const headers: Record<string, string> = {};
    const cookieStore = await cookies();

    // Prioritize passed-in token, then cookie, then nothing
    const token = accessToken || cookieStore.get('access_token')?.value;

    console.log('createServerAction - Passed-in Access Token:', accessToken);
    console.log('createServerAction - Access Token from Cookie:', cookieStore.get('access_token')?.value);

    if (token) {
      headers['Authorization'] = `${fullConfig.tokenPrefix || 'Bearer'} ${token}`;
      console.log('createServerAction - Setting Authorization header:', headers['Authorization']);
    } else {
      console.log('createServerAction - No access token found');
    }

    if (hasBody) {
      headers['Content-Type'] = 'application/json';
    }

    if (fullConfig.csrfEnabled) {
      const csrfToken = cookieStore.get('csrftoken')?.value;
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
        console.log('createServerAction - Setting X-CSRFToken header:', headers['X-CSRFToken']);
      } else {
        console.log('createServerAction - No CSRF token found');
      }
    }

    console.log('createServerAction - Final headers:', headers);
    return headers;
  };

  return apiClient;
}