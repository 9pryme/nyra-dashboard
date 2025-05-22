import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Wallet } from "lucide-react";

interface UserWalletProps {
  userId: string;
  walletData?: {
    balance: number;
    totalCredit: number;
    totalDebit: number;
    totalTransactions: number;
    totalReferrals: number;
    referralEarnings: number;
  };
}

export default function UserWallet({ userId, walletData = {
  balance: 250000,
  totalCredit: 350000,
  totalDebit: 100000,
  totalTransactions: 45,
  totalReferrals: 12,
  referralEarnings: 24000
} }: UserWalletProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance and Actions */}
        <div className="bg-black text-white rounded-lg p-4 space-y-4">
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
            <Button className="flex-1" variant="secondary">
              <ArrowUp className="mr-2 h-4 w-4" />
              Fund Wallet
            </Button>
            <Button className="flex-1" variant="secondary">
              <ArrowDown className="mr-2 h-4 w-4" />
              Debit Wallet
            </Button>
          </div>
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
  );
}