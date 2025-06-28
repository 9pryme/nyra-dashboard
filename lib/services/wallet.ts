import axios from 'axios';

export interface WalletOwner {
  user_id: string;
  email: string;
  phone_number: string;
  username: string;
  firstname: string;
  lastname: string;
  middlename?: string;
  active_status: string;
  account_tier?: number;
  role?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
}

export interface WalletData {
  wallet_id: string;
  balance: string;
  total_credit: string;
  total_debit: string;
  frozen: boolean;
  wallet_pin_changed?: boolean;
  owner: WalletOwner;
  created_at: string;
  updated_at?: string;
}

export interface WalletSummary {
  total_balance: string;
  total_credit: string;
  total_debit: string;
  total_credit_count: string;
  total_debit_count: string;
}

export interface WalletAnalytics {
  totalWallets: number;
  calculatedTotalBalance: number;
  activeWallets: number;
  frozenWallets: number;
  averageBalance: number;
  weeklyChanges: {
    totalWalletsChange: number;
    balanceChange: number;
    activeWalletsChange: number;
    frozenWalletsChange: number;
  };
}

export interface WalletFilters {
  search?: string;
  status?: 'all' | 'active' | 'frozen';
  minAmount?: number;
  maxAmount?: number;
}

export class WalletService {
  private static instance: WalletService;
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async fetchWallets(pageSize: number = 2000000): Promise<WalletData[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${this.baseUrl}/admin/wallet/users?page_size=${pageSize}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch wallets');
  }

  async fetchWalletSummary(): Promise<WalletSummary> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${this.baseUrl}/wallet/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      return response.data.data[0];
    }
    throw new Error(response.data.message || 'Failed to fetch wallet summary');
  }

  calculateWalletAnalytics(wallets: WalletData[]): WalletAnalytics {
    const totalWallets = wallets.length;
    const calculatedTotalBalance = wallets.reduce((sum, wallet) => {
      return sum + parseFloat(wallet.balance || '0');
    }, 0);
    
    const activeWallets = wallets.filter(wallet => !wallet.frozen).length;
    const frozenWallets = wallets.filter(wallet => wallet.frozen).length;
    const averageBalance = totalWallets > 0 ? calculatedTotalBalance / totalWallets : 0;

    // Calculate weekly changes based on wallet creation dates
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Wallets created in the last week
    const newWalletsThisWeek = wallets.filter(wallet => 
      new Date(wallet.created_at) >= oneWeekAgo
    );

    // Calculate percentage changes
    const previousTotalWallets = totalWallets - newWalletsThisWeek.length;
    const totalWalletsChange = previousTotalWallets > 0 
      ? ((newWalletsThisWeek.length / previousTotalWallets) * 100)
      : newWalletsThisWeek.length > 0 ? 100 : 0;

    // Balance change based on new wallets vs existing wallets
    const newWalletsBalance = newWalletsThisWeek.reduce((sum, wallet) => 
      sum + parseFloat(wallet.balance || '0'), 0
    );
    const existingWalletsBalance = calculatedTotalBalance - newWalletsBalance;
    const balanceChange = existingWalletsBalance > 0 
      ? ((newWalletsBalance / existingWalletsBalance) * 100)
      : newWalletsBalance > 0 ? 100 : 0;

    // Active wallets change
    const newActiveWallets = newWalletsThisWeek.filter(wallet => !wallet.frozen).length;
    const previousActiveWallets = activeWallets - newActiveWallets;
    const activeWalletsChange = previousActiveWallets > 0 
      ? ((newActiveWallets / previousActiveWallets) * 100)
      : newActiveWallets > 0 ? 100 : 0;

    // Frozen wallets change
    const newFrozenWallets = newWalletsThisWeek.filter(wallet => wallet.frozen).length;
    const previousFrozenWallets = frozenWallets - newFrozenWallets;
    const frozenWalletsChange = previousFrozenWallets > 0 
      ? ((newFrozenWallets / previousFrozenWallets) * 100)
      : newFrozenWallets > 0 ? 100 : previousFrozenWallets === 0 && newFrozenWallets === 0 ? 0 : -100;

    return {
      totalWallets,
      calculatedTotalBalance,
      activeWallets,
      frozenWallets,
      averageBalance,
      weeklyChanges: {
        totalWalletsChange: Math.round(totalWalletsChange * 10) / 10, // Round to 1 decimal
        balanceChange: Math.round(balanceChange * 10) / 10,
        activeWalletsChange: Math.round(activeWalletsChange * 10) / 10,
        frozenWalletsChange: Math.round(frozenWalletsChange * 10) / 10,
      }
    };
  }

  filterWallets(wallets: WalletData[], filters: WalletFilters): WalletData[] {
    return wallets.filter(wallet => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch = 
          wallet.wallet_id?.toLowerCase().includes(search) ||
          `${wallet.owner?.firstname || ''} ${wallet.owner?.lastname || ''}`.toLowerCase().includes(search) ||
          wallet.owner?.email?.toLowerCase().includes(search) ||
          wallet.owner?.username?.toLowerCase().includes(search) ||
          false;
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && filters.status !== 'all') {
        const matchesStatus = 
          (filters.status === "frozen" && wallet.frozen) || 
          (filters.status === "active" && !wallet.frozen);
        
        if (!matchesStatus) return false;
      }

      // Amount filters
      const balance = parseFloat(wallet.balance || '0');
      
      if (filters.minAmount !== undefined && balance < filters.minAmount) {
        return false;
      }
      
      if (filters.maxAmount !== undefined && balance > filters.maxAmount) {
        return false;
      }

      return true;
    });
  }

  formatCurrency(amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  }

  formatLargeNumber(num: number): string {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  formatVolume(amount: number): string {
    if (amount >= 1000000000) {
      return `₦${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(1)}K`;
    }
    return this.formatCurrency(amount);
  }
}

export const walletService = WalletService.getInstance(); 