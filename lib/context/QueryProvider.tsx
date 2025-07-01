'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time of 2 minutes - matches your current cache duration
            staleTime: 2 * 60 * 1000,
            // Cache time of 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry failed requests 3 times with exponential backoff
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Prevent background refetching when window is not focused
            refetchOnWindowFocus: false,
            // Prevent refetching on reconnect for better UX
            refetchOnReconnect: false,
            // Prevent refetching on mount if data is fresh
            refetchOnMount: false,
          },
          mutations: {
            // Retry failed mutations 2 times
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 