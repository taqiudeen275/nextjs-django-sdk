import { cookies } from 'next/headers';
import { ApiConfig, FetchOptions, ApiError } from '../types';
import { getCookie, setCookie, deleteCookie } from './cookies';

export function getApiClient(config: ApiConfig) {
  const getHeaders = async (hasBody: boolean = false) => {
    const headers: Record<string, string> = {};
    const accessToken = await getCookie('access_token'); // Now awaited

    if (accessToken) {
      headers['Authorization'] = `${config.tokenPrefix || 'Bearer'} ${accessToken}`;
    }

    if (hasBody) {
      headers['Content-Type'] = 'application/json';
    }

    if (config.csrfEnabled) {
      const csrfToken = await getCookie('csrftoken'); // Now awaited
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }
    }
    return headers;
  };

  const handleResponse = async (response: Response) => {
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        if (config.autoRefresh) {
          try {
            await refreshTokens();
            return 'retry';
          } catch (refreshError) {
            deleteCookie('access_token');
            deleteCookie('refresh_token');
            throw new ApiError('Unauthorized', response.status, data);
          }
        } else {
          throw new ApiError('Unauthorized', response.status, data);
        }
      } else {
        throw new ApiError(data.detail || 'API Error', response.status, data);
      }
    }

    return data;
  };

  const refreshTokens = async () => {
    const refreshToken = getCookie('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const refreshResponse = await fetch(`${config.baseUrl}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const refreshData = await handleResponse(refreshResponse);
    if (refreshData !== 'retry') {
      setCookie('access_token', refreshData.access, config.accessTokenLifetime);
    }
  };

  const fetcher = async <T>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> => {
    const headers = await getHeaders(!!options.body); // Now awaited

    const response = await fetch(`${config.baseUrl}${url}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });
    const data = await handleResponse(response);
    if (data === 'retry') {
      options.headers = await getHeaders(!!options.body);
      const retryResponse = await fetch(`${config.baseUrl}${url}`, {
        ...options,
        headers: { ...options.headers, ...(options.headers || {}) },
      });
      return handleResponse(retryResponse);
    }
    return data;
  };

  return {
    fetch: fetcher,
    getHeaders,
  };
}