'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import type { TokenPair, User } from '../types';
import { ApiClient } from '../lib/api-client';

export function useAuth(apiClient: ApiClient) {
  const [isLoading, setIsLoading] = useState(false);

  const { data: user, mutate } = useSWR<User>(
    '/users/me/', 
    async (url: string) => {
      const response = await apiClient.fetch<User>(url);
      return response;
    }
  );

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.fetch<TokenPair>(
        '/auth/login/',
        {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        }
      );
      await mutate();
      return response;
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, mutate]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiClient.fetch('/auth/logout/', { method: 'POST' });
      await mutate(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, mutate]);

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}