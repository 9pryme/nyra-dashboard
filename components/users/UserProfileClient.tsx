"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import UserProfileContent from "./UserProfileContent";

interface UserData {
  created_at: string;
  updated_at: string;
  wallet_id: string;
  balance: string;
  total_credit: string;
  total_debit: string;
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get<ApiResponse>(`${process.env.NEXT_PUBLIC_API_URL}/admin/wallet/${userId}/user`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setUserData(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch user data');
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to fetch user data');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch user data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
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
    status: userData.owner.active_status
  };

  const walletData = {
    balance: parseFloat(userData.balance),
    totalCredit: parseFloat(userData.total_credit),
    totalDebit: parseFloat(userData.total_debit),
    totalTransactions: 0, // Not provided in API
    totalReferrals: 0, // Not provided in API
    referralEarnings: 0 // Not provided in API
  };

  const accountNumbers = userData.sub_wallets.reduce((acc, wallet) => {
    acc[wallet.bank] = wallet.account_number;
    return acc;
  }, {} as Record<string, string>);

  return (
    <UserProfileContent 
      userId={userId} 
      userData={formattedUserData}
      walletData={walletData}
      accountNumbers={accountNumbers}
    />
  );
} 