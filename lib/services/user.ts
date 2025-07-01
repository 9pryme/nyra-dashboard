import axios from 'axios';
// React Query now handles caching - no need for apiCache

export interface User {
  user_id: string;
  email: string;
  phone_number: string;
  firstname: string;
  lastname: string;
  role: string;
  active_status: string;
  created_at: string;
  updated_at: string;
  wallet_balance?: string; // This will be fetched separately
}

export interface UserBalance {
  balance: number;
  currency: string;
  wallet_id: string;
}

export interface UserListResponse {
  statusCode: number;
  status: string;
  success: boolean;
  error: string;
  message: string;
  data: User[];
}

export interface UserBalanceResponse {
  statusCode: number;
  status: string;
  success: boolean;
  error: string;
  message: string;
  data: UserBalance;
}

class UserService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  private getAuthToken(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

  private getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.getAuthToken()}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Fetch all users - caching now handled by React Query
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await axios.get<UserListResponse>(
        `${this.baseUrl}/user-admin/list?page_size=100000`,
        {
          headers: this.getAuthHeaders()
        }
      );

      if (response.data?.success) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to fetch users');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        if (error.response?.status === 401) {
          throw new Error('Authentication failed - please log in again');
        }
        if (error.response && error.response.status >= 500) {
          throw new Error('Server error - please try again later');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
      }
      throw error;
    }
  }

  /**
   * Search users by name, email, phone, or user ID
   */
  async searchUsers(query: string): Promise<User[]> {
    const allUsers = await this.getAllUsers();
    
    if (!query.trim()) {
      return allUsers;
    }

    const searchTerm = query.toLowerCase();
    return allUsers.filter(user => 
      (user.firstname?.toLowerCase() || '').includes(searchTerm) ||
      (user.lastname?.toLowerCase() || '').includes(searchTerm) ||
      (user.email?.toLowerCase() || '').includes(searchTerm) ||
      (user.phone_number || '').includes(searchTerm) ||
      (user.user_id?.toLowerCase() || '').includes(searchTerm)
    );
  }

  /**
   * Get user balance - caching now handled by React Query
   */
  async getUserBalance(userId: string): Promise<UserBalance | null> {
    try {
      const response = await axios.get<UserBalanceResponse>(
        `${this.baseUrl}/admin/wallet/user/${userId}`,
        {
          headers: this.getAuthHeaders()
        }
      );

      if (response.data?.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user balance:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed - please log in again');
        }
        if (error.response && error.response.status >= 500) {
          throw new Error('Server error - please try again later');
        }
      }
      return null;
    }
  }

  /**
   * Fund user wallet
   */
  async fundUserWallet(userId: string, amount: number, description: string = 'Wallet credit'): Promise<void> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/admin/wallet/user/${userId}/credit`,
        {
          amount,
          description
        },
        {
          headers: this.getAuthHeaders()
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to credit wallet');
      }

      // Cache invalidation is now handled by React Query mutations
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        throw new Error(error.response?.data?.message || 'Failed to credit wallet');
      }
      throw error;
    }
  }

  /**
   * Debit user wallet
   */
  async debitUserWallet(userId: string, amount: number, description: string = 'Wallet debit'): Promise<void> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/admin/wallet/user/${userId}/debit`,
        {
          amount,
          description
        },
        {
          headers: this.getAuthHeaders()
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to debit wallet');
      }

      // Cache invalidation is now handled by React Query mutations
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        throw new Error(error.response?.data?.message || 'Failed to debit wallet');
      }
      throw error;
    }
  }

  /**
   * Get user display name
   */
  getUserDisplayName(user: User): string {
    return `${user.firstname} ${user.lastname}`;
  }

  /**
   * Format user for selection display
   */
  formatUserForDisplay(user: User) {
    return {
      id: user.user_id,
      name: this.getUserDisplayName(user),
      email: user.email || 'No email',
      phone: user.phone_number || 'No phone',
      status: user.active_status,
      role: user.role
    };
  }

  /**
   * Clear user-related caches - now handled by React Query
   */
  clearUserCaches(): void {
    // Cache clearing is now handled by React Query hooks
    console.log('Use useClearUserCaches hook for cache invalidation');
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService; 