import { QueryClient } from '@tanstack/react-query';

// Query client configuration from v4 spec lines 684-707
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      
      // Retry failed requests with smart logic
      retry: (failureCount, error: any) => {
        // Don't retry on 404 errors
        if (error?.status === 404) return false;
        // Don't retry on validation errors
        if (error?.status === 400) return false;
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Background refetch settings
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      
      // Network mode
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry mutations with exponential backoff
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});