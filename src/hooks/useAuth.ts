'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { getAuth } from '../utils/auth';
import { ApiConfig, User, ApiError } from '../types';
import { useApiConfig } from '../components/ApiProvider';
import { getApiClient } from '../utils/apiClient';

export function useAuth<U extends User = User>(apiClient: ReturnType<typeof getApiClient>) {
  const config = useApiConfig();
  const auth = getAuth(config);

  const {
    data: user,
    error,
    mutate,
  } = useSWR<U | null>(
    apiClient ? '/api/users/me/' : null,
    () => auth.getUser<U>(),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
    }
  );

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        await mutate(); // Fetch and update user data
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!user && !error) {
      checkUser();
    }
  }, [user, error, mutate]);

  const login = async (username: string, password: string, isEmail=false, url='/api/token/') => {
    setIsLoading(true);
    try {
      const loggedInUser = await auth.login<U>(username, password, isEmail, url);
      await mutate(loggedInUser); // Update user data after successful login
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          throw new Error('Invalid credentials');
        } else {
          throw new Error('Login failed');
        }
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await auth.logout();
      await mutate(null); // Update user data after logout
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  };


  return {
    user,
    isLoading,
    error,
    login,
    logout,
  };
}