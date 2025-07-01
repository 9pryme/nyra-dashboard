"use client";

import UserProfileContent from "./UserProfileContent";
import NyraLoading from "@/components/ui/nyra-loading";
import { useUserProfile } from "@/hooks/use-users";

interface UserProfileClientProps {
  userId: string;
}

export default function UserProfileClient({ userId }: UserProfileClientProps) {
  // Use React Query hook
  const { data: userData, isLoading, error, refetch } = useUserProfile(userId);

  const refreshUserData = () => {
    refetch();
  };

  if (isLoading) {
    return <NyraLoading size="md" className="min-h-[50vh]" />;
  }

  if (error || !userData) {
    return <div className="p-6 text-red-500">{error?.message || 'User not found'}</div>;
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

  const accountNumbers = userData.sub_wallets.reduce((acc: Record<string, string[]>, wallet: any) => {
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