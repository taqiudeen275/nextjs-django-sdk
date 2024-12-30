'use client';

import React, { createContext, useContext } from 'react';
import { ApiConfig } from '../types';
import { SWRConfig } from 'swr';

interface ApiProviderProps {
  config: ApiConfig;
  children: React.ReactNode;
}

const ApiContext = createContext<ApiConfig | null>(null);

export function ApiProvider({ config, children }: ApiProviderProps) {
  return (
    <ApiContext.Provider value={config}>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          revalidateIfStale: false,
          shouldRetryOnError: false,
        }}
      >
        {children}
      </SWRConfig>
    </ApiContext.Provider>
  );
}

export function useApiConfig() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiConfig must be used within an ApiProvider');
  }
  return context;
}