'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { walletService, WalletData, WalletSummary, WalletFilters } from '@/lib/services/wallet';

// Query Keys
export const walletKeys = {
  all: ['wallets'] as const,
  lists: () => [...walletKeys.all, 'list'] as const,
  list: (pageSize?: number) => [...walletKeys.lists(), { pageSize }] as const,
  filtered: (filters: WalletFilters) => [...walletKeys.lists(), { filters }] as const,
  summary: () => [...walletKeys.all, 'summary'] as const,
  analytics: () => [...walletKeys.all, 'analytics'] as const,
};

// Get all wallets
export function useWallets(pageSize: number = 2000000) {
  return useQuery({
    queryKey: walletKeys.list(pageSize),
    queryFn: () => walletService.fetchWallets(pageSize),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Get wallet summary
export function useWalletSummary() {
  return useQuery({
    queryKey: walletKeys.summary(),
    queryFn: () => walletService.fetchWalletSummary(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Get wallet analytics (derived from wallets data)
export function useWalletAnalytics(pageSize?: number) {
  const { data: wallets, isLoading, error } = useWallets(pageSize);

  return {
    data: wallets ? walletService.calculateWalletAnalytics(wallets) : null,
    isLoading,
    error,
  };
}

// Get filtered wallets
export function useFilteredWallets(filters: WalletFilters, pageSize?: number) {
  const { data: wallets, isLoading, error } = useWallets(pageSize);

  return {
    data: wallets ? walletService.filterWallets(wallets, filters) : [],
    isLoading,
    error,
    allWallets: wallets || [],
  };
}

// Combined hook for dashboard data
export function useWalletDashboardData() {
  const walletsQuery = useWallets();
  const summaryQuery = useWalletSummary();
  
  const analytics = walletsQuery.data ? walletService.calculateWalletAnalytics(walletsQuery.data) : null;

  return {
    wallets: walletsQuery.data || [],
    summary: summaryQuery.data,
    analytics,
    isLoading: walletsQuery.isLoading || summaryQuery.isLoading,
    error: walletsQuery.error || summaryQuery.error,
    refetch: () => {
      walletsQuery.refetch();
      summaryQuery.refetch();
    },
  };
}

// Invalidate wallet caches utility
export function useInvalidateWallets() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: walletKeys.all });
  };
} 