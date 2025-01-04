import { ApiConfig, FetchOptions, ApiError } from '../types';
import { getClientCookie, setClientCookie, deleteClientCookie } from './clientCookies';

export function getApiClient(config: ApiConfig) {
  const isServer = typeof window === 'undefined';

  const getHeaders = async (hasBody: boolean = false) => {
    const headers: Record<string, string> = {};
    
    if (!isServer) {
      // Client-side cookie handling
      const accessToken = getClientCookie('access_token');
      if (accessToken) {
        headers['Authorization'] = `${config.tokenPrefix || 'Bearer'} ${accessToken}`;
      }

      if (hasBody) {
        headers['Content-Type'] = 'application/json';
      }

      if (config.csrfEnabled) {
        const csrfToken = getClientCookie('csrftoken');
        if (csrfToken) {
          headers['X-CSRFToken'] = csrfToken;
        }
      }
    }
    // Server-side header handling is done in createServerAction

    return headers;
  };

  const handleResponse = async (response: Response) => {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: 'An error occurred' };
      }

      if (response.status === 401) {
        if (config.autoRefresh && !isServer) {
          try {
            const refreshed = await refreshTokens();
            if (refreshed) return 'retry';
          } catch (refreshError) {
            deleteClientCookie('access_token');
            deleteClientCookie('refresh_token');
            throw new ApiError('Unauthorized', response.status, errorData);
          }
        }
        throw new ApiError('Unauthorized', response.status, errorData);
      }
      throw new ApiError(errorData.detail || 'API Error', response.status, errorData);
    }

    try {
      return await response.json();
    } catch (error) {
      return null; // Handle empty responses
    }
  };

  const refreshTokens = async () => {
    if (isServer) return false;

    const refreshToken = getClientCookie('refresh_token');
    if (!refreshToken) return false;

    try {
      const refreshResponse = await fetch(`${config.baseUrl}/api/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const refreshData = await handleResponse(refreshResponse);
      if (refreshData !== 'retry') {
        setClientCookie('access_token', refreshData.access, config.accessTokenLifetime);
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  };

  const fetcher = async <T>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> => {
    const headers = await getHeaders(!!options.body);

    try {
      const response = await fetch(`${config.baseUrl}${url}`, {
        ...options,
        headers: { ...headers, ...(options.headers || {}) },
      });

      const data = await handleResponse(response);
      if (data === 'retry') {
        const retryHeaders = await getHeaders(!!options.body);
        const retryResponse = await fetch(`${config.baseUrl}${url}`, {
          ...options,
          headers: { ...retryHeaders, ...(options.headers || {}) },
        });
        return handleResponse(retryResponse);
      }
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof Error) {
        throw new ApiError('Network error', 0, { detail: error.message });
      } else {
        throw new ApiError('Network error', 0, { detail: String(error) });
      }
    }
  };

  return {
    fetch: fetcher,
    getHeaders,
  };
}