"use client";

import { Eye, EyeOff, ChevronDown, ArrowRightLeft, LogOut } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { walletCache } from "@/lib/cache";
import MoveFundsModal from "./MoveFundsModal";
import EvacuateFundsModal from "./EvacuateFundsModal";

interface BankAccount {
  provider: string;
  balance: number;
  account_id: string;
}

interface ApiResponse {
  statusCode: number;
  status: string;
  success: boolean;
  error: string;
  message: string;
  data: {
    banks: BankAccount[][];
  };
}

export default function WalletCard() {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMoveFundsModal, setShowMoveFundsModal] = useState(false);
  const [showEvacuateFundsModal, setShowEvacuateFundsModal] = useState(false);

  const fetchBalances = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      const response = await walletCache.getOrFetch<ApiResponse>(
        'wallet_balances',
        async () => {
          const axiosResponse = await axios.get<ApiResponse>(`${process.env.NEXT_PUBLIC_API_URL}/global/balances`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          return axiosResponse.data;
        },
        undefined,
        forceRefresh
      );

      if (response.success && Array.isArray(response.data.banks)) {
        // Flatten the nested array and keep all accounts
        const flattenedAccounts = response.data.banks.flat();
        setAccounts(flattenedAccounts);
        if (flattenedAccounts.length > 0 && !selectedAccount) {
          setSelectedAccount(flattenedAccounts[0].account_id);
        }
        setError(null);
      } else {
        throw new Error(response.message || 'Failed to fetch balances');
      }
    } catch (err: any) {
      console.error('WalletCard fetch error:', err);
      setError(err.message || 'Failed to fetch balances');
    } finally {
      setLoading(false);
    }
  }, [selectedAccount]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const currentAccount = accounts.find(
    (account) => account.account_id === selectedAccount
  );

  if (loading) {
    return (
      <div className="bg-[#6FA83D] text-black rounded-md overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-28 bg-black/10" />
            <Skeleton className="h-7 w-7 rounded-full bg-black/10" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-9 w-full bg-black/10" />
            <div>
              <Skeleton className="h-3 w-20 mb-1.5 bg-black/10" />
              <Skeleton className="h-8 w-28 bg-black/10" />
            </div>
            <Skeleton className="h-9 w-full bg-black/10" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#6FA83D] text-white rounded-md overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Wallet Balance</h2>
          </div>
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#6FA83D] text-black rounded-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Wallet Balance</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="h-7 w-7 p-0 text-black hover:text-black/80"
          >
            {showBalance ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <Select
            value={selectedAccount}
            onValueChange={setSelectedAccount}
          >
            <SelectTrigger className="bg-black/10 text-black border-0">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent className="bg-[#6FA83D] text-black border-black/20">
              {accounts.map((account) => (
                <SelectItem
                  key={account.account_id}
                  value={account.account_id}
                  className="hover:bg-black/10"
                >
                  {account.provider} - {account.account_id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div>
            <p className="text-black/80 mb-1.5 text-sm">Available Balance</p>
            <h3 className="text-2xl font-bold">
              {showBalance ? `₦${(currentAccount?.balance || 0).toLocaleString()}` : "••••••"}
            </h3>
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-white/10 text-white hover:bg-gray-100/50 text-sm py-2 border border-white/20"
              onClick={() => setShowEvacuateFundsModal(true)}
            >
              Evacuate Funds
            </Button>
            <Button 
              className="flex-1 bg-white/10 text-white hover:bg-gray-100/50 text-sm py-2 border border-white/20"
              onClick={() => setShowMoveFundsModal(true)}
            >
              Move Funds
            </Button>
          </div>
        </div>
      </div>

      {/* Move Funds Modal */}
      <MoveFundsModal 
        open={showMoveFundsModal}
        onOpenChange={setShowMoveFundsModal}
      />

      {/* Evacuate Funds Modal */}
      <EvacuateFundsModal 
        open={showEvacuateFundsModal}
        onOpenChange={setShowEvacuateFundsModal}
        accounts={accounts}
      />
    </div>
  );
}