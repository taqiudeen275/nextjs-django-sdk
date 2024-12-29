export interface DjangoSDKConfig {
  baseUrl: string;
  tokenPrefix?: string;
  accessTokenLifetime?: number;
  refreshTokenLifetime?: number;
  autoRefresh?: boolean;
  csrfEnabled?: boolean;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  [key: string]: any;
}