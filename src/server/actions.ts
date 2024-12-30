'use server';

import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import type { DjangoSDKConfig } from '../types';

async function prepareHeaders(
  config: DjangoSDKConfig,
  initHeaders?: HeadersInit
): Promise<Headers> {
  const headers = new Headers(initHeaders);
  headers.set('Content-Type', 'application/json');
  
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  
  if (accessToken) {
    const isExpired = isTokenExpired(accessToken);
    if (isExpired && config.autoRefresh) {
      const newToken = await refreshServerToken(config);
      if (newToken) {
        headers.set('Authorization', `${config.tokenPrefix || 'Bearer'} ${newToken}`);
      }
    } else {
      headers.set('Authorization', `${config.tokenPrefix || 'Bearer'} ${accessToken}`);
    }
  }

  if (config.csrfEnabled) {
    const csrfToken = cookieStore.get('csrftoken')?.value;
    if (csrfToken) {
      headers.set('X-CSRFToken', csrfToken);
    }
  }

  return headers;
}

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp ? decoded.exp * 1000 < Date.now() : true;
  } catch {
    return true;
  }
}

async function refreshServerToken(config: DjangoSDKConfig): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${config.baseUrl}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    cookieStore.set({
      name: 'access_token',
      value: data.access,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: config.accessTokenLifetime || 300,
    });

    return data.access;
  } catch (error) {
    console.error('Server token refresh failed:', error);
    return null;
  }
}

export async function createServerAction(config: DjangoSDKConfig) {
  const defaultConfig: DjangoSDKConfig = {
    tokenPrefix: 'Bearer',
    accessTokenLifetime: 300,
    refreshTokenLifetime: 86400,
    autoRefresh: true,
    csrfEnabled: true,
    ...config
  };

  return {
    async fetch<T>(
      input: RequestInfo,
      init?: RequestInit & { skipAuth?: boolean }
    ): Promise<T> {
      const { skipAuth, ...initOptions } = init || {};
      
      if (!skipAuth) {
        const headers = await prepareHeaders(defaultConfig, initOptions?.headers);
        initOptions.headers = headers;
      }

      const response = await fetch(input, {
        ...initOptions,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return response.json();
    }
  };
}