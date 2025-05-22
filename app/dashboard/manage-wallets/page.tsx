"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Wallet, CircleDollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import MetricCard from "@/components/dashboard/MetricCard";
import WalletList from "@/components/dashboard/WalletList";

interface WalletSummary {
  total_balance: string;
  total_credit: string;
  total_debit: string;
  total_credit_count: string;
  total_debit_count: string;
}

interface WalletOwner {
  user_id: string;
  email: string;
  phone_number: string;
  username: string;
  firstname: string;
  lastname: string;
  middlename?: string;
  active_status: string;
  account_tier?: number;
  role?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
}

interface WalletData {
  wallet_id: string;
  balance: string;
  total_credit: string;
  total_debit: string;
  frozen: boolean;
  wallet_pin_changed?: boolean;
  owner: WalletOwner;
  created_at: string;
  updated_at?: string;
}

export default function ManageWalletsPage() {
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch wallet summary
        const [summaryResponse, walletsResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/wallet/summary`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/wallet/users?page_size=2000000`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (summaryResponse.data.success) {
          setWalletSummary(summaryResponse.data.data[0]);
        }

        if (walletsResponse.data.success) {
          setWallets(walletsResponse.data.data);
        }
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const formatCurrency = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-6 shadow-sm animate-pulse">
              <div className="h-5 w-24 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 w-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.02em]">Manage Wallets</h1>
        <p className="text-muted-foreground">View and manage all user wallets</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <MetricCard 
          title="Total Wallets" 
          value={wallets ? wallets.length.toString() : "0"} 
          icon={<Wallet className="h-5 w-5" />}
          change={0}
          changeType="increase"
        />
        <MetricCard 
          title="Total Balance" 
          value={walletSummary ? formatCurrency(walletSummary.total_balance) : "₦0.00"} 
          icon={<CircleDollarSign className="h-5 w-5" />}
          change={0}
          changeType="increase"
        />
        <MetricCard 
          title="Total Credits" 
          value={walletSummary ? formatCurrency(walletSummary.total_credit) : "₦0.00"} 
          icon={<ArrowUpRight className="h-5 w-5" />}
          change={0}
          changeType="increase"
        />
        <MetricCard 
          title="Total Debits" 
          value={walletSummary ? formatCurrency(walletSummary.total_debit) : "₦0.00"} 
          icon={<ArrowDownRight className="h-5 w-5" />}
          change={0}
          changeType="increase"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <WalletList wallets={wallets} />
      </motion.div>
    </motion.div>
  );
}