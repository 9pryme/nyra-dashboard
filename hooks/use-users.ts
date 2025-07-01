'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, User, UserBalance } from '@/lib/services/user';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  balance: (id: string) => [...userKeys.detail(id), 'balance'] as const,
};

// Get all users
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => userService.getAllUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Search users
export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: () => userService.searchUsers(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!query.trim(), // Only run when query is not empty
    retry: 3,
  });
}

// Get user balance
export function useUserBalance(userId: string) {
  return useQuery({
    queryKey: userKeys.balance(userId),
    queryFn: () => userService.getUserBalance(userId),
    staleTime: 1 * 60 * 1000, // 1 minute for balance data
    gcTime: 3 * 60 * 1000, // 3 minutes
    enabled: !!userId,
    retry: 3,
  });
}

// Fund user wallet mutation
export function useFundUserWallet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, amount, description }: { userId: string; amount: number; description?: string }) =>
      userService.fundUserWallet(userId, amount, description),
    onSuccess: (_, variables) => {
      // Invalidate and refetch user balance
      queryClient.invalidateQueries({ queryKey: userKeys.balance(variables.userId) });
      // Invalidate wallet-related queries
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-summary'] });
      
      toast({
        title: "Success",
        description: "Wallet funded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to fund wallet",
        variant: "destructive",
      });
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// Debit user wallet mutation
export function useDebitUserWallet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, amount, description }: { userId: string; amount: number; description?: string }) =>
      userService.debitUserWallet(userId, amount, description),
    onSuccess: (_, variables) => {
      // Invalidate and refetch user balance
      queryClient.invalidateQueries({ queryKey: userKeys.balance(variables.userId) });
      // Invalidate wallet-related queries
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-summary'] });
      
      toast({
        title: "Success",
        description: "Wallet debited successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to debit wallet",
        variant: "destructive",
      });
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// Get user profile data (complete user data with wallet info)
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: [...userKeys.detail(userId), 'profile'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/wallet/${userId}/user`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch user profile');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new Error('Authentication failed - please log in again');
          }
          if (error.response?.status === 404) {
            throw new Error('User not found');
          }
          throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
        }
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

// Update user status mutation
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, activeStatus }: { userId: string; activeStatus: string }) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/user-admin/set-active-status`,
        {
          user_id: userId,
          active_status: activeStatus
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update user status');
      }

      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate specific user data
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
      
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    },
    retry: 2,
  });
}

// Freeze/Unfreeze wallet mutation
export function useFreezeWallet() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, freeze }: { userId: string; freeze: boolean }) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/wallet/freeze?user_id=${userId}&freeze=${freeze}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || `Failed to ${freeze ? 'freeze' : 'unfreeze'} wallet`);
      }

      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate user profile data
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
      // Invalidate wallet-related queries
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      
      toast({
        title: "Success",
        description: `Wallet ${variables.freeze ? 'frozen' : 'unfrozen'} successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update wallet status",
        variant: "destructive",
      });
    },
    retry: 2,
  });
}

// Calculate user metrics from users data
export function useUserMetrics() {
  const { data: users, isLoading, error } = useUsers();

  const metrics = users ? {
    totalUsers: users.length,
    activeUsers: users.filter(user => user.active_status === "ACTIVE").length,
    inactiveUsers: users.filter(user => user.active_status !== "ACTIVE").length,
  } : {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  };

  return {
    metrics,
    isLoading,
    error,
  };
}

// Clear user caches utility
export function useClearUserCaches() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: userKeys.all });
    queryClient.invalidateQueries({ queryKey: ['wallets'] });
  };
} 