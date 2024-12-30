import { ApiError } from '../types';

export const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        // Handle 401 errors
        break;
      case 403:
        // Handle 403 errors
        break;
      default:
        // Handle other errors
    }
  }
};