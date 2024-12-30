'use client';

import type { DjangoSDKConfig, TokenPair } from '../types';
import { jwtDecode } from 'jwt-decode';

export class ApiClient {
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
    
    // Get tokens from cookies using client-side methods
    const accessToken = this.getCookie('access_token');
    
    if (accessToken && this.isTokenExpired(accessToken) && this.config.autoRefresh) {
      const newToken = await this.refreshToken();
      if (newToken) {
        headers.set('Authorization', `${this.config.tokenPrefix} ${newToken}`);
      }
    } else if (accessToken) {
      headers.set('Authorization', `${this.config.tokenPrefix} ${accessToken}`);
    }

    if (this.config.csrfEnabled) {
      const csrfToken = this.getCookie('csrftoken');
      if (csrfToken) {
        headers.set('X-CSRFToken', csrfToken);
      }
    }

    return headers;
  }

  private getCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
  }

  private async refreshToken(): Promise<string | null> {
    const refreshToken = this.getCookie('refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');

    try {
      const response = await this.fetch<TokenPair>(
        `${this.config.baseUrl}/auth/refresh/`,
        {
          method: 'POST',
          body: JSON.stringify({ refresh: refreshToken }),
          skipAuth: true,
        }
      );

      document.cookie = `access_token=${response.access}; path=/; max-age=${this.config.accessTokenLifetime}; samesite=strict${process.env.NODE_ENV === 'production' ? '; secure' : ''}`;
      
      return response.access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp ? decoded.exp * 1000 < Date.now() : true;
    } catch {
      return true;
    }
  }
}