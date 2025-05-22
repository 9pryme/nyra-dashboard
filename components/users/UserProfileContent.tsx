"use client";

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
  };
  walletData: {
    balance: number;
    totalCredit: number;
    totalDebit: number;
    totalTransactions: number;
    totalReferrals: number;
    referralEarnings: number;
  };
  accountNumbers: Record<string, string>;
}

export default function UserProfileContent({ 
  userId, 
  userData,
  walletData,
  accountNumbers 
}: UserProfileContentProps) {
  const router = useRouter();

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
          <UserProfile userId={userId} userData={userData} />
          <UserAccountNumbers userId={userId} accountNumbers={accountNumbers} />
        </div>

        {/* Right Column - Wallet, Actions & Transactions */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <UserWallet userId={userId} walletData={walletData} />
            </div>
            <div className="lg:col-span-4">
              <UserActions userId={userId} />
            </div>
          </div>
          <UserTransactions userId={userId} />
        </div>
      </motion.div>
    </motion.div>
  );
}