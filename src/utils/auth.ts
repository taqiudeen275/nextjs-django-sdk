import { ApiConfig, User } from '../types';
import { getApiClient } from './apiClient';
import { getCookie, setCookie, deleteCookie } from './cookies';

export function getAuth(config: ApiConfig) {
  const apiClient = getApiClient(config);

  const login = async <U extends User>(
    username: string,
    password: string,
    isEmail: boolean
  ): Promise<U> => {
    const body = isEmail ? { email: username, password }: { username, password };
    const response:any = await apiClient.fetch('/api/token/', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    setCookie('access_token', response.access, config.accessTokenLifetime);
    setCookie('refresh_token', response.refresh, config.refreshTokenLifetime);

    const user = await getUser<U>();
    if (!user) {
      throw new Error('Failed to retrieve user after login');
    }
    return user;
  };

  const logout = () => {
    deleteCookie('access_token');
    deleteCookie('refresh_token');
  };

  const getUser = async <U extends User>(): Promise<U | null> => {
    try {
      const user = await apiClient.fetch<U>('/api/users/me/');
      return user;
    } catch (error) {
      return null;
    }
  };

  return {
    login,
    logout,
    getUser,
  };
}