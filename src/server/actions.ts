'use server';

import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import type { DjangoSDKConfig } from '../types';

export class ServerApiClient {
  private config: DjangoSDKConfig;

  constructor(config: DjangoSDKConfig) {
    this.config = {
      tokenPrefix: 'Bearer',
      accessTokenLifetime: 300,
      refreshTokenLifetime: 86400,
      autoRefresh: true,
      csrfEnabled: true,
      ...config
    };
  }

  async fetch<T>(
    input: RequestInfo,
    init?: RequestInit & { skipAuth?: boolean }
  ): Promise<T> {
    const { skipAuth, ...initOptions } = init || {};
    
    if (!skipAuth) {
      const headers = await this.prepareHeaders(initOptions?.headers);
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

  private async prepareHeaders(initHeaders?: HeadersInit): Promise<Headers> {
    const headers = new Headers(initHeaders);
    headers.set('Content-Type', 'application/json');
    
    let accessToken = (await cookies()).get('access_token')?.value;
    
    if (accessToken && this.isTokenExpired(accessToken) && this.config.autoRefresh) {
      accessToken = await this.refreshToken();
    }

    if (accessToken) {
      headers.set('Authorization', `${this.config.tokenPrefix} ${accessToken}`);
    }

    if (this.config.csrfEnabled) {
      const csrfToken = (await cookies()).get('csrftoken')?.value;
      if (csrfToken) {
        headers.set('X-CSRFToken', csrfToken);
      }
    }

    return headers;
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = (await cookies()).get('refresh_token')?.value;
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await this.fetch<{ access: string }>(
      `${this.config.baseUrl}/auth/refresh/`,
      {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
        skipAuth: true,
      }
    );

    this.setAccessToken(response.access);
    return response.access;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp ? decoded.exp * 1000 < Date.now() : true;
    } catch {
      return true;
    }
  }

  private async setAccessToken(token: string) {
    (await cookies()).set({
      name: 'access_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: this.config.accessTokenLifetime,
    });
  }
}

export async function createServerAction(config: DjangoSDKConfig) {
  return new ServerApiClient(config);
}
