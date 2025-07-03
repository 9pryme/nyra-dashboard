'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

// Types
export interface GlobalAccount {
  id: string;
  name: string;
  account_number: string;
  bank_name: string;
  balance?: string;
}

export interface ServiceFeatures {
  [key: string]: any;
}

export interface ProviderOptions {
  [key: string]: any;
}

export interface KycRecord {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  users_type: string;
  user_email?: string;
  created_at: string;
  sent_at?: string;
}

// Query Keys
export const adminKeys = {
  all: ['admin'] as const,
  accounts: () => [...adminKeys.all, 'accounts'] as const,
  serviceFeatures: () => [...adminKeys.all, 'service-features'] as const,
  serviceOptions: () => [...adminKeys.all, 'service-options'] as const,
  notifications: () => [...adminKeys.all, 'notifications'] as const,
  kyc: (userId: string) => [...adminKeys.all, 'kyc', userId] as const,
};

// Global accounts hook
export function useGlobalAccounts() {
  return useQuery({
    queryKey: adminKeys.accounts(),
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/global/accounts`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success && response.data.data.accounts) {
          return response.data.data.accounts;
        } else {
          throw new Error(response.data.message || 'Failed to fetch accounts');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new Error('Authentication failed - please log in again');
          }
          if (error.response && error.response.status >= 500) {
            throw new Error('Server error - please try again later');
          }
          throw new Error(error.response?.data?.message || 'Failed to fetch accounts');
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });
}

// Service features hook
export function useServiceFeatures() {
  return useQuery({
    queryKey: adminKeys.serviceFeatures(),
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/control-panel/get-features`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch service features');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new Error('Authentication failed - please log in again');
          }
          throw new Error(error.response?.data?.message || 'Failed to fetch service features');
        }
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
  });
}

// Service options hook
export function useServiceOptions() {
  return useQuery({
    queryKey: adminKeys.serviceOptions(),
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/control-panel/options`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch service options');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new Error('Authentication failed - please log in again');
          }
          throw new Error(error.response?.data?.message || 'Failed to fetch service options');
        }
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
  });
}

// Notification history hook
export function useNotificationHistory() {
  return useQuery({
    queryKey: adminKeys.notifications(),
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications/admin/history`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          return response.data.data.map((item: any) => ({
            id: item.id || item.notification_id,
            title: item.title,
            date: new Date(item.created_at || item.sent_at).toLocaleString(),
            type: item.users_type === 'ALL_USERS' ? 'all' : 'specific',
            sentTo: item.users_type === 'ALL_USERS' ? 'All Users' : (item.user_email || item.recipient || 'Specific User')
          }));
        } else {
          throw new Error(response.data?.message || 'Failed to fetch notification history');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new Error('Authentication failed - please log in again');
          }
          throw new Error(error.response?.data?.message || 'Failed to fetch notification history');
        }
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

// KYC data hook
export function useUserKyc(userId: string) {
  return useQuery({
    queryKey: adminKeys.kyc(userId),
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/identities/user/kyc/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success && response.data.data) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch KYC data');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new Error('Authentication failed - please log in again');
          }
          throw new Error(error.response?.data?.message || 'Failed to fetch KYC data');
        }
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 3,
  });
}

// Combined service management hook
export function useServiceManagement() {
  const featuresQuery = useServiceFeatures();
  const optionsQuery = useServiceOptions();

  return {
    features: featuresQuery.data,
    options: optionsQuery.data,
    isLoading: featuresQuery.isLoading || optionsQuery.isLoading,
    error: featuresQuery.error || optionsQuery.error,
    refetch: () => {
      featuresQuery.refetch();
      optionsQuery.refetch();
    },
  };
}

// Update settings mutation
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { settingsId: string; properties: any }) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // The API has a nested structure when returning data, but expects flattened structure when updating
      // For all settings, we need to flatten the structure by removing the duplicate property name
      let flattenedProperties = data.properties;
      if (data.properties[data.settingsId]) {
        flattenedProperties = data.properties[data.settingsId];
      }

      const payload = { settings_id: data.settingsId, properties: flattenedProperties };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/control-panel/update-settings`,
        payload,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update settings');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch service features to get updated data
      queryClient.invalidateQueries({ queryKey: adminKeys.serviceFeatures() });
      
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
    retry: 2,
  });
}

// Batch update settings mutation
export function useBatchUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: Array<{ settingsId: string; properties: any }>) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Process each update sequentially to ensure data consistency
      for (const update of updates) {
        // The API has a nested structure when returning data, but expects flattened structure when updating
        let flattenedProperties = update.properties;
        if (update.properties[update.settingsId]) {
          flattenedProperties = update.properties[update.settingsId];
        }

        const payload = { settings_id: update.settingsId, properties: flattenedProperties };

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/control-panel/update-settings`,
          payload,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.data.success) {
          throw new Error(response.data.message || `Failed to update ${update.settingsId} settings`);
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      // Invalidate and refetch service features to get updated data
      queryClient.invalidateQueries({ queryKey: adminKeys.serviceFeatures() });
      
      toast({
        title: "Success",
        description: "All settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
    retry: 2,
  });
}

// Send notification mutation
export function useSendNotification() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationData: {
      title: string;
      message: string;
      users_type: string;
      user_emails?: string[];
    }) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/admin/send`,
        notificationData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send notification');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch notification history
      queryClient.invalidateQueries({ queryKey: adminKeys.notifications() });
      
      toast({
        title: "Success",
        description: "Notification sent successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      });
    },
    retry: 2,
  });
} 