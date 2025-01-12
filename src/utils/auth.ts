import { ApiConfig, User } from '../types';
import { getApiClient } from './apiClient';
import { getClientCookie, setClientCookie, deleteClientCookie } from './clientCookies';


export function getAuth(config: ApiConfig) {
  const apiClient = getApiClient(config);

  const login = async <U extends User>(
    username: string,
    password: string,
    isEmail: boolean,
    url: string,
  ): Promise<U> => {
    const body = isEmail ? { email: username, password }: { username, password };
    const response:any = await apiClient.fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    await setClientCookie('access_token', response.access, config.accessTokenLifetime);
    await setClientCookie('refresh_token', response.refresh, config.refreshTokenLifetime);

    const user = await getUser<U>();
    if (!user) {
      throw new Error('Failed to retrieve user after login');
    }
    return user;
  };

  const logout = async () => {
    await deleteClientCookie('access_token');
    await deleteClientCookie('refresh_token');
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