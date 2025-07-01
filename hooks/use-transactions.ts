'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Types
export interface Transaction {
  transaction_id: string;
  transaction_type: string;
  transaction_status: string;
  amount: string;
  created_at: string;
  user_id?: string;
  description?: string;
  reference?: string;
}

export interface TransactionListResponse {
  statusCode: number;
  status: string;
  success: boolean;
  error: string;
  message: string;
  data: Transaction[];
}

// Query Keys
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (pageSize?: number) => [...transactionKeys.lists(), { pageSize }] as const,
  user: (userId: string) => [...transactionKeys.all, 'user', userId] as const,
};

// Get all transactions
export function useTransactions(pageSize: number = 50000000) {
  return useQuery({
    queryKey: transactionKeys.list(pageSize),
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.get<TransactionListResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/transactions/list?page_size=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data?.success && Array.isArray(response.data.data)) {
          return response.data.data;
        } else {
          throw new Error(response.data?.message || 'Failed to fetch transactions');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new Error('Authentication failed - please log in again');
          }
          if (error.response?.status === 429) {
            throw new Error('Too many requests. Please wait a moment and try again.');
          }
          if (error.response && error.response.status >= 500) {
            throw new Error('Server error - please try again later');
          }
          throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
        }
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Get user-specific transactions
export function useUserTransactions(userId: string) {
  return useQuery({
    queryKey: transactionKeys.user(userId),
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.get<TransactionListResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/transactions/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data?.success && Array.isArray(response.data.data)) {
          return response.data.data;
        } else {
          throw new Error(response.data?.message || 'Failed to fetch user transactions');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new Error('Authentication failed - please log in again');
          }
          if (error.response?.status === 429) {
            throw new Error('Too many requests. Please wait a moment and try again.');
          }
          if (error.response && error.response.status >= 500) {
            throw new Error('Server error - please try again later');
          }
          throw new Error(error.response?.data?.message || 'Failed to fetch user transactions');
        }
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    retry: 3,
  });
} 