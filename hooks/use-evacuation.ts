'use client';

import { useQuery } from '@tanstack/react-query';
import { evacuationService, EvacuationRecord } from '@/lib/services/evacuation';

// Query Keys
export const evacuationKeys = {
  all: ['evacuation'] as const,
  history: (provider: string, fromDate: string, toDate: string) => 
    [...evacuationKeys.all, 'history', { provider, fromDate, toDate }] as const,
  analytics: (data: EvacuationRecord[]) => 
    [...evacuationKeys.all, 'analytics', { data }] as const,
};

// Get evacuation history
export function useEvacuationHistory(
  provider: string = '9psb',
  fromDate: string = '2025-01-01',
  toDate: string = '2025-12-31'
) {
  return useQuery({
    queryKey: evacuationKeys.history(provider, fromDate, toDate),
    queryFn: () => evacuationService.fetchEvacuationHistory(provider, fromDate, toDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!provider && !!fromDate && !!toDate,
  });
}

// Get evacuation analytics (derived from history data)
export function useEvacuationAnalytics(
  provider: string = '9psb',
  fromDate: string = '2025-01-01',
  toDate: string = '2025-12-31'
) {
  const { data: evacuations, isLoading, error } = useEvacuationHistory(provider, fromDate, toDate);

  return {
    data: evacuations ? evacuationService.calculateAnalytics(evacuations) : null,
    evacuations: evacuations || [],
    isLoading,
    error,
  };
}

// Combined hook for evacuation dashboard data
export function useEvacuationDashboardData(
  provider: string = '9psb',
  fromDate: string = '2025-01-01',
  toDate: string = '2025-12-31'
) {
  const historyQuery = useEvacuationHistory(provider, fromDate, toDate);
  
  const analytics = historyQuery.data ? evacuationService.calculateAnalytics(historyQuery.data) : null;

  return {
    evacuations: historyQuery.data || [],
    analytics,
    isLoading: historyQuery.isLoading,
    error: historyQuery.error,
    refetch: historyQuery.refetch,
  };
} 