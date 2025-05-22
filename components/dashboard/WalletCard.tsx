"use client";

import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

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

  const fetchBalances = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get<ApiResponse>(`${process.env.NEXT_PUBLIC_API_URL}/global/balances`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success && Array.isArray(response.data.data.banks)) {
        // Flatten the nested array and keep all accounts
        const flattenedAccounts = response.data.data.banks.flat();
        setAccounts(flattenedAccounts);
        if (flattenedAccounts.length > 0 && !selectedAccount) {
          setSelectedAccount(flattenedAccounts[0].account_id);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch balances');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to fetch balances');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch balances');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(fetchBalances, 30000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const currentAccount = accounts.find(
    (account) => account.account_id === selectedAccount
  );

  if (loading) {
    return (
      <div className="bg-black text-white rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-7 w-32 bg-white/10" />
            <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-10 w-full bg-white/10" />
            <div>
              <Skeleton className="h-4 w-24 mb-2 bg-white/10" />
              <Skeleton className="h-9 w-32 bg-white/10" />
            </div>
            <Skeleton className="h-10 w-full bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black text-white rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Wallet Balance</h2>
          </div>
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Wallet Balance</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowBalance(!showBalance)}
            className="h-8 w-8 text-white hover:text-white/80"
          >
            {showBalance ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="space-y-6">
          <Select
            value={selectedAccount}
            onValueChange={setSelectedAccount}
          >
            <SelectTrigger className="bg-white/10 text-white border-0">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent className="bg-black text-white border-white/20">
              {accounts.map((account) => (
                <SelectItem
                  key={account.account_id}
                  value={account.account_id}
                  className="hover:bg-white/10"
                >
                  {account.provider} - {account.account_id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div>
            <p className="text-white/80 mb-2">Available Balance</p>
            <h3 className="text-3xl font-bold">
              {showBalance ? `₦${(currentAccount?.balance || 0).toLocaleString()}` : "••••••"}
            </h3>
          </div>

          <Button className="w-full bg-white text-black hover:bg-white/90">
            Top up balance
          </Button>
        </div>
      </div>
    </div>
  );
}