export interface User {
    id: number;
    username: string;
    email: string;
    [key: string]: any; // Allow custom user properties
  }
  
  export interface ApiConfig {
    baseUrl: string;
    tokenPrefix?: string;
    accessTokenLifetime?: number;
    refreshTokenLifetime?: number;
    autoRefresh?: boolean;
    csrfEnabled?: boolean;
  }
  
  export interface FetchOptions extends RequestInit {
    data?: any;
  }
  
  export class ApiError extends Error {
    status: number;
    details?: any;
  
    constructor(message: string, status: number, details?: any) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.details = details;
    }
  }