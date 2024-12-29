'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { ApiClient } from '../lib/api-client';
import type { DjangoSDKConfig } from '../types';

const ApiContext = createContext<ApiClient | null>(null);

export function ApiProvider({
  config,
  children,
}: {
  config: DjangoSDKConfig;
  children: ReactNode;
}) {
  const apiClient = new ApiClient(config);
  return (
    <ApiContext.Provider value={apiClient}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApiClient() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiClient must be used within ApiProvider');
  }
  return context;
}