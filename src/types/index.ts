export interface User {
    id: number;
    username: string;
    email: string;
    [key: string]: any;

  }
  
  export interface ApiConfig {
    baseUrl: string;
    tokenPrefix?: string;
    accessTokenLifetime?: number;
    refreshTokenLifetime?: number;
    autoRefresh?: boolean;
    csrfEnabled?: boolean;
    retryAttempts?: number;
    retryDelay?: number;
  }
  
  export interface FetchOptions extends Omit<RequestInit, 'data'> {
    data?: Record<string, unknown> | string;
    retry?: boolean;
    retryAttempts?: number;
    retryDelay?: number;
  }
  

  export class ApiError extends Error {
    constructor(
      message: string,
      public status: number,
      public details?: unknown
    ) {
      super(message);
      this.name = "ApiError";
    }
  }

