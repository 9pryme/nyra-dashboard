import axios from 'axios';
// React Query now handles caching - no need for apiCache

export interface EvacuationRecord {
  created_at: string;
  id: string;
  from: string;
  total_amount_moved: string;
  total_charges_incured: string;
  total_accounts_processed: number;
  total_failures: number;
  skipped: number;
  amount_skipped: string;
}

export interface EvacuationResponse {
  statusCode: number;
  status: string;
  success: boolean;
  error: string;
  message: string;
  data: EvacuationRecord[];
}

export interface EvacuationAnalytics {
  totalAmountEvacuated: number;
  totalEvacuations: number;
  successRate: number;
  totalAccountsProcessed: number;
  totalCharges: number;
  averageAmountPerEvacuation: number;
}

class EvacuationService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;

  async fetchEvacuationHistory(
    provider: string = '9psb',
    fromDate: string = '2025-01-01',
    toDate: string = '2025-12-31'
  ): Promise<EvacuationRecord[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get<EvacuationResponse>(
      `${this.baseUrl}/funds/history`,
      {
        params: {
          transferred_from: provider,
          from: fromDate,
          to: toDate
        },
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch evacuation history');
    }
  }

  calculateAnalytics(evacuations: EvacuationRecord[]): EvacuationAnalytics {
    if (!evacuations || evacuations.length === 0) {
      return {
        totalAmountEvacuated: 0,
        totalEvacuations: 0,
        successRate: 0,
        totalAccountsProcessed: 0,
        totalCharges: 0,
        averageAmountPerEvacuation: 0
      };
    }

    const totalAmountEvacuated = evacuations.reduce(
      (sum, record) => sum + parseFloat(record.total_amount_moved || '0'), 
      0
    );

    const totalCharges = evacuations.reduce(
      (sum, record) => sum + parseFloat(record.total_charges_incured || '0'), 
      0
    );

    const totalAccountsProcessed = evacuations.reduce(
      (sum, record) => sum + (record.total_accounts_processed || 0), 
      0
    );

    const totalFailures = evacuations.reduce(
      (sum, record) => sum + (record.total_failures || 0), 
      0
    );

    const totalEvacuations = evacuations.length;
    const successRate = totalAccountsProcessed > 0 
      ? ((totalAccountsProcessed - totalFailures) / totalAccountsProcessed) * 100 
      : 0;
    
    const averageAmountPerEvacuation = totalEvacuations > 0 
      ? totalAmountEvacuated / totalEvacuations 
      : 0;

    return {
      totalAmountEvacuated,
      totalEvacuations,
      successRate,
      totalAccountsProcessed,
      totalCharges,
      averageAmountPerEvacuation
    };
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCount(count: number): string {
    return count.toLocaleString();
  }
}

export const evacuationService = new EvacuationService(); 