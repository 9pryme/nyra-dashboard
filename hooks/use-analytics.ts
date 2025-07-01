'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService, TransactionAnalytics } from '@/lib/services/analytics';

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'recent'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      return analyticsService.fetchRecentAnalytics();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - matches your original cache duration
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Provide fallback data to prevent UI breaking
    placeholderData: {
      today: { 
        categories: {}, 
        electronic: 0, 
        total_debit: 0, 
        total_credit: 0,
        total_charges_external: 0,
        total_charges_internal: 0
      },
      yesteday: { 
        categories: {}, 
        electronic: 0, 
        total_debit: 0, 
        total_credit: 0,
        total_charges_external: 0,
        total_charges_internal: 0
      },
      current_month: { 
        categories: {}, 
        electronic: 0, 
        total_debit: 0, 
        total_credit: 0,
        total_charges_external: 0,
        total_charges_internal: 0
      },
      last_month: { 
        categories: {}, 
        electronic: 0, 
        total_debit: 0, 
        total_credit: 0,
        total_charges_external: 0,
        total_charges_internal: 0
      },
      current_year: { 
        categories: {}, 
        electronic: 0, 
        total_debit: 0, 
        total_credit: 0,
        total_charges_external: 0,
        total_charges_internal: 0
      },
      last_year: { 
        categories: {}, 
        electronic: 0, 
        total_debit: 0, 
        total_credit: 0,
        total_charges_external: 0,
        total_charges_internal: 0
      }
    } as TransactionAnalytics,
    // Enable background refetch for fresher data
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes when component is active
    refetchIntervalInBackground: false, // Don't refetch when tab is not active
  });
}

// Hook for getting calculated analytics metrics
export function useAnalyticsMetrics() {
  const { data: analytics, isLoading, error } = useAnalytics();

  // Always pass analytics (even if null) to let the service handle the null checks
  const dailyChanges = analyticsService.calculateDailyChanges(analytics || null);
  const monthlyChanges = analyticsService.calculateMonthlyChanges(analytics || null);
  const timePeriodOptions = analyticsService.getTimePeriodOptions(analytics || null);

  return {
    analytics,
    dailyChanges,
    monthlyChanges,
    timePeriodOptions,
    isLoading,
    error
  };
} 