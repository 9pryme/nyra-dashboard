"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import UserProfileContent from "./UserProfileContent";
import { apiCache } from "@/lib/cache";
import NyraLoading from "@/components/ui/nyra-loading";

interface UserData {
  created_at: string;
  updated_at: string;
  wallet_id: string;
  balance: string;
  total_credit: string;
  total_debit: string;
  frozen: boolean;
  owner: {
    user_id: string;
    email: string;
    phone_number: string;
    firstname: string;
    lastname: string;
    active_status: string;
  };
  sub_wallets: Array<{
    account_number: string;
    owners_fullname: string;
    bank: string;
    frozen: boolean;
  }>;
}

interface ApiResponse {
  statusCode: number;
  status: string;
  success: boolean;
  error: string;
  message: string;
  data: UserData;
}

interface UserProfileClientProps {
  userId: string;
}

export default function UserProfileClient({ userId }: UserProfileClientProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      // Clear cache if force refresh is requested
      if (forceRefresh) {
        apiCache.invalidate(`user_data_${userId}`);
      }

      const response = await apiCache.getOrFetch<ApiResponse>(
        `user_data_${userId}`,
        async () => {
          const axiosResponse = await axios.get<ApiResponse>(`${process.env.NEXT_PUBLIC_API_URL}/admin/wallet/${userId}/user`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          return axiosResponse.data;
        }
      );

      if (response.success) {
        setUserData(response.data);
        setError(null);
      } else {
        throw new Error(response.message || 'Failed to fetch user data');
      }
    } catch (err: any) {
      console.error('UserProfile fetch error:', err);
      setError(err.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = () => {
    setLoading(true);
    fetchUserData(true);
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  if (loading) {
    return <NyraLoading size="md" className="min-h-[50vh]" />;
  }

  if (error || !userData) {
    return <div className="p-6 text-red-500">{error || 'User not found'}</div>;
  }

  const formattedUserData = {
    id: userData.owner.user_id,
    firstName: userData.owner.firstname,
    lastName: userData.owner.lastname,
    email: userData.owner.email,
    phone: userData.owner.phone_number,
    dateJoined: new Date(userData.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    status: userData.owner.active_status,
    frozen: userData.frozen
  };

  const walletData = {
    balance: parseFloat(userData.balance),
    totalCredit: parseFloat(userData.total_credit),
    totalDebit: parseFloat(userData.total_debit),
    totalTransactions: 0, // Not provided in API
    totalReferrals: 0, // Not provided in API
    referralEarnings: 0, // Not provided in API
    frozen: userData.frozen
  };

  const accountNumbers = userData.sub_wallets.reduce((acc, wallet) => {
    if (!acc[wallet.bank]) {
      acc[wallet.bank] = [];
    }
    acc[wallet.bank].push(wallet.account_number);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <UserProfileContent 
      userId={userId} 
      userData={formattedUserData}
      walletData={walletData}
      accountNumbers={accountNumbers}
      onRefresh={refreshUserData}
    />
  );
} 