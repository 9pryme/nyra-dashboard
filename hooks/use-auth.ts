'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, LoginCredentials, User } from '@/lib/services/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Login mutation
export function useLogin() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      
      // Clear all queries on login to prevent stale data
      queryClient.clear();
      
      // Redirect to dashboard
      router.push('/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
    retry: 1, // Only retry once for login
  });
}

// Logout mutation
export function useLogout() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => Promise.resolve(authService.logout()),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      
      // Clear all cached data on logout
      queryClient.clear();
      
      // Redirect to login
      router.push('/');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to logout properly",
        variant: "destructive",
      });
    },
  });
}

// Get current user utility
export function useCurrentUser(): User | null {
  return authService.getUser();
}

// Check authentication status utility
export function useIsAuthenticated(): boolean {
  return authService.isAuthenticated();
}

// Get token utility
export function useAuthToken(): string | undefined {
  return authService.getToken();
} 