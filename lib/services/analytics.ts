// React Query now handles caching - no need for apiCache

export interface PeriodAnalytics {
  categories: Record<string, number>;
  electronic: number;
  total_debit: number;
  total_credit: number;
  total_charges_external?: number;
  total_charges_internal?: number;
}

export interface TransactionAnalytics {
  today: PeriodAnalytics;
  yesteday: PeriodAnalytics; // Note: API has typo "yesteday"
  current_month: PeriodAnalytics;
  last_month: PeriodAnalytics | null;
  current_year: PeriodAnalytics;
  last_year: PeriodAnalytics | null;
}

export interface AnalyticsApiResponse {
  statusCode: number;
  status: string;
  success: boolean;
  error: string;
  message: string;
  data: TransactionAnalytics;
}

export type TimePeriod = 'today' | 'yesteday' | 'current_month' | 'last_month' | 'current_year' | 'last_year';

export interface TimePeriodOption {
  value: TimePeriod;
  label: string;
  available: boolean;
}

class AnalyticsService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  /**
   * Fetch recent transaction analytics
   * Note: Caching is now handled by React Query
   */
  async fetchRecentAnalytics(): Promise<TransactionAnalytics> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseURL}/analytics/transactions/recent`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Analytics endpoint not found - feature may not be available yet');
      }
      if (response.status === 401) {
        throw new Error('Authentication failed - please log in again');
      }
      if (response.status >= 500) {
        throw new Error('Server error - please try again later');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AnalyticsApiResponse = await response.json();
    
    if (!data) {
      throw new Error('No data received from analytics endpoint');
    }

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch analytics data');
    }

    return data.data;
  }

  /**
   * Calculate percentage change between two values
   */
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous * 100) * 10) / 10;
  }

  /**
   * Calculate daily change (today vs yesterday)
   */
  calculateDailyChanges(analytics: TransactionAnalytics | null) {
    // Handle null analytics or missing period data
    if (!analytics || !analytics.today || !analytics.yesteday) {
      return {
        volumeChange: 0,
        creditChange: 0,
        debitChange: 0,
        transactionCountChange: 0
      };
    }

    const today = analytics.today;
    const yesterday = analytics.yesteday;

    return {
      volumeChange: this.calculatePercentageChange(
        (today.total_credit || 0) + (today.total_debit || 0),
        (yesterday.total_credit || 0) + (yesterday.total_debit || 0)
      ),
      creditChange: this.calculatePercentageChange(
        today.total_credit || 0,
        yesterday.total_credit || 0
      ),
      debitChange: this.calculatePercentageChange(
        today.total_debit || 0,
        yesterday.total_debit || 0
      ),
      transactionCountChange: this.calculatePercentageChange(
        today.electronic || 0,
        yesterday.electronic || 0
      )
    };
  }

  /**
   * Calculate monthly change (current month vs last month)
   */
  calculateMonthlyChanges(analytics: TransactionAnalytics | null) {
    // Handle null analytics or missing period data
    if (!analytics || !analytics.current_month) {
      return {
        volumeChange: 0,
        creditChange: 0,
        debitChange: 0,
        transactionCountChange: 0
      };
    }

    const lastMonth = analytics.last_month;
    if (!lastMonth) {
      return {
        volumeChange: 100,
        creditChange: 100,
        debitChange: 100,
        transactionCountChange: 100
      };
    }

    const currentMonth = analytics.current_month;

    return {
      volumeChange: this.calculatePercentageChange(
        (currentMonth.total_credit || 0) + (currentMonth.total_debit || 0),
        (lastMonth.total_credit || 0) + (lastMonth.total_debit || 0)
      ),
      creditChange: this.calculatePercentageChange(
        currentMonth.total_credit || 0,
        lastMonth.total_credit || 0
      ),
      debitChange: this.calculatePercentageChange(
        currentMonth.total_debit || 0,
        lastMonth.total_debit || 0
      ),
      transactionCountChange: this.calculatePercentageChange(
        currentMonth.electronic || 0,
        lastMonth.electronic || 0
      )
    };
  }

  /**
   * Get the top categories for a period
   */
  getTopCategories(periodData: PeriodAnalytics | null, limit: number = 5): Array<{category: string, amount: number}> {
    if (!periodData || !periodData.categories) {
      return [];
    }
    
    return Object.entries(periodData.categories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  }

  /**
   * Format currency values
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format large numbers with K/M suffixes
   */
  formatVolume(amount: number): string {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(1)}K`;
    }
    return this.formatCurrency(amount);
  }

  /**
   * Format transaction count with K/M suffixes
   */
  formatCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  /**
   * Get available time period options
   */
  getTimePeriodOptions(analytics: TransactionAnalytics | null): TimePeriodOption[] {
    if (!analytics) {
      return [
        { value: 'today', label: 'Today', available: false },
        { value: 'yesteday', label: 'Yesterday', available: false },
        { value: 'current_month', label: 'This Month', available: false },
        { value: 'last_month', label: 'Last Month', available: false },
        { value: 'current_year', label: 'This Year', available: false },
        { value: 'last_year', label: 'Last Year', available: false }
      ];
    }

    return [
      { value: 'today', label: 'Today', available: !!analytics.today },
      { value: 'yesteday', label: 'Yesterday', available: !!analytics.yesteday },
      { value: 'current_month', label: 'This Month', available: !!analytics.current_month },
      { value: 'last_month', label: 'Last Month', available: !!analytics.last_month },
      { value: 'current_year', label: 'This Year', available: !!analytics.current_year },
      { value: 'last_year', label: 'Last Year', available: !!analytics.last_year }
    ];
  }

  /**
   * Get analytics data for a specific time period
   */
  getPeriodData(analytics: TransactionAnalytics | null, period: TimePeriod): PeriodAnalytics | null {
    if (!analytics) return null;
    
    switch (period) {
      case 'today':
        return analytics.today;
      case 'yesteday':
        return analytics.yesteday;
      case 'current_month':
        return analytics.current_month;
      case 'last_month':
        return analytics.last_month;
      case 'current_year':
        return analytics.current_year;
      case 'last_year':
        return analytics.last_year;
      default:
        return null;
    }
  }

  /**
   * Process category data for display
   */
  processCategoryData(periodData: PeriodAnalytics | null) {
    if (!periodData || !periodData.categories) return [];
    
    const categories = periodData.categories;
    const totalAmount = Object.values(categories).reduce((sum, amount) => sum + (amount || 0), 0);
    
    return Object.entries(categories)
      .map(([category, amount]) => ({
        category: category.replace(/_/g, ' '),
        amount: amount || 0,
        percentage: totalAmount > 0 ? (((amount || 0) / totalAmount) * 100) : 0,
        formattedAmount: this.formatVolume(amount || 0)
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Get summary statistics for a period
   */
  getPeriodSummary(periodData: PeriodAnalytics | null) {
    if (!periodData) {
      return {
        totalTransactions: 0,
        totalVolume: 0,
        totalCredit: 0,
        totalDebit: 0,
        totalCharges: 0,
        formattedVolume: '₦0',
        formattedCredit: '₦0',
        formattedDebit: '₦0',
        formattedCharges: '₦0'
      };
    }

    const totalCredit = periodData.total_credit || 0;
    const totalDebit = periodData.total_debit || 0;
    const totalVolume = totalCredit + totalDebit;
    const totalCharges = (periodData.total_charges_external || 0) + (periodData.total_charges_internal || 0);
    const totalTransactions = periodData.electronic || 0;

    return {
      totalTransactions,
      totalVolume,
      totalCredit,
      totalDebit,
      totalCharges,
      formattedVolume: this.formatVolume(totalVolume),
      formattedCredit: this.formatVolume(totalCredit),
      formattedDebit: this.formatVolume(totalDebit),
      formattedCharges: this.formatVolume(totalCharges)
    };
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService(); 