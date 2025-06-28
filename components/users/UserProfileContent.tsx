"use client";

import { useState } from "react";
import UserTransactions from "@/components/users/UserTransactions";
import UserProfile from "@/components/users/UserProfile";
import UserWallet from "@/components/users/UserWallet";
import UserActions from "@/components/users/UserActions";
import UserAccountNumbers from "@/components/users/UserAccountNumbers";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface UserProfileContentProps {
  userId: string;
  userData: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateJoined: string;
    status: string;
    frozen: boolean;
  };
  walletData: {
    balance: number;
    totalCredit: number;
    totalDebit: number;
    totalTransactions: number;
    totalReferrals: number;
    referralEarnings: number;
    frozen: boolean;
  };
  accountNumbers: Record<string, string[]>;
  onRefresh: () => void;
}

export default function UserProfileContent({ 
  userId, 
  userData,
  walletData,
  accountNumbers,
  onRefresh
}: UserProfileContentProps) {
  const router = useRouter();
  const [currentUserData, setCurrentUserData] = useState(userData);
  const [currentWalletData, setCurrentWalletData] = useState(walletData);

  const handleFrozenStatusUpdate = (frozen: boolean) => {
    setCurrentUserData((prev: typeof userData) => ({
      ...prev,
      frozen: frozen
    }));
    setCurrentWalletData((prev: typeof walletData) => ({
      ...prev,
      frozen: frozen
    }));
  };

  const handleStatusUpdate = (newStatus: string) => {
    setCurrentUserData((prev: typeof userData) => ({
      ...prev,
      status: newStatus
    }));
  };

  const handleWalletRefresh = () => {
    // Call the parent refresh function to re-fetch user data
    onRefresh();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          className="mb-2 -ml-2 h-8 text-muted-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <p className="font-semibold text-foreground">Viewing {userData.firstName} {userData.lastName}</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Left Column - User Profile & Account Numbers */}
        <div className="lg:col-span-4 space-y-6">
          <UserProfile 
            userId={userId} 
            userData={currentUserData} 
            onStatusUpdate={handleStatusUpdate}
          />
          <UserAccountNumbers userId={userId} accountNumbers={accountNumbers} />
        </div>

        {/* Right Column - Wallet, Actions & Transactions */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <UserWallet 
                userId={userId} 
                userName={`${currentUserData.firstName} ${currentUserData.lastName}`}
                walletData={currentWalletData}
                onWalletUpdate={handleWalletRefresh}
              />
            </div>
            <div className="lg:col-span-4">
              <UserActions 
                userId={userId} 
                frozen={currentUserData.frozen}
                onFrozenUpdate={handleFrozenStatusUpdate}
                userName={`${currentUserData.firstName} ${currentUserData.lastName}`}
              />
            </div>
          </div>
          <UserTransactions userId={userId} />
        </div>
      </motion.div>
    </motion.div>
  );
}