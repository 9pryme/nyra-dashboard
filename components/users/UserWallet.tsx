import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Wallet, Snowflake } from "lucide-react";
import WalletOperationModal from "./WalletOperationModal";

interface UserWalletProps {
  userId: string;
  userName?: string;
  walletData?: {
    balance: number;
    totalCredit: number;
    totalDebit: number;
    totalTransactions: number;
    totalReferrals: number;
    referralEarnings: number;
    frozen: boolean;
  };
  onWalletUpdate?: () => void;
}

export default function UserWallet({ 
  userId, 
  userName = "User",
  walletData = {
    balance: 250000,
    totalCredit: 350000,
    totalDebit: 100000,
    totalTransactions: 45,
    totalReferrals: 12,
    referralEarnings: 24000,
    frozen: false
  },
  onWalletUpdate
}: UserWalletProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<"credit" | "debit">("credit");

  const handleCreditWallet = () => {
    setSelectedOperation("credit");
    setIsModalOpen(true);
  };

  const handleDebitWallet = () => {
    setSelectedOperation("debit");
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    // Refresh wallet data if callback provided
    if (onWalletUpdate) {
      onWalletUpdate();
    }
  };

  return (
    <>
      <Card className={`w-full ${walletData.frozen ? 'border-red-500 border-2' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Wallet</CardTitle>
            {walletData.frozen && (
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <Snowflake className="mr-1 h-3 w-3" />
                Frozen
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Balance and Actions */}
          <div className={`${walletData.frozen ? 'bg-red-900' : 'bg-black'} text-white rounded-lg p-4 space-y-4`}>
            <div className="flex items-center gap-4 max-w-2xl">
              <div className="flex-1 bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-300">Available Balance</p>
                <p className="text-2xl font-bold">₦{walletData.balance.toLocaleString()}</p>
              </div>
              <div className="flex-1 bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-300">Referral Earnings</p>
                <p className="text-2xl font-bold text-green-400">₦{walletData.referralEarnings.toLocaleString()}</p>
              </div>
            </div>
            <div className="h-px bg-gray-700" />
            <div className="flex gap-3 max-w-2xl">
              <Button 
                className="flex-1" 
                variant="secondary"
                onClick={handleCreditWallet}
                disabled={walletData.frozen}
              >
                <ArrowUp className="mr-2 h-4 w-4" />
                Fund Wallet
              </Button>
              <Button 
                className="flex-1" 
                variant="secondary"
                onClick={handleDebitWallet}
                disabled={walletData.frozen}
              >
                <ArrowDown className="mr-2 h-4 w-4" />
                Debit Wallet
              </Button>
            </div>
            {walletData.frozen && (
              <div className="text-center">
                <p className="text-xs text-red-300">
                  Wallet operations are disabled while frozen
                </p>
              </div>
            )}
          </div>

          {/* Analytics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border/40 rounded-lg p-4 space-y-1">
              <p className="text-sm text-muted-foreground">Total Credit</p>
              <p className="text-lg font-semibold text-green-600">
                ₦{walletData.totalCredit.toLocaleString()}
              </p>
            </div>
            <div className="bg-card border border-border/40 rounded-lg p-4 space-y-1">
              <p className="text-sm text-muted-foreground">Total Debit</p>
              <p className="text-lg font-semibold text-red-600">
                ₦{walletData.totalDebit.toLocaleString()}
              </p>
            </div>
            <div className="bg-card border border-border/40 rounded-lg p-4 space-y-1">
              <p className="text-sm text-muted-foreground">No. of Txns</p>
              <p className="text-lg font-semibold">
                {walletData.totalTransactions}
              </p>
            </div>
            <div className="bg-card border border-border/40 rounded-lg p-4 space-y-1">
              <p className="text-sm text-muted-foreground">No. of Referrals</p>
              <p className="text-lg font-semibold">
                {walletData.totalReferrals}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Operation Modal */}
      <WalletOperationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        userName={userName}
        currentBalance={walletData.balance}
        onSuccess={handleModalSuccess}
        initialTab={selectedOperation}
      />
    </>
  );
}